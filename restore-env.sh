#!/bin/bash

# Script para restaurar arquivo .env do backend
# Uso: ./restore-env.sh

echo "🔧 Restaurando arquivo .env do backend..."

# Verificar se está no diretório correto
if [ ! -f "backend/config.env" ]; then
    echo "❌ Erro: Arquivo backend/config.env não encontrado!"
    echo "📍 Execute este script do diretório raiz do projeto (pinovara/)"
    exit 1
fi

# Criar backup se .env já existir
if [ -f "backend/.env" ]; then
    echo "📦 Criando backup do .env existente..."
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copiar config.env para .env
cp backend/config.env backend/.env

if [ $? -eq 0 ]; then
    echo "✅ Arquivo .env restaurado com sucesso!"
    echo "📍 Localização: backend/.env"
    echo ""
    echo "📋 Conteúdo do arquivo:"
    echo "----------------------------------------"
    cat backend/.env
    echo "----------------------------------------"
else
    echo "❌ Erro ao restaurar arquivo .env"
    exit 1
fi
