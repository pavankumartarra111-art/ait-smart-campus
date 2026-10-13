import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Route, 
  CornerDownRight, 
  ShieldAlert, 
  Info,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { CampusRoute } from '../../types/campus';

export const CampusRouteView: React.FC = () => {
  const [routes, setRoutes] = useState<CampusRoute[]>(campusStore.getRoutes());
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || 'rt-1');

  // Wayfinder State
  const [startPoint, setStartPoint] = useState('Main Gate (Alandi Rd)');
  const [endPoint, setEndPoint] = useState('Academic Block A (Ramanujan Wing)');
  const [calculatedPath, setCalculatedPath] = useState<CampusRoute | null>(routes[0]);

  React.useEffect(() => {
    return campusStore.subscribe(() => {
      setRoutes(campusStore.getRoutes());
    });
  }, []);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const campusNodes = [
    { id: 'gate', name: 'Main Gate (Alandi Rd)', x: 12, y: 70, type: 'entry' },
    { id: 'tank', name: 'Vijayanta Tank Memorial', x: 30, y: 55, type: 'landmark' },
    { id: 'acadA', name: 'Academic Block A (Ramanujan Wing)', x: 45, y: 35, type: 'academic' },
    { id: 'acadB', name: 'Academic Block B & Labs', x: 55, y: 25, type: 'academic' },
    { id: 'lib', name: 'Ramanujan Central Library', x: 62, y: 45, type: 'academic' },
    { id: 'gazebo', name: 'Student Gazebo & Quad', x: 50, y: 65, type: 'amenity' },
    { id: 'mess', name: 'Cadets Mess & Dining Complex', x: 75, y: 65, type: 'amenity' },
    { id: 'aud', name: 'Manekshaw Auditorium', x: 30, y: 85, type: 'cultural' },
    { id: 'shop', name: 'Shopping Complex & Canteen', x: 80, y: 85, type: 'commercial' },
    { id: 'hostels', name: 'Hostel Ring & Sports Arena', x: 85, y: 35, type: 'residential' },
    { id: 'parking', name: 'Main Parking Area', x: 22, y: 35, type: 'transport' },
  ];

  const handleCalculateRoute = () => {
    const matched = routes.find(r => 
      (r.fromLocation.includes(startPoint) || startPoint.includes(r.fromLocation)) &&
      (r.toLocation.includes(endPoint) || endPoint.includes(r.toLocation))
    ) || routes[0];

    setCalculatedPath(matched);
    setSelectedRouteId(matched.id);
  };

  const handleToggleStatus = (routeId: string, nextStatus: 'CLEAR' | 'BUSY' | 'BLOCKED') => {
    const hazard = nextStatus === 'BLOCKED' ? 'Civil maintenance and paving work in progress.' : undefined;
    campusStore.updateRouteStatus(routeId, nextStatus, hazard);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Title Banner */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              CAMPUS SCHEMATIC DIGITAL TWIN
            </span>
            <span className="text-xs font-mono text-slate-400">
              AIT PUNE INTERNAL WAYFINDING & MOBILITY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Campus Route & Congestion Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated corridor density, obstacle reporting, and smart detour routing across the 30-acre AIT campus.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
          <Route className="w-4 h-4 text-cyan-400" />
          <span>Active Internal Routes: {routes.length}</span>
        </div>
      </div>

      {/* Main Grid: Campus Map on Left (2 cols), Wayfinding on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Schematic Interactive Campus Map */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>AIT Pune Campus Schematic Layout</span>
              </h3>
              <p className="text-xs text-slate-400">Interactive corridor network with live congestion coloring</p>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Clear</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-300">Busy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-300">Blocked</span>
              </div>
            </div>
          </div>

          {/* SVG Campus Layout Canvas */}
          <div className="relative w-full aspect-[16/10] bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden p-2 flex items-center justify-center">
            
            {/* Background Map Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Connecting Road Network Polyline paths */}
              {routes.map(r => {
                const pointsStr = r.coordinates.map(c => `${c.x},${c.y}`).join(' ');
                const strokeColor = r.status === 'CLEAR' ? '#10b981' : r.status === 'BUSY' ? '#f59e0b' : '#ef4444';
                const isSelected = r.id === selectedRouteId;

                return (
                  <g key={r.id} onClick={() => setSelectedRouteId(r.id)} className="cursor-pointer">
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={r.status === 'BLOCKED' ? '2,2' : undefined}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all hover:stroke-width-3"
                    />
                  </g>
                );
              })}

              {/* Landmark Nodes */}
              {campusNodes.map(node => (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <circle
                    r="3.5"
                    fill={node.type === 'entry' ? '#f59e0b' : node.type === 'academic' ? '#38bdf8' : node.type === 'amenity' ? '#10b981' : '#c084fc'}
                    stroke="#0f172a"
                    strokeWidth="1"
                    className="cursor-pointer hover:scale-125 transition-transform"
                  />
                  <text
                    x="4.5"
                    y="1.5"
                    fontSize="2.4"
                    fill="#cbd5e1"
                    fontWeight="600"
                    fontFamily="Outfit, sans-serif"
                    className="select-none pointer-events-none"
                  >
                    {node.name.split('(')[0]}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Footnote notice */}
          <div className="mt-3 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Aggregated mobility data • No individual GPS or facial tracking</span>
            <span>Scale approx 1:2500</span>
          </div>
        </div>

        {/* Right Sidebar: Wayfinding Engine & Selected Route Inspector */}
        <div className="space-y-4">
          
          {/* Wayfinder Panel */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <CornerDownRight className="w-4 h-4 text-cyan-400" />
              <span>Campus Pathfinding Engine</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Origin Point</label>
                <select
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {campusNodes.map(n => (
                    <option key={n.id} value={n.name}>{n.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Destination Point</label>
                <select
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {campusNodes.map(n => (
                    <option key={n.id} value={n.name}>{n.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCalculateRoute}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all mt-2"
              >
                <span>Compute Optimal Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Selected Route Details Card */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedRoute.status === 'CLEAR' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                selectedRoute.status === 'BUSY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                {selectedRoute.status} STATUS
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {selectedRoute.congestionLevel}% Congestion
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-100">{selectedRoute.name}</h4>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Distance</span>
                <span className="font-bold text-slate-200">{selectedRoute.distanceMeters} meters</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Estimated Walk</span>
                <span className="font-bold text-slate-200">~{selectedRoute.walkTimeMinutes} mins</span>
              </div>
            </div>

            {selectedRoute.alternateRoute && (
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs">
                <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recommended Alternative</span>
                </div>
                <div className="text-slate-300 text-[11px]">{selectedRoute.alternateRoute}</div>
              </div>
            )}

            {selectedRoute.activeHazards && (
              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-xs">
                <div className="text-[11px] font-bold text-red-300 flex items-center gap-1.5 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Hazard Advisory</span>
                </div>
                <div className="text-slate-300 text-[11px]">{selectedRoute.activeHazards}</div>
              </div>
            )}

            {/* Quick Status Toggler for Demo */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1 text-[11px]">
              <span className="text-slate-400">Toggle Status:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleStatus(selectedRoute.id, 'CLEAR')}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-emerald-950/40 text-emerald-400 border border-slate-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleToggleStatus(selectedRoute.id, 'BUSY')}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-amber-950/40 text-amber-400 border border-slate-800"
                >
                  Busy
                </button>
                <button
                  onClick={() => handleToggleStatus(selectedRoute.id, 'BLOCKED')}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-red-950/40 text-red-400 border border-slate-800"
                >
                  Block
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
