#!/bin/bash

# ==========================================
# 🔥 PINOVARA - Update de Emergência
# ==========================================
# Atualiza código e reinicia serviços

echo "🔥 PINOVARA - Update de Emergência"
echo "===================================="

# Puxar do GitHub
echo "📥 Puxando código..."
git pull origin main

# Configurar produção
export NODE_ENV=production
cat > backend/config.env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara
JWT_SECRET=pinovara-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://pinovaraufba.com.br
EOF

# Build e deploy
echo "🏗️  Build e deploy..."
./deploy-prod.sh

echo "✅ Update concluído!"

