import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services';
import { Clock, FileText, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatDistanceToNow } from 'date-fns';

export default function AssessmentRelease() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  
  const { data: applicationsData } = useQuery({
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

  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!myApplication?.assessmentDeadline) return;

    const updateTimer = () => {
      const now = new Date();
      const deadline = new Date(myApplication.assessmentDeadline!);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
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

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [myApplication?.assessmentDeadline]);

  const handleStartAssessment = () => {
    if (myApplication) {
      updateStatusMutation.mutate('assessment_in_progress');
      navigate('/student/take-assessment');
    }
  };

  if (!myApplication) {
    return (
      <DashboardLayout title="Assessment" subtitle="Not found">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No assessment found. Please check your applications.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const isExpired = myApplication.assessmentDeadline && 
    new Date(myApplication.assessmentDeadline) < new Date();

  return (
    <DashboardLayout title="Assessment Released" subtitle="Complete before deadline">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Technical Assessment</h1>
          <p className="text-muted-foreground">Complete your assessment before the deadline</p>
        </div>

        {isExpired ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Assessment deadline has passed. Please contact admin for assistance.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              You have until {myApplication.assessmentDeadline && 
              new Date(myApplication.assessmentDeadline).toLocaleString()} to complete the assessment.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Time Remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {timeLeft}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assessment Details
            </CardTitle>
            <CardDescription>
              Complete both sections to submit your assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Multiple Choice Questions</h3>
                <p className="text-sm text-muted-foreground">5 questions covering technical concepts</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Coding Problems</h3>
                <p className="text-sm text-muted-foreground">2 problems to test your coding skills</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">90 minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Passing Score:</span>
                <span className="font-medium">60%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Released:</span>
                <span>
                  {myApplication.assessmentDeadline && 
                    formatDistanceToNow(new Date(new Date(myApplication.assessmentDeadline).getTime() - 2 * 24 * 60 * 60 * 1000), { addSuffix: true })}
                </span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleStartAssessment}
              disabled={isExpired}
            >
              {myApplication.status === 'assessment_in_progress' ? 'Continue Assessment' : 'Start Assessment'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li>Complete the assessment in one sitting</li>
              <li>Use any programming language for coding problems</li>
              <li>Your code will be stored but not executed</li>
              <li>Submit before the deadline to be considered</li>
              <li>You cannot retake the assessment once submitted</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
