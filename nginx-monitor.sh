#!/bin/bash

echo "🔍 MONITORAMENTO NGINX - PINOVARA"
echo "=================================="
echo ""

# Verificar status do Nginx
echo "📊 Status do Nginx:"
sudo systemctl status nginx --no-pager -l | head -10
echo ""

# Verificar configuração
echo "🧪 Teste de configuração:"
sudo nginx -t
echo ""

# Verificar processos
echo "🔧 Processos ativos:"
ps aux | grep nginx | grep -v grep
echo ""

# Verificar portas
echo "🌐 Portas abertas:"
sudo netstat -tlnp | grep :80 || echo "❌ Porta 80 não está ouvindo"
sudo netstat -tlnp | grep :443 || echo "ℹ️ Porta 443 não configurada (HTTPS)"
echo ""

# Verificar arquivos de configuração
echo "📁 Arquivos de configuração:"
ls -la /etc/nginx/sites-enabled/
echo ""

# Verificar arquivos estáticos
echo "📄 Arquivos frontend:"
if [ -d "/var/www/html" ]; then
    ls -la /var/www/html/ | head -5
    if [ -f "/var/www/html/index.html" ]; then
        echo "✅ index.html encontrado"
    else
        echo "❌ index.html não encontrado"
    fi
else
    echo "❌ Diretório /var/www/html não existe"
fi
echo ""

# Testar conectividade
echo "🌐 Testes de conectividade:"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo 'FALHA')"
echo "Backend API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/ || echo 'FALHA')"
echo "Health Check: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/health || echo 'FALHA')"
echo ""

# Verificar logs recentes
echo "📋 Últimas entradas do log de erro:"
sudo tail -10 /var/log/nginx/pinovara_error.log 2>/dev/null || echo "Log não encontrado"
echo ""

echo "📋 Últimas entradas do log de acesso:"
sudo tail -5 /var/log/nginx/pinovara_access.log 2>/dev/null || echo "Log não encontrado"
echo ""

# Verificar uso de recursos
echo "💾 Uso de disco:"
df -h /var/www
echo ""

echo "🔧 Comandos úteis:"
echo "• Ver logs completos: sudo tail -f /var/log/nginx/pinovara_error.log"
echo "• Recarregar Nginx: sudo systemctl reload nginx"
echo "• Reiniciar Nginx: sudo systemctl restart nginx"
echo "• Parar Nginx: sudo systemctl stop nginx"
