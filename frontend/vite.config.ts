/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Con toda la suite en paralelo, las pruebas que escriben con
    // `user.type` pasan de 1 s a cerca de 5 s (el límite por defecto).
    testTimeout: 15_000,
  },
});
