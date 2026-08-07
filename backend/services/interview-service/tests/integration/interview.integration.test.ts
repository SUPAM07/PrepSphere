import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import Interview from '../../model/interview.model.js';
import redis from '../../../../shared/redis/redis.js';
import graph from '../../graph/graph.js';

// Mock dependencies
vi.mock('../../model/interview.model.js', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../../../../shared/redis/redis.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
  },
}));



// We must mock the graph module since it executes LLMs
vi.mock('../../graph/graph.js', () => ({
  default: {
    invoke: vi.fn(),
  },
}));

vi.mock('../../../../shared/messaging/rpc.js', () => ({
  rpcRequest: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../../../../shared/messaging/publisher.js', () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('Interview Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /start', () => {
    it('returns 401 when x-user-id header is missing', async () => {
      const res = await request(app).post('/start').send({ type: 'hr', role: 'SWE' });
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 400 on invalid type enum', async () => {
      const res = await request(app)
        .post('/start')
        .set('x-user-id', 'user123')
        .send({ type: 'unknown_type', role: 'SWE' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid payload');
      expect(res.body.errors.type).toBeDefined();
    });

    it('returns 400 when role is missing', async () => {
      const res = await request(app)
        .post('/start')
        .set('x-user-id', 'user123')
        .send({ type: 'hr' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.role).toBeDefined();
    });

    it('returns 500 when graph returns empty questions', async () => {
      vi.mocked(graph.invoke).mockResolvedValueOnce({
        questions: []
      } as any);

      const res = await request(app)
        .post('/start')
        .set('x-user-id', 'user123')
        .send({ type: 'hr', role: 'SWE' });

      expect(res.status).toBe(500);
      // Wait, if generateInterviewQuestion throws an AppError, we get it
      // In interview.controller.ts: `throw new AppError("Failed to generate interview questions", 500)`
      expect(res.body.message).toBe('Failed to generate interview questions');
    });

    it('returns 201 on successful start', async () => {
      const mockQuestions = [{ question: 'Tell me about yourself', topic: 'General' }];
      vi.mocked(graph.invoke).mockResolvedValueOnce({
        questions: mockQuestions
      } as any);

      const mockInterview = {
        _id: 'interview_123',
        userId: 'user123',
        status: 'in_progress',
        questions: [{ text: 'Tell me about yourself', answer: '' }],
        save: vi.fn(),
      };
      vi.mocked(Interview.create).mockResolvedValueOnce(mockInterview as any);

      const res = await request(app)
        .post('/start')
        .set('x-user-id', 'user123')
        .send({ type: 'hr', role: 'SWE' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.interviewId).toBe('interview_123');
      expect(res.body.question).toEqual({ text: 'Tell me about yourself', answer: '' });
    });
  });

  describe('POST /answer', () => {
    it('returns 401 when x-user-id is missing', async () => {
      const res = await request(app).post('/answer').send({ interviewId: '123', answer: 'test' });
      expect(res.status).toBe(401);
    });

    it('returns 400 when interviewId is missing', async () => {
      const res = await request(app)
        .post('/answer')
        .set('x-user-id', 'user123')
        .send({ answer: 'test' });
      expect(res.status).toBe(400);
    });

    it('returns 404 when interview is not found', async () => {
      vi.mocked(Interview.findOne).mockResolvedValueOnce(null);
      const res = await request(app)
        .post('/answer')
        .set('x-user-id', 'user123')
        .send({ interviewId: 'missing_123', answer: 'test' });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Interview not found');
    });

    it('returns 400 when interview is already completed', async () => {
      vi.mocked(Interview.findOne).mockResolvedValueOnce({ status: 'completed' } as any);
      const res = await request(app)
        .post('/answer')
        .set('x-user-id', 'user123')
        .send({ interviewId: 'done_123', answer: 'test' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Interview already completed');
    });
  });

  describe('GET /all', () => {
    it('returns 401 when x-user-id is missing', async () => {
      const res = await request(app).get('/all');
      expect(res.status).toBe(401);
    });

    it('returns 200 from redis cache', async () => {
      const cached = [{ id: '1', role: 'SWE' }];
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify({ interviews: cached }));
      
      const res = await request(app).get('/all').set('x-user-id', 'user123');
      expect(res.status).toBe(200);
      expect(res.body.interviews).toEqual(cached);
      expect(Interview.find).not.toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('returns 404 when interview not found', async () => {
      vi.mocked(Interview.findOne).mockResolvedValueOnce(null);
      const res = await request(app).get('/missing_123').set('x-user-id', 'user123');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Interview not found');
    });
  });
});
