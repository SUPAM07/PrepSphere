import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/dist/**', '**/node_modules/**'],
    globals: true,
    environment: 'node',
    env: {
      RAZORPAY_KEY_ID: 'test_id',
      RAZORPAY_KEY_SECRET: 'test_secret',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['**/index.ts', '**/configs/**', '**/tests/**', '**/*.d.ts', '**/types.ts'],
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
});
