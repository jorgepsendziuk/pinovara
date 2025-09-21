#!/bin/bash

# ========== PINOVARA DEV ENVIRONMENT STATUS ==========
# Script para verificar status do ambiente de desenvolvimento

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Função para obter PID de uma porta
get_port_pid() {
    local port=$1
    lsof -ti:$port 2>/dev/null | head -1
}

# Função para verificar resposta HTTP
check_http() {
    local url=$1
    local timeout=3
    if curl -s --connect-timeout $timeout "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Banner
echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - DEV STATUS CHECK"
echo "========================================"
echo -e "${NC}"

# Status geral
echo -e "${BLUE}📊 VERIFICANDO STATUS DOS SERVIÇOS...${NC}"
echo ""

# Verificar Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Instalado ($NODE_VERSION)${NC}"
else
    echo -e "${RED}❌ Não encontrado${NC}"
fi

# Verificar npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ Instalado ($NPM_VERSION)${NC}"
else
    echo -e "${RED}❌ Não encontrado${NC}"
fi

echo ""

# Verificar backend
echo -e "${GREEN}🔧 BACKEND (Porta 3001):${NC}"
if check_port 3001; then
    BACKEND_PID=$(get_port_pid 3001)
    echo -e "   Status: ${GREEN}✅ Rodando (PID: $BACKEND_PID)${NC}"
    
    # Verificar health endpoint
    echo -n "   Health Check: "
    if check_http "http://localhost:3001/health"; then
        echo -e "${GREEN}✅ Respondendo${NC}"
    else
        echo -e "${YELLOW}⚠️  Não respondendo${NC}"
    fi
    
    # Verificar autenticação endpoint
    echo -n "   Auth Endpoint: "
    if check_http "http://localhost:3001/auth/verify"; then
        echo -e "${GREEN}✅ Disponível${NC}"
    else
        echo -e "${YELLOW}⚠️  Não disponível${NC}"
    fi
else
    echo -e "   Status: ${RED}❌ Não rodando${NC}"
    
    # Verificar se arquivo PID existe
    if [ -f "logs/backend.pid" ]; then
        echo -e "   ${YELLOW}⚠️  Arquivo PID encontrado mas processo não está ativo${NC}"
    fi
fi

echo ""

# Verificar frontend
echo -e "${CYAN}⚛️ FRONTEND (Porta 5173):${NC}"
if check_port 5173; then
    FRONTEND_PID=$(get_port_pid 5173)
    echo -e "   Status: ${GREEN}✅ Rodando (PID: $FRONTEND_PID)${NC}"
    
    # Verificar se frontend está respondendo
    echo -n "   HTTP Response: "
    if check_http "http://localhost:5173"; then
        echo -e "${GREEN}✅ Respondendo${NC}"
    else
        echo -e "${YELLOW}⚠️  Não respondendo${NC}"
    fi
else
    echo -e "   Status: ${RED}❌ Não rodando${NC}"
    
    # Verificar se arquivo PID existe
    if [ -f "logs/frontend.pid" ]; then
        echo -e "   ${YELLOW}⚠️  Arquivo PID encontrado mas processo não está ativo${NC}"
    fi
fi

echo ""

# Verificar arquivos de configuração
echo -e "${BLUE}📋 CONFIGURAÇÃO:${NC}"

# Backend .env
echo -n "   Backend .env: "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Existe${NC}"
    
    # Verificar variáveis importantes
    if grep -q "DATABASE_URL" backend/.env && grep -q "JWT_SECRET" backend/.env; then
        echo -e "   ${GREEN}   ✅ Variáveis principais configuradas${NC}"
    else
        echo -e "   ${YELLOW}   ⚠️  Algumas variáveis podem estar faltando${NC}"
    fi
else
    echo -e "${RED}❌ Não existe${NC}"
fi

# Frontend .env
echo -n "   Frontend .env: "
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ Existe${NC}"
else
    echo -e "${YELLOW}⚠️  Não existe (usando padrões)${NC}"
fi

echo ""

# Verificar logs
echo -e "${BLUE}📁 LOGS:${NC}"

# Backend log
echo -n "   Backend Log: "
if [ -f "logs/backend.log" ]; then
    LOG_SIZE=$(du -h logs/backend.log | cut -f1)
    echo -e "${GREEN}✅ Existe ($LOG_SIZE)${NC}"
else
    echo -e "${YELLOW}⚠️  Não existe${NC}"
fi

# Frontend log
echo -n "   Frontend Log: "
if [ -f "logs/frontend.log" ]; then
    LOG_SIZE=$(du -h logs/frontend.log | cut -f1)
    echo -e "${GREEN}✅ Existe ($LOG_SIZE)${NC}"
else
    echo -e "${YELLOW}⚠️  Não existe${NC}"
fi

echo ""

# Informações de acesso
echo -e "${BLUE}🌐 ACESSO:${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"

echo ""

# Comandos úteis
echo -e "${BLUE}🛠️  COMANDOS ÚTEIS:${NC}"
echo "   Iniciar: ./scripts/dev/dev-start.sh"
echo "   Parar: ./scripts/dev/dev-stop.sh"
echo "   Logs: ./scripts/dev/dev-logs.sh"
echo "   Status: ./scripts/dev/dev-status.sh"

echo ""

# Status final
BACKEND_STATUS=$(check_port 3001 && echo "UP" || echo "DOWN")
FRONTEND_STATUS=$(check_port 5173 && echo "UP" || echo "DOWN")

if [[ "$BACKEND_STATUS" == "UP" && "$FRONTEND_STATUS" == "UP" ]]; then
    echo -e "${GREEN}🚀 Ambiente de desenvolvimento totalmente funcional!${NC}"
elif [[ "$BACKEND_STATUS" == "UP" || "$FRONTEND_STATUS" == "UP" ]]; then
    echo -e "${YELLOW}⚠️  Ambiente parcialmente ativo${NC}"
else
    echo -e "${RED}💤 Ambiente de desenvolvimento parado${NC}"
fi