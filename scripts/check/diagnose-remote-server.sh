#!/bin/bash

# ========== PINOVARA REMOTE SERVER DIAGNOSTICS ==========
# Script para diagnosticar problemas no servidor remoto

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
DOMAIN="pinovaraufba.com.br"
FRONTEND_URL="https://${DOMAIN}"
BACKEND_URL="https://${DOMAIN}"

echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - REMOTE SERVER DIAGNOSIS"
echo "========================================"
echo -e "${NC}"
echo "Domain: $DOMAIN"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Função para teste HTTP
test_endpoint() {
    local url=$1
    local description=$2
    local expected_code=${3:-200}
    
    echo -n "$description: "
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✅ OK ($response)${NC}"
        return 0
    elif [ "$response" = "000" ]; then
        echo -e "${RED}❌ CONNECTION FAILED${NC}"
        return 1
    else
        echo -e "${RED}❌ FAILED ($response)${NC}"
        return 1
    fi
}

# Função para teste de resposta detalhada
test_detailed() {
    local url=$1
    local description=$2
    
    echo -e "${BLUE}🔍 Testing $description${NC}"
    echo "URL: $url"
    echo "Response:"
    curl -I -s --connect-timeout 10 --max-time 30 "$url" 2>/dev/null || echo "Connection failed"
    echo ""
}

echo -e "${BLUE}🌐 CONNECTIVITY TESTS${NC}"
echo "----------------------------------------"

# Teste básico de conectividade
echo -n "DNS Resolution: "
if nslookup $DOMAIN >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo -n "HTTPS Port 443: "
if nc -z -w5 $DOMAIN 443 2>/dev/null; then
    echo -e "${GREEN}✅ OPEN${NC}"
else
    echo -e "${RED}❌ CLOSED${NC}"
fi

echo -n "HTTP Port 80: "
if nc -z -w5 $DOMAIN 80 2>/dev/null; then
    echo -e "${GREEN}✅ OPEN${NC}"
else
    echo -e "${RED}❌ CLOSED${NC}"
fi

echo ""

echo -e "${BLUE}🚀 SERVICE STATUS${NC}"
echo "----------------------------------------"

# Testes de endpoints
test_endpoint "$FRONTEND_URL" "Frontend (Root)"
test_endpoint "$BACKEND_URL/health" "Backend Health Check"
test_endpoint "$BACKEND_URL/api/health" "Backend API Health (alt)"
test_endpoint "$BACKEND_URL/auth/verify" "Auth Endpoint" 401

echo ""

echo -e "${BLUE}🔧 BACKEND API ENDPOINTS${NC}"
echo "----------------------------------------"

test_endpoint "$BACKEND_URL/admin/users" "Admin Users Endpoint" 401
test_endpoint "$BACKEND_URL/admin/roles" "Admin Roles Endpoint" 401
test_endpoint "$BACKEND_URL/organizacao" "Organization Endpoint" 401

echo ""

# Detalhes do servidor
test_detailed "$FRONTEND_URL" "Frontend Details"
test_detailed "$BACKEND_URL/health" "Backend Health Details"

echo -e "${BLUE}🏥 DIAGNOSIS${NC}"
echo "----------------------------------------"

# Fazer diagnóstico baseado nos resultados
FRONTEND_OK=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$FRONTEND_URL" 2>/dev/null)
BACKEND_OK=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$BACKEND_URL/health" 2>/dev/null)

if [ "$FRONTEND_OK" = "200" ] && [ "$BACKEND_OK" = "502" ]; then
    echo -e "${YELLOW}⚠️  BACKEND DOWN - Frontend working, Backend returning 502${NC}"
    echo "Likely causes:"
    echo "  1. Backend container/process stopped"
    echo "  2. Backend crashed or failed to start"
    echo "  3. Database connection issues"
    echo "  4. Port 3001 not accessible"
    echo ""
    echo "Recommended actions:"
    echo "  1. SSH into server and check container status"
    echo "  2. Restart backend service"
    echo "  3. Check backend logs"
    echo "  4. Verify database connectivity"
    
elif [ "$FRONTEND_OK" != "200" ] && [ "$BACKEND_OK" != "200" ]; then
    echo -e "${RED}❌ FULL OUTAGE - Both services down${NC}"
    echo "Likely causes:"
    echo "  1. Server completely down"
    echo "  2. Nginx configuration issues"
    echo "  3. Network/firewall problems"
    echo "  4. Docker/container runtime issues"
    
elif [ "$FRONTEND_OK" = "200" ] && [ "$BACKEND_OK" = "200" ]; then
    echo -e "${GREEN}✅ ALL SERVICES HEALTHY${NC}"
    echo "All endpoints responding correctly."
    
else
    echo -e "${YELLOW}⚠️  MIXED STATUS${NC}"
    echo "Frontend: $FRONTEND_OK"
    echo "Backend: $BACKEND_OK"
    echo "Check individual service configurations."
fi

echo ""
echo -e "${BLUE}🛠️  QUICK FIXES (Run on server)${NC}"
echo "----------------------------------------"
echo "# Check container status:"
echo "docker ps"
echo ""
echo "# Restart services:"
echo "cd /var/pinovara/current"
echo "docker-compose -f docker-compose.prod.yml restart backend"
echo ""
echo "# Check logs:"
echo "docker-compose -f docker-compose.prod.yml logs backend"
echo ""
echo "# Full restart if needed:"
echo "docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo -e "${GREEN}Diagnosis completed at $(date)${NC}"
