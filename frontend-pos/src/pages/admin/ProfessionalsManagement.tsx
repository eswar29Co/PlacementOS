import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService, adminService } from '@/services';
import {
  UserCheck, Search, Star, Briefcase, Clock,
  CheckCircle2, XCircle, Award, Target,
  ShieldCheck, Activity, Users,
  Fingerprint, Cpu, ArrowRight, Calendar,
  MessageSquare, Linkedin, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProfessionalsManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfId, setSelectedProfId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch professionals
  const { data: professionalsData, isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalService.getAllProfessionals(),
  });

  // Fetch professional history for modal
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['professionalHistory', selectedProfId],
    queryFn: () => selectedProfId ? adminService.getProfessionalHistory(selectedProfId) : null,
    enabled: !!selectedProfId,
  });

  const professionalsList = Array.isArray((professionalsData?.data as any)?.professionals)
    ? (professionalsData?.data as any).professionals
    : Array.isArray(professionalsData?.data)
      ? professionalsData.data
      : [];

  const filteredProfessionals = professionalsList.filter((prof: any) =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (profId: string) =>
      professionalService.updateProfessionalStatus(profId, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Expert authorized successfully!');
    },
    onError: (error: any) => toast.error(error.message || 'Verification failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (profId: string) =>
      professionalService.updateProfessionalStatus(profId, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.error('Expert registration declined.');
    },
    onError: (error: any) => toast.error(error.message || 'Operation failed'),
  });

  const handleViewProfile = (profId: string) => {
    setSelectedProfId(profId);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Expert Management" subtitle="Verify and track expert performance">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent animate-spin rounded-2xl shadow-2xl shadow-primary/20" />
          <p className="font-extrabold text-primary animate-pulse uppercase tracking-[0.4em] text-[10px]">Loading Experts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Expert Registry" subtitle="Manage industry specialists and technical interviewers">
      <div className="space-y-10 max-w-[1600px] mx-auto pb-20 relative">

        {/* Backdrop Decor */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

        {/* Tactical Scorecards */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard label="Total Experts" value={professionalsList.length} icon={Users} color="text-primary" />
          <StatCard label="Verified" value={professionalsList.filter((p: any) => p.status === 'approved').length} icon={ShieldCheck} color="text-emerald-500" />
          <StatCard label="Active Reviews" value={professionalsList.filter((p: any) => p.status === 'pending').length} icon={Clock} color="text-amber-500" />
          <StatCard label="Network Reach" value="45+ Firms" icon={Globe} color="text-blue-500" />
        </div>

        {/* Global Registry */}
        <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
          <CardHeader className="bg-slate-50 p-12 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black flex items-center gap-4 italic uppercase tracking-tighter text-slate-900">
                  <UserCheck className="h-8 w-8 text-primary" />
                  Expert Database
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Authorize and monitor interview performance of industry professionals</CardDescription>
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
                    <TableHead className="px-12 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Expert Information</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Role & Expertise</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Load</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Verification Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right px-12">Operations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.length === 0 ? (
                    <TableRow className="border-none hover:bg-transparent">
                      <TableCell colSpan={5} className="py-48 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <ShieldCheck className="h-12 w-12 text-slate-200" />
                          <p className="font-black text-2xl text-slate-300 uppercase tracking-tighter italic">No Expert Records Found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfessionals.map((prof: any) => (
                      <TableRow key={prof._id || prof.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-100">
                        <TableCell className="px-12 py-10">
                          <div className="flex items-center gap-8">
                            <Avatar className="h-16 w-16 rounded-[1.5rem] border-2 border-slate-100 shadow-sm group-hover:scale-110 duration-500">
                              <AvatarFallback className="bg-slate-100 text-primary font-black text-xl italic">{prof.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="font-black text-xl leading-none italic uppercase tracking-tighter text-slate-900">{prof.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{prof.company}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-3">
                            <Badge className="bg-primary/5 text-primary border border-primary/10 font-black text-[8px] uppercase tracking-widest">{prof.professionalRole}</Badge>
                            <p className="text-sm font-black text-slate-600 uppercase tracking-tight italic leading-none">{prof.designation}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xl font-black text-slate-900 italic leading-none">{prof.activeInterviewCount || 0}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">ACTIVE</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.2em] border-none shadow-sm",
                            prof.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                              prof.status === 'pending' ? "bg-amber-50 text-amber-600 animate-pulse" : "bg-rose-50 text-rose-600"
                          )}>
                            {prof.status === 'approved' ? 'VERIFIED' : prof.status === 'pending' ? 'IN AUDIT' : 'REVOKED'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-12 text-right">
                          <div className="flex justify-end gap-3">
                            {prof.status === 'pending' && (
                              <Button className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase shadow-lg shadow-emerald-600/10" onClick={() => approveMutation.mutate(prof._id || prof.id)}>APPROVE</Button>
                            )}
                            <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase shadow-lg shadow-slate-900/10 gap-2" onClick={() => handleViewProfile(prof._id || prof.id)}>PROFILE <ArrowRight className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Expert Profile & History Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-5xl rounded-[3rem] p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="p-12 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-10">
                <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-white shadow-xl">
                  <AvatarFallback className="bg-primary text-white font-black text-3xl italic">
                    {historyData?.data?.professional?.name?.charAt(0) || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                    {historyData?.data?.professional?.name || 'Loading...'}
                  </DialogTitle>
                  <div className="flex items-center gap-6">
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] italic">{historyData?.data?.professional?.email}</p>
                    <Badge className="bg-white text-slate-600 border border-slate-200 font-black text-[9px] uppercase px-3 py-1 rounded-full">{historyData?.data?.professional?.company}</Badge>
                    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] uppercase px-3 py-1 rounded-full">{historyData?.data?.professional?.designation}</Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              {historyLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin" />
                  <p className="font-black text-[10px] text-primary uppercase tracking-widest animate-pulse">Initializing Data Stream...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Stats Grid for Expert */}
                  <div className="grid grid-cols-4 gap-6">
                    <HistoryStat label="Expert Rating" value={historyData?.data?.professional?.rating || '5.0'} icon={Star} color="text-amber-500" />
                    <HistoryStat label="Interviews Done" value={historyData?.data?.interviews?.length || 0} icon={Briefcase} color="text-blue-500" />
                    <HistoryStat label="Current Load" value={historyData?.data?.professional?.activeInterviewCount || 0} icon={Activity} color="text-rose-500" />
                    <HistoryStat label="Experience" value={`${historyData?.data?.professional?.yearsOfExperience}Y`} icon={Award} color="text-purple-500" />
                  </div>

                  {/* Bio & Tech Stack */}
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 italic"><Fingerprint className="h-4 w-4" /> PROFESSIONAL BIO</h5>
                      <p className="text-slate-600 font-bold text-sm leading-relaxed italic border-l-4 border-primary/20 pl-6">
                        {historyData?.data?.professional?.bio || "Highly experienced technical specialist currently contributing to global platform architecture and candidate assessment protocols."}
                      </p>
                    </div>
                    <div className="space-y-6">
                      <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 italic"><Cpu className="h-4 w-4" /> EXPERTISE STACK</h5>
                      <div className="flex flex-wrap gap-2">
                        {historyData?.data?.professional?.techStack?.map((tech: string) => (
                          <Badge key={tech} className="bg-slate-50 text-slate-500 border border-slate-200 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interview History */}
                  <div className="space-y-8">
                    <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 italic">
                      <MessageSquare className="h-4 w-4" /> CANDIDATE ASSESSMENT LOGS
                    </h5>

                    <div className="space-y-6">
                      {historyData?.data?.interviews?.length === 0 ? (
                        <div className="bg-slate-50 rounded-3xl p-10 text-center border border-dashed border-slate-200">
                          <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest italic">No candidate sessions recorded.</p>
                        </div>
                      ) : (
                        historyData?.data?.interviews?.map((interview: any) => (
                          <div key={interview.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:bg-slate-50 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-6">
                                <Avatar className="h-12 w-12 rounded-2xl border border-slate-100">
                                  <AvatarFallback className="bg-primary/5 text-primary font-black text-xs italic">{interview.studentId?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-black text-lg italic uppercase tracking-tighter text-slate-900">{interview.studentId?.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{interview.studentId?.college || 'External Candidate'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SESSION DATE</p>
                                <p className="text-[11px] font-black text-slate-900 italic uppercase">{format(new Date(interview.updatedAt), 'PPP')}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">TARGET ROLE</p>
                                <p className="text-xs font-black text-slate-600 uppercase italic leading-none">{interview.jobId?.companyName} • {interview.jobId?.roleTitle}</p>
                              </div>
                              <div className="flex justify-end gap-10">
                                <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SESSION ID</p>
                                  <p className="text-xs font-black text-primary italic">{interview.id.slice(-8).toUpperCase()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <div className="flex gap-4">
                {historyData?.data?.professional?.linkedinUrl && (
                  <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest text-blue-600 flex items-center gap-3 shadow-sm" asChild>
                    <a href={historyData.data.professional.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" /> VERIFIED LINKEDIN
                    </a>
                  </Button>
                )}
                <Button className="rounded-2xl h-12 px-10 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.3em] italic" onClick={() => setIsModalOpen(false)}>
                  CLOSE REGISTRY
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout >
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-[2rem] bg-white border overflow-hidden relative group hover:bg-slate-50 transition-all duration-500">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className={cn("rounded-2xl p-4 border border-slate-100 bg-white shadow-sm transition-transform group-hover:rotate-6 duration-300", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className={cn("text-3xl font-black tracking-tighter italic leading-none", color)}>{value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-80">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-5 group hover:bg-slate-50 transition-all duration-300">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-slate-100 bg-white shadow-inner transition-transform group-hover:scale-110", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black italic text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
}
