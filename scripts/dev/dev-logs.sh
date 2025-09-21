#!/bin/bash

# ========== PINOVARA DEV LOGS VIEWER ==========
# Script para visualizar logs do ambiente de desenvolvimento

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função de ajuda
show_help() {
    echo -e "${BLUE}PINOVARA Dev Logs Viewer${NC}"
    echo ""
    echo "Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  backend, be     Mostrar apenas logs do backend"
    echo "  frontend, fe    Mostrar apenas logs do frontend"
    echo "  both, all       Mostrar logs de ambos os serviços (padrão)"
    echo "  help, -h        Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0              # Mostrar logs de ambos os serviços"
    echo "  $0 backend      # Mostrar apenas logs do backend"
    echo "  $0 fe           # Mostrar apenas logs do frontend"
}

# Verificar se o diretório de logs existe
if [ ! -d "logs" ]; then
    echo -e "${RED}[ERROR]${NC} Diretório de logs não encontrado!"
    echo "Execute primeiro: ./scripts/dev/dev-start.sh"
    exit 1
fi

# Função para mostrar logs com cor
show_backend_logs() {
    if [ -f "logs/backend.log" ]; then
        echo -e "${GREEN}[BACKEND]${NC} Acompanhando logs do backend..."
        tail -f logs/backend.log | sed "s/^/$(echo -e "${GREEN}[BACKEND]${NC}") /"
    else
        echo -e "${YELLOW}[WARNING]${NC} Arquivo de log do backend não encontrado"
    fi
}

show_frontend_logs() {
    if [ -f "logs/frontend.log" ]; then
        echo -e "${CYAN}[FRONTEND]${NC} Acompanhando logs do frontend..."
        tail -f logs/frontend.log | sed "s/^/$(echo -e "${CYAN}[FRONTEND]${NC}") /"
    else
        echo -e "${YELLOW}[WARNING]${NC} Arquivo de log do frontend não encontrado"
    fi
}

show_both_logs() {
    echo -e "${BLUE}"
    echo "========================================"
    echo "   PINOVARA - DEV LOGS (AMBOS)"
    echo "========================================"
    echo -e "${NC}"
    echo "Pressione Ctrl+C para sair"
    echo ""
    
    # Usar multitail se disponível, senão usar tail básico
    if command -v multitail &> /dev/null; then
        multitail \
            -ci green -t "BACKEND" logs/backend.log \
            -ci cyan -t "FRONTEND" logs/frontend.log
    else
        # Alternativa usando tail simples
        (
            if [ -f "logs/backend.log" ]; then
                tail -f logs/backend.log | sed "s/^/$(echo -e "${GREEN}[BACKEND]${NC}") /" &
            fi
            
            if [ -f "logs/frontend.log" ]; then
                tail -f logs/frontend.log | sed "s/^/$(echo -e "${CYAN}[FRONTEND]${NC}") /" &
            fi
            
            wait
        )
    fi
}

# Processar argumentos
case "${1:-all}" in
    backend|be)
        echo -e "${GREEN}"
        echo "========================================"
        echo "   PINOVARA - BACKEND LOGS"
        echo "========================================"
        echo -e "${NC}"
        echo "Pressione Ctrl+C para sair"
        echo ""
        show_backend_logs
        ;;
    frontend|fe)
        echo -e "${CYAN}"
        echo "========================================"
        echo "   PINOVARA - FRONTEND LOGS"
        echo "========================================"
        echo -e "${NC}"
        echo "Pressione Ctrl+C para sair"
        echo ""
        show_frontend_logs
        ;;
    both|all)
        show_both_logs
        ;;
    help|-h|--help)
        show_help
        exit 0
        ;;
    *)
        echo -e "${RED}[ERROR]${NC} Opção inválida: $1"
        echo ""
        show_help
        exit 1
        ;;
esac