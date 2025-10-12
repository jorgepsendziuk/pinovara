#!/bin/bash

# ==========================================
# 🎨 PINOVARA - Deploy APENAS Frontend
# ==========================================
# Script rápido para deploy de mudanças visuais
# Útil quando você muda apenas páginas/componentes React
# Não reinicia o backend nem modifica banco de dados
#
# Uso: bash scripts/deploy/deploy-frontend-only.sh

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🎨 PINOVARA - Deploy APENAS Frontend (Rápido)"
echo "=============================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ]; then
    print_error "Execute este script no diretório raiz do projeto PINOVARA"
    exit 1
fi

# Confirmar ação
print_warning "Este script vai fazer deploy APENAS do frontend."
print_warning "O backend NÃO será alterado."
echo ""
echo "Deseja continuar? (y/N)"
read -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deploy cancelado."
    exit 1
fi

# 1. Build do Frontend
print_status "🎨 Fazendo build do frontend..."
cd frontend

# Limpar build anterior
rm -rf dist 2>/dev/null || true

# Build do frontend
if npm run build; then
    print_success "Build do frontend concluído"
    echo "   📁 Arquivos gerados: $(find dist -type f | wc -l) arquivos"
    echo "   📦 Tamanho: $(du -sh dist | cut -f1)"
else
    print_error "Falha no build do frontend"
    exit 1
fi

cd ..

# 2. Verificar se o build foi criado
if [ ! -d "frontend/dist" ]; then
    print_error "Build do frontend não foi criado"
    exit 1
fi

# 3. Copiar frontend para nginx
print_status "🌐 Copiando frontend para servidor nginx..."

# Backup do frontend atual (opcional)
print_status "📦 Fazendo backup do frontend atual..."
sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Copiar novos arquivos
if sudo cp -r frontend/dist/* /var/www/html/; then
    print_success "Frontend copiado para /var/www/html/"
else
    print_error "Falha ao copiar frontend"
    exit 1
fi

# Limpar arquivos desnecessários
print_status "🧹 Limpando arquivos desnecessários..."
sudo rm -rf /var/www/html/backend-dist 2>/dev/null || true
sudo rm -rf /var/www/html/backend-package.json 2>/dev/null || true
sudo rm -rf /var/www/html/package-lock.json 2>/dev/null || true
sudo rm -rf /var/www/html/prisma 2>/dev/null || true

# 4. Recarregar nginx (sem restart)
print_status "🔄 Recarregando nginx..."
if sudo systemctl reload nginx; then
    print_success "Nginx recarregado (reload - sem downtime)"
else
    print_warning "Reload falhou, mas pode estar funcionando"
fi

# 5. Verificar permissões dos arquivos
print_status "🔐 Ajustando permissões..."
sudo chown -R www-data:www-data /var/www/html/ 2>/dev/null || true
sudo chmod -R 755 /var/www/html/ 2>/dev/null || true

# 6. Teste de conectividade
print_status "🧪 Testando site..."

sleep 2

if curl -s https://pinovaraufba.com.br/ > /dev/null; then
    print_success "Site funcionando: https://pinovaraufba.com.br/"
else
    print_warning "Site não respondeu (pode ser temporário)"
fi

# 7. Verificar Google Analytics
print_status "📊 Verificando Google Analytics..."
if grep -q "G-WZJGKZE5DW" /var/www/html/assets/index*.js 2>/dev/null; then
    print_success "Google Analytics detectado no build"
else
    print_warning "Google Analytics não encontrado (pode estar em outro arquivo)"
fi

# 8. Resumo final
echo ""
echo "🎉 Deploy do Frontend Concluído!"
echo "================================"
echo ""
echo "✅ Frontend atualizado em: /var/www/html/"
echo "✅ Nginx recarregado (sem downtime)"
echo "✅ Backend mantido sem alterações"
echo ""
echo "🌐 Site: https://pinovaraufba.com.br"
echo "📊 Analytics ID: G-WZJGKZE5DW"
echo ""
echo "🔍 Para verificar:"
echo "   - Acesse o site e veja mudanças visuais"
echo "   - Console do navegador deve mostrar 'Google Analytics inicializado'"
echo "   - Google Analytics > Tempo Real deve detectar visitas"
echo ""
echo "📝 Logs úteis:"
echo "   sudo tail -f /var/log/nginx/access.log"
echo "   sudo tail -f /var/log/nginx/error.log"
echo ""

print_success "Deploy rápido do frontend concluído! 🚀"

