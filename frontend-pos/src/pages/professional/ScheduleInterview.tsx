import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateApplication } from '@/store/slices/applicationsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, Video, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function ScheduleInterview() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const application = useAppSelector((state) =>
    state.applications.applications.find((a) => a.id === appId)
  );
  const job = useAppSelector((state) =>
    state.jobs.jobs.find((j) => j.id === application?.jobId)
  );
  const student = useAppSelector((state) =>
    state.students.students.find((s) => s.id === application?.studentId)
  );

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  if (!application || !job || !student) {
    return (
      <DashboardLayout title="Schedule Interview" subtitle="Interview not found">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Application not found.</p>
            <Button onClick={() => navigate('/professional/dashboard')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleSchedule = () => {
    if (!selectedDate || !time || !meetingLink) {
      toast.error('Please fill all fields');
      return;
    }

    // Combine date and time
    const [hours, minutes] = time.split(':');
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    // Determine the correct status based on interview round
    let newStatus: any = 'professional_interview_scheduled';
    if (application.interviewRound === 'manager') {
      newStatus = 'manager_interview_scheduled';
    } else if (application.interviewRound === 'hr') {
      newStatus = 'hr_interview_scheduled';
    }

    dispatch(updateApplication({
      id: application.id,
      updates: {
        meetingLink,
        scheduledDate: scheduledDateTime,
        status: newStatus,
      },
    }));

    // Notify Student
    dispatch(addNotification({
      id: `notif-${Date.now()}`,
      userId: student.id,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `Your ${application.interviewRound} interview has been scheduled for ${format(scheduledDateTime, 'PPp')}.`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/student/${application.interviewRound}-interview`,
    }));

    // Notify Admin
    dispatch(addNotification({
      id: `notif-admin-${Date.now()}`,
      userId: 'admin-1', // Default admin
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `${getRoundTitle()} scheduled for ${student.name} on ${format(scheduledDateTime, 'PPp')}.`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/admin/dashboard`,
    }));

    toast.success('Interview scheduled successfully!');
    navigate('/professional/dashboard');
  };

  const getRoundTitle = () => {
    if (application.interviewRound === 'manager') return 'Manager Round';
    if (application.interviewRound === 'hr') return 'HR Round';
    return 'Technical Interview';
  };

  return (
    <DashboardLayout
      title="Schedule Interview"
      subtitle={`Schedule ${getRoundTitle()} for ${student.name}`}
    >
      <div className="space-y-6">
        {/* Student & Job Info */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
            <CardDescription>Review candidate information before scheduling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Candidate</Label>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Position</Label>
                <p className="font-medium">{job.roleTitle}</p>
                <p className="text-sm text-muted-foreground">{job.companyName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Interview Round</Label>
                <p className="font-medium capitalize">{getRoundTitle()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Skills</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {student.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-xs bg-secondary px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {student.skills.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{student.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Form */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
            <CardDescription>Set the interview date, time, and meeting link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Calendar */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <CalendarIcon className="h-4 w-4" />
                Select Date
              </Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            {/* Time Input */}
            <div>
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Select Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Meeting Link */}
            <div>
              <Label htmlFor="meetingLink" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Google Meet Link
              </Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Create a Google Meet link and paste it here
              </p>
            </div>

            {/* Preview */}
            {selectedDate && time && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Interview Preview</p>
                <p className="text-sm text-muted-foreground">
                  Scheduled for: {format(selectedDate, 'PPPP')} at {time}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSchedule}
                disabled={!selectedDate || !time || !meetingLink}
                className="flex-1"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/professional/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
