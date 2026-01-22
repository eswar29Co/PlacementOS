import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { Student } from '@/types';
import {
  Upload, FileText, ArrowLeft, CheckCircle2,
  AlertTriangle, Zap, Sparkles, Target,
  ShieldCheck, Search, ChevronRight, BarChart3,
  Globe, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { generateATSAnalysis } from '@/lib/atsUtils';
import { applicationService } from '@/services/applicationService';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';
import { cn } from '@/lib/utils';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;

  // Fetch jobs (Preserving logic)
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = (() => {
    if (!jobsData?.data) return [];
    if (Array.isArray(jobsData.data)) return jobsData.data;
    if ('jobs' in jobsData.data && Array.isArray(jobsData.data.jobs)) return jobsData.data.jobs;
    return [];
  })();
  const job = jobs.find(j => (j.id === jobId || j._id === jobId));

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [showAtsDetails, setShowAtsDetails] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  if (isLoading) {
    return (
      <DashboardLayout title="Apply for Job" subtitle="Fetching job details...">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout title="Page Error" subtitle="The job you are trying to reach is offline.">
        <div className="text-center py-24 space-y-6">
          <Zap className="h-16 w-16 text-rose-500 mx-auto" />
          <Button variant="link" className="font-black text-primary" onClick={() => navigate('/student/browse-jobs')}>RETURN TO JOBS</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setAtsAnalysis(null);
      toast.success('Resume uploaded to system');
    }
  };

  const handleATSAnalysis = async () => {
    if (!resumeFile) return toast.error('Upload resume first');
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const jobDescription = `${job?.description} ${job?.requirements?.join(' ')} ${job?.skills?.join(' ')}`;
    setAtsAnalysis(generateATSAnalysis(resumeFile.name, jobDescription, job?.roleTitle));
    setAnalyzing(false);
    toast.success('Resume analysis complete!');
  };

  const handleSubmit = async () => {
    if (!resumeFile || !jobId) return toast.error('Resume required for application');
    setUploading(true);
    try {
      const resumeUrl = `/uploads/${resumeFile.name}`;
      const result = await applicationService.applyForJob({ jobId, resumeUrl });
      if (result.success) {
        toast.success('Application submitted! Directing to My Applications.');
        navigate('/student/applications');
      }
    } catch (error: any) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Submit Application" subtitle={`Applying for ${job.companyName}`}>
      <div className="max-w-[1000px] mx-auto space-y-10 pb-12">
        <Button variant="ghost" className="rounded-xl font-black text-xs uppercase hover:bg-slate-50 transition-all group text-slate-400 border border-transparent hover:border-slate-100" onClick={() => navigate('/student/browse-jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Cancel Application
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Section 1: Dossier Upload */}
          <div className="space-y-8">
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden group bg-white border">
              <CardHeader className="p-8 border-b border-slate-100 bg-slate-50">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-900">
                  <Upload className="h-6 w-6 text-primary" /> Resume Upload
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Submit your profile for smart screening</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="relative group/upload">
                  <input type="file" id="resume-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                  <label htmlFor="resume-upload" className={cn(
                    "block p-12 border-2 border-dashed rounded-[2rem] text-center transition-all cursor-pointer",
                    resumeFile ? "border-emerald-500/50 bg-emerald-50" : "border-slate-200 hover:border-primary/50 bg-slate-50"
                  )}>
                    {resumeFile ? (
                      <div className="space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="h-16 w-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase text-emerald-600 italic">{resumeFile.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Resume Received</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileText className="h-16 w-16 text-slate-300 mx-auto" />
                        <div>
                          <p className="font-black text-xs uppercase tracking-widest text-slate-400">Select Resume File</p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase mt-1 italic">PDF / DOCX (MAX 5MB)</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Application Steps</h4>
                  <div className="space-y-3">
                    {[
                      { step: "01", text: "Resume matching" },
                      { step: "02", text: "AI skill verification" },
                      { step: "03", text: "Assessment invite" }
                    ].map(p => (
                      <div key={p.step} className="flex items-center gap-4 text-xs font-bold text-slate-500 italic">
                        <span className="text-primary font-black opacity-30">{p.step}</span>
                        {p.text}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-20 rounded-[2rem] font-black text-xl gap-3 shadow-2xl shadow-primary/20 group hover:translate-y-[-4px] transition-all"
              onClick={handleSubmit}
              disabled={!resumeFile || uploading}
            >
              {uploading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'} <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Section 2: Compatibility Analysis */}
          <div className="space-y-8">
            {!atsAnalysis ? (
              <Card className="border-none shadow-lg rounded-[2.5rem] bg-indigo-600 text-white p-10 overflow-hidden relative min-h-[400px] flex flex-col justify-center text-center">
                <Sparkles className="absolute -right-8 -top-8 h-40 w-40 opacity-10 animate-pulse" />
                <div className="relative z-10 space-y-6">
                  <h3 className="text-3xl font-black uppercase leading-tight italic tracking-tighter">Resume Smart Match</h3>
                  <p className="text-white/70 font-bold text-sm leading-relaxed mx-auto max-w-xs italic">Scan your resume against job requirements to see how you match up.</p>
                  <Button
                    className="bg-white text-indigo-700 font-black rounded-2xl h-14 px-10 shadow-xl hover:bg-slate-50 w-full"
                    onClick={handleATSAnalysis}
                    disabled={!resumeFile || analyzing}
                  >
                    {analyzing ? 'ANALYZING...' : 'ANALYZE MATCH'}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white border animate-in slide-in-from-right-8 duration-500">
                <CardHeader className="p-8 border-b border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-slate-900">
                      <BarChart3 className="h-6 w-6 text-primary" /> Match Result
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase text-slate-400 hover:text-primary" onClick={() => setAtsAnalysis(null)}>Reset Scan</Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Score</p>
                      <p className="text-4xl font-black text-primary italic leading-none">{atsAnalysis.atsScore}<span className="text-sm opacity-30">/100</span></p>
                    </div>
                    <Progress value={atsAnalysis.atsScore} className="h-4 rounded-full bg-slate-100 shadow-none border border-slate-200" />
                  </div>

                  <Alert className={cn(
                    "border-none rounded-[1.5rem] p-6 shadow-none",
                    atsAnalysis.passed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}>
                    <AlertDescription className="flex items-start gap-4 font-bold text-xs leading-relaxed italic">
                      {atsAnalysis.passed ? <ShieldCheck className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                      {atsAnalysis.summary}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key Skill Matches</h5>
                    <div className="flex flex-wrap gap-2">
                      {atsAnalysis.keywordMatches.slice(0, 8).map((m: any, i: number) => (
                        <Badge key={i} className="bg-slate-50 border border-slate-100 shadow-none text-slate-600 font-black uppercase text-[9px] px-3 py-1 rounded-lg italic">
                          {m.keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-3xl border border-dashed border-amber-200">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
                      <Zap className="h-3 w-3 fill-current" /> Suggested Optimization
                    </h5>
                    <ul className="space-y-2">
                      {atsAnalysis.missingKeywords.slice(0, 3).map((k: string, i: number) => (
                        <li key={i} className="text-xs font-bold text-amber-700/70 flex items-center gap-2 italic">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Integrate "{k}" into core experience
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button variant="ghost" className="w-full rounded-2xl font-black text-[10px] uppercase text-primary hover:bg-primary/5 h-12">View Match Details</Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] p-8 border bg-white">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">Next Steps</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed italic">After submitting, your assessment link will be sent to you within 24 hours.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
