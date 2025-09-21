#!/bin/bash

# ========== PINOVARA SYSTEM MONITOR ==========
# Script para monitoramento em tempo real do sistema

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
DEPLOY_DIR="/var/pinovara/current"
SHARED_DIR="/var/pinovara/shared"
FRONTEND_URL="${FRONTEND_URL:-http://localhost}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

# Função para limpar tela
clear_screen() {
    clear
    echo -e "${BLUE}"
    echo "========================================"
    echo "   PINOVARA - SYSTEM MONITOR"
    echo "========================================"
    echo -e "${NC}"
    echo "Atualizado em: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Press Ctrl+C to exit"
    echo ""
}

# Função para status colorido
status_color() {
    local status=$1
    case $status in
        "UP"|"HEALTHY"|"RUNNING"|"OK")
            echo -e "${GREEN}$status${NC}"
            ;;
        "DOWN"|"UNHEALTHY"|"STOPPED"|"ERROR")
            echo -e "${RED}$status${NC}"
            ;;
        "WARNING"|"DEGRADED"|"RESTARTING")
            echo -e "${YELLOW}$status${NC}"
            ;;
        *)
            echo -e "${CYAN}$status${NC}"
            ;;
    esac
}

# Função para verificar containers Docker
check_containers() {
    echo -e "${BLUE}🐳 DOCKER CONTAINERS${NC}"
    echo "----------------------------------------"
    
    if command -v docker &> /dev/null; then
        # Verificar se Docker está rodando
        if docker info > /dev/null 2>&1; then
            # Listar containers do projeto
            if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "pinovara\|postgres\|nginx"; then
                docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|pinovara|postgres|nginx)" | head -10
            else
                echo "Nenhum container PINOVARA encontrado"
            fi
            
            echo ""
            
            # Estatísticas de recursos
            echo -e "${CYAN}Uso de recursos pelos containers:${NC}"
            docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -6
        else
            echo -e "$(status_color "DOWN") Docker daemon não está rodando"
        fi
    else
        echo -e "$(status_color "ERROR") Docker não está instalado"
    fi
    
    echo ""
}

# Função para verificar health dos serviços
check_health() {
    echo -e "${BLUE}🏥 SERVICE HEALTH${NC}"
    echo "----------------------------------------"
    
    # Verificar backend
    echo -n "Backend API: "
    if curl -f -s --connect-timeout 5 "$BACKEND_URL/health" > /dev/null 2>&1; then
        echo -e "$(status_color "UP")"
    else
        echo -e "$(status_color "DOWN")"
    fi
    
    # Verificar frontend
    echo -n "Frontend: "
    if curl -f -s --connect-timeout 5 "$FRONTEND_URL" > /dev/null 2>&1; then
        echo -e "$(status_color "UP")"
    else
        echo -e "$(status_color "DOWN")"
    fi
    
    # Verificar banco de dados
    echo -n "Database: "
    if docker ps | grep -q postgres && docker exec $(docker ps | grep postgres | awk '{print $1}') pg_isready > /dev/null 2>&1; then
        echo -e "$(status_color "UP")"
    else
        echo -e "$(status_color "DOWN")"
    fi
    
    # Verificar nginx
    echo -n "Nginx: "
    if systemctl is-active --quiet nginx; then
        echo -e "$(status_color "UP")"
    else
        echo -e "$(status_color "DOWN")"
    fi
    
    echo ""
}

