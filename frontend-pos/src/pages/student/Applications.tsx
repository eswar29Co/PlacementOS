import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppSelector } from '@/store/hooks';
import { Student, ApplicationStatus, Application, Job } from '@/types';
import {
  Eye, ChevronRight, Clock, CheckCircle2, XCircle, FileText, Loader2,
  MapPin, DollarSign, Calendar, ArrowRight, Info, MessageSquare, Briefcase,
  Target, Zap, ShieldCheck, BarChart3, TrendingUp, Sparkles, Building2, Search,
  IndianRupee, Star, User, Trophy
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getStatusLabel,
  getStatusVariant,
  hasActionRequired,
  getActionButtonText,
  getActionRoute,
  isInInterviewStage,
  isOfferStage,
  isRejected
} from '@/lib/flowHelpers';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { jobService } from '@/services/jobService';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the journey stages
const JOURNEY_STAGES = [
  { id: 'resume', label: 'Resume Review' },
  { id: 'assessment', label: 'Tech Assessment' },
  { id: 'ai', label: 'AI Interview' },
  { id: 'interviews', label: 'Professional Rounds' },
  { id: 'offer', label: 'Offer' }
];

const getActiveStageIndex = (status: ApplicationStatus): number => {
  if (status === 'applied' || status === 'resume_under_review') return 0;
  if (status.includes('resume') && !status.includes('rejected')) return 1;
  if (status.includes('assessment') && !status.includes('rejected')) return 1;
  if (status === 'ai_interview_pending' || status === 'ai_interview_completed') return 2;
  if (isInInterviewStage(status)) return 3;
  if (isOfferStage(status)) return 4;
  if (isRejected(status)) return -1;
  return 0;
};

