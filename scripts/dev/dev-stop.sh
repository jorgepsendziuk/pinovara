#!/bin/bash

# ========== PINOVARA DEV ENVIRONMENT SHUTDOWN ==========
# Script para parar o ambiente de desenvolvimento

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

# Banner
echo -e "${RED}"
echo "========================================"
echo "   PINOVARA - DEV ENVIRONMENT STOP"
echo "========================================"
echo -e "${NC}"

# Função para parar processo por PID
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_info "🛑 Parando $service_name (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            
            # Aguardar processo terminar
            local count=0
            while ps -p "$pid" > /dev/null 2>&1 && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            if ps -p "$pid" > /dev/null 2>&1; then
                log_warning "Processo $service_name não terminou, forçando..."
                kill -9 "$pid" 2>/dev/null || true
            fi
            
            log_success "$service_name parado"
        else
            log_info "$service_name não estava rodando"
        fi
        rm -f "$pid_file"
    else
        log_info "Arquivo PID não encontrado para $service_name"
    fi
}

# Função para parar processo por porta
stop_by_port() {
    local port=$1
    local service_name=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        log_info "🛑 Parando $service_name na porta $port..."
        echo "$pids" | xargs -r kill 2>/dev/null || true
        sleep 2
        
        # Verificar se ainda há processos na porta
        local remaining_pids=$(lsof -ti:$port 2>/dev/null || true)
        if [ -n "$remaining_pids" ]; then
            log_warning "Forçando parada de $service_name..."
            echo "$remaining_pids" | xargs -r kill -9 2>/dev/null || true
        fi
        
        log_success "$service_name parado"
    else
        log_info "$service_name não estava rodando na porta $port"
    fi
}

# Criar diretório de logs se não existir
mkdir -p logs

# Parar backend
log_info "🔧 Parando Backend..."
stop_process "logs/backend.pid" "Backend"
stop_by_port "3001" "Backend (porta 3001)"

# Parar frontend  
log_info "⚛️ Parando Frontend..."
stop_process "logs/frontend.pid" "Frontend"
stop_by_port "5173" "Frontend (porta 5173)"

# Limpar processos Node.js órfãos relacionados ao projeto
log_info "🧹 Limpando processos órfãos..."

# Encontrar e parar processos Node.js que possam estar relacionados ao projeto
pkill -f "vite.*5173" 2>/dev/null || true
pkill -f "ts-node.*server" 2>/dev/null || true
pkill -f "nodemon.*server" 2>/dev/null || true

# Aguardar um pouco para processos terminarem
sleep 2

# Verificar se as portas estão livres
log_info "🔍 Verificando portas..."

if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_success "✅ Porta 3001 (Backend) está livre"
else
    log_warning "⚠️  Porta 3001 ainda está em uso"
fi

if ! lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_success "✅ Porta 5173 (Frontend) está livre"
else
    log_warning "⚠️  Porta 5173 ainda está em uso"
fi

# Informações finais
echo -e "${GREEN}"
echo "========================================"
echo "   AMBIENTE DE DESENVOLVIMENTO PARADO!"
echo "========================================"
echo -e "${NC}"
echo "🔄 Para iniciar novamente: ./scripts/dev/dev-start.sh"
echo "📋 Para ver logs: ./scripts/dev/dev-logs.sh"
echo ""
log_success "Ambiente limpo! 👋"