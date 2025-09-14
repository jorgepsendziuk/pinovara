#!/bin/bash

# ==========================================
# 🔧 PINOVARA - Corrigir TypeScript no Servidor
# ==========================================
# Resolve problemas de build relacionados ao TypeScript

if [ $# -lt 2 ]; then
    echo "Usage: $0 <server> <user> [port]"
    echo "Example: $0 pinovaraufba.com.br root 22"
    exit 1
fi

SERVER_HOST=$1
SERVER_USER=$2
SERVER_PORT=${3:-22}

echo "Fixing TypeScript on $SERVER_USER@$SERVER_HOST:$SERVER_PORT..."

# Copy TypeScript config
scp -P $SERVER_PORT backend/tsconfig.json $SERVER_USER@$SERVER_HOST:/tmp/

# Fix TypeScript on server
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
cd /var/www/pinovara/backend

# Install all dependencies (including devDependencies)
npm install

# Copy tsconfig if missing
sudo cp /tmp/tsconfig.json . 2>/dev/null || echo "tsconfig.json already exists"

# Try different TypeScript approaches
echo "Trying npm run build..."
if npm run build; then
    echo "✓ Build successful with npm run build"
elif npx tsc; then
    echo "✓ Build successful with npx tsc"
elif npm install -g typescript && tsc; then
    echo "✓ Build successful with global tsc"
else
    echo "✗ All build methods failed"
    exit 1
fi

# Verify build output
if [ -d "dist" ] && [ -f "dist/server.js" ]; then
    echo "✓ Build output verified: $(find dist -name "*.js" | wc -l) files generated"
else
    echo "✗ Build output not found"
    exit 1
fi

echo "TypeScript fixed successfully!"
EOF

echo "TypeScript fix completed on server!"
