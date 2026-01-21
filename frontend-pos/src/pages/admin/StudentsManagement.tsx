import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { studentService, applicationService } from '@/services';
import {
  Users, Search, GraduationCap, Briefcase, Mail, Phone,
  ExternalLink, Target, Star, Filter, ArrowUpRight, Award,
  Fingerprint, BookOpen, MapPin, Linkedin, Sparkles, Activity,
  Cpu, Terminal, ShieldCheck, School
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function StudentsManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students (Sanitized casting)
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getAllStudents(),
  });
  const studentsList = Array.isArray(studentsData?.data) ? studentsData.data : [];

  // Fetch applications (Sanitized casting)
  const { data: applicationsData } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getAllApplications(),
  });
  const applicationsList = Array.isArray((applicationsData?.data as any)?.applications)
    ? (applicationsData?.data as any).applications
    : Array.isArray(applicationsData?.data)
      ? applicationsData.data
      : [];

  const filteredStudents = studentsList.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentStats = (studentId: string) => {
    const studentApps = applicationsList.filter((a: any) => a.studentId === studentId);
    return {
      total: studentApps.length,
      active: studentApps.filter((a: any) => !['rejected', 'offer_released', 'offer_accepted'].includes(a.status)).length,
      offers: studentApps.filter((a: any) => a.status === 'offer_released' || a.status === 'offer_accepted').length,
      rejected: studentApps.filter((a: any) => a.status === 'rejected').length,
    };
  };

  const headerStats = [
    { label: 'Total Enrolled', value: studentsList.length, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Market Velocity', value: '88%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50/5' },
    { label: 'Active Pipeline', value: studentsList.reduce((sum: number, s: any) => sum + getStudentStats(s._id || s.id).active, 0), icon: Target, color: 'text-amber-600', bg: 'bg-amber-50/5' },
    { label: 'Total Placements', value: studentsList.filter((s: any) => getStudentStats(s._id || s.id).offers > 0).length, icon: Award, color: 'text-blue-600', bg: 'bg-blue-50/5' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Student Intelligence" subtitle="Platform-wide candidate registry and metrics">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent animate-spin rounded-2xl shadow-2xl shadow-primary/20" />
          <p className="font-extrabold text-primary animate-pulse uppercase tracking-[0.4em] text-[10px]">Synchronizing Candidate Logs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Intelligence" subtitle="Platform-wide candidate registry and performance metrics">
      <div className="space-y-10 max-w-[1600px] mx-auto pb-20 relative">

        {/* Cinematic Backdrop */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {headerStats.map((stat) => (
            <Card key={stat.label} className="border-slate-200 shadow-sm rounded-[2rem] bg-white border group hover:bg-slate-50 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-2xl p-5 transition-transform group-hover:rotate-12 duration-500 border border-slate-100 shadow-sm", stat.bg, stat.color)}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <div className="text-right">
                    <p className={cn("text-4xl font-black tracking-tighter italic leading-none", stat.color)}>{stat.value}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-80">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Intelligence Board */}
        <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
          <CardHeader className="bg-slate-50 p-12 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black flex items-center gap-4 italic uppercase tracking-tighter text-slate-900">
                  <Fingerprint className="h-8 w-8 text-primary" />
                  Candidate Registry
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Real-time oversight of student profiles and simulation participation</CardDescription>
              </div>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Filter by name, email, or college domain..."
                  className="pl-16 h-16 w-full md:w-[450px] bg-white border-slate-200 rounded-2xl shadow-sm font-bold text-slate-900 focus-visible:ring-primary/20 placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 h-20">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="px-12 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Candidate Profile</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Academic Nexus</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Simulation Status</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right px-12">System Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow className="border-none hover:bg-transparent">
                      <TableCell colSpan={4} className="py-48 text-center">
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                          <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                            <Target className="h-12 w-12 text-slate-200" />
                          </div>
                          <p className="font-black text-2xl text-slate-300 uppercase tracking-tighter italic">No Registered Profiles Detected</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student: any) => {
                      const stats = getStudentStats(student._id || student.id);
                      const studentProgress = stats.total > 0 ? (stats.offers > 0 ? 100 : Math.min(stats.total * 20, 80)) : 0;

                      return (
                        <TableRow key={student._id || student.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-100">
                          <TableCell className="px-12 py-10">
                            <div className="flex items-center gap-8">
                              <div className="relative">
                                <Avatar className="h-16 w-16 rounded-[1.5rem] border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-110 duration-500">
                                  <AvatarFallback className="bg-slate-100 text-primary font-black text-xl">
                                    {student.name.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                  "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white shadow-sm",
                                  stats.offers > 0 ? "bg-emerald-500" : stats.active > 0 ? "bg-primary" : "bg-slate-300"
                                )} />
                              </div>
                              <div className="space-y-2">
                                <p className="font-black text-xl leading-none italic uppercase tracking-tighter text-slate-900">{student.name}</p>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <Mail className="h-3.5 w-3.5 text-primary opacity-50" /> {student.email}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {student.skills?.slice(0, 3).map((skill: string) => (
                                    <Badge key={skill} className="bg-slate-50 text-slate-500 text-[8px] py-1 border border-slate-100 font-black uppercase tracking-widest shadow-none">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-4">
                              <p className="font-black flex items-center gap-3 text-sm text-slate-700 uppercase tracking-tight italic">
                                <School className="h-4 w-4 text-primary" /> {student.college}
                              </p>
                              <div className="flex items-center gap-3">
                                <Badge className="bg-primary/5 text-primary border border-primary/10 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-none">{student.branch}</Badge>
                                <Badge className="bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1 rounded-full shadow-none">
                                  <GraduationCap className="h-3.5 w-3.5" /> BATCH {student.graduationYear}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="max-w-[220px] mx-auto space-y-4">
                              <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                  <span className="text-lg font-black text-slate-900 italic">{student.cgpa}</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pipeline Alpha</span>
                              </div>
                              <div className="space-y-2">
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner p-[1px]">
                                  <div className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    stats.offers > 0 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                  )} style={{ width: `${studentProgress}%` }} />
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                                  <span className={cn(
                                    "italic",
                                    stats.offers > 0 ? "text-emerald-500" : stats.active > 0 ? "text-primary" : "text-slate-600"
                                  )}>
                                    {stats.offers > 0 ? 'DEPLOYED' : stats.active > 0 ? `${stats.active} LIVE STREAMS` : 'STANDBY'}
                                  </span>
                                  {stats.total > 0 && <span className="text-slate-500">{stats.total} SUBMISSIONS</span>}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-12 text-right">
                            <div className="flex justify-end items-center gap-4">
                              {student.resumeUrl && (
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all border border-slate-200 shadow-sm" asChild title="Dossier Uplink">
                                  <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-5 w-5" />
                                  </a>
                                </Button>
                              )}
                              {student.linkedinUrl && (
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-all border border-slate-200 shadow-sm" asChild title="Social Identity">
                                  <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-5 w-5" />
                                  </a>
                                </Button>
                              )}
                              <Button className="h-12 px-6 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 uppercase text-[10px] tracking-widest gap-2">
                                DOSSIER <ArrowUpRight className="h-3.5 w-3.5" />
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
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
