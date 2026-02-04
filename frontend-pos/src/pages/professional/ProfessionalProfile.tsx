import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService } from '@/services';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  X, Plus, Save, Briefcase, Award, User,
  ShieldCheck, Zap, Star, Activity,
  Fingerprint, Sparkles, Building2,
  ChevronRight, BrainCircuit, Network,
  Info, CheckCircle2, Globe, Command,
  ArrowRight, Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfessionalProfile() {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => professionalService.getMyProfile(),
  });

  const professional = profileData?.data;

  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (professional) {
      setTechStack(professional.techStack || []);
      setYearsOfExperience(professional.yearsOfExperience || 0);
      setBio(professional.bio || '');
    }
  }, [professional]);

  const handleAddTech = () => {
    if (!newTech.trim()) return;
    if (techStack.includes(newTech.trim())) {
      toast.error('This technology is already added');
      return;
    }
    setTechStack([...techStack, newTech.trim()]);
    setNewTech('');
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: { techStack: string[]; yearsOfExperience: number; bio: string }) =>
      professionalService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const handleSave = () => {
    if (techStack.length === 0) return toast.error('Minimum one (1) skill required');
    if (yearsOfExperience < 0 || yearsOfExperience > 50) return toast.error('Invalid experience value');

    updateProfileMutation.mutate({ techStack, yearsOfExperience, bio });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Profile" subtitle="Loading profile...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-xl shadow-2xl shadow-primary/20" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Connecting...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!professional) {
    return (
      <DashboardLayout title="Expert Identity" subtitle="Professional dossier">
        <div className="max-w-4xl mx-auto py-20">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900/50 backdrop-blur-3xl p-24 text-center space-y-6 ring-1 ring-white/5">
            <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/20 mx-auto">
              <Info className="h-10 w-10 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">NO <span className="text-primary">DATA</span></h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Profile not found</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Manage your professional details, expertise, and interview stats"
    >
      <div className="max-w-[1400px] mx-auto space-y-12 pb-20 relative">

        {/* Subtle Decorative Accents */}
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/5 rounded-full blur-[120px] -z-10" />

        {/* Profile Hero Header */}
        <div className="relative group/hero">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-blue-600/10 rounded-[3.5rem] blur opacity-20 group-hover/hero:opacity-30 transition duration-1000"></div>
          <Card className="relative bg-white border-slate-200 shadow-sm rounded-[3rem] overflow-hidden border">
            <CardContent className="p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

                <div className="flex flex-col md:flex-row items-center gap-12 flex-1">
                  <div className="relative shrink-0">
                    <div className="h-40 w-40 rounded-[3rem] bg-slate-50 flex items-center justify-center text-6xl font-black text-slate-400 border-4 border-white shadow-sm relative">
                      {professional.name.charAt(0)}
                      <div className="absolute inset-[-4px] rounded-[3.1rem] border-2 border-primary/20 animate-pulse" />
                    </div>
                    <div className="absolute -bottom-3 -right-3 h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white transform rotate-12">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className="text-center md:text-left space-y-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900">{professional.name}</h2>
                        <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black px-6 py-2 rounded-full uppercase text-[10px] tracking-[0.2em] shadow-none">Verified Expert</Badge>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="h-1 w-12 bg-primary rounded-full" />
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] leading-none">
                          {professional.designation} <span className="text-primary mx-2">@</span> {professional.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-3 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm">
                        <Mail className="h-3.5 w-3.5 text-primary" /> {professional.email}
                      </div>
                      <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-2xl border border-emerald-100 font-black text-[10px] uppercase tracking-widest shadow-sm">
                        <Activity className="h-3.5 w-3.5" /> Synchronized Access
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full lg:w-auto">
                  <ImpactMetric label="Total Interviews" value={professional.interviewsTaken} icon={Terminal} />
                  <ImpactMetric label="Expert Rating" value={`${professional.rating.toFixed(1)}/5`} icon={Star} />
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Section 1: Expert Specializations */}
          <div className="lg:col-span-8 space-y-10">

            {/* Specializations matrix */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
              <CardHeader className="p-12 pb-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-900">
                      <BrainCircuit className="h-7 w-7 text-primary" /> Expertise & Tech Stack
                    </CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">The technologies and skills you specialize in</CardDescription>
                  </div>
                  <Command className="h-8 w-8 text-slate-200" />
                </div>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                <div className="space-y-5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary" /> Add New Technology
                  </Label>
                  <div className="flex gap-4">
                    <div className="relative flex-1 group">
                      <Input
                        placeholder="Ex: Distributed Systems, Low-Latency FinTech, Zero Knowledge..."
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTech()}
                        className="h-16 px-8 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-primary/20 font-bold text-sm shadow-none hover:bg-white transition-all"
                      />
                    </div>
                    <Button onClick={handleAddTech} className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group">
                      <Plus className="h-7 w-7 group-hover:rotate-90 transition-transform" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Active specialized competencies</Label>
                  <div className="flex flex-wrap gap-4 p-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 min-h-[160px] relative overflow-hidden">
                    {techStack.length === 0 ? (
                      <div className="flex flex-col items-center justify-center w-full space-y-4 opacity-20">
                        <Network className="h-12 w-12 text-slate-400" />
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">No Skills Added</p>
                      </div>
                    ) : (
                      techStack.map((tech) => (
                        <div key={tech} className="relative group/tag">
                          <Badge className="h-12 px-6 rounded-2xl bg-white text-slate-700 border border-slate-200 hover:border-primary/30 transition-all font-black uppercase text-[10px] tracking-widest pr-12 shadow-sm">
                            {tech}
                          </Badge>
                          <button onClick={() => handleRemoveTech(tech)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Narrative */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
              <CardHeader className="p-12 pb-6 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-900">
                  <Fingerprint className="h-7 w-7 text-primary" /> Professional Bio
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Your professional summary and advice for students</CardDescription>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <div className="space-y-5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Years of Experience</Label>
                  <div className="relative w-48 group">
                    <Award className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
                      className="h-16 pl-16 pr-6 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-primary/20 font-black text-xl text-slate-900 text-center"
                    />
                  </div>
                </div>
                <div className="space-y-5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">About You</Label>
                  <div className="relative group">
                    <Textarea
                      placeholder="Write a short bio about your professional journey..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={6}
                      className="rounded-[2.5rem] border-2 border-slate-200 p-12 font-bold text-lg focus-visible:ring-primary/20 bg-slate-50/50 placeholder:text-slate-300 shadow-none resize-none leading-relaxed text-slate-600"
                    />
                    <div className="absolute bottom-6 right-8 text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Globe className="h-3 w-3" /> Publicly visible
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Command & Meta */}
          <div className="lg:col-span-4 space-y-10 sticky top-28">

            {/* Identity Ledger */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
              <CardHeader className="p-10 pb-4 border-b border-slate-100 bg-slate-50/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <SecurityIcon className="h-4 w-4" /> Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <LedgerItem label="Role" value={professional.professionalRole || 'Expert Interviewer'} />
                <LedgerItem label="System Status" value={professional.status?.toUpperCase()} valueColor="text-emerald-600" icon={Activity} />
                <LedgerItem label="Pending Interviews" value={professional.activeInterviewCount} icon={Briefcase} />
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                    Your basic account details are managed by the admin. Please contact support for changes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sync Command */}
            <div className="relative group/save">
              <div className="absolute -inset-1 bg-primary/10 rounded-[3.5rem] blur opacity-20 group-hover/save:opacity-40 transition duration-500" />
              <Card className="relative border-slate-200 shadow-sm rounded-[3rem] bg-white border p-12 overflow-hidden">
                <Zap className="absolute -right-8 -bottom-8 h-40 w-40 text-slate-50 group-hover/save:rotate-12 transition-transform duration-1000" />
                <div className="space-y-8 relative z-10">
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase leading-tight text-slate-900">SAVE PROFILE</h4>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">Keep your profile updated to match with the most relevant candidates.</p>
                  </div>
                  <Button
                    className="w-full h-16 rounded-2xl bg-primary text-white font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 gap-4 group/btn uppercase tracking-widest transition-all"
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'SAVING...' : 'SAVE CHANGES'}
                    <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </div>

            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-full blur-[40px]" />
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pro Tip</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                  Keep your bio and skills updated to help students understand your expectations.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ImpactMetric({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 flex flex-col items-center justify-center space-y-4 group/metric hover:border-primary/20 transition-all shadow-sm">
      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover/metric:bg-primary group-hover/metric:text-white transition-all duration-500">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function LedgerItem({ label, value, icon: Icon = Zap, valueColor = "text-slate-900" }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      </div>
      <p className={cn("text-xs font-black uppercase tracking-tight", valueColor)}>{value}</p>
    </div>
  );
}

function SecurityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Mail(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
