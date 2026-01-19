import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services';
import { Calendar as CalendarIcon, Video, Clock, User, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function InterviewCalendar() {
  const { user } = useAppSelector((state) => state.auth);
  
  const { data: applicationsData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });
  
  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  const myApplications = applications.filter(app => app.studentId === user?.id);

  const scheduledInterviews = myApplications.flatMap(app => {
    const interviews = [];
    
    if (app.status === 'professional_interview_scheduled' && app.assignedProfessionalId) {
      // Professional info is already populated in assignedProfessionalId
      interviews.push({
        type: 'Professional',
        professionalId: app.assignedProfessionalId,
        meetingLink: app.meetingLink,
        scheduledDate: app.scheduledDate,
        job: app.jobId,
        status: 'scheduled'
      });
    }
    
    if (app.status === 'manager_interview_scheduled' && app.assignedManagerId) {
      interviews.push({
        type: 'Manager',
        professionalId: app.assignedManagerId,
        meetingLink: app.meetingLink,
        scheduledDate: app.scheduledDate,
        job: app.jobId,
        status: 'scheduled'
      });
    }
    
    if (app.status === 'hr_interview_scheduled' && app.assignedHRId) {
      interviews.push({
        type: 'HR',
        professionalId: app.assignedHRId,
        meetingLink: app.meetingLink,
        scheduledDate: app.scheduledDate,
        job: app.jobId,
        status: 'scheduled'
      });
    }

    // Add completed interviews
    if (app.interviewFeedback && Array.isArray(app.interviewFeedback)) {
      app.interviewFeedback.forEach(feedback => {
        interviews.push({
          type: feedback.round === 'professional' ? 'Professional' : 
                feedback.round === 'manager' ? 'Manager' : 'HR',
          professionalId: feedback.professionalId,
          feedback: feedback,
          job: app.jobId,
          status: 'completed'
        });
      });
    }

    return interviews;
  });

  const upcomingInterviews = scheduledInterviews.filter(i => i.status === 'scheduled');
  const completedInterviews = scheduledInterviews.filter(i => i.status === 'completed');

  return (
    <DashboardLayout title="Interview Calendar" subtitle="Manage all your scheduled and completed interviews">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Upcoming Interviews ({upcomingInterviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming interviews scheduled
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, idx) => (
                    <Card key={idx} className="border-primary/30">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge className="mb-2">{interview.type} Round</Badge>
                              <p className="font-medium">{interview.job?.roleTitle || 'Interview'}</p>
                              <p className="text-sm text-muted-foreground">{interview.job?.companyName || 'Company'}</p>
                            </div>
                          </div>

                          {interview.professionalId && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-primary/10">
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <p className="font-medium">Interviewer Assigned</p>
                                <p className="text-muted-foreground text-xs">{interview.type} Interviewer</p>
                              </div>
                            </div>
                          )}

                          {interview.scheduledDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{new Date(interview.scheduledDate).toLocaleString()}</span>
                            </div>
                          )}

                          {interview.meetingLink && (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => window.open(interview.meetingLink, '_blank')}
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Join Meeting
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Completed Interviews ({completedInterviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No completed interviews yet
                </p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {completedInterviews.map((interview, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="secondary" className="mb-2">{interview.type} Round</Badge>
                              <p className="font-medium text-sm">{interview.job?.roleTitle}</p>
                            </div>
                            {interview.feedback && (
                              <div className="text-right">
                                <div className="text-lg font-bold">{interview.feedback.rating}/5</div>
                                <div className="text-xs text-muted-foreground">Rating</div>
                              </div>
                            )}
                          </div>

                          {interview.professional && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {interview.professional.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-xs text-muted-foreground">{interview.professional.name}</p>
                            </div>
                          )}

                          {interview.feedback && (
                            <Badge variant={interview.feedback.recommendation === 'Fail' ? 'destructive' : 'default'}>
                              {interview.feedback.recommendation}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
