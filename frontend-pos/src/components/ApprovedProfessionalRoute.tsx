import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface ApprovedProfessionalRouteProps {
  children: React.ReactNode;
}

export function ApprovedProfessionalRoute({ children }: ApprovedProfessionalRouteProps) {
  const { user, isAuthenticated, role } = useAppSelector((state) => state.auth);
  const professionals = useAppSelector((state) => state.professionals.professionals);

  if (!isAuthenticated || role !== 'professional') {
    return <Navigate to="/login" replace />;
  }

  const professional = professionals.find((p) => p.id === user?.id);

  if (!professional) {
    return <Navigate to="/login" replace />;
  }

  if (professional.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Approval Pending</AlertTitle>
          <AlertDescription>
            Your account is pending admin approval. You'll be notified once your account is approved.
            Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (professional.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Account Rejected</AlertTitle>
          <AlertDescription>
            Unfortunately, your account application was not approved. 
            Please contact support for more information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
