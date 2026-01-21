import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase, ArrowLeft, Plus, X,
  User, Mail, Phone, Lock, School,
  GraduationCap, Award, Linkedin, Github,
  ChevronRight, Sparkles, Target, Zap, ShieldCheck,
  Activity, Monitor, Globe, BrainCircuit, Rocket, Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';

export default function StudentSignup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: '',
    branch: '',
    cgpa: '',
    graduationYear: '',
    linkedinUrl: '',
    githubUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Security pattern mismatch. Verification failed.');
      return;
    }
    if (skills.length === 0) {
      toast.error('Skill matrix incomplete. Provide at least one competency.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.register({
        role: 'student',
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        college: formData.college,
        degree: formData.degree,
        branch: formData.branch,
        cgpa: parseFloat(formData.cgpa),
        graduationYear: parseInt(formData.graduationYear),
        skills: skills,
        linkedinUrl: formData.linkedinUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
      });
      if (response.success) {
        dispatch(login(response.data.user));
        toast.success('Identity Verified. Welcome to the Collective.');
        navigate('/student/home');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration sequence failure.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary selection:text-white pb-32 overflow-x-hidden relative font-sans">

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-16">

        {/* Cinematic Header Section */}
        <div className="flex flex-col items-center gap-10 mb-20 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
          <Link to="/login" className="group flex items-center gap-3 px-8 py-3 rounded-full bg-white border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Access Nexus Portal
          </Link>

          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:opacity-100 transition duration-1000 opacity-0" />
              <div className="relative h-24 w-24 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl shadow-slate-200/50 transition-transform group-hover:rotate-6 duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <Target className="h-10 w-10 text-primary relative z-10" />
              </div>
              <div className="absolute -right-6 -top-6 animate-bounce-slow">
                <Sparkles className="h-10 w-10 text-primary/40" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-tight text-slate-900">
                STUDENT <span className="text-primary">INITIATE</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-3 italic">
                <div className="h-1 w-12 bg-primary/20 rounded-full" />
                ESTABLISH UNIQUE PROFESSIONAL COORDINATES
                <div className="h-1 w-12 bg-primary/20 rounded-full" />
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Section Tactical Console */}
        <Card className="border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[4rem] overflow-hidden bg-white/70 backdrop-blur-3xl border relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>

              {/* Core Identity Segment */}
              <div className="p-12 lg:p-20 border-b border-slate-100 relative group">
                <div className="absolute top-12 right-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Fingerprint className="h-32 w-32" />
                </div>

                <div className="flex items-center gap-6 mb-16">
                  <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Core Identity</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Personal Manifestation Parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                      IDENTIFIER NAME
                    </Label>
                    <Input
                      required
                      className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-primary/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
                      placeholder="Ex: Alexander Pierce"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                      IDENTITY VECTOR (EMAIL)
                    </Label>
                    <Input
                      type="email"
                      required
                      className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-primary/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
                      placeholder="alex@nexus.edu"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">COMM LINK (PHONE)</Label>
                    <Input
                      required
                      className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-primary/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">SECURITY PATTERN</Label>
                      <Input
                        type="password"
                        required
                        className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-primary/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">VERIFY PATTERN</Label>
                      <Input
                        type="password"
                        required
                        className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-primary/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Nexus Segment */}
              <div className="p-12 lg:p-20 border-b border-slate-100 bg-slate-50/50 relative">
                <div className="flex items-center gap-6 mb-16">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 border border-indigo-100 shadow-sm">
                    <School className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Academic Nexus</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Institutional Foundation Parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="space-y-4 md:col-span-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">INCUBATIONAL HUB (COLLEGE)</Label>
                    <Input
                      required
                      className="h-16 rounded-[1.5rem] bg-white border-slate-200 focus:ring-primary/20 px-8 font-bold text-base shadow-sm"
                      placeholder="Your Institution of Excellence"
                      value={formData.college}
                      onChange={(e) => updateField('college', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">ATTAINMENT LEVEL</Label>
                    <Select value={formData.degree} onValueChange={(v) => updateField('degree', v)}>
                      <SelectTrigger className="h-16 rounded-[1.5rem] bg-white border-slate-200 focus:ring-primary/20 text-slate-700 font-bold text-base px-8 shadow-sm">
                        <SelectValue placeholder="Select Degree" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 rounded-2xl">
                        {['B.Tech', 'M.Tech', 'MCA', 'BCA'].map(degree => (
                          <SelectItem key={degree} value={degree} className="font-bold uppercase text-[11px] tracking-widest py-3">{degree} (Tactical)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">SPECIALIZATION BRANCH</Label>
                    <Input
                      className="h-16 rounded-[1.5rem] bg-white border-slate-200 focus:ring-primary/20 px-8 font-bold text-base shadow-sm"
                      placeholder="Ex: Neural Systems"
                      value={formData.branch}
                      onChange={(e) => updateField('branch', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                      <BrainCircuit className="h-3.5 w-3.5 text-primary" /> COGNITIVE INDEX (CGPA)
                    </Label>
                    <Input
                      type="number" step="0.01" min="0" max="10"
                      required
                      className="h-16 rounded-[1.5rem] bg-white border-slate-200 focus:ring-primary/20 px-8 font-black text-xl text-primary shadow-sm"
                      placeholder="8.50"
                      value={formData.cgpa}
                      onChange={(e) => updateField('cgpa', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">DEPLOYMENT YEAR</Label>
                    <Select value={formData.graduationYear} onValueChange={(v) => updateField('graduationYear', v)}>
                      <SelectTrigger className="h-16 rounded-[1.5rem] bg-white border-slate-200 focus:ring-primary/20 text-slate-700 font-bold text-base px-8 shadow-sm">
                        <SelectValue placeholder="Graduation" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 rounded-2xl">
                        {['2024', '2025', '2026', '2027', '2028'].map(y => (
                          <SelectItem key={y} value={y} className="font-bold text-sm">{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Competency Matrix Segment */}
              <div className="p-12 lg:p-20 space-y-16">
                <div className="flex flex-col lg:flex-row gap-20">
                  <div className="flex-1 space-y-12">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
                        <Zap className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Competency Matrix</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Active Skill Telemetry</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex gap-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-200 focus-within:border-primary/30 transition-all">
                        <div className="relative flex-1 group">
                          <Plus className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input
                            className="h-16 pl-14 rounded-2xl bg-transparent border-none focus-visible:ring-0 font-bold text-base placeholder:text-slate-300"
                            placeholder="INITIALIZE SKILL (EX: RUST)"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          />
                        </div>
                        <Button type="button" onClick={addSkill} className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group transition-all">
                          <Plus className="h-7 w-7 text-white group-hover:rotate-90 transition-transform" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-4 min-h-[48px]">
                        {skills.map((skill) => (
                          <div key={skill} className="group relative animate-in zoom-in-95 duration-300">
                            <Badge className="h-12 px-8 rounded-2xl bg-white text-slate-600 border border-slate-200 hover:border-rose-200 hover:text-rose-500 transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer pr-12 shadow-sm">
                              {skill}
                            </Badge>
                            <button onClick={() => removeSkill(skill)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {skills.length === 0 && (
                          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-100 w-full justify-center">
                            <Monitor className="h-4 w-4 text-slate-200" />
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200 italic">Matrix Empty. Decrypt and upload skills.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vector Links Sidepanel */}
                  <div className="lg:w-[360px] space-y-8 bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-10">
                      <div className="space-y-5">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 italic">
                          <Linkedin className="h-4 w-4 text-primary" /> LinkedIn Vector
                        </Label>
                        <Input
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-sm font-bold placeholder:text-white/20 px-6 focus:ring-primary/40 text-white"
                          placeholder="linkedin.com/in/..."
                          value={formData.linkedinUrl}
                          onChange={(e) => updateField('linkedinUrl', e.target.value)}
                        />
                      </div>

                      <div className="space-y-5">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 italic">
                          <Github className="h-4 w-4 text-primary" /> GitHub Vector
                        </Label>
                        <Input
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-sm font-bold placeholder:text-white/20 px-6 focus:ring-primary/40 text-white"
                          placeholder="github.com/..."
                          value={formData.githubUrl}
                          onChange={(e) => updateField('githubUrl', e.target.value)}
                        />
                      </div>

                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                          <ShieldCheck className="h-5 w-5" />
                          <span className="text-[11px] font-black uppercase tracking-widest italic">Encrypted Sink</span>
                        </div>
                        <p className="text-[10px] font-medium leading-relaxed italic text-slate-400">
                          Your profile vectors are hashed and stored in our secure neural vault. Verified institutional access only.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Persistence Area */}
                <div className="pt-16 flex flex-col md:flex-row gap-10 items-center justify-between border-t border-slate-100">
                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 max-w-sm leading-relaxed italic">
                      BY INITIALIZING, YOU SYNC WITH THE <span className="text-slate-900 underline cursor-pointer hover:text-primary transition-colors">SECURITY PROTOCOL</span> AND DEPLOY THE <span className="text-slate-900 underline cursor-pointer hover:text-primary transition-colors">PRIVACY UPLINK</span> GUIDELINES.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto h-20 px-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-primary/30 group/btn transition-all active:scale-95"
                  >
                    <span className="flex items-center gap-4">
                      {loading ? 'CALIBRATING...' : 'INITIALIZE MISSION'}
                      <Rocket className="h-5 w-5 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tactical Footer */}
        <div className="mt-16 text-center space-y-4 animate-in fade-in duration-1000 delay-500">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
            END-TO-END NEURAL PROTECTION ACTIVE • PLACEMENT OS v4.0
          </p>
        </div>
      </div>
    </div>
  );
}
