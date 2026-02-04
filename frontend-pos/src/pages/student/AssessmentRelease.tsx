import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services';
import {
  Clock, FileText, AlertCircle, Calendar,
  Zap, ShieldCheck, Target, Sparkles,
  ArrowRight, Info, Activity, Monitor,
  Lock, PlayCircle, Database, Code2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AssessmentRelease() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  const myApplication = applications.find(
    (app) => app.studentId === user?.id &&
      (app.status === 'assessment_released' || app.status === 'assessment_in_progress')
  );

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      applicationService.updateApplicationStatus(myApplication?.id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!myApplication?.assessmentDeadline) return;

    const updateTimer = () => {
      const now = new Date();
      const deadline = new Date(myApplication.assessmentDeadline!);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeftStr('EXPIRED');
        setProgress(0);
        return;
      }

      const totalTime = 2 * 24 * 60 * 60 * 1000; // 2 days in ms
      const elapsed = totalTime - diff;
      setProgress(Math.max(0, ((totalTime - elapsed) / totalTime) * 100));

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeftStr(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [myApplication?.assessmentDeadline]);

  const handleStartAssessment = () => {
    if (myApplication) {
      updateStatusMutation.mutate('assessment_in_progress');
      navigate(`/student/assessment/${myApplication.id || myApplication._id}`);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Calibration Protocol" subtitle="Initializing secure buffer...">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!myApplication) {
    return (
      <DashboardLayout title="Calibration Protocol" subtitle="Session Not Found">
        <div className="text-center py-24 space-y-6 flex flex-col items-center">
          <div className="h-24 w-24 bg-slate-100 rounded-[2rem] flex items-center justify-center border border-slate-200 shadow-inner group">
            <Lock className="h-10 w-10 text-slate-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No active assessment window detected</p>
          <Button variant="link" className="font-black text-primary uppercase text-[10px] tracking-widest" onClick={() => navigate('/student/applications')}>Return to Journey Map</Button>
        </div>
      </DashboardLayout>
    );
  }

  const isExpired = myApplication.assessmentDeadline && new Date(myApplication.assessmentDeadline) < new Date();

  return (
    <DashboardLayout title="Calibration Protocol" subtitle="Technical assessment window activated">
      <div className="max-w-[1000px] mx-auto space-y-10 pb-12">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Technical Calibration</h1>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
              <Monitor className="h-4 w-4 text-primary" /> System Readiness: <span className="text-emerald-500">OPTIMAL</span>
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-black text-[10px] uppercase tracking-widest shadow-sm">
            <Activity className="h-4 w-4 animate-pulse" /> High Stakes Active
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-7 space-y-8">
            <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white overflow-hidden relative group hover:shadow-md transition-all duration-500 border">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-blue-50/10 to-transparent opacity-50" />
              <CardContent className="p-10 space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                    <Clock className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Temporal Window</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Window Expiration</p>
                    <p className="text-4xl font-black tracking-tighter text-primary">{timeLeftStr}</p>
                  </div>
                  <Progress value={progress} className="h-3 rounded-full bg-slate-100 border border-slate-200 shadow-none" />
                  <p className="text-[10px] font-black text-slate-300 uppercase text-center tracking-widest pt-2">
                    Deadline Synchronized: {myApplication.assessmentDeadline && format(new Date(myApplication.assessmentDeadline), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white overflow-hidden border">
              <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-900">
                  <Info className="h-6 w-6 text-primary" /> Calibration Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:bg-white transition-all group/item duration-500">
                    <Database className="h-8 w-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="font-black text-xs uppercase mb-2 text-slate-900 tracking-tight">Knowledge Core</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">5 deep-dive conceptual patterns covering system design and core logic.</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:bg-white transition-all group/item duration-500">
                    <Code2 className="h-8 w-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
                    <h4 className="font-black text-xs uppercase mb-2 text-slate-900 tracking-tight">Algorithmic Load</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">2 complex code simulations to test structural implementation capacity.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-8 pt-10 border-t border-slate-100">
                  <div className="flex-1 space-y-2">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Simulation Time</p>
                    <p className="text-sm font-black uppercase text-slate-900 tracking-tighter">90 Minutes Fixed</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Success Threshold</p>
                    <p className="text-sm font-black uppercase text-emerald-600 tracking-tighter">60% Accuracy</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Activation Status</p>
                    <p className="text-sm font-black uppercase text-primary tracking-tighter">Live Buffer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-xl rounded-[3rem] bg-primary text-white p-12 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
              <Sparkles className="absolute -right-6 -top-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase leading-tight tracking-tighter">Initialize Protocol</h4>
                  <p className="text-white/70 text-sm font-bold leading-relaxed">Enter the technical simulation environment. Ensure a stable neural link and quiet operating zone.</p>
                </div>
                <Button
                  className="w-full h-20 rounded-[2rem] bg-white text-primary font-black text-xl shadow-2xl hover:bg-slate-50 gap-4 group/btn transition-all active:scale-95"
                  onClick={handleStartAssessment}
                  disabled={isExpired}
                >
                  {myApplication.status === 'assessment_in_progress' ? 'CONT. SIMULATION' : 'INITIATE CALIBRATION'} <PlayCircle className="h-7 w-7 group-hover/btn:scale-110 transition-transform" />
                </Button>
                <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Atomic submission enabled</p>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white p-10 border space-y-8">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 text-slate-900">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Secure Guidelines
              </h4>
              <ul className="space-y-6">
                {[
                  "Environment must remain isolated throughout simulation",
                  "Neural link must not be severed until final submission",
                  "Technical documentation query is permitted",
                  "Manual override not available post-activation"
                ].map((g, i) => (
                  <li key={i} className="flex gap-5 group/tip">
                    <span className="text-xs font-black text-primary/30 mt-0.5 group-hover/tip:text-primary transition-colors">{i + 1}</span>
                    <span className="text-xs font-bold text-slate-500 leading-snug">{g}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
