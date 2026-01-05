import { 
  Student, 
  Professional, 
  Admin,
  Job, 
  Application, 
  Assessment, 
  Interview,
  Offer,
  MCQQuestion,
  CodingQuestion
} from '@/types';

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@college.edu',
    role: 'student',
    phone: '+91 98765 43210',
    college: 'Rajiv Gandhi Institute of Technology',
    branch: 'Computer Science',
    cgpa: 8.2,
    graduationYear: 2025,
    skills: ['Python', 'Java', 'React', 'SQL', 'Machine Learning'],
    resumeUrl: '/resumes/priya.pdf',
    linkedinUrl: 'linkedin.com/in/priyasharma',
    githubUrl: 'github.com/priyasharma',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'student-2',
    name: 'Rahul Verma',
    email: 'rahul.verma@college.edu',
    role: 'student',
    phone: '+91 87654 32109',
    college: 'Delhi Technical University',
    branch: 'Information Technology',
    cgpa: 7.8,
    graduationYear: 2025,
    skills: ['JavaScript', 'Node.js', 'MongoDB', 'AWS'],
    linkedinUrl: 'linkedin.com/in/rahulverma',
    createdAt: new Date('2024-01-05'),
  },
];

// Mock Professionals
export const mockProfessionals: Professional[] = [
  {
    id: 'prof-1',
    name: 'Amit Kumar',
    email: 'amit.kumar@techcorp.com',
    role: 'professional',
    professionalRole: 'Technical',
    phone: '+91 99887 76655',
    company: 'TechCorp India',
    designation: 'Senior Software Engineer',
    yearsOfExperience: 8,
    experience: 8,
    techStack: ['Java', 'SQL', 'Problem Solving', 'System Design', 'Microservices', 'AWS'],
    expertise: ['System Design', 'Java', 'Microservices', 'AWS'],
    linkedinUrl: 'linkedin.com/in/amitkumar',
    status: 'approved',
    interviewsTaken: 45,
    activeInterviewCount: 2,
    rating: 4.8,
    createdAt: new Date('2023-06-15'),
    password: 'password123',
  },
  {
    id: 'prof-2',
    name: 'Sneha Patel',
    email: 'sneha.patel@fintech.com',
    role: 'professional',
    professionalRole: 'Manager',
    phone: '+91 88776 65544',
    company: 'FinTech Solutions',
    designation: 'Engineering Manager',
    yearsOfExperience: 12,
    experience: 12,
    techStack: ['Python', 'DSA', 'System Design', 'Data Engineering', 'Leadership'],
    expertise: ['Leadership', 'Python', 'Data Engineering', 'Team Management'],
    linkedinUrl: 'linkedin.com/in/snehapatel',
    status: 'approved',
    interviewsTaken: 120,
    activeInterviewCount: 1,
    rating: 4.9,
    createdAt: new Date('2023-03-20'),
    password: 'password123',
  },
  {
    id: 'prof-3',
    name: 'Vikram Singh',
    email: 'vikram.singh@startup.io',
    role: 'professional',
    professionalRole: 'Technical',
    phone: '+91 77665 54433',
    company: 'StartupIO',
    designation: 'CTO',
    yearsOfExperience: 15,
    experience: 15,
    techStack: ['Java', 'Python', 'Architecture', 'Full Stack', 'Product Development'],
    expertise: ['Architecture', 'Full Stack', 'Product Development'],
    status: 'approved',
    interviewsTaken: 0,
    activeInterviewCount: 0,
    rating: 0,
    createdAt: new Date('2024-01-10'),
    password: 'password123',
  },
];

