#!/bin/bash

set -e

if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "Error: Execute in project root directory"
    exit 1
fi

files_to_check=(
    "backend/package.json"
    "backend/package-lock.json"
    "backend/dist/server.js"
    "frontend/dist/index.html"
    "frontend/dist/assets/index-*.js"
)

for file in "${files_to_check[@]}"; do
    if ls $file 1> /dev/null 2>&1; then
        echo "✓ $file - OK"
    else
        echo "✗ $file - MISSING"
        echo "Run: npm run build (frontend) and npm run build (backend)"
        exit 1
    fi
done

rm -rf deploy-package-test
mkdir -p deploy-package-test

cp -r frontend/dist/* deploy-package-test/ || exit 1
cp -r backend/dist deploy-package-test/backend-dist || exit 1
cp backend/package.json deploy-package-test/backend-package.json || exit 1
cp backend/package-lock.json deploy-package-test/ 2>/dev/null || true

package_files=(
    "deploy-package-test/index.html"
    "deploy-package-test/backend-dist/server.js"
    "deploy-package-test/backend-package.json"
)

for file in "${package_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "✗ $file - MISSING"
        exit 1
    fi
done

rm -rf deploy-package-test

echo "Test completed successfully"
echo "Ready for deployment:"
echo "  ./deploy-prod.sh pinovaraufba.com.br root"
echo "  ./quick-deploy.sh"
echo "  ./update-prod.sh"
