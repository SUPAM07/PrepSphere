import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    exclude: ['**/dist/**', '**/node_modules/**'],
    projects: [
      path.resolve(__dirname, 'services/auth-service'),
      path.resolve(__dirname, 'services/billing-service'),
      path.resolve(__dirname, 'services/interview-service'),
      path.resolve(__dirname, 'services/resume-service'),
      path.resolve(__dirname, 'services/roadmap-service'),
      path.resolve(__dirname, 'shared'),
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/index.ts',
        '**/configs/**',
        '**/tests/**',
        '**/shared/testing/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/coverage/**',
        '**/lcov-report/**',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types.ts',
        '**/prompts/**',
        '**/gateway/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
