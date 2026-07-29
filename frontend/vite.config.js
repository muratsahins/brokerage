import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api istekleri backend'e (localhost:4000) yönlendirilir
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  // Üretim derlemesini yerelde gerçekçi biçimde denemek için (dev sunucusu
  // StrictMode çift render'ı ve geliştirme React'iyle yavaş ölçüm verir).
  preview: {
    port: 5181,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
