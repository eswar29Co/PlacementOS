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
  Calendar
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';

const studentNavItems = [
  { icon: Home, label: 'Home', path: '/student/home' },
  { icon: Briefcase, label: 'Browse Jobs', path: '/student/browse-jobs' },
  { icon: FileText, label: 'My Applications', path: '/student/applications' },
  { icon: Calendar, label: 'Interview Calendar', path: '/student/interview-calendar' },
  { icon: Video, label: 'Interviews', path: '/student/interviews' },
  { icon: Award, label: 'Offers', path: '/student/offers' },
  { icon: User, label: 'Profile', path: '/student/profile' },
];

const professionalNavItems = [
  { icon: Home, label: 'Dashboard', path: '/professional/dashboard' },
  { icon: Video, label: 'Pending Interviews', path: '/professional/interviews' },
  { icon: CheckCircle, label: 'Completed', path: '/professional/history' },
  { icon: User, label: 'Profile', path: '/professional/profile' },
];

const adminNavItems = [
  { icon: Home, label: 'Dashboard & Approvals', path: '/admin/dashboard' },
  { icon: User, label: 'Students', path: '/admin/students' },
  { icon: Users, label: 'Professionals', path: '/admin/professionals' },
  { icon: Briefcase, label: 'Jobs', path: '/admin/jobs' },
];

export function AppSidebar() {
  const { user, role } = useAppSelector((state) => state.auth);
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Briefcase className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight">PlacementOS</span>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider">Logged in as</p>
          <p className="font-medium capitalize">{role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/student/home' && item.path !== '/professional/home' && item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
