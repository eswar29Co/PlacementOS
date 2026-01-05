import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/hooks';
import { Student } from '@/types';
import { Award, Download, Calendar, IndianRupee, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Offers() {
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;
  const { applications } = useAppSelector((state) => state.applications);
  const { jobs } = useAppSelector((state) => state.jobs);
  
  const offers = applications.filter(a => a.studentId === student?.id && a.status === 'offer_released');

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
          offers.map((offer) => (
            <Card key={offer.id} className="border-success/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{offer.job?.companyName}</CardTitle>
                      <CardDescription>{offer.job?.roleTitle}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="success">Offer</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span>CTC: <strong>{offer.ctc}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joining: <strong>{format(offer.joiningDate, 'dd MMM yyyy')}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept Offer
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Letter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
