import { vi } from 'vitest';

// 1. Mock fs to bypass private key reading
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(() => 'mock-private-key-content'),
  },
  readFileSync: vi.fn(() => 'mock-private-key-content'),
}));

// Mock jsonwebtoken to avoid RSA parsing errors with our mock key
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-jwt-token'),
    verify: vi.fn(() => ({ userId: 'user-id', sessionId: 'session-id' })),
    decode: vi.fn(() => ({ userId: 'user-id', sessionId: 'session-id' })),
  },
}));

// 2. Mock Redis
vi.mock('../../../shared/redis/redis.js', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    expire: vi.fn(),
    pipeline: vi.fn(() => ({
      del: vi.fn(),
      exec: vi.fn(),
    })),
  },
}));

// 2. Mock RabbitMQ Publisher
vi.mock('../../../shared/messaging/publisher.js', () => ({
  publishEvent: vi.fn(),
}));

// 3. Mock Database (Drizzle ORM)
vi.mock('../db/index.js', () => {
  const dbMock = {
    select: vi.fn(() => dbMock),
    from: vi.fn(() => dbMock),
    where: vi.fn(() => dbMock),
    limit: vi.fn(() => dbMock),
    insert: vi.fn(() => dbMock),
    values: vi.fn(() => dbMock),
    returning: vi.fn(() => dbMock),
    update: vi.fn(() => dbMock),
    set: vi.fn(() => dbMock),
    delete: vi.fn(() => dbMock),
  };
  return { default: dbMock };
});
