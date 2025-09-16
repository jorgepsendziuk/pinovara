#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Deploy Seguro e Definitivo
# ==========================================
# Script de deploy que não modifica configurações do sistema
# Baseado nos comandos que funcionam e são seguros

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

echo "🚀 PINOVARA - Deploy Seguro e Definitivo"
echo "========================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

# Verificar se o git está limpo
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Há mudanças não commitadas. Deseja continuar mesmo assim? (y/N)"
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deploy cancelado. Faça commit das mudanças primeiro."
        exit 1
    fi
fi

# 1. Atualizar código do GitHub
print_status "📥 Atualizando código do GitHub..."
if git pull origin main; then
    print_success "Código atualizado do GitHub"
else
    print_error "Falha ao atualizar código do GitHub"
    exit 1
fi

# 2. Build do Frontend
print_status "🎨 Fazendo build do frontend..."
cd frontend

# Limpar build anterior
rm -rf dist 2>/dev/null || true

# Instalar dependências
if npm install; then
    print_success "Dependências do frontend instaladas"
else
    print_error "Falha ao instalar dependências do frontend"
    exit 1
fi

# Build do frontend
if npm run build; then
    print_success "Build do frontend concluído"
    echo "   📁 Arquivos gerados: $(find dist -type f | wc -l) arquivos"
else
    print_error "Falha no build do frontend"
    exit 1
fi

# 3. Build do Backend
print_status "🔧 Fazendo build do backend..."
cd ../backend

# Limpar build anterior
rm -rf dist 2>/dev/null || true

# Instalar dependências
if npm install; then
    print_success "Dependências do backend instaladas"
else
    print_error "Falha ao instalar dependências do backend"
    exit 1
fi

# Build do backend
if npm run build; then
    print_success "Build do backend concluído"
    echo "   📁 Arquivos gerados: $(find dist -type f | wc -l) arquivos"
else
    print_error "Falha no build do backend"
    exit 1
fi

# 4. Verificar se os builds foram criados
cd ..
if [ ! -d "frontend/dist" ] || [ ! -d "backend/dist" ]; then
    print_error "Builds não foram criados corretamente"
    exit 1
fi

# 5. Copiar frontend para nginx (comando que funciona)
print_status "🌐 Copiando frontend para nginx..."
if sudo cp -r frontend/dist/* /var/www/html/; then
    print_success "Frontend copiado para nginx"
else
    print_error "Falha ao copiar frontend para nginx"
    exit 1
fi

# Limpar arquivos desnecessários do nginx
sudo rm -rf /var/www/html/backend-dist 2>/dev/null || true
sudo rm -rf /var/www/html/backend-package.json 2>/dev/null || true
sudo rm -rf /var/www/html/package-lock.json 2>/dev/null || true
sudo rm -rf /var/www/html/prisma 2>/dev/null || true

# 6. Reiniciar backend com PM2 (comando que funciona)
print_status "🔄 Reiniciando backend..."
if pm2 restart pinovara-backend; then
    print_success "Backend reiniciado com PM2"
else
    print_warning "PM2 restart falhou, tentando start..."
    if pm2 start /var/www/pinovara/backend/dist/server.js --name pinovara-backend; then
        print_success "Backend iniciado com PM2"
        pm2 save
    else
        print_error "Falha ao iniciar backend com PM2"
        exit 1
    fi
fi

# 7. Recarregar nginx (comando que funciona)
print_status "🔄 Recarregando nginx..."
if sudo systemctl reload nginx; then
    print_success "Nginx recarregado"
else
    print_warning "Reload falhou, tentando restart..."
    if sudo systemctl restart nginx; then
        print_success "Nginx reiniciado"
    else
        print_error "Falha ao recarregar nginx"
        exit 1
    fi
fi

# 8. Verificar status dos serviços
print_status "🔍 Verificando status dos serviços..."

echo ""
echo "📊 Status do PM2:"
pm2 status

echo ""
echo "📊 Status do Nginx:"
sudo systemctl status nginx --no-pager -l | head -5

# 9. Teste de conectividade
print_status "🧪 Testando conectividade..."

# Teste do health check
if curl -s https://pinovaraufba.com.br/health > /dev/null; then
    print_success "Health check funcionando"
else
    print_warning "Health check não respondeu"
fi

# Teste do frontend
if curl -s https://pinovaraufba.com.br/ > /dev/null; then
    print_success "Frontend funcionando"
else
    print_warning "Frontend não respondeu"
fi

# 10. Resumo final
echo ""
echo "🎉 Deploy concluído com sucesso!"
echo "================================"
echo ""
echo "🌐 Site: https://pinovaraufba.com.br"
echo "🔧 API: https://pinovaraufba.com.br/api/"
echo "🔐 Auth: https://pinovaraufba.com.br/auth/"
echo "❤️ Health: https://pinovaraufba.com.br/health"
echo ""
echo "📋 Comandos úteis:"
echo "   pm2 logs pinovara-backend    # Ver logs do backend"
echo "   pm2 status                  # Status do PM2"
echo "   sudo systemctl status nginx # Status do nginx"
echo ""
echo "🔍 Para verificar logs:"
echo "   sudo tail -f /var/log/nginx/pinovaraufba_error.log"
echo "   pm2 logs pinovara-backend --lines 50"
echo ""

print_success "Deploy seguro concluído! 🚀"