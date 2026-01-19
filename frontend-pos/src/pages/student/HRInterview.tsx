import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { applicationService, professionalService } from '@/services';
import { Video, User, Calendar, ExternalLink, Clock, FileText, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function HRInterview() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  const { data: applicationsData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });
  
  const { data: professionalsData } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalService.getAllProfessionals(),
  });
  
  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];
  const professionals = Array.isArray(professionalsData?.data?.professionals)
    ? professionalsData.data.professionals
    : Array.isArray(professionalsData?.data)
    ? professionalsData.data
    : [];
  
  const myApplication = applications.find(
    (app) => app.studentId === user?.id && 
    (app.status === 'hr_interview_pending' || 
     app.status === 'hr_interview_scheduled' ||
     app.status === 'hr_interview_completed')
  );

  const assignedHR = myApplication?.assignedHRId
    ? professionals.find(p => p.id === myApplication.assignedHRId)
    : null;

  const hrFeedback = myApplication?.interviewFeedback.find(
    f => f.round === 'hr' || f.interviewRound === 'hr'
  );

  const isScheduled = myApplication?.status === 'hr_interview_scheduled' && myApplication?.meetingLink;
  const isCompleted = myApplication?.status === 'hr_interview_completed';

  return (
    <DashboardLayout title="HR Interview" subtitle="Final round">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HR Interview Round</h1>
          <p className="text-muted-foreground">Final round - Culture fit and compensation discussion</p>
        </div>

        {!assignedHR ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Waiting for HR assignment. You'll be notified once scheduled.
            </AlertDescription>
          </Alert>
        ) : isCompleted ? (
          <Alert className="border-success/50 bg-success/5">
            <FileText className="h-4 w-4 text-success" />
            <AlertDescription>
              Interview completed! Waiting for final decision.
            </AlertDescription>
          </Alert>
        ) : isScheduled ? (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Your HR interview has been scheduled.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              HR assigned! Waiting for interview to be scheduled.
            </AlertDescription>
          </Alert>
        )}

        {assignedHR && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                HR Interviewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {assignedHR.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{assignedHR.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {assignedHR.designation} at {assignedHR.company}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isScheduled && myApplication?.meetingLink && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Interview Meeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myApplication.scheduledDate && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Scheduled For:</span>
                  </div>
                  <p className="text-lg">{new Date(myApplication.scheduledDate).toLocaleString()}</p>
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => window.open(myApplication.meetingLink, '_blank')}
              >
                <Video className="mr-2 h-4 w-4" />
                Join Interview on Google Meet
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {isCompleted && hrFeedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interview Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{hrFeedback.rating}/5</span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Detailed Comments</h4>
                  <p className="text-sm text-muted-foreground">{hrFeedback.comments}</p>
                </div>

                {hrFeedback.improvementAreas && hrFeedback.improvementAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Areas for Improvement</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {hrFeedback.improvementAreas.map((area: string) => (
                        <Badge key={area} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-1">Recommendation</h4>
                  <Badge variant={hrFeedback.recommendation === 'Pass' ? 'default' : 'destructive'}>
                    {hrFeedback.recommendation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>HR Round Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li>Salary expectations and benefits</li>
              <li>Notice period and joining date</li>
              <li>Company policies and work culture</li>
              <li>Career growth opportunities</li>
              <li>Any questions about the role or company</li>
            </ul>
          </CardContent>
        </Card>

        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => navigate('/student/interviews')}
        >
          View All Interviews
        </Button>
      </div>
    </DashboardLayout>
  );
}
