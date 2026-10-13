import { 
  User, 
  CameraLocation, 
  Student, 
  AttendanceRecord, 
  ProgramStructure, 
  Subject, 
  Classroom, 
  FacultyAssessmentReport, 
  ParkingZone, 
  CampusRoute, 
  IncidentReport, 
  AuditLog, 
  SystemSettings,
  CameraMode,
  UserRole,
  FaceTemplate,
  HostelBuilding,
  HostelResident,
  HostelEventLog,
  HostelEventState,
  UnknownFaceRecord,
  ClassroomFaceAttendanceRecord,
  CameraSession,
  HostelType,
  LostItemReport,
  FoundItemReport,
  CctvSearchRequest,
  CctvSightingRecord,
  ItemClaim,
  LostFoundMatch,
  ClaimStatus,
  CctvRequestStatus
} from '../types/campus';

import {
  INITIAL_USERS,
  INITIAL_CAMERAS,
  INITIAL_PROGRAMS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSROOMS,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_FACULTY_REPORTS,
  INITIAL_PARKING_ZONES,
  INITIAL_ROUTES,
  INITIAL_INCIDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_HOSTEL_BUILDINGS,
  INITIAL_HOSTEL_RESIDENTS,
  INITIAL_HOSTEL_EVENTS,
  INITIAL_FACE_TEMPLATES,
  INITIAL_UNKNOWN_FACES,
  INITIAL_CAMERA_SESSIONS,
  INITIAL_LOST_ITEMS,
  INITIAL_FOUND_ITEMS,
  INITIAL_CCTV_REQUESTS,
  INITIAL_CLAIMS
} from '../data/mockData';
import { faceRecognitionService } from './FaceRecognitionService';

const STORAGE_KEY_PREFIX = 'ait_smart_campus_';

class CampusStore {
  private listeners: Set<() => void> = new Set();

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
      this.notifyListeners();
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // --- CURRENT USER / SESSION ---
  public getCurrentUser(): User {
    const users = this.getUsers();
    const storedId = this.getItem<string>('current_user_id', users[0].id);
    return users.find(u => u.id === storedId) || users[0];
  }

  public setCurrentUser(userId: string): void {
    this.setItem('current_user_id', userId);
    const user = this.getUsers().find(u => u.id === userId);
    if (user) {
      this.logAudit(
        'USER_LOGIN',
        'Authentication',
        `User ${user.name} logged in with role [${user.role}]`
      );
    }
  }

  public switchRole(role: UserRole): void {
    const user = this.getUsers().find(u => u.role === role);
    if (user) {
      this.setCurrentUser(user.id);
    }
  }

  public getUsers(): User[] {
    return this.getItem<User[]>('users', INITIAL_USERS);
  }

  // --- SYSTEM SETTINGS ---
  public getSettings(): SystemSettings {
    return this.getItem<SystemSettings>('settings', INITIAL_SETTINGS);
  }

  public updateSettings(updates: Partial<SystemSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    this.setItem('settings', updated);
    this.logAudit(
      'SETTINGS_UPDATED',
      'System Settings',
      `Updated settings: ${Object.keys(updates).join(', ')}`
    );
  }

  // --- CAMERAS ---
  public getCameras(): CameraLocation[] {
    return this.getItem<CameraLocation[]>('cameras', INITIAL_CAMERAS);
  }

  public updateCamera(id: string, updates: Partial<CameraLocation>): void {
    const cameras = this.getCameras();
    const updated = cameras.map(cam => cam.id === id ? { ...cam, ...updates, lastUpdated: 'Just now' } : cam);
    this.setItem('cameras', updated);
    this.logAudit(
      'CAMERA_CONFIG_EDIT',
      'Campus Cameras',
      `Updated camera ${id} properties: ${Object.keys(updates).join(', ')}`
    );
  }

  public setCameraMode(id: string, mode: CameraMode, deviceLabel?: string): void {
    this.updateCamera(id, { mode, assignedDeviceLabel: deviceLabel });
  }

  public addCamera(camera: Omit<CameraLocation, 'id'>): void {
    const cameras = this.getCameras();
    const newCamera: CameraLocation = {
      ...camera,
      id: `cam-${Date.now()}`
    };
    this.setItem('cameras', [...cameras, newCamera]);
    this.logAudit('CAMERA_ADDED', 'Campus Cameras', `Added camera [${newCamera.cameraCode}] ${newCamera.name}`);
  }

  public deleteCamera(id: string): void {
    const cameras = this.getCameras();
    const toDelete = cameras.find(c => c.id === id);
    this.setItem('cameras', cameras.filter(c => c.id !== id));
    this.logAudit('CAMERA_DELETED', 'Campus Cameras', `Deleted camera ${toDelete?.cameraCode || id}`);
  }

  // --- ATTENDANCE ---
  public getAttendanceRecords(): AttendanceRecord[] {
    return this.getItem<AttendanceRecord[]>('attendance_records', INITIAL_ATTENDANCE_RECORDS);
  }

