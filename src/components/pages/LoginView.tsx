import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { UserRole } from '../../types/campus';
import { campusStore } from '../../services/campusStore';
import { PageView } from '../layout/Sidebar';

interface LoginViewProps {
  onLoginSuccess: (page: PageView) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const users = campusStore.getUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0].id);
  const [password, setPassword] = useState('ait-smart-2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Please enter password.');
      return;
    }
    campusStore.setCurrentUser(selectedUserId);
    onLoginSuccess('dashboard');
  };

  const handleQuickSwitch = (userId: string) => {
    setSelectedUserId(userId);
    campusStore.setCurrentUser(userId);
    onLoginSuccess('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#070c12] bg-grid-pattern flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl z-10 flex flex-col items-center">
        
        {/* Brand Emblem */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-2xl shadow-amber-500/30 mb-3 border border-amber-300/40">
            <Shield className="w-9 h-9 fill-slate-950 stroke-amber-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-serif tracking-wide flex items-center gap-2">
            ARMY INSTITUTE OF TECHNOLOGY
          </h1>
          <p className="text-xs text-amber-400 font-mono tracking-widest mt-0.5">
            PUNE, MAHARASHTRA • "ONWARD TO GLORY"
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            AI-Powered Smart Campus Digital Twin & Autonomous Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-100">Institutional Access Portal</h2>
              <p className="text-xs text-slate-400">Select an authorized identity or credentials</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SECURE RBAC
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authorized Personnel Account
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500/50"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — [{u.role.replace('_', ' ').toUpperCase()}] ({u.department || 'AIT Pune'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Session Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter session password"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Prototype demo key pre-filled: <span className="text-amber-400/90">ait-smart-2026</span>
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all mt-2"
            >
              <span>Sign In with Selected Role</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Grid */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-3 flex items-center justify-between">
              <span>One-Click Role Demonstration</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'usr-1', title: 'Super Admin', sub: 'Col. Rajesh Bakshi (Director)', color: 'border-amber-500/40 hover:bg-amber-500/10' },
                { id: 'usr-2', title: 'Campus Admin', sub: 'Dr. Sunita Kulkarni (Dean Academics)', color: 'border-blue-500/40 hover:bg-blue-500/10' },
                { id: 'usr-3', title: 'Faculty', sub: 'Prof. Vikram Sharma (CSE Dept)', color: 'border-emerald-500/40 hover:bg-emerald-500/10' },
                { id: 'usr-bh-warden', title: "Boys' Hostel Warden", sub: 'Maj. Anil Rathore (Cariappa Hall)', color: 'border-blue-500/40 hover:bg-blue-500/10' },
                { id: 'usr-gh-warden', title: "Girls' Hostel Warden", sub: 'Capt. Sangeeta Verma (Kalpana Chawla)', color: 'border-rose-500/40 hover:bg-rose-500/10' },
                { id: 'usr-sec-operator', title: 'Security Operator', sub: 'Hav. Balbir Singh (Turnstiles)', color: 'border-purple-500/40 hover:bg-purple-500/10' },
                { id: 'usr-viewer', title: 'Read-Only Viewer', sub: 'Neha Joshi (IQAC Compliance)', color: 'border-slate-500/40 hover:bg-slate-500/10' },
                { id: 'usr-6', title: 'Student / Cadet', sub: 'Ajay Malhan (E&TC Year 3)', color: 'border-cyan-500/40 hover:bg-cyan-500/10' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleQuickSwitch(item.id)}
                  className={`text-left p-2.5 rounded-xl bg-slate-950/60 border ${item.color} transition-all flex flex-col group`}
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {item.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500 font-mono">
          Army Institute of Technology • Dighi Hills, Alandi Road, Pune-411015
        </div>
      </div>
    </div>
  );
};
