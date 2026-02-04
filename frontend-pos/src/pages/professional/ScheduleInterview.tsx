import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon, Clock, Video, ArrowLeft,
  Target, Zap, ShieldCheck, Sparkles, Building2,
  User, Activity, Globe, Info, ChevronRight,
  ExternalLink, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ScheduleInterview() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: applicationData, isLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => applicationService.getApplicationById(appId!),
    enabled: !!appId,
  });

  const application = applicationData?.data;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const scheduleInterviewMutation = useMutation({
    mutationFn: (data: { applicationId: string; scheduledDate: Date; meetingLink?: string }) =>
      applicationService.scheduleInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
      queryClient.invalidateQueries({ queryKey: ['professional-applications'] });
      toast.success('Neural Uplink Synchronized: Interview Archived.');
      navigate('/professional/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Sync failure in telemetry uplink.');
    },
  });

  if (!application && !isLoading) {
    return (
      <DashboardLayout title="Operational Protocol" subtitle="Sequence Not Found">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <Info className="h-20 w-20 text-rose-500 animate-pulse" />
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Identity Mismatch</h2>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No active mission found for this coordinate.</p>
          </div>
          <Button onClick={() => navigate('/professional/dashboard')} variant="outline" className="rounded-2xl h-14 px-10 border-2 font-black uppercase text-xs tracking-widest">
            Return to Nexus
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const job = (application as any)?.jobId;
  const student = (application as any)?.studentId;

  const handleSchedule = () => {
    if (!selectedDate || !time || !meetingLink) {
      toast.error('Intelligence requirements incomplete. Populate all parameters.');
      return;
    }

    const [hours, minutes] = time.split(':');
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    scheduleInterviewMutation.mutate({
      applicationId: (application as any).id || (application as any)._id,
      scheduledDate: scheduledDateTime,
      meetingLink: meetingLink,
    });
  };

  const currentRound = (application as any)?.interviewRound || 'professional';

  const getRoundDisplay = () => {
    const rounds: Record<string, { title: string; color: string; icon: any }> = {
      professional: { title: 'Technical Evaluation', color: 'text-indigo-500', icon: Target },
      manager: { title: 'Strategic Review', color: 'text-amber-500', icon: ShieldCheck },
      hr: { title: 'Culture Alignment', color: 'text-emerald-500', icon: Zap },
    };
    return rounds[currentRound] || rounds.professional;
  };

  const round = getRoundDisplay();

  return (
    <DashboardLayout
      title="Schedule Interview"
      subtitle={`Scheduling interview for ${student?.name || 'Candidate'} — ${round.title}`}
    >
      <div className="max-w-[1400px] mx-auto pb-12 space-y-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Primary Scheduling Console */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-background/50 backdrop-blur-xl border border-muted ring-1 ring-primary/5">
              <CardHeader className="p-10 pb-4 border-b bg-muted/20 relative">
                <div className="absolute right-10 top-10 flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full font-black text-[9px] uppercase tracking-widest border border-primary/20">
                  <Activity className="h-3 w-3 animate-spin-slow" /> ACTIVE PROTOCOL
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-xl bg-opacity-10 flex items-center justify-center", round.color.replace('text', 'bg'))}>
                    <round.icon className={cn("h-6 w-6", round.color)} />
                  </div>
                  {round.title}
                </CardTitle>
                <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground/50">Position: {job?.roleTitle}</CardDescription>
              </CardHeader>

              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Calendar Vector */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5" /> Deployment Date
                    </Label>
                    <div className="border-2 rounded-[2rem] p-4 bg-muted/10 shadow-inner">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md mx-auto"
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Temporal Coordinate
                      </Label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="h-16 rounded-2xl border-2 font-black text-xl bg-muted/10 focus-visible:ring-primary/20 shadow-inner px-6"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" /> Meeting Link (Google Meet / Zoom)
                      </Label>
                      <div className="relative group">
                        <Video className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="url"
                          placeholder="meet.google.com/xxx-xxxx-xxx"
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          className="h-16 pl-14 rounded-2xl border-2 font-bold bg-muted/10 focus-visible:ring-primary/20 shadow-inner"
                        />
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">* Ensure link remains active for 90 minutes post-start.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-muted flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Selected Window</p>
                      <p className="text-sm font-black uppercase text-foreground">{selectedDate ? format(selectedDate, 'PPP') : 'IDLE'} @ {time || '00:00'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest" onClick={() => navigate('/professional/dashboard')}>
                      Cancel
                    </Button>
                    <Button
                      disabled={!selectedDate || !time || !meetingLink || scheduleInterviewMutation.isPending}
                      onClick={handleSchedule}
                      className="h-14 px-10 flex-1 md:flex-none rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 group/btn"
                    >
                      {scheduleInterviewMutation.isPending ? 'Scheduling...' : 'Confirm Schedule'}
                      <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Candidate Intel Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-indigo-600 text-white p-10 overflow-hidden relative group">
              <Target className="absolute -right-6 -top-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center border border-white/20">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter">{student?.name}</h4>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{student?.degree}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-white/40 mb-1">CGPA</p>
                    <p className="text-sm font-black text-white">{student?.cgpa || 'N/A'}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-white/40 mb-1">Degree</p>
                    <p className="text-[10px] font-black text-white truncate">{student?.degree || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Skills</span>
                    <span>Recent</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {student?.skills?.slice(0, 5).map((skill: string) => (
                      <Badge key={skill} className="bg-white/10 text-white border-white/20 font-bold uppercase text-[9px] px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {student?.resumeUrl && (
                  <Button variant="outline" className="w-full h-14 rounded-2xl bg-white/5 border-white/20 hover:bg-white/10 font-bold text-xs uppercase tracking-widest flex items-center gap-3" asChild>
                    <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" /> View Resume
                    </a>
                  </Button>
                )}
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-background/50 backdrop-blur-sm p-8 border">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-tight">{job?.companyName}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{job?.roleTitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-2xl p-4 space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/60">Stage</p>
                    <p className="text-xs font-black uppercase">{currentRound}</p>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-4 space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/60">Priority</p>
                    <p className="text-xs font-black uppercase text-rose-500">Critical</p>
                  </div>
                </div>

                <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Reminder</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                    Scheduled tasks automatically update the student's neural feed. No further notification required.
                  </p>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
