import { Search, LogOut, Bell, ShieldCheck, Activity, Globe, Command, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { NotificationsPanel } from './NotificationsPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, role } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-10 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
          <Activity className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">System Online</span>
        </div>
        <div className="space-y-0.5">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{title}</h1>
          {subtitle && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Cinematic Search */}
        <div className="relative hidden xl:block group">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search..."
              className="w-80 h-12 pl-12 pr-6 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-primary/20 font-bold text-xs shadow-inner placeholder:text-slate-400 focus:bg-white transition-all text-slate-900"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-white border border-slate-200 flex items-center gap-1">
              <Command className="h-2.5 w-2.5 text-slate-400" />
              <span className="text-[9px] font-black text-slate-400">K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Panel */}
          <div className="relative">
            <NotificationsPanel />
            {/* Optional: Add a custom styled wrapper if NotificationsPanel doesn't match */}
          </div>

          {/* User Portal */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-4 pl-4 h-12 rounded-2xl hover:bg-slate-50 transition-all group/user">
                <div className="hidden sm:flex flex-col items-end gap-0.5">
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{user?.name}</p>
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none opacity-80 group-hover/user:opacity-100 transition-opacity">
                    Role: {role}
                  </p>
                </div>
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-primary font-black text-sm border border-slate-200 shadow-sm group-hover/user:scale-105 transition-transform">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-4 p-3 bg-white border-slate-200 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-xs uppercase truncate leading-none">{user?.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 truncate uppercase mt-1 tracking-widest">{role} Verified</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Security
                  </div>
                  <p className="text-[10px] text-slate-500 italic font-medium leading-relaxed">
                    Your account is secure.
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-slate-100 mx-2" />
              <DropdownMenuItem
                className="m-2 rounded-xl focus:bg-rose-50 focus:text-rose-500 text-slate-600 font-bold text-[10px] uppercase tracking-[0.2em] py-3 cursor-pointer transition-colors"
                onClick={() => {
                  dispatch(logout());
                  navigate('/login');
                }}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log Out
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
