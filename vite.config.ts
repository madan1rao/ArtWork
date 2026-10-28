import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2020',
    // three.js is ~1 MB but lazy: only fetched when the WebGL hero mounts.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Keep heavy libraries in their own cacheable chunks. The 3D chunk is only
        // requested when the hero scene actually mounts.
        // Match by package path (not the object form): the object form also pulls shared
        // helpers into a chunk, which made the entry statically import — and preload — three.
        manualChunks(id) {
          // Vite's dynamic-import helper must live in an eagerly loaded chunk.
          if (id.includes('vite/preload-helper')) return 'react';
          if (!id.includes('node_modules')) return;
          const pkg = (names: string) => new RegExp(`[\\\\/]node_modules[\\\\/](${names})[\\\\/]`).test(id);
          if (pkg('three|@react-three')) return 'three';
          if (pkg('react|react-dom|react-router|react-router-dom|scheduler')) return 'react';
          if (pkg('framer-motion|motion-dom|motion-utils')) return 'motion';
          if (pkg('gsap|@gsap')) return 'gsap';
        },
      },
    },
  },
});
