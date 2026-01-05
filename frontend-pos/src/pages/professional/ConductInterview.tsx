import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addInterviewFeedback, updateApplication } from '@/store/slices/applicationsSlice';
import { assignManagerToStudent, assignHRToStudent } from '@/store/slices/applicationsSlice';
import { decrementInterviewCount } from '@/store/slices/professionalsSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Star, CheckCircle, XCircle } from 'lucide-react';

export default function ConductInterview() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const application = useAppSelector((state) =>
    state.applications.applications.find((a) => a.id === appId)
  );
  const job = useAppSelector((state) =>
    state.jobs.jobs.find((j) => j.id === application?.jobId)
  );
  const student = useAppSelector((state) =>
    state.students.students.find((s) => s.id === application?.studentId)
  );

  const [rating, setRating] = useState<number>(3);
  const [recommendation, setRecommendation] = useState<'Pass' | 'Fail'>('Pass');
  const [comments, setComments] = useState('');
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);

  const improvementOptions = [
    'Communication Skills',
    'Technical Skills',
    'Problem Solving',
    'Domain Knowledge',
  ];

  if (!application || !job || !student || !user) {
    return (
      <DashboardLayout title="Conduct Interview" subtitle="Interview not found">
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

  const handleToggleImprovement = (area: string) => {
    setImprovementAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  const handleSubmit = () => {
    if (!comments.trim()) {
      toast.error('Please provide feedback comments');
      return;
    }

    if (recommendation === 'Fail' && improvementAreas.length === 0) {
      toast.error('Please select at least one improvement area');
      return;
    }

    // Add interview feedback
    dispatch(addInterviewFeedback({
      id: application.id,
      feedback: {
        professionalId: user.id,
        professionalName: user.name,
        round: application.interviewRound || 'professional',
        rating,
        comments,
        recommendation,
        improvementAreas: recommendation === 'Fail' ? improvementAreas : [],
        conductedAt: new Date(),
      },
    }));

    // Decrement professional's active interview count
    dispatch(decrementInterviewCount(user.id));

    // Auto-advance based on recommendation and round
    if (recommendation === 'Pass') {
      if (application.interviewRound === 'professional') {
        // Advance to Manager round
        dispatch(assignManagerToStudent(application.id));

        // Notify Admin
        dispatch(addNotification({
          id: `notif-admin-${Date.now()}`,
          userId: 'admin-1',
          type: 'interview_completed',
          title: 'Technical Round Cleared',
          message: `${student.name} passed the Technical Interview with ${user.name}. Manager round assignment initiated.`,
          read: false,
          createdAt: new Date(),
          actionUrl: '/admin/dashboard',
        }));

        toast.success('Interview completed! Assigning Manager round...');
      } else if (application.interviewRound === 'manager') {
        // Advance to HR round
        dispatch(assignHRToStudent(application.id));

        // Notify Admin
        dispatch(addNotification({
          id: `notif-admin-${Date.now()}`,
          userId: 'admin-1',
          type: 'interview_completed',
          title: 'Manager Round Cleared',
          message: `${student.name} passed the Manager Interview with ${user.name}. HR round assignment initiated.`,
          read: false,
          createdAt: new Date(),
          actionUrl: '/admin/dashboard',
        }));

        toast.success('Interview completed! Assigning HR round...');
      } else if (application.interviewRound === 'hr') {
        // Complete HR round
        dispatch(updateApplication({
          id: application.id,
          updates: { status: 'hr_round_completed' },
        }));

        dispatch(addNotification({
          id: `notif-${Date.now()}`,
          userId: student.id,
          type: 'application_update',
          title: 'Congratulations!',
          message: 'You have successfully completed all interview rounds. Awaiting offer release.',
          read: false,
          createdAt: new Date(),
          actionUrl: '/student/applications',
        }));

        // Notify Admin
        dispatch(addNotification({
          id: `notif-admin-${Date.now()}`,
          userId: 'admin-1',
          type: 'interview_completed',
          title: 'HR Round Cleared - Ready for Offer',
          message: `${student.name} passed the HR Interview with ${user.name}. Application ready for offer release.`,
          read: false,
          createdAt: new Date(),
          actionUrl: '/admin/dashboard',
        }));

        toast.success('Interview completed! Student passed all rounds.');
      }
    } else {
      // Fail - Reject the application
      dispatch(updateApplication({
        id: application.id,
        updates: { status: 'rejected' },
      }));

      dispatch(addNotification({
        id: `notif-${Date.now()}`,
        userId: student.id,
        type: 'application_update',
        title: 'Interview Feedback',
        message: `Unfortunately, you did not pass the ${application.interviewRound} interview round. Please review the feedback for improvement areas.`,
        read: false,
        createdAt: new Date(),
        actionUrl: '/student/applications',
      }));

      // Notify Admin
      dispatch(addNotification({
        id: `notif-admin-${Date.now()}`,
        userId: 'admin-1',
        type: 'application_update',
        title: 'Candidate Rejected',
        message: `${student.name} was rejected in the ${application.interviewRound} interview round by ${user.name}.`,
        read: false,
        createdAt: new Date(),
        actionUrl: '/admin/dashboard',
      }));

      toast.info('Feedback submitted. Application marked as rejected.');
    }

    navigate('/professional/dashboard');
  };

  const getRoundTitle = () => {
    if (application.interviewRound === 'manager') return 'Manager Round';
    if (application.interviewRound === 'hr') return 'HR Round';
    return 'Technical Interview';
  };

  return (
    <DashboardLayout
      title="Conduct Interview"
      subtitle={`${getRoundTitle()} - ${student.name}`}
    >
      <div className="space-y-6">
        {/* Candidate Info */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
            <CardDescription>Review candidate details before providing feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{student.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Position</Label>
                <p className="font-medium">{job.roleTitle}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">College</Label>
                <p className="font-medium">{student.college}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">CGPA</Label>
                <p className="font-medium">{student.cgpa}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {student.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
            {student.resumeUrl && (
              <div>
                <Label className="text-muted-foreground">Resume</Label>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previous Feedback (if any) */}
        {application.interviewFeedback && application.interviewFeedback.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Round Feedback</CardTitle>
              <CardDescription>Feedback from earlier interview rounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.interviewFeedback.map((feedback, idx) => (
                <div key={idx} className="border-l-2 border-primary pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">{feedback.round} Round</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{feedback.rating}/5</span>
                    </div>
                    <Badge variant={feedback.recommendation === 'Pass' ? 'default' : 'destructive'}>
                      {feedback.recommendation}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.comments}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Feedback</CardTitle>
            <CardDescription>Provide your assessment and recommendation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4" />
                Overall Rating: {rating}/5
              </Label>
              <Slider
                value={[rating]}
                onValueChange={(value) => setRating(value[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <Label className="mb-3 block">Recommendation</Label>
              <RadioGroup value={recommendation} onValueChange={(value: any) => setRecommendation(value)}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-green-200 bg-green-50">
                  <RadioGroupItem value="Pass" id="pass" />
                  <Label htmlFor="pass" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Pass - Proceed to next round</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-red-200 bg-red-50">
                  <RadioGroupItem value="Fail" id="fail" />
                  <Label htmlFor="fail" className="flex items-center gap-2 cursor-pointer">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Fail - Reject application</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Improvement Areas (shown only if Fail) */}
            {recommendation === 'Fail' && (
              <div>
                <Label className="mb-3 block">Areas for Improvement</Label>
                <div className="space-y-2">
                  {improvementOptions.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={improvementAreas.includes(area)}
                        onCheckedChange={() => handleToggleImprovement(area)}
                      />
                      <Label htmlFor={area} className="cursor-pointer">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <Label htmlFor="comments" className="mb-2 block">
                Detailed Feedback
                {recommendation === 'Fail' && (
                  <span className="text-muted-foreground text-sm ml-2">
                    (Please provide constructive feedback for improvement)
                  </span>
                )}
              </Label>
              <Textarea
                id="comments"
                placeholder="Provide detailed feedback about the candidate's performance, strengths, and areas for improvement..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={6}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} className="flex-1">
                Submit Feedback & {recommendation === 'Pass' ? 'Advance' : 'Reject'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/professional/dashboard')}>
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
