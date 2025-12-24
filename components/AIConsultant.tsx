
import React, { useState, useRef, useEffect } from 'react';
import { Message, Client } from '../types';
import { chatWithAssistant } from '../services/geminiService';
import { Send, Bot, X, Minimize2, Maximize2, Sparkles, User } from 'lucide-react';

interface AIConsultantProps {
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
}

const AIConsultant: React.FC<AIConsultantProps> = ({ clients, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hola, soy tu consultor de Terranova. ¿En qué puedo ayudarte con la gestión de pagos o lotes hoy?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithAssistant([...messages, userMsg], { clients });
    
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: responseText, 
      timestamp: new Date() 
    }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-[100] overflow-hidden animate-slideUp">
      {/* Header */}
      <div className="p-4 bg-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Consultor Terranova</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-indigo-300 font-bold uppercase">Deep Intelligence Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 excel-scroll bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-md rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold uppercase">
                {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                {msg.role === 'user' ? 'Tú' : 'Asistente'}
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <input 
            type="text"
            placeholder="Pregunta sobre pagos, lotes o ventas..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm transition-all outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConsultant;
