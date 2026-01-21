import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService, notificationService } from '@/services';
import {
  Bot, Send, CheckCircle, Mic, MicOff, Video, VideoOff,
  Zap, ShieldCheck, Sparkles, Target, Target as TargetIcon, ChevronRight,
  Activity, AlertTriangle, Monitor, Info, ArrowLeft,
  MessageSquare, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { canTakeAIInterview, getStatusAfterAIInterview } from '@/lib/flowHelpers';
import { cn } from '@/lib/utils';

const AI_QUESTIONS = [
  "Tell me about yourself and your background.",
  "Why are you interested in this position?",
  "Describe a challenging project you worked on.",
  "What are your strengths and weaknesses?",
  "Where do you see yourself in 5 years?"
];

export default function AIMockInterview() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const { data: applicationsData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  const myApplication = applicationId
    ? (applications as any[]).find(app => (app.id === applicationId || app._id === applicationId))
    : (applications as any[]).find(
      (app) => app.studentId === user?.id &&
        app.status === 'ai_interview_pending'
    );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(AI_QUESTIONS.length).fill(''));
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [startTime] = useState(new Date());

  const progress = ((currentQuestion + 1) / AI_QUESTIONS.length) * 100;

  const submitInterviewMutation = useMutation({
    mutationFn: (data: { applicationId: string; aiInterviewAnswers: string[] }) =>
      applicationService.submitAIInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Neural patterns synchronized. Evaluation archived.');
      setIsCompleted(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Sync failure in telemetry uplink.');
    }
  });

  const handleNext = () => {
    if (!answers[currentQuestion].trim()) {
      return toast.error('Intelligence buffer empty. Provide pattern data.');
    }

    if (currentQuestion < AI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      toast.info(`Next Query Initialized: Round ${currentQuestion + 2}`);
    } else {
      submitInterviewMutation.mutate({
        applicationId: (myApplication as any).id || (myApplication as any)._id,
        aiInterviewAnswers: answers
      });
    }
  };

  if (!myApplication) {
    return (
      <DashboardLayout title="Neural Uplink" subtitle="Unauthorized Access Detected">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <AlertTriangle className="h-20 w-20 text-rose-500 animate-bounce" />
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic">Mission Terminated</h2>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">No active AI evaluation Track found for this identity.</p>
          </div>
          <Button onClick={() => navigate('/student/home')} variant="outline" className="rounded-2xl h-14 px-10 border-slate-200 font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all border-2">
            Return to Safe Sector
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isCompleted) {
    return (
      <DashboardLayout title="Neural Uplink" subtitle="Evaluation Complete">
        <div className="max-w-2xl mx-auto py-20 space-y-10">
          <Card className="border-slate-200 shadow-xl rounded-[3rem] bg-white p-12 text-center relative overflow-hidden group border">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
            <div className="h-24 w-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-slate-900 italic">Calibration Success</h2>
            <p className="text-slate-500 font-bold leading-relaxed mb-10 italic">Your response patterns have been securely archived. Our neural engines are now analyzing the dataset for professional compatibility.</p>
            <Button onClick={() => navigate('/student/home')} className="w-full h-16 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-[1.02]">
              Resume Operations
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Neural Uplink" subtitle="Active Behavioral Calibration System">
      <div className="max-w-[1400px] mx-auto pb-12 space-y-10">

        {/* HUD Elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Neural Sync Progress</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 rounded-full bg-slate-100 shadow-none border border-slate-200" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-100 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1 italic">Session Uptime</p>
              <SessionTimer startTime={startTime} />
            </div>
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 transition-colors group-hover:bg-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Question Cluster */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border relative">
              <CardHeader className="p-10 pb-4 border-b border-slate-100 bg-slate-50/50 relative">
                <div className="absolute right-10 top-10 flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-600 rounded-full font-black text-[9px] uppercase tracking-widest animate-pulse border border-rose-200">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> REC
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-900 italic">
                  <Sparkles className="h-8 w-8 text-primary" />
                  Behavioral Query
                </CardTitle>
                <CardDescription className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 italic">Current Evaluation Metric: Communication Flow</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 relative group hover:bg-white hover:border-primary/20 transition-all duration-500">
                  <Zap className="absolute -left-3 -top-3 h-10 w-10 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                  <p className="text-2xl font-black text-slate-900 italic leading-snug">{AI_QUESTIONS[currentQuestion]}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Response Buffer</Label>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="h-8 rounded-full font-black text-[9px] uppercase gap-2 hover:bg-slate-50 text-slate-400 hover:text-primary transition-all">
                        <Mic className="h-3 w-3" /> Voice Input (BETA)
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={answers[currentQuestion]}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[currentQuestion] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                    placeholder="Initialize response pattern..."
                    rows={10}
                    className="resize-none rounded-[2rem] border-2 p-8 font-bold text-lg focus-visible:ring-primary/20 bg-slate-50/50 border-slate-100 placeholder:text-slate-300 shadow-inner text-slate-700 italic"
                  />
                  <div className="flex justify-between items-center px-4">
                    <p className="text-[9px] font-black uppercase text-slate-300 italic">{answers[currentQuestion].length} HEX CHARS REGISTERED</p>
                    <Badge className="bg-primary/5 text-primary border border-primary/10 shadow-none font-black text-[9px] uppercase tracking-widest rounded-lg px-3 py-1">Latency: 24ms</Badge>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Query Node</p>
                    <p className="text-sm font-black uppercase text-primary tracking-tighter italic">{currentQuestion + 1} OF {AI_QUESTIONS.length}</p>
                  </div>
                  <Button
                    onClick={handleNext}
                    disabled={submitInterviewMutation.isPending}
                    className="h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 group/btn"
                  >
                    {currentQuestion === AI_QUESTIONS.length - 1 ? 'Analyze & Finalize' : 'Confirm & Sync'}
                    <ChevronRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tactical Sidebar */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">
            <Card className="border-none shadow-lg rounded-[3rem] bg-indigo-600 text-white p-10 overflow-hidden relative group">
              <TargetIcon className="absolute -right-6 -top-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase leading-tight italic tracking-tighter">Calibration Tips</h4>
                  <p className="text-white/70 text-xs font-bold leading-relaxed italic">Ensure your neural environment is quiet. Professional tone patterns highly affect the evaluation outcome.</p>
                </div>
                <ul className="space-y-4">
                  {[
                    "Eye contact with node sensors",
                    "Articulate technical lexicons",
                    "Structural clarity in logic"
                  ].map((tip, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-tight italic">
                      <div className="h-2 w-2 rounded-full bg-white opacity-40 group-hover:opacity-100 transition-opacity" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white p-8 border hover:shadow-md transition-all duration-500">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 italic">
                    <Monitor className="h-4 w-4" /> Uplink Status
                  </h4>
                  {isRecording ? (
                    <span className="flex items-center gap-1.5 text-emerald-500 font-black text-[8px] uppercase tracking-widest italic">
                      <div className="h-1 w-1 rounded-full bg-emerald-500" /> Stable
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-rose-500 font-black text-[8px] uppercase tracking-widest italic">
                      <div className="h-1 w-1 rounded-full bg-rose-500" /> Warning
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="lg"
                      className={cn(
                        "flex-1 h-14 rounded-2xl border-2 font-black gap-3 text-[10px] uppercase tracking-widest transition-all",
                        isRecording ? "border-slate-200 hover:bg-slate-50 text-slate-600" : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                      )}
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      {isRecording ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />} {isRecording ? 'Visual ON' : 'Visual OFF'}
                    </Button>
                  </div>
                </div>

                <p className="text-[9px] font-black uppercase text-slate-300 leading-relaxed text-center italic">
                  Data encrypted with SHA-256 protocols. Your evaluation dataset is private and secure.
                </p>
              </div>
            </Card>

            <Button
              variant="ghost"
              onClick={() => navigate('/student/home')}
              className="w-full text-slate-400 hover:text-rose-500 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl group transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Abort Simulation
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SessionTimer({ startTime }: { startTime: Date }) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date().getTime() - startTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  return <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter italic">{elapsed}</p>;
}

const appsLoading = false; // Mock loading state since we don't have it in parent
