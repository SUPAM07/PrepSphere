import { describe, it, expect } from 'vitest';
import { AppError } from '../../errors/AppError.js';

describe('AppError Class', () => {
  it('instantiates correctly with default message and status code', () => {
    const error = new AppError('Custom Error', 400);

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Custom Error');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
    expect(error.stack).toBeDefined();
  });

  it('provides a static notFound factory method', () => {
    const error = AppError.notFound('Resource missing');

    expect(error.message).toBe('Resource missing');
    expect(error.statusCode).toBe(404);
  });

  it('provides a static unauthorized factory method with default message', () => {
    const error = AppError.unauthorized();

    expect(error.message).toBe('Unauthorized');
    expect(error.statusCode).toBe(401);
  });

  it('provides a static unauthorized factory method with custom message', () => {
    const error = AppError.unauthorized('Invalid token');

    expect(error.message).toBe('Invalid token');
    expect(error.statusCode).toBe(401);
  });
});
