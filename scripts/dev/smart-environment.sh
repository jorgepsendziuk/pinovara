#!/bin/bash

# ========== SMART ENVIRONMENT SWITCHER ==========
# Script inteligente que detecta automaticamente a melhor configuração

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

# Configurações do banco remoto (ajustar com suas credenciais)
REMOTE_DB_HOST="SEU_IP_AQUI"  # Substitua pelo IP real
REMOTE_DB_USER="postgres"
REMOTE_DB_PASS="SUA_SENHA_AQUI"  # Substitua pela senha real
REMOTE_DB_NAME="postgres"

# Função para testar conectividade com banco
test_db_connection() {
    local host=$1
    local port=$2
    local timeout=5
    
    if timeout $timeout bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Função para detectar melhor configuração
detect_best_config() {
    log_info "🔍 Detectando melhor configuração..."
    
    # Testar banco local
    LOCAL_DB_AVAILABLE=false
    if test_db_connection "localhost" "5432"; then
        log_info "✅ Banco local detectado (localhost:5432)"
        LOCAL_DB_AVAILABLE=true
    else
        log_info "❌ Banco local não disponível"
    fi
    
    # Testar banco remoto
    REMOTE_DB_AVAILABLE=false
    if [ "$REMOTE_DB_HOST" != "SEU_IP_AQUI" ] && test_db_connection "$REMOTE_DB_HOST" "5432"; then
        log_info "✅ Banco remoto detectado ($REMOTE_DB_HOST:5432)"
        REMOTE_DB_AVAILABLE=true
    else
        log_info "❌ Banco remoto não configurado ou não disponível"
    fi
    
    # Decidir configuração
    if [ "$REMOTE_DB_AVAILABLE" = true ]; then
        echo "remote"
    elif [ "$LOCAL_DB_AVAILABLE" = true ]; then
        echo "local"
    else
        echo "none"
    fi
}

# Função para configurar ambiente baseado na detecção
configure_smart_env() {
    local config_type=$1
    
    case $config_type in
        "remote")
            log_info "🌐 Configurando para BANCO REMOTO..."
            
            # Frontend sempre local para desenvolvimento
            cp frontend/.env.local frontend/.env
            
            # Backend apontando para banco remoto
            cat > backend/.env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://$REMOTE_DB_USER:$REMOTE_DB_PASS@$REMOTE_DB_HOST:5432/$REMOTE_DB_NAME?schema=pinovara"
JWT_SECRET=dev_jwt_secret_key_for_smart_env_minimum_32_chars
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
EOF
            
            log_success "✅ Configuração SMART aplicada:"
            echo "  Frontend → Backend local (localhost:3001)"
            echo "  Backend → Banco remoto ($REMOTE_DB_HOST:5432)"
            echo ""
            echo -e "${GREEN}🎉 Dados centralizados e sempre sincronizados!${NC}"
            ;;
            
        "local")
            log_info "🏠 Configurando para BANCO LOCAL..."
            
            # Frontend local
            cp frontend/.env.local frontend/.env
            
            # Backend local
            cp backend/.env.local-db backend/.env
            
            log_success "✅ Configuração LOCAL aplicada:"
            echo "  Frontend → Backend local (localhost:3001)"
            echo "  Backend → Banco local (localhost:5432)"
            ;;
            
        "none")
            log_error "❌ Nenhum banco disponível!"
            echo ""
            echo -e "${YELLOW}Opções:${NC}"
            echo "1. Instalar PostgreSQL local: sudo apt install postgresql"
            echo "2. Configurar credenciais remotas neste script"
            echo "3. Verificar conectividade de rede"
            exit 1
            ;;
    esac
}

