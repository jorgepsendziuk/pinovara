#!/bin/bash

# ==========================================
# 🔧 PINOVARA - Corrigir URL da API no Frontend
# ==========================================
# Cria arquivo .env para o frontend com a URL correta da API

echo "🔧 Corrigindo URL da API no frontend..."

# 1. Criar arquivo .env para o frontend
echo "📝 Criando arquivo .env para o frontend..."
cat > frontend/.env << 'EOF'
# ==========================================
# CONFIGURAÇÃO FRONTEND PINOVARA
# ==========================================

# URL da API - Produção
VITE_API_URL=https://pinovaraufba.com.br/api

# Ambiente
VITE_APP_ENV=production
EOF

echo "✅ Arquivo .env criado para o frontend"

# 2. Verificar se o arquivo foi criado
echo "📋 Verificando arquivo .env:"
cat frontend/.env

# 3. Rebuild do frontend
echo ""
echo "🔨 Rebuildando frontend com nova configuração..."
cd frontend

# Limpar build anterior
rm -rf dist

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build para produção
echo "🏗️ Fazendo build para produção..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend buildado com sucesso"
else
    echo "❌ Erro no build do frontend"
    exit 1
fi

cd ..

# 4. Copiar para Nginx
echo ""
echo "🌐 Copiando frontend para Nginx..."
sudo cp -r frontend/dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

echo "✅ Frontend copiado para Nginx"

# 5. Testar
echo ""
echo "🧪 Testando configuração..."
echo "🔍 Verificando se a nova configuração está funcionando..."

# Aguardar um pouco para o Nginx processar
sleep 2

# Testar health check
curl -s https://pinovaraufba.com.br/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/health

echo ""
echo "🎉 Configuração corrigida!"
echo "🌐 Frontend: https://pinovaraufba.com.br"
echo "🔧 API: https://pinovaraufba.com.br/api/"
echo ""
echo "📋 O que foi feito:"
echo "1. ✅ Criado frontend/.env com VITE_API_URL=https://pinovaraufba.com.br/api"
echo "2. ✅ Rebuildado frontend com nova configuração"
echo "3. ✅ Copiado para Nginx"
echo ""
echo "🔍 Agora o frontend deve conseguir acessar a API!"
echo "   Teste no navegador: https://pinovaraufba.com.br"
