// Type definitions for AIT Smart Campus AI Prototype

export type UserRole = 
  | 'super_admin' 
  | 'campus_admin' 
  | 'faculty' 
  | 'boys_hostel_warden' 
  | 'girls_hostel_warden' 
  | 'security_operator' 
  | 'security_staff' 
  | 'readonly_viewer' 
  | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  designation?: string;
  assignedSubjects?: string[]; // Subject IDs
  assignedClassrooms?: string[]; // Classroom IDs
  assignedHostel?: 'boys' | 'girls' | 'both';
}

export type CameraMode = 'webcam' | 'sample_video' | 'simulated';

export interface CameraLocation {
  id: string;
  name: string;
  zone: string;
  cameraCode: string;
  status: 'ACTIVE' | 'WARNING' | 'OFFLINE';
  mode: CameraMode;
  lastUpdated: string;
  currentOccupancy: number;
  maxCapacity: number;
  sampleVideoUrl?: string;
  assignedDeviceLabel?: string;
  hasMotion: boolean;
  density: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  pedestrianCountIn: number;
  pedestrianCountOut: number;
  notes?: string;
}

export interface Student {
  id: string;
  enrollmentNo: string; // Unique enrollment number, e.g. "AIT/2023/CSE/042"
  regNo: string;
  rollNo: string;
  name: string;
  program: 'B.Tech' | 'M.Tech';
  branch: string;
  year: number; // 1, 2, 3, 4
  semester: number; // 1 to 8
  section?: string; // 'A', 'B', etc.
  email: string;
  cgpa: number;
  attendanceRate: number; // percentage
  status: 'ACTIVE' | 'DETENTION_WARNING' | 'ON_LEAVE';
  avatar: string;
  phone: string;
  guardianPhone: string;
  enrolledSubjectIds: string[];
  hostelAllocationId?: string;
  hostelBuilding?: string;
  hostelRoom?: string;
  faceRegistrationStatus?: 'REGISTERED' | 'UNREGISTERED' | 'FAILED';
  faceRegisteredAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  classroomId: string;
  date: string; // YYYY-MM-DD
  period: number; // 1, 2, 3, 4, 5, 6
  facultyId: string;
  totalLectureMinutes: number; // 60 mins standard
  verifiedPresenceMinutes: number; // minutes detected
  status: 'FULL_ATTENDANCE' | 'BELOW_THRESHOLD' | 'ABSENT';
  thresholdMinutes: number; // default 45
  timeline: number[]; // 60 slots (1 = present, 0 = absent per minute)
  isManuallyCorrected: boolean;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
}

