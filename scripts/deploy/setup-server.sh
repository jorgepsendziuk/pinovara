#!/bin/bash

# ========== PINOVARA SERVER SETUP ==========
# Script para configuração inicial do servidor de produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "========================================"
echo "   PINOVARA - SERVER SETUP"
echo "========================================"
echo -e "${NC}"

# Verificar se é Ubuntu/Debian
if ! command -v apt-get &> /dev/null; then
    log_error "Este script é para sistemas Ubuntu/Debian"
    exit 1
fi

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script deve ser executado como root (sudo)"
   exit 1
fi

# Função para atualizar o sistema
update_system() {
    log_step "Atualizando sistema..."
    
    apt-get update
    apt-get upgrade -y
    apt-get autoremove -y
    
    log_success "Sistema atualizado"
}

# Função para instalar dependências básicas
install_dependencies() {
    log_step "Instalando dependências básicas..."
    
    apt-get install -y \
        curl \
        wget \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        ufw \
        fail2ban \
        htop \
        nano \
        vim \
        tree \
        jq
    
    log_success "Dependências básicas instaladas"
}

# Função para instalar Docker
install_docker() {
    log_step "Instalando Docker..."
    
    # Remover versões antigas
    apt-get remove -y docker docker-engine docker.io containerd runc || true
    
    # Adicionar repositório oficial do Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Habilitar Docker no boot
    systemctl enable docker
    systemctl start docker
    
    # Adicionar usuário ao grupo docker
    usermod -aG docker $SUDO_USER || true
    
    log_success "Docker instalado"
}

# Função para instalar Docker Compose
install_docker_compose() {
    log_step "Instalando Docker Compose..."
    
    # Instalar versão mais recente
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    chmod +x /usr/local/bin/docker-compose
    
    # Criar link simbólico
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose instalado (${DOCKER_COMPOSE_VERSION})"
}

# Função para instalar Node.js (para scripts auxiliares)
install_nodejs() {
    log_step "Instalando Node.js..."

    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs

    log_success "Node.js instalado ($(node --version))"
}

# Função para configurar firewall
setup_firewall() {
    log_step "Configurando firewall..."
    
    # Reset UFW para estado padrão
    ufw --force reset
    
    # Configurações básicas
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH (importante!)
    ufw allow ssh
    ufw allow 22/tcp
    
    # Permitir HTTP e HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Permitir portas da aplicação (apenas localmente se necessário)
    # ufw allow from 127.0.0.1 to any port 3001
    
    # Habilitar firewall
    ufw --force enable
    
    log_success "Firewall configurado"
}

# Função para configurar fail2ban
setup_fail2ban() {
    log_step "Configurando Fail2Ban..."
    
    # Configuração básica do Fail2Ban
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 1d

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF
    
    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log_success "Fail2Ban configurado"
}

# Função para criar usuário de deploy
create_deploy_user() {
    log_step "Configurando usuário de deploy..."
    
    # Criar usuário pinovara se não existir
    if ! id "pinovara" &>/dev/null; then
        useradd -m -s /bin/bash pinovara
        usermod -aG docker pinovara
        usermod -aG sudo pinovara
        log_info "Usuário pinovara criado"
    else
        log_info "Usuário pinovara já existe"
    fi
    
    # Criar estrutura de diretórios
    mkdir -p /var/pinovara
    chown -R pinovara:pinovara /var/pinovara
    
    log_success "Usuário de deploy configurado"
}

# Função para configurar SSL (Let's Encrypt)
setup_ssl() {
    log_step "Configurando certificados SSL..."
    
    # Instalar Certbot
    apt-get install -y certbot python3-certbot-nginx
    
    # Criar diretório para certificados
    mkdir -p /var/pinovara/shared/ssl
    
    log_info "Certbot instalado. Para obter certificados SSL:"
    echo "  1. Configure o nginx primeiro"
    echo "  2. Execute: certbot --nginx -d yourdomain.com"
    echo "  3. Configure renovação automática no cron"
    
    # Configurar renovação automática
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log_success "SSL configurado (certificates precisam ser obtidos manualmente)"
}

# Função para configurar Nginx
install_nginx() {
    log_step "Instalando Nginx..."
    
    apt-get install -y nginx
    
    # Habilitar no boot
    systemctl enable nginx
    systemctl start nginx
    
    # Configuração básica de segurança
    cat > /etc/nginx/conf.d/security.conf << 'EOF'
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# Hide nginx version
server_tokens off;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/xml+rss
    application/javascript
    application/json;
EOF
    
    log_success "Nginx instalado"
}

# Função para configurar monitoramento básico
setup_monitoring() {
    log_step "Configurando monitoramento básico..."
    
    # Instalar ferramentas de monitoramento
    apt-get install -y \
        htop \
        iotop \
        nethogs \
        ncdu \
        tree
    
    # Script de health check
    cat > /usr/local/bin/pinovara-health << 'EOF'
#!/bin/bash
echo "=== PINOVARA Health Check ==="
echo "Date: $(date)"
echo ""
echo "=== System Info ==="
echo "Uptime: $(uptime)"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h / | tail -1)"
echo ""
echo "=== Docker Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== Service Status ==="
if [ -f /var/pinovara/current/docker-compose.prod.yml ]; then
    cd /var/pinovara/current
    docker-compose -f docker-compose.prod.yml ps
