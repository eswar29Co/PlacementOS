import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Application, ApplicationStatus, InterviewFeedbackDetailed, InterviewRound } from '@/types';
import { AppDispatch, RootState } from '../index';
import { incrementInterviewCount } from './professionalsSlice';
import { addNotification } from './notificationsSlice';
import { mockApplications } from '@/data/mockData';

interface ApplicationsState {
  applications: Application[];
}

const initialState: ApplicationsState = {
  applications: mockApplications,
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    addApplication: (state, action: PayloadAction<Application>) => {
      state.applications.push(action.payload);
    },
    updateApplication: (state, action: PayloadAction<{ id: string; updates: Partial<Application> }>) => {
      const index = state.applications.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.applications[index] = { ...state.applications[index], ...action.payload.updates };
      }
    },
    updateApplicationStatus: (state, action: PayloadAction<{ id: string; status: ApplicationStatus }>) => {
      const application = state.applications.find((a) => a.id === action.payload.id);
      if (application) {
        application.status = action.payload.status;
        application.timeline.push({
          status: action.payload.status,
          timestamp: new Date(),
        });
      }
    },
    addInterviewFeedback: (state, action: PayloadAction<{ id: string; feedback: InterviewFeedbackDetailed }>) => {
      const application = state.applications.find((a) => a.id === action.payload.id);
      if (application) {
        application.interviewFeedback.push(action.payload.feedback);
      }
    },
    setApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
    },
  },
});

