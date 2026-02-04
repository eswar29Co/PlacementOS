// User types
export type UserRole = 'student' | 'professional' | 'admin' | 'superadmin';
export type ApplicationStatus =
  | 'applied'
  | 'resume_under_review'
  | 'resume_approved'
  | 'resume_shortlisted'
  | 'resume_rejected'
  | 'assessment_pending'
  | 'assessment_released'
  | 'assessment_in_progress'
  | 'assessment_completed'
  | 'assessment_submitted'
  | 'assessment_under_review'
  | 'assessment_shortlisted'
  | 'assessment_approved'
  | 'assessment_rejected'
  | 'ai_interview_pending'
  | 'ai_interview_completed'
  | 'professional_interview_pending'
  | 'professional_interview_scheduled'
  | 'professional_interview_completed'
  | 'manager_interview_pending'
  | 'manager_round_pending'
  | 'manager_interview_scheduled'
  | 'manager_interview_completed'
  | 'manager_round_completed'
  | 'hr_interview_pending'
  | 'hr_round_pending'
  | 'hr_interview_scheduled'
  | 'hr_interview_completed'
  | 'hr_round_completed'
  | 'offer_released'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'rejected';

export type ProfessionalStatus = 'pending' | 'approved' | 'rejected';
export type ProfessionalRole = 'Technical' | 'Manager' | 'HR' | 'Admin';
export type InterviewRound = 'professional' | 'manager' | 'hr';
export type LocationType = 'Onsite' | 'Hybrid' | 'Remote';
export type InterviewType = 'ai' | 'professional' | 'manager' | 'hr';
export type NotificationType =
  | 'professional_approved'
  | 'professional_rejected'
  | 'professional_signup'
  | 'student_registered'
  | 'resume_approved'
  | 'resume_rejected'
  | 'assessment_released'
  | 'assessment_approved'
  | 'assessment_rejected'
  | 'interview_assigned'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'application_update'
  | 'offer_released'
  | 'new_job_posted'
  | 'admin_note';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudent extends IUser {
  role: 'student';
  college: string;
  collegeId?: string;
  degree: string;
  branch?: string;
  cgpa: number;
  graduationYear: number;
  skills: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface IProfessional extends IUser {
  role: 'professional';
  professionalRole?: ProfessionalRole;
  company: string;
  designation: string;
  yearsOfExperience: number;
  experience: number;
  techStack: string[];
  expertise?: string[];
  linkedinUrl?: string;
  bio?: string;
  status: ProfessionalStatus;
  interviewsTaken: number;
  activeInterviewCount: number;
  rating: number;
}

export interface IJob {
  _id?: string;
  companyName: string;
  roleTitle: string;
  ctcBand: string;
  locationType: LocationType;
  description: string;
  requirements: string[];
  skills: string[];
  requiredTechStack: string[];
  deadline: Date;
  isActive: boolean;
  selectionProcess?: string[];
  package?: string;
  createdBy?: string;
  collegeId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IApplicationEvent {
  status: ApplicationStatus;
  timestamp: Date;
  notes?: string;
}

export interface IInterviewFeedbackDetailed {
  round: InterviewType;
  interviewRound?: InterviewRound;
  professionalId: string;
  professionalName: string;
  rating: number;
  comments?: string;
  strengths?: string;
  weaknesses?: string;
  improvementAreas?: string[];
  recommendation: 'Strongly Recommend' | 'Recommend' | 'Maybe' | 'Reject' | 'Pass' | 'Fail';
  conductedAt?: Date;
}

export interface IApplication {
  _id?: string;
  jobId: string;
  studentId: string;
  status: ApplicationStatus;
  appliedAt: Date;

  // Resume phase
  resumeUrl?: string;
  resumeScore?: number;
  atsAnalysis?: any;
  resumeApproved?: boolean | null; // null = pending, true = approved, false = rejected
  resumeApprovedAt?: Date;
  resumeApprovedBy?: string;

  // Assessment phase
  assessmentDeadline?: Date;
  assessmentCode?: string;
  assessmentAnswers?: any[];
  assessmentScore?: number;
  submittedAt?: Date;
  assessmentApproved?: boolean | null; // null = pending, true = approved, false = rejected
  assessmentApprovedAt?: Date;
  assessmentApprovedBy?: string;

  // Interview phases
  aiInterviewScore?: number;
  aiInterviewAnswers?: string[];
  aiInterviewSummary?: string;
  aiInterviewMetrics?: any;
  aiInterviewApproved?: boolean | null; // null = pending, true = approved, false = rejected
  aiInterviewApprovedAt?: Date;
  aiInterviewApprovedBy?: string;

  // Professional assignment
  assignedProfessionalId?: string;
  assignedManagerId?: string;
  assignedHRId?: string;
  interviewRound?: InterviewRound;

  // Meeting details
  meetingLink?: string;
  scheduledDate?: Date;

  // Feedback tracking
  interviewFeedback?: IInterviewFeedbackDetailed[];

  // Scores
  professionalInterviewScore?: number;
  managerInterviewScore?: number;
  hrInterviewScore?: number;
  offerDetails?: any;

  timeline: IApplicationEvent[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption?: number;
}

export interface ICodingQuestion {
  id: string;
  title: string;
  description: string;
  examples: { input: string; output: string }[];
  constraints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: { input: string; expectedOutput: string }[];
}

export interface IAssessment {
  _id?: string;
  applicationId: string;
  jobId: string;
  deadline: Date;
  duration: number;
  mcqQuestions: IMCQQuestion[];
  codingQuestion: ICodingQuestion;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
  answers?: {
    mcqAnswers: number[];
    codingAnswer?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotification {
  _id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}
