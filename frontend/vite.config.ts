import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detectar ambiente
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true, // Permitir acesso externo em desenvolvimento
      proxy: isDevelopment ? {
        // Proxy apenas em desenvolvimento
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      } : undefined
    },
    // Configurações de build
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Otimizações para produção
      ...(isProduction && {
        minify: 'esbuild',
        sourcemap: false,
        target: 'es2015',
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom']
            }
          }
        }
      }),
      // Sourcemap em desenvolvimento
      ...(isDevelopment && {
        sourcemap: true
      })
    },
    // Otimizações de dependências
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios']
    }
  }
})
