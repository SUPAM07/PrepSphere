import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Resume } from "../types/index";

interface ResumeState {
  resume: Resume | null;
}

const initialState: ResumeState = {
  resume: null,
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setResume(state, action: PayloadAction<Resume | null>) {
      state.resume = action.payload;
    }
  },
});

export const { setResume } = resumeSlice.actions;

export default resumeSlice.reducer;