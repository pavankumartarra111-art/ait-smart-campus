import React from 'react';
import { 
  Users, 
  Camera, 
  Clock, 
  Car, 
  MapPin, 
  ShieldAlert, 
  GraduationCap, 
  FileText, 
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { PageView } from '../layout/Sidebar';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface AdminDashboardViewProps {
  onNavigate: (page: PageView) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const cameras = campusStore.getCameras();
  const attendance = campusStore.getAttendanceRecords();
  const parkingZones = campusStore.getParkingZones();
  const routes = campusStore.getRoutes();
  const incidents = campusStore.getIncidents();
  const students = campusStore.getStudents();
  const facultyReports = campusStore.getFacultyReports();
  const settings = campusStore.getSettings();

  // Metrics calculation
  const totalOccupancy = cameras.reduce((acc, c) => acc + c.currentOccupancy, 0);
  const activeCamerasCount = cameras.filter(c => c.status === 'ACTIVE').length;
  
  const fullAttendanceCount = attendance.filter(a => a.status === 'FULL_ATTENDANCE').length;
  const belowThresholdCount = attendance.filter(a => a.status === 'BELOW_THRESHOLD').length;
  const attendancePct = attendance.length ? Math.round((fullAttendanceCount / attendance.length) * 100) : 0;

  const totalParking = parkingZones.reduce((acc, z) => acc + z.totalSpaces, 0);
  const occupiedParking = parkingZones.reduce((acc, z) => acc + z.occupiedSpaces, 0);
  const availableParking = totalParking - occupiedParking;

  const blockedRoutes = routes.filter(r => r.status === 'BLOCKED');
  const busyRoutes = routes.filter(r => r.status === 'BUSY');
  const unresolvedIncidents = incidents.filter(i => i.status !== 'CLOSED');

  // Chart Data: Hourly Campus Occupancy Flow
  const hourlyOccupancyData = [
    { time: '08:00', count: 180, vehicles: 45 },
    { time: '09:00', count: 520, vehicles: 120 },
    { time: '10:00', count: 740, vehicles: 145 },
    { time: '11:00', count: 810, vehicles: 155 },
    { time: '12:00', count: 790, vehicles: 160 },
    { time: '13:00', count: 920, vehicles: 175 }, // Lunch Peak
    { time: '14:00', count: 860, vehicles: 165 },
    { time: '15:00', count: 670, vehicles: 140 },
    { time: '16:00', count: 480, vehicles: 95 },
  ];

  // Chart Data: Attendance Status Breakdown
  const attendancePieData = [
    { name: 'Full Attendance (≥45m)', value: fullAttendanceCount, color: '#10b981' },
    { name: 'Below Threshold (<45m)', value: belowThresholdCount, color: '#f59e0b' },
    { name: 'Absent (0m)', value: attendance.filter(a => a.status === 'ABSENT').length, color: '#ef4444' },
  ];

  // Location Crowds Bar Data
  const crowdLocationsData = cameras.slice(0, 6).map(c => ({
    name: c.name.split('(')[0].replace('Lecture Hall', 'LH').trim(),
    occupancy: c.currentOccupancy,
    capacity: c.maxCapacity
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner with AIT Pune Context */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              AIT PUNE COMMAND
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              CAMPUS OPERATIONS & SURVEILLANCE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            AIT Smart Campus Intelligence Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multisensor aggregation: 9 monitored zones, AI attendance tracking, and vehicle access flow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('cameras')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Camera Grid</span>
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>AI Attendance Room</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total Campus Occupancy */}
        <div 
          onClick={() => onNavigate('crowd')}
          className="glass-panel p-4 rounded-xl border border-slate-800 glass-card-hover cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Estimated Campus Footfall</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">
            {totalOccupancy} <span className="text-xs font-normal text-slate-400">persons</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+12% vs morning average</span>
          </div>
        </div>

        {/* Card 2: AI Attendance Compliance */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="glass-panel p-4 rounded-xl border border-slate-800 glass-card-hover cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>AI Attendance Rate (≥45m)</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">
            {attendancePct}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-mono">
            <span className="text-amber-400 font-bold">{belowThresholdCount}</span> below 45m threshold
          </div>
        </div>

        {/* Card 3: Parking Availability */}
        <div 
          onClick={() => onNavigate('parking')}
          className="glass-panel p-4 rounded-xl border border-slate-800 glass-card-hover cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Parking Space Available</span>
            <Car className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">
            {availableParking} <span className="text-xs font-normal text-slate-400">/ {totalParking} bays</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-mono">
            <span>{occupiedParking} vehicles parked</span>
          </div>
        </div>

        {/* Card 4: Security & Route Alerts */}
        <div 
          onClick={() => onNavigate('incidents')}
          className="glass-panel p-4 rounded-xl border border-slate-800 glass-card-hover cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Incidents & Hazards</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">
            {unresolvedIncidents.length + blockedRoutes.length} <span className="text-xs font-normal text-slate-400">cases</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-400 font-mono">
            <AlertCircle className="w-3 h-3" />
            <span>{unresolvedIncidents.length} security, {blockedRoutes.length} blocked route</span>
          </div>
        </div>

      </div>

      {/* BIOMETRIC ATTENDANCE & HOSTEL COMMAND OVERVIEW */}
      <div className="card-ait p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                SHARED BIOMETRIC SYSTEM
              </span>
              <h2 className="text-base font-bold text-slate-100 font-serif">
                Classroom & Hostel Presence Monitoring Overview
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live identity recognition telemetry across lecture halls, Boys' Hostel, and Girls' Hostel facilities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('face-registration')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              Face Registry
            </button>
            <button
              onClick={() => onNavigate('camera-sessions')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700"
            >
              Camera Sessions & QR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Classroom Attendance Card */}
          <div 
            onClick={() => onNavigate('attendance')}
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Classroom Sessions
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">
              {campusStore.getFaceTemplates().length} <span className="text-xs font-normal text-slate-400">Registered Student Faces</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Active Classroom Streams:</span>
                <span className="text-emerald-400 font-bold">1 LH-101 Feed</span>
              </div>
              <div className="flex justify-between">
                <span>Threshold Met (≥45m):</span>
                <span className="text-emerald-400 font-bold">{fullAttendanceCount} Students</span>
              </div>
              <div className="flex justify-between">
                <span>Review / Uncertain:</span>
                <span className="text-amber-400 font-bold">{belowThresholdCount} Flagged</span>
              </div>
            </div>
          </div>

          {/* 2. Boys' Hostel Presence Card */}
          <div 
            onClick={() => onNavigate('boys-hostel')}
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 font-mono flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                Boys' Hostel Monitoring
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">
              {campusStore.getHostelResidents('boys').length} <span className="text-xs font-normal text-slate-400">Allocated Residents</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Verified Inside Hostel:</span>
                <span className="text-emerald-400 font-bold">
                  {campusStore.getHostelResidents('boys').filter(r => r.currentStatus === 'PRESENT_IN_HOSTEL').length} Residents
                </span>
              </div>
              <div className="flex justify-between">
                <span>Attending Classes:</span>
                <span className="text-cyan-400 font-bold">
                  {campusStore.getHostelResidents('boys').filter(r => r.currentStatus === 'ATTENDING_CLASSES').length} Residents
                </span>
              </div>
              <div className="flex justify-between">
                <span>Turnstile Event Logs:</span>
                <span className="text-slate-300 font-bold">
                  {campusStore.getHostelEvents('boys').length} Today
                </span>
              </div>
            </div>
          </div>

          {/* 3. Girls' Hostel Presence Card */}
          <div 
            onClick={() => onNavigate('girls-hostel')}
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Girls' Hostel Monitoring
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">
              {campusStore.getHostelResidents('girls').length} <span className="text-xs font-normal text-slate-400">Allocated Residents</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Verified Inside Hostel:</span>
                <span className="text-emerald-400 font-bold">
                  {campusStore.getHostelResidents('girls').filter(r => r.currentStatus === 'PRESENT_IN_HOSTEL').length} Residents
                </span>
              </div>
              <div className="flex justify-between">
                <span>Attending Classes:</span>
                <span className="text-cyan-400 font-bold">
                  {campusStore.getHostelResidents('girls').filter(r => r.currentStatus === 'ATTENDING_CLASSES').length} Residents
                </span>
              </div>
              <div className="flex justify-between">
                <span>Access Security:</span>
                <span className="text-rose-400 font-bold">North Turnstiles Armed</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Chart 1: Hourly Flow Area Chart (2 cols) */}
        <div className="glass-panel rounded-xl p-4 sm:p-5 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Campus Crowd & Vehicle Traffic Flow</h3>
              <p className="text-[11px] text-slate-400">Hourly temporal distribution across AIT campus zones</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              DEMO DATA SNAPSHOT
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="count" name="Pedestrians" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCrowd)" />
                <Area type="monotone" dataKey="vehicles" name="Vehicles" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorVehicles)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attendance Threshold Compliance Donut */}
        <div className="glass-panel rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100">45-Minute Attendance Rule</h3>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Lecture standard: 60 min period. Verified threshold: 45 min.
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[11px] font-mono">
            {attendancePieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Operational Modules Quick Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Column 1: Camera Feeds Health */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Camera Infrastructure ({activeCamerasCount}/{cameras.length} Active)</span>
            </h3>
            <button 
              onClick={() => onNavigate('cameras')} 
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {cameras.slice(0, 4).map(cam => (
              <div key={cam.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="font-medium text-slate-200 truncate max-w-[150px]">{cam.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{cam.cameraCode} • {cam.mode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-amber-300 font-semibold">{cam.currentOccupancy} occ</div>
                  <div className="text-[10px] text-slate-400">{cam.density}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Campus Route Congestion */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Campus Wayfinding Status</span>
            </h3>
            <button 
              onClick={() => onNavigate('routes')} 
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              <span>Map Route</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {routes.map(r => (
              <div key={r.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-slate-200 truncate max-w-[160px]">{r.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{r.distanceMeters}m • {r.walkTimeMinutes} min walk</div>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    r.status === 'CLEAR' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    r.status === 'BUSY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Recent Incidents / Security */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Security Incident Docket</span>
            </h3>
            <button 
              onClick={() => onNavigate('incidents')} 
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {incidents.slice(0, 3).map(inc => (
              <div key={inc.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-amber-400 font-bold text-[11px]">{inc.caseNumber}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {inc.severity}
                  </span>
                </div>
                <div className="font-medium text-slate-200 truncate">{inc.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{inc.location} • Status: <span className="text-amber-300">{inc.status}</span></div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
