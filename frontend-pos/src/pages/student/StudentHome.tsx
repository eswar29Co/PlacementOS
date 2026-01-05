import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppSelector } from '@/store/hooks';
import { Student } from '@/types';
import { Briefcase, FileText, ClipboardCheck, Video, Award, ArrowRight } from 'lucide-react';

const statusOrder = [
  'applied', 'resume_uploaded', 'resume_shortlisted', 'assessment_pending', 
  'assessment_completed', 'assessment_shortlisted', 'ai_interview_pending',
  'ai_interview_completed', 'professional_interview_pending', 'professional_interview_completed',
  'manager_round_pending', 'manager_round_completed', 'hr_round_pending', 
  'hr_round_completed', 'offer_released'
];

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  const { applications } = useAppSelector((state) => state.applications);
  const { jobs } = useAppSelector((state) => state.jobs);
  
  const myApplications = applications.filter(a => a.studentId === student?.id);
  const activeApplications = myApplications.filter(a => !['rejected', 'offer_released'].includes(a.status));
  
  const stats = [
    { label: 'Active Applications', value: activeApplications.length, icon: FileText, color: 'text-info' },
    { label: 'Assessments Pending', value: myApplications.filter(a => a.status === 'assessment_pending').length, icon: ClipboardCheck, color: 'text-warning' },
    { label: 'Interviews Scheduled', value: myApplications.filter(a => a.status.includes('interview_pending')).length, icon: Video, color: 'text-primary' },
    { label: 'Offers Received', value: myApplications.filter(a => a.status === 'offer_released').length, icon: Award, color: 'text-success' },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${student?.name?.split(' ')[0]}!`}>
      <div className="space-y-6">
        {/* Profile Summary */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{student?.name}</h2>
                <p className="text-muted-foreground">{student?.college}</p>
                <p className="text-sm text-muted-foreground">{student?.branch} • Class of {student?.graduationYear} • CGPA: {student?.cgpa}</p>
              </div>
              <Button onClick={() => navigate('/student/profile')}>
                View Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* CTA */}
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <Briefcase className="h-12 w-12 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Start Your Placement Journey</h3>
              <p className="text-muted-foreground">Browse jobs and apply for mock placement simulations</p>
            </div>
            <Button size="lg" onClick={() => navigate('/student/browse-jobs')}>
              Browse Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Active Applications */}
        {activeApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Applications</CardTitle>
              <CardDescription>Track your ongoing placement simulations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeApplications.slice(0, 3).map((app) => {
                const job = jobs.find(j => j.id === app.jobId);
                const currentStageIndex = statusOrder.indexOf(app.status);
                const progress = ((currentStageIndex + 1) / statusOrder.length) * 100;
                
                return (
                  <div key={app.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{job?.companyName}</p>
                        <p className="text-sm text-muted-foreground">{job?.roleTitle}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Applied</span>
                      <span>Offer</span>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" className="w-full" onClick={() => navigate('/student/applications')}>
                View All Applications
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
