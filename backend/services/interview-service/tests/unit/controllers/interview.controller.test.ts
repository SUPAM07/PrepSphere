import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { startInterview, submitAnswer } from '../../../controllers/interview.controller.js';
import Interview from '../../../model/interview.model.js';
import graph from '../../../graph/graph.js';
import redis from '../../../../../shared/redis/redis.js';

vi.mock('../../../model/interview.model.js', () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock('../../../graph/graph.js', () => ({
  default: {
    invoke: vi.fn(),
  },
}));

vi.mock('../../../../../shared/redis/redis.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn(),
  },
}));

vi.mock('../../../../../shared/messaging/rpc.js', () => ({
  rpcRequest: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../../../../../shared/messaging/publisher.js', () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('Interview Controller Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      headers: { 'x-user-id': 'user-123' },
      body: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('startInterview', () => {
    it('throws 401 if x-user-id header is missing', async () => {
      mockRequest.headers = {};

      await startInterview(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized',
        statusCode: 401,
      }));
    });

    it('throws 500 if graph fails to generate questions', async () => {
      mockRequest.body = { type: 'technical', role: 'SWE', useResume: false };
      vi.mocked(graph.invoke).mockResolvedValue({ questions: [] } as any);

      await startInterview(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to generate interview questions',
        statusCode: 500,
      }));
    });

    it('creates interview and returns questions on success', async () => {
      mockRequest.body = { type: 'technical', role: 'SWE', useResume: false };
      const mockQuestions = [{ question: 'What is JS?', difficulty: 'easy' }];
      vi.mocked(graph.invoke).mockResolvedValue({ questions: mockQuestions } as any);
      
      const newInterview = { _id: 'int-123', questions: mockQuestions };
      vi.mocked(Interview.create).mockResolvedValue(newInterview as any);

      await startInterview(mockRequest as Request, mockResponse as Response, mockNext);

      expect(graph.invoke).toHaveBeenCalledWith({
        action: 'start',
        type: 'technical',
        role: 'SWE',
        useResume: false,
        resume: undefined,
      });
      expect(Interview.create).toHaveBeenCalled();
      expect(redis.del).toHaveBeenCalledWith('interviews:user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        interviewId: 'int-123',
        currentQuestion: 0,
        totalQuestions: 1,
        question: mockQuestions[0],
      });
    });
  });

  describe('submitAnswer', () => {
    it('throws 404 if interview is not found', async () => {
      mockRequest.body = { interviewId: 'int-123', answer: 'my answer' };
      vi.mocked(Interview.findOne).mockResolvedValue(null);

      await submitAnswer(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Interview not found',
        statusCode: 404,
      }));
    });

    it('throws 400 if interview is already completed', async () => {
      mockRequest.body = { interviewId: 'int-123', answer: 'my answer' };
      vi.mocked(Interview.findOne).mockResolvedValue({ status: 'completed' } as any);

      await submitAnswer(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Interview already completed',
        statusCode: 400,
      }));
    });

    it('evaluates answer and completes interview if it is the last question', async () => {
      mockRequest.body = { interviewId: 'int-123', answer: 'my answer' };
      
      const mockInterview = {
        _id: 'int-123',
        status: 'in-progress',
        currentQuestion: 0,
        questions: [{ question: 'Q1', difficulty: 'easy' }],
        save: vi.fn(),
      };
      
      vi.mocked(Interview.findOne).mockResolvedValue(mockInterview as any);
      
      const mockFeedbackResult = {
        feedback: { correctness: 100 },
        report: { overallScore: 100, summary: 'Good' },
      };
      vi.mocked(graph.invoke).mockResolvedValue(mockFeedbackResult as any);

      await submitAnswer(mockRequest as Request, mockResponse as Response, mockNext);

      expect(graph.invoke).toHaveBeenCalledWith(expect.objectContaining({
        action: 'feedback',
        completed: true,
      }));
      expect(mockInterview.status).toBe('completed');
      expect((mockInterview as any).overallScore).toBe(100);
      expect(mockInterview.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        completed: true,
      }));
    });
  });
});