# Função para verificar recursos do sistema
check_system_resources() {
    echo -e "${BLUE}📊 SYSTEM RESOURCES${NC}"
    echo "----------------------------------------"
    
    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    echo -n "CPU Usage: "
    if (( $(echo "$CPU_USAGE > 80" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "$(status_color "WARNING") ${CPU_USAGE}%"
    else
        echo -e "$(status_color "OK") ${CPU_USAGE}%"
    fi
    
    # Memory usage
    MEMORY_INFO=$(free | grep '^Mem')
    MEMORY_TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
    MEMORY_USED=$(echo $MEMORY_INFO | awk '{print $3}')
    MEMORY_PERCENT=$(awk "BEGIN {printf \"%.1f\", $MEMORY_USED/$MEMORY_TOTAL * 100}")
    
    echo -n "Memory Usage: "
    if (( $(echo "$MEMORY_PERCENT > 80" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "$(status_color "WARNING") ${MEMORY_PERCENT}% ($(echo "scale=1; $MEMORY_USED/1024/1024" | bc 2>/dev/null || echo "?")GB/$(echo "scale=1; $MEMORY_TOTAL/1024/1024" | bc 2>/dev/null || echo "?")GB)"
    else
        echo -e "$(status_color "OK") ${MEMORY_PERCENT}% ($(echo "scale=1; $MEMORY_USED/1024/1024" | bc 2>/dev/null || echo "?")GB/$(echo "scale=1; $MEMORY_TOTAL/1024/1024" | bc 2>/dev/null || echo "?")GB)"
    fi
    
    # Disk usage
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    echo -n "Disk Usage: "
    if [ "$DISK_USAGE" -gt 80 ]; then
        echo -e "$(status_color "WARNING") ${DISK_USAGE}%"
    else
        echo -e "$(status_color "OK") ${DISK_USAGE}%"
    fi
    
    # Load average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
    echo "Load Average:$LOAD_AVG"
    
    echo ""
}

# Função para verificar logs recentes
check_recent_logs() {
    echo -e "${BLUE}📋 RECENT LOGS${NC}"
    echo "----------------------------------------"
    
    # Logs do Docker Compose
    if [ -d "$DEPLOY_DIR" ] && [ -f "$DEPLOY_DIR/docker-compose.prod.yml" ]; then
        echo -e "${CYAN}Últimas linhas dos logs dos containers:${NC}"
        cd "$DEPLOY_DIR"
        docker-compose -f docker-compose.prod.yml logs --tail=3 --since=5m 2>/dev/null | tail -10
    else
        echo "Logs do Docker Compose não disponíveis"
    fi
    
    echo ""
    
    # Logs do sistema
    echo -e "${CYAN}Últimos erros do sistema:${NC}"
    journalctl -p err --since="5 minutes ago" --no-pager -q | tail -5 || echo "Nenhum erro recente"
    
    echo ""
}

# Função para verificar conectividade de rede
check_network() {
    echo -e "${BLUE}🌐 NETWORK STATUS${NC}"
    echo "----------------------------------------"
    
    # Verificar conexão externa
    echo -n "Internet: "
    if ping -c 1 -W 5 google.com > /dev/null 2>&1; then
        echo -e "$(status_color "OK")"
    else
        echo -e "$(status_color "DOWN")"
    fi
    
    # Verificar portas abertas
    echo "Open Ports:"
    ss -tlnp | grep -E ':(80|443|3001|5432)\s' | awk '{print $4}' | sed 's/.*:/Port /' | sort -u
    
    echo ""
}

# Função para verificar SSL/certificados
check_ssl() {
    echo -e "${BLUE}🔒 SSL STATUS${NC}"
    echo "----------------------------------------"
    
    # Verificar se tem certificados SSL
    if [ -d "/etc/letsencrypt/live" ]; then
        CERT_COUNT=$(find /etc/letsencrypt/live -name "cert.pem" | wc -l)
        echo "SSL Certificates: $CERT_COUNT found"
        
        # Verificar expiração dos certificados
        for cert in /etc/letsencrypt/live/*/cert.pem; do
            if [ -f "$cert" ]; then
                DOMAIN=$(dirname "$cert" | xargs basename)
                EXPIRE_DATE=$(openssl x509 -in "$cert" -noout -enddate 2>/dev/null | cut -d= -f2)
                if [ -n "$EXPIRE_DATE" ]; then
                    echo "$DOMAIN: expires $EXPIRE_DATE"
                fi
            fi
        done
    else
        echo -e "$(status_color "WARNING") No SSL certificates found"
    fi
    
    echo ""
}

# Função para exibir informações de deployment
check_deployment_info() {
    echo -e "${BLUE}🚀 DEPLOYMENT INFO${NC}"
    echo "----------------------------------------"
    
    # Verificar versão atual
    if [ -L "$DEPLOY_DIR" ] && [ -d "$(readlink "$DEPLOY_DIR")" ]; then
        CURRENT_RELEASE=$(basename "$(readlink "$DEPLOY_DIR")")
        echo "Current Release: $CURRENT_RELEASE"
        
        # Verificar informações de versão se disponível
        if [ -f "$DEPLOY_DIR/VERSION" ]; then
            echo -e "${CYAN}Version Info:${NC}"
            cat "$DEPLOY_DIR/VERSION" | head -10
        fi
    else
        echo -e "$(status_color "ERROR") No active deployment found"
    fi
    
    echo ""
}

# Função para exibir estatísticas de performance
check_performance() {
    echo -e "${BLUE}⚡ PERFORMANCE${NC}"
    echo "----------------------------------------"
    
    # Tempo de resposta do backend
    echo -n "Backend Response Time: "
    BACKEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' --connect-timeout 5 "$BACKEND_URL/health" 2>/dev/null || echo "timeout")
    if [ "$BACKEND_TIME" != "timeout" ]; then
        echo "${BACKEND_TIME}s"
    else
        echo -e "$(status_color "ERROR") timeout"
    fi
    
    # Tempo de resposta do frontend
    echo -n "Frontend Response Time: "
    FRONTEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' --connect-timeout 5 "$FRONTEND_URL" 2>/dev/null || echo "timeout")
    if [ "$FRONTEND_TIME" != "timeout" ]; then
        echo "${FRONTEND_TIME}s"
    else
        echo -e "$(status_color "ERROR") timeout"
    fi
    
    # Uptime do sistema
    echo "System Uptime: $(uptime -p 2>/dev/null || uptime | awk '{print $3,$4}')"
    
    echo ""
}

# Função para mostrar comandos úteis
show_help() {
    echo -e "${BLUE}🛠️ USEFUL COMMANDS${NC}"
    echo "----------------------------------------"
    echo "View logs: cd /var/pinovara/current && docker-compose -f docker-compose.prod.yml logs -f"
    echo "Restart app: cd /var/pinovara/current && docker-compose -f docker-compose.prod.yml restart"
    echo "Check firewall: sudo ufw status"
    echo "Manual backup: sudo pinovara-backup"
    echo "Deploy: ./deploy-server.sh -e production -v latest"
    echo ""
}

# Função principal para modo contínuo
continuous_monitor() {
    while true; do
        clear_screen
        check_health
        check_containers
        check_system_resources
        check_network
        check_performance
        check_deployment_info
        
        echo -e "${YELLOW}Pressione Ctrl+C para sair, aguardando 10 segundos...${NC}"
        sleep 10
    done
}

# Função para modo snapshot
snapshot_monitor() {
    clear_screen
    check_health
    check_containers
    check_system_resources
    check_network
    check_ssl
    check_deployment_info
    check_performance
    check_recent_logs
    show_help
}

# Parsing de argumentos
case "${1:-continuous}" in
    continuous|c)
        continuous_monitor
        ;;
    snapshot|s)
        snapshot_monitor
        ;;
    health|h)
        check_health
        ;;
    resources|r)
        check_system_resources
        ;;
    logs|l)
        check_recent_logs
        ;;
    help|--help|-h)
        echo "Usage: $0 [mode]"
        echo ""
        echo "Modes:"
        echo "  continuous (default) - Monitor continuously with 10s updates"
        echo "  snapshot            - Show current status once"
        echo "  health              - Show only health status"
        echo "  resources           - Show only system resources"
        echo "  logs                - Show recent logs"
        echo ""
        ;;
    *)
        echo "Unknown mode: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac