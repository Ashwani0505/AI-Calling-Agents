import { useEffect, useRef, useState } from 'react';
import { Send, User, Bot } from 'lucide-react';
import type { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isActive: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isActive }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-slate-950 to-black border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.2)] relative">
      <div className="scanline" />
      <div className="bg-black/80 border-b border-cyan-500/30 px-6 py-4 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-['Orbitron'] tracking-wider uppercase">
          DATA STREAM
        </h3>
        <p className="text-sm text-cyan-500/80 font-['Share_Tech_Mono']">REAL-TIME NEURAL TRANSCRIPTION</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        {messages.length === 0 ? (
          <div className="relative text-center text-cyan-500/60 mt-8 font-['Share_Tech_Mono']">
            <p className="text-lg">&gt; AWAITING DATA TRANSMISSION...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`relative flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-green-600 to-emerald-700 border-green-400/50 shadow-[0_0_20px_rgba(0,255,0,0.3)]'
                    : 'bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              <div
                className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-5 py-3 rounded-lg backdrop-blur-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-green-600/30 to-emerald-600/20 border border-green-400/40 shadow-[0_0_15px_rgba(0,255,0,0.2)]'
                      : 'bg-gradient-to-br from-cyan-600/20 to-blue-600/10 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                  }`}
                >
                  <p className="text-white text-sm leading-relaxed font-['Rajdhani'] font-medium">{message.content}</p>
                </div>
                <p className="text-xs text-cyan-500/60 mt-1 px-2 font-['Share_Tech_Mono']">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-cyan-500/30 p-4 bg-black/60">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ENTER COMMAND..."
            className="flex-1 px-5 py-3 bg-black/80 border border-cyan-500/40 rounded-lg text-cyan-100 placeholder-cyan-600/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all font-['Rajdhani'] font-medium backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_25px_rgba(0,255,255,0.4)] border border-cyan-400/50 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_35px_rgba(0,255,255,0.6)] disabled:hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {!isActive && (
          <p className="text-xs text-amber-400/80 mt-2 text-center font-['Share_Tech_Mono']">
            &gt; VOICE CHANNEL OFFLINE - TEXT MODE ACTIVE
          </p>
        )}
      </form>
    </div>
  );
}
