import { useState, useEffect } from 'react';
import {
  Home,
  Briefcase,
  FileText,
  ClipboardCheck,
  Video,
  Award,
  User,
  Users,
  CheckCircle,
  BarChart3,
  LogOut,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  ShieldCheck,
  Activity,
  Globe,
  Mail
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const studentNavItems = [
  { icon: Home, label: 'Home', path: '/student/home', tactical: 'Overview' },
  { icon: Briefcase, label: 'Browse Jobs', path: '/student/browse-jobs', tactical: 'Browse Jobs' },
  { icon: FileText, label: 'My Applications', path: '/student/applications', tactical: 'My Applications' },
  { icon: Calendar, label: 'Calendar', path: '/student/interview-calendar', tactical: 'Calendar' },
  { icon: Video, label: 'Interviews', path: '/student/interviews', tactical: 'Interviews' },
  { icon: Award, label: 'Offers', path: '/student/offers', tactical: 'My Offers' },
  { icon: User, label: 'Profile', path: '/student/profile', tactical: 'Profile' },
];

const professionalNavItems = [
  { icon: Activity, label: 'Dashboard', path: '/professional/dashboard', tactical: 'Overview' },
  { icon: Target, label: 'Interviews', path: '/professional/interviews', tactical: 'Interviews' },
  { icon: CheckCircle, label: 'History', path: '/professional/history', tactical: 'Past Interviews' },
  { icon: User, label: 'Profile', path: '/professional/profile', tactical: 'Profile' },
];

const adminNavItems = [
  { icon: Zap, label: 'Admin Panel', path: '/admin/dashboard', tactical: 'Admin Overview' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', tactical: 'Analytics' },
  { icon: User, label: 'Students', path: '/admin/students', tactical: 'Manage Students' },
  { icon: Users, label: 'Experts', path: '/admin/professionals', tactical: 'Manage Experts' },
  { icon: Briefcase, label: 'Jobs', path: '/admin/jobs', tactical: 'Manage Jobs' },
];

export function AppSidebar() {
  const { user, role } = useAppSelector((state) => state.auth);
  const { sidebarCollapsed: isCollapsed } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = role === 'student'
    ? studentNavItems
    : role === 'professional'
      ? professionalNavItems
      : adminNavItems;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-500 ease-in-out border-r border-slate-200 bg-white text-slate-500 flex flex-col group/sidebar",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        {/* Sidebar Toggle - Floating */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white border-4 border-white shadow-lg z-50 hover:scale-110 transition-transform cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Brand Header */}
        <div className={cn(
          "flex h-24 items-center gap-4 border-b border-slate-100 transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "px-8"
        )}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-sm shadow-primary/20">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">Placement<span className="text-primary italic">OS</span></span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Career Platform</span>
            </div>
          )}
        </div>

        {/* User Quick Info */}
        <div className={cn(
          "py-6 transition-all duration-300",
          isCollapsed ? "px-4" : "px-6"
        )}>
          <div className={cn(
            "rounded-3xl bg-slate-50 p-4 border border-slate-100 transition-all group-hover/sidebar:bg-slate-100",
            isCollapsed ? "flex items-center justify-center" : "space-y-1"
          )}>
            {isCollapsed ? (
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            ) : (
              <>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Logged In As</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm" />
                  <p className="font-black text-[11px] uppercase tracking-tighter text-emerald-600">{role} ACCESS</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4 selection:bg-transparent custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/student/home' &&
                item.path !== '/professional/dashboard' &&
                item.path !== '/admin/dashboard' &&
                location.pathname.startsWith(item.path));

            const NavLinkContent = (
              <NavLink
                to={item.path}
                className={cn(
                  'flex items-center rounded-[1.25rem] transition-all duration-300 group/nav',
                  isCollapsed ? 'justify-center w-14 h-14 mx-auto' : 'px-5 py-3.5 gap-4 h-14',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'hover:bg-slate-50 hover:text-primary'
                )}
              >
                <item.icon className={cn(
                  'shrink-0 transition-transform duration-300 group-hover/nav:scale-110',
                  isCollapsed ? 'h-6 w-6' : 'h-5 w-5',
                  isActive ? 'text-white' : 'text-slate-400 group-hover/nav:text-primary'
                )} />
                {!isCollapsed && (
                  <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      isActive ? "text-white/60" : "text-slate-400"
                    )}>{item.tactical}</span>
                  </div>
                )}
              </NavLink>
            );

            return isCollapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  {NavLinkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 border-none font-black uppercase text-[10px] tracking-widest text-white shadow-xl">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.path}>{NavLinkContent}</div>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className={cn(
          "p-6 border-t border-slate-100 space-y-6 transition-all duration-300",
          isCollapsed ? "items-center" : ""
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-4 group/user cursor-pointer">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white font-black text-lg shadow-xl shadow-primary/10 group-hover/user:scale-105 transition-transform">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0 animate-in fade-in duration-500">
                <p className="truncate text-sm font-black text-slate-900 uppercase tracking-tight">{user?.name}</p>
                <p className="truncate text-[10px] font-bold text-slate-400 tracking-tighter">Logged in securely</p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className={cn(
              "w-full transition-all duration-300 rounded-2xl font-black uppercase text-[10px] tracking-widest",
              isCollapsed ? "justify-center h-14 p-0 hover:bg-rose-50" : "justify-start h-12 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-4"
            )}
            onClick={handleLogout}
          >
            {isCollapsed ? (
              <LogOut className="h-5 w-5 text-rose-500" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-3" />
                Log Out
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
