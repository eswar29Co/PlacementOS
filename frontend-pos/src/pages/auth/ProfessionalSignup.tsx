import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase, ArrowLeft, CheckCircle2, Plus, X,
  User, Mail, Phone, Lock, Building2,
  UserCog, Award, Linkedin, ChevronRight,
  ShieldCheck, Zap, Sparkles, AlertTriangle,
  Monitor, Activity, Globe, Rocket, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch } from '@/store/hooks';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';

export default function ProfessionalSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: '',
    designation: '',
    experience: '',
    linkedinUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Security pattern mismatch. Verification failed.');
      return;
    }
    if (techStack.length === 0) {
      toast.error('Expertise matrix incomplete. Provide at least one competency.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.register({
        role: 'professional',
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company,
        designation: formData.designation,
        yearsOfExperience: parseInt(formData.experience),
        experience: parseInt(formData.experience),
        techStack: techStack,
        expertise: techStack,
        linkedinUrl: formData.linkedinUrl || undefined,
      });
      if (response.success) {
        setSubmitted(true);
        toast.success('Dossier archived. Pending admin validation.');
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

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8 relative overflow-hidden font-sans">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        <Card className="w-full max-w-2xl border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[4rem] bg-white border relative z-10 overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
          <CardContent className="p-16 lg:p-24 space-y-12">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-[2.5rem] blur-2xl animate-pulse" />
              <div className="relative h-full w-full rounded-[2.5rem] bg-emerald-50 bg-white flex items-center justify-center border border-emerald-100 shadow-xl transition-transform hover:scale-110 duration-500">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-tight">
                DOSSIER <span className="text-emerald-500 italic">ARCHIVED</span>
              </h2>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs italic">Awaiting System Admin Validation</p>
            </div>

            <div className="max-w-md mx-auto">
              <p className="text-slate-500 font-bold text-lg leading-relaxed italic">
                Strategic contribution recognized. Your credentials have been synchronized for manual verification. Access will be authorized upon successful calibration of your professional orb.
              </p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="h-20 px-16 rounded-[2rem] bg-slate-900 hover:bg-black text-white font-black uppercase text-sm tracking-[0.2em] transition-all shadow-2xl active:scale-95 group"
            >
              RETURN TO NEXUS PORTAL <ChevronRight className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Verification latency: 24-48 Business Cycles</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white pb-32 overflow-x-hidden relative font-sans">

      {/* HUD Background Decorations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-16">

        {/* Presidential Header Section */}
        <div className="flex flex-col items-center gap-10 mb-16 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
          <Link to="/login" className="group flex items-center gap-3 px-8 py-3 rounded-full bg-white border border-slate-200 hover:border-indigo-600/30 hover:shadow-lg transition-all text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Access Nexus Portal
          </Link>

          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-indigo-600/20 rounded-[2.5rem] blur-2xl group-hover:opacity-100 transition duration-1000 opacity-0" />
              <div className="relative h-24 w-24 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl shadow-slate-200/50 transition-all group-hover:rotate-6 group-hover:scale-105 duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent" />
                <UserCog className="h-10 w-10 text-indigo-600 relative z-10" />
              </div>
              <div className="absolute -right-6 -top-6 animate-bounce-slow">
                <Sparkles className="h-10 w-10 text-indigo-600/40" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-tight text-slate-900">
                EXPERT <span className="text-indigo-600 italic">ONBOARDING</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 italic">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                SYNERGIZE WITH THE NEXT GENERATION OF TALENT
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
              </p>
            </div>
          </div>
        </div>

        {/* Verification Warning Interstitial */}
        <div className="max-w-2xl mx-auto mb-16 p-6 rounded-3xl bg-amber-50 border border-amber-200 flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000 bg-white/50 backdrop-blur-xl shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 leading-relaxed italic">
            Verification Protocol Alpha: Professional dossiers undergo high-fidelity manual screening (24-48h temporal latency).
          </p>
        </div>

        {/* Tactical Expert Console */}
        <Card className="border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[4rem] overflow-hidden bg-white/70 backdrop-blur-3xl border relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-600/20 to-transparent" />

          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>

              {/* Expert Identity Segment */}
              <div className="p-12 lg:p-20 border-b border-slate-100 relative group">
                <div className="absolute top-12 right-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <UserCog className="h-32 w-32" />
                </div>

                <div className="flex items-center gap-6 mb-16">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Expert Identity</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Personal Manifestation Parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">FULL NAME IDENTIFIER</Label>
                    <Input
                      required
                      className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-indigo-600/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
                      placeholder="Ex: Marcus Thorne"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">PROFESSIONAL VECTOR (EMAIL)</Label>
                    <Input
                      type="email"
                      required
                      className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-indigo-600/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
                      placeholder="marcus@orbit.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">COMM LINK (PHONE)</Label>
                    <Input
                      required
                      className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-indigo-600/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
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
                        className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-indigo-600/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
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
                        className="h-16 rounded-[1.5rem] bg-slate-50 border-slate-100 focus:ring-indigo-600/20 px-8 font-bold text-base shadow-inner transition-all hover:bg-white placeholder:text-slate-200 text-slate-900"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Zenith Segment */}
              <div className="p-12 lg:p-20 border-b border-slate-100 bg-slate-50/50 relative">
                <div className="flex items-center gap-6 mb-16">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Operational Zenith</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Industry Foundation Parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  <div className="space-y-4 md:col-span-2">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">CURRENT ORBIT (COMPANY)</Label>
                    <Input
                      required
                      className="h-16 rounded-[1.5rem] bg-white border-slate-200 focus:ring-indigo-600/20 px-8 font-bold text-base shadow-sm"
                      placeholder="Ex: CyberDyne Systems"
                      value={formData.company}
                      onChange={(e) => updateField('company', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">FUNCTIONAL DESIGNATION</Label>
                    <Input
                      required
                      className="h-16 rounded-[1.5rem] bg-white border-slate-200 focus:ring-indigo-600/20 px-8 font-bold text-base shadow-sm"
                      placeholder="Principal Architect"
                      value={formData.designation}
                      onChange={(e) => updateField('designation', e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">TENURE (YEARS)</Label>
                    <Input
                      type="number"
                      required
                      className="h-16 rounded-[1.5rem] bg-white border-slate-200 focus:ring-indigo-600/20 px-8 font-black text-2xl text-indigo-600 shadow-sm"
                      placeholder="8"
                      value={formData.experience}
                      onChange={(e) => updateField('experience', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Expertise HUD Segment */}
              <div className="p-12 lg:p-20 space-y-16">
                <div className="flex flex-col lg:flex-row gap-20">
                  <div className="flex-1 space-y-12">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                        <Zap className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 italic">Expertise HUD</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Technical Competency Telemetry</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex gap-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-200 focus-within:border-indigo-600/30 transition-all">
                        <div className="relative flex-1 group">
                          <Plus className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                          <Input
                            className="h-16 pl-14 rounded-2xl bg-transparent border-none focus-visible:ring-0 font-bold text-base placeholder:text-slate-300"
                            placeholder="INITIALIZE COMPETENCY (EX: ARCHITECTURE)"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                          />
                        </div>
                        <Button type="button" onClick={addTech} className="h-16 w-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 group transition-all">
                          <Plus className="h-7 w-7 text-white group-hover:rotate-90 transition-transform" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-4 min-h-[48px]">
                        {techStack.map((tech) => (
                          <div key={tech} className="group relative animate-in zoom-in-95 duration-300">
                            <Badge className="h-12 px-8 rounded-2xl bg-white text-slate-600 border border-slate-200 hover:border-rose-200 hover:text-rose-500 transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer pr-12 shadow-sm">
                              {tech}
                            </Badge>
                            <button onClick={() => removeTech(tech)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {techStack.length === 0 && (
                          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-100 w-full justify-center">
                            <Monitor className="h-4 w-4 text-slate-200" />
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200 italic">Expertise Matrix Uninitialized. Define Mission Skills.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operational Detail Sidepanel */}
                  <div className="lg:w-[360px] space-y-8 bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-10">
                      <div className="space-y-5">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 italic">
                          <Linkedin className="h-4 w-4 text-indigo-400" /> Executive Vector (LinkedIn)
                        </Label>
                        <Input
                          required
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-sm font-bold placeholder:text-white/20 px-6 focus:ring-indigo-600/40 text-white"
                          placeholder="linkedin.com/in/..."
                          value={formData.linkedinUrl}
                          onChange={(e) => updateField('linkedinUrl', e.target.value)}
                        />
                      </div>

                      <div className="p-8 bg-indigo-600/10 rounded-[2rem] border border-indigo-600/20 space-y-5 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                          <Award className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-3 text-indigo-400">
                          <Award className="h-5 w-5" />
                          <span className="text-[11px] font-black uppercase tracking-widest italic">Protocol Tip</span>
                        </div>
                        <p className="text-[10px] font-medium leading-relaxed italic text-slate-400 relative z-10">
                          Verified expert profiles receive priority mission assignments. Ensure your professional orbit coordinates are synchronized for high-fidelity validation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Submission Persistence */}
                <div className="pt-16 flex flex-col md:flex-row gap-10 items-center justify-between border-t border-slate-100">
                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 max-w-sm leading-relaxed italic text-left">
                      VALIDATION IMPLIES ACCEPTANCE OF THE <span className="text-slate-900 underline cursor-pointer hover:text-indigo-600 transition-colors">EXPERT CODE OF CONDUCT</span> AND THE <span className="text-slate-900 underline cursor-pointer hover:text-indigo-600 transition-colors">CONFIDENTIALITY PROTOCOL</span>.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto h-20 px-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-indigo-600/30 group/btn transition-all active:scale-95"
                  >
                    <span className="flex items-center gap-4">
                      {loading ? 'SYNCHRONIZING...' : 'SUBMIT FOR VALIDATION'}
                      <Rocket className="h-5 w-5 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" />
                    </span>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tactical Footer */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
            SECURE ARCHIVAL SYSTEM • SECTOR-LEVEL ENCRYPTION ACTIVE • PLACEMENT OS
          </p>
        </div>
      </div>
    </div>
  );
}
