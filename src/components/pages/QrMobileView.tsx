import React, { useState } from 'react';
import { 
  QrCode, 
  Copy, 
  Download, 
  ExternalLink, 
  Smartphone, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  Camera,
  Car,
  Clock,
  Navigation
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { campusStore } from '../../services/campusStore';
import { User } from '../../types/campus';
import { LiveCameraScannerModal } from '../common/LiveCameraScannerModal';

interface QrMobileViewProps {
  currentUser: User;
}

export const QrMobileView: React.FC<QrMobileViewProps> = ({ currentUser }) => {
  const settings = campusStore.getSettings();
  const [mobileUrl, setMobileUrl] = useState(
    settings.deployedMobileUrl || 'https://ait-virtual-campus.vercel.app/mobile'
  );
  const [isCopied, setIsCopied] = useState(false);
  const [demoTokenEnabled, setDemoTokenEnabled] = useState(false);

  const cameras = campusStore.getCameras();
  const parkingZones = campusStore.getParkingZones();
  const availableBays = parkingZones.reduce((acc, z) => acc + (z.totalSpaces - z.occupiedSpaces), 0);

  // Computed URL with optional demo token
  const finalQrUrl = demoTokenEnabled 
    ? `${mobileUrl}?token=ait_demo_sec_${Math.floor(Date.now() / 1000)}` 
    : mobileUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalQrUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById('ait-mobile-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40, 520, 520);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'AIT_Smart_Campus_Mobile_QR.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Mobile Flow Context */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              DIRECT MOBILE REACHABILITY
            </span>
            <span className="text-xs font-mono text-slate-400">
              ZERO-QUESTIONNAIRE QR ACCESS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            QR Code Access & Mobile Campus Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Instantly opens responsive mobile dashboard. Direct HTTPS link without Wi-Fi captive setup forms or port questionnaires.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Open Camera Scanner</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{isCopied ? 'Link Copied!' : 'Copy Mobile URL'}</span>
          </button>
          <button
            onClick={handleDownloadQr}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res QR</span>
          </button>
        </div>
      </div>

      {/* Main Grid: QR Generator on Left (1 col), Interactive Phone Simulator on Right (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Real QR Code Generator (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-between space-y-6">
          <div className="w-full">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-1">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Real High-Contrast Mobile QR Code</span>
            </h3>
            <p className="text-xs text-slate-400">
              Scan with any mobile camera (iOS / Android) to open directly.
            </p>
          </div>

          {/* Render Real QR Code */}
          <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-amber-500/40 flex items-center justify-center">
            <QRCodeSVG
              id="ait-mobile-qr-code"
              value={finalQrUrl}
              size={220}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23070c12'><path d='M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z'/></svg>",
                x: undefined,
                y: undefined,
                height: 38,
                width: 38,
                excavate: true,
              }}
            />
          </div>

          {/* Configurable URL Box */}
          <div className="w-full space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Encoded HTTPS Target URL
              </label>
              <input
                type="text"
                value={mobileUrl}
                onChange={(e) => setMobileUrl(e.target.value)}
                placeholder="https://your-domain.example/mobile"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Standard HTTPS format • No localhost or local laptop Wi-Fi dependencies
              </p>
            </div>

            {/* Optional Short-lived token switch */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-[11px]">Restricted Demonstration Token</div>
                <div className="text-[10px] text-slate-400">Append short-lived session token to QR</div>
              </div>
              <input
                type="checkbox"
                checked={demoTokenEnabled}
                onChange={(e) => setDemoTokenEnabled(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 bg-slate-900"
              />
            </div>
          </div>

          {/* Security & Camera Permission Disclaimer */}
          <div className="w-full p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong>Security Protocol:</strong> Mobile webcams require explicit user consent via browser prompts. Passwords and credentials are never baked into QR payload.
            </div>
          </div>
        </div>

        {/* Right Column: Live Responsive Mobile View Simulator (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Mobile Dashboard Preview (375 × 667)</span>
              </h3>
              <p className="text-xs text-slate-400">Direct interface rendered upon scanning QR code</p>
            </div>
            <a
              href={finalQrUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>Test Direct Route</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Realistic Mobile Device Frame */}
          <div className="w-[340px] max-w-full h-[600px] bg-slate-950 rounded-[36px] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col relative">
            
            {/* Phone Speaker Notch */}
            <div className="w-full h-6 bg-slate-900 flex items-center justify-center relative">
              <div className="w-20 h-3 bg-slate-950 rounded-full" />
            </div>

            {/* Mobile Header Bar */}
            <div className="px-4 py-3 bg-[#0d1522] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">
                  AIT
                </div>
                <div className="text-xs font-bold text-slate-100">AIT Smart Mobile</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Mobile App Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs font-sans">
              
              {/* Cadet ID Pass Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-600/30 to-amber-900/20 border border-amber-500/40">
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-mono mb-1">
                  <span>CADET PASS</span>
                  <span>AIT PUNE</span>
                </div>
                <div className="text-sm font-bold text-slate-100">{currentUser.name}</div>
                <div className="text-[10px] text-slate-300 font-mono">
                  Role: <span className="text-amber-400 capitalize">{currentUser.role.replace('_', ' ')}</span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold">Attendance: 95.0%</span>
                  <span className="text-slate-300">RFID: VALID</span>
                </div>
              </div>

              {/* Quick Campus Vitals in Mobile Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <Car className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400">Parking Bays</div>
                  <div className="text-sm font-bold text-slate-100 font-mono">{availableBays} Open</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400">Classroom Rule</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">45m Threshold</div>
                </div>
              </div>

              {/* Live Mini Camera Feed Snapshot */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Main Gate Feed</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400">ACTIVE</span>
                </div>
                <div className="w-full h-24 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                  <div className="text-[10px] font-mono text-slate-500 text-center">
                    AIT-CAM-MG01 • 42 Footfall
                  </div>
                </div>
              </div>

              {/* Fast Campus SOS Assistance Button */}
              <div className="pt-1">
                <button
                  onClick={() => alert('Emergency SOS Alert dispatched to AIT Campus Security Control Room (+91 20 2715 7534)!')}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>CAMPUS SECURITY SOS REPORT</span>
                </button>
              </div>

            </div>

            {/* Phone Home Bar */}
            <div className="w-full h-4 bg-slate-900 flex items-center justify-center">
              <div className="w-24 h-1 bg-slate-700 rounded-full" />
            </div>

          </div>
        </div>

      </div>

      {/* Live Camera Scanner Modal */}
      <LiveCameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Mobile & Laptop Camera QR Scanner"
      />

    </div>
  );
};
