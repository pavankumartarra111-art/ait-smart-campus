import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Search, 
  ShieldCheck, 
  Clock, 
  Activity, 
  Filter, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { AuditLog } from '../../types/campus';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

export const AnalyticsAuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(campusStore.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  React.useEffect(() => {
    return campusStore.subscribe(() => {
      setLogs(campusStore.getAuditLogs());
    });
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = moduleFilter === 'ALL' || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const uptimeTrendData = [
    { day: 'Mon', uptime: 99.8, events: 120 },
    { day: 'Tue', uptime: 99.9, events: 145 },
    { day: 'Wed', uptime: 99.7, events: 160 },
    { day: 'Thu', uptime: 100.0, events: 135 },
    { day: 'Fri', uptime: 99.8, events: 180 },
    { day: 'Sat', uptime: 99.9, events: 95 },
    { day: 'Sun', uptime: 100.0, events: 60 },
  ];

  const handleExportLogs = () => {
    campusStore.exportAuditLogsCSV();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Export Header */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              IMMUTABLE AUDIT TRACE
            </span>
            <span className="text-xs font-mono text-slate-400">
              REGULATORY COMPLIANCE & HISTORICAL TELEMETRY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Analytics, Reports & Institutional Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically timestamped action logging for attendance overrides, surveillance modifications, marks submissions, and security dispatches.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/30 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Analytics KPI Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Camera Sensor Uptime</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">99.85%</div>
          <div className="text-[11px] text-slate-500 mt-1">9 zones online</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Audit Events Logged</div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">{logs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Immutable session ledger</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Attendance Overrides</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {logs.filter(l => l.action === 'ATTENDANCE_OVERRIDE').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Faculty justified records</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Data Retention Horizon</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">90 Days</div>
          <div className="text-[11px] text-slate-500 mt-1">Configured in settings</div>
        </div>
      </div>

      {/* Telemetry Chart: Weekly Sensor Uptime & Event Volume */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Surveillance Reliability & Event Activity Telemetry</h3>
            <p className="text-[11px] text-slate-400">Weekly uptime reliability index across campus camera controllers</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
            HEALTH STATUS: NOMINAL
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={uptimeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[99.5, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Filter Module:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Modules</option>
            <option value="Classroom Attendance">Classroom Attendance</option>
            <option value="Campus Cameras">Campus Cameras</option>
            <option value="Faculty Dashboard">Faculty Dashboard</option>
            <option value="Incident Management">Incident Management</option>
            <option value="Parking Monitoring">Parking Monitoring</option>
            <option value="Authentication">Authentication</option>
          </select>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, details, user..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Full System Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC/IST)</th>
                <th className="py-3 px-4">Authorized User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4 min-w-[260px]">Action Narrative & Details</th>
                <th className="py-3 px-4 font-mono text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors font-sans">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-100">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-900 text-amber-300 border border-slate-800 uppercase">
                      {log.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {log.module}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px]">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-right text-[11px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
