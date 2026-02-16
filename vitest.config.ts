import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns
    include: [
      'tests/**/*.test.ts',           // Central tests (integration, shared utils)
      'apps/**/tests/**/*.test.ts',   // App-specific tests (co-located)
    ],

    // Environment
    environment: 'node',

    // Coverage (optional - can enable later)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'tests/examples/**',
        'dist/**',
        '**/*.config.ts',
      ],
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
