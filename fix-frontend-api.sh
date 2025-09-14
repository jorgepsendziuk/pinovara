#!/bin/bash

# ==========================================
# 🔧 PINOVARA - Corrigir Frontend API
# ==========================================
# Corrige problemas de comunicação frontend-backend

echo "🔧 Corrigindo comunicação frontend-backend..."

# 1. Verificar se frontend está no Nginx
echo "1️⃣ Verificando frontend no Nginx..."
if [ -d "/var/www/html" ] && [ "$(ls -A /var/www/html)" ]; then
    echo "✅ Frontend encontrado em /var/www/html"
    ls -la /var/www/html/ | head -5
else
    echo "❌ Frontend não encontrado em /var/www/html"
    echo "📋 Copiando frontend para Nginx..."
    sudo cp -r /var/www/pinovara/frontend/dist/* /var/www/html/
    sudo chown -R www-data:www-data /var/www/html
    echo "✅ Frontend copiado"
fi

# 2. Verificar configuração do Nginx
echo ""
echo "2️⃣ Verificando configuração do Nginx..."
if [ -f "/etc/nginx/sites-available/pinovaraufba.com.br" ]; then
    echo "✅ Configuração do Nginx encontrada"
    echo "📄 Verificando proxy para API..."
    grep -A 5 -B 5 "location /api" /etc/nginx/sites-available/pinovaraufba.com.br
else
    echo "❌ Configuração do Nginx não encontrada"
    echo "📋 Criando configuração básica..."
    sudo tee /etc/nginx/sites-available/pinovaraufba.com.br << 'EOF'
server {
    listen 80;
    listen 443 ssl http2;
    server_name pinovaraufba.com.br www.pinovaraufba.com.br;

    root /var/www/html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    sudo ln -sf /etc/nginx/sites-available/pinovaraufba.com.br /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Configuração do Nginx criada"
fi

# 3. Verificar se backend está rodando
echo ""
echo "3️⃣ Verificando status do backend..."
if pm2 list | grep -q "pinovara-backend"; then
    echo "✅ Backend rodando no PM2"
    pm2 list | grep pinovara-backend
else
    echo "❌ Backend não encontrado no PM2"
    echo "📋 Iniciando backend..."
    cd /var/www/pinovara/backend
    pm2 start dist/server.js --name pinovara-backend
    pm2 save
    echo "✅ Backend iniciado"
fi

# 4. Testar endpoints
echo ""
echo "4️⃣ Testando endpoints..."

echo "🔍 Testando health check direto:"
curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health

echo ""
echo "🔍 Testando health check via Nginx:"
curl -s https://pinovaraufba.com.br/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/health

echo ""
echo "🔍 Testando API via Nginx:"
curl -s https://pinovaraufba.com.br/api/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/api/health

# 5. Verificar logs
echo ""
echo "5️⃣ Verificando logs..."
echo "📋 Logs do PM2:"
pm2 logs pinovara-backend --lines 5

echo ""
echo "📋 Logs do Nginx:"
sudo tail -5 /var/log/nginx/error.log

# 6. Verificar CORS no backend
echo ""
echo "6️⃣ Verificando configuração CORS..."
cd /var/www/pinovara/backend
if grep -q "pinovaraufba.com.br" src/server.ts; then
    echo "✅ CORS configurado para pinovaraufba.com.br"
    grep -A 10 -B 5 "pinovaraufba.com.br" src/server.ts
else
    echo "❌ CORS não configurado para pinovaraufba.com.br"
    echo "📋 Verificando configuração atual..."
    grep -A 10 -B 5 "cors" src/server.ts
fi

echo ""
echo "🎯 Próximos passos se ainda não funcionar:"
echo "1. Verificar se SSL está configurado corretamente"
echo "2. Verificar se firewall permite porta 3001"
echo "3. Verificar se frontend está fazendo chamadas para /api/"
echo "4. Verificar console do navegador para erros CORS"
