import React, { useRef, useEffect, useState } from 'react';
import { ChatInteraction } from '../types';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  chatHistory: ChatInteraction[];
  onSendMessage: (msg: string) => void;
  isProcessing: boolean;
  onViewReport: (reportId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, onSendMessage, isProcessing, onViewReport }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isProcessing]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 p-4 flex items-center shadow-md z-10">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
            <Bot className="text-purple-600 w-6 h-6" />
        </div>
        <div>
            <h2 className="text-white font-bold text-lg">Chatflies Analyst</h2>
            <p className="text-purple-200 text-xs">Always on. Always analyzing.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {chatHistory.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
                <p className="mb-2">Try commands like:</p>
                <div className="space-y-2 text-sm">
                    <span className="block px-3 py-1 bg-gray-100 rounded-full inline-block mx-1">"Summary of today"</span>
                    <span className="block px-3 py-1 bg-gray-100 rounded-full inline-block mx-1">"Decisions about Pricing"</span>
                    <span className="block px-3 py-1 bg-gray-100 rounded-full inline-block mx-1">"Risks in #engineering"</span>
                </div>
            </div>
        )}

        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.role === 'assistant' && (
                 <div className="absolute -left-3 bottom-0 w-3 h-3 bg-white border-b border-l border-gray-200 transform rotate-45"></div> 
              )}
               {msg.role === 'user' && (
                 <div className="absolute -right-3 bottom-0 w-3 h-3 bg-purple-600 transform rotate-45"></div> 
              )}

              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {msg.content}
              </div>

              {msg.relatedReportId && (
                  <button 
                    onClick={() => onViewReport(msg.relatedReportId!)}
                    className="mt-3 w-full bg-purple-50 text-purple-700 text-xs font-bold py-2 px-3 rounded hover:bg-purple-100 transition-colors flex items-center justify-center border border-purple-200"
                  >
                    View Interactive Report
                  </button>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-gray-500 text-sm italic">Analyzing workspaces...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-full border border-gray-200 px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500 transition-all">
            <input
            type="text"
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
            placeholder="Ask about your chats..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            />
            <button 
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className={`p-2 rounded-full transition-colors ${
                    input.trim() && !isProcessing 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
            chatflies.ai analyzes messages from connected sources only.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;