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
  FaceTemplate,
  HostelBuilding,
  HostelResident,
  HostelEventLog,
  UnknownFaceRecord,
  ClassroomFaceAttendanceRecord,
  CameraSession,
  LostItemReport,
  FoundItemReport,
  CctvSearchRequest,
  ItemClaim
} from '../types/campus';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Col. Rajesh Bakshi (Retd.)',
    email: 'admin@aitpune.edu.in',
    role: 'super_admin',
    department: 'Central Administration',
    designation: 'Director / Chief Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedHostel: 'both'
  },
  {
    id: 'usr-2',
    name: 'Dr. Sunita Kulkarni',
    email: 'campus.admin@aitpune.edu.in',
    role: 'campus_admin',
    department: 'Academic Affairs & Campus Operations',
    designation: 'Dean of Academics & Campus Operations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assignedHostel: 'both'
  },
  {
    id: 'usr-3',
    name: 'Prof. Vikramaditya Sharma',
    email: 'vikram.sharma@aitpune.edu.in',
    role: 'faculty',
    department: 'Computer Engineering (CSE)',
    designation: 'Associate Professor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    assignedSubjects: ['sub-cse-401', 'sub-cse-302'],
    assignedClassrooms: ['clr-101', 'clr-204'],
  },
  {
    id: 'usr-4',
    name: 'Prof. Meenakshi Rao',
    email: 'm.rao@aitpune.edu.in',
    role: 'faculty',
    department: 'Electronics & Telecommunication (E&TC)',
    designation: 'Assistant Professor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    assignedSubjects: ['sub-etc-301'],
    assignedClassrooms: ['clr-102'],
  },
  {
    id: 'usr-bh-warden',
    name: 'Major Anil Rathore (Retd.)',
    email: 'bh.warden@aitpune.edu.in',
    role: 'boys_hostel_warden',
    department: 'Hostel Administration - Boys Wing',
    designation: 'Chief Warden (Boys Hostels)',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    assignedHostel: 'boys'
  },
  {
    id: 'usr-gh-warden',
    name: 'Capt. Sangeeta Verma (Retd.)',
    email: 'gh.warden@aitpune.edu.in',
    role: 'girls_hostel_warden',
    department: 'Hostel Administration - Girls Wing',
    designation: 'Chief Warden (Girls Hostels)',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    assignedHostel: 'girls'
  },
  {
    id: 'usr-sec-operator',
    name: 'Havaldar Balbir Singh',
    email: 'security.turnstiles@aitpune.edu.in',
    role: 'security_operator',
    department: 'Perimeter Access Control',
    designation: 'Turnstile & Entrance Operator',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-5',
    name: 'Subedar Major Ramesh Gurung',
    email: 'security.hq@aitpune.edu.in',
    role: 'security_staff',
    department: 'Campus Security & Gate Command',
    designation: 'Chief Security Officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-viewer',
    name: 'Neha Joshi',
    email: 'audit.viewer@aitpune.edu.in',
    role: 'readonly_viewer',
    department: 'Internal Quality Assurance (IQAC)',
    designation: 'Compliance Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-6',
    name: 'Ajay Malhan',
    email: 'amalhan_21045@aitpune.edu.in',
    role: 'student',
    department: 'Electronics & Telecommunication',
    designation: 'B.Tech Student (3rd Year)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_CAMERAS: CameraLocation[] = [
  {
    id: 'cam-01',
    name: 'Main Entrance Gate (Alandi Rd)',
    zone: 'Perimeter Security',
    cameraCode: 'AIT-CAM-MG01',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: 'Just now',
    currentOccupancy: 42,
    maxCapacity: 150,
    hasMotion: true,
    density: 'MODERATE',
    pedestrianCountIn: 340,
    pedestrianCountOut: 195,
    notes: 'Main security checkpost, vehicle RFID scanning barrier and pedestrian turnstiles.'
  },
  {
    id: 'cam-02',
    name: 'Academic Boulevard (Tank Memorial)',
    zone: 'Central Spine',
    cameraCode: 'AIT-CAM-RD02',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: '1 min ago',
    currentOccupancy: 68,
    maxCapacity: 200,
    hasMotion: true,
    density: 'MODERATE',
    pedestrianCountIn: 412,
    pedestrianCountOut: 390,
    notes: 'Primary road connecting Vijayanta Tank memorial with main academic blocks A & B.'
  },
  {
    id: 'cam-03',
    name: 'Lecture Hall LH-101 (CSE Smart Room)',
    zone: 'Academic Block A',
    cameraCode: 'AIT-CAM-CR101',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: 'Real-time',
    currentOccupancy: 54,
    maxCapacity: 60,
    hasMotion: false,
    density: 'HIGH',
    pedestrianCountIn: 56,
    pedestrianCountOut: 2,
    notes: 'AI Automated Attendance Lecture Room. Equipped with overhead wide-angle sensor.'
  },
  {
    id: 'cam-04',
    name: 'Cadets Mess & Dining Complex',
    zone: 'Amenities',
    cameraCode: 'AIT-CAM-MS04',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: 'Real-time',
    currentOccupancy: 185,
    maxCapacity: 300,
    hasMotion: true,
    density: 'HIGH',
    pedestrianCountIn: 520,
    pedestrianCountOut: 430,
    notes: 'Central mess dining hall and cafeteria area during afternoon lunch hours.'
  },
  {
    id: 'cam-05',
    name: 'Manekshaw Auditorium',
    zone: 'Cultural Block',
    cameraCode: 'AIT-CAM-AUD05',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: '3 mins ago',
    currentOccupancy: 28,
    maxCapacity: 800,
    hasMotion: false,
    density: 'LOW',
    pedestrianCountIn: 35,
    pedestrianCountOut: 7,
    notes: 'Multipurpose central auditorium and conference center.'
  },
  {
    id: 'cam-06',
    name: 'Ramanujan Central Library',
    zone: 'Academic Support',
    cameraCode: 'AIT-CAM-LIB06',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: 'Just now',
    currentOccupancy: 94,
    maxCapacity: 160,
    hasMotion: true,
    density: 'MODERATE',
    pedestrianCountIn: 210,
    pedestrianCountOut: 116,
    notes: 'Digital reference section, silent reading halls, and research cubicles.'
  },
  {
    id: 'cam-07',
    name: 'Student Gazebo & Open Amphitheater',
    zone: 'Green Quad',
    cameraCode: 'AIT-CAM-GZB07',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: 'Real-time',
    currentOccupancy: 36,
    maxCapacity: 120,
    hasMotion: true,
    density: 'LOW',
    pedestrianCountIn: 110,
    pedestrianCountOut: 74,
    notes: 'Outdoor collaborative seating zone between Academic Block and Library.'
  },
  {
    id: 'cam-08',
    name: 'Campus Shopping Complex & Canteen',
    zone: 'Commercial Hub',
    cameraCode: 'AIT-CAM-SHP08',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: 'Real-time',
    currentOccupancy: 72,
    maxCapacity: 90,
    hasMotion: true,
    density: 'HIGH',
    pedestrianCountIn: 280,
    pedestrianCountOut: 208,
    notes: 'Stationery shop, juice center, ATM kiosk, and student utility stores.'
  },
  {
    id: 'cam-09',
    name: 'Main Parking Area & Vehicle Checkpoint',
    zone: 'Transport Hub',
    cameraCode: 'AIT-CAM-PK09',
    status: 'ACTIVE',
    mode: 'simulated',
    lastUpdated: 'Real-time',
    currentOccupancy: 142,
    maxCapacity: 200,
    hasMotion: true,
    density: 'HIGH',
    pedestrianCountIn: 180,
    pedestrianCountOut: 38,
    notes: 'Two-wheeler and four-wheeler multi-bay parking lot with ANPR demo scanner.'
  }
];

