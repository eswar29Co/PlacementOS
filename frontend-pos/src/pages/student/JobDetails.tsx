import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import {
  ArrowLeft, IndianRupee, MapPin, CheckCircle2,
  Clock, Target, Zap, Building2, Sparkles,
  Briefcase, Star, Info, ShieldCheck, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';
import { cn } from '@/lib/utils';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch jobs (Preserving logic)
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = Array.isArray(jobsData?.data) ? jobsData.data : (jobsData?.data && 'jobs' in jobsData.data ? jobsData.data.jobs : []);
  const job = jobs.find(j => (j.id === id || j._id === id));

  if (isLoading) {
    return (
      <DashboardLayout title="Loading Job" subtitle="Fetching job details...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout title="Error" subtitle="The requested job could not be found.">
        <div className="text-center py-24 space-y-6">
          <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm border border-rose-100">
            <Zap className="h-10 w-10" />
          </div>
          <Button variant="link" className="font-black text-primary" onClick={() => navigate('/student/browse-jobs')}>RETURN TO JOBS</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleApply = () => {
    toast.success('Loading application form...');
    navigate(`/student/apply/${job.id || job._id}`);
  };

  return (
    <DashboardLayout title="Job Details" subtitle={`Company: ${job.companyName}`}>
      <div className="max-w-[1400px] mx-auto space-y-10 pb-12">

        {/* Navigation Command */}
        <Button variant="ghost" className="rounded-xl font-black text-xs uppercase hover:bg-slate-50 transition-all group text-slate-400 border border-transparent hover:border-slate-100" onClick={() => navigate('/student/browse-jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs List
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-10">

            {/* Job Header */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden group bg-white border">
              <div className="h-4 w-full bg-gradient-to-r from-primary via-blue-500 to-indigo-600" />
              <CardContent className="p-10">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="h-28 w-28 rounded-[2rem] bg-slate-50 shadow-sm flex items-center justify-center text-5xl font-black text-primary border border-slate-100 group-hover:rotate-6 transition-transform">
                    {job.companyName.charAt(0)}
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">{job.roleTitle}</h1>
                      <Badge className="bg-primary/5 text-primary border-primary/10 font-black px-4 py-1 rounded-full uppercase text-[10px] shadow-none">Featured Job</Badge>
                    </div>
                    <p className="text-slate-400 font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-2 italic">
                      <Building2 className="h-4 w-4 text-primary/50" /> {job.companyName}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl font-bold text-xs border border-primary/10">
                        <MapPin className="h-3.5 w-3.5" /> {job.locationType}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 text-emerald-600 rounded-xl font-bold text-xs border border-emerald-500/10">
                        <IndianRupee className="h-3.5 w-3.5" /> {job.ctcBand}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 text-amber-600 rounded-xl font-bold text-xs border border-amber-500/10">
                        <Zap className="h-3.5 w-3.5" /> High Priority
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white overflow-hidden border">
              <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-900">
                  <Info className="h-6 w-6 text-primary" /> Job Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Overview</h4>
                  <p className="text-slate-500 leading-relaxed font-bold italic">{job.description}</p>
                </div>

                <div className="space-y-6">
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Core Requirements</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {job.requirements.map((req, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-slate-50 border border-slate-100 hover:border-primary/20 rounded-3xl transition-all group/req">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-slate-700 leading-snug">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Required Skills</h4>
                  <div className="flex flex-wrap gap-3">
                    {job.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-white text-slate-900 border border-slate-100 shadow-sm font-black px-4 py-2 rounded-xl uppercase text-[10px] italic">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Process */}
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white overflow-hidden border">
              <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-900">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" /> Selection Process
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {['Resume Screening', 'Tech Assessment', 'AI Interview', 'Technical Interview', 'Managerial Round', 'HR Round', 'Onboarding'].map((step, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white font-black text-xs shadow-md z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-transform group-hover:scale-125">
                        {i + 1}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group-hover:bg-primary/5 transition-colors">
                        <span className="text-xs font-black uppercase tracking-widest text-primary">{step}</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic">Status: Started</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">
            <Card className="border-none shadow-lg rounded-[3rem] overflow-hidden bg-primary text-white p-10 relative">
              <Sparkles className="absolute -right-4 -top-4 h-24 w-24 opacity-10" />
              <div className="relative z-10 space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-white/50" /> Time Remaining
                  </p>
                  <h3 className="text-2xl font-black italic tracking-tighter">{format(new Date(job.deadline), 'dd MMMM yyyy')}</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                    <Target className="h-3 w-3 text-white/50" /> Hiring Status
                  </p>
                  <h3 className="text-2xl font-black italic tracking-tighter">Actively Hiring</h3>
                </div>
                <div className="pt-4">
                  <Button className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-slate-50 font-black text-lg gap-2 shadow-xl shadow-black/10" onClick={handleApply}>
                    APPLY NOW <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">Next step: Resume submission</p>
              </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white p-8 border">
              <div className="space-y-6">
                <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 text-slate-900">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Platform Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Applicants</span>
                    <span className="text-xs font-black text-slate-900">1.2k+ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Hiring Speed</span>
                    <span className="text-xs font-black text-emerald-600">Fast</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl font-black text-[10px] uppercase h-12 border-slate-200 bg-white hover:bg-slate-50 text-slate-600">Ask Prep Bot</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
