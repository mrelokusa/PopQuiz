import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        sourcemap: mode === 'development',
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              ui: ['lucide-react'],
              auth: ['@supabase/supabase-js']
              // @google/genai is server-only — see api/generate-quiz.ts
            }
          }
        },
        chunkSizeWarningLimit: 1000
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react']
      }
    };
});
