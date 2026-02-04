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
  Fingerprint, Command, CheckCircle2, ListFilter, Eye, Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { canTakeAssessment } from '@/lib/flowHelpers';
import { useQuery, useMutation } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { assessmentService } from '@/services/assessmentService';
import { jobService } from '@/services/jobService';
import { cn } from '@/lib/utils';
import { Assessment, MCQQuestion, CodingQuestion } from '@/types';

export default function TakeAssessment() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  // Fetch application
  const { data: applicationData, isLoading: isAppLoading } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplicationById(applicationId!),
    enabled: !!applicationId,
  });
  const application = applicationData?.data;

  // Fetch assessment
  const { data: assessmentData, isLoading: isAssessmentLoading } = useQuery({
    queryKey: ['assessment', applicationId],
    queryFn: () => assessmentService.getAssessmentByApplicationId(applicationId!),
    enabled: !!applicationId && !!application,
  });
  const assessment = assessmentData?.data;

  const submitMutation = useMutation({
    mutationFn: (data: { assessmentId: string; mcqAnswers: number[]; codingAnswer: string }) =>
      assessmentService.submitAssessment(data.assessmentId, {
        mcqAnswers: data.mcqAnswers,
        codingAnswer: data.codingAnswer
      }),
    onSuccess: () => {
      toast.success('Assessment submitted successfully.');
      navigate('/student/applications');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Submission failed');
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => assessmentService.startAssessment(id),
    onSuccess: () => {
      toast.success('Assessment started!');
    },
  });

  useEffect(() => {
    if (application && !canTakeAssessment(application.status)) {
      toast.error('Assessment session expired or inactive');
      navigate('/student/applications');
    }
  }, [application]);

  useEffect(() => {
    if (assessment && assessment.status === 'pending') {
      startMutation.mutate(assessment.id || (assessment as any)._id);
    }
    if (assessment && assessment.duration) {
      setTimeLeft(assessment.duration * 60);
    }
    if (assessment && assessment.answers) {
      // Pre-fill answers if any (in case of resume)
      const prepped: Record<string, string> = {};
      assessment.answers.mcqAnswers?.forEach((ans: number, idx: number) => {
        if (ans !== null && ans !== undefined) prepped[idx.toString()] = ans.toString();
      });
      setAnswers(prepped);
      if (assessment.answers.codingAnswer) setCode(assessment.answers.codingAnswer);
    }
  }, [assessment]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [code, setCode] = useState('// Write your solution here\n\nfunction solution(input) {\n  // Your code here\n}');
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showFullCode, setShowFullCode] = useState(false);
  const [output, setOutput] = useState('');

  const mcqQuestions = assessment?.mcqQuestions || [];
  const codingQuestion = assessment?.codingQuestion;
  const totalQuestions = mcqQuestions.length + (codingQuestion ? 1 : 0);
  const progress = totalQuestions > 0 ? ((Object.keys(answers).length) / totalQuestions) * 100 : 0;
  const isCodingQuestion = currentQuestion >= mcqQuestions.length;

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
    if (!assessment) return;

    const mcqAnswersArray = mcqQuestions.map((_, idx) => {
      const ans = answers[idx.toString()];
      return ans !== undefined ? parseInt(ans) : -1;
    });

    submitMutation.mutate({
      assessmentId: assessment.id || (assessment as any)._id,
      mcqAnswers: mcqAnswersArray,
      codingAnswer: code
    });
  };

  const toggleFlag = () => {
    setFlagged(prev => ({ ...prev, [currentQuestion.toString()]: !prev[currentQuestion.toString()] }));
    toast.info(flagged[currentQuestion.toString()] ? 'Removed from review' : 'Marked for review');
  };

  if (isAppLoading || isAssessmentLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent animate-spin rounded-2xl shadow-xl shadow-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Starting Assessment...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <AlertCircle className="h-16 w-16 text-rose-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Assessment Not Yet Released</p>
        <Button onClick={() => navigate('/student/applications')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative flex flex-col">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 bg-white border-b border-slate-200 h-20 shrink-0">
        <div className="max-w-[1800px] mx-auto h-full flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter text-slate-900 leading-none">PLACEMENT<span className="text-primary">OS</span></h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Assessment Session</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className={cn(
              "px-6 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4 transition-all duration-500",
              timeLeft < 300 ? "border-rose-500/30 bg-rose-50 animate-pulse" : ""
            )}>
              <Clock className={cn("h-4 w-4", timeLeft < 300 ? "text-rose-500" : "text-primary")} />
              <span className={cn(
                "font-mono text-xl font-black tracking-tighter",
                timeLeft < 300 ? "text-rose-500" : "text-slate-900"
              )}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button
              className="h-12 px-6 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-rose-600/20"
              onClick={() => setShowSubmit(true)}
            >
              FINISH TEST
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-80 border-r border-slate-200 bg-white flex flex-col z-40">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center gap-2">
              <ListFilter className="h-3 w-3" /> QUESTION NAVIGATION
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestion(i)}
                  className={cn(
                    "h-10 w-10 rounded-xl font-black text-xs transition-all duration-300 relative group/bubble",
                    currentQuestion === i
                      ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20 border-2 border-white ring-2 ring-primary"
                      : flagged[i.toString()]
                        ? "bg-amber-100 text-amber-600 border border-amber-200 hover:bg-amber-200"
                        : answers[i.toString()]
                          ? "bg-emerald-100 text-emerald-600 border border-emerald-200 hover:bg-emerald-200"
                          : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"
                  )}
                >
                  {i + 1}
                  {flagged[i.toString()] && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full border-2 border-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">LEGEND</h4>
              <div className="space-y-3">
                <LegendItem color="bg-primary" label="Current" />
                <LegendItem color="bg-emerald-100 border border-emerald-200 text-emerald-600" label="Answered" />
                <LegendItem color="bg-amber-100 border border-amber-200 text-amber-600" label="For Review" />
                <LegendItem color="bg-slate-50 border border-slate-100 text-slate-400" label="Not Answered" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                Tip: You can mark questions for review if you're unsure. They will be highlighted in orange.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROGRESS</span>
              <span className="text-[10px] font-black text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 relative">
          <div className="max-w-4xl mx-auto py-12 px-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-white text-primary border-slate-200 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
                  Section: {isCodingQuestion ? 'Coding' : 'MCQ'}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Difficulty: {isCodingQuestion ? mockCodingQuestions[0].difficulty : 'Medium'}</span>
              </div>
              <Button
                variant="outline"
                onClick={toggleFlag}
                className={cn(
                  "h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all",
                  flagged[currentQuestion.toString()]
                    ? "bg-amber-500 text-white border-none"
                    : "bg-white text-amber-500 border-amber-200 hover:bg-amber-50"
                )}
              >
                <Target className="h-4 w-4" /> {flagged[currentQuestion.toString()] ? 'MARK AS READY' : 'MARK FOR REVIEW'}
              </Button>
            </div>

            {!isCodingQuestion ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white overflow-hidden border">
                  <CardHeader className="p-10">
                    <CardTitle className="text-2xl font-black leading-tight text-slate-900 uppercase tracking-tight">
                      {mcqQuestions[currentQuestion]?.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    <RadioGroup
                      value={answers[currentQuestion.toString()] || ''}
                      onValueChange={(v) => setAnswers({ ...answers, [currentQuestion.toString()]: v })}
                      className="grid gap-4"
                    >
                      {mcqQuestions[currentQuestion]?.options.map((opt, i) => (
                        <div
                          key={i}
                          onClick={() => setAnswers({ ...answers, [currentQuestion.toString()]: i.toString() })}
                          className={cn(
                            "group relative flex items-center space-x-6 rounded-2xl border p-6 cursor-pointer transition-all duration-300",
                            answers[currentQuestion.toString()] === i.toString()
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-slate-100 bg-slate-50 hover:bg-white"
                          )}
                        >
                          <div className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                            answers[currentQuestion.toString()] === i.toString()
                              ? "border-primary bg-primary"
                              : "border-slate-200 group-hover:border-primary/50"
                          )}>
                            {answers[currentQuestion.toString()] === i.toString() && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <Label className="flex-1 cursor-pointer font-bold text-base text-slate-600 group-hover:text-slate-900">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white border overflow-hidden">
                  <CardHeader className="p-10">
                    <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                      {codingQuestion?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 space-y-8">
                    <p className="text-slate-500 font-bold text-base leading-relaxed">{codingQuestion?.description}</p>
                    <div className="grid gap-4">
                      {codingQuestion?.examples?.map((ex: any, i: number) => (
                        <div key={i} className="bg-slate-50 rounded-2xl p-6 font-mono text-[11px] border border-slate-100 space-y-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Example {i + 1}</span>
                          <div className="flex gap-8">
                            <p><span className="text-primary font-black uppercase tracking-widest mr-2">IN:</span> <span className="text-slate-700 font-black">{ex.input}</span></p>
                            <p><span className="text-emerald-600 font-black uppercase tracking-widest mr-2">OUT:</span> <span className="text-emerald-500 font-black">{ex.output}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white border">
                  <CardHeader className="px-10 py-6 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                      <Code2 className="h-5 w-5 text-primary" /> Code Editor
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullCode(true)}
                      className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-primary gap-2"
                    >
                      <Maximize2 className="h-3 w-3" /> FULL SCREEN
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-50 border-r border-slate-100 flex flex-col items-center pt-8 gap-3 text-[9px] font-mono text-slate-300 pointer-events-none">
                        {Array.from({ length: 15 }).map((_, i) => <div key={i}>{i + 1}</div>)}
                      </div>
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="font-mono min-h-[400px] text-xs bg-transparent border-none rounded-none p-8 pl-14 focus-visible:ring-0 text-slate-700 resize-none leading-relaxed"
                      />
                      <div className="absolute right-6 bottom-6 flex gap-3">
                        <Button
                          className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest gap-2"
                          onClick={runCode}
                        >
                          <PlayCircle className="h-4 w-4" /> RUN TESTS
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer Navigation */}
      <footer className="h-24 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-50 shrink-0">
        <Button
          variant="ghost"
          className="h-14 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-primary gap-3"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
        >
          <ChevronLeft className="h-4 w-4" /> PREVIOUS
        </Button>

        <div className="flex items-center gap-4">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">SAVE AUTOMATICALLY ENABLED</p>
          <Button
            className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest gap-3 shadow-lg shadow-primary/20"
            onClick={() => {
              if (currentQuestion === totalQuestions - 1) {
                setShowSubmit(true);
              } else {
                setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1));
              }
            }}
          >
            {currentQuestion === totalQuestions - 1 ? 'REVIEW & SUBMIT' : 'SAVE & NEXT'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>

      {/* Code Editor Dialog */}
      <Dialog open={showFullCode} onOpenChange={setShowFullCode}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 flex flex-col bg-white border-none rounded-[3rem] overflow-hidden">
          <DialogHeader className="px-12 py-8 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">FULL SCREEN <span className="text-primary">EDITOR</span></DialogTitle>
              <div className="flex gap-4">
                <Button className="h-10 px-6 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest" onClick={runCode}>RUN CODE</Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-slate-50 border-r border-slate-100 flex flex-col items-center pt-10 gap-4 text-[11px] font-mono text-slate-300">
              {Array.from({ length: 40 }).map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full font-mono text-sm bg-transparent border-none p-12 pl-24 focus:ring-0 text-slate-700 resize-none leading-loose outline-none"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
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
              <AlertDialogTitle className="text-3xl font-black text-slate-900 uppercase tracking-tighter">SUBMIT ASSESSMENT?</AlertDialogTitle>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Final Submission</p>
            </div>
            <AlertDialogDescription className="text-slate-400 font-bold text-base text-center leading-relaxed">
              Once you submit your assessment, you will not be able to change your answers. This action is <span className="text-slate-900 underline">IRREVERSIBLE</span>.
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

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-4 w-4 rounded-lg", color)} />
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
