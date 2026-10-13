import React from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Users, 
  Clock, 
  Car, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  ShieldAlert, 
  Bot, 
  QrCode, 
  BarChart3, 
  Settings, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  LogOut,
  Sparkles,
  ScanFace,
  Building2,
  Video,
  HelpCircle,
  PackageSearch
} from 'lucide-react';
import { UserRole } from '../../types/campus';

export type PageView = 
  | 'dashboard' 
  | 'cameras' 
  | 'camera-sessions'
  | 'attendance' 
  | 'face-registration'
  | 'boys-hostel'
  | 'girls-hostel'
  | 'unknown-faces'
  | 'crowd' 
  | 'parking' 
  | 'routes' 
  | 'students' 
  | 'academics' 
  | 'faculty' 
  | 'incidents' 
  | 'chatbot' 
  | 'mobile' 
  | 'lost-and-found'
  | 'analytics' 
  | 'settings'
  | 'login';

interface NavItem {
  id: PageView;
  label: string;
  icon: any;
  badge?: string;
  roles?: UserRole[];
  isHighlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  userRole,
  userName
}) => {

  const navGroups: NavGroup[] = [
    {
      title: 'CAMPUS COMMAND',
      items: [
        { id: 'dashboard', label: 'Campus Overview', icon: LayoutDashboard },
        { id: 'cameras', label: 'Campus Cameras', icon: Camera, badge: '9 Feeds' },
        { id: 'camera-sessions', label: 'Camera Sessions & QR', icon: Video, badge: 'Live' },
        { id: 'crowd', label: 'Crowd & Seating', icon: Users },
        { id: 'parking', label: 'Parking & Vehicles', icon: Car, badge: 'Live' },
        { id: 'routes', label: 'Route Congestion', icon: MapPin },
      ]
    },
    {
      title: 'BIOMETRIC ATTENDANCE',
      items: [
        { id: 'attendance', label: 'Classroom Attendance', icon: Clock, badge: '45m Rule', roles: ['super_admin', 'campus_admin', 'faculty'] },
        { id: 'face-registration', label: 'Student Face Registry', icon: ScanFace, badge: '128-d', roles: ['super_admin', 'campus_admin'] },
        { id: 'boys-hostel', label: "Boys' Hostel", icon: Building2, roles: ['super_admin', 'campus_admin', 'boys_hostel_warden', 'security_operator', 'security_staff'] },
        { id: 'girls-hostel', label: "Girls' Hostel", icon: Building2, roles: ['super_admin', 'campus_admin', 'girls_hostel_warden'] },
        { id: 'unknown-faces', label: 'Unknown-Face Review', icon: HelpCircle, badge: 'Queue', roles: ['super_admin', 'campus_admin', 'boys_hostel_warden', 'girls_hostel_warden', 'security_operator', 'security_staff'] },
      ]
    },
    {
      title: 'ACADEMIC PORTAL',
      items: [
        { id: 'faculty', label: 'Faculty Management', icon: FileText, roles: ['super_admin', 'campus_admin', 'faculty'] },
        { id: 'students', label: 'Student Directory', icon: GraduationCap },
        { id: 'academics', label: 'Academic Structure', icon: BookOpen, roles: ['super_admin', 'campus_admin'] },
      ]
    },
    {
      title: 'INTELLIGENCE & AI',
      items: [
        { id: 'lost-and-found', label: 'Lost & Found AI', icon: PackageSearch, badge: 'CCTV AI' },
        { id: 'chatbot', label: 'AIT Campus Assistant', icon: Bot, isHighlight: true },
        { id: 'incidents', label: 'Incidents and Alerts', icon: ShieldAlert, badge: 'Security' },
        { id: 'mobile', label: 'QR Mobile Access', icon: QrCode },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'analytics', label: 'Audit Logs & Reports', icon: BarChart3 },
        { id: 'settings', label: 'System Settings', icon: Settings, roles: ['super_admin', 'campus_admin'] },
      ]
    }
  ];

  return (
    <aside 
      className={`relative z-30 flex flex-col h-screen bg-[#0a111c] border-r border-slate-800/80 transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 fill-slate-950 stroke-amber-200" />
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-wider text-slate-100 font-serif flex items-center gap-1.5">
                AIT PUNE
                <span className="text-[10px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-sans font-mono">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 truncate tracking-tight">Smart Campus System</span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links Scrollable Body */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-6">
        {navGroups.map((group, gIdx) => {
          // Filter items based on user role
          const visibleItems = group.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(userRole);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                  {group.title}
                </div>
              )}

              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                      isActive 
                        ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-md shadow-amber-950/20' 
                        : item.isHighlight
                        ? 'text-cyan-300 hover:bg-cyan-950/40 hover:text-cyan-200'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-400' : item.isHighlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />

                    {!collapsed && (
                      <span className="truncate flex-1 text-left flex items-center justify-between">
                        {item.label}
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                            {item.badge}
                          </span>
                        )}
                        {item.isHighlight && (
                          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse ml-1" />
                        )}
                      </span>
                    )}

                    {/* Active left indicator pill */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/70 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
            {userName.slice(0, 2).toUpperCase()}
          </div>

          {!collapsed && (
            <div className="flex-1 truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">{userName}</div>
              <div className="text-[10px] text-amber-400/90 font-mono capitalize">
                {userRole.replace('_', ' ')}
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => onNavigate('login')}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors"
              title="Switch Account / Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
