#!/bin/bash

# ==========================================
# 🔍 PINOVARA - Debug Frontend-Backend
# ==========================================
# Diagnóstica problemas de comunicação frontend-backend

echo "🔍 Debug Frontend-Backend Communication"
echo "======================================="

# 1. Verificar se frontend está no Nginx
echo ""
echo "1️⃣ Frontend no Nginx:"
if [ -d "/var/www/html" ] && [ "$(ls -A /var/www/html)" ]; then
    echo "✅ Frontend encontrado em /var/www/html"
    echo "📁 Arquivos:"
    ls -la /var/www/html/ | head -3
else
    echo "❌ Frontend não encontrado em /var/www/html"
    echo "🔧 Copiando frontend..."
    sudo cp -r /var/www/pinovara/frontend/dist/* /var/www/html/
    sudo chown -R www-data:www-data /var/www/html
    echo "✅ Frontend copiado"
fi

# 2. Verificar configuração do Nginx
echo ""
echo "2️⃣ Configuração do Nginx:"
if [ -f "/etc/nginx/sites-available/pinovaraufba.com.br" ]; then
    echo "✅ Configuração encontrada"
    echo "📄 Verificando proxy para API:"
    if grep -q "location /api" /etc/nginx/sites-available/pinovaraufba.com.br; then
        echo "✅ Proxy /api configurado"
        grep -A 3 "location /api" /etc/nginx/sites-available/pinovaraufba.com.br
    else
        echo "❌ Proxy /api não configurado"
    fi
else
    echo "❌ Configuração do Nginx não encontrada"
fi

# 3. Verificar se Nginx está rodando
echo ""
echo "3️⃣ Status do Nginx:"
sudo systemctl status nginx --no-pager -l | head -5

# 4. Testar conectividade backend
echo ""
echo "4️⃣ Testando Backend:"
echo "🔍 Health check direto (localhost:3001):"
curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health

echo ""
echo "🔍 Health check via Nginx (pinovaraufba.com.br/health):"
curl -s https://pinovaraufba.com.br/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/health

echo ""
echo "🔍 API via Nginx (pinovaraufba.com.br/api/health):"
curl -s https://pinovaraufba.com.br/api/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/api/health

# 5. Verificar CORS no backend
echo ""
echo "5️⃣ Configuração CORS:"
cd /var/www/pinovara/backend
if [ -f "src/server.ts" ]; then
    echo "✅ Arquivo server.ts encontrado"
    echo "📄 Verificando CORS configurado:"
    if grep -q "pinovaraufba.com.br" src/server.ts; then
        echo "✅ CORS configurado para pinovaraufba.com.br"
        grep -A 2 -B 2 "pinovaraufba.com.br" src/server.ts
    else
        echo "❌ CORS não configurado para pinovaraufba.com.br"
    fi
else
    echo "❌ Arquivo server.ts não encontrado"
fi

# 6. Verificar logs
echo ""
echo "6️⃣ Logs Recentes:"
echo "📋 PM2 logs (últimas 5 linhas):"
pm2 logs pinovara-backend --lines 5 --nostream

echo ""
echo "📋 Nginx error logs:"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Sem logs de erro"

echo ""
echo "📋 Nginx access logs:"
sudo tail -3 /var/log/nginx/access.log 2>/dev/null || echo "Sem logs de acesso"

# 7. Verificar configuração do frontend
echo ""
echo "7️⃣ Configuração do Frontend:"
if [ -f "/var/www/pinovara/frontend/dist/assets/index.html" ]; then
    echo "✅ Frontend build encontrado"
    echo "📄 Verificando se há chamadas para API:"
    grep -r "api" /var/www/html/ | head -2 || echo "Nenhuma chamada API encontrada no HTML"
else
    echo "❌ Frontend build não encontrado"
fi

# 8. Testar com curl mais detalhado
echo ""
echo "8️⃣ Teste Detalhado:"
echo "🔍 Testando com headers:"
curl -I https://pinovaraufba.com.br/health
echo ""
curl -I https://pinovaraufba.com.br/api/health

# 9. Verificar se há problemas de SSL
echo ""
echo "9️⃣ Verificação SSL:"
echo "🔍 Certificado SSL:"
openssl s_client -connect pinovaraufba.com.br:443 -servername pinovaraufba.com.br < /dev/null 2>/dev/null | grep -E "(subject|issuer|notAfter)" || echo "Erro ao verificar SSL"

echo ""
echo "🎯 Resumo dos Problemas Encontrados:"
echo "=================================="

# Verificar problemas principais
PROBLEMS=()

if [ ! -f "/etc/nginx/sites-available/pinovaraufba.com.br" ]; then
    PROBLEMS+=("❌ Nginx não configurado")
fi

if ! grep -q "location /api" /etc/nginx/sites-available/pinovaraufba.com.br 2>/dev/null; then
    PROBLEMS+=("❌ Proxy /api não configurado no Nginx")
fi

if ! curl -s http://localhost:3001/health | grep -q "OK"; then
    PROBLEMS+=("❌ Backend não responde em localhost:3001")
fi

if ! curl -s https://pinovaraufba.com.br/api/health | grep -q "OK"; then
    PROBLEMS+=("❌ API não acessível via Nginx")
fi

if [ ${#PROBLEMS[@]} -eq 0 ]; then
    echo "✅ Nenhum problema detectado automaticamente"
    echo "🔍 Verifique console do navegador (F12) para erros JavaScript"
else
    for problem in "${PROBLEMS[@]}"; do
        echo "$problem"
    done
fi

echo ""
echo "🔧 Comandos para corrigir:"
echo "1. Configurar Nginx: sudo nano /etc/nginx/sites-available/pinovaraufba.com.br"
echo "2. Recarregar Nginx: sudo systemctl reload nginx"
echo "3. Verificar logs: pm2 logs pinovara-backend"
echo "4. Verificar frontend: abrir https://pinovaraufba.com.br e F12"
