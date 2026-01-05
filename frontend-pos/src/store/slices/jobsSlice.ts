import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job } from '@/types';
import { mockJobs } from '@/data/mockData';

interface JobsState {
  jobs: Job[];
}

const initialState: JobsState = {
  jobs: mockJobs,
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
      state.jobs = action.payload;
    },
  },
});

export const { addJob, updateJob, removeJob, setJobs } = jobsSlice.actions;
export const deleteJob = removeJob; // Alias for removeJob
export default jobsSlice.reducer;
