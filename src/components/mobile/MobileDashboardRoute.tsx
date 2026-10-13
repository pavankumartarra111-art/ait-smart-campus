import React, { useState } from 'react';
import { 
  Shield, 
  Car, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Camera, 
  Bot, 
  CheckCircle, 
  User, 
  Phone, 
  Sparkles,
  Scan,
  QrCode
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { User as CampusUser } from '../../types/campus';
import { LiveCameraScannerModal } from '../common/LiveCameraScannerModal';

interface MobileDashboardRouteProps {
  currentUser: CampusUser;
  onExitMobile?: () => void;
  onOpenChatbot?: () => void;
}

export const MobileDashboardRoute: React.FC<MobileDashboardRouteProps> = ({
  currentUser,
  onExitMobile,
  onOpenChatbot
}) => {
  const cameras = campusStore.getCameras();
  const parkingZones = campusStore.getParkingZones();
  const routes = campusStore.getRoutes();

  const totalParkingBays = parkingZones.reduce((acc, z) => acc + z.totalSpaces, 0);
  const occupiedBays = parkingZones.reduce((acc, z) => acc + z.occupiedSpaces, 0);
  const openBays = totalParkingBays - occupiedBays;

  const [sosSent, setSosSent] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedMessage, setScannedMessage] = useState<string | null>(null);

  const handleSendSos = () => {
    campusStore.addIncident({
      category: 'ASSISTANCE_REQ',
      title: `Mobile SOS Emergency Alert from ${currentUser.name}`,
      description: `Emergency button triggered via Mobile Web Dashboard by Cadet ${currentUser.name}. Immediate security dispatch requested.`,
      location: 'Central Spine / Academic Boulevard',
      severity: 'CRITICAL',
      status: 'OPEN',
      reportedBy: currentUser.name,
      assignedOfficer: 'Duty Security Patrol'
    });
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  const handleScanSuccess = (decodedData: string) => {
    setScannedMessage(`Verified Scan: "${decodedData.substring(0, 40)}"`);
    setIsScannerOpen(false);
    setTimeout(() => setScannedMessage(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#070c12] text-slate-100 flex flex-col font-sans pb-8 max-w-md mx-auto relative shadow-2xl">
      
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-30 bg-[#0d1522]/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Shield className="w-4 h-4 fill-slate-950 stroke-amber-200" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-serif">
              AIT PUNE
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Mobile Smart Portal</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Camera Scan QR Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-[11px] font-bold shadow-md transition-all"
            title="Scan QR with Mobile Camera"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>

          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300"
              title="Open AI Assistant"
            >
              <Bot className="w-4 h-4" />
            </button>
          )}

          {onExitMobile && (
            <button
              onClick={onExitMobile}
              className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300"
            >
              Desktop
            </button>
          )}
        </div>
      </header>

      {/* Main Mobile Scroll Content */}
      <main className="p-4 space-y-4">
        
        {/* Scanned Feedback Banner */}
        {scannedMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono">{scannedMessage}</span>
          </div>
        )}

        {/* Digital Cadet Pass Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-slate-850 to-[#0e192b] border border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between text-[10px] font-mono mb-3">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              CADET SMART PASS
            </span>
            <span className="text-slate-400">AY 2026-27</span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"}
              alt={currentUser.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/50 shadow-md shrink-0"
            />
            <div>
              <h2 className="text-sm font-bold text-slate-100">{currentUser.name}</h2>
              <div className="text-[11px] text-amber-400 font-mono capitalize">
                {currentUser.role.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {currentUser.department || 'Army Institute of Technology'}
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <div>
              <span className="text-slate-400 text-[9px] block">VERIFIED ATTENDANCE</span>
              <span className="font-bold text-emerald-400 text-xs">95.0% COMPLIANT</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[9px] block">SECURITY CLEARANCE</span>
              <span className="font-bold text-amber-300 text-xs">AUTHORIZED PASS</span>
            </div>
          </div>
        </div>

        {/* Live Mobile Camera QR Scanner Trigger Card */}
        <div 
          onClick={() => setIsScannerOpen(true)}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer transition-all flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>Scan Campus QR Code</span>
                <span className="text-[10px] text-cyan-300 font-mono">Camera</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Tap to open phone camera & scan pass/turnstile
              </div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-cyan-600/30 text-cyan-300 text-[10px] font-bold font-mono">
            OPEN LENS
          </span>
        </div>

        {/* SOS Alert Banner */}
        {sosSent ? (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Emergency SOS Dispatched to Security Control Room (+91 20 2715 7534)!</span>
          </div>
        ) : (
          <button
            onClick={handleSendSos}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40"
          >
            <AlertCircle className="w-4 h-4" />
            <span>CAMPUS SECURITY EMERGENCY SOS</span>
          </button>
        )}

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Parking Status */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>Parking Bays</span>
            </div>
            <div className="text-lg font-bold text-slate-100 font-mono">
              {openBays} <span className="text-[10px] text-slate-400 font-normal">/ {totalParkingBays} Open</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">
              {Math.round((openBays / totalParkingBays) * 100)}% available
            </div>
          </div>

          {/* AI Attendance Threshold */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Today's Slot</span>
            </div>
            <div className="text-lg font-bold text-slate-100 font-mono">
              CS-401 <span className="text-[10px] text-slate-400 font-normal">P-3</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">
              ≥45m Verified Full
            </div>
          </div>
        </div>

        {/* Live Camera Snapshot (Main Gate) */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Gate Surveillance</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.2 rounded border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          <div className="w-full h-36 bg-slate-950 rounded-lg border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-25" />
            <div className="relative z-10 text-center space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400">AIT-CAM-MG01</span>
              <p className="text-[11px] text-slate-400">Alandi Road Main Entrance</p>
              <div className="text-[10px] text-slate-500 font-mono">42 Persons In Zone • Moderate</div>
            </div>
          </div>
        </div>

        {/* Campus Route Advisory */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Corridor Advisory</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">UPDATED</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {routes.slice(0, 2).map(r => (
              <div key={r.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 truncate max-w-[200px] text-[11px]">{r.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  r.status === 'CLEAR' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Mobile Footer */}
      <footer className="text-center text-[10px] text-slate-500 font-mono px-4 mt-auto">
        Army Institute of Technology, Pune • Mobile Web Interface
      </footer>

      {/* Live Camera Scanner Modal on Mobile */}
      <LiveCameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="Mobile Camera QR Scanner"
      />
    </div>
  );
};
