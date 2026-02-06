import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/store/hooks';
import { professionalService, applicationService, jobService, studentService, assessmentService } from '@/services';
import {
  Users, UserCheck, Briefcase, TrendingUp, CheckCircle2, XCircle,
  Clock, Calendar as CalendarIcon, ShieldCheck, Zap, ArrowRight, Star, FileText,
  Search, Filter, ChevronRight, Activity, Award, MessageSquare, Target, User,
  Cpu, Terminal, Brain, Sparkles, AppWindow, MousePointer2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ApplicationStatus } from '@/types';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  // Logic & Data Fetching (Sanitized)
  const { data: professionalsData } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalService.getAllProfessionals(),
  });
  const professionals = Array.isArray((professionalsData?.data as any)?.professionals)
    ? (professionalsData?.data as any).professionals
    : Array.isArray(professionalsData?.data)
      ? professionalsData.data
      : [];

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAllApplications(),
  });

  const applications = Array.isArray((applicationsData?.data as any)?.applications)
    ? (applicationsData?.data as any).applications
    : Array.isArray(applicationsData?.data)
      ? applicationsData.data
      : [];

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = Array.isArray((jobsData?.data as any)?.jobs)
    ? (jobsData?.data as any).jobs
    : Array.isArray(jobsData?.data)
      ? jobsData.data
      : [];

  const { data: studentsData } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getAllStudents(),
  });
  const students = Array.isArray(studentsData?.data) ? studentsData.data : [];

  const { user, role } = useAppSelector((state) => state.auth);
  const isAdminTPO = role === 'admin';
  const isSuperAdmin = (user as any)?.isSuperAdmin || role === 'superadmin';

  const [professionalRoles, setProfessionalRoles] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('resumes');

  // Mutations
  const approveResumeMutation = useMutation({
    mutationFn: (id: string) => applicationService.approveResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Resume approved! Assessment released.');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to approve resume'),
  });

  const rejectResumeMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback?: string }) =>
      applicationService.rejectResume(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.error('Resume rejected');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to reject resume'),
  });

  const approveAssessmentMutation = useMutation({
    mutationFn: (id: string) => applicationService.approveAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Assessment approved!');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to approve assessment'),
  });

  const rejectAssessmentMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback?: string }) =>
      applicationService.rejectAssessment(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.error('Assessment rejected');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to reject assessment'),
  });

  const assignProfessionalMutation = useMutation({
    mutationFn: (data: { applicationId: string; professionalId: string; round: 'professional' | 'manager' | 'hr' }) =>
      applicationService.assignProfessional(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Professional assigned!');
      setIsAssignDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message || 'Failed to assign professional'),
  });

  const releaseOfferMutation = useMutation({
    mutationFn: (id: string) =>
      applicationService.updateApplicationStatus(id, { status: 'offer_released' as ApplicationStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Offer released!');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to release offer'),
  });

  // Assignment Dialog State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAppIdForAssignment, setSelectedAppIdForAssignment] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);

  const handleOpenAssignDialog = (appId: string) => {
    setSelectedAppIdForAssignment(appId);
    setSelectedProfessional(null);
    setIsAssignDialogOpen(true);
  };

  // Assessment Review Dialog State
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedAppForReview, setSelectedAppForReview] = useState<any>(null);

  const { data: currentAssessment, isLoading: isAssessmentLoading } = useQuery({
    queryKey: ['assessment', selectedAppForReview?._id || selectedAppForReview?.id],
    queryFn: () => assessmentService.getAssessmentByApplicationId(selectedAppForReview?._id || selectedAppForReview?.id),
    enabled: !!selectedAppForReview && isReviewDialogOpen,
  });

  const handleOpenReviewDialog = (app: any) => {
    setSelectedAppForReview(app);
    setIsReviewDialogOpen(true);
  };

  const handleAssignProfessional = (profId: string) => {
    if (!selectedAppIdForAssignment) return;
    assignProfessionalMutation.mutate({
      applicationId: selectedAppIdForAssignment,
      professionalId: profId,
      round: 'professional'
    });
  };

  const getAvailableProfessionals = (appId: string) => {
    const app = (applications as any[]).find(a => (a._id || a.id) === appId);
    if (!app) return [];
    const job = (jobs as any[]).find(j => (j._id || j.id) === app.jobId);
    const approvedProfs = professionals.filter(p => p.status === 'approved');
    if (!job || !job.requiredTechStack || job.requiredTechStack.length === 0) return approvedProfs;
    return approvedProfs; // Fallback to all approved
  };

  const pendingProfessionals = professionals.filter((p: any) => p.status === 'pending');
  const approvedProfessionals = professionals.filter((p: any) => p.status === 'approved');
  const resumeReviewApps = applications.filter((a: any) => a.resumeApproved === null && a.status === 'applied');
  const assessmentReviewApps = applications.filter((a: any) => a.assessmentApproved === null && a.status === 'assessment_completed');
  const aiInterviewReviewApps = applications.filter((a: any) => a.aiInterviewApproved === null && a.status === 'ai_interview_completed');
  const activeInterviewApps = applications.filter((a: any) =>
    ['professional_interview_pending', 'professional_interview_scheduled', 'professional_interview_completed',
      'manager_interview_pending', 'manager_interview_scheduled', 'manager_round_completed',
      'hr_interview_pending', 'hr_interview_scheduled'].includes(a.status)
  );

  const offerReadyApps = applications.filter((a: any) =>
    a.status === 'hr_round_completed' ||
    a.status === 'hr_interview_completed' ||
    ((a.status === 'professional_interview_completed' || a.status === 'manager_interview_completed' || a.status === 'manager_round_completed') && a.interviewFeedback && a.interviewFeedback.length > 0)
  );

  const stats = [
    { label: 'Active Students', value: students.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Verified Experts', value: approvedProfessionals.length, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Live Jobs', value: jobs.filter((j: any) => j.isActive).length, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Pending Reviews', value: pendingProfessionals.length, icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const handleApproveProfessional = async (professionalId: string) => {
    const assignedRole = professionalRoles[professionalId];
    if (!assignedRole) return toast.error('Please assign a role before approving');
    try {
      const response = await professionalService.updateProfessionalStatus(professionalId, { status: 'approved' });
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['professionals'] });
        toast.success(`Expert approved as ${assignedRole}!`);
      }
    } catch (error: any) { toast.error(error.message || 'Failed to approve'); }
  };

  const handleRejectProfessional = async (professionalId: string) => {
    try {
      const response = await professionalService.updateProfessionalStatus(professionalId, { status: 'rejected' });
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['professionals'] });
        toast.error('Expert registration rejected');
      }
    } catch (error: any) { toast.error(error.message || 'Failed to reject'); }
  };

  const handleApproveResume = (applicationId: string) => approveResumeMutation.mutate(applicationId);

  const handleRejectResume = (applicationId: string) => {
    const app = applications.find((a: any) => (a._id || a.id) === applicationId);
    if (!app) return;
    const job = getJobById(app.jobId);
    const feedback = `Your application to ${job?.companyName} for ${job?.roleTitle} was not shortlisted. Keep improving your skills!`;
    rejectResumeMutation.mutate({ id: applicationId, feedback });
  };

  const handleApproveAssessment = (applicationId: string) => approveAssessmentMutation.mutate(applicationId);

  const handleRejectAssessment = (applicationId: string) => {
    const app = applications.find((a: any) => (a._id || a.id) === applicationId);
    if (!app) return;
    const job = getJobById(app.jobId);
    const feedback = `Assessment for ${job?.companyName} did not meet criteria.`;
    rejectAssessmentMutation.mutate({ id: applicationId, feedback });
  };

  const handleProgressAfterAIInterview = (applicationId: string) => {
    const app = applications.find((a: any) => (a._id || a.id) === applicationId);
    if (app?.status === 'ai_interview_completed') handleOpenAssignDialog(applicationId);
  };

  const handleReleaseOffer = (applicationId: string) => releaseOfferMutation.mutate(applicationId);

  const getStudentById = (id: string) => (students as any[]).find(s => (s._id || s.id) === id);
  const getJobById = (id: string) => (jobs as any[]).find(j => (j._id || j.id) === id);

  // Helper to get student ID string from either object or string
  const getStudentId = (studentId: any): string => {
    if (typeof studentId === 'string') return studentId;
    if (studentId?._id) return studentId._id;
    if (studentId?.id) return studentId.id;
    return 'N/A';
  };

  return (
    <DashboardLayout title="Dashboard" subtitle="Global management of platform operations and reviews">
      <div className="space-y-8 max-w-[1600px] mx-auto pb-12 relative">

        {/* Animated Background Decor */}
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

        {/* Hero Welcome */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-50 border border-slate-200 px-12 py-12 text-slate-900 shadow-sm">
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Admin <span className="text-primary">Dashboard</span></h1>
            <p className="max-w-xl text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
              Applications to review: {resumeReviewApps.length + assessmentReviewApps.length} pending.
              System Status: <span className="text-primary">Healthy</span>.
            </p>
            <div className="flex gap-4 pt-6">
              {isAdminTPO && (
                <Button className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary/90 text-white" onClick={() => setActiveTab('resumes')}>
                  Review Applications
                </Button>
              )}
              <Button variant="outline" className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] border-slate-200 bg-white hover:bg-slate-50 text-slate-900" onClick={() => setActiveTab('overview')}>
                Platform Vitals
              </Button>
            </div>
          </div>
          <Zap className="absolute -right-12 -top-12 h-80 w-80 text-primary opacity-[0.03] rotate-12" />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white border hover:bg-slate-50 transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-2xl p-4 transition-transform group-hover:scale-110 duration-300 ring-1 ring-slate-100", stat.bg, stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black tracking-tighter leading-none text-slate-900">{stat.value}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-80">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex items-center justify-center mb-6">
            <TabsList className="bg-slate-100 border border-slate-200 p-2 rounded-2xl h-auto gap-2">
              {[
                { value: 'resumes', label: 'RESUMES', count: resumeReviewApps.length, icon: FileText },
                { value: 'assessments', label: 'ASSESSMENTS', count: assessmentReviewApps.length, icon: Zap },
                { value: 'ai-interviews', label: 'AI INTERVIEWS', count: aiInterviewReviewApps.length, icon: MessageSquare },
                { value: 'technical-rounds', label: 'INTERVIEWS', count: activeInterviewApps.length, icon: Target },
                { value: 'offers', label: 'OFFERS', count: offerReadyApps.length, icon: Award },
                { value: 'overview', label: 'VITALS', icon: Activity },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white text-slate-500 transition-all font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 relative"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-white text-[8px] items-center justify-center font-black">{tab.count}</span>
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>


          {/* Resume Review Content */}
          <TabsContent value="resumes" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {resumeReviewApps.length === 0 ? (
                <EmptyState icon={FileText} title="No Pending Resumes" description="All candidate resumes have been reviewed." />
              ) : (
                resumeReviewApps.map((app: any) => {
                  const student = getStudentById(app.studentId);
                  const job = getJobById(app.jobId);
                  const atsScore = app.resumeScore || 0;
                  return (
                    <Card key={app._id || app.id} className="border-slate-200 shadow-sm rounded-[3rem] bg-white border group hover:bg-slate-50 transition-all duration-500 overflow-hidden">
                      <CardContent className="p-10 space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-black text-2xl">
                              S
                            </div>
                            <div>
                              <h4 className="font-black text-xl uppercase tracking-tighter text-slate-900">STUDENT #{getStudentId(app.studentId).slice(-6)}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student?.college || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "text-4xl font-black tracking-tighter",
                              atsScore >= 75 ? "text-emerald-500" : atsScore >= 50 ? "text-primary" : "text-rose-500"
                            )}>
                              {atsScore}%
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">ATS Score</p>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden group/target">
                          <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-full blur-[40px] -z-10" />
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">Applied Job</p>
                          <div className="flex items-center justify-between">
                            <p className="font-black text-sm text-slate-300 uppercase">{job?.companyName} — {job?.roleTitle}</p>
                            <Badge className="bg-primary/20 text-primary border border-primary/30 text-[8px] font-black uppercase tracking-widest px-2">HIGH INTENT</Badge>
                          </div>
                        </div>

                        <div className="space-y-3 px-2">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <span>Matching Status</span>
                            <span className={cn(atsScore >= 75 ? "text-emerald-500" : "text-primary")}>{atsScore >= 75 ? 'Excellent' : 'Good'}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200 shadow-inner">
                            <div className={cn(
                              "h-full rounded-full transition-all duration-1000 ease-out",
                              atsScore >= 75 ? "bg-emerald-500" : "bg-primary"
                            )} style={{ width: `${atsScore}%` }} />
                          </div>
                        </div>

                        {app.atsAnalysis?.summary && (
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative overflow-hidden group/feedback">
                            <div className="absolute -right-4 -top-4 h-16 w-16 bg-primary/5 rounded-full blur-[30px]" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3 leading-none">AI MATCH ANALYSIS</p>
                            <p className="text-[10px] font-bold text-slate-600 leading-relaxed relative z-10 italic">
                              "{app.atsAnalysis.summary}"
                            </p>
                          </div>
                        )}

                        {isAdminTPO && (
                          <div className="flex gap-4 pt-4">
                            <Button className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20" onClick={() => handleApproveResume(app._id || app.id)}>
                              APPROVE RESUME
                            </Button>
                            {app.resumeUrl && (
                              <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-widest" asChild>
                                <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">VIEW RESUME</a>
                              </Button>
                            )}
                            <Button variant="ghost" className="h-14 w-14 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100" onClick={() => handleRejectResume(app._id || app.id)}>
                              <XCircle className="h-6 w-6" />
                            </Button>
                          </div>
                        )}
                        {!isAdminTPO && app.resumeUrl && (
                          <div className="pt-4">
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-widest" asChild>
                              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">VIEW RESUME (READ ONLY)</a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Assessments Content */}
          <TabsContent value="assessments" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="grid grid-cols-1 gap-10">
              {assessmentReviewApps.length === 0 ? (
                <EmptyState icon={Zap} title="No Pending Assessments" description="All student technical assessments have been reviewed." />
              ) : (
                assessmentReviewApps.map((app: any) => (
                  <Card key={app._id || app.id} className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden flex flex-col md:flex-row bg-white border group">
                    <div className="p-12 flex-1 space-y-10">
                      <div className="flex items-center gap-8">
                        <Avatar className="h-20 w-20 rounded-[1.5rem] border-2 border-slate-100 p-0.5">
                          <AvatarFallback className="bg-slate-50 text-blue-500 font-black text-2xl">S</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900">STUDENT #{getStudentId(app.studentId).slice(-6)}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getJobById(app.jobId)?.companyName || 'N/A'} <span className="text-primary mx-2">•</span> {getJobById(app.jobId)?.roleTitle || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                        <MetricBlock label="Active Time" value={app.assessmentDuration || 'N/A'} />
                        <MetricBlock label="Assessment Score" value={app.assessmentScore ? `${app.assessmentScore} / 100` : 'N/A'} color="text-primary" />
                        <MetricBlock label="Submitted At" value={app.assessmentCompletedAt ? format(new Date(app.assessmentCompletedAt), 'MMM dd, hh:mm a') : 'N/A'} />
                        <MetricBlock label="Integrity" value={app.proctorStatus || 'N/A'} color={app.proctorStatus === 'PASSED' ? 'text-emerald-500' : 'text-slate-500'} />
                      </div>
                      {isAdminTPO && (
                        <div className="flex gap-4 pt-6">
                          <Button className="rounded-2xl h-14 px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20" onClick={() => handleOpenReviewDialog(app)}>REVIEW RESULTS</Button>
                          <Button variant="ghost" className="rounded-2xl h-14 px-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100 font-black uppercase text-[10px] tracking-widest" onClick={() => handleRejectAssessment(app._id || app.id)}>REJECT ASSESSMENT</Button>
                        </div>
                      )}
                      {!isAdminTPO && (
                        <div className="flex gap-4 pt-6">
                          <Button className="flex-1 rounded-2xl h-14 px-12 bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-[0.2em] shadow-sm" onClick={() => handleOpenReviewDialog(app)}>VIEW ASSESSMENT DATA</Button>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-50 w-full md:w-1/3 p-12 border-l border-slate-100 relative group/code overflow-hidden">
                      <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover/code:scale-150 transition-transform duration-1000" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-3"> <Terminal className="h-4 w-4" /> CODE PREVIEW</p>
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 font-mono text-[11px] overflow-hidden h-[200px] relative shadow-sm">
                        <pre className="text-slate-600 opacity-80 leading-relaxed">{app.assessmentCode || '// SECURE DATA STREAM EMPTY'}</pre>
                        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                      </div>
                      <Button variant="ghost" className="w-full mt-6 h-12 rounded-2xl hover:bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all">VIEW FULL CODE <ChevronRight className="ml-2 h-3.5 w-3.5" /></Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* AI Rounds Content */}
          <TabsContent value="ai-interviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {aiInterviewReviewApps.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No Pending AI Interviews" description="All candidate AI interviews have been processed." />
              ) : (
                aiInterviewReviewApps.map((app: any) => (
                  <Card key={app._id || app.id} className="border-slate-200 shadow-sm rounded-[3rem] bg-white border group hover:bg-slate-50 transition-all duration-500 overflow-hidden">
                    <CardContent className="p-10 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 border border-purple-100 shadow-sm transition-transform group-hover:rotate-12">
                            <Brain className="h-7 w-7" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900">STUDENT #{getStudentId(app.studentId).slice(-6)}</h4>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">AI INTERVIEW LOGS</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-purple-50 text-purple-500 border border-purple-100 px-6 py-2 rounded-full font-black text-[12px] shadow-sm">SCORE: {app.aiInterviewScore || 'N/A'}</Badge>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 relative overflow-hidden group/feedback">
                        <div className="absolute -right-4 -top-4 h-32 w-32 bg-purple-50 rounded-full blur-[60px]" />
                        <div className="flex items-center justify-between mb-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Intelligence Report</p>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Verified</span>
                          </div>
                        </div>

                        <p className="text-sm font-bold text-slate-700 leading-relaxed relative z-10 italic">
                          "{app.aiInterviewSummary || "Natural language analysis pending for this candidate's behavioral stream..."}"
                        </p>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-slate-200/50 pt-8">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400">Tone</p>
                            <p className="text-xs font-black text-purple-600 uppercase tracking-tight">{app.aiInterviewMetrics?.tone || 'Neutral'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400">Response Depth</p>
                            <p className="text-xs font-black text-purple-600 uppercase tracking-tight">{app.aiInterviewMetrics?.depth || 'Moderate'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400">Word Density</p>
                            <p className="text-xs font-black text-purple-600 uppercase tracking-tight">{app.aiInterviewMetrics?.avg_length || 0} WPQ</p>
                          </div>
                        </div>

                        {app.aiInterviewMetrics?.key_topics && app.aiInterviewMetrics.key_topics.length > 0 && (
                          <div className="mt-6 space-y-3">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Extracted Topics</p>
                            <div className="flex flex-wrap gap-2">
                              {app.aiInterviewMetrics.key_topics.map((topic: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-white border-purple-100 text-purple-500 rounded-lg font-black text-[9px] uppercase px-3 py-1">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {isAdminTPO && (
                        <div className="flex gap-4 pt-2">
                          <Button
                            className="flex-1 h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-purple-600/20"
                            onClick={() => handleProgressAfterAIInterview(app._id || app.id)}
                          >
                            APPROVE & ASSIGN EXPERT
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-700 font-black uppercase text-[10px] tracking-widest">
                                VIEW TRANSCRIPT
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl rounded-[2.5rem] p-12">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Interview <span className="text-purple-600">Transcript</span></DialogTitle>
                                <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Speech-to-text conversion of candidate responses</DialogDescription>
                              </DialogHeader>
                              <div className="mt-8 space-y-8 max-h-[60vh] overflow-y-auto pr-6 custom-scrollbar">
                                {app.aiInterviewAnswers?.map((ans: string, idx: number) => (
                                  <div key={idx} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-6 w-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">Q</div>
                                      <p className="font-bold text-xs text-slate-400 uppercase tracking-widest">Question {idx + 1}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-sm text-slate-700 leading-relaxed">
                                      "{ans || "No response captured for this question."}"
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      {!isAdminTPO && (
                        <div className="flex gap-4 pt-2">
                          <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 bg-white text-slate-700 font-black uppercase text-[10px] tracking-widest">VIEW AI ANALYTICS</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Technical Protocol Content */}
          <TabsContent value="technical-rounds" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeInterviewApps.length === 0 ? (
                <EmptyState icon={Target} title="No Active Interviews" description="All interviews have been processed or are completed." />
              ) : (
                activeInterviewApps.map((app: any) => {
                  const student = getStudentById(app.studentId);
                  const job = getJobById(app.jobId);
                  const isScheduled = app.status.includes('scheduled');
                  const currentStage = app.interviewRound || 'Technical';

                  return (
                    <Card key={app._id || app.id} className="border-slate-200 shadow-sm rounded-[3rem] bg-white border group hover:bg-slate-50 transition-all duration-500 overflow-hidden">
                      <CardContent className="p-10 space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-sm group-hover:scale-110 transition-transform">
                              <User className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900">STUDENT #{getStudentId(app.studentId).slice(-6)}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job?.companyName || 'N/A'}</p>
                            </div>
                          </div>
                          <Badge className={cn(
                            "uppercase text-[9px] font-black px-4 py-2 rounded-full border-none shadow-sm transition-colors",
                            isScheduled ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600 animate-pulse"
                          )}>
                            <span className="flex items-center gap-2">
                              <div className={cn("h-1.5 w-1.5 rounded-full", isScheduled ? "bg-emerald-500" : "bg-amber-500")} />
                              {isScheduled ? 'SCHEDULED' : 'NOT SCHEDULED'}
                            </span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2 relative overflow-hidden group/round">
                            <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 rounded-full blur-[30px]" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Interview Round</p>
                            <p className="text-sm font-black uppercase text-primary leading-none">{currentStage}</p>
                          </div>
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2 text-right relative overflow-hidden group/expert">
                            <div className="absolute top-0 left-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-[30px]" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Assigned Expert</p>
                            <p className="text-sm font-black uppercase text-slate-600 truncate leading-none">
                              {app.timeline?.find((t: any) => t.notes?.includes('Assigned'))?.notes?.split('to ')[1]?.split(' for')[0] || 'UNASSIGNED'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-4 group/cal">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover/cal:text-primary transition-colors">
                              <CalendarIcon className="h-4.5 w-4.5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 group-hover/cal:text-slate-600 transition-colors uppercase tracking-widest">
                              {app.scheduledDate ? format(new Date(app.scheduledDate), 'PPP p') : 'PENDING SCHEDULE'}
                            </span>
                          </div>
                          <Button variant="ghost" className="h-12 rounded-2xl hover:bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] transition-all">VIEW PROFILE <ChevronRight className="ml-2 h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Offers Tab Content */}
          <TabsContent value="offers" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {offerReadyApps.length === 0 ? (
                <div className="lg:col-span-3">
                  <EmptyState icon={Award} title="No Pending Offers" description="There are no students currently ready for offer letter release." />
                </div>
              ) : (
                offerReadyApps.map((app: any) => {
                  const student = getStudentById(app.studentId);
                  const job = getJobById(app.jobId);
                  return (
                    <Card key={app._id || app.id} className="border-slate-200 shadow-sm rounded-[3rem] bg-white border group hover:scale-[1.02] transition-all duration-700 overflow-hidden">
                      <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-50 rounded-full blur-[80px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
                      <CardHeader className="text-center space-y-6 pt-12">
                        <div className="mx-auto h-24 w-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center border-2 border-emerald-100 shadow-sm relative group-hover:rotate-12 transition-transform duration-500">
                          <Award className="h-12 w-12 text-emerald-500" />
                          <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900">STUDENT #{getStudentId(app.studentId).slice(-6)}</CardTitle>
                          <CardDescription className="font-black text-emerald-600 uppercase tracking-[0.3em] text-[10px]">{job?.companyName || 'N/A'}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8 p-10 pt-0">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">OFFER FOR POSITION</span>
                          <p className="font-black text-base text-center leading-tight uppercase text-slate-700">{job?.roleTitle}</p>
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex justify-around shadow-inner">
                          <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">CONTRACT</p>
                            <p className="font-black text-emerald-600 text-sm">{job?.package}</p>
                          </div>
                          <div className="w-px bg-slate-200 h-full" />
                          <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ZONE</p>
                            <p className="font-black text-slate-600 text-sm uppercase">{job?.locationType}</p>
                          </div>
                        </div>
                        {isAdminTPO && (
                          <Button className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-sm font-black uppercase text-[11px] tracking-[0.3em] transition-all group-hover:translate-y-[-4px] text-white" onClick={() => handleReleaseOffer(app._id || app.id)}>
                            RELEASE OFFER LETTER
                          </Button>
                        )}
                        {!isAdminTPO && (
                          <div className="w-full h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black uppercase text-[10px] tracking-widest text-emerald-600">
                            Final Verification Complete
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Intelligence/Overview Tab Content */}
          <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
                <CardHeader className="bg-slate-50 p-12 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter text-slate-900">
                      <Cpu className="h-8 w-8 text-primary" />
                      Application Pipeline
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Real-time candidate progress across all rounds</CardDescription>
                  </div>
                  <AppWindow className="h-10 w-10 text-primary opacity-10" />
                </CardHeader>
                <CardContent className="p-12 space-y-10">
                  <PipelineProgress label="Resume Screening" count={resumeReviewApps.length} color="bg-primary" total={applications.length} />
                  <PipelineProgress label="Assessments" count={assessmentReviewApps.length} color="bg-blue-500" total={applications.length} />
                  <PipelineProgress label="AI Interviews" count={aiInterviewReviewApps.length} color="bg-purple-500" total={applications.length} />
                  <PipelineProgress label="Ready for Offers" count={offerReadyApps.length} color="bg-emerald-500" total={applications.length} />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent -z-10" />
                <CardHeader className="bg-slate-50 p-12 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter text-slate-900">
                      <MousePointer2 className="h-8 w-8 text-emerald-500" />
                      Platform Success
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Overview of successful placements and candidate status</CardDescription>
                  </div>
                  <TrendingUp className="h-10 w-10 text-emerald-500 opacity-10" />
                </CardHeader>
                <CardContent className="p-12 space-y-12">
                  <div className="flex items-center gap-10">
                    <div className="relative h-32 w-32 shrink-0">
                      <svg className="h-full w-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={Math.PI * 2 * 58} strokeDashoffset={Math.PI * 2 * 58 * (1 - (offerReadyApps.length / Math.max(applications.length, 1)))} className="text-emerald-500 transition-all duration-1000" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-900">{((offerReadyApps.length / Math.max(applications.length, 1)) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-black text-2xl uppercase tracking-tighter text-slate-900 leading-tight">Placement <span className="text-emerald-500">Rate</span></h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">PERCENTAGE OF CANDIDATES WHO HAVE SUCCESSFULLY RECEIVED OFFERS.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <DetailedMetric label="Avg Assessment" value={assessmentReviewApps.length > 0 ? `${Math.round(assessmentReviewApps.reduce((acc: number, app: any) => acc + (app.assessmentScore || 0), 0) / assessmentReviewApps.length)}%` : 'N/A'} sub="CALCULATED" color="primary" />
                    <DetailedMetric label="Expert Approval" value={aiInterviewReviewApps.length > 0 ? `${Math.round((aiInterviewReviewApps.filter((app: any) => app.aiInterviewApproved).length / aiInterviewReviewApps.length) * 100)}%` : 'N/A'} sub="REAL-TIME" color="emerald" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-5xl rounded-[3rem] p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl outline-none">
          <DialogHeader className="p-12 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[80px]" />
            <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-slate-900">Assign <span className="text-primary">Expert</span></DialogTitle>
            <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Assign an industry professional to conduct the technical interview round.</DialogDescription>
          </DialogHeader>

          <div className="p-12">
            <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="px-10 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 h-16">Expert Name</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 h-16">Company</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 h-16">Role</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 h-16">Current Load</TableHead>
                    <TableHead className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 h-16 text-right px-10">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedAppIdForAssignment && getAvailableProfessionals(selectedAppIdForAssignment).length === 0 ? (
                    <TableRow className="border-none hover:bg-transparent">
                      <TableCell colSpan={5} className="text-center py-24">
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700 opacity-20">
                          <Users className="h-16 w-16" />
                          <p className="font-black text-xl uppercase">No Available Professionals</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedAppIdForAssignment && getAvailableProfessionals(selectedAppIdForAssignment).map((prof: any) => (
                      <TableRow key={prof._id || prof.id} className="hover:bg-slate-50 transition-all duration-300 border-slate-100">
                        <TableCell className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 rounded-xl border border-slate-200 shadow-sm">
                              <AvatarFallback className="text-[11px] bg-slate-100 text-primary font-black">{prof.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-black text-xs text-slate-900 uppercase tracking-tighter">{prof.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">{prof.company}</TableCell>
                        <TableCell><Badge className="bg-primary/10 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest px-3">{prof.professionalRole}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200">
                              <div className={cn("h-full rounded-full transition-all", (prof.activeInterviewCount || 0) >= 4 ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${((prof.activeInterviewCount || 0) / 5) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{prof.activeInterviewCount || 0}/5</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <Button className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[9px] uppercase tracking-[0.2em] transition-all" onClick={() => handleAssignProfessional(prof._id || prof.id)}>
                            ASSIGN
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl outline-none max-h-[90vh] flex flex-col">
          <DialogHeader className="p-12 bg-slate-50 border-b border-slate-100 relative shrink-0">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[80px]" />
            <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Review <span className="text-primary">Results</span></DialogTitle>
            <DialogDescription className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Examine candidate's technical responses and code quality.</DialogDescription>
          </DialogHeader>

          <div className="p-12 flex-1 overflow-y-auto space-y-10 custom-scrollbar">
            {isAssessmentLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-xl" />
                <p className="font-black text-[10px] text-primary uppercase tracking-widest">Fetching Assessment Data...</p>
              </div>
            ) : currentAssessment?.data ? (
              <div className="space-y-12">
                <div className="grid grid-cols-3 gap-8">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">MCQ SCORE</p>
                    <p className="text-3xl font-black text-primary">{currentAssessment.data.score || 0}%</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">TIME TAKEN</p>
                    <p className="text-2xl font-black text-slate-900 uppercase">
                      {currentAssessment.data.startedAt && currentAssessment.data.completedAt
                        ? `${Math.round((new Date(currentAssessment.data.completedAt).getTime() - new Date(currentAssessment.data.startedAt).getTime()) / 60000)}M`
                        : "N/A"
                      }
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">STATUS</p>
                    <Badge className="bg-emerald-50 text-emerald-500 border border-emerald-100 font-black uppercase text-[9px] px-3">COMPLETED</Badge>
                  </div>
                </div>

                <div className="space-y-6">
                  <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                    <Zap className="h-4 w-4" /> TECHNICAL RESPONSES
                  </h5>
                  <div className="space-y-4">
                    {currentAssessment.data.mcqQuestions?.map((q: any, i: number) => {
                      const studentAnswer = currentAssessment.data.answers?.mcqAnswers[i];
                      const isCorrect = studentAnswer === q.correctOption;
                      return (
                        <div key={i} className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <p className="font-bold text-sm text-slate-700 leading-relaxed">{i + 1}. {q.question}</p>
                            {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {q.options.map((opt: string, optIdx: number) => (
                              <div
                                key={optIdx}
                                className={cn(
                                  "p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center",
                                  optIdx === q.correctOption ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                    optIdx === studentAnswer ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-100 text-slate-400"
                                )}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                    <Terminal className="h-4 w-4" /> SOLUTION ENGINE
                  </h5>
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative group/code overflow-hidden">
                    <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 rounded-full blur-[80px]" />
                    <pre className="font-mono text-xs text-blue-400 leading-relaxed">
                      {currentAssessment.data.answers?.codingAnswer || '// NO CODE SIGNATURE RECEIVED'}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center opacity-40">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No assessment data available for this application.</p>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 shrink-0">
            <Button
              className="rounded-2xl h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
              onClick={() => {
                handleApproveAssessment(selectedAppForReview?._id || selectedAppForReview?.id);
                setIsReviewDialogOpen(false);
              }}
            >
              APPROVE APPLICATION
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl h-14 px-10 border-slate-200 bg-white text-slate-600 font-black uppercase text-[10px] tracking-widest"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              CLOSE PREVIEW
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout >
  );
}

// Sub-components for enhanced aesthetics
function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white border p-24 text-center">
      <div className="mx-auto h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 mb-8">
        <Icon className="h-12 w-12 text-slate-300" />
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">{title}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{description}</p>
    </Card>
  );
}

function MetricBlock({ label, value, color = "text-slate-600" }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">{label}</p>
      <p className={cn("text-sm font-black uppercase leading-tight", color)}>{value}</p>
    </div>
  );
}

function PipelineProgress({ label, count, color, total }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
        <span className="text-slate-400">{label}</span>
        <span className="bg-slate-100 px-4 py-1 rounded-full text-slate-600 border border-slate-200 animate-pulse">{count}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200 shadow-inner">
        <div className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-sm", color)} style={{ width: `${(count / Math.max(total, 1)) * 100}%` }} />
      </div>
    </div>
  );
}

function DetailedMetric({ label, value, sub, color }: any) {
  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 h-16 w-16 opacity-10 rounded-full blur-[30px]", color === "primary" ? "bg-primary" : "bg-emerald-500")} />
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-slate-900 leading-none">{value}</span>
        <span className={cn("text-[9px] font-black uppercase tracking-widest", color === "primary" ? "text-primary" : "text-emerald-500")}>{sub}</span>
      </div>
    </div>
  );
}
