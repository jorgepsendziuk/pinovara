#!/bin/bash

# ==========================================
# 🛠️  PINOVARA - Fix Deploy Issues
# ==========================================
# Resolve problemas comuns de deploy

set -e

echo "🛠️  PINOVARA - Fix Deploy Issues"
echo "==============================="

# Check if we're in the correct directory
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "Error: Execute from project root directory"
    exit 1
fi

echo "🔧 Applying fixes..."

# Fix permissions
echo "📁 Fixing permissions..."
chmod 755 backend/
chmod 755 frontend/
chmod 644 backend/config.env
chmod 644 backend/package.json
chmod 644 backend/tsconfig.json
chmod 755 frontend/
chmod 755 frontend/dist/

# Fix permissions first
echo "🔐 Fixing permissions..."
chmod -R 755 backend/ frontend/ 2>/dev/null || true

# Clean dist directories
rm -rf backend/dist frontend/dist 2>/dev/null || true

# Clean and reinstall dependencies
echo "🧹 Cleaning dependencies..."

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..

# Build both
echo "🔨 Building applications..."

# Build frontend
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Build backend
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

# Verify builds
echo "✅ Verifying builds..."
if [ ! -d "frontend/dist" ]; then
    echo "❌ Frontend dist not found"
    exit 1
fi

if [ ! -d "backend/dist" ]; then
    echo "❌ Backend dist not found"
    exit 1
fi

# Create deploy package
echo "📦 Creating deploy package..."
rm -rf deploy-package
mkdir -p deploy-package

# Copy all necessary files
cp -r frontend/dist/* deploy-package/
cp -r backend/dist deploy-package/backend-dist
cp backend/package.json deploy-package/backend-package.json
cp backend/package-lock.json deploy-package/ 2>/dev/null || true
cp backend/tsconfig.json deploy-package/ 2>/dev/null || true
cp -r backend/src deploy-package/backend-src/ 2>/dev/null || true

# Also copy route files individually to ensure they exist
cp backend/src/routes/*.ts deploy-package/backend-src/routes/ 2>/dev/null || true
cp backend/production.config.js deploy-package/backend-dist/ 2>/dev/null || true
cp -r backend/prisma deploy-package/ 2>/dev/null || true

echo "✅ All fixes applied!"
echo ""
echo "🚀 Ready for deployment:"
echo "  ./deploy-prod.sh pinovaraufba.com.br root"
echo "  ./quick-deploy.sh"
echo ""
echo "📋 Files prepared:"
echo "  ✓ Frontend build: $(find frontend/dist -type f | wc -l) files"
echo "  ✓ Backend build: $(find backend/dist -type f | wc -l) files"
echo "  ✓ Deploy package: $(find deploy-package -type f | wc -l) files"
