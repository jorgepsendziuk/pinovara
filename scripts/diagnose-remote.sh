#!/bin/bash

# Script de diagnóstico do servidor remoto
# Uso: ./scripts/diagnose-remote.sh

echo "🔍 DIAGNÓSTICO DO SERVIDOR REMOTO - PINOVARA"
echo "================================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVER_HOST="pinovaraufba.com.br"
SERVER_USER="pinovaraufba"

echo "1️⃣ Verificando se o backend está rodando..."
ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 list | grep pinovara-backend'
echo ""

echo "2️⃣ Verificando logs recentes do backend (últimas 30 linhas)..."
ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs pinovara-backend --lines 30 --nostream'
echo ""

echo "3️⃣ Verificando se Prisma Client existe..."
ssh ${SERVER_USER}@${SERVER_HOST} 'ls -la /var/www/pinovara/backend/node_modules/@prisma/client/ 2>/dev/null | head -5'
echo ""

echo "4️⃣ Verificando schema.prisma (campos validacao)..."
ssh ${SERVER_USER}@${SERVER_HOST} 'grep -A 3 "validacao_status" /var/www/pinovara/backend/prisma/schema.prisma 2>/dev/null'
echo ""

echo "5️⃣ Testando endpoint /health..."
ssh ${SERVER_USER}@${SERVER_HOST} 'curl -s http://localhost:3001/health | jq .'
echo ""

echo "6️⃣ Testando endpoint /organizacoes/dashboard (mostrará erro se houver)..."
ssh ${SERVER_USER}@${SERVER_HOST} 'curl -s -H "Authorization: Bearer TOKEN" http://localhost:3001/organizacoes/dashboard 2>&1 | head -20'
echo ""

echo "================================================"
echo "✅ Diagnóstico concluído!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Se Prisma Client NÃO existir → Rode: ssh ${SERVER_USER}@${SERVER_HOST} 'cd /var/www/pinovara/backend && npx prisma generate'"
echo "2. Se houver erro nos logs → Verifique a mensagem de erro acima"
echo "3. Se backend não estiver rodando → Rode: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 restart pinovara-backend'"

