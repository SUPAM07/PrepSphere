import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import Interview from '../../../model/interview.model.js';

describe('Interview Mongoose Model', () => {
  it('validates a correct document successfully', () => {
    const validInterview = new Interview({
      userId: new mongoose.Types.ObjectId().toString(),
      type: 'technical',
      role: 'Frontend Developer',
      useResume: true,
      questions: [
        {
          question: 'Explain React hooks.',
          difficulty: 'medium',
        },
      ],
    });

    const error = validInterview.validateSync();
    expect(error).toBeUndefined();
  });

  it('fails validation if required fields are missing', () => {
    const invalidInterview = new Interview({});
    const error = invalidInterview.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors['userId']).toBeDefined();
    expect(error?.errors['type']).toBeDefined();
    expect(error?.errors['role']).toBeDefined();
  });

  it('applies default field values correctly', () => {
    const interview = new Interview({
      userId: new mongoose.Types.ObjectId().toString(),
      type: 'hr',
      role: 'Software Engineer',
    });

    expect(interview.currentQuestion).toBe(0);
    expect(interview.overallScore).toBe(0);
    expect(interview.status).toBe('in-progress');
    expect(interview.useResume).toBe(false);
    expect(interview.strengths).toEqual([]);
    expect(interview.weaknesses).toEqual([]);
    expect(interview.recommendations).toEqual([]);
  });
});
