import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  UserCheck, 
  Clock, 
  Camera, 
  SlidersHorizontal,
  Eye,
  Check,
  X
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { UnknownFaceRecord, Student } from '../../types/campus';

export const UnknownFaceReviewView: React.FC = () => {
  const [currentUser] = useState(campusStore.getCurrentUser());
  const [unknownFaces, setUnknownFaces] = useState<UnknownFaceRecord[]>(campusStore.getUnknownFaces());
  const [students] = useState<Student[]>(campusStore.getStudents());
  
  // Filters
  const [sessionTypeFilter, setSessionTypeFilter] = useState<'ALL' | 'classroom' | 'boys_hostel' | 'girls_hostel'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'IDENTIFIED' | 'DISMISSED_VISITOR' | 'FLAGGED_ALERT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign Modal
  const [activeRecord, setActiveRecord] = useState<UnknownFaceRecord | null>(null);
  const [assignStudentSearch, setAssignStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    return campusStore.subscribe(() => {
      setUnknownFaces(campusStore.getUnknownFaces());
    });
  }, []);

  const filteredFaces = unknownFaces.filter(f => {
    const matchesType = sessionTypeFilter === 'ALL' || f.sessionType === sessionTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesSearch = f.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (f.assignedStudentName && f.assignedStudentName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  const pendingCount = unknownFaces.filter(f => f.status === 'PENDING_REVIEW').length;
  const identifiedCount = unknownFaces.filter(f => f.status === 'IDENTIFIED').length;
  const dismissedCount = unknownFaces.filter(f => f.status === 'DISMISSED_VISITOR').length;
  const flaggedCount = unknownFaces.filter(f => f.status === 'FLAGGED_ALERT').length;

  const handleResolve = (
    resolution: 'IDENTIFIED' | 'DISMISSED_VISITOR' | 'FLAGGED_ALERT',
    student?: Student
  ) => {
    if (!activeRecord) return;

    campusStore.resolveUnknownFace(
      activeRecord.id,
      resolution,
      student ? student.enrollmentNo : undefined,
      student ? student.name : undefined,
      resolutionNote.trim() || undefined
    );

    setUnknownFaces(campusStore.getUnknownFaces());
    setActiveRecord(null);
    setSelectedStudent(null);
    setResolutionNote('');
  };

  const searchedStudents = students.filter(s => {
    if (!assignStudentSearch.trim()) return false;
    return s.name.toLowerCase().includes(assignStudentSearch.toLowerCase()) ||
           s.enrollmentNo.toLowerCase().includes(assignStudentSearch.toLowerCase()) ||
           s.rollNo.includes(assignStudentSearch);
  }).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="card-ait p-5 border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <HelpCircle className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                Security Verification Queue
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Audited Review Stream
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-serif">
              Unknown & Uncertain Face Review Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Isolated queue for observations where face detection occurred but biometric identity confidence fell below the verification threshold.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-ait p-4 bg-slate-900/60 border-amber-500/30">
          <div className="text-xs text-amber-400 font-mono mb-1">Pending Human Review</div>
          <div className="text-2xl font-bold font-mono text-amber-300">{pendingCount}</div>
          <div className="text-[11px] text-amber-500 mt-1">Requires staff adjudication</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60 border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-mono mb-1">Identified & Reconciled</div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{identifiedCount}</div>
          <div className="text-[11px] text-emerald-500 mt-1">Assigned to student record</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60 border-cyan-500/30">
          <div className="text-xs text-cyan-400 font-mono mb-1">Dismissed Authorized Guests</div>
          <div className="text-2xl font-bold font-mono text-cyan-300">{dismissedCount}</div>
          <div className="text-[11px] text-cyan-500 mt-1">Visitors, vendors, guest faculty</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60 border-red-500/30">
          <div className="text-xs text-red-400 font-mono mb-1">Security Alert Dispatches</div>
          <div className="text-2xl font-bold font-mono text-red-300">{flaggedCount}</div>
          <div className="text-[11px] text-red-500 mt-1">Escalated to patrol unit</div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="card-ait p-4 bg-slate-900/80 border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          Filter:
        </div>

        <select
          value={sessionTypeFilter}
          onChange={(e) => setSessionTypeFilter(e.target.value as any)}
          className="select-ait py-1.5"
        >
          <option value="ALL">All Session Types</option>
          <option value="classroom">Classroom Sessions</option>
          <option value="boys_hostel">Boys' Hostel Entrances</option>
          <option value="girls_hostel">Girls' Hostel Entrances</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="select-ait py-1.5"
        >
          <option value="ALL">All Decision States</option>
          <option value="PENDING_REVIEW">Pending Review Only</option>
          <option value="IDENTIFIED">Identified as Student</option>
          <option value="DISMISSED_VISITOR">Dismissed Authorized Guest</option>
          <option value="FLAGGED_ALERT">Flagged Security Alert</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search location, notes, assigned student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-ait text-xs pl-9 py-1.5 w-full"
          />
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaces.length === 0 ? (
          <div className="col-span-full card-ait p-8 text-center text-slate-500 text-xs">
            No unknown face records found matching filter criteria.
          </div>
        ) : (
          filteredFaces.map(face => (
            <div key={face.id} className="card-ait p-4 flex flex-col justify-between space-y-3 bg-slate-900/60 border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    face.sessionType === 'classroom' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    face.sessionType === 'boys_hostel' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {face.sessionType.replace('_', ' ')}
                  </span>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    face.status === 'PENDING_REVIEW' ? 'bg-amber-500/20 text-amber-300' :
                    face.status === 'IDENTIFIED' ? 'bg-emerald-500/20 text-emerald-300' :
                    face.status === 'DISMISSED_VISITOR' ? 'bg-slate-800 text-slate-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {face.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <img
                    src={face.snapshotPreview}
                    alt="Detected face thumbnail"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-slate-200">{face.locationName}</div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {face.timestamp}
                    </div>
                    {face.estimatedAgeGender && (
                      <div className="text-[10px] text-cyan-400/90 font-mono">
                        Estimate: {face.estimatedAgeGender}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80">
                  {face.notes}
                </p>

                {face.assignedStudentName && (
                  <div className="text-[11px] p-2 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
                    Assigned: <strong>{face.assignedStudentName}</strong> ({face.identifiedEnrollmentNo})
                  </div>
                )}
              </div>

              {face.status === 'PENDING_REVIEW' && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveRecord(face);
                      setAssignStudentSearch('');
                      setSelectedStudent(null);
                      setResolutionNote('');
                    }}
                    className="btn-ait-primary py-1 px-3 text-[11px] font-semibold flex-1 flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" />
                    Review & Adjudicate
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Adjudicate Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-lg bg-[#0c1322] border-amber-500/30 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Adjudicate Unknown Face Detection #{activeRecord.id}
              </h3>
              <button onClick={() => setActiveRecord(null)} className="text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded bg-slate-900 border border-slate-800">
              <img
                src={activeRecord.snapshotPreview}
                alt="Thumbnail"
                className="w-14 h-14 rounded object-cover border border-slate-700 shrink-0"
              />
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-slate-200">{activeRecord.locationName}</div>
                <div className="text-slate-400 font-mono text-[10px]">{activeRecord.timestamp}</div>
                <div className="text-slate-400 text-[11px]">{activeRecord.notes}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Option A: Assign to Enrolled Student</label>
                <input
                  type="text"
                  placeholder="Search student name or enrollment number..."
                  value={assignStudentSearch}
                  onChange={(e) => setAssignStudentSearch(e.target.value)}
                  className="input-ait w-full py-1.5"
                />

                {searchedStudents.length > 0 && (
                  <div className="mt-1.5 rounded bg-slate-950 border border-slate-800 divide-y divide-slate-850">
                    {searchedStudents.map(s => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={`p-2 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors ${
                          selectedStudent?.id === s.id ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{s.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{s.enrollmentNo} • {s.branch}</div>
                        </div>
                        {selectedStudent?.id === s.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Adjudication Notes / Justification</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Student confirmed present in seat; face was partially turned away from camera lens."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-slate-800">
                <button
                  disabled={!selectedStudent}
                  onClick={() => handleResolve('IDENTIFIED', selectedStudent!)}
                  className="btn-ait-primary py-2 px-3 text-xs flex-1 disabled:opacity-40"
                >
                  Assign to Selected Student
                </button>

                <button
                  onClick={() => handleResolve('DISMISSED_VISITOR')}
                  className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Dismiss as Guest
                </button>

                <button
                  onClick={() => handleResolve('FLAGGED_ALERT')}
                  className="px-3 py-2 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold"
                >
                  Flag Security Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
