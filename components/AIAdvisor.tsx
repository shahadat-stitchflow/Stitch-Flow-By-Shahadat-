
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Project } from '../types';
import { getAIAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  projects: Project[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ projects }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hello! I am your AI Advisor. I'm equipped with deep industry knowledge to help you optimize production efficiency, analyze supply chain risks, and craft perfect buyer responses. How can I assist with your styles today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const advice = await getAIAdvice(input, { projects: projects.map(p => ({
      name: p.styleName,
      buyer: p.buyerName,
      status: p.workflow[p.currentStepIndex]?.label,
      isUrgent: p.isUrgent
    })) });

    const modelMsg: ChatMessage = {
      role: 'model',
      content: advice,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsThinking(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">AI Strategic Advisor</h2>
              <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gemini 3 Pro Thinking Mode Active</span>
              </div>
           </div>
        </div>
        <div className="hidden sm:flex -space-x-2">
           {projects.slice(0, 3).map(p => (
              <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm" title={p.styleName}>
                 <img src={p.productImageUrl} className="w-full h-full object-cover" />
              </div>
           ))}
           {projects.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                 +{projects.length - 3}
              </div>
           )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              <div className="prose prose-sm font-medium leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              <div className={`mt-3 text-[9px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] rounded-tl-none p-6 max-w-[80%] shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                     <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Deep Thinking in progress...</span>
               </div>
               <p className="mt-2 text-[11px] text-slate-400 font-bold italic">Analyzing style complexities and production data points...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 bg-slate-50/50 border-t border-slate-100">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isThinking}
            placeholder="Ask about production bottlenecks, efficiency tips, or follow-up strategies..."
            className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
          />
          <button 
            type="submit" 
            disabled={isThinking || !input.trim()}
            className="bg-indigo-600 text-white px-8 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
          >
            {isThinking ? 'Analyzing' : 'Consult'}
            {!isThinking && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
           <button onClick={() => setInput("Suggest efficiency tips for active styles.")} className="text-[9px] font-black uppercase text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-600 hover:text-indigo-600 transition-all">Efficiency Tips</button>
           <button onClick={() => setInput("Analyze delay risks for urgent styles.")} className="text-[9px] font-black uppercase text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-600 hover:text-indigo-600 transition-all">Risk Analysis</button>
           <button onClick={() => setInput("How to respond to a buyer inquiry for a price increase?")} className="text-[9px] font-black uppercase text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-600 hover:text-indigo-600 transition-all">Buyer Negotiation</button>
        </div>
      </div>
    </div>
  );
};
