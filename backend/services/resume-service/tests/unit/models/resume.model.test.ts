import { describe, it, expect } from 'vitest';
import Resume from '../../../model/resume.model.js';
import mongoose from 'mongoose';

describe('Resume Mongoose Model', () => {
  it('fails validation if userId is missing', () => {
    const invalidResume = new Resume({
      name: 'John',
      email: 'john@example.com',
    });

    const error = invalidResume.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors['userId']).toBeDefined();
  });

  it('applies default empty arrays for missing array fields', () => {
    const resume = new Resume({
      userId: new mongoose.Types.ObjectId().toString(),
      targetPackage: '10 LPA',
      extractedText: 'some text',
    });

    // We rely on mongoose setting defaults upon instantiation for typed arrays
    // We recently changed them to { type: [], default: [] }
    expect(resume.education).toEqual([]);
    expect(resume.experience).toEqual([]);
    expect(resume.projects).toEqual([]);
    expect(resume.skills).toEqual([]);
    expect(resume.missingSkills).toEqual([]);
    expect(resume.strengths).toEqual([]);
    expect(resume.weaknesses).toEqual([]);
    expect(resume.recommendations).toEqual([]);
  });

  it('validates a correct document successfully', () => {
    const validResume = new Resume({
      userId: new mongoose.Types.ObjectId().toString(),
      name: 'John',
      email: 'john@example.com',
      score: 85,
      extractedText: 'some text',
    });

    const error = validResume.validateSync();
    expect(error).toBeUndefined();
  });
});