export interface ProgramStructure {
  id: string;
  name: string; // "B.Tech" or "M.Tech"
  code: string;
  totalYears: number;
  branches: {
    id: string;
    name: string;
    code: string;
    hod: string;
  }[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  program: 'B.Tech' | 'M.Tech';
  branch: string;
  semester: number;
  credits: number;
  facultyId: string;
  facultyName: string;
  classroomDefaultId: string;
}

export interface Classroom {
  id: string;
  roomNumber: string;
  block: string;
  capacity: number;
  currentOccupancy: number;
  cameraId: string;
  hasProjector: boolean;
  hasSmartBoard: boolean;
}

export interface FacultyAssessmentReport {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  internalTest1: number; // out of 30
  internalTest2: number; // out of 30
  assignmentScore: number; // out of 20
  attendanceScore: number; // out of 20
  totalScore: number; // out of 100
  academicRemarks: string;
  followUpRequired: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export interface ParkingZone {
  id: string;
  name: string;
  category: 'FOUR_WHEELER' | 'TWO_WHEELER' | 'FACULTY_VIP' | 'VISITOR';
  totalSpaces: number;
  occupiedSpaces: number;
  reservedSpaces: number;
  vehiclesEnteringPerHour: number;
  vehiclesExitingPerHour: number;
  vehicles: {
    id: string;
    slotNumber: string;
    type: 'car' | 'motorcycle' | 'scooter' | 'bicycle';
    isOccupied: boolean;
    entryTime?: string;
    vehiclePlateMasked?: string;
  }[];
}

export interface CampusRoute {
  id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
  status: 'CLEAR' | 'BUSY' | 'BLOCKED';
  distanceMeters: number;
  walkTimeMinutes: number;
  congestionLevel: number; // 0 - 100%
  alternateRoute?: string;
  activeHazards?: string;
  coordinates: { x: number; y: number }[];
}

export interface IncidentReport {
  id: string;
  caseNumber: string;
  category: 'MISSING_PERSON' | 'UNAUTHORIZED_ENTRY' | 'ROUTE_BLOCKAGE' | 'CROWD_SAFETY' | 'ASSISTANCE_REQ';
  title: string;
  description: string;
  location: string;
  reportedTime: string;
  status: 'OPEN' | 'INVESTIGATING' | 'VERIFIED_RESOLVED' | 'CLOSED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reportedBy: string;
  assignedOfficer: string;
  // Missing person specifics
  personName?: string;
  personType?: 'Student' | 'Staff' | 'Visitor';
  personPhoto?: string;
  lastKnownLocation?: string;
  lastSeenTimestamp?: string;
  contactNumber?: string;
  investigationNotes: {
    id: string;
    timestamp: string;
    officer: string;
    note: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface SystemSettings {
  lectureDurationMinutes: number;
  minimumAttendanceThresholdMinutes: number;
  defaultBelowThresholdHandling: 'MARK_ABSENT' | 'FLAG_FOR_REVIEW' | 'PRO_RATA_CREDIT';
  deployedMobileUrl: string;
  simulatedVisionLatencyMs: number;
  enableLlmChatbot: boolean;
  llmApiKey: string;
  llmModelName: string;
  retentionDaysAuditLogs: number;
  demoDatasetActive: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isDemoDataNotice?: boolean;
  suggestedPrompts?: string[];
  dataContext?: {
    type: string;
    recordsFound: number;
    source: string;
  };
}

// ==========================================
// DYNAMIC FACE RECOGNITION & ATTENDANCE EXTENSIONS
// ==========================================

export interface FaceTemplate {
  id: string;
  enrollmentNo: string;
  studentId: string;
  studentName: string;
  program: string;
  branch: string;
  year: number;
  section: string;
  descriptor: number[]; // 128-dimensional embedding vector
  descriptorConfidence: number;
  sampleQuality: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR';
  photoPreview?: string; // thumbnail data URL or avatar
  registeredAt: string;
  registeredBy: string;
  consentSigned: boolean;
  consentTimestamp: string;
  status: 'REGISTERED' | 'UNREGISTERED' | 'FAILED';
  version: number;
}

export type HostelType = 'boys' | 'girls';

export interface HostelBuilding {
  id: string;
  name: string;
  type: HostelType;
  wardenName: string;
  wardenContact: string;
  totalCapacity: number;
  currentOccupancy: number;
  blocks: HostelBlock[];
  authorizedEntrances: {
    id: string;
    name: string;
    cameraCode: string;
    locationType: 'MAIN_GATE' | 'WEST_TURNSTILE' | 'COMMON_FOYER';
  }[];
}

export interface HostelBlock {
  id: string;
  buildingId: string;
  name: string;
  floors: HostelFloor[];
}

export interface HostelFloor {
  id: string;
  blockId: string;
  floorNumber: number;
  name: string;
  totalRooms: number;
}

export interface HostelRoom {
  id: string;
  buildingId: string;
  blockId: string;
  floorNumber: number;
  roomNumber: string;
  capacity: number;
  currentResidents: number;
}

export interface HostelResident {
  id: string;
  enrollmentNo: string;
  studentId: string;
  studentName: string;
  hostelType: HostelType;
  buildingId: string;
  buildingName: string;
  blockName: string;
  floorNumber: number;
  roomNumber: string;
  academicDetails: {
    program: string;
    branch: string;
    year: number;
    section: string;
  };
  faceRegistrationStatus: 'REGISTERED' | 'UNREGISTERED' | 'FAILED';
  allocatedDate: string;
  guardianContact: string;
  emergencyContact: string;
  currentStatus: 'PRESENT_IN_HOSTEL' | 'OUTSIDE_CAMPUS' | 'ATTENDING_CLASSES' | 'LEAVE_AUTHORIZED' | 'UNKNOWN';
  lastObservedAt?: string;
  lastObservedLocation?: string;
}

export type HostelEventState = 
  | 'OBSERVED_AT_ENTRANCE'
  | 'ENTRY_EVENT_VERIFIED'
  | 'EXIT_EVENT_VERIFIED'
  | 'CURRENT_PRESENCE_UNKNOWN'
  | 'REVIEW_REQUIRED';

export interface HostelEventLog {
  id: string;
  hostelType: HostelType;
  buildingId: string;
  locationName: string; // e.g. "Main West Security Turnstile"
  cameraId: string;
  enrollmentNo: string;
  residentName: string;
  eventType: 'ENTRY' | 'EXIT' | 'PASSING_OBSERVATION';
  state: HostelEventState;
  timestamp: string;
  confidenceScore: number;
  snapshotUrl?: string;
  verified: boolean;
  reviewRequired: boolean;
  reviewedBy?: string;
  reviewDecision?: string;
  reviewNote?: string;
  direction: 'INWARD' | 'OUTWARD' | 'UNKNOWN';
  manualCorrectionReason?: string;
}

export interface UnknownFaceRecord {
  id: string;
  sessionType: 'classroom' | 'boys_hostel' | 'girls_hostel';
  sessionId: string;
  locationName: string;
  timestamp: string;
  snapshotPreview: string; // thumbnail or placeholder
  estimatedAgeGender?: string;
  status: 'PENDING_REVIEW' | 'IDENTIFIED' | 'DISMISSED_VISITOR' | 'FLAGGED_ALERT';
  identifiedEnrollmentNo?: string;
  assignedStudentName?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface ObservationInterval {
  startMinute: number;
  endMinute: number;
  startIso: string;
  endIso: string;
  confidenceAverage: number;
}

export interface ClassroomFaceAttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  enrollmentNo: string;
  studentName: string;
  rollNo: string;
  program: string;
  branch: string;
  year: number;
  section: string;
  subjectCode: string;
  subjectName: string;
  firstVerifiedObservation: string | null;
  latestVerifiedObservation: string | null;
  observationIntervals: ObservationInterval[];
  accumulatedObservedMinutes: number;
  lectureDurationMinutes: number; // default 60
  attendanceStatus: 'FULL_ATTENDANCE' | 'BELOW_THRESHOLD' | 'UNVERIFIED_REVIEW';
  reviewStatus: 'VERIFIED' | 'PENDING_FACULTY_REVIEW' | 'FACULTY_OVERRIDDEN' | 'DISMISSED';
  overrideReason?: string;
  overriddenBy?: string;
  observationsHistory: {
    timestamp: string;
    confidence: number;
    matchType: 'BIOMETRIC_MODEL' | 'MANUAL_VERIFIED' | 'SIMULATED_DEMO';
  }[];
}

export interface CameraSession {
  id: string;
  purpose: 'CLASSROOM' | 'BOYS_HOSTEL_ENTRANCE' | 'GIRLS_HOSTEL_ENTRANCE' | 'CAMPUS_PERIMETER';
  locationName: string;
  cameraId: string;
  cameraName: string;
  startedAt: string;
  endedAt?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONNECTED';
  operatorId: string;
  operatorName: string;
  subjectId?: string;
  subjectName?: string;
  academicYear?: number;
  program?: string;
  branch?: string;
  section?: string;
  scheduledPeriod?: number;
  hostelBuildingId?: string;
  hostelBuildingName?: string;
  activeRosterCount: number;
  recognizedCount: number;
  unknownDetectionsCount: number;
  deviceType: 'WEBCAM' | 'MOBILE_QR' | 'CCTV_STREAM' | 'SAMPLE_VIDEO';
  sessionToken: string;
}

// ==========================================
// INTELLIGENT LOST & FOUND & CCTV RECOVERY
// ==========================================

export type LostAndFoundCategory = 
  | 'Earbuds and AirPods'
  | 'Mobile phones'
  | 'Water bottles'
  | 'Wallets and purses'
  | 'Bags and backpacks'
  | 'Keys'
  | 'Student ID cards'
  | 'Books and notebooks'
  | 'Chargers and electronic accessories'
  | 'Watches and jewellery'
  | 'Clothing'
  | 'Other items';

export type LostItemStatus = 
  | 'REPORTED'
  | 'POTENTIAL_MATCH_FOUND'
  | 'CCTV_REQUESTED'
  | 'CCTV_SEARCHING'
  | 'CLAIM_IN_PROGRESS'
  | 'RECOVERED'
  | 'CLOSED';

export type FoundItemStatus = 
  | 'REPORTED'
  | 'CLAIM_PENDING'
  | 'CLAIM_VERIFIED'
  | 'RETURNED_TO_OWNER'
  | 'UNCLAIMED_DISPOSED';

export interface LostItemReport {
  id: string; // e.g. "LOST-2026-0101"
  userId: string;
  reporterName: string;
  reporterRole: UserRole;
  reporterContact?: string;
  itemName: string;
  category: LostAndFoundCategory;
  brand: string;
  color: string;
  description: string;
  distinctiveFeatures: string;
  lastKnownLocation: string;
  campusZone: string;
  dateLost: string; // YYYY-MM-DD
  approximateTime: string; // e.g. "14:30"
  photoUrl?: string;
  additionalInfo?: string;
  status: LostItemStatus;
  createdAt: string;
  updatedAt: string;
  matchedFoundItemIds?: string[];
  cctvRequestId?: string;
}

export interface FoundItemReport {
  id: string; // e.g. "FOUND-2026-0201"
  finderId: string;
  finderName: string;
  finderRole: UserRole;
  itemName: string;
  category: LostAndFoundCategory;
  brand?: string;
  color?: string;
  description: string;
  locationFound: string;
  campusZone: string;
  dateFound: string; // YYYY-MM-DD
  approximateTime: string; // e.g. "15:15"
  photoUrl?: string;
  holdingLocation: string; // e.g. "Security Desk (Main Gate)"
  collectionInstructions: string;
  status: FoundItemStatus;
  createdAt: string;
  updatedAt: string;
}

export type CctvRequestStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Search in Progress'
  | 'Footage Available'
  | 'Search Completed'
  | 'Expired';

export interface CctvSearchRequest {
  id: string; // e.g. "CCTV-REQ-2026-001"
  lostReportId: string;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  itemName: string;
  category: LostAndFoundCategory;
  itemDescription: string;
  lastKnownLocation: string;
  preferredCameraId: string;
  preferredCameraName: string;
  preferredCameraCode: string;
  incidentDate: string; // YYYY-MM-DD
  requestedStartTime: string; // "14:00"
  requestedEndTime: string; // "15:30"
  purpose: string;
  monitoredAreaDetail?: string;
  additionalInfo?: string;
  status: CctvRequestStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewDecisionReason?: string;
  approvedStartTime?: string;
  approvedEndTime?: string;
  accessExpiresAt?: string;
  sampleVideoUrl?: string;
  sightings: CctvSightingRecord[];
  finalResult?: 'Item Located' | 'Possible Sighting' | 'No Useful Sighting' | 'Request Further Assistance';
  finalResultNotes?: string;
}

export interface CctvSightingRecord {
  id: string;
  timestampOffsetSeconds: number;
  formattedTimestamp: string; // e.g. "14:24:18"
  cameraLocation: string;
  notes: string;
  confidence: 'HIGH' | 'MODERATE' | 'TENTATIVE';
  recordedBy: string;
  recordedAt: string;
  snapshotUrl?: string;
}

export type ClaimStatus = 
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'APPROVED_READY_FOR_PICKUP'
  | 'REJECTED'
  | 'COMPLETED';

export interface ItemClaim {
  id: string; // e.g. "CLM-2026-001"
  foundItemId: string;
  foundItemName: string;
  lostReportId?: string;
  claimantId: string;
  claimantName: string;
  claimantEmail?: string;
  proofOfOwnership: string;
  proofPhotoUrl?: string;
  status: ClaimStatus;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  decisionNotes?: string;
  handoverLocation?: string;
}

export interface LostFoundMatch {
  lostItem: LostItemReport;
  foundItem: FoundItemReport;
  score: number; // 0 to 100%
  supportingFactors: string[];
}

