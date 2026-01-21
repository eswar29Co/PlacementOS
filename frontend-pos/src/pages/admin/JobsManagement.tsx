import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jobService, applicationService } from '@/services';
import {
  Briefcase, Plus, Search, Edit, Trash2, Calendar,
  Users, CheckCircle2, XCircle, Rocket, Target, Zap,
  MapPin, Clock, TrendingUp, Sparkles, Filter, ChevronRight,
  Settings, Building2, Globe, Cpu, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Job, LocationType } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function JobsManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Fetch jobs (Preserving logic with robust casting)
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  const jobsList = Array.isArray(jobsData?.data)
    ? jobsData.data
    : (jobsData?.data && 'jobs' in (jobsData.data as any))
      ? (jobsData.data as any).jobs
      : [];

  const { data: applicationsData } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAllApplications(),
  });
  const applicationsList = Array.isArray((applicationsData?.data as any)?.applications)
    ? (applicationsData?.data as any).applications
    : Array.isArray(applicationsData?.data)
      ? applicationsData.data
      : [];

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

  const createJobMutation = useMutation({
    mutationFn: (data: any) => jobService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Simulation launched successfully!');
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || 'Simulation launch failed'),
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => jobService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Simulation parameters updated');
      setIsEditDialogOpen(false);
      setEditingJob(null);
    },
    onError: (error: any) => toast.error(error.message || 'Update failed'),
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Simulation decommissioned');
    },
    onError: (error: any) => toast.error(error.message || 'Decommissioning failed'),
  });

  const resetForm = () => {
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
      deadline: ''
    });
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setFormData({
      companyName: job.companyName,
      roleTitle: job.roleTitle,
      ctcBand: job.ctcBand,
      package: job.package || job.ctcBand,
      locationType: job.locationType,
      description: job.description,
      requirements: job.requirements?.join('\n') || '',
      skills: job.skills?.join(', ') || '',
      requiredTechStack: job.requiredTechStack?.join(', ') || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    const jobId = editingJob._id || editingJob.id;
    updateJobMutation.mutate({
      id: jobId,
      data: {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        requiredTechStack: formData.requiredTechStack.split(',').map(s => s.trim()).filter(s => s),
        deadline: formData.deadline ? new Date(formData.deadline) : editingJob.deadline,
      }
    });
  };

  const filteredJobs = jobsList.filter((job: any) =>
    job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.roleTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getJobStats = (jobId: string) => {
    const jobApps = applicationsList.filter((a: any) => a.jobId === jobId);
    return {
      total: jobApps.length,
      active: jobApps.filter((a: any) => !['rejected', 'offer_released', 'offer_accepted'].includes(a.status)).length,
      offers: jobApps.filter((a: any) => a.status === 'offer_released' || a.status === 'offer_accepted').length,
    };
  };

  const handleCreateJob = async () => {
    if (!formData.companyName || !formData.roleTitle || !formData.ctcBand) return toast.error('Required fields missing');
    createJobMutation.mutate({
      ...formData,
      package: formData.package || formData.ctcBand,
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      requiredTechStack: formData.requiredTechStack.split(',').map(s => s.trim()).filter(s => s),
      deadline: formData.deadline ? new Date(formData.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      selectionProcess: ['Resume Screening', 'Assessment', 'AI Interview', 'Technical Round', 'Manager Round', 'HR Round'],
    });
  };

  const activeJobsCount = jobsList.filter((j: any) => j.isActive).length;
  const totalApplications = jobsList.reduce((sum: number, j: any) => sum + getJobStats(j._id || j.id).total, 0);
  const totalOffers = jobsList.reduce((sum: number, j: any) => sum + getJobStats(j._id || j.id).offers, 0);

  const headerStats = [
    { label: 'Live Simulations', value: jobsList.length, icon: Rocket, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Active Opportunities', value: activeJobsCount, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50/5' },
    { label: 'Total Engagement', value: totalApplications, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/5' },
    { label: 'Offers Processed', value: totalOffers, icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50/5' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Opportunity Control" subtitle="System overrides for job simulations">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full shadow-xl shadow-primary/20" />
          <p className="font-extrabold text-primary animate-pulse uppercase tracking-[0.3em] text-[10px]">Synchronizing Orbital Hub...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Opportunity Control" subtitle="Simulation architect and job pipeline management">
      <div className="space-y-10 max-w-[1600px] mx-auto pb-20">

        {/* Header Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {headerStats.map((stat) => (
            <Card key={stat.label} className="border-slate-200 shadow-sm rounded-[2rem] bg-white border group relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-full blur-3xl -z-10" />
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-2xl p-5 transition-transform group-hover:rotate-12 duration-500 border border-slate-100 shadow-sm", stat.bg, stat.color)}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <div className="text-right">
                    <p className={cn("text-4xl font-black tracking-tighter leading-none italic", stat.color)}>{stat.value}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-80">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Board */}
        <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
          <CardHeader className="bg-slate-50 p-12 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black flex items-center gap-4 italic uppercase tracking-tighter text-slate-900">
                  <Target className="h-8 w-8 text-primary" />
                  Simulation Architect
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Design and deploy placement simulations across the neural network</CardDescription>
              </div>
              <div className="flex items-center flex-wrap gap-6">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search simulations by role or firm..."
                    className="pl-14 h-14 w-full md:w-[400px] bg-white border-slate-200 rounded-2xl shadow-sm font-bold text-slate-900 focus-visible:ring-primary/20 transition-all placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-2xl shadow-primary/20 gap-3 uppercase tracking-widest text-xs">
                      <Plus className="h-6 w-6" /> Launch Simulation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden border border-slate-200 bg-white shadow-3xl">
                    <DialogHeader className="p-12 bg-primary text-white relative">
                      <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
                      <div className="relative z-10">
                        <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Architecture Blueprint</DialogTitle>
                        <DialogDescription className="text-white/80 font-bold uppercase tracking-widest text-[10px] mt-2">Define parameters for the new placement scenario</DialogDescription>
                      </div>
                    </DialogHeader>
                    <div className="p-12 max-h-[75vh] overflow-y-auto space-y-10 custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <JobInputField label="Entity Name" icon={Building2} placeholder="Microsoft, Stripe, etc." value={formData.companyName} onChange={v => setFormData({ ...formData, companyName: v })} />
                        <JobInputField label="Target Designation" icon={Target} placeholder="Lead Architect, SDE II, etc." value={formData.roleTitle} onChange={v => setFormData({ ...formData, roleTitle: v })} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <JobInputField label="CTC Compensation Range" icon={TrendingUp} placeholder="12-24 LPA" value={formData.ctcBand} onChange={v => setFormData({ ...formData, ctcBand: v })} />
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location Window</Label>
                          <Select value={formData.locationType} onValueChange={v => setFormData({ ...formData, locationType: v as any })}>
                            <SelectTrigger className="rounded-2xl h-14 border-slate-200 bg-slate-50 shadow-sm font-bold text-slate-900">
                              <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-primary" />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 bg-white shadow-3xl text-slate-900">
                              <SelectItem value="Onsite">Onsite Deployment</SelectItem>
                              <SelectItem value="Hybrid">Hybrid Protocol</SelectItem>
                              <SelectItem value="Remote">Remote Uplink</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Engagement Description</Label>
                        <Textarea placeholder="Define the scope of interaction..." className="rounded-[2rem] border-slate-200 bg-slate-50 shadow-sm font-medium min-h-[140px] p-8 text-slate-900 focus-visible:ring-primary/20 placeholder:text-slate-300" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Technical Stack & Requirements (Comma separated)</Label>
                        <div className="relative group">
                          <Cpu className="absolute left-6 top-6 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Textarea
                            placeholder="React, Node.js, AWS, System Design..."
                            className="rounded-[2rem] h-32 pl-14 pt-6 bg-slate-50 border-slate-200 font-medium text-slate-900 shadow-sm resize-none focus-visible:ring-primary/20 placeholder:text-slate-300"
                            value={formData.requiredTechStack}
                            onChange={e => setFormData({ ...formData, requiredTechStack: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                          System will automatically append standard selection protocols (AI Interview → Technical → HR) to this simulation.
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <Button variant="ghost" className="font-black rounded-2xl h-14 px-8 text-slate-400 hover:bg-slate-100 uppercase text-[10px] tracking-widest" onClick={() => setIsCreateDialogOpen(false)}>Abort Architect</Button>
                      <Button className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 font-black shadow-lg shadow-primary/20 uppercase text-xs tracking-widest" onClick={handleCreateJob}>Activate Simulation</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 h-16">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="px-10 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Simulation Spec</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Neural Engagement</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Compensation / Uplink</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right px-10">System Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow className="border-none hover:bg-transparent">
                      <TableCell colSpan={4} className="py-40 text-center">
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                          <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            <Briefcase className="h-12 w-12 text-slate-200" />
                          </div>
                          <p className="font-black text-2xl text-slate-300 uppercase tracking-tighter italic">No Active Simulations Detected</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job: any) => {
                      const stats = getJobStats(job._id || job.id);
                      return (
                        <TableRow key={job._id || job.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-100">
                          <TableCell className="px-10 py-10">
                            <div className="flex items-center gap-8">
                              <div className="relative">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 shadow-sm border border-slate-100 flex items-center justify-center font-black text-primary text-2xl rotate-3 group-hover:rotate-0 transition-transform">
                                  {job.companyName.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                              </div>
                              <div>
                                <h4 className="font-black text-xl leading-none uppercase tracking-tighter text-slate-900 italic group-hover:text-primary transition-colors">{job.roleTitle}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{job.companyName}</p>
                                <div className="flex gap-2 mt-4">
                                  {job.skills?.slice(0, 3).map((s: string) => <Badge key={s} className="bg-slate-50 text-slate-500 border border-slate-100 font-black text-[8px] uppercase tracking-widest px-3 shadow-none">{s}</Badge>)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center justify-center space-y-4">
                              <div className="flex items-center gap-4">
                                <Users className="h-5 w-5 text-primary opacity-50" />
                                <div className="text-center">
                                  <p className="text-2xl font-black text-slate-900 italic leading-none">{stats.total}</p>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Candidates</span>
                                </div>
                              </div>
                              <div className="space-y-2 w-32">
                                <div className="flex items-center justify-between px-1">
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{stats.offers} Offers</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{Math.round((stats.offers / Math.max(stats.total, 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                  <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${(stats.offers / Math.max(stats.total, 1)) * 100}%` }} />
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 px-4 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center font-black text-[10px] tracking-widest shadow-none">{job.ctcBand}</div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <MapPin className="h-3.5 w-3.5 text-primary" /> {job.locationType}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                  <Clock className="h-3.5 w-3.5" /> SECURE BY: {new Date(job.deadline).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-10 text-right">
                            <div className="flex justify-end gap-3 items-center">
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-12 px-6 rounded-2xl border-none font-black text-[10px] uppercase tracking-widest transition-all shadow-xl",
                                  job.isActive
                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-500/5 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 shadow-rose-500/5 border border-rose-500/20"
                                )}
                                onClick={() => updateJobMutation.mutate({ id: job._id || job.id, data: { isActive: !job.isActive } })}
                              >
                                {job.isActive ? "ACTIVE NODE" : "PAUSED"}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100 shadow-sm"
                                onClick={() => handleEditClick(job)}
                              >
                                <Settings className="h-5 w-5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-slate-100 shadow-sm"
                                disabled={stats.total > 0}
                                onClick={() => {
                                  if (confirm('Confirm Decommission? This simulation will be purged.')) {
                                    deleteJobMutation.mutate(job._id || job.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
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

      {/* Edit Simulation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setEditingJob(null); resetForm(); } }}>
        <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden border border-slate-200 bg-white shadow-3xl">
          <DialogHeader className="p-12 bg-indigo-600 text-white relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Parameter Override</DialogTitle>
                <DialogDescription className="text-white/80 font-bold uppercase tracking-widest text-[10px] mt-2">Modify existing simulation constraints for {editingJob?.companyName}</DialogDescription>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Edit className="h-6 w-6 text-white" />
              </div>
            </div>
          </DialogHeader>
          <div className="p-12 max-h-[75vh] overflow-y-auto space-y-10 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <JobInputField label="Entity Name" icon={Building2} placeholder="Microsoft, Stripe, etc." value={formData.companyName} onChange={v => setFormData({ ...formData, companyName: v })} />
              <JobInputField label="Target Designation" icon={Target} placeholder="Lead Architect, SDE II, etc." value={formData.roleTitle} onChange={v => setFormData({ ...formData, roleTitle: v })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <JobInputField label="CTC Compensation Range" icon={TrendingUp} placeholder="12-24 LPA" value={formData.ctcBand} onChange={v => setFormData({ ...formData, ctcBand: v })} />
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location Window</Label>
                <Select value={formData.locationType} onValueChange={v => setFormData({ ...formData, locationType: v as any })}>
                  <SelectTrigger className="rounded-2xl h-14 border-slate-200 bg-slate-50 shadow-sm font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-indigo-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 bg-white shadow-3xl text-slate-900">
                    <SelectItem value="Onsite">Onsite Deployment</SelectItem>
                    <SelectItem value="Hybrid">Hybrid Protocol</SelectItem>
                    <SelectItem value="Remote">Remote Uplink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Engagement Description</Label>
              <div className="bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <Textarea placeholder="Define the scope of interaction..." className="rounded-none border-none bg-transparent shadow-none font-medium min-h-[140px] p-8 text-slate-900 focus-visible:ring-0 placeholder:text-slate-300" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline Sequence</Label>
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  type="date"
                  className="h-14 pl-14 bg-slate-50 border-slate-200 rounded-2xl font-bold text-slate-900 shadow-sm focus-visible:ring-indigo-400/20 transition-all placeholder:text-slate-300"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-6">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
              <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                Updating active simulation parameters may affect existing application neural maps. Use caution when modifying the base architecture of a live opportunity.
              </p>
            </div>
          </div>
          <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <Button variant="ghost" className="font-black rounded-2xl h-14 px-8 text-slate-400 hover:bg-slate-100 uppercase text-[10px] tracking-widest" onClick={() => setIsEditDialogOpen(false)}>Discard Overrides</Button>
            <Button className="h-14 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-600/20 uppercase text-xs tracking-widest" onClick={handleUpdateJob}>Confirm Parameter Sync</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function JobInputField({ label, icon: Icon, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-4">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</Label>
      <div className="relative group">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={placeholder}
          className="rounded-2xl h-14 pl-14 bg-slate-50 border-slate-200 shadow-sm font-bold text-slate-900 focus-visible:ring-primary/20 transition-all placeholder:text-slate-300"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