// Thunk for assigning professional to student
export const assignProfessionalToStudent = (applicationId: string, round: InterviewRound = 'professional') =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const application = state.applications.applications.find((a) => a.id === applicationId);

    if (!application || !application.job) return;

    const job = state.jobs.jobs.find((j) => j.id === application.jobId);
    if (!job) return;

    const requiredTechStack = job.requiredTechStack;

    // Filter available professionals
    const availableProfessionals = state.professionals.professionals.filter((p) => {
      if (p.status !== 'approved') return false;
      if (p.activeInterviewCount >= 5) return false;

      // Check tech stack match
      const matchingTech = p.techStack.filter((tech) => requiredTechStack.includes(tech));
      return matchingTech.length > 0;
    });

    if (availableProfessionals.length === 0) {
      console.warn('No available professionals found');
      return;
    }

    // Sort by activeInterviewCount ASC, then experience DESC
    availableProfessionals.sort((a, b) => {
      if (a.activeInterviewCount !== b.activeInterviewCount) {
        return a.activeInterviewCount - b.activeInterviewCount;
      }
      return b.experience - a.experience;
    });

    const selectedProfessional = availableProfessionals[0];

    // Update application
    const updates: Partial<Application> = {
      interviewRound: round,
    };

    if (round === 'professional') {
      updates.assignedProfessionalId = selectedProfessional.id;
      updates.status = 'professional_interview_pending';
    } else if (round === 'manager') {
      updates.assignedManagerId = selectedProfessional.id;
      updates.status = 'manager_interview_pending';
    } else if (round === 'hr') {
      updates.assignedHRId = selectedProfessional.id;
      updates.status = 'hr_interview_pending';
    }

    dispatch(updateApplication({ id: applicationId, updates }));
    dispatch(incrementInterviewCount(selectedProfessional.id));

    // Create notifications
    dispatch(addNotification({
      id: `notif-${Date.now()}-student`,
      userId: application.studentId,
      type: 'interview_assigned',
      title: 'Interview Assigned',
      message: `${selectedProfessional.name} from ${selectedProfessional.company} has been assigned for your ${round} interview.`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/student/interviews`,
    }));

    dispatch(addNotification({
      id: `notif-${Date.now()}-prof`,
      userId: selectedProfessional.id,
      type: 'interview_assigned',
      title: 'New Interview Assigned',
      message: `You have been assigned to conduct a ${round} interview for ${application.student?.name || 'a student'}. Please review their profile and resume.`,
      read: false,
      createdAt: new Date(),
      actionUrl: `/professional/dashboard`,
    }));
  };

// Manager Assignment Thunk (requires role=Manager AND yearsOfExperience >= 10 AND tech stack match)
export const assignManagerToStudent =
  (applicationId: string): any =>
    (dispatch: AppDispatch, getState: () => RootState) => {
      const state = getState();
      const application = state.applications.applications.find((a) => a.id === applicationId);

      if (!application || !application.job) return;

      const job = state.jobs.jobs.find((j) => j.id === application.jobId);
      if (!job) return;

      const requiredTechStack = job.requiredTechStack;

      // Filter available managers
      const availableManagers = state.professionals.professionals.filter((p) => {
        if (p.status !== 'approved') return false;
        if (p.professionalRole !== 'Manager') return false;
        if (p.yearsOfExperience < 10) return false;
        if (p.activeInterviewCount >= 5) return false;

        // Check tech stack match
        const matchingTech = p.techStack.filter((tech) => requiredTechStack.includes(tech));
        return matchingTech.length > 0;
      });

      if (availableManagers.length === 0) {
        console.warn('No available managers found');
        return;
      }

      // Sort by activeInterviewCount ASC, then experience DESC
      availableManagers.sort((a, b) => {
        if (a.activeInterviewCount !== b.activeInterviewCount) {
          return a.activeInterviewCount - b.activeInterviewCount;
        }
        return b.yearsOfExperience - a.yearsOfExperience;
      });

      const selectedManager = availableManagers[0];

      // Update application
      dispatch(updateApplication({
        id: applicationId,
        updates: {
          assignedManagerId: selectedManager.id,
          interviewRound: 'manager',
          status: 'manager_round_pending'
        }
      }));
      dispatch(incrementInterviewCount(selectedManager.id));

      // Create notifications
      dispatch(addNotification({
        id: `notif-${Date.now()}-student`,
        userId: application.studentId,
        type: 'interview_assigned',
        title: 'Manager Round Scheduled',
        message: `${selectedManager.name} from ${selectedManager.company} has been assigned for your Manager interview.`,
        read: false,
        createdAt: new Date(),
        actionUrl: `/student/manager-interview`,
      }));

      dispatch(addNotification({
        id: `notif-${Date.now()}-manager`,
        userId: selectedManager.id,
        type: 'interview_assigned',
        title: 'New Manager Interview Assigned',
        message: `You have been assigned to conduct a Manager interview for ${application.student?.name || 'a student'}. Please review their profile and resume.`,
        read: false,
        createdAt: new Date(),
        actionUrl: `/professional/dashboard`,
      }));
    };

// HR Assignment Thunk (requires role=HR AND yearsOfExperience >= 8, NO tech stack requirement)
export const assignHRToStudent =
  (applicationId: string): any =>
    (dispatch: AppDispatch, getState: () => RootState) => {
      const state = getState();
      const application = state.applications.applications.find((a) => a.id === applicationId);

      if (!application) return;

      // Filter available HR professionals
      const availableHR = state.professionals.professionals.filter((p) => {
        if (p.status !== 'approved') return false;
        if (p.professionalRole !== 'HR') return false;
        if (p.yearsOfExperience < 8) return false;
        if (p.activeInterviewCount >= 5) return false;
        return true;
      });

      if (availableHR.length === 0) {
        console.warn('No available HR professionals found');
        return;
      }

      // Sort by activeInterviewCount ASC, then experience DESC
      availableHR.sort((a, b) => {
        if (a.activeInterviewCount !== b.activeInterviewCount) {
          return a.activeInterviewCount - b.activeInterviewCount;
        }
        return b.yearsOfExperience - a.yearsOfExperience;
      });

      const selectedHR = availableHR[0];

      // Update application
      dispatch(updateApplication({
        id: applicationId,
        updates: {
          assignedHRId: selectedHR.id,
          interviewRound: 'hr',
          status: 'hr_round_pending'
        }
      }));
      dispatch(incrementInterviewCount(selectedHR.id));

      // Create notifications
      dispatch(addNotification({
        id: `notif-${Date.now()}-student`,
        userId: application.studentId,
        type: 'interview_assigned',
        title: 'HR Round Scheduled',
        message: `${selectedHR.name} from ${selectedHR.company} has been assigned for your HR interview.`,
        read: false,
        createdAt: new Date(),
        actionUrl: `/student/hr-interview`,
      }));

      dispatch(addNotification({
        id: `notif-${Date.now()}-hr`,
        userId: selectedHR.id,
        type: 'interview_assigned',
        title: 'New HR Interview Assigned',
        message: `You have been assigned to conduct an HR interview for ${application.student?.name || 'a student'}. Please review their profile and resume.`,
        read: false,
        createdAt: new Date(),
        actionUrl: `/professional/dashboard`,
      }));
    };

export const { addApplication, updateApplication, updateApplicationStatus, addInterviewFeedback, setApplications } = applicationsSlice.actions;
export default applicationsSlice.reducer;
