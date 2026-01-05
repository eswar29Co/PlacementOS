import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { Student } from '@/types';
import { Video, Calendar, Clock, User, Bot, Star, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Interviews() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  const { applications } = useAppSelector((state) => state.applications);
  
  // Extract interviews from applications
  const myApplications = applications.filter(a => a.studentId === student?.id);
  const scheduled = myApplications.filter(a => a.status.includes('_scheduled'));
  const completed = myApplications.filter(a => a.status.includes('_completed'));

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
              scheduled.map((interview) => (
                <div key={interview.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {interview.type === 'ai' ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{interview.type.replace('_', ' ')} Interview</p>
                        <p className="text-sm text-muted-foreground">
                          {interview.interviewer ? `with ${interview.interviewer.name}` : 'AI Powered'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {interview.scheduledAt && format(interview.scheduledAt, 'dd MMM, HH:mm')}
                      </p>
                      <Badge variant="info">Scheduled</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Join Interview
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))
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
              completed.map((interview) => (
                <div key={interview.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{interview.type.replace('_', ' ')} Interview</p>
                      {interview.feedback && (
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= interview.feedback!.overallRating ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                  {interview.feedback && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Strengths:</p>
                        <ul className="list-disc list-inside">
                          {interview.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Areas to Improve:</p>
                        <ul className="list-disc list-inside">
                          {interview.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
