import path from 'node:path';
import react from '@vitejs/plugin-react';
import customMedia from 'postcss-custom-media';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  css: {
    postcss: {
      plugins: [customMedia()],
    },
  },
});