fi
EOF
    
    chmod +x /usr/local/bin/pinovara-health
    
    log_success "Monitoramento básico configurado"
}

# Função para configurar backup automático
setup_backup() {
    log_step "Configurando sistema de backup..."
    
    # Script de backup
    cat > /usr/local/bin/pinovara-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/pinovara/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup do banco de dados
if docker ps | grep -q postgres; then
    CONTAINER=$(docker ps | grep postgres | awk '{print $1}')
    docker exec $CONTAINER pg_dump -U pinovara_user pinovara_db > "$BACKUP_DIR/db_backup_${TIMESTAMP}.sql"
    echo "Database backup created: db_backup_${TIMESTAMP}.sql"
fi

# Limpar backups antigos (manter 7 dias)
find "$BACKUP_DIR" -name "db_backup_*.sql" -mtime +7 -delete

# Backup dos arquivos de configuração
tar -czf "$BACKUP_DIR/config_backup_${TIMESTAMP}.tar.gz" \
    /var/pinovara/shared \
    /etc/nginx/sites-available \
    /etc/nginx/conf.d \
    2>/dev/null || true

echo "Backup completed: $(date)"
EOF
    
    chmod +x /usr/local/bin/pinovara-backup
    
    # Configurar cron para backup diário
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/pinovara-backup") | crontab -
    
    log_success "Sistema de backup configurado"
}

# Função para configurar logs
setup_logging() {
    log_step "Configurando sistema de logs..."
    
    # Configurar logrotate para logs da aplicação
    cat > /etc/logrotate.d/pinovara << 'EOF'
/var/pinovara/shared/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 pinovara pinovara
    postrotate
        docker kill -s USR1 $(docker ps -q --filter name=pinovara) 2>/dev/null || true
    endscript
}
EOF
    
    # Criar diretório de logs
    mkdir -p /var/pinovara/shared/logs
    chown -R pinovara:pinovara /var/pinovara/shared/logs
    
    log_success "Sistema de logs configurado"
}

# Função para otimizar o sistema
optimize_system() {
    log_step "Otimizando sistema..."
    
    # Configurar limites de sistema
    cat >> /etc/security/limits.conf << 'EOF'
# PINOVARA optimizations
* soft nofile 65536
* hard nofile 65536
* soft nproc 4096
* hard nproc 4096
EOF
    
    # Configurar kernel parameters
    cat >> /etc/sysctl.conf << 'EOF'
# PINOVARA network optimizations
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 10
EOF
    
    # Aplicar configurações
    sysctl -p
    
    log_success "Sistema otimizado"
}

# Função para configurar SSH (securização)
secure_ssh() {
    log_step "Configurando SSH seguro..."
    
    # Backup da configuração SSH
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Aplicar configurações de segurança SSH
    cat >> /etc/ssh/sshd_config << 'EOF'

# PINOVARA SSH Security
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
EOF
    
    # Reiniciar SSH
    systemctl restart sshd
    
    log_warning "SSH foi configurado para maior segurança:"
    echo "  - Root login desabilitado"
    echo "  - Apenas autenticação por chave pública"
    echo "  - Certifique-se de ter suas chaves SSH configuradas!"
    
    log_success "SSH configurado com segurança"
}

# Função principal
main() {
    log_info "Iniciando configuração do servidor PINOVARA..."
    echo ""
    
    # Atualizar sistema
    update_system
    
    # Instalar dependências
    install_dependencies
    install_docker
    install_docker_compose
    install_nodejs
    install_nginx
    
    # Configurar segurança
    setup_firewall
    setup_fail2ban
    secure_ssh
    
    # Configurar aplicação
    create_deploy_user
    setup_ssl
    
    # Configurar monitoramento e backup
    setup_monitoring
    setup_backup
    setup_logging
    
    # Otimizar sistema
    optimize_system
    
    echo ""
    echo -e "${GREEN}"
    echo "========================================"
    echo "   SERVIDOR CONFIGURADO COM SUCESSO!"
    echo "========================================"
    echo -e "${NC}"
    echo ""
    echo "📋 Próximos passos:"
    echo "  1. Configurar chaves SSH para acesso seguro"
    echo "  2. Obter certificados SSL: certbot --nginx -d yourdomain.com"
    echo "  3. Configurar DNS apontando para este servidor"
    echo "  4. Executar primeiro deploy: ./deploy-server.sh -e production -v latest"
    echo ""
    echo "🛠️ Ferramentas disponíveis:"
    echo "  - pinovara-health    # Verificar status do sistema"
    echo "  - pinovara-backup    # Executar backup manual"
    echo "  - docker-compose     # Gerenciar containers"
    echo "  - ufw status         # Status do firewall"
    echo ""
    echo "📁 Estrutura criada:"
    echo "  - /var/pinovara/     # Diretório principal"
    echo "  - /var/pinovara/backups/     # Backups automáticos"
    echo "  - /var/pinovara/shared/      # Arquivos compartilhados"
    echo ""
    
    log_success "Setup completo! Reinicie o sistema para garantir que todas as configurações sejam aplicadas."
}

# Executar setup
main