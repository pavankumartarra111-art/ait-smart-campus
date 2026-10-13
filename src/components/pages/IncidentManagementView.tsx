import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  MessageSquare, 
  X,
  Phone,
  Camera,
  ShieldCheck,
  Send
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { IncidentReport, User as CampusUser } from '../../types/campus';

interface IncidentManagementViewProps {
  currentUser: CampusUser;
}

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({ currentUser }) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>(campusStore.getIncidents());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || 'inc-01');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  // Add Incident Form state
  const [formData, setFormData] = useState({
    category: 'MISSING_PERSON' as any,
    title: '',
    description: '',
    location: 'Ramanujan Central Library',
    severity: 'HIGH' as any,
    status: 'INVESTIGATING' as any,
    assignedOfficer: 'Subedar Major Ramesh Gurung',
    personName: '',
    personType: 'Student' as any,
    lastKnownLocation: 'Library Ground Floor',
    lastSeenTimestamp: '2026-10-13 10:00',
    contactNumber: '+91 98230 45678'
  });

  React.useEffect(() => {
    return campusStore.subscribe(() => {
      setIncidents(campusStore.getIncidents());
    });
  }, []);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const filteredIncidents = incidents.filter(i => {
    if (categoryFilter === 'ALL') return true;
    return i.category === categoryFilter;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim() || !selectedIncident) return;

    campusStore.addInvestigationNote(selectedIncident.id, noteInput.trim());
    setNoteInput('');
  };

  const handleStatusChange = (newStatus: any) => {
    if (!selectedIncident) return;
    campusStore.updateIncidentStatus(selectedIncident.id, newStatus);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    campusStore.addIncident({
      ...formData,
      reportedBy: currentUser.name
    });

    setShowAddModal(false);
    setFormData({
      category: 'MISSING_PERSON',
      title: '',
      description: '',
      location: 'Ramanujan Central Library',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      assignedOfficer: 'Subedar Major Ramesh Gurung',
      personName: '',
      personType: 'Student',
      lastKnownLocation: 'Library Ground Floor',
      lastSeenTimestamp: '2026-10-13 10:00',
      contactNumber: '+91 98230 45678'
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Incident Dispatch Header */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-red-500/20 text-red-300 border border-red-500/30">
              CAMPUS SECURITY HQ
            </span>
            <span className="text-xs font-mono text-slate-400">
              INCIDENT RESPONSE & TIMELINE TRACE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Campus Incident & Missing Person Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified dossier management for missing cadets, unauthorized access alarms, route blockages, and safety concerns.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>File Incident Docket</span>
        </button>
      </div>

      {/* Human-in-the-Loop Privacy & Verification Guardrail Notice */}
      <div className="p-3.5 bg-slate-900/80 rounded-xl border border-amber-500/30 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-100">Human-In-The-Loop Protocol: </span>
          The system answers queries solely using authorized, time-stamped incident logs and physical security records. Automated facial recognition without consent or human officer verification is prohibited to protect student privacy.
        </div>
      </div>

      {/* Main Grid: Incident List on Left (1 col), Incident Dossier Detail on Right (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Incident Docket List */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200">Incident Registry</h3>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300"
            >
              <option value="ALL">All Categories</option>
              <option value="MISSING_PERSON">Missing Person</option>
              <option value="UNAUTHORIZED_ENTRY">Unauthorized Entry</option>
              <option value="ROUTE_BLOCKAGE">Route Blockage</option>
              <option value="CROWD_SAFETY">Crowd Safety</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredIncidents.map(inc => {
              const isSelected = inc.id === selectedIncidentId;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-amber-400 font-bold">{inc.caseNumber}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-500/30 text-red-300' :
                      inc.severity === 'HIGH' ? 'bg-orange-500/30 text-orange-300' :
                      'bg-amber-500/30 text-amber-300'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-xs truncate">{inc.title}</h4>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                    <span>{inc.location}</span>
                    <span className="text-amber-300 font-semibold">{inc.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Incident Investigation Dossier */}
        {selectedIncident && (
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
            
            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-amber-400 font-bold">{selectedIncident.caseNumber}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs font-mono text-slate-400">{selectedIncident.category.replace('_', ' ')}</span>
                </div>
                <h2 className="text-base font-bold text-slate-100">{selectedIncident.title}</h2>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Reported: {selectedIncident.reportedTime} by {selectedIncident.reportedBy}
                </div>
              </div>

              {/* Status Change Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Case Status:</span>
                <select
                  value={selectedIncident.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-amber-300 font-bold focus:outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="VERIFIED_RESOLVED">VERIFIED RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            {/* Missing Person Profile (if category is MISSING_PERSON) */}
            {selectedIncident.category === 'MISSING_PERSON' && selectedIncident.personName && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {selectedIncident.personPhoto && (
                  <img
                    src={selectedIncident.personPhoto}
                    alt={selectedIncident.personName}
                    className="w-16 h-16 rounded-xl object-cover border border-amber-500/50 shadow-md shrink-0"
                  />
                )}
                <div className="space-y-1 text-xs flex-1">
                  <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>{selectedIncident.personName}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                      {selectedIncident.personType}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Last Seen Location: <strong className="text-amber-300">{selectedIncident.lastKnownLocation}</strong>
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    Last Verified Time: {selectedIncident.lastSeenTimestamp} • Emergency Contact: {selectedIncident.contactNumber}
                  </div>
                </div>
              </div>
            )}

            {/* Description Body */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-1">
                Official Incident Narrative
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {selectedIncident.description}
              </p>
            </div>

            {/* Investigation Timeline Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Authorized Investigation Timeline ({selectedIncident.investigationNotes.length} entries)</span>
                <span className="text-[10px] text-slate-500 font-normal">Assigned: {selectedIncident.assignedOfficer}</span>
              </h4>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {selectedIncident.investigationNotes.map(n => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="font-semibold text-amber-400">{n.officer}</span>
                      <span>{n.timestamp}</span>
                    </div>
                    <div className="text-slate-200">{n.note}</div>
                  </div>
                ))}

                {selectedIncident.investigationNotes.length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-xs">
                    No field notes logged yet.
                  </div>
                )}
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Append verified officer field note to this case..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={!noteInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* File Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1522] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>File Security Incident Docket</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="MISSING_PERSON">Missing Person / Cadet</option>
                    <option value="UNAUTHORIZED_ENTRY">Unauthorized Entry</option>
                    <option value="ROUTE_BLOCKAGE">Route / Corridor Blockage</option>
                    <option value="CROWD_SAFETY">Crowd Safety Alert</option>
                    <option value="ASSISTANCE_REQ">Medical / Emergency Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unregistered vehicle tailgating at East Gate"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Campus Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Security Officer</label>
                  <input
                    type="text"
                    value={formData.assignedOfficer}
                    onChange={(e) => setFormData({ ...formData, assignedOfficer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {formData.category === 'MISSING_PERSON' && (
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="font-bold text-amber-300 text-[11px]">Missing Cadet Specifics</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Person Name"
                      value={formData.personName}
                      onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Emergency Contact Phone"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Narrative Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed chronological sequence of event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-950/40"
                >
                  File Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
