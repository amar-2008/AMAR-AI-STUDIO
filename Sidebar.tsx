import React from 'react';
import { MessageSquarePlus, Clock, ShieldCheck, FileText, LogIn, MapPin, AlertCircle, Trash2, History, Home, UserCircle } from 'lucide-react';

interface SavedChat {
  id: string;
  date: string;
  preview: string;
}

interface SidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  userName?: string;
  onLogout: () => void;
  onLogin: () => void; 
  onReturnHome: () => void;
  onQuickAction: (text: string) => void;
  savedChats: SavedChat[];
  onLoadChat: (chatId: string) => void;
  onClearHistory: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  isOpen, 
  toggleSidebar, 
  userName, 
  onLogout,
  onLogin,
  onReturnHome,
  onQuickAction,
  savedChats,
  onLoadChat,
  onClearHistory
}) => {
  
  const showPolicy = (title: string) => {
    alert(`صفحة ${title}:\n\nنحن في AI AMAR Medicine نحترم خصوصيتك.\nهذا التطبيق مخصص للاستخدام الشخصي ويتبع معايير الأمان المعتادة.`);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 right-0 h-full w-80 bg-white z-30 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col font-sans
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0 md:static border-l border-gray-200
      `}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
           <div className="md:hidden flex items-center justify-between mb-4">
             <h2 className="text-2xl font-bold text-green-700">AI AMAR</h2>
             <button onClick={toggleSidebar} className="text-gray-500 hover:text-red-500 bg-gray-100 rounded-full p-1">
               ✕
             </button>
          </div>

          {/* User Info Card */}
          {userName ? (
            <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {userName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-800">{userName}</div>
                <div className="text-xs text-green-600 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  عضو مميز
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="w-full p-4 bg-gray-50 hover:bg-green-50 rounded-xl flex items-center gap-3 border border-gray-200 hover:border-green-200 transition-all group shadow-sm"
            >
              <div className="w-10 h-10 bg-gray-200 group-hover:bg-green-200 rounded-full flex items-center justify-center text-gray-500 group-hover:text-green-700 transition-colors">
                <UserCircle size={24} />
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-700 text-sm group-hover:text-green-800">زائر</div>
                <div className="text-[10px] text-gray-500">اضغط لتسجيل الدخول</div>
              </div>
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* Main Actions */}
          <div className="space-y-3">
             <button 
               onClick={() => {
                 onReturnHome();
                 if (window.innerWidth < 768) toggleSidebar();
               }}
               className="w-full flex items-center gap-4 p-4 bg-gray-800 text-white rounded-2xl hover:bg-gray-900 transition-all text-right shadow-md group"
             >
               <div className="p-2 bg-white/20 rounded-xl">
                 <Home size={20} />
               </div>
               <div>
                 <div className="font-bold text-base">الرئيسية</div>
                 <div className="text-[11px] opacity-70">العودة للواجهة الافتتاحية</div>
               </div>
             </button>

             <button 
               onClick={onNewChat}
               className="w-full flex items-center gap-4 p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all text-right shadow-lg hover:shadow-green-200 group transform hover:-translate-y-0.5"
             >
               <div className="p-2 bg-white/20 rounded-xl">
                 <MessageSquarePlus size={20} />
               </div>
               <div>
                 <div className="font-bold text-base">استشارة جديدة</div>
                 <div className="text-[11px] opacity-90">تشخيص فوري للأعراض</div>
               </div>
             </button>

             <button 
               onClick={() => {
                 onQuickAction("أقرب صيدلية");
                 if (window.innerWidth < 768) toggleSidebar();
               }}
               className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all text-right shadow-sm group"
             >
               <div className="p-2 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-white">
                 <MapPin size={20} />
               </div>
               <div>
                 <div className="font-bold text-gray-800 text-base">طوارئ / صيدلية</div>
                 <div className="text-[11px] text-gray-500">بحث سريع في منطقتك</div>
               </div>
             </button>
          </div>

          {/* History Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <History size={14} /> الاستشارات السابقة
              </h3>
              {savedChats.length > 0 && (
                <button onClick={onClearHistory} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded">
                  <Trash2 size={12} /> مسح
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {savedChats.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  لا يوجد استشارات محفوظة
                </div>
              ) : (
                savedChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onLoadChat(chat.id)}
                    className="w-full text-right p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{chat.date}</span>
                       <Clock size={12} className="text-gray-300 group-hover:text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 truncate">{chat.preview}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-start gap-3 relative z-10">
               <AlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
               <div>
                 <h4 className="font-bold text-blue-800 text-sm mb-1">نصيحة طبية</h4>
                 <p className="text-xs text-blue-700 leading-relaxed opacity-90">
                   النوم الكافي (7-8 ساعات) يعزز المناعة ويحسن الذاكرة بشكل كبير.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-2 mb-4">
             <button onClick={() => showPolicy("سياسة الخصوصية")} className="flex items-center justify-center gap-2 p-2 text-gray-600 hover:text-green-700 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all text-xs font-bold">
               <ShieldCheck size={14} />
               الخصوصية
             </button>
             <button onClick={() => showPolicy("الشروط والأحكام")} className="flex items-center justify-center gap-2 p-2 text-gray-600 hover:text-green-700 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all text-xs font-bold">
               <FileText size={14} />
               الشروط
             </button>
          </div>
          
          {userName && (
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold shadow-sm text-sm"
            >
              <LogIn size={18} className="rotate-180" />
              <span>تسجيل الخروج</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;