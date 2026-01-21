import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService, applicationService } from '@/services';
import {
  UserCheck, Search, Star, Briefcase, Clock,
  CheckCircle2, XCircle, Award, Target, Zap,
  MapPin, ExternalLink, Linkedin, ShieldCheck,
  TrendingUp, Users, Activity, Sparkles, Fingerprint,
  Command, Cpu, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfessionalsManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch professionals (Sanitized casting)
  const { data: professionalsData, isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalService.getAllProfessionals(),
  });

  // Fetch applications (Sanitized casting)
  const { data: applicationsData } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAllApplications(),
  });

  const professionalsList = Array.isArray((professionalsData?.data as any)?.professionals)
    ? (professionalsData?.data as any).professionals
    : Array.isArray(professionalsData?.data)
      ? professionalsData.data
      : [];

  const applicationsList = Array.isArray((applicationsData?.data as any)?.applications)
    ? (applicationsData?.data as any).applications
    : Array.isArray(applicationsData?.data)
      ? applicationsData.data
      : [];

  const filteredProfessionals = professionalsList.filter((prof: any) =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProfessionalStats = (profId: string) => {
    const feedbackCount = applicationsList.reduce((count: number, app: any) => {
      if (app.interviewFeedback) {
        return count + app.interviewFeedback.filter((f: any) => f.professionalId === profId).length;
      }
      return count;
    }, 0);

    const ratings = applicationsList.flatMap((app: any) =>
      app.interviewFeedback ? app.interviewFeedback.filter((f: any) => f.professionalId === profId).map((f: any) => f.rating || 0) : []
    );

    const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : '5.0';

    return {
      total: feedbackCount,
      avgRating: avgRating,
    };
  };

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (profId: string) =>
      professionalService.updateProfessionalStatus(profId, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Expert credential verified! Guild access granted.');
    },
    onError: (error: any) => toast.error(error.message || 'Verification failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (profId: string) =>
      professionalService.updateProfessionalStatus(profId, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.error('Registration declined. Identity purged.');
    },
    onError: (error: any) => toast.error(error.message || 'Rejection failed'),
  });

  const pendingCount = professionalsList.filter((p: any) => p.status === 'pending').length;
  const approvedCount = professionalsList.filter((p: any) => p.status === 'approved').length;

  const headerStats = [
    { label: 'Global Experts', value: professionalsList.length, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Verified Guild', value: approvedCount, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/5' },
    { label: 'Pending Audit', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/5' },
    { label: 'Guild Mastery', value: 'Lv. 8', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50/5' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Expert Management" subtitle="Credential verification and performance tracking">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent animate-spin rounded-2xl shadow-2xl shadow-primary/20" />
          <p className="font-extrabold text-primary animate-pulse uppercase tracking-[0.4em] text-[10px]">Authenticating Expert Guild...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Expert Management" subtitle="Credential verification and performance tracking for professional curators">
      <div className="space-y-10 max-w-[1600px] mx-auto pb-20 relative">

        {/* Cinematic Backdrop */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {headerStats.map((stat) => (
            <Card key={stat.label} className="border-slate-200 shadow-sm rounded-[2rem] bg-white border group hover:bg-slate-50 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-2xl p-5 transition-transform group-hover:rotate-12 duration-500 border border-slate-100 shadow-sm", stat.bg, stat.color)}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <div className="text-right">
                    <p className={cn("text-4xl font-black tracking-tighter italic leading-none", stat.color)}>{stat.value}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-80">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professional Registry */}
        <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
          <CardHeader className="bg-slate-50 p-12 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black flex items-center gap-4 italic uppercase tracking-tighter text-slate-900">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  Professional Registry
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Master override for industry specialists and interview curators</CardDescription>
              </div>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Identify expert by name, firm or specialty..."
                  className="pl-16 h-16 w-full md:w-[450px] bg-white border-slate-200 rounded-2xl shadow-sm font-bold text-slate-900 focus-visible:ring-primary/20 placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 h-20">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="px-12 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Expert Identity</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Operational Focus</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Platform Impact</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Credential Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right px-12">Audit Protocol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.length === 0 ? (
                    <TableRow className="border-none hover:bg-transparent">
                      <TableCell colSpan={5} className="py-48 text-center">
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                          <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            <Award className="h-12 w-12 text-slate-200" />
                          </div>
                          <p className="font-black text-2xl text-slate-300 uppercase tracking-tighter italic">No Expert Signatures Detected</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfessionals.map((prof: any) => {
                      const stats = getProfessionalStats(prof._id || prof.id);
                      return (
                        <TableRow key={prof._id || prof.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-100">
                          <TableCell className="px-12 py-10">
                            <div className="flex items-center gap-8">
                              <div className="relative">
                                <Avatar className="h-16 w-16 rounded-[1.5rem] border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-110 duration-500">
                                  <AvatarFallback className="bg-slate-100 text-primary font-black text-xl">
                                    {prof.name.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 shadow-sm" />
                              </div>
                              <div className="space-y-2">
                                <p className="font-black text-xl leading-none italic uppercase tracking-tighter text-slate-900">{prof.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{prof.email}</p>
                                <div className="flex items-center gap-2 mt-4">
                                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-widest px-3 shadow-none">{prof.company}</Badge>
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {prof.professionalRole && <Badge className="bg-primary/5 text-primary border border-primary/10 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-none">{prof.professionalRole} Expert</Badge>}
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"> <Clock className="h-3.5 w-3.5" /> {prof.yearsOfExperience}Y Experience</span>
                              </div>
                              <p className="text-sm font-black text-slate-700 uppercase tracking-tight italic leading-tight">{prof.designation}</p>
                              <div className="flex flex-wrap gap-2">
                                {prof.techStack?.slice(0, 3).map((tech: string) => <Badge key={tech} className="bg-slate-50 text-slate-500 border border-slate-100 text-[8px] font-black uppercase tracking-widest px-2 shadow-none">{tech}</Badge>)}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="flex items-center gap-3">
                                <Star className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                                <span className="text-2xl font-black text-slate-900 italic leading-none">{stats.avgRating}</span>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-center group-hover:scale-110 transition-transform">
                                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">MISSIONS</p>
                                  <p className="text-sm font-black text-slate-800">{stats.total}</p>
                                </div>
                                <div className="text-center group-hover:scale-110 transition-transform">
                                  <p className="text-[8px] font-black text-primary uppercase mb-1">ACTIVE</p>
                                  <p className="text-sm font-black text-primary">{prof.activeInterviewCount || 0}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {prof.status === 'approved' ? (
                              <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-sm">
                                <CheckCircle2 className="h-4 w-4" /> VERIFIED
                              </div>
                            ) : prof.status === 'pending' ? (
                              <div className="flex items-center gap-3 bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] animate-pulse shadow-sm">
                                <Activity className="h-4 w-4" /> AUDIT REQUIRED
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-sm">
                                <XCircle className="h-4 w-4" /> REJECTED
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="px-12 text-right">
                            <div className="flex justify-end gap-3 items-center">
                              {prof.status === 'pending' && (
                                <div className="flex items-center p-2 rounded-2xl bg-slate-50 border border-slate-100 gap-2 shadow-inner">
                                  <Button
                                    className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase shadow-md shadow-primary/10"
                                    onClick={() => approveMutation.mutate(prof._id || prof.id)}
                                  >
                                    AUTHORIZE
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="h-10 w-10 p-0 text-rose-400 hover:text-white hover:bg-rose-500 transition-all rounded-xl"
                                    onClick={() => rejectMutation.mutate(prof._id || prof.id)}
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </Button>
                                </div>
                              )}
                              <div className="flex items-center gap-3">
                                {prof.linkedinUrl && (
                                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-500 border border-slate-200 shadow-sm" asChild>
                                    <a href={prof.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5" /></a>
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 shadow-sm">
                                  <ExternalLink className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout >
  );
}
