import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Chat } from '@google/genai';
import { AnalysisResult } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  analysisResult: AnalysisResult | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ analysisResult }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'model', text: "Hi! I'm your A11y Assistant. Ask me anything about web accessibility or how to use this tool." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevResultRef = useRef<AnalysisResult | null>(null);

  useEffect(() => {
    // Initialize chat session
    chatSessionRef.current = createChatSession();
  }, []);

  // Effect to update chat context when analysis results change
  useEffect(() => {
    const updateContext = async () => {
      if (analysisResult && analysisResult !== prevResultRef.current && chatSessionRef.current) {
        // Send a hidden prompt to the model to update its context
        const contextMessage = `System Update: A new audit has been completed for ${analysisResult.url}. 
        Here are the found issues: ${JSON.stringify(analysisResult.issues.map(i => ({ title: i.title, severity: i.severity, description: i.description })))}. 
        Please be ready to answer questions about these specific issues.`;
        
        try {
          await chatSessionRef.current.sendMessage({ message: contextMessage });
          // Optionally add a message from the bot to indicate it's ready
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: `I've analyzed the report for ${analysisResult.url}. I found ${analysisResult.issues.length} issues. Feel free to ask me how to fix them!`
          }]);
        } catch (e) {
          console.error("Failed to update chat context", e);
        }
        prevResultRef.current = analysisResult;
      }
    };
    
    updateContext();
  }, [analysisResult]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text || "I'm sorry, I couldn't generate a response.";
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to the AI. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 z-50 focus:outline-none focus:ring-4 focus:ring-brand-500/50"
        aria-label="Open Accessibility Assistant"
      >
        <MessageSquare className="w-7 h-7" />
        {analysisResult && (
           <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
           </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center text-brand-500">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">A11y Assistant</h3>
            <span className="text-xs text-brand-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-slate-700 text-slate-300' : 'bg-brand-900/50 text-brand-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-slate-700 text-white rounded-tr-none' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
            }`}>
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-900/50 text-brand-400 flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4" />
             </div>
             <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
               <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about accessibility..."
            className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-center mt-2">
           <span className="text-[10px] text-slate-500">Powered by Gemini 3 Pro</span>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;
