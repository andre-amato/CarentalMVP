import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setup-tests.ts',
    deps: {
      inline: [/node_modules/],
    },
    resolve: {
      conditions: ['development', 'browser'],
    },
  },
});
