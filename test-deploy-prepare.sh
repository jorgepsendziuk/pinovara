#!/bin/bash

echo "🧪 TESTE DE PREPARAÇÃO DO DEPLOY"
echo "================================="

# Simular preparação dos arquivos como no workflow
DEPLOY_DIR="/tmp/pinovara-test-deploy-$(date +%s)"
mkdir -p $DEPLOY_DIR

echo "📁 Diretório de teste: $DEPLOY_DIR"

# Copiar arquivos como no workflow
echo "📋 Copiando arquivos do backend..."
if [ -d "backend/dist" ]; then
    cp -r backend/package*.json backend/dist backend/prisma $DEPLOY_DIR/ 2>/dev/null || true
    echo "✅ Backend files copied"
else
    echo "❌ Backend dist not found - run 'cd backend && npm run build' first"
    exit 1
fi

if [ -d "frontend/dist" ]; then
    cp -r frontend/dist $DEPLOY_DIR/frontend-dist 2>/dev/null || true
    echo "✅ Frontend files copied"
else
    echo "❌ Frontend dist not found - run 'cd frontend && npm run build' first"
    exit 1
fi

# Criar .env como no workflow
echo "🔧 Criando arquivo .env..."
if [ -f "backend/config.env" ]; then
  cp backend/config.env $DEPLOY_DIR/.env
else
  echo 'NODE_ENV=production' > $DEPLOY_DIR/.env
  echo 'PORT=3001' >> $DEPLOY_DIR/.env
  echo 'DATABASE_URL="postgresql://pinovara:pinovara@bd.pinovaraufba.com.br:5432/pinovara?schema=pinovara"' >> $DEPLOY_DIR/.env
  echo 'JWT_SECRET="pinovara-secret-key-change-in-production"' >> $DEPLOY_DIR/.env
fi
echo "✅ .env criado"

# Criar PM2 config como no workflow  
echo "⚙️ Criando ecosystem.config.js..."
cat > $DEPLOY_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pinovara-backend',
    script: 'dist/server.js',
    cwd: '/var/www/pinovara/backend',
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

# Verificar arquivos finais
echo ""
echo "📋 ARQUIVOS PREPARADOS PARA DEPLOY:"
echo "=================================="
ls -la $DEPLOY_DIR/
echo ""

echo "📄 Verificando arquivos essenciais:"
if [ -f "$DEPLOY_DIR/package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json NÃO encontrado"
fi

if [ -f "$DEPLOY_DIR/.env" ]; then
    echo "✅ .env encontrado"
else
    echo "❌ .env NÃO encontrado"
fi

if [ -f "$DEPLOY_DIR/ecosystem.config.js" ]; then
    echo "✅ ecosystem.config.js encontrado"
else
    echo "❌ ecosystem.config.js NÃO encontrado"
fi

if [ -d "$DEPLOY_DIR/dist" ]; then
    echo "✅ dist/ encontrado"
else
    echo "❌ dist/ NÃO encontrado"
fi

if [ -d "$DEPLOY_DIR/prisma" ]; then
    echo "✅ prisma/ encontrado"
else
    echo "❌ prisma/ NÃO encontrado"
fi

echo ""
echo "🧪 Teste concluído! Diretório de teste: $DEPLOY_DIR"
echo "🗑️  Para limpar: rm -rf $DEPLOY_DIR"
