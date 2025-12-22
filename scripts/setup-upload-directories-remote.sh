#!/bin/bash

# Script para criar diretórios de upload REMOTO (produção)
# Execute com sudo se necessário

echo "🌐 Configurando diretórios de upload REMOTO para Capacitações..."

REMOTE_BASE="/var/pinovara/shared/uploads"
REMOTE_MATERIAIS="${REMOTE_BASE}/capacitacao/materiais"
REMOTE_EVIDENCIAS="${REMOTE_BASE}/capacitacao/evidencias"

# Criar diretório base
mkdir -p "$REMOTE_BASE"
chmod 755 "$REMOTE_BASE"

# Criar diretório de materiais
mkdir -p "$REMOTE_MATERIAIS"
chmod 755 "$REMOTE_MATERIAIS"

# Criar diretório de evidências
mkdir -p "$REMOTE_EVIDENCIAS"
chmod 755 "$REMOTE_EVIDENCIAS"

# Ajustar ownership (conforme o usuário do servidor)
# O servidor usa jimxxx:jimxxx (verificado em /var/pinovara/shared/uploads/repositorio)
UPLOAD_USER="${UPLOAD_USER:-jimxxx}"
UPLOAD_GROUP="${UPLOAD_GROUP:-jimxxx}"

echo "   Ajustando ownership para ${UPLOAD_USER}:${UPLOAD_GROUP}..."
chown -R ${UPLOAD_USER}:${UPLOAD_GROUP} "$REMOTE_BASE" 2>/dev/null || {
    echo "   ⚠️  Não foi possível ajustar ownership automaticamente."
    echo "   Execute manualmente: sudo chown -R ${UPLOAD_USER}:${UPLOAD_GROUP} ${REMOTE_BASE}"
}

echo "✅ Diretórios criados com sucesso!"
echo ""
echo "📁 Diretórios:"
echo "  - Materiais: ${REMOTE_MATERIAIS}"
echo "  - Evidências: ${REMOTE_EVIDENCIAS}"
echo "  - Ownership: ${UPLOAD_USER}:${UPLOAD_GROUP}"

