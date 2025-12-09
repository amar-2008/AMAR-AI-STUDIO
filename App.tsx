import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import WelcomeScreen from './WelcomeScreen';
import ChatMessage from './ChatMessage';
import LandingPage from './LandingPage';
import { Send, Paperclip, Menu, Loader2, XCircle, MapPin, CheckCircle, Smartphone, User, Lock } from 'lucide-react';
import { ChatState, Message, Role, UserProfile, AppScreen } from './types';
import { sendMessageToGemini } from './geminiService';

const generateId = () => Math.random().toString(36).substr(2, 9);

const DISCLAIMER_MESSAGE: Message = {
  id: 'disclaimer-msg',
  role: Role.MODEL,
  text: "أهلاً بك يا صديقي في عيادة **دكتور عمار (AI)**. 🩺\n\n⚠️ **إخلاء مسؤولية:** أنا نظام ذكاء اصطناعي للمساعدة الطبية الأولية. في حالات الطوارئ القصوى، لا تعتمد عليّ وتوجه فوراً لأقرب مستشفى.\n\nأنا جاهز الآن لسماع شكواك وتشخيص حالتك بدقة. مما تشتكي اليوم؟",
  timestamp: new Date()
};

// --- Storage Keys ---
const STORAGE_USER_KEY = 'ai_amar_user';
const STORAGE_HISTORY_KEY = 'ai_amar_history';

interface SavedChat {
  id: string;
  date: string;
  preview: string;
  messages: Message[];
}

