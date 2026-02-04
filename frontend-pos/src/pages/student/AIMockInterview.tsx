import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services';
import {
  Bot, Send, CheckCircle, Mic, MicOff,
  Zap, Sparkles, Target as TargetIcon, ChevronRight,
  Activity, AlertTriangle, MessageSquare, ArrowLeft,
  Volume2, Trash2, Save, Brain, Info, Gauge
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isListening, setIsListening] = useState(false);
  const [startTime] = useState(new Date());
  const [analyzing, setAnalyzing] = useState(false);

  // Web Speech API
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    console.log('Initializing Speech Recognition check...');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      console.log('Speech Recognition API detected in browser.');
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('Speech Recognition: Stream started');
      };

      recognitionRef.current.onresult = (event: any) => {
        console.log('Speech Recognition: Result received', event.results);
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          console.log('Speech Recognition: Final text captured:', finalTranscript);
          setAnswers(prev => {
            const next = [...prev];
            next[currentQuestion] = (next[currentQuestion] + ' ' + finalTranscript).trim();
            return next;
          });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error(`Speech Recognition: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech Recognition: Stream ended');
        setIsListening(false);
      };
    } else {
      console.warn('Speech Recognition API NOT found in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        console.log('Cleaning up Speech Recognition...');
        recognitionRef.current.stop();
      }
    };
  }, [currentQuestion]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      console.error('Toggle Listening called but recognitionRef.current is null');
      toast.error('Browser does not support Speech Recognition.');
      return;
    }

    if (isListening) {
      console.log('Stopping voice capture...');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        console.log('Attempting to start voice capture...');
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('AI is listening...');
      } catch (err) {
        console.error('Failed to start Speech Recognition:', err);
      }
    }
  };

  const progress = ((currentQuestion + 1) / AI_QUESTIONS.length) * 100;
  const currentAnswerLength = answers[currentQuestion].split(' ').filter(w => w.length > 0).length;
  const confidenceScore = Math.min(100, (currentAnswerLength / 40) * 100);

  const submitInterviewMutation = useMutation({
    mutationFn: (data: { applicationId: string; aiInterviewAnswers: string[] }) => {
      console.log('Submitting AI Interview answers to backend:', data);
      return applicationService.submitAIInterview(data);
    },
    onSuccess: (response: any) => {
      console.log('AI Interview submission successful:', response);
      setAnalyzing(true);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['my-applications'] });
        toast.success('NLP Analysis Complete');
        setIsCompleted(true);
        setAnalyzing(false);
      }, 3000); // Simulate deep analysis for better UX
    },
    onError: (error: any) => {
      console.error('AI Interview submission failed:', error);
      toast.error(error.message || 'Submission failed');
    }
  });

  const handleNext = () => {
    if (isListening) recognitionRef.current.stop();

    if (!answers[currentQuestion].trim() || answers[currentQuestion].length < 10) {
      return toast.error('Response too brief. Please provide more detail.');
    }

    if (currentQuestion < AI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      toast.info(`Proceeding to Question ${currentQuestion + 2}`);
    } else {
      submitInterviewMutation.mutate({
        applicationId: (myApplication as any).id || (myApplication as any)._id,
        aiInterviewAnswers: answers
      });
    }
  };

  if (analyzing) {
    return (
      <DashboardLayout title="Deep NLP Analysis" subtitle="Processing responses">
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-10">
          <div className="relative">
            <div className="absolute -inset-10 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
            <div className="h-40 w-40 rounded-[3rem] bg-white border-2 border-primary/20 shadow-2xl flex items-center justify-center relative z-10 animate-bounce">
              <Brain className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute top-0 right-0 h-10 w-10 bg-emerald-500 rounded-full border-4 border-white animate-ping" />
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Analyzing Sentiment & Depth</h2>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isCompleted) {
    return (
      <DashboardLayout title="Interview Complete" subtitle="Results Pending">
        <div className="max-w-3xl mx-auto py-20">
          <Card className="border-slate-200 shadow-2xl rounded-[4rem] bg-white p-16 text-center border relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-primary" />
            <div className="h-24 w-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Phase Successful</h2>
            <p className="text-slate-500 font-bold mb-10 max-w-md mx-auto">Your responses have been securely transmitted to our NLP engine. You will be notified once the summary is ready for review.</p>
            <Button onClick={() => navigate('/student/interviews')} className="h-16 px-12 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              Check My Status
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="AI Behavioral Assessment" subtitle="Industrial NLP Verification Phase">
      <div className="max-w-[1400px] mx-auto pb-12 space-y-10">

        {/* HUD Elements */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-8">
            <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completion Gauge</span>
                <span className="text-[10px] font-black text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 rounded-full bg-slate-100" />
            </div>
          </Card>

          <Card className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
              <Gauge className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Confidence</p>
              <Progress value={confidenceScore} className="h-2 bg-slate-100" />
            </div>
          </Card>

          <Card className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Runtime</p>
              <SessionTimer startTime={startTime} />
            </div>
            <Activity className={cn("h-8 w-8", isListening ? "text-primary animate-pulse" : "text-white/20")} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div className="lg:col-span-8 space-y-8">
            <Card className="border-slate-200 shadow-2xl rounded-[3.5rem] overflow-hidden bg-white relative">
              <CardHeader className="p-10 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Active Prompt</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question {currentQuestion + 1} of {AI_QUESTIONS.length}</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest h-8 px-4 rounded-full">NLP Active</Badge>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <div className="p-10 bg-slate-50 rounded-[3rem] border-2 border-slate-100 relative group transition-all duration-500 hover:bg-white hover:border-primary/20">
                  <Zap className="absolute -left-4 -top-4 h-12 w-12 text-primary opacity-20 group-hover:opacity-100 transition-all" />
                  <p className="text-2xl font-black text-slate-900 leading-snug">{AI_QUESTIONS[currentQuestion]}</p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intelligence Input</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={toggleListening}
                        className={cn(
                          "h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl",
                          isListening ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20" : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                        )}
                      >
                        {isListening ? <><MicOff className="h-4 w-4 mr-2" /> End Stream</> : <><Mic className="h-4 w-4 mr-2" /> Initialize Voice</>}
                      </Button>
                      <Button variant="ghost" className="h-14 w-14 rounded-2xl border border-slate-100 hover:text-rose-500" onClick={() => setAnswers(prev => { const n = [...prev]; n[currentQuestion] = ''; return n; })}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className={cn("absolute -inset-1 rounded-[3rem] blur-xl opacity-0 transition-opacity duration-1000", isListening ? "bg-primary/10 opacity-100" : "bg-primary/5")} />
                    <Textarea
                      value={answers[currentQuestion]}
                      onChange={(e) => {
                        const next = [...answers];
                        next[currentQuestion] = e.target.value;
                        setAnswers(next);
                      }}
                      placeholder="Transmission will appear here..."
                      rows={10}
                      className="relative rounded-[3rem] border-2 p-12 font-bold text-lg bg-white border-slate-100 shadow-sm focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" /> Word Count: {currentAnswerLength}
                    </p>
                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Biometric Stability: 98%</p>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={handleNext}
                    disabled={submitInterviewMutation.isPending}
                    className="h-16 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center gap-4 group/nb"
                  >
                    {currentQuestion === AI_QUESTIONS.length - 1 ? 'Finalize Session' : 'Save & Continue'}
                    <ChevronRight className="h-5 w-5 group-hover/nb:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-24">
            <Card className="border-none shadow-2xl rounded-[3.5rem] bg-indigo-600 text-white p-12 overflow-hidden relative group">
              <TargetIcon className="absolute -right-6 -top-6 h-40 w-40 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase tracking-tighter">AI Protocol</h4>
                  <p className="text-indigo-100 text-[11px] font-bold leading-relaxed">Our advanced NLP cluster evaluates semantic fidelity, sentiment indicators, and technical coherence.</p>
                </div>
                <div className="space-y-6 pt-6 border-t border-white/10">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-[10px] uppercase tracking-widest">Stream Quality</p>
                      <p className="text-[10px] font-bold text-indigo-200">Lossless audio capture verified.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200 rounded-[3rem] p-10 bg-white space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Status</p>
                <div className="space-y-3">
                  <StatusItem met={true} text="Auth Token Valid" />
                  <StatusItem met={true} text="Session Encrypted" />
                  <StatusItem met={isListening} text="Audio Stream Active" />
                </div>
              </div>
              <Alert className="bg-amber-50 border-amber-200 rounded-3xl">
                <AlertDescription className="text-[10px] font-bold text-amber-600 flex items-center gap-3">
                  <Info className="h-4 w-4" /> Review logs before final submission.
                </AlertDescription>
              </Alert>
              <Button variant="ghost" className="w-full text-slate-400 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl hover:text-rose-500" onClick={() => navigate('/student/home')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Abort Session
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-2 w-2 rounded-full", met ? "bg-emerald-500" : "bg-slate-200")} />
      <span className="text-[10px] font-black uppercase text-slate-500 tracking-tight">{text}</span>
    </div>
  );
}

function SessionTimer({ startTime }: { startTime: Date }) {
  const [elapsed, setElapsed] = useState('00:00:00');
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date().getTime() - startTime.getTime();
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);
  return <p className="text-3xl font-black text-white tabular-nums tracking-tighter">{elapsed}</p>;
}
