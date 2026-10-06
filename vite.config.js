import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const routes = ['shop', 'contact', 'account', 'checkout', 'privacy', 'terms', 'returns', 'shipping', 'admin', 'signin', 'signup', 'forgot-password', 'reset-password', 'faq'];
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
