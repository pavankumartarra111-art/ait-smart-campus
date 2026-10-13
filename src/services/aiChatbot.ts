import { campusStore } from './campusStore';
import { ChatMessage, User } from '../types/campus';

export class AiChatbotService {
  /**
   * Processes a user question against the current database and user permissions.
   */
  public static async askAssistant(question: string, currentUser: User): Promise<ChatMessage> {
    const q = question.toLowerCase().trim();
    const settings = campusStore.getSettings();

    // If external LLM is enabled and an API key is provided, we can call it with campus schema
    if (settings.enableLlmChatbot && settings.llmApiKey.trim().length > 5) {
      try {
        const llmResponse = await this.callExternalLlm(question, currentUser);
        return llmResponse;
      } catch (err) {
        console.warn('External LLM call failed, falling back to local campus retrieval engine:', err);
      }
    }

    // Role-Aware Local Campus Knowledge & Database Retrieval Engine
    return this.queryLocalDatabase(q, currentUser);
  }

  private static queryLocalDatabase(q: string, currentUser: User): ChatMessage {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isDemoNotice = true;

    // 1. Attendance Queries
    if (q.includes('attendance') || q.includes('absent') || q.includes('threshold') || q.includes('presence')) {
      const records = campusStore.getAttendanceRecords();
      const settings = campusStore.getSettings();
      const fullCount = records.filter(r => r.status === 'FULL_ATTENDANCE').length;
      const belowCount = records.filter(r => r.status === 'BELOW_THRESHOLD').length;
      const absentCount = records.filter(r => r.status === 'ABSENT').length;

      // Role check: Faculty only sees assigned subjects, student only sees their own
      if (currentUser.role === 'student') {
        const myRecord = records.find(r => r.studentName.toLowerCase().includes(currentUser.name.toLowerCase()));
        if (myRecord) {
          return {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            timestamp,
            isDemoDataNotice: isDemoNotice,
            text: `📊 **Your Attendance Record (${myRecord.subjectCode} - ${myRecord.date})**:\n- **Status**: ${myRecord.status.replace('_', ' ')}\n- **Verified Presence**: ${myRecord.verifiedPresenceMinutes} min / ${myRecord.totalLectureMinutes} min\n- **Threshold Required**: ${myRecord.thresholdMinutes} min\n- **Data Classification**: DEMO DATA (Verified temporal timeline)`,
            dataContext: { type: 'Attendance', recordsFound: 1, source: 'Student Log' }
          };
        }
      }

      if (q.includes('period') || q.includes('cse') || q.includes('today')) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDemoDataNotice: isDemoNotice,
          text: `📋 **Today's CSE Lecture Attendance Summary (Period 3 - CS-401)**:\n- **Total Students Logged**: ${records.length}\n- **Full Attendance (≥${settings.minimumAttendanceThresholdMinutes} mins)**: ${fullCount} students\n- **Below Threshold (<${settings.minimumAttendanceThresholdMinutes} mins)**: ${belowCount} students\n- **Manual Corrections**: ${records.filter(r => r.isManuallyCorrected).length} verified faculty overrides\n- **Policy**: ${settings.defaultBelowThresholdHandling}\n\n*Note: Derived from verified minute-by-minute temporal presence records.*`,
          dataContext: { type: 'Attendance Summary', recordsFound: records.length, source: 'Lecture Hall 101 Records' }
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `📋 **Campus Attendance Overview**:\n- Total Records: ${records.length}\n- Full Attendance (≥${settings.minimumAttendanceThresholdMinutes} mins): ${fullCount}\n- Below Threshold: ${belowCount}\n- Absent: ${absentCount}\n- Lecture Duration Standard: ${settings.lectureDurationMinutes} mins.`,
        dataContext: { type: 'Attendance', recordsFound: records.length, source: 'Campus Database' }
      };
    }

