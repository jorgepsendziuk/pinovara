#!/bin/bash

# Script para criar diretórios de upload para Capacitações
# Execute este script tanto no ambiente local quanto no servidor de produção

echo "🔧 Configurando diretórios de upload para Capacitações..."

# Diretórios locais (desenvolvimento)
LOCAL_BASE="/Users/jorgepsendziuk/Documents/pinovara/uploads"
LOCAL_MATERIAIS="${LOCAL_BASE}/capacitacao/materiais"
LOCAL_EVIDENCIAS="${LOCAL_BASE}/capacitacao/evidencias"

# Diretórios remotos (produção)
REMOTE_BASE="/var/pinovara/shared/uploads"
REMOTE_MATERIAIS="${REMOTE_BASE}/capacitacao/materiais"
REMOTE_EVIDENCIAS="${REMOTE_BASE}/capacitacao/evidencias"

# Função para criar diretórios
create_directories() {
    local base_dir=$1
    local materiais_dir=$2
    local evidencias_dir=$3
    local env_name=$4

    echo ""
    echo "📁 Configurando para: ${env_name}"
    echo "   Base: ${base_dir}"

    # Criar diretório base se não existir
    if [ ! -d "$base_dir" ]; then
        echo "   Criando diretório base: ${base_dir}"
        mkdir -p "$base_dir"
    fi

    # Criar diretório de materiais
    if [ ! -d "$materiais_dir" ]; then
        echo "   Criando diretório de materiais: ${materiais_dir}"
        mkdir -p "$materiais_dir"
    else
        echo "   ✓ Diretório de materiais já existe: ${materiais_dir}"
    fi

    # Criar diretório de evidências
    if [ ! -d "$evidencias_dir" ]; then
        echo "   Criando diretório de evidências: ${evidencias_dir}"
        mkdir -p "$evidencias_dir"
    else
        echo "   ✓ Diretório de evidências já existe: ${evidencias_dir}"
    fi

    # Definir permissões
    echo "   Definindo permissões..."
    chmod -R 755 "$base_dir"
    chmod -R 755 "$materiais_dir"
    chmod -R 755 "$evidencias_dir"

    echo "   ✅ Configuração concluída para ${env_name}"
}

# Verificar se estamos em produção ou desenvolvimento
if [ -d "/var/pinovara" ]; then
    echo "🌐 Ambiente de PRODUÇÃO detectado"
    create_directories "$REMOTE_BASE" "$REMOTE_MATERIAIS" "$REMOTE_EVIDENCIAS" "PRODUÇÃO"
    
    # Ajustar ownership (conforme o usuário do servidor)
    # O servidor usa jimxxx:jimxxx (verificado em /var/pinovara/shared/uploads/repositorio)
    UPLOAD_USER="${UPLOAD_USER:-jimxxx}"
    UPLOAD_GROUP="${UPLOAD_GROUP:-jimxxx}"
    
    echo "   Ajustando ownership para ${UPLOAD_USER}:${UPLOAD_GROUP}..."
    chown -R ${UPLOAD_USER}:${UPLOAD_GROUP} "$REMOTE_BASE" 2>/dev/null || {
        echo "   ⚠️  Não foi possível ajustar ownership automaticamente."
        echo "   Execute manualmente: sudo chown -R ${UPLOAD_USER}:${UPLOAD_GROUP} ${REMOTE_BASE}"
    }
else
    echo "💻 Ambiente de DESENVOLVIMENTO detectado"
    create_directories "$LOCAL_BASE" "$LOCAL_MATERIAIS" "$LOCAL_EVIDENCIAS" "DESENVOLVIMENTO"
fi

echo ""
echo "✅ Configuração de diretórios concluída!"
echo ""
echo "📋 Resumo dos diretórios criados:"
echo ""
echo "LOCAL (Desenvolvimento):"
echo "  - Materiais: ${LOCAL_MATERIAIS}"
echo "  - Evidências: ${LOCAL_EVIDENCIAS}"
echo ""
echo "REMOTO (Produção):"
echo "  - Materiais: ${REMOTE_MATERIAIS}"
echo "  - Evidências: ${REMOTE_EVIDENCIAS}"
echo ""

