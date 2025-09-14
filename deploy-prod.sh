#!/bin/bash

set -e

SERVER_HOST=${1:-pinovaraufba.com.br}
SERVER_USER=${2:-root}
SERVER_PORT=22

git pull origin main

export NODE_ENV=production

cd frontend
chmod -R 755 . 2>/dev/null || true
rm -rf dist 2>/dev/null || true
npm install
npm install vite@latest
npm run build
cd ..

cd backend
npm install
npm run build
cd ..

rm -rf deploy-package
mkdir -p deploy-package
cp -r frontend/dist/* deploy-package/
cp -r backend/dist deploy-package/backend-dist
cp backend/package.json deploy-package/backend-package.json
cp backend/package-lock.json deploy-package/ 2>/dev/null || true
cp backend/tsconfig.json deploy-package/ 2>/dev/null || true
cp -r backend/src deploy-package/backend-src/ 2>/dev/null || true

# Also copy route files individually to ensure they exist
cp backend/src/routes/*.ts deploy-package/backend-src/routes/ 2>/dev/null || true

cat > deploy-package/install.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production

if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Error: Node.js/npm not found"
    exit 1
fi

sudo mkdir -p /var/www/pinovara/backend
sudo mkdir -p /var/www/pinovara/backend/src/routes

# Fix frontend permissions
sudo mkdir -p /var/www/pinovara/frontend
sudo chown -R $USER:$USER /var/www/pinovara/frontend 2>/dev/null || true
sudo chmod -R 755 /var/www/pinovara/frontend 2>/dev/null || true

sudo cp /tmp/deploy-package/backend-package.json /var/www/pinovara/backend/package.json
sudo cp /tmp/deploy-package/package-lock.json /var/www/pinovara/backend/ 2>/dev/null || true
sudo cp /tmp/deploy-package/tsconfig.json /var/www/pinovara/backend/ 2>/dev/null || true

# Copy source files ensuring routes are included
sudo cp -r /tmp/deploy-package/backend-src/* /var/www/pinovara/backend/src/ 2>/dev/null || true

# Ensure route files are copied
sudo cp /tmp/deploy-package/backend-src/routes/*.ts /var/www/pinovara/backend/src/routes/ 2>/dev/null || true

# Also copy route files from /tmp if they were uploaded directly
sudo cp /tmp/*.ts /var/www/pinovara/backend/src/routes/ 2>/dev/null || true

cd /var/www/pinovara/backend
npm install

# Build the backend on server
npm run build || npx tsc || (npm install -g typescript && tsc)

# Copy compiled files
cp -r /tmp/deploy-package/backend-dist/* /var/www/pinovara/backend/dist/ 2>/dev/null || true

cat > /var/www/pinovara/backend/.env << 'EOL'
NODE_ENV=production
DATABASE_URL=postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara
JWT_SECRET=pinovara-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://pinovaraufba.com.br
EOL

sudo cp -r /tmp/deploy-package/* /var/www/html/
sudo rm -rf /var/www/html/backend-dist /var/www/html/backend-package.json /var/www/html/package-lock.json

pm2 restart pinovara-backend 2>/dev/null || pm2 start /var/www/pinovara/backend/dist/server.js --name pinovara-backend
sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx

echo "Deploy completed"
EOF

chmod +x deploy-package/install.sh

scp -P $SERVER_PORT -r deploy-package/ $SERVER_USER@$SERVER_HOST:/tmp/
# Copy route files directly to ensure they exist on server
scp -P $SERVER_PORT backend/src/routes/*.ts $SERVER_USER@$SERVER_HOST:/tmp/ 2>/dev/null || true
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd /tmp/deploy-package && ./install.sh"

echo "Deploy completed: https://pinovaraufba.com.br"

