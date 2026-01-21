import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { applicationService, professionalService } from '@/services';
import {
  Video, User, Calendar, ExternalLink, Clock, FileText,
  Star, Target, Sparkles, ShieldCheck, ChevronRight,
  Info, Activity, Monitor, Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function HRInterview() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { data: applicationsData, isLoading: isAppLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const { data: professionalsData } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalService.getAllProfessionals(),
  });

  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];
  const professionals = Array.isArray(professionalsData?.data)
    ? professionalsData.data
    : (professionalsData?.data as any)?.professionals || [];

  const myApplication = applications.find(
    (app) => app.studentId === user?.id &&
      (app.status === 'hr_interview_pending' ||
        app.status === 'hr_interview_scheduled' ||
        app.status === 'hr_interview_completed')
  );

  const assignedHR = myApplication?.assignedHRId
    ? professionals.find(p => p.id === myApplication.assignedHRId || p._id === myApplication.assignedHRId)
    : null;

  const hrFeedback = myApplication?.interviewFeedback?.find(
    f => f.round === 'hr' || f.interviewRound === 'hr'
  );

  const isScheduled = myApplication?.status === 'hr_interview_scheduled' && myApplication?.meetingLink;
  const isCompleted = myApplication?.status === 'hr_interview_completed';

  if (isAppLoading) {
    return (
      <DashboardLayout title="Neural Uplink" subtitle="Acquiring HR communication channel...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="font-black text-slate-400 animate-pulse text-[10px] uppercase tracking-widest">Bridging Secure Vectors...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Neural Uplink" subtitle="Strategic HR Finalization Round">
      <div className="max-w-[1200px] mx-auto space-y-12 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 italic">HR Operational Node</h1>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3 italic">
              <Activity className="h-4 w-4 text-primary" /> Phase Index: <span className="text-primary">FINAL CONTEXT SYNC</span>
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 font-black text-[10px] uppercase tracking-widest italic shadow-sm">
            <Globe className="h-4 w-4" /> Global Alignment Check
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-10">
            {/* Status Alert */}
            {!assignedHR ? (
              <Alert className="bg-slate-50 border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <Clock className="h-6 w-6 text-primary" />
                <AlertDescription className="text-slate-500 font-bold italic ml-4 text-sm">
                  Neural queue active. Waiting for HR Analyst assignment. You will be alerted via secure transmission once the uplink is established.
                </AlertDescription>
              </Alert>
            ) : isCompleted ? (
              <Alert className="bg-emerald-50 border-emerald-100 rounded-[2rem] p-8 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <AlertDescription className="text-emerald-700 font-bold italic ml-4 text-sm">
                  Final simulation complete! Evaluation dossier submitted for administrative confirmation. Results expected in current cycle.
                </AlertDescription>
              </Alert>
            ) : isScheduled ? (
              <Alert className="bg-primary/5 border-primary/10 rounded-[2rem] p-8 shadow-sm">
                <Calendar className="h-6 w-6 text-primary" />
                <AlertDescription className="text-primary font-bold italic ml-4 text-sm">
                  Uplink parameters synchronized. Your HR finalization session is scheduled in the proximal window.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-amber-50 border-amber-100 rounded-[2rem] p-8 shadow-sm">
                <Monitor className="h-6 w-6 text-amber-600" />
                <AlertDescription className="text-amber-700 font-bold italic ml-4 text-sm">
                  Strategic analyst assigned. Awaiting temporal window definition for session initialization.
                </AlertDescription>
              </Alert>
            )}

            {/* Main Interactive Card */}
            {isScheduled && myApplication?.meetingLink ? (
              <Card className="border-slate-200 shadow-xl rounded-[3rem] bg-white overflow-hidden border">
                <CardHeader className="p-10 pb-4 border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-900 italic">
                    <Video className="h-8 w-8 text-primary" />
                    Session Interface
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Live Virtual Command Protocol</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  {myApplication.scheduledDate && (
                    <div className="p-10 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
                      <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm mb-4">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Activation Time</p>
                      <p className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                        {format(new Date(myApplication.scheduledDate), 'dd MMM yyyy, HH:mm')}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full h-20 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-2xl shadow-primary/20 gap-4 group/btn transition-all active:scale-95"
                    onClick={() => window.open(myApplication.meetingLink, '_blank')}
                  >
                    LAUNCH NEURAL LINK <ExternalLink className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                  </Button>
                  <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Connect via Google Neural Transmission</p>
                </CardContent>
              </Card>
            ) : isCompleted && hrFeedback ? (
              <Card className="border-slate-200 shadow-xl rounded-[3rem] bg-white overflow-hidden border">
                <CardHeader className="p-10 pb-4 border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-900 italic">
                    <FileText className="h-8 w-8 text-indigo-600" />
                    Dossier Feedback
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Post-Simulation Analysis Results</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="flex items-center gap-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <div className="h-20 w-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-inner border border-slate-100">
                      <Star className="h-10 w-10 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Calibration Score</p>
                      <p className="text-4xl font-black text-slate-900 italic">{hrFeedback.rating}/5.0 <span className="text-sm text-slate-400 font-bold">ALPHA INDEX</span></p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                      <h4 className="font-black text-xs uppercase tracking-tight text-slate-900 italic mb-3">Analyst Observations</h4>
                      <p className="text-sm text-slate-500 font-bold italic leading-relaxed">"{hrFeedback.comments}"</p>
                    </div>

                    {hrFeedback.improvementAreas && hrFeedback.improvementAreas.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 italic">Calibration Deltas Identified</h4>
                        <div className="flex flex-wrap gap-2">
                          {hrFeedback.improvementAreas.map((area: string) => (
                            <Badge key={area} className="bg-white text-slate-600 border border-slate-100 font-bold text-[9px] uppercase px-4 py-2 rounded-xl shadow-none italic">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                      <h4 className="font-black text-sm uppercase text-slate-900 italic">Audit Recommendation</h4>
                      <Badge className={cn(
                        "font-black text-[10px] uppercase px-6 py-2 rounded-full shadow-lg italic",
                        hrFeedback.recommendation === 'Pass' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"
                      )}>
                        {hrFeedback.recommendation === 'Pass' ? 'APPROVED FOR DEPLOYMENT' : 'TRAJECTORY TERMINATED'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white p-20 flex flex-col items-center justify-center text-center space-y-8 border bg-slate-50/10">
                <div className="h-32 w-32 bg-white rounded-[2.5rem] shadow-inner flex items-center justify-center border border-slate-100 animate-pulse">
                  <Monitor className="h-16 w-16 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic">Awaiting Interface Data</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase italic tracking-widest">Protocol status: Queued for temporal assignment</p>
                </div>
              </Card>
            )}

            {/* Discussion Topics Card (Visible in all states) */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white p-10 border">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                  <Target className="h-6 w-6 text-amber-600" />
                </div>
                <h4 className="text-xl font-black uppercase text-slate-900 italic tracking-tighter">Engagement Spectrum</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  { topic: "Compensation Dynamics", desc: "Package structures & performance scalars" },
                  { topic: "Deployment Log", desc: "Notice periods & start window definition" },
                  { topic: "Culture Protocol", desc: "Value alignment & ecosystem synergy" },
                  { topic: "Growth Trajectory", desc: "Long-term operational scaling paths" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group cursor-default">
                    <div className="h-12 w-1 flex-shrink-0 bg-slate-100 group-hover:bg-primary transition-colors rounded-full" />
                    <div>
                      <p className="text-xs font-black uppercase text-slate-900 italic mb-1">{item.topic}</p>
                      <p className="text-[10px] font-bold text-slate-400 italic tracking-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-24">
            {/* Analyst Card */}
            {assignedHR && (
              <Card className="border-slate-200 shadow-xl rounded-[3rem] bg-white overflow-hidden border">
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 italic">Interface Node</h4>
                    <span className="flex items-center gap-2 text-emerald-500 font-black text-[8px] uppercase tracking-widest italic">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Analyst
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-tr from-primary/20 to-indigo-500/20 rounded-full blur-xl" />
                      <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-white shadow-xl relative z-10 transition-transform hover:scale-105 duration-500">
                        {assignedHR.avatar ? <AvatarImage src={assignedHR.avatar} /> : null}
                        <AvatarFallback className="text-2xl font-black bg-slate-50 text-slate-300">
                          {assignedHR.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{assignedHR.name}</h3>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest">{assignedHR.designation || 'Strategic HR Leader'}</p>
                    </div>
                  </div>
                  <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-300">
                    <div className="text-center group">
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Firm</p>
                      <p className="text-xs font-bold text-slate-600 italic">{assignedHR.company || 'Enterprise'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card className="border-none shadow-xl rounded-[3rem] bg-indigo-600 text-white p-10 overflow-hidden relative group">
              <Sparkles className="absolute -right-6 -top-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-6">
                <h4 className="text-xl font-black uppercase leading-tight italic tracking-tighter">Final Calibration</h4>
                <p className="text-white/70 text-xs font-bold leading-relaxed italic">This is the terminal simulation phase. Clarity in legacy and future vision is paramount for successful node transition.</p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic pt-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> System Confidence 99.8%
                </div>
              </div>
            </Card>

            <Button
              className="w-full h-16 rounded-[1.5rem] font-black uppercase text-xs tracking-widest border-2 border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-primary/30 transition-all group/back"
              onClick={() => navigate('/student/interviews')}
            >
              <ChevronRight className="h-5 w-5 mr-2 rotate-180 group-hover/back:-translate-x-1 transition-transform" /> Back to Matrix
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
