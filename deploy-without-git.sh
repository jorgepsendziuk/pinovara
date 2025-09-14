#!/bin/bash

# 🚀 PINOVARA - Deploy Sem Git
# Script para fazer deploy sem usar git fetch (evita problemas de permissão)

set -e

echo "🚀 PINOVARA - Deploy Sem Git"
echo "============================"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

# 1. Build do Frontend
print_status "🎨 Fazendo build do frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    print_success "Build do frontend concluído"
    echo "   📁 Arquivos gerados em: frontend/dist/"
    echo "   📄 Total: $(find dist -type f | wc -l) arquivos"
else
    echo "❌ Falha no build do frontend"
    exit 1
fi

# 2. Build do Backend
print_status "🔧 Fazendo build do backend..."
cd ../backend
npm install
npm run build

if [ $? -eq 0 ]; then
    print_success "Build do backend concluído"
    echo "   📁 Arquivos gerados em: backend/dist/"
    echo "   📄 Total: $(find dist -type f | wc -l) arquivos"
else
    echo "❌ Falha no build do backend"
    exit 1
fi

# 3. Criar pacote para deploy
print_status "📦 Criando pacote para deploy..."
cd ..

# Criar diretório de deploy
mkdir -p deploy-package
rm -rf deploy-package/*

# Copiar frontend
cp -r frontend/dist/* deploy-package/

# Copiar backend
cp -r backend/dist deploy-package/backend-dist
cp backend/package.json deploy-package/backend-package.json
cp backend/production.config.js deploy-package/backend-dist/ 2>/dev/null || true
cp backend/ecosystem.config.js deploy-package/ 2>/dev/null || true
cp -r backend/prisma deploy-package/ 2>/dev/null || true

# Criar script de instalação
cat > deploy-package/install.sh << 'EOF'
#!/bin/bash
echo "🚀 Instalando PINOVARA no servidor..."

# Definir ambiente de produção
export NODE_ENV=production

# Instalar dependências do backend
cd /var/www/pinovara/backend
npm install

# Copiar arquivos compilados
cp -r /tmp/deploy-package/backend-dist/* /var/www/pinovara/backend/dist/

# Copiar configuração de produção se existir
if [ -f "/tmp/deploy-package/backend-dist/production.config.js" ]; then
    cp /tmp/deploy-package/backend-dist/production.config.js /var/www/pinovara/backend/
    echo "✅ Configuração de produção copiada"
fi

# Configurar variáveis de ambiente para produção
cat > /var/www/pinovara/backend/.env << 'EOL'
NODE_ENV=production
DATABASE_URL=postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara
JWT_SECRET=pinovara-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://pinovaraufba.com.br
EOL

# Copiar frontend
sudo cp -r /tmp/deploy-package/* /var/www/html/
sudo rm -rf /var/www/html/backend-dist
sudo rm -rf /var/www/html/backend-package.json
sudo rm -rf /var/www/html/prisma

# Reiniciar serviços
pm2 restart pinovara-backend
sudo systemctl reload nginx

echo "✅ Instalação concluída!"
echo "🌐 Site disponível em: https://pinovaraufba.com.br"
echo "🗄️  Banco configurado para: 10.158.0.2"
EOF

chmod +x deploy-package/install.sh

print_success "Pacote de deploy criado em: deploy-package/"
echo "   📁 Conteúdo:"
echo "      - Frontend: $(find deploy-package -maxdepth 1 -type f | wc -l) arquivos"
echo "      - Backend: backend-dist/ com $(find deploy-package/backend-dist -type f | wc -l) arquivos"
echo "      - Script: install.sh"

echo ""
echo "📋 Para fazer deploy no servidor:"
echo "1. Copie a pasta deploy-package/ para o servidor:"
echo "   scp -r deploy-package/ usuario@servidor:/tmp/"
echo ""
echo "2. Execute no servidor:"
echo "   cd /tmp/deploy-package && ./install.sh"
echo ""
echo "3. Ou copie manualmente:"
echo "   - Frontend: cp -r deploy-package/* /var/www/html/"
echo "   - Backend: cp -r deploy-package/backend-dist/* /var/www/pinovara/backend/dist/"
echo "   - Reiniciar: pm2 restart pinovara-backend"
echo ""
echo "🔍 Para verificar o status do servidor, execute:"
echo "   ./check-deployment.sh"
