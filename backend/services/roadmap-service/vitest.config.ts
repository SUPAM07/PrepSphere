import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/dist/**', '**/node_modules/**'],
    globals: true,
    environment: 'node',
    env: {
      GROQ_API_KEY: 'test_key',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['**/index.ts', '**/configs/**', '**/tests/**', '**/*.d.ts', '**/types.ts', '**/prompts/**'],
      thresholds: { lines: 70, functions: 70, branches: 70 },
    },
  },
});
