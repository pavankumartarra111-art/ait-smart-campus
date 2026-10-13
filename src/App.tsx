import React, { useState, useEffect } from 'react';
import { Sidebar, PageView } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { FloatingChatbot } from './components/floating/FloatingChatbot';
import { campusStore } from './services/campusStore';
import { User } from './types/campus';

// Modals
import { LaptopWebcamStationModal } from './components/common/LaptopWebcamStationModal';
import { LiveCameraScannerModal } from './components/common/LiveCameraScannerModal';

// Views
import { LoginView } from './components/pages/LoginView';
import { AdminDashboardView } from './components/pages/AdminDashboardView';
import { CameraMonitoringView } from './components/pages/CameraMonitoringView';
import { ClassroomAttendanceView } from './components/pages/ClassroomAttendanceView';
import { CrowdAnalyticsView } from './components/pages/CrowdAnalyticsView';
import { ParkingManagementView } from './components/pages/ParkingManagementView';
import { CampusRouteView } from './components/pages/CampusRouteView';
import { StudentManagementView } from './components/pages/StudentManagementView';
import { AcademicStructureView } from './components/pages/AcademicStructureView';
import { FacultyDashboardView } from './components/pages/FacultyDashboardView';
import { IncidentManagementView } from './components/pages/IncidentManagementView';
import { AiChatbotView } from './components/pages/AiChatbotView';
import { QrMobileView } from './components/pages/QrMobileView';
import { AnalyticsAuditView } from './components/pages/AnalyticsAuditView';
import { SettingsConfigView } from './components/pages/SettingsConfigView';
import { MobileDashboardRoute } from './components/mobile/MobileDashboardRoute';

// Upgraded Dynamic Face Attendance & Hostel Views
import { FaceRegistrationView } from './components/pages/FaceRegistrationView';
import { BoysHostelView } from './components/pages/BoysHostelView';
import { GirlsHostelView } from './components/pages/GirlsHostelView';
import { CameraSessionsView } from './components/pages/CameraSessionsView';
import { UnknownFaceReviewView } from './components/pages/UnknownFaceReviewView';

// Intelligent Lost & Found with CCTV-Assisted Recovery
import { LostAndFoundView } from './components/pages/LostAndFoundView';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(campusStore.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isDirectMobileView, setIsDirectMobileView] = useState(false);
  const [isLaptopWebcamOpen, setIsLaptopWebcamOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Check URL query parameters or hash on initial load for direct mobile QR route
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isMobileParam = params.get('view') === 'mobile' || 
                          window.location.pathname.endsWith('/mobile') || 
                          window.location.hash === '#mobile';
    if (isMobileParam) {
      setIsDirectMobileView(true);
    }
  }, []);

  // Subscribe to campusStore updates
  useEffect(() => {
    return campusStore.subscribe(() => {
      setCurrentUser(campusStore.getCurrentUser());
    });
  }, []);

  // Role permissions check
  const hasAccessToPage = (page: PageView): boolean => {
    if (page === 'login') return true;
    if (currentUser.role === 'super_admin' || currentUser.role === 'campus_admin') return true;
    
    // Strict role guards
    if (page === 'girls-hostel' && currentUser.role !== 'girls_hostel_warden') return false;
    if (page === 'boys-hostel' && !['boys_hostel_warden', 'security_operator', 'security_staff'].includes(currentUser.role)) return false;
    if (page === 'face-registration') return false;
    if (page === 'settings') return false;
    if (page === 'faculty' && currentUser.role !== 'faculty') return false;
    if (page === 'academics' && currentUser.role !== 'faculty') return false;
    
    return true;
  };

  const handleNavigate = (page: PageView) => {
    if (!hasAccessToPage(page)) {
      alert(`Access Restricted: Page requires authorized permissions.`);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on standalone mobile route (from QR code scan)
  if (isDirectMobileView) {
    return (
      <div className="bg-[#070c12] min-h-screen">
        <MobileDashboardRoute
          currentUser={currentUser}
          onExitMobile={() => setIsDirectMobileView(false)}
          onOpenChatbot={() => setIsChatbotOpen(true)}
        />
        <FloatingChatbot
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          currentUser={currentUser}
        />
      </div>
    );
  }

  // If on Login view
  if (currentPage === 'login') {
    return (
      <LoginView
        onLoginSuccess={(nextPage) => setCurrentPage(nextPage)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070c12] text-slate-100 flex font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Collapsible Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userRole={currentUser.role}
        userName={currentUser.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        
        {/* Sticky Top Header */}
        <TopNavbar
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onOpenChat={() => setIsChatbotOpen(true)}
          onOpenQr={() => handleNavigate('mobile')}
          onOpenLaptopCam={() => setIsLaptopWebcamOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* Viewport Rendered Page */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && <AdminDashboardView onNavigate={handleNavigate} />}
          {currentPage === 'cameras' && <CameraMonitoringView />}
          {currentPage === 'camera-sessions' && <CameraSessionsView />}
          {currentPage === 'attendance' && <ClassroomAttendanceView />}
          {currentPage === 'face-registration' && <FaceRegistrationView />}
          {currentPage === 'boys-hostel' && <BoysHostelView />}
          {currentPage === 'girls-hostel' && <GirlsHostelView />}
          {currentPage === 'unknown-faces' && <UnknownFaceReviewView />}
          {currentPage === 'crowd' && <CrowdAnalyticsView />}
          {currentPage === 'parking' && <ParkingManagementView />}
          {currentPage === 'routes' && <CampusRouteView />}
          {currentPage === 'students' && <StudentManagementView />}
          {currentPage === 'academics' && <AcademicStructureView />}
          {currentPage === 'faculty' && <FacultyDashboardView currentUser={currentUser} />}
          {currentPage === 'incidents' && <IncidentManagementView currentUser={currentUser} />}
          {currentPage === 'chatbot' && <AiChatbotView currentUser={currentUser} />}
          {currentPage === 'mobile' && <QrMobileView currentUser={currentUser} />}
          {currentPage === 'lost-and-found' && <LostAndFoundView currentUser={currentUser} />}
          {currentPage === 'analytics' && <AnalyticsAuditView />}
          {currentPage === 'settings' && <SettingsConfigView />}
        </main>
      </div>

      {/* Floating AIT Campus Assistant modal */}
      <FloatingChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        currentUser={currentUser}
      />

      {/* Live Laptop Webcam Command Station Modal */}
      <LaptopWebcamStationModal
        isOpen={isLaptopWebcamOpen}
        onClose={() => setIsLaptopWebcamOpen(false)}
      />

      {/* Live Mobile & Laptop Camera QR Scanner Modal */}
      <LiveCameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Live Camera QR Scanner"
      />

    </div>
  );
};

export default App;
