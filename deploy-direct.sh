#!/bin/bash

# 🚀 PINOVARA - Deploy Direto
# Script para fazer deploy direto no servidor

set -e

echo "🚀 PINOVARA - Deploy Direto"
echo "==========================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

# Verificar se o pacote de deploy existe
if [ ! -d "deploy-package" ]; then
    print_error "Pacote de deploy não encontrado. Execute primeiro: ./deploy-without-git.sh"
    exit 1
fi

# Solicitar informações do servidor
echo "📋 Configuração do Servidor:"
read -p "Host do servidor (ex: pinovaraufba.com.br): " SERVER_HOST
read -p "Usuário SSH (ex: root): " SERVER_USER
read -p "Porta SSH (padrão 22): " SERVER_PORT
SERVER_PORT=${SERVER_PORT:-22}

echo ""
print_status "Fazendo deploy para: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"

# 1. Copiar pacote para o servidor
print_status "📤 Copiando pacote para o servidor..."
scp -P $SERVER_PORT -r deploy-package/ $SERVER_USER@$SERVER_HOST:/tmp/

if [ $? -eq 0 ]; then
    print_success "Pacote copiado com sucesso"
else
    print_error "Falha ao copiar pacote para o servidor"
    exit 1
fi

# 2. Executar instalação no servidor
print_status "🔧 Executando instalação no servidor..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd /tmp/deploy-package && chmod +x install.sh && ./install.sh"

if [ $? -eq 0 ]; then
    print_success "Instalação concluída no servidor"
else
    print_error "Falha na instalação no servidor"
    exit 1
fi

# 3. Verificar status do servidor
print_status "🔍 Verificando status do servidor..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "pm2 list && sudo systemctl status nginx --no-pager"

print_success "Deploy concluído com sucesso!"
echo ""
echo "🌐 Acesse o site em: http://$SERVER_HOST"
echo "🔍 Para verificar logs: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs pinovara-backend'"
