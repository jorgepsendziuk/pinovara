#!/bin/bash

# ========== PINOVARA DEPLOYMENT SCRIPT ==========
# Script para deploy robusto com rollback automático

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configurações globais
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/pinovara/backups"
DEPLOY_DIR="/var/pinovara/current"
RELEASES_DIR="/var/pinovara/releases"
SHARED_DIR="/var/pinovara/shared"

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

# Função de ajuda
show_help() {
    echo -e "${BLUE}PINOVARA Deployment Script${NC}"
    echo ""
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  --environment, -e    Environment (production, staging)"
    echo "  --version, -v        Version to deploy"
    echo "  --rollback          Rollback to previous version"
    echo "  --dry-run           Show what would be done without executing"
    echo "  --force             Force deployment even with warnings"
    echo "  --help, -h          Show this help"
    echo ""
    echo "Exemplos:"
    echo "  $0 -e production -v 2.1.0"
    echo "  $0 --environment staging --version latest"
    echo "  $0 --rollback --environment production"
}

# Função para verificar requisitos
check_requirements() {
    log_step "Verificando requisitos do sistema..."
    
    # Verificar se é root ou sudo
    if [[ $EUID -ne 0 ]] && ! groups $USER | grep -q sudo; then
        log_error "Este script precisa de privilégios sudo"
        exit 1
    fi
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker não encontrado! Instale o Docker primeiro."
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não encontrado!"
        exit 1
    fi
    
    # Verificar conectividade de rede
    if ! ping -c 1 google.com &> /dev/null; then
        log_warning "Conectividade de rede limitada"
    fi
    
    log_success "Todos os requisitos verificados"
}

# Função para criar diretórios necessários
setup_directories() {
    log_step "Configurando estrutura de diretórios..."
    
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "$RELEASES_DIR"
    sudo mkdir -p "$SHARED_DIR"
    sudo mkdir -p "$SHARED_DIR/logs"
    sudo mkdir -p "$SHARED_DIR/uploads"
    sudo mkdir -p "$SHARED_DIR/ssl"
    
    # Garantir permissões corretas
    sudo chown -R $USER:$USER /var/pinovara
    sudo chmod 755 /var/pinovara
    
    log_success "Estrutura de diretórios criada"
}

# Função para backup da versão atual
create_backup() {
    log_step "Criando backup da versão atual..."
    
    if [ -L "$DEPLOY_DIR" ] && [ -d "$(readlink "$DEPLOY_DIR")" ]; then
        CURRENT_RELEASE=$(basename "$(readlink "$DEPLOY_DIR")")
        BACKUP_NAME="backup_${CURRENT_RELEASE}_${TIMESTAMP}"
        BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
        
        log_info "Criando backup: $BACKUP_NAME"
        sudo cp -rL "$DEPLOY_DIR" "$BACKUP_PATH"
        
        # Manter apenas os 5 backups mais recentes
        cd "$BACKUP_DIR"
        sudo ls -t | tail -n +6 | xargs -r sudo rm -rf
        
        echo "$BACKUP_NAME" > /tmp/pinovara_backup_name
        log_success "Backup criado: $BACKUP_PATH"
    else
        log_info "Nenhuma versão atual encontrada para backup"
    fi
}

