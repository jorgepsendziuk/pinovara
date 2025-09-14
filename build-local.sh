#!/bin/bash

# ==========================================
# 🔨 PINOVARA - Build Local para Servidor
# ==========================================
# Executa build localmente e copia para o servidor

if [ $# -lt 2 ]; then
    echo "Usage: $0 <server> <user> [component] [port]"
    echo "Components: frontend, backend, all"
    echo "Example: $0 pinovaraufba.com.br root all 22"
    exit 1
fi

SERVER_HOST=$1
SERVER_USER=$2
COMPONENT=${3:-all}
SERVER_PORT=${4:-22}

echo "🔨 Building $COMPONENT locally and deploying to $SERVER_HOST..."

# Function to build frontend locally
build_frontend_local() {
    echo "🎨 Building frontend locally..."

    # Fix permissions first
    chmod -R 755 frontend/ 2>/dev/null || true
    rm -rf frontend/dist 2>/dev/null || true

    cd frontend
    npm install
    npm run build

    if [ $? -eq 0 ]; then
        echo "✅ Frontend build successful!"
        echo "📁 Files generated: $(find dist -type f | wc -l)"
        cd ..
        return 0
    else
        echo "❌ Frontend build failed!"
        cd ..
        return 1
    fi
}

# Function to build backend locally
build_backend_local() {
    echo "🔧 Building backend locally..."

    cd backend
    npm install
    npm run build || npx tsc || (npm install -g typescript && tsc)

    if [ $? -eq 0 ]; then
        echo "✅ Backend build successful!"
        echo "📁 Files generated: $(find dist -type f | wc -l)"
        cd ..
        return 0
    else
        echo "❌ Backend build failed!"
        cd ..
        return 1
    fi
}

# Function to deploy to server
deploy_to_server() {
    echo "🚀 Deploying to server..."

    # Create deployment package
    rm -rf deploy-package
    mkdir -p deploy-package

    # Copy files based on component
    if [ "$COMPONENT" = "frontend" ] || [ "$COMPONENT" = "all" ]; then
        cp -r frontend/dist/* deploy-package/
    fi

    if [ "$COMPONENT" = "backend" ] || [ "$COMPONENT" = "all" ]; then
        cp -r backend/dist deploy-package/backend-dist
        cp backend/package.json deploy-package/backend-package.json
        cp backend/package-lock.json deploy-package/ 2>/dev/null || true
        cp backend/tsconfig.json deploy-package/ 2>/dev/null || true
        cp -r backend/src deploy-package/backend-src/ 2>/dev/null || true
        cp -r backend/prisma deploy-package/ 2>/dev/null || true

        # Copy route files
        cp backend/src/routes/*.ts deploy-package/backend-src/routes/ 2>/dev/null || true
    fi

    # Copy to server
    scp -P $SERVER_PORT -r deploy-package/ $SERVER_USER@$SERVER_HOST:/tmp/

    if [ $? -ne 0 ]; then
        echo "❌ Failed to copy files to server"
        return 1
    fi

    # Install on server
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << EOF
cd /var/www/pinovara

# Create directories
sudo mkdir -p /var/www/pinovara/frontend
sudo mkdir -p /var/www/pinovara/backend

# Fix permissions
sudo chown -R \$USER:\$USER /var/www/pinovara/frontend 2>/dev/null || true
sudo chown -R \$USER:\$USER /var/www/pinovara/backend 2>/dev/null || true

# Copy files
if [ "$COMPONENT" = "frontend" ] || [ "$COMPONENT" = "all" ]; then
    sudo cp -r /tmp/deploy-package/* /var/www/html/ 2>/dev/null || true
fi

if [ "$COMPONENT" = "backend" ] || [ "$COMPONENT" = "all" ]; then
    sudo cp /tmp/deploy-package/backend-package.json /var/www/pinovara/backend/package.json 2>/dev/null || true
    sudo cp /tmp/deploy-package/package-lock.json /var/www/pinovara/backend/ 2>/dev/null || true
    sudo cp /tmp/deploy-package/tsconfig.json /var/www/pinovara/backend/ 2>/dev/null || true
    sudo cp -r /tmp/deploy-package/backend-src /var/www/pinovara/backend/src 2>/dev/null || true
    sudo cp -r /tmp/deploy-package/backend-dist/* /var/www/pinovara/backend/dist/ 2>/dev/null || true
    sudo cp -r /tmp/deploy-package/prisma /var/www/pinovara/backend/ 2>/dev/null || true

    # Install backend dependencies
    cd /var/www/pinovara/backend
    npm install --production
fi

echo "✅ Deployment completed!"
EOF

    if [ $? -eq 0 ]; then
        echo "✅ Files deployed successfully to server!"
        return 0
    else
        echo "❌ Deployment failed!"
        return 1
    fi
}

# Execute based on component
case $COMPONENT in
    "frontend")
        build_frontend_local && deploy_to_server
        ;;
    "backend")
        build_backend_local && deploy_to_server
        ;;
    "all")
        build_frontend_local && build_backend_local && deploy_to_server
        ;;
    *)
        echo "❌ Invalid component. Use: frontend, backend, or all"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo "🎉 Build and deployment completed successfully!"
    echo "🌐 Check: https://$SERVER_HOST"
else
    echo "❌ Build or deployment failed!"
    exit 1
fi
