import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  test: {
    include: ['**/*.spec.ts', '**/*.spec.tsx'],
    exclude: ['node_modules/**', '.next/**', 'e2e/**'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, '.'),
    },
  },
});
