import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so the built `dist/` works from any sub-path (Netlify drop,
  // GitHub Pages project sites, or opened from the filesystem).
  base: './',

  resolve: {
    alias: {
      // One alias, mirrored in jsconfig.json (editor) and vitest (tests).
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false, // smaller JS; errors are reported with readable messages instead
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    // A 300 kB warning threshold makes an accidentally heavy dependency loud.
    chunkSizeWarningLimit: 300,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        // Vendor React, the dataset and the lazily-loaded views each land in
        // their own chunk: editing one view cannot bust the cache of the others.
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('data/dataset.json')) return 'data-archive';
          return undefined;
        },
      },
    },
  },

  esbuild: {
    drop: ['debugger'],
    legalComments: 'none',
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/types/**', 'src/data/**'],
      thresholds: { statements: 70, branches: 65, functions: 70, lines: 70 },
    },
  },
});
