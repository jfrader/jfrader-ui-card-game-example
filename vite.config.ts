import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Keep one React and one Emotion instance when the published package and its
    // dependencies resolve through pnpm. Without this Vite can load @emotion/react twice.
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
});
