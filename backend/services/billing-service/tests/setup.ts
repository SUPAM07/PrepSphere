import { vi } from 'vitest';

// 1. Mock Razorpay
vi.mock('../configs/razorpay.js', () => ({
  default: {
    orders: {
      create: vi.fn(),
    },
    payments: {
      fetch: vi.fn(),
    },
  },
}));

// 2. Mock Database (Drizzle ORM)
vi.mock('../db/index.js', () => {
  const dbMock: any = {
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
    onConflictDoUpdate: vi.fn(() => dbMock),
    transaction: vi.fn(async (cb) => {
      // Simulate a transaction by executing the callback with a mock transaction object
      const txMock = {
        update: vi.fn(() => txMock),
        set: vi.fn(() => txMock),
        where: vi.fn(() => txMock),
        insert: vi.fn(() => txMock),
        values: vi.fn(() => txMock),
        returning: vi.fn(() => txMock),
      };
      return cb(txMock);
    }),
  };
  return { default: dbMock };
});
