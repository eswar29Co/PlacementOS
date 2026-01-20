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
import { Upload, FileText, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { generateATSAnalysis } from '@/lib/atsUtils';
import { applicationService } from '@/services/applicationService';
import { uploadService } from '@/services/uploadService';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  
  // Fetch jobs from MongoDB
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = (() => {
    if (!jobsData?.data) return [];
    if (Array.isArray(jobsData.data)) return jobsData.data;
    if ('jobs' in jobsData.data && Array.isArray(jobsData.data.jobs)) return jobsData.data.jobs;
    return [];
  })();
  const job = jobs.find(j => j.id === jobId);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [showAtsDetails, setShowAtsDetails] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setAtsAnalysis(null); // Reset analysis when file changes
    }
  };

  const handleATSAnalysis = async () => {
    if (!resumeFile) {
      toast.error('Please upload your resume first');
      return;
    }

    setAnalyzing(true);
    
    try {
      // Simulate resume content reading
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock resume content with some variation
      const mockResumeContent = `
      Professional Resume
      Contact: candidate@email.com | (555) 123-4567
      
      Professional Summary
      Experienced software developer skilled in full-stack development.
      Expertise in building scalable applications and cloud solutions.
      
      Experience
      Senior Developer - Tech Company (2021-Present)
      - Developed microservices using Spring Boot, Docker, and Kubernetes
      - Built REST APIs and worked with PostgreSQL databases
      - Implemented CI/CD pipelines using Jenkins and Maven
      - Experience with cloud platforms including AWS
      
      Junior Developer - Startup (2019-2021)
      - Developed web applications using React and JavaScript/TypeScript
      - Worked with Git for version control
      - Implemented unit testing with Jest and Selenium
      
      Education
      Bachelor of Science in Computer Science (2019)
      
      Technical Skills
      Languages: Java, JavaScript, TypeScript, Python, SQL
      Frameworks: Spring Boot, React, Express.js
      Tools: Docker, Git, Maven, Jenkins
      Databases: PostgreSQL, MongoDB
      Cloud: AWS, Azure
      Other: REST APIs, Microservices, Agile Development
    `;

      // Generate ATS analysis with job description context
      const jobDescription = `${job?.description} ${job?.requirements?.join(' ')} ${job?.skills?.join(' ')}`;
      const analysisResult = generateATSAnalysis(mockResumeContent, jobDescription, job?.roleTitle);

      setAtsAnalysis(analysisResult);
      setAnalyzing(false);
      toast.success('ATS analysis complete!');
    } catch (error) {
      console.error('ATS Analysis Error:', error);
      setAnalyzing(false);
      toast.error('Failed to analyze resume. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    if (!jobId) {
      toast.error('Invalid job ID');
      return;
    }

    setUploading(true);

    try {
      // Upload resume file
      const uploadResponse = await uploadService.uploadFile(resumeFile);
      const resumeUrl = uploadResponse.data.url;
      
      const result = await applicationService.applyForJob({
        jobId,
        resumeUrl,
      });

      if (result.success) {
        toast.success('Application submitted successfully! Your resume is being reviewed.');
        navigate('/student/applications');
      }
    } catch (error: any) {
      console.error('Application error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title={`Apply to ${job.companyName}`} subtitle={job.roleTitle}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(`/student/jobs/${jobId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job Details
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
            <CardDescription>
              Your resume will be automatically screened by AI for this role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                {resumeFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                    <p className="font-medium">{resumeFile.name}</p>
                    <p className="text-sm text-muted-foreground">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="font-medium">Click to upload resume</p>
                    <p className="text-sm text-muted-foreground">PDF, DOC, DOCX (Max 5MB)</p>
                  </div>
                )}
              </label>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Analyze your resume match for this role
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  AI screens your resume for this role
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  If shortlisted, assessment will be released (2 days to complete)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  Pass assessment to unlock interview rounds
                </li>
              </ul>
            </div>

            {resumeFile && !atsAnalysis && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleATSAnalysis}
                disabled={analyzing}
              >
                {analyzing ? 'Analyzing Resume...' : 'Analyze Resume for This Job'}
              </Button>
            )}

            {atsAnalysis && (
              <div className="space-y-4 border-t pt-4">
                {!showAtsDetails ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">ATS Match Score</h4>
                        <span className="text-2xl font-bold text-blue-600">{atsAnalysis.atsScore}/100</span>
                      </div>
                      <Progress value={atsAnalysis.atsScore} className="h-2" />
                    </div>

                    <Alert className={atsAnalysis.passed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
                      <AlertDescription className="flex items-start gap-2 text-sm">
                        {atsAnalysis.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{atsAnalysis.summary}</span>
                      </AlertDescription>
                    </Alert>

                    {atsAnalysis.keywordMatches.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold">Job Keywords Found</h5>
                        <div className="flex flex-wrap gap-1">
                          {atsAnalysis.keywordMatches.slice(0, 6).map((match: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {match.keyword}
                            </Badge>
                          ))}
                          {atsAnalysis.keywordMatches.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{atsAnalysis.keywordMatches.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {atsAnalysis.missingKeywords.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-amber-700">Missing Keywords</h5>
                        <p className="text-xs text-muted-foreground">
                          Consider adding: {atsAnalysis.missingKeywords.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setShowAtsDetails(true)}
                    >
                      View Detailed Analysis
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Job Match Analysis</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAtsDetails(false)}
                      >
                        ← Back
                      </Button>
                    </div>

                    <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-sm">Job Match Score</h5>
                        <span className="text-3xl font-bold text-blue-600">{atsAnalysis.atsScore}/100</span>
                      </div>
                      <Progress value={atsAnalysis.atsScore} className="h-3" />
                      <p className="text-xs text-blue-700">{atsAnalysis.summary}</p>
                    </div>

                    {atsAnalysis.strengths?.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-semibold text-sm text-green-700">✓ Your Strengths</h5>
                        <ul className="text-xs space-y-1.5">
                          {atsAnalysis.strengths.map((item: string, idx: number) => (
                            <li key={idx} className="flex gap-2 p-2 bg-green-50 rounded border border-green-200">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {atsAnalysis.improvements?.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-semibold text-sm text-amber-700">! Improvements Needed</h5>
                        <ul className="text-xs space-y-1.5">
                          {atsAnalysis.improvements.map((item: string, idx: number) => (
                            <li key={idx} className="flex gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {atsAnalysis.keywordMatches?.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-semibold text-sm">Keywords Detected ({atsAnalysis.keywordMatches.length})</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {atsAnalysis.keywordMatches.map((match: any, idx: number) => (
                            <div key={idx} className="text-xs p-2 bg-muted rounded border border-border">
                              <p className="font-medium text-primary">{match.keyword}</p>
                              <p className="text-muted-foreground text-xs">
                                {match.category} <span className="ml-1">×{match.frequency}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => setShowAtsDetails(false)}
                    >
                      Close Analysis
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={!resumeFile || uploading}
            >
              {uploading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
