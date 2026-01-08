import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setStudents } from '@/store/slices/studentsSlice';
import { studentService } from '@/services';
import { Users, Search, GraduationCap, Briefcase, Mail, Phone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentsManagement() {
  const dispatch = useAppDispatch();
  const { students } = useAppSelector((state) => state.students);
  const { applications } = useAppSelector((state) => state.applications);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch students from API on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await studentService.getAllStudents();
        if (response.success && response.data) {
          dispatch(setStudents(response.data));
        }
      } catch (error: any) {
        console.error('Failed to fetch students:', error);
        toast.error(error.response?.data?.message || 'Failed to load students');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [dispatch]);

  // Normalize arrays to prevent TypeErrors
  const studentsList = Array.isArray(students) ? students : [];
  const applicationsList = Array.isArray(applications) ? applications : [];

  const filteredStudents = studentsList.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentStats = (studentId: string) => {
    const studentApps = applicationsList.filter(a => a.studentId === studentId);
    return {
      total: studentApps.length,
      active: studentApps.filter(a => !['rejected', 'offer_released', 'offer_accepted'].includes(a.status)).length,
      offers: studentApps.filter(a => a.status === 'offer_released' || a.status === 'offer_accepted').length,
      rejected: studentApps.filter(a => a.status === 'rejected').length,
    };
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Students Management" subtitle="View and manage all registered students">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Students Management" subtitle="View and manage all registered students">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{studentsList.length}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-success/10 p-3">
                  <GraduationCap className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{studentsList.filter(s => s.graduationYear === 2025).length}</p>
                  <p className="text-sm text-muted-foreground">2025 Graduates</p>
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
                  <p className="text-3xl font-bold">
                    {studentsList.reduce((sum, s) => sum + getStudentStats(s.id).active, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-warning/10 p-3">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {studentsList.filter(s => getStudentStats(s.id).offers > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Students with Offers</p>
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
                <CardTitle>All Students</CardTitle>
                <CardDescription>Comprehensive list of registered students</CardDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or college..."
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
                    <TableHead>Student</TableHead>
                    <TableHead>College & Branch</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const stats = getStudentStats(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {student.email}
                                </div>
                                {student.phone && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {student.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{student.college}</p>
                            <p className="text-xs text-muted-foreground">{student.branch} • {student.graduationYear}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.cgpa >= 8.0 ? 'default' : student.cgpa >= 7.0 ? 'secondary' : 'outline'}>
                              {student.cgpa} CGPA
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {student.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {student.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{student.skills.length - 3}
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
                              <div className="flex gap-2 text-xs">
                                <Badge variant="default" className="text-xs">{stats.active} active</Badge>
                                {stats.offers > 0 && (
                                  <Badge variant="success" className="text-xs">{stats.offers} offers</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {stats.offers > 0 ? (
                              <Badge className="bg-success">Placed</Badge>
                            ) : stats.active > 0 ? (
                              <Badge variant="default">Applying</Badge>
                            ) : stats.rejected > 0 ? (
                              <Badge variant="secondary">Needs Support</Badge>
                            ) : (
                              <Badge variant="outline">Not Applied</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {student.resumeUrl && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {student.linkedinUrl && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer">
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