# Função para download da release
download_release() {
    local version=$1
    local release_dir="$RELEASES_DIR/release_${version}_${TIMESTAMP}"
    
    log_step "Fazendo download da versão $version..."
    
    mkdir -p "$release_dir"
    cd "$release_dir"
    
    if [[ "$version" == "latest" || "$version" == *"main"* ]]; then
        # Download da versão mais recente do GitHub
        log_info "Baixando versão mais recente..."
        
        # Simular download (em produção seria do registry/GitHub)
        if [ -d "$PROJECT_ROOT/production-build" ]; then
            log_info "Copiando build local para teste..."
            cp -r "$PROJECT_ROOT/production-build"/* .
        else
            log_error "Build de produção não encontrado!"
            return 1
        fi
    else
        # Download de versão específica
        log_info "Baixando versão específica: $version"
        # wget/curl do GitHub releases ou registry
        echo "Download da versão $version seria feito aqui"
    fi
    
    # Verificar integridade do download
    if [ ! -f "docker-compose.prod.yml" ]; then
        log_error "Arquivos de deploy não encontrados!"
        return 1
    fi
    
    echo "$release_dir" > /tmp/pinovara_release_dir
    log_success "Release baixada em: $release_dir"
}

# Função para validar a release
validate_release() {
    local release_dir=$1
    
    log_step "Validando release..."
    
    cd "$release_dir"
    
    # Verificar arquivos essenciais
    local required_files=(
        "docker-compose.prod.yml"
        "backend/Dockerfile"
        "backend/server.js"
        "frontend/index.html"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Arquivo obrigatório não encontrado: $file"
            return 1
        fi
    done
    
    # Verificar configuração Docker Compose
    if ! docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
        log_error "Configuração Docker Compose inválida!"
        return 1
    fi
    
    log_success "Release validada com sucesso"
}

# Função para configurar variáveis de ambiente
setup_environment() {
    local environment=$1
    local release_dir=$2
    
    log_step "Configurando environment para $environment..."
    
    cd "$release_dir"
    
    # Configurar .env principal
    if [ "$environment" = "production" ]; then
        cat > .env << EOF
COMPOSE_PROJECT_NAME=pinovara-prod
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$(openssl rand -base64 32)}
POSTGRES_USER=pinovara_user
POSTGRES_DB=pinovara_db
NODE_ENV=production
EOF
    else
        cat > .env << EOF
COMPOSE_PROJECT_NAME=pinovara-staging
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$(openssl rand -base64 32)}
POSTGRES_USER=pinovara_staging
POSTGRES_DB=pinovara_staging
NODE_ENV=staging
EOF
    fi
    
    # Configurar backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
NODE_ENV=$environment
PORT=3001
DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@postgres:5432/\${POSTGRES_DB}?schema=pinovara
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}
FRONTEND_URL=${FRONTEND_URL:-https://pinovaraufba.com.br}
EOF
    fi
    
    log_success "Environment configurado"
}

# Função para deploy da aplicação
deploy_application() {
    local release_dir=$1
    local environment=$2
    
    log_step "Fazendo deploy da aplicação..."
    
    cd "$release_dir"
    
    # Pull das imagens Docker
    log_info "Fazendo pull das imagens Docker..."
    docker-compose -f docker-compose.prod.yml pull
    
    # Build local se necessário
    log_info "Building imagens se necessário..."
    docker-compose -f docker-compose.prod.yml build
    
    # Start dos serviços
    log_info "Iniciando serviços..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Aguardar serviços iniciarem
    log_info "Aguardando serviços iniciarem..."
    sleep 15
    
    log_success "Deploy executado"
}

# Função para health check
health_check() {
    local max_attempts=30
    local attempt=1
    
    log_step "Executando health checks..."
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Tentativa $attempt/$max_attempts..."
        
        # Check backend
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log_success "Backend está respondendo"
            BACKEND_OK=true
        else
            BACKEND_OK=false
        fi
        
        # Check frontend
        if curl -f http://localhost > /dev/null 2>&1; then
            log_success "Frontend está respondendo"
            FRONTEND_OK=true
        else
            FRONTEND_OK=false
        fi
        
        if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
            log_success "Health checks passaram!"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_error "Health checks falharam após $max_attempts tentativas"
    return 1
}

# Função para ativar a release
activate_release() {
    local release_dir=$1
    
    log_step "Ativando nova release..."
    
    # Criar/atualizar symlink para a versão atual
    if [ -L "$DEPLOY_DIR" ]; then
        sudo rm "$DEPLOY_DIR"
    fi
    
    sudo ln -sf "$release_dir" "$DEPLOY_DIR"
    
    log_success "Release ativada: $(basename "$release_dir")"
}

# Função para rollback
rollback() {
    local environment=$1
    
    log_step "Executando rollback..."
    
    # Encontrar backup mais recente
    if [ -f /tmp/pinovara_backup_name ]; then
        BACKUP_NAME=$(cat /tmp/pinovara_backup_name)
        BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
        
        if [ -d "$BACKUP_PATH" ]; then
            log_info "Fazendo rollback para: $BACKUP_NAME"
            
            # Parar serviços atuais
            if [ -L "$DEPLOY_DIR" ]; then
                cd "$(readlink "$DEPLOY_DIR")"
                docker-compose -f docker-compose.prod.yml down || true
            fi
            
            # Restaurar backup
            ROLLBACK_DIR="$RELEASES_DIR/rollback_${TIMESTAMP}"
            cp -r "$BACKUP_PATH" "$ROLLBACK_DIR"
            
            # Ativar backup
            sudo rm -f "$DEPLOY_DIR"
            sudo ln -sf "$ROLLBACK_DIR" "$DEPLOY_DIR"
            
            # Reiniciar serviços
            cd "$DEPLOY_DIR"
            docker-compose -f docker-compose.prod.yml up -d
            
            log_success "Rollback executado com sucesso"
        else
            log_error "Backup não encontrado: $BACKUP_PATH"
            return 1
        fi
    else
        log_error "Nenhum backup disponível para rollback"
        return 1
    fi
}

# Função para cleanup
cleanup_old_releases() {
    log_step "Limpando releases antigas..."
    
    # Manter apenas as 3 releases mais recentes
    cd "$RELEASES_DIR"
    ls -t | grep "^release_" | tail -n +4 | xargs -r rm -rf
    
    # Limpar imagens Docker não utilizadas
    docker image prune -f > /dev/null 2>&1 || true
    
    log_success "Cleanup concluído"
}

# Função principal de deploy
main_deploy() {
    local environment=$1
    local version=$2
    local dry_run=$3
    local force=$4
    
    # Banner
    echo -e "${BLUE}"
    echo "========================================"
    echo "   PINOVARA - DEPLOYMENT SYSTEM"
    echo "========================================"
    echo -e "${NC}"
    echo "Environment: $environment"
    echo "Version: $version"
    echo "Timestamp: $TIMESTAMP"
    echo ""
    
    if [ "$dry_run" = true ]; then
        log_info "🔍 DRY RUN MODE - Nenhuma alteração será feita"
        echo ""
    fi
    
    # Verificações iniciais
    check_requirements
    setup_directories
    
    # Executar steps do deploy
    if [ "$dry_run" != true ]; then
        create_backup
        
        download_release "$version"
        RELEASE_DIR=$(cat /tmp/pinovara_release_dir)
        
        validate_release "$RELEASE_DIR"
        setup_environment "$environment" "$RELEASE_DIR"
        deploy_application "$RELEASE_DIR" "$environment"
        
        if health_check; then
            activate_release "$RELEASE_DIR"
            cleanup_old_releases
            
            echo -e "${GREEN}"
            echo "========================================"
            echo "   DEPLOY EXECUTADO COM SUCESSO!"
            echo "========================================"
            echo -e "${NC}"
            echo "🌐 URL: ${FRONTEND_URL:-http://localhost}"
            echo "🔗 API: http://localhost:3001"
            echo "📅 Deployed: $(date)"
            echo ""
        else
            log_error "Health checks falharam - executando rollback automático..."
            rollback "$environment"
            exit 1
        fi
    else
        log_info "Dry run completado - nenhuma alteração foi feita"
    fi
}

# Parsing de argumentos
ENVIRONMENT=""
VERSION=""
DRY_RUN=false
FORCE=false
ROLLBACK_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        --rollback)
            ROLLBACK_MODE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validar argumentos
if [ "$ROLLBACK_MODE" = true ]; then
    if [ -z "$ENVIRONMENT" ]; then
        log_error "Environment é obrigatório para rollback"
        exit 1
    fi
    rollback "$ENVIRONMENT"
    exit 0
fi

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
    log_error "Environment e Version são obrigatórios"
    show_help
    exit 1
fi

# Executar deploy
main_deploy "$ENVIRONMENT" "$VERSION" "$DRY_RUN" "$FORCE"