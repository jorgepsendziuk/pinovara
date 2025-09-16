#!/bin/bash

echo "🔍 Diagnóstico do Banco de Dados PINOVARA"
echo "========================================="

# 1. Verificar conectividade básica
echo ""
echo "1️⃣ Testando conectividade com 10.158.0.2..."
ping -c 3 10.158.0.2

# 2. Verificar porta PostgreSQL
echo ""
echo "2️⃣ Testando porta 5432..."
nc -zv 10.158.0.2 5432

# 3. Verificar se PostgreSQL client está instalado
echo ""
echo "3️⃣ Verificando PostgreSQL client..."
if command -v psql &> /dev/null; then
    echo "✅ psql encontrado"
else
    echo "❌ psql não encontrado - instalando..."
    sudo apt update && sudo apt install -y postgresql-client
fi

# 4. Testar conexão com banco
echo ""
echo "4️⃣ Testando conexão com banco..."
PGPASSWORD="" psql -h 10.158.0.2 -p 5432 -U pinovara -d pinovara -c "SELECT 1;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Conexão com banco OK"
else
    echo "❌ Falha na conexão com banco"
fi

# 5. Verificar configuração do backend
echo ""
echo "5️⃣ Verificando configuração do backend..."
if [ -f "/var/www/pinovara/backend/.env" ]; then
    echo "✅ Arquivo .env existe"
    echo "📄 Conteúdo do .env:"
    cat /var/www/pinovara/backend/.env
else
    echo "❌ Arquivo .env não existe - criando..."
    cat > /var/www/pinovara/backend/.env << 'EOF'
NODE_ENV=production
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="https://pinovaraufba.com.br"
EOF
    echo "✅ Arquivo .env criado"
fi

# 6. Verificar status do PM2
echo ""
echo "6️⃣ Verificando status do PM2..."
pm2 list | grep pinovara-backend || echo "⚠️ Processo pinovara-backend não encontrado"

# 7. Testar health check
echo ""
echo "7️⃣ Testando health check..."
curl -s https://pinovaraufba.com.br/health | jq . 2>/dev/null || curl -s https://pinovaraufba.com.br/health

echo ""
echo "🔧 Próximos passos se ainda estiver com erro:"
echo "1. Verificar se PostgreSQL está rodando no servidor 10.158.0.2"
echo "2. Verificar firewall no servidor do banco"
echo "3. Verificar credenciais do banco"
echo "4. Reiniciar backend: pm2 restart pinovara-backend"
