import { describe, it, expect } from 'vitest';
import redis from '../redis/redis.js';

describe('Shared Redis Client Export', () => {
  it('exports a valid Redis client instance', () => {
    expect(redis).toBeDefined();
    expect(typeof redis.get).toBe('function');
    expect(typeof redis.set).toBe('function');
  });
});
