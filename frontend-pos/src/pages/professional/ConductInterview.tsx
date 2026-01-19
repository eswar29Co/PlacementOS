import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services';
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
  const queryClient = useQueryClient();

  const { user } = useAppSelector((state) => state.auth);
  
  const { data: applicationData } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => applicationService.getApplicationById(appId!),
    enabled: !!appId,
  });

  const application = applicationData?.data;

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

  const submitFeedbackMutation = useMutation({
    mutationFn: (data: {
      applicationId: string;
      round: 'professional' | 'manager' | 'hr';
      rating: number;
      comments: string;
      improvementAreas?: string[];
      recommendation: 'Pass' | 'Fail';
    }) => applicationService.submitInterviewFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
      queryClient.invalidateQueries({ queryKey: ['professional-applications'] });
      toast.success('Feedback submitted successfully!');
      navigate('/professional/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit feedback');
    },
  });

  if (!application || !user) {
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

  const job = application.jobId;
  const student = application.studentId;

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

    // Determine interview round from application status
    let round: 'professional' | 'manager' | 'hr' = 'professional';
    if (application.status.includes('manager')) {
      round = 'manager';
    } else if (application.status.includes('hr')) {
      round = 'hr';
    }

    submitFeedbackMutation.mutate({
      applicationId: application.id,
      round,
      rating,
      comments,
      improvementAreas: recommendation === 'Fail' ? improvementAreas : undefined,
      recommendation,
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
      title="Conduct Interview"
      subtitle={`${getRoundTitle()} - ${student?.name || 'Candidate'}`}
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
                <p className="font-medium">{student?.name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Position</Label>
                <p className="font-medium">{job?.roleTitle || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">College</Label>
                <p className="font-medium">{student?.college || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">CGPA</Label>
                <p className="font-medium">{student?.cgpa || 'N/A'}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {student?.skills?.map((skill: string) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                )) || <p className="text-sm text-muted-foreground">No skills listed</p>}
              </div>
            </div>
            {student?.resumeUrl && (
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
        {application.professionalInterviewFeedback && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Round Feedback</CardTitle>
              <CardDescription>Feedback from earlier interview rounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-2 border-primary pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="capitalize">Professional Round</Badge>
                  <Badge variant="default">Pass</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {application.professionalInterviewFeedback}
                </p>
              </div>
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
