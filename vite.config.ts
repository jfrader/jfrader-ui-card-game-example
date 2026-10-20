import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Keep one React and one Emotion instance when the published package and its
    // dependencies resolve through pnpm. Without this Vite can load @emotion/react twice.
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('/@jfrader/') ||
            id.includes('/@emotion/') ||
            id.includes('/@floating-ui/') ||
            id.includes('/motion/')
          ) {
            return 'ui-vendor';
          }
          if (id.includes('/react') || id.includes('/scheduler/')) return 'react-vendor';
          if (id.includes('/lucide-react/')) return 'icons';
          return 'vendor';
        },
      },
    },
  },
});
