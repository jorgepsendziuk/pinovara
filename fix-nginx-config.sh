#!/bin/bash

# ==========================================
# 🔧 PINOVARA - Corrigir Configuração Nginx
# ==========================================
# Cria/corrige configuração do Nginx para funcionar com frontend e backend

echo "🔧 Corrigindo configuração do Nginx..."

# 1. Fazer backup da configuração atual
if [ -f "/etc/nginx/sites-available/pinovaraufba.com.br" ]; then
    echo "📋 Fazendo backup da configuração atual..."
    sudo cp /etc/nginx/sites-available/pinovaraufba.com.br /etc/nginx/sites-available/pinovaraufba.com.br.backup
    echo "✅ Backup criado"
fi

# 2. Criar configuração correta
echo "⚙️ Criando configuração correta..."
sudo tee /etc/nginx/sites-available/pinovaraufba.com.br << 'EOF'
server {
    listen 80;
    listen 443 ssl http2;
    server_name pinovaraufba.com.br www.pinovaraufba.com.br;

    root /var/www/html;
    index index.html;

    # Frontend - servir arquivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/pinovaraufba.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pinovaraufba.com.br/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # API Proxy - redirecionar /api/* para backend
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
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Auth Proxy - redirecionar /auth/* para backend
    location /auth/ {
        proxy_pass http://localhost:3001/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Admin Proxy - redirecionar /admin/* para backend
    location /admin/ {
        proxy_pass http://localhost:3001/admin/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Users Proxy - redirecionar /users/* para backend
    location /users/ {
        proxy_pass http://localhost:3001/users/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Modules Proxy - redirecionar /modules/* para backend
    location /modules/ {
        proxy_pass http://localhost:3001/modules/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Organizacoes Proxy - redirecionar /organizacoes/* para backend
    location /organizacoes/ {
        proxy_pass http://localhost:3001/organizacoes/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Health check direto
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://pinovaraufba.com.br" always;
        add_header Access-Control-Allow-Credentials "true" always;
    }

    # Arquivos estáticos com cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/pinovaraufba_access.log;
    error_log /var/log/nginx/pinovaraufba_error.log;
}
EOF

echo "✅ Configuração criada"

# 3. Habilitar site
echo "🔗 Habilitando site..."
sudo ln -sf /etc/nginx/sites-available/pinovaraufba.com.br /etc/nginx/sites-enabled/

# 4. Remover site padrão se existir
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "🗑️ Removendo site padrão..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# 5. Testar configuração
echo "🧪 Testando configuração..."
if sudo nginx -t; then
    echo "✅ Configuração válida"
else
    echo "❌ Erro na configuração"
    exit 1
fi

# 6. Recarregar Nginx
echo "🔄 Recarregando Nginx..."
sudo systemctl reload nginx

# 7. Verificar status
echo "📊 Verificando status..."
sudo systemctl status nginx --no-pager -l | head -3

# 8. Copiar frontend se necessário
echo "🌐 Verificando frontend..."
if [ ! -d "/var/www/html" ] || [ ! "$(ls -A /var/www/html)" ]; then
    echo "📋 Copiando frontend..."
    sudo cp -r /var/www/pinovara/frontend/dist/* /var/www/html/
    sudo chown -R www-data:www-data /var/www/html
    echo "✅ Frontend copiado"
fi

# 9. Testar endpoints
echo ""
echo "🧪 Testando endpoints..."
echo "🔍 Health check via Nginx:"
curl -s https://pinovaraufba.com.br/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/health

echo ""
echo "🔍 API via Nginx:"
curl -s https://pinovaraufba.com.br/api/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/api/health

echo ""
echo "🔍 Auth endpoint:"
curl -s -X POST https://pinovaraufba.com.br/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test"}' | jq . 2>/dev/null || curl -s -X POST https://pinovaraufba.com.br/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test"}'

echo ""
echo "🎉 Configuração do Nginx corrigida!"
echo "🌐 Site: https://pinovaraufba.com.br"
echo "🔧 API: https://pinovaraufba.com.br/api/"
echo "🔐 Auth: https://pinovaraufba.com.br/auth/"
echo "👑 Admin: https://pinovaraufba.com.br/admin/"
echo "👥 Users: https://pinovaraufba.com.br/users/"
echo "📦 Modules: https://pinovaraufba.com.br/modules/"
echo "🏢 Organizacoes: https://pinovaraufba.com.br/organizacoes/"
echo "❤️ Health: https://pinovaraufba.com.br/health"
echo ""
echo "🔍 Para verificar logs:"
echo "sudo tail -f /var/log/nginx/pinovaraufba_error.log"
