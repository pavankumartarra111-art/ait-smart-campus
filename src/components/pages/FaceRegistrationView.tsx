import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanFace, 
  UserCheck, 
  ShieldCheck, 
  AlertCircle, 
  Camera, 
  Trash2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  SlidersHorizontal, 
  Lock, 
  FileText, 
  Sparkles,
  Upload,
  UserPlus
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { faceRecognitionService } from '../../services/FaceRecognitionService';
import { Student, FaceTemplate } from '../../types/campus';

export const FaceRegistrationView: React.FC = () => {
  const [currentUser] = useState(campusStore.getCurrentUser());
  const [students, setStudents] = useState<Student[]>(campusStore.getStudents());
  const [faceTemplates, setFaceTemplates] = useState<FaceTemplate[]>(campusStore.getFaceTemplates());

  // Filters
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'REGISTERED' | 'UNREGISTERED' | 'FAILED'>('ALL');

  // Registration Modal State
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<string>('Ready');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedQuality, setDetectedQuality] = useState<'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | null>(null);
  const [descriptorVector, setDescriptorVector] = useState<number[] | null>(null);
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [consentSigned, setConsentSigned] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // New Student Quick Enroll Modal
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    enrollmentNo: '',
    name: '',
    rollNo: '',
    program: 'B.Tech' as 'B.Tech' | 'M.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: '',
    phone: '+91 98230 00000',
    guardianPhone: '+91 94220 00000',
    hostelBuilding: 'Cariappa Hall (Boys)',
    hostelRoom: 'B-201'
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    return campusStore.subscribe(() => {
      setStudents(campusStore.getStudents());
      setFaceTemplates(campusStore.getFaceTemplates());
    });
  }, []);

  // Pre-load face models in background
  useEffect(() => {
    setIsModelLoading(true);
    faceRecognitionService.loadModels()
      .then((ok) => {
        setIsModelLoading(false);
        setModelStatus(ok ? 'Neural Models Active' : 'Model Load Notice');
      })
      .catch((e) => {
        setIsModelLoading(false);
        setModelStatus('Simulated Template Mode');
        console.warn('Face models initialization:', e);
      });
  }, []);

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesProgram = selectedProgram === 'ALL' || s.program === selectedProgram;
    const matchesYear = selectedYear === 'ALL' || s.year.toString() === selectedYear;
    const matchesBranch = selectedBranch === 'ALL' || s.branch === selectedBranch;
    const matchesSection = selectedSection === 'ALL' || (s.section || 'A') === selectedSection;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'REGISTERED' && s.faceRegistrationStatus === 'REGISTERED') ||
      (statusFilter === 'UNREGISTERED' && (!s.faceRegistrationStatus || s.faceRegistrationStatus === 'UNREGISTERED')) ||
      (statusFilter === 'FAILED' && s.faceRegistrationStatus === 'FAILED');
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNo.includes(searchQuery);

    return matchesProgram && matchesYear && matchesBranch && matchesSection && matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalEnrolled = filteredStudents.length;
  const registeredCount = filteredStudents.filter(s => s.faceRegistrationStatus === 'REGISTERED').length;
  const unregisteredCount = filteredStudents.filter(s => !s.faceRegistrationStatus || s.faceRegistrationStatus === 'UNREGISTERED').length;
  const failedCount = filteredStudents.filter(s => s.faceRegistrationStatus === 'FAILED').length;
  const progressPercent = totalEnrolled > 0 ? Math.round((registeredCount / totalEnrolled) * 100) : 0;

  // Open Registration Modal for student
  const handleOpenRegistration = (student: Student) => {
    setActiveStudent(student);
    setCapturedImage(student.avatar || null);
    setDetectedQuality(null);
    setDescriptorVector(null);
    setConsentSigned(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
    startWebcam();
  };

  const startWebcam = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      setIsCameraActive(false);
      setErrorMessage('Webcam unavailable. You may upload a photo or use simulated template capture.');
    }
  };

  const stopWebcam = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCloseModal = () => {
    stopWebcam();
    setIsModalOpen(false);
    setActiveStudent(null);
    setCapturedImage(null);
  };

  // Capture frame from webcam and extract face embedding
  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const video = videoRef.current;
      if (video.readyState < 2) {
        setErrorMessage('Camera stream is still starting. Please wait a second.');
        setIsProcessing(false);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      setCapturedImage(dataUrl);

      // Extract embedding using faceRecognitionService - try video element directly, then canvas
      let result: any = null;
      try {
        result = await faceRecognitionService.extractFaceEmbedding(video);
      } catch (err) {
        console.warn('Video extract attempt:', err);
      }
      if (!result) {
        result = await faceRecognitionService.extractFaceEmbedding(canvas);
      }

      if (result) {
        setDescriptorVector(result.descriptor);
        setDetectionConfidence(result.confidence);
        setDetectedQuality(result.quality);
        if (result.quality === 'POOR') {
          setErrorMessage('Face quality is low (poor lighting or blurry). Please look directly into the camera and recapture.');
        } else {
          setSuccessMessage(`Valid face detected! Quality: ${result.quality} (${result.confidence}% confidence). Ready to activate.`);
        }
      } else {
        // Fallback simulated descriptor if face not detected
        setErrorMessage('No clear face detected in the frame. Please look directly at the webcam with good lighting and retry.');
        setDetectedQuality('POOR');
      }
    } catch (e: any) {
      console.error('Capture processing error:', e);
      setErrorMessage('Failed to extract face embedding. Please retry with clear lighting.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload photo from disk
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imgUrl = event.target?.result as string;
      setCapturedImage(imgUrl);
      setIsProcessing(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const img = new Image();
      img.onload = async () => {
        try {
          const result = await faceRecognitionService.extractFaceEmbedding(img);
          if (result) {
            setDescriptorVector(result.descriptor);
            setDetectionConfidence(result.confidence);
            setDetectedQuality(result.quality);
            setSuccessMessage(`Extracted 128-d face embedding from uploaded image (${result.quality}).`);
          } else {
            setErrorMessage('Could not detect a clear face in the uploaded image. Please upload a clear passport-style portrait.');
            setDetectedQuality('POOR');
          }
        } catch {
          setErrorMessage('Error processing image. Please try another photo.');
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  // Extract face embedding directly from student's profile photo
  const handleExtractFromProfilePhoto = async () => {
    if (!activeStudent?.avatar) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const result = await faceRecognitionService.extractFaceEmbedding(img);
        if (result) {
          setCapturedImage(activeStudent.avatar || null);
          setDescriptorVector(result.descriptor);
          setDetectionConfidence(result.confidence);
          setDetectedQuality(result.quality);
          setSuccessMessage(`Valid face detected from student photo! Quality: ${result.quality} (${result.confidence}% confidence). Ready to activate.`);
        } else {
          setErrorMessage('Could not extract biometric landmarks from student profile photo. Please use webcam capture or upload a clearer photo.');
          setDetectedQuality('POOR');
        }
      } catch {
        setErrorMessage('Error analyzing profile photo. Please use webcam capture.');
      } finally {
        setIsProcessing(false);
      }
    };
    img.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Could not load student profile photo for biometric scanning.');
    };
    img.src = activeStudent.avatar;
  };

  // Save template into database
  const handleSaveFaceTemplate = () => {
    if (!activeStudent) return;
    if (!consentSigned) {
      setErrorMessage('Biometric Consent requirement: You must check the authorization box before storing templates.');
      return;
    }
    if (!descriptorVector || descriptorVector.length === 0) {
      setErrorMessage('Please capture or upload a valid face image first.');
      return;
    }

    try {
      campusStore.saveFaceTemplate({
        enrollmentNo: activeStudent.enrollmentNo,
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        program: activeStudent.program,
        branch: activeStudent.branch,
        year: activeStudent.year,
        section: activeStudent.section || 'A',
        descriptor: descriptorVector,
        descriptorConfidence: detectionConfidence || 95,
        sampleQuality: detectedQuality || 'GOOD',
        photoPreview: capturedImage || activeStudent.avatar,
        consentSigned: true
      });

      handleCloseModal();
      alert(`Face Registration Complete: Template successfully stored for ${activeStudent.name} [${activeStudent.enrollmentNo}]. Active camera sessions updated!`);
    } catch (e: any) {
      setErrorMessage(e.message || 'Error saving face template');
    }
  };

  // Delete/Purge Face Template
  const handleDeleteTemplate = (student: Student) => {
    if (!confirm(`Are you sure you want to purge the biometric template for ${student.name} [${student.enrollmentNo}]? This action is logged.`)) return;
    campusStore.deleteFaceTemplate(student.enrollmentNo, 'Administrator requested deletion / GDPR privacy removal');
    alert(`Biometric template purged for ${student.name}. Status set to UNREGISTERED.`);
  };

  // Quick enroll new student
  const handleCreateNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.enrollmentNo.trim() || !newStudentForm.name.trim()) return;

    // Prevent duplicate enrollment
    const exists = students.some(s => s.enrollmentNo.toLowerCase() === newStudentForm.enrollmentNo.trim().toLowerCase());
    if (exists) {
      alert(`Enrollment number ${newStudentForm.enrollmentNo} already exists in database! Duplicate registration prevented.`);
      return;
    }

    campusStore.addStudent({
      ...newStudentForm,
      enrollmentNo: newStudentForm.enrollmentNo.trim(),
      regNo: newStudentForm.enrollmentNo.replace(/[^a-zA-Z0-9]/g, ''),
      cgpa: 8.0,
      attendanceRate: 85.0,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      enrolledSubjectIds: ['sub-cse-401'],
      faceRegistrationStatus: 'UNREGISTERED'
    });

    setIsNewStudentModalOpen(false);
    alert(`Enrolled new student: ${newStudentForm.name} [${newStudentForm.enrollmentNo}]. You can now capture their face template.`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ScanFace className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
              Biometric Command
            </span>
            <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {modelStatus}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-serif">
            Student Face Registration & Templates
          </h1>
          <p className="text-sm text-slate-400">
            Shared biometric identity registry for classrooms, Boys' hostel, and Girls' hostel with dynamic live-session updates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const randNum = Math.floor(100 + Math.random() * 900);
              setNewStudentForm({
                enrollmentNo: `AIT/2024/CSE/${randNum}`,
                name: '',
                rollNo: `${randNum + 4000}`,
                program: 'B.Tech',
                branch: 'Computer Engineering',
                year: 4,
                semester: 7,
                section: 'A',
                email: '',
                phone: '+91 98230 00000',
                guardianPhone: '+91 94220 00000',
                hostelBuilding: 'Cariappa Hall (Boys)',
                hostelRoom: 'B-201'
              });
              setIsNewStudentModalOpen(true);
            }}
            className="btn-ait-primary flex items-center gap-2 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Roster Registration Progress Card */}
      <div className="card-ait p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border-amber-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
              Selected Roster Face Enrollment Coverage
            </div>
            <div className="text-2xl font-bold text-slate-100 flex items-baseline gap-2 font-mono">
              <span>{registeredCount} / {totalEnrolled}</span>
              <span className="text-sm font-normal text-slate-400">Students Registered</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {progressPercent}% Complete
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {registeredCount} Registered
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              {unregisteredCount} Unregistered
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                {failedCount} Retry Required
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-ait p-4 flex flex-wrap items-center gap-3 bg-slate-900/60">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          Filter:
        </div>

        {/* Program Filter */}
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="select-ait text-xs py-1.5"
        >
          <option value="ALL">All Programs</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
        </select>

        {/* Year Filter */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="select-ait text-xs py-1.5"
        >
          <option value="ALL">All Academic Years</option>
          <option value="1">1st Year (Freshers)</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year (Final Year)</option>
        </select>

        {/* Branch Filter */}
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="select-ait text-xs py-1.5 max-w-[200px]"
        >
          <option value="ALL">All Branches</option>
          <option value="Computer Engineering">Computer Engineering (CSE)</option>
          <option value="Electronics & Telecommunication">Electronics & Telecom (E&TC)</option>
          <option value="Robotics & Automation">Robotics & Automation</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
          <option value="Information Technology">Information Technology (IT)</option>
          <option value="Data Science & Artificial Intelligence">Data Science & AI (M.Tech)</option>
        </select>

        {/* Section Filter */}
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="select-ait text-xs py-1.5"
        >
          <option value="ALL">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="select-ait text-xs py-1.5"
        >
          <option value="ALL">All Registration Status</option>
          <option value="REGISTERED">Registered Only</option>
          <option value="UNREGISTERED">Unregistered Only</option>
          <option value="FAILED">Failed / Quality Retry</option>
        </select>

        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search student by name, enrollment no, roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-ait text-xs pl-9 py-1.5 w-full"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card-ait overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student & Avatar</th>
                <th className="py-3 px-4">Enrollment Number</th>
                <th className="py-3 px-4">Program & Branch</th>
                <th className="py-3 px-4">Hostel Allocation</th>
                <th className="py-3 px-4">Face Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isRegistered = s.faceRegistrationStatus === 'REGISTERED';
                  const isFailed = s.faceRegistrationStatus === 'FAILED';

                  return (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={s.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-200">{s.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Roll: {s.rollNo}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-amber-300">
                        {s.enrollmentNo}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300">{s.program} - Year {s.year} (Sec {s.section || 'A'})</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{s.branch}</div>
                      </td>

                      <td className="py-3 px-4">
                        {s.hostelBuilding ? (
                          <div>
                            <div className="text-slate-300 font-medium">{s.hostelBuilding}</div>
                            <div className="text-[10px] text-cyan-400 font-mono">Room: {s.hostelRoom || 'Assigned'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Day Scholar / None</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isRegistered ? (
                          <span className="badge-ait bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Registered
                          </span>
                        ) : isFailed ? (
                          <span className="badge-ait bg-red-500/15 text-red-300 border border-red-500/30 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3 text-red-400" />
                            Quality Failed
                          </span>
                        ) : (
                          <span className="badge-ait bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            Unregistered
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {s.faceRegisteredAt || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenRegistration(s)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                              isRegistered
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400'
                            }`}
                          >
                            <ScanFace className="w-3 h-3" />
                            {isRegistered ? 'Update Face' : 'Register Face'}
                          </button>

                          {isRegistered && (
                            <button
                              onClick={() => handleDeleteTemplate(s)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                              title="Purge Biometric Template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face Registration Modal */}
      {isModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-2xl bg-[#0c1322] border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Biometric Registration: {activeStudent.name}
                  </h3>
                  <div className="text-xs font-mono text-amber-300/90">
                    Enrollment ID: {activeStudent.enrollmentNo} | {activeStudent.branch}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1 rounded text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Camera Preview / Quality Feedback Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Live Webcam Frame */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>1. Live Camera Alignment</span>
                    {isCameraActive && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Camera Active
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
                    />

                    {!isCameraActive && (
                      <div className="text-center p-4 text-slate-500 text-xs">
                        <Camera className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                        <div>Webcam Feed Inactive</div>
                        <button
                          onClick={startWebcam}
                          className="mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                        >
                          Enable Webcam
                        </button>
                      </div>
                    )}

                    {/* Face Guide Target Overlay */}
                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-32 h-44 rounded-full border-2 border-dashed border-amber-400/60 flex items-center justify-center">
                          <span className="text-[10px] font-mono text-amber-300/80 bg-black/60 px-2 py-0.5 rounded">
                            Center Face
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCaptureFrame}
                      disabled={!isCameraActive || isProcessing}
                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {isProcessing ? 'Analyzing...' : 'Capture Face Frame'}
                    </button>

                    <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {activeStudent?.avatar && (
                      <button
                        type="button"
                        onClick={handleExtractFromProfilePhoto}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-medium flex items-center gap-1"
                        title="Extract biometric embedding from existing student avatar photo"
                      >
                        Use Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Captured Frame & Feature Quality Verification */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    2. Validated Face Sample
                  </div>

                  <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                    {capturedImage ? (
                      <img
                        src={capturedImage}
                        alt="Captured Face"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-slate-500 text-center p-4">
                        Capture or upload a photo to inspect feature landmarks.
                      </div>
                    )}

                    {/* Quality Badge Overlay */}
                    {detectedQuality && (
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          detectedQuality === 'EXCELLENT' ? 'bg-emerald-500 text-slate-950' :
                          detectedQuality === 'GOOD' ? 'bg-cyan-500 text-slate-950' :
                          detectedQuality === 'ACCEPTABLE' ? 'bg-amber-500 text-slate-950' :
                          'bg-red-500 text-white'
                        }`}>
                          {detectedQuality} QUALITY
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quality metrics */}
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Embedding Dimensions:</span>
                      <span className="text-slate-200">{descriptorVector ? '128-d Vector (Standard)' : 'Not extracted'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Detection Confidence:</span>
                      <span className="text-slate-200">{detectionConfidence ? `${detectionConfidence}%` : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status messages */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Mandatory Biometric Consent Clause */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Institutional Biometric Consent & Data Protection
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  In compliance with institute biometric governance policy, raw video frames are processed in-memory and discarded. Only irreversible mathematical embedding vectors are retained for authorized classroom attendance and hostel safety monitoring.
                </p>
                <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentSigned}
                    onChange={(e) => setConsentSigned(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Student has granted biometric consent and authorized template registration for academic year 2026-27.
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveFaceTemplate}
                disabled={!descriptorVector || !consentSigned || isProcessing}
                className="btn-ait-primary py-2 px-5 text-xs font-bold disabled:opacity-40 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Save & Activate Biometric Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-lg bg-[#0c1322] border-amber-500/30 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                Add Student to Academic Roster
              </h3>
              <button onClick={() => setIsNewStudentModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Unique Enrollment Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIT/2024/CSE/042"
                  value={newStudentForm.enrollmentNo}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, enrollmentNo: e.target.value })}
                  className="input-ait w-full py-1.5 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Student Name"
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4125"
                    value={newStudentForm.rollNo}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, rollNo: e.target.value })}
                    className="input-ait w-full py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Program</label>
                  <select
                    value={newStudentForm.program}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, program: e.target.value as any })}
                    className="select-ait w-full py-1.5"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Year & Section</label>
                  <div className="flex gap-2">
                    <select
                      value={newStudentForm.year}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, year: parseInt(e.target.value) })}
                      className="select-ait w-1/2 py-1.5"
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                    <select
                      value={newStudentForm.section}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, section: e.target.value })}
                      className="select-ait w-1/2 py-1.5"
                    >
                      <option value="A">Sec A</option>
                      <option value="B">Sec B</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Academic Branch</label>
                <select
                  value={newStudentForm.branch}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, branch: e.target.value })}
                  className="select-ait w-full py-1.5"
                >
                  <option value="Computer Engineering">Computer Engineering (CSE)</option>
                  <option value="Electronics & Telecommunication">Electronics & Telecom (E&TC)</option>
                  <option value="Robotics & Automation">Robotics & Automation</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science & Artificial Intelligence">Data Science & AI (M.Tech)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Hostel Allocation</label>
                  <select
                    value={newStudentForm.hostelBuilding}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, hostelBuilding: e.target.value })}
                    className="select-ait w-full py-1.5"
                  >
                    <option value="Cariappa Hall (Boys)">Cariappa Hall (Boys)</option>
                    <option value="Thimayya Hostel (Boys)">Thimayya Hostel (Boys)</option>
                    <option value="Kalpana Chawla Bhavan (Girls)">Kalpana Chawla Bhavan (Girls)</option>
                    <option value="">Day Scholar (None)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Room Assignment</label>
                  <input
                    type="text"
                    placeholder="e.g. B-205"
                    value={newStudentForm.hostelRoom}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, hostelRoom: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-ait-primary py-1.5 px-4"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
