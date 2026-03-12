#!/bin/bash

# Script para criar diretórios de upload REMOTO (produção)
# Execute com sudo se necessário

echo "🌐 Configurando diretórios de upload REMOTO (Capacitações + Plano de Gestão)..."

REMOTE_BASE="/var/pinovara/shared/uploads"
REMOTE_MATERIAIS="${REMOTE_BASE}/capacitacao/materiais"
REMOTE_EVIDENCIAS="${REMOTE_BASE}/capacitacao/evidencias"
REMOTE_PLANO_GESTAO="${REMOTE_BASE}/plano-gestao"

# Criar diretório base
mkdir -p "$REMOTE_BASE"
chmod 755 "$REMOTE_BASE"

# Criar diretório de materiais
mkdir -p "$REMOTE_MATERIAIS"
chmod 755 "$REMOTE_MATERIAIS"

# Criar diretório de evidências
mkdir -p "$REMOTE_EVIDENCIAS"
chmod 755 "$REMOTE_EVIDENCIAS"

# Criar diretório de evidências do plano de gestão
mkdir -p "$REMOTE_PLANO_GESTAO"
chmod 755 "$REMOTE_PLANO_GESTAO"

# Ajustar ownership - usar usuário atual (quem roda deploy) ou UPLOAD_USER se definido
# O backend (PM2) roda como o usuário de deploy, então o dono deve ser esse usuário
UPLOAD_USER="${UPLOAD_USER:-$USER}"
UPLOAD_GROUP="${UPLOAD_GROUP:-$(id -gn 2>/dev/null || echo $USER)}"

echo "   Ajustando ownership para ${UPLOAD_USER}:${UPLOAD_GROUP}..."
chown -R ${UPLOAD_USER}:${UPLOAD_GROUP} "$REMOTE_BASE" 2>/dev/null || {
    echo "   ⚠️  Não foi possível ajustar ownership automaticamente."
    echo "   Execute manualmente: sudo chown -R ${UPLOAD_USER}:${UPLOAD_GROUP} ${REMOTE_BASE}"
}

echo "✅ Diretórios criados com sucesso!"
echo ""
echo "📁 Diretórios:"
echo "  - Materiais: ${REMOTE_MATERIAIS}"
echo "  - Evidências (capacitação): ${REMOTE_EVIDENCIAS}"
echo "  - Plano de gestão: ${REMOTE_PLANO_GESTAO}"
echo "  - Ownership: ${UPLOAD_USER}:${UPLOAD_GROUP}"

