#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Start/Restart PM2
# ==========================================
# Script para iniciar ou reiniciar o backend com PM2
# Com o cwd correto para encontrar .env e node_modules

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

echo ""
echo "🚀 PINOVARA - Start/Restart PM2"
echo "================================"
echo ""

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Execute este script no diretório raiz do projeto (/var/www/pinovara)"
    exit 1
fi

# Verificar se o build existe
if [ ! -f "backend/dist/server.js" ]; then
    print_error "Arquivo backend/dist/server.js não encontrado!"
    echo ""
    echo "O backend precisa ser compilado primeiro:"
    echo ""
    echo "  cd /var/www/pinovara/backend"
    echo "  npm install"
    echo "  npx prisma generate"
    echo "  npm run build"
    echo ""
    exit 1
fi

print_success "Build do backend encontrado"

# Parar processo existente (se houver)
print_status "Removendo processo PM2 anterior (se existir)..."
pm2 delete pinovara-backend 2>/dev/null || true

# Iniciar novo processo
print_status "Iniciando backend com PM2..."
pm2 start backend/dist/server.js \
    --name pinovara-backend \
    --cwd /var/www/pinovara/backend

if [ $? -eq 0 ]; then
    print_success "Backend iniciado com PM2"
else
    print_error "Erro ao iniciar backend"
    exit 1
fi

# Salvar configuração
print_status "Salvando configuração PM2..."
pm2 save

print_success "Configuração salva"

# Mostrar status
echo ""
print_status "Status do PM2:"
pm2 status

# Mostrar logs iniciais
echo ""
print_status "Logs do backend (últimas 20 linhas):"
pm2 logs pinovara-backend --lines 20 --nostream

echo ""
print_success "Backend rodando com PM2! 🚀"
echo ""
echo "📋 Comandos úteis:"
echo "  pm2 status                          # Ver status"
echo "  pm2 logs pinovara-backend          # Ver logs em tempo real"
echo "  pm2 restart pinovara-backend       # Reiniciar"
echo "  pm2 stop pinovara-backend          # Parar"
echo "  curl http://localhost:3001/health  # Testar health check"
echo ""
