import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  Play, 
  Square, 
  CheckCircle, 
  AlertCircle, 
  Check, 
  Radio, 
  Maximize2, 
  Layers, 
  Cpu, 
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { CameraLocation } from '../../types/campus';

interface LaptopWebcamStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocationId?: string;
}

export const LaptopWebcamStationModal: React.FC<LaptopWebcamStationModalProps> = ({
  isOpen,
  onClose,
  defaultLocationId
}) => {
  const [cameras, setCameras] = useState<CameraLocation[]>(campusStore.getCameras());
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    defaultLocationId || cameras[0]?.id || 'cam-01'
  );
  const [isWebcamRunning, setIsWebcamRunning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiBoxes, setAiBoxes] = useState<{ x: number; y: number; w: number; h: number; label: string; conf: number }[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return campusStore.subscribe(() => {
      setCameras(campusStore.getCameras());
    });
  }, []);

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamRunning(false);
  };

  const startWebcam = async (overrideDeviceId?: string) => {
    setErrorMessage(null);
    stopWebcam();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("MediaDevices API is unavailable. Please check that you are running on localhost, 127.0.0.1 or HTTPS.");
      return;
    }

    const deviceToUse = overrideDeviceId !== undefined ? overrideDeviceId : selectedDeviceId;

    try {
      const constraints: MediaStreamConstraints = deviceToUse 
        ? { video: { deviceId: { exact: deviceToUse } }, audio: false }
        : { video: true, audio: false };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsWebcamRunning(true);

      // Query available video devices
      if (navigator.mediaDevices.enumerateDevices) {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoInputs);
        if (videoInputs.length > 0 && !deviceToUse) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }

      // Assign to selected campus location
      const selectedCam = cameras.find(c => c.id === selectedLocationId);
      campusStore.setCameraMode(selectedLocationId, 'webcam', 'Laptop Webcam');
      campusStore.logAudit(
        'WEBCAM_ASSIGNED',
        'Campus Cameras',
        `Live laptop webcam stream assigned to [${selectedCam?.cameraCode}] ${selectedCam?.name}`
      );
    } catch (err: any) {
      console.error("Laptop webcam error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage("Camera permission was denied. Please allow camera permissions in your browser bar.");
      } else {
        setErrorMessage(`Failed to open camera: ${err.message || 'Unknown device error'}`);
      }
      setIsWebcamRunning(false);
    }
  };

  // AI Bounding Box Simulator on Live Webcam Frames
  useEffect(() => {
    if (!isWebcamRunning) return;

    const interval = setInterval(() => {
      setAiBoxes([
        { x: 30 + Math.sin(Date.now() / 1500) * 8, y: 25 + Math.cos(Date.now() / 1500) * 5, w: 38, h: 48, label: 'Person (Cadet)', conf: 96 },
        { x: 42 + Math.sin(Date.now() / 1500) * 8, y: 30 + Math.cos(Date.now() / 1500) * 5, w: 15, h: 18, label: 'Face', conf: 93 }
      ]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isWebcamRunning]);

  useEffect(() => {
    if (isOpen) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [isOpen]);

  const handleLocationAssignment = (newLocationId: string) => {
    setSelectedLocationId(newLocationId);
    if (isWebcamRunning) {
      campusStore.setCameraMode(newLocationId, 'webcam', 'Laptop Webcam');
    }
  };

  const selectedCam = cameras.find(c => c.id === selectedLocationId) || cameras[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0a111c] border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Laptop Live Webcam Command Center</span>
                {isWebcamRunning && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Stream real laptop camera video directly to any AIT campus surveillance location
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            title="Close Station"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Viewport */}
        <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isWebcamRunning ? 'hidden' : ''}`}
          />

          {/* AI Bounding Boxes Overlay on Live Video */}
          {isWebcamRunning && aiBoxes.map((box, bIdx) => (
            <div
              key={bIdx}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                transition: 'all 0.8s ease-out'
              }}
              className="absolute border-2 border-emerald-400 bg-emerald-500/10 pointer-events-none rounded z-10"
            >
              <div className="absolute -top-4 left-0 bg-emerald-500 text-slate-950 font-mono text-[9px] font-bold px-1.5 rounded-sm flex items-center gap-1">
                <span>{box.label}</span>
                <span>{box.conf}%</span>
              </div>
            </div>
          ))}

          {/* HUD Telemetry Overlay */}
          {isWebcamRunning && (
            <>
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/90 text-white flex items-center gap-1.5 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE LAPTOP FEED
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/75 backdrop-blur text-amber-300 border border-amber-500/30">
                  ASSIGNED: {selectedCam?.cameraCode}
                </span>
              </div>

              <div className="absolute top-3 right-3 z-20 text-[10px] font-mono text-slate-200 bg-black/75 backdrop-blur px-2.5 py-0.5 rounded border border-slate-700/60">
                1080p • 30.0 FPS • Latency: 42ms
              </div>

              <div className="absolute bottom-3 left-3 z-20 text-[10px] font-mono text-slate-300 bg-black/75 backdrop-blur px-2.5 py-0.5 rounded border border-slate-700/60">
                Target: {selectedCam?.name}
              </div>
            </>
          )}

          {/* Stopped / Permission Needed State */}
          {!isWebcamRunning && (
            <div className="p-6 text-center max-w-sm flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">Laptop Webcam Integration</h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Connect your laptop's integrated camera or USB webcam to demonstrate real live video streaming into the AIT campus surveillance system.
              </p>

              <button
                onClick={() => startWebcam()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Live Webcam Feed</span>
              </button>

              {errorMessage && (
                <div className="mt-3.5 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configuration Body: Device Selector & Location Assignment */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Campus Location to Stream To */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Assign Live Stream To Campus Location:</span>
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationAssignment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50"
              >
                {cameras.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.cameraCode}] {c.name} ({c.zone})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                The selected location card will immediately broadcast this live laptop feed.
              </p>
            </div>

            {/* Laptop Camera Device Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Laptop Camera Hardware:</span>
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  startWebcam(e.target.value);
                }}
                disabled={devices.length === 0}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
              >
                {devices.length > 0 ? (
                  devices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera Device ${i + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">Default Laptop Camera (Auto-detected)</option>
                )}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Supports integrated webcams, external USB cameras, and virtual video devices.
              </p>
            </div>

          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ephemeral local processing • Frames are never saved or transmitted externally</span>
            </div>

            <div className="flex items-center gap-2">
              {isWebcamRunning ? (
                <button
                  onClick={stopWebcam}
                  className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Webcam Stream</span>
                </button>
              ) : (
                <button
                  onClick={() => startWebcam()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Live Stream</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
