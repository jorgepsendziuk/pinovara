#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Deploy Remoto Fácil
# ==========================================
# Script simplificado para fazer deploy no servidor remoto
# Usa rsync para enviar builds e executa comandos no servidor

set -e

# Configurações do servidor
SERVER_USER="pinovara"
SERVER_HOST="45.79.206.134"
SERVER_PATH="/var/www/pinovara"
SERVER_SSH="$SERVER_USER@$SERVER_HOST"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo ""
echo "🚀 PINOVARA - Deploy Remoto Fácil"
echo "=================================="
echo ""
echo "🌐 Servidor: $SERVER_HOST"
echo "👤 Usuário: $SERVER_USER"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

# 1. Fazer builds localmente
print_status "🔨 Fazendo builds localmente..."

# Build Backend
print_status "Building backend..."
cd backend
npm run build
if [ ! -d "dist" ]; then
    print_error "Build do backend falhou"
    exit 1
fi
print_success "Backend build OK"

# Build Frontend
print_status "Building frontend..."
cd ../frontend
npm run build
if [ ! -d "dist" ]; then
    print_error "Build do frontend falhou"
    exit 1
fi
print_success "Frontend build OK"
cd ..

print_success "Builds concluídos localmente"

# 2. Testar conexão com servidor
print_status "🔌 Testando conexão com servidor..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER_SSH "echo ''" 2>/dev/null; then
    print_success "Conexão com servidor OK"
else
    print_error "Não foi possível conectar ao servidor"
    print_warning "Verifique se você tem acesso SSH configurado"
    exit 1
fi

# 3. Criar backup remoto
print_status "💾 Criando backup no servidor..."
ssh $SERVER_SSH "mkdir -p $SERVER_PATH/backups && \
    if [ -d $SERVER_PATH/backend/dist ]; then \
        tar -czf $SERVER_PATH/backups/backup-\$(date +%Y%m%d-%H%M%S).tar.gz \
        $SERVER_PATH/backend/dist $SERVER_PATH/frontend/dist 2>/dev/null || true; \
    fi"
print_success "Backup criado"

# 4. Enviar backend para servidor
print_status "📤 Enviando backend para servidor..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.env*' \
    --exclude 'prisma-client-extracted' \
    backend/dist/ $SERVER_SSH:$SERVER_PATH/backend/dist/
print_success "Backend enviado"

# 5. Enviar frontend para servidor
print_status "📤 Enviando frontend para servidor..."
rsync -avz --delete \
    frontend/dist/ $SERVER_SSH:$SERVER_PATH/frontend/dist/
print_success "Frontend enviado"

# 6. Copiar frontend para nginx e reiniciar serviços
print_status "🔄 Atualizando servidor remoto..."
ssh $SERVER_SSH "cd $SERVER_PATH && \
    echo '📋 Copiando frontend para nginx...' && \
    sudo cp -r frontend/dist/* /var/www/html/ && \
    echo '✓ Frontend copiado' && \
    echo '🔄 Reiniciando backend...' && \
    pm2 restart pinovara-backend && \
    echo '✓ Backend reiniciado' && \
    echo '🔄 Recarregando nginx...' && \
    sudo systemctl reload nginx && \
    echo '✓ Nginx recarregado' && \
    echo '' && \
    echo '📊 Status dos serviços:' && \
    pm2 status && \
    echo '' && \
    sudo systemctl status nginx --no-pager | head -5"

if [ $? -eq 0 ]; then
    print_success "Servidor atualizado com sucesso"
else
    print_error "Erro ao atualizar servidor"
    exit 1
fi

# 7. Testar se o site está funcionando
print_status "🧪 Testando site..."
sleep 3

if curl -s -o /dev/null -w "%{http_code}" https://pinovaraufba.com.br | grep -q "200"; then
    print_success "Site funcionando (HTTP 200)"
else
    print_warning "Site pode não estar respondendo corretamente"
fi

# 8. Resumo final
echo ""
echo "🎉 Deploy concluído com sucesso!"
echo "================================"
echo ""
echo "🌐 Site: https://pinovaraufba.com.br"
echo "🔧 API: https://pinovaraufba.com.br/api/"
echo "❤️ Health: https://pinovaraufba.com.br/health"
echo ""
echo "📋 Comandos úteis para o servidor:"
echo "   ssh $SERVER_SSH"
echo "   pm2 logs pinovara-backend"
echo "   pm2 status"
echo "   sudo systemctl status nginx"
echo ""
echo "🔍 Ver logs remotos:"
echo "   ssh $SERVER_SSH 'pm2 logs pinovara-backend --lines 50'"
echo "   ssh $SERVER_SSH 'sudo tail -f /var/log/nginx/pinovaraufba_error.log'"
echo ""

print_success "Deploy remoto concluído! 🚀"