export default function Applications() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  // Fetch jobs from MongoDB
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = (() => {
    if (!jobsData?.data) return [];
    if (Array.isArray(jobsData.data)) return jobsData.data;
    if ('jobs' in jobsData.data && Array.isArray(jobsData.data.jobs)) return jobsData.data.jobs;
    return [];
  })();

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationService.getMyApplications,
    enabled: !!user,
  });

  const myApplications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  if (isLoading) {
    return (
      <DashboardLayout title="My Applications" subtitle="Loading your applications...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="font-black text-muted-foreground animate-pulse text-[10px] uppercase tracking-widest">Fetching your data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const activeCount = myApplications.filter(a => !a.status.includes('rejected') && !isOfferStage(a.status)).length;
  const interviewCount = myApplications.filter(a => isInInterviewStage(a.status)).length;
  const offerCount = myApplications.filter(a => a.status === 'offer_released' || a.status === 'offer_accepted').length;

  return (
    <DashboardLayout title="My Applications" subtitle="View and track the status of all your job applications">
      <div className="space-y-10 max-w-[1400px] mx-auto pb-12">

        {/* Tactical Intel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <IntelCard title="In Progress" value={activeCount} icon={TrendingUp} color="text-primary" bg="bg-primary/5" />
          <IntelCard title="Interviews" value={interviewCount} icon={Zap} color="text-amber-600" bg="bg-amber-50/5" />
          <IntelCard title="Offers" value={offerCount} icon={Trophy} color="text-emerald-600" bg="bg-emerald-50/5" />
          <IntelCard title="Rejected" value={myApplications.filter(a => isRejected(a.status)).length} icon={XCircle} color="text-rose-600" bg="bg-rose-50/5" />
        </div>

        {/* Transmission Tracker */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase text-slate-900">
                <Target className="h-6 w-6 text-primary" />
                Application History
              </h2>
              <p className="text-slate-400 font-medium text-xs">Track the progress of your active and past applications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Verified
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Active
                </div>
              </div>
            </div>
          </div>

          {myApplications.length === 0 ? (
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-slate-50/50 py-24 flex flex-col items-center text-center space-y-6 border">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                <Briefcase className="h-12 w-12 text-slate-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 leading-none">No Applications Found</h3>
                <p className="text-slate-400 max-w-sm font-medium">Start applying for jobs to see your progress here.</p>
              </div>
              <Button size="lg" className="rounded-2xl h-14 px-10 font-black shadow-lg shadow-primary/20" onClick={() => navigate('/student/browse-jobs')}>
                Browse Marketplace <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {myApplications.map((app) => (
                <PremiumApplicationCard
                  key={app.id}
                  app={app}
                  job={jobs.find(j => j.id === app.jobId || j._id === app.jobId)}
                  onToggleExpand={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                  isExpanded={expandedApp === app.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function IntelCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white border group hover:translate-y-[-4px] transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <p className={cn("text-4xl font-black tracking-tighter", color)}>{value}</p>
          </div>
          <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-sm transition-transform group-hover:rotate-12 border border-slate-50", bg, color)}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



function PremiumApplicationCard({ app, job, onToggleExpand, isExpanded }: any) {
  const navigate = useNavigate();
  const activeStageIndex = getActiveStageIndex(app.status);
  const isCurrentlyRejected = isRejected(app.status);
  const isAccepted = app.status === 'offer_accepted';

  return (
    <Card className={cn(
      "border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden transition-all duration-500 bg-white border border-l-8",
      isCurrentlyRejected ? "border-l-rose-500" : isAccepted || isOfferStage(app.status) ? "border-l-emerald-500" : "border-l-primary"
    )}>
      <CardContent className="p-0">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left: Tactical Info */}
            <div className="flex items-start gap-6 flex-1">
              <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 shadow-sm flex flex-col items-center justify-center text-3xl font-black text-slate-300 border border-slate-100 shrink-0">
                {job?.companyName.charAt(0)}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-black leading-tight uppercase tracking-tight text-slate-900">{job?.companyName}</h3>
                  <Badge variant={getStatusVariant(app.status)} className="rounded-full px-3 py-0.5 font-black text-[9px] uppercase tracking-widest border-none shadow-none">
                    {getStatusLabel(app.status)}
                  </Badge>
                </div>
                <p className="text-slate-400 font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary/50" /> {job?.roleTitle}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job?.locationType}</span>
                  <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5" /> {job?.ctcBand || 'Competitive'}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> APPLIED ON {format(new Date(app.appliedAt), 'dd MMM yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3 lg:self-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-slate-50 font-black" onClick={() => navigate(`/student/applications/${app.id}/ats-analysis`)}>
                      <FileText className="h-6 w-6 text-slate-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-bold bg-slate-900 text-white">ATS Score Analysis</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {hasActionRequired(app.status) && (
                <Button onClick={() => navigate(getActionRoute(app.status, app.id))} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-2xl shadow-primary/20 gap-3">
                  {getActionButtonText(app.status).toUpperCase()}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}

              <Button variant="ghost" className="h-14 px-6 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50" onClick={onToggleExpand}>
                {isExpanded ? 'Show Less' : 'Show More'}
              </Button>
            </div>
          </div>

          {!isExpanded && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                <span className="text-slate-400">Application Progress</span>
                <span className="text-primary">{Math.max(0, activeStageIndex) * 25}% COMPLETED</span>
              </div>
              <Progress value={Math.max(0, activeStageIndex) * 25} className="h-3 rounded-full bg-slate-100" />
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="bg-slate-50/50 border-t border-slate-100 p-10 lg:p-14 animate-in fade-in slide-in-from-top-6 duration-500">
            <div className="flex items-center justify-between mb-16">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300">Application Progress</h4>
              <Badge className="bg-primary/5 text-primary border border-primary/10 text-[10px] font-bold shadow-none">Profile Verified</Badge>
            </div>

            <div className="relative flex flex-col lg:flex-row justify-between gap-y-16 mb-20">
              {/* Visual Line */}
              <div className="absolute top-5 left-5 right-5 h-1 bg-slate-200 hidden lg:block rounded-full" />
              <div className="absolute top-5 bottom-5 left-5 w-1 bg-slate-200 lg:hidden rounded-full" />

              {JOURNEY_STAGES.map((stage, idx) => {
                const isCompleted = idx < activeStageIndex;
                const isActive = idx === activeStageIndex;
                const isFailed = isCurrentlyRejected && idx === activeStageIndex;

                return (
                  <div key={stage.id} className="relative z-10 flex flex-row lg:flex-col items-center lg:items-center gap-6 lg:gap-4 flex-1 group">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border-4 shadow-sm transition-all duration-700",
                      isCompleted ? "bg-emerald-500 border-white text-white rotate-6" :
                        isActive ? (isFailed ? "bg-rose-500 border-white text-white scale-110" : "bg-primary border-white text-white scale-125 shadow-lg shadow-primary/20 rotate-12") :
                          "bg-white border-slate-200 text-slate-300"
                    )}>
                      {isCompleted ? <ShieldCheck className="h-6 w-6" /> : <span className="font-black text-sm">{idx + 1}</span>}
                    </div>
                    <div className="flex flex-col lg:items-center text-center">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300",
                        isActive ? "text-slate-900 scale-110" : "text-slate-400"
                      )}>{stage.label}</span>
                      {isActive && !isCurrentlyRejected && (
                        <span className="text-[9px] text-primary font-bold uppercase tracking-tighter mt-1 animate-pulse">Current Stage</span>
                      )}
                      {isFailed && (
                        <span className="text-[9px] text-rose-500 font-black uppercase tracking-tighter mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Intel Feed */}
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white p-10 border">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                      <Info className="h-6 w-6 text-primary" />
                    </div>
                    <h5 className="font-black text-lg uppercase text-slate-900">Status Notes</h5>
                  </div>
                  <p className="text-sm text-slate-500 leading-loose font-medium italic">
                    {isCurrentlyRejected
                      ? "Your application was not selected for this role. We recommend updating your profile and applying for other opportunities."
                      : app.status === 'applied'
                        ? "Your application has been received. Our team will review your profile and update you on the next steps within 2-3 business days."
                        : `Current stage: ${JOURNEY_STAGES[activeStageIndex]?.label}. ${hasActionRequired(app.status) ? "Please take action on the pending steps." : "We will notify you once there is an update."}`
                    }
                  </p>

                  {app.interviewFeedback && app.interviewFeedback.length > 0 && (
                    <div className="mt-10 pt-10 border-t space-y-6">
                      <h5 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
                        Interview Feedback
                      </h5>
                      <div className="space-y-4">
                        {app.interviewFeedback.map((f: any, i: number) => (
                          <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-all cursor-default group/feed">
                            <div className="flex justify-between items-center mb-3">
                              <Badge className="bg-primary/5 text-primary border border-primary/10 font-black text-[9px] uppercase shadow-none"> {f.round} UNIT </Badge>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("h-3 w-3", s <= (f.rating || 4) ? "text-amber-500 fill-amber-500" : "text-muted/20")} />)}
                              </div>
                            </div>
                            <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                              <User className="h-3 w-3 text-slate-400" /> {f.professionalName || 'Expert Interviewer'}
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">"{f.comments || f.feedback || 'Exceptional aptitude demonstrated in communication and technical calibration.'}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Simulation Context */}
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white p-10 border">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                        <Search className="h-6 w-6 text-amber-600" />
                      </div>
                      <h5 className="font-black text-lg uppercase text-slate-900">Job Details</h5>
                    </div>
                    <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase text-primary hover:bg-primary/5" onClick={() => navigate(`/student/jobs/${job?.id || job?._id}`)}>
                      Full Details
                    </Button>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 shadow-sm flex items-center justify-center text-xl font-black text-slate-300 border border-slate-100">
                          {job?.companyName.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-black uppercase leading-none text-slate-900">{job?.companyName}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{job?.roleTitle}</p>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-4">
                        {job?.description || 'Strategic simulation for software engineering leaders.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Compensation</p>
                        <p className="text-sm font-black text-emerald-600">{job?.ctcBand || job?.package || 'Competitive'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Job Location</p>
                        <p className="text-sm font-black text-slate-700">{job?.locationType}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Required Tech Spectrum</p>
                      <div className="flex flex-wrap gap-2">
                        {(job?.skills || []).slice(0, 8).map((s: any, i: number) => (
                          <Badge key={i} className="bg-slate-50 text-slate-600 border border-slate-100 text-[9px] font-bold uppercase py-1 px-3 rounded-lg shadow-none">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-lg rounded-[2.5rem] bg-primary p-10 text-white relative overflow-hidden group">
                  <BarChart3 className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                  <div className="relative z-10 space-y-4">
                    <h6 className="text-lg font-black uppercase">Matching Insight</h6>
                    <p className="text-white/70 text-xs font-bold leading-relaxed">Our AI analysis shows your profile ranks in the Top 15% for this specific job role.</p>
                    <Button variant="secondary" className="w-full rounded-2xl font-black text-xs uppercase text-primary shadow-lg h-12 bg-white hover:bg-slate-50">View Details</Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
