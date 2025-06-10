import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  server: {
    watch: {
      ignored: ['**/simple-rank-backend/**'] // Ignore changes in node_modules and dist directories
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // This will remove console logs in production build
      }
    },
  }
})
