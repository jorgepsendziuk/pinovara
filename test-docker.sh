#!/bin/bash

# ================================
# PINOVARA - Teste Rápido do Docker
# ================================

set -e

echo "🐳 Testando configuração Docker do PINOVARA"
echo "=========================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está instalado."
    exit 1
fi

echo "✅ Docker e Docker Compose estão instalados"

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📋 Copie DOCKER_ENV_EXAMPLE.md e configure suas variáveis"
    echo "   Especialmente DATABASE_URL para seu banco remoto"
    exit 1
fi

echo "✅ Arquivo .env encontrado"

# Verificar DATABASE_URL
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL não configurada no .env"
    exit 1
fi

echo "✅ DATABASE_URL configurada"

# Testar build do backend
echo ""
echo "🔨 Testando build do backend..."
if docker build -f backend/Dockerfile backend -t pinovara-backend:test; then
    echo "✅ Build do backend funcionou!"
else
    echo "❌ Falha no build do backend"
    exit 1
fi

# Limpar imagem de teste
docker rmi pinovara-backend:test >/dev/null 2>&1 || true

echo ""
echo "🎉 Tudo pronto! Agora você pode usar:"
echo "   docker-compose up backend    # Para desenvolvimento"
echo "   docker-compose up            # Para produção completa"
echo ""
echo "💡 Lembre-se: O Prisma generate roda dentro do container,"
echo "   não vai mais travar sua máquina! 🚀"
