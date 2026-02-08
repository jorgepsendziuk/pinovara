#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Deploy via Git (Super Fácil)
# ==========================================
# 1. Commit e push para GitHub
# 2. Conecta no servidor e faz pull + deploy

set -e

# Configurações
SERVER_USER="pinovara"
SERVER_HOST="45.79.206.134"
SERVER_PATH="/var/www/pinovara"
SERVER_SSH="$SERVER_USER@$SERVER_HOST"

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
echo "🚀 PINOVARA - Deploy via Git"
echo "============================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -d ".git" ]; then
    print_error "Execute este script no diretório raiz do projeto"
    exit 1
fi

# 1. Verificar status do git
print_status "📋 Verificando mudanças..."
if [ -z "$(git status --porcelain)" ]; then
    print_warning "Não há mudanças para commitar"
    echo ""
    read -p "Deseja fazer deploy mesmo assim? (s/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_error "Deploy cancelado"
        exit 1
    fi
else
    # 2. Adicionar todas as mudanças
    print_status "📝 Adicionando mudanças..."
    git add .
    
    # 3. Criar commit
    print_status "💾 Criando commit..."
    read -p "Mensagem do commit (ou Enter para usar padrão): " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    git commit -m "$COMMIT_MSG" || true
    print_success "Commit criado: $COMMIT_MSG"
    
    # 4. Push para GitHub
    print_status "⬆️ Enviando para GitHub..."
    git push origin main
    print_success "Código enviado para GitHub"
fi

# 5. Conectar no servidor e fazer deploy
print_status "🌐 Conectando no servidor remoto..."
print_status "🔄 Executando deploy no servidor..."

ssh $SERVER_SSH "bash -s" << 'ENDSSH'
    # Cores
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    YELLOW='\033[1;33m'
    NC='\033[0m'
    
    echo -e "${BLUE}[INFO]${NC} Iniciando deploy no servidor..."
    
    cd /var/www/pinovara
    
    # Pull do GitHub
    echo -e "${BLUE}[INFO]${NC} Baixando código do GitHub..."
    git pull origin main
    
    # Build Backend
    echo -e "${BLUE}[INFO]${NC} Building backend..."
    cd backend
    npm install --production=false
    npm run build
    cd ..
    
    # Build Frontend
    echo -e "${BLUE}[INFO]${NC} Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    # Copiar frontend para nginx
    echo -e "${BLUE}[INFO]${NC} Copiando frontend para nginx..."
    sudo cp -r frontend/dist/* /var/www/html/
    
    # Reiniciar serviços
    echo -e "${BLUE}[INFO]${NC} Reiniciando serviços..."
    pm2 restart pinovara-backend
    sudo systemctl reload nginx
    
    # Status
    echo ""
    echo -e "${GREEN}[✓]${NC} Deploy concluído no servidor!"
    echo ""
    echo "📊 Status PM2:"
    pm2 status
    
    echo ""
    echo "📊 Status Nginx:"
    sudo systemctl status nginx --no-pager | head -3
ENDSSH

if [ $? -eq 0 ]; then
    print_success "Deploy concluído com sucesso!"
    
    # Testar site
    print_status "🧪 Testando site..."
    sleep 2
    
    if curl -s -o /dev/null -w "%{http_code}" https://pinovaraufba.com.br | grep -q "200"; then
        print_success "Site funcionando! ✨"
    else
        print_warning "Site pode estar com problemas"
    fi
    
    echo ""
    echo "🎉 Tudo pronto!"
    echo ""
    echo "🌐 https://pinovaraufba.com.br"
    echo ""
else
    print_error "Erro no deploy remoto"
    exit 1
fi
