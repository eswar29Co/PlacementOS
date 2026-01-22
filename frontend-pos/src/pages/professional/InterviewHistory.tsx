import { useAppSelector } from '@/store/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star, Calendar, User, Briefcase,
  ShieldCheck, ArrowRight, MessageSquare,
  Activity, Zap, Target, Binary, Fingerprint,
  Search, Filter, Database, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { jobService } from '@/services/jobService';
import { studentService } from '@/services/studentService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function InterviewHistory() {
  const { user } = useAppSelector((state) => state.auth);

  // Fetch data
  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['assigned-applications'],
    queryFn: () => applicationService.getAssignedApplications(),
  });
  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = Array.isArray(jobsData?.data) ? jobsData.data : (jobsData?.data && 'jobs' in jobsData.data ? jobsData.data.jobs : []);

  // Filter completed interviews
  const completedInterviews = applications.filter((app: any) =>
    app.interviewFeedback && app.interviewFeedback.some((f: any) => f.professionalId === user?.id)
  );

  if (appsLoading || jobsLoading) {
    return (
      <DashboardLayout title="Interview History" subtitle="Loading evaluation records...">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const avgRating = completedInterviews.length > 0
    ? (completedInterviews.reduce((acc: number, app: any) => {
      const feedback = app.interviewFeedback?.find((f: any) => f.professionalId === user?.id);
      return acc + (feedback?.rating || 0);
    }, 0) / completedInterviews.length).toFixed(1)
    : "0.0";

  const passRate = completedInterviews.length > 0
    ? Math.round((completedInterviews.filter((app: any) => {
      const feedback = app.interviewFeedback?.find((f: any) => f.professionalId === user?.id);
      return feedback?.recommendation === 'Pass';
    }).length / completedInterviews.length) * 100)
    : 0;

  return (
    <DashboardLayout
      title="Interview History"
      subtitle="View results and feedback from interviews you have conducted"
    >
      <div className="max-w-[1400px] mx-auto space-y-10 pb-12">

        {/* Metric Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Interviews" value={completedInterviews.length} icon={Fingerprint} color="text-primary" bg="bg-primary/5" />
          <MetricCard title="Avg Student Rating" value={`${avgRating}/5`} icon={Star} color="text-amber-600" bg="bg-amber-50/5" />
          <MetricCard title="Pass Rate" value={`${passRate}%`} icon={Zap} color="text-emerald-600" bg="bg-emerald-50/5" />
          <MetricCard title="Region" value="Global" icon={Database} color="text-indigo-600" bg="bg-indigo-50/5" />
        </div>

        {/* Archives Interface */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3 text-slate-900">
                <Binary className="h-6 w-6 text-primary" />
                Past Evaluations
              </h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest opacity-60">Records of all interviews conducted by you</p>
            </div>
            <div className="flex gap-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  className="h-12 w-64 pl-12 pr-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary/20 font-bold text-xs uppercase tracking-widest placeholder:text-slate-400 focus:bg-white transition-all text-slate-900"
                />
              </div>
              <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 bg-white"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>

          {completedInterviews.length === 0 ? (
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-slate-50 py-24 flex flex-col items-center text-center space-y-6">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Calendar className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 leading-none">No History</h3>
                <p className="text-slate-400 max-w-sm font-medium">You haven't conducted any interviews yet.</p>
              </div>
              <Button variant="ghost" className="font-black text-primary hover:bg-primary/5 uppercase text-xs tracking-widest">Waiting for Interviews</Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedInterviews.map((app: any) => {
                const student = app.studentId;
                const job = app.jobId;
                const myFeedback = app.interviewFeedback?.find((f: any) => f.professionalId === user?.id);

                if (!student || !job || !myFeedback) return null;

                return (
                  <Card key={`${app.id || app._id}-${myFeedback.round}`} className="border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white group hover:scale-[1.01] transition-all duration-300 border-l-8 border-l-primary/10 hover:border-l-primary/40 border">
                    <CardContent className="p-0">
                      <div className="p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10">

                        {/* Candidate Identity */}
                        <div className="flex items-center gap-6 min-w-[300px]">
                          <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl font-black text-primary border border-primary/10 shadow-sm" title="Student Details">
                            {student.name.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-black uppercase tracking-tight leading-none text-slate-900">{student.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <User className="h-3 w-3" /> {student.email}
                            </p>
                            <div className="flex gap-2 pt-1">
                              <Badge className="bg-slate-100 text-slate-600 font-black text-[8px] uppercase tracking-tighter rounded-md h-4 px-1.5 border-none">CGPA: {student.cgpa}</Badge>
                              <Badge className="bg-slate-100 text-slate-600 font-black text-[8px] uppercase tracking-tighter rounded-md h-4 px-1.5 border-none">{student.college}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Mission Context */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-0.5">
                              {myFeedback.round} Round
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{format(new Date(myFeedback.conductedAt), 'dd MMM yyyy')}</span>
                          </div>
                          <p className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-slate-700">
                            <Briefcase className="h-3 w-3 text-slate-400" /> {job.roleTitle} @ <span className="text-primary">{job.companyName}</span>
                          </p>
                        </div>

                        {/* Calibration Score */}
                        <div className="hidden md:flex flex-col items-center gap-2 px-8 border-x border-slate-100 group-hover:border-primary/20 transition-colors">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={cn("h-4 w-4", s <= myFeedback.rating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                            ))}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-50">Assessment: {myFeedback.rating}.0</p>
                        </div>

                        {/* Recommendation Outcome */}
                        <div className="flex flex-col items-center gap-3 min-w-[120px]">
                          <div className={cn(
                            "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl",
                            myFeedback.recommendation === 'Pass' ? "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/10" : "bg-rose-500/10 text-rose-600 shadow-rose-500/10"
                          )}>
                            {myFeedback.recommendation.toUpperCase()}
                          </div>
                        </div>

                        {/* Detailed Dossier Toggle */}
                        <div className="w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-none">
                          <Button variant="ghost" className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-primary gap-3 hover:bg-primary/5 transition-all">
                            View Report <FileText className="h-4 w-4" />
                          </Button>
                        </div>

                      </div>

                      {/* Feedback Teaser (Bottom stripe) */}
                      <div className="px-8 pb-6 group-hover:pb-8 transition-all">
                        <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[1.5rem] relative overflow-hidden group-hover:bg-slate-100 transition-all">
                          <MessageSquare className="absolute -right-2 -bottom-2 h-16 w-16 text-slate-200 opacity-40 rotate-12" />
                          <p className="text-xs font-medium text-slate-500 italic line-clamp-1 relative z-10">"{myFeedback.comments}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white group hover:translate-y-[-4px] transition-all duration-300 border">
      <div className={cn("h-1.5 w-full", color.replace('text-', 'bg-'))} />
      <CardContent className="p-8 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <div className={cn("rounded-xl p-2.5", bg, color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className={cn("text-4xl font-black tracking-tighter leading-none whitespace-nowrap", color)}>{value}</p>
      </CardContent>
    </Card>
  );
}
