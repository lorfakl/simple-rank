import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // only files that actually exist under public/ (and therefore in wwwroot/);
      // the old entries 'mask-icon.svg' and root 'apple-touch-icon.png' never existed
      includeAssets: ['favicon.ico', 'favicon/apple-touch-icon.png', 'favicon/android-chrome-192x192.png', 'favicon/android-chrome-512x512.png'],
      manifest: {
        name: 'Simple Rank',
        short_name: 'Simple Rank',
        description: 'A simple ranking app',
        // mytheme base-100 (#f6f9fb): OS chrome matches the light default.
        // The runtime <meta name="theme-color"> is rewritten per theme by the
        // pre-paint script in index.html, so the active theme still wins.
        theme_color: '#f6f9fb',
        icons: [
          {
            src: 'favicon/favicon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon/favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'favicon/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  server: {
    watch: {
      // The SQLite dev DB (+ WAL/SHM) now lives at the repo root and changes
      // on every query — watching it causes an infinite full-reload loop, so
      // ignore the DB files themselves wherever they sit.
      ignored: ['**/node_modules/**', '**/dist/**', '**/wwwroot/**', '**/*.db', '**/*.db-wal', '**/*.db-shm', '**/*.db-journal', '**/obj/**', '**/bin/**']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5033', // Change this to your backend server URL
        changeOrigin: true,
        //rewrite: (path) => path.replace(/^\/api/, '') // Optional: rewrite the path if needed
      }
    },
    open: true // This will automatically open the browser when you run npm run dev
  },
  build: {
    outDir: 'wwwroot',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // This will remove console logs in production build
      }
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
    env: {
      NODE_ENV: 'development'
    }
  }
})
