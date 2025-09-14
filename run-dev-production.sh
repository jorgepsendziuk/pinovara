#!/bin/bash

# ==========================================
# 🚀 PINOVARA - Rodar Dev em Produção
# ==========================================
# Configura o backend para rodar em modo dev com configurações de produção

echo "🚀 Configurando PINOVARA para rodar em modo dev em produção..."

# 1. Backup da configuração atual
echo "📋 Fazendo backup da configuração atual..."
cp backend/config.env backend/config.env.backup

# 2. Configurar para produção
echo "⚙️ Configurando para produção..."
cat > backend/config.env << 'EOF'
# ==========================================
# CONFIGURAÇÃO PINOVARA - Produção
# ==========================================

# Ambiente (development/production)
NODE_ENV="development"

# Database - Produção
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"

# JWT Configuration
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001

# Frontend URL - Produção
FRONTEND_URL="https://pinovaraufba.com.br"

# CORS - Permitir localhost para desenvolvimento
CORS_ORIGIN="http://localhost:5173,https://pinovaraufba.com.br"
EOF

echo "✅ Configuração atualizada para produção"

# 3. Verificar conectividade com banco
echo "🔍 Testando conectividade com banco..."
if command -v psql &> /dev/null; then
    if psql -h 10.158.0.2 -p 5432 -U pinovara -d pinovara -c "SELECT 1;" 2>/dev/null; then
        echo "✅ Banco acessível"
    else
        echo "❌ Banco não acessível - verifique conectividade"
        echo "   Teste: ping 10.158.0.2"
        echo "   Teste: nc -zv 10.158.0.2 5432"
    fi
else
    echo "⚠️ PostgreSQL client não instalado"
    echo "   Instale: sudo apt install postgresql-client"
fi

# 4. Instalar dependências se necessário
echo "📦 Verificando dependências..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências..."
    npm install
fi

# 5. Rodar em modo dev
echo "🚀 Iniciando backend em modo dev..."
echo "   Banco: 10.158.0.2:5432"
echo "   Porta: 3001"
echo "   Frontend: https://pinovaraufba.com.br"
echo ""
echo "Para parar: Ctrl+C"
echo "Para restaurar config: cp config.env.backup config.env"
echo ""

npm run dev
