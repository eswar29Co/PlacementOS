import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockStudents, mockProfessionals, mockApplications, mockJobs } from '@/data/mockData';
import { Users, TrendingUp, Briefcase, CheckCircle, Clock, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const pendingProfessionals = mockProfessionals.filter(p => p.status === 'pending');
  
  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform overview">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3"><Users className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="text-3xl font-bold">{mockStudents.length}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-success/10 p-3"><UserCheck className="h-6 w-6 text-success" /></div>
                <div>
                  <p className="text-3xl font-bold">{mockProfessionals.filter(p => p.status === 'approved').length}</p>
                  <p className="text-sm text-muted-foreground">Professionals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-warning/10 p-3"><Clock className="h-6 w-6 text-warning" /></div>
                <div>
                  <p className="text-3xl font-bold">{pendingProfessionals.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-info/10 p-3"><Briefcase className="h-6 w-6 text-info" /></div>
                <div>
                  <p className="text-3xl font-bold">{mockJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Pending Professional Approvals</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProfessionals.map((prof) => (
                  <TableRow key={prof.id}>
                    <TableCell className="font-medium">{prof.name}</TableCell>
                    <TableCell>{prof.company}</TableCell>
                    <TableCell>{prof.experience} years</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
