import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { prototypeMetaPlugin } from './vite/prototype-meta-plugin';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), prototypeMetaPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 5173 },
});
