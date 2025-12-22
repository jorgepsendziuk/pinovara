#!/bin/bash

# Script para criar diretórios de upload LOCAL (desenvolvimento)

echo "💻 Configurando diretórios de upload LOCAL para Capacitações..."

LOCAL_BASE="/Users/jorgepsendziuk/Documents/pinovara/uploads"
LOCAL_MATERIAIS="${LOCAL_BASE}/capacitacao/materiais"
LOCAL_EVIDENCIAS="${LOCAL_BASE}/capacitacao/evidencias"

# Criar diretório base
mkdir -p "$LOCAL_BASE"
chmod 755 "$LOCAL_BASE"

# Criar diretório de materiais
mkdir -p "$LOCAL_MATERIAIS"
chmod 755 "$LOCAL_MATERIAIS"

# Criar diretório de evidências
mkdir -p "$LOCAL_EVIDENCIAS"
chmod 755 "$LOCAL_EVIDENCIAS"

echo "✅ Diretórios criados com sucesso!"
echo ""
echo "📁 Diretórios:"
echo "  - Materiais: ${LOCAL_MATERIAIS}"
echo "  - Evidências: ${LOCAL_EVIDENCIAS}"

