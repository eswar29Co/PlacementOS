import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services';
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
  const queryClient = useQueryClient();

  const { data: applicationData } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => applicationService.getApplicationById(appId!),
    enabled: !!appId,
  });

  const application = applicationData?.data;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const scheduleInterviewMutation = useMutation({
    mutationFn: (data: { applicationId: string; scheduledDate: Date; zoomLink?: string }) =>
      applicationService.scheduleInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
      queryClient.invalidateQueries({ queryKey: ['professional-applications'] });
      toast.success('Interview scheduled successfully!');
      navigate('/professional/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule interview');
    },
  });

  if (!application) {
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

  const job = application.job;
  const student = application.student;

  const handleSchedule = () => {
    if (!selectedDate || !time || !meetingLink) {
      toast.error('Please fill all fields');
      return;
    }

    // Combine date and time
    const [hours, minutes] = time.split(':');
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    scheduleInterviewMutation.mutate({
      applicationId: application.id,
      scheduledDate: scheduledDateTime,
      meetingLink: meetingLink,
    });
  };

  const getRoundTitle = () => {
    if (!application) return 'Technical Interview';
    if (application.status.includes('manager')) return 'Manager Round';
    if (application.status.includes('hr')) return 'HR Round';
    return 'Technical Interview';
  };

  return (
    <DashboardLayout
      title="Schedule Interview"
      subtitle={`Schedule ${getRoundTitle()} for ${student?.name || 'Candidate'}`}
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
                <p className="font-medium">{student?.name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{student?.email || ''}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Position</Label>
                <p className="font-medium">{job?.title || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{job?.company || ''}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Interview Round</Label>
                <p className="font-medium capitalize">{getRoundTitle()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Skills</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {student?.skills?.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="text-xs bg-secondary px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {student?.skills && student.skills.length > 3 && (
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
