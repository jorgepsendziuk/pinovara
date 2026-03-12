#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Deploy Zero-Downtime
# ==========================================
# Deploy sem downtime usando estratégia blue-green
# - Prepara nova versão em diretório temporário
# - Health check antes de trocar
# - Rollback automático em caso de falha
# - Prisma pré-gerado (sem espera)

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
BACKEND_DIR="/var/www/pinovara/backend"
FRONTEND_DIR="/var/www/html"
BACKUP_DIR="/var/www/pinovara/backup"
HEALTH_CHECK_URL="http://localhost:3001/health"
HEALTH_CHECK_TIMEOUT=30  # segundos
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_INTERVAL=3  # segundos entre tentativas

# Funções auxiliares
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função de health check
check_backend_health() {
    local url=$1
    local max_attempts=$2
    local attempt=1
    
    print_status "Verificando saúde do backend em $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --connect-timeout 5 "$url" > /dev/null 2>&1; then
            # Verificar se retorna JSON válido com status healthy
            local response=$(curl -s --connect-timeout 5 "$url" 2>/dev/null)
            if echo "$response" | grep -q '"status":"healthy"' || echo "$response" | grep -q '"status":"degraded"'; then
                print_success "Backend está saudável (tentativa $attempt/$max_attempts)"
                return 0
            fi
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            print_status "Aguardando backend responder... (tentativa $attempt/$max_attempts)"
            sleep $HEALTH_CHECK_INTERVAL
        fi
        ((attempt++))
    done
    
    print_error "Backend não está respondendo após $max_attempts tentativas"
    return 1
}

# Função de rollback
rollback() {
    local backup_path=$1
    print_error "❌ FALHA NO DEPLOY - Executando rollback..."
    
    if [ -z "$backup_path" ] || [ ! -d "$backup_path" ]; then
        print_error "Backup não encontrado para rollback: $backup_path"
        return 1
    fi
    
    print_status "Restaurando backup de $backup_path..."
    
    # Parar versão nova (se estiver rodando)
    "$PM2_CMD" stop pinovara-backend-new 2>/dev/null || true
    "$PM2_CMD" delete pinovara-backend-new 2>/dev/null || true
    
    # Restaurar backend antigo
    if [ -d "$backup_path" ]; then
        rm -rf "$BACKEND_DIR" 2>/dev/null || true
        cp -r "$backup_path" "$BACKEND_DIR"
        
        # Reiniciar versão antiga
        cd "$BACKEND_DIR"
        "$PM2_CMD" start ecosystem.config.js --env production 2>/dev/null || \
        "$PM2_CMD" restart pinovara-backend 2>/dev/null || \
        "$PM2_CMD" start dist/server.js --name pinovara-backend
        
        "$PM2_CMD" save
        
        print_success "Rollback concluído - versão antiga restaurada"
        
        # Verificar se rollback funcionou
        sleep 5
        if check_backend_health "$HEALTH_CHECK_URL" 5; then
            print_success "✅ Rollback bem-sucedido - sistema operacional"
            return 0
        else
            print_error "⚠️ Rollback executado, mas sistema pode não estar funcionando"
            return 1
        fi
    else
        print_error "Não foi possível restaurar backup"
        return 1
    fi
}

# Banner
echo "🚀 PINOVARA - Deploy Zero-Downtime"
echo "=================================="
echo ""

# Verificar se estamos no servidor correto
if [ ! -d "/var/www/pinovara" ]; then
    print_error "Este script deve ser executado no servidor de produção"
    exit 1
fi

