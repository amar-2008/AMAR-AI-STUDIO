import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role, GroundingChunk } from "./types";

const MODEL_ID = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
You are "Dr. Amar" (دكتور عمار) from "AI AMAR Medicine".
CREATOR: Developed EXCLUSIVELY by "Amar Mostafa Nofal".

**ROLE:** Professional Medical Consultant.
**TONE:** Empathetic, Scientific, Decisive ("يا صديقي", "ألف سلامة عليك").
**LANGUAGE:** Arabic ONLY.

**PHASE 1: DIAGNOSIS & TRIAGE**
When a user complains of a symptom:
1.  **Investigate:** Ask 2-3 critical questions (e.g., location of pain, history, allergies, age if not known) to narrow down the cause.
2.  **Diagnose:** Give a probabilistic diagnosis ("غالباً تعاني من...").
3.  **Treat:** Prescribe specific medications (Scientific Name + Common Trade Name). 
    *   **CRITICAL:** For every medication mentioned, format it as a Google Search link: \`[اسم الدواء](https://www.google.com/search?q=سعر+دواء+اسم_الدواء+في+مصر)\`.
    *   Add natural remedies/lifestyle advice.

**PHASE 2: THE 3-OPTION FOLLOW-UP**
IMMEDIATELY after the diagnosis and treatment plan, you MUST present these exact options to the user using the \`[OPTIONS: ...]\` format:

[OPTIONS: 1- شراء الدواء (أقرب صيدلية), 2- التواصل مع طبيب مختص, 3- أقرب عيادة/مستشفى]

**PHASE 3: EXECUTION BASED ON CHOICE**

*   **IF CHOICE 1 (Pharmacy):**
    *   Ask: "للوصول لأقرب صيدلية توفر هذا الدواء، أكتب لي: (المحافظة - المركز - القرية/المنطقة)."
    *   *Wait for input.*
    *   *Action:* Search Google Maps for "صيدلية في [المنطقة] [المركز] [المحافظة]".

*   **IF CHOICE 2 (Contact Doctor):**
    *   Ask: "لأربطك بأفضل طبيب في تخصص [التخصص المطلوب]، أكتب لي: (المحافظة - المركز - القرية/المنطقة)."
    *   *Wait for input.*
    *   *Action:* Search Google Maps for "رقم تليفون دكتور [التخصص] في [المنطقة] [المركز] [المحافظة]". Focus on results that likely have phone numbers.

*   **IF CHOICE 3 (Nearest Clinic):**
    *   Use the user's current GPS location (if provided) or ask for location to search for "عيادة [التخصص] قريبة".

**GENERAL RULES:**
*   **Privacy:** If the user shares sensitive info, reassure them "بياناتك مشفرة وآمنة تماماً".
*   **Context:** Adapt to the user (Student -> focus aids? Baby -> Pediatric advice?).
*   **Safety:** In life-threatening emergencies (Chest pain, severe bleeding), skip options and say "توجه للطوارئ فوراً".

Example Output Structure:
"بناءً على الأعراض، تشخيصي هو التهاب معدة.
العلاج المقترح:
1. [Controloc 40mg](link...) قبل الفطار.
2. [Gaviscon](link...) عند اللزوم.

للمتابعة، اختر الأنسب لك:"
[OPTIONS: 1- شراء الدواء (أقرب صيدلية), 2- التواصل مع طبيب مختص, 3- أقرب عيادة/مستشفى]
`;

// Helper to get the AI client securely
const getAiClient = () => {
  // CRITICAL: We read from process.env.API_KEY
  // This value is injected by Vercel during the build/runtime.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API Key is missing. Please add API_KEY to Vercel Environment Variables.");
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

interface SendMessageOptions {
  history: Message[];
  newMessage: string;
  attachment?: { mimeType: string; data: string };
  location?: { lat: number; lng: number };
}

export const sendMessageToGemini = async ({
  history,
  newMessage,
  attachment,
  location
}: SendMessageOptions): Promise<{ text: string; options?: string[]; groundingChunks?: GroundingChunk[] }> => {
  try {
    const parts: any[] = [];

    if (attachment) {
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data
        }
      });
    }

    parts.push({ text: newMessage });

    // Combine tools into a single config object for better compatibility
    const tools: any[] = [
      { 
        googleMaps: {},
        googleSearch: {} 
      }
    ];
    
    const toolConfig: any = {};
    if (location) {
      toolConfig.retrievalConfig = {
        latLng: {
          latitude: location.lat,
          longitude: location.lng
        }
      };
    }

    const chatHistory = history
      .filter(m => m.text)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    // Use the safe getter
    const ai = getAiClient();

    const chat = ai.chats.create({
      model: MODEL_ID,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, 
        tools: tools,
        toolConfig: Object.keys(toolConfig).length > 0 ? toolConfig : undefined
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({
      message: parts
    });

    let text = result.text || "عذراً، لم أستطع فهم ذلك. هل يمكنك التوضيح؟";
    let options: string[] = [];
    
    // Parse Options from text formatted like [OPTIONS: A, B, C]
    const optionsMatch = text.match(/\[OPTIONS: (.*?)\]/);
    if (optionsMatch && optionsMatch[1]) {
      options = optionsMatch[1].split(',').map(opt => opt.trim());
      // Remove the options block from the display text to keep it clean
      text = text.replace(optionsMatch[0], '').trim();
    }

    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[];

    return { 
      text, 
      options: options.length > 0 ? options : undefined,
      groundingChunks 
    };

  } catch (error: any) {
    console.error("Full Gemini API Error:", error);
    
    let errorMessage = "عذراً، حدث خطأ في الاتصال بالخادم.";
    
    if (error.message === "API_KEY_MISSING") {
      errorMessage = "⚠️ تنبيه للمطور: لم يتم إعداد API_KEY في إعدادات Vercel.";
    } else if (error.message?.includes('API_KEY')) {
      errorMessage = "خطأ في مفتاح API. يرجى التحقق من الصلاحيات.";
    } else if (error.status === 400 || error.message?.includes('InvalidArgument')) {
      errorMessage = "عذراً، الطلب غير صالح. حاول صياغة سؤالك بطريقة أخرى.";
    } else if (error.status === 503) {
      errorMessage = "الخادم مشغول حالياً، يرجى المحاولة بعد قليل.";
    }

    return {
      text: errorMessage
    };
  }
};