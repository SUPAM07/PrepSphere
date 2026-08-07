import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middlewares/errorHandler.js';
import { AppError } from '../../errors/AppError.js';
import { ZodError } from 'zod';

describe('Global Error Handler Middleware', () => {
  const mockRequest = {} as Request;
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
  };
  const mockNext: NextFunction = vi.fn();

  it('handles AppError correctly', () => {
    const res = mockResponse();
    const error = new AppError('Custom Error', 400);

    errorHandler(error, mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom Error',
    });
  });

  it('handles AppError using static methods', () => {
    const res = mockResponse();
    const error = AppError.unauthorized('Not allowed');

    errorHandler(error, mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not allowed',
    });
  });

  it('handles ZodError correctly', () => {
    const res = mockResponse();
    const error = new ZodError([]);

    errorHandler(error, mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation Error',
      errors: error.format(),
    });
  });

  it('handles Mongoose Duplicate Key Error (11000)', () => {
    const res = mockResponse();
    const error = { code: 11000, keyValue: { email: 'test@test.com' } };

    errorHandler(error, mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Duplicate field value entered: email',
    });
  });

  it('handles unknown generic Errors by returning 500 without leaking stack in production', () => {
    const res = mockResponse();
    const error = new Error('Database disconnected unexpectedly');
    
    // Save original env
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    // Mock console.error to avoid test output spam
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, mockRequest, res, mockNext);

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });

    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('exposes stack trace in development mode', () => {
    const res = mockResponse();
    const error = new Error('Some dev error');
    
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Some dev error',
      stack: expect.any(String),
    }));

    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});
