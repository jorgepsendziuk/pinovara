#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Deploy via FTP
# ==========================================
# Script para fazer deploy usando FTP

set -e

# Configurações FTP
FTP_HOST="45.79.206.134"
FTP_USER="pinovara"
FTP_REMOTE_PATH="/var/www/pinovara"

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
echo "🚀 PINOVARA - Deploy via FTP"
echo "============================="
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

# 2. Criar arquivo de builds
print_status "📦 Preparando pacote para upload..."

# Criar diretório temporário
TEMP_DIR="deploy-temp-$(date +%Y%m%d-%H%M%S)"
mkdir -p $TEMP_DIR

# Copiar builds
cp -r backend/dist $TEMP_DIR/backend-dist
cp -r frontend/dist $TEMP_DIR/frontend-dist

# Criar arquivo tar
TAR_FILE="deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf $TAR_FILE -C $TEMP_DIR .
rm -rf $TEMP_DIR

print_success "Pacote criado: $TAR_FILE ($(du -h $TAR_FILE | cut -f1))"

echo ""
print_status "📤 Pronto para upload via FTP!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 INSTRUÇÕES PARA UPLOAD VIA FTP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  CONECTAR NO SERVIDOR VIA FTP:"
echo "   Host: $FTP_HOST"
echo "   Usuário: $FTP_USER"
echo "   Caminho remoto: $FTP_REMOTE_PATH"
echo ""
echo "2️⃣  FAZER UPLOAD DO ARQUIVO:"
echo "   Arquivo: $TAR_FILE"
echo "   Destino: $FTP_REMOTE_PATH/"
echo ""
echo "3️⃣  APÓS O UPLOAD, CONECTAR VIA SSH E EXECUTAR:"
echo "   ssh $FTP_USER@$FTP_HOST"
echo "   cd $FTP_REMOTE_PATH"
echo "   tar -xzf $TAR_FILE"
echo "   rm -rf backend/dist frontend/dist"
echo "   mv backend-dist backend/dist"
echo "   mv frontend-dist frontend/dist"
echo "   sudo cp -r frontend/dist/* /var/www/html/"
echo "   bash scripts/deploy/start-pm2.sh"
echo "   sudo systemctl reload nginx"
echo "   rm $TAR_FILE"
echo ""
echo "   ⚠️  Se PM2 não subir, pode precisar fazer build no servidor:"
echo "   cd backend && npm install && npx prisma generate && npm run build"
echo "   cd .. && bash scripts/deploy/start-pm2.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Opção de usar lftp se disponível
if command -v lftp &> /dev/null; then
    echo ""
    read -p "Deseja fazer upload automático via LFTP? (s/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_status "📤 Fazendo upload via LFTP..."
        
        read -s -p "Digite a senha FTP: " FTP_PASS
        echo ""
        
        lftp -u "$FTP_USER,$FTP_PASS" "$FTP_HOST" << EOF
cd $FTP_REMOTE_PATH
put $TAR_FILE
bye
EOF
        
        if [ $? -eq 0 ]; then
            print_success "Upload concluído!"
            
            echo ""
            print_status "🔄 Executando comandos no servidor..."
            
            ssh $FTP_USER@$FTP_HOST << ENDSSH
cd $FTP_REMOTE_PATH
tar -xzf $TAR_FILE
rm -rf backend/dist frontend/dist
mv backend-dist backend/dist
mv frontend-dist frontend/dist
sudo cp -r frontend/dist/* /var/www/html/

# Verificar se precisa fazer build
if [ ! -f "backend/dist/server.js" ]; then
    echo "⚠️  Build não encontrado, gerando no servidor..."
    cd backend
    npm install
    npx prisma generate
    npm run build
    cd ..
fi

# Iniciar PM2
bash scripts/deploy/start-pm2.sh
sudo systemctl reload nginx
rm $TAR_FILE
echo "✓ Deploy concluído!"
pm2 status
ENDSSH
            
            print_success "Deploy via FTP concluído! 🚀"
        else
            print_error "Erro no upload"
            exit 1
        fi
    fi
else
    print_warning "LFTP não está instalado. Faça o upload manualmente."
    echo "Para instalar LFTP:"
    echo "  macOS: brew install lftp"
    echo "  Linux: apt-get install lftp ou yum install lftp"
fi

echo ""
print_success "Arquivo pronto: $TAR_FILE"
