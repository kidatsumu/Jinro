import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://jinro-1.onrender.com',
        ws: true
      }
    }
  }
});
