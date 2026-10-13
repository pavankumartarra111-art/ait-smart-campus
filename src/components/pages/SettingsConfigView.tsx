import React, { useState } from 'react';
import { 
  Settings, 
  Clock, 
  RotateCcw, 
  Save, 
  Key, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle,
  Database,
  Cpu
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { SystemSettings } from '../../types/campus';

export const SettingsConfigView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(campusStore.getSettings());
  const [saveAlert, setSaveAlert] = useState(false);
  const [resetAlert, setResetAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    campusStore.updateSettings(settings);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to the default AIT Pune demonstration dataset? Any custom additions will be restored to defaults.')) {
      campusStore.resetToDefaults();
      setSettings(campusStore.getSettings());
      setResetAlert(true);
      setTimeout(() => setResetAlert(false), 2500);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-xs font-mono text-slate-400">
              AIT PARAMETER ENGINE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Settings & Demonstration Mode Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure lecture period duration, 45-minute temporal threshold, QR deployment URL, and AI vision latency.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Initial Demo Dataset</span>
        </button>
      </div>

      {saveAlert && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Institutional system settings successfully updated and logged in audit trail!</span>
        </div>
      )}

      {resetAlert && (
        <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Demonstration database reset to standard AIT Pune initial state.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: AI Attendance Rules */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              AI Classroom Attendance Threshold Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Standard Lecture Period (Minutes)
              </label>
              <input
                type="number"
                min={30}
                max={180}
                value={settings.lectureDurationMinutes}
                onChange={(e) => setSettings({ ...settings, lectureDurationMinutes: parseInt(e.target.value) || 60 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                AIT standard timetable allocation: 60 minutes per lecture.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Minimum Verified Presence Threshold (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={60}
                value={settings.minimumAttendanceThresholdMinutes}
                onChange={(e) => setSettings({ ...settings, minimumAttendanceThresholdMinutes: parseInt(e.target.value) || 45 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Presence ≥ this threshold marks "FULL ATTENDANCE", otherwise "BELOW THRESHOLD".
              </p>
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-semibold mb-1">
              Institutional Treatment for Below-Threshold Cases
            </label>
            <select
              value={settings.defaultBelowThresholdHandling}
              onChange={(e) => setSettings({ ...settings, defaultBelowThresholdHandling: e.target.value as any })}
              className="w-full sm:w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="FLAG_FOR_REVIEW">FLAG FOR FACULTY REVIEW (Default)</option>
              <option value="MARK_ABSENT">AUTOMATICALLY MARK AS ABSENT</option>
              <option value="PRO_RATA_CREDIT">PRO-RATA ATTENDANCE CREDIT</option>
            </select>
          </div>
        </div>

        {/* Section 2: Mobile QR Deployment Target */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Deployed HTTPS Reachable Mobile Address
            </h3>
          </div>

          <div className="text-xs">
            <label className="block text-slate-300 font-semibold mb-1">
              Deployed Mobile URL Encoded in QR Code
            </label>
            <input
              type="text"
              value={settings.deployedMobileUrl}
              onChange={(e) => setSettings({ ...settings, deployedMobileUrl: e.target.value })}
              placeholder="https://your-domain.example/mobile"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500/50"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Must be an absolute HTTPS URL reachable from external smartphones when scanned.
            </p>
          </div>
        </div>

        {/* Section 3: AI Chatbot API Integration */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">
              AI Campus Assistant LLM Integration
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="font-semibold text-slate-200">Enable External LLM Provider</div>
                <div className="text-[10px] text-slate-400">If disabled, the assistant uses the built-in deterministic campus retrieval engine</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableLlmChatbot}
                onChange={(e) => setSettings({ ...settings, enableLlmChatbot: e.target.checked })}
                className="rounded border-slate-700 text-amber-500 bg-slate-900"
              />
            </div>

            {settings.enableLlmChatbot && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">API Key</label>
                  <input
                    type="password"
                    value={settings.llmApiKey}
                    onChange={(e) => setSettings({ ...settings, llmApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
                  <input
                    type="text"
                    value={settings.llmModelName}
                    onChange={(e) => setSettings({ ...settings, llmModelName: e.target.value })}
                    placeholder="gemini-1.5-flash / gpt-4o-mini"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40"
          >
            <Save className="w-4 h-4" />
            <span>Save System Parameters</span>
          </button>
        </div>

      </form>
    </div>
  );
};
