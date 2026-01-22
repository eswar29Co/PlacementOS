import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService, jobService } from '@/services';
import { Student } from '@/types';
import {
  Award, Download, Calendar, IndianRupee,
  CheckCircle2, XCircle, Sparkles, Trophy,
  Target, Briefcase, Zap, ShieldCheck,
  DownloadCloud, MapPin, Building2, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Offers() {
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  const queryClient = useQueryClient();

  const acceptOfferMutation = useMutation({
    mutationFn: (applicationId: string) =>
      applicationService.acceptOffer(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Congratulations! You have successfully accepted the offer!');
    },
    onError: (error: any) => toast.error(error.message || 'Verification link failed'),
  });

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAllJobs(),
  });

  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];
  const jobs = Array.isArray(jobsData?.data) ? jobsData.data : (jobsData?.data && 'jobs' in jobsData.data ? jobsData.data.jobs : []);

  const offers = applications.filter(a => a.studentId === student?.id && (a.status === 'offer_released' || a.status === 'offer_accepted'));

  const handleDownloadOffer = (offer: any) => {
    const job = typeof offer.jobId === 'object' ? offer.jobId : jobs.find((j: any) => j.id === offer.jobId);
    const offerDetails = offer.offerDetails || {};
    const ctc = offerDetails.package || job?.package || job?.ctcBand || 'Not specified';
    const joiningDate = offerDetails.joiningDate ? new Date(offerDetails.joiningDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const offerLetterContent = `
OFFICIAL OFFER LETTER

Date: ${format(new Date(), 'dd MMMM yyyy')}

Candidate: ${student.name}
Role Title: ${job?.roleTitle || 'Strategic Specialist'}
Organization: ${job?.companyName || 'Global Enterprise'}

COMPENSATION ARCHITECTURE:
- Base Package: ${ctc}
- Joining Date: ${format(joiningDate, 'dd MMMM yyyy')}
- Location: ${job?.locationType || 'Remote / On-site'}

Congratulations on successfully completing the interview process.

Best regards,
${job?.companyName || 'Corporate'} Global Talent Acquisition
    `.trim();

    const blob = new Blob([offerLetterContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OFFER_LETTER_${job?.companyName}_${student.name}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Offer letter downloaded!');
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Offer Letters" subtitle="Loading your offers...">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-[10px]">Fetching data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Offer Letters" subtitle="View and manage your job offers and employment letters">
      <div className="max-w-[1400px] mx-auto pb-12">
        {offers.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse" />
              <Trophy className="relative h-24 w-24 text-slate-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 leading-none">No Offers Yet</h3>
              <p className="text-slate-400 max-w-sm font-medium">Complete your interviews to receive job offers here.</p>
            </div>
            <Button variant="outline" className="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 font-black h-12 px-8 shadow-sm text-slate-600" onClick={() => navigate('/student/applications')}>My Applications</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {offers.map((offer) => {
              const job = typeof offer.jobId === 'object' ? offer.jobId : jobs.find((j: any) => j.id === offer.jobId);
              const isAccepted = offer.status === 'offer_accepted';
              const offerDetails = offer.offerDetails || {};
              const ctc = offerDetails.package || job?.package || job?.ctcBand || 'N/A';
              const joiningDate = offerDetails.joiningDate ? new Date(offerDetails.joiningDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

              return (
                <Card key={offer.id} className={cn(
                  "border-slate-200 shadow-sm rounded-[3rem] overflow-hidden group hover:scale-[1.01] transition-all duration-500 bg-white border",
                  isAccepted ? "ring-2 ring-emerald-500/20" : "ring-2 ring-primary/20"
                )}>
                  <div className={cn("h-3 w-full", isAccepted ? "bg-emerald-500" : "bg-primary")} />
                  <CardContent className="p-10 space-y-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "h-20 w-20 rounded-3xl flex items-center justify-center shadow-sm transition-transform group-hover:rotate-6 duration-700 border",
                          isAccepted ? "bg-emerald-500 text-white border-emerald-400" : "bg-primary text-white border-primary/20"
                        )}>
                          <Trophy className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                          <Badge className={cn("border-none font-black text-[10px] uppercase py-1 px-3 shadow-none", isAccepted ? "bg-emerald-50 text-emerald-600" : "bg-primary/5 text-primary")}>
                            {isAccepted ? 'Offer Accepted' : 'New Offer'}
                          </Badge>
                          <h4 className="font-black text-3xl leading-tight uppercase tracking-tight text-slate-900">{job?.roleTitle || 'Job Role'}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-primary/50" /> {job?.companyName || 'Company'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Sparkles className={cn("h-8 w-8", isAccepted ? "text-emerald-500" : "text-primary animate-pulse")} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><IndianRupee className="h-3 w-3" /> Total Package</p>
                        <p className="text-lg font-black text-emerald-600">{ctc}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Joining Date</p>
                        <p className="text-lg font-black text-slate-900">{format(joiningDate, 'dd MMM yyyy')}</p>
                      </div>
                      <div className="space-y-1 sm:col-span-2 mt-2 pt-2 border-t border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Job Location</p>
                        <p className="text-sm font-bold text-slate-700">{job?.locationType || 'Remote / On-site'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      {!isAccepted ? (
                        <Button
                          className="w-full h-16 rounded-[1.5rem] font-black text-lg gap-2 shadow-lg shadow-primary/20 group-hover:translate-y-[-2px] transition-transform"
                          onClick={() => acceptOfferMutation.mutate(offer.id)}
                          disabled={acceptOfferMutation.isPending}
                        >
                          <CheckCircle2 className="h-6 w-6" />
                          {acceptOfferMutation.isPending ? 'ACCEPTING...' : 'ACCEPT OFFER'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-16 rounded-[1.5rem] font-black text-lg gap-2 border-slate-200 text-emerald-600 bg-emerald-50 cursor-default"
                        >
                          <ShieldCheck className="h-6 w-6" /> OFFER ACCEPTED
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full h-16 rounded-[1.5rem] font-black text-slate-400 hover:bg-slate-50 gap-2 border border-slate-200"
                        onClick={() => handleDownloadOffer(offer)}
                      >
                        <DownloadCloud className="h-6 w-6" /> DOWNLOAD LETTER
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
