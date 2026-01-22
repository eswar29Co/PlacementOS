import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/store/hooks';
import { mockMCQQuestions, mockCodingQuestions } from '@/data/mockData';
import {
  Clock, ChevronLeft, ChevronRight, Code2,
  AlertCircle, Zap, ShieldCheck, PlayCircle,
  Database, Activity, Terminal, Send,
  Brain, Cpu, Target, Sparkles, AlertTriangle,
  Fingerprint, Command, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { canTakeAssessment } from '@/lib/flowHelpers';
import { useQuery, useMutation } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { jobService } from '@/services/jobService';
import { cn } from '@/lib/utils';

export default function TakeAssessment() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  // Fetch application
  const { data: applicationData, isLoading } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplicationById(applicationId!),
    enabled: !!applicationId,
  });
  const application = applicationData?.data;

  const jobId = typeof application?.jobId === 'string'
    ? application.jobId
    : (application?.jobId as any)?._id || (application?.jobId as any)?.id;

  const { user } = useAppSelector((state) => state.auth);

  const submitMutation = useMutation({
    mutationFn: (data: { applicationId: string; assessmentCode?: string; assessmentAnswers?: any[] }) =>
      applicationService.submitAssessment(data),
    onSuccess: () => {
      toast.success('Assessment submitted successfully.');
      navigate('/student/applications');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Submission failed');
    },
  });

  useEffect(() => {
    if (application && !canTakeAssessment(application.status)) {
      toast.error('Assessment session expired or inactive');
      navigate('/student/applications');
    }
  }, [application]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [code, setCode] = useState('// Write your solution here\n\nfunction solution(input) {\n  // Your code here\n}');
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [showSubmit, setShowSubmit] = useState(false);
  const [output, setOutput] = useState('');

  const totalQuestions = mockMCQQuestions.length + mockCodingQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const isCodingQuestion = currentQuestion >= mockMCQQuestions.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const runCode = () => {
    setOutput('Testing your code...\n\nTest Case 01: Passed [✓]\nTest Case 02: Passed [✓]\n\nAll tests passed.');
    toast.success('Code executed successfully');
  };

  const handleSubmit = () => {
    if (!application) return;
    submitMutation.mutate({
      applicationId: (application as any)._id || (application as any).id,
      assessmentCode: code,
      assessmentAnswers: Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent animate-spin rounded-2xl shadow-xl shadow-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse italic">Starting Assessment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary selection:text-white overflow-x-hidden font-sans relative">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Cinematic Tactical Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-slate-200 h-24">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-primary rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500" />
              <div className="relative h-12 w-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm transition-transform group-hover:rotate-6">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">ONLINE <span className="text-primary">ASSESSMENT</span></h1>
              <div className="flex items-center gap-3">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">ASSESSMENT ID: {applicationId?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="hidden xl:flex flex-col items-end">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">Assessment Progress</p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-900">{Math.round(progress)}%</span>
                <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className={cn(
              "relative px-8 py-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4 group transition-all duration-500",
              timeLeft < 300 ? "border-rose-500/30 bg-rose-50 animate-pulse" : ""
            )}>
              <Clock className={cn("h-5 w-5", timeLeft < 300 ? "text-rose-500" : "text-primary")} />
              <span className={cn(
                "font-mono text-2xl font-black tracking-tighter",
                timeLeft < 300 ? "text-rose-500" : "text-slate-900"
              )}>
                {formatTime(timeLeft)}
              </span>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-ping opacity-75" />
            </div>

            <Button
              className="h-14 px-8 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-rose-600/20 group"
              onClick={() => setShowSubmit(true)}
            >
              FINISH & SUBMIT <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Simulation Workspace */}
      <main className="relative z-10 pt-40 pb-40 px-10">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Sequence Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                  CURRENT SECTION: <span className="text-slate-900">{isCodingQuestion ? 'CODING' : 'MCQ'}</span>
                </p>
              </div>
            </div>
            <div className="px-6 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">
                QUESTION <span className="text-slate-900 text-sm mx-1 not-italic">{currentQuestion + 1}</span> OF <span className="text-slate-400 text-sm ml-1 not-italic">{totalQuestions}</span>
              </p>
            </div>
          </div>

          {!isCodingQuestion ? (
            <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white overflow-hidden border relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <CardHeader className="p-12 lg:p-16 pb-8">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 border border-indigo-100 shadow-sm transition-transform hover:rotate-6">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl lg:text-3xl font-black leading-tight text-slate-900 uppercase italic tracking-tight">
                    {mockMCQQuestions[currentQuestion]?.question}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-12 lg:p-16 pt-0">
                <RadioGroup
                  value={answers[currentQuestion.toString()] || ''}
                  onValueChange={(v) => setAnswers({ ...answers, [currentQuestion.toString()]: v })}
                  className="grid gap-6"
                >
                  {mockMCQQuestions[currentQuestion]?.options.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => setAnswers({ ...answers, [currentQuestion.toString()]: i.toString() })}
                      className={cn(
                        "group relative flex items-center space-x-6 rounded-[2rem] border p-8 cursor-pointer transition-all duration-500 hover:scale-[1.01] hover:border-primary/30",
                        answers[currentQuestion.toString()] === i.toString()
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                          : "border-slate-100 bg-slate-50 hover:bg-white"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                        answers[currentQuestion.toString()] === i.toString()
                          ? "border-primary bg-primary"
                          : "border-slate-200 group-hover:border-primary/50 bg-white"
                      )}>
                        {answers[currentQuestion.toString()] === i.toString() && <div className="h-2 w-2 rounded-full bg-white shadow-xl" />}
                      </div>
                      <Label className="flex-1 cursor-pointer font-bold text-lg text-slate-600 group-hover:text-slate-900 transition-colors italic">
                        {opt}
                      </Label>
                      {answers[currentQuestion.toString()] === i.toString() && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-300">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
              {/* Problem Architecture */}
              <Card className="border-slate-200 shadow-sm rounded-[3.5rem] bg-white border overflow-hidden">
                <CardHeader className="p-12 lg:p-16 pb-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 bg-amber-50 rounded-2.5xl flex items-center justify-center border border-amber-100 shadow-sm transition-transform hover:rotate-6">
                        <Terminal className="h-7 w-7 text-amber-500" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                          {mockCodingQuestions[0].title}
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Difficulty</span>
                          <Badge className="bg-amber-50 text-amber-600 border border-amber-200 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-none">
                            {mockCodingQuestions[0].difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Cpu className="h-10 w-10 text-primary/5 opacity-50" />
                  </div>
                </CardHeader>
                <CardContent className="p-12 lg:p-16 pt-0 space-y-12">
                  <p className="text-slate-500 font-bold text-lg leading-relaxed italic">{mockCodingQuestions[0].description}</p>
                  <div className="grid gap-6">
                    {mockCodingQuestions[0].examples.map((ex, i) => (
                      <div key={i} className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-transparent rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="relative bg-slate-50 rounded-[2rem] p-10 font-mono text-[11px] border border-slate-100 space-y-4">
                          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
                            <Fingerprint className="h-4 w-4 text-slate-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Example Case 0{i + 1}</span>
                          </div>
                          <div className="flex gap-10">
                            <p className="flex-1"><span className="text-primary font-black uppercase tracking-widest mr-4">INPUT:</span> <span className="text-slate-700 font-black italic">{ex.input}</span></p>
                            <p className="flex-1"><span className="text-emerald-600 font-black uppercase tracking-widest mr-4">OUTPUT:</span> <span className="text-emerald-500 font-black italic">{ex.output}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Logic Synthesis Workspace */}
              <Card className="border-slate-200 shadow-sm rounded-[3.5rem] overflow-hidden bg-white border">
                <CardHeader className="p-12 pb-6 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4 italic text-[11px]">
                      <Code2 className="h-6 w-6 text-primary" /> Code Editor
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-0">
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-50 border-r border-slate-100 flex flex-col items-center pt-8 gap-4 text-[10px] font-mono text-slate-300 leading-6 cursor-default select-none">
                      {Array.from({ length: 20 }).map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                    <Textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="font-mono min-h-[500px] text-sm bg-transparent border-none rounded-none p-10 pl-20 focus-visible:ring-0 text-slate-700 shadow-inner resize-none leading-relaxed placeholder:text-slate-200 italic"
                    />

                    <div className="absolute right-10 bottom-10 flex gap-4">
                      <Button
                        variant="outline"
                        className="h-14 px-8 rounded-2xl bg-white border-slate-200 hover:bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-widest gap-3 shadow-md"
                        onClick={runCode}
                      >
                        <PlayCircle className="h-5 w-5 text-primary" /> RUN CODE
                      </Button>
                    </div>
                  </div>

                  {output && (
                    <div className="p-12 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Code Output</span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                      </div>
                      <div className="bg-white rounded-2.5xl p-10 font-mono text-[11px] text-slate-500 border border-slate-200 shadow-inner leading-loose italic">
                        {output}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Persistence Interface (Footer) */}
      <footer className="fixed bottom-0 left-0 right-0 h-28 bg-white/90 backdrop-blur-3xl border-t border-slate-200 px-10 z-50">
        <div className="max-w-[1600px] mx-auto h-full flex justify-between items-center">
          <Button
            variant="ghost"
            className="h-16 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-primary transition-all flex items-center gap-4 group italic border border-transparent hover:border-slate-100"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> PREVIOUS
          </Button>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 px-6 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              <ShieldCheck className="h-4 w-4 text-primary" /> Secure Test Mode
            </div>
            <Button
              className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 flex items-center gap-4 group/btn transition-all duration-300"
              onClick={() => {
                if (currentQuestion === totalQuestions - 1) {
                  setShowSubmit(true);
                } else {
                  setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1));
                }
              }}
            >
              {currentQuestion === totalQuestions - 1 ? 'FINISH' : 'NEXT'}
              <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </footer>

      {/* Filing Dialog */}
      <AlertDialog open={showSubmit} onOpenChange={setShowSubmit}>
        <AlertDialogContent className="bg-white border border-slate-200 rounded-[3.5rem] p-16 max-w-xl shadow-2xl">
          <AlertDialogHeader className="space-y-8">
            <div className="relative mx-auto">
              <div className="absolute -inset-4 bg-rose-500 rounded-3xl blur opacity-10 animate-pulse" />
              <div className="relative h-24 w-24 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm transition-transform hover:rotate-12">
                <AlertTriangle className="h-12 w-12" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">SUBMIT ASSESSMENT?</AlertDialogTitle>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] italic">Final Submission</p>
            </div>
            <AlertDialogDescription className="text-slate-400 font-bold text-base text-center leading-relaxed italic">
              Once you submit your assessment, you will not be able to change your answers. This action is <span className="text-slate-900 italic underline">IRREVERSIBLE</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-6 mt-12">
            <AlertDialogCancel className="h-16 flex-1 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-none">
              BACK TO TEST
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="h-16 flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              CONFIRM SUBMIT
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