export const INITIAL_PROGRAMS: ProgramStructure[] = [
  {
    id: 'prog-btech',
    name: 'B.Tech (Bachelor of Technology)',
    code: 'BTECH',
    totalYears: 4,
    branches: [
      { id: 'br-cse', name: 'Computer Engineering', code: 'CSE', hod: 'Dr. P. B. Karandikar' },
      { id: 'br-etc', name: 'Electronics & Telecommunication', code: 'E&TC', hod: 'Dr. G. R. Patil' },
      { id: 'br-mech', name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. U. V. Awasarmol' },
      { id: 'br-it', name: 'Information Technology', code: 'IT', hod: 'Dr. S. R. Dhore' },
      { id: 'br-robo', name: 'Robotics & Automation', code: 'RA', hod: 'Dr. J. B. Sankpal' }
    ]
  },
  {
    id: 'prog-mtech',
    name: 'M.Tech (Master of Technology)',
    code: 'MTECH',
    totalYears: 2,
    branches: [
      { id: 'br-mtech-vlsi', name: 'VLSI & Embedded Systems', code: 'M-VLSI', hod: 'Dr. R. S. Katti' },
      { id: 'br-mtech-ds', name: 'Data Science & Artificial Intelligence', code: 'M-DSAI', hod: 'Dr. M. S. Joshi' },
      { id: 'br-mtech-mech', name: 'Automotive & Robotics Design', code: 'M-ARD', hod: 'Dr. S. K. Mahajan' }
    ]
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-cse-401',
    code: 'CS-401',
    name: 'Deep Learning & Neural Networks',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    semester: 7,
    credits: 4,
    facultyId: 'usr-3',
    facultyName: 'Prof. Vikramaditya Sharma',
    classroomDefaultId: 'clr-101'
  },
  {
    id: 'sub-cse-302',
    code: 'CS-302',
    name: 'Database Management & Cloud Architecture',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    semester: 5,
    credits: 3,
    facultyId: 'usr-3',
    facultyName: 'Prof. Vikramaditya Sharma',
    classroomDefaultId: 'clr-204'
  },
  {
    id: 'sub-etc-301',
    code: 'ET-301',
    name: 'Digital Signal Processing & Microcontrollers',
    program: 'B.Tech',
    branch: 'Electronics & Telecommunication',
    semester: 5,
    credits: 4,
    facultyId: 'usr-4',
    facultyName: 'Prof. Meenakshi Rao',
    classroomDefaultId: 'clr-102'
  },
  {
    id: 'sub-it-405',
    code: 'IT-405',
    name: 'Campus Cyber Security & Cryptography',
    program: 'B.Tech',
    branch: 'Information Technology',
    semester: 7,
    credits: 3,
    facultyId: 'usr-2',
    facultyName: 'Dr. Sunita Kulkarni',
    classroomDefaultId: 'clr-103'
  },
  {
    id: 'sub-ra-304',
    code: 'RA-304',
    name: 'Autonomous Mobile Robots & ROS',
    program: 'B.Tech',
    branch: 'Robotics & Automation',
    semester: 6,
    credits: 4,
    facultyId: 'usr-3',
    facultyName: 'Prof. Vikramaditya Sharma',
    classroomDefaultId: 'clr-101'
  },
  {
    id: 'sub-vlsi-501',
    code: 'M-VLSI-501',
    name: 'Advanced FPGA Architecture & SoC Design',
    program: 'M.Tech',
    branch: 'VLSI & Embedded Systems',
    semester: 1,
    credits: 4,
    facultyId: 'usr-4',
    facultyName: 'Prof. Meenakshi Rao',
    classroomDefaultId: 'clr-204'
  }
];

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'clr-101',
    roomNumber: 'LH-101',
    block: 'Academic Block A (Ramanujan Wing)',
    capacity: 60,
    currentOccupancy: 54,
    cameraId: 'cam-03',
    hasProjector: true,
    hasSmartBoard: true
  },
  {
    id: 'clr-102',
    roomNumber: 'LH-102',
    block: 'Academic Block A (Signal Processing Lab)',
    capacity: 60,
    currentOccupancy: 48,
    cameraId: 'cam-03',
    hasProjector: true,
    hasSmartBoard: false
  },
  {
    id: 'clr-204',
    roomNumber: 'LH-204',
    block: 'Academic Block B (Software Engineering Lab)',
    capacity: 55,
    currentOccupancy: 38,
    cameraId: 'cam-03',
    hasProjector: true,
    hasSmartBoard: true
  },
  {
    id: 'clr-103',
    roomNumber: 'LH-103',
    block: 'Academic Block C (Advanced Computing)',
    capacity: 70,
    currentOccupancy: 62,
    cameraId: 'cam-03',
    hasProjector: true,
    hasSmartBoard: true
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // B.Tech 4th Year - CSE (Section A)
  {
    id: 'stu-101',
    enrollmentNo: 'AIT/2021/CSE/001',
    regNo: 'AIT2021CSE001',
    rollNo: '4101',
    name: 'Aarav Sharma',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: 'aarav_4101@aitpune.edu.in',
    cgpa: 9.15,
    attendanceRate: 94.2,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 44101',
    guardianPhone: '+91 94220 11001',
    enrolledSubjectIds: ['sub-cse-401', 'sub-it-405'],
    hostelAllocationId: 'res-b01',
    hostelBuilding: 'Cariappa Hall (Boys)',
    hostelRoom: 'B-204',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-01 10:15:00'
  },
  {
    id: 'stu-102',
    enrollmentNo: 'AIT/2021/CSE/002',
    regNo: 'AIT2021CSE002',
    rollNo: '4102',
    name: 'Pooja Nair',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: 'pooja_4102@aitpune.edu.in',
    cgpa: 8.82,
    attendanceRate: 91.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 44102',
    guardianPhone: '+91 94220 11002',
    enrolledSubjectIds: ['sub-cse-401', 'sub-it-405'],
    hostelAllocationId: 'res-g01',
    hostelBuilding: 'Kalpana Chawla Bhavan (Girls)',
    hostelRoom: 'G-108',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-01 10:22:00'
  },
  {
    id: 'stu-103',
    enrollmentNo: 'AIT/2021/CSE/003',
    regNo: 'AIT2021CSE003',
    rollNo: '4103',
    name: 'Rohan Deshmukh',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: 'rohan_4103@aitpune.edu.in',
    cgpa: 6.94,
    attendanceRate: 68.5,
    status: 'DETENTION_WARNING',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 44103',
    guardianPhone: '+91 94220 11003',
    enrolledSubjectIds: ['sub-cse-401'],
    hostelAllocationId: 'res-b02',
    hostelBuilding: 'Cariappa Hall (Boys)',
    hostelRoom: 'B-205',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-02 11:05:00'
  },
  {
    id: 'stu-104',
    enrollmentNo: 'AIT/2021/CSE/004',
    regNo: 'AIT2021CSE004',
    rollNo: '4104',
    name: 'Simran Kaur',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: 'simran_4104@aitpune.edu.in',
    cgpa: 9.40,
    attendanceRate: 96.5,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 44104',
    guardianPhone: '+91 94220 11004',
    enrolledSubjectIds: ['sub-cse-401', 'sub-it-405'],
    hostelAllocationId: 'res-g02',
    hostelBuilding: 'Kalpana Chawla Bhavan (Girls)',
    hostelRoom: 'G-110',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-02 11:30:00'
  },
  {
    id: 'stu-105',
    enrollmentNo: 'AIT/2021/CSE/005',
    regNo: 'AIT2021CSE005',
    rollNo: '4105',
    name: 'Vikram Singh Rathore',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: 'vikram_4105@aitpune.edu.in',
    cgpa: 7.45,
    attendanceRate: 72.0,
    status: 'DETENTION_WARNING',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 44105',
    guardianPhone: '+91 94220 11005',
    enrolledSubjectIds: ['sub-cse-401'],
    hostelAllocationId: 'res-b03',
    hostelBuilding: 'Cariappa Hall (Boys)',
    hostelRoom: 'B-301',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-03 09:45:00'
  },
  {
    id: 'stu-109',
    enrollmentNo: 'AIT/2021/CSE/006',
    regNo: 'AIT2021CSE006',
    rollNo: '4106',
    name: 'Tanvi Shinde',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: 'tanvi_4106@aitpune.edu.in',
    cgpa: 8.90,
    attendanceRate: 92.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 44106',
    guardianPhone: '+91 94220 11006',
    enrolledSubjectIds: ['sub-cse-401', 'sub-it-405'],
    hostelAllocationId: 'res-g03',
    hostelBuilding: 'Kalpana Chawla Bhavan (Girls)',
    hostelRoom: 'G-204',
    faceRegistrationStatus: 'UNREGISTERED'
  },
  {
    id: 'stu-110',
    enrollmentNo: 'AIT/2021/CSE/007',
    regNo: 'AIT2021CSE007',
    rollNo: '4107',
    name: 'Devendra Joshi',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: 'devendra_4107@aitpune.edu.in',
    cgpa: 8.12,
    attendanceRate: 84.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 44107',
    guardianPhone: '+91 94220 11007',
    enrolledSubjectIds: ['sub-cse-401'],
    hostelAllocationId: 'res-b04',
    hostelBuilding: 'Thimayya Hostel (Boys)',
    hostelRoom: 'T-102',
    faceRegistrationStatus: 'UNREGISTERED'
  },
  {
    id: 'stu-111',
    enrollmentNo: 'AIT/2021/CSE/008',
    regNo: 'AIT2021CSE008',
    rollNo: '4108',
    name: 'Ritu Sen',
    program: 'B.Tech',
    branch: 'Computer Engineering',
    year: 4,
    semester: 7,
    section: 'A',
    email: 'ritu_4108@aitpune.edu.in',
    cgpa: 7.95,
    attendanceRate: 78.5,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 44108',
    guardianPhone: '+91 94220 11008',
    enrolledSubjectIds: ['sub-cse-401'],
    hostelAllocationId: 'res-g04',
    hostelBuilding: 'Kalpana Chawla Bhavan (Girls)',
    hostelRoom: 'G-206',
    faceRegistrationStatus: 'FAILED'
  },

  // B.Tech 3rd Year - E&TC (Section A)
  {
    id: 'stu-106',
    enrollmentNo: 'AIT/2022/ETC/015',
    regNo: 'AIT2022ETC015',
    rollNo: '3215',
    name: 'Ajay Malhan',
    program: 'B.Tech',
    branch: 'Electronics & Telecommunication',
    year: 3,
    semester: 5,
    section: 'A',
    email: 'amalhan_3215@aitpune.edu.in',
    cgpa: 9.20,
    attendanceRate: 95.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 43215',
    guardianPhone: '+91 94220 13215',
    enrolledSubjectIds: ['sub-etc-301'],
    hostelAllocationId: 'res-b05',
    hostelBuilding: 'Cariappa Hall (Boys)',
    hostelRoom: 'B-105',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-04 14:10:00'
  },
  {
    id: 'stu-107',
    enrollmentNo: 'AIT/2022/ETC/018',
    regNo: 'AIT2022ETC018',
    rollNo: '3218',
    name: 'Ananya Roy',
    program: 'B.Tech',
    branch: 'Electronics & Telecommunication',
    year: 3,
    semester: 5,
    section: 'A',
    email: 'ananya_3218@aitpune.edu.in',
    cgpa: 8.75,
    attendanceRate: 88.4,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 43218',
    guardianPhone: '+91 94220 13218',
    enrolledSubjectIds: ['sub-etc-301'],
    hostelAllocationId: 'res-g05',
    hostelBuilding: 'Kalpana Chawla Bhavan (Girls)',
    hostelRoom: 'G-302',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-04 14:30:00'
  },
  {
    id: 'stu-112',
    enrollmentNo: 'AIT/2022/ETC/021',
    regNo: 'AIT2022ETC021',
    rollNo: '3221',
    name: 'Karthik Subramanian',
    program: 'B.Tech',
    branch: 'Electronics & Telecommunication',
    year: 3,
    semester: 5,
    section: 'A',
    email: 'karthik_3221@aitpune.edu.in',
    cgpa: 7.80,
    attendanceRate: 81.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 43221',
    guardianPhone: '+91 94220 13221',
    enrolledSubjectIds: ['sub-etc-301'],
    hostelAllocationId: 'res-b06',
    hostelBuilding: 'Thimayya Hostel (Boys)',
    hostelRoom: 'T-204',
    faceRegistrationStatus: 'UNREGISTERED'
  },

  // B.Tech 2nd Year - Robotics & Automation
  {
    id: 'stu-108',
    enrollmentNo: 'AIT/2023/ROBO/009',
    regNo: 'AIT2023RA009',
    rollNo: '2409',
    name: 'Karan Thapar',
    program: 'B.Tech',
    branch: 'Robotics & Automation',
    year: 2,
    semester: 3,
    section: 'A',
    email: 'karan_2409@aitpune.edu.in',
    cgpa: 8.30,
    attendanceRate: 82.5,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 42409',
    guardianPhone: '+91 94220 12409',
    enrolledSubjectIds: ['sub-ra-304'],
    hostelAllocationId: 'res-b07',
    hostelBuilding: 'Cariappa Hall (Boys)',
    hostelRoom: 'B-108',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-05 16:00:00'
  },
  {
    id: 'stu-113',
    enrollmentNo: 'AIT/2023/ROBO/012',
    regNo: 'AIT2023RA012',
    rollNo: '2412',
    name: 'Shruti Venkat',
    program: 'B.Tech',
    branch: 'Robotics & Automation',
    year: 2,
    semester: 3,
    section: 'A',
    email: 'shruti_2412@aitpune.edu.in',
    cgpa: 9.05,
    attendanceRate: 91.5,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 42412',
    guardianPhone: '+91 94220 12412',
    enrolledSubjectIds: ['sub-ra-304'],
    hostelAllocationId: 'res-g06',
    hostelBuilding: 'Kalpana Chawla Bhavan (Girls)',
    hostelRoom: 'G-305',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-05 16:20:00'
  },
  {
    id: 'stu-114',
    enrollmentNo: 'AIT/2023/ROBO/025',
    regNo: 'AIT2023RA025',
    rollNo: '2425',
    name: 'Manish Pandey',
    program: 'B.Tech',
    branch: 'Robotics & Automation',
    year: 2,
    semester: 3,
    section: 'A',
    email: 'manish_2425@aitpune.edu.in',
    cgpa: 7.60,
    attendanceRate: 75.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 42425',
    guardianPhone: '+91 94220 12425',
    enrolledSubjectIds: ['sub-ra-304'],
    hostelAllocationId: 'res-b08',
    hostelBuilding: 'Thimayya Hostel (Boys)',
    hostelRoom: 'T-302',
    faceRegistrationStatus: 'UNREGISTERED'
  },

  // B.Tech 1st Year - Mechanical Engineering
  {
    id: 'stu-115',
    enrollmentNo: 'AIT/2024/MECH/004',
    regNo: 'AIT2024ME004',
    rollNo: '1304',
    name: 'Pratham Verma',
    program: 'B.Tech',
    branch: 'Mechanical Engineering',
    year: 1,
    semester: 1,
    section: 'B',
    email: 'pratham_1304@aitpune.edu.in',
    cgpa: 8.50,
    attendanceRate: 90.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 41304',
    guardianPhone: '+91 94220 11304',
    enrolledSubjectIds: [],
    hostelAllocationId: 'res-b09',
    hostelBuilding: 'Cariappa Hall (Boys)',
    hostelRoom: 'B-102',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-08 09:10:00'
  },
  {
    id: 'stu-116',
    enrollmentNo: 'AIT/2024/MECH/018',
    regNo: 'AIT2024ME018',
    rollNo: '1318',
    name: 'Suhani Dixit',
    program: 'B.Tech',
    branch: 'Mechanical Engineering',
    year: 1,
    semester: 1,
    section: 'B',
    email: 'suhani_1318@aitpune.edu.in',
    cgpa: 8.80,
    attendanceRate: 93.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 41318',
    guardianPhone: '+91 94220 11318',
    enrolledSubjectIds: [],
    hostelAllocationId: 'res-g07',
    hostelBuilding: 'Kalpana Chawla Bhavan (Girls)',
    hostelRoom: 'G-102',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-08 09:30:00'
  },

  // M.Tech - Data Science & AI
  {
    id: 'stu-117',
    enrollmentNo: 'AIT/2023/MT-DS/002',
    regNo: 'AIT2023MTDS002',
    rollNo: '5102',
    name: 'Abhishek Mukherjee',
    program: 'M.Tech',
    branch: 'Data Science & Artificial Intelligence',
    year: 2,
    semester: 3,
    section: 'A',
    email: 'abhishek_5102@aitpune.edu.in',
    cgpa: 9.35,
    attendanceRate: 97.0,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 45102',
    guardianPhone: '+91 94220 15102',
    enrolledSubjectIds: [],
    hostelAllocationId: 'res-b10',
    hostelBuilding: 'Thimayya Hostel (Boys)',
    hostelRoom: 'T-108',
    faceRegistrationStatus: 'REGISTERED',
    faceRegisteredAt: '2026-09-09 11:15:00'
  },
  {
    id: 'stu-118',
    enrollmentNo: 'AIT/2023/MT-DS/005',
    regNo: 'AIT2023MTDS005',
    rollNo: '5105',
    name: 'Meera Pillai',
    program: 'M.Tech',
    branch: 'Data Science & Artificial Intelligence',
    year: 2,
    semester: 3,
    section: 'A',
    email: 'meera_5105@aitpune.edu.in',
    cgpa: 9.10,
    attendanceRate: 92.5,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98230 45105',
    guardianPhone: '+91 94220 15105',
    enrolledSubjectIds: [],
    hostelAllocationId: 'res-g08',
    hostelBuilding: 'Kalpana Chawla Bhavan (Girls)',
    hostelRoom: 'G-201',
    faceRegistrationStatus: 'UNREGISTERED'
  }
];

