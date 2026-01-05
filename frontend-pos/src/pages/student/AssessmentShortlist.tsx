import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Clock, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AssessmentShortlist() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const applications = useAppSelector((state) => state.applications.applications);
  
  const myApplication = applications.find(
    (app) => app.studentId === user?.id && 
    (app.status === 'assessment_submitted' || app.status === 'assessment_under_review')
  );

  return (
    <DashboardLayout title="Assessment Submitted" subtitle="Results under review">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assessment Results</h1>
          <p className="text-muted-foreground">Your assessment is being reviewed</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your assessment has been submitted successfully. Admin is reviewing your responses and will update your status soon.
          </AlertDescription>
        </Alert>

        <Card className="border-success/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-success" />
              Assessment Submitted
            </CardTitle>
            <CardDescription>
              Thank you for completing the assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <FileCheck className="h-8 w-8 text-success" />
                </div>
                <div>
                  <p className="font-medium text-lg">Submission Successful</p>
                  <p className="text-sm text-muted-foreground">Your responses are under admin review</p>
                </div>
              </div>
            </div>

            {myApplication && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted on:</span>
                  <span>
                    {myApplication.submittedAt && 
                      new Date(myApplication.submittedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions Attempted:</span>
                  <span className="font-medium">
                    {(myApplication.assessmentAnswers?.length || 0) + (myApplication.assessmentCode ? 2 : 0)}/7
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="text-warning">
                    Under Review
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside">
              <li>Admin will review your assessment responses</li>
              <li>Your code quality and problem-solving approach will be evaluated</li>
              <li>If approved, you'll proceed to AI mock interview</li>
              <li>Interview rounds will be scheduled with professionals</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Prepare for Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              While waiting for results, you can prepare for the interview rounds:
            </p>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li>Review your technical concepts</li>
              <li>Practice behavioral interview questions</li>
              <li>Research the company culture</li>
              <li>Prepare questions to ask interviewers</li>
            </ul>
          </CardContent>
        </Card>

        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => navigate('/student/applications')}
        >
          View Application Status
        </Button>
      </div>
    </DashboardLayout>
  );
}
