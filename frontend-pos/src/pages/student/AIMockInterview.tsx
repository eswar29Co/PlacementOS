import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService, notificationService } from '@/services';
import { Bot, Send, CheckCircle, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { canTakeAIInterview, getStatusAfterAIInterview } from '@/lib/flowHelpers';

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
    ? applications.find(app => app.id === applicationId)
    : applications.find(
      (app) => app.studentId === user?.id &&
        app.status === 'ai_interview_pending'
    );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(AI_QUESTIONS.length).fill(''));
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Video and speech recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Mutation for submitting AI interview
  const submitMutation = useMutation({
    mutationFn: (data: { applicationId: string; aiInterviewAnswers: string[] }) =>
      applicationService.submitAIInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      stopCamera();
      setIsCompleted(true);
      toast.success('AI Mock Interview completed! Your responses are now under review by the admin.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit interview');
    },
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        // Update current answer with speech-to-text
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answers[currentQuestion] + ' ' + transcript;
        setAnswers(newAnswers);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable microphone permissions.');
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start/stop camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        toast.success('Camera enabled');
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
    }
  };

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Speech recognition stopped');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Speech recognition started. Start speaking...');
      } catch (error) {
        console.error('Recognition start error:', error);
        toast.error('Failed to start speech recognition');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Check if student can access AI interview
  useEffect(() => {
    console.log('AI Interview Check:', {
      applicationId,
      myApplication: myApplication ? {
        id: myApplication.id,
        status: myApplication.status,
        canTake: canTakeAIInterview(myApplication.status)
      } : null,
      allApplications: applications.map(app => ({
        id: app.id,
        status: app.status
      }))
    });

    if (!myApplication) {
      toast.error('Application not found. Please select an application from your Interviews page.');
      setTimeout(() => navigate('/student/interviews'), 2000);
      return;
    }

    if (!canTakeAIInterview(myApplication.status)) {
      toast.error(`AI Interview not available. Current status: ${myApplication.status}. Please wait for admin to approve your assessment.`);
      setTimeout(() => navigate('/student/interviews'), 2000);
      return;
    }

    // Auto-start camera when interview begins
    startCamera();
  }, [myApplication, navigate, applicationId]);

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentQuestion].trim()) {
      toast.error('Please provide an answer before proceeding');
      return;
    }

    if (currentQuestion < AI_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!answers[currentQuestion].trim()) {
      toast.error('Please answer the current question');
      return;
    }

    if (myApplication) {
      submitMutation.mutate({
        applicationId: myApplication.id,
        aiInterviewAnswers: answers
      });
    }
  };

  if (isCompleted) {
    return (
      <DashboardLayout title="AI Interview" subtitle="Completed successfully">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold">Interview Completed!</h2>
              <p className="text-muted-foreground">
                Great job! Your responses have been recorded. The system will now assign a professional for your technical interview.
              </p>
              <Button onClick={() => navigate('/student/applications')}>
                View Application Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!myApplication) {
    return (
      <DashboardLayout title="AI Interview" subtitle="Not found">
        <Alert variant="destructive">
          <AlertDescription>
            No AI interview found. Please check your application status.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const progress = ((currentQuestion + 1) / AI_QUESTIONS.length) * 100;

  return (
    <DashboardLayout title="AI Mock Interview" subtitle="Answer behavioral questions">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Mock Interview</h1>
          <p className="text-muted-foreground">Practice with AI-powered behavioral questions</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">Question {currentQuestion + 1} of {AI_QUESTIONS.length}</span>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Interviewer
            </CardTitle>
            <CardDescription>
              Take your time to provide thoughtful answers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium text-lg">{AI_QUESTIONS[currentQuestion]}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Answer</label>
              <Textarea
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {answers[currentQuestion].length} characters
              </p>
            </div>

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === AI_QUESTIONS.length - 1 ? (
                <Button onClick={handleSubmit} className="gap-2">
                  Submit Interview
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Be specific and use examples from your experience</li>
              <li>Follow the STAR method (Situation, Task, Action, Result)</li>
              <li>Keep answers concise but informative</li>
              <li>Show enthusiasm and genuine interest</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
