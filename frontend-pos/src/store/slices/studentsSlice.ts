import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Student } from '@/types';
import { mockStudents } from '@/data/mockData';

interface StudentsState {
  students: Student[];
}

const initialState: StudentsState = {
  students: mockStudents,
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload);
    },
    updateStudent: (state, action: PayloadAction<{ id: string; updates: Partial<Student> }>) => {
      const index = state.students.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = { ...state.students[index], ...action.payload.updates };
      }
    },
    removeStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter((s) => s.id !== action.payload);
    },
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
  },
});

export const { addStudent, updateStudent, removeStudent, setStudents } = studentsSlice.actions;
export default studentsSlice.reducer;
