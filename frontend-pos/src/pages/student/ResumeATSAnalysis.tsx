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
  const { applications } = useAppSelector((state) => state.applications);
  const [atsAnalysis, setATSAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const application = applications.find(a => a.id === applicationId) as Application | undefined;

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
      <DashboardLayout title="Application Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">This application does not exist.</p>
          <Button variant="link" onClick={() => navigate('/student/applications')}>
            Back to Applications
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
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Analyzing your resume...</p>
            </div>
          </div>
        ) : atsAnalysis ? (
          <>
            {/* ATS Score Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ATS Compatibility Score</CardTitle>
                    <CardDescription>Based on industry standards and role requirements</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">
                      {atsAnalysis.atsScore.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">out of 100</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={atsAnalysis.atsScore} className="h-3" />
                <Alert className={atsAnalysis.passed ? "border-green-200 bg-green-50" : "border-destructive bg-destructive/5"}>
                  <AlertDescription className="flex items-start gap-2">
                    {atsAnalysis.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <span>{atsAnalysis.summary}</span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {atsAnalysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                      <span className="text-sm text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {atsAnalysis.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold text-lg leading-none">!</span>
                      <span className="text-sm text-amber-900">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Keyword Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Keyword Analysis</CardTitle>
                <CardDescription>Technical keywords found in your resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3">Detected Keywords ({atsAnalysis.keywordMatches.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {atsAnalysis.keywordMatches.map((match, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border"
                      >
                        <span className="text-sm font-medium">{match.keyword}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {match.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">×{match.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {atsAnalysis.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Missing Keywords ({atsAnalysis.missingKeywords.length})</h4>
                    <div className="space-y-2">
                      {atsAnalysis.missingKeywords.map((keyword, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                          <span className="text-red-600">×</span>
                          <span className="text-sm text-red-700">{keyword}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Readability Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Readability Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Character Count</p>
                    <p className="text-xl font-bold">{atsAnalysis.readability.charCount}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Word Count</p>
                    <p className="text-xl font-bold">{atsAnalysis.readability.wordCount}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Sentences</p>
                    <p className="text-xl font-bold">{atsAnalysis.readability.sentenceCount}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Avg Words/Sentence</p>
                    <p className="text-xl font-bold">{atsAnalysis.readability.avgWordsPerSentence.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formatting Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Formatting & Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="text-sm font-medium">Proper Structure</span>
                    {atsAnalysis.formatting.hasProperStructure ? (
                      <Badge className="bg-green-600">Passed</Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="text-sm font-medium">Contact Information</span>
                    {atsAnalysis.formatting.hasContactInfo ? (
                      <Badge className="bg-green-600">Present</Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border">
                    <span className="text-sm font-medium">Clear Sections</span>
                    {atsAnalysis.formatting.hasClearSections ? (
                      <Badge className="bg-green-600">Good</Badge>
                    ) : (
                      <Badge variant="destructive">Needs Work</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Based on this analysis, consider the following actions to improve your resume's ATS compatibility:
                </p>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li className="text-muted-foreground">Incorporate the missing keywords naturally throughout your resume</li>
                  <li className="text-muted-foreground">Implement the improvement suggestions</li>
                  <li className="text-muted-foreground">Add quantifiable metrics and results for each role</li>
                  <li className="text-muted-foreground">Use action verbs to start bullet points</li>
                  <li className="text-muted-foreground">Keep your formatting clean and ATS-friendly</li>
                </ol>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/student/applications')}
              >
                Back to Applications
              </Button>
              {atsAnalysis.passed && (
                <Button
                  onClick={() => navigate(`/student/applications/${applicationId}/assessment`)}
                  className="ml-auto"
                >
                  Proceed to Assessment
                </Button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
