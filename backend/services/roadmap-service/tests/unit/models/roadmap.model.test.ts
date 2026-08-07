import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import Roadmap from '../../../model/roadmap.model.js';

describe('Roadmap Mongoose Model', () => {
  it('validates a correct document successfully', () => {
    const validRoadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId().toString(),
      title: 'Full Stack Web Development',
      targetPackage: '12 LPA',
      duration: '3 Months',
      level: 'Beginner',
      modules: [
        {
          title: 'HTML & CSS',
          duration: '1 Week',
          difficulty: 'Easy',
          description: 'Basics of web development.',
        },
      ],
    });

    const error = validRoadmap.validateSync();
    expect(error).toBeUndefined();
  });

  it('fails validation if required fields are missing', () => {
    const invalidRoadmap = new Roadmap({});
    const error = invalidRoadmap.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors['userId']).toBeDefined();
    expect(error?.errors['title']).toBeDefined();
    expect(error?.errors['targetPackage']).toBeDefined();
    expect(error?.errors['duration']).toBeDefined();
    expect(error?.errors['level']).toBeDefined();
  });

  it('defaults modules to an empty array', () => {
    const roadmap = new Roadmap({
      userId: new mongoose.Types.ObjectId().toString(),
      title: 'Data Science',
      targetPackage: '15 LPA',
      duration: '6 Months',
      level: 'Intermediate',
    });

    expect(roadmap.modules).toEqual([]);
  });
});