// Helper to generate a 60-slot lecture timeline
const generateTimeline = (presentMinutes: number): number[] => {
  const arr = new Array(60).fill(0);
  let assigned = 0;
  for (let i = 0; i < 60 && assigned < presentMinutes; i++) {
    // Fill realistic continuous chunks
    if (i < presentMinutes + 4 && i > 3) {
      arr[i] = 1;
      assigned++;
    } else if (assigned < presentMinutes) {
      arr[i] = 1;
      assigned++;
    }
  }
  return arr;
};

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-01',
    studentId: 'stu-101',
    studentName: 'Aarav Sharma',
    rollNo: '4101',
    subjectId: 'sub-cse-401',
    subjectCode: 'CS-401',
    subjectName: 'Deep Learning & Neural Networks',
    classroomId: 'clr-101',
    date: '2026-10-13',
    period: 3,
    facultyId: 'usr-3',
    totalLectureMinutes: 60,
    verifiedPresenceMinutes: 56, // >= 45 => FULL
    status: 'FULL_ATTENDANCE',
    thresholdMinutes: 45,
    timeline: generateTimeline(56),
    isManuallyCorrected: false
  },
  {
    id: 'att-02',
    studentId: 'stu-102',
    studentName: 'Pooja Nair',
    rollNo: '4102',
    subjectId: 'sub-cse-401',
    subjectCode: 'CS-401',
    subjectName: 'Deep Learning & Neural Networks',
    classroomId: 'clr-101',
    date: '2026-10-13',
    period: 3,
    facultyId: 'usr-3',
    totalLectureMinutes: 60,
    verifiedPresenceMinutes: 49, // >= 45 => FULL
    status: 'FULL_ATTENDANCE',
    thresholdMinutes: 45,
    timeline: generateTimeline(49),
    isManuallyCorrected: false
  },
  {
    id: 'att-03',
    studentId: 'stu-103',
    studentName: 'Rohan Deshmukh',
    rollNo: '4103',
    subjectId: 'sub-cse-401',
    subjectCode: 'CS-401',
    subjectName: 'Deep Learning & Neural Networks',
    classroomId: 'clr-101',
    date: '2026-10-13',
    period: 3,
    facultyId: 'usr-3',
    totalLectureMinutes: 60,
    verifiedPresenceMinutes: 28, // < 45 => BELOW THRESHOLD
    status: 'BELOW_THRESHOLD',
    thresholdMinutes: 45,
    timeline: generateTimeline(28),
    isManuallyCorrected: false
  },
  {
    id: 'att-04',
    studentId: 'stu-104',
    studentName: 'Simran Kaur',
    rollNo: '4104',
    subjectId: 'sub-cse-401',
    subjectCode: 'CS-401',
    subjectName: 'Deep Learning & Neural Networks',
    classroomId: 'clr-101',
    date: '2026-10-13',
    period: 3,
    facultyId: 'usr-3',
    totalLectureMinutes: 60,
    verifiedPresenceMinutes: 58,
    status: 'FULL_ATTENDANCE',
    thresholdMinutes: 45,
    timeline: generateTimeline(58),
    isManuallyCorrected: false
  },
  {
    id: 'att-05',
    studentId: 'stu-105',
    studentName: 'Vikram Singh Rathore',
    rollNo: '4105',
    subjectId: 'sub-cse-401',
    subjectCode: 'CS-401',
    subjectName: 'Deep Learning & Neural Networks',
    classroomId: 'clr-101',
    date: '2026-10-13',
    period: 3,
    facultyId: 'usr-3',
    totalLectureMinutes: 60,
    verifiedPresenceMinutes: 38, // < 45 => BELOW THRESHOLD
    status: 'BELOW_THRESHOLD',
    thresholdMinutes: 45,
    timeline: generateTimeline(38),
    isManuallyCorrected: true,
    correctionReason: 'Student was authorized for placement seminar setup during first 15 mins.',
    correctedBy: 'Prof. Vikramaditya Sharma',
    correctedAt: '2026-10-13 14:15'
  }
];

