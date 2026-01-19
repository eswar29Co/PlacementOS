import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { professionalService, applicationService, jobService, studentService } from '@/services';
import { Users, UserCheck, Briefcase, TrendingUp, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusAfterResumeApproval, getStatusAfterAssessmentApproval, getNextInterviewStage } from '@/lib/flowHelpers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  
  // Fetch data from MongoDB using React Query
  const { data: professionalsData } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalService.getAllProfessionals(),
  });
  const professionals = Array.isArray(professionalsData?.data?.professionals)
    ? professionalsData.data.professionals
    : Array.isArray(professionalsData?.data)
    ? professionalsData.data
    : [];
  
  const { data: applicationsData, isLoading: applicationsLoading, error: applicationsError } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAllApplications(),
  });
  
  // Backend returns { data: { applications: [...], pagination: {...} } }
  const applications = Array.isArray(applicationsData?.data?.applications) 
    ? applicationsData.data.applications 
    : Array.isArray(applicationsData?.data)
    ? applicationsData.data
    : [];
  
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobs = Array.isArray(jobsData?.data)
    ? jobsData.data
    : (jobsData?.data && 'jobs' in jobsData.data)
    ? jobsData.data.jobs
    : [];
  
  const { data: studentsData } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getAllStudents(),
  });
  const students = Array.isArray(studentsData?.data) ? studentsData.data : [];

  const [professionalRoles, setProfessionalRoles] = useState<Record<string, string>>({});

  // Mutations for approvals
  const approveResumeMutation = useMutation({
    mutationFn: (id: string) => applicationService.approveResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Resume approved! Assessment released to student.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve resume');
    },
  });

  const rejectResumeMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback?: string }) => 
      applicationService.rejectResume(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.error('Resume rejected with feedback sent to student');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject resume');
    },
  });

  const approveAssessmentMutation = useMutation({
    mutationFn: (id: string) => applicationService.approveAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Assessment approved! AI interview round unlocked.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve assessment');
    },
  });

  const rejectAssessmentMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback?: string }) => 
      applicationService.rejectAssessment(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.error('Assessment rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject assessment');
    },
  });

  const approveAIInterviewMutation = useMutation({
    mutationFn: (id: string) => applicationService.approveAIInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('AI interview approved! Ready for professional interview.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve AI interview');
    },
  });

  const rejectAIInterviewMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback?: string }) => 
      applicationService.rejectAIInterview(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.error('AI interview rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject AI interview');
    },
  });

  const assignProfessionalMutation = useMutation({
    mutationFn: (data: { applicationId: string; professionalId: string; round: 'professional' | 'manager' | 'hr' }) => 
      applicationService.assignProfessional(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Professional assigned successfully!');
      setIsAssignDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign professional');
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Application> }) => 
      applicationService.updateApplication(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update application');
    },
  });

  // Assignment Dialog State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAppIdForAssignment, setSelectedAppIdForAssignment] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);

  const handleOpenAssignDialog = (appId: string) => {
    setSelectedAppIdForAssignment(appId);
    setSelectedProfessional(null);
    setIsAssignDialogOpen(true);
  };

  const handleAssignProfessional = () => {
    if (!selectedAppIdForAssignment || !selectedProfessional) return;

    assignProfessionalMutation.mutate({
      applicationId: selectedAppIdForAssignment,
      professionalId: selectedProfessional,
      round: 'professional'
    });
  };

  const getAvailableProfessionals = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return [];

    const job = jobs.find(j => j.id === app.jobId);
    if (!job) return [];

    return professionals.filter(p => {
      if (p.status !== 'approved') return false;
      // Basic matching logic (can be enhanced)
      const hasMatchingSkill = p.techStack.some(ts =>
        job.requiredTechStack.some(rts => ts.toLowerCase().includes(rts.toLowerCase()))
      );
      return hasMatchingSkill;
    });
  };

  const pendingProfessionals = professionals.filter(p => p.status === 'pending');
  const approvedProfessionals = professionals.filter(p => p.status === 'approved');
  
  // Applications needing resume approval (applied but resume not yet approved/rejected)
  const resumeReviewApps = applications.filter(a => a.resumeApproved === null && a.status === 'applied');
  
  // Applications needing assessment approval (assessment completed but not yet approved/rejected)
  const assessmentReviewApps = applications.filter(a => a.assessmentApproved === null && a.status === 'assessment_completed');
  
  // Applications needing AI interview approval (AI interview completed but not yet approved/rejected)
  const aiInterviewReviewApps = applications.filter(a => a.aiInterviewApproved === null && a.status === 'ai_interview_completed');
  
  const offerReadyApps = applications.filter(a => a.status === 'hr_round_completed');

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'text-primary' },
    { label: 'Approved Professionals', value: approvedProfessionals.length, icon: UserCheck, color: 'text-success' },
    { label: 'Active Jobs', value: jobs.filter(j => j.isActive).length, icon: Briefcase, color: 'text-info' },
    { label: 'Pending Approvals', value: pendingProfessionals.length, icon: Clock, color: 'text-warning' },
  ];

  const handleApproveProfessional = async (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    const assignedRole = professionalRoles[professionalId];

    if (professional) {
      if (!assignedRole) {
        toast.error('Please assign a role before approving');
        return;
      }
      
      try {
        const response = await professionalService.updateProfessionalStatus(professionalId, { status: 'approved' });
        
        if (response.success) {
          // Refresh professionals list
          const profsResponse = await professionalService.getAllProfessionals();
          if (profsResponse.success && profsResponse.data) {
            const profsArray = profsResponse.data.professionals || profsResponse.data;
            dispatch(setProfessionals(profsArray));
          }
          
          toast.success(`Professional approved as ${assignedRole}!`);
        }
      } catch (error: any) {
        console.error('Failed to approve professional:', error);
        toast.error(error.message || 'Failed to approve professional');
      }
    }
  };

  const handleRejectProfessional = async (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    if (professional) {
      try {
        const response = await professionalService.updateProfessionalStatus(professionalId, { status: 'rejected' });
        
        if (response.success) {
          // Refresh professionals list
          const profsResponse = await professionalService.getAllProfessionals();
          if (profsResponse.success && profsResponse.data) {
            const profsArray = profsResponse.data.professionals || profsResponse.data;
            dispatch(setProfessionals(profsArray));
          }
          
          toast.error('Professional rejected');
        }
      } catch (error: any) {
        console.error('Failed to reject professional:', error);
        toast.error(error.message || 'Failed to reject professional');
      }
    }
  };

  const handleApproveResume = (applicationId: string) => {
    approveResumeMutation.mutate(applicationId);
  };

  const handleRejectResume = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      const job = getJobById(app.jobId);
      const student = getStudentById(app.studentId);

      // Generate improvement pointers based on student profile and job requirements
      const improvementPointers = [];

      // Check skills match
      const jobSkills = [...(job?.skills || []), ...(job?.requiredTechStack || [])];
      const matchingSkills = student?.skills.filter(s =>
        jobSkills.some(js => js.toLowerCase().includes(s.toLowerCase()))
      ) || [];

      if (matchingSkills.length < 2) {
        improvementPointers.push('Enhance your technical skills to match job requirements');
      }

      // Check CGPA
      if (student && student.cgpa < 7.0) {
        improvementPointers.push('Focus on improving academic performance (CGPA)');
      }

      // Generic pointers
      improvementPointers.push('Highlight relevant projects and achievements');
      improvementPointers.push('Ensure resume is well-formatted and error-free');
      improvementPointers.push('Add quantifiable achievements and metrics');

      const improvementMessage = improvementPointers.length > 0
        ? `\n\nAreas for improvement:\n${improvementPointers.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
        : '';

      const feedback = `Your application to ${job?.companyName} for ${job?.roleTitle} was not shortlisted at the resume screening stage.${improvementMessage}`;
      rejectResumeMutation.mutate({ id: applicationId, feedback });
    }
  };

  const handleApproveAssessment = (applicationId: string) => {
    approveAssessmentMutation.mutate(applicationId);
  };

  const handleRejectAssessment = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      const job = getJobById(app.jobId);
      const feedback = `Your assessment for ${job?.companyName} did not meet the required criteria.`;
      rejectAssessmentMutation.mutate({ id: applicationId, feedback });
    }
  };

  // Handle AI Interview completion and move to professional interview
  const handleProgressAfterAIInterview = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app && app.status === 'ai_interview_completed') {
      const nextStage = getNextInterviewStage(app.status);
      if (nextStage === 'tech') {
        // Open manual assignment dialog
        handleOpenAssignDialog(applicationId);
      }
    }
  };

  // Handle professional interview progression
  const handleProgressAfterProfessionalInterview = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app && app.status === 'professional_interview_completed') {
      const nextStage = getNextInterviewStage(app.status);
      if (nextStage === 'manager') {
        // Auto-assign manager for next round
        assignProfessionalMutation.mutate({
          applicationId,
          professionalId: 'manager', // TODO: Get actual manager ID
          round: 'manager'
        });
      }
    }
  };

  // Handle manager interview progression
  const handleProgressAfterManagerInterview = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app && app.status === 'manager_interview_completed') {
      const nextStage = getNextInterviewStage(app.status);
      if (nextStage === 'hr') {
        // Auto-assign HR for final round
        assignProfessionalMutation.mutate({
          applicationId,
          professionalId: 'hr', // TODO: Get actual HR ID
          round: 'hr'
        });
      }
    }
  };

  const handleReleaseOffer = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      const job = getJobById(app.jobId);
      
      updateApplicationMutation.mutate({
        id: applicationId,
        updates: {
          status: 'offer_released',
          offerDetails: {
            jobTitle: job?.roleTitle || 'Software Engineer',
            company: job?.companyName || 'Company',
            package: job?.package || 'Competitive package',
            joiningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }
        }
      });
      toast.success('Offer letter released successfully!');
    }
  };

  const getStudentById = (id: string) => students.find(s => s.id === id);
  const getJobById = (id: string) => jobs.find(j => j.id === id);

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Manage students, professionals, and applications">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl bg-muted p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="professionals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="professionals">Professional Approvals ({pendingProfessionals.length})</TabsTrigger>
            <TabsTrigger value="resumes">Resume Approvals ({resumeReviewApps.length})</TabsTrigger>
            <TabsTrigger value="assessments">Assessment Approvals ({assessmentReviewApps.length})</TabsTrigger>
            <TabsTrigger value="ai-interviews">AI Interview Review ({aiInterviewReviewApps.length})</TabsTrigger>
            <TabsTrigger value="offers">Release Offers ({offerReadyApps.length})</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Professional Approvals Tab */}
          <TabsContent value="professionals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Professional Approvals</CardTitle>
                <CardDescription>Review and approve working professionals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingProfessionals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>No pending approvals</p>
                  </div>
                ) : (
                  pendingProfessionals.map((prof) => (
                    <div key={prof.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {prof.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{prof.name}</p>
                            <p className="text-sm text-muted-foreground">{prof.email}</p>
                            <p className="text-sm text-muted-foreground">{prof.role} • {prof.yearsOfExperience} years exp</p>
                          </div>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {prof.techStack?.map((tech) => (
                          <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="text-xs mb-1">Assign Role</Label>
                          <Select
                            value={professionalRoles[prof.id] || ''}
                            onValueChange={(value) => setProfessionalRoles({ ...professionalRoles, [prof.id]: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select role..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Technical">Technical</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="HR">HR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApproveProfessional(prof.id)}
                          className="mt-5"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectProfessional(prof.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Approvals Tab */}
          <TabsContent value="resumes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Approvals</CardTitle>
                <CardDescription>Review student resumes and approve for assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeReviewApps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>No resumes pending review</p>
                  </div>
                ) : (
                  resumeReviewApps.map((app) => {
                    const student = getStudentById(app.studentId);
                    const job = getJobById(app.jobId);

                    return (
                      <div key={app.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{student?.name}</p>
                            <p className="text-sm text-muted-foreground">{student?.college} • {student?.branch}</p>
                            <p className="text-sm text-muted-foreground">Applied for: {job?.companyName} - {job?.roleTitle}</p>
                            <p className="text-sm text-muted-foreground">CGPA: {student?.cgpa} • Grad Year: {student?.graduationYear}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs text-muted-foreground">Skills:</span>
                          {student?.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                        {app.resumeUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                              View Resume
                            </a>
                          </Button>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveResume(app.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve & Release Assessment
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectResume(app.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Approvals Tab */}
          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Approvals</CardTitle>
                <CardDescription>Review completed assessments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessmentReviewApps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>No assessments pending review</p>
                  </div>
                ) : (
                  assessmentReviewApps.map((app) => {
                    const student = getStudentById(app.studentId);
                    const job = getJobById(app.jobId);

                    return (
                      <div key={app.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{student?.name}</p>
                            <p className="text-sm text-muted-foreground">{student?.college} • {student?.branch}</p>
                            <p className="text-sm text-muted-foreground">Applied for: {job?.companyName} - {job?.roleTitle}</p>
                          </div>
                        </div>
                        {app.assessmentCode && (
                          <div className="bg-muted/50 rounded p-3">
                            <p className="text-xs text-muted-foreground mb-1">Submitted Code:</p>
                            <pre className="text-xs overflow-x-auto">{app.assessmentCode.substring(0, 200)}...</pre>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveAssessment(app.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve & Move to AI Interview
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectAssessment(app.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Interview Review Tab */}
          <TabsContent value="ai-interviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Interview Review</CardTitle>
                <CardDescription>Review students who completed AI mock interviews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInterviewReviewApps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>No AI interviews pending review</p>
                  </div>
                ) : (
                  aiInterviewReviewApps.map((app) => {
                    const student = getStudentById(app.studentId);
                    const job = getJobById(app.jobId);

                    return (
                      <div key={app.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{student?.name}</p>
                            <p className="text-sm text-muted-foreground">{student?.college} • {student?.branch}</p>
                            <p className="text-sm text-muted-foreground">Applied for: {job?.companyName} - {job?.roleTitle}</p>
                            {app.aiInterviewScore && (
                              <div className="mt-2">
                                <Badge variant="secondary">
                                  AI Interview Score: {app.aiInterviewScore}/100
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleProgressAfterAIInterview(app.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Move to Technical Interview
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              updateApplicationMutation.mutate({ id: app.id, updates: { status: 'rejected' } });
                              toast.error('Application rejected');
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Release Offer Letters</CardTitle>
                <CardDescription>Students who have completed all interview rounds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {offerReadyApps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>No students ready for offer release</p>
                  </div>
                ) : (
                  offerReadyApps.map((app) => {
                    const student = getStudentById(app.studentId);
                    const job = getJobById(app.jobId);

                    return (
                      <div key={app.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {student?.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student?.name}</p>
                              <p className="text-sm text-muted-foreground">{student?.email}</p>
                              <p className="text-sm text-muted-foreground">{student?.college}</p>
                            </div>
                          </div>
                          <Badge variant="success">All Rounds Cleared</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Position:</span>
                            <p className="font-medium">{job?.roleTitle}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Company:</span>
                            <p className="font-medium">{job?.companyName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Package:</span>
                            <p className="font-medium">{job?.package}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CGPA:</span>
                            <p className="font-medium">{student?.cgpa}</p>
                          </div>
                        </div>

                        {app.interviewFeedback && app.interviewFeedback.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Interview Summary:</p>
                            <div className="flex flex-wrap gap-2">
                              {app.interviewFeedback.map((feedback, idx) => (
                                <Badge key={idx} variant="outline" className="capitalize">
                                  {feedback.round}: {feedback.rating}/5 ⭐
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => handleReleaseOffer(app.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Release Offer Letter
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview & Analytics Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Students Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Students</span>
                      <span className="font-bold">{students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students with Offers</span>
                      <span className="font-bold text-success">
                        {students.filter(s => applications.some(a => a.studentId === s.id && (a.status === 'offer_released' || a.status === 'offer_accepted'))).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Placement Rate</span>
                      <span className="font-bold text-success">
                        {((students.filter(s => applications.some(a => a.studentId === s.id && (a.status === 'offer_released' || a.status === 'offer_accepted'))).length / students.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professionals Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Professionals</span>
                      <span className="font-bold">{professionals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approved</span>
                      <span className="font-bold text-success">{approvedProfessionals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Interviews</span>
                      <span className="font-bold">
                        {professionals.reduce((sum, p) => sum + (p.activeInterviewCount || 0), 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jobs Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Jobs</span>
                      <span className="font-bold">{jobs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Jobs</span>
                      <span className="font-bold text-success">{jobs.filter(j => j.isActive).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Applications/Job</span>
                      <span className="font-bold">
                        {jobs.length > 0 ? (applications.length / jobs.length).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Application Pipeline</CardTitle>
                  <CardDescription>Current status distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { status: 'resume_under_review', label: 'Resume Review', count: resumeReviewApps.length, color: 'bg-yellow-500' },
                      { status: 'assessment_completed', label: 'Assessment Review', count: assessmentReviewApps.length, color: 'bg-blue-500' },
                      { status: 'ai_interview_pending', label: 'AI Interview', count: applications.filter(a => a.status === 'ai_interview_pending').length, color: 'bg-purple-500' },
                      { status: 'professional_round', label: 'Professional Round', count: applications.filter(a => a.status.includes('professional')).length, color: 'bg-indigo-500' },
                      { status: 'manager_round', label: 'Manager Round', count: applications.filter(a => a.status.includes('manager')).length, color: 'bg-pink-500' },
                      { status: 'hr_round', label: 'HR Round', count: applications.filter(a => a.status.includes('hr')).length, color: 'bg-green-500' },
                      { status: 'offer_released', label: 'Offer Released', count: applications.filter(a => a.status === 'offer_released').length, color: 'bg-emerald-500' },
                    ].map((item) => (
                      <div key={item.status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.label}</span>
                          <span className="font-bold">{item.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color}`}
                            style={{ width: `${applications.length > 0 ? (item.count / applications.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Resume Approval Rate</span>
                        <span className="font-bold">
                          {applications.length > 0 ? ((applications.filter(a => !['resume_rejected', 'rejected'].includes(a.status) && a.status !== 'resume_under_review').length / applications.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${applications.length > 0 ? ((applications.filter(a => !['resume_rejected', 'rejected'].includes(a.status) && a.status !== 'resume_under_review').length / applications.length) * 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Interview Success Rate</span>
                        <span className="font-bold">
                          {applications.filter(a => a.status.includes('interview')).length > 0
                            ? ((applications.filter(a => a.status.includes('completed') || a.status === 'offer_released').length / applications.filter(a => a.status.includes('interview')).length) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${applications.filter(a => a.status.includes('interview')).length > 0 ? ((applications.filter(a => a.status.includes('completed') || a.status === 'offer_released').length / applications.filter(a => a.status.includes('interview')).length) * 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Overall Offer Rate</span>
                        <span className="font-bold text-success">
                          {applications.length > 0 ? ((applications.filter(a => a.status === 'offer_released' || a.status === 'offer_accepted').length / applications.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${applications.length > 0 ? ((applications.filter(a => a.status === 'offer_released' || a.status === 'offer_accepted').length / applications.length) * 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Applications</span>
                        <span className="text-2xl font-bold">{applications.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Companies</CardTitle>
                <CardDescription>By application count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs
                    .map(job => ({
                      ...job,
                      appCount: applications.filter(a => a.jobId === job.id).length
                    }))
                    .sort((a, b) => b.appCount - a.appCount)
                    .slice(0, 5)
                    .map((job) => (
                      <div key={job.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{job.companyName}</p>
                          <p className="text-xs text-muted-foreground">{job.roleTitle}</p>
                        </div>
                        <Badge variant="secondary">{job.appCount} applications</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign Professional for Technical Interview</DialogTitle>
            <DialogDescription>
              Select a professional to conduct the technical round. Showing professionals matching job requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-md mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Active Interviews</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedAppIdForAssignment && getAvailableProfessionals(selectedAppIdForAssignment).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No matching professionals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedAppIdForAssignment && getAvailableProfessionals(selectedAppIdForAssignment).map((prof) => (
                    <TableRow key={prof.id}>
                      <TableCell className="font-medium">{prof.name}</TableCell>
                      <TableCell>{prof.company}</TableCell>
                      <TableCell>{prof.professionalRole}</TableCell>
                      <TableCell>{prof.yearsOfExperience} years</TableCell>
                      <TableCell>
                        <Badge variant={prof.activeInterviewCount >= 5 ? 'destructive' : 'secondary'}>
                          {prof.activeInterviewCount}/5
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={selectedProfessional === prof.id ? "default" : "outline"}
                          onClick={() => setSelectedProfessional(prof.id)}
                          disabled={prof.activeInterviewCount >= 5}
                        >
                          {selectedProfessional === prof.id ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignProfessional} disabled={!selectedProfessional}>
              Assign Professional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
