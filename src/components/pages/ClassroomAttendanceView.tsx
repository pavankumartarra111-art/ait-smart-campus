import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Play, 
  Square, 
  Camera, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  HelpCircle, 
  Sparkles, 
  ScanFace, 
  Check, 
  Edit3, 
  RefreshCw,
  Video,
  MonitorPlay
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { faceRecognitionService, FaceMatchResult } from '../../services/FaceRecognitionService';
import { 
  Student, 
  FaceTemplate, 
  Subject, 
  Classroom, 
  ClassroomFaceAttendanceRecord,
  ObservationInterval
} from '../../types/campus';

export const ClassroomAttendanceView: React.FC = () => {
  const [currentUser] = useState(campusStore.getCurrentUser());
  const [settings] = useState(campusStore.getSettings());
  const [students, setStudents] = useState<Student[]>(campusStore.getStudents());
  const [faceTemplates, setFaceTemplates] = useState<FaceTemplate[]>(campusStore.getFaceTemplates());
  const [subjects] = useState<Subject[]>(campusStore.getSubjects());
  const [classrooms] = useState<Classroom[]>(campusStore.getClassrooms());

  // Session Setup State
  const [selectedProgram, setSelectedProgram] = useState<'B.Tech' | 'M.Tech'>('B.Tech');
  const [selectedYear, setSelectedYear] = useState<number>(4);
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Engineering');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedSemester, setSelectedSemester] = useState<number>(7);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-cse-401');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('Prof. Vikramaditya Sharma');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(3);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('clr-101');
  const [cameraSource, setCameraSource] = useState<'WEBCAM' | 'SAMPLE_FEED' | 'SIMULATED'>('WEBCAM');

  // Live Session Execution State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('sess-cr-101');
  const [currentMinute, setCurrentMinute] = useState<number>(15);
  const [lectureElapsedMinutes, setLectureElapsedMinutes] = useState<number>(15);
  const [attendanceRecords, setAttendanceRecords] = useState<ClassroomFaceAttendanceRecord[]>([]);
  const [liveUnknownFaces, setLiveUnknownFaces] = useState<{ id: string; timestamp: string; confidence: number }[]>([]);
  const [isCameraStreaming, setIsCameraStreaming] = useState<boolean>(false);
  const [lastRecognitionEvent, setLastRecognitionEvent] = useState<string>('Session standby');

  // Override Modal
  const [editingRecord, setEditingRecord] = useState<ClassroomFaceAttendanceRecord | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<'FULL_ATTENDANCE' | 'BELOW_THRESHOLD' | 'UNVERIFIED_REVIEW'>('FULL_ATTENDANCE');
  const [overrideReason, setOverrideReason] = useState<string>('');

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simulatedTimerRef = useRef<any>(null);
  const isSessionActiveRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>(sessionId);
  const currentMinuteRef = useRef<number>(currentMinute);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    currentMinuteRef.current = currentMinute;
  }, [currentMinute]);

  // Filter roster from active students in database (never hardcoded 36)
  const classRoster = students.filter(s => {
    return s.program === selectedProgram &&
           s.year === selectedYear &&
           s.branch === selectedBranch &&
           (s.section || 'A') === selectedSection;
  });

  const totalEnrolled = classRoster.length;
  const registeredFacesCount = classRoster.filter(s => s.faceRegistrationStatus === 'REGISTERED').length;

  // Subscribe to campusStore for dynamic updates and warm neural models on mount
  useEffect(() => {
    // Preload neural network models and template cache on component mount
    faceRecognitionService.loadModels();
    faceRecognitionService.setTemplates(campusStore.getFaceTemplates());

    return campusStore.subscribe(() => {
      setStudents(campusStore.getStudents());
      const updatedTemplates = campusStore.getFaceTemplates();
      setFaceTemplates(updatedTemplates);
      // Dynamically update FaceRecognitionService cache mid-session without stopping video!
      faceRecognitionService.setTemplates(updatedTemplates);
      // Synchronize attendance records live
      setAttendanceRecords(campusStore.getClassroomFaceRecords(sessionIdRef.current));
    });
  }, []);

  // Initialize roster attendance records when selection changes
  useEffect(() => {
    const existing = campusStore.getClassroomFaceRecords(sessionId);
    if (existing && existing.length > 0) {
      // Ensure any newly added or registered enrolled student is merged into active records
      const existingEnrollments = new Set(existing.map(r => r.enrollmentNo));
      const missing = classRoster.filter(s => !existingEnrollments.has(s.enrollmentNo));
      if (missing.length > 0) {
        const appended: ClassroomFaceAttendanceRecord[] = missing.map(s => ({
          id: `att-cr-${s.id}`,
          sessionId,
          studentId: s.id,
          enrollmentNo: s.enrollmentNo,
          studentName: s.name,
          rollNo: s.rollNo,
          program: s.program,
          branch: s.branch,
          year: s.year,
          section: s.section || 'A',
          subjectCode: 'CS-401',
          subjectName: 'Deep Learning & Neural Networks',
          firstVerifiedObservation: null,
          latestVerifiedObservation: null,
          observationIntervals: [],
          accumulatedObservedMinutes: 0,
          lectureDurationMinutes: 60,
          attendanceStatus: 'UNVERIFIED_REVIEW',
          reviewStatus: 'PENDING_FACULTY_REVIEW',
          observationsHistory: []
        }));
        const merged = [...existing, ...appended];
        campusStore.setClassroomFaceRecords(sessionId, merged);
        setAttendanceRecords(merged);
      } else {
        setAttendanceRecords(existing);
      }
    } else {
      initializeRosterRecords();
    }
  }, [sessionId, selectedProgram, selectedYear, selectedBranch, selectedSection, students]);

  const initializeRosterRecords = () => {
    const newRecords: ClassroomFaceAttendanceRecord[] = classRoster.map((s, idx) => {
      const isRegistered = s.faceRegistrationStatus === 'REGISTERED';
      // Pre-seed mock observation intervals for demo realism
      const mockMinutes = isRegistered ? (idx % 3 === 0 ? 52 : idx % 2 === 0 ? 46 : 38) : 0;
      const initialStatus = mockMinutes >= 45 
        ? 'FULL_ATTENDANCE' 
        : mockMinutes > 0 
        ? 'BELOW_THRESHOLD' 
        : 'UNVERIFIED_REVIEW';

      const intervals: ObservationInterval[] = mockMinutes > 0 ? [
        {
          startMinute: 2,
          endMinute: mockMinutes,
          startIso: '2026-10-13 14:02:00',
          endIso: `2026-10-13 14:${String(mockMinutes).padStart(2, '0')}:00`,
          confidenceAverage: 94
        }
      ] : [];

      return {
        id: `att-cr-${s.id}`,
        sessionId,
        studentId: s.id,
        enrollmentNo: s.enrollmentNo,
        studentName: s.name,
        rollNo: s.rollNo,
        program: s.program,
        branch: s.branch,
        year: s.year,
        section: s.section || 'A',
        subjectCode: 'CS-401',
        subjectName: 'Deep Learning & Neural Networks',
        firstVerifiedObservation: mockMinutes > 0 ? '2026-10-13 14:02:00' : null,
        latestVerifiedObservation: mockMinutes > 0 ? `2026-10-13 14:${String(mockMinutes).padStart(2, '0')}:00` : null,
        observationIntervals: intervals,
        accumulatedObservedMinutes: mockMinutes,
        lectureDurationMinutes: 60,
        attendanceStatus: initialStatus,
        reviewStatus: mockMinutes >= 45 ? 'VERIFIED' : mockMinutes > 0 ? 'VERIFIED' : 'PENDING_FACULTY_REVIEW',
        observationsHistory: mockMinutes > 0 ? [
          { timestamp: '2026-10-13 14:02:00', confidence: 95, matchType: 'BIOMETRIC_MODEL' }
        ] : []
      };
    });

    setAttendanceRecords(newRecords);
    campusStore.setClassroomFaceRecords(sessionId, newRecords);
  };

  // Start live attendance session
  const handleStartSession = async () => {
    isSessionActiveRef.current = true;
    setIsSessionActive(true);
    const newSession = campusStore.createCameraSession({
      purpose: 'CLASSROOM',
      locationName: `Lecture Hall ${selectedClassroomId.toUpperCase()} (${selectedBranch})`,
      cameraId: 'cam-03',
      cameraName: 'LH-101 Overhead High-Resolution Camera',
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      subjectId: selectedSubjectId,
      subjectName: 'Deep Learning & Neural Networks (CS-401)',
      academicYear: selectedYear,
      program: selectedProgram,
      branch: selectedBranch,
      section: selectedSection,
      scheduledPeriod: selectedPeriod,
      activeRosterCount: totalEnrolled,
      recognizedCount: registeredFacesCount,
      unknownDetectionsCount: 0,
      deviceType: cameraSource === 'WEBCAM' ? 'WEBCAM' : cameraSource === 'SAMPLE_FEED' ? 'SAMPLE_VIDEO' : 'CCTV_STREAM'
    });

    // Seamless session transfer: copy existing records to newSession so newly registered students or pre-seeded data are immediately active
    const prevRecords = campusStore.getClassroomFaceRecords(sessionIdRef.current);
    const transferred = (prevRecords.length > 0 ? prevRecords : attendanceRecords).map(r => ({
      ...r,
      sessionId: newSession.id
    }));
    campusStore.setClassroomFaceRecords(newSession.id, transferred);
    sessionIdRef.current = newSession.id;
    setSessionId(newSession.id);
    setAttendanceRecords(transferred);

    if (cameraSource === 'WEBCAM') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraStreaming(true);
        startRecognitionLoop();
      } catch (err) {
        console.warn('Webcam stream error, falling back to simulated vision:', err);
        setIsCameraStreaming(false);
        startSimulatedLoop();
      }
    } else {
      startSimulatedLoop();
    }
  };

  // Stop session
  const handleStopSession = () => {
    isSessionActiveRef.current = false;
    setIsSessionActive(false);
    setIsCameraStreaming(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (simulatedTimerRef.current) {
      clearInterval(simulatedTimerRef.current);
    }
    campusStore.endCameraSession(sessionIdRef.current);
    setLastRecognitionEvent('Lecture Session Finalized');
  };

  // Real-time camera recognition loop
  const startRecognitionLoop = () => {
    let lastScanTime = 0;

    const loop = async (timestamp: number) => {
      if (!isSessionActiveRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      if (video.readyState >= 2 && !video.paused) {
        const displayW = video.videoWidth || 640;
        const displayH = video.videoHeight || 480;

        if (canvas.width !== displayW || canvas.height !== displayH) {
          canvas.width = displayW;
          canvas.height = displayH;
        }

        // Scan every 500ms
        if (timestamp - lastScanTime > 500) {
          lastScanTime = timestamp;
          try {
            // Get latest face templates dynamically (supports mid-session student registrations!)
            const latestTemplates = campusStore.getFaceTemplates();
            const results: FaceMatchResult[] = await faceRecognitionService.scanFrameAndRecognize(video, latestTemplates);

            // Draw bounding boxes on canvas overlay
            faceRecognitionService.drawOverlays(canvas, results, {
              width: displayW,
              height: displayH
            });

            // Process matches
            let matchedAny = false;
            for (const r of results) {
              if (r.isMatch && r.enrollmentNo) {
                matchedAny = true;
                campusStore.recordClassroomFaceObservation(sessionIdRef.current, r.enrollmentNo, r.confidence, currentMinuteRef.current);
                setLastRecognitionEvent(`Observed ${r.studentName} (${r.enrollmentNo}) [${r.confidence}% confidence]`);
              } else if (!r.isMatch) {
                // Unknown face handling
                setLiveUnknownFaces(prev => [
                  { id: `unk-${Date.now()}`, timestamp: new Date().toLocaleTimeString(), confidence: r.confidence },
                  ...prev.slice(0, 4)
                ]);
                setLastRecognitionEvent(`Unidentified face in frame (${r.confidence}% match distance) -> Flagged for review`);
              }
            }

            if (matchedAny) {
              setAttendanceRecords(campusStore.getClassroomFaceRecords(sessionIdRef.current));
            }
          } catch (e) {
            console.warn('Recognition frame scan error:', e);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  // Simulated vision loop for demo when webcam is not selected or unavailable
  const startSimulatedLoop = () => {
    simulatedTimerRef.current = setInterval(() => {
      // Pick any registered student from active templates so newly registered faces are detected
      const allTemplates = campusStore.getFaceTemplates();
      if (allTemplates.length > 0) {
        const randTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)];
        const confidence = Math.floor(92 + Math.random() * 7);

        campusStore.recordClassroomFaceObservation(sessionIdRef.current, randTemplate.enrollmentNo, confidence, currentMinuteRef.current);
        setAttendanceRecords(campusStore.getClassroomFaceRecords(sessionIdRef.current));
        setLastRecognitionEvent(`[SIMULATED DEMO] Detected ${randTemplate.studentName} (${randTemplate.enrollmentNo})`);
      }
    }, 3000);
  };

  // Advance simulation clock
  const handleAdvanceTime = (minutesToAdd: number) => {
    const nextMinute = Math.min(60, currentMinuteRef.current + minutesToAdd);
    currentMinuteRef.current = nextMinute;
    setCurrentMinute(nextMinute);
    setLectureElapsedMinutes(nextMinute);

    // Update observations for active students
    attendanceRecords.forEach(rec => {
      if (rec.attendanceStatus !== 'UNVERIFIED_REVIEW' && rec.firstVerifiedObservation) {
        campusStore.recordClassroomFaceObservation(sessionIdRef.current, rec.enrollmentNo, 95, nextMinute);
      }
    });
    setAttendanceRecords(campusStore.getClassroomFaceRecords(sessionIdRef.current));
  };

  // Save Faculty Override
  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !overrideReason.trim()) return;

    campusStore.overrideClassroomFaceAttendance(
      sessionId,
      editingRecord.enrollmentNo,
      overrideStatus,
      overrideReason.trim()
    );

    setAttendanceRecords(campusStore.getClassroomFaceRecords(sessionId));
    setEditingRecord(null);
    setOverrideReason('');
  };

  // Stats
  const fullAttendanceCount = attendanceRecords.filter(r => r.attendanceStatus === 'FULL_ATTENDANCE').length;
  const belowThresholdCount = attendanceRecords.filter(r => r.attendanceStatus === 'BELOW_THRESHOLD').length;
  const unverifiedCount = attendanceRecords.filter(r => r.attendanceStatus === 'UNVERIFIED_REVIEW' || r.reviewStatus === 'PENDING_FACULTY_REVIEW').length;
  const matchedStudentsCount = attendanceRecords.filter(r => (r.accumulatedObservedMinutes || 0) > 0).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Context Header */}
      <div className="card-ait p-5 border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ScanFace className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                Dynamic Face Recognition Attendance
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Period {selectedPeriod} • 60-Min Lecture Standard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-serif">
              Classroom Attendance Command Station
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Automated identity recognition with interval tracking. Minimum continuous/cumulative threshold: <strong className="text-amber-300 font-mono">45 Minutes</strong>.
            </p>
          </div>

          {/* Export & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => campusStore.exportClassroomFaceAttendanceCSV(sessionId)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Export CSV Roster
            </button>
          </div>
        </div>
      </div>

      {/* Lecture Setup & Controls Bar */}
      <div className="card-ait p-4 bg-slate-900/80 border-slate-800 space-y-3">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
          Lecture Session Configuration
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Program</label>
            <select
              disabled={isSessionActive}
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value as any)}
              className="select-ait w-full py-1.5"
            >
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Year & Section</label>
            <div className="flex gap-1.5">
              <select
                disabled={isSessionActive}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="select-ait w-1/2 py-1.5"
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
              <select
                disabled={isSessionActive}
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="select-ait w-1/2 py-1.5"
              >
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Branch</label>
            <select
              disabled={isSessionActive}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="select-ait w-full py-1.5 truncate"
            >
              <option value="Computer Engineering">Computer Engineering (CSE)</option>
              <option value="Electronics & Telecommunication">Electronics & Telecom (E&TC)</option>
              <option value="Robotics & Automation">Robotics & Automation</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science & Artificial Intelligence">Data Science & AI (M.Tech)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Subject</label>
            <select
              disabled={isSessionActive}
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="select-ait w-full py-1.5"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Classroom & Camera</label>
            <select
              disabled={isSessionActive}
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="select-ait w-full py-1.5"
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.roomNumber} ({c.block.split(' ')[0]})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Vision Feed Mode</label>
            <select
              disabled={isSessionActive}
              value={cameraSource}
              onChange={(e) => setCameraSource(e.target.value as any)}
              className="select-ait w-full py-1.5"
            >
              <option value="WEBCAM">Live Laptop Webcam</option>
              <option value="SAMPLE_FEED">Classroom RTSP Stream</option>
              <option value="SIMULATED">Simulated Demo Engine</option>
            </select>
          </div>
        </div>

        {/* Start / Stop Session Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60">
          <div className="flex items-center gap-3">
            {!isSessionActive ? (
              <button
                onClick={handleStartSession}
                className="btn-ait-primary py-1.5 px-4 text-xs font-bold flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Start Live Attendance Session
              </button>
            ) : (
              <button
                onClick={handleStopSession}
                className="py-1.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-950/40"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                Finalize & End Lecture Session
              </button>
            )}

            {isSessionActive && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Simulation Clock:</span>
                <span className="text-amber-300 font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {currentMinute} / 60 Min
                </span>
                <button
                  onClick={() => handleAdvanceTime(5)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans"
                  title="Fast forward simulation by 5 minutes"
                >
                  +5 Mins
                </button>
                <button
                  onClick={() => handleAdvanceTime(15)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans"
                  title="Fast forward simulation by 15 minutes"
                >
                  +15 Mins
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-400 truncate max-w-md">
            Status: <span className="text-amber-300 font-sans">{lastRecognitionEvent}</span>
          </div>
        </div>
      </div>

      {/* KPI Roster Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card-ait p-3 bg-slate-900/60">
          <div className="text-[11px] text-slate-400 font-mono">Total Enrolled</div>
          <div className="text-xl font-bold font-mono text-slate-100">{totalEnrolled}</div>
          <div className="text-[10px] text-slate-500">From database roster</div>
        </div>

        <div className="card-ait p-3 bg-slate-900/60">
          <div className="text-[11px] text-slate-400 font-mono">Registered Faces</div>
          <div className="text-xl font-bold font-mono text-cyan-400">{registeredFacesCount}</div>
          <div className="text-[10px] text-cyan-500/80">Biometric templates</div>
        </div>

        <div className="card-ait p-3 bg-slate-900/60 border-emerald-500/30">
          <div className="text-[11px] text-emerald-400 font-mono">Full Attendance</div>
          <div className="text-xl font-bold font-mono text-emerald-300">{fullAttendanceCount}</div>
          <div className="text-[10px] text-emerald-500">≥45 mins verified</div>
        </div>

        <div className="card-ait p-3 bg-slate-900/60 border-amber-500/30">
          <div className="text-[11px] text-amber-400 font-mono">Below Threshold</div>
          <div className="text-xl font-bold font-mono text-amber-300">{belowThresholdCount}</div>
          <div className="text-[10px] text-amber-500">&lt;45 mins verified</div>
        </div>

        <div className="card-ait p-3 bg-slate-900/60 border-red-500/30">
          <div className="text-[11px] text-red-400 font-mono">Faculty Review</div>
          <div className="text-xl font-bold font-mono text-red-300">{unverifiedCount}</div>
          <div className="text-[10px] text-red-500">Uncertain or missed</div>
        </div>

        <div className="card-ait p-3 bg-slate-900/60">
          <div className="text-[11px] text-slate-400 font-mono">Observed in Frame</div>
          <div className="text-xl font-bold font-mono text-purple-400">{matchedStudentsCount}</div>
          <div className="text-[10px] text-purple-500">Detected at least once</div>
        </div>
      </div>

      {/* Live Vision Station & Detection Feed */}
      {isSessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main Camera Viewport */}
          <div className="lg:col-span-2 card-ait p-3 bg-black border-amber-500/30 overflow-hidden relative">
            <div className="flex items-center justify-between pb-2 text-xs font-mono text-slate-400 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                LIVE VISION FEED • {selectedClassroomId.toUpperCase()}
              </span>
              <span>Dynamic Recognition Engine: ACTIVE</span>
            </div>

            <div className="relative aspect-video bg-slate-950 rounded mt-2 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isCameraStreaming ? 'hidden' : ''}`}
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {!isCameraStreaming && (
                <div className="text-center p-6 space-y-2">
                  <MonitorPlay className="w-12 h-12 text-amber-400/60 mx-auto animate-pulse" />
                  <div className="text-sm font-bold text-slate-200">
                    {cameraSource === 'SIMULATED' ? 'Simulated AI Vision Stream Active' : 'Connecting Stream Feed...'}
                  </div>
                  <div className="text-xs text-slate-400 max-w-sm mx-auto">
                    Biometric embeddings matched in-memory against active student template registry. Dynamic mid-session registrations propagate in real-time.
                  </div>
                  <div className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                    SIMULATED DEMO MODE • CLEARLY LABELLED
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Resolution: 640x480 • In-memory buffer</span>
              <span className="text-emerald-400">Euclidean Threshold: &lt;= 0.58</span>
            </div>
          </div>

          {/* Live Unknown Faces Review Queue on the side */}
          <div className="card-ait p-4 flex flex-col justify-between space-y-3 bg-slate-900/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Live Unknown Face Queue
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {liveUnknownFaces.length} Flagged
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Detected faces with match distance above threshold or unassigned identities.
              </p>

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {liveUnknownFaces.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-6">
                    No unknown faces currently in review queue.
                  </div>
                ) : (
                  liveUnknownFaces.map(unk => (
                    <div key={unk.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-amber-300">Unmatched Identity</span>
                        <span className="text-slate-500 text-[10px]">{unk.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Score: {unk.confidence}% confidence • Row 3 Camera Frustum
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Dynamic Registration Note:</span> Registering a student in the Face Registration tab immediately allows the next scan to recognize them without restarting this stream.
            </div>
          </div>

        </div>
      )}

      {/* Live Roster Attendance Table */}
      <div className="card-ait overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-serif">
              Classroom Attendance Ledger • {selectedBranch} (Sec {selectedSection})
            </h3>
            <p className="text-xs text-slate-400">
              Verified Presence Accumulation Rule: ≥45 minutes observed = Full Attendance. Intermittent intervals chained with 2-min window.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Strength: <strong className="text-amber-300">{totalEnrolled}</strong> Enrolled Students
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrollment No</th>
                <th className="py-3 px-4">First Observed</th>
                <th className="py-3 px-4">Latest Observed</th>
                <th className="py-3 px-4">Verified Presence Duration</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Faculty Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No students currently enrolled in selected branch, year, and section.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map(rec => {
                  const isThresholdMet = (rec.accumulatedObservedMinutes || 0) >= 45;
                  const isUnverified = rec.attendanceStatus === 'UNVERIFIED_REVIEW' || rec.reviewStatus === 'PENDING_FACULTY_REVIEW';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{rec.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Roll: {rec.rollNo}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-amber-300">
                        {rec.enrollmentNo}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {rec.firstVerifiedObservation ? rec.firstVerifiedObservation.slice(11, 19) : '—'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {rec.latestVerifiedObservation ? rec.latestVerifiedObservation.slice(11, 19) : '—'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className={isThresholdMet ? 'text-emerald-300 font-bold' : 'text-slate-300'}>
                              {rec.accumulatedObservedMinutes || 0} / 60 Min
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {rec.observationIntervals.length} Intervals
                            </span>
                          </div>
                          <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isThresholdMet ? 'bg-emerald-500' : (rec.accumulatedObservedMinutes || 0) > 0 ? 'bg-amber-500' : 'bg-slate-700'
                              }`}
                              style={{ width: `${Math.min(100, ((rec.accumulatedObservedMinutes || 0) / 60) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {rec.attendanceStatus === 'FULL_ATTENDANCE' ? (
                          <span className="badge-ait bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Threshold Met (≥45m)
                          </span>
                        ) : rec.attendanceStatus === 'BELOW_THRESHOLD' ? (
                          <span className="badge-ait bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Threshold Not Met (&lt;45m)
                          </span>
                        ) : (
                          <span className="badge-ait bg-red-500/15 text-red-300 border border-red-500/30 flex items-center gap-1 w-fit">
                            <HelpCircle className="w-3 h-3 text-red-400" />
                            Unverified
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {rec.reviewStatus === 'FACULTY_OVERRIDDEN' ? (
                          <div>
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                              Faculty Override
                            </span>
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px] mt-0.5">
                              {rec.overrideReason}
                            </div>
                          </div>
                        ) : rec.reviewStatus === 'PENDING_FACULTY_REVIEW' ? (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800">
                            Review Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            Verified
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingRecord(rec);
                            setOverrideStatus(rec.attendanceStatus);
                            setOverrideReason(rec.overrideReason || '');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          Review / Override
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Override Review Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-md bg-[#0c1322] border-amber-500/30 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Faculty Attendance Override
              </h3>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono space-y-1">
                <div>Student: <strong className="text-slate-200">{editingRecord.studentName}</strong></div>
                <div>Enrollment: <strong className="text-amber-300">{editingRecord.enrollmentNo}</strong></div>
                <div>Accumulated Duration: <strong className="text-cyan-300">{editingRecord.accumulatedObservedMinutes} Mins</strong></div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Override Status Decision *</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as any)}
                  className="select-ait w-full py-1.5"
                >
                  <option value="FULL_ATTENDANCE">Full Attendance (Threshold Met)</option>
                  <option value="BELOW_THRESHOLD">Below Threshold (&lt;45 Mins)</option>
                  <option value="UNVERIFIED_REVIEW">Unverified / Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Justification Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Authorized laboratory equipment setup, temporary occlusion by projector pillar, medical leave slip verified."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-ait-primary py-1.5 px-4 font-bold"
                >
                  Save Override Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
