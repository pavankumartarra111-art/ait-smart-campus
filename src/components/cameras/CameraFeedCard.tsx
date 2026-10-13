import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraLocation, CameraMode } from '../../types/campus';
import { 
  Camera, 
  Video, 
  Cpu, 
  Play, 
  Square, 
  Maximize2, 
  Settings, 
  Trash2, 
  Users, 
  Activity, 
  Upload, 
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';

// ── Types ────────────────────────────────────────────────────────────────────
interface CameraFeedCardProps {
  camera: CameraLocation;
  onEdit?: (camera: CameraLocation) => void;
  onDelete?: (id: string) => void;
}

interface Detection {
  bbox: [number, number, number, number]; // [x, y, w, h] in pixels
  class: string;
  score: number;
}

// Lazy-load TFJS + COCO-SSD so the model is shared across all card instances
// (cached in module scope – only loads once per page session)
let cocoModelPromise: Promise<any> | null = null;
function getCocoModel(): Promise<any> {
  if (!cocoModelPromise) {
    cocoModelPromise = (async () => {
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      return await cocoSsd.load();
    })();
  }
  return cocoModelPromise;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const CameraFeedCard: React.FC<CameraFeedCardProps> = ({ camera, onEdit, onDelete }) => {
  const [activeMode, setActiveMode] = useState<CameraMode>(camera.mode);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamDevices, setWebcamDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [sampleVideoUrl, setSampleVideoUrl] = useState<string | null>(camera.sampleVideoUrl || null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // COCO-SSD state
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);

  // Simulated boxes (mode: simulated only)
  const [simulatedBoxes, setSimulatedBoxes] = useState<
    { id: number; x: number; y: number; w: number; h: number; label: string; conf: number }[]
  >([]);

  // Live telemetry
  const [liveOccupancy, setLiveOccupancy] = useState(camera.currentOccupancy);
  const [livePedIn, setLivePedIn] = useState(camera.pedestrianCountIn);
  const [livePedOut, setLivePedOut] = useState(camera.pedestrianCountOut);
  const [liveTs, setLiveTs] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19));

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const modelRef = useRef<any>(null);

  // ── Sync mode with prop ────────────────────────────────────────────────────
  useEffect(() => {
    setActiveMode(camera.mode);
  }, [camera.mode]);

  // ── Enumerate webcam devices ───────────────────────────────────────────────
  useEffect(() => {
    if (activeMode === 'webcam' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoInputs = devices.filter(d => d.kind === 'videoinput');
          setWebcamDevices(videoInputs);
          if (videoInputs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoInputs[0].deviceId);
          }
        })
        .catch(err => console.warn('enumerate devices:', err));
    }
  }, [activeMode, selectedDeviceId]);

  // ── Stop webcam helper ─────────────────────────────────────────────────────
  const stopWebcamStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsWebcamActive(false);
  }, []);

  // ── Load COCO-SSD model (shared) ──────────────────────────────────────────
  const ensureModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;
    setModelLoading(true);
    try {
      const model = await getCocoModel();
      modelRef.current = model;
      setModelReady(true);
      return model;
    } catch (e) {
      console.error('COCO-SSD load error:', e);
    } finally {
      setModelLoading(false);
    }
    return null;
  }, []);

  // ── COCO-SSD detection loop (runs on every animation frame) ───────────────
  const startDetectionLoop = useCallback(async () => {
    const model = await ensureModel();
    if (!model) return;

    const loop = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.paused) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Size canvas to match video display
      canvas.width = video.clientWidth || video.videoWidth;
      canvas.height = video.clientHeight || video.videoHeight;

      try {
        const preds: Detection[] = await model.detect(video);
        setDetections(preds);

        // Update live telemetry from real detections
        const personCount = preds.filter(p => p.class === 'person').length;
        if (personCount > 0) {
          setLiveOccupancy(prev => Math.min(camera.maxCapacity, Math.max(prev, personCount + Math.floor(Math.random() * 5))));
          if (Math.random() > 0.6) setLivePedIn(prev => prev + 1);
          if (Math.random() > 0.7) setLivePedOut(prev => prev + 1);
          setLiveTs(new Date().toISOString().replace('T', ' ').substring(0, 19));
        }

        // Draw on canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const scaleX = canvas.width / video.videoWidth;
          const scaleY = canvas.height / video.videoHeight;

          preds.forEach(pred => {
            const [x, y, w, h] = pred.bbox;
            const sx = x * scaleX;
            const sy = y * scaleY;
            const sw = w * scaleX;
            const sh = h * scaleY;
            const conf = Math.round(pred.score * 100);
            const isPerson = pred.class === 'person';
            const color = isPerson ? '#22d3ee' : '#f59e0b'; // cyan for person, amber for other

            // Bounding box
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(sx, sy, sw, sh);

            // Semi-transparent fill
            ctx.fillStyle = isPerson ? 'rgba(34,211,238,0.08)' : 'rgba(245,158,11,0.08)';
            ctx.fillRect(sx, sy, sw, sh);

            // Label background
            const label = `${pred.class} ${conf}%`;
            ctx.font = 'bold 11px monospace';
            const textW = ctx.measureText(label).width + 8;
            ctx.fillStyle = color;
            ctx.fillRect(sx, sy > 16 ? sy - 16 : sy, textW, 16);

            // Label text
            ctx.fillStyle = '#0f172a';
            ctx.fillText(label, sx + 4, sy > 16 ? sy - 4 : sy + 12);
          });
        }
      } catch (_) {
        // model may be warming up – silently continue
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [ensureModel, camera.maxCapacity]);

  // ── Stop detection loop ────────────────────────────────────────────────────
  const stopDetectionLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setDetections([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // ── Start webcam ───────────────────────────────────────────────────────────
  const startWebcam = useCallback(async () => {
    setWebcamError(null);
    stopWebcamStream();
    stopDetectionLoop();

    if (!navigator.mediaDevices?.getUserMedia) {
      setWebcamError('MediaDevices API unavailable. Run on localhost or HTTPS.');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        const constraints: MediaStreamConstraints = selectedDeviceId
          ? { video: { deviceId: { exact: selectedDeviceId } }, audio: false }
          : { video: true, audio: false };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          videoRef.current?.play();
          startDetectionLoop();
        };
      }
      setIsWebcamActive(true);
      campusStore.setCameraMode(camera.id, 'webcam', selectedDeviceId ? 'Laptop Webcam' : 'Default Camera');
    } catch (err: any) {
      setWebcamError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera in browser settings.'
          : `Camera error: ${err.message || 'Unable to open camera.'}`
      );
      setIsWebcamActive(false);
    }
  }, [selectedDeviceId, stopWebcamStream, stopDetectionLoop, startDetectionLoop, camera.id]);

  // ── Handle sample video upload ─────────────────────────────────────────────
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopDetectionLoop();
    const url = URL.createObjectURL(file);
    setSampleVideoUrl(url);
    setActiveMode('sample_video');
    campusStore.updateCamera(camera.id, { mode: 'sample_video', sampleVideoUrl: url });
  };

  // ── Start COCO-SSD when sample video is loaded ─────────────────────────────
  useEffect(() => {
    if (activeMode === 'sample_video' && sampleVideoUrl && videoRef.current) {
      stopDetectionLoop();
      const vid = videoRef.current;
      const onReady = () => startDetectionLoop();
      vid.addEventListener('loadeddata', onReady, { once: true });
      // If already ready
      if (vid.readyState >= 2) startDetectionLoop();
      return () => vid.removeEventListener('loadeddata', onReady);
    }
  }, [activeMode, sampleVideoUrl, startDetectionLoop, stopDetectionLoop]);

  // ── Simulated boxes (mode: simulated only) ────────────────────────────────
  useEffect(() => {
    if (activeMode !== 'simulated') {
      setSimulatedBoxes([]);
      return;
    }
    const generate = () => {
      const count = Math.min(6, Math.max(2, Math.floor(liveOccupancy / 15)));
      const t = Date.now();
      const boxes = Array.from({ length: count }, (_, i) => {
        const isVehicle = camera.name.toLowerCase().includes('parking') || camera.name.toLowerCase().includes('gate');
        const label = isVehicle ? (i % 2 === 0 ? 'Vehicle' : 'Person') : 'Person';
        return {
          id: i,
          x: 5 + (i * 22 + Math.sin(t / 1000 + i) * 8) % 65,
          y: 15 + (i * 14 + Math.cos(t / 1200 + i) * 10) % 60,
          w: label === 'Vehicle' ? 24 : 13,
          h: label === 'Vehicle' ? 18 : 28,
          label,
          conf: Math.round(85 + Math.random() * 13)
        };
      });
      setSimulatedBoxes(boxes);
    };
    generate();
    const id = setInterval(generate, 1800);
    return () => clearInterval(id);
  }, [activeMode, liveOccupancy, camera.name]);

  // ── Simulated telemetry ticker (all modes) ─────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setLiveOccupancy(prev => Math.max(0, Math.min(camera.maxCapacity, prev + (Math.floor(Math.random() * 5) - 2))));
      if (Math.random() > 0.4) setLivePedIn(prev => prev + Math.floor(Math.random() * 3));
      if (Math.random() > 0.5) setLivePedOut(prev => prev + Math.floor(Math.random() * 2));
      setLiveTs(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 4000);
    return () => clearInterval(id);
  }, [camera.maxCapacity]);

  // ── Toggle mode ────────────────────────────────────────────────────────────
  const toggleMode = (newMode: CameraMode) => {
    stopDetectionLoop();
    if (newMode !== 'webcam') {
      stopWebcamStream();
    } else {
      setTimeout(() => startWebcam(), 50);
    }
    setActiveMode(newMode);
    campusStore.setCameraMode(camera.id, newMode);
  };

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopWebcamStream();
      stopDetectionLoop();
    };
  }, [stopWebcamStream, stopDetectionLoop]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const personCount = detections.filter(d => d.class === 'person').length;
  const densityRatio = liveOccupancy / camera.maxCapacity;
  const densityLabel =
    densityRatio < 0.4 ? 'LOW' : densityRatio < 0.7 ? 'MODERATE' : densityRatio < 0.9 ? 'HIGH' : 'VERY HIGH';
  const densityClass =
    densityRatio < 0.4 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
    densityRatio < 0.7 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
    densityRatio < 0.9 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
    'bg-red-500/20 text-red-300 border border-red-500/30';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`glass-panel rounded-xl overflow-hidden border border-slate-800 flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 bg-slate-950/95 flex flex-col' : 'hover:border-slate-700'}`}>
      
      {/* Top Header of Card */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${camera.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              {camera.name}
            </h3>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
              <span className="text-amber-400 font-bold">{camera.cameraCode}</span>
              <span>•</span>
              <span>{camera.zone}</span>
            </div>
          </div>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center bg-slate-950/70 p-1 rounded-lg border border-slate-800 gap-1 text-xs">
          <button
            onClick={() => toggleMode('simulated')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${activeMode === 'simulated' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            title="Simulated Camera Feed"
          >
            <Cpu className="w-3 h-3" />
            <span className="hidden sm:inline">Simulated</span>
          </button>
          <button
            onClick={() => toggleMode('sample_video')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${activeMode === 'sample_video' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            title="Upload / Play Sample Video"
          >
            <Video className="w-3 h-3" />
            <span className="hidden sm:inline">Sample Video</span>
          </button>
          <button
            onClick={() => toggleMode('webcam')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${activeMode === 'webcam' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            title="Live Laptop Webcam Stream"
          >
            <Camera className="w-3 h-3" />
            <span className="hidden sm:inline">Webcam</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center group">

        {/* ── Mode A: Webcam ────────────────────────────────────────────── */}
        {activeMode === 'webcam' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950">
            {/* Video element — always mounted when webcam mode active */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isWebcamActive ? 'hidden' : ''}`}
            />

            {/* COCO-SSD canvas overlay */}
            {isWebcamActive && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />
            )}

            {/* Model loading indicator */}
            {isWebcamActive && modelLoading && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/70 rounded-full text-[10px] font-mono text-cyan-300">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading COCO-SSD model…
              </div>
            )}

            {/* Detection count badge */}
            {isWebcamActive && modelReady && personCount > 0 && (
              <div className="absolute bottom-9 left-2 z-20 px-2 py-0.5 bg-cyan-500/90 text-slate-950 font-mono text-[10px] font-bold rounded flex items-center gap-1">
                <Users className="w-3 h-3" />
                {personCount} person{personCount !== 1 ? 's' : ''} detected
              </div>
            )}

            {!isWebcamActive && (
              <div className="p-4 text-center max-w-sm flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">Laptop Webcam + AI Detection</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Connect your browser's webcam. COCO-SSD will detect people & objects in real-time.
                </p>

                {webcamDevices.length > 0 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 mb-3"
                  >
                    {webcamDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={startWebcam}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Grant Permission &amp; Start Live Stream
                </button>

                {webcamError && (
                  <div className="mt-3 p-2 bg-red-950/60 border border-red-500/40 text-red-300 text-[11px] rounded flex items-center gap-1.5 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{webcamError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Mode B: Sample Video + COCO-SSD ──────────────────────────── */}
        {activeMode === 'sample_video' && (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            {sampleVideoUrl ? (
              <>
                {/* Video element */}
                <video
                  ref={videoRef}
                  src={sampleVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />

                {/* COCO-SSD canvas overlay — drawn directly by the detection loop */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />

                {/* Model loading spinner */}
                {modelLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                      <p className="text-xs text-cyan-300 font-mono">Loading COCO-SSD detection model…</p>
                      <p className="text-[10px] text-slate-400">First load may take 10-20 seconds</p>
                    </div>
                  </div>
                )}

                {/* Detection count badge */}
                {modelReady && personCount > 0 && (
                  <div className="absolute bottom-9 left-2 z-20 px-2 py-0.5 bg-cyan-500/90 text-slate-950 font-mono text-[10px] font-bold rounded flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {personCount} person{personCount !== 1 ? 's' : ''} detected
                  </div>
                )}

                {/* Replace video button */}
                <label
                  className="absolute bottom-9 right-2 z-20 p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  title="Replace Video File"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              </>
            ) : (
              <div className="p-4 text-center max-w-sm flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">Sample Video — AI Person Detection</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Upload an MP4 / WebM surveillance clip. COCO-SSD will detect and label people &amp; objects frame-by-frame.
                </p>
                <label className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-900/30 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Video File</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* ── Mode C: Simulated Feed (synthetic bounding boxes) ─────────── */}
        {activeMode === 'simulated' && (
          <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/80" />

            {/* Blueprint backdrop */}
            <div className="relative z-0 w-full h-full flex flex-col items-center justify-center p-6 text-slate-600">
              <div className="w-full max-w-xs h-32 border border-dashed border-slate-700/60 rounded-xl flex flex-col items-center justify-center p-4 bg-slate-900/40">
                <Activity className="w-8 h-8 text-amber-500/40 mb-2 animate-pulse" />
                <span className="text-[12px] font-mono text-slate-400 tracking-wider">AIT SIMULATED VISION FEED</span>
                <span className="text-[10px] text-slate-500 mt-1">{camera.zone}</span>
              </div>
            </div>

            {/* Simulated AI Bounding Boxes (CSS divs) */}
            {simulatedBoxes.map(b => (
              <div
                key={b.id}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.w}%`,
                  height: `${b.h}%`,
                  transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="absolute border border-emerald-400 bg-emerald-500/10 pointer-events-none rounded-sm z-10"
              >
                <div className="absolute -top-4 left-0 bg-emerald-500/90 text-slate-950 font-mono text-[9px] font-bold px-1 rounded-sm leading-tight flex items-center gap-1">
                  <span>{b.label}</span>
                  <span>{b.conf}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Universal HUD Overlays ─────────────────────────────────────── */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 backdrop-blur text-red-400 border border-red-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            LIVE REC
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 backdrop-blur text-amber-300 border border-amber-500/20">
            {activeMode === 'webcam' ? 'WEBCAM · COCO-SSD' : activeMode === 'sample_video' ? 'VIDEO FILE · COCO-SSD' : 'SIMULATED DEMO FEED'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 font-mono text-[10px] text-slate-300 bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-slate-700/40">
          <span>1080p</span>
          <span>•</span>
          <span>29.9 FPS</span>
        </div>

        <div className="absolute bottom-2 left-2 z-20 text-[10px] font-mono text-slate-400 bg-black/70 backdrop-blur px-2 py-0.5 rounded border border-slate-700/40">
          {liveTs}
        </div>

        {/* Action Controls — bottom right */}
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1">
          {activeMode === 'webcam' && isWebcamActive && (
            <button
              onClick={stopWebcamStream}
              className="p-1.5 rounded bg-red-600/80 hover:bg-red-500 text-white text-xs"
              title="Stop Webcam Stream"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs"
            title="Toggle Expanded View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Analytics Card Footer — live telemetry ────────────────────────── */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-100 tabular-nums">{liveOccupancy}</span>
            <span className="text-slate-400 text-[11px]">/ {camera.maxCapacity} occ</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="tabular-nums text-emerald-400">↑{livePedIn}</span>
            <span className="tabular-nums text-red-400">↓{livePedOut}</span>
          </div>

          {/* Show real COCO detection count when active */}
          {(activeMode === 'sample_video' || activeMode === 'webcam') && modelReady && (
            <div className="flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-mono">{detections.length} obj</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Density:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${densityClass}`}>
              {densityLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={() => onEdit(camera)}
              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
              title="Edit Camera Location"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(camera.id)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title="Delete Camera Configuration"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Transparent Disclaimer */}
      <div className="px-3 py-1 bg-slate-950/80 text-[10px] text-slate-500 border-t border-slate-900 flex items-center justify-between">
        <span>
          {activeMode === 'webcam'
            ? 'Live Webcam · COCO-SSD real-time detection · Ephemeral local processing'
            : activeMode === 'sample_video'
            ? 'Sample Video · COCO-SSD person detection · Local inference only'
            : 'Labelled Simulated Feed · Generated for demonstration'}
        </span>
        <span className="text-slate-400 font-mono">ID: {camera.id}</span>
      </div>
    </div>
  );
};
