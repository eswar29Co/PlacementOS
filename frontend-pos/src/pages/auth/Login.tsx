import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase, ShieldCheck, Zap, Globe, ArrowRight,
  ChevronRight, Lock, Mail, UserCheck, Star,
  Layers, Database, Terminal, Fingerprint, Activity,
  Sparkles, Monitor, School
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { authService, collegeService } from '@/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface LoginProps {
  type?: 'admin' | 'superadmin' | 'standard';
}

export default function Login({ type = 'standard' }: LoginProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Set initial role based on type
  const [role, setRole] = useState<'student' | 'professional' | 'admin' | 'superadmin'>(
    type === 'admin' ? 'admin' : (type === 'superadmin' ? 'superadmin' : 'student')
  );

  const [colleges, setColleges] = useState<any[]>([]);
  const [detectedCollege, setDetectedCollege] = useState<any>(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await collegeService.getColleges();
        if (response.success) {
          setColleges(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch colleges", error);
      }
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    if (email.includes('@')) {
      const domain = email.split('@')[1];
      if (domain) {
        const college = colleges.find(c => c.domain === domain);
        setDetectedCollege(college || null);
      }
    } else {
      setDetectedCollege(null);
    }
  }, [email, colleges]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email, password, role });
      if (response.success && response.data.user && response.data.token) {
        localStorage.setItem('token', response.data.token);
        dispatch(login(response.data.user));
        toast.success(`Login successful! Welcome back, ${response.data.user.name.split(' ')[0]}.`);
        switch (response.data.user.role) {
          case 'admin':
          case 'superadmin':
            if (response.data.user.isSuperAdmin || response.data.user.role === 'superadmin') {
              navigate('/super-admin/dashboard');
            } else {
              navigate('/admin/dashboard');
            }
            break;
          case 'student': navigate('/student/home'); break;
          case 'professional': navigate('/professional/dashboard'); break;
          default: navigate('/');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white text-slate-900 overflow-hidden selection:bg-primary selection:text-white font-sans relative">

      {/* Visual Identity Side - Dynamic Cinematic HUD */}
      <div className="hidden lg:flex relative flex-col justify-between p-20 overflow-hidden bg-slate-50 border-r border-slate-100">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />
        </div>

        {/* Brand Architecture */}
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-20 group cursor-pointer w-fit">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl transition-all group-hover:rotate-6 group-hover:scale-110 duration-500">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-none">Placement<span className="text-primary">OS</span></span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Version 4.0.2</span>
            </div>
          </div>

          <div className="space-y-10 max-w-xl">
            <div className="space-y-4">
              <div className="h-1 w-20 bg-primary/30 rounded-full" />
              <h1 className="text-7xl font-black leading-[0.95] tracking-tighter text-slate-900 uppercase">
                UNLOCK <br />
                YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-primary via-indigo-500 to-indigo-700">CAREER</span>
              </h1>
            </div>
            <p className="text-slate-500 font-bold text-xl leading-relaxed max-w-md">
              Access premium job opportunities and career resources through our advanced recruitment platform.
            </p>
          </div>
        </div>

        {/* Tactical Metrics Overlay */}
        <div className="relative z-10 grid grid-cols-2 gap-12">
          <div className="space-y-4 group">
            <div className="flex items-center gap-3 text-primary font-black uppercase text-[11px] tracking-[0.2em]">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <ShieldCheck className="h-4 w-4" /> Secure Platform
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose group-hover:text-slate-600 transition-colors">
              Advanced encryption protocols to keep your personal data and profile safe.
            </p>
          </div>
          <div className="space-y-4 group">
            <div className="flex items-center gap-3 text-indigo-600 font-black uppercase text-[11px] tracking-[0.2em]">
              <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
              <Zap className="h-4 w-4" /> Smart Matching
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose group-hover:text-slate-600 transition-colors">
              AI-powered matching to connect you with the most relevant job opportunities.
            </p>
          </div>
        </div>

        {/* HUD Geometry */}
        <div className="absolute right-[-15%] top-[10%] h-[1000px] w-[1000px] border border-slate-200/50 rounded-full pointer-events-none transition-transform duration-[10s] group-hover:rotate-180" />
        <div className="absolute right-[-20%] top-[5%] h-[1200px] w-[1200px] border border-slate-200/30 rounded-full pointer-events-none" />
      </div>

      {/* Authentication Portal Side */}
      <div className="flex items-center justify-center p-12 lg:p-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

        {/* Floating Background Icons */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <Fingerprint className="absolute top-[10%] left-[10%] h-32 w-32 -rotate-12" />
          <Activity className="absolute bottom-[20%] right-[10%] h-48 w-48 rotate-12" />
          <Monitor className="absolute top-[40%] right-[20%] h-24 w-24" />
        </div>

        <div className="w-full max-w-[480px] space-y-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-black uppercase tracking-[0.3em] text-[10px] py-1.5 px-5 rounded-full shadow-sm">SECURE ACCESS</Badge>
              <div className="flex gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                LOGIN <span className="text-primary">ACCOUNT</span>
              </h2>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px]">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="role" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-3">
                <UserCheck className="h-4 w-4 text-primary" /> Login As
              </Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger className="h-20 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-primary/20 text-slate-700 font-bold text-base px-8 shadow-inner hover:bg-white transition-all">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-3xl p-2 shadow-2xl">
                  {type === 'standard' && (
                    <>
                      <SelectItem value="student" className="font-black uppercase text-[10px] tracking-widest py-4 rounded-xl focus:bg-primary focus:text-white transition-colors cursor-pointer">Student</SelectItem>
                      <SelectItem value="professional" className="font-black uppercase text-[10px] tracking-widest py-4 rounded-xl focus:bg-indigo-600 focus:text-white transition-colors cursor-pointer">Expert / Professional</SelectItem>
                    </>
                  )}
                  {type === 'admin' && (
                    <SelectItem value="admin" className="font-black uppercase text-[10px] tracking-widest py-4 rounded-xl focus:bg-slate-900 focus:text-white transition-colors cursor-pointer">College Admin (TPO)</SelectItem>
                  )}
                  {type === 'superadmin' && (
                    <SelectItem value="superadmin" className="font-black uppercase text-[10px] tracking-widest py-4 rounded-xl focus:bg-rose-600 focus:text-white transition-colors cursor-pointer">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" /> Email Address
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-20 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-primary/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {detectedCollege && (
                <div className="mt-2 flex items-center gap-3 px-6 py-4 bg-primary/5 border border-primary/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
                  {detectedCollege.logo ? (
                    <img src={detectedCollege.logo} alt={detectedCollege.name} className="h-8 w-8 object-contain rounded-md" />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-white border border-slate-100 flex items-center justify-center">
                      <School className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">Detected Institution</p>
                    <p className="text-xs font-bold text-slate-700">{detectedCollege.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                  <Lock className="h-4 w-4 text-primary" /> Password
                </Label>
                <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors p-0 h-auto">Forgot Password?</Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-20 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-primary/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-20 rounded-[1.8rem] bg-primary hover:bg-primary/90 text-white font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group/btn relative overflow-hidden"
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                {loading ? 'LOGGING IN...' : 'LOGIN'}
                <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </form>

          <div className="space-y-10 pt-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-full h-[1px] bg-slate-100" />
              <span className="relative z-10 bg-white px-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                {type === 'standard' ? "Don't have an account?" : (type === 'admin' ? "Not enrolled yet?" : "")}
              </span>
            </div>

            {type === 'standard' && (
              <div className="grid grid-cols-2 gap-6">
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl border-2 border-slate-100 bg-white hover:border-primary/20 hover:text-primary text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm"
                  asChild
                >
                  <Link to="/signup/student">Register Student</Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-600/20 hover:text-indigo-600 text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm"
                  asChild
                >
                  <Link to="/signup/professional">Register Expert</Link>
                </Button>
              </div>
            )}

            {type === 'admin' && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="h-16 w-full rounded-2xl border-2 border-slate-100 bg-white hover:border-primary/20 hover:text-primary text-slate-400 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm"
                  asChild
                >
                  <Link to="/register-college">Register My College</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Tactical Admin Note */}
          <div className="p-8 bg-slate-900 rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Terminal className="h-24 w-24 text-white" />
            </div>
            <div className="flex items-center gap-3 text-primary relative z-10">
              <Terminal className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Demo Login Info</span>
            </div>
            <p className="text-[11px] font-bold leading-relaxed text-slate-400 relative z-10">
              Use email <span className="text-white">admin@placementos.com</span> with password <span className="text-white">admin123</span> for demo access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
