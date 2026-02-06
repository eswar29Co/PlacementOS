import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { Student } from '@/types';
import {
  Briefcase, FileText, ClipboardCheck, Video, Award,
  ArrowRight, Sparkles, Target, Zap,
  MapPin, Calendar, Search, Ghost, ChevronRight,
  ShieldCheck, BarChart3, Activity, Clock, Cpu, Terminal,
  User, Mail, Phone, GraduationCap, Building2, MapPinned
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { jobService } from '@/services/jobService';
import { dashboardService } from '@/services/dashboardService';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

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

  // Upcoming Events Integration
  const upcomingEvents = myApplications.filter(app =>
    app.scheduledDate && new Date(app.scheduledDate) >= new Date()
  ).sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());

  const stats = [
    { label: 'My Applications', value: statsResponse.totalApplications || 0, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending Tasks', value: myApplications.filter(a => ['assessment_pending', 'ai_interview_pending', 'professional_interview_scheduled', 'manager_interview_scheduled', 'hr_interview_scheduled'].includes(a.status)).length, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Interviews', value: myApplications.filter(a => a.status.includes('interview_pending') || a.status.includes('interview_scheduled')).length, icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
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

        {/* Improved Profile Overview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 bg-white border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden group/hero">
            <CardContent className="p-8 lg:p-10 relative">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[60px] animate-pulse-slow" />
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative shrink-0">
                  <div className="h-28 w-28 rounded-3xl bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-white relative overflow-hidden group-hover/hero:scale-105 transition-transform duration-500">
                    {student?.name?.charAt(0)}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 w-full text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                      {student?.name?.split(' ')[0]} <span className="text-primary">{student?.name?.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 font-black px-4 py-1 rounded-full uppercase text-[9px] tracking-[0.2em]">
                      VERIFIED STUDENT
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 group/info">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:text-primary group-hover/info:bg-primary/10 transition-colors">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BRANCH</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{student?.branch}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 group/info">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:text-primary group-hover/info:bg-primary/10 transition-colors">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">COLLEGE</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{student?.college}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 group/info">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/info:text-primary group-hover/info:bg-primary/10 transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">EMAIL</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{student?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none shadow-xl rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">QUICK START</p>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">PREMIUM <span className="text-primary not-italic">ACCESS</span></h4>
              </div>
              <Button
                variant="secondary"
                className="w-full bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-12 mt-6 hover:bg-primary/90 border-none shadow-lg shadow-primary/20 transition-all active:scale-95"
                onClick={() => navigate('/student/profile')}
              >
                VIEW PROFILE <User className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-6">
          <div className="px-2 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">QUICK ACTIONS</h3>
            <div className="h-px flex-1 mx-6 bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              icon={Briefcase}
              title="Browse Jobs"
              subtitle="Explore new roles"
              color="text-primary"
              bg="bg-primary/5"
              onClick={() => navigate('/student/browse-jobs')}
            />
            <QuickActionCard
              icon={Video}
              title="Mock Interview"
              subtitle="AI Practice mode"
              color="text-emerald-500"
              bg="bg-emerald-500/5"
              onClick={() => navigate('/student/interviews')}
            />
            <QuickActionCard
              icon={FileText}
              title="Resume Scan"
              subtitle="ATS Score check"
              color="text-amber-500"
              bg="bg-amber-500/5"
              onClick={() => navigate('/student/profile')}
            />
            <QuickActionCard
              icon={Calendar}
              title="Schedule"
              subtitle="View your sessions"
              color="text-indigo-500"
              bg="bg-indigo-500/5"
              onClick={() => navigate('/student/interview-calendar')}
            />
          </div>
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
            {/* My Applications - Tabular Format */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border group">
              <CardHeader className="p-10 pb-6 border-b border-slate-100 bg-slate-50 relative">
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4 text-slate-900">
                      <Activity className="h-7 w-7 text-primary" /> MY APPLICATIONS
                    </CardTitle>
                    <CardDescription className="font-bold text-[9px] uppercase tracking-[0.3em] text-slate-400">YOUR RECENT RECRUITMENT PROGRESS</CardDescription>
                  </div>
                  <Button variant="ghost" className="font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5 px-4 h-10 rounded-xl" onClick={() => navigate('/student/applications')}>
                    VIEW ALL <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeApplications.length === 0 ? (
                  <div className="py-20 flex flex-col items-center text-center space-y-6 bg-white rounded-b-[3rem]">
                    <Ghost className="h-16 w-16 text-slate-200" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">NO ACTIVE APPLICATIONS</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-none">
                          <TableHead className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Company</TableHead>
                          <TableHead className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Date Applied</TableHead>
                          <TableHead className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                          <TableHead className="px-10 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeApplications.slice(0, 5).map((app) => {
                          const resolvedJob = (typeof app.jobId === 'object' ? app.jobId : jobs.find(j => (j.id === app.jobId || j._id === app.jobId)));
                          return (
                            <TableRow key={app.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group/row">
                              <TableCell className="px-10 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-900 text-lg border border-slate-200 group-hover/row:scale-110 transition-transform">
                                    {resolvedJob?.companyName?.charAt(0) || 'J'}
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-900 uppercase tracking-tighter text-sm">{resolvedJob?.companyName || 'Unknown Company'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{resolvedJob?.roleTitle || 'Specialist Role'}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-6 text-center">
                                <p className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                                  {format(new Date(app.appliedAt), 'MMM dd, yyyy')}
                                </p>
                              </TableCell>
                              <TableCell className="px-6 py-6 text-center">
                                <Badge variant="outline" className="font-black text-[8px] uppercase tracking-widest border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded-full">
                                  {app.status.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-10 py-6 text-right">
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-300 hover:text-primary hover:bg-primary/10 rounded-xl" onClick={() => navigate(`/student/applications`)}>
                                  <ChevronRight className="h-5 w-5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Alerts Banner */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-slate-900 text-white border overflow-hidden relative group/banner">
              <CardContent className="p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                <div className="space-y-6 text-center md:text-left flex-1">
                  <Badge className="bg-white/10 text-white border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                    NEW JOBS POSTED
                  </Badge>
                  <h3 className="text-4xl font-black leading-none uppercase tracking-tighter">READY FOR A NEW <span className="text-primary">CHALLENGE?</span></h3>
                  <p className="text-slate-400 font-bold leading-relaxed max-w-sm">New companies have posted job opportunities in your field this week. Check them out and apply now.</p>
                  <Button size="lg" className="bg-primary text-white font-black rounded-2xl px-10 h-14 hover:bg-primary/90 gap-3 uppercase text-xs tracking-[0.1em] transition-all" onClick={() => navigate('/student/browse-jobs')}>
                    EXPLORE JOBS <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="shrink-0 group-hover:rotate-6 transition-transform duration-700">
                  <Terminal className="h-40 w-40 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Calendar Integration - Upcoming Events */}
            <Card className="border-none shadow-sm rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden group/cal">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-[80px]" />
              <Calendar className="absolute -right-8 -top-8 h-40 w-40 opacity-5 group-hover/cal:rotate-12 transition-transform duration-700" />

              <div className="relative z-10 space-y-8 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" /> UPCOMING EVENTS
                    </h4>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">SCHEDULED SESSIONS</p>
                  </div>
                  <Badge className="bg-white/10 text-white border-white/20 text-[8px] font-black">
                    {upcomingEvents.length} TOTAL
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  {upcomingEvents.length === 0 ? (
                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center gap-4">
                      <Ghost className="h-10 w-10 text-white/20" />
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">NO UPCOMING EVENTS</p>
                    </div>
                  ) : (
                    upcomingEvents.slice(0, 2).map((event: any) => {
                      const job = jobs.find(j => (j.id === event.jobId || j._id === event.jobId));
                      return (
                        <div key={event.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group/event" onClick={() => navigate('/student/interview-calendar')}>
                          <div className="flex justify-between items-start mb-4">
                            <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase h-5">
                              INTERVIEW
                            </Badge>
                            <p className="text-[10px] font-black text-primary uppercase">{format(new Date(event.scheduledDate), 'MMM dd')}</p>
                          </div>
                          <p className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{job?.companyName || 'Technical Interview'}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" /> {format(new Date(event.scheduledDate), 'hh:mm a')}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-[9px] uppercase tracking-widest text-white border-white/10 bg-transparent hover:bg-white/10 transition-all mt-4" onClick={() => navigate('/student/interview-calendar')}>
                  VIEW FULL CALENDAR
                </Button>
              </div>
            </Card>

            {/* Platform Stats - Verified with Data */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border group">
              <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4 text-slate-900">
                  <BarChart3 className="h-6 w-6 text-primary" /> PLATFORM STATS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
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
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">DATA STATUS</p>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">SYNCHRONIZED & VERIFIED</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickActionCard({ icon: Icon, title, subtitle, color, bg, onClick }: any) {
  return (
    <Card
      onClick={onClick}
      className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white border cursor-pointer hover:border-primary/20 transition-all duration-300 group/qa active:scale-95"
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover/qa:scale-110", bg, color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 uppercase tracking-tighter text-sm">{title}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightMetricItem({ label, value, trend, color }: any) {
  return (
    <div className="space-y-4 group">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] transition-colors group-hover:text-slate-500">{label}</p>
        <Badge className={cn("bg-slate-50 text-slate-400 border-none font-black text-[8px] uppercase tracking-widest py-1 px-3", color.replace('text-', 'bg-').replace('text-', 'text-'))}>{trend}</Badge>
      </div>
      <div className="space-y-3">
        <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none">{value}</p>
        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-1000", color.replace('text-', 'bg-'))}
            style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
          />
        </div>
      </div>
    </div>
  );
}
