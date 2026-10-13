import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DoorOpen, 
  DoorClosed, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit3, 
  Camera, 
  ScanFace, 
  MapPin, 
  UserCheck, 
  ShieldAlert,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { 
  HostelBuilding, 
  HostelResident, 
  HostelEventLog, 
  HostelEventState,
  UnknownFaceRecord 
} from '../../types/campus';

export const BoysHostelView: React.FC = () => {
  const [currentUser] = useState(campusStore.getCurrentUser());
  const [buildings, setBuildings] = useState<HostelBuilding[]>(campusStore.getHostelBuildings().filter(b => b.type === 'boys'));
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('hb-01');
  const [residents, setResidents] = useState<HostelResident[]>(campusStore.getHostelResidents('boys'));
  const [eventLogs, setEventLogs] = useState<HostelEventLog[]>(campusStore.getHostelEvents('boys'));
  const [unknownFaces, setUnknownFaces] = useState<UnknownFaceRecord[]>(campusStore.getUnknownFaces('boys_hostel'));

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT_IN_HOSTEL' | 'ATTENDING_CLASSES' | 'OUTSIDE_CAMPUS'>('ALL');
  const [dateFilter, setDateFilter] = useState('2026-10-13');

  // Manual Event Correction Modal
  const [editingEvent, setEditingEvent] = useState<HostelEventLog | null>(null);
  const [correctionState, setCorrectionState] = useState<HostelEventState>('ENTRY_EVENT_VERIFIED');
  const [correctionReason, setCorrectionReason] = useState('');

  // Live Camera Monitoring Mode at Entrance Turnstile
  const [isEntranceCamActive, setIsEntranceCamActive] = useState(false);
  const [lastTurnstileEvent, setLastTurnstileEvent] = useState<string>('Turnstile Camera AIT-CAM-BH01 Armed');

  useEffect(() => {
    return campusStore.subscribe(() => {
      setBuildings(campusStore.getHostelBuildings().filter(b => b.type === 'boys'));
      setResidents(campusStore.getHostelResidents('boys'));
      setEventLogs(campusStore.getHostelEvents('boys'));
      setUnknownFaces(campusStore.getUnknownFaces('boys_hostel'));
    });
  }, []);

  const activeBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];

  // Filter residents
  const filteredResidents = residents.filter(r => {
    const matchesBuilding = r.buildingId === selectedBuildingId;
    const matchesStatus = statusFilter === 'ALL' || r.currentStatus === statusFilter;
    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBuilding && matchesStatus && matchesSearch;
  });

  // Daily Presence Summary
  const totalAllocated = residents.filter(r => r.buildingId === selectedBuildingId).length;
  const inHostelCount = residents.filter(r => r.buildingId === selectedBuildingId && r.currentStatus === 'PRESENT_IN_HOSTEL').length;
  const inClassesCount = residents.filter(r => r.buildingId === selectedBuildingId && r.currentStatus === 'ATTENDING_CLASSES').length;
  const outsideCount = residents.filter(r => r.buildingId === selectedBuildingId && r.currentStatus === 'OUTSIDE_CAMPUS').length;
  const reviewRequiredEventsCount = eventLogs.filter(e => e.reviewRequired || e.state === 'REVIEW_REQUIRED').length;

  // Simulate turnstile observation event
  const handleSimulateTurnstilePassage = (direction: 'INWARD' | 'OUTWARD') => {
    if (residents.length === 0) return;
    const resident = residents[Math.floor(Math.random() * residents.length)];
    const eventType = direction === 'INWARD' ? 'ENTRY' : 'EXIT';
    const state = direction === 'INWARD' ? 'ENTRY_EVENT_VERIFIED' : 'EXIT_EVENT_VERIFIED';

    const newEvent = campusStore.addHostelEvent({
      hostelType: 'boys',
      buildingId: selectedBuildingId,
      locationName: activeBuilding ? activeBuilding.authorizedEntrances[0].name : 'Main Turnstile',
      cameraId: 'AIT-CAM-BH01',
      enrollmentNo: resident.enrollmentNo,
      residentName: resident.studentName,
      eventType,
      state,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      confidenceScore: Math.floor(92 + Math.random() * 7),
      verified: true,
      reviewRequired: false,
      direction
    });

    setLastTurnstileEvent(`Verified ${direction} passage for ${resident.studentName} (${resident.enrollmentNo}) [Turnstile Cam BH01]`);
    setEventLogs(campusStore.getHostelEvents('boys'));
    setResidents(campusStore.getHostelResidents('boys'));
  };

  // Correct Event
  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !correctionReason.trim()) return;

    campusStore.correctHostelEvent(
      editingEvent.id,
      correctionReason.trim(),
      correctionState,
      true
    );

    setEditingEvent(null);
    setCorrectionReason('');
    setEventLogs(campusStore.getHostelEvents('boys'));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="card-ait p-5 border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-ait bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Building2 className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
                Boys' Hostel Administration
              </span>
              <span className="text-xs font-mono text-slate-400">
                Warden: {activeBuilding?.wardenName || 'Major Anil Rathore (Retd.)'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight font-serif">
              Boys' Hostel Presence & Turnstile Monitoring
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Biometric camera monitoring strictly enforced at approved perimeter turnstiles and foyer gates. <span className="text-amber-300 font-semibold">Zero surveillance inside bedrooms or private quarters.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => campusStore.exportHostelEventsCSV('boys')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Export Access Logs (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Building Selector & Controls Bar */}
      <div className="card-ait p-4 bg-slate-900/80 border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Select Hostel Facility:</span>
          {buildings.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBuildingId(b.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedBuildingId === b.id
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold shadow-md shadow-blue-950/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {b.name} ({b.currentOccupancy}/{b.totalCapacity})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateTurnstilePassage('INWARD')}
            className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 shadow"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            Simulate Entry Turnstile Event
          </button>
          <button
            onClick={() => handleSimulateTurnstilePassage('OUTWARD')}
            className="px-2.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px] flex items-center gap-1 shadow"
          >
            <DoorClosed className="w-3.5 h-3.5" />
            Simulate Exit Turnstile Event
          </button>
        </div>
      </div>

      {/* Presence KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-ait p-4 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-mono mb-1">Total Allocated Residents</div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalAllocated}</div>
          <div className="text-[11px] text-slate-500 mt-1">Authorized room allotments</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60 border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-mono mb-1 flex items-center gap-1">
            <DoorOpen className="w-3.5 h-3.5" />
            Currently In Hostel
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{inHostelCount}</div>
          <div className="text-[11px] text-emerald-500 mt-1">Verified inward observation</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60 border-cyan-500/30">
          <div className="text-xs text-cyan-400 font-mono mb-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Attending Academic Lectures
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">{inClassesCount}</div>
          <div className="text-[11px] text-cyan-500 mt-1">In Ramanujan / Academic blocks</div>
        </div>

        <div className="card-ait p-4 bg-slate-900/60 border-amber-500/30">
          <div className="text-xs text-amber-400 font-mono mb-1 flex items-center gap-1">
            <DoorClosed className="w-3.5 h-3.5" />
            Outside Campus / Sports Grounds
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">{outsideCount}</div>
          <div className="text-[11px] text-amber-500 mt-1">Authorized egress</div>
        </div>
      </div>

      {/* Approved Camera Entrance Frustums (No private quarters banner) */}
      <div className="card-ait p-4 bg-slate-900/40 border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            Approved Entrance Turnstiles & Common Foyer Cameras ({activeBuilding?.name})
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            Privacy Filter Active • Public Areas Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {activeBuilding?.authorizedEntrances.map(ent => (
            <div key={ent.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">{ent.name}</div>
                <div className="text-[11px] font-mono text-cyan-400">{ent.cameraCode} • {ent.locationType}</div>
              </div>
              <span className="badge-ait bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px]">
                ACTIVE FEED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Tabs: Resident Roster & Entry/Exit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Residents Ledger */}
        <div className="lg:col-span-2 card-ait overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-serif">
                Authorized Resident Roster ({activeBuilding?.name})
              </h3>
              <p className="text-xs text-slate-400">
                Linked to central student database. No duplicate identities.
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="select-ait py-1 text-xs"
              >
                <option value="ALL">All States</option>
                <option value="PRESENT_IN_HOSTEL">In Hostel Only</option>
                <option value="ATTENDING_CLASSES">In Classes Only</option>
                <option value="OUTSIDE_CAMPUS">Outside Campus</option>
              </select>

              <input
                type="text"
                placeholder="Search room, name, enrollment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-ait py-1 text-xs w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Room & Block</th>
                  <th className="py-3 px-4">Academic Program</th>
                  <th className="py-3 px-4">Biometric Status</th>
                  <th className="py-3 px-4">Current Presence State</th>
                  <th className="py-3 px-4">Last Turnstile Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500">
                      No residents found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map(r => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{r.studentName}</div>
                        <div className="text-[10px] text-amber-300 font-mono">{r.enrollmentNo}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-300 font-mono">{r.roomNumber}</div>
                        <div className="text-[10px] text-slate-400">{r.blockName} (Fl {r.floorNumber})</div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div>{r.academicDetails.program} - Year {r.academicDetails.year}</div>
                        <div className="text-[10px] text-slate-400">{r.academicDetails.branch}</div>
                      </td>

                      <td className="py-3 px-4">
                        {r.faceRegistrationStatus === 'REGISTERED' ? (
                          <span className="badge-ait bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Registered
                          </span>
                        ) : (
                          <span className="badge-ait bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Unregistered
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {r.currentStatus === 'PRESENT_IN_HOSTEL' ? (
                          <span className="badge-ait bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px]">
                            Inside Hostel
                          </span>
                        ) : r.currentStatus === 'ATTENDING_CLASSES' ? (
                          <span className="badge-ait bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px]">
                            Attending Classes
                          </span>
                        ) : (
                          <span className="badge-ait bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px]">
                            Outside Campus
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {r.lastObservedAt ? r.lastObservedAt.slice(11, 19) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Live Turnstile Observation Logs */}
        <div className="card-ait p-4 flex flex-col justify-between space-y-4 bg-slate-900/60">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-emerald-400" />
                Authorized Turnstile Event Logs
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {eventLogs.length} Events
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 mb-3">
              Timestamped biometric passage events recorded at entrance turnstiles.
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {eventLogs.map(evt => (
                <div key={evt.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold font-mono text-[10px] px-1.5 py-0.2 rounded uppercase ${
                      evt.direction === 'INWARD' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {evt.direction} • {evt.eventType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{evt.timestamp.slice(11, 19)}</span>
                  </div>

                  <div className="font-semibold text-slate-200">{evt.residentName}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{evt.enrollmentNo}</span>
                    <span className="text-cyan-400">{evt.confidenceScore}% confidence</span>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                    <span className="truncate max-w-[160px]">{evt.locationName}</span>
                    <button
                      onClick={() => {
                        setEditingEvent(evt);
                        setCorrectionState(evt.state);
                        setCorrectionReason(evt.manualCorrectionReason || '');
                      }}
                      className="text-amber-400 hover:text-amber-300 underline font-sans text-[10px]"
                    >
                      Correct Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Auditing Rule:</span> A face appearing in frame does not prove overnight presence. Absence is never inferred solely from missed detection.
          </div>
        </div>

      </div>

      {/* Manual Event Correction Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-md bg-[#0c1322] border-amber-500/30 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Correct Turnstile Event #{editingEvent.id}
              </h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono space-y-1">
                <div>Resident: <strong className="text-slate-200">{editingEvent.residentName}</strong></div>
                <div>Enrollment: <strong className="text-amber-300">{editingEvent.enrollmentNo}</strong></div>
                <div>Recorded Time: <span className="text-slate-400">{editingEvent.timestamp}</span></div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Verified State Correction *</label>
                <select
                  value={correctionState}
                  onChange={(e) => setCorrectionState(e.target.value as any)}
                  className="select-ait w-full py-1.5"
                >
                  <option value="ENTRY_EVENT_VERIFIED">Entry Event Verified</option>
                  <option value="EXIT_EVENT_VERIFIED">Exit Event Verified</option>
                  <option value="OBSERVED_AT_ENTRANCE">Observed at Entrance Only</option>
                  <option value="REVIEW_REQUIRED">Review Required / Uncertain</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Recorded Correction Justification *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Guard manual log confirmed resident entered with football kit; badge RFID lagged behind camera scanner."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-ait-primary py-1.5 px-4 font-bold"
                >
                  Save Log Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
