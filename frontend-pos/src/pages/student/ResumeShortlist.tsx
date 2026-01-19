import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Clock, FileCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';

export default function ResumeShortlist() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  // Fetch applications from MongoDB
  const { data: applicationsData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationService.getMyApplications,
  });
  const applications = applicationsData?.data || [];
  
  const myApplication = applications.find(
    (app) => app.studentId === user?.id && 
    (app.status === 'applied' || app.status === 'resume_under_review')
  );

  return (
    <DashboardLayout title="Resume Review" subtitle="Your application is being reviewed">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resume Screening</h1>
          <p className="text-muted-foreground">Your resume is being reviewed by our admin team</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your application is currently under admin review. You'll be notified once your resume has been approved.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Under Review
            </CardTitle>
            <CardDescription>
              Admin is reviewing your resume and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                <div>
                  <p className="font-medium">Resume Under Review</p>
                  <p className="text-sm text-muted-foreground">This usually takes 1-2 business days</p>
                </div>
              </div>
            </div>

            {myApplication && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Application ID:</span>
                  <span className="font-mono">{myApplication.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Applied on:</span>
                  <span>{new Date(myApplication.appliedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-warning font-medium">Under Review</span>
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate('/student/applications')}
            >
              View All Applications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside">
              <li>Admin reviews your resume and qualifications</li>
              <li>If approved, assessment will be released to you</li>
              <li>You'll have 2 days to complete the technical assessment</li>
              <li>Based on assessment results, you'll progress to interview rounds</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
