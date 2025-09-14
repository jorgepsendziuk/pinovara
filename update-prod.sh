#!/bin/bash

# Check if we're in the correct directory
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "Error: Execute from project root directory"
    exit 1
fi

echo "Pulling latest changes..."
git pull origin main

export NODE_ENV=production

# Configure production settings
cat > backend/config.env << 'EOF'
NODE_ENV="production"
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="https://pinovaraufba.com.br"
EOF

echo "Starting deployment..."
./deploy-prod.sh

echo "Update completed successfully"

