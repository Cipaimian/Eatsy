import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// root = folder web/ (lokasi config ini) biar build jalan dari mana pun (mis. `npm run build:web` di repo root).
const root = dirname(fileURLToPath(import.meta.url));

// Build output -> ../public, jadi Express tetap `express.static(public/)` seperti sekarang.
// Dev: proxy /api + /health ke server Express di :3000 (jalanin `npm start` di terminal lain).
export default defineConfig({
  root,
  plugins: [react()],
  build: {
    outDir: resolve(root, '..', 'public'),
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/health': 'http://localhost:3000'
    }
  }
});
