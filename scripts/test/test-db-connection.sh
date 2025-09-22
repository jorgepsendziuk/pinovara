#!/bin/bash

# ========== TESTE DE CONEXÃO POSTGRESQL ==========
# Script para testar conectividade com banco remoto

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    echo -e "${BLUE}Teste de Conexão PostgreSQL${NC}"
    echo ""
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  -h, --host HOST        IP do servidor PostgreSQL"
    echo "  -p, --port PORT        Porta (padrão: 5432)"
    echo "  -d, --database DB      Nome do banco"
    echo "  -u, --user USER        Usuário"
    echo "  -w, --password PASS    Senha"
    echo "  --help                 Mostrar esta ajuda"
    echo ""
    echo "Exemplo:"
    echo "  $0 -h 192.168.1.100 -u postgres -d postgres"
}

# Valores padrão
HOST=""
PORT="5432"
DATABASE="postgres"
USER="postgres"
PASSWORD=""

# Parsing de argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            HOST="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -d|--database)
            DATABASE="$2"
            shift 2
            ;;
        -u|--user)
            USER="$2"
            shift 2
            ;;
        -w|--password)
            PASSWORD="$2"
            shift 2
            ;;
        --help)
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

# Verificar se HOST foi fornecido
if [ -z "$HOST" ]; then
    log_error "HOST é obrigatório!"
    show_help
    exit 1
fi

# Banner
echo -e "${BLUE}"
echo "========================================"
echo "   POSTGRESQL CONNECTION TEST"
echo "========================================"
echo -e "${NC}"

log_info "🔍 Testando conexão PostgreSQL..."
echo "  Host: $HOST"
echo "  Port: $PORT"  
echo "  Database: $DATABASE"
echo "  User: $USER"
echo ""

# Teste 1: Conectividade de rede
log_info "1️⃣ Testando conectividade de rede..."
if timeout 10 bash -c "</dev/tcp/$HOST/$PORT" 2>/dev/null; then
    log_success "✅ Porta $PORT está acessível em $HOST"
else
    log_error "❌ Não foi possível conectar na porta $PORT de $HOST"
    echo ""
    echo -e "${YELLOW}Possíveis problemas:${NC}"
    echo "  - Firewall bloqueando a porta"
    echo "  - PostgreSQL não está escutando em 0.0.0.0"
    echo "  - Servidor PostgreSQL não está rodando"
    echo ""
    echo -e "${BLUE}Verificações no servidor:${NC}"
    echo "  sudo netstat -tlnp | grep 5432"
    echo "  sudo systemctl status postgresql"
    echo "  sudo ufw status"
    exit 1
fi

# Teste 2: Conectividade PostgreSQL
log_info "2️⃣ Testando autenticação PostgreSQL..."

# Se não forneceu senha, perguntar
if [ -z "$PASSWORD" ]; then
    echo -n "Digite a senha para $USER: "
    read -s PASSWORD
    echo ""
fi

# Comando de teste
export PGPASSWORD="$PASSWORD"

# Testar conexão
if psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -c "SELECT version();" >/dev/null 2>&1; then
    log_success "✅ Autenticação PostgreSQL funcionando!"
    
    echo ""
    log_info "📊 Informações do servidor:"
    psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -c "SELECT version();" 2>/dev/null | head -3
    
    echo ""
    log_info "📋 Bancos de dados disponíveis:"
    psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -c "\\l" 2>/dev/null | head -10
    
else
    log_error "❌ Falha na autenticação PostgreSQL"
    echo ""
    echo -e "${YELLOW}Possíveis problemas:${NC}"
    echo "  - Senha incorreta"
    echo "  - Usuário não existe"
    echo "  - Configuração pg_hba.conf incorreta"
    echo "  - PostgreSQL não permite conexões MD5"
    echo ""
    echo -e "${BLUE}Verificações no servidor:${NC}"
    echo "  sudo -u postgres psql -c \"\\du\""  
    echo "  sudo tail /var/log/postgresql/postgresql-*-main.log"
    echo "  sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v '^#' | grep -v '^$'"
    exit 1
fi

# Teste 3: Teste específico do banco PINOVARA
log_info "3️⃣ Testando banco PINOVARA..."

if psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -c "SELECT 1;" >/dev/null 2>&1; then
    # Verificar se schema pinovara existe
    SCHEMA_EXISTS=$(psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -t -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'pinovara';" 2>/dev/null | xargs)
    
    if [ "$SCHEMA_EXISTS" = "1" ]; then
        log_success "✅ Schema 'pinovara' encontrado!"
    else
        log_warning "⚠️  Schema 'pinovara' não encontrado"
        echo "  Execute: CREATE SCHEMA IF NOT EXISTS pinovara;"
    fi
    
    # Verificar tabelas
    TABLE_COUNT=$(psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'pinovara';" 2>/dev/null | xargs)
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        log_success "✅ Encontradas $TABLE_COUNT tabelas no schema pinovara"
    else
        log_warning "⚠️  Nenhuma tabela encontrada no schema pinovara"
        echo "  Execute migrations: npx prisma db push"
    fi
fi

# Teste 4: Teste com STRING de conexão
log_info "4️⃣ Testando string de conexão..."

CONNECTION_STRING="postgresql://$USER:$PASSWORD@$HOST:$PORT/$DATABASE?schema=pinovara"
echo ""
echo -e "${GREEN}String de conexão para usar no backend:${NC}"
echo "DATABASE_URL=\"$CONNECTION_STRING\""

echo ""
echo -e "${BLUE}Para testar no backend:${NC}"
echo "cd backend"
echo "DATABASE_URL=\"$CONNECTION_STRING\" npm run dev"

echo ""
log_success "🎉 Teste de conexão concluído com sucesso!"

# Limpar variável de senha
unset PGPASSWORD

echo ""
echo -e "${GREEN}✅ Configuração PostgreSQL está funcionando!${NC}"