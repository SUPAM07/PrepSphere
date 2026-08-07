import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/dist/**', '**/node_modules/**'],
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['**/index.ts', '**/configs/**', '**/tests/**', '**/*.d.ts', '**/types.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
});
