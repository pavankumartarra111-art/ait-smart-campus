import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Upload, 
  QrCode,
  ShieldCheck,
  Zap,
  Volume2
} from 'lucide-react';
import jsQR from 'jsqr';
import { campusStore } from '../../services/campusStore';

interface LiveCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (data: string) => void;
  title?: string;
}

export const LiveCameraScannerModal: React.FC<LiveCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Mobile & Laptop Camera QR Scanner"
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Play a gentle beep tone using Web Audio API on successful scan
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } catch {
      // AudioContext muted/unsupported
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (overrideFacingMode?: 'environment' | 'user', overrideDeviceId?: string) => {
    setErrorMessage(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        "Camera access is not supported by your browser or requires a secure HTTPS connection. On mobile, please ensure you access via HTTPS or localhost."
      );
      return;
    }

    const currentFacing = overrideFacingMode || facingMode;
    const currentDevice = overrideDeviceId !== undefined ? overrideDeviceId : selectedDeviceId;

    try {
      // Construct flexible constraints
      let constraints: MediaStreamConstraints;
      if (currentDevice) {
        constraints = {
          video: { deviceId: { exact: currentDevice } },
          audio: false
        };
      } else {
        constraints = {
          video: {
            facingMode: { ideal: currentFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn("Targeted camera constraint failed, falling back to basic video:", firstErr);
        // Fallback to basic { video: true }
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);

      // Now query available devices (labels become visible after permission is granted)
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(videoInputs);
        if (videoInputs.length > 0 && !currentDevice) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }

      // Start QR Scanning frame processing loop
      scanFrames();
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage("Camera permission was denied. Please allow camera permissions in your browser or device settings.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage("No video camera hardware was detected on this device.");
      } else if (err.name === 'NotReadableError') {
        setErrorMessage("The camera is currently in use by another application or tab.");
      } else {
        setErrorMessage(`Unable to access camera: ${err.message || 'Unknown error'}`);
      }
      setIsCameraActive(false);
    }
  };

  // Continuous frame scanner using jsQR
  const scanFrames = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        playBeep();
        setScannedResult(code.data);
        campusStore.logAudit('QR_SCANNED', 'Mobile Camera Scanner', `Scanned payload: ${code.data.substring(0, 50)}`);
        if (onScanSuccess) {
          onScanSuccess(code.data);
        }
        // Pause continuous re-triggers
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(scanFrames);
        }, 1500);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrames);
  };

  // Auto-start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Flip camera toggle (environment <-> user)
  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    setSelectedDeviceId('');
    startCamera(nextFacing, '');
  };

  // Handle uploading an image/photo of a QR code as a fallback
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            playBeep();
            setScannedResult(code.data);
            if (onScanSuccess) onScanSuccess(code.data);
          } else {
            alert("No QR code detected in the selected image. Please try another photo.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0a111c] border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{title}</span>
                {isCameraActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {isCameraActive ? 'Live Camera Feed Active • Aim at QR Code' : 'Camera Initializing...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {availableCameras.length > 1 && (
              <button
                onClick={toggleFacingMode}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Flip Camera (Front/Rear)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
              title="Close Scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          
          {/* Hidden Canvas for QR frame analysis */}
          <canvas ref={canvasRef} className="hidden" />

          {/* HTML5 Live Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
          />

          {/* Laser Scanning Animation Overlay */}
          {isCameraActive && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Target Bounding Frame */}
              <div className="w-64 h-64 border-2 border-amber-500/60 rounded-2xl relative shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                {/* Animated Horizontal Laser Scan Line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce [animation-duration:2s]" />
              </div>

              <div className="absolute bottom-4 bg-black/75 backdrop-blur px-3 py-1 rounded-full text-[11px] font-mono text-amber-300 border border-amber-500/30">
                Align QR Code Inside Box
              </div>
            </div>
          )}

          {/* Placeholder / Permission Request State */}
          {!isCameraActive && (
            <div className="p-6 text-center max-w-sm flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 animate-pulse">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">Live Camera Feed</h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Allow browser camera permissions to open the camera scanner for QR codes, student cards, and security access passes.
              </p>

              <button
                onClick={() => startCamera()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Open Camera Now</span>
              </button>

              {errorMessage && (
                <div className="mt-3.5 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Scanned Success Overlay Modal */}
          {scannedResult && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center animate-in fade-in z-20">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-900/40 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                QR CODE DETECTED & VERIFIED
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1 max-w-sm truncate">
                {scannedResult}
              </h3>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                {scannedResult.startsWith('http') && (
                  <a
                    href={scannedResult}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <span>Open Decoded URL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => setScannedResult(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Scan Another Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls & Upload Fallback */}
        <div className="p-3.5 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {availableCameras.length > 0 && (
            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <span className="text-[11px] text-slate-400 shrink-0">Device:</span>
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  startCamera(facingMode, e.target.value);
                }}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-[11px] truncate flex-1 focus:outline-none"
              >
                {availableCameras.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Photo Gallery Fallback */}
          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer ml-auto">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Photo of QR</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

      </div>
    </div>
  );
};
