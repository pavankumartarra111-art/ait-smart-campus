import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  RotateCcw, 
  Terminal, 
  CheckCircle, 
  BookOpen,
  Info
} from 'lucide-react';
import { ChatMessage, User as CampusUser } from '../../types/campus';
import { AiChatbotService } from '../../services/aiChatbot';
import { campusStore } from '../../services/campusStore';

interface AiChatbotViewProps {
  currentUser: CampusUser;
}

export const AiChatbotView: React.FC<AiChatbotViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleCategories = [
    {
      category: 'Attendance Queries',
      prompts: [
        "What is the attendance summary for today's third-period CSE class?",
        "Show attendance for a particular subject and date.",
        "How many students are below the 45-minute attendance threshold?"
      ]
    },
    {
      category: 'Campus Facilities & Occupancy',
      prompts: [
        "Which configured classroom has the highest occupancy?",
        "How many parking spaces are available in demo mode?",
        "Which campus route is marked busy?"
      ]
    },
    {
      category: 'Academic & Incident Records',
      prompts: [
        "Which subjects are assigned to Prof. Sharma?",
        "Summarize the report entered for student Rohan Deshmukh.",
        "Are there any unresolved campus incident reports?",
        "How do I add a new M.Tech specialization?"
      ]
    }
  ];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init-msg',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDemoDataNotice: true,
          text: `Welcome to the dedicated **AIT Campus Assistant** portal!\n\nI am connected directly to the Army Institute of Technology digital twin data services. I verify live sensor feeds, attendance logs, parking counters, and academic curricula with **Role-Based Access Control** (Current Role: **${currentUser.role.replace('_', ' ').toUpperCase()}**).\n\nSelect any category query below or ask your own natural language question:`,
          suggestedPrompts: [
            "What is the attendance summary for today's third-period CSE class?",
            "Which configured classroom has the highest occupancy?",
            "How many parking spaces are available in demo mode?",
            "Which campus route is marked busy?",
            "Are there any unresolved campus incident reports?",
            "How do I add a new M.Tech specialization?"
          ]
        }
      ]);
    }
  }, [currentUser]);

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
      }, 350);
    } catch {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              INTELLIGENT KNOWLEDGE RETRIEVAL
            </span>
            <span className="text-xs font-mono text-slate-400">
              AIT CAMPUS CONVERSATIONAL AGENT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif flex items-center gap-2">
            AIT Campus Assistant
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-grounded responses with live database verification. Transparent distinction of demo and sensor records.
          </p>
        </div>

        <button
          onClick={() => setMessages([])}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Main Container: Chat Window on Left (2 cols), Suggested Prompt Library on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Chat Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-600/90 text-white rounded-br-none shadow-lg shadow-amber-950/30'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-1">
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

                  {msg.dataContext && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-cyan-400 flex items-center gap-1.5 font-mono">
                      <Database className="w-3 h-3 shrink-0" />
                      <span>{msg.dataContext.type} • {msg.dataContext.source}</span>
                    </div>
                  )}

                  {msg.suggestedPrompts && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Suggested Follow-ups:</span>
                      <div className="flex flex-col gap-1">
                        {msg.suggestedPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(p)}
                            className="text-left text-[11px] p-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-amber-300/90 hover:text-amber-200 border border-slate-800 transition-colors flex items-center justify-between"
                          >
                            <span className="truncate">{p}</span>
                            <Send className="w-3 h-3 shrink-0 opacity-60 ml-2" />
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

          {/* Input Bar */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask attendance summary, parking count, route status, faculty..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Right: Categorized Prompt Showcase */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">
                Sample Query Library
              </h3>
            </div>

            <div className="space-y-4">
              {sampleCategories.map((cat, cIdx) => (
                <div key={cIdx} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 font-mono">{cat.category}</div>
                  <div className="space-y-1">
                    {cat.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(p)}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 text-[11px] text-slate-300 hover:text-amber-300 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong>RBAC Protected:</strong> Student accounts cannot query confidential faculty marksheets or unrestricted incident logs.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
