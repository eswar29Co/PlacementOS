import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job } from '@/types';

interface JobsState {
  jobs: Job[];
}

const initialState: JobsState = {
  jobs: [],
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    addJob: (state, action: PayloadAction<Job>) => {
      state.jobs.push(action.payload);
    },
    updateJob: (state, action: PayloadAction<{ id: string; updates: Partial<Job> }>) => {
      const index = state.jobs.findIndex((j) => j.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = { ...state.jobs[index], ...action.payload.updates };
      }
    },
    removeJob: (state, action: PayloadAction<string>) => {
      state.jobs = state.jobs.filter((j) => j.id !== action.payload);
    },
    setJobs: (state, action: PayloadAction<Job[]>) => {
      // Ensure payload is always an array to prevent "filter is not a function" errors
      state.jobs = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const { addJob, updateJob, removeJob, setJobs } = jobsSlice.actions;
export const deleteJob = removeJob; // Alias for removeJob
export default jobsSlice.reducer;
