import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Application } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { cn } from '@/lib/utils';

interface KeywordMatch {
  keyword: string;
  category: string;
  frequency: number;
}

interface FormattingAnalysis {
  hasProperStructure: boolean;
  hasContactInfo: boolean;
  hasClearSections: boolean;
  formatIssues: string[];
}

interface ReadabilityMetrics {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
}

interface ATSAnalysis {
  atsScore: number;
  passed: boolean;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordMatches: KeywordMatch[];
  missingKeywords: string[];
  formatting: FormattingAnalysis;
  readability: ReadabilityMetrics;
}

export default function ResumeATSAnalysis() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [atsAnalysis, setATSAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch application from MongoDB
  const { data: applicationData } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplicationById(applicationId!),
    enabled: !!applicationId,
  });
  const application = applicationData?.data;

  useEffect(() => {
    // Simulate fetching ATS analysis
    if (application) {
      setTimeout(() => {
        const mockAnalysis: ATSAnalysis = {
          atsScore: 72,
          passed: true,
          summary: "Good! Your resume is well-structured with relevant keywords. Minor improvements could enhance your chances.",
          strengths: [
            "Good resume length with sufficient detail",
            "Contact information is clearly provided",
            "Well-organized with clear sections",
            "Strong technical keyword alignment"
          ],
          improvements: [
            "Add missing keywords: microservices, docker, kubernetes",
            "Add specific metrics and numbers to quantify achievements",
            "Replace passive phrases with action verbs"
          ],
          keywordMatches: [
            { keyword: "java", category: "languages", frequency: 3 },
            { keyword: "spring", category: "frameworks", frequency: 2 },
            { keyword: "sql", category: "databases", frequency: 2 },
            { keyword: "docker", category: "tools", frequency: 1 },
            { keyword: "rest api", category: "concepts", frequency: 2 }
          ],
          missingKeywords: ["kubernetes", "microservices", "aws", "ci/cd"],
          formatting: {
            hasProperStructure: true,
            hasContactInfo: true,
            hasClearSections: true,
            formatIssues: []
          },
          readability: {
            charCount: 2150,
            wordCount: 380,
            sentenceCount: 28,
            avgWordsPerSentence: 13.6
          }
        };
        setATSAnalysis(mockAnalysis);
        setLoading(false);
      }, 1500);
    }
  }, [application]);

  if (!application) {
    return (
      <DashboardLayout title="Application Not Found" subtitle="Requested node is currently unavailable.">
        <div className="text-center py-24 space-y-6">
          <AlertTriangle className="h-16 w-16 text-rose-500 mx-auto" />
          <p className="text-slate-400 font-bold italic">This application does not exist or has been archived.</p>
          <Button variant="link" className="font-black text-primary uppercase text-xs tracking-widest" onClick={() => navigate('/student/applications')}>
            Back to My Applications
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Resume ATS Analysis"
      subtitle="Get detailed insights and improvements for your resume"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary rounded-full blur opacity-10 animate-pulse" />
              <div className="h-16 w-16 border-4 border-primary border-t-transparent animate-spin rounded-full shadow-lg" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse italic">Analyzing Resume...</p>
          </div>
        ) : atsAnalysis ? (
          <>
            {/* ATS Score Card */}
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-md transition-all duration-500">
              <CardHeader className="p-10 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900 italic">Resume Match Score</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Based on industry standards and job requirements</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-primary italic tracking-tighter">
                      {atsAnalysis.atsScore.toFixed(0)}<span className="text-xs opacity-30 not-italic ml-1">/100</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <Progress value={atsAnalysis.atsScore} className="h-4 bg-slate-100 rounded-full border border-slate-200" />
                <Alert className={cn(
                  "border-none rounded-2xl p-6 shadow-sm",
                  atsAnalysis.passed ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                )}>
                  <AlertDescription className="flex items-start gap-4 font-bold text-xs italic leading-relaxed">
                    {atsAnalysis.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                    )}
                    <span>{atsAnalysis.summary}</span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
              <CardHeader className="p-10 pb-6">
                <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight text-slate-900 italic">
                  <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  Resume Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {atsAnalysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group/item hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                      <span className="text-emerald-500 font-black text-xs mt-0.5">✓</span>
                      <span className="text-xs font-bold text-slate-500 group-hover/item:text-emerald-700 italic leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="border-amber-100 shadow-sm rounded-[2.5rem] bg-amber-50/30 overflow-hidden group hover:shadow-md transition-all duration-500">
              <CardHeader className="p-10 pb-6 border-b border-amber-100/50">
                <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight text-amber-900 italic">
                  <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 border border-amber-200">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Suggested Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <ul className="space-y-4">
                  {atsAnalysis.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-amber-100 group/item hover:bg-amber-100/50 transition-all translate-x-0 hover:translate-x-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span className="text-sm font-bold text-amber-900/70 italic leading-relaxed">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Keyword Analysis */}
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
              <CardHeader className="p-10 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-900 italic">Keyword Analysis</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skills identified in your resume</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Detected Keywords ({atsAnalysis.keywordMatches.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {atsAnalysis.keywordMatches.map((match, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-white transition-all group/key"
                      >
                        <span className="text-sm font-black text-slate-600 uppercase tracking-tight italic group-hover/key:text-primary transition-colors">{match.keyword}</span>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-white border-slate-200 text-slate-400 italic px-3 py-1 rounded-lg">
                            {match.category}
                          </Badge>
                          <span className="text-xs font-black text-slate-300 italic">×{match.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {atsAnalysis.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-6 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Missing Keywords ({atsAnalysis.missingKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {atsAnalysis.missingKeywords.map((keyword, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-xl border border-rose-100 hover:bg-rose-100 transition-all cursor-default group/missing">
                          <AlertTriangle className="h-3 w-3 text-rose-500 opacity-50 group-hover/missing:opacity-100 transition-opacity" />
                          <span className="text-[11px] font-black text-rose-700/70 uppercase tracking-tight italic">{keyword}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Readability Metrics */}
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
              <CardHeader className="p-10 pb-6">
                <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-900 italic">Resume Formatting</CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Character Count", value: atsAnalysis.readability.charCount },
                    { label: "Word Count", value: atsAnalysis.readability.wordCount },
                    { label: "Sentences", value: atsAnalysis.readability.sentenceCount },
                    { label: "Avg Words/Sentence", value: atsAnalysis.readability.avgWordsPerSentence.toFixed(1) }
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group/stat hover:bg-white hover:border-primary/20 transition-all">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-900 italic tracking-tighter group-hover/stat:text-primary transition-colors">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Formatting Analysis */}
            <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
              <CardHeader className="p-10 pb-6">
                <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-900 italic">Resume Checklist</CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <div className="space-y-4">
                  {[
                    { label: "Proper Structure", passed: atsAnalysis.formatting.hasProperStructure, label_passed: "Verified", label_failed: "Error" },
                    { label: "Contact Info", passed: atsAnalysis.formatting.hasContactInfo, label_passed: "Present", label_failed: "Missing" },
                    { label: "Clear Sections", passed: atsAnalysis.formatting.hasClearSections, label_passed: "Compliant", label_failed: "Incomplete" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-tight italic">{item.label}</span>
                      {item.passed ? (
                        <Badge className="bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-lg italic shadow-lg shadow-emerald-500/10">
                          {item.label_passed}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-lg italic">
                          {item.label_failed}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-primary/20 shadow-sm rounded-[2.5rem] bg-primary/5 overflow-hidden">
              <CardHeader className="p-10 pb-6 border-b border-primary/10">
                <CardTitle className="text-primary font-black uppercase italic tracking-tighter">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <p className="text-sm font-bold text-slate-500 italic leading-relaxed">
                  Based on this analysis, consider the following actions to improve your resume:
                </p>
                <ol className="space-y-4">
                  {[
                    "Incorporate the missing keywords naturally throughout your experience descriptions.",
                    "Implement the suggested quantitative metrics to demonstrate impact.",
                    "Strengthen achievements using industry-standard action verbs.",
                    "Maintain the current structure while adding the missing keywords."
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/50 border border-primary/5 group/step hover:bg-white transition-all">
                      <div className="h-6 w-6 rounded-lg bg-primary text-white flex items-center justify-center font-black text-[10px] shrink-0 italic shadow-md shadow-primary/20">0{i + 1}</div>
                      <span className="text-xs font-bold text-slate-500 italic group-hover/step:text-slate-900 transition-colors leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-10 pb-20">
              <Button
                variant="ghost"
                className="h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-3 italic border border-transparent hover:border-slate-100"
                onClick={() => navigate('/student/applications')}
              >
                Back to My Applications
              </Button>
              {atsAnalysis.passed && (
                <Button
                  onClick={() => navigate(`/student/assessment/${applicationId}`)}
                  className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all flex items-center gap-4 group/btn"
                >
                  Proceed to Assessment
                  <CheckCircle2 className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                </Button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
