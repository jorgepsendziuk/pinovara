#!/bin/bash

# 🚀 PINOVARA - Deploy Manual
# Script para fazer deploy manual das alterações do GitHub

set -e

echo "🚀 PINOVARA - Deploy Manual"
echo "============================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

print_status "Iniciando deploy manual..."

# 1. Atualizar código do GitHub
print_status "📥 Atualizando código do GitHub..."
git fetch origin
git pull origin main

# 2. Build do Frontend
print_status "🎨 Fazendo build do frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    print_success "Build do frontend concluído"
else
    print_error "Falha no build do frontend"
    exit 1
fi

# 3. Build do Backend
print_status "🔧 Fazendo build do backend..."
cd ../backend
npm install
npm run build

if [ $? -eq 0 ]; then
    print_success "Build do backend concluído"
else
    print_error "Falha no build do backend"
    exit 1
fi

# 4. Verificar se o servidor está configurado
print_status "🔍 Verificando configuração do servidor..."

# Verificar se temos acesso SSH
if [ -z "$SSH_HOST" ] || [ -z "$SSH_USER" ]; then
    print_warning "Variáveis SSH não configuradas"
    echo "Configure as seguintes variáveis de ambiente:"
    echo "export SSH_HOST=seu_servidor.com"
    echo "export SSH_USER=seu_usuario"
    echo "export SSH_KEY_PATH=~/.ssh/sua_chave_privada"
    echo ""
    echo "Ou execute:"
    echo "SSH_HOST=seu_servidor.com SSH_USER=seu_usuario ./manual-deploy.sh"
    echo ""
    read -p "Deseja continuar sem deploy remoto? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deploy cancelado"
        exit 0
    fi
else
    # 5. Deploy para o servidor
    print_status "🚀 Fazendo deploy para o servidor..."
    
    # Criar arquivo temporário com comandos de deploy
    cat > /tmp/deploy_commands.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 Atualizando código no servidor..."
cd /var/www/pinovara
git pull origin main

echo "🎨 Atualizando frontend..."
cd /var/www/pinovara/frontend
npm install
npm run build

echo "🔧 Atualizando backend..."
cd /var/www/pinovara/backend
npm install
npm run build

echo "📁 Copiando arquivos do frontend..."
sudo cp -r /var/www/pinovara/frontend/dist/* /var/www/html/

echo "🔄 Reiniciando serviços..."
pm2 restart pinovara-backend
sudo systemctl reload nginx

echo "✅ Deploy concluído no servidor!"
EOF

    # Executar comandos no servidor
    if [ -n "$SSH_KEY_PATH" ]; then
        scp -i "$SSH_KEY_PATH" /tmp/deploy_commands.sh "$SSH_USER@$SSH_HOST:/tmp/"
        ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SSH_HOST" "chmod +x /tmp/deploy_commands.sh && /tmp/deploy_commands.sh"
    else
        scp /tmp/deploy_commands.sh "$SSH_USER@$SSH_HOST:/tmp/"
        ssh "$SSH_USER@$SSH_HOST" "chmod +x /tmp/deploy_commands.sh && /tmp/deploy_commands.sh"
    fi
    
    # Limpar arquivo temporário
    rm /tmp/deploy_commands.sh
    
    print_success "Deploy remoto concluído!"
fi

# 6. Verificação final
print_status "🔍 Verificando deploy..."

# Verificar se os builds foram criados
if [ -d "frontend/dist" ]; then
    print_success "Frontend build encontrado"
    echo "   📁 Arquivos: $(find frontend/dist -type f | wc -l)"
else
    print_error "Frontend build não encontrado"
fi

if [ -d "backend/dist" ]; then
    print_success "Backend build encontrado"
    echo "   📁 Arquivos: $(find backend/dist -type f | wc -l)"
else
    print_error "Backend build não encontrado"
fi

print_success "Deploy manual concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Se fez deploy remoto, verifique o site em produção"
echo "2. Se não fez deploy remoto, copie os arquivos manualmente:"
echo "   - Frontend: cp -r frontend/dist/* /var/www/html/"
echo "   - Backend: reinicie o PM2 com pm2 restart pinovara-backend"
echo ""
echo "🔍 Para verificar o status do servidor, execute:"
echo "   ./check-deployment.sh"
