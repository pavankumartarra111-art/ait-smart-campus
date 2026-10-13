import React, { useState } from 'react';
import { 
  Users, 
  Armchair, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  BarChart2,
  TrendingDown,
  Info
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export const CrowdAnalyticsView: React.FC = () => {
  const cameras = campusStore.getCameras();

  // Locations relevant to crowd & seating
  const crowdLocations = cameras.filter(c => 
    c.name.toLowerCase().includes('mess') ||
    c.name.toLowerCase().includes('library') ||
    c.name.toLowerCase().includes('auditorium') ||
    c.name.toLowerCase().includes('gazebo') ||
    c.name.toLowerCase().includes('shopping') ||
    c.name.toLowerCase().includes('boulevard') ||
    c.name.toLowerCase().includes('gate')
  );

  // Recommended less-crowded areas
  const recommendedAreas = [...crowdLocations]
    .filter(c => c.density === 'LOW' || c.density === 'MODERATE')
    .sort((a, b) => (a.currentOccupancy / a.maxCapacity) - (b.currentOccupancy / b.maxCapacity));

  // Comparative chart data
  const comparisonData = crowdLocations.map(c => {
    const totalSeats = c.name.toLowerCase().includes('auditorium') ? 800 :
                       c.name.toLowerCase().includes('mess') ? 280 :
                       c.name.toLowerCase().includes('library') ? 160 :
                       c.name.toLowerCase().includes('gazebo') ? 80 : 0;
    const occupiedSeats = Math.min(totalSeats, Math.round(c.currentOccupancy * 0.85));
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);

    return {
      name: c.name.split('(')[0].replace('Cadets', '').trim(),
      occupiedSeats,
      availableSeats,
      headcount: c.currentOccupancy,
      capacity: c.maxCapacity
    };
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Title & Context Header */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              AGGREGATED VISITOR ANALYTICS
            </span>
            <span className="text-xs font-mono text-slate-400">
              CAMPUS SEATING & DENSITY ESTIMATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Crowd Density & Seating Capacity Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time occupancy monitoring for Cadets Mess, Ramanujan Library, Manekshaw Auditorium, Gazebo, and campus walkways.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-300 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Privacy Protected: Anonymous Aggregate Headcounts Only</span>
        </div>
      </div>

      {/* Recommended Less-Crowded Study & Seating Hubs */}
      <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/15">
        <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wide">
          <Sparkles className="w-4 h-4" />
          <span>Recommended Less-Crowded Zones (Available Right Now)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {recommendedAreas.slice(0, 3).map(rec => {
            const pct = Math.round((rec.currentOccupancy / rec.maxCapacity) * 100);
            return (
              <div key={rec.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-100">{rec.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{rec.zone}</div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold">{rec.currentOccupancy} / {rec.maxCapacity} ({pct}% load)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{rec.density}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Comparative Bar Chart */}
      <div className="glass-panel rounded-xl p-4 sm:p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Live Seating Capacity & Occupancy Distribution</h3>
            <p className="text-[11px] text-slate-400">Comparison of occupied vs available seating bays across major campus facilities</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
            DEMO DATA SNAPSHOT
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="occupiedSeats" name="Occupied Seats" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="availableSeats" name="Available Seats" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crowdLocations.map(loc => {
          const totalSeats = loc.name.toLowerCase().includes('auditorium') ? 800 :
                             loc.name.toLowerCase().includes('mess') ? 280 :
                             loc.name.toLowerCase().includes('library') ? 160 :
                             loc.name.toLowerCase().includes('gazebo') ? 80 : 0;
          const occupiedSeats = Math.min(totalSeats, Math.round(loc.currentOccupancy * 0.85));
          const availableSeats = Math.max(0, totalSeats - occupiedSeats);
          const occupancyPct = Math.round((loc.currentOccupancy / loc.maxCapacity) * 100);

          return (
            <div key={loc.id} className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    loc.density === 'LOW' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    loc.density === 'MODERATE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    loc.density === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {loc.density} DENSITY
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{loc.cameraCode}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-0.5">{loc.name}</h3>
                <p className="text-[11px] text-slate-400">{loc.zone}</p>

                {/* Occupancy Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Total Footfall</span>
                    <span className="text-slate-200 font-bold">{loc.currentOccupancy} / {loc.maxCapacity} ({occupancyPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        occupancyPct > 80 ? 'bg-red-500' : occupancyPct > 55 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    />
                  </div>
                </div>

                {/* Seating Stats if applicable */}
                {totalSeats > 0 && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Armchair className="w-3.5 h-3.5 text-amber-400" />
                        <span>Seating Area</span>
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">{availableSeats} open</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {occupiedSeats} occupied / {totalSeats} configured seats
                    </div>
                  </div>
                )}
              </div>

              {/* Pedestrian In/Out Velocity */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1">
                  <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                  <span>Entry: <strong className="text-slate-200">{loc.pedestrianCountIn}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-amber-400" />
                  <span>Exit: <strong className="text-slate-200">{loc.pedestrianCountOut}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
