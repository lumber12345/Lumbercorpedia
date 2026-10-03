import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Lumbercorpedia — Vite config.
// The dev server binds 0.0.0.0 so it works behind the Arena preview proxy,
// and proxies /api/* to the Lumbercorpedia node server (Torn API bridge).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
});
