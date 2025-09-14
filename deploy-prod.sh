#!/bin/bash

# ==========================================
# ⚡ PINOVARA - Deploy Ultra-Rápido
# ==========================================
# Uso: ./deploy-prod.sh [servidor] [usuario]
# Exemplo: ./deploy-prod.sh pinovaraufba.com.br root

set -e

SERVER_HOST=${1:-pinovaraufba.com.br}
SERVER_USER=${2:-root}
SERVER_PORT=22

echo "⚡ PINOVARA - Deploy Ultra-Rápido"
echo "=================================="
echo "Servidor: $SERVER_HOST"
echo "Usuário: $SERVER_USER"
echo ""

# Puxar do GitHub
echo "📥 Puxando do GitHub..."
git pull origin main

# Configurar produção
export NODE_ENV=production

# Build frontend
echo "🎨 Build frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend
echo "🔧 Build backend..."
cd backend
npm install
npm run build
cd ..

# Criar pacote
echo "📦 Criando pacote..."
rm -rf deploy-package
mkdir -p deploy-package
cp -r frontend/dist/* deploy-package/
cp -r backend/dist deploy-package/backend-dist
cp backend/package.json deploy-package/backend-package.json

# Script de instalação
cat > deploy-package/install.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
cd /var/www/pinovara/backend
npm install --production
cp -r /tmp/deploy-package/backend-dist/* /var/www/pinovara/backend/dist/
cat > /var/www/pinovara/backend/.env << 'EOL'
NODE_ENV=production
DATABASE_URL=postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara
JWT_SECRET=pinovara-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://pinovaraufba.com.br
EOL
sudo cp -r /tmp/deploy-package/* /var/www/html/
sudo rm -rf /var/www/html/backend-dist /var/www/html/backend-package.json
pm2 restart pinovara-backend
sudo systemctl reload nginx
echo "✅ Deploy concluído!"
EOF

chmod +x deploy-package/install.sh

# Deploy
echo "🚀 Fazendo deploy..."
scp -P $SERVER_PORT -r deploy-package/ $SERVER_USER@$SERVER_HOST:/tmp/
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd /tmp/deploy-package && ./install.sh"

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "🌐 https://pinovaraufba.com.br"

