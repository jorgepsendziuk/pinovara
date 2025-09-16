#!/bin/bash

echo "🔍 VERIFICAÇÃO DE DEPLOY - PINOVARA"
echo "===================================="
echo ""

# Verificar estrutura de diretórios
echo "📁 Verificando estrutura de diretórios..."
if [ -d "/var/www/pinovara" ]; then
    echo "✅ /var/www/pinovara existe"
else
    echo "❌ /var/www/pinovara não existe"
    exit 1
fi

if [ -d "/var/www/pinovara/backend" ]; then
    echo "✅ /var/www/pinovara/backend existe"
else
    echo "❌ /var/www/pinovara/backend não existe"
    exit 1
fi

if [ -d "/var/www/html" ]; then
    echo "✅ /var/www/html existe"
else
    echo "❌ /var/www/html não existe"
    exit 1
fi
echo ""

# Verificar arquivos do backend
echo "🔧 Verificando arquivos do backend..."
BACKEND_DIR="/var/www/pinovara/backend"

if [ -f "$BACKEND_DIR/package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json não encontrado"
fi

if [ -f "$BACKEND_DIR/ecosystem.config.js" ]; then
    echo "✅ ecosystem.config.js encontrado"
else
    echo "❌ ecosystem.config.js não encontrado"
fi

if [ -d "$BACKEND_DIR/dist" ]; then
    echo "✅ dist/ encontrado"
    FILE_COUNT=$(find "$BACKEND_DIR/dist" -name "*.js" | wc -l)
    echo "   📄 $FILE_COUNT arquivos JS compilados"
else
    echo "❌ dist/ não encontrado"
fi

if [ -d "$BACKEND_DIR/prisma" ]; then
    echo "✅ prisma/ encontrado"
    if [ -f "$BACKEND_DIR/prisma/schema.prisma" ]; then
        echo "   📄 schema.prisma encontrado"
    else
        echo "   ❌ schema.prisma não encontrado"
    fi
else
    echo "❌ prisma/ não encontrado"
fi

if [ -f "$BACKEND_DIR/.env" ]; then
    echo "✅ .env encontrado"
else
    echo "❌ .env não encontrado"
fi
echo ""

# Verificar arquivos do frontend
echo "🎨 Verificando arquivos do frontend..."
FRONTEND_DIR="/var/www/html"

if [ -f "$FRONTEND_DIR/index.html" ]; then
    echo "✅ index.html encontrado"
else
    echo "❌ index.html não encontrado"
fi

FILE_COUNT=$(find "$FRONTEND_DIR" -type f | wc -l)
echo "📄 Total de arquivos frontend: $FILE_COUNT"
echo ""

# Verificar processos
echo "🔄 Verificando processos..."
if pgrep -f "node.*dist/server.js" > /dev/null; then
    echo "✅ Processo Node.js rodando"
else
    echo "❌ Processo Node.js não encontrado"
fi

if pm2 list 2>/dev/null | grep -q pinovara-backend; then
    echo "✅ PM2 process 'pinovara-backend' encontrado"
    pm2 list | grep pinovara-backend
else
    echo "❌ PM2 process 'pinovara-backend' não encontrado"
fi
echo ""

# Verificar conectividade
echo "🌐 Verificando conectividade..."
echo "Frontend (porta 80): $(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo 'ERRO')"
echo "Backend API (porta 3001): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/ || echo 'ERRO')"
echo "Health Check (porta 3001): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo 'ERRO')"
echo ""

# Verificar Nginx
echo "🟢 Verificando Nginx..."
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx está ativo"
else
    echo "❌ Nginx não está ativo"
fi

if sudo netstat -tlnp 2>/dev/null | grep -q ":80 "; then
    echo "✅ Porta 80 está ouvindo"
else
    echo "❌ Porta 80 não está ouvindo"
fi
echo ""

echo "✅ Verificação concluída!"
echo ""
echo "💡 Se algum item estiver marcado com ❌, há um problema na configuração."
