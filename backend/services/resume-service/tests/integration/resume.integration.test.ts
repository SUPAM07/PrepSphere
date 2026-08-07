import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import Resume from '../../model/resume.model.js';
import redis from '../../../../shared/redis/redis.js';
import extractPdfText from '../../configs/pdf.js';
import resumeAgent from '../../agents/resume.agent.js';
import path from 'path';

// Mock dependencies
vi.mock('../../model/resume.model.js', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('../../../../shared/redis/redis.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock('../../configs/pdf.js', () => ({
  default: vi.fn(),
}));

vi.mock('../../agents/resume.agent.js', () => ({
  default: vi.fn(),
}));


vi.mock('../../../../shared/messaging/rpc.js', () => ({
  rpcRequest: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../../../../shared/messaging/publisher.js', () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('Resume Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /upload', () => {
    it('returns 400 when user Id is missing', async () => {
      // Create a dummy file to upload
      const dummyBuffer = Buffer.from('dummy pdf content');
      
      const res = await request(app)
        .post('/upload')
        .attach('resume', dummyBuffer, 'test.pdf');
        
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User Id is required');
    });

    it('returns 400 when resume PDF is missing', async () => {
      const res = await request(app)
        .post('/upload')
        .set('x-user-id', 'user123');
        
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Resume PDF is required');
    });

    it('returns 500 when AI returns invalid format', async () => {
      vi.mocked(extractPdfText).mockResolvedValueOnce('Extracted text');
      vi.mocked(resumeAgent).mockResolvedValueOnce('invalid json string');

      const dummyBuffer = Buffer.from('dummy pdf content');
      
      const res = await request(app)
        .post('/upload')
        .set('x-user-id', 'user123')
        .attach('resume', dummyBuffer, 'test.pdf');
        
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Invalid AI Response format');
    });

    it('returns 200 on successful resume upload and processing', async () => {
      vi.mocked(extractPdfText).mockResolvedValueOnce('Extracted text');
      
      const mockAiResponse = JSON.stringify({
        skills: ['JS'],
        experience: [],
        education: []
      });
      vi.mocked(resumeAgent).mockResolvedValueOnce(mockAiResponse);

      const mockResume = {
        _id: 'resume_123',
        userId: 'user123',
        skills: ['JS'],
      };
      vi.mocked(Resume.findOneAndUpdate).mockResolvedValueOnce(mockResume as any);

      const dummyBuffer = Buffer.from('dummy pdf content');
      
      const res = await request(app)
        .post('/upload')
        .set('x-user-id', 'user123')
        .attach('resume', dummyBuffer, 'test.pdf');
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /', () => {
    it('returns 400 when user Id is missing', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User Id is required');
    });

    it('returns 404 when resume not found', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      vi.mocked(Resume.findOne).mockResolvedValueOnce(null);
      
      const res = await request(app)
        .get('/')
        .set('x-user-id', 'user123');
        
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Resume not found');
    });

    it('returns 200 from redis cache', async () => {
      const cached = { userId: 'user123', skills: ['TS'] };
      vi.mocked(redis.get).mockResolvedValueOnce(JSON.stringify(cached));
      
      const res = await request(app)
        .get('/')
        .set('x-user-id', 'user123');
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(cached);
      expect(res.body.source).toBe('redis');
      expect(Resume.findOne).not.toHaveBeenCalled();
    });

    it('returns 200 from mongodb', async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      
      const dbResume = { userId: 'user123', skills: ['TS'] };
      vi.mocked(Resume.findOne).mockResolvedValueOnce(dbResume as any);
      
      const res = await request(app)
        .get('/')
        .set('x-user-id', 'user123');
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(dbResume);
      expect(res.body.source).toBe('mongodb');
    });
  });
});
