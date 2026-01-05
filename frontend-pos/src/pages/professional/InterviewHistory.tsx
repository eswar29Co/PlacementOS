import { useAppSelector } from '@/store/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function InterviewHistory() {
  const { user } = useAppSelector((state) => state.auth);
  const applications = useAppSelector((state) => state.applications.applications);
  const students = useAppSelector((state) => state.students.students);
  const jobs = useAppSelector((state) => state.jobs.jobs);

  // Filter applications where current user gave feedback
  const completedInterviews = applications.filter((app) =>
    app.interviewFeedback && app.interviewFeedback.some((f) => f.professionalId === user?.id)
  );

  return (
    <DashboardLayout 
      title="Interview History" 
      subtitle="Your completed interviews and feedback history"
    >
      <Card>
        <CardHeader>
          <CardTitle>Completed Interviews</CardTitle>
          <CardDescription>
            You have conducted {completedInterviews.length} interview(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedInterviews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No interviews conducted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Round</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedInterviews.map((app) => {
                    const student = students.find((s) => s.id === app.studentId);
                    const job = jobs.find((j) => j.id === app.jobId);
                    const myFeedback = app.interviewFeedback?.find(
                      (f) => f.professionalId === user?.id
                    );

                    if (!student || !job || !myFeedback) return null;

                    return (
                      <TableRow key={`${app.id}-${myFeedback.round}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.roleTitle}</p>
                            <p className="text-xs text-muted-foreground">{job.companyName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {myFeedback.round}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(myFeedback.conductedAt), 'PP')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{myFeedback.rating}/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={myFeedback.recommendation === 'Pass' ? 'default' : 'destructive'}
                          >
                            {myFeedback.recommendation}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {myFeedback.comments}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
