import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jobService, applicationService } from '@/services';
import { Briefcase, Plus, Search, Edit, Trash2, Calendar, Users, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Job, LocationType } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function JobsManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch jobs from MongoDB
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobsList = Array.isArray(jobsData?.data)
    ? jobsData.data
    : (jobsData?.data && 'jobs' in jobsData.data)
    ? jobsData.data.jobs
    : [];

  // Fetch applications from MongoDB
  const { data: applicationsData } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAllApplications(),
  });
  const applicationsList = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    roleTitle: '',
    ctcBand: '',
    package: '',
    locationType: 'Onsite' as LocationType,
    description: '',
    requirements: '',
    skills: '',
    requiredTechStack: '',
    deadline: '',
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (data: any) => jobService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully!');
      setIsCreateDialogOpen(false);
      // Reset form
      setFormData({
        companyName: '',
        roleTitle: '',
        ctcBand: '',
        package: '',
        locationType: 'Onsite',
        description: '',
        requirements: '',
        skills: '',
        requiredTechStack: '',
        deadline: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create job');
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => jobService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update job');
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Cannot delete job with existing applications');
    },
  });

  const filteredJobs = jobsList.filter(job =>
    job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.roleTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getJobStats = (jobId: string) => {
    const jobApps = applicationsList.filter(a => a.jobId === jobId);
    return {
      total: jobApps.length,
      active: jobApps.filter(a => !['rejected', 'offer_released', 'offer_accepted'].includes(a.status)).length,
      offers: jobApps.filter(a => a.status === 'offer_released' || a.status === 'offer_accepted').length,
      rejected: jobApps.filter(a => a.status === 'rejected').length,
    };
  };

  const handleCreateJob = async () => {
    if (!formData.companyName || !formData.roleTitle || !formData.ctcBand) {
      toast.error('Please fill in all required fields');
      return;
    }

    const jobData = {
      companyName: formData.companyName,
      roleTitle: formData.roleTitle,
      ctcBand: formData.ctcBand,
      package: formData.package || formData.ctcBand,
      locationType: formData.locationType,
      description: formData.description,
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      requiredTechStack: formData.requiredTechStack.split(',').map(s => s.trim()).filter(s => s),
      deadline: formData.deadline ? new Date(formData.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      selectionProcess: ['Resume Screening', 'Assessment', 'AI Interview', 'Technical Round', 'Manager Round', 'HR Round'],
    };

    createJobMutation.mutate(jobData);
  };

  const handleToggleJobStatus = (jobId: string, currentStatus: boolean) => {
    updateJobMutation.mutate({ id: jobId, data: { isActive: !currentStatus } });
  };

  const handleDeleteJob = (jobId: string) => {
    const jobApps = applicationsList.filter(a => a.jobId === jobId);
    if (jobApps.length > 0) {
      toast.error('Cannot delete job with existing applications');
      return;
    }
    deleteJobMutation.mutate(jobId);
  };

  const activeJobsCount = jobsList.filter(j => j.isActive).length;
  const totalApplications = jobsList.reduce((sum, j) => sum + getJobStats(j.id).total, 0);
  const totalOffers = jobsList.reduce((sum, j) => sum + getJobStats(j.id).offers, 0);

  if (isLoading) {
    return (
      <DashboardLayout title="Jobs Management" subtitle="Create and manage job postings">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Jobs Management" subtitle="Create and manage job postings">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{jobsList.length}</p>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-success/10 p-3">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{activeJobsCount}</p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-info/10 p-3">
                  <Users className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{totalApplications}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-warning/10 p-3">
                  <Briefcase className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{totalOffers}</p>
                  <p className="text-sm text-muted-foreground">Offers Released</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Jobs</CardTitle>
                <CardDescription>Manage job postings and applications</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by company or role..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Job</DialogTitle>
                      <DialogDescription>Fill in the details to create a new job posting</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company Name *</Label>
                          <Input
                            id="company"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="e.g., Microsoft"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role Title *</Label>
                          <Input
                            id="role"
                            value={formData.roleTitle}
                            onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                            placeholder="e.g., Software Engineer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ctc">CTC Band *</Label>
                          <Input
                            id="ctc"
                            value={formData.ctcBand}
                            onChange={(e) => setFormData({ ...formData, ctcBand: e.target.value })}
                            placeholder="e.g., 8-12 LPA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="package">Package Details</Label>
                          <Input
                            id="package"
                            value={formData.package}
                            onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                            placeholder="e.g., 10 LPA"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location Type</Label>
                          <Select
                            value={formData.locationType}
                            onValueChange={(value) => setFormData({ ...formData, locationType: value as LocationType })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Onsite">Onsite</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                              <SelectItem value="Remote">Remote</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deadline">Application Deadline</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe the role, responsibilities, and expectations..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements (one per line)</Label>
                        <Textarea
                          id="requirements"
                          value={formData.requirements}
                          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                          placeholder="Bachelor's degree in Computer Science&#10;3+ years of experience&#10;Strong problem-solving skills"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input
                          id="skills"
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          placeholder="React, Node.js, TypeScript, MongoDB"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="techStack">Required Tech Stack (comma-separated)</Label>
                        <Input
                          id="techStack"
                          value={formData.requiredTechStack}
                          onChange={(e) => setFormData({ ...formData, requiredTechStack: e.target.value })}
                          placeholder="React, Node.js, PostgreSQL"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateJob}>Create Job</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Details</TableHead>
                    <TableHead>CTC</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => {
                      const stats = getJobStats(job.id);
                      return (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{job.roleTitle}</p>
                              <p className="text-sm text-muted-foreground">{job.companyName}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {job.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{job.ctcBand}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.locationType}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{stats.total}</span>
                                <span className="text-muted-foreground">total</span>
                              </div>
                              <div className="flex gap-2 text-xs">
                                <Badge variant="default" className="text-xs">{stats.active} active</Badge>
                                {stats.offers > 0 && (
                                  <Badge variant="success" className="text-xs">{stats.offers} offers</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(job.deadline).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {job.isActive ? (
                              <Badge className="bg-success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleJobStatus(job.id, job.isActive)}
                              >
                                {job.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={stats.total > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
