#!/bin/bash

set -e

# Check if in correct directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "Error: Execute in project root directory"
    exit 1
fi

# Pull latest changes
if ! git pull origin main; then
    echo "Error: Failed to pull from GitHub"
    exit 1
fi

# Configure for production
export NODE_ENV=production

cat > backend/config.env << 'EOF'
NODE_ENV="production"
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="https://pinovaraufba.com.br"
EOF

# Build frontend
cd frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Frontend build failed"
    exit 1
fi

# Build backend
cd ../backend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Backend build failed"
    exit 1
fi

# Create deploy package
cd ..
rm -rf deploy-package
mkdir -p deploy-package

# Copy files
cp -r frontend/dist/* deploy-package/
cp -r backend/dist deploy-package/backend-dist
cp backend/package.json deploy-package/backend-package.json
cp backend/package-lock.json deploy-package/ 2>/dev/null || true
cp backend/production.config.js deploy-package/backend-dist/ 2>/dev/null || true
cp -r backend/prisma deploy-package/ 2>/dev/null || true

cat > deploy-package/install.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production

sudo mkdir -p /var/www/pinovara/backend
sudo cp /tmp/deploy-package/backend-package.json /var/www/pinovara/backend/package.json
sudo cp /tmp/deploy-package/package-lock.json /var/www/pinovara/backend/ 2>/dev/null || true

cd /var/www/pinovara/backend
npm install --production

cp -r /tmp/deploy-package/backend-dist/* /var/www/pinovara/backend/dist/

cat > /var/www/pinovara/backend/.env << 'EOL'
NODE_ENV=production
DATABASE_URL=postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara
JWT_SECRET=pinovara-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://pinovaraufba.com.br
EOL

sudo cp -r /tmp/deploy-package/* /var/www/html/
sudo rm -rf /var/www/html/backend-dist /var/www/html/backend-package.json /var/www/html/package-lock.json /var/www/html/prisma

pm2 restart pinovara-backend 2>/dev/null || pm2 start /var/www/pinovara/backend/dist/server.js --name pinovara-backend
sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx

echo "Deploy completed"
EOF

chmod +x deploy-package/install.sh

echo "Package ready in: deploy-package/"
read -p "Deploy to server now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Server host (default: pinovaraufba.com.br): " SERVER_HOST
    SERVER_HOST=${SERVER_HOST:-pinovaraufba.com.br}

    read -p "SSH user (default: root): " SERVER_USER
    SERVER_USER=${SERVER_USER:-root}

    read -p "SSH port (default: 22): " SERVER_PORT
    SERVER_PORT=${SERVER_PORT:-22}

    scp -P $SERVER_PORT -r deploy-package/ $SERVER_USER@$SERVER_HOST:/tmp/

    if [ $? -ne 0 ]; then
        echo "Error: Failed to copy package"
        exit 1
    fi

    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd /tmp/deploy-package && ./install.sh"

    if [ $? -ne 0 ]; then
        echo "Error: Installation failed"
        exit 1
    fi

    echo "Deploy completed successfully"
    echo "Site: https://pinovaraufba.com.br"
else
    echo "Manual deployment instructions:"
    echo "1. scp -r deploy-package/ user@server:/tmp/"
    echo "2. ssh user@server 'cd /tmp/deploy-package && ./install.sh'"
fi

