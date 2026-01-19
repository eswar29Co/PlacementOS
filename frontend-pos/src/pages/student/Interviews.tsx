import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services';
import { Student } from '@/types';
import { Video, Calendar, Clock, User, Bot, Star, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Interviews() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  
  const { data: applicationsData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });
  
  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];
  
  // Extract interviews from applications
  const myApplications = applications.filter(a => a.studentId === student?.id);
  
  // AI interviews that are pending or completed
  const aiInterviewPending = myApplications.filter(a => a.status === 'ai_interview_pending');
  const aiInterviewCompleted = myApplications.filter(a => 
    a.status === 'ai_interview_completed' || 
    a.status === 'professional_interview_assigned' ||
    a.status === 'professional_interview_scheduled'
  );
  
  // Professional interviews
  const professionalScheduled = myApplications.filter(a => a.status === 'professional_interview_scheduled');
  const professionalCompleted = myApplications.filter(a => 
    a.status === 'professional_interview_completed' ||
    a.status === 'manager_interview_scheduled' ||
    a.status === 'hr_interview_scheduled' ||
    a.status === 'hired' ||
    a.status === 'rejected'
  );
  
  const scheduled = [...aiInterviewPending, ...professionalScheduled];
  const completed = [...aiInterviewCompleted, ...professionalCompleted];

  return (
    <DashboardLayout title="Interviews" subtitle="Your interview schedule and feedback">
      <div className="space-y-6">
        {/* Scheduled */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Interviews ({scheduled.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduled.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No scheduled interviews</p>
              </div>
            ) : (
              scheduled.map((application) => {
                const isAIInterview = application.status === 'ai_interview_pending';
                const isProfessionalScheduled = application.status === 'professional_interview_scheduled';
                
                return (
                  <div key={application.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {isAIInterview ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {isAIInterview ? 'AI Mock Interview' : 'Professional Interview'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.jobId?.roleTitle || 'Job Position'}
                          </p>
                          {application.professionalId && (
                            <p className="text-xs text-muted-foreground">
                              with {application.professionalId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {application.scheduledDate && (
                          <p className="font-medium">
                            {format(new Date(application.scheduledDate), 'dd MMM, HH:mm')}
                          </p>
                        )}
                        <Badge variant="default">
                          {isAIInterview ? 'Ready' : 'Scheduled'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Show meeting link for scheduled professional interviews */}
                    {isProfessionalScheduled && application.meetingLink && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Meeting Link:</p>
                        <a 
                          href={application.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {application.meetingLink}
                        </a>
                      </div>
                    )}
                    
                    {isAIInterview && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => navigate(`/student/ai-interview/${application.id}`)}
                      >
                        Start AI Interview
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {isProfessionalScheduled && application.meetingLink && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => window.open(application.meetingLink, '_blank')}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Join Interview
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Completed Interviews ({completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completed.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No completed interviews yet</p>
              </div>
            ) : (
              completed.map((application) => {
                const hasAIInterview = application.aiInterviewScore !== undefined;
                const isApproved = application.aiInterviewApproved === true;
                
                return (
                  <div key={application.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {hasAIInterview ? 'AI Mock Interview' : 'Professional Interview'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {application.jobId?.roleTitle || 'Job Position'}
                        </p>
                        {hasAIInterview && application.aiInterviewScore && (
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-sm font-medium">Score: {application.aiInterviewScore}%</p>
                            {[1,2,3,4,5].map((star) => {
                              const rating = Math.round((application.aiInterviewScore || 0) / 20);
                              return (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= rating ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} 
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <Badge variant={isApproved ? "success" : "default"}>
                        Completed
                      </Badge>
                    </div>
                    {hasAIInterview && application.aiInterviewAnswers && (
                      <div className="mt-4 text-sm">
                        <p className="text-muted-foreground mb-2">Your Responses:</p>
                        <div className="space-y-2">
                          {application.aiInterviewAnswers.slice(0, 2).map((answer, i) => (
                            <p key={i} className="text-xs text-muted-foreground truncate">
                              {i + 1}. {answer}
                            </p>
                          ))}
                          {application.aiInterviewAnswers.length > 2 && (
                            <p className="text-xs text-muted-foreground italic">
                              +{application.aiInterviewAnswers.length - 2} more responses
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
