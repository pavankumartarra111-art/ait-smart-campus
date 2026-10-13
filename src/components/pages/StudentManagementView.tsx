import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  X,
  BookOpen
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { Student } from '../../types/campus';

export const StudentManagementView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(campusStore.getStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNo: '',
    rollNo: '',
    regNo: '',
    program: 'B.Tech' as 'B.Tech' | 'M.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: '',
    cgpa: 8.5,
    attendanceRate: 85.0,
    status: 'ACTIVE' as 'ACTIVE' | 'DETENTION_WARNING' | 'ON_LEAVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 00000',
    guardianPhone: '+91 94220 00000'
  });

  React.useEffect(() => {
    return campusStore.subscribe(() => {
      setStudents(campusStore.getStudents());
    });
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNo.includes(searchQuery) ||
                          (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          s.regNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    const matchesYear = yearFilter === 'ALL' || s.year.toString() === yearFilter;
    return matchesSearch && matchesBranch && matchesYear;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const randRoll = `${Math.floor(2000 + Math.random() * 3000)}`;
    setFormData({
      name: '',
      enrollmentNo: `AIT/2024/CSE/${randRoll.slice(-3)}`,
      rollNo: randRoll,
      regNo: `AIT2024${Math.floor(100 + Math.random() * 900)}`,
      program: 'B.Tech',
      branch: 'Computer Engineering',
      year: 4,
      semester: 7,
      section: 'A',
      email: '',
      cgpa: 8.2,
      attendanceRate: 88.0,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98230 12345',
      guardianPhone: '+91 94220 12345'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setFormData({
      name: s.name,
      enrollmentNo: s.enrollmentNo || s.regNo,
      rollNo: s.rollNo,
      regNo: s.regNo,
      program: s.program,
      branch: s.branch,
      year: s.year,
      semester: s.semester,
      section: s.section || 'A',
      email: s.email,
      cgpa: s.cgpa,
      attendanceRate: s.attendanceRate,
      status: s.status,
      avatar: s.avatar,
      phone: s.phone,
      guardianPhone: s.guardianPhone
    });
    setShowModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNo.trim()) return;

    const enrollmentNo = formData.enrollmentNo.trim() || `AIT/2024/${formData.branch.slice(0, 3).toUpperCase()}/${formData.rollNo}`;

    if (editingStudent) {
      campusStore.updateStudent(editingStudent.id, {
        ...formData,
        enrollmentNo
      });
    } else {
      campusStore.addStudent({
        ...formData,
        enrollmentNo,
        enrolledSubjectIds: ['sub-cse-401']
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student record?')) {
      campusStore.deleteStudent(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Actions Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ACADEMIC REGISTRY
            </span>
            <span className="text-xs font-mono text-slate-400">
              CADET ENROLMENT & PERFORMANCE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Student Management Directory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage cadet profiles, semester registration, AI verified attendance averages, and CGPA metrics.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Enrol New Student</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Branches</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Electronics & Telecommunication">Electronics & Telecom (E&TC)</option>
            <option value="Robotics & Automation">Robotics & Automation</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Information Technology">Information Technology</option>
          </select>

          {/* Year filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year (Final)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, roll no, reg no..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Students Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student Name & Roll</th>
                <th className="py-3 px-4">Program & Branch</th>
                <th className="py-3 px-4">Year / Sem</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-100">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Roll: <strong className="text-amber-400">{student.rollNo}</strong> • {student.regNo}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">{student.branch}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{student.program}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    Year {student.year} • Sem {student.semester}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {student.cgpa.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${student.attendanceRate < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${student.attendanceRate}%` }}
                        />
                      </div>
                      <span className={`font-mono text-xs font-bold ${student.attendanceRate < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {student.attendanceRate}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      student.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      student.status === 'DETENTION_WARNING' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {student.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300"
                        title="Edit Student Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400"
                        title="Delete Student Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1522] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>{editingStudent ? 'Edit Student Record' : 'Enrol New Cadet / Student'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Program</label>
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Branch / Dept</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Electronics & Telecommunication">Electronics & Telecom (E&TC)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Robotics & Automation">Robotics & Automation</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="VLSI & Embedded Systems">VLSI & Embedded Systems (M.Tech)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Year</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/30"
                >
                  {editingStudent ? 'Update Profile' : 'Save Enrolment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
