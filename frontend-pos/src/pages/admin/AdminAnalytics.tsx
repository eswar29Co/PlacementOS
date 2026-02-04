import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Users, Briefcase, GraduationCap, FileText, TrendingUp, Info,
    Activity, Target, Sparkles, Zap, Brain, Globe, Database,
    Cpu, AppWindow, MousePointer2
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

// Premium high-fidelity color palette
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9'];

export default function AdminAnalytics() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAnalytics();
            if (response.success) {
                setData(response.data);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Platform Analytics" subtitle="Overview of platform performance and growth">
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
                    <div className="h-16 w-16 border-4 border-primary border-t-transparent animate-spin rounded-2xl shadow-2xl shadow-primary/20" />
                    <p className="font-extrabold text-primary animate-pulse uppercase tracking-[0.4em] text-[10px]">Loading Analytics...</p>
                </div>
            </DashboardLayout>
        );
    }

    const { overview, roundBreakdown, cgpaStats, monthlyTrends, applicationStatus } = data;

    return (
        <DashboardLayout title="System Analytics" subtitle="Insights into platform growth and hiring performance">
            <div className="space-y-10 max-w-[1600px] mx-auto pb-20 relative">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-primary/5 rounded-full blur-[140px] -z-10" />
                <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">PLACEMENT <span className="text-primary">INTELLIGENCE</span></h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">GOD-EYE VIEW of students, experts, and hiring outcomes</p>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-3 bg-primary/5 border border-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm animate-pulse">
                        <Activity className="h-4 w-4" />
                        Platform Sync Active
                    </div>
                </div>

                {/* Tactical Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <AnalyticsCard label="Total Jobs" value={overview.totalJobs} icon={Briefcase} color="text-indigo-600" bg="bg-indigo-50/5" />
                    <AnalyticsCard label="Candidates" value={overview.totalStudents} icon={GraduationCap} color="text-emerald-600" bg="bg-emerald-50/5" />
                    <AnalyticsCard label="Experts" value={overview.totalProfessionals} icon={Users} color="text-amber-600" bg="bg-amber-50/5" />
                    <AnalyticsCard label="Active Applications" value={overview.activeApplications} icon={Target} color="text-blue-600" bg="bg-blue-50/5" />
                    <AnalyticsCard label="Total Apps" value={overview.totalApplications} icon={FileText} color="text-rose-600" bg="bg-rose-50/5" />
                </div>

                <Tabs defaultValue="pipeline" className="w-full">
                    <div className="flex justify-center mb-10">
                        <TabsList className="bg-slate-100/50 backdrop-blur-3xl border border-slate-200 p-2 rounded-2xl h-auto gap-2">
                            <TabsTrigger value="pipeline" className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-slate-400">Hiring Pipeline</TabsTrigger>
                            <TabsTrigger value="cgpa" className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-slate-400">CGPA Analytics</TabsTrigger>
                            <TabsTrigger value="growth" className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-slate-400">Platform Growth</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="pipeline" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <ChartCard title="Selection Funnel" subtitle="Passed vs Failed candidates at each critical checkpoint" icon={Zap} className="lg:col-span-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={roundBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                        <Bar dataKey="passed" name="Selected" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                                        <Bar dataKey="failed" name="Rejected" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="Current Status" subtitle="Real-time distribution of candidates" icon={Target} className="lg:col-span-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={applicationStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {applicationStatus.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ color: '#0f172a', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </TabsContent>

                    <TabsContent value="cgpa" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                        <div className="grid grid-cols-1 gap-8">
                            <ChartCard title="Placement Success by CGPA" subtitle="Analysis of hiring outcomes correlated with academic performance" icon={GraduationCap}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={cgpaStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="range" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                        <Area type="monotone" dataKey="passed" name="Offers Secured" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPassed)" />
                                        <Area type="monotone" dataKey="failed" name="Rejected" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorFailed)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </TabsContent>

                    <TabsContent value="growth" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                        <div className="grid grid-cols-1 gap-8">
                            <ChartCard title="Platform Adoption Trend" subtitle="Monthly application volume and platform engagement growth" icon={TrendingUp}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                        />
                                        <Area type="monotone" dataKey="value" name="New Applications" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-white border-slate-200 rounded-[2.5rem] shadow-sm relative overflow-hidden group border">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-[60px] animate-pulse" />
                        <CardHeader className="flex flex-row items-start gap-6 p-10">
                            <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                <Info className="h-7 w-7" />
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900">Executive Summary</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Summarized system insights</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-10 pb-10 space-y-4">
                            <InsightItem text={`${roundBreakdown[0]?.name} has the highest volume of activity with ${roundBreakdown[0]?.passed + roundBreakdown[0]?.failed} total reviews.`} />
                            <InsightItem text={`Hiring success rate is notably higher for students with CGPA > 8.0.`} />
                            <InsightItem text={`Current active funnel has ${overview.activeApplications} candidates moving through various rounds.`} />
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-amber-200 rounded-[2.5rem] shadow-sm relative overflow-hidden group border">
                        <div className="absolute bottom-0 left-0 h-32 w-32 bg-amber-50/50 rounded-full blur-[60px] animate-pulse" />
                        <CardHeader className="flex flex-row items-start gap-6 p-10">
                            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                <Target className="h-7 w-7" />
                            </div>
                            <div className="space-y-2">
                                <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900">Intelligence Guide</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Decision support systems</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-10 pb-10">
                            <p className="text-slate-500 font-bold text-xs leading-relaxed">
                                This dashboard provides a God-eye view of the entire placement process. Use the Hiring Pipeline tab to identify bottlenecks and the CGPA Analytics to understand selection patterns.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function AnalyticsCard({ label, value, icon: Icon, color, bg }: any) {
    return (
        <Card className="border-slate-200 shadow-sm rounded-[2.5rem] bg-white border group hover:bg-slate-50 transition-all duration-500 overflow-hidden relative">
            <CardContent className="p-10">
                <div className="flex items-center justify-between">
                    <div className={cn("rounded-2xl p-5 transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 border border-slate-100 shadow-sm", bg, color)}>
                        <Icon className="h-8 w-8" />
                    </div>
                    <div className="text-right">
                        <p className={cn("text-4xl font-black tracking-tighter leading-none", color)}>{value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 opacity-70">{label}</p>
                    </div>
                </div>
            </CardContent>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent group-hover:via-primary/30 transition-all duration-700" />
        </Card>
    );
}

function ChartCard({ title, subtitle, icon: Icon, children, className }: any) {
    return (
        <Card className={cn("border-slate-100 shadow-sm rounded-[3rem] overflow-hidden bg-white border", className)}>
            <CardHeader className="p-10 pb-6 bg-slate-50/50">
                <div className="flex items-start gap-5">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-tighter uppercase text-slate-900 leading-none">{title}</CardTitle>
                        <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2">{subtitle}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-10 h-[400px]">
                {children}
            </CardContent>
        </Card>
    );
}

function InsightItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-4 group/item">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <p className="text-[11px] font-bold text-slate-500 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">{text}</p>
        </div>
    );
}
