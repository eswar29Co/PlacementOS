import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppSelector } from '@/store/hooks';
import { Job, Student } from '@/types';
import { Search, IndianRupee, Clock, Building2, Sparkles, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

function JobCard({ job, onApply, matchScore }: { job: Job; onApply: () => void; matchScore?: number }) {
  return (
    <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 relative">
      {matchScore !== undefined && matchScore > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Sparkles className="h-3 w-3 mr-1" />
            {matchScore}% Match
          </Badge>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
              {job.companyName.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{job.companyName}</CardTitle>
              <CardDescription>{job.roleTitle}</CardDescription>
            </div>
          </div>
          <Badge variant={job.locationType === 'Remote' ? 'success' : job.locationType === 'Hybrid' ? 'info' : 'secondary'}>
            {job.locationType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            {job.ctcBand}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Deadline: {format(job.deadline, 'dd MMM')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
          ))}
          {job.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">+{job.skills.length - 3} more</Badge>
          )}
        </div>
        <Button className="w-full" onClick={onApply}>
          Apply Now
        </Button>
      </CardContent>
    </Card>
  );
}

export default function BrowseJobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { jobs } = useAppSelector((state) => state.jobs);
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;

  // Calculate job recommendations based on student skills
  const calculateMatchScore = (job: Job): number => {
    if (!student?.skills || student.skills.length === 0) return 0;

    const jobSkills = [...job.skills, ...job.requiredTechStack];
    const matchingSkills = student.skills.filter(skill =>
      jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase()))
    );

    return Math.round((matchingSkills.length / Math.max(student.skills.length, 1)) * 100);
  };

  // Get recommended jobs (minimum 3)
  const recommendedJobs = jobs
    .filter(job => job.isActive)
    .map(job => ({ job, matchScore: calculateMatchScore(job) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, Math.max(3, jobs.filter(j => j.isActive).length));

  const filteredJobs = jobs.filter(job =>
    job.isActive && (
      job.companyName.toLowerCase().includes(search.toLowerCase()) ||
      job.roleTitle.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleApply = (jobId: string) => {
    navigate(`/student/jobs/${jobId}`);
  };

  return (
    <DashboardLayout title="Browse Jobs" subtitle="Find and apply for placement opportunities">
      <div className="space-y-8">
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies or roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recommended for You Section */}
        {recommendedJobs.length > 0 && !search && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Recommended for You</h2>
              <Badge variant="secondary" className="ml-2">
                Based on your skills
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Jobs that match your profile and skills
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedJobs.map(({ job, matchScore }) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={() => handleApply(job.id)}
                  matchScore={matchScore}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Jobs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {search ? 'Search Results' : 'All Active Jobs'}
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs available
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={() => handleApply(job.id)} />
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <Card className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
