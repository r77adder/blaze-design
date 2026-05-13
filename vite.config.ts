import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@':    path.resolve(__dirname, 'src'),
      '@ios': path.resolve(__dirname, 'ios'),
    },
  },
  server: { port: 5173, open: '/' },
});
