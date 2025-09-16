#!/bin/bash

# ==========================================
# PINOVARA - Alternador de Ambiente
# ==========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

echo "🌐 PINOVARA - Alternador de Ambiente"
echo "===================================="
echo ""

# Mostrar opções
echo "Escolha o ambiente:"
echo "1) Desenvolvimento (localhost)"
echo "2) Produção (pinovaraufba.com.br + IP 10.158.0.2)"
echo ""

read -p "Digite sua escolha (1 ou 2): " choice

case $choice in
    1)
        print_status "🔧 Configurando para DESENVOLVIMENTO..."

        # Configurar backend para desenvolvimento
        cat > backend/config.env << 'EOF'
# Ambiente
NODE_ENV="development"

# Database - Localhost para desenvolvimento
DATABASE_URL="postgresql://pinovara:pinovara@localhost:5432/pinovara?schema=pinovara"

# JWT Configuration
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001

# Frontend URL - Desenvolvimento
FRONTEND_URL="http://localhost:5173"
EOF

        print_success "Backend configurado para desenvolvimento"
        print_status "Para iniciar o desenvolvimento:"
        echo "  Backend: cd backend && npm run dev"
        echo "  Frontend: cd frontend && npm run dev"
        ;;

    2)
        print_status "🚀 Configurando para PRODUÇÃO..."

        # Configurar backend para produção
        cat > backend/config.env << 'EOF'
# Ambiente
NODE_ENV="production"

# Database - IP interno para produção
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"

# JWT Configuration
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001

# Frontend URL - Domínio de produção
FRONTEND_URL="https://pinovaraufba.com.br"
EOF

        print_success "Backend configurado para produção"
        print_status "Para deploy em produção:"
        echo "  ./deploy-without-git.sh"
        echo "  ./deploy-direct.sh"
        ;;

    *)
        print_error "Opção inválida. Use 1 para desenvolvimento ou 2 para produção."
        exit 1
        ;;
esac

print_success "Configuração alterada com sucesso!"
echo ""
echo "📋 Configuração atual:"
echo "  Ambiente: $(grep 'NODE_ENV' backend/config.env | cut -d'"' -f2)"
echo "  Database: $(grep 'DATABASE_URL' backend/config.env | cut -d'@' -f2 | cut -d':' -f1)"
echo "  Frontend: $(grep 'FRONTEND_URL' backend/config.env | cut -d'"' -f2)"