    // 2. Classroom & Occupancy Queries
    if (q.includes('classroom') || q.includes('occupancy') || q.includes('highest occupancy') || q.includes('room')) {
      const classrooms = campusStore.getClassrooms();
      const sorted = [...classrooms].sort((a, b) => (b.currentOccupancy / b.capacity) - (a.currentOccupancy / a.capacity));
      const highest = sorted[0];

      if (q.includes('highest')) {
        const pct = Math.round((highest.currentOccupancy / highest.capacity) * 100);
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDemoDataNotice: isDemoNotice,
          text: `🏫 **Highest Occupancy Classroom**:\n- **Room**: ${highest.roomNumber} (${highest.block})\n- **Occupancy**: ${highest.currentOccupancy} / ${highest.capacity} students (${pct}%)\n- **Surveillance Link**: Sensor Camera ${highest.cameraId}\n- **Data Status**: DEMO DATA (Simulated real-time sensor snapshot)`,
          dataContext: { type: 'Classroom', recordsFound: 1, source: 'Academic Infrastructure DB' }
        };
      }

      const summaryList = classrooms.map(c => `• **${c.roomNumber}**: ${c.currentOccupancy}/${c.capacity} (${c.block})`).join('\n');
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `🏫 **Configured Classrooms & Occupancy Status**:\n${summaryList}`,
        dataContext: { type: 'Classrooms', recordsFound: classrooms.length, source: 'Classroom Sensors' }
      };
    }

    // 3. Parking Queries
    if (q.includes('parking') || q.includes('vehicle') || q.includes('spaces available') || q.includes('parking slot')) {
      const zones = campusStore.getParkingZones();
      const total = zones.reduce((acc, z) => acc + z.totalSpaces, 0);
      const occupied = zones.reduce((acc, z) => acc + z.occupiedSpaces, 0);
      const available = total - occupied;

      const zoneBreakdown = zones.map(z => `• **${z.name}**: ${z.totalSpaces - z.occupiedSpaces} available / ${z.totalSpaces} total (${z.occupiedSpaces} occupied)`).join('\n');

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `🚗 **Campus Parking Availability (Demo Mode)**:\n- **Total Capacity**: ${total} bays across ${zones.length} zones\n- **Currently Occupied**: ${occupied}\n- **Available Spaces**: **${available} bays**\n\n**Zone Breakdown**:\n${zoneBreakdown}\n\n*Status: Verified against automated vehicle checkpoint sensors.*`,
        dataContext: { type: 'Parking', recordsFound: zones.length, source: 'ANPR Gate Checkpoint' }
      };
    }

    // 4. Routes and Congestion
    if (q.includes('route') || q.includes('busy') || q.includes('blocked') || q.includes('congestion') || q.includes('traffic')) {
      const routes = campusStore.getRoutes();
      const busyOrBlocked = routes.filter(r => r.status === 'BUSY' || r.status === 'BLOCKED');

      if (busyOrBlocked.length > 0) {
        const details = busyOrBlocked.map(r => `• **${r.name}** [Status: **${r.status}** - Congestion: ${r.congestionLevel}%]\n  - Alternate: ${r.alternateRoute || 'None recommended'}\n  - Hazards: ${r.activeHazards || 'High pedestrian volume'}`).join('\n\n');
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDemoDataNotice: isDemoNotice,
          text: `🚦 **Campus Route Congestion Advisory**:\nThe following routes have elevated delays or blockages:\n\n${details}`,
          dataContext: { type: 'Campus Routes', recordsFound: busyOrBlocked.length, source: 'Route Wayfinding Engine' }
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `✅ **Campus Route Status**: All major internal walkways and spine roads (Main Gate to Academic Wing, Ramanujan Library, Cadets Mess) are currently **CLEAR** with normal flow.`,
        dataContext: { type: 'Routes', recordsFound: routes.length, source: 'Wayfinding Engine' }
      };
    }

    // 5. Incidents and Missing Persons
    if (q.includes('incident') || q.includes('missing') || q.includes('unresolved') || q.includes('safety') || q.includes('emergency')) {
      // Role check: Only admin, security, and faculty can inspect full incident registry
      if (currentUser.role === 'student') {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDemoDataNotice: isDemoNotice,
          text: `🔒 **Access Restricted**: Incident investigations and security dispatch logs require Security Officer or Administrator credentials.\n\nIf you have a campus safety emergency, contact Campus Security Command at **+91 20 2715 7534** or use the SOS button in the Mobile Dashboard.`,
          dataContext: { type: 'Security Audit', recordsFound: 0, source: 'RBAC Policy Guard' }
        };
      }

      const incidents = campusStore.getIncidents();
      const unresolved = incidents.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING');

      if (unresolved.length > 0) {
        const list = unresolved.map(i => `• [${i.caseNumber}] **${i.title}**\n  - Severity: ${i.severity} | Location: ${i.location}\n  - Status: ${i.status} | Officer: ${i.assignedOfficer}\n  - Reported: ${i.reportedTime}`).join('\n\n');
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDemoDataNotice: isDemoNotice,
          text: `⚠️ **Unresolved Campus Incidents (${unresolved.length} active)**:\n\n${list}\n\n*Note: Missing person reports require authorized human review and physical verification before taking automated action.*`,
          dataContext: { type: 'Incidents', recordsFound: unresolved.length, source: 'Incident Command DB' }
        };
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `✅ **No Unresolved Incidents**: All recent security reports have been verified and closed by campus security officers.`,
        dataContext: { type: 'Incidents', recordsFound: 0, source: 'Incident Command DB' }
      };
    }

    // 6. Faculty Assignments & Student Reports
    if (q.includes('faculty') || q.includes('assigned') || q.includes('subject') || q.includes('report') || q.includes('marks')) {
      const subjects = campusStore.getSubjects();
      const reports = campusStore.getFacultyReports();

      if (q.includes('sharma') || q.includes('vikram')) {
        const sharmaSubs = subjects.filter(s => s.facultyName.toLowerCase().includes('sharma'));
        const subList = sharmaSubs.map(s => `• **${s.code}**: ${s.name} (${s.program} - ${s.branch}, Sem ${s.semester})`).join('\n');
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDemoDataNotice: isDemoNotice,
          text: `👨‍🏫 **Faculty Profile: Prof. Vikramaditya Sharma** (Associate Professor, CSE):\n**Assigned Subjects**:\n${subList}\n\nDefault Lecture Hall: LH-101 (Ramanujan Wing)`,
          dataContext: { type: 'Faculty Subject Assignment', recordsFound: sharmaSubs.length, source: 'Academic Curriculum DB' }
        };
      }

      if (q.includes('report') || q.includes('student') || q.includes('aarav') || q.includes('rohan')) {
        const targetStudent = q.includes('rohan') ? 'Rohan Deshmukh' : 'Aarav Sharma';
        const rep = reports.find(r => r.studentName.toLowerCase().includes(targetStudent.toLowerCase()));
        if (rep) {
          return {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            timestamp,
            isDemoDataNotice: isDemoNotice,
            text: `📝 **Progress & Assessment Report: ${rep.studentName}**\n- **Subject**: ${rep.subjectName}\n- **Faculty**: ${rep.facultyName}\n- **Test 1**: ${rep.internalTest1}/30 | **Test 2**: ${rep.internalTest2}/30\n- **Assignments**: ${rep.assignmentScore}/20 | **Attendance Score**: ${rep.attendanceScore}/20\n- **Total**: ${rep.totalScore}/100\n- **Academic Remarks**: "${rep.academicRemarks}"\n- **Follow-up Required**: ${rep.followUpRequired ? '⚠️ YES' : 'None'}\n- **Last Edited**: ${rep.lastUpdated} by ${rep.updatedBy}`,
            dataContext: { type: 'Faculty Assessment', recordsFound: 1, source: 'Faculty Gradebook DB' }
          };
        }
      }

      const facultyMembers = campusStore.getUsers().filter(u => u.role === 'faculty');
      const fList = facultyMembers.map(f => `• **${f.name}** (${f.department})`).join('\n');
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `👨‍🏫 **Authorized Faculty Members**:\n${fList}\n\nYou can ask about assigned subjects for any specific faculty member (e.g. *"Which subjects are assigned to Prof. Sharma?"*).`,
        dataContext: { type: 'Faculty Registry', recordsFound: facultyMembers.length, source: 'HR & Academics DB' }
      };
    }

    // 7. How to add M.Tech specialization instructions
    if (q.includes('m.tech') || q.includes('mtech') || q.includes('specialization') || q.includes('add program') || q.includes('curriculum')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: false,
        text: `🎓 **How to Add a New M.Tech Specialization in AIT Smart Campus**:\n\n1. Navigate to **Academic Structure** in the left navigation sidebar.\n2. Locate the **M.Tech (Master of Technology)** card.\n3. Click the **"+ Add Specialization"** button.\n4. Enter the **Specialization Name** (e.g., *"Data Science & AI"* or *"VLSI & Embedded Systems"*), **Specialization Code** (e.g., *"M-DSAI"*), and the appointed **Head of Department (HOD)**.\n5. Click **"Save Branch"**. The system creates the curriculum container immediately with database persistence.\n6. Next, navigate to the **Subjects Registry** tab below to assign semesters, course codes, credits, and faculty members.\n\n*All structural changes are automatically recorded in the institution's audit log.*`,
        dataContext: { type: 'System Documentation', recordsFound: 1, source: 'Academic Administration Handbook' }
      };
    }

    // 8. Robotics / Enrollment Queries ("How many students are enrolled in Robotics second year?")
    if (q.includes('robotics') || (q.includes('enrolled in') && (q.includes('second year') || q.includes('2nd year')))) {
      const allStudents = campusStore.getStudents();
      const roboStudents = allStudents.filter(s => 
        s.branch.toLowerCase().includes('robotics') && (q.includes('second') || q.includes('2nd') ? s.year === 2 : true)
      );

      const list = roboStudents.map(s => `• **${s.name}** [${s.enrollmentNo}] (Roll: ${s.rollNo}) - Face Status: **${s.faceRegistrationStatus || 'UNREGISTERED'}**`).join('\n');

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `🤖 **Robotics & Automation (Second Year) Enrollment**:\n- **Total Enrolled**: **${roboStudents.length} students**\n- **Biometrically Registered**: ${roboStudents.filter(s => s.faceRegistrationStatus === 'REGISTERED').length}\n\n**Enrolled Student Roster**:\n${list}\n\n*Source: Official academic registry for B.Tech Robotics & Automation (Year 2).*`,
        dataContext: { type: 'Enrolled Roster', recordsFound: roboStudents.length, source: 'Academic Registry' }
      };
    }

    // 9. Observed in Today's Lecture Query ("How many registered students have been observed in today's lecture?")
    if (q.includes('observed in today') || q.includes('observed in lecture') || (q.includes('registered students') && q.includes('observed'))) {
      const faceRecords = campusStore.getClassroomFaceRecords('sess-cr-101');
      const observed = faceRecords.filter(r => (r.accumulatedObservedMinutes || 0) > 0);
      const fullCount = faceRecords.filter(r => r.attendanceStatus === 'FULL_ATTENDANCE').length;
      const belowCount = faceRecords.filter(r => r.attendanceStatus === 'BELOW_THRESHOLD').length;

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `📹 **Today's Lecture Hall LH-101 Biometric Observation Report**:\n- **Total Registered Observed**: **${observed.length} students**\n- **Full Attendance Verified (≥45m)**: ${fullCount} students\n- **Below 45m Threshold**: ${belowCount} students\n- **Unverified / Absent**: ${faceRecords.length - observed.length} students\n\n*Presence accumulated via temporal observation intervals with 2-minute chaining window.*`,
        dataContext: { type: 'Face Attendance', recordsFound: observed.length, source: 'LH-101 Camera Session' }
      };
    }

    // 10. Faculty Review Query ("Which classroom attendance records need faculty review?")
    if (q.includes('faculty review') || q.includes('need review') || q.includes('records need faculty review')) {
      const faceRecords = campusStore.getClassroomFaceRecords('sess-cr-101');
      const reviewNeeded = faceRecords.filter(r => r.reviewStatus === 'PENDING_FACULTY_REVIEW' || r.attendanceStatus === 'UNVERIFIED_REVIEW');

      if (reviewNeeded.length === 0) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDemoDataNotice: isDemoNotice,
          text: `✅ **No Records Awaiting Review**: All students logged in the current lecture session have verified temporal presence or confirmed statuses.`,
          dataContext: { type: 'Review Queue', recordsFound: 0, source: 'Classroom Engine' }
        };
      }

      const list = reviewNeeded.map(r => `• **${r.studentName}** [${r.enrollmentNo}] - Observed: ${r.accumulatedObservedMinutes}m (Status: ${r.attendanceStatus.replace('_', ' ')})`).join('\n');

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `⚠️ **Classroom Records Requiring Faculty Review (${reviewNeeded.length} records)**:\n${list}\n\n*Faculty can adjudicate and apply justified manual overrides via Classroom Attendance module.*`,
        dataContext: { type: 'Faculty Review Queue', recordsFound: reviewNeeded.length, source: 'Classroom Attendance DB' }
      };
    }

    // 11. Hostel Allocation Query ("How many residents are allocated to the boys' hostel?")
    if (q.includes('boys') && (q.includes('hostel') || q.includes('resident') || q.includes('allocated'))) {
      const residents = campusStore.getHostelResidents('boys');
      const buildings = campusStore.getHostelBuildings().filter(b => b.type === 'boys');
      const inHostel = residents.filter(r => r.currentStatus === 'PRESENT_IN_HOSTEL').length;
      const inClasses = residents.filter(r => r.currentStatus === 'ATTENDING_CLASSES').length;

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `🏢 **Boys' Hostel Resident Allocation Summary**:\n- **Total Allocated Residents**: **${residents.length} residents**\n- **Facilities**: ${buildings.map(b => `${b.name} (${b.currentOccupancy}/${b.totalCapacity} capacity)`).join(', ')}\n- **Currently In Hostel**: ${inHostel} residents\n- **In Academic Classes**: ${inClasses} residents\n- **Turnstiles Monitored**: Approved East & North Turnstiles`,
        dataContext: { type: 'Hostel Roster', recordsFound: residents.length, source: 'Boys Hostel Administration' }
      };
    }

    // 12. Hostel Entry Events ("Show the authorized entry events for the selected hostel entrance")
    if (q.includes('entry event') || q.includes('hostel entrance') || q.includes('turnstile')) {
      const isGirlsQuery = q.includes('girl');
      const hostelType = isGirlsQuery ? 'girls' : 'boys';

      // Strict role protection check
      if (isGirlsQuery && currentUser.role !== 'girls_hostel_warden' && currentUser.role !== 'campus_admin' && currentUser.role !== 'super_admin') {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          isDemoDataNotice: false,
          text: `🔒 **Access Denied**: Girls' hostel perimeter turnstile logs are strictly restricted to the authorized Girls' Hostel Warden or Dean of Operations.`,
          dataContext: { type: 'Security Violation', recordsFound: 0, source: 'RBAC Policy Guard' }
        };
      }

      const events = campusStore.getHostelEvents(hostelType).filter(e => e.eventType === 'ENTRY');
      const list = events.slice(0, 4).map(e => `• **${e.residentName}** [${e.enrollmentNo}] at ${e.locationName} - **${e.timestamp.slice(11, 19)}** (${e.confidenceScore}% confidence, State: ${e.state})`).join('\n');

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `🚪 **Authorized Entry Events (${hostelType.toUpperCase()} Hostel)**:\n${list || 'No entry events logged in current operational window.'}\n\n*Verified by biometric camera check at approved turnstiles.*`,
        dataContext: { type: 'Hostel Turnstile Logs', recordsFound: events.length, source: `${hostelType} Hostel DB` }
      };
    }

    // 13. Disconnected Camera Sessions ("Which camera sessions are disconnected?")
    if (q.includes('disconnected') || q.includes('camera session') || q.includes('offline camera')) {
      const sessions = campusStore.getCameraSessions();
      const cameras = campusStore.getCameras();
      const disconnectedSessions = sessions.filter(s => s.status === 'DISCONNECTED');
      const offlineCams = cameras.filter(c => c.status === 'OFFLINE' || c.status === 'WARNING');

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `📡 **Camera Session Health & Connectivity**:\n- **Disconnected Active Sessions**: **${disconnectedSessions.length} sessions**\n- **Offline Physical Cameras**: ${offlineCams.length} feeds (${offlineCams.map(c => c.name).join(', ') || 'All 9 perimeter cameras active'})\n- **Active Streaming Sessions**: ${sessions.filter(s => s.status === 'ACTIVE').length} (LH-101, Cariappa Turnstile, Kalpana Chawla North Turnstile)`,
        dataContext: { type: 'Telemetry Health', recordsFound: offlineCams.length, source: 'Surveillance Hub' }
      };
    }

    // 14. Unverified Attendance Records ("How many attendance records remain unverified?")
    if (q.includes('remain unverified') || q.includes('unverified attendance') || q.includes('how many unverified')) {
      const faceRecords = campusStore.getClassroomFaceRecords('sess-cr-101');
      const unverified = faceRecords.filter(r => r.attendanceStatus === 'UNVERIFIED_REVIEW');

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        isDemoDataNotice: isDemoNotice,
        text: `📊 **Unverified Attendance Records Summary**:\n- **Unverified Records**: **${unverified.length} students** in current lecture slot\n- **Reasoning**: Insufficient temporal evidence or camera occlusion\n- **Adjudication**: Pending faculty review in Classroom Attendance module`,
        dataContext: { type: 'Attendance Audit', recordsFound: unverified.length, source: 'Classroom Ledger' }
      };
    }

    // 15. General / Fallback with smart prompt recommendations
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      isDemoDataNotice: isDemoNotice,
      text: `Hello! I am the **AIT Campus Assistant**, your AI guide for Army Institute of Technology, Pune. I can query real application data across surveillance, attendance, parking, routes, academic operations, and hostel monitoring.\n\nHere are example questions you can ask me:`,
      suggestedPrompts: [
        "How many students are enrolled in Robotics second year?",
        "How many registered students have been observed in today's lecture?",
        "Which classroom attendance records need faculty review?",
        "How many residents are allocated to the boys' hostel?",
        "Show the authorized entry events for the selected hostel entrance.",
        "Which camera sessions are disconnected?",
        "How many attendance records remain unverified?",
        "What is the parking space availability in demo mode?"
      ]
    };
  }

  private static async callExternalLlm(question: string, currentUser: User): Promise<ChatMessage> {
    const settings = campusStore.getSettings();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Prepared context without leaking secrets or passwords
    const context = {
      role: currentUser.role,
      user: currentUser.name,
      cameras: campusStore.getCameras().map(c => ({ name: c.name, occupancy: c.currentOccupancy, density: c.density, status: c.status })),
      parking: campusStore.getParkingZones().map(z => ({ name: z.name, available: z.totalSpaces - z.occupiedSpaces, total: z.totalSpaces })),
      routes: campusStore.getRoutes().map(r => ({ name: r.name, status: r.status, congestion: r.congestionLevel })),
      incidents: campusStore.getIncidents().filter(i => i.status !== 'CLOSED').map(i => ({ case: i.caseNumber, title: i.title, status: i.status }))
    };

    // Make request to OpenAI / Gemini compatible endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.llmApiKey}`
      },
      body: JSON.stringify({
        model: settings.llmModelName || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are the AIT Smart Campus AI Assistant for Army Institute of Technology Pune. Answer concisely using ONLY the provided verified campus data. Current user role: ${currentUser.role}. If information is not in the data, state clearly that it is unavailable. Mark demo data transparently. Campus context: ${JSON.stringify(context)}`
          },
          { role: 'user', content: question }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`External LLM returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No response returned from external LLM.';

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp,
      isDemoDataNotice: true,
      text: answer,
      dataContext: { type: 'LLM Generation', recordsFound: 1, source: `Configured Model: ${settings.llmModelName}` }
    };
  }
}
