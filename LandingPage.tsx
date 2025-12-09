import React, { useState } from 'react';
import { Activity, ShieldCheck, HeartPulse, ChevronRight, Leaf, FileText, Lock, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const Modal = ({ title, content, onClose }: { title: string, content: string, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto leading-relaxed text-gray-600 whitespace-pre-wrap">
          {content}
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
            أوافق وأفهم
          </button>
        </div>
      </div>
    </div>
  );

  const privacyContent = `
**سياسة الخصوصية في AI AMAR Medicine**

1. **سرية البيانات:** نحن نلتزم بحماية خصوصيتك. جميع المحادثات والبيانات الطبية مشفرة ولا يتم مشاركتها مع أي جهة إعلانية.
2. **استخدام البيانات:** نستخدم البيانات فقط لغرض تقديم الاستشارة الطبية وتحسين دقة التشخيص.
3. **تحديد الموقع:** نطلب الوصول للموقع الجغرافي فقط عند رغبتك في البحث عن أقرب صيدلية أو طبيب، ولا يتم تتبع تحركاتك.
4. **المسؤولية:** هذا التطبيق مساعد ذكي، ولا يلغي دور الطبيب في الحالات الحرجة.
  `;

  const termsContent = `
**الشروط والأحكام**

1. **الاستخدام العادل:** هذا التطبيق مخصص للاستخدام الشخصي والطبي.
2. **الطوارئ:** في حالات الطوارئ القصوى (مثل النوبات القلبية)، يجب الاتصال بالإسعاف فوراً وعدم الاعتماد على التطبيق.
3. **دقة المعلومات:** نبذل قصارى جهدنا لتقديم معلومات دقيقة، ولكن الطب علم متغير، ونخلي مسؤوليتنا عن أي استخدام خاطئ للأدوية.
4. **العمر:** يجب أن يكون المستخدم بالغاً أو تحت إشراف ولي أمر.
  `;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans flex flex-col">
      
      {/* Green Nature Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2560&auto=format&fit=crop" 
          alt="Nature Green Background" 
          className="w-full h-full object-cover"
        />
        {/* Heavy Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 via-green-800/60 to-white/90"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full text-white">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
            <Leaf size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AI AMAR Medicine</span>
        </div>
        <div className="text-sm font-medium opacity-80">By Amar Mostafa Nofal</div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 max-w-4xl mx-auto pb-20 mt-10">
        
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full shadow-lg animate-fade-in">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-green-50 flex items-center gap-2">
            <Sparkles size={14} />
            مدعوم بأحدث تقنيات Gemini 2.5 (2025)
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-md">
          صحتك في أمان <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">مع طبيبك الذكي</span>
        </h1>

        <p className="text-xl text-green-50 mb-10 max-w-2xl leading-relaxed drop-shadow-sm font-medium">
          شخص حالتك، احصل على العلاج المناسب، وتواصل مع أفضل الأطباء في منطقتك.
          <br/>
          نظام متكامل يدعمك من التشخيص وحتى الشفاء.
        </p>

        <div className="w-full max-w-md">
           <button 
            onClick={onStart}
            className="w-full group relative px-8 py-5 bg-white text-green-800 rounded-2xl font-bold text-xl shadow-2xl hover:bg-green-50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            ابـدأ الاستشـارة الآن
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform text-green-700">
               <ChevronRight size={20} />
            </div>
          </button>
          <p className="mt-4 text-green-100 text-sm opacity-80">
            بالضغط على البدء، أنت توافق على الشروط والأحكام
          </p>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <HeartPulse className="text-red-500 mb-3" size={32} />
            <h3 className="font-bold text-gray-800 text-lg mb-1">تشخيص فوري</h3>
            <p className="text-sm text-gray-500">تحليل دقيق للأعراض ووصف العلاج المناسب وروابط الشراء.</p>
          </div>
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <Activity className="text-green-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-800 text-lg mb-1">تواصل مع أطباء</h3>
            <p className="text-sm text-gray-500">نجد لك أرقام وعناوين أفضل الأطباء في قريتك أو مركزك.</p>
          </div>
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="text-blue-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-800 text-lg mb-1">بياناتك محمية</h3>
            <p className="text-sm text-gray-500">نستخدم أعلى معايير التشفير للحفاظ على سرية استشارتك.</p>
          </div>
        </div>

      </main>

      <footer className="py-6 text-center text-gray-500 text-sm relative z-10 bg-white/90 backdrop-blur border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-4">
           <div className="font-semibold">© 2025 AI AMAR Medicine. All rights reserved.</div>
           <div className="flex gap-6">
             <button onClick={() => setActiveModal('privacy')} className="flex items-center gap-1 hover:text-green-600 font-medium transition-colors">
               <Lock size={14} /> سياسة الخصوصية
             </button>
             <button onClick={() => setActiveModal('terms')} className="flex items-center gap-1 hover:text-green-600 font-medium transition-colors">
               <FileText size={14} /> الشروط والأحكام
             </button>
           </div>
        </div>
      </footer>

      {activeModal === 'privacy' && <Modal title="سياسة الخصوصية" content={privacyContent} onClose={() => setActiveModal(null)} />}
      {activeModal === 'terms' && <Modal title="الشروط والأحكام" content={termsContent} onClose={() => setActiveModal(null)} />}

    </div>
  );
};

export default LandingPage;