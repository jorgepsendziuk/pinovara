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

    # Frontend
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
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
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
EOF

# Habilitar site
sudo ln -sf /etc/nginx/sites-available/pinovara /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

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