# Função para configurar credenciais remotas
setup_remote_credentials() {
    log_info "🔧 Configuração de credenciais remotas..."
    
    echo ""
    echo -e "${YELLOW}Configure as credenciais do banco remoto:${NC}"
    echo ""
    
    read -p "IP do servidor PostgreSQL: " new_host
    read -p "Usuário (padrão: postgres): " new_user
    new_user=${new_user:-postgres}
    read -p "Nome do banco (padrão: postgres): " new_db
    new_db=${new_db:-postgres}
    echo -n "Senha: "
    read -s new_pass
    echo ""
    
    # Atualizar variáveis
    REMOTE_DB_HOST="$new_host"
    REMOTE_DB_USER="$new_user"
    REMOTE_DB_PASS="$new_pass"
    REMOTE_DB_NAME="$new_db"
    
    # Testar conexão
    echo ""
    log_info "🧪 Testando conexão..."
    
    if test_db_connection "$REMOTE_DB_HOST" "5432"; then
        log_success "✅ Conectividade OK!"
        
        # Salvar configuração
        sed -i "s/REMOTE_DB_HOST=\"SEU_IP_AQUI\"/REMOTE_DB_HOST=\"$new_host\"/" "$0"
        sed -i "s/REMOTE_DB_USER=\"postgres\"/REMOTE_DB_USER=\"$new_user\"/" "$0"
        sed -i "s/REMOTE_DB_PASS=\"SUA_SENHA_AQUI\"/REMOTE_DB_PASS=\"$new_pass\"/" "$0"
        sed -i "s/REMOTE_DB_NAME=\"postgres\"/REMOTE_DB_NAME=\"$new_db\"/" "$0"
        
        log_success "Credenciais salvas no script!"
    else
        log_error "❌ Não foi possível conectar"
        echo "Verifique: IP, porta, firewall, configuração PostgreSQL"
        exit 1
    fi
}

# Função para mostrar status
show_smart_status() {
    log_info "📊 STATUS INTELIGENTE:"
    echo ""
    
    # Status atual
    if [ -f "frontend/.env" ] && [ -f "backend/.env" ]; then
        FRONTEND_API=$(grep "VITE_API_URL" frontend/.env | cut -d'=' -f2)
        BACKEND_DB=$(grep "DATABASE_URL" backend/.env | cut -d'=' -f2 | sed 's/postgresql:\/\/[^@]*@/postgresql:\/\/***:***@/')
        
        echo -e "${GREEN}Configuração atual:${NC}"
        echo "  Frontend: $FRONTEND_API"
        echo "  Backend: $BACKEND_DB"
    else
        echo -e "${YELLOW}Nenhuma configuração ativa${NC}"
    fi
    
    echo ""
    log_info "🔍 Detecção automática:"
    
    # Banco local
    if test_db_connection "localhost" "5432"; then
        echo -e "  Banco local: ${GREEN}✅ Disponível${NC}"
    else
        echo -e "  Banco local: ${RED}❌ Indisponível${NC}"
    fi
    
    # Banco remoto
    if [ "$REMOTE_DB_HOST" != "SEU_IP_AQUI" ] && test_db_connection "$REMOTE_DB_HOST" "5432"; then
        echo -e "  Banco remoto ($REMOTE_DB_HOST): ${GREEN}✅ Disponível${NC}"
    else
        echo -e "  Banco remoto: ${YELLOW}⚠️  Não configurado ou indisponível${NC}"
    fi
}

# Banner
echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - SMART ENVIRONMENT"
echo "========================================"
echo -e "${NC}"

# Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ]; then
    log_error "Execute este script na raiz do projeto!"
    exit 1
fi

# Processar argumentos
case "${1:-auto}" in
    auto|smart)
        BEST_CONFIG=$(detect_best_config)
        configure_smart_env "$BEST_CONFIG"
        echo ""
        show_smart_status
        ;;
    setup|config)
        setup_remote_credentials
        echo ""
        log_info "Executando configuração automática..."
        BEST_CONFIG=$(detect_best_config)
        configure_smart_env "$BEST_CONFIG"
        ;;
    status|s)
        show_smart_status
        ;;
    help|-h|--help)
        echo "Smart Environment - Configuração automática"
        echo ""
        echo "Comandos:"
        echo "  auto     Detectar e configurar automaticamente (padrão)"
        echo "  setup    Configurar credenciais remotas"
        echo "  status   Mostrar status atual"
        echo ""
        ;;
    *)
        log_error "Comando inválido: $1"
        echo "Use: $0 help"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🧠 Smart Environment configurado!${NC}"
echo -e "${YELLOW}💡 Para iniciar:${NC} npm run dev:start"