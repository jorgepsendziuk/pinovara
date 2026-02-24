#!/bin/bash
# Inicia o backend no PM2 no servidor (usa mesmo quando ecosystem.config.js não existe).
# Uso no servidor: bash -l start-backend-pm2.sh   ( -l carrega .profile para PM2 no PATH )
# Ou: cd /var/www/pinovara/backend && bash start-backend-pm2.sh

set -e

# Garantir PM2 no PATH quando rodado via SSH
export PATH="/usr/local/bin:/usr/bin:${PATH:-}"
[ -f "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" 2>/dev/null || true
[ -f "$HOME/.profile" ] && . "$HOME/.profile" 2>/dev/null || true

BACKEND_DIR="${1:-/var/www/pinovara/backend}"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "❌ Diretório não encontrado: $BACKEND_DIR"
  exit 1
fi

cd "$BACKEND_DIR"

if [ ! -f "dist/server.js" ]; then
  echo "❌ dist/server.js não encontrado em $BACKEND_DIR"
  echo "   Rode o deploy antes ou copie o backend compilado."
  exit 1
fi

# Criar ecosystem.config.js se não existir
if [ ! -f "ecosystem.config.js" ]; then
  echo "📄 Criando ecosystem.config.js..."
  cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'pinovara-backend',
    script: 'dist/server.js',
    cwd: '$BACKEND_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF
  echo "✅ ecosystem.config.js criado"
fi

# Iniciar ou reiniciar
if pm2 describe pinovara-backend &>/dev/null; then
  echo "🔄 Reiniciando pinovara-backend..."
  pm2 restart pinovara-backend --update-env
else
  echo "🚀 Iniciando pinovara-backend..."
  pm2 start ecosystem.config.js --env production
fi

pm2 save
echo "✅ Backend no PM2:"
pm2 status | grep -E "pinovara|App name" || pm2 status
