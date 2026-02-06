import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, collegeService, professionalService } from '@/services';
import {
    Building2, Users, Briefcase, TrendingUp, Globe,
    ShieldCheck, Activity, Award, PieChart, BarChart3,
    MapPin, Plus, ArrowUpRight, Search, Filter,
    CheckCircle2, UserCheck, Clock, XCircle, ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function SuperAdminDashboard() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('colleges');

    const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: () => adminService.getAnalytics(),
    });

    const { data: collegesData, isLoading: collegesLoading } = useQuery({
        queryKey: ['all-colleges'],
        queryFn: () => collegeService.getAllColleges()
    });

    const { data: professionalsData } = useQuery({
        queryKey: ['professionals'],
        queryFn: () => professionalService.getAllProfessionals(),
    });

    const colleges = collegesData?.data || [];
    const overview = analyticsData?.data?.overview || {};

    const professionalsList = Array.isArray((professionalsData?.data as any)?.professionals)
        ? (professionalsData?.data as any).professionals
        : Array.isArray(professionalsData?.data)
            ? professionalsData.data
            : [];

    const approveMutation = useMutation({
        mutationFn: (profId: string) =>
            professionalService.updateProfessionalStatus(profId, { status: 'approved' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
            toast.success('Expert authorized successfully!');
        },
        onError: (error: any) => toast.error(error.message || 'Verification failed'),
    });

    const rejectMutation = useMutation({
        mutationFn: (profId: string) =>
            professionalService.updateProfessionalStatus(profId, { status: 'rejected' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
            toast.error('Expert registration declined.');
        },
        onError: (error: any) => toast.error(error.message || 'Operation failed'),
    });

    const approveCollegeMutation = useMutation({
        mutationFn: (collegeId: string) => collegeService.approveCollege(collegeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-colleges'] });
            toast.success('College approved successfully!');
        },
        onError: (error: any) => toast.error(error.message || 'Approval failed'),
    });

    const rejectCollegeMutation = useMutation({
        mutationFn: ({ collegeId, reason }: { collegeId: string; reason: string }) =>
            collegeService.rejectCollege(collegeId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-colleges'] });
            toast.error('College registration rejected.');
        },
        onError: (error: any) => toast.error(error.message || 'Rejection failed'),
    });

    const filteredColleges = useMemo(() => {
        return colleges.filter((c: any) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.domain.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [colleges, searchTerm]);

    const filteredProfessionals = professionalsList.filter((prof: any) =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Super Admin Console" subtitle="Global oversight of all registered institutions and platform vitals">
            <div className="space-y-10 max-w-[1600px] mx-auto pb-12 relative">

                {/* Decorative Background */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] -z-10 animate-pulse-slow" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

                {/* Global Stats Overview */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Enrolled Colleges"
                        value={colleges.length}
                        icon={Building2}
                        trend="+12% this month"
                        color="text-indigo-600"
                        bg="bg-indigo-50"
                    />
                    <StatCard
                        label="Total Active Students"
                        value={overview.totalStudents || 0}
                        icon={Users}
                        trend="+850 new students"
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <StatCard
                        label="Platform Partners"
                        value={overview.totalProfessionals || 0}
                        icon={Briefcase}
                        trend="98% Approval rate"
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                    <StatCard
                        label="Global Success Rate"
                        value="72.4%"
                        icon={TrendingUp}
                        trend="+4.2% YoY"
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 h-auto self-start">
                            <TabsTrigger value="colleges" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-xs uppercase tracking-widest text-slate-500 transition-all">
                                Institutions
                            </TabsTrigger>
                            <TabsTrigger value="experts" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-xs uppercase tracking-widest text-slate-500 transition-all">
                                Expert Registry
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-xs uppercase tracking-widest text-slate-500 transition-all">
                                Intelligence
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder={activeTab === 'colleges' ? "SEARCH INSTITUTIONS..." : activeTab === 'experts' ? "SEARCH EXPERT REGISTRY..." : "SEARCH ANALYTICTS..."}
                                    className="h-12 w-[300px] rounded-2xl pl-12 bg-white border-slate-200 focus:ring-primary/20 font-bold text-[10px] tracking-widest uppercase"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {activeTab === 'colleges' && (
                                <Button className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-xl">
                                    <Plus className="mr-2 h-4 w-4" /> ADD COLLEGE
                                </Button>
                            )}
                        </div>
                    </div>

                    <TabsContent value="colleges" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredColleges.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <Building2 className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                                    <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No institutions found</h3>
                                </div>
                            ) : (
                                filteredColleges.map((college: any) => (
                                    <CollegeCard
                                        key={college.id || college._id}
                                        college={college}
                                        onApprove={() => approveCollegeMutation.mutate(college.id || college._id)}
                                        onReject={(reason: string) => rejectCollegeMutation.mutate({ collegeId: college.id || college._id, reason })}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="experts" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none">
                        <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
                            <CardHeader className="bg-slate-50 p-12 border-b border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                    <div className="space-y-2">
                                        <CardTitle className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter text-slate-900">
                                            <UserCheck className="h-8 w-8 text-primary" /> expert verification
                                        </CardTitle>
                                        <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Authorize and monitor industry professionals</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <div className="min-w-[800px]">
                                        {filteredProfessionals.length === 0 ? (
                                            <div className="py-24 text-center">
                                                <Users className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                                                <p className="font-black text-xl text-slate-300 uppercase">Registry Empty</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-12 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Expert</th>
                                                        <th className="px-6 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Role & Expertise</th>
                                                        <th className="px-6 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                                                        <th className="px-12 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Operations</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProfessionals.map((prof: any) => (
                                                        <tr key={prof._id || prof.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                                                            <td className="px-12 py-8">
                                                                <div className="flex items-center gap-6">
                                                                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                                        <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-lg">{prof.name.charAt(0)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="font-black text-lg uppercase tracking-tighter text-slate-900 leading-none mb-1">{prof.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prof.company}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-8">
                                                                <div className="space-y-2">
                                                                    <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 font-black text-[9px] uppercase">{prof.professionalRole}</Badge>
                                                                    <p className="text-[11px] font-black text-slate-500 uppercase">{prof.designation}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-8">
                                                                <Badge className={cn(
                                                                    "px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                                                                    prof.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                                                                        prof.status === 'pending' ? "bg-amber-50 text-amber-600 animate-pulse" : "bg-rose-50 text-rose-600"
                                                                )}>
                                                                    {prof.status === 'approved' ? 'VERIFIED' : prof.status === 'pending' ? 'IN AUDIT' : 'REVOKED'}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-12 py-8 text-right">
                                                                <div className="flex justify-end gap-3">
                                                                    {prof.status === 'pending' && (
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase shadow-lg shadow-emerald-600/10"
                                                                            onClick={() => approveMutation.mutate(prof._id || prof.id)}
                                                                        >
                                                                            APPROVE
                                                                        </Button>
                                                                    )}
                                                                    <Button variant="outline" size="sm" className="h-10 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black text-[9px] uppercase">
                                                                        PROFILE
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Round-wise Analytics */}
                            <Card className="rounded-[3rem] border-none shadow-sm bg-white overflow-hidden border border-slate-100">
                                <CardHeader className="p-10 border-b border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                                            <ShieldCheck className="h-6 w-6 text-indigo-500" /> Global Round Success
                                        </CardTitle>
                                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] uppercase px-4 py-2">LIVE METRICS</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-12">
                                    {analyticsData?.data?.roundBreakdown?.map((round: any) => {
                                        const total = round.passed + round.failed;
                                        const passRate = total > 0 ? (round.passed / total) * 100 : 0;
                                        return (
                                            <div key={round.name} className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">{round.name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{round.passed} PASSED • {round.failed} REJECTED</p>
                                                    </div>
                                                    <span className="text-xl font-black text-indigo-600">{passRate.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${passRate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Application Status Distribution */}
                            <Card className="rounded-[3rem] border-none shadow-sm bg-white overflow-hidden border border-slate-100">
                                <CardHeader className="p-10 border-b border-slate-50">
                                    <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                                        <PieChart className="h-6 w-6 text-emerald-500" /> Activity Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-10">
                                    <div className="grid grid-cols-2 gap-6">
                                        {analyticsData?.data?.applicationStatus?.map((status: any) => (
                                            <div key={status.name} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{status.name.replace(/_/g, ' ')}</p>
                                                <p className="text-2xl font-black text-slate-900 leading-none">{status.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-10 p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Global Hires</p>
                                            <p className="text-2xl font-black text-slate-900 leading-none">{analyticsData?.data?.applicationStatus?.find((s: any) => s.name === 'hired')?.value || 0}</p>
                                        </div>
                                        <TrendingUp className="h-10 w-10 text-emerald-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ label, value, icon: Icon, trend, color, bg }: any) {
    return (
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-slate-100 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group">
            <CardContent className="p-8">
                <div className="flex items-start justify-between">
                    <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500", bg, color)}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
                <div className="mt-8">
                    <h3 className="text-4xl font-black tracking-tighter text-slate-900">{value}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
                    <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{trend}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CollegeCard({ college, onApprove, onReject }: { college: any; onApprove?: () => void; onReject?: (reason: string) => void }) {
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleReject = () => {
        if (onReject && rejectionReason.trim()) {
            onReject(rejectionReason);
            setShowRejectDialog(false);
            setRejectionReason('');
        }
    };

    const getStatusBadge = () => {
        switch (college.approvalStatus) {
            case 'approved':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 font-black text-[9px] uppercase">✓ APPROVED</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-600 border-none px-3 py-1 font-black text-[9px] uppercase animate-pulse">⏳ PENDING</Badge>;
            case 'rejected':
                return <Badge className="bg-rose-500/10 text-rose-600 border-none px-3 py-1 font-black text-[9px] uppercase">✗ REJECTED</Badge>;
            default:
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 font-black text-[9px] uppercase">ACTIVE</Badge>;
        }
    };

    return (
        <Card className="rounded-[3rem] border-none shadow-sm bg-white overflow-hidden hover:shadow-2xl transition-all duration-700 group border border-slate-100 relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[60px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
            <CardContent className="p-10">
                <div className="flex items-center gap-6 mb-10">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-2xl text-slate-300 group-hover:border-primary/30 transition-colors">
                        {college.logo ? <img src={college.logo} alt="" className="h-full w-full object-contain" /> : college.name[0]}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{college.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <Globe className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">@{college.domain}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                        {getStatusBadge()}
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Region</p>
                        <p className="text-xs font-black text-slate-700 flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> GLOBAL</p>
                    </div>
                </div>

                {college.approvalStatus === 'pending' && onApprove && onReject && (
                    <div className="space-y-3 mb-6 p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-4">⚠️ Approval Required</p>
                        {!showRejectDialog ? (
                            <div className="flex gap-3">
                                <Button
                                    onClick={onApprove}
                                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> APPROVE
                                </Button>
                                <Button
                                    onClick={() => setShowRejectDialog(true)}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-2 border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest"
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> REJECT
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Input
                                    placeholder="Reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="h-12 rounded-xl border-2 border-rose-200 font-bold text-sm"
                                />
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleReject}
                                        disabled={!rejectionReason.trim()}
                                        className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] uppercase"
                                    >
                                        CONFIRM REJECT
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowRejectDialog(false);
                                            setRejectionReason('');
                                        }}
                                        variant="outline"
                                        className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase"
                                    >
                                        CANCEL
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {college.approvalStatus === 'rejected' && college.rejectionReason && (
                    <div className="mb-6 p-6 bg-rose-50 rounded-2xl border-2 border-rose-200">
                        <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-2">Rejection Reason</p>
                        <p className="text-xs text-rose-700 font-medium">{college.rejectionReason}</p>
                    </div>
                )}

                <div className="space-y-3 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Student Capacity</span>
                        <span className="text-slate-900">84%</span>
                    </div>
                    <Progress value={84} className="h-2 bg-slate-50 border border-slate-100" />
                </div>

                <Button variant="ghost" className="w-full mt-10 h-14 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all font-black uppercase text-[10px] tracking-widest shadow-sm group/btn">
                    VIEW COMMAND CENTER <ArrowUpRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </Button>
            </CardContent>
        </Card>
    );
}

