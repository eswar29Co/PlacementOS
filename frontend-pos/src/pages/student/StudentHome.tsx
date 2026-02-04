import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppSelector } from '@/store/hooks';
import { Student } from '@/types';
import {
  Briefcase, FileText, ClipboardCheck, Video, Award,
  ArrowRight, Sparkles, Star, Target, Zap, TrendingUp,
  MapPin, Calendar, Search, Ghost, ChevronRight,
  ShieldCheck, BarChart3, Activity, Clock, Cpu, Terminal
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { jobService } from '@/services/jobService';
import { dashboardService } from '@/services/dashboardService';
import { cn } from '@/lib/utils';

const statusOrder = [
  'applied', 'resume_uploaded', 'resume_under_review', 'resume_shortlisted', 'assessment_pending',
  'assessment_completed', 'assessment_released', 'assessment_approved', 'assessment_shortlisted', 'ai_interview_pending',
  'ai_interview_completed', 'professional_interview_pending', 'professional_interview_scheduled', 'professional_interview_completed',
  'manager_interview_pending', 'manager_interview_scheduled', 'manager_round_completed', 'hr_interview_pending',
  'hr_interview_scheduled', 'hr_round_completed', 'offer_released', 'offer_accepted'
];

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;

  // Fetch dashboard stats
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['student-dashboard-stats'],
    queryFn: dashboardService.getDashboardStats,
  });

  const statsResponse = dashboardData?.data || {};

  // Fetch applications (for the live track display)
  const { data: applicationsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationService.getMyApplications,
  });
  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  // Fetch jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = Array.isArray(jobsData?.data)
    ? jobsData.data
    : (jobsData?.data && 'jobs' in jobsData.data)
      ? jobsData.data.jobs
      : [];

  const myApplications = applications;
  const activeApplications = statsResponse.activeApplications || [];

  const stats = [
    { label: 'My Applications', value: statsResponse.totalApplications || 0, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending Tasks', value: myApplications.filter(a => ['assessment_pending', 'ai_interview_pending', 'professional_interview_scheduled'].includes(a.status)).length, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Interviews', value: myApplications.filter(a => a.status.includes('interview_pending') || a.status.includes('interview_scheduled')).length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Offers', value: myApplications.filter(a => (a.status === 'offer_released' || a.status === 'offer_accepted')).length, icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  if (statsLoading || leadsLoading || jobsLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading your dashboard...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full shadow-xl shadow-primary/20" />
          <p className="font-black text-primary animate-pulse text-[10px] uppercase tracking-[0.3em]">Loading data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Platform stats populated from real DB data
  const platformStats = [
    {
      label: "Active Opportunities",
      value: statsResponse.platformStats?.activeJobs || jobs.length,
      trend: "REAL-TIME",
      color: "text-primary"
    },
    {
      label: "Selection Rate",
      value: myApplications.length > 0
        ? `${Math.round((myApplications.filter(a => ['offer_released', 'offer_accepted', 'hired'].includes(a.status)).length / myApplications.length) * 100)}%`
        : '0%',
      trend: "PERSONAL",
      color: "text-emerald-600"
    },
    {
      label: "Completed Rounds",
      value: statsResponse.platformStats?.completedRounds || 0,
      trend: "ACTIVITY",
      color: "text-amber-600"
    },
    {
      label: "Platform Success",
      value: statsResponse.platformStats?.totalOffers || 0,
      trend: "OFFERS",
      color: "text-indigo-600"
    }
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${student?.name?.split(' ')[0]}. Here is your progress overview.`}>
      <div className="space-y-10 max-w-[1500px] mx-auto pb-12 relative">

        {/* Animated Background Decor */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

        {/* Profile Overview */}
        <div className="relative group/hero">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-600/10 rounded-[3.5rem] blur-xl opacity-50 group-hover/hero:opacity-80 transition duration-1000"></div>
          <Card className="relative bg-white border border-slate-200 shadow-sm rounded-[3rem] overflow-hidden">
            <CardContent className="p-10 lg:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" />

              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="relative group/avatar">
                    <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-4xl font-black text-primary border-4 border-white shadow-md relative overflow-hidden">
                      <span className="italic tracking-tighter">{student?.name?.charAt(0)}</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white rotate-12 transition-transform group-hover/avatar:rotate-0">
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-center md:text-left space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 leading-none">
                        {student?.name?.split(' ')[0]}<span className="text-primary">{student?.name?.split(' ')[1] || ''}</span>
                      </h2>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 font-black px-6 py-2 rounded-full uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        VERIFIED STUDENT
                      </Badge>
                    </div>
                    <p className="text-slate-400 font-bold text-sm flex items-center justify-center md:justify-start gap-3 uppercase tracking-[0.3em]">
                      <Target className="h-4 w-4 text-primary" /> {student?.branch} <span className="text-primary/10">•</span> {student?.college}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <Button className="rounded-2xl h-16 px-10 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white uppercase text-xs tracking-widest gap-3 transition-all hover:scale-105 active:scale-95" onClick={() => navigate('/student/profile')}>
                    MY PROFILE <Zap className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" className="rounded-2xl h-16 px-10 font-black border-slate-200 bg-white hover:bg-slate-50 text-slate-900 uppercase text-xs tracking-widest transition-all" onClick={() => navigate('/student/applications')}>
                    MY APPLICATIONS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white border group hover:bg-slate-50 transition-all duration-500 relative">
              <div className={cn("absolute top-0 right-0 h-16 w-16 opacity-5 rounded-full blur-2xl", stat.bg)} />
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</p>
                  <div className={cn("rounded-2xl p-4 transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <p className={cn("text-4xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div className="lg:col-span-8 space-y-10">
            {/* Job Alerts Banner */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-slate-50 border overflow-hidden relative group/banner">
              <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-[100px] -z-10 group-hover/banner:scale-125 transition-transform duration-1000" />
              <CardContent className="p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                <div className="space-y-6 text-center md:text-left flex-1">
                  <Badge className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                    <Activity className="h-3 w-3 mr-2" /> JOB ALERTS
                  </Badge>
                  <h3 className="text-4xl font-black leading-none uppercase tracking-tighter text-slate-900">READY FOR A NEW <span className="text-primary">JOB?</span></h3>
                  <p className="text-slate-500 font-bold leading-relaxed max-w-sm">New companies have posted job opportunities in your field this week. Check them out and apply now.</p>
                  <Button size="lg" className="bg-primary shadow-lg shadow-primary/20 text-white font-black rounded-2xl px-12 h-16 hover:bg-primary/90 gap-3 uppercase text-xs tracking-[0.2em] transition-all hover:translate-y-[-4px]" onClick={() => navigate('/student/browse-jobs')}>
                    EXPLORE JOBS <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="relative group-hover:rotate-12 transition-transform duration-700 shrink-0">
                  <div className="h-48 w-48 bg-white rounded-[3rem] border border-slate-200 flex items-center justify-center p-10 shadow-sm">
                    <Terminal className="h-24 w-24 text-primary opacity-20" />
                    <Sparkles className="absolute -top-4 -right-4 h-12 w-12 text-primary animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Tracker */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border group">
              <CardHeader className="p-12 pb-6 border-b border-slate-100 bg-slate-50 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4 text-slate-900">
                      <Activity className="h-8 w-8 text-primary" /> MY APPLICATIONS
                    </CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-[0.3em] text-slate-400">TRACK THE STATUS OF YOUR APPLICATIONS</CardDescription>
                  </div>
                  <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 px-6 h-12 rounded-xl" onClick={() => navigate('/student/applications')}>
                    VIEW ALL <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-12 space-y-8">
                {activeApplications.length === 0 ? (
                  <div className="py-24 flex flex-col items-center text-center space-y-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-10" />
                    <Ghost className="h-20 w-20 text-slate-300 relative z-10" />
                    <div className="space-y-2 relative z-10">
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">No Active Applications Found</p>
                      <Button variant="link" className="font-black text-primary uppercase text-[10px] tracking-widest" onClick={() => navigate('/student/browse-jobs')}>Apply for Jobs</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {activeApplications.slice(0, 3).map((app) => {
                      const job = jobs.find(j => (j.id === app.jobId || j._id === app.jobId));
                      const currentStageIndex = statusOrder.indexOf(app.status);
                      const progress = Math.max(((currentStageIndex + 1) / statusOrder.length) * 100, 10);

                      return (
                        <div key={app.id} className="group/item p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 hover:bg-white transition-all duration-500 flex flex-col gap-8 shadow-inner overflow-hidden relative">
                          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[60px] -z-10 group-hover/item:scale-150 transition-transform duration-1000" />
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-6">
                              <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-primary border border-slate-200 text-2xl group-hover/item:rotate-12 transition-transform">
                                {job?.companyName.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                <p className="font-black text-xl leading-none uppercase tracking-tighter text-slate-900">{job?.companyName}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{job?.roleTitle}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className="bg-primary/10 text-primary border border-primary/20 font-black px-6 py-2 rounded-full uppercase text-[10px] tracking-widest">
                                {app.status.replace(/_/g, ' ')}
                              </Badge>
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl">
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-4 relative z-10 px-1">
                            <div className="flex justify-between items-end">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">PROGRESS</p>
                              <p className="text-xl font-black text-primary leading-none">{Math.round(progress)}%</p>
                            </div>
                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden p-[1px] border border-slate-200 shadow-sm relative">
                              <div className="h-full bg-primary rounded-full transition-all duration-1500 ease-out" style={{ width: `${progress}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Platform Insights */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border group">
              <CardHeader className="bg-slate-50 p-10 border-b border-slate-100 transition-colors group-hover:bg-slate-100">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4 text-slate-900">
                  <BarChart3 className="h-6 w-6 text-primary" /> PLATFORM STATS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-8">
                  {platformStats.map((stat, index) => (
                    <InsightMetricItem
                      key={index}
                      label={stat.label}
                      value={stat.value}
                      trend={stat.trend}
                      color={stat.color}
                    />
                  ))}
                </div>
                <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 text-slate-600">VIEW MORE STATS</Button>
              </CardContent>
            </Card>

            {/* Interview Schedule Snapshot */}
            <Card className="border-none shadow-sm rounded-[3rem] bg-indigo-600 text-white p-12 relative overflow-hidden group/cal">
              <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-[80px] -z-10 group-hover/cal:scale-150 transition-transform duration-1000" />
              <Calendar className="absolute -right-8 -top-8 h-40 w-40 opacity-10 group-hover/cal:rotate-12 transition-transform duration-700" />
              <div className="relative z-10 space-y-8">
                <div className="space-y-1">
                  <h4 className="font-black text-xs uppercase tracking-[0.4em] flex items-center gap-3">
                    <Clock className="h-4 w-4" /> UPCOMING EVENTS
                  </h4>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">VIEW YOUR SCHEDULE</p>
                </div>
                <div className="p-8 bg-white/10 rounded-[2.5rem] border border-white/20 backdrop-blur-md">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">UPCOMING</p>
                  <p className="text-2xl font-black uppercase tracking-tighter">NO EVENTS SCHEDULED</p>
                  <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-white/60 uppercase">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
                    NO NEW EVENTS
                  </div>
                </div>
                <Button variant="secondary" className="w-full h-16 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-indigo-900 border-none bg-white hover:bg-white/90 transition-all hover:scale-105 active:scale-95" onClick={() => navigate('/student/interview-calendar')}>
                  MANAGE SCHEDULE
                </Button>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricInsight({ label, value, color }: { label: string, value: any, color: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className={cn("text-[11px] font-black", color)}>{value}</span>
    </div>
  );
}

function InsightMetricItem({ label, value, trend, color }: any) {
  return (
    <div className="space-y-3 group">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] transition-colors group-hover:text-slate-500">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none">{value}</p>
        <Badge className={cn("bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest py-1 px-3", color.replace('text-', 'text-'))}>{trend}</Badge>
      </div>
    </div>
  );
}
