import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import customMedia from 'postcss-custom-media';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  css: {
    postcss: {
      plugins: [customMedia()],
    },
  },
  test: {
    environment: 'jsdom',
    pool: 'vmThreads',
    include: ['test/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
  },
});
