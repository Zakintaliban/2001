import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Two pages: the cover + table of contents, and the episode reader.
// `base: './'` keeps asset URLs relative so `dist/` works on GitHub Pages
// or any static host, at any sub-path.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        episode: resolve(import.meta.dirname, 'episode.html'),
      },
    },
  },
});
