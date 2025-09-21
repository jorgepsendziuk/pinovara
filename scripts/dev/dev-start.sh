#!/bin/bash

# ========== PINOVARA DEV ENVIRONMENT STARTUP ==========
# Script para inicializar ambiente de desenvolvimento

set -e  # Parar em caso de erro

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

# Banner
echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - DEV ENVIRONMENT SETUP"
echo "========================================"
echo -e "${NC}"

# Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ]; then
    log_error "Este script deve ser executado na raiz do projeto!"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado! Instale o Node.js 18+ para continuar."
    exit 1
fi

NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Função para verificar se porta está em uso
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "$service já está rodando na porta $port"
        return 0
    else
        return 1
    fi
}

# Verificar e configurar backend
log_info "🔧 Configurando Backend..."
cd backend

# Verificar .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log_info "Criando .env do backend baseado no .env.example"
        cp .env.example .env
        log_warning "⚠️  Configure o DATABASE_URL e JWT_SECRET no arquivo backend/.env"
    else
        log_error "Arquivo .env.example não encontrado no backend!"
    fi
fi

# Instalar dependências do backend se necessário
if [ ! -d "node_modules" ]; then
    log_info "📦 Instalando dependências do backend..."
    npm install
fi

# Verificar se backend já está rodando
if ! check_port 3001 "Backend"; then
    log_info "🚀 Iniciando servidor backend (porta 3001)..."
    # Iniciar backend em background
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    log_success "Backend iniciado (PID: $BACKEND_PID)"
else
    log_info "✅ Backend já está rodando"
fi

cd ..

# Verificar e configurar frontend
log_info "⚛️ Configurando Frontend..."
cd frontend

# Verificar .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log_info "Criando .env do frontend baseado no .env.example"
        cp .env.example .env
    fi
fi

# Instalar dependências do frontend se necessário
if [ ! -d "node_modules" ]; then
    log_info "📦 Instalando dependências do frontend..."
    npm install
fi

# Verificar se frontend já está rodando
if ! check_port 5173 "Frontend"; then
    log_info "🌐 Iniciando servidor frontend (porta 5173)..."
    # Iniciar frontend em background
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    log_success "Frontend iniciado (PID: $FRONTEND_PID)"
else
    log_info "✅ Frontend já está rodando"
fi

cd ..

# Criar diretório de logs se não existir
mkdir -p logs

# Aguardar serviços iniciarem
log_info "⏳ Aguardando serviços iniciarem..."
sleep 3

# Verificar status dos serviços
log_info "🔍 Verificando status dos serviços..."

# Testar backend
if curl -s http://localhost:3001/health > /dev/null; then
    log_success "✅ Backend respondendo em http://localhost:3001"
else
    log_warning "⚠️  Backend pode estar ainda iniciando..."
fi

# Testar frontend
if curl -s http://localhost:5173 > /dev/null; then
    log_success "✅ Frontend respondendo em http://localhost:5173"
else
    log_warning "⚠️  Frontend pode estar ainda iniciando..."
fi

# Informações finais
echo -e "${GREEN}"
echo "========================================"
echo "   AMBIENTE DE DESENVOLVIMENTO PRONTO!"
echo "========================================"
echo -e "${NC}"
echo "📱 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:3001"
echo "🏥 Health Check: http://localhost:3001/health"
echo ""
echo "📋 Logs:"
echo "   Backend: tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 Para parar os serviços: ./scripts/dev/dev-stop.sh"
echo ""
log_success "Happy coding! 🚀"