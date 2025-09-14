#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Deploy Rápido do GitHub
# ==========================================

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 PINOVARA - Deploy Rápido do GitHub"
echo "======================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

# 1. Puxar mudanças do GitHub
print_status "📥 Puxando mudanças do GitHub..."
if git pull origin main; then
    print_success "Código atualizado com sucesso"
else
    print_error "Falha ao atualizar código do GitHub"
    exit 1
fi

# 2. Configurar para produção
print_status "⚙️  Configurando ambiente de produção..."
export NODE_ENV=production

# Atualizar config.env para produção
cat > backend/config.env << 'EOF'
# Ambiente
NODE_ENV="production"

# Database - IP interno para produção
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"

# JWT Configuration
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001

# Frontend URL - Domínio de produção
FRONTEND_URL="https://pinovaraufba.com.br"
EOF

print_success "Configuração de produção aplicada"

# 3. Build do Frontend
print_status "🎨 Fazendo build do frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    print_success "Build do frontend concluído"
    echo "   📁 Arquivos gerados em: frontend/dist/"
else
    print_error "Falha no build do frontend"
    exit 1
fi

# 4. Build do Backend
print_status "🔧 Fazendo build do backend..."
cd ../backend
npm install
npm run build

if [ $? -eq 0 ]; then
    print_success "Build do backend concluído"
    echo "   📁 Arquivos gerados em: backend/dist/"
else
    print_error "Falha no build do backend"
    exit 1
fi

# 5. Criar pacote para deploy
print_status "📦 Criando pacote para deploy..."
cd ..

# Limpar pacote anterior
rm -rf deploy-package
mkdir -p deploy-package

# Copiar frontend
cp -r frontend/dist/* deploy-package/

# Copiar backend
cp -r backend/dist deploy-package/backend-dist
cp backend/package.json deploy-package/backend-package.json
cp backend/production.config.js deploy-package/backend-dist/ 2>/dev/null || true
cp -r backend/prisma deploy-package/ 2>/dev/null || true

# 6. Criar script de instalação otimizado
print_status "📝 Criando script de instalação..."

cat > deploy-package/install.sh << 'EOF'
#!/bin/bash
echo "🚀 Instalando PINOVARA em produção..."

# Definir ambiente de produção
export NODE_ENV=production

# Instalar dependências do backend
cd /var/www/pinovara/backend
npm install --production

# Copiar arquivos compilados
cp -r /tmp/deploy-package/backend-dist/* /var/www/pinovara/backend/dist/

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

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Site: https://pinovaraufba.com.br"
EOF

chmod +x deploy-package/install.sh

print_success "Pacote de deploy criado"

# 7. Perguntar se quer fazer deploy imediato
echo ""
echo "📋 Pacote pronto em: deploy-package/"
echo ""
read -p "Fazer deploy imediato no servidor? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "🚀 Fazendo deploy no servidor..."

    # Solicitar informações do servidor
    read -p "Host do servidor (padrão: pinovaraufba.com.br): " SERVER_HOST
    SERVER_HOST=${SERVER_HOST:-pinovaraufba.com.br}

    read -p "Usuário SSH (padrão: root): " SERVER_USER
    SERVER_USER=${SERVER_USER:-root}

    read -p "Porta SSH (padrão: 22): " SERVER_PORT
    SERVER_PORT=${SERVER_PORT:-22}

    print_status "Copiando para $SERVER_USER@$SERVER_HOST:$SERVER_PORT..."

    # Copiar pacote
    scp -P $SERVER_PORT -r deploy-package/ $SERVER_USER@$SERVER_HOST:/tmp/

    if [ $? -eq 0 ]; then
        print_success "Pacote copiado com sucesso"
    else
        print_error "Falha ao copiar pacote"
        exit 1
    fi

    # Executar instalação
    print_status "Executando instalação no servidor..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd /tmp/deploy-package && ./install.sh"

    if [ $? -eq 0 ]; then
        print_success "Instalação concluída no servidor"

        # Verificar status
        print_status "Verificando status do servidor..."
        ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "pm2 list && echo '---' && sudo systemctl status nginx --no-pager -l"

        print_success "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
        echo ""
        echo "🌐 Acesse: https://pinovaraufba.com.br"
        echo "🔍 Logs: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs pinovara-backend'"

    else
        print_error "Falha na instalação no servidor"
        exit 1
    fi
else
    print_success "Pacote pronto para deploy manual"
    echo ""
    echo "📋 Para deploy manual:"
    echo "1. Copie a pasta deploy-package/ para o servidor:"
    echo "   scp -r deploy-package/ usuario@servidor:/tmp/"
    echo ""
    echo "2. Execute no servidor:"
    echo "   cd /tmp/deploy-package && ./install.sh"
    echo ""
    echo "3. Ou use o script existente:"
    echo "   ./deploy-direct.sh"
fi

echo ""
print_success "Script concluído!"

