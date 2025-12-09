import React from 'react';
import { Role, Message } from './types';
import { User, Stethoscope, FileImage, MapPin } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (option: string) => void;
  isLastMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionClick, isLastMessage }) => {
  const isUser = message.role === Role.USER;

  // Simple function to convert markdown links [text](url) to <a> tags
  const renderTextWithLinks = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        return (
          <a 
            key={index} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-bold bg-blue-50 px-1 rounded mx-0.5"
          >
            {match[1]}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[95%] md:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`
            w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 border-2
            ${isUser ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-medical-600 text-white border-medical-500 shadow-lg'}
          `}>
            {isUser ? <User size={24} /> : <Stethoscope size={24} />}
          </div>

          {/* Content Bubble */}
          <div className={`
            flex flex-col p-4 md:p-5 rounded-3xl shadow-sm
            ${isUser 
              ? 'bg-medical-600 text-white rounded-tl-none' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-tr-none'}
          `}>
            {message.attachment && (
              <div className="mb-4">
                <div className="bg-black/10 p-2 rounded-lg inline-flex items-center gap-2 mb-2">
                   <FileImage size={18} />
                   <span className="text-sm opacity-90">مرفق صورة طبية</span>
                </div>
                <img 
                  src={message.attachment.data} 
                  alt="Uploaded" 
                  className="w-full max-w-sm rounded-xl border border-black/10" 
                />
              </div>
            )}
            
            {/* Main Text */}
            <div className={`text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium ${isUser ? 'text-blue-50' : 'text-gray-800'}`}>
              {renderTextWithLinks(message.text)}
            </div>

            {/* Map Results (Grounding) */}
            {message.groundingChunks && message.groundingChunks.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-bold text-gray-500 mb-2">المواقع المقترحة:</div>
                {message.groundingChunks.map((chunk, idx) => {
                  if (chunk.maps) {
                    return (
                      <a 
                        key={idx} 
                        href={chunk.maps.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="text-red-500 mt-1" size={20} />
                          <div>
                            <div className="font-bold text-gray-800 group-hover:text-green-700">{chunk.maps.title}</div>
                            <div className="text-xs text-gray-500">اضغط للعرض على خرائط جوجل</div>
                          </div>
                        </div>
                      </a>
                    )
                  }
                  return null;
                })}
              </div>
            )}

            {!isUser && (
               <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
                 <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="font-bold text-medical-600">AI AMAR Medicine (د. عمار)</span>
                    <span>{message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Interactive Options (Chips) - Only show for the last message if it's from the model */}
        {!isUser && message.options && message.options.length > 0 && isLastMessage && (
          <div className="mt-4 mr-14 md:mr-16 flex flex-wrap gap-2 animate-fade-in">
            {message.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onOptionClick && onOptionClick(option)}
                className="bg-white border-2 border-medical-500 text-medical-600 hover:bg-medical-600 hover:text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                {option}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatMessage;