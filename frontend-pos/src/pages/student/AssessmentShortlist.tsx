import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services';
import {
  Clock, FileCheck, AlertCircle, TrendingUp,
  Target, Sparkles, CheckCircle2, ChevronRight,
  Info, ShieldCheck, BrainCircuit, Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AssessmentShortlist() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  const myApplication = applications.find(
    (app) => app.studentId === user?.id &&
      (app.status === 'assessment_submitted' || app.status === 'assessment_under_review')
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Assessment Status" subtitle="Synchronizing technical dossier...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="font-black text-slate-400 animate-pulse text-[10px] uppercase tracking-widest">Accessing Secure Records...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Assessment Submitted" subtitle="Calibration results currently under neural review">
      <div className="max-w-5xl mx-auto space-y-12 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Review Phase Active</h1>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary" /> Dossier Status: <span className="text-amber-500">PENDING AUDIT</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-primary/5 text-primary border border-primary/10 font-bold text-[10px] uppercase px-4 py-2 rounded-full shadow-none">MISSION_ID: {myApplication?.id?.slice(-8).toUpperCase() || 'EXTERNAL'}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-12">
            <Alert className="bg-slate-50 border-slate-200 rounded-[2rem] p-6 shadow-sm border">
              <Info className="h-5 w-5 text-primary" />
              <AlertDescription className="text-slate-500 font-bold ml-2">
                Your technical calibration data has been securely archived. Our lead auditors are currently analyzing your problem-solving patterns and architectural implementations.
              </AlertDescription>
            </Alert>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-slate-200 shadow-xl rounded-[3rem] bg-white overflow-hidden border">
              <CardHeader className="p-10 pb-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-900">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  Submission Archived
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Technical Protocol Successfully Terminalized</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 relative group transition-all">
                  <div className="h-24 w-24 rounded-[2rem] bg-white shadow-inner flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                    <FileCheck className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-black text-slate-900 uppercase">Synchronization Success</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">All technical metrics registered in secure buffer</p>
                  </div>
                </div>

                {myApplication && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Transmission Stamp</p>
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                        {myApplication.submittedAt && format(new Date(myApplication.submittedAt), 'dd MMM yyyy, HH:mm')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Pattern Intensity</p>
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                        {(myApplication.assessmentAnswers?.length || 0) + (myApplication.assessmentCode ? 2 : 0)}/7 METRICS REGISTERED
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Audit Status</p>
                      <Badge className="bg-amber-50 text-amber-600 border border-amber-100 font-black text-[9px] uppercase shadow-none rounded-lg px-3">
                        UNDER_AUDIT
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white p-8 border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">Trajectory Path</h4>
                </div>
                <ul className="space-y-4 list-none">
                  {[
                    "Lead Auditors review structural logic",
                    "Complexity & Approach Evaluation",
                    "AI Interview Initialization",
                    "Professional Round Scheduling"
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 group/item">
                      <div className="h-5 w-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-primary/30 transition-colors">
                        <span className="text-[9px] font-black text-slate-400 group-hover/item:text-primary transition-colors">{i + 1}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white p-8 border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">Optimization Suite</h4>
                </div>
                <p className="text-[11px] text-slate-400 font-bold mb-5">Prepare for next-gen evaluation nodes while results sync:</p>
                <div className="flex flex-wrap gap-2">
                  {["System Design", "Behavioral Logic", "Scale Dynamics", "Culture Fit"].map(tip => (
                    <Badge key={tip} variant="secondary" className="bg-slate-50 text-slate-500 border border-slate-100 font-bold text-[9px] uppercase px-3 py-1 animate-in fade-in zoom-in-95 duration-700 shadow-none rounded-lg">{tip}</Badge>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-24">
            <Card className="border-none shadow-xl rounded-[3rem] bg-indigo-600 text-white p-10 overflow-hidden relative group">
              <Sparkles className="absolute -right-6 -top-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase leading-tight tracking-tighter">Elite Readiness</h4>
                  <p className="text-white/70 text-xs font-bold leading-relaxed">System diagnostics show peak performance during the technical audit phase. Maintain calibration focus.</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Next Node Probability</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">High Confidence</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </Card>

            <Button
              className="w-full h-16 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all group/btn"
              onClick={() => navigate('/student/applications')}
            >
              Return to Command Center <ChevronRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>

            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white p-6 border text-center">
              <p className="text-[9px] font-black uppercase text-slate-300">Neural encrypted connection active • SHA-256</p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
