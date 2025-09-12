#!/bin/bash

# Script de configuração da VM para PINOVARA
# Execute como root ou com sudo

set -e

echo "🚀 Configurando VM para PINOVARA..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# Verificar instalação do PM2
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 instalado com sucesso"
    pm2 --version
else
    echo "❌ Falha na instalação do PM2"
    exit 1
fi

# Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Configurar PostgreSQL básico
echo "🗄️ Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE pinovara;" || true
sudo -u postgres psql -c "CREATE USER pinovara_user WITH PASSWORD 'sua_senha_segura_aqui';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pinovara TO pinovara_user;" || true

# Instalar Nginx (opcional, mas recomendado)
echo "📦 Instalando Nginx..."
sudo apt install -y nginx

# Configurar Nginx básico
sudo tee /etc/nginx/sites-available/pinovara << 'EOF'
server {
    listen 80;
    server_name pinovaraufba.com.br www.pinovaraufba.com.br;

    # Logs detalhados para debug
    access_log /var/log/nginx/pinovara_access.log;
    error_log /var/log/nginx/pinovara_error.log;

    # Configurações de segurança básicas
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend - React SPA
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;

        # Cache estático otimizado
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # Gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json;
    }

    # Backend API - Proxy reverso
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }

    # Segurança - bloquear arquivos sensíveis
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.(env|git) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Habilitar site
sudo ln -sf /etc/nginx/sites-available/pinovara /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Otimizar Nginx para produção
sudo tee /etc/nginx/nginx.conf > /dev/null << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Testar configuração do Nginx
echo "🧪 Testando configuração do Nginx..."
sudo nginx -t

# Criar diretório de logs
sudo mkdir -p /var/log/nginx

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configurado com sucesso!"
echo ""
echo "📋 Para configurar HTTPS/SSL (opcional):"
echo "1. Instalar certbot: sudo apt install certbot python3-certbot-nginx"
echo "2. Obter certificado: sudo certbot --nginx -d pinovaraufba.com.br"
echo "3. Testar renovação: sudo certbot renew --dry-run"

# Criar diretórios necessários
echo "📁 Criando diretórios..."
sudo mkdir -p /var/www/pinovara
sudo mkdir -p /var/www/html
sudo chown -R $USER:$USER /var/www

# Configurar firewall básico
echo "🔥 Configurando firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "✅ Configuração básica concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as secrets no GitHub Actions:"
echo "   - SSH_PRIVATE_KEY"
echo "   - SERVER_HOST: pinovaraufba.com.br"
echo "   - SERVER_USER: $USER"
echo ""
echo "2. Atualize o DATABASE_URL no arquivo config.env:"
echo "   DATABASE_URL=\"postgresql://pinovara_user:sua_senha_segura_aqui@localhost:5432/pinovara\""
echo ""
echo "3. Configure JWT_SECRET e outras variáveis de ambiente"
echo ""
echo "4. Faça push na branch main para iniciar o deploy automático"
