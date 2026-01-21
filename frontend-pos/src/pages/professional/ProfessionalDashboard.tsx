import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppSelector } from '@/store/hooks';
import { Professional } from '@/types';
import {
  Users, Calendar, CheckCircle2, Star, Video, Clock,
  MapPin, User, ChevronRight, Zap, Target, BookOpen,
  Award, ShieldCheck, Fingerprint, Activity,
  Monitor, BrainCircuit, Network, Sparkles, Building2,
  ArrowRight, FileText, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { applicationService, studentService, jobService } from '@/services';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const professional = user as Professional;

  // Fetch applications assigned to this professional
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['assigned-applications'],
    queryFn: () => applicationService.getAssignedApplications(),
  });
  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  const myAssignments = applications;

  // Filter logic (Preserved)
  const pending = myAssignments.filter((a: any) => {
    if (a.assignedProfessionalId === professional?.id && a.status === 'professional_interview_pending') return true;
    if (a.assignedManagerId === professional?.id && (a.status === 'manager_interview_pending' || a.status === 'manager_round_pending')) return true;
    if (a.assignedHRId === professional?.id && (a.status === 'hr_interview_pending' || a.status === 'hr_round_pending')) return true;
    return false;
  });

  const scheduled = myAssignments.filter((a: any) => {
    if (a.assignedProfessionalId === professional?.id && a.status === 'professional_interview_scheduled') return true;
    if (a.assignedManagerId === professional?.id && a.status === 'manager_interview_scheduled') return true;
    if (a.assignedHRId === professional?.id && a.status === 'hr_interview_scheduled') return true;
    return false;
  });

  const completed = myAssignments.filter((a: any) => {
    if (a.assignedProfessionalId === professional?.id && (a.status === 'professional_interview_completed' || a.status.includes('completed'))) return true;
    if (a.assignedManagerId === professional?.id && (a.status === 'manager_interview_completed' || a.status.includes('completed'))) return true;
    if (a.assignedHRId === professional?.id && (a.status === 'hr_interview_completed' || a.status.includes('completed'))) return true;
    return false;
  });

  const stats = [
    { label: 'Evaluation Quota', value: professional.interviewsTaken, icon: Activity, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Confirmed Ops', value: scheduled.length, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50/5' },
    { label: 'Mission Pending', value: pending.length, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50/5' },
    { label: 'Expert rating', value: `${professional.rating.toFixed(1)}/5`, icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50/5' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Expert Nexus" subtitle="Synchronizing mission data...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="font-black text-muted-foreground animate-pulse text-[10px] uppercase tracking-widest">Accessing Secure Records...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Expert Nexus" subtitle={`Mission Control Interface for ${professional.name.split(' ')[0]}`}>
      <div className="space-y-10 max-w-[1400px] mx-auto pb-12">

        {/* Tactical Profile Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-100 via-teal-100 to-blue-100 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <Card className="relative bg-white border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden border">
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-28 w-28 rounded-3xl bg-slate-50 flex items-center justify-center text-4xl font-black text-slate-400 border-4 border-white shadow-sm relative shrink-0">
                    {professional.name.split(' ').map(n => n[0]).join('')}
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900">{professional.name}</h2>
                      <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black px-4 py-1 rounded-full uppercase text-[10px] tracking-widest shadow-none">Prime Auditor</Badge>
                    </div>
                    <p className="text-muted-foreground font-black text-xs flex items-center justify-center md:justify-start gap-3 uppercase tracking-[0.2em]">
                      <Target className="h-4 w-4 text-primary" /> {professional.role || 'Senior Associate'} • {professional.yearsOfExperience} YRS EXPERTISE
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                      {professional.techStack?.slice(0, 3).map(tech => (
                        <Badge key={tech} className="bg-slate-50 text-slate-600 border border-slate-100 px-3 font-bold text-[9px] uppercase tracking-widest shadow-none">{tech}</Badge>
                      ))}
                      {professional.techStack && professional.techStack.length > 3 && <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-none bg-muted/50">+{professional.techStack.length - 3} MORE</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="flex-1 md:flex-none flex items-center gap-4 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Rating</p>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{professional.rating.toFixed(1)}</span>
                        <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/professional/profile')} variant="outline" className="rounded-2xl h-16 px-8 font-black border-2 uppercase text-xs tracking-widest hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all">
                    Review Identity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white border group hover:translate-y-[-4px] transition-all duration-300">
              <div className={cn("h-1.5 w-full", stat.color.replace('text-', 'bg-'))} />
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  <div className={cn("rounded-xl p-2.5", stat.bg, stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className={cn("text-4xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Operational Pipeline */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3 text-slate-900">
                <Network className="h-6 w-6 text-primary" />
                Operational Pipeline
              </h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Neural routing of candidate evaluation tracks</p>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200 flex gap-1">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-black text-[9px] uppercase tracking-widest shadow-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Auditor Verified
              </div>
            </div>
          </div>

          <Tabs defaultValue="pending" className="space-y-8">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent h-auto p-0 flex gap-2">
                {[
                  { value: 'pending', label: 'Queued Ops', count: pending.length, icon: Clock, color: 'text-amber-500' },
                  { value: 'scheduled', label: 'Confirmed Log', count: scheduled.length, icon: Calendar, color: 'text-indigo-500' },
                  { value: 'completed', label: 'Archive Hub', count: completed.length, icon: CheckCircle2, color: 'text-emerald-500' },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-2xl px-8 py-3.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-black text-xs uppercase tracking-widest flex items-center gap-3 text-slate-400 transition-all"
                  >
                    <tab.icon className={cn("h-4 w-4", tab.color)} />
                    {tab.label}
                    {tab.count > 0 && <Badge className="ml-1 bg-primary text-white h-5 min-w-5 p-1 flex items-center justify-center rounded-lg text-[9px] border-none font-black shadow-none">{tab.count}</Badge>}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="px-6 hidden lg:block">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Evaluation Control Interface</p>
              </div>
            </div>

            <TabsContent value="pending" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pending.length === 0 ? (
                  <EmptyState icon={Monitor} title="Queues Clear" description="No active candidate tracks requiring immediate intervention." />
                ) : (
                  pending.map((app: any) => (
                    <AssignmentCard
                      key={app.id || app._id}
                      app={app}
                      actionLabel="Initialize Protocol"
                      onClick={() => navigate(`/professional/schedule/${app.id || app._id}`)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {scheduled.length === 0 ? (
                  <EmptyState icon={Calendar} title="No Confirmed Missions" description="Confirmed interview tracks will synchronize here." />
                ) : (
                  scheduled.map((app: any) => (
                    <AssignmentCard
                      key={app.id || app._id}
                      app={app}
                      actionLabel="Launch Simulation"
                      onClick={() => navigate(`/professional/conduct/${app.id || app._id}`)}
                      isScheduled
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completed.length === 0 ? (
                  <EmptyState icon={ShieldCheck} title="Archives Ready" description="Historical dossier evaluations will be accessible here." />
                ) : (
                  completed.map((app: any) => (
                    <AssignmentCard
                      key={app.id || app._id}
                      app={app}
                      actionLabel="View Dossier"
                      onClick={() => navigate(`/professional/view/${app.id || app._id}`)}
                      isCompleted
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

function AssignmentCard({ app, actionLabel, onClick, isScheduled, isCompleted }: any) {
  const student = app.studentId;
  const job = app.jobId;

  return (
    <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden group hover:scale-[1.01] transition-transform duration-300 bg-white border">
      <CardContent className="p-0">
        <div className="p-8 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-400 border-2 border-white shadow-sm group-hover:rotate-6 transition-transform">
                {student?.name?.charAt(0) || '?'}
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="bg-primary/5 text-primary border border-primary/10 text-[9px] font-black uppercase py-0.5 px-3 rounded-md shadow-none">
                  {(app.interviewRound || 'Professional').toUpperCase()} CALIBRATION
                </Badge>
                <h4 className="font-black text-xl leading-tight uppercase tracking-tight text-slate-900">{student?.name || 'Unknown Subject'}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="h-3 w-3" /> {student?.college || 'External Node'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                <Fingerprint className="h-5 w-5" />
              </div>
              {isCompleted && <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[8px] uppercase shadow-none">Finalized</Badge>}
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-slate-400 opacity-70 tracking-widest">Mission Track</p>
                <p className="text-xs font-black uppercase text-slate-700">{job?.roleTitle || 'Strategic Role'} <span className="text-primary mx-1">@</span> {job?.companyName || 'Lead Org'}</p>
              </div>
              <Globe className="h-4 w-4 text-slate-200" />
            </div>

            {isScheduled && app.scheduledDate && (
              <div className="pt-4 border-t border-muted flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Temporal Window</p>
                    <p className="text-xs font-black text-indigo-600 uppercase">{new Date(app.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>
                {app.meetingLink && (
                  <div className="h-2 w-12 bg-emerald-500/20 rounded-full animate-pulse" />
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {!isCompleted ? (
              <>
                <Button className="flex-1 h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 gap-3 group/btn" onClick={onClick}>
                  {actionLabel} <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                {isScheduled && app.meetingLink && (
                  <Button variant="outline" className="h-16 w-16 rounded-[1.5rem] border-slate-200 group/link bg-white hover:bg-slate-50" asChild>
                    <a href={app.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Video className="h-5 w-5 text-primary group-hover/link:animate-pulse" />
                    </a>
                  </Button>
                )}
              </>
            ) : (
              <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-[10px] uppercase text-primary hover:bg-primary/5 gap-3" onClick={onClick}>
                Review Submission Dossier <FileText className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="col-span-full py-24 flex flex-col items-center text-center space-y-4 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
      <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
        <Icon className="h-10 w-10 text-slate-200" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 leading-none mb-2 uppercase tracking-tight">{title}</h3>
        <p className="text-slate-400 max-w-sm font-medium">{description}</p>
      </div>
    </div>
  );
}
