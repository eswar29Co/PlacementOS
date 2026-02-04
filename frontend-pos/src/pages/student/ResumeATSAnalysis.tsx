import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, AlertTriangle, TrendingUp, FileText,
  Zap, Brain, Cpu, Sparkles, Target, Info,
  Search, ShieldCheck, Microscope
} from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface KeywordMatch {
  keyword: string;
  category: string;
  frequency: number;
}

interface ATSAnalysis {
  atsScore: number;
  semanticMatch: number;
  passed: boolean;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordMatches: KeywordMatch[];
  missingKeywords: string[];
  formatting: {
    hasContactInfo: boolean;
    readability: {
      charCount: number;
      wordCount: number;
    }
  }
}

export default function ResumeATSAnalysis() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [atsAnalysis, setATSAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: applicationData } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplicationById(applicationId!),
    enabled: !!applicationId,
  });

  const application = applicationData?.data;

  useEffect(() => {
    if (application) {
      const results = application.atsAnalysis;
      const analysis: ATSAnalysis = {
        atsScore: application.resumeScore || 0,
        semanticMatch: results?.semantic_match || 0,
        passed: (application.resumeScore || 0) >= 60,
        summary: results?.summary || results?.suggestions?.[0] || "Analysis complete.",
        strengths: results?.matchedKeywords?.map((k: string) => `Strong proficiency in ${k}`) || ["Professional layout detected"],
        improvements: results?.suggestions || ["Tailor content for better semantic alignment"],
        keywordMatches: results?.matchedKeywords?.map((k: string) => ({
          keyword: k,
          category: "Technical",
          frequency: 1
        })) || [],
        missingKeywords: results?.missingKeywords || [],
        formatting: {
          hasContactInfo: results?.hasContactInfo ?? true,
          readability: {
            charCount: results?.readability?.charCount || 0,
            wordCount: results?.readability?.wordCount || 0
          }
        }
      };
      setATSAnalysis(analysis);
      setLoading(false);
    }
  }, [application]);

  if (loading) {
    return (
      <DashboardLayout title="AI Analysis" subtitle="Processing Intelligence">
        <div className="flex flex-col items-center justify-center py-40 space-y-8">
          <div className="relative">
            <div className="absolute -inset-10 bg-primary/20 rounded-full blur-[50px] animate-pulse" />
            <div className="h-24 w-24 border-4 border-primary border-t-transparent animate-spin rounded-[2rem] shadow-2xl relative z-10" />
            <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Running NLP Engine</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Scanning technical vectors and semantic alignment...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Resume Intelligence" subtitle="Deep NLP analysis of your professional profile">
      <div className="max-w-6xl mx-auto space-y-10 pb-20">

        {/* Top Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Score */}
          <Card className="lg:col-span-2 border-slate-200 shadow-2xl rounded-[3.5rem] overflow-hidden bg-white relative group">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            <CardHeader className="p-12 pb-6 border-b border-slate-50 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">ATS Engine v4.0</Badge>
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter text-slate-900">Match Accuracy</CardTitle>
                </div>
                <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 italic font-black text-2xl text-primary">
                  {atsAnalysis?.atsScore}%
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-12 space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alignment Progress</p>
                  <p className="text-[10px] font-black text-primary">{atsAnalysis?.atsScore}% / 100%</p>
                </div>
                <Progress value={atsAnalysis?.atsScore} className="h-4 bg-slate-100 rounded-full border border-slate-200" />
              </div>

              <div className={cn(
                "p-8 rounded-[2.5rem] flex items-start gap-6 border transition-all duration-500",
                atsAnalysis?.passed ? "bg-emerald-50/50 border-emerald-100" : "bg-primary/5 border-primary/10"
              )}>
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                  atsAnalysis?.passed ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary text-white shadow-primary/20"
                )}>
                  {atsAnalysis?.passed ? <ShieldCheck className="h-7 w-7" /> : <Microscope className="h-7 w-7" />}
                </div>
                <div className="space-y-2">
                  <p className="font-black text-xs uppercase tracking-widest text-slate-900">{atsAnalysis?.passed ? "Benchmark Cleared" : "Optimization Required"}</p>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed">{atsAnalysis?.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semantic Match */}
          <Card className="border-slate-200 shadow-xl rounded-[3.5rem] bg-slate-900 text-white p-12 overflow-hidden relative group border">
            <Brain className="absolute -right-6 -bottom-6 h-40 w-40 text-primary/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-10">
              <div className="space-y-2">
                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight">Semantic Analysis</h4>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Context Match</span>
                  <span className="text-2xl font-black text-primary">{atsAnalysis?.semanticMatch}%</span>
                </div>
                <Progress value={atsAnalysis?.semanticMatch} className="h-2 bg-white/5 rounded-full" />
                <p className="text-[11px] font-bold text-white/50 leading-relaxed">
                  Our NLP engine detected a {atsAnalysis?.semanticMatch}% similarity in professional context and domain expertise.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-6 w-6 rounded-full bg-white/10 border border-white/20" />
                    ))}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">NLP Logic v4.2</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Keyword Gap */}
          <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
            <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="flex items-center gap-4 text-xl font-black uppercase tracking-tight">
                <Target className="h-6 w-6 text-primary" />
                Technical Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
              <div className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detected Skills</h5>
                <div className="flex flex-wrap gap-3">
                  {atsAnalysis?.keywordMatches.map((k, i) => (
                    <Badge key={i} className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 px-4 py-2 rounded-xl font-black text-[10px] shadow-sm transition-all">
                      {k.keyword}
                    </Badge>
                  ))}
                  {atsAnalysis?.keywordMatches.length === 0 && <p className="text-xs italic text-slate-400">No matching keywords identified.</p>}
                </div>
              </div>

              {atsAnalysis?.missingKeywords && atsAnalysis.missingKeywords.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" /> Potential Gaps Detected
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    {atsAnalysis.missingKeywords.map((k, i) => (
                      <Badge key={i} variant="outline" className="border-rose-100 text-rose-600 bg-rose-50/30 px-4 py-2 rounded-xl font-black text-[10px] opacity-60 hover:opacity-100 transition-opacity">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Formatting */}
          <Card className="border-slate-200 shadow-sm rounded-[3rem] bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
            <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="flex items-center gap-4 text-xl font-black uppercase tracking-tight">
                <Search className="h-6 w-6 text-indigo-500" />
                Structural Scan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2 text-center group/stat hover:bg-white hover:border-indigo-100 transition-all">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Word Count</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter group-hover/stat:text-indigo-500">{atsAnalysis?.formatting.readability.wordCount}</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2 text-center group/stat hover:bg-white hover:border-indigo-100 transition-all">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Characters</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter group-hover/stat:text-indigo-500">{atsAnalysis?.formatting.readability.charCount}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Info Density</span>
                  <Badge className={cn(
                    "font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg",
                    atsAnalysis?.formatting.hasContactInfo ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                  )}>
                    {atsAnalysis?.formatting.hasContactInfo ? "VERIFIED" : "NOT FOUND"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 opacity-50">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Section Hierarchy</span>
                  <Badge className="bg-slate-200 text-slate-500 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg">SYSTEM CHECK</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Strategy */}
        <Card className="border-none shadow-2xl rounded-[3.5rem] bg-indigo-600 text-white p-12 overflow-hidden relative group">
          <div className="absolute top-0 right-0 h-96 w-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-black uppercase tracking-tighter">Optimization Strategy</h4>
                <p className="text-indigo-100/70 text-sm font-bold leading-relaxed">
                  Based on our NLP deep-scan, following these steps will significantly improve your match probability.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {atsAnalysis?.improvements.map((step, i) => (
                <div key={i} className="flex gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/item translate-x-0 hover:translate-x-4">
                  <div className="h-8 w-8 bg-indigo-400 text-indigo-900 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-lg">0{i + 1}</div>
                  <p className="text-xs font-bold leading-relaxed text-indigo-50">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-10">
          <Button
            variant="ghost"
            className="h-16 px-12 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all flex items-center gap-4 bg-slate-50 border-2 border-transparent hover:border-slate-100"
            onClick={() => navigate('/student/applications')}
          >
            Exit Intelligence View
          </Button>
          {atsAnalysis?.passed && (
            <Button
              onClick={() => navigate(`/student/assessment/${applicationId}`)}
              className="h-16 px-14 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] transition-all transform hover:scale-[1.05] flex items-center gap-4 group/pbtn"
            >
              Initialize Assessment Phase
              <TrendingUp className="h-5 w-5 group-hover/pbtn:translate-x-1 group-hover/pbtn:-translate-y-1 transition-transform" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
