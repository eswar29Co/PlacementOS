// User types
export type UserRole = 'student' | 'professional' | 'admin';
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface Student extends User {
  role: 'student';
  college: string;
  degree: string;
  branch?: string;
  cgpa: number;
  graduationYear: number;
  skills: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  password: string;
}

export interface Professional extends User {
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
  password: string;
}

export interface Admin extends User {
  role: 'admin';
}

// Job types
export type LocationType = 'Onsite' | 'Hybrid' | 'Remote';

export interface Job {
  id: string;
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
}

// Application types
export interface Application {
  id: string;
  jobId: string;
  job?: Job;
  studentId: string;
  student?: Student;
  status: ApplicationStatus;
  appliedAt: string | Date;
  
  // Resume phase
  resumeUrl?: string;
  resumeScore?: number;
  
  // Assessment phase
  assessmentDeadline?: Date;
  assessmentCode?: string;
  assessmentAnswers?: any[];
  assessmentScore?: number;
  submittedAt?: Date;
  
  // Interview phases
  aiInterviewScore?: number;
  aiInterviewAnswers?: string[];
  
  // Professional assignment
  assignedProfessionalId?: string;
  assignedProfessional?: Professional;
  assignedManagerId?: string;
  assignedManager?: Professional;
  assignedHRId?: string;
  assignedHR?: Professional;
  interviewRound?: InterviewRound;
  
  // Meeting details
  meetingLink?: string;
  scheduledDate?: Date;
  
  // Feedback tracking
  interviewFeedback?: InterviewFeedbackDetailed[];
  
  // Scores
  professionalInterviewScore?: number;
  managerInterviewScore?: number;
  hrInterviewScore?: number;
  offerDetails?: any;
  
  timeline: ApplicationEvent[];
}

export interface ApplicationEvent {
  status: ApplicationStatus;
  timestamp: Date;
  notes?: string;
}

// Assessment types
export interface Assessment {
  id: string;
  applicationId: string;
  jobId: string;
  job?: Job;
  deadline: Date;
  duration: number;
  questionCount: number;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption?: number;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  examples: { input: string; output: string }[];
  constraints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: { input: string; expectedOutput: string }[];
}

// Interview types
export type InterviewType = 'ai' | 'professional' | 'manager' | 'hr';

export interface Interview {
  id: string;
  applicationId: string;
  application?: Application;
  studentId: string;
  student?: Student;
  type: InterviewType;
  interviewerId?: string;
  interviewer?: Professional;
  scheduledAt?: Date;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  feedback?: InterviewFeedback;
}

export interface InterviewFeedback {
  overallRating: number;
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  cultureFit: number;
  strengths: string[];
  improvements: string[];
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  notes: string;
}

export interface InterviewFeedbackDetailed {
  id?: string;
  round: InterviewType;
  interviewRound?: InterviewRound;
  professionalId: string;
  professionalName: string;
  rating: number;
  feedback?: string; // Legacy field
  comments?: string; // New field
  strengths?: string;
  weaknesses?: string;
  improvementAreas?: string[]; // New field
  recommendation: 'Strongly Recommend' | 'Recommend' | 'Maybe' | 'Reject' | 'Pass' | 'Fail';
  timestamp?: Date;
  conductedAt?: Date; // New field
}

// Offer types
export interface Offer {
  id: string;
  applicationId: string;
  application?: Application;
  studentId: string;
  student?: Student;
  jobId: string;
  job?: Job;
  ctc: string;
  joiningDate: Date;
  location?: string;
  offerLetterUrl?: string;
  status: 'pending' | 'accepted' | 'rejected';
  releasedAt: Date;
}

// Notification types
export type NotificationType = 
  | 'professional_approved' 
  | 'professional_rejected'
  | 'resume_approved'
  | 'resume_rejected'
  | 'assessment_released'
  | 'assessment_approved'
  | 'assessment_rejected'
  | 'interview_assigned'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'application_update'
  | 'offer_released';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
