import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  User, 
  ShieldAlert, 
  Database, 
  Info, 
  RotateCcw,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, User as CampusUser } from '../../types/campus';
import { AiChatbotService } from '../../services/aiChatbot';

interface FloatingChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CampusUser;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-init',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDemoDataNotice: true,
          text: `Hello **${currentUser.name}**! I am the **AIT Campus Assistant** (Army Institute of Technology, Pune).\n\nI can verify attendance thresholds, classroom sensor occupancies, parking capacities, route congestion, and academic curriculum using live system data.\n\nWhat would you like to check today?`,
          suggestedPrompts: [
            "What is the attendance summary for today's third-period CSE class?",
            "Which configured classroom has the highest occupancy?",
            "How many parking spaces are available in demo mode?",
            "Which campus route is marked busy?",
            "Are there any unresolved campus incident reports?",
            "Which subjects are assigned to Prof. Sharma?",
            "Summarize the report entered for student Rohan Deshmukh.",
            "How do I add a new M.Tech specialization?"
          ]
        }
      ]);
    }
  }, [currentUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    try {
      const response = await AiChatbotService.askAssistant(textToSend, currentUser);
      setTimeout(() => {
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 400); // realistic quick retrieval latency
    } catch (e) {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[85vh] bg-[#0c1421] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-900/40">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-100">AIT Campus Assistant</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Role: <span className="text-amber-400 capitalize">{currentUser.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 ${
                msg.sender === 'user'
                  ? 'bg-amber-600/90 text-white rounded-br-none shadow-md shadow-amber-950/30'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
              }`}
            >
              {/* Message text with basic markdown formatting */}
              <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                {msg.text.split('\n').map((line, i) => {
                  if (line.startsWith('• ') || line.startsWith('- ')) {
                    return (
                      <div key={i} className="pl-2 border-l-2 border-slate-700 my-0.5 text-slate-300">
                        {line.replace(/^[-•]\s*/, '')}
                      </div>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <div key={i} className="font-bold text-amber-300">{line.replace(/\*\*/g, '')}</div>;
                  }
                  return <div key={i}>{line.replace(/\*\*/g, '')}</div>;
                })}
              </div>

              {/* Data Context Badge */}
              {msg.dataContext && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                  <Database className="w-3 h-3 shrink-0" />
                  <span>{msg.dataContext.type} • {msg.dataContext.source}</span>
                </div>
              )}

              {/* Suggested prompts buttons */}
              {msg.suggestedPrompts && (
                <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Prompts:</span>
                  <div className="flex flex-col gap-1">
                    {msg.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(prompt)}
                        className="text-left text-[11px] p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300/90 hover:text-amber-200 border border-slate-800 transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{prompt}</span>
                        <Send className="w-2.5 h-2.5 shrink-0 opacity-60 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl w-24">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AIT Campus Assistant..."
          className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 font-sans"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim()}
          className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-amber-950/30"
          title="Send Query"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Guardrail Disclaimer */}
      <div className="px-3 py-1 bg-slate-950 text-[9px] text-slate-500 text-center border-t border-slate-900 font-mono">
        Verified Institutional Grounding • Role-Aware Queries
      </div>
    </div>
  );
};
