#!/bin/bash

# ==========================================
# 🔐 PINOVARA - Corrigir Permissões no Servidor
# ==========================================
# Resolve problemas de permissão no diretório frontend

if [ $# -lt 2 ]; then
    echo "Usage: $0 <server> <user> [port]"
    echo "Example: $0 pinovaraufba.com.br root 22"
    exit 1
fi

SERVER_HOST=$1
SERVER_USER=$2
SERVER_PORT=${3:-22}

echo "Fixing permissions on $SERVER_USER@$SERVER_HOST:$SERVER_PORT..."

# Fix permissions on server
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
echo "🔧 Fixing permissions..."

# Create directories
sudo mkdir -p /var/www/pinovara/frontend
sudo mkdir -p /var/www/pinovara/backend

# Fix ownership
sudo chown -R $USER:$USER /var/www/pinovara/frontend 2>/dev/null || true
sudo chown -R $USER:$USER /var/www/pinovara/backend 2>/dev/null || true

# Fix permissions
sudo chmod -R 755 /var/www/pinovara/frontend 2>/dev/null || true
sudo chmod -R 755 /var/www/pinovara/backend 2>/dev/null || true

# Clean dist directories
rm -rf /var/www/pinovara/frontend/dist 2>/dev/null || true
rm -rf /var/www/pinovara/backend/dist 2>/dev/null || true

# Recreate dist directories with correct permissions
mkdir -p /var/www/pinovara/frontend/dist
mkdir -p /var/www/pinovara/backend/dist

echo "✅ Permissions fixed!"
echo "📁 Frontend dist: $(ls -la /var/www/pinovara/frontend/dist 2>/dev/null || echo 'Created')"
echo "📁 Backend dist: $(ls -la /var/www/pinovara/backend/dist 2>/dev/null || echo 'Created')"
EOF

echo "Permissions fix completed on server!"
