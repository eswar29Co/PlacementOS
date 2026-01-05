import { AppDispatch } from './index';
import { setStudents } from './slices/studentsSlice';
import { setProfessionals } from './slices/professionalsSlice';
import { setJobs } from './slices/jobsSlice';
import { setApplications } from './slices/applicationsSlice';
import { Student, Professional, Job, Application } from '@/types';

// Initial mock data
const initialStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Priya Sharma',
    email: 'priya.sharma@college.edu',
    password: 'password123',
    role: 'student',
    phone: '+91 98765 43210',
    college: 'Rajiv Gandhi Institute of Technology',
    degree: 'B.Tech',
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
    password: 'password123',
    role: 'student',
    phone: '+91 87654 32109',
    college: 'Delhi Technical University',
    degree: 'B.Tech',
    branch: 'Information Technology',
    cgpa: 7.8,
    graduationYear: 2025,
    skills: ['JavaScript', 'Node.js', 'MongoDB', 'AWS'],
    linkedinUrl: 'linkedin.com/in/rahulverma',
    createdAt: new Date('2024-01-05'),
  },
];

const initialProfessionals: Professional[] = [
  {
    id: 'prof-1',
    name: 'Amit Kumar',
    email: 'amit.kumar@techcorp.com',
    password: 'password123',
    role: 'professional',    professionalRole: 'Technical',    phone: '+91 99887 76655',
    company: 'TechCorp India',
    designation: 'Senior Software Engineer',
    experience: 8,
    yearsOfExperience: 8,
    techStack: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'React'],
    expertise: ['System Design', 'Java', 'Microservices', 'AWS'],
    linkedinUrl: 'linkedin.com/in/amitkumar',
    status: 'approved',
    interviewsTaken: 45,
    activeInterviewCount: 0,
    rating: 4.8,
    createdAt: new Date('2023-06-15'),
  },
  {
    id: 'prof-2',
    name: 'Sneha Patel',
    email: 'sneha.patel@fintech.com',
    password: 'password123',
    role: 'professional',
    professionalRole: 'Manager',
    phone: '+91 88776 65544',
    company: 'FinTech Solutions',
    designation: 'Engineering Manager',
    experience: 12,    yearsOfExperience: 10,    techStack: ['Python', 'Django', 'PostgreSQL', 'Data Engineering', 'AWS'],
    expertise: ['Leadership', 'Python', 'Data Engineering', 'Team Management'],
    linkedinUrl: 'linkedin.com/in/snehapatel',
    status: 'approved',
    interviewsTaken: 120,
    activeInterviewCount: 2,
    rating: 4.9,
    createdAt: new Date('2023-03-20'),
  },
  {
    id: 'prof-3',
    name: 'Vikram Singh',
    email: 'vikram.singh@startup.io',
    password: 'password123',
    role: 'professional',
    professionalRole: 'HR',
    phone: '+91 77665 54433',
    company: 'StartupIO',
    designation: 'CTO',
    experience: 15,
    yearsOfExperience: 15,
    techStack: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Docker'],
    expertise: ['Architecture', 'Full Stack', 'Product Development'],
    status: 'pending',
    interviewsTaken: 0,
    activeInterviewCount: 0,
    rating: 0,
    createdAt: new Date('2024-01-10'),
  },
];

const initialJobs: Job[] = [
  {
    id: 'job-1',
    companyName: 'Google India',
    roleTitle: 'Software Engineer - Backend',
    ctcBand: '₹18-25 LPA',
    locationType: 'Hybrid',
    description: 'Looking for talented backend engineers to join our Bangalore team...',
    requirements: [
      '3+ years of experience in backend development',
      'Strong knowledge of Java/Python',
      'Experience with distributed systems',
    ],
    skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'SQL'],
    requiredTechStack: ['Java', 'Spring Boot', 'AWS'],
    deadline: new Date('2025-02-28'),
    isActive: true,
    selectionProcess: ['Resume Screening', 'Assessment', 'AI Interview', 'Technical Round', 'Manager Round', 'HR Round'],
  },
  {
    id: 'job-2',
    companyName: 'Microsoft',
    roleTitle: 'Full Stack Developer',
    ctcBand: '₹20-28 LPA',
    locationType: 'Remote',
    description: 'Join our cloud services team to build scalable web applications...',
    requirements: [
      'Experience with React and Node.js',
      'Understanding of cloud platforms',
      'Good problem-solving skills',
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'Azure', 'MongoDB'],
    requiredTechStack: ['React', 'Node.js', 'Azure'],
    deadline: new Date('2025-03-15'),
    isActive: true,
    selectionProcess: ['Resume Screening', 'Assessment', 'AI Interview', 'Technical Round', 'Manager Round', 'HR Round'],
  },
  {
    id: 'job-3',
    companyName: 'Amazon',
    roleTitle: 'Data Engineer',
    ctcBand: '₹22-30 LPA',
    locationType: 'Onsite',
    description: 'Work on large-scale data processing systems...',
    requirements: [
      'Strong Python skills',
      'Experience with big data technologies',
      'Knowledge of data warehousing',
    ],
    skills: ['Python', 'Spark', 'Hadoop', 'SQL', 'AWS'],
    requiredTechStack: ['Python', 'AWS', 'SQL'],
    deadline: new Date('2025-03-20'),
    isActive: true,
    selectionProcess: ['Resume Screening', 'Assessment', 'AI Interview', 'Technical Round', 'Manager Round', 'HR Round'],
  },
];

const initialApplications: Application[] = [];

export const initializeStore = (dispatch: AppDispatch) => {
  dispatch(setStudents(initialStudents));
  dispatch(setProfessionals(initialProfessionals));
  dispatch(setJobs(initialJobs));
  dispatch(setApplications(initialApplications));
};
