import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  QrCode, 
  Bot, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  ChevronDown,
  Sparkles,
  Camera,
  Scan
} from 'lucide-react';
import { User, UserRole } from '../../types/campus';
import { campusStore } from '../../services/campusStore';
import { PageView } from './Sidebar';

interface TopNavbarProps {
  currentUser: User;
  onNavigate: (page: PageView) => void;
  onOpenChat: () => void;
  onOpenQr: () => void;
  onOpenLaptopCam: () => void;
  onOpenScanner: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentUser,
  onNavigate,
  onOpenChat,
  onOpenQr,
  onOpenLaptopCam,
  onOpenScanner
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const incidents = campusStore.getIncidents().filter(i => i.status !== 'CLOSED');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    campusStore.switchRole(role);
    setShowRoleMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    if (q.includes('camera') || q.includes('feed') || q.includes('cctv')) onNavigate('cameras');
    else if (q.includes('attend') || q.includes('lecture') || q.includes('class')) onNavigate('attendance');
    else if (q.includes('park') || q.includes('car') || q.includes('bike')) onNavigate('parking');
    else if (q.includes('route') || q.includes('road') || q.includes('map')) onNavigate('routes');
    else if (q.includes('student') || q.includes('roll') || q.includes('cgpa')) onNavigate('students');
    else if (q.includes('incident') || q.includes('missing') || q.includes('safety')) onNavigate('incidents');
    else if (q.includes('faculty') || q.includes('report') || q.includes('mark')) onNavigate('faculty');
    else if (q.includes('academic') || q.includes('m.tech') || q.includes('b.tech')) onNavigate('academics');
    else {
      onOpenChat();
    }
  };

  return (
    <header className="h-16 bg-[#0a111c]/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      
      {/* Left: Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus cameras, attendance, routes, students, incidents..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
          />
        </form>
      </div>

      {/* Middle: Live Status & Clock */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AIT DIGITAL TWIN ACTIVE</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentTime} IST</span>
        </div>
      </div>

      {/* Right: Action Tools & Role Switcher */}
      <div className="flex items-center gap-2">
        
        {/* PROMINENT LIVE LAPTOP CAMERA BUTTON */}
        <button
          onClick={onOpenLaptopCam}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all"
          title="Connect & Stream Laptop Webcam Live"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Laptop Live Cam</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
        </button>

        {/* LIVE QR / PASS SCANNER BUTTON */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 text-xs font-medium transition-all"
          title="Open Camera QR Scanner"
        >
          <Scan className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">Scan QR</span>
        </button>

        {/* Quick Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-amber-500/40 text-xs transition-all text-slate-200"
            title="Switch User Role to test permissions"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 leading-tight">Role</span>
              <span className="font-semibold text-amber-300 capitalize text-[11px] leading-tight">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-bold uppercase border-b border-slate-800 mb-1">
                Select Demo Role
              </div>
              {[
                { role: 'super_admin' as UserRole, label: 'Super Admin (Col. Bakshi)' },
                { role: 'campus_admin' as UserRole, label: 'Campus Admin (Dr. Kulkarni)' },
                { role: 'faculty' as UserRole, label: 'Faculty (Prof. Sharma)' },
                { role: 'security_staff' as UserRole, label: 'Security Officer (Sub. Maj. Gurung)' },
                { role: 'student' as UserRole, label: 'Student / Cadet (Ajay Malhan)' },
              ].map(opt => (
                <button
                  key={opt.role}
                  onClick={() => handleRoleSelect(opt.role)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    currentUser.role === opt.role ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {currentUser.role === opt.role && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick QR Mobile Access Button */}
        <button
          onClick={onOpenQr}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors"
          title="Open Mobile QR Code & Phone View"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Notifications Button with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors relative"
            title="Campus Notifications"
          >
            <Bell className="w-4 h-4" />
            {incidents.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white font-bold flex items-center justify-center">
                {incidents.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-semibold text-slate-200">Active Security Alerts</span>
                <span className="text-[10px] font-mono text-red-400">{incidents.length} Unresolved</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {incidents.map(inc => (
                  <div 
                    key={inc.id}
                    onClick={() => { onNavigate('incidents'); setShowNotifications(false); }}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-amber-400 font-bold">{inc.caseNumber}</span>
                      <span className="text-[10px] text-red-400 font-semibold">{inc.severity}</span>
                    </div>
                    <div className="text-slate-200 font-medium truncate">{inc.title}</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{inc.location} • {inc.reportedTime}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Floating Chatbot Launch Trigger */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 transition-all"
          title="Open AIT Campus Assistant"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI Assistant</span>
          <Sparkles className="w-3 h-3 text-cyan-200 animate-pulse" />
        </button>

      </div>
    </header>
  );
};
