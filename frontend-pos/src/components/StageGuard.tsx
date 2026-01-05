import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { ApplicationStatus } from '@/types';

interface StageGuardProps {
  children: React.ReactNode;
  applicationId?: string;
  requiredStatus: ApplicationStatus[];
}

export function StageGuard({ children, applicationId, requiredStatus }: StageGuardProps) {
  const applications = useAppSelector((state) => state.applications.applications);
  const { user } = useAppSelector((state) => state.auth);

  // If no applicationId provided, try to find the user's active application
  let application;
  if (applicationId) {
    application = applications.find((a) => a.id === applicationId);
  } else if (user) {
    // Get the most recent active application
    application = applications
      .filter((a) => a.studentId === user.id && !['rejected', 'offer_accepted', 'offer_rejected'].includes(a.status))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())[0];
  }

  if (!application) {
    return <Navigate to="/student/home" replace />;
  }

  // Check if the application status allows access to this stage
  if (!requiredStatus.includes(application.status)) {
    // Redirect to applications page to show current stage
    return <Navigate to="/student/applications" replace />;
  }

  return <>{children}</>;
}
