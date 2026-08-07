import { describe, it, expect, vi } from 'vitest';
import { parseEnv, authEnvSchema, gatewayEnvSchema } from '../env.js';

describe('Shared Env Validation Utility', () => {
  it('parses valid environment variables correctly', () => {
    const mockEnv = {
      PORT: '8001',
      POSTGRES_URL: 'postgresql://localhost:5432/test',
    };
    const parsed = parseEnv(authEnvSchema, mockEnv);
    expect(parsed.PORT).toBe(8001);
    expect(parsed.POSTGRES_URL).toBe('postgresql://localhost:5432/test');
    expect(parsed.REDIS_URL).toBe('redis://localhost:6379');
  });

  it('exits process if environment variables are invalid', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit called'); });

    const invalidEnv = { PORT: 'invalid_number' };
    
    expect(() => parseEnv(gatewayEnvSchema, invalidEnv)).toThrow('process.exit called');

    expect(consoleSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
