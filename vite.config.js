import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const routes = ['shop', 'contact', 'privacy', 'terms', 'returns', 'shipping'];
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ...Object.fromEntries(routes.map(route => [route, resolve(import.meta.dirname, route, 'index.html')])),
      },
    },
  },
});
