// ==========================================
// CONFIGURAÇÃO PINOVARA - PRODUÇÃO
// ==========================================

module.exports = {
  // Ambiente
  NODE_ENV: "production",

  // Database - IP interno para produção
  DATABASE_URL: "postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara",

  // JWT Configuration
  JWT_SECRET: "pinovara-secret-key-change-in-production",
  JWT_EXPIRES_IN: "7d",

  // Server Configuration
  PORT: 3001,

  // Frontend URL - Domínio de produção
  FRONTEND_URL: "https://pinovaraufba.com.br"
};

// ==========================================
// INSTRUÇÕES DE USO:
// ==========================================
// 1. Copie este arquivo para o servidor de produção
// 2. Renomeie para .env.production ou config.production.js
// 3. Configure NODE_ENV=production no servidor
// 4. Reinicie o serviço
// ==========================================
