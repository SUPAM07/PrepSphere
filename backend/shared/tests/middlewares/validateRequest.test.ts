import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateRequest } from '../../middlewares/validateRequest.js';

describe('validateRequest Middleware', () => {
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(18),
  });

  const middleware = validateRequest(schema);

  it('calls next() when the request body passes schema validation', () => {
    const req: any = { body: { name: 'John', age: 30 } };
    const res: any = { status: vi.fn(), json: vi.fn() };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns 400 with formatted Zod errors when validation fails', () => {
    const req: any = { body: { name: '', age: 15 } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Invalid payload',
      errors: expect.any(Object),
    }));
  });

  it('calls next(error) for non-Zod unexpected errors', () => {
    const badSchema = {
      parse: () => {
        throw new Error('Some unexpected error');
      },
    };
    const brokenMiddleware = validateRequest(badSchema as any);

    const req: any = { body: {} };
    const res: any = { status: vi.fn(), json: vi.fn() };
    const next = vi.fn();

    brokenMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
