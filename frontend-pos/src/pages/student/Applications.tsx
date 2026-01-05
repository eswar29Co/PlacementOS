import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppSelector } from '@/store/hooks';
import { Student, ApplicationStatus } from '@/types';
import { Eye, ChevronRight, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { 
  getStatusLabel, 
  getStatusVariant, 
  hasActionRequired, 
  getActionButtonText, 
  getActionRoute 
} from '@/lib/flowHelpers';

export default function Applications() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  const { applications } = useAppSelector((state) => state.applications);
  const { jobs } = useAppSelector((state) => state.jobs);
  
  const myApplications = applications.filter(a => a.studentId === student?.id);

  return (
    <DashboardLayout title="My Applications" subtitle="Track your placement journey">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-info">
                {myApplications.filter(a => !a.status.includes('rejected') && a.status !== 'offer_released').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Offers</p>
              <p className="text-2xl font-bold text-success">
                {myApplications.filter(a => a.status === 'offer_released').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-destructive">
                {myApplications.filter(a => a.status.includes('rejected')).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No applications yet</p>
                <Button className="mt-4" onClick={() => navigate('/student/browse-jobs')}>
                  Browse Jobs
                </Button>
              </div>
            ) : (
              myApplications.map((app) => {
                const job = jobs.find(j => j.id === app.jobId);
                
                return (
                  <div key={app.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                          {job?.companyName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{job?.companyName}</p>
                          <p className="text-sm text-muted-foreground">{job?.roleTitle}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(app.status) as any}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Applied: {format(app.appliedAt, 'dd MMM yyyy')}
                    </div>

                    {/* Timeline */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {app.timeline.slice(-4).map((event, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          <span className="text-muted-foreground">{getStatusLabel(event.status)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/student/applications/${app.id}/ats-analysis`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        ATS Analysis
                      </Button>
                      {hasActionRequired(app.status) && (
                        <Button 
                          size="sm"
                          onClick={() => navigate(getActionRoute(app.status, app.id))}
                          className="ml-auto"
                        >
                          {getActionButtonText(app.status)}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