export const INITIAL_FACULTY_REPORTS: FacultyAssessmentReport[] = [
  {
    id: 'fr-01',
    studentId: 'stu-101',
    studentName: 'Aarav Sharma',
    subjectId: 'sub-cse-401',
    subjectName: 'Deep Learning & Neural Networks',
    facultyId: 'usr-3',
    facultyName: 'Prof. Vikramaditya Sharma',
    internalTest1: 28,
    internalTest2: 29,
    assignmentScore: 19,
    attendanceScore: 20,
    totalScore: 96,
    academicRemarks: 'Outstanding understanding of backpropagation and convolutional kernels. Active contributor.',
    followUpRequired: false,
    lastUpdated: '2026-10-12 16:30',
    updatedBy: 'Prof. Vikramaditya Sharma'
  },
  {
    id: 'fr-02',
    studentId: 'stu-102',
    studentName: 'Pooja Nair',
    subjectId: 'sub-cse-401',
    subjectName: 'Deep Learning & Neural Networks',
    facultyId: 'usr-3',
    facultyName: 'Prof. Vikramaditya Sharma',
    internalTest1: 25,
    internalTest2: 26,
    assignmentScore: 18,
    attendanceScore: 19,
    totalScore: 88,
    academicRemarks: 'Very good analytical code submissions in PyTorch lab sessions.',
    followUpRequired: false,
    lastUpdated: '2026-10-12 16:35',
    updatedBy: 'Prof. Vikramaditya Sharma'
  },
  {
    id: 'fr-03',
    studentId: 'stu-103',
    studentName: 'Rohan Deshmukh',
    subjectId: 'sub-cse-401',
    subjectName: 'Deep Learning & Neural Networks',
    facultyId: 'usr-3',
    facultyName: 'Prof. Vikramaditya Sharma',
    internalTest1: 16,
    internalTest2: 17,
    assignmentScore: 12,
    attendanceScore: 14,
    totalScore: 59,
    academicRemarks: 'Needs extra remedial guidance on transformer architectures and regular class attendance.',
    followUpRequired: true,
    lastUpdated: '2026-10-12 16:40',
    updatedBy: 'Prof. Vikramaditya Sharma'
  }
];

export const INITIAL_PARKING_ZONES: ParkingZone[] = [
  {
    id: 'pk-zone-a',
    name: 'North Gate Staff & VIP Bay (Zone A)',
    category: 'FACULTY_VIP',
    totalSpaces: 40,
    occupiedSpaces: 29,
    reservedSpaces: 6,
    vehiclesEnteringPerHour: 18,
    vehiclesExitingPerHour: 12,
    vehicles: [
      { id: 'v-1', slotNumber: 'A-01', type: 'car', isOccupied: true, entryTime: '08:45 AM', vehiclePlateMasked: 'MH-12-XX-4412' },
      { id: 'v-2', slotNumber: 'A-02', type: 'car', isOccupied: true, entryTime: '09:05 AM', vehiclePlateMasked: 'MH-14-XX-1092' },
      { id: 'v-3', slotNumber: 'A-03', type: 'car', isOccupied: false },
      { id: 'v-4', slotNumber: 'A-04', type: 'car', isOccupied: true, entryTime: '09:12 AM', vehiclePlateMasked: 'MH-12-XX-8821' },
      { id: 'v-5', slotNumber: 'A-05', type: 'car', isOccupied: false },
      { id: 'v-6', slotNumber: 'A-06', type: 'car', isOccupied: true, entryTime: '09:30 AM', vehiclePlateMasked: 'MH-02-XX-3004' }
    ]
  },
  {
    id: 'pk-zone-b',
    name: 'Cadets Two-Wheeler Arena (Zone B)',
    category: 'TWO_WHEELER',
    totalSpaces: 120,
    occupiedSpaces: 98,
    reservedSpaces: 0,
    vehiclesEnteringPerHour: 45,
    vehiclesExitingPerHour: 22,
    vehicles: [
      { id: 'v-21', slotNumber: 'B-01', type: 'motorcycle', isOccupied: true, entryTime: '08:15 AM', vehiclePlateMasked: 'MH-12-XX-1102' },
      { id: 'v-22', slotNumber: 'B-02', type: 'scooter', isOccupied: true, entryTime: '08:20 AM', vehiclePlateMasked: 'MH-12-XX-7819' },
      { id: 'v-23', slotNumber: 'B-03', type: 'motorcycle', isOccupied: true, entryTime: '08:25 AM', vehiclePlateMasked: 'DL-01-XX-9022' },
      { id: 'v-24', slotNumber: 'B-04', type: 'bicycle', isOccupied: true, entryTime: '08:30 AM' },
      { id: 'v-25', slotNumber: 'B-05', type: 'scooter', isOccupied: false },
      { id: 'v-26', slotNumber: 'B-06', type: 'motorcycle', isOccupied: true, entryTime: '08:40 AM', vehiclePlateMasked: 'MH-14-XX-5521' }
    ]
  },
  {
    id: 'pk-zone-c',
    name: 'Auditorium Visitors & Logistics Bay (Zone C)',
    category: 'VISITOR',
    totalSpaces: 40,
    occupiedSpaces: 15,
    reservedSpaces: 4,
    vehiclesEnteringPerHour: 8,
    vehiclesExitingPerHour: 5,
    vehicles: [
      { id: 'v-41', slotNumber: 'C-01', type: 'car', isOccupied: true, entryTime: '10:15 AM', vehiclePlateMasked: 'MH-12-XX-6630' },
      { id: 'v-42', slotNumber: 'C-02', type: 'car', isOccupied: false },
      { id: 'v-43', slotNumber: 'C-03', type: 'car', isOccupied: true, entryTime: '11:00 AM', vehiclePlateMasked: 'MH-09-XX-2219' },
      { id: 'v-44', slotNumber: 'C-04', type: 'car', isOccupied: false }
    ]
  }
];

