import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth Pages
import Splash from "./pages/Splash";
import Login from "./pages/auth/Login";
import StudentSignup from "./pages/auth/StudentSignup";
import ProfessionalSignup from "./pages/auth/ProfessionalSignup";

// Student Pages
import StudentHome from "./pages/student/StudentHome";
import BrowseJobs from "./pages/student/BrowseJobs";
import JobDetails from "./pages/student/JobDetails";
import ApplyJob from "./pages/student/ApplyJob";
import Applications from "./pages/student/Applications";
import ResumeATSAnalysis from "./pages/student/ResumeATSAnalysis";
import ResumeShortlist from "./pages/student/ResumeShortlist";
import AssessmentRelease from "./pages/student/AssessmentRelease";
import TakeAssessment from "./pages/student/TakeAssessment";
import AssessmentShortlist from "./pages/student/AssessmentShortlist";
import AIMockInterview from "./pages/student/AIMockInterview";
import ProfessionalInterview from "./pages/student/ProfessionalInterview";
import ManagerInterview from "./pages/student/ManagerInterview";
import HRInterview from "./pages/student/HRInterview";
import InterviewCalendar from "./pages/student/InterviewCalendar";
import Interviews from "./pages/student/Interviews";
import Offers from "./pages/student/Offers";
import Profile from "./pages/student/Profile";

// Professional Pages
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import ScheduleInterview from "./pages/professional/ScheduleInterview";
import ConductInterview from "./pages/professional/ConductInterview";
import InterviewHistory from "./pages/professional/InterviewHistory";
import ProfessionalProfile from "./pages/professional/ProfessionalProfile";
import PendingInterviews from "./pages/professional/PendingInterviews";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard2";
import StudentsManagement from "./pages/admin/StudentsManagement";
import ProfessionalsManagement from "./pages/admin/ProfessionalsManagement";
import JobsManagement from "./pages/admin/JobsManagement";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/student" element={<StudentSignup />} />
          <Route path="/signup/professional" element={<ProfessionalSignup />} />

          {/* Protected Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Routes>
                  <Route path="home" element={<StudentHome />} />
                  <Route path="browse-jobs" element={<BrowseJobs />} />
                  <Route path="jobs/:id" element={<JobDetails />} />
                  <Route path="apply/:jobId" element={<ApplyJob />} />
                  <Route path="applications" element={<Applications />} />
                  <Route path="applications/:applicationId/ats-analysis" element={<ResumeATSAnalysis />} />
                  <Route path="resume-shortlist" element={<ResumeShortlist />} />
                  <Route path="assessment-release" element={<AssessmentRelease />} />
                  <Route path="assessment/:applicationId" element={<TakeAssessment />} />
                  <Route path="assessment-shortlist" element={<AssessmentShortlist />} />
                  <Route path="ai-interview" element={<AIMockInterview />} />
                  <Route path="ai-interview/:applicationId" element={<AIMockInterview />} />
                  <Route path="professional-interview" element={<ProfessionalInterview />} />
                  <Route path="manager-interview" element={<ManagerInterview />} />
                  <Route path="hr-interview" element={<HRInterview />} />
                  <Route path="interview-calendar" element={<InterviewCalendar />} />
                  <Route path="interviews" element={<Interviews />} />
                  <Route path="offers" element={<Offers />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/student/home" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected Professional Routes */}
          <Route
            path="/professional/*"
            element={
              <ProtectedRoute allowedRoles={["professional"]}>
                <Routes>
                  <Route path="dashboard" element={<ProfessionalDashboard />} />
                  <Route path="schedule/:appId" element={<ScheduleInterview />} />
                  <Route path="conduct/:appId" element={<ConductInterview />} />
                  <Route path="interviews" element={<PendingInterviews />} />
                  <Route path="history" element={<InterviewHistory />} />
                  <Route path="profile" element={<ProfessionalProfile />} />
                  <Route path="*" element={<Navigate to="/professional/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="students" element={<StudentsManagement />} />
                  <Route path="professionals" element={<ProfessionalsManagement />} />
                  <Route path="jobs" element={<JobsManagement />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
