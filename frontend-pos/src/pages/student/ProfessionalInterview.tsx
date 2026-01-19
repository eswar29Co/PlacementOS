import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Video, User, Calendar, ExternalLink, Clock, FileText, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { professionalService } from '@/services/professionalService';

export default function ProfessionalInterview() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  // Fetch applications from MongoDB
  const { data: applicationsData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationService.getMyApplications,
  });
  const applications = applicationsData?.data || [];
  
  // Fetch professionals from MongoDB
  const { data: professionalsData } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalService.getAllProfessionals(),
  });
  const professionals = professionalsData?.data || [];
  
  const myApplication = applications.find(
    (app) => app.studentId === user?.id && 
    (app.status === 'professional_interview_pending' || 
     app.status === 'professional_interview_scheduled' ||
     app.status === 'professional_interview_completed')
  );

  const assignedProfessional = myApplication?.assignedProfessionalId
    ? professionals.find(p => p.id === myApplication.assignedProfessionalId)
    : null;

  const professionalFeedback = myApplication?.interviewFeedback.find(
    f => f.round === 'professional' || f.interviewRound === 'professional'
  );

  const isScheduled = myApplication?.status === 'professional_interview_scheduled' && myApplication?.meetingLink;
  const isCompleted = myApplication?.status === 'professional_interview_completed';

  return (
    <DashboardLayout title="Professional Interview" subtitle="Technical round">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Professional Interview Round</h1>
          <p className="text-muted-foreground">Technical interview with an industry professional</p>
        </div>

        {!assignedProfessional ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Waiting for professional assignment. You'll be notified once an interviewer is assigned.
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
              Professional assigned! Waiting for interview to be scheduled.
            </AlertDescription>
          </Alert>
        )}

        {assignedProfessional && (
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
                    {assignedProfessional.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{assignedProfessional.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {assignedProfessional.designation} at {assignedProfessional.company}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <p className="font-medium">{assignedProfessional.experience} years</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Interviews Taken:</span>
                      <p className="font-medium">{assignedProfessional.interviewsTaken}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Expertise:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {assignedProfessional.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
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

        {isCompleted && professionalFeedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interview Feedback
              </CardTitle>
              <CardDescription>
                Review from {assignedProfessional?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{professionalFeedback.rating}/5</span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Detailed Comments</h4>
                  <p className="text-sm text-muted-foreground">{professionalFeedback.comments}</p>
                </div>

                {professionalFeedback.improvementAreas && professionalFeedback.improvementAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Areas for Improvement</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {professionalFeedback.improvementAreas.map((area: string) => (
                        <Badge key={area} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-1">Recommendation</h4>
                  <Badge variant={professionalFeedback.recommendation === 'Pass' ? 'default' : 'destructive'}>
                    {professionalFeedback.recommendation}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Interview Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside text-sm">
              <li>Join the meeting 5 minutes before scheduled time</li>
              <li>Ensure your camera and microphone are working</li>
              <li>Be in a quiet environment with good lighting</li>
              <li>Have your resume and projects ready to discuss</li>
              <li>Prepare questions to ask the interviewer</li>
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