const App: React.FC = () => {
  // Screen State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');

  // Login State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [messageCount, setMessageCount] = useState(0); 
  
  // Login Inputs
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // History State
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(generateId());

  // Chat State
  const [chatState, setChatState] = useState<ChatState>({
    messages: [DISCLAIMER_MESSAGE], 
    isLoading: false,
    error: null,
  });

  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{file: File, preview: string} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  // Load User & History on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (storedHistory) {
      // Restore dates from JSON strings
      const parsed = JSON.parse(storedHistory).map((chat: any) => ({
        ...chat,
        messages: chat.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
      setSavedChats(parsed);
    }
  }, []);

  // Save Current Chat on Update (if it has content beyond disclaimer)
  useEffect(() => {
    if (chatState.messages.length > 1 && user) {
      saveCurrentChat();
    }
  }, [chatState.messages, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  // Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.error("Location Error:", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  // --- Logic ---

  const saveCurrentChat = () => {
    setSavedChats(prev => {
      // Remove existing version of this chat
      const others = prev.filter(c => c.id !== currentChatId);
      
      const lastUserMsg = [...chatState.messages].reverse().find(m => m.role === Role.USER);
      const previewText = lastUserMsg ? lastUserMsg.text.substring(0, 30) + '...' : 'استشارة جديدة';

      const newChat: SavedChat = {
        id: currentChatId,
        date: new Date().toLocaleDateString('ar-EG'),
        preview: previewText,
        messages: chatState.messages
      };

      const updated = [newChat, ...others];
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName.length > 2 && loginPhone.length > 8) {
      const newUser = { name: loginName, phone: loginPhone };
      setUser(newUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
      setShowLoginModal(false);
    } else {
      alert("الرجاء إدخال اسم صحيح ورقم هاتف صالح");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    setMessageCount(0);
    setChatState({ messages: [DISCLAIMER_MESSAGE], isLoading: false, error: null });
  };

  const handleNewChat = () => {
    // Current chat is already saved via Effect
    setCurrentChatId(generateId());
    setChatState({ messages: [DISCLAIMER_MESSAGE], isLoading: false, error: null });
    setMessageCount(0);
    setInput('');
    setSelectedFile(null);
    setIsSidebarOpen(false);
  };

  const handleLoadChat = (chatId: string) => {
    const chatToLoad = savedChats.find(c => c.id === chatId);
    if (chatToLoad) {
      setCurrentChatId(chatToLoad.id);
      setChatState({
        messages: chatToLoad.messages,
        isLoading: false,
        error: null
      });
      setIsSidebarOpen(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الاستشارات السابقة؟')) {
      setSavedChats([]);
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('الرجاء تحميل ملف صورة فقط (JPG, PNG)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          file,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (textOverride?: string) => {
    // Check Login Limit (4 messages) if not logged in
    if (!user && messageCount >= 4) {
      setShowLoginModal(true);
      return;
    }

    const textToSend = textOverride || input.trim();
    if ((!textToSend && !selectedFile) || chatState.isLoading) return;

    // Construct User Message
    const userMessage: Message = {
      id: generateId(),
      role: Role.USER,
      text: textToSend,
      timestamp: new Date(),
      attachment: selectedFile ? {
         mimeType: selectedFile.file.type,
         data: selectedFile.preview
      } : undefined
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null
    }));
    
    setInput('');
    const tempFile = selectedFile;
    clearFile();
    setMessageCount(prev => prev + 1);

    try {
      const response = await sendMessageToGemini({
        history: chatState.messages, 
        newMessage: textToSend,
        attachment: tempFile ? { mimeType: tempFile.file.type, data: tempFile.preview.split(',')[1] } : undefined,
        location: userLocation
      });

      const botMessage: Message = {
        id: generateId(),
        role: Role.MODEL,
        text: response.text,
        timestamp: new Date(),
        groundingChunks: response.groundingChunks,
        options: response.options 
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false
      }));

    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "حدث خطأ في الاتصال. حاول مرة أخرى."
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // RENDER LANDING PAGE IF NOT IN CHAT MODE
  if (currentScreen === 'landing') {
    return <LandingPage onStart={() => setCurrentScreen('chat')} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      
      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full animate-fade-in">
             <div className="bg-green-600 p-6 text-center text-white">
               <Lock className="mx-auto mb-2" size={32} />
               <h2 className="text-xl font-bold">تسجيل الدخول مطلوب</h2>
               <p className="text-sm opacity-90">لحفظ سجلك الطبي وتجاوز حد الرسائل المجانية.</p>
             </div>
             <div className="p-6">
               <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                   <label className="block text-gray-700 font-bold mb-1 text-sm">الاسم</label>
                   <div className="relative">
                     <User className="absolute right-3 top-3 text-gray-400" size={18} />
                     <input 
                       type="text" 
                       value={loginName}
                       onChange={e => setLoginName(e.target.value)}
                       className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                       placeholder="اسمك"
                       required
                     />
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-gray-700 font-bold mb-1 text-sm">رقم الهاتف</label>
                   <div className="relative">
                     <Smartphone className="absolute right-3 top-3 text-gray-400" size={18} />
                     <input 
                       type="tel" 
                       value={loginPhone}
                       onChange={e => setLoginPhone(e.target.value)}
                       className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                       placeholder="رقم هاتفك"
                       required
                     />
                   </div>
                 </div>

                 <button 
                   type="submit"
                   className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex justify-center items-center gap-2"
                 >
                   متابعة الشات
                   <CheckCircle size={18} />
                 </button>
               </form>
               <p className="text-center text-xs text-gray-400 mt-4">AI AMAR Medicine By Amar Mostafa Nofal</p>
             </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        userName={user?.name}
        onLogout={handleLogout}
        onLogin={() => setShowLoginModal(true)} 
        onReturnHome={() => setCurrentScreen('landing')}
        onQuickAction={(text) => handleSend(text)}
        savedChats={savedChats}
        onLoadChat={handleLoadChat}
        onClearHistory={handleClearHistory}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
               <Menu size={24} />
             </button>
             <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  AI
                </div>
                <div>
                   <h1 className="font-bold text-gray-800 text-lg hidden sm:block">AI AMAR Medicine</h1>
                   <p className="text-[10px] text-gray-500 hidden sm:block">Developed by Amar Mostafa Nofal</p>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             {userLocation && (
               <div className="hidden sm:flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                 <MapPin size={10} />
                 الموقع مفعل
               </div>
             )}
             <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 font-bold flex items-center gap-1.5">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               متصل
             </span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f0f9ff] scroll-smooth relative">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {chatState.messages.length <= 1 ? ( 
            <>
               <div className="max-w-4xl mx-auto pb-4 relative z-10 mb-4">
                 <ChatMessage message={chatState.messages[0]} />
               </div>
               <WelcomeScreen onSuggestionClick={(text) => handleSend(text)} userName={user?.name} />
            </>
          ) : (
            <div className="max-w-4xl mx-auto pb-4 relative z-10">
              {chatState.messages.map((msg, index) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  onOptionClick={handleSend} // Pass handleSend as the option click handler
                  isLastMessage={index === chatState.messages.length - 1} // Only show options for last message
                />
              ))}
              
              {chatState.isLoading && (
                <div className="flex justify-start w-full mb-6 animate-pulse">
                  <div className="flex items-center gap-3 bg-white p-5 rounded-3xl rounded-tr-none border border-green-100 shadow-sm">
                    <Loader2 className="animate-spin text-green-600" size={24} />
                    <span className="text-gray-600 font-medium">د. عمار يكتب...</span>
                  </div>
                </div>
              )}

              {chatState.error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-semibold text-center mb-4">
                  {chatState.error}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
          <div className="max-w-4xl mx-auto">
            
            {selectedFile && (
              <div className="mb-3 flex items-center gap-3 bg-green-50 p-2 rounded-xl border border-green-100 w-fit animate-fade-in shadow-sm">
                <img src={selectedFile.preview} alt="preview" className="h-14 w-14 object-cover rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-green-800 truncate max-w-[150px]">{selectedFile.file.name}</span>
                  <span className="text-xs text-green-600">جاهز للتحليل</span>
                </div>
                <button onClick={clearFile} className="p-1 hover:bg-green-200 rounded-full text-green-700 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-3xl shadow-inner focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all p-2">
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-full transition-all transform hover:scale-105"
                title="إرفاق تحليل أو صورة"
              >
                <Paperclip size={24} />
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب سؤالك الطبي هنا..."
                className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none py-4 text-gray-700 placeholder-gray-400 text-lg font-medium scrollbar-hide leading-relaxed"
                rows={1}
                style={{ minHeight: '56px' }}
              />

              <div className="flex items-center gap-1 pb-1.5 px-1">
                 <button 
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedFile) || chatState.isLoading}
                  className={`
                    p-3.5 rounded-full transition-all duration-300 transform
                    ${(input.trim() || selectedFile) && !chatState.isLoading 
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:scale-105' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  <Send size={22} className={chatState.isLoading ? 'opacity-0' : 'opacity-100'} />
                  {chatState.isLoading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin" size={22} /></div>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;