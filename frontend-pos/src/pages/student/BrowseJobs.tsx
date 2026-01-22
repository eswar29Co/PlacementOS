import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppSelector } from '@/store/hooks';
import { Job, Student } from '@/types';
import {
  Search, IndianRupee, Clock, Building2, Sparkles,
  TrendingUp, MapPin, Briefcase, ChevronRight, Filter,
  Target, Zap, Star, Terminal, Globe, Ghost, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';
import { cn } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BrowseJobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Fetch jobs from MongoDB
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs({ isActive: true }),
  });
  const jobs = Array.isArray(jobsData?.data)
    ? jobsData.data
    : (jobsData?.data && 'jobs' in jobsData.data)
      ? jobsData.data.jobs
      : [];

  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;

  // Calculate job recommendations based on student skills
  const calculateMatchScore = (job: Job): number => {
    if (!student?.skills || student.skills.length === 0) return 40; // Base score
    const jobSkills = [...(job.skills || []), ...(job.requiredTechStack || [])];
    const matchingSkills = student.skills.filter(skill =>
      jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    return Math.min(Math.round((matchingSkills.length / Math.max(jobSkills.length, 1)) * 100) + 50, 98);
  };

  const recommendedJobs = jobs
    .filter(job => job.isActive)
    .map(job => ({ job, matchScore: calculateMatchScore(job) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  const filteredJobs = jobs.filter(job =>
    job.isActive && (
      job.companyName.toLowerCase().includes(search.toLowerCase()) ||
      job.roleTitle.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <DashboardLayout title="Browse Jobs" subtitle="Finding the best career opportunities for you...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full shadow-2xl shadow-primary/20" />
          <p className="font-black text-primary animate-pulse uppercase tracking-[0.4em] text-[10px] italic">Loading Jobs...</p>
        </div>
      </DashboardLayout>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  return (
    <DashboardLayout title="Browse Jobs" subtitle="Find and apply for the best career opportunities matching your profile">
      <div className="space-y-12 max-w-[1500px] mx-auto pb-12 relative">

        {/* Animated Background Decor */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[160px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[140px] -z-10" />

        {/* Search & Filter Command Bar */}
        <div className="relative group/search">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 rounded-[3rem] blur-xl opacity-50 group-focus-within/search:opacity-100 transition duration-1000"></div>
          <Card className="relative border-slate-200 shadow-sm rounded-[2.5rem] bg-white overflow-hidden border">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search jobs by company, sector, or role..."
                  className="h-16 pl-16 border-slate-100 bg-slate-50 rounded-2xl font-black text-lg text-slate-900 focus-visible:ring-primary/20 shadow-inner placeholder:text-slate-400 italic"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Button variant="outline" className="h-16 px-8 rounded-2xl border-slate-200 bg-white font-black gap-3 text-slate-400 hover:text-primary transition-all shadow-sm uppercase tracking-widest text-[10px]">
                  <Filter className="h-5 w-5 opacity-50" /> FILTER
                </Button>
                <Button className="h-16 px-10 rounded-2xl font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white uppercase tracking-widest text-[10px] gap-2 transition-all hover:scale-105 active:scale-95">
                  SEARCH
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations - Card Layout */}
        {!search && recommendedJobs.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-4 text-slate-900 uppercase">
                  <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
                  RECOMMENDED FOR YOU
                </h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] inline-block ml-12 italic">Jobs that match your technical background and interests</p>
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black text-[10px] uppercase tracking-[0.2em] py-2 px-6 rounded-full shadow-lg shadow-amber-500/5 italic">AI MATCHING ACTIVE</Badge>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedJobs.map(({ job, matchScore }) => (
                <PremiumJobCard
                  key={job.id || job._id}
                  job={job}
                  isRecommended
                  matchScore={matchScore}
                  onApply={() => navigate(`/student/apply/${job.id || job._id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Global Catalog - Tabular Layout */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tighter italic flex items-center gap-4 text-slate-900 uppercase">
                <Globe className="h-7 w-7 text-primary" />
                {search ? `SEARCH RESULTS FOR "${search.toUpperCase()}"` : "ALL AVAILABLE JOBS"}
              </h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] inline-block ml-11 italic">Access all available placement opportunities</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-slate-200 bg-slate-50 px-6 py-2 rounded-full shadow-none">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mr-3 animate-pulse" />
              {filteredJobs.length} JOBS FOUND
            </Badge>
          </div>

          <Card className="border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white border">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[300px] font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 pl-10">Company & Role</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">Package (CTC)</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">Location</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">Deadline</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 pr-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold italic h-[300px]">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Ghost className="h-10 w-10 opacity-20" />
                        No jobs found matching your search.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => {
                    const isExpanded = expandedJobId === (job.id || job._id);
                    return (
                      <React.Fragment key={job.id || job._id}>
                        <TableRow
                          className={cn(
                            "group cursor-pointer border-slate-100 transition-colors",
                            isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/30"
                          )}
                          onClick={() => toggleExpand(job.id || job._id)}
                        >
                          <TableCell className="py-8 pl-10">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center font-black text-primary text-xl shrink-0 group-hover:scale-110 transition-transform">
                                {job.companyName.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                <p className="font-black text-slate-900 leading-none uppercase tracking-tight">{job.roleTitle}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 italic">
                                  <Building2 className="h-3 w-3" /> {job.companyName}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs border border-emerald-100 italic">
                              <IndianRupee className="h-3 w-3" /> {job.package || job.ctcBand}
                            </div>
                          </TableCell>
                          <TableCell className="py-8">
                            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest italic">
                              <MapPin className="h-3.5 w-3.5 text-slate-300" /> {job.locationType || 'Remote'}
                            </div>
                          </TableCell>
                          <TableCell className="py-8">
                            <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest italic">
                              <Clock className="h-3.5 w-3.5" /> {format(new Date(job.deadline), 'dd MMM yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="py-8 pr-10 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors"
                              >
                                {isExpanded ? 'CLOSE' : 'DETAILS'}
                              </Button>
                              <Button
                                className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/student/apply/${job.id || job._id}`);
                                }}
                              >
                                APPLY
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded details row */}
                        {isExpanded && (
                          <TableRow className="bg-slate-50/50 border-none hover:bg-slate-50/50">
                            <TableCell colSpan={5} className="p-0 border-none">
                              <div className="px-10 py-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                  <div className="space-y-8">
                                    <div className="space-y-3">
                                      <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Job Description</h5>
                                      <p className="text-slate-500 text-sm font-medium leading-relaxed italic">{job.description}</p>
                                    </div>
                                    <div className="space-y-4">
                                      <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Required Skills</h5>
                                      <div className="flex flex-wrap gap-2">
                                        {(job.skills || []).map((skill: string) => (
                                          <Badge key={skill} variant="outline" className="rounded-lg border-slate-200 bg-white px-3 py-1 font-black text-[9px] uppercase tracking-widest text-slate-500 italic">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                      <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl" />
                                      <div className="space-y-1 relative">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                                        <p className="text-sm font-black text-slate-700 italic">{job.experienceRequired || 'Freshman'}</p>
                                      </div>
                                      <div className="space-y-1 relative">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Job Type</p>
                                        <p className="text-sm font-black text-slate-700 italic">{job.jobType || 'Full-time'}</p>
                                      </div>
                                      <div className="space-y-1 relative">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Applicants</p>
                                        <p className="text-sm font-black text-slate-700 italic">{job.applicationCount || 0} People Applied</p>
                                      </div>
                                      <div className="space-y-1 relative">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selection Process</p>
                                        <p className="text-sm font-black text-slate-700 italic">Resume + Assessment + Interview</p>
                                      </div>
                                    </div>
                                    <Button
                                      className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-xl shadow-indigo-100"
                                      onClick={() => navigate(`/student/apply/${job.id || job._id}`)}
                                    >
                                      PROCEED TO APPLICATION <ArrowRight className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment >
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PremiumJobCard({ job, onApply, matchScore, isRecommended }: any) {
  const navigate = useNavigate();
  return (
    <Card className={cn(
      "group relative border-slate-200 shadow-sm hover:shadow-lg transition-all duration-700 rounded-[3rem] overflow-hidden bg-white border",
      isRecommended && "ring-1 ring-primary/30 bg-slate-50/50 shadow-md shadow-primary/5"
    )}>
      {isRecommended && (
        <div className="absolute top-0 right-0 p-8">
          <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 shadow-2xl shadow-primary/30 italic">
            <Zap className="h-3 w-3 fill-current animate-pulse" /> {matchScore}% MATCH
          </Badge>
        </div>
      )}

      <CardContent className="p-10 space-y-8 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-1000" />

        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[1.75rem] bg-slate-50 shadow-inner flex items-center justify-center font-black text-primary text-3xl border border-slate-100 group-hover:rotate-6 transition-transform duration-500">
            {job.companyName.charAt(0)}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h4 className="font-black text-2xl leading-none uppercase italic tracking-tighter group-hover:text-primary transition-colors text-slate-900 truncate">{job.roleTitle}</h4>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] italic">
              <Building2 className="h-3.5 w-3.5 text-primary/50" /> {job.companyName}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 py-6 border-y border-slate-100 relative">
          <div className="bg-primary/5 text-primary px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 border border-primary/10 shadow-sm">
            <IndianRupee className="h-3.5 w-3.5" /> {job.package || job.ctcBand}
          </div>
          <Badge variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-500 font-black text-[9px] flex items-center gap-2 px-4 py-2 uppercase tracking-widest shadow-none">
            <MapPin className="h-3.5 w-3.5 text-primary/40" /> {job.locationType}
          </Badge>
          <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-rose-500 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 italic">
            <Clock className="h-3.5 w-3.5" /> {format(new Date(job.deadline), 'dd MMM')}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-3 min-h-[48px] italic">{job.description}</p>
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 3).map((s: string) => (
              <Badge key={s} variant="secondary" className="bg-slate-50 text-slate-600 border border-slate-200 text-[9px] font-black py-1.5 px-3 rounded-xl uppercase tracking-widest italic shadow-none">{s}</Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="bg-primary/5 text-primary/60 border border-primary/10 text-[9px] font-black py-1.5 px-3 rounded-xl uppercase tracking-widest italic shadow-none">
                +{job.skills.length - 3} MORE
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 h-14 rounded-2xl font-black gap-3 border-slate-200 hover:bg-slate-50 text-slate-600 uppercase text-[10px] tracking-widest"
            onClick={() => navigate(`/student/jobs/${job.id || job._id}`)}
          >
            VIEW DETAILS
          </Button>
          <Button
            className="flex-1 h-14 rounded-2xl font-black gap-3 shadow-lg shadow-primary/10 transition-all group-hover:translate-y-[-2px] group-hover:shadow-primary/20 bg-primary hover:bg-primary/90 text-white uppercase text-[10px] tracking-widest"
            onClick={onApply}
          >
            APPLY NOW <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
