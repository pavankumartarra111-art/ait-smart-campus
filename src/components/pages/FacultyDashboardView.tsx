import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  CheckCircle, 
  Edit3, 
  Download, 
  Save, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  UserCheck,
  X
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { FacultyAssessmentReport, User } from '../../types/campus';

interface FacultyDashboardViewProps {
  currentUser: User;
}

export const FacultyDashboardView: React.FC<FacultyDashboardViewProps> = ({ currentUser }) => {
  const [reports, setReports] = useState<FacultyAssessmentReport[]>(campusStore.getFacultyReports());
  const allSubjects = campusStore.getSubjects();

  // Role filtering: If current user is faculty, show their assigned subjects
  const isSuperOrCampusAdmin = currentUser.role === 'super_admin' || currentUser.role === 'campus_admin';
  const assignedSubjects = isSuperOrCampusAdmin
    ? allSubjects
    : allSubjects.filter(s => s.facultyId === currentUser.id || s.facultyName.includes(currentUser.name));

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    assignedSubjects[0]?.id || 'sub-cse-401'
  );

  const [editingReport, setEditingReport] = useState<FacultyAssessmentReport | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    return campusStore.subscribe(() => {
      setReports(campusStore.getFacultyReports());
    });
  }, []);

  const currentSubject = allSubjects.find(s => s.id === selectedSubjectId) || allSubjects[0];
  const subjectReports = reports.filter(r => r.subjectId === selectedSubjectId || r.subjectName === currentSubject?.name);

  const handleOpenEditMarks = (report: FacultyAssessmentReport) => {
    setEditingReport({ ...report });
    setSaveSuccess(false);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    const total = Number(editingReport.internalTest1 || 0) + 
                  Number(editingReport.internalTest2 || 0) + 
                  Number(editingReport.assignmentScore || 0) + 
                  Number(editingReport.attendanceScore || 0);

    const enriched: FacultyAssessmentReport = {
      ...editingReport,
      totalScore: total,
      facultyId: currentUser.id,
      facultyName: currentUser.name
    };

    campusStore.saveFacultyReport(enriched);
    setSaveSuccess(true);
    setTimeout(() => {
      setEditingReport(null);
      setSaveSuccess(false);
    }, 700);
  };

  const handleExportClassCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Subject', 'Faculty', 'Test 1 (30)', 'Test 2 (30)', 'Assignment (20)', 'Attendance (20)', 'Total (100)', 'Academic Remarks', 'Follow Up Required', 'Last Updated'];
    const rows = subjectReports.map(r => [
      r.studentId,
      `"${r.studentName}"`,
      `"${r.subjectName}"`,
      `"${r.facultyName}"`,
      r.internalTest1,
      r.internalTest2,
      r.assignmentScore,
      r.attendanceScore,
      r.totalScore,
      `"${r.academicRemarks.replace(/"/g, '""')}"`,
      r.followUpRequired ? 'YES' : 'NO',
      `"${r.lastUpdated}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Faculty_Gradebook_${currentSubject?.code || 'Class'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    campusStore.logAudit('EXPORT_CSV', 'Faculty Dashboard', `Exported gradebook for ${currentSubject?.code}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Context Header */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              FACULTY ASSESSMENT CONSOLE
            </span>
            <span className="text-xs font-mono text-slate-400">
              {currentUser.name} ({currentUser.department || 'AIT Pune'})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Student Academic Reports & Continuous Assessment
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-restricted access: Enter internal assessment marks, assignments, academic remarks, and review temporal attendance.
          </p>
        </div>

        <button
          onClick={handleExportClassCSV}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Class Gradebook</span>
        </button>
      </div>

      {/* Assigned Subjects Ribbon */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold px-1 shrink-0">Your Assigned Course:</span>
        {assignedSubjects.map(sub => {
          const isSelected = sub.id === selectedSubjectId;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span className="font-mono font-bold text-amber-400">{sub.code}</span>
              <span>{sub.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({sub.branch})</span>
            </button>
          );
        })}
      </div>

      {/* Gradebook Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Test 1 (30)</th>
                <th className="py-3 px-4">Test 2 (30)</th>
                <th className="py-3 px-4">Assignment (20)</th>
                <th className="py-3 px-4">Attendance (20)</th>
                <th className="py-3 px-4">Total (100)</th>
                <th className="py-3 px-4 min-w-[200px]">Academic Remarks</th>
                <th className="py-3 px-4">Follow-Up</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {subjectReports.map(rep => (
                <tr key={rep.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    <div>{rep.studentName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Updated: {rep.lastUpdated}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-200">{rep.internalTest1} / 30</td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">{rep.internalTest2} / 30</td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">{rep.assignmentScore} / 20</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{rep.attendanceScore} / 20</td>
                  
                  <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-amber-400">
                    {rep.totalScore}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 italic text-[11px]">
                    "{rep.academicRemarks}"
                  </td>

                  <td className="py-3.5 px-4">
                    {rep.followUpRequired ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        REMEDIAL NEEDED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">Normal</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEditMarks(rep)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 border border-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Marks</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Marks / Progress Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1522] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Enter Student Assessment: {editingReport.studentName}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{currentSubject?.code} • {currentSubject?.name}</p>
              </div>
              <button onClick={() => setEditingReport(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Test 1 (Max 30)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={editingReport.internalTest1}
                    onChange={(e) => setEditingReport({ ...editingReport, internalTest1: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Test 2 (Max 30)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={editingReport.internalTest2}
                    onChange={(e) => setEditingReport({ ...editingReport, internalTest2: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assignments (Max 20)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={editingReport.assignmentScore}
                    onChange={(e) => setEditingReport({ ...editingReport, assignmentScore: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Attendance Score (Max 20)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={editingReport.attendanceScore}
                    onChange={(e) => setEditingReport({ ...editingReport, attendanceScore: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Faculty Progress Remarks</label>
                <textarea
                  rows={3}
                  value={editingReport.academicRemarks}
                  onChange={(e) => setEditingReport({ ...editingReport, academicRemarks: e.target.value })}
                  placeholder="e.g. Good progress on laboratory assignments..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remedialCheckbox"
                  checked={editingReport.followUpRequired}
                  onChange={(e) => setEditingReport({ ...editingReport, followUpRequired: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950"
                />
                <label htmlFor="remedialCheckbox" className="text-slate-300 font-medium cursor-pointer">
                  Flag student for remedial follow-up & mentoring
                </label>
              </div>

              {saveSuccess && (
                <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Assessment record updated and audit logged!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/30"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
