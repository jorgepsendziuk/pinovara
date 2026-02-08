// ==========================================
// PINOVARA - PM2 Ecosystem Config
// ==========================================
// Configuração do PM2 para o backend
// Uso: pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name: 'pinovara-backend',
      script: 'backend/dist/server.js',
      cwd: '/var/www/pinovara/backend',
      instances: 1,
      exec_mode: 'fork',
      
      // Variáveis de ambiente
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      
      // Restart automático
      watch: false,
      max_memory_restart: '500M',
      
      // Logs
      error_file: '/var/www/pinovara/logs/pm2-error.log',
      out_file: '/var/www/pinovara/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Outros
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
