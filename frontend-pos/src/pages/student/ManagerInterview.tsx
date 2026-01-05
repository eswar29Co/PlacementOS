import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Video, User, Calendar, ExternalLink, Clock, FileText, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ManagerInterview() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const applications = useAppSelector((state) => state.applications.applications);
  const professionals = useAppSelector((state) => state.professionals.professionals);
  
  const myApplication = applications.find(
    (app) => app.studentId === user?.id && 
    (app.status === 'manager_interview_pending' || 
     app.status === 'manager_interview_scheduled' ||
     app.status === 'manager_interview_completed')
  );

  const assignedManager = myApplication?.assignedManagerId
    ? professionals.find(p => p.id === myApplication.assignedManagerId)
    : null;

  const managerFeedback = myApplication?.interviewFeedback.find(
    f => f.round === 'manager' || f.interviewRound === 'manager'
  );

  const isScheduled = myApplication?.status === 'manager_interview_scheduled' && myApplication?.meetingLink;
  const isCompleted = myApplication?.status === 'manager_interview_completed';

  return (
    <DashboardLayout title="Manager Interview" subtitle="Managerial round">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Interview Round</h1>
          <p className="text-muted-foreground">Leadership and team-fit assessment</p>
        </div>

        {!assignedManager ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Waiting for manager assignment. You'll be notified once an interviewer is assigned.
            </AlertDescription>
          </Alert>
        ) : isCompleted ? (
          <Alert className="border-success/50 bg-success/5">
            <FileText className="h-4 w-4 text-success" />
            <AlertDescription>
              Interview completed! Check your feedback below.
            </AlertDescription>
          </Alert>
        ) : isScheduled ? (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Your interview has been scheduled. Join using the meeting link below.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Manager assigned! Waiting for interview to be scheduled.
            </AlertDescription>
          </Alert>
        )}

        {assignedManager && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Interviewer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {assignedManager.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{assignedManager.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {assignedManager.designation} at {assignedManager.company}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <p className="font-medium">{assignedManager.experience} years</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Interviews Taken:</span>
                      <p className="font-medium">{assignedManager.interviewsTaken}</p>
                    </div>
                  </div>
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
              <CardDescription>
                Join the interview at the scheduled time
              </CardDescription>
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

        {isCompleted && managerFeedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interview Feedback
              </CardTitle>
              <CardDescription>
                Review from {assignedManager?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{managerFeedback.rating}/5</span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Detailed Comments</h4>
                  <p className="text-sm text-muted-foreground">{managerFeedback.comments}</p>
                </div>

                {managerFeedback.improvementAreas && managerFeedback.improvementAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Areas for Improvement</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {managerFeedback.improvementAreas.map((area: string) => (
                        <Badge key={area} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-1">Recommendation</h4>
                  <Badge variant={managerFeedback.recommendation === 'Pass' ? 'default' : 'destructive'}>
                    {managerFeedback.recommendation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Manager Round Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li>Leadership potential and team collaboration</li>
              <li>Problem-solving approach and decision making</li>
              <li>Communication skills and stakeholder management</li>
              <li>Cultural fit and long-term career goals</li>
              <li>Handling conflicts and challenging situations</li>
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
