import mongoose from 'mongoose';

export const createMockUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId().toString(),
  email: 'test@example.com',
  interviewCoin: 100,
  ...overrides,
});

export const createMockInterview = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId().toString(),
  userId: new mongoose.Types.ObjectId().toString(),
  role: 'Software Engineer',
  status: 'started',
  questions: [],
  currentIndex: 0,
  ...overrides,
});
