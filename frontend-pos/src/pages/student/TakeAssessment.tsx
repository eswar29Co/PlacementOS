import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateApplication } from '@/store/slices/applicationsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { mockMCQQuestions, mockCodingQuestions } from '@/data/mockData';
import { Clock, ChevronLeft, ChevronRight, Code2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { canTakeAssessment, getStatusAfterAssessmentSubmission } from '@/lib/flowHelpers';

export default function TakeAssessment() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { applications } = useAppSelector((state) => state.applications);
  const { jobs } = useAppSelector((state) => state.jobs);
  const { user } = useAppSelector((state) => state.auth);
  const application = applications.find(a => a.id === applicationId);

  // Check if student can access assessment
  useEffect(() => {
    if (!application) {
      toast.error('Application not found');
      navigate('/student/applications');
      return;
    }

    if (!canTakeAssessment(application.status)) {
      toast.error('Assessment not available yet. Please wait for admin approval.');
      navigate('/student/applications');
      return;
    }
  }, [application, navigate]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [code, setCode] = useState('// Write your solution here\n\nfunction solution(input) {\n  // Your code\n}');
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
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
    setOutput('Running test cases...\n\nTest 1: PASSED ✓\nTest 2: PASSED ✓\n\nAll test cases passed!');
    toast.success('Code executed successfully!');
  };

  const handleSubmit = () => {
    if (!application) return;

    const job = jobs.find(j => j.id === application.jobId);

    // Store assessment answers and code
    dispatch(updateApplication({
      id: application.id,
      updates: {
        status: getStatusAfterAssessmentSubmission(),
        assessmentCode: code,
        assessmentAnswers: Object.entries(answers).map(([qId, ans]) => ({ questionId: qId, answer: ans })),
        submittedAt: new Date()
      }
    }));

    // Notify admin
    dispatch(addNotification({
      id: `notif-assess-${Date.now()}`,
      userId: 'admin-1', // Default admin
      type: 'application_update',
      title: 'Assessment Submitted',
      message: `${user?.name} has submitted the assessment for ${job?.roleTitle} at ${job?.companyName}. Please review.`,
      read: false,
      createdAt: new Date(),
      actionUrl: '/admin/dashboard',
    }));

    toast.success('Assessment submitted! Your answers are now under review by the admin.');
    navigate('/student/applications');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <Badge variant="secondary" className="text-base px-3 py-1">
            Assessment
          </Badge>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 ${timeLeft < 300 ? 'text-destructive' : ''}`}>
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
            </div>
            <Button variant="destructive" onClick={() => setShowSubmit(true)}>
              Submit
            </Button>
          </div>
        </div>
        <div className="px-6 pb-3">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Main */}
      <main className="pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {!isCodingQuestion ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-normal">
                  <span className="text-primary font-bold mr-2">Q{currentQuestion + 1}.</span>
                  {mockMCQQuestions[currentQuestion]?.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestion.toString()] || ''}
                  onValueChange={(v) => setAnswers({ ...answers, [currentQuestion.toString()]: v })}
                  className="space-y-3"
                >
                  {mockMCQQuestions[currentQuestion]?.options.map((opt, i) => (
                    <div key={i} className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 ${answers[currentQuestion.toString()] === i.toString() ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                      <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{mockCodingQuestions[0].title}</CardTitle>
                    <Badge variant={mockCodingQuestions[0].difficulty === 'Easy' ? 'success' : 'warning'}>
                      {mockCodingQuestions[0].difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{mockCodingQuestions[0].description}</p>
                  <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                    {mockCodingQuestions[0].examples.map((ex, i) => (
                      <div key={i}>
                        <p><span className="text-muted-foreground">Input:</span> {ex.input}</p>
                        <p><span className="text-muted-foreground">Output:</span> {ex.output}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Code Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono min-h-[200px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={runCode}>Run Code</Button>
                  </div>
                  {output && (
                    <div className="bg-muted rounded-lg p-3 font-mono text-sm whitespace-pre-wrap">
                      {output}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between">
          <Button
            variant="outline"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentQuestion === totalQuestions - 1) {
                setShowSubmit(true);
              } else {
                setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1));
              }
            }}
          >
            {currentQuestion === totalQuestions - 1 ? 'Review & Submit' : 'Next'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </footer>

      <AlertDialog open={showSubmit} onOpenChange={setShowSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit? You cannot change answers after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
