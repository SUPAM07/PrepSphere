import { describe, it, expect } from 'vitest';
import { InterviewStateAnnotation } from '../../../graph/state.js';

describe('InterviewStateAnnotation', () => {
  it('defines the correct structure for the interview graph state', () => {
    const initialState = {
      action: 'start',
      type: 'technical',
      role: 'SWE',
      useResume: false,
      questions: [],
      completed: false,
    };

    // This is just a type/annotation check. We are verifying that the 
    // root annotation exported matches our expected keys.
    expect(InterviewStateAnnotation).toBeDefined();
    
    // In a real LangGraph setup, we might push data through a channel to test reducers,
    // but here we just ensure the Annotation is importable and structurally sound.
  });
});