// Mock Admin
export const mockAdmin: Admin = {
  id: 'admin-1',
  name: 'System Admin',
  email: 'admin@placementos.com',
  role: 'admin',
  createdAt: new Date('2023-01-01'),
};

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: 'job-1',
    companyName: 'TechMahindra',
    roleTitle: 'Software Engineer',
    ctcBand: '4-6 LPA',
    locationType: 'Hybrid',
    description: 'Join our team as a Software Engineer and work on enterprise solutions.',
    requirements: ['B.Tech in CS/IT', 'No active backlogs', 'Min 6.0 CGPA'],
    skills: ['Java', 'SQL', 'Problem Solving'],
    requiredTechStack: ['Java', 'SQL', 'Problem Solving'],
    deadline: new Date('2024-02-15'),
    isActive: true,
    package: '4-6 LPA',
  },
  {
    id: 'job-2',
    companyName: 'Flipkart',
    roleTitle: 'SDE-1',
    ctcBand: '18-25 LPA',
    locationType: 'Onsite',
    description: 'Build scalable e-commerce solutions.',
    requirements: ['Strong DSA', 'System Design basics', 'Min 7.5 CGPA'],
    skills: ['DSA', 'System Design', 'Java/Python'],
    requiredTechStack: ['DSA', 'System Design', 'Java', 'Python'],
    deadline: new Date('2024-02-20'),
    isActive: true,
    package: '18-25 LPA',
  },
  {
    id: 'job-3',
    companyName: 'Infosys',
    roleTitle: 'Systems Engineer',
    ctcBand: '3.6-4.5 LPA',
    locationType: 'Onsite',
    description: 'Start your career with a global IT leader.',
    requirements: ['B.Tech any branch', 'Min 6.0 CGPA'],
    skills: ['Programming basics', 'Communication'],
    deadline: new Date('2024-02-25'),
    isActive: true,
  },
];

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    job: mockJobs[0],
    studentId: 'student-1',
    student: mockStudents[0],
    status: 'professional_interview_pending',
    appliedAt: new Date('2024-01-15'),
    resumeScore: 85,
    assessmentScore: 78,
    aiInterviewScore: 82,
    assignedProfessionalId: 'prof-1',
    assignedProfessional: mockProfessionals[0],
    timeline: [
      { status: 'applied', timestamp: new Date('2024-01-15'), notes: 'Application submitted' },
      { status: 'resume_uploaded', timestamp: new Date('2024-01-15'), notes: 'Resume uploaded' },
      { status: 'resume_shortlisted', timestamp: new Date('2024-01-16'), notes: 'Resume score: 85%' },
      { status: 'assessment_pending', timestamp: new Date('2024-01-16'), notes: 'Assessment released' },
      { status: 'assessment_completed', timestamp: new Date('2024-01-18'), notes: 'Score: 78%' },
      { status: 'assessment_shortlisted', timestamp: new Date('2024-01-18'), notes: 'Cleared cutoff' },
      { status: 'ai_interview_pending', timestamp: new Date('2024-01-19'), notes: 'AI round scheduled' },
      { status: 'ai_interview_completed', timestamp: new Date('2024-01-19'), notes: 'Score: 82%' },
      { status: 'professional_interview_pending', timestamp: new Date('2024-01-20'), notes: 'Assigned to Amit Kumar' },
    ],
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    job: mockJobs[1],
    studentId: 'student-1',
    student: mockStudents[0],
    status: 'assessment_pending',
    appliedAt: new Date('2024-01-18'),
    resumeScore: 72,
    timeline: [
      { status: 'applied', timestamp: new Date('2024-01-18'), notes: 'Application submitted' },
      { status: 'resume_uploaded', timestamp: new Date('2024-01-18'), notes: 'Resume uploaded' },
      { status: 'resume_shortlisted', timestamp: new Date('2024-01-19'), notes: 'Resume score: 72%' },
      { status: 'assessment_pending', timestamp: new Date('2024-01-19'), notes: 'Assessment opens Jan 20' },
    ],
  },
];

// Mock Assessments
export const mockAssessments: Assessment[] = [
  {
    id: 'assess-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    job: mockJobs[0],
    deadline: new Date('2024-01-18'),
    duration: 90,
    questionCount: 45,
    status: 'completed',
    score: 78,
    startedAt: new Date('2024-01-18T10:00:00'),
    completedAt: new Date('2024-01-18T11:20:00'),
  },
  {
    id: 'assess-2',
    applicationId: 'app-2',
    jobId: 'job-2',
    job: mockJobs[1],
    deadline: new Date('2024-01-22'),
    duration: 120,
    questionCount: 4,
    status: 'pending',
  },
];

// Mock Interviews
export const mockInterviews: Interview[] = [
  {
    id: 'interview-1',
    applicationId: 'app-1',
    application: mockApplications[0],
    studentId: 'student-1',
    student: mockStudents[0],
    type: 'ai',
    status: 'completed',
    feedback: {
      overallRating: 4,
      technicalSkills: 4,
      communication: 4,
      problemSolving: 5,
      cultureFit: 4,
      strengths: ['Good problem solving', 'Clear communication'],
      improvements: ['Practice system design'],
      recommendation: 'hire',
      notes: 'Strong candidate, proceed to next round',
    },
  },
  {
    id: 'interview-2',
    applicationId: 'app-1',
    application: mockApplications[0],
    studentId: 'student-1',
    student: mockStudents[0],
    type: 'professional',
    interviewerId: 'prof-1',
    interviewer: mockProfessionals[0],
    scheduledAt: new Date('2024-01-25T14:00:00'),
    status: 'scheduled',
  },
];

// Mock Offers
export const mockOffers: Offer[] = [];

// Mock MCQ Questions
export const mockMCQQuestions: MCQQuestion[] = [
  {
    id: 'mcq-1',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctOption: 1,
  },
  {
    id: 'mcq-2',
    question: 'Which data structure uses LIFO principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correctOption: 1,
  },
  {
    id: 'mcq-3',
    question: 'What is the output of 2 + "2" in JavaScript?',
    options: ['4', '22', 'NaN', 'Error'],
    correctOption: 1,
  },
];

// Mock Coding Questions
export const mockCodingQuestions: CodingQuestion[] = [
  {
    id: 'code-1',
    title: 'Two Sum',
    description: 'Given an array of integers and a target, return indices of two numbers that add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', 'Only one valid answer exists'],
    difficulty: 'Easy',
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
    ],
  },
];

// Helper functions
export const getCurrentStudent = () => mockStudents[0];
export const getCurrentProfessional = () => mockProfessionals[0];
export const getCurrentAdmin = () => mockAdmin;
export const getJobById = (id: string) => mockJobs.find(j => j.id === id);
export const getApplicationsByStudentId = (id: string) => mockApplications.filter(a => a.studentId === id);
export const getInterviewsByProfessionalId = (id: string) => mockInterviews.filter(i => i.interviewerId === id);
