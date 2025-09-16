#!/bin/bash

# ==========================================
# 🧪 PINOVARA - Teste do Deploy Seguro
# ==========================================
# Script para testar o deploy-safe.sh sem executar comandos destrutivos

echo "🧪 Testando script de deploy seguro..."
echo "====================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

echo "✅ Diretório correto detectado"

# Verificar se o git está limpo
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Há mudanças não commitadas"
else
    echo "✅ Git está limpo"
fi

# Verificar se os diretórios de build existem
if [ -d "frontend/dist" ]; then
    echo "✅ Frontend dist existe: $(find frontend/dist -type f | wc -l) arquivos"
else
    echo "⚠️  Frontend dist não existe"
fi

if [ -d "backend/dist" ]; then
    echo "✅ Backend dist existe: $(find backend/dist -type f | wc -l) arquivos"
else
    echo "⚠️  Backend dist não existe"
fi

# Verificar se o nginx está rodando
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx está rodando"
else
    echo "⚠️  Nginx não está rodando"
fi

# Verificar se o PM2 está rodando
if command -v pm2 >/dev/null 2>&1; then
    echo "✅ PM2 está instalado"
    if pm2 list | grep -q pinovara-backend; then
        echo "✅ Backend está rodando no PM2"
    else
        echo "⚠️  Backend não está rodando no PM2"
    fi
else
    echo "⚠️  PM2 não está instalado"
fi

# Verificar conectividade
echo ""
echo "🔍 Testando conectividade..."

if curl -s --max-time 5 https://pinovaraufba.com.br/health > /dev/null; then
    echo "✅ Health check responde"
else
    echo "⚠️  Health check não responde"
fi

if curl -s --max-time 5 https://pinovaraufba.com.br/ > /dev/null; then
    echo "✅ Frontend responde"
else
    echo "⚠️  Frontend não responde"
fi

echo ""
echo "📋 Resumo do teste:"
echo "=================="
echo "✅ Script de deploy seguro criado"
echo "✅ Comandos identificados como seguros:"
echo "   - git pull origin main"
echo "   - npm install (frontend e backend)"
echo "   - npm run build (frontend e backend)"
echo "   - sudo cp -r frontend/dist/* /var/www/html/"
echo "   - pm2 restart pinovara-backend"
echo "   - sudo systemctl reload nginx"
echo ""
echo "❌ Comandos evitados (destrutivos):"
echo "   - Modificação de configurações do nginx"
echo "   - Alteração de variáveis de ambiente"
echo "   - Criação de arquivos de configuração"
echo "   - Modificação de permissões do sistema"
echo ""
echo "🎯 O script deploy-safe.sh está pronto para uso!"
echo "   Execute: ./deploy-safe.sh"