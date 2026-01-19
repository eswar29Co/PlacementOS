import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService, jobService } from '@/services';
import { Student } from '@/types';
import { Award, Download, Calendar, IndianRupee, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Offers() {
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  const queryClient = useQueryClient();
  
  const acceptOfferMutation = useMutation({
    mutationFn: (applicationId: string) => 
      applicationService.acceptOffer(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Congratulations! You have accepted the offer!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept offer');
    },
  });
  
  const { data: applicationsData } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });
  
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });
  
  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];
  const jobs = Array.isArray(jobsData?.data)
    ? jobsData.data
    : (jobsData?.data && 'jobs' in jobsData.data)
    ? jobsData.data.jobs
    : [];
  
  const offers = applications.filter(a => a.studentId === student?.id && a.status === 'offer_released');

  const handleAcceptOffer = (applicationId: string) => {
    acceptOfferMutation.mutate(applicationId);
  };

  const handleDownloadOffer = (offer: any) => {
    const job = typeof offer.jobId === 'object' ? offer.jobId : jobs.find(j => j.id === offer.jobId);
    const offerDetails = offer.offerDetails || {};
    const ctc = offerDetails.package || job?.package || job?.ctcBand || 'Not specified';
    const joiningDate = offerDetails.joiningDate ? new Date(offerDetails.joiningDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Generate offer letter content
    const offerLetterContent = `
OFFER LETTER

Date: ${format(new Date(), 'dd MMMM yyyy')}

Dear ${student.name},

We are pleased to offer you the position of ${job?.roleTitle || 'Position'} at ${job?.companyName || 'Company'}.

Position Details:
- Role: ${job?.roleTitle || 'Position'}
- Company: ${job?.companyName || 'Company'}
- CTC Package: ${ctc}
- Joining Date: ${format(joiningDate, 'dd MMMM yyyy')}
- Location: ${job?.locationType || 'To be confirmed'}

We are confident that your skills and experience will be valuable assets to our team.

Please confirm your acceptance of this offer at your earliest convenience.

Congratulations on your new role!

Best regards,
${job?.companyName || 'Company'} HR Team
    `.trim();

    // Create a blob and download
    const blob = new Blob([offerLetterContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Offer_Letter_${job?.companyName}_${student.name}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Offer letter downloaded!');
  };

  return (
    <DashboardLayout title="Offers" subtitle="Your offer letters">
      <div className="space-y-6">
        {offers.length === 0 ? (
          <Card className="p-12 text-center">
            <Award className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-medium">No Offers Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Complete your placement simulations to receive offers
            </p>
          </Card>
        ) : (
          offers.map((offer) => {
            const job = typeof offer.jobId === 'object' ? offer.jobId : jobs.find(j => j.id === offer.jobId);
            const offerDetails = offer.offerDetails || {};
            const ctc = offerDetails.package || job?.package || job?.ctcBand || 'Not specified';
            const joiningDate = offerDetails.joiningDate ? new Date(offerDetails.joiningDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            return (
            <Card key={offer.id} className="border-success/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{job?.companyName || 'Company'}</CardTitle>
                      <CardDescription>{job?.roleTitle || 'Position'}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="success">Offer</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span>CTC: <strong>{ctc}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joining: <strong>{format(joiningDate, 'dd MMM yyyy')}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleAcceptOffer(offer.id)}
                    disabled={acceptOfferMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {acceptOfferMutation.isPending ? 'Accepting...' : 'Accept Offer'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDownloadOffer(offer)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Letter
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