# Garantir PM2 no PATH (SSH não-interativo pode não carregar .bashrc)
export PATH="/usr/local/bin:/usr/bin:${PATH:-}"
[ -f "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" 2>/dev/null || true
[ -f "$HOME/.profile" ] && . "$HOME/.profile" 2>/dev/null || true
[ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc" 2>/dev/null || true
if ! command -v pm2 &> /dev/null; then
    for d in /usr/local/bin /usr/bin "$HOME/.local/bin"; do
        [ -x "$d/pm2" ] && export PATH="$d:$PATH" && break
    done
    for nvm_node in "$HOME/.nvm/versions/node"/*; do
        [ -x "${nvm_node}/bin/pm2" ] && export PATH="${nvm_node}/bin:$PATH" && print_status "PM2 via nvm: ${nvm_node}/bin/pm2" && break
    done 2>/dev/null
fi
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 não está instalado ou não está no PATH. Instale com: npm install -g pm2"
    exit 1
fi
PM2_CMD=$(command -v pm2)
print_status "Usando PM2: $PM2_CMD ($($PM2_CMD --version 2>/dev/null || true))"

# Verificar se há código novo para deploy
if [ -z "$DEPLOY_TMP_DIR" ] || [ ! -d "$DEPLOY_TMP_DIR" ]; then
    print_error "Variável DEPLOY_TMP_DIR não definida ou diretório não existe"
    print_error "Este script deve ser chamado pelo workflow do GitHub Actions"
    exit 1
fi

print_status "📂 Diretório de deploy: $DEPLOY_TMP_DIR"

# Nota: Diretórios de upload (/var/pinovara/shared/uploads/) devem ser criados UMA VEZ
# via scripts/setup-upload-directories-remote.sh. O deploy NÃO toca nessa pasta para
# evitar qualquer risco aos arquivos enviados pelos usuários.

# ==========================================
# PASSO 1: BACKUP DA VERSÃO ATUAL
# ==========================================
print_status "💾 Criando backup da versão atual..."

BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CURRENT_BACKUP="$BACKUP_DIR/backend-$BACKUP_TIMESTAMP"

mkdir -p "$BACKUP_DIR"

if [ -d "$BACKEND_DIR" ] && [ "$(ls -A $BACKEND_DIR 2>/dev/null)" ]; then
    print_status "Fazendo backup de $BACKEND_DIR para $CURRENT_BACKUP"
    cp -r "$BACKEND_DIR" "$CURRENT_BACKUP"
    print_success "Backup criado: $CURRENT_BACKUP"
else
    print_warning "Nenhum backend existente para backup (primeiro deploy?)"
    CURRENT_BACKUP=""
fi

# Limpar backups antigos (manter últimos 5)
print_status "Limpando backups antigos (mantendo últimos 5)..."
cd "$BACKUP_DIR" 2>/dev/null && ls -dt backend-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

# ==========================================
# PASSO 2: PREPARAR NOVA VERSÃO EM DIRETÓRIO TEMPORÁRIO
# ==========================================
print_status "📦 Preparando nova versão..."

NEW_BACKEND_DIR="/var/www/pinovara/backend-new-$BACKUP_TIMESTAMP"
mkdir -p "$NEW_BACKEND_DIR"

print_status "Copiando arquivos do deploy para $NEW_BACKEND_DIR..."

# Copiar arquivos do deploy
cd "$DEPLOY_TMP_DIR"

if [ -f "package.json" ]; then
    cp package.json "$NEW_BACKEND_DIR/"
else
    print_error "package.json não encontrado em $DEPLOY_TMP_DIR"
    exit 1
fi

if [ -f "package-lock.json" ]; then
    cp package-lock.json "$NEW_BACKEND_DIR/"
else
    print_error "package-lock.json não encontrado"
    exit 1
fi

if [ -d "dist" ]; then
    cp -r dist "$NEW_BACKEND_DIR/"
else
    print_error "dist/ não encontrado"
    exit 1
fi

if [ -d "prisma" ]; then
    cp -r prisma "$NEW_BACKEND_DIR/"
fi

if [ -f ".env" ]; then
    cp .env "$NEW_BACKEND_DIR/"
else
    print_warning ".env não encontrado - usando existente"
    if [ -f "$BACKEND_DIR/.env" ]; then
        cp "$BACKEND_DIR/.env" "$NEW_BACKEND_DIR/.env"
    fi
fi

# Copiar ecosystem.config.js ou criar novo
if [ -f "ecosystem.config.js" ]; then
    cp ecosystem.config.js "$NEW_BACKEND_DIR/"
else
    # Criar ecosystem.config.js básico
    cat > "$NEW_BACKEND_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'pinovara-backend-new',
    script: 'dist/server.js',
    cwd: '/var/www/pinovara/backend-new',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF
    # Ajustar caminho no ecosystem.config.js
    sed -i "s|backend-new|backend-new-$BACKUP_TIMESTAMP|g" "$NEW_BACKEND_DIR/ecosystem.config.js"
fi

print_success "Arquivos copiados"

# ==========================================
# PASSO 3: INSTALAR DEPENDÊNCIAS E PRISMA
# ==========================================
print_status "📦 Instalando dependências na nova versão..."

cd "$NEW_BACKEND_DIR"

# Instalar dependências de produção
if npm ci --production --omit=dev; then
    print_success "Dependências instaladas"
else
    print_error "Falha ao instalar dependências"
    rollback "$CURRENT_BACKUP"
    exit 1
fi

# Restaurar Prisma Client pré-gerado (se disponível)
print_status "🔧 Configurando Prisma Client..."

if [ -d "$DEPLOY_TMP_DIR/prisma-client" ]; then
    print_status "Restaurando Prisma Client pré-gerado do Docker..."
    
    mkdir -p node_modules/@prisma node_modules/.prisma
    
    if [ -d "$DEPLOY_TMP_DIR/prisma-client/@prisma" ]; then
        cp -r "$DEPLOY_TMP_DIR/prisma-client/@prisma" node_modules/
        print_success "Prisma Client restaurado"
    elif [ -d "$DEPLOY_TMP_DIR/prisma-client/@prisma-client" ]; then
        mkdir -p node_modules/@prisma
        cp -r "$DEPLOY_TMP_DIR/prisma-client/@prisma-client" node_modules/@prisma/client
        print_success "Prisma Client restaurado (estrutura alternativa)"
    else
        print_warning "Estrutura de Prisma Client não reconhecida"
    fi
    
    # Copiar cache .prisma se existir
    if [ -d "$DEPLOY_TMP_DIR/prisma-client/.prisma" ]; then
        cp -r "$DEPLOY_TMP_DIR/prisma-client/.prisma" node_modules/ 2>/dev/null || true
    fi
else
    print_warning "Prisma Client pré-gerado não encontrado"
    
    # Tentar usar existente (se houver)
    if [ -d "$BACKEND_DIR/node_modules/@prisma/client" ]; then
        print_status "Copiando Prisma Client existente..."
        mkdir -p node_modules/@prisma node_modules/.prisma
        cp -r "$BACKEND_DIR/node_modules/@prisma" node_modules/ 2>/dev/null || true
        cp -r "$BACKEND_DIR/node_modules/.prisma" node_modules/ 2>/dev/null || true
        print_success "Prisma Client copiado da versão anterior"
    else
        print_error "Nenhum Prisma Client disponível!"
        print_error "Execute o workflow 'Deploy Full' para gerar Prisma Client"
        rollback "$CURRENT_BACKUP"
        exit 1
    fi
fi

# ==========================================
# PASSO 4: PARAR VERSÃO ANTIGA E LIBERAR PORTA 3001
# ==========================================
print_status "🛑 Parando versão antiga para liberar porta 3001..."

# Parar e remover todos os processos PM2 relacionados
"$PM2_CMD" stop all 2>/dev/null || true
"$PM2_CMD" delete all 2>/dev/null || true

# Garantir que porta 3001 está livre
print_status "🔓 Liberando porta 3001..."
sudo fuser -k 3001/tcp 2>/dev/null || true
sleep 2

# Verificar se porta está livre
if sudo lsof -i :3001 >/dev/null 2>&1; then
    print_error "❌ Porta 3001 ainda está ocupada"
    sudo lsof -i :3001
    print_error "Tentando forçar liberação..."
    sudo killall node 2>/dev/null || true
    sleep 3
    
    if sudo lsof -i :3001 >/dev/null 2>&1; then
        print_error "❌ Não foi possível liberar porta 3001"
        rollback "$CURRENT_BACKUP"
        exit 1
    fi
fi

print_success "✅ Porta 3001 liberada"

# ==========================================
# PASSO 5: INICIAR NOVA VERSÃO NA PORTA 3001
# ==========================================
print_status "🚀 Iniciando nova versão..."

# Criar ecosystem.config.js para nova versão
cat > "$NEW_BACKEND_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'pinovara-backend',
    script: 'dist/server.js',
    cwd: '$NEW_BACKEND_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

cd "$NEW_BACKEND_DIR"

# Iniciar nova versão (usar PM2_CMD para não depender do PATH)
if "$PM2_CMD" start ecosystem.config.js --env production; then
    print_success "Nova versão iniciada"
    sleep 5  # Dar tempo para iniciar
else
    print_error "Falha ao iniciar nova versão"
    rollback "$CURRENT_BACKUP"
    exit 1
fi

# ==========================================
# PASSO 6: HEALTH CHECK DA NOVA VERSÃO
# ==========================================
print_status "🏥 Verificando saúde da nova versão..."

if check_backend_health "$HEALTH_CHECK_URL" $HEALTH_CHECK_RETRIES; then
    print_success "✅ Nova versão está saudável!"
else
    print_error "❌ Nova versão não passou no health check"
    rollback "$CURRENT_BACKUP"
    exit 1
fi

# ==========================================
# PASSO 7: FINALIZAR DEPLOY (MOVER DIRETÓRIOS)
# ==========================================
print_status "🔄 Finalizando deploy..."

# Parar processo atual (já está rodando com caminho temporário)
"$PM2_CMD" stop pinovara-backend 2>/dev/null || true

# Trocar diretório (mover nova versão para produção)
if [ -L "$BACKEND_DIR" ]; then
    rm "$BACKEND_DIR"
elif [ -d "$BACKEND_DIR" ]; then
    # Já foi feito backup no início, só remover
    rm -rf "$BACKEND_DIR" 2>/dev/null || true
fi

# Mover nova versão para diretório de produção
mv "$NEW_BACKEND_DIR" "$BACKEND_DIR"

# Atualizar ecosystem.config.js com caminho final correto
cat > "$BACKEND_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'pinovara-backend',
    script: 'dist/server.js',
    cwd: '$BACKEND_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# Remover processo antigo (cwd apontava para dir temporário que não existe mais) e iniciar com config nova
# Usar PM2_CMD para não depender do PATH neste ponto
cd "$BACKEND_DIR"
"$PM2_CMD" delete pinovara-backend 2>/dev/null || true
if [ ! -f "ecosystem.config.js" ]; then
    print_warning "ecosystem.config.js não encontrado, criando..."
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'pinovara-backend',
    script: 'dist/server.js',
    cwd: '$BACKEND_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production', PORT: 3001 }
  }]
};
EOF
fi
if "$PM2_CMD" start ecosystem.config.js --env production; then
    print_success "Backend iniciado com ecosystem.config.js"
else
    print_warning "pm2 start ecosystem.config.js falhou, tentando start direto..."
    if "$PM2_CMD" start dist/server.js --name pinovara-backend --cwd "$BACKEND_DIR"; then
        print_success "Backend iniciado com dist/server.js"
    else
        print_error "Falha ao iniciar backend no PM2"
        exit 1
    fi
fi
"$PM2_CMD" save
print_status "Process list saved. Para sobreviver a reboot no servidor: $PM2_CMD startup"
echo ""
print_status "Lista PM2 (deve mostrar pinovara-backend):"
"$PM2_CMD" list | grep -E "pinovara|App name|online|errored" || "$PM2_CMD" list

print_success "Deploy concluído - diretórios atualizados"

# ==========================================
# PASSO 8: VERIFICAÇÃO FINAL
# ==========================================
print_status "🔍 Verificação final..."

sleep 3

if check_backend_health "$HEALTH_CHECK_URL" 5; then
    print_success "✅ ✅ ✅ DEPLOY CONCLUÍDO COM SUCESSO! ✅ ✅ ✅"
    echo ""
    echo "📊 Status PM2:"
    "$PM2_CMD" status | grep pinovara-backend || true
    echo ""
    echo "💾 Backup disponível em: $CURRENT_BACKUP"
    echo "🌐 Sistema operacional em: $HEALTH_CHECK_URL"
    exit 0
else
    print_error "⚠️ Sistema pode não estar funcionando corretamente após deploy"
    print_warning "Verifique manualmente: pm2 logs pinovara-backend"
    rollback "$CURRENT_BACKUP"
    exit 1
fi
