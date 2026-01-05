import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { Student } from '@/types';
import { Upload, Github, Linkedin, FileText, Save, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { generateATSAnalysis } from '@/lib/atsUtils';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState<string>(student?.resumeUrl ? 'resume.pdf' : '');
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeName(file.name);
      toast.success('Resume selected: ' + file.name);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file');
      return;
    }

    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Resume uploaded successfully!');
  };

  const handleATSAnalysis = async () => {
    if (!resumeFile && !student?.resumeUrl) {
      toast.error('Please upload a resume first');
      return;
    }

    setAnalyzing(true);
    
    try {
      // Simulate reading resume file content
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock resume text for analysis (varies based on file name)
      const resumeFileText = resumeFile?.name || 'resume.pdf';
      const mockResumeContent = `
      ${resumeFileText}
      
      Contact: john.doe@example.com | (555) 123-4567
      
      Professional Summary
      Experienced software developer with passion for building scalable applications.
      Skilled in Java, Spring Boot, React, and cloud technologies.
      
      Experience
      Senior Developer - Tech Company (2021-Present)
      - Developed microservices using Spring Boot and Docker
      - Implemented REST APIs with Spring Framework
      - Managed databases using PostgreSQL and MongoDB
      - Collaborated with teams using Git and CI/CD pipelines
      - Improved application performance using Redis caching
      
      Developer - Startup (2019-2021)
      - Built web applications using React and JavaScript
      - Worked with AWS for cloud deployments
      - Implemented testing strategies using Jest
      
      Education
      Bachelor of Science in Computer Science
      University of Technology (2019)
      
      Skills
      Languages: Java, JavaScript, TypeScript, Python, SQL
      Frameworks: Spring Boot, React, Express.js
      Tools: Docker, Kubernetes, Git, Jenkins, Maven
      Databases: PostgreSQL, MongoDB, MySQL
      Cloud: AWS, Azure
      Concepts: REST APIs, Microservices, CI/CD, Agile, DevOps, Testing
    `;

      // Generate dynamic ATS analysis based on content
      const analysisResult = generateATSAnalysis(mockResumeContent);
      
      setAtsAnalysis(analysisResult);
      setAnalyzing(false);
      toast.success('ATS analysis complete!');
    } catch (error) {
      console.error('ATS Analysis Error:', error);
      setAnalyzing(false);
      toast.error('Failed to analyze resume. Please try again.');
    }
  };

  const handleSave = () => {
    // dispatch(updateUser({...updated values}));
    toast.success('Profile updated successfully!');
  };

  return (
    <DashboardLayout title="Profile" subtitle="Manage your profile and resume">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={student?.name} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={student?.email} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={student?.phone} />
              </div>
              <div className="space-y-2">
                <Label>College</Label>
                <Input defaultValue={student?.college} />
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Input defaultValue={student?.branch} />
              </div>
              <div className="space-y-2">
                <Label>CGPA</Label>
                <Input defaultValue={student?.cgpa?.toString()} type="number" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Graduation Year</Label>
                <Input defaultValue={student?.graduationYear?.toString()} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Skills</Label>
                <Input defaultValue={student?.skills?.join(', ')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Label>
                <Input defaultValue={student?.linkedinUrl} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub
                </Label>
                <Input defaultValue={student?.githubUrl} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resume</CardTitle>
              <CardDescription>Upload and scan your resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                <label htmlFor="resume-upload" className="cursor-pointer block">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    {resumeName ? `Selected: ${resumeName}` : 'Upload your resume (PDF, DOC, DOCX)'}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <FileText className="mr-2 h-4 w-4" />
                      Choose File
                    </span>
                  </Button>
                </label>
              </div>

              {resumeName && (
                <Button onClick={handleResumeUpload} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Save Resume
                </Button>
              )}

              {(student?.resumeUrl || resumeName) && (
                <div className="space-y-3">
                  <Button
                    onClick={handleATSAnalysis}
                    disabled={analyzing}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {analyzing ? 'Analyzing...' : 'Run ATS Analysis'}
                  </Button>

                  {resumeName && (
                    <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">{resumeName}</span>
                    </div>
                  )}

                  {student?.resumeUrl && !resumeName && (
                    <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">resume.pdf</span>
                    </div>
                  )}
                </div>
              )}

              {/* ATS Analysis Results */}
              {atsAnalysis && (
                <div className="space-y-4 border-t pt-4">
                  {!showDetailedAnalysis ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">ATS Score</h4>
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

                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-muted-foreground">Key Metrics</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-muted p-2 rounded">
                            <p className="text-muted-foreground">Words</p>
                            <p className="font-semibold">{atsAnalysis.readability.wordCount}</p>
                          </div>
                          <div className="bg-muted p-2 rounded">
                            <p className="text-muted-foreground">Keywords</p>
                            <p className="font-semibold">{atsAnalysis.keywordMatches.length}</p>
                          </div>
                        </div>
                      </div>

                      {atsAnalysis.improvements.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold text-amber-600">Improvements Needed</h5>
                          <ul className="text-xs space-y-1">
                            {atsAnalysis.improvements.slice(0, 2).map((item: string, idx: number) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-amber-600">•</span>
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => setShowDetailedAnalysis(true)}
                      >
                        View Detailed Analysis
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Detailed ATS Analysis</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetailedAnalysis(false)}
                        >
                          ← Back
                        </Button>
                      </div>

                      {/* Score Section */}
                      <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-sm">ATS Compatibility Score</h5>
                          <span className="text-3xl font-bold text-blue-600">{atsAnalysis.atsScore}/100</span>
                        </div>
                        <Progress value={atsAnalysis.atsScore} className="h-3" />
                        <p className="text-xs text-blue-700">{atsAnalysis.summary}</p>
                      </div>

                      {/* Strengths */}
                      {atsAnalysis.strengths?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm text-green-700">✓ Strengths</h5>
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

                      {/* Improvements */}
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

                      {/* Keywords Found */}
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

                      {/* Missing Keywords */}
                      {atsAnalysis.missingKeywords?.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm text-red-700">Missing Keywords ({atsAnalysis.missingKeywords.length})</h5>
                          <div className="flex flex-wrap gap-2">
                            {atsAnalysis.missingKeywords.map((keyword: string, idx: number) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Readability Metrics */}
                      {atsAnalysis.readability && (
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm">Readability Metrics</h5>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-muted rounded border border-border">
                              <p className="text-xs text-muted-foreground">Character Count</p>
                              <p className="font-semibold text-sm">{atsAnalysis.readability.charCount}</p>
                            </div>
                            <div className="p-2 bg-muted rounded border border-border">
                              <p className="text-xs text-muted-foreground">Word Count</p>
                              <p className="font-semibold text-sm">{atsAnalysis.readability.wordCount}</p>
                            </div>
                            <div className="p-2 bg-muted rounded border border-border">
                              <p className="text-xs text-muted-foreground">Sentences</p>
                              <p className="font-semibold text-sm">{atsAnalysis.readability.sentenceCount}</p>
                            </div>
                            <div className="p-2 bg-muted rounded border border-border">
                              <p className="text-xs text-muted-foreground">Avg Words/Sentence</p>
                              <p className="font-semibold text-sm">{atsAnalysis.readability.avgWordsPerSentence.toFixed(1)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Formatting Analysis */}
                      {atsAnalysis.formatting && (
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm">Formatting & Structure</h5>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between p-2 bg-muted rounded border border-border text-xs">
                              <span>Proper Structure</span>
                              {atsAnalysis.formatting.hasProperStructure ? (
                                <Badge className="bg-green-600 text-xs">✓ Good</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">✗ Missing</Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted rounded border border-border text-xs">
                              <span>Contact Information</span>
                              {atsAnalysis.formatting.hasContactInfo ? (
                                <Badge className="bg-green-600 text-xs">✓ Present</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">✗ Missing</Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted rounded border border-border text-xs">
                              <span>Clear Sections</span>
                              {atsAnalysis.formatting.hasClearSections ? (
                                <Badge className="bg-green-600 text-xs">✓ Good</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">✗ Needs Work</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommendation */}
                      <Alert className={atsAnalysis.passed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
                        <AlertDescription className="text-xs">
                          {atsAnalysis.passed ? (
                            <p className="text-green-700">
                              <strong>Great!</strong> Your resume is ATS-compatible and ready for submissions. Focus on the suggested improvements to increase your chances further.
                            </p>
                          ) : (
                            <p className="text-amber-700">
                              <strong>Action Needed:</strong> Address the highlighted improvements to improve your resume's ATS compatibility before submitting applications.
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>

                      <Button 
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => setShowDetailedAnalysis(false)}
                      >
                        Close Detailed View
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student?.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
