#!/bin/bash

# Script para criar estrutura de pastas uploads no servidor remoto
# Execute: bash scripts/setup-uploads-folder.sh
# ou via SSH: ssh user@server "bash -s" < scripts/setup-uploads-folder.sh

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📁 Criando estrutura de pastas uploads...${NC}"

# Criar pasta principal uploads
mkdir -p uploads

# Criar subpastas necessárias
mkdir -p uploads/plano-gestao
mkdir -p uploads/repositorio

# Definir permissões
chmod 755 uploads
chmod 755 uploads/plano-gestao
chmod 755 uploads/repositorio

echo -e "${GREEN}✅ Estrutura de pastas criada com sucesso!${NC}"
echo ""
echo "Estrutura criada:"
echo "  uploads/"
echo "  uploads/plano-gestao/"
echo "  uploads/repositorio/"
echo ""

# Verificar permissões
echo -e "${YELLOW}📋 Permissões atuais:${NC}"
ls -la | grep uploads
echo ""
ls -la uploads/ 2>/dev/null || echo "Pasta uploads vazia ou sem permissão de leitura"

# Nota sobre ownership
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "Se o processo Node.js/Express roda como outro usuário (ex: node, www-data),"
echo "você pode precisar ajustar o ownership:"
echo "  sudo chown -R node:node uploads"
echo "  # ou"
echo "  sudo chown -R www-data:www-data uploads"
echo ""
echo "Para verificar qual usuário está rodando o Node.js:"
echo "  ps aux | grep node"

