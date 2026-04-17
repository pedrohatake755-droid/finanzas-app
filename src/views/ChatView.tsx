import React, { useState, useRef, useEffect } from 'react';
import { Transaction, Goal } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface ChatViewProps {
  transactions: Transaction[];
  goals: Goal[];
  userProfile: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Como estão meus gastos este mês?",
  "Dê uma dica para economizar R$ 200.",
  "Estou no caminho certo para minhas metas?",
  "Onde estou gastando mais dinheiro?"
];

export default function ChatView({ transactions, goals, userProfile }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá, ${userProfile.displayName}! Sou seu consultor financeiro IA. Como posso te ajudar a organizar seu dinheiro hoje?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getFinancialAdvice(userProfile, transactions, goals, text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || "Desculpe, não consegui processar isso.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col pt-4">
      <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="bg-violet-600 p-4 rounded-2xl text-white shadow-lg shadow-violet-100">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Finanza AI</h2>
          <div className="flex items-center gap-2 text-sm text-emerald-500 font-bold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Online & Pronto para ajudar
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 space-y-6 mb-6 scroll-smooth pb-10"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`
                p-3 rounded-2xl shadow-sm
                ${msg.role === 'user' ? 'bg-white' : 'bg-violet-600 text-white'}
              `}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-violet-200" />}
              </div>
              
              <div className={`
                max-w-[80%] p-6 rounded-[32px] text-lg leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-white text-gray-900 rounded-tr-none border border-gray-100' 
                  : 'bg-violet-600 text-white rounded-tl-none font-medium'}
              `}>
                <div className="prose prose-sm lg:prose-base !max-w-none text-current">
                   <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-start gap-4"
          >
            <div className="p-3 rounded-2xl bg-violet-600 text-white shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-violet-100 p-6 rounded-[32px] rounded-tl-none text-violet-600 font-bold">
              Analisando suas finanças...
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col gap-6 sticky bottom-0">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map(q => (
            <button 
              key={q} 
              onClick={() => handleSend(q)}
              className="text-sm bg-gray-50 hover:bg-violet-50 text-gray-500 hover:text-violet-600 py-2.5 px-5 rounded-full transition-all border border-transparent hover:border-violet-100 font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="relative group">
          <input 
            placeholder="Digite sua dúvida financeira aqui..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-gray-50 border-none rounded-3xl py-6 pl-8 pr-16 text-lg font-medium focus:ring-4 focus:ring-violet-100 outline-none transition-all"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-violet-600 p-4 rounded-2xl text-white shadow-lg hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
