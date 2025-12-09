
import { GoogleGenAI } from "@google/genai";
import { Attachment } from "./types";

// --- CONFIGURATION ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_CHAT = `
You are AI AMAR, an exclusive, high-end AI assistant developed by عمار مصطفى نوفل.
Speak mainly in Egyptian Arabic. Be friendly, witty, and professional.
If asked about health/medicine, REFUSE and refer to the medical app.
`;

const SYSTEM_INSTRUCTION_PROMPT = `
You are the "Prompt Master". Convert user ideas into High-Fidelity English Image Prompts inside a code block.
`;

export interface GeminiResponse {
  text: string;
  generatedImage?: string; 
  suggestedPrompt?: string;
}

// --- HELPER FUNCTIONS ---
const cleanBase64 = (dataUrl: string) => dataUrl.split(',')[1];

// 1. General Chat
export const sendChatMessage = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  attachment?: Attachment
): Promise<GeminiResponse> => {
    try {
        const model = "gemini-2.5-flash";
        let contents = [];

        contents = history.map(h => ({
            role: h.role,
            parts: h.parts
        }));

        if (attachment) {
             const base64Data = cleanBase64(attachment.dataUrl);
             contents.push({
                 role: 'user',
                 parts: [
                     { inlineData: { mimeType: attachment.type, data: base64Data } },
                     { text: prompt || "Analyze this file content." }
                 ]
             });
        } else {
             contents.push({ role: 'user', parts: [{ text: prompt }] });
        }

        const response = await ai.models.generateContent({
             model: model,
             contents: contents,
             config: { systemInstruction: SYSTEM_INSTRUCTION_CHAT }
        });

        return { text: response.text || "" };
    } catch (error: any) {
        console.error("Chat Error:", error);
        return { text: "حدث خطأ في الاتصال، حاول مجدداً." };
    }
};

// 2. Nano Banana Image Studio (FIXED MODEL & EDITING SUPPORT)
export const generateImageWithNano = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  baseImage?: Attachment
): Promise<GeminiResponse> => {
    try {
        const model = 'gemini-2.5-flash-image'; 
        let contentsPayload = [];
        
        // Context Construction:
        // If we have a baseImage (either uploaded or from previous chat), we prioritize it for editing.
        // We also want to give the model the text history so it understands "make it blue".
        
        let previousContextText = "";
        if (history.length > 0) {
            // Flatten recent history to give context string
            previousContextText = history.slice(-4).map(h => `${h.role === 'user' ? 'User' : 'Model'}: ${h.parts[0].text}`).join('\n');
        }

        if (baseImage) {
            const base64Data = cleanBase64(baseImage.dataUrl);
            // Structure: [Image, Context + Prompt]
            contentsPayload = [
                { inlineData: { mimeType: baseImage.type || "image/jpeg", data: base64Data } },
                { text: (previousContextText ? `Previous Conversation:\n${previousContextText}\n\n` : "") + `Instruction: ${prompt}` }
            ];
        } else {
            // Standard Text-to-Image with conversation context
            // We pass the full history structure if possible, but for Nano image, simple context string is safer for prompt adherence.
            contentsPayload = [
                { text: (previousContextText ? `Previous Conversation:\n${previousContextText}\n\n` : "") + `Create an image based on: ${prompt}` }
            ];
        }

        // We wrap it in 'parts' for the API call if passing as single object, 
        // or just pass the array as 'contents'. 
        // For gemini-2.5-flash-image, 'contents' expects an array of Content objects or a single object.
        // Let's use the object structure.
        
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: contentsPayload },
        });

        let imgData = null;
        let txtData = "تم إنشاء الصورة بنجاح (AMAR Script)";

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imgData = `data:image/png;base64,${part.inlineData.data}`;
                }
                if (part.text) {
                    txtData = part.text;
                }
            }
        }

        if (!imgData) {
            return { text: "عذراً، الموديل لم يرجع صورة. حاول تغيير الوصف." };
        }

        return { text: txtData, generatedImage: imgData };

    } catch (error: any) {
        console.error("Image Gen Error:", error);
        let msg = error.message || "";
        if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
            return { text: "عذراً، صلاحيات المفتاح لا تسمح بتوليد الصور حالياً." };
        }
        return { text: "فشل توليد الصورة: حاول مرة أخرى بوصف أبسط." };
    }
};

// 3. Prompt Engineer
export const engineerPrompt = async (
    userIdea: string,
    history: any[], 
    attachment?: Attachment
): Promise<GeminiResponse> => {
    try {
        const model = "gemini-2.5-flash";
        let contentsPayload;

        if (attachment) {
            const base64Data = cleanBase64(attachment.dataUrl);
            contentsPayload = {
                parts: [
                     { inlineData: { mimeType: attachment.type, data: base64Data } },
                     { text: userIdea || "Analyze image and write a prompt." }
                ]
            };
        } else {
            contentsPayload = { parts: [{ text: userIdea }] };
        }

        const response = await ai.models.generateContent({
             model: model,
             contents: contentsPayload,
             config: { systemInstruction: SYSTEM_INSTRUCTION_PROMPT }
        });

        const text = response.text || "";
        let suggestedPrompt = "";
        const codeBlockMatch = text.match(/```text\s*([\s\S]*?)\s*```/);
        suggestedPrompt = codeBlockMatch ? codeBlockMatch[1].trim() : text;

        return { text, suggestedPrompt };

    } catch (error: any) {
        return { text: "حدث خطأ في هندسة البرومبت." };
    }
}
