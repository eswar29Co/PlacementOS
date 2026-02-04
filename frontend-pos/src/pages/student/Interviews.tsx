import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services';
import { Student } from '@/types';
import {
  Video, Calendar, Clock, User, Bot, Star,
  ChevronRight, Target, Zap, ShieldCheck,
  Search, Filter, PlayCircle, BarChart3,
  Network, Fingerprint, Activity, ArrowRight,
  Monitor, BrainCircuit, FileText, Globe, Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Interviews() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];
  const myApplications = applications;

  const scheduled = myApplications.filter((a: any) =>
    ['ai_interview_pending', 'professional_interview_pending', 'professional_interview_scheduled',
      'manager_interview_pending', 'manager_interview_scheduled', 'hr_interview_pending',
      'hr_interview_scheduled'].includes(a.status)
  );

  const completed = myApplications.filter((a: any) =>
    ['ai_interview_completed', 'professional_interview_completed', 'manager_round_completed',
      'hr_round_completed', 'hired', 'rejected', 'offer_released', 'offer_accepted', 'offer_rejected'].includes(a.status)
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Interviews" subtitle="Loading interviews...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="font-black text-muted-foreground animate-pulse uppercase tracking-widest text-[10px]">Fetching your records...</p>
        </div>
      </DashboardLayout>
    );
  }

  const conversionRate = myApplications.length > 0 ? Math.round((completed.length / myApplications.length) * 100) : 0;

  return (
    <DashboardLayout title="Interviews" subtitle="Manage your upcoming interviews and view past feedback">
      <div className="space-y-10 max-w-[1400px] mx-auto pb-12">

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Upcoming" value={scheduled.length} icon={Zap} color="text-primary" bg="bg-primary/5" gradient="from-primary/5 to-blue-50/5" />
          <SummaryCard title="Completed" value={completed.length} icon={ShieldCheck} color="text-emerald-600" bg="bg-emerald-50/5" gradient="from-emerald-50/5 to-teal-50/5" />
          <SummaryCard title="Completion Rate" value={`${conversionRate}%`} icon={BarChart3} color="text-indigo-600" bg="bg-indigo-50/5" gradient="from-indigo-50/5 to-indigo-100/5" />
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3 text-slate-900">
                <Network className="h-6 w-6 text-primary" />
                Interview Schedule
              </h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Track your active interviews and past results</p>
            </div>
          </div>

          <Tabs defaultValue="scheduled" className="space-y-8">
            <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent h-auto p-0 flex gap-2">
                <TabsTrigger value="scheduled" className="rounded-2xl px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-black text-xs uppercase tracking-widest flex items-center gap-3 text-slate-400">
                  <Monitor className="h-4 w-4 text-primary" /> Upcoming Interviews
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-2xl px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center gap-3 text-slate-400">
                  <Star className="h-4 w-4 text-emerald-500" /> Past Interviews
                </TabsTrigger>
              </TabsList>
              <div className="px-6 hidden lg:block">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/50">Interview Management System</p>
              </div>
            </div>

            <TabsContent value="scheduled" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {scheduled.length === 0 ? (
                  <EmptyState icon={Video} title="No Interviews" description="You have no upcoming interviews scheduled." />
                ) : (
                  scheduled.map((app: any) => (
                    <InterviewCard
                      key={app.id || app._id}
                      app={app}
                      onAction={() => app.status === 'ai_interview_pending' ? navigate(`/student/ai-interview/${app.id || app._id}`) : window.open(app.meetingLink, '_blank')}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {completed.length === 0 ? (
                  <EmptyState icon={Star} title="No History" description="Your past interview results will appear here." />
                ) : (
                  completed.map((app: any) => (
                    <InterviewCard
                      key={app.id || app._id}
                      app={app}
                      isCompleted
                      onAction={() => { }}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ title, value, icon: Icon, color, bg, gradient }: any) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white border group hover:translate-y-[-4px] transition-all duration-300 relative">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", gradient)} />
      <CardContent className="p-8 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <div className={cn("rounded-xl p-2.5", bg, color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className={cn("text-4xl font-black tracking-tighter", color)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function InterviewCard({ app, isCompleted, onAction }: any) {
  const isAI = app.status.includes('ai_');
  const job = app.jobId;

  return (
    <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden group hover:scale-[1.01] transition-transform duration-300 bg-white border">
      <CardContent className="p-0">
        <div className="p-10 space-y-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={cn(
                "h-20 w-20 rounded-[1.5rem] flex items-center justify-center shadow-sm transition-all group-hover:rotate-6 duration-500 shrink-0 border",
                isAI ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-primary/5 text-primary border-primary/10"
              )}>
                {isAI ? <Bot className="h-10 w-10" /> : <User className="h-10 w-10" />}
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase py-0.5 px-3 border border-slate-100 rounded-md shadow-none">
                  {isAI ? 'AI Interview' : 'Expert Interview'}
                </Badge>
                <h4 className="font-black text-2xl leading-tight uppercase tracking-tighter text-slate-900">{job?.roleTitle || 'Job Role'}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-primary/50" /> {job?.companyName || 'Company'}
                </p>
              </div>
            </div>

            {isCompleted ? (
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                <ShieldCheck className="h-7 w-7" />
              </div>
            ) : (
              <div className="text-right bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                <p className="text-xl font-black text-primary leading-none tracking-tighter">{app.scheduledDate ? format(new Date(app.scheduledDate), 'HH:mm') : '--:--'}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{app.scheduledDate ? format(new Date(app.scheduledDate), 'dd MMM') : 'TBD'}</p>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem] space-y-6">
            {isCompleted ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-50">Interview Result</p>
                    <div className="flex gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={cn(
                            "h-3.5 w-3.5",
                            star <= (isAI ? Math.round((app.aiInterviewScore || 0) / 20) : (app.rating || 0)) ? "text-amber-500 fill-amber-500" : "text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">{isAI ? `${app.aiInterviewScore || 0}%` : `Rating: ${app.rating || 0}/5`}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-3">
                  {isAI
                    ? app.aiInterviewSummary || "Evaluation completed by AI Neural core."
                    : app.interviewFeedback?.[app.interviewFeedback.length - 1]?.comments || "Feedback pending final review."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status: {app.scheduledDate ? 'Scheduled' : 'Waiting'}</p>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: app.scheduledDate ? '100%' : '20%' }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {isCompleted ? (
              <Button variant="outline" className="w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border-slate-200 hover:bg-slate-50 gap-3 text-slate-600">
                View Feedback <FileText className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  className="flex-1 h-16 rounded-[1.5rem] font-black gap-3 shadow-lg shadow-primary/20 text-xs uppercase tracking-widest group/btn"
                  onClick={onAction}
                  disabled={!isAI && !app.meetingLink}
                >
                  {isAI ? 'Start AI Interview' : (app.meetingLink ? 'Join Interview' : 'Awaiting Schedule')}
                  <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                {app.meetingLink && !isAI && (
                  <Button variant="outline" className="h-16 w-16 rounded-[1.5rem] border-slate-200 group/link bg-white hover:bg-slate-50" asChild>
                    <a href={app.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Monitor className="h-6 w-6 text-primary group-hover/link:scale-110 transition-transform" />
                    </a>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="col-span-full py-32 flex flex-col items-center text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
      <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
        <Icon className="h-10 w-10 text-slate-200" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-slate-400 max-w-sm font-medium">{description}</p>
      </div>
    </div>
  );
}
