import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Professional } from '@/types';

interface ProfessionalsState {
  professionals: Professional[];
}

const initialState: ProfessionalsState = {
  professionals: [],
};

const professionalsSlice = createSlice({
  name: 'professionals',
  initialState,
  reducers: {
    addProfessional: (state, action: PayloadAction<Professional>) => {
      state.professionals.push(action.payload);
    },
    updateProfessional: (state, action: PayloadAction<{ id: string; updates: Partial<Professional> }>) => {
      const index = state.professionals.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.professionals[index] = { ...state.professionals[index], ...action.payload.updates };
      }
    },
    approveProfessional: (state, action: PayloadAction<string>) => {
      const professional = state.professionals.find((p) => p.id === action.payload);
      if (professional) {
        professional.status = 'approved';
      }
    },
    rejectProfessional: (state, action: PayloadAction<string>) => {
      const professional = state.professionals.find((p) => p.id === action.payload);
      if (professional) {
        professional.status = 'rejected';
      }
    },
    incrementInterviewCount: (state, action: PayloadAction<string>) => {
      const professional = state.professionals.find((p) => p.id === action.payload);
      if (professional) {
        professional.activeInterviewCount += 1;
      }
    },
    decrementInterviewCount: (state, action: PayloadAction<string>) => {
      const professional = state.professionals.find((p) => p.id === action.payload);
      if (professional && professional.activeInterviewCount > 0) {
        professional.activeInterviewCount -= 1;
      }
    },
    setProfessionals: (state, action: PayloadAction<Professional[]>) => {
      // Ensure payload is always an array
      state.professionals = Array.isArray(action.payload) ? action.payload : [];
    },
    //   state.professionals = action.payload;
    // },
  },
});

export const {
  addProfessional,
  updateProfessional,
  approveProfessional,
  rejectProfessional,
  incrementInterviewCount,
  decrementInterviewCount,
  setProfessionals,
} = professionalsSlice.actions;
export default professionalsSlice.reducer;
