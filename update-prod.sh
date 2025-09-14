#!/bin/bash

git pull origin main

export NODE_ENV=production
cat > backend/config.env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara
JWT_SECRET=pinovara-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://pinovaraufba.com.br
EOF

./deploy-prod.sh

echo "Update completed"

