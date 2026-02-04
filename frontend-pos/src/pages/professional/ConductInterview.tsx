import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, Star, CheckCircle, XCircle,
  ShieldCheck, Zap, User, Briefcase,
  Building2, Monitor, Fingerprint, Activity,
  FileText, ArrowRight, MessageSquare, AlertTriangle,
  BrainCircuit, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConductInterview() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAppSelector((state) => state.auth);

  const { data: applicationData, isLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => applicationService.getApplicationById(appId!),
    enabled: !!appId,
  });

  const application = applicationData?.data as any;

  const [rating, setRating] = useState<number>(3);
  const [recommendation, setRecommendation] = useState<'Pass' | 'Fail'>('Pass');
  const [comments, setComments] = useState('');
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);

  const improvementOptions = [
    'Communication Skills',
    'Technical Skills',
    'Problem Solving',
    'Domain Knowledge',
  ];

  const submitFeedbackMutation = useMutation({
    mutationFn: (data: {
      applicationId: string;
      round: 'professional' | 'manager' | 'hr';
      rating: number;
      comments: string;
      improvementAreas?: string[];
      recommendation: 'Pass' | 'Fail';
    }) => applicationService.submitInterviewFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
      queryClient.invalidateQueries({ queryKey: ['professional-applications'] });
      toast.success('Evaluation submitted successfully');
      navigate('/professional/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Submission failed');
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Interview Evaluation" subtitle="Loading interview data...">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!application || !user) {
    return (
      <DashboardLayout title="Interview Evaluation" subtitle="Interview Not Found">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-background/50 backdrop-blur-sm p-24 text-center space-y-6">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <p className="text-muted-foreground font-black text-xs uppercase tracking-widest leading-none">The interview you are looking for is not available.</p>
          <Button onClick={() => navigate('/professional/dashboard')} variant="outline" className="rounded-2xl h-12 px-8 font-black border-2 uppercase text-xs tracking-widest">
            Back to Dashboard
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const job = application.jobId;
  const student = application.studentId;

  const handleToggleImprovement = (area: string) => {
    setImprovementAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = () => {
    if (!comments.trim()) return toast.error('Please provide evaluation feedback');
    if (recommendation === 'Fail' && improvementAreas.length === 0) return toast.error('Please specify areas of improvement');

    let round: 'professional' | 'manager' | 'hr' = 'professional';
    if (application.status.includes('manager')) round = 'manager';
    else if (application.status.includes('hr')) round = 'hr';

    submitFeedbackMutation.mutate({
      applicationId: application.id || application._id,
      round,
      rating,
      comments,
      improvementAreas: recommendation === 'Fail' ? improvementAreas : undefined,
      recommendation,
    });
  };

  const getRoundTitle = () => {
    if (application.status.includes('manager')) return 'Strategic Managerial';
    if (application.status.includes('hr')) return 'Human Resources Hub';
    return 'Technical Specialization';
  };

  return (
    <DashboardLayout
      title="Interview Evaluation"
      subtitle={`Conducting ${getRoundTitle()} for ${student?.name || 'Candidate'}`}
    >
      <div className="max-w-[1400px] mx-auto space-y-10 pb-12">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
              <Monitor className="h-10 w-10 text-primary" />
              Interview Progress
            </h1>
            <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em] ml-14">Role: {job?.roleTitle}</p>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-3xl border border-muted/50">
            <div className="text-right">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Interview Status</p>
              <p className="text-xs font-black uppercase text-rose-500">Live Feedback Active</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <Activity className="h-6 w-6 text-rose-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 space-y-8">

            {/* Candidate Intelligence Briefing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-600 text-white p-8 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">ATS SCANNING RESULT</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black">{application.resumeScore || 0}</span>
                  <span className="text-xs font-bold opacity-40">/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${application.resumeScore || 0}%` }} />
                </div>
                <p className="text-[10px] font-bold mt-4 opacity-70 line-clamp-2 italic">
                  "{application.atsAnalysis?.summary || "Semantic profile alignment verified via NLP processing."}"
                </p>
              </Card>

              <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">ASSESSMENT DEPTH</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-black">{application.assessmentScore || 0}</span>
                  <span className="text-xs font-bold opacity-40">/100</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={cn(
                      "h-1.5 flex-1 rounded-full transition-all",
                      s <= (application.assessmentScore / 20) ? "bg-primary" : "bg-white/10"
                    )} />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[10px] font-black tracking-widest text-primary uppercase">Elite Tier Candidate</p>
                  <Zap className="h-3 w-3 text-primary animate-pulse" />
                </div>
              </Card>

              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white border border-slate-200 p-8 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 h-24 w-24 bg-rose-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">BEHAVIORAL AI SUMMARY</p>
                <div className="relative z-10 space-y-3">
                  <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 mb-2">
                    <Sparkles className="h-5 w-5 text-rose-500" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic line-clamp-4">
                    "{application.aiInterviewSummary || "Psychometric evaluation pending or in terminal processing state."}"
                  </p>
                </div>
              </Card>
            </div>

            {/* Feedback Interface */}
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-background/50 backdrop-blur-xl border border-muted ring-1 ring-primary/5">
              <CardHeader className="p-10 pb-4 border-b bg-muted/20">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                  <BrainCircuit className="h-6 w-6 text-primary" /> Evaluation Feedback
                </CardTitle>
                <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Provide detailed assessment of the candidate</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">

                {/* Rating Slider */}
                <div className="space-y-6">
                  <Label className="flex items-center justify-between ml-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating Scale</span>
                    <span className="text-xl font-black text-primary uppercase">{rating}.0 / 5.0</span>
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={[rating]}
                      onValueChange={(value) => setRating(value[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-3">
                      <span>Needs Improvement</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>

                {/* Recommendation Hub */}
                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Overall Recommendation</Label>
                  <RadioGroup value={recommendation} onValueChange={(value: any) => setRecommendation(value)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={cn(
                      "flex items-center space-x-4 p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300",
                      recommendation === 'Pass' ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20 shadow-xl shadow-emerald-500/5Scale" : "border-muted bg-muted/10 opacity-60 hover:opacity-100"
                    )}>
                      <RadioGroupItem value="Pass" id="pass" className="border-emerald-500" />
                      <Label htmlFor="pass" className="flex-1 cursor-pointer space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="font-black text-sm uppercase tracking-tight">Pass Candidate</span>
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase opacity-60">Candidate is qualified for the next round.</p>
                      </Label>
                    </div>

                    <div className={cn(
                      "flex items-center space-x-4 p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300",
                      recommendation === 'Fail' ? "border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/20 shadow-xl shadow-rose-500/5" : "border-muted bg-muted/10 opacity-60 hover:opacity-100"
                    )}>
                      <RadioGroupItem value="Fail" id="fail" className="border-rose-500" />
                      <Label htmlFor="fail" className="flex-1 cursor-pointer space-y-1">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-rose-600" />
                          <span className="font-black text-sm uppercase tracking-tight">Reject Candidate</span>
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase opacity-60">Candidate does not meet the requirements.</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Improvement Checkboxes (Logical conditioned) */}
                <div className={cn(
                  "space-y-6 overflow-hidden transition-all duration-500",
                  recommendation === 'Fail' ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0 pointer-events-none"
                )}>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-1">Areas for Improvement</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {improvementOptions.map((area) => (
                      <div key={area} className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                        improvementAreas.includes(area) ? "border-rose-500/40 bg-rose-500/5" : "border-muted/50 bg-muted/5 hover:bg-muted/10"
                      )} onClick={() => handleToggleImprovement(area)}>
                        <Checkbox
                          id={area}
                          checked={improvementAreas.includes(area)}
                          className="border-rose-500"
                          onCheckedChange={() => { }} // Controlled by the div wrapper
                        />
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback Comments */}
                <div className="space-y-4">
                  <Label htmlFor="comments" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Evaluation Comments</Label>
                  <Textarea
                    id="comments"
                    placeholder="Enter your detailed feedback here..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={8}
                    className="rounded-[2.5rem] border-2 p-10 font-bold text-base focus-visible:ring-primary/20 bg-muted/10 border-muted placeholder:text-muted-foreground/30 shadow-inner resize-none leading-relaxed"
                  />
                  <p className="text-[9px] font-black uppercase text-muted-foreground/40 text-center tracking-widest flex items-center justify-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Please provide clear and constructive comments.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions & History */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">

            <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden group">
              <ShieldCheck className="absolute -right-6 -top-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase leading-tight">Submit Evaluation</h4>
                  <p className="text-white/70 text-xs font-medium leading-relaxed">By submitting, you formally save this evaluation. This action cannot be undone.</p>
                </div>

                <div className="space-y-4">
                  <Button
                    className={cn(
                      "w-full h-20 rounded-[2rem] font-black text-lg shadow-2xl gap-3 group/btn uppercase tracking-widest transition-all",
                      recommendation === 'Pass' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                    )}
                    onClick={handleSubmit}
                    disabled={submitFeedbackMutation.isPending}
                  >
                    {submitFeedbackMutation.isPending ? 'SUBMITTING...' : recommendation === 'Pass' ? 'Confirm Pass' : 'Confirm Rejection'}
                    <ArrowRight className="h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate('/professional/dashboard')}
                    className="w-full text-white/50 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-3xl border border-white/5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Secure Verification Active</p>
                </div>
              </div>
            </Card>

            {/* Previous History Briefing */}
            {application.interviewFeedback && application.interviewFeedback.length > 0 && (
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-background/50 backdrop-blur-sm p-8 border space-y-6">
                <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Past Rounds
                </h4>
                <div className="space-y-6">
                  {application.interviewFeedback.map((f: any, idx: number) => (
                    <div key={idx} className="bg-muted/20 p-6 rounded-2xl border-l-4 border-l-primary/30 space-y-2">
                      <div className="flex justify-between items-center">
                        <Badge className="bg-primary/5 text-primary border-none font-black text-[8px] uppercase">{f.round} Round</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">{f.rating}/5</span>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed line-clamp-3">"{f.feedback || f.comments}"</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-background/50 backdrop-blur-sm p-8 border space-y-6">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-primary" />
                <h4 className="font-black text-[10px] uppercase tracking-widest">Help & Info</h4>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground/60 leading-relaxed">Student details will be updated immediately after submission. Please ensure all feedback is accurate.</p>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfileItem({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-1 group">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary opacity-60" />
        <p className="text-sm font-black text-foreground tracking-tight line-clamp-1">{value || 'N/A'}</p>
      </div>
    </div>
  );
}
