import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// import { GoogleGenerativeAI } from "@google/generative-ai";
// const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
import { startChatSession } from '../ai/groq';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
      { id: 1, text: "Hi! I'm your FindIt AI Assistant. Need help finding something or reporting an item?", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null); 
  const location = useLocation();

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
      if (!input.trim()) return;
      
      const userMsg = { id: Date.now(), text: input, sender: 'user' };
      setMessages(prev => [...prev, userMsg]);
      setInput("");

      // Real AI Logic with Groq (Llama 3)
      try {
          const history = messages.slice(1).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
          }));

          const botText = await startChatSession(input, history);
          
          setMessages(prev => [...prev, { id: Date.now()+1, text: botText, sender: 'bot' }]);
      } catch (err) {
          console.error("AI Error:", err);
          const fallback = "I'm having trouble connecting to Groq. Please try again later.";
          setMessages(prev => [...prev, { id: Date.now()+1, text: fallback, sender: 'bot' }]);
      }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 md:w-96 bg-slate-900 rounded-2xl border border-primary/30 shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="bg-primary/20 p-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-primary-300"/>
                    <span className="font-bold text-white">AI Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={18}/></button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-dark/50" style={{ height: '300px' }}>
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            msg.sender === 'user' 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-surface border border-white/10 text-gray-200 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-surface border-t border-white/10 flex gap-2">
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-grow bg-dark/50 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                />
                <button onClick={handleSend} className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 transition-colors">
                    <Send size={16} />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary rounded-full p-4 shadow-lg shadow-purple-500/40 flex items-center justify-center relative group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
            <span className="absolute right-full mr-3 bg-surface px-3 py-1 rounded-lg text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                Ask AI Help
            </span>
        )}
      </button>

    </div>
  );
}
