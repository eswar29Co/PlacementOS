import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { studentService, adminService } from '@/services';
import {
  Users, Search, GraduationCap, Mail,
  Target, Star, FileText, Fingerprint,
  Cpu, School, ArrowRight,
  Calendar, Activity, Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function StudentsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getAllStudents(),
  });
  const studentsList = Array.isArray(studentsData?.data) ? studentsData.data : [];

  // Fetch student history for modal
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['studentHistory', selectedStudentId],
    queryFn: () => selectedStudentId ? adminService.getStudentHistory(selectedStudentId) : null,
    enabled: !!selectedStudentId,
  });

  const filteredStudents = studentsList.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Student Management" subtitle="Manage all students and their progress">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent animate-spin rounded-2xl shadow-2xl shadow-primary/20" />
          <p className="font-extrabold text-primary animate-pulse uppercase tracking-[0.4em] text-[10px]">Loading Student Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Registry" subtitle="Global candidate database and performance tracking">
      <div className="space-y-10 max-w-[1600px] mx-auto pb-20 relative">

        {/* Cinematic Backdrop Decor */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 rounded-full blur-[140px] -z-10" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

        {/* Tactical Header Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard label="Total Candidates" value={studentsList.length} icon={Users} color="text-primary" />
          <StatCard
            label="Avg Placement CGPA"
            value={studentsList.length > 0 ? (studentsList.reduce((acc: number, s: any) => acc + (parseFloat(s.cgpa) || 0), 0) / studentsList.length).toFixed(1) : 'N/A'}
            icon={Star}
            color="text-amber-500"
          />
          <StatCard label="Active Funnel" value="N/A" icon={Target} color="text-blue-500" />
          <StatCard label="Success Ratio" value="N/A" icon={Activity} color="text-emerald-500" />
        </div>

        {/* Database Board */}
        <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
          <CardHeader className="bg-slate-50 p-12 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black flex items-center gap-4 uppercase tracking-tighter text-slate-900">
                  <Fingerprint className="h-8 w-8 text-primary" />
                  Candidate Registry
                </CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Identify and track student performance across all recruitment protocols</CardDescription>
              </div>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Query by name, college, or digital signature..."
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
                    <TableHead className="px-12 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Candidate Information</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Academic Background</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Score</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right px-12">Operations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow className="border-none hover:bg-transparent">
                      <TableCell colSpan={4} className="py-48 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <Users className="h-12 w-12 text-slate-200" />
                          <p className="font-black text-2xl text-slate-300 uppercase tracking-tighter">No Candidate Signatures Found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student: any) => (
                      <TableRow key={student._id || student.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-slate-100">
                        <TableCell className="px-12 py-10">
                          <div className="flex items-center gap-8">
                            <Avatar className="h-16 w-16 rounded-[1.5rem] border-2 border-slate-100 shadow-sm group-hover:scale-110 duration-500">
                              <AvatarFallback className="bg-slate-100 text-primary font-black text-xl">{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="font-black text-xl leading-none uppercase tracking-tighter text-slate-900">{student.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-3">
                            <p className="font-black text-sm text-slate-700 uppercase tracking-tight flex items-center gap-2">
                              <School className="h-3.5 w-3.5 text-primary opacity-50" /> {student.college.split(' ')[0]} ...
                            </p>
                            <div className="flex gap-2">
                              <Badge className="bg-primary/5 text-primary border border-primary/10 text-[8px] font-black uppercase tracking-widest">{student.branch}</Badge>
                              <Badge className="bg-slate-50 text-slate-400 border border-slate-100 text-[8px] font-black uppercase tracking-widest">BATCH {student.graduationYear}</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span className="text-xl font-black text-slate-900 leading-none">{student.cgpa}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-12 text-right">
                          <Button
                            className="h-12 px-8 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/10 uppercase text-[10px] tracking-[0.2em] gap-3"
                            onClick={() => handleViewProfile(student._id || student.id)}
                          >
                            VIEW FULL PROFILE <ArrowRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Student Profile & History Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-5xl rounded-[3rem] p-0 overflow-hidden border border-slate-200 bg-white shadow-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="p-12 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-10">
                <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-white shadow-xl">
                  <AvatarFallback className="bg-primary text-white font-black text-3xl">
                    {historyData?.data?.student?.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                    {historyData?.data?.student?.name || 'Loading...'}
                  </DialogTitle>
                  <div className="flex items-center gap-6">
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">{historyData?.data?.student?.email}</p>
                    <Badge className="bg-white text-slate-600 border border-slate-200 font-black text-[9px] uppercase px-3 py-1 rounded-full">{historyData?.data?.student?.college}</Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              {historyLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin rounded-xl" />
                  <p className="font-black text-[10px] text-primary uppercase tracking-widest animate-pulse">Syncing History...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Stats Grid for Student */}
                  <div className="grid grid-cols-4 gap-6">
                    <HistoryStat label="CGPA" value={historyData?.data?.student?.cgpa || 'N/A'} icon={Star} color="text-amber-500" />
                    <HistoryStat label="Applications" value={historyData?.data?.applications?.length || 0} icon={FileText} color="text-blue-500" />
                    <HistoryStat label="Skills" value={historyData?.data?.student?.skills?.length || 0} icon={Cpu} color="text-purple-500" />
                    <HistoryStat label="Active Status" value={historyData?.data?.student?.isActive ? 'Online' : 'Offline'} icon={Activity} color="text-emerald-500" />
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-6">
                    <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                      <Cpu className="h-4 w-4" /> TECH STACK TELEMETRY
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {historyData?.data?.student?.skills?.map((skill: string) => (
                        <Badge key={skill} className="bg-slate-50 text-slate-600 border border-slate-200 px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Application Timeline */}
                  <div className="space-y-8">
                    <h5 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                      <Calendar className="h-4 w-4" /> ENGAGEMENT HISTORY
                    </h5>

                    <div className="space-y-6">
                      {historyData?.data?.applications?.length === 0 ? (
                        <div className="bg-slate-50 rounded-3xl p-10 text-center border border-dashed border-slate-200">
                          <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest">No recruitment engagements initialized.</p>
                        </div>
                      ) : (
                        historyData?.data?.applications?.map((app: any) => (
                          <div key={app.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:bg-slate-50 transition-all duration-300 group/app">
                            <div className="flex justify-between items-start mb-6">
                              <div className="space-y-2">
                                <p className="font-black text-xl uppercase tracking-tighter text-slate-900 leading-none">{app.jobId?.companyName}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.jobId?.roleTitle}</p>
                              </div>
                              <Badge className={cn(
                                "font-black text-[9px] uppercase tracking-[0.2em] px-4 py-2 rounded-full border-none shadow-sm",
                                app.status === 'hired' || app.status === 'offer_accepted' ? "bg-emerald-50 text-emerald-600" :
                                  app.status.includes('rejected') ? "bg-rose-50 text-rose-600" : "bg-primary/5 text-primary"
                              )}>
                                {app.status.replace(/_/g, ' ')}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-slate-100">
                              <RoundMetric label="Resume Score" value={app.resumeScore ? `${app.resumeScore}%` : 'N/A'} icon={FileText} />
                              <RoundMetric label="Assessment" value={app.assessmentScore ? `${app.assessmentScore}%` : 'N/A'} icon={Zap} />
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Applied On</p>
                                <p className="text-[11px] font-black text-slate-600 uppercase leading-none">{format(new Date(app.appliedAt), 'MMM dd, yyyy')}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <Button className="rounded-2xl h-12 px-10 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.3em]" onClick={() => setIsModalOpen(false)}>
                CLOSE PROFILE
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-[2rem] bg-white border overflow-hidden relative group hover:bg-slate-50 transition-all duration-500">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className={cn("rounded-2xl p-4 border border-slate-100 bg-white shadow-sm transition-transform group-hover:rotate-6 duration-300", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className={cn("text-3xl font-black tracking-tighter leading-none", color)}>{value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-80">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-5 group hover:bg-slate-50 transition-all duration-300">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-slate-100 bg-white shadow-inner transition-transform group-hover:scale-110", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
}

function RoundMetric({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-sm font-black text-slate-700 uppercase leading-none">{value}</p>
    </div>
  );
}
