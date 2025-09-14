#!/bin/bash

# ==========================================
# 🔨 PINOVARA - Build Direto no Servidor
# ==========================================
# Executa build diretamente no servidor local

COMPONENT=${1:-all}

echo "🔨 Building $COMPONENT directly on server..."

# Function to build frontend
build_frontend() {
    echo "🎨 Building frontend..."

    # Fix permissions first
    chmod -R 755 /var/www/pinovara/frontend/ 2>/dev/null || true
    rm -rf /var/www/pinovara/frontend/dist 2>/dev/null || true

    cd /var/www/pinovara/frontend

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
}

# Function to build backend
build_backend() {
    echo "🔧 Building backend..."

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
    echo "🌐 Check: https://pinovaraufba.com.br"
else
    echo "❌ Build failed!"
    exit 1
fi
