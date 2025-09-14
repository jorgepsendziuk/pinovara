#!/bin/bash

# ==========================================
# 🔨 PINOVARA - Build no Servidor
# ==========================================
# Facilita execução de builds no servidor

if [ $# -lt 2 ]; then
    echo "Usage: $0 <server> <user> [component] [port]"
    echo "Components: frontend, backend, all"
    echo "Example: $0 pinovaraufba.com.br root frontend 22"
    exit 1
fi

SERVER_HOST=$1
SERVER_USER=$2
COMPONENT=${3:-all}
SERVER_PORT=${4:-22}

echo "🔨 Building $COMPONENT on $SERVER_USER@$SERVER_HOST:$SERVER_PORT..."

# Function to build frontend
build_frontend() {
    echo "🎨 Building frontend..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
cd /var/www/pinovara/frontend

# Fix permissions first
chmod -R 755 . 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Install dependencies
npm install

# Build
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo "📁 Files generated: $(find dist -type f | wc -l)"
else
    echo "❌ Frontend build failed!"
    exit 1
fi
EOF
}

# Function to build backend
build_backend() {
    echo "🔧 Building backend..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
cd /var/www/pinovara/backend

# Install dependencies (including devDependencies)
npm install

# Build with fallbacks
npm run build || npx tsc || (npm install -g typescript && tsc)

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
    echo "📁 Files generated: $(find dist -type f | wc -l)"
else
    echo "❌ Backend build failed!"
    exit 1
fi
EOF
}

# Execute based on component
case $COMPONENT in
    "frontend")
        build_frontend
        ;;
    "backend")
        build_backend
        ;;
    "all")
        build_frontend
        if [ $? -eq 0 ]; then
            build_backend
        fi
        ;;
    *)
        echo "❌ Invalid component. Use: frontend, backend, or all"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo "🎉 Build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi
