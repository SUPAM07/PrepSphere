import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

describe('asyncHandler Wrapper', () => {
  const mockRequest = {} as Request;
  const mockResponse = {} as Response;
  const mockNext: NextFunction = vi.fn();

  it('resolves successfully and calls the inner function', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(mockRequest, mockResponse, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('catches rejected promises and passes them to next', async () => {
    const error = new Error('Test Error');
    const mockFn = vi.fn().mockRejectedValue(error);
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(mockRequest, mockResponse, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
