import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  QrCode, 
  Play, 
  Square, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  ShieldCheck, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { campusStore } from '../../services/campusStore';
import { CameraSession } from '../../types/campus';

export const CameraSessionsView: React.FC = () => {
  const [currentUser] = useState(campusStore.getCurrentUser());
  const [sessions, setSessions] = useState<CameraSession[]>(campusStore.getCameraSessions());
  const [selectedSession, setSelectedSession] = useState<CameraSession | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [filterPurpose, setFilterPurpose] = useState<string>('ALL');

  useEffect(() => {
    return campusStore.subscribe(() => {
      setSessions(campusStore.getCameraSessions());
    });
  }, []);

  const filteredSessions = sessions.filter(s => {
    if (filterPurpose === 'ALL') return true;
    return s.purpose === filterPurpose;
  });

  const activeCount = sessions.filter(s => s.status === 'ACTIVE').length;
  const completedCount = sessions.filter(s => s.status === 'COMPLETED').length;

  const handleEndSession = (id: string) => {
    campusStore.endCameraSession(id);
    setSessions(campusStore.getCameraSessions());
  };

  const getMobileSessionUrl = (session: CameraSession): string => {
    const origin = window.location.origin;
    return `${origin}/mobile?session=${session.sessionToken}&purpose=${session.purpose.toLowerCase()}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="card-ait p-5 border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-ait bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Camera className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                Stream Command & Control
              </span>
              <span className="text-xs font-mono text-amber-400">
                Live Session Registry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-serif">
              Active Camera Sessions & QR Dispatch
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Centralized orchestration of laptop webcams, mobile QR scanners, and perimeter CCTV streams for classrooms and hostels.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-ait p-4 bg-slate-900/60 border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-mono mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Active Camera Streams
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{activeCount}</div>
          <div className="text-[11px] text-emerald-500 mt-1">Streaming and matching</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-mono mb-1">Total Archived Sessions</div>
          <div className="text-2xl font-bold font-mono text-slate-100">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged in audit trail</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60 border-cyan-500/30">
          <div className="text-xs text-cyan-400 font-mono mb-1">Classroom Attendance Feeds</div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {sessions.filter(s => s.purpose === 'CLASSROOM' && s.status === 'ACTIVE').length}
          </div>
          <div className="text-[11px] text-cyan-500 mt-1">Lecture halls armed</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60 border-amber-500/30">
          <div className="text-xs text-amber-400 font-mono mb-1">Hostel Turnstile Feeds</div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {sessions.filter(s => (s.purpose === 'BOYS_HOSTEL_ENTRANCE' || s.purpose === 'GIRLS_HOSTEL_ENTRANCE') && s.status === 'ACTIVE').length}
          </div>
          <div className="text-[11px] text-amber-500 mt-1">Turnstiles armed</div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="card-ait p-4 bg-slate-900/80 border-slate-800 flex items-center gap-3 text-xs">
        <span className="text-slate-400 font-medium">Filter Session Purpose:</span>
        {(['ALL', 'CLASSROOM', 'BOYS_HOSTEL_ENTRANCE', 'GIRLS_HOSTEL_ENTRANCE'] as const).map(p => (
          <button
            key={p}
            onClick={() => setFilterPurpose(p)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterPurpose === p
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {p === 'ALL' ? 'All Sessions' : p.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map(session => {
          const isActive = session.status === 'ACTIVE';

          return (
            <div key={session.id} className="card-ait p-4 flex flex-col justify-between space-y-3 bg-slate-900/60 border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    session.purpose === 'CLASSROOM' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    session.purpose === 'BOYS_HOSTEL_ENTRANCE' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {session.purpose.replace(/_/g, ' ')}
                  </span>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>}
                    {session.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-200 text-sm">{session.locationName}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">{session.cameraName}</div>
                </div>

                {session.subjectName && (
                  <div className="text-xs text-amber-300 font-medium">
                    {session.subjectName}
                  </div>
                )}

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Operator:</span>
                    <span className="text-slate-200">{session.operatorName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Active Roster:</span>
                    <span className="text-slate-200">{session.activeRosterCount} Students</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Recognized:</span>
                    <span className="text-emerald-400">{session.recognizedCount} Verified</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Unknown Faces:</span>
                    <span className="text-amber-400">{session.unknownDetectionsCount} Review</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Started:</span>
                    <span className="text-slate-400">{session.startedAt.slice(11, 19)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedSession(session);
                    setIsQrModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 flex-1 justify-center transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  Mobile QR Link
                </button>

                {isActive && (
                  <button
                    onClick={() => handleEndSession(session.id)}
                    className="px-2.5 py-1.5 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold transition-colors"
                  >
                    End Stream
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Dispatch Modal */}
      {isQrModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-md bg-[#0c1322] border-amber-500/30 p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                Mobile Camera Stream Access
              </h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Scan this QR code with any smartphone camera to stream directly to <strong className="text-slate-200">{selectedSession.locationName}</strong> using temporary session token.
            </p>

            {/* QR Code Display */}
            <div className="p-4 bg-white rounded-xl w-fit mx-auto shadow-2xl">
              <QRCodeSVG
                value={getMobileSessionUrl(selectedSession)}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Session Token: <span className="text-amber-300">{selectedSession.sessionToken}</span></div>
              <div className="text-[10px] text-slate-500 truncate">URL: {getMobileSessionUrl(selectedSession)}</div>
            </div>

            <div className="text-[10px] text-slate-500 text-left">
              * Note: Mobile browser will prompt for camera permissions upon scanning. Secure HTTPS encrypted transport required.
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full btn-ait-primary py-2 text-xs font-bold"
              >
                Close QR Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
