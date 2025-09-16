#!/bin/bash

# Script para fazer checkout de versões antigas do PINOVARA
# Uso: ./checkout-version.sh <commit-hash|tag|branch>

if [ $# -eq 0 ]; then
    echo "❌ Uso: $0 <commit-hash|tag|branch>"
    echo ""
    echo "📋 Exemplos:"
    echo "  $0 3e20e43          # Commit inicial"
    echo "  $0 origin/feature/add-formulario-enketo  # Branch específica"
    echo "  $0 HEAD~5          # 5 commits atrás"
    echo ""
    echo "💡 Para listar versões disponíveis:"
    echo "  git log --oneline --since='1 month ago'"
    echo "  git branch -r"
    exit 1
fi

VERSION=$1

echo "🔄 Fazendo checkout para: $VERSION"
echo "⚠️  ATENÇÃO: Isso vai alterar seu código atual!"
echo ""

read -p "Tem certeza que quer continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada."
    exit 1
fi

# Criar backup da branch atual
CURRENT_BRANCH=$(git branch --show-current)
if [ -n "$CURRENT_BRANCH" ]; then
    BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
    echo "📦 Criando backup da branch atual: $BACKUP_BRANCH"
    git checkout -b "$BACKUP_BRANCH"
    git checkout "$CURRENT_BRANCH"
fi

# Fazer checkout da versão desejada
echo "🔄 Fazendo checkout para $VERSION..."
if git checkout "$VERSION"; then
    echo "✅ Checkout realizado com sucesso!"
    echo ""
    echo "📍 Você está agora em:"
    git log --oneline -1
    echo ""
    echo "🔧 Para voltar ao estado anterior:"
    if [ -n "$CURRENT_BRANCH" ]; then
        echo "  git checkout $CURRENT_BRANCH"
    fi
    echo ""
    echo "📦 Para restaurar do backup:"
    echo "  git checkout $BACKUP_BRANCH"
else
    echo "❌ Erro ao fazer checkout para $VERSION"
    exit 1
fi
