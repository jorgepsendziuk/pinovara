#!/bin/bash

# Script para corrigir backend no servidor remoto
SERVER_HOST="pinovaraufba.com.br"
SERVER_USER="pinovaraufba"

echo "🔍 Verificando o que existe no servidor..."
echo ""

echo "1️⃣ Arquivos em /var/www/pinovara/backend:"
ssh ${SERVER_USER}@${SERVER_HOST} 'ls -la /var/www/pinovara/backend/ 2>/dev/null || echo "❌ Diretório não existe"'
echo ""

echo "2️⃣ Conteúdo de dist/ (se existir):"
ssh ${SERVER_USER}@${SERVER_HOST} 'ls -la /var/www/pinovara/backend/dist/ 2>/dev/null || echo "❌ dist/ não existe"'
echo ""

echo "3️⃣ Verificando último deploy:"
ssh ${SERVER_USER}@${SERVER_HOST} 'ls -ltr /tmp/pinovara-deploy-* 2>/dev/null | tail -5 || echo "❌ Nenhum deploy encontrado em /tmp"'
echo ""

read -p "🔧 Deseja recompilar e enviar backend agora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]
then
    echo ""
    echo "📦 Compilando backend localmente..."
    cd backend
    npm run build
    
    echo ""
    echo "📤 Enviando dist/ para o servidor..."
    scp -r dist ${SERVER_USER}@${SERVER_HOST}:/var/www/pinovara/backend/
    
    echo ""
    echo "🔄 Reiniciando backend..."
    ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 restart pinovara-backend'
    
    echo ""
    echo "✅ Pronto! Verificando status..."
    ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 list | grep pinovara'
    
    echo ""
    echo "📋 Últimos logs:"
    ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs pinovara-backend --lines 20 --nostream'
fi

