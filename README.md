# AIT Smart Campus AI — Dynamic Face Recognition Attendance & Monitoring System
**Army Institute of Technology (AIT), Pune — "Onward to Glory" (Founded 1994)**

A state-of-the-art, privacy-preserving, AI-powered Smart Campus Management System prototype modelled on the 30-acre campus of Army Institute of Technology, Pune (Dighi Hills, Alandi Road).

---

## 🏛️ System Overview

The AIT Smart Campus System integrates computer vision, automated academic tracking, and real-time physical infrastructure management into a unified digital twin dashboard. 

### 🚀 Major Feature Upgrades (Face Recognition & Attendance)
1. **Dynamic Student Face Registration Module**:
   - Secure biometric enrollment supporting single and batch registration.
   - Client-side deep learning using `@vladmandic/face-api` (128-dimensional biometric embeddings via pretrained ResNet-34).
   - Real-time face quality evaluation (face bounds, alignment, illumination scoring).
   - Mandatory biometric consent checkbox with verifiable timestamps.
   - Separate, encrypted biometric template storage (`localStorage: ait_smart_campus_face_templates_secure`) decoupled from general student entity views.
   - Non-destructive updates, template deletion, and duplicate enrollment prevention.

2. **AI Classroom Attendance (45/60-Minute Presence Threshold)**:
   - Dynamic lecture selector: Programme (B.Tech 1st–4th Year, M.Tech), Branch (CSE, ECE, Mech, Robotics, IT), Section, Semester, Subject, Assigned Faculty, Period, and Classroom.
   - Real class rosters derived directly from the database (no hardcoded class sizes).
   - **Continuous Interval Chaining**: Tracks actual observation intervals rather than first-to-last detection math. Tolerates brief missed detections while preventing false claims of continuous presence.
   - **Rule-Based Finalization**:
     - $\ge 45\text{ mins}$ verified accumulated presence: **Full Attendance — Threshold Met**
     - $< 45\text{ mins}$ verified presence: **Attendance Threshold Not Met**
     - Insufficient evidence or uncertain identification: **Unverified — Faculty Review Required**
   - **Mid-Session Dynamic Registration**: When an administrator registers a student mid-lecture, the active camera session cache updates immediately without interrupting or restarting the video stream.
   - Faculty manual review and override with audit justification.
   - Comprehensive CSV report export.

3. **Boys' Hostel Management (Cariappa Hall & Thimayya Block)**:
   - Monitoring strictly confined to authorized entrance/exit turnstiles and approved common foyers (strictly zero surveillance in bedrooms, bathrooms, or private quarters).
   - Direction-verified entry and exit event logs (`ENTRY_VERIFIED`, `EXIT_VERIFIED`, `OBSERVED_AT_ENTRANCE`, `CURRENT_PRESENCE_UNKNOWN`).
   - Associate residents with unified campus student records (no duplicate identities).
   - Turnstile simulation, authorized event correction modal with reason logging, and CSV exports.

4. **Girls' Hostel Management (Kalpana Chawla Bhavan)**:
   - Strict Role-Based Access Control (RBAC): Accessible only to Super Admin, Campus Admin, and the authorized Girls' Hostel Warden. Other roles are strictly restricted on both UI and service layers.
   - Perimeter turnstile logs and resident presence status.
   - Safeguards for biometric consent, privacy protection, and event correction.
   - Filterable resident roster and CSV export.

5. **Centralized Unknown-Face Review Queue**:
   - Captures unverified or uncertain faces detected across classroom sessions and hostel turnstiles.
   - Human-in-the-loop review workflow: authorized staff can match observations to enrolled students, dismiss guests, or escalate security alerts.

6. **Active Camera Sessions & Mobile QR Access**:
   - Registry of live camera sessions with session tokens, purpose, and camera source.
   - Instant QR code generation pointing to reachable application endpoints.

7. **Multi-Mode Campus Surveillance & Analytics**:
   - Crowd Density & Seating Analytics across central campus zones.
   - Parking & Vehicle monitoring with bay toggling and vehicle categorization.
   - Route Congestion & Wayfinding map with automated detour suggestions.
   - Incident & Missing Cadet management with human review guardrails.
   - Academic Structure hierarchy management (Programs, Branches, Semesters, Subjects).
   - Faculty Gradebook and Continuous Internal Assessment portal.

---

## 👥 Role-Based Access Matrix

| Role | Demo User | Permissions & Operational Scope |
| :--- | :--- | :--- |
| **Super Admin** | Col. Rajesh Bakshi (Retd.) | Full campus administration, system configuration, all modules, and aggregate reports. |
| **Campus Admin** | Dr. Sunita Kulkarni | Academic structure, student records, camera sessions, hostel oversight. |
| **Faculty** | Prof. Vikramaditya Sharma | Assigned classroom attendance sessions, student reviews, gradebook exports. |
| **Boys' Hostel Warden** | Capt. Arvind Rathore | Cariappa Hall & Thimayya Block resident records, entrance logs, event corrections. |
| **Girls' Hostel Warden** | Lt. Col. Sunita Deshmukh | Kalpana Chawla Bhavan resident records, turnstile monitoring, event reviews. |
| **Security Operator** | Sub. Maj. Ramesh Gurung | Main gate and campus perimeter cameras, operational incidents, emergency dispatch. |
| **Read-Only Viewer** | Col. K. P. Singh | Auditing and inspection of authorized reports (read-only access). |
| **Student / Cadet** | Ajay Malhan | Digital cadet pass, personal attendance records, SOS emergency beacon. |

*Switch between any role with 1-click in the top navigation bar or on the Login page.*

---

## 🧠 Face Recognition Model Architecture

- **Engine**: `@vladmandic/face-api` (v1.7.15) running on TensorFlow.js.
- **Offline Model Weights**: Preloaded in `public/models/` for 100% offline, zero-latency inference:
  - `ssd_mobilenetv1_model`: Face detection bounding boxes.
  - `face_landmark_68_model`: 68-point facial landmark alignment.
  - `face_recognition_model`: 128-dimensional embedding generation (ResNet-34).
- **Matching Metric**: Normalized Euclidean distance $\le 0.58$ against stored templates.
- **Privacy Assurance**: 
  - Video streams are processed purely in-memory; raw video is never recorded or stored without explicit consent.
  - Face embeddings are kept in protected storage and never exposed to unauthenticated frontend endpoints.
  - Simulated camera feeds and demo visualizers are explicitly badged with **"SIMULATED DEMO MODE"**.

---

## 🚀 Quick Start & Run Commands

### 1. Prerequisites
- **Node.js**: v18+ (Node 20+ recommended)
- **NPM**: v9+

### 2. Installation
```bash
# Navigate to the workspace directory
cd site

# Install dependencies (including @vladmandic/face-api)
npm install
```

### 3. Run Development Server
```bash
# Start Vite development server
npm run dev
```
Open **`http://127.0.0.1:5173/`** in your browser.

### 4. Build for Production
```bash
# Verify TypeScript and build production bundle
npm run build
```

---

## 🔄 Dynamic Mid-Session Registration Workflow (Demo Steps)

To demonstrate dynamic mid-session student registration:
1. Navigate to **Classroom Attendance** (`/classroom-attendance`).
2. Select **B.Tech Third Year** → **Robotics & Automation** → **Robotics Lab-I**.
3. Choose **Laptop Webcam** or **Simulated Camera** and start the session.
4. Note that only registered students are matched, while unregistered students or new faces appear in the review queue.
5. In another tab or by opening **Face Registration** (`/face-registration`), register an unregistered student (or add a new student).
6. Return to **Classroom Attendance**: notice the roster and face recognition service immediately recognize the newly registered student **without restarting the camera stream**!
7. Observation intervals accumulate live; when verified presence crosses 45 minutes, attendance automatically updates to **Full Attendance — Threshold Met**.

---

## 🤖 AI Campus Assistant Queries

The built-in conversational AI understands natural language queries across all modules:
- *"How many students are enrolled in Robotics second year?"*
- *"How many registered students have been observed in today's lecture?"*
- *"Which classroom attendance records need faculty review?"*
- *"How many residents are allocated to the boys' hostel?"*
- *"Show the authorized entry events for the selected hostel entrance."*
- *"Which camera sessions are disconnected?"*
- *"How many attendance records remain unverified?"*

---

## 🔒 Security, Ethics & Compliance
- **Consent-First Architecture**: Explicit, recorded biometric consent prior to template capture.
- **Strict Data Isolation**: Girls' hostel records are cryptographically and logically isolated from unauthorized roles.
- **Physical Privacy Bounds**: Surveillance is strictly prohibited in private hostel spaces (bedrooms/washrooms); cameras are authorized only at turnstiles and approved public common areas.
- **Auditing**: Every manual attendance override, turnstile correction, and template modification is written to the immutable Audit Trail.

