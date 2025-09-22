#!/bin/bash

# ========== UNIFIED ENVIRONMENT ==========
# Agora que o banco está acessível externamente, 
# vamos unificar tudo para usar o mesmo banco remoto

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - UNIFIED ENVIRONMENT"
echo "========================================"
echo -e "${NC}"

log_info "🌐 Agora que seu banco está acessível externamente..."
log_info "🎯 Vamos simplificar tudo para usar o MESMO banco!"

# Verificar se estamos na raiz
if [ ! -f "package.json" ]; then
    echo "Execute na raiz do projeto!"
    exit 1
fi

echo ""
log_warning "⚠️  Você precisa configurar suas credenciais reais:"
echo ""

# Solicitar credenciais
read -p "🏠 IP do seu servidor PostgreSQL: " DB_HOST
read -p "👤 Usuário do PostgreSQL (padrão: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}
read -p "🗄️ Nome do banco (padrão: postgres): " DB_NAME  
DB_NAME=${DB_NAME:-postgres}
echo -n "🔐 Senha do PostgreSQL: "
read -s DB_PASS
echo ""

DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/$DB_NAME?schema=pinovara"

echo ""
log_info "🧪 Testando conexão..."

# Testar conectividade básica
if timeout 5 bash -c "</dev/tcp/$DB_HOST/5432" 2>/dev/null; then
    log_success "✅ PostgreSQL acessível em $DB_HOST:5432"
else
    log_warning "❌ Não foi possível conectar em $DB_HOST:5432"
    echo "Verifique: IP, firewall, configuração PostgreSQL"
    exit 1
fi

# Configurar todos os ambientes
log_info "🔄 Configurando todos os ambientes..."

# 1. Backend - Ambiente local (desenvolvimento)
cat > backend/.env.local-db << EOF
# ========== DESENVOLVIMENTO LOCAL COM BANCO REMOTO ==========
NODE_ENV=development
PORT=3001
DATABASE_URL="$DATABASE_URL"
JWT_SECRET=local_dev_jwt_secret_key_minimum_32_characters
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
EOF

# 2. Backend - Ambiente remoto
cat > backend/.env.remote-db << EOF
# ========== DESENVOLVIMENTO COM BANCO REMOTO ==========  
NODE_ENV=development
PORT=3001
DATABASE_URL="$DATABASE_URL"
JWT_SECRET=remote_dev_jwt_secret_key_minimum_32_characters
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
EOF

# 3. Backend - Produção
cat > backend/.env.production << EOF
# ========== PRODUÇÃO ==========
NODE_ENV=production
PORT=3001
DATABASE_URL="$DATABASE_URL"
JWT_SECRET=production_jwt_secret_change_this_in_production_minimum_32_chars
FRONTEND_URL=https://pinovaraufba.com.br
LOG_LEVEL=info
EOF

# 4. Usar ambiente local por padrão
cp backend/.env.local-db backend/.env

# 5. Frontend - manter configurações flexíveis
log_success "✅ Ambientes configurados!"

echo ""
echo -e "${GREEN}🎉 CONFIGURAÇÃO UNIFICADA COMPLETA!${NC}"
echo ""
echo -e "${BLUE}Agora todos os ambientes usam o MESMO banco:${NC}"
echo "  🏠 Local dev → Banco remoto ($DB_HOST)"
echo "  🌐 Produção → Banco remoto ($DB_HOST)"
echo "  👥 Múltiplos devs → Banco remoto ($DB_HOST)"
echo ""

echo -e "${GREEN}✨ BENEFÍCIOS:${NC}"
echo "  ✅ Dados sempre sincronizados"
echo "  ✅ Backup centralizado"
echo "  ✅ Múltiplos desenvolvedores"
echo "  ✅ Sem duplicação de dados"
echo ""

echo -e "${YELLOW}🚀 Para usar:${NC}"
echo "  npm run dev:start        # Desenvolvimento local"
echo "  npm run env:status       # Ver configuração" 
echo "  npm run test:db -- -h $DB_HOST -u $DB_USER  # Testar banco"
echo ""

echo -e "${BLUE}📋 Scripts de deploy mantidos:${NC}"
echo "  ./scripts/build/build-production.sh     # Build produção"
echo "  ./scripts/deploy/deploy-server.sh       # Deploy servidor"
echo ""

log_success "🎉 Ambiente unificado configurado com sucesso!"