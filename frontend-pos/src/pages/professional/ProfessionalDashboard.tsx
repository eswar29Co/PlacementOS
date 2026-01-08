import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppSelector } from '@/store/hooks';
import { Professional } from '@/types';
import { Users, Calendar, CheckCircle2, Star, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const professional = user as Professional;
  const { applications } = useAppSelector((state) => state.applications);
  const { students } = useAppSelector((state) => state.students);
  const { jobs } = useAppSelector((state) => state.jobs);

  // Debug: Log current professional and applications
  console.log('Current professional:', professional);
  console.log('All applications:', applications);
  console.log('Professional ID:', professional?.id);

  // Get applications assigned to this professional
  const myAssignments = applications.filter(
    a => a.assignedProfessionalId === professional?.id ||
      a.assignedManagerId === professional?.id ||
      a.assignedHRId === professional?.id
  );

  // console.log('My assignments:', myAssignments);
  // console.log('Professional role:', professional?.professionalRole);

  // Filter by status - pending means not yet scheduled
  const pending = myAssignments.filter(a => {
    // For Technical/Professional round
    if (a.assignedProfessionalId === professional?.id &&
      (a.status === 'professional_interview_pending')) {
      return true;
    }

    // For Manager round
    if (a.assignedManagerId === professional?.id &&
      (a.status === 'manager_interview_pending' || a.status === 'manager_round_pending')) {
      return true;
    }

    // For HR round
    if (a.assignedHRId === professional?.id &&
      (a.status === 'hr_interview_pending' || a.status === 'hr_round_pending')) {
      return true;
    }

    return false;
  });

  // Scheduled interviews - have a scheduled date and meeting link
  const scheduled = myAssignments.filter(a => {
    const isScheduled = a.status.includes('_scheduled');

    // For Technical/Professional round
    if (a.assignedProfessionalId === professional?.id &&
      a.status === 'professional_interview_scheduled') {
      return true;
    }

    // For Manager round
    if (a.assignedManagerId === professional?.id &&
      a.status === 'manager_interview_scheduled') {
      return true;
    }

    // For HR round
    if (a.assignedHRId === professional?.id &&
      a.status === 'hr_interview_scheduled') {
      return true;
    }

    return false;
  });

  // Completed interviews
  const completed = myAssignments.filter(a => {
    // For Technical/Professional round
    if (a.assignedProfessionalId === professional?.id &&
      a.status === 'professional_interview_completed') {
      return true;
    }

    // For Manager round
    if (a.assignedManagerId === professional?.id &&
      (a.status === 'manager_interview_completed' || a.status === 'manager_round_completed')) {
      return true;
    }

    // For HR round
    if (a.assignedHRId === professional?.id &&
      (a.status === 'hr_interview_completed' || a.status === 'hr_round_completed')) {
      return true;
    }

    return false;
  });

  console.log('Pending interviews:', pending);
  console.log('Scheduled interviews:', scheduled);
  console.log('Completed interviews:', completed);

  const stats = [
    { label: 'Active Interviews', value: professional.activeInterviewCount, icon: Users, color: 'text-primary' },
    { label: 'Scheduled', value: scheduled.length, icon: Calendar, color: 'text-info' },
    { label: 'Pending', value: pending.length, icon: Video, color: 'text-warning' },
    { label: 'Completed', value: completed.length, icon: CheckCircle2, color: 'text-success' },
  ];

  const getStudentById = (studentId: string) => students.find(s => s.id === studentId);
  const getJobById = (jobId: string) => jobs.find(j => j.id === jobId);

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome, ${professional.name.split(' ')[0]}!`}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl bg-muted p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professional Info Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{professional.name}</h2>
                <p className="text-muted-foreground">{professional.role} • {professional.yearsOfExperience} years exp</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {professional.techStack?.map((tech) => (
                    <Badge key={tech} variant="secondary">{tech}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{professional.rating.toFixed(1)} Rating</span>
                  <span className="text-sm text-muted-foreground">• {professional.interviewsTaken} interviews</span>
                </div>
              </div>
              <Button onClick={() => navigate('/professional/profile')}>
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No Pending Interviews</h3>
                <p className="text-muted-foreground">You're all caught up!</p>
              </Card>
            ) : (
              pending.map((app) => {
                const student = getStudentById(app.studentId);
                const job = getJobById(app.jobId);

                return (
                  <Card key={app.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {student?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{student?.name}</p>
                              <Badge variant="outline" className="capitalize">
                                {app.interviewRound || 'Professional'} Round
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{student?.college}</p>
                            <p className="text-sm text-muted-foreground">{job?.companyName} - {job?.roleTitle}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted-foreground">Skills: {student?.skills.slice(0, 3).join(', ')}</p>
                              <p className="text-xs text-muted-foreground">CGPA: {student?.cgpa}</p>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/professional/schedule/${app.id}`)}>
                          Schedule Interview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduled.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No Scheduled Interviews</h3>
                <p className="text-muted-foreground">Schedule interviews from the pending tab</p>
              </Card>
            ) : (
              scheduled.map((app) => {
                const student = getStudentById(app.studentId);
                const job = getJobById(app.jobId);

                return (
                  <Card key={app.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {student?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{student?.name}</p>
                              <Badge variant="outline" className="capitalize">
                                {app.interviewRound || 'Professional'} Round
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{student?.college}</p>
                            <p className="text-sm text-muted-foreground">{job?.companyName} - {job?.roleTitle}</p>
                            {app.scheduledDate && (
                              <p className="text-sm font-medium text-primary mt-1">
                                📅 {new Date(app.scheduledDate).toLocaleString()}
                              </p>
                            )}
                            {app.meetingLink && (
                              <a href={app.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
                                🔗 Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/professional/conduct/${app.id}`)}>
                          Conduct Interview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completed.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No Completed Interviews</h3>
                <p className="text-muted-foreground">Completed interviews will appear here</p>
              </Card>
            ) : (
              completed.map((app) => {
                const student = getStudentById(app.studentId);
                const job = getJobById(app.jobId);
                const feedback = app.interviewFeedback?.find(f =>
                  (f.round === 'professional' && app.assignedProfessionalId === professional.id) ||
                  (f.round === 'manager' && app.assignedManagerId === professional.id) ||
                  (f.round === 'hr' && app.assignedHRId === professional.id)
                );

                return (
                  <Card key={app.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {student?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{student?.name}</p>
                              <Badge variant="outline" className="capitalize">
                                {app.interviewRound || 'Professional'} Round
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{student?.college}</p>
                            <p className="text-sm text-muted-foreground">{job?.companyName} - {job?.roleTitle}</p>
                            {feedback && (
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={feedback.recommendation === 'Pass' ? 'default' : 'destructive'}>
                                  {feedback.recommendation}
                                </Badge>
                                <span className="text-sm">Rating: {feedback.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => navigate(`/professional/view/${app.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
