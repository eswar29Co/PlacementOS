import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import {
  Clock, FileCheck, AlertCircle, Target,
  Sparkles, CheckCircle2, ChevronRight,
  Info, ShieldCheck, Activity, Monitor,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ResumeShortlist() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Fetch applications from MongoDB
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationService.getMyApplications,
  });
  const applications = applicationsData?.data || [];

  const myApplication = applications.find(
    (app) => app.studentId === user?.id &&
      (app.status === 'applied' || app.status === 'resume_under_review')
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Resume Status" subtitle="Synchronizing professional trajectory...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="font-black text-slate-400 animate-pulse text-[10px] uppercase tracking-widest">Accessing Secure Records...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Resume Review" subtitle="Primary dossier currently under administrative audit">
      <div className="max-w-5xl mx-auto space-y-12 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Screening Phase Active</h1>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary" /> Dossier Status: <span className="text-amber-500">RESUME_SCREENING</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-primary/5 text-primary border border-primary/10 font-bold text-[10px] uppercase px-4 py-2 rounded-full shadow-none">MISSION_ID: {myApplication?.id?.slice(-8).toUpperCase() || 'EXTERNAL'}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <Alert className="bg-slate-50 border-slate-200 rounded-[2rem] p-6 shadow-sm">
              <Info className="h-5 w-5 text-primary" />
              <AlertDescription className="text-slate-500 font-bold ml-2">
                Your primary application dossier is being scrutinized by our administrative auditors. High-fidelity skill alignment is currently being verified for technical compatibility.
              </AlertDescription>
            </Alert>

            <Card className="border-slate-200 shadow-xl rounded-[3rem] bg-white overflow-hidden border">
              <CardHeader className="p-10 pb-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-900">
                  <Clock className="h-8 w-8 text-amber-500" />
                  Audit in Progress
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Temporal Verification Cycle Active</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="flex flex-col items-center justify-center p-16 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 relative group transition-all">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <Loader2 className="h-20 w-20 text-primary animate-spin relative z-10" />
                  </div>
                  <div className="text-center space-y-2 mt-8">
                    <p className="text-2xl font-black text-slate-900 uppercase">Verification Pending</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Temporal window: 24-48 business hours for synchronization</p>
                  </div>
                </div>

                {myApplication && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Dossier ID</p>
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tighter font-mono">{myApplication.id.slice(0, 12).toUpperCase()}...</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Deployment Time</p>
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                        {format(new Date(myApplication.appliedAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Current Buffer</p>
                      <Badge className="bg-amber-50 text-amber-600 border border-amber-100 font-black text-[9px] uppercase shadow-none rounded-lg px-3">
                        SCREENING_LIVE
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white p-10 border">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <FileCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Mission Sequence</h4>
              </div>
              <ul className="space-y-6">
                {[
                  "Admin audit of technical specifications & certifications",
                  "Release of High-Stakes Technical Calibration (Assessment)",
                  "48-hour temporal window for completion post-activation",
                  "Transition to AI and Professional Interview nodes"
                ].map((step, i) => (
                  <li key={i} className="flex gap-5 group/item">
                    <div className="h-6 w-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-primary/30 transition-colors">
                      <span className="text-[10px] font-black text-slate-400 group-hover/item:text-primary transition-colors">{i + 1}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-24">
            <Card className="border-none shadow-xl rounded-[3rem] bg-indigo-600 text-white p-10 overflow-hidden relative group">
              <Sparkles className="absolute -right-6 -top-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-6">
                <h4 className="text-xl font-black uppercase leading-tight tracking-tighter">Primary Trajectory</h4>
                <p className="text-white/70 text-xs font-bold leading-relaxed">Your dossier is currently in the elite screening queue. High-compatibility profiles move to technical calibration within 2 cycles.</p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest pt-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> System Uptime: 99.9%
                </div>
              </div>
            </Card>

            <Button
              className="w-full h-16 rounded-[1.5rem] font-black uppercase text-xs tracking-widest border-2 border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-primary/30 transition-all group/back"
              onClick={() => navigate('/student/applications')}
            >
              <ChevronRight className="h-5 w-5 mr-2 rotate-180 group-hover/back:-translate-x-1 transition-transform" /> Market Matrix
            </Button>

            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white p-6 border text-center">
              <p className="text-[9px] font-black uppercase text-slate-300">Dossier encrypted with RSA-4096 protocols</p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
