#!/bin/bash

# ========== PINOVARA BACKEND 502 FIX ==========
# Script para corrigir erro 502 Bad Gateway do backend

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
DEPLOY_DIR="/var/pinovara/current"
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - BACKEND 502 FIX"
echo "========================================"
echo -e "${NC}"
echo "Fixing 502 Bad Gateway error..."
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Verificar se estamos no servidor correto
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}❌ Deploy directory not found: $DEPLOY_DIR${NC}"
    echo "Are you running this on the production server?"
    exit 1
fi

cd "$DEPLOY_DIR"

echo -e "${BLUE}🔍 CHECKING CURRENT STATUS${NC}"
echo "----------------------------------------"

# Verificar containers
echo "Current container status:"
docker ps --filter "name=pinovara" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Checking backend specifically:"
docker ps --filter "name=backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

echo -e "${BLUE}📋 CHECKING LOGS${NC}"
echo "----------------------------------------"
echo "Recent backend logs (last 20 lines):"
docker-compose -f "$COMPOSE_FILE" logs --tail=20 backend || echo "Could not retrieve logs"

echo ""

echo -e "${BLUE}🔄 RESTARTING BACKEND${NC}"
echo "----------------------------------------"

# Verificar se o arquivo compose existe
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Docker compose file not found: $COMPOSE_FILE${NC}"
    exit 1
fi

# Parar backend primeiro
echo "1. Stopping backend container..."
docker-compose -f "$COMPOSE_FILE" stop backend

# Aguardar um pouco
echo "2. Waiting 5 seconds..."
sleep 5

# Remover container se existir
echo "3. Removing old backend container..."
docker-compose -f "$COMPOSE_FILE" rm -f backend || echo "No container to remove"

# Iniciar backend novamente
echo "4. Starting backend container..."
docker-compose -f "$COMPOSE_FILE" up -d backend

echo ""

echo -e "${BLUE}⏳ WAITING FOR BACKEND TO START${NC}"
echo "----------------------------------------"

# Aguardar o backend inicializar
echo "Waiting 30 seconds for backend to fully start..."
sleep 30

echo ""

echo -e "${BLUE}🏥 HEALTH CHECK${NC}"
echo "----------------------------------------"

# Verificar status do container
echo "Container status after restart:"
docker ps --filter "name=backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

# Testar conectividade local
echo "Testing local backend connectivity:"
echo -n "Internal health check (port 3001): "
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://localhost:3001/health" | grep -q "200"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

# Testar através do nginx
echo -n "External health check (through nginx): "
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://pinovaraufba.com.br/health" | grep -q "200"; then
    echo -e "${GREEN}✅ OK - Backend is working!${NC}"
    BACKEND_STATUS="OK"
else
    echo -e "${RED}❌ STILL FAILING${NC}"
    BACKEND_STATUS="FAILED"
fi

echo ""

echo -e "${BLUE}🔧 ADDITIONAL CHECKS${NC}"
echo "----------------------------------------"

# Verificar logs pós-restart
echo "Backend logs after restart (last 10 lines):"
docker-compose -f "$COMPOSE_FILE" logs --tail=10 backend

echo ""

# Verificar conectividade com banco
echo "Testing database connectivity (if backend is up):"
if [ "$BACKEND_STATUS" = "OK" ]; then
    # Se backend está OK, testar endpoint que usa banco
    echo -n "Database test (auth verify): "
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://pinovaraufba.com.br/auth/verify")
    if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Database connection OK (response: $RESPONSE)${NC}"
    else
        echo -e "${YELLOW}⚠️  Unexpected response: $RESPONSE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping database test (backend not responding)${NC}"
fi

echo ""

echo -e "${BLUE}📊 FINAL STATUS${NC}"
echo "========================================"

if [ "$BACKEND_STATUS" = "OK" ]; then
    echo -e "${GREEN}✅ SUCCESS: Backend is now responding!${NC}"
    echo "🎉 The 502 error should be resolved."
    echo ""
    echo "Next steps:"
    echo "1. Test the frontend application"
    echo "2. Monitor logs for any new issues"
    echo "3. Consider investigating root cause"
else
    echo -e "${RED}❌ BACKEND STILL NOT RESPONDING${NC}"
    echo ""
    echo "The restart didn't resolve the issue. Possible causes:"
    echo "1. Database connection problems"
    echo "2. Environment variables missing/incorrect"
    echo "3. Application code errors"
    echo "4. Resource limitations (CPU/memory)"
    echo ""
    echo "Manual investigation required:"
    echo "docker-compose -f $COMPOSE_FILE logs backend"
    echo "docker exec -it \$(docker ps -q --filter name=backend) bash"
fi

echo ""
echo -e "${YELLOW}Monitor command: docker-compose -f $COMPOSE_FILE logs -f backend${NC}"
echo "Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
