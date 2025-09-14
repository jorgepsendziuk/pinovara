#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Iniciar Produção
# ==========================================
# Copia arquivos para Nginx e inicia backend

echo "🚀 Starting PINOVARA production..."

# Fix permissions for web server
echo "🔐 Setting web server permissions..."
sudo chown -R www-data:www-data /var/www/html 2>/dev/null || true
sudo chmod -R 755 /var/www/html 2>/dev/null || true

# Copy frontend files to Nginx
echo "🌐 Copying frontend to Nginx..."
if [ -d "/var/www/pinovara/frontend/dist" ]; then
    sudo cp -r /var/www/pinovara/frontend/dist/* /var/www/html/ 2>/dev/null || true
    sudo rm -rf /var/www/html/backend-dist 2>/dev/null || true
    sudo rm -rf /var/www/html/backend-package.json 2>/dev/null || true
    sudo rm -rf /var/www/html/package-lock.json 2>/dev/null || true
    echo "✅ Frontend deployed to Nginx"
else
    echo "⚠️  Frontend dist not found, skipping..."
fi

# Start backend with PM2
echo "🔧 Starting backend..."
cd /var/www/pinovara/backend

# Kill any existing processes
pm2 delete pinovara-backend 2>/dev/null || true

# Start the application
if [ -f "dist/server.js" ]; then
    pm2 start dist/server.js --name pinovara-backend
    pm2 save
    echo "✅ Backend started with PM2"
else
    echo "❌ Backend dist/server.js not found!"
    echo "Run build first: ./build-server-direct.sh backend"
    exit 1
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx 2>/dev/null || echo "⚠️  Could not reload Nginx"

# Show status
echo ""
echo "🎉 Production started!"
echo "🌐 Frontend: https://pinovaraufba.com.br"
echo "🔧 Backend: https://pinovaraufba.com.br/api/"
echo "❤️ Health: https://pinovaraufba.com.br/health"
echo ""
echo "📊 Status check:"
pm2 status
echo ""
echo "🖥️  Nginx status:"
sudo systemctl status nginx --no-pager -l | head -10
