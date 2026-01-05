import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { mockInterviews } from '@/data/mockData';
import { Professional } from '@/types';
import { Video, Calendar, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ProfessionalHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const professional = user as Professional;
  
  const myInterviews = mockInterviews.filter(i => i.interviewerId === professional?.id);
  const pending = myInterviews.filter(i => i.status === 'scheduled');

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome, ${professional?.name}`}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-primary">{professional?.interviewsTaken}</p>
              <p className="text-muted-foreground">Interviews Taken</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold text-warning">{pending.length}</p>
              <p className="text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-6 w-6 text-warning fill-warning" />
                <span className="text-4xl font-bold">{professional?.rating}</span>
              </div>
              <p className="text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Upcoming Interviews</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {pending.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No pending interviews</p>
            ) : (
              pending.map((interview) => (
                <div key={interview.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{interview.student?.name}</p>
                      <p className="text-sm text-muted-foreground">{interview.student?.college}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{interview.scheduledAt && format(interview.scheduledAt, 'dd MMM, HH:mm')}</p>
                    <Button size="sm" className="mt-2" onClick={() => navigate(`/professional/interview/${interview.id}`)}>
                      View Profile & Join
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
