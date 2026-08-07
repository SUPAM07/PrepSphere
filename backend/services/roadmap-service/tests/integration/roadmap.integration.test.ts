process.env.GROQ_API_KEY = 'test_key';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import Roadmap from '../../model/roadmap.model.js';
import redis from '../../../../shared/redis/redis.js';


// Mock dependencies
vi.mock('../../model/roadmap.model.js', () => ({
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

vi.mock('../../graph/roadmap.graph.js', () => ({
  default: {
    invoke: vi.fn(),
  }
}));

vi.mock('../../../../shared/messaging/rpc.js', () => ({
  rpcRequest: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../../../../shared/messaging/publisher.js', () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('Roadmap Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /generate', () => {
    it('returns 400 when role is missing', async () => {
      const res = await request(app).post('/generate').send({ targetPackage: '50LPA' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid payload');
      expect(res.body.errors.role).toBeDefined();
    });

    it('returns 400 when targetPackage is missing', async () => {
      const res = await request(app).post('/generate').send({ role: 'SWE' });
      expect(res.status).toBe(400);
      expect(res.body.errors.targetPackage).toBeDefined();
    });

    it('returns 401 when x-user-id header is missing', async () => {
      const res = await request(app)
        .post('/generate')
        .send({ role: 'SWE', targetPackage: '50LPA' });
      
      expect(res.body.message).toBe('Unauthorized');
    });

    it('returns 400 when useResume is true but resume data is not provided', async () => {
      const res = await request(app)
        .post('/generate')
        .set('x-user-id', 'user123')
        .send({ role: 'SWE', targetPackage: '50LPA', useResume: true });
      
      expect(res.body.message).toBe('Resume data is required if useResume is true.');
    });

    it('returns 500 when AI generation fails', async () => {
      const graphMock = await import('../../graph/roadmap.graph.js');
      vi.mocked(graphMock.default.invoke).mockRejectedValueOnce(new Error('AI failed'));

      const res = await request(app)
        .post('/generate')
        .set('x-user-id', 'user123')
        .send({ role: 'SWE', targetPackage: '50LPA' });

      expect(res.body.message).toBe('Something went wrong. Please try again later.');
    });

    it('returns 201 on successful roadmap generation', async () => {
      const mockRoadmapData = { days: [] };
      const graphMock = await import('../../graph/roadmap.graph.js');
      vi.mocked(graphMock.default.invoke).mockResolvedValueOnce({ roadmap: mockRoadmapData } as any);

      const mockRoadmap = {
        _id: 'roadmap_123',
        userId: 'user123',
        ...mockRoadmapData
      };
      vi.mocked(Roadmap.create).mockResolvedValueOnce(mockRoadmap as any);

      const res = await request(app)
        .post('/generate')
        .set('x-user-id', 'user123')
        .send({ role: 'SWE', targetPackage: '50LPA' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockRoadmap);
    });
  });

  describe('GET /list', () => {
    it('returns 401 when x-user-id is missing', async () => {
      const res = await request(app).get('/list');
      expect(res.status).toBe(401);
    });

    it('returns 200 from redis cache', async () => {
      const cached = [{ id: '1', role: 'SWE' }];
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(cached));
      
      const res = await request(app).get('/list').set('x-user-id', 'user123');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(cached);
      expect(Roadmap.find).not.toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('returns 404 when roadmap not found', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      vi.mocked(Roadmap.findOne).mockResolvedValueOnce(null);
      
      const res = await request(app).get('/missing_123').set('x-user-id', 'user123');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Roadmap not found');
    });

    it('returns 200 from redis cache', async () => {
      const cached = { id: '123', role: 'SWE' };
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(cached));
      
      const res = await request(app).get('/123').set('x-user-id', 'user123');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(cached);
      expect(Roadmap.findOne).not.toHaveBeenCalled();
    });
  });
});
