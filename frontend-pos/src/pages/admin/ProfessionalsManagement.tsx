import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService, applicationService } from '@/services';
import { UserCheck, Search, Star, Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfessionalsManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch professionals from MongoDB
  const { data: professionalsData, isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalService.getAllProfessionals(),
  });

  // Fetch applications from MongoDB
  const { data: applicationsData } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAllApplications(),
  });

  // Normalize arrays
  const professionalsList = Array.isArray(professionalsData?.data?.professionals) 
    ? professionalsData.data.professionals 
    : Array.isArray(professionalsData?.data) 
    ? professionalsData.data 
    : [];
  const applicationsList = Array.isArray(applicationsData?.data) ? applicationsData.data : [];

  const filteredProfessionals = professionalsList.filter(prof =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProfessionalStats = (profId: string) => {
    const profApps = applicationsList.filter(a => 
      a.assignedProfessionalId === profId || 
      a.assignedManagerId === profId || 
      a.assignedHRId === profId
    );
    
    const feedbackCount = applicationsList.reduce((count, app) => {
      if (app.interviewFeedback) {
        return count + app.interviewFeedback.filter(f => f.professionalId === profId).length;
      }
      return count;
    }, 0);

    const avgRating = applicationsList.reduce((sum, app) => {
      if (app.interviewFeedback) {
        const profFeedback = app.interviewFeedback.filter(f => f.professionalId === profId);
        const ratings = profFeedback.map(f => f.rating || 0);
        return sum + ratings.reduce((a, b) => a + b, 0);
      }
      return sum;
    }, 0) / (feedbackCount || 1);

    return {
      total: feedbackCount,
      active: profApps.filter(a => ['professional_round_pending', 'manager_round_pending', 'hr_round_pending', 'professional_round_scheduled', 'manager_round_scheduled', 'hr_round_scheduled'].includes(a.status)).length,
      avgRating: avgRating.toFixed(1),
    };
  };

  // Mutation for approving professional
  const approveMutation = useMutation({
    mutationFn: (profId: string) => 
      professionalService.updateProfessionalStatus(profId, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Professional approved!');
    },
    onError: (error: any) => {
      console.error('Failed to approve professional:', error);
      toast.error(error.message || 'Failed to approve professional');
    },
  });

  // Mutation for rejecting professional
  const rejectMutation = useMutation({
    mutationFn: (profId: string) => 
      professionalService.updateProfessionalStatus(profId, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Professional rejected!');
    },
    onError: (error: any) => {
      console.error('Failed to reject professional:', error);
      toast.error(error.message || 'Failed to reject professional');
    },
  });

  const handleApproveProfessional = (profId: string) => {
    approveMutation.mutate(profId);
  };

  const handleRejectProfessional = (profId: string) => {
    rejectMutation.mutate(profId);
  };

  const pendingCount = professionalsList.filter(p => p.status === 'pending').length;
  const approvedCount = professionalsList.filter(p => p.status === 'approved').length;
  const activeInterviewsCount = professionalsList.reduce((sum, p) => sum + (p.activeInterviewCount || 0), 0);
  const avgExperience = professionalsList.length > 0 
    ? (professionalsList.reduce((sum, p) => sum + p.yearsOfExperience, 0) / professionalsList.length).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <DashboardLayout title="Professionals Management" subtitle="Manage professional interviewers">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading professionals...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Professionals Management" subtitle="View and manage all registered professionals">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{professionalsList.length}</p>
                  <p className="text-sm text-muted-foreground">Total Professionals</p>
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
                  <p className="text-3xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-warning/10 p-3">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-info/10 p-3">
                  <Briefcase className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{activeInterviewsCount}</p>
                  <p className="text-sm text-muted-foreground">Active Interviews</p>
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
                <CardTitle>All Professionals</CardTitle>
                <CardDescription>Comprehensive list of registered professionals</CardDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, or role..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professional</TableHead>
                    <TableHead>Role & Experience</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Tech Stack</TableHead>
                    <TableHead>Interviews</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No professionals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfessionals.map((prof) => {
                      const stats = getProfessionalStats(prof.id);
                      return (
                        <TableRow key={prof.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {prof.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{prof.name}</p>
                                <p className="text-xs text-muted-foreground">{prof.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {prof.professionalRole && (
                                <Badge variant="outline" className="mb-1">
                                  {prof.professionalRole}
                                </Badge>
                              )}
                              <p className="text-sm font-medium">{prof.designation}</p>
                              <p className="text-xs text-muted-foreground">{prof.yearsOfExperience} years exp</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{prof.company}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {prof.techStack?.slice(0, 3).map((tech) => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {prof.techStack && prof.techStack.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{prof.techStack.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{stats.total}</span>
                                <span className="text-muted-foreground">total</span>
                              </div>
                              <Badge variant="default" className="text-xs">
                                {prof.activeInterviewCount || 0} active
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span className="font-medium">{stats.avgRating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {prof.status === 'approved' ? (
                              <Badge className="bg-success">Approved</Badge>
                            ) : prof.status === 'pending' ? (
                              <Badge variant="warning">Pending</Badge>
                            ) : (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {prof.status === 'pending' && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApproveProfessional(prof.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRejectProfessional(prof.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {prof.linkedinUrl && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={prof.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    LinkedIn
                                  </a>
                                </Button>
                              )}
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
