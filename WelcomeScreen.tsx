import React from 'react';
import { Stethoscope, Upload, Heart, Activity } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
  userName?: string;
}

const suggestions = [
  "أعاني من صداع نصفي شديد",
  "تفسير نتيجة تحليل الدم المرفقة",
  "طفلي يعاني من ارتفاع حرارة",
  "أفضل نظام غذائي لمرضى السكر",
  "علاج آلام الظهر (ديسك)",
  "أقرب طبيب باطنة", 
  "علاج طبيعي لخشونة الركبة"
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick, userName }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Nature Background Image */}
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1920&auto=format&fit=crop" 
          alt="Nature Background" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="z-10 flex flex-col items-center p-6 text-center max-w-4xl w-full animate-fade-in overflow-y-auto max-h-full">
        
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-full shadow-xl mb-6 ring-4 ring-green-100">
          <Stethoscope size={72} className="text-green-600" />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          أهلاً بك {userName ? `يا ${userName}` : ''} في <span className="text-green-600">AI AMAR Medicine</span>
        </h1>
        
        <p className="text-gray-600 mb-2 text-lg md:text-xl font-medium max-w-2xl">
          رفيقك الطبي الذكي، مدعوم بأحدث تقنيات Gemini 3.
          <br/>
          نشخص، نحلل، ونطمئنك.. ولكن الطبيب البشري هو المرجع الأول.
        </p>

        {/* Prayer Text */}
        <div className="mb-8 bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 shadow-sm flex items-center gap-2">
          <Heart size={14} className="text-red-500 fill-red-500" />
          لا تنسوا الدعاء للمبرمج عمار مصطفى نوفل
          <Heart size={14} className="text-red-500 fill-red-500" />
        </div>

        {/* Main Action: Upload */}
        <div className="mb-10 w-full flex justify-center">
          <button 
             onClick={() => onSuggestionClick("أريد تحليل الصورة الطبية المرفقة (تحليل/أشعة/إصابة)")}
             className="bg-white text-green-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-green-50 transition-all shadow-md hover:shadow-lg flex items-center gap-3 border-2 border-green-100 transform hover:-translate-y-1"
          >
            <Upload size={24} />
            رفع ملف طبي (تحليل / أشعة / صورة إصابة)
          </button>
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-5 py-3 bg-white/90 backdrop-blur border border-gray-200 rounded-xl text-right text-gray-700 font-medium hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-all shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;