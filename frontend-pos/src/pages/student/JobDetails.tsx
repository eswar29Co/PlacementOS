import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { ArrowLeft, IndianRupee, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch jobs from MongoDB
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = Array.isArray(jobsData?.data)
    ? jobsData.data
    : (jobsData?.data && 'jobs' in jobsData.data)
    ? jobsData.data.jobs
    : [];
  const job = jobs.find(j => j.id === id);

  if (!job) {
    return (
      <DashboardLayout title="Job Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">This job does not exist.</p>
          <Button variant="link" onClick={() => navigate('/student/jobs')}>Back to Jobs</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleApply = () => {
    toast.success('Application started! Please upload your resume.');
    navigate(`/student/apply/${job.id}`);
  };

  return (
    <DashboardLayout title={job.companyName} subtitle={job.roleTitle}>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/student/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
                    {job.companyName.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{job.companyName}</h1>
                    <p className="text-lg text-muted-foreground">{job.roleTitle}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge>{job.locationType}</Badge>
                      <Badge variant="outline">{job.ctcBand}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About the Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selection Process</CardTitle>
                <CardDescription>Steps in this placement simulation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {['Resume Screening', 'Online Assessment (2 days)', 'AI Mock Interview', 'Professional Interview', 'Manager Round', 'HR Round', 'Offer'].map((step, i) => (
                      <div key={i} className="relative flex items-start gap-4 pl-10">
                        <div className="absolute left-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {i + 1}
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 border-primary/20 bg-gradient-to-b from-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CTC Range</span>
                  <span className="text-xl font-bold text-primary">{job.ctcBand}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(job.deadline, 'dd MMM yyyy')}
                  </span>
                </div>
                <Button size="lg" className="w-full" onClick={handleApply}>
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
