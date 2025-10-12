#!/bin/bash

# ========== PINOVARA - UPGRADE NODE.JS ==========
# Script para atualizar Node.js no servidor de produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Funções de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - NODE.JS UPGRADE"
echo "========================================"
echo -e "${NC}"

# Verificar versão atual
log_info "Versão atual do Node.js: $(node --version)"
log_info "Versão atual do npm: $(npm --version)"

# Backup das versões atuais
NODE_CURRENT=$(node --version)
NPM_CURRENT=$(npm --version)

log_step "Fazendo backup das versões atuais..."
log_info "Node.js: ${NODE_CURRENT}"
log_info "npm: ${NPM_CURRENT}"

# Verificar se curl está instalado
if ! command -v curl &> /dev/null; then
    log_error "curl não está instalado. Instalando..."
    apt-get update && apt-get install -y curl
fi

# Remover versão anterior do Node.js
log_step "Removendo Node.js anterior..."
apt-get remove -y nodejs npm 2>/dev/null || true
apt-get autoremove -y 2>/dev/null || true

# Limpar cache do apt
apt-get clean && apt-get autoclean

# Instalar Node.js 20.x
log_step "Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalação
log_step "Verificando instalação..."
NEW_NODE_VERSION=$(node --version)
NEW_NPM_VERSION=$(npm --version)

log_success "Node.js atualizado: ${NODE_CURRENT} → ${NEW_NODE_VERSION}"
log_success "npm atualizado: ${NPM_CURRENT} → ${NEW_NPM_VERSION}"

# Verificar compatibilidade com Vite
if node -e "const v = process.version.match(/^v(\d+)/)[1]; process.exit(v >= 20 ? 0 : 1)"; then
    log_success "✅ Node.js ${NEW_NODE_VERSION} é compatível com Vite 7.x"
else
    log_warning "⚠️  Node.js ${NEW_NODE_VERSION} pode não ser totalmente compatível com Vite 7.x"
fi

log_success "Upgrade do Node.js concluído!"
log_info "Reinicie qualquer processo Node.js em execução para usar a nova versão."
