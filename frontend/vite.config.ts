import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detectar ambiente
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Proxy para todas as rotas da API (exceto arquivos estáticos)
        '^/(?!assets|favicon|pinovara|icon|@vite|@fs|node_modules).*$': {
          target: isProduction
            ? 'https://pinovaraufba.com.br'
            : 'http://localhost:3001',
          changeOrigin: true,
          // Configurações adicionais para produção
          secure: isProduction,
          headers: {
            'X-Forwarded-Proto': isProduction ? 'https' : 'http'
          }
        }
      }
    },
    // Configurações de build
    build: {
      outDir: 'dist',
      // Configurar para produção
      ...(isProduction && {
        minify: 'esbuild',
        sourcemap: false
      })
    },
    // Variáveis de ambiente
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __API_BASE_URL__: JSON.stringify(
        isProduction
          ? 'https://pinovaraufba.com.br'
          : 'http://localhost:3001'
      )
    }
  }
})
