import React, { useState } from 'react';
import { 
  Car, 
  Bike, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { ParkingZone } from '../../types/campus';

export const ParkingManagementView: React.FC = () => {
  const [zones, setZones] = useState<ParkingZone[]>(campusStore.getParkingZones());
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'pk-zone-a');

  React.useEffect(() => {
    return campusStore.subscribe(() => {
      setZones(campusStore.getParkingZones());
    });
  }, []);

  const currentZone = zones.find(z => z.id === selectedZoneId) || zones[0];
  const totalCapacity = zones.reduce((acc, z) => acc + z.totalSpaces, 0);
  const totalOccupied = zones.reduce((acc, z) => acc + z.occupiedSpaces, 0);
  const totalAvailable = totalCapacity - totalOccupied;

  const handleToggleSlot = (slotId: string) => {
    campusStore.toggleParkingSlot(currentZone.id, slotId);
  };

  const handleSimulateEvent = (type: 'ENTRY' | 'EXIT') => {
    campusStore.simulateVehicleEvent(currentZone.id, type);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Title & Status Banner */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ANPR & SENSOR INTEGRATION
            </span>
            <span className="text-xs font-mono text-slate-400">
              CAMPUS VEHICLE ACCESS CONTROL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Parking Infrastructure & Vehicle Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated slot sensing across North Gate, Cadets Arena, and Visitor Parking bays at AIT Pune.
          </p>
        </div>

        {/* Live Simulation Trigger Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateEvent('ENTRY')}
            className="px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            title="Simulate vehicle driving through checkpost"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Simulate Entry (+1)</span>
          </button>
          <button
            onClick={() => handleSimulateEvent('EXIT')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            title="Simulate vehicle leaving campus"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>Simulate Exit (-1)</span>
          </button>
        </div>
      </div>

      {/* Campus Parking KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Campus Bays</div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">{totalCapacity}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across {zones.length} parking arenas</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
          <div className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Available Open Bays</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono">{totalAvailable}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {Math.round((totalAvailable / totalCapacity) * 100)}% available
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/20 bg-amber-950/10">
          <div className="text-xs text-amber-400 font-medium mb-1 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5" />
            <span>Occupied Vehicles</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">{totalOccupied}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Four-wheelers & two-wheelers</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Hourly Throughput Flow</div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {currentZone.vehiclesEnteringPerHour + currentZone.vehiclesExitingPerHour} <span className="text-xs font-normal text-slate-400">v/hr</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            ↓ {currentZone.vehiclesEnteringPerHour} in • ↑ {currentZone.vehiclesExitingPerHour} out
          </div>
        </div>
      </div>

      {/* Zone Switcher Ribbon */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold px-1 shrink-0">Parking Zone:</span>
        {zones.map(z => {
          const avail = z.totalSpaces - z.occupiedSpaces;
          const isSelected = z.id === selectedZoneId;
          return (
            <button
              key={z.id}
              onClick={() => setSelectedZoneId(z.id)}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span>{z.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                avail <= 5 ? 'bg-red-500/30 text-red-300' : 'bg-emerald-500/30 text-emerald-300'
              }`}>
                {avail} open
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Parking Lot Grid Map */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Interactive Parking Arena Grid: {currentZone.name}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Click any bay to toggle occupied status in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
              <span className="text-slate-300">Available Bay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
              <span className="text-slate-300">Occupied Bay</span>
            </div>
          </div>
        </div>

        {/* The Grid of Parking Bays */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {currentZone.vehicles.map(slot => (
            <div
              key={slot.id}
              onClick={() => handleToggleSlot(slot.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-105 flex flex-col justify-between h-28 ${
                slot.isOccupied
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/20'
                  : 'bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/60'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-slate-200">{slot.slotNumber}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  slot.isOccupied ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {slot.isOccupied ? 'OCCUPIED' : 'OPEN'}
                </span>
              </div>

              {/* Slot Icon representation */}
              <div className="my-auto flex flex-col items-center justify-center">
                {slot.type === 'car' ? (
                  <Car className={`w-7 h-7 ${slot.isOccupied ? 'text-amber-400' : 'text-slate-600'}`} />
                ) : (
                  <Bike className={`w-7 h-7 ${slot.isOccupied ? 'text-amber-400' : 'text-slate-600'}`} />
                )}
                {slot.vehiclePlateMasked && (
                  <span className="text-[10px] font-mono text-slate-300 mt-1 truncate">
                    {slot.vehiclePlateMasked}
                  </span>
                )}
              </div>

              <div className="text-[9px] text-slate-500 font-mono text-center">
                {slot.entryTime ? `In: ${slot.entryTime}` : 'Tap to occupy'}
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Disclaimer */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Simulated Sensor Stream: Vehicle plate numbers in demonstration mode are masked to respect institutional privacy principles.
          </span>
        </div>
      </div>

    </div>
  );
};