export const INITIAL_ROUTES: CampusRoute[] = [
  {
    id: 'rt-1',
    name: 'Main Gate to Academic Block A (Direct Spine)',
    fromLocation: 'Main Gate (Alandi Rd)',
    toLocation: 'Academic Block A (Ramanujan Wing)',
    status: 'CLEAR',
    distanceMeters: 280,
    walkTimeMinutes: 3,
    congestionLevel: 25,
    alternateRoute: 'Via East Peripheral Perimeter Path (390m)',
    coordinates: [{ x: 10, y: 50 }, { x: 35, y: 50 }, { x: 55, y: 35 }]
  },
  {
    id: 'rt-2',
    name: 'Academic Block to Cadets Mess (Lunch Corridor)',
    fromLocation: 'Academic Block A',
    toLocation: 'Cadets Mess & Dining Complex',
    status: 'BUSY',
    distanceMeters: 190,
    walkTimeMinutes: 2,
    congestionLevel: 78,
    alternateRoute: 'Via Gazebo Lawn Walkway',
    coordinates: [{ x: 55, y: 35 }, { x: 65, y: 50 }, { x: 75, y: 70 }]
  },
  {
    id: 'rt-3',
    name: 'Tank Memorial Road to Manekshaw Auditorium',
    fromLocation: 'Academic Boulevard (Tank Memorial)',
    toLocation: 'Manekshaw Auditorium',
    status: 'CLEAR',
    distanceMeters: 240,
    walkTimeMinutes: 3,
    congestionLevel: 15,
    coordinates: [{ x: 35, y: 50 }, { x: 45, y: 75 }, { x: 35, y: 85 }]
  },
  {
    id: 'rt-4',
    name: 'Hostel Spine Road to Shopping Complex',
    fromLocation: 'Hostel Ring',
    toLocation: 'Campus Shopping Complex & Canteen',
    status: 'BLOCKED',
    distanceMeters: 310,
    walkTimeMinutes: 4,
    congestionLevel: 95,
    alternateRoute: 'Via Sports Ground bypass road',
    activeHazards: 'Maintenance vehicle unloading paving materials.',
    coordinates: [{ x: 85, y: 30 }, { x: 80, y: 60 }, { x: 70, y: 80 }]
  }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-01',
    caseNumber: 'AIT-INC-2026-089',
    category: 'MISSING_PERSON',
    title: 'Missing Student Report: Third-Year Cadet',
    description: 'Cadet did not report for morning muster at 06:30 hours. Last seen leaving library towards gazebo area at 22:45 hrs yesterday.',
    location: 'Ramanujan Central Library / Gazebo',
    reportedTime: '2026-10-13 07:15',
    status: 'INVESTIGATING',
    severity: 'HIGH',
    reportedBy: 'Hostel Warden Lt. Col. Deshmukh',
    assignedOfficer: 'Subedar Major Ramesh Gurung',
    personName: 'Cadet Tanmay Joshi',
    personType: 'Student',
    personPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastKnownLocation: 'Ramanujan Library CCTV zone 06',
    lastSeenTimestamp: '2026-10-12 22:48',
    contactNumber: '+91 98230 45678',
    investigationNotes: [
      {
        id: 'note-1',
        timestamp: '2026-10-13 07:30',
        officer: 'Sub. Maj. Ramesh Gurung',
        note: 'Cross-referenced exit gate turnstiles: No record of student scanning biometric card out of Main Gate.'
      },
      {
        id: 'note-2',
        timestamp: '2026-10-13 08:45',
        officer: 'Security Officer Pathak',
        note: 'Patrol dispatched to Gazebo, sports pavilion and robotics lab area. Physical verification in progress.'
      }
    ]
  },
  {
    id: 'inc-02',
    caseNumber: 'AIT-INC-2026-090',
    category: 'ROUTE_BLOCKAGE',
    title: 'Material Unloading Truck Blocking Hostel Route',
    description: 'Delivery truck for paver blocks partially blocking the two-way lane near Shopping Complex.',
    location: 'Campus Shopping Complex & Canteen',
    reportedTime: '2026-10-13 11:20',
    status: 'INVESTIGATING',
    severity: 'MEDIUM',
    reportedBy: 'Traffic Warden',
    assignedOfficer: 'Havildar K. Singh',
    investigationNotes: [
      {
        id: 'note-1',
        timestamp: '2026-10-13 11:35',
        officer: 'Havildar K. Singh',
        note: 'Driver contacted to move vehicle to designated loading bay behind complex within 15 minutes.'
      }
    ]
  },
  {
    id: 'inc-03',
    caseNumber: 'AIT-INC-2026-085',
    category: 'UNAUTHORIZED_ENTRY',
    title: 'Tailgating incident detected at East Boundary Gate',
    description: 'Pedestrian without valid RFID identity card followed closely behind authorized delivery driver.',
    location: 'Main Entrance Gate (Alandi Rd)',
    reportedTime: '2026-10-12 18:04',
    status: 'VERIFIED_RESOLVED',
    severity: 'MEDIUM',
    reportedBy: 'AI Gate Camera Analytics',
    assignedOfficer: 'Subedar Major Ramesh Gurung',
    investigationNotes: [
      {
        id: 'note-1',
        timestamp: '2026-10-12 18:10',
        officer: 'Guard On Duty',
        note: 'Individual intercepted: verified as guest visiting faculty quarters with registered invite pass.'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    timestamp: '2026-10-13 14:15:22',
    userId: 'usr-3',
    userName: 'Prof. Vikramaditya Sharma',
    role: 'faculty',
    action: 'ATTENDANCE_CORRECTION',
    module: 'Classroom Attendance',
    details: 'Corrected attendance status for Student Vikram Singh Rathore (Roll 4105) with reason: placement seminar setup.',
    ipAddress: '192.168.10.45'
  },
  {
    id: 'aud-02',
    timestamp: '2026-10-13 13:40:10',
    userId: 'usr-2',
    userName: 'Dr. Sunita Kulkarni',
    role: 'campus_admin',
    action: 'CAMERA_CONFIG_UPDATE',
    module: 'Campus Cameras',
    details: 'Configured Lecture Hall LH-101 camera to Simulated Vision Mode (FPS: 30, Bounding Boxes: ON).',
    ipAddress: '192.168.1.12'
  },
  {
    id: 'aud-03',
    timestamp: '2026-10-13 11:30:05',
    userId: 'usr-5',
    userName: 'Subedar Major Ramesh Gurung',
    role: 'security_staff',
    action: 'INCIDENT_DISPATCH',
    module: 'Campus Incidents',
    details: 'Dispatched patrol unit for Case AIT-INC-2026-089 (Missing Cadet verification).',
    ipAddress: '192.168.1.5'
  },
  {
    id: 'aud-04',
    timestamp: '2026-10-13 09:00:15',
    userId: 'usr-1',
    userName: 'Col. Rajesh Bakshi (Retd.)',
    role: 'super_admin',
    action: 'SYSTEM_SETTINGS_SAVE',
    module: 'System Settings',
    details: 'Verified minimum attendance threshold at 45 mins / 60 min lecture period.',
    ipAddress: '192.168.1.2'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  lectureDurationMinutes: 60,
  minimumAttendanceThresholdMinutes: 45,
  defaultBelowThresholdHandling: 'FLAG_FOR_REVIEW',
  deployedMobileUrl: 'https://ait-virtual-campus.vercel.app/mobile',
  simulatedVisionLatencyMs: 120,
  enableLlmChatbot: false,
  llmApiKey: '',
  llmModelName: 'gemini-1.5-flash',
  retentionDaysAuditLogs: 90,
  demoDatasetActive: true
};

// ==========================================
// HOSTEL BUILDINGS & INFRASTRUCTURE
// ==========================================

export const INITIAL_HOSTEL_BUILDINGS: HostelBuilding[] = [
  {
    id: 'hb-01',
    name: 'Cariappa Hall (Boys Hostel)',
    type: 'boys',
    wardenName: 'Major Anil Rathore (Retd.)',
    wardenContact: '+91 98230 40011',
    totalCapacity: 250,
    currentOccupancy: 218,
    authorizedEntrances: [
      { id: 'ent-b01', name: 'Main Security Turnstile (East)', cameraCode: 'AIT-CAM-BH01', locationType: 'WEST_TURNSTILE' },
      { id: 'ent-b02', name: 'Courtyard Common Foyer', cameraCode: 'AIT-CAM-BH02', locationType: 'COMMON_FOYER' }
    ],
    blocks: [
      {
        id: 'blk-b01-a',
        buildingId: 'hb-01',
        name: 'Block A (Cadets Wing)',
        floors: [
          { id: 'fl-b1', blockId: 'blk-b01-a', floorNumber: 1, name: 'Ground Floor', totalRooms: 20 },
          { id: 'fl-b2', blockId: 'blk-b01-a', floorNumber: 2, name: 'First Floor', totalRooms: 20 },
          { id: 'fl-b3', blockId: 'blk-b01-a', floorNumber: 3, name: 'Second Floor', totalRooms: 20 }
        ]
      },
      {
        id: 'blk-b01-b',
        buildingId: 'hb-01',
        name: 'Block B (Seniors Wing)',
        floors: [
          { id: 'fl-b4', blockId: 'blk-b01-b', floorNumber: 1, name: 'Ground Floor', totalRooms: 20 },
          { id: 'fl-b5', blockId: 'blk-b01-b', floorNumber: 2, name: 'First Floor', totalRooms: 20 },
          { id: 'fl-b6', blockId: 'blk-b01-b', floorNumber: 3, name: 'Second Floor', totalRooms: 20 }
        ]
      }
    ]
  },
  {
    id: 'hb-02',
    name: 'Thimayya Hostel (Boys Wing)',
    type: 'boys',
    wardenName: 'Major Anil Rathore (Retd.)',
    wardenContact: '+91 98230 40011',
    totalCapacity: 180,
    currentOccupancy: 154,
    authorizedEntrances: [
      { id: 'ent-b03', name: 'North Portico Gate Turnstile', cameraCode: 'AIT-CAM-TH01', locationType: 'MAIN_GATE' }
    ],
    blocks: [
      {
        id: 'blk-b02-a',
        buildingId: 'hb-02',
        name: 'Main Block',
        floors: [
          { id: 'fl-t1', blockId: 'blk-b02-a', floorNumber: 1, name: 'Ground Floor', totalRooms: 25 },
          { id: 'fl-t2', blockId: 'blk-b02-a', floorNumber: 2, name: 'First Floor', totalRooms: 25 }
        ]
      }
    ]
  },
  {
    id: 'hg-01',
    name: 'Kalpana Chawla Bhavan (Girls Hostel)',
    type: 'girls',
    wardenName: 'Capt. Sangeeta Verma (Retd.)',
    wardenContact: '+91 98230 40022',
    totalCapacity: 300,
    currentOccupancy: 268,
    authorizedEntrances: [
      { id: 'ent-g01', name: 'Main Security Turnstile (North Entrance)', cameraCode: 'AIT-CAM-GH01', locationType: 'MAIN_GATE' },
      { id: 'ent-g02', name: 'Dining Hall Quadrangle Entrance', cameraCode: 'AIT-CAM-GH02', locationType: 'COMMON_FOYER' }
    ],
    blocks: [
      {
        id: 'blk-g01-a',
        buildingId: 'hg-01',
        name: 'Block A (Rani Laxmibai Wing)',
        floors: [
          { id: 'fl-g1', blockId: 'blk-g01-a', floorNumber: 1, name: 'Ground Floor', totalRooms: 25 },
          { id: 'fl-g2', blockId: 'blk-g01-a', floorNumber: 2, name: 'First Floor', totalRooms: 25 },
          { id: 'fl-g3', blockId: 'blk-g01-a', floorNumber: 3, name: 'Second Floor', totalRooms: 25 }
        ]
      },
      {
        id: 'blk-g01-b',
        buildingId: 'hg-01',
        name: 'Block B (Ahilyabai Wing)',
        floors: [
          { id: 'fl-g4', blockId: 'blk-g01-b', floorNumber: 1, name: 'Ground Floor', totalRooms: 25 },
          { id: 'fl-g5', blockId: 'blk-g01-b', floorNumber: 2, name: 'First Floor', totalRooms: 25 }
        ]
      }
    ]
  }
];

// Helper to generate normalized 128-dimensional embedding
const generateMockEmbedding = (seed: number): number[] => {
  const vec: number[] = [];
  let s = seed;
  for (let i = 0; i < 128; i++) {
    s = (s * 9301 + 49297) % 233280;
    vec.push(parseFloat((s / 233280 - 0.5).toFixed(4)));
  }
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map(v => parseFloat((v / norm).toFixed(4)));
};

// ==========================================
// PRE-REGISTERED FACE TEMPLATES (Biometric Storage)
// ==========================================

export const INITIAL_FACE_TEMPLATES: FaceTemplate[] = INITIAL_STUDENTS
  .filter(s => s.faceRegistrationStatus === 'REGISTERED')
  .map((s, idx) => ({
    id: `tmpl-${s.id}`,
    enrollmentNo: s.enrollmentNo,
    studentId: s.id,
    studentName: s.name,
    program: s.program,
    branch: s.branch,
    year: s.year,
    section: s.section || 'A',
    descriptor: generateMockEmbedding(idx + 101),
    descriptorConfidence: 94 + (idx % 5),
    sampleQuality: 'EXCELLENT',
    photoPreview: s.avatar,
    registeredAt: s.faceRegisteredAt || '2026-09-01 10:00:00',
    registeredBy: 'Dr. Sunita Kulkarni (Dean Academics)',
    consentSigned: true,
    consentTimestamp: '2026-09-01 09:55:00',
    status: 'REGISTERED',
    version: 1
  }));

// ==========================================
// HOSTEL RESIDENT ROSTER
// ==========================================

export const INITIAL_HOSTEL_RESIDENTS: HostelResident[] = [
  // Boys
  {
    id: 'res-b01',
    enrollmentNo: 'AIT/2021/CSE/001',
    studentId: 'stu-101',
    studentName: 'Aarav Sharma',
    hostelType: 'boys',
    buildingId: 'hb-01',
    buildingName: 'Cariappa Hall (Boys)',
    blockName: 'Block B (Seniors Wing)',
    floorNumber: 2,
    roomNumber: 'B-204',
    academicDetails: { program: 'B.Tech', branch: 'Computer Engineering', year: 4, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 11001',
    emergencyContact: '+91 98230 44101',
    currentStatus: 'ATTENDING_CLASSES',
    lastObservedAt: '2026-10-13 08:35:12',
    lastObservedLocation: 'Main Security Turnstile (East)'
  },
  {
    id: 'res-b02',
    enrollmentNo: 'AIT/2021/CSE/003',
    studentId: 'stu-103',
    studentName: 'Rohan Deshmukh',
    hostelType: 'boys',
    buildingId: 'hb-01',
    buildingName: 'Cariappa Hall (Boys)',
    blockName: 'Block B (Seniors Wing)',
    floorNumber: 2,
    roomNumber: 'B-205',
    academicDetails: { program: 'B.Tech', branch: 'Computer Engineering', year: 4, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 11003',
    emergencyContact: '+91 98230 44103',
    currentStatus: 'PRESENT_IN_HOSTEL',
    lastObservedAt: '2026-10-13 13:10:45',
    lastObservedLocation: 'Courtyard Common Foyer'
  },
  {
    id: 'res-b03',
    enrollmentNo: 'AIT/2021/CSE/005',
    studentId: 'stu-105',
    studentName: 'Vikram Singh Rathore',
    hostelType: 'boys',
    buildingId: 'hb-01',
    buildingName: 'Cariappa Hall (Boys)',
    blockName: 'Block B (Seniors Wing)',
    floorNumber: 3,
    roomNumber: 'B-301',
    academicDetails: { program: 'B.Tech', branch: 'Computer Engineering', year: 4, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 11005',
    emergencyContact: '+91 98230 44105',
    currentStatus: 'ATTENDING_CLASSES',
    lastObservedAt: '2026-10-13 08:42:00',
    lastObservedLocation: 'Main Security Turnstile (East)'
  },
  {
    id: 'res-b05',
    enrollmentNo: 'AIT/2022/ETC/015',
    studentId: 'stu-106',
    studentName: 'Ajay Malhan',
    hostelType: 'boys',
    buildingId: 'hb-01',
    buildingName: 'Cariappa Hall (Boys)',
    blockName: 'Block A (Cadets Wing)',
    floorNumber: 1,
    roomNumber: 'B-105',
    academicDetails: { program: 'B.Tech', branch: 'Electronics & Telecommunication', year: 3, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 13215',
    emergencyContact: '+91 98230 43215',
    currentStatus: 'PRESENT_IN_HOSTEL',
    lastObservedAt: '2026-10-13 12:45:20',
    lastObservedLocation: 'Main Security Turnstile (East)'
  },
  {
    id: 'res-b07',
    enrollmentNo: 'AIT/2023/ROBO/009',
    studentId: 'stu-108',
    studentName: 'Karan Thapar',
    hostelType: 'boys',
    buildingId: 'hb-01',
    buildingName: 'Cariappa Hall (Boys)',
    blockName: 'Block A (Cadets Wing)',
    floorNumber: 1,
    roomNumber: 'B-108',
    academicDetails: { program: 'B.Tech', branch: 'Robotics & Automation', year: 2, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 12409',
    emergencyContact: '+91 98230 42409',
    currentStatus: 'ATTENDING_CLASSES',
    lastObservedAt: '2026-10-13 08:30:15',
    lastObservedLocation: 'Main Security Turnstile (East)'
  },
  // Girls
  {
    id: 'res-g01',
    enrollmentNo: 'AIT/2021/CSE/002',
    studentId: 'stu-102',
    studentName: 'Pooja Nair',
    hostelType: 'girls',
    buildingId: 'hg-01',
    buildingName: 'Kalpana Chawla Bhavan (Girls)',
    blockName: 'Block A (Rani Laxmibai Wing)',
    floorNumber: 1,
    roomNumber: 'G-108',
    academicDetails: { program: 'B.Tech', branch: 'Computer Engineering', year: 4, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 11002',
    emergencyContact: '+91 98230 44102',
    currentStatus: 'ATTENDING_CLASSES',
    lastObservedAt: '2026-10-13 08:40:02',
    lastObservedLocation: 'Main Security Turnstile (North Entrance)'
  },
  {
    id: 'res-g02',
    enrollmentNo: 'AIT/2021/CSE/004',
    studentId: 'stu-104',
    studentName: 'Simran Kaur',
    hostelType: 'girls',
    buildingId: 'hg-01',
    buildingName: 'Kalpana Chawla Bhavan (Girls)',
    blockName: 'Block A (Rani Laxmibai Wing)',
    floorNumber: 1,
    roomNumber: 'G-110',
    academicDetails: { program: 'B.Tech', branch: 'Computer Engineering', year: 4, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 11004',
    emergencyContact: '+91 98230 44104',
    currentStatus: 'ATTENDING_CLASSES',
    lastObservedAt: '2026-10-13 08:38:19',
    lastObservedLocation: 'Main Security Turnstile (North Entrance)'
  },
  {
    id: 'res-g05',
    enrollmentNo: 'AIT/2022/ETC/018',
    studentId: 'stu-107',
    studentName: 'Ananya Roy',
    hostelType: 'girls',
    buildingId: 'hg-01',
    buildingName: 'Kalpana Chawla Bhavan (Girls)',
    blockName: 'Block A (Rani Laxmibai Wing)',
    floorNumber: 3,
    roomNumber: 'G-302',
    academicDetails: { program: 'B.Tech', branch: 'Electronics & Telecommunication', year: 3, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 13218',
    emergencyContact: '+91 98230 43218',
    currentStatus: 'PRESENT_IN_HOSTEL',
    lastObservedAt: '2026-10-13 13:05:10',
    lastObservedLocation: 'Dining Hall Quadrangle Entrance'
  },
  {
    id: 'res-g06',
    enrollmentNo: 'AIT/2023/ROBO/012',
    studentId: 'stu-113',
    studentName: 'Shruti Venkat',
    hostelType: 'girls',
    buildingId: 'hg-01',
    buildingName: 'Kalpana Chawla Bhavan (Girls)',
    blockName: 'Block B (Ahilyabai Wing)',
    floorNumber: 3,
    roomNumber: 'G-305',
    academicDetails: { program: 'B.Tech', branch: 'Robotics & Automation', year: 2, section: 'A' },
    faceRegistrationStatus: 'REGISTERED',
    allocatedDate: '2026-08-01',
    guardianContact: '+91 94220 12412',
    emergencyContact: '+91 98230 42412',
    currentStatus: 'ATTENDING_CLASSES',
    lastObservedAt: '2026-10-13 08:25:40',
    lastObservedLocation: 'Main Security Turnstile (North Entrance)'
  }
];

// ==========================================
// HOSTEL ENTRY / EXIT EVENT LOGS
// ==========================================

export const INITIAL_HOSTEL_EVENTS: HostelEventLog[] = [
  {
    id: 'he-01',
    hostelType: 'boys',
    buildingId: 'hb-01',
    locationName: 'Main Security Turnstile (East)',
    cameraId: 'AIT-CAM-BH01',
    enrollmentNo: 'AIT/2021/CSE/001',
    residentName: 'Aarav Sharma',
    eventType: 'EXIT',
    state: 'EXIT_EVENT_VERIFIED',
    timestamp: '2026-10-13 08:35:12',
    confidenceScore: 96,
    verified: true,
    reviewRequired: false,
    direction: 'OUTWARD'
  },
  {
    id: 'he-02',
    hostelType: 'boys',
    buildingId: 'hb-01',
    locationName: 'Main Security Turnstile (East)',
    cameraId: 'AIT-CAM-BH01',
    enrollmentNo: 'AIT/2021/CSE/005',
    residentName: 'Vikram Singh Rathore',
    eventType: 'EXIT',
    state: 'EXIT_EVENT_VERIFIED',
    timestamp: '2026-10-13 08:42:00',
    confidenceScore: 92,
    verified: true,
    reviewRequired: false,
    direction: 'OUTWARD'
  },
  {
    id: 'he-03',
    hostelType: 'boys',
    buildingId: 'hb-01',
    locationName: 'Courtyard Common Foyer',
    cameraId: 'AIT-CAM-BH02',
    enrollmentNo: 'AIT/2021/CSE/003',
    residentName: 'Rohan Deshmukh',
    eventType: 'PASSING_OBSERVATION',
    state: 'OBSERVED_AT_ENTRANCE',
    timestamp: '2026-10-13 13:10:45',
    confidenceScore: 89,
    verified: true,
    reviewRequired: false,
    direction: 'INWARD'
  },
  {
    id: 'he-04',
    hostelType: 'boys',
    buildingId: 'hb-01',
    locationName: 'Main Security Turnstile (East)',
    cameraId: 'AIT-CAM-BH01',
    enrollmentNo: 'AIT/2022/ETC/015',
    residentName: 'Ajay Malhan',
    eventType: 'ENTRY',
    state: 'ENTRY_EVENT_VERIFIED',
    timestamp: '2026-10-13 12:45:20',
    confidenceScore: 98,
    verified: true,
    reviewRequired: false,
    direction: 'INWARD'
  },
  {
    id: 'he-05',
    hostelType: 'girls',
    buildingId: 'hg-01',
    locationName: 'Main Security Turnstile (North Entrance)',
    cameraId: 'AIT-CAM-GH01',
    enrollmentNo: 'AIT/2021/CSE/002',
    residentName: 'Pooja Nair',
    eventType: 'EXIT',
    state: 'EXIT_EVENT_VERIFIED',
    timestamp: '2026-10-13 08:40:02',
    confidenceScore: 97,
    verified: true,
    reviewRequired: false,
    direction: 'OUTWARD'
  },
  {
    id: 'he-06',
    hostelType: 'girls',
    buildingId: 'hg-01',
    locationName: 'Main Security Turnstile (North Entrance)',
    cameraId: 'AIT-CAM-GH01',
    enrollmentNo: 'AIT/2021/CSE/004',
    residentName: 'Simran Kaur',
    eventType: 'EXIT',
    state: 'EXIT_EVENT_VERIFIED',
    timestamp: '2026-10-13 08:38:19',
    confidenceScore: 95,
    verified: true,
    reviewRequired: false,
    direction: 'OUTWARD'
  },
  {
    id: 'he-07',
    hostelType: 'girls',
    buildingId: 'hg-01',
    locationName: 'Dining Hall Quadrangle Entrance',
    cameraId: 'AIT-CAM-GH02',
    enrollmentNo: 'AIT/2022/ETC/018',
    residentName: 'Ananya Roy',
    eventType: 'ENTRY',
    state: 'ENTRY_EVENT_VERIFIED',
    timestamp: '2026-10-13 13:05:10',
    confidenceScore: 93,
    verified: true,
    reviewRequired: false,
    direction: 'INWARD'
  }
];

// ==========================================
// UNKNOWN FACE REVIEW QUEUE
// ==========================================

export const INITIAL_UNKNOWN_FACES: UnknownFaceRecord[] = [
  {
    id: 'unk-01',
    sessionType: 'classroom',
    sessionId: 'sess-cr-101',
    locationName: 'Lecture Hall LH-101 (CSE Smart Room)',
    timestamp: '2026-10-13 14:12:05',
    snapshotPreview: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    estimatedAgeGender: 'Male, approx 21 yrs',
    status: 'PENDING_REVIEW',
    notes: 'Detected in row 3 during Period 3 CS-401 lecture. Match confidence 42% (below threshold).'
  },
  {
    id: 'unk-02',
    sessionType: 'boys_hostel',
    sessionId: 'sess-bh-01',
    locationName: 'Cariappa Hall Main Turnstile (East)',
    timestamp: '2026-10-13 15:45:30',
    snapshotPreview: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    estimatedAgeGender: 'Male, approx 23 yrs',
    status: 'PENDING_REVIEW',
    notes: 'Attempted turnstile passage without RFID badge or confirmed biometric enrollment.'
  },
  {
    id: 'unk-03',
    sessionType: 'girls_hostel',
    sessionId: 'sess-gh-01',
    locationName: 'Kalpana Chawla Bhavan North Turnstile',
    timestamp: '2026-10-13 16:02:18',
    snapshotPreview: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    estimatedAgeGender: 'Female, approx 28 yrs (Visiting Staff?)',
    status: 'PENDING_REVIEW',
    notes: 'Accompanied guest / delivery personnel in foyer corridor. Unmatched biometric template.'
  }
];

// ==========================================
// ACTIVE CAMERA SESSIONS
// ==========================================

export const INITIAL_CAMERA_SESSIONS: CameraSession[] = [
  {
    id: 'sess-cr-101',
    purpose: 'CLASSROOM',
    locationName: 'Lecture Hall LH-101 (Ramanujan Wing)',
    cameraId: 'cam-03',
    cameraName: 'LH-101 Overhead High-Resolution Camera',
    startedAt: '2026-10-13 14:00:00',
    status: 'ACTIVE',
    operatorId: 'usr-3',
    operatorName: 'Prof. Vikramaditya Sharma',
    subjectId: 'sub-cse-401',
    subjectName: 'Deep Learning & Neural Networks (CS-401)',
    academicYear: 4,
    program: 'B.Tech',
    branch: 'Computer Engineering',
    section: 'A',
    scheduledPeriod: 3,
    activeRosterCount: 8,
    recognizedCount: 5,
    unknownDetectionsCount: 1,
    deviceType: 'WEBCAM',
    sessionToken: 'ait-cr-sess-94821a'
  },
  {
    id: 'sess-bh-01',
    purpose: 'BOYS_HOSTEL_ENTRANCE',
    locationName: 'Cariappa Hall - Main Security Turnstile',
    cameraId: 'AIT-CAM-BH01',
    cameraName: 'Cariappa Hall East Entrance Turnstile Cam',
    startedAt: '2026-10-13 06:00:00',
    status: 'ACTIVE',
    operatorId: 'usr-sec-operator',
    operatorName: 'Havaldar Balbir Singh',
    hostelBuildingId: 'hb-01',
    hostelBuildingName: 'Cariappa Hall (Boys Hostel)',
    activeRosterCount: 5,
    recognizedCount: 4,
    unknownDetectionsCount: 1,
    deviceType: 'CCTV_STREAM',
    sessionToken: 'ait-bh-sess-33190b'
  },
  {
    id: 'sess-gh-01',
    purpose: 'GIRLS_HOSTEL_ENTRANCE',
    locationName: 'Kalpana Chawla Bhavan - Main North Security Checkpoint',
    cameraId: 'AIT-CAM-GH01',
    cameraName: 'Kalpana Chawla North Entrance Face Scanner',
    startedAt: '2026-10-13 06:00:00',
    status: 'ACTIVE',
    operatorId: 'usr-gh-warden',
    operatorName: 'Capt. Sangeeta Verma (Retd.)',
    hostelBuildingId: 'hg-01',
    hostelBuildingName: 'Kalpana Chawla Bhavan (Girls Hostel)',
    activeRosterCount: 4,
    recognizedCount: 3,
    unknownDetectionsCount: 1,
    deviceType: 'CCTV_STREAM',
    sessionToken: 'ait-gh-sess-77218g'
  }
];

// ==========================================
// INTELLIGENT LOST & FOUND & CCTV DATASET
// ==========================================

export const INITIAL_LOST_ITEMS: LostItemReport[] = [
  {
    id: 'LOST-2026-0101',
    userId: 'stu-102',
    reporterName: 'Pooja Nair',
    reporterRole: 'student',
    reporterContact: 'pooja.nair@aitpune.edu.in',
    itemName: 'Apple AirPods Pro (2nd Gen) with Sky Blue Case',
    category: 'Earbuds and AirPods',
    brand: 'Apple',
    color: 'White (Sky Blue silicone sleeve)',
    description: 'White AirPods Pro Gen 2 in a sky blue protective case with a small metal carabiner clip. Right earbud has a minor scuff near the microphone stem.',
    distinctiveFeatures: "Case has small gold initial 'P' etched on metal clip. Bluetooth device name shows as 'Pooja AirPods Pro'.",
    lastKnownLocation: 'Central Library 2nd Floor Reading Room (Table 14 near east window)',
    campusZone: 'Academic Block A / Central Library',
    dateLost: '2026-10-13',
    approximateTime: '14:15',
    photoUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80',
    additionalInfo: 'Contains serial number ending in 9J2Q. Was studying Deep Learning CS-401 lecture notes.',
    status: 'POTENTIAL_MATCH_FOUND',
    createdAt: '2026-10-13 14:40:00',
    updatedAt: '2026-10-13 15:35:00',
    matchedFoundItemIds: ['FOUND-2026-0201']
  },
  {
    id: 'LOST-2026-0102',
    userId: 'stu-101',
    reporterName: 'Aarav Sharma',
    reporterRole: 'student',
    reporterContact: 'aarav.sharma@aitpune.edu.in',
    itemName: 'Navy Blue Wildcraft 32L Backpack',
    category: 'Bags and backpacks',
    brand: 'Wildcraft',
    color: 'Navy Blue & Slate Grey',
    description: '32-liter water-resistant laptop backpack containing spiral-bound neural networks notes, TI scientific calculator, and blue umbrella.',
    distinctiveFeatures: 'AIT Institute emblem embroidered patch stitched onto upper zipper pocket.',
    lastKnownLocation: 'Corridor Bench outside Lecture Hall LH-101 (Ramanujan Wing)',
    campusZone: 'Academic Block A',
    dateLost: '2026-10-13',
    approximateTime: '12:50',
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
    additionalInfo: 'Laptop was taken inside class, but bag with books was left on the corridor stone bench.',
    status: 'CCTV_SEARCHING',
    createdAt: '2026-10-13 13:15:00',
    updatedAt: '2026-10-13 13:45:00',
    cctvRequestId: 'CCTV-REQ-2026-001'
  },
  {
    id: 'LOST-2026-0103',
    userId: 'stu-105',
    reporterName: 'Vikram Singh Rathore',
    reporterRole: 'student',
    reporterContact: 'vikram.singh@aitpune.edu.in',
    itemName: 'Titan Octane Chronograph Watch',
    category: 'Watches and jewellery',
    brand: 'Titan',
    color: 'Silver Metallic / Navy Blue Dial',
    description: 'Stainless steel metallic chain watch with dark navy dial, stopwatch sub-dials, and date display window.',
    distinctiveFeatures: "Minor hairline scratch near 4 o'clock marker. Deployment clasp engraved with Titan logo.",
    lastKnownLocation: 'Sports Complex & Synthetic Badminton Court Bench',
    campusZone: 'Sports Complex',
    dateLost: '2026-10-12',
    approximateTime: '17:40',
    photoUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&auto=format&fit=crop&q=80',
    additionalInfo: 'Removed during inter-year badminton trials. Discovered missing after evening mess.',
    status: 'CCTV_REQUESTED',
    createdAt: '2026-10-12 19:20:00',
    updatedAt: '2026-10-12 19:30:00',
    cctvRequestId: 'CCTV-REQ-2026-002'
  },
  {
    id: 'LOST-2026-0104',
    userId: 'usr-6',
    reporterName: 'Ajay Malhan',
    reporterRole: 'student',
    reporterContact: 'amalhan_21045@aitpune.edu.in',
    itemName: 'RFID Smart Student Identity Card',
    category: 'Student ID cards',
    brand: 'AIT Pune',
    color: 'White card with Navy Blue Lanyard',
    description: 'AIT Student ID card with barcode and biometric turnstile RFID tag for Academic Year 2026-27.',
    distinctiveFeatures: 'Reg Number AIT/2022/ETC/015 printed on reverse. Small orange access sticker.',
    lastKnownLocation: 'Central Spine / Academic Boulevard near Vijayanta Tank Memorial',
    campusZone: 'Central Spine',
    dateLost: '2026-10-13',
    approximateTime: '10:00',
    photoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    additionalInfo: 'Crucial for hostel turnstile access and library check-out.',
    status: 'REPORTED',
    createdAt: '2026-10-13 10:30:00',
    updatedAt: '2026-10-13 10:30:00'
  }
];

export const INITIAL_FOUND_ITEMS: FoundItemReport[] = [
  {
    id: 'FOUND-2026-0201',
    finderId: 'stu-103',
    finderName: 'Rohan Deshmukh',
    finderRole: 'student',
    itemName: 'Apple AirPods in Sky Blue Case',
    category: 'Earbuds and AirPods',
    brand: 'Apple',
    color: 'White earbuds with light blue case',
    description: 'Found left behind on study desk in 2nd floor library reading section next to terminal 14.',
    locationFound: 'Central Library 2nd Floor Reading Room',
    campusZone: 'Academic Block A / Central Library',
    dateFound: '2026-10-13',
    approximateTime: '15:20',
    photoUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80',
    holdingLocation: 'Central Library Front Helpdesk (Librarian Counter)',
    collectionInstructions: 'Deposited with Assistant Librarian Mr. Deshmukh. Claimant must connect with their registered phone or verify the engraved initial on the clip.',
    status: 'CLAIM_PENDING',
    createdAt: '2026-10-13 15:30:00',
    updatedAt: '2026-10-13 15:35:00'
  },
  {
    id: 'FOUND-2026-0202',
    finderId: 'usr-sec-operator',
    finderName: 'Havaldar Balbir Singh',
    finderRole: 'security_operator',
    itemName: 'Milton Thermosteel Water Bottle (1000ml)',
    category: 'Water bottles',
    brand: 'Milton',
    color: 'Matte Black',
    description: '1-litre insulated steel water flask with flip sipper lid and black textured powder coating.',
    locationFound: 'Cadets Mess Dining Hall (Table 8 near water dispenser)',
    campusZone: 'Amenities / Dining Complex',
    dateFound: '2026-10-13',
    approximateTime: '13:20',
    photoUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
    holdingLocation: 'Mess Security Reception Counter (Dining Complex Gate)',
    collectionInstructions: 'Present student ID and describe sticker markings on base to Havaldar Balbir Singh.',
    status: 'REPORTED',
    createdAt: '2026-10-13 13:30:00',
    updatedAt: '2026-10-13 13:30:00'
  },
  {
    id: 'FOUND-2026-0203',
    finderId: 'usr-5',
    finderName: 'Subedar Major Ramesh Gurung',
    finderRole: 'security_staff',
    itemName: 'Wildhorn Genuine Leather Bifold Wallet',
    category: 'Wallets and purses',
    brand: 'Wildhorn',
    color: 'Dark Brown',
    description: 'Brown leather bifold wallet discovered on park bench near Vijayanta Tank Memorial. Contains currency and keys (confidential details withheld for ownership verification).',
    locationFound: 'Academic Boulevard (Opposite Tank Memorial)',
    campusZone: 'Central Spine',
    dateFound: '2026-10-13',
    approximateTime: '10:15',
    photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=80',
    holdingLocation: 'Campus Main Gate Security Command Post',
    collectionInstructions: 'Report to Chief Security Post (Main Gate). Owner must state exact currency breakdown and keys attached inside.',
    status: 'REPORTED',
    createdAt: '2026-10-13 10:25:00',
    updatedAt: '2026-10-13 10:25:00'
  },
  {
    id: 'FOUND-2026-0204',
    finderId: 'usr-2',
    finderName: 'Dr. Sunita Kulkarni',
    finderRole: 'campus_admin',
    itemName: 'AIT Student Smart RFID Card',
    category: 'Student ID cards',
    brand: 'AIT Pune',
    color: 'White / Navy Blue Ribbon',
    description: 'RFID student access identity card discovered on workshop drafting table.',
    locationFound: 'Mechanical Workshop Block 2 Entrance',
    campusZone: 'Workshop Complex',
    dateFound: '2026-10-13',
    approximateTime: '11:45',
    photoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    holdingLocation: 'Dean Academics Office (Administrative Block Room 104)',
    collectionInstructions: 'Collect during office hours 10:00 - 17:00 with proof of registration.',
    status: 'REPORTED',
    createdAt: '2026-10-13 12:00:00',
    updatedAt: '2026-10-13 12:00:00'
  }
];

export const INITIAL_CCTV_REQUESTS: CctvSearchRequest[] = [
  {
    id: 'CCTV-REQ-2026-001',
    lostReportId: 'LOST-2026-0102',
    requesterId: 'stu-101',
    requesterName: 'Aarav Sharma',
    requesterRole: 'student',
    itemName: 'Navy Blue Wildcraft 32L Backpack',
    category: 'Bags and backpacks',
    itemDescription: 'Navy blue 32L backpack with spiral notes and TI calculator left on corridor stone bench.',
    lastKnownLocation: 'Corridor Bench outside Lecture Hall LH-101 (Ramanujan Wing)',
    preferredCameraId: 'cam-03',
    preferredCameraName: 'Lecture Hall LH-101 (CSE Smart Room & Corridor)',
    preferredCameraCode: 'AIT-CAM-CR101',
    incidentDate: '2026-10-13',
    requestedStartTime: '12:45',
    requestedEndTime: '14:15',
    purpose: 'Locate missing Wildcraft backpack forgotten on corridor bench during period 3 lecture shift.',
    monitoredAreaDetail: 'East stone bench directly in front of LH-101 entrance door.',
    additionalInfo: 'Contains vital semester 7 project notebooks and TI calculator.',
    status: 'Footage Available',
    submittedAt: '2026-10-13 13:20:00',
    reviewedBy: 'Subedar Major Ramesh Gurung (Chief Security Officer)',
    reviewedAt: '2026-10-13 13:40:00',
    reviewDecisionReason: 'Legitimate academic recovery request verified. Time range restricted to 90 minutes. Sensitive bystander blurring enabled.',
    approvedStartTime: '12:45',
    approvedEndTime: '14:15',
    accessExpiresAt: '2026-10-14 23:59:00',
    sampleVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    sightings: [
      {
        id: 'st-01',
        timestampOffsetSeconds: 760,
        formattedTimestamp: '13:12:40',
        cameraLocation: 'LH-101 North-East Corridor Frustum',
        notes: 'Cadet in crimson hoodie was observed picking up navy backpack from bench and heading towards Ramanujan stairway.',
        confidence: 'HIGH',
        recordedBy: 'Aarav Sharma',
        recordedAt: '2026-10-13 13:55:20',
        snapshotUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&auto=format&fit=crop&q=80'
      }
    ],
    finalResult: 'Possible Sighting',
    finalResultNotes: 'Security staff notified of crimson hoodie student movement on Stairway 2 camera.'
  },
  {
    id: 'CCTV-REQ-2026-002',
    lostReportId: 'LOST-2026-0103',
    requesterId: 'stu-105',
    requesterName: 'Vikram Singh Rathore',
    requesterRole: 'student',
    itemName: 'Titan Octane Chronograph Watch',
    category: 'Watches and jewellery',
    itemDescription: 'Stainless steel metallic chain watch with navy dial and sub-dials.',
    lastKnownLocation: 'Sports Complex & Synthetic Badminton Court Bench',
    preferredCameraId: 'cam-05',
    preferredCameraName: 'Manekshaw Auditorium / Sports Promenade',
    preferredCameraCode: 'AIT-CAM-AUD05',
    incidentDate: '2026-10-12',
    requestedStartTime: '17:30',
    requestedEndTime: '18:45',
    purpose: 'Investigate if watch was picked up from courtside bench after inter-year badminton trials.',
    monitoredAreaDetail: 'Courtside players rest bench near equipment locker.',
    additionalInfo: 'High sentimental value gift from family.',
    status: 'Under Review',
    submittedAt: '2026-10-12 19:35:00',
    sightings: []
  }
];

export const INITIAL_CLAIMS: ItemClaim[] = [
  {
    id: 'CLM-2026-001',
    foundItemId: 'FOUND-2026-0201',
    foundItemName: 'Apple AirPods in Sky Blue Case',
    lostReportId: 'LOST-2026-0101',
    claimantId: 'stu-102',
    claimantName: 'Pooja Nair',
    claimantEmail: 'pooja.nair@aitpune.edu.in',
    proofOfOwnership: "The silicone case has a small gold initial 'P' etched on the metal carabiner clip. Bluetooth device name shows as 'Pooja AirPods Pro' and serial number ends in 9J2Q.",
    proofPhotoUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&auto=format&fit=crop&q=80',
    status: 'UNDER_VERIFICATION',
    submittedAt: '2026-10-13 15:45:00',
    verifiedBy: 'Dr. Sunita Kulkarni',
    decisionNotes: 'Librarian requested claimant to visit helpdesk with phone to pair and confirm Bluetooth identity.',
    handoverLocation: 'Central Library Front Helpdesk (Librarian Counter)'
  }
];