  public correctAttendance(
    recordId: string, 
    newStatus: 'FULL_ATTENDANCE' | 'BELOW_THRESHOLD' | 'ABSENT',
    reason: string
  ): void {
    const records = this.getAttendanceRecords();
    const user = this.getCurrentUser();
    const updated = records.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          status: newStatus,
          isManuallyCorrected: true,
          correctionReason: reason,
          correctedBy: user.name,
          correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return rec;
    });
    this.setItem('attendance_records', updated);
    this.logAudit(
      'ATTENDANCE_OVERRIDE',
      'Classroom Attendance',
      `Manual status correction to [${newStatus}] for record ${recordId}. Reason: "${reason}"`
    );
  }

  public updateAttendanceTimeline(recordId: string, minuteIndex: number, isPresent: boolean): void {
    const records = this.getAttendanceRecords();
    const settings = this.getSettings();
    const threshold = settings.minimumAttendanceThresholdMinutes;

    const updated = records.map(rec => {
      if (rec.id === recordId) {
        const newTimeline = [...rec.timeline];
        newTimeline[minuteIndex] = isPresent ? 1 : 0;
        const presentMinutes = newTimeline.filter(m => m === 1).length;
        const newStatus = presentMinutes >= threshold ? 'FULL_ATTENDANCE' : presentMinutes > 0 ? 'BELOW_THRESHOLD' : 'ABSENT';

        return {
          ...rec,
          timeline: newTimeline,
          verifiedPresenceMinutes: presentMinutes,
          status: rec.isManuallyCorrected ? rec.status : newStatus
        };
      }
      return rec;
    });
    this.setItem('attendance_records', updated);
  }

  // --- ACADEMICS & CURRICULUM ---
  public getPrograms(): ProgramStructure[] {
    return this.getItem<ProgramStructure[]>('programs', INITIAL_PROGRAMS);
  }

  public addProgram(program: ProgramStructure): void {
    const progs = this.getPrograms();
    this.setItem('programs', [...progs, program]);
    this.logAudit('PROGRAM_CREATED', 'Academic Management', `Created academic program: ${program.name}`);
  }

  public addBranchToProgram(programId: string, branch: { id: string; name: string; code: string; hod: string }): void {
    const progs = this.getPrograms();
    const updated = progs.map(p => {
      if (p.id === programId) {
        return { ...p, branches: [...p.branches, branch] };
      }
      return p;
    });
    this.setItem('programs', updated);
    this.logAudit('BRANCH_CREATED', 'Academic Management', `Added branch [${branch.code}] ${branch.name} to ${programId}`);
  }

  public getSubjects(): Subject[] {
    return this.getItem<Subject[]>('subjects', INITIAL_SUBJECTS);
  }

  public addSubject(subject: Omit<Subject, 'id'>): void {
    const subjects = this.getSubjects();
    const newSubject: Subject = { ...subject, id: `sub-${Date.now()}` };
    this.setItem('subjects', [...subjects, newSubject]);
    this.logAudit('SUBJECT_CREATED', 'Academic Management', `Added subject [${newSubject.code}] ${newSubject.name}`);
  }

  public updateSubject(id: string, updates: Partial<Subject>): void {
    const subjects = this.getSubjects();
    this.setItem('subjects', subjects.map(s => s.id === id ? { ...s, ...updates } : s));
    this.logAudit('SUBJECT_UPDATED', 'Academic Management', `Updated subject ${id}`);
  }

  public deleteSubject(id: string): void {
    const subjects = this.getSubjects();
    this.setItem('subjects', subjects.filter(s => s.id !== id));
    this.logAudit('SUBJECT_DELETED', 'Academic Management', `Deleted subject ${id}`);
  }

  public getClassrooms(): Classroom[] {
    return this.getItem<Classroom[]>('classrooms', INITIAL_CLASSROOMS);
  }

  public addClassroom(classroom: Omit<Classroom, 'id'>): void {
    const rooms = this.getClassrooms();
    const newRoom: Classroom = { ...classroom, id: `clr-${Date.now()}` };
    this.setItem('classrooms', [...rooms, newRoom]);
    this.logAudit('CLASSROOM_CREATED', 'Academic Management', `Added room ${newRoom.roomNumber}`);
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return this.getItem<Student[]>('students', INITIAL_STUDENTS);
  }

  public addStudent(student: Omit<Student, 'id'>): void {
    const students = this.getStudents();
    const newStudent: Student = { ...student, id: `stu-${Date.now()}` };
    this.setItem('students', [...students, newStudent]);
    this.logAudit('STUDENT_ENROLLED', 'Student Directory', `Enrolled student [${newStudent.rollNo}] ${newStudent.name}`);
  }

  public updateStudent(id: string, updates: Partial<Student>): void {
    const students = this.getStudents();
    this.setItem('students', students.map(s => s.id === id ? { ...s, ...updates } : s));
    this.logAudit('STUDENT_UPDATED', 'Student Directory', `Updated student profile ${id}`);
  }

  public deleteStudent(id: string): void {
    const students = this.getStudents();
    this.setItem('students', students.filter(s => s.id !== id));
    this.logAudit('STUDENT_DELETED', 'Student Directory', `Deleted student record ${id}`);
  }

  // --- FACULTY REPORTS ---
  public getFacultyReports(): FacultyAssessmentReport[] {
    return this.getItem<FacultyAssessmentReport[]>('faculty_reports', INITIAL_FACULTY_REPORTS);
  }

  public saveFacultyReport(report: FacultyAssessmentReport): void {
    const reports = this.getFacultyReports();
    const existingIndex = reports.findIndex(r => r.id === report.id);
    const user = this.getCurrentUser();
    const enriched = {
      ...report,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedBy: user.name
    };

    let updated: FacultyAssessmentReport[];
    if (existingIndex >= 0) {
      updated = [...reports];
      updated[existingIndex] = enriched;
    } else {
      updated = [...reports, enriched];
    }
    this.setItem('faculty_reports', updated);
    this.logAudit(
      'FACULTY_REPORT_SAVED',
      'Faculty Dashboard',
      `Assessment marks and remarks saved for ${enriched.studentName} in ${enriched.subjectName}`
    );
  }

  // --- PARKING ---
  public getParkingZones(): ParkingZone[] {
    return this.getItem<ParkingZone[]>('parking_zones', INITIAL_PARKING_ZONES);
  }

  public toggleParkingSlot(zoneId: string, slotId: string): void {
    const zones = this.getParkingZones();
    const updated = zones.map(zone => {
      if (zone.id === zoneId) {
        const updatedVehicles = zone.vehicles.map(v => {
          if (v.id === slotId) {
            const nextState = !v.isOccupied;
            return {
              ...v,
              isOccupied: nextState,
              entryTime: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
            };
          }
          return v;
        });
        const occupiedCount = updatedVehicles.filter(v => v.isOccupied).length;
        return {
          ...zone,
          occupiedSpaces: occupiedCount,
          vehicles: updatedVehicles
        };
      }
      return zone;
    });
    this.setItem('parking_zones', updated);
  }

  public simulateVehicleEvent(zoneId: string, type: 'ENTRY' | 'EXIT'): void {
    const zones = this.getParkingZones();
    const updated = zones.map(z => {
      if (z.id === zoneId) {
        let newOccupied = z.occupiedSpaces;
        if (type === 'ENTRY' && newOccupied < z.totalSpaces) newOccupied++;
        if (type === 'EXIT' && newOccupied > 0) newOccupied--;
        return {
          ...z,
          occupiedSpaces: newOccupied,
          vehiclesEnteringPerHour: type === 'ENTRY' ? z.vehiclesEnteringPerHour + 1 : z.vehiclesEnteringPerHour,
          vehiclesExitingPerHour: type === 'EXIT' ? z.vehiclesExitingPerHour + 1 : z.vehiclesExitingPerHour
        };
      }
      return z;
    });
    this.setItem('parking_zones', updated);
    this.logAudit(
      'PARKING_EVENT_SIM',
      'Parking Monitoring',
      `Simulated vehicle ${type} in zone ${zoneId}`
    );
  }

  // --- ROUTES ---
  public getRoutes(): CampusRoute[] {
    return this.getItem<CampusRoute[]>('campus_routes', INITIAL_ROUTES);
  }

  public updateRouteStatus(routeId: string, status: 'CLEAR' | 'BUSY' | 'BLOCKED', hazards?: string): void {
    const routes = this.getRoutes();
    const updated = routes.map(r => r.id === routeId ? { ...r, status, activeHazards: hazards } : r);
    this.setItem('campus_routes', updated);
    this.logAudit(
      'ROUTE_STATUS_UPDATE',
      'Route Management',
      `Route ${routeId} status changed to [${status}]. Hazards: ${hazards || 'None'}`
    );
  }

  // --- INCIDENTS ---
  public getIncidents(): IncidentReport[] {
    return this.getItem<IncidentReport[]>('incidents', INITIAL_INCIDENTS);
  }

  public addIncident(incident: Omit<IncidentReport, 'id' | 'caseNumber' | 'reportedTime' | 'investigationNotes'>): void {
    const incidents = this.getIncidents();
    const newIncident: IncidentReport = {
      ...incident,
      id: `inc-${Date.now()}`,
      caseNumber: `AIT-INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      reportedTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      investigationNotes: []
    };
    this.setItem('incidents', [newIncident, ...incidents]);
    this.logAudit(
      'INCIDENT_REPORTED',
      'Incident Management',
      `New incident report filed [${newIncident.caseNumber}]: ${newIncident.title}`
    );
  }

  public addInvestigationNote(incidentId: string, noteText: string): void {
    const incidents = this.getIncidents();
    const user = this.getCurrentUser();
    const updated = incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          investigationNotes: [
            ...inc.investigationNotes,
            {
              id: `note-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              officer: user.name,
              note: noteText
            }
          ]
        };
      }
      return inc;
    });
    this.setItem('incidents', updated);
    this.logAudit(
      'INVESTIGATION_NOTE_ADDED',
      'Incident Management',
      `Added official note to case ${incidentId}: "${noteText.substring(0, 40)}..."`
    );
  }

  public updateIncidentStatus(incidentId: string, status: 'OPEN' | 'INVESTIGATING' | 'VERIFIED_RESOLVED' | 'CLOSED'): void {
    const incidents = this.getIncidents();
    const updated = incidents.map(inc => inc.id === incidentId ? { ...inc, status } : inc);
    this.setItem('incidents', updated);
    this.logAudit(
      'INCIDENT_STATUS_CHANGE',
      'Incident Management',
      `Incident ${incidentId} status updated to [${status}]`
    );
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }

  public logAudit(action: string, module: string, details: string): void {
    const user = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      module,
      details,
      ipAddress: '192.168.1.100'
    };
    const logs = this.getAuditLogs();
    this.setItem('audit_logs', [newLog, ...logs.slice(0, 200)]); // keep last 200
  }

  // --- CSV EXPORT HELPERS ---
  public exportAttendanceCSV(): void {
    const records = this.getAttendanceRecords();
    const headers = ['Record ID', 'Roll No', 'Student Name', 'Subject Code', 'Subject Name', 'Date', 'Period', 'Presence (Mins)', 'Threshold', 'Status', 'Manually Corrected', 'Reason', 'Corrected By'];
    const rows = records.map(r => [
      r.id,
      r.rollNo,
      `"${r.studentName}"`,
      r.subjectCode,
      `"${r.subjectName}"`,
      r.date,
      r.period,
      r.verifiedPresenceMinutes,
      r.thresholdMinutes,
      r.status,
      r.isManuallyCorrected ? 'YES' : 'NO',
      `"${r.correctionReason || ''}"`,
      `"${r.correctedBy || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIT_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.logAudit('EXPORT_CSV', 'Classroom Attendance', 'Exported attendance records to CSV file.');
  }

  public exportAuditLogsCSV(): void {
    const logs = this.getAuditLogs();
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Details', 'IP Address'];
    const rows = logs.map(l => [
      l.timestamp,
      `"${l.userName}"`,
      l.role,
      l.action,
      l.module,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIT_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.logAudit('EXPORT_CSV', 'Audit Logs', 'Exported full system audit trail to CSV file.');
  }

  // --- FACE TEMPLATES (PROTECTED BIOMETRIC STORE) ---
  public getFaceTemplates(): FaceTemplate[] {
    return this.getItem<FaceTemplate[]>('face_templates_secure', INITIAL_FACE_TEMPLATES);
  }

  public getFaceTemplateByEnrollment(enrollmentNo: string): FaceTemplate | undefined {
    return this.getFaceTemplates().find(t => t.enrollmentNo === enrollmentNo);
  }

  public saveFaceTemplate(data: {
    enrollmentNo: string;
    studentId: string;
    studentName: string;
    program: string;
    branch: string;
    year: number;
    section: string;
    descriptor: number[];
    descriptorConfidence: number;
    sampleQuality: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR';
    photoPreview?: string;
    consentSigned: boolean;
  }): FaceTemplate {
    const templates = this.getFaceTemplates();
    const existingIndex = templates.findIndex(t => t.enrollmentNo === data.enrollmentNo);
    const currentUser = this.getCurrentUser();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const template: FaceTemplate = {
      id: existingIndex >= 0 ? templates[existingIndex].id : `tmpl-${Date.now()}`,
      ...data,
      registeredAt: timestamp,
      registeredBy: currentUser.name,
      consentTimestamp: timestamp,
      status: 'REGISTERED',
      version: existingIndex >= 0 ? templates[existingIndex].version + 1 : 1
    };

    let updated: FaceTemplate[];
    if (existingIndex >= 0) {
      updated = [...templates];
      updated[existingIndex] = template;
    } else {
      updated = [...templates, template];
    }
    this.setItem('face_templates_secure', updated);

    // Immediately synchronize FaceRecognitionEngine cache for live camera sessions
    faceRecognitionService.setTemplates(updated);

    // Update student's status
    this.updateStudent(data.studentId, {
      faceRegistrationStatus: 'REGISTERED',
      faceRegisteredAt: timestamp
    });

    // Update hostel resident if allocated
    const residents = this.getHostelResidents();
    const res = residents.find(r => r.enrollmentNo === data.enrollmentNo);
    if (res) {
      this.updateHostelResident(res.id, { faceRegistrationStatus: 'REGISTERED' });
    }

    this.logAudit(
      'FACE_REGISTRATION_SAVED',
      'Face Registration',
      `Registered face embedding (vector length: ${data.descriptor.length}, quality: ${data.sampleQuality}) for ${data.studentName} [${data.enrollmentNo}] with verified consent`
    );

    return template;
  }

  public deleteFaceTemplate(enrollmentNo: string, reason: string): void {
    const templates = this.getFaceTemplates();
    const target = templates.find(t => t.enrollmentNo === enrollmentNo);
    const updated = templates.filter(t => t.enrollmentNo !== enrollmentNo);
    this.setItem('face_templates_secure', updated);
    faceRecognitionService.setTemplates(updated);

    if (target) {
      this.updateStudent(target.studentId, {
        faceRegistrationStatus: 'UNREGISTERED',
        faceRegisteredAt: undefined
      });
      const residents = this.getHostelResidents();
      const res = residents.find(r => r.enrollmentNo === enrollmentNo);
      if (res) {
        this.updateHostelResident(res.id, { faceRegistrationStatus: 'UNREGISTERED' });
      }
    }

    this.logAudit(
      'FACE_TEMPLATE_PURGED',
      'Face Registration',
      `Purged biometric template for enrollment ${enrollmentNo}. Reason: ${reason}`
    );
  }

  // --- HOSTEL MANAGEMENT ---
  public getHostelBuildings(): HostelBuilding[] {
    const buildings = this.getItem<HostelBuilding[]>('hostel_buildings', INITIAL_HOSTEL_BUILDINGS);
    const user = this.getCurrentUser();
    
    if (user.role === 'girls_hostel_warden') {
      return buildings.filter(b => b.type === 'girls');
    }
    if (user.role === 'boys_hostel_warden') {
      return buildings.filter(b => b.type === 'boys');
    }
    return buildings;
  }

  public getHostelResidents(hostelType?: HostelType): HostelResident[] {
    const residents = this.getItem<HostelResident[]>('hostel_residents', INITIAL_HOSTEL_RESIDENTS);
    const user = this.getCurrentUser();

    // Strict role-based privacy check
    if (user.role === 'girls_hostel_warden') {
      return residents.filter(r => r.hostelType === 'girls');
    }
    if (user.role === 'boys_hostel_warden') {
      return residents.filter(r => r.hostelType === 'boys');
    }
    if (user.role === 'faculty') {
      // General faculty cannot inspect girls hostel resident location history
      return [];
    }

    if (hostelType) {
      return residents.filter(r => r.hostelType === hostelType);
    }
    return residents;
  }

  public addHostelResident(resident: HostelResident): void {
    const residents = this.getItem<HostelResident[]>('hostel_residents', INITIAL_HOSTEL_RESIDENTS);
    this.setItem('hostel_residents', [...residents, resident]);
    this.logAudit(
      'HOSTEL_ALLOCATION_ADDED',
      `${resident.hostelType === 'boys' ? 'Boys' : 'Girls'} Hostel Management`,
      `Allocated room ${resident.roomNumber} (${resident.buildingName}) to student ${resident.studentName} [${resident.enrollmentNo}]`
    );
  }

  public updateHostelResident(id: string, updates: Partial<HostelResident>): void {
    const residents = this.getItem<HostelResident[]>('hostel_residents', INITIAL_HOSTEL_RESIDENTS);
    this.setItem('hostel_residents', residents.map(r => r.id === id ? { ...r, ...updates } : r));
  }

  public deleteHostelResident(id: string): void {
    const residents = this.getItem<HostelResident[]>('hostel_residents', INITIAL_HOSTEL_RESIDENTS);
    const target = residents.find(r => r.id === id);
    this.setItem('hostel_residents', residents.filter(r => r.id !== id));
    if (target) {
      this.logAudit(
        'HOSTEL_ALLOCATION_REVOKED',
        `${target.hostelType === 'boys' ? 'Boys' : 'Girls'} Hostel Management`,
        `De-allocated room for resident ${target.studentName} [${target.enrollmentNo}]`
      );
    }
  }

  public getHostelEvents(hostelType?: HostelType): HostelEventLog[] {
    const events = this.getItem<HostelEventLog[]>('hostel_events', INITIAL_HOSTEL_EVENTS);
    const user = this.getCurrentUser();

    if (user.role === 'girls_hostel_warden') {
      return events.filter(e => e.hostelType === 'girls');
    }
    if (user.role === 'boys_hostel_warden') {
      return events.filter(e => e.hostelType === 'boys');
    }
    if (user.role === 'faculty') {
      return [];
    }

    if (hostelType) {
      return events.filter(e => e.hostelType === hostelType);
    }
    return events;
  }

  public addHostelEvent(event: Omit<HostelEventLog, 'id'>): HostelEventLog {
    const events = this.getItem<HostelEventLog[]>('hostel_events', INITIAL_HOSTEL_EVENTS);
    const newEvent: HostelEventLog = {
      ...event,
      id: `he-${Date.now()}`
    };
    this.setItem('hostel_events', [newEvent, ...events]);

    // Update resident's status if verified
    if (newEvent.verified && newEvent.state !== 'REVIEW_REQUIRED') {
      const residents = this.getHostelResidents();
      const res = residents.find(r => r.enrollmentNo === newEvent.enrollmentNo);
      if (res) {
        const nextStatus = newEvent.eventType === 'ENTRY' ? 'PRESENT_IN_HOSTEL' : 'OUTSIDE_CAMPUS';
        this.updateHostelResident(res.id, {
          currentStatus: nextStatus,
          lastObservedAt: newEvent.timestamp,
          lastObservedLocation: newEvent.locationName
        });
      }
    }

    return newEvent;
  }

  public correctHostelEvent(id: string, reason: string, correctedState: HostelEventState, verified: boolean): void {
    const events = this.getItem<HostelEventLog[]>('hostel_events', INITIAL_HOSTEL_EVENTS);
    const user = this.getCurrentUser();
    const updated = events.map(e => {
      if (e.id === id) {
        return {
          ...e,
          state: correctedState,
          verified,
          reviewedBy: user.name,
          manualCorrectionReason: reason,
          reviewRequired: false
        };
      }
      return e;
    });
    this.setItem('hostel_events', updated);
    this.logAudit(
      'HOSTEL_EVENT_CORRECTED',
      'Hostel Security Audit',
      `Manual correction of event ${id} to [${correctedState}]. Reason: ${reason} (by ${user.name})`
    );
  }

  // --- UNKNOWN FACE REVIEW ---
  public getUnknownFaces(sessionType?: string): UnknownFaceRecord[] {
    const faces = this.getItem<UnknownFaceRecord[]>('unknown_faces', INITIAL_UNKNOWN_FACES);
    const user = this.getCurrentUser();

    if (user.role === 'boys_hostel_warden') {
      return faces.filter(f => f.sessionType !== 'girls_hostel');
    }
    if (user.role === 'girls_hostel_warden') {
      return faces.filter(f => f.sessionType === 'girls_hostel');
    }

    if (sessionType) {
      return faces.filter(f => f.sessionType === sessionType);
    }
    return faces;
  }

  public addUnknownFace(record: Omit<UnknownFaceRecord, 'id' | 'timestamp' | 'status'>): UnknownFaceRecord {
    const faces = this.getItem<UnknownFaceRecord[]>('unknown_faces', INITIAL_UNKNOWN_FACES);
    const newRecord: UnknownFaceRecord = {
      ...record,
      id: `unk-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'PENDING_REVIEW'
    };
    this.setItem('unknown_faces', [newRecord, ...faces]);
    return newRecord;
  }

  public resolveUnknownFace(
    id: string, 
    resolution: 'IDENTIFIED' | 'DISMISSED_VISITOR' | 'FLAGGED_ALERT',
    enrollmentNo?: string,
    studentName?: string,
    notes?: string
  ): void {
    const faces = this.getItem<UnknownFaceRecord[]>('unknown_faces', INITIAL_UNKNOWN_FACES);
    const user = this.getCurrentUser();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const updated = faces.map(f => {
      if (f.id === id) {
        return {
          ...f,
          status: resolution,
          identifiedEnrollmentNo: enrollmentNo,
          assignedStudentName: studentName,
          reviewedBy: user.name,
          reviewedAt: timestamp,
          notes: notes || f.notes
        };
      }
      return f;
    });
    this.setItem('unknown_faces', updated);
    this.logAudit(
      'UNKNOWN_FACE_RESOLVED',
      'Face Recognition Security',
      `Unknown face ${id} marked as [${resolution}] by ${user.name}. ${enrollmentNo ? `Assigned to ${enrollmentNo}` : ''}`
    );
  }

  // --- CAMERA SESSIONS ---
  public getCameraSessions(): CameraSession[] {
    return this.getItem<CameraSession[]>('camera_sessions', INITIAL_CAMERA_SESSIONS);
  }

  public createCameraSession(sessionData: Omit<CameraSession, 'id' | 'startedAt' | 'sessionToken' | 'status'>): CameraSession {
    const sessions = this.getCameraSessions();
    const newSession: CameraSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'ACTIVE',
      sessionToken: `ait-sess-${Math.random().toString(36).substring(2, 9)}`
    };
    this.setItem('camera_sessions', [newSession, ...sessions]);
    this.logAudit(
      'CAMERA_SESSION_STARTED',
      'Camera Command & Control',
      `Started ${newSession.purpose} camera session [${newSession.id}] at ${newSession.locationName}`
    );
    return newSession;
  }

  public updateCameraSession(id: string, updates: Partial<CameraSession>): void {
    const sessions = this.getCameraSessions();
    this.setItem('camera_sessions', sessions.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  public endCameraSession(id: string): void {
    const sessions = this.getCameraSessions();
    const target = sessions.find(s => s.id === id);
    if (!target) return;

    this.setItem('camera_sessions', sessions.map(s => s.id === id ? {
      ...s,
      status: 'COMPLETED',
      endedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    } : s));

    this.logAudit(
      'CAMERA_SESSION_ENDED',
      'Camera Command & Control',
      `Ended camera session [${id}] at ${target.locationName}. Recognized: ${target.recognizedCount}, Unknown: ${target.unknownDetectionsCount}`
    );
  }

  // --- CLASSROOM FACE ATTENDANCE RECORDS ---
  public getClassroomFaceRecords(sessionId: string): ClassroomFaceAttendanceRecord[] {
    const key = `face_attendance_${sessionId}`;
    return this.getItem<ClassroomFaceAttendanceRecord[]>(key, []);
  }

  public setClassroomFaceRecords(sessionId: string, records: ClassroomFaceAttendanceRecord[]): void {
    const key = `face_attendance_${sessionId}`;
    this.setItem(key, records);
  }

  public recordClassroomFaceObservation(
    sessionId: string,
    enrollmentNo: string,
    confidence: number,
    currentMinute: number = 0
  ): void {
    let records = this.getClassroomFaceRecords(sessionId);
    let existing = records.find(r => r.enrollmentNo === enrollmentNo);
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (!existing) {
      // Dynamic enrollment support: student was registered mid-session or across section
      const allStudents = this.getStudents();
      const student = allStudents.find(s => s.enrollmentNo === enrollmentNo);
      if (student) {
        existing = {
          id: `att-cr-${student.id}-${Date.now()}`,
          sessionId,
          studentId: student.id,
          enrollmentNo: student.enrollmentNo,
          studentName: student.name,
          rollNo: student.rollNo,
          program: student.program,
          branch: student.branch,
          year: student.year,
          section: student.section || 'A',
          subjectCode: 'CS-401',
          subjectName: 'Live Session Observed Attendance',
          firstVerifiedObservation: nowIso,
          latestVerifiedObservation: nowIso,
          observationIntervals: [],
          accumulatedObservedMinutes: 0,
          lectureDurationMinutes: 60,
          attendanceStatus: 'BELOW_THRESHOLD',
          reviewStatus: 'VERIFIED',
          observationsHistory: []
        };
        records = [existing, ...records];
      } else {
        return;
      }
    }

    const observationItem = {
      timestamp: nowIso,
      confidence,
      matchType: 'BIOMETRIC_MODEL' as const
    };

    const intervals = [...existing.observationIntervals];
    const lastInterval = intervals[intervals.length - 1];

    if (lastInterval && currentMinute <= lastInterval.endMinute + 2) {
      lastInterval.endMinute = Math.max(lastInterval.endMinute, currentMinute);
      lastInterval.endIso = nowIso;
      lastInterval.confidenceAverage = Math.round((lastInterval.confidenceAverage + confidence) / 2);
    } else {
      intervals.push({
        startMinute: currentMinute,
        endMinute: currentMinute,
        startIso: nowIso,
        endIso: nowIso,
        confidenceAverage: confidence
      });
    }

    let totalMinutes = 0;
    intervals.forEach(inv => {
      totalMinutes += Math.max(1, inv.endMinute - inv.startMinute + 1);
    });

    const isThresholdMet = totalMinutes >= 45;
    const newStatus = isThresholdMet ? 'FULL_ATTENDANCE' : 'BELOW_THRESHOLD';

    const updated = records.map(r => {
      if (r.enrollmentNo === enrollmentNo) {
        return {
          ...r,
          firstVerifiedObservation: r.firstVerifiedObservation || nowIso,
          latestVerifiedObservation: nowIso,
          observationIntervals: intervals,
          accumulatedObservedMinutes: totalMinutes,
          attendanceStatus: r.reviewStatus === 'FACULTY_OVERRIDDEN' ? r.attendanceStatus : newStatus,
          observationsHistory: [observationItem, ...r.observationsHistory.slice(0, 49)]
        };
      }
      return r;
    });

    this.setClassroomFaceRecords(sessionId, updated);
  }

  public overrideClassroomFaceAttendance(
    sessionId: string,
    enrollmentNo: string,
    newStatus: 'FULL_ATTENDANCE' | 'BELOW_THRESHOLD' | 'UNVERIFIED_REVIEW',
    reason: string
  ): void {
    const records = this.getClassroomFaceRecords(sessionId);
    const user = this.getCurrentUser();
    const updated = records.map(r => {
      if (r.enrollmentNo === enrollmentNo) {
        return {
          ...r,
          attendanceStatus: newStatus,
          reviewStatus: 'FACULTY_OVERRIDDEN' as const,
          overrideReason: reason,
          overriddenBy: user.name
        };
      }
      return r;
    });
    this.setClassroomFaceRecords(sessionId, updated);
    this.logAudit(
      'ATTENDANCE_OVERRIDE',
      'Classroom Attendance',
      `Faculty ${user.name} overrode attendance for ${enrollmentNo} to [${newStatus}]. Reason: ${reason}`
    );
  }

  // --- CSV EXPORTS FOR HOSTEL & CLASSROOM FACE ATTENDANCE ---
  public exportHostelEventsCSV(hostelType: HostelType): void {
    const events = this.getHostelEvents(hostelType);
    const headers = ['Timestamp', 'Hostel', 'Location', 'Enrollment No', 'Resident Name', 'Event Type', 'Direction', 'Status', 'Confidence %'];
    const rows = events.map(e => [
      e.timestamp,
      `"${e.hostelType === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}"`,
      `"${e.locationName}"`,
      `"${e.enrollmentNo}"`,
      `"${e.residentName}"`,
      e.eventType,
      e.direction,
      e.state,
      `${e.confidenceScore}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIT_${hostelType.toUpperCase()}_Hostel_Events_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.logAudit('EXPORT_CSV', 'Hostel Management', `Exported ${hostelType} hostel presence events to CSV file.`);
  }

  public exportClassroomFaceAttendanceCSV(sessionId: string): void {
    const records = this.getClassroomFaceRecords(sessionId);
    const headers = ['Enrollment No', 'Roll No', 'Student Name', 'Program', 'Branch', 'Year', 'Section', 'First Observed', 'Latest Observed', 'Observed Minutes', 'Status', 'Review Status', 'Override Reason'];
    const rows = records.map(r => [
      `"${r.enrollmentNo}"`,
      `"${r.rollNo}"`,
      `"${r.studentName}"`,
      r.program,
      `"${r.branch}"`,
      r.year,
      r.section,
      `"${r.firstVerifiedObservation || 'Never'}"`,
      `"${r.latestVerifiedObservation || 'Never'}"`,
      r.accumulatedObservedMinutes,
      r.attendanceStatus,
      r.reviewStatus,
      `"${(r.overrideReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIT_Lecture_Face_Attendance_${sessionId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.logAudit('EXPORT_CSV', 'Classroom Attendance', `Exported biometric attendance records for session ${sessionId} to CSV file.`);
  }

  // --- INTELLIGENT LOST & FOUND SYSTEM ---
  public getLostItems(): LostItemReport[] {
    return this.getItem<LostItemReport[]>('lost_items', INITIAL_LOST_ITEMS);
  }

  public getLostItemById(id: string): LostItemReport | undefined {
    return this.getLostItems().find(item => item.id === id);
  }

  public addLostItem(data: Omit<LostItemReport, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { photoUrl?: string }): LostItemReport {
    const items = this.getLostItems();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `LOST-2026-${String(items.length + 101).padStart(4, '0')}`;
    const newItem: LostItemReport = {
      ...data,
      id,
      status: 'REPORTED',
      createdAt: now,
      updatedAt: now,
      matchedFoundItemIds: []
    };
    
    // Auto-check for matches right after submission
    const foundItems = this.getFoundItems();
    const matchedIds: string[] = [];
    foundItems.forEach(found => {
      const match = this.calculateMatchScore(newItem, found);
      if (match.score >= 50) {
        matchedIds.push(found.id);
      }
    });

    if (matchedIds.length > 0) {
      newItem.status = 'POTENTIAL_MATCH_FOUND';
      newItem.matchedFoundItemIds = matchedIds;
    }

    const updated = [newItem, ...items];
    this.setItem('lost_items', updated);

    this.logAudit(
      'LOST_ITEM_REPORTED',
      'Lost & Found System',
      `Reported lost item [${newItem.id}] "${newItem.itemName}" by ${newItem.reporterName}. Found ${matchedIds.length} potential matches.`
    );

    return newItem;
  }

  public updateLostItem(id: string, updates: Partial<LostItemReport>): void {
    const items = this.getLostItems();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = items.map(item => item.id === id ? { ...item, ...updates, updatedAt: now } : item);
    this.setItem('lost_items', updated);
    this.logAudit('LOST_ITEM_UPDATED', 'Lost & Found System', `Updated lost report ${id}`);
  }

  public deleteLostItem(id: string): void {
    const items = this.getLostItems();
    this.setItem('lost_items', items.filter(item => item.id !== id));
    this.logAudit('LOST_ITEM_DELETED', 'Lost & Found System', `Removed lost item report ${id}`);
  }

  // --- FOUND ITEMS ---
  public getFoundItems(): FoundItemReport[] {
    return this.getItem<FoundItemReport[]>('found_items', INITIAL_FOUND_ITEMS);
  }

  public getFoundItemById(id: string): FoundItemReport | undefined {
    return this.getFoundItems().find(item => item.id === id);
  }

  public addFoundItem(data: Omit<FoundItemReport, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { photoUrl?: string }): FoundItemReport {
    const items = this.getFoundItems();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `FOUND-2026-${String(items.length + 201).padStart(4, '0')}`;
    const newItem: FoundItemReport = {
      ...data,
      id,
      status: 'REPORTED',
      createdAt: now,
      updatedAt: now
    };

    const updated = [newItem, ...items];
    this.setItem('found_items', updated);

    // Cross-notify any existing lost items with potential matches!
    const lostItems = this.getLostItems();
    let matchesCount = 0;
    const updatedLost = lostItems.map(lost => {
      const match = this.calculateMatchScore(lost, newItem);
      if (match.score >= 50) {
        matchesCount++;
        const currentMatches = lost.matchedFoundItemIds || [];
        return {
          ...lost,
          status: (lost.status === 'REPORTED' ? 'POTENTIAL_MATCH_FOUND' : lost.status) as any,
          matchedFoundItemIds: Array.from(new Set([...currentMatches, newItem.id]))
        };
      }
      return lost;
    });
    if (matchesCount > 0) {
      this.setItem('lost_items', updatedLost);
    }

    this.logAudit(
      'FOUND_ITEM_REPORTED',
      'Lost & Found System',
      `Reported found item [${newItem.id}] "${newItem.itemName}" by ${newItem.finderName}. Matched with ${matchesCount} open lost reports.`
    );

    return newItem;
  }

  public updateFoundItem(id: string, updates: Partial<FoundItemReport>): void {
    const items = this.getFoundItems();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = items.map(item => item.id === id ? { ...item, ...updates, updatedAt: now } : item);
    this.setItem('found_items', updated);
    this.logAudit('FOUND_ITEM_UPDATED', 'Lost & Found System', `Updated found report ${id}`);
  }

  public deleteFoundItem(id: string): void {
    const items = this.getFoundItems();
    this.setItem('found_items', items.filter(item => item.id !== id));
    this.logAudit('FOUND_ITEM_DELETED', 'Lost & Found System', `Removed found item report ${id}`);
  }

  // --- CCTV SEARCH REQUESTS ---
  public getCctvRequests(): CctvSearchRequest[] {
    return this.getItem<CctvSearchRequest[]>('cctv_requests', INITIAL_CCTV_REQUESTS);
  }

  public getCctvRequestById(id: string): CctvSearchRequest | undefined {
    return this.getCctvRequests().find(req => req.id === id);
  }

  public addCctvRequest(data: Omit<CctvSearchRequest, 'id' | 'submittedAt' | 'status' | 'sightings'>): CctvSearchRequest {
    const requests = this.getCctvRequests();
    const id = `CCTV-REQ-2026-${String(requests.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newRequest: CctvSearchRequest = {
      ...data,
      id,
      status: 'Submitted',
      submittedAt: now,
      sightings: []
    };

    const updated = [newRequest, ...requests];
    this.setItem('cctv_requests', updated);

    // Update associated lost item status
    this.updateLostItem(data.lostReportId, {
      status: 'CCTV_REQUESTED',
      cctvRequestId: id
    });

    this.logAudit(
      'CCTV_SEARCH_REQUESTED',
      'CCTV Surveillance Access',
      `Requested CCTV review [${id}] for item "${data.itemName}" on camera [${data.preferredCameraCode}] by ${data.requesterName}. Purpose: "${data.purpose}"`
    );

    return newRequest;
  }

  public updateCctvRequest(id: string, updates: Partial<CctvSearchRequest>): void {
    const requests = this.getCctvRequests();
    const updated = requests.map(req => req.id === id ? { ...req, ...updates } : req);
    this.setItem('cctv_requests', updated);
  }

  public approveCctvRequest(
    id: string,
    approvedBy: string,
    reason: string,
    approvedStart?: string,
    approvedEnd?: string
  ): void {
    const requests = this.getCctvRequests();
    const target = requests.find(r => r.id === id);
    if (!target) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    const updated = requests.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Footage Available' as CctvRequestStatus,
          reviewedBy: approvedBy,
          reviewedAt: now,
          reviewDecisionReason: reason,
          approvedStartTime: approvedStart || req.requestedStartTime,
          approvedEndTime: approvedEnd || req.requestedEndTime,
          accessExpiresAt: expires,
          sampleVideoUrl: req.sampleVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        };
      }
      return req;
    });

    this.setItem('cctv_requests', updated);
    this.updateLostItem(target.lostReportId, { status: 'CCTV_SEARCHING' });

    this.logAudit(
      'CCTV_REQUEST_APPROVED',
      'CCTV Surveillance Access',
      `Approved CCTV access [${id}] by ${approvedBy}. Reason: "${reason}". Permitted window: ${approvedStart || target.requestedStartTime} - ${approvedEnd || target.requestedEndTime}`
    );
  }

  public rejectCctvRequest(id: string, rejectedBy: string, reason: string): void {
    const requests = this.getCctvRequests();
    const target = requests.find(r => r.id === id);
    if (!target) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = requests.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Rejected' as CctvRequestStatus,
          reviewedBy: rejectedBy,
          reviewedAt: now,
          reviewDecisionReason: reason
        };
      }
      return req;
    });

    this.setItem('cctv_requests', updated);
    this.updateLostItem(target.lostReportId, { status: 'REPORTED' });

    this.logAudit(
      'CCTV_REQUEST_REJECTED',
      'CCTV Surveillance Access',
      `Rejected CCTV request [${id}] by ${rejectedBy}. Justification: "${reason}"`
    );
  }

  public addCctvSighting(requestId: string, sightingData: Omit<CctvSightingRecord, 'id' | 'recordedAt'>): void {
    const requests = this.getCctvRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newSighting: CctvSightingRecord = {
      ...sightingData,
      id: `st-${Date.now()}`,
      recordedAt: now
    };

    const updated = requests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'Search in Progress' as CctvRequestStatus,
          sightings: [...r.sightings, newSighting]
        };
      }
      return r;
    });

    this.setItem('cctv_requests', updated);

    this.logAudit(
      'CCTV_SIGHTING_RECORDED',
      'CCTV Investigation',
      `Logged potential sighting bookmark at ${newSighting.formattedTimestamp} on request ${requestId}. Notes: "${newSighting.notes}"`
    );
  }

  public finalizeCctvSearch(
    requestId: string,
    result: 'Item Located' | 'Possible Sighting' | 'No Useful Sighting' | 'Request Further Assistance',
    notes: string
  ): void {
    const requests = this.getCctvRequests();
    const target = requests.find(r => r.id === requestId);
    if (!target) return;

    const updated = requests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: (result === 'Item Located' ? 'Search Completed' : 'Search in Progress') as CctvRequestStatus,
          finalResult: result,
          finalResultNotes: notes
        };
      }
      return r;
    });

    this.setItem('cctv_requests', updated);

    if (result === 'Item Located') {
      this.updateLostItem(target.lostReportId, { status: 'CLAIM_IN_PROGRESS' });
    }

    this.logAudit(
      'CCTV_SEARCH_RESULT_LOGGED',
      'CCTV Investigation',
      `Requester logged search outcome [${result}] on request ${requestId}. Details: "${notes}"`
    );
  }

  // --- ITEM CLAIMS & VERIFICATION ---
  public getItemClaims(): ItemClaim[] {
    return this.getItem<ItemClaim[]>('item_claims', INITIAL_CLAIMS);
  }

  public addClaim(data: Omit<ItemClaim, 'id' | 'submittedAt' | 'status'>): ItemClaim {
    const claims = this.getItemClaims();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `CLM-2026-${String(claims.length + 1).padStart(3, '0')}`;

    const newClaim: ItemClaim = {
      ...data,
      id,
      status: 'SUBMITTED',
      submittedAt: now
    };

    this.setItem('item_claims', [newClaim, ...claims]);

    // Update found item status
    this.updateFoundItem(data.foundItemId, { status: 'CLAIM_PENDING' });
    if (data.lostReportId) {
      this.updateLostItem(data.lostReportId, { status: 'CLAIM_IN_PROGRESS' });
    }

    this.logAudit(
      'ITEM_CLAIM_SUBMITTED',
      'Lost & Found Verification',
      `Submitted ownership claim [${id}] for found item [${data.foundItemId}] "${data.foundItemName}" by ${data.claimantName}`
    );

    return newClaim;
  }

  public updateClaimStatus(
    id: string,
    status: ClaimStatus,
    verifiedBy: string,
    notes: string,
    handoverLocation?: string
  ): void {
    const claims = this.getItemClaims();
    const target = claims.find(c => c.id === id);
    if (!target) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = claims.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          verifiedBy,
          verifiedAt: now,
          decisionNotes: notes,
          handoverLocation: handoverLocation || c.handoverLocation
        };
      }
      return c;
    });

    this.setItem('item_claims', updated);

    if (status === 'COMPLETED') {
      this.updateFoundItem(target.foundItemId, { status: 'RETURNED_TO_OWNER' });
      if (target.lostReportId) {
        this.updateLostItem(target.lostReportId, { status: 'RECOVERED' });
      }
    } else if (status === 'APPROVED_READY_FOR_PICKUP') {
      this.updateFoundItem(target.foundItemId, { status: 'CLAIM_VERIFIED' });
    }

    this.logAudit(
      'ITEM_CLAIM_STATUS_UPDATED',
      'Lost & Found Verification',
      `Claim [${id}] status changed to [${status}] by ${verifiedBy}. Decision note: "${notes}"`
    );
  }

  // --- INTELLIGENT MATCHING ENGINE ---
  public calculateMatchScore(lost: LostItemReport, found: FoundItemReport): { score: number; supportingFactors: string[] } {
    let score = 0;
    const factors: string[] = [];

    // 1. Category Matching (Highest weight: 35%)
    if (lost.category === found.category) {
      score += 35;
      factors.push(`Identical category: ${lost.category}`);
    }

    // 2. Brand & Color Compatibility (Weight: 20%)
    const lostBrand = (lost.brand || '').toLowerCase().trim();
    const foundBrand = (found.brand || '').toLowerCase().trim();
    if (lostBrand && foundBrand && (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))) {
      score += 12;
      factors.push(`Matching brand: ${lost.brand}`);
    }

    const lostColor = (lost.color || '').toLowerCase().trim();
    const foundColor = (found.color || '').toLowerCase().trim();
    if (lostColor && foundColor) {
      const lostColors = lostColor.split(/[\s,/]+/);
      const foundColors = foundColor.split(/[\s,/]+/);
      const hasCommonColor = lostColors.some(c => c.length > 2 && foundColors.some(fc => fc.includes(c) || c.includes(fc)));
      if (hasCommonColor) {
        score += 8;
        factors.push(`Consistent color tone: ${lost.color}`);
      }
    }

    // 3. Name & Description Keyword Overlap (Weight: 20%)
    const cleanTokens = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'with', 'for', 'was', 'left', 'found', 'near', 'from', 'this', 'that'].includes(w));
    const lostTokens = new Set([...cleanTokens(lost.itemName), ...cleanTokens(lost.description), ...cleanTokens(lost.distinctiveFeatures)]);
    const foundTokens = cleanTokens(found.itemName + ' ' + found.description);
    let overlapCount = 0;
    const matchedWords: string[] = [];
    foundTokens.forEach(t => {
      if (lostTokens.has(t) && !matchedWords.includes(t)) {
        overlapCount++;
        matchedWords.push(t);
      }
    });
    if (overlapCount > 0) {
      const keywordPoints = Math.min(20, overlapCount * 5);
      score += keywordPoints;
      factors.push(`Keyword correlation: "${matchedWords.slice(0, 3).join(', ')}"`);
    }

    // 4. Location Proximity (Weight: 15%)
    const lostLoc = (lost.lastKnownLocation + ' ' + lost.campusZone).toLowerCase();
    const foundLoc = (found.locationFound + ' ' + found.campusZone).toLowerCase();
    if (lost.campusZone && found.campusZone && lost.campusZone.toLowerCase() === found.campusZone.toLowerCase()) {
      score += 15;
      factors.push(`Same campus zone: ${lost.campusZone}`);
    } else if (lostLoc.includes('library') && foundLoc.includes('library')) {
      score += 15;
      factors.push('Both reported within Central Library complex');
    } else if (lostLoc.includes('mess') && foundLoc.includes('mess')) {
      score += 15;
      factors.push('Both reported within Dining Hall complex');
    } else if (lostLoc.includes('lh-101') && foundLoc.includes('lh-101')) {
      score += 15;
      factors.push('Both reported in Ramanujan Wing LH-101 sector');
    } else if (lostLoc.includes('sports') && foundLoc.includes('sports')) {
      score += 15;
      factors.push('Both reported in Sports Grounds area');
    } else if (lostLoc.includes('tank') && foundLoc.includes('tank')) {
      score += 15;
      factors.push('Both reported near Tank Memorial / Central Spine');
    }

    // 5. Temporal Proximity (Weight: 10%)
    if (lost.dateLost && found.dateFound) {
      if (lost.dateLost === found.dateFound) {
        score += 10;
        factors.push(`Same day timeline: ${lost.dateLost}`);
      } else {
        const d1 = new Date(lost.dateLost).getTime();
        const d2 = new Date(found.dateFound).getTime();
        const diffDays = Math.abs(d2 - d1) / (1000 * 3600 * 24);
        if (diffDays <= 2) {
          score += 7;
          factors.push(`Chronological proximity (within ${Math.ceil(diffDays)} day(s))`);
        }
      }
    }

    return {
      score: Math.min(100, score),
      supportingFactors: factors
    };
  }

  public findMatchesForLostItem(lostItem: LostItemReport): LostFoundMatch[] {
    const foundItems = this.getFoundItems();
    const matches: LostFoundMatch[] = [];

    foundItems.forEach(found => {
      const res = this.calculateMatchScore(lostItem, found);
      if (res.score >= 40) {
        matches.push({
          lostItem,
          foundItem: found,
          score: res.score,
          supportingFactors: res.supportingFactors
        });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  public findAllPotentialMatches(): LostFoundMatch[] {
    const lostItems = this.getLostItems().filter(l => l.status !== 'RECOVERED' && l.status !== 'CLOSED');
    const foundItems = this.getFoundItems().filter(f => f.status !== 'RETURNED_TO_OWNER');
    const matches: LostFoundMatch[] = [];

    lostItems.forEach(lost => {
      foundItems.forEach(found => {
        const res = this.calculateMatchScore(lost, found);
        if (res.score >= 45) {
          matches.push({
            lostItem: lost,
            foundItem: found,
            score: res.score,
            supportingFactors: res.supportingFactors
          });
        }
      });
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  // --- RESET TO DEMO DATA ---
  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'users');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'cameras');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'programs');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'subjects');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'classrooms');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'students');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'attendance_records');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'faculty_reports');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'parking_zones');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'campus_routes');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'incidents');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'audit_logs');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'settings');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'face_templates_secure');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'hostel_buildings');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'hostel_residents');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'hostel_events');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'unknown_faces');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'camera_sessions');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'lost_items');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'found_items');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'cctv_requests');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'item_claims');
    this.setItem('current_user_id', INITIAL_USERS[0].id);
    this.notifyListeners();
  }
}

export const campusStore = new CampusStore();
