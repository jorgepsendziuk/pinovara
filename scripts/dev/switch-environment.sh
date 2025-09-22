#!/bin/bash

# ========== SWITCH ENVIRONMENT ==========
# Script para alternar entre backend local e remoto

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Função de ajuda
show_help() {
    echo -e "${BLUE}PINOVARA Environment Switcher${NC}"
    echo ""
    echo "Uso: $0 [ambiente]"
    echo ""
    echo "Ambientes:"
    echo "  local       Frontend → Backend local + Banco local"
    echo "  remote      Frontend → Backend remoto + Banco remoto"
    echo "  mixed       Frontend → Backend remoto + Backend local com banco remoto"
    echo "  status      Mostrar configuração atual"
    echo ""
    echo "Exemplos:"
    echo "  $0 local     # Usar backend local"
    echo "  $0 remote    # Usar backend remoto"
    echo "  $0 status    # Ver configuração atual"
}

# Função para mostrar status atual
show_status() {
    echo ""
    log_info "📊 Configuração atual do FRONTEND:"
    
    if [ -f "frontend/.env" ]; then
        echo ""
        echo -e "${YELLOW}Configuração ativa:${NC}"
        grep "VITE_API_URL" frontend/.env | head -1
        echo ""
        
        API_URL=$(grep "VITE_API_URL=" frontend/.env | head -1 | cut -d'=' -f2)
        
        if [[ "$API_URL" == *"localhost"* ]]; then
            echo -e "Frontend → ${GREEN}BACKEND LOCAL${NC}"
        else
            echo -e "Frontend → ${BLUE}BACKEND REMOTO${NC}"
        fi
    else
        log_error "Arquivo frontend/.env não encontrado!"
    fi
    
    echo ""
    log_info "🔧 Configuração atual do BACKEND:"
    
    if [ -f "backend/.env" ]; then
        echo ""
        echo -e "${YELLOW}Configuração ativa:${NC}"
        grep "DATABASE_URL" backend/.env | head -1 | sed 's/postgresql:\/\/[^@]*@/postgresql:\/\/***:***@/'
        echo ""
        
        DB_URL=$(grep "DATABASE_URL=" backend/.env | head -1 | cut -d'=' -f2)
        
        if [[ "$DB_URL" == *"localhost"* ]]; then
            echo -e "Backend → ${GREEN}BANCO LOCAL${NC}"
        else
            echo -e "Backend → ${BLUE}BANCO REMOTO${NC}"
        fi
    else
        log_warning "Arquivo backend/.env não encontrado!"
    fi
    
    echo ""
    log_info "📋 Arquivos disponíveis:"
    echo "Frontend:"
    ls -la frontend/.env* 2>/dev/null | grep -E "\\.env" || echo "  Nenhum arquivo .env encontrado"
    echo "Backend:" 
    ls -la backend/.env* 2>/dev/null | grep -E "\\.env" || echo "  Nenhum arquivo .env encontrado"
}

# Função para trocar para ambiente local
switch_to_local() {
    log_info "🔄 Alternando para ambiente LOCAL COMPLETO..."
    
    # Configurar frontend
    if [ -f "frontend/.env.local" ]; then
        cp frontend/.env.local frontend/.env
        log_success "✅ Frontend configurado para BACKEND LOCAL"
    else
        log_error "Arquivo frontend/.env.local não encontrado!"
        return 1
    fi
    
    # Configurar backend
    if [ -f "backend/.env.local-db" ]; then
        cp backend/.env.local-db backend/.env
        log_success "✅ Backend configurado para BANCO LOCAL"
    else
        log_error "Arquivo backend/.env.local-db não encontrado!"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}Configuração LOCAL ativa:${NC}"
    echo "  Frontend → Backend local (localhost:3001)"
    echo "  Backend → Banco local (localhost:5432)"
    echo ""
    echo -e "${YELLOW}Para iniciar o ambiente:${NC}"
    echo "   npm run dev:start"
}

# Função para trocar para ambiente remoto
switch_to_remote() {
    log_info "🔄 Alternando para ambiente REMOTO COMPLETO..."
    
    # Configurar frontend
    if [ -f "frontend/.env.remote" ]; then
        cp frontend/.env.remote frontend/.env
        log_success "✅ Frontend configurado para BACKEND REMOTO"
    else
        log_error "Arquivo frontend/.env.remote não encontrado!"
        return 1
    fi
    
    echo ""
    echo -e "${BLUE}Configuração REMOTA ativa:${NC}"
    echo "  Frontend → Backend remoto (pinovaraufba.com.br)"
    echo "  Backend → Executando no servidor (banco remoto)"
    echo ""
    echo -e "${YELLOW}Testando conectividade com servidor remoto...${NC}"
    
    if curl -s --connect-timeout 5 https://pinovaraufba.com.br/health > /dev/null; then
        log_success "🌐 Servidor remoto está acessível"
    else
        log_warning "⚠️  Servidor remoto pode não estar disponível"
        echo "   Verifique se o servidor está online"
    fi
    
    echo ""
    echo -e "${GREEN}Frontend pode ser usado normalmente!${NC}"
    echo "   npm run dev  # Apenas frontend"
}

# Função para trocar para ambiente misto (dev local com banco remoto)
switch_to_mixed() {
    log_info "🔄 Alternando para ambiente MISTO..."
    log_warning "⚠️  Backend local irá conectar no banco remoto!"
    
    # Configurar frontend para local
    if [ -f "frontend/.env.local" ]; then
        cp frontend/.env.local frontend/.env
        log_success "✅ Frontend configurado para BACKEND LOCAL"
    else
        log_error "Arquivo frontend/.env.local não encontrado!"
        return 1
    fi
    
    # Configurar backend para banco remoto
    if [ -f "backend/.env.remote-db" ]; then
        cp backend/.env.remote-db backend/.env
        log_success "✅ Backend configurado para BANCO REMOTO"
    else
        log_error "Arquivo backend/.env.remote-db não encontrado!"
        echo ""
        log_info "💡 Você precisa criar backend/.env.remote-db com:"
        echo "DATABASE_URL=\"postgresql://user:pass@REMOTE_IP:5432/db?schema=pinovara\""
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}Configuração MISTA ativa:${NC}"
    echo "  Frontend → Backend local (localhost:3001)"
    echo "  Backend local → Banco remoto"
    echo ""
    echo -e "${RED}⚠️  ATENÇÃO:${NC}"
    echo "  - O banco remoto deve estar acessível externamente"
    echo "  - Configure as credenciais em backend/.env.remote-db"
    echo "  - Verifique firewall e pg_hba.conf no servidor do banco"
    echo ""
    echo -e "${YELLOW}Para iniciar:${NC}"
    echo "   npm run dev:start"
}

# Banner
echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - ENVIRONMENT SWITCHER"
echo "========================================"
echo -e "${NC}"

# Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ]; then
    log_error "Execute este script na raiz do projeto!"
    exit 1
fi

# Processar argumentos
case "${1:-status}" in
    local|l)
        switch_to_local
        echo ""
        show_status
        ;;
    remote|r)
        switch_to_remote
        echo ""
        show_status
        ;;
    mixed|m)
        switch_to_mixed
        echo ""
        show_status
        ;;
    status|s)
        show_status
        ;;
    help|-h|--help)
        show_help
        exit 0
        ;;
    *)
        log_error "Ambiente inválido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✨ Troca de ambiente concluída!${NC}"
echo -e "${YELLOW}💡 Dica:${NC} Reinicie o frontend se estiver rodando:"
echo "   npm run dev:stop && npm run dev:start"