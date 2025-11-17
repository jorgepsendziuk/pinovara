#!/bin/bash

# ========== REMOVER SENHA DO HISTÓRICO GIT ==========
# Script para remover senha exposta do histórico completo do Git
# ATENÇÃO: Este script reescreve o histórico do Git!

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SENHA_EXPOSTA="[SENHA_REMOVIDA_DO_HISTORICO]"
REPLACEMENT="[SENHA_REMOVIDA_DO_HISTORICO]"

echo -e "${RED}========================================${NC}"
echo -e "${RED}  REMOÇÃO DE SENHA DO HISTÓRICO GIT${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO: Este processo irá:${NC}"
echo "   1. Reescrever TODO o histórico do Git"
echo "   2. Substituir '$SENHA_EXPOSTA' por '$REPLACEMENT'"
echo "   3. Requerer force push para atualizar o GitHub"
echo ""
echo -e "${RED}⚠️  IMPORTANTE:${NC}"
echo "   - Faça backup do repositório antes!"
echo "   - Todos os desenvolvedores precisarão fazer:"
echo "     git fetch origin"
echo "     git reset --hard origin/main"
echo ""
read -p "Deseja continuar? (digite 'SIM' para confirmar): " confirmacao

if [ "$confirmacao" != "SIM" ]; then
    echo -e "${YELLOW}Operação cancelada.${NC}"
    exit 0
fi

# Verificar se git-filter-repo está instalado
GIT_FILTER_REPO=$(which git-filter-repo 2>/dev/null || echo "")
if [ -z "$GIT_FILTER_REPO" ]; then
    # Tentar encontrar em locais comuns do pip
    if [ -f "$HOME/Library/Python/3.9/bin/git-filter-repo" ]; then
        GIT_FILTER_REPO="$HOME/Library/Python/3.9/bin/git-filter-repo"
    elif [ -f "$HOME/Library/Python/3.10/bin/git-filter-repo" ]; then
        GIT_FILTER_REPO="$HOME/Library/Python/3.10/bin/git-filter-repo"
    elif [ -f "$HOME/Library/Python/3.11/bin/git-filter-repo" ]; then
        GIT_FILTER_REPO="$HOME/Library/Python/3.11/bin/git-filter-repo"
    else
        echo -e "${RED}❌ git-filter-repo não encontrado!${NC}"
        echo ""
        echo "Instale com um dos comandos:"
        echo "  pip3 install git-filter-repo"
        echo "  brew install git-filter-repo"
        exit 1
    fi
fi

# Verificar se estamos em um repositório git limpo
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Repositório com mudanças não commitadas!${NC}"
    echo "   Faça commit ou stash das mudanças antes de continuar."
    exit 1
fi

# Criar backup
BACKUP_DIR="../pinovara-backup-$(date +%Y%m%d-%H%M%S)"
echo -e "${BLUE}📦 Criando backup em: $BACKUP_DIR${NC}"
cp -r . "$BACKUP_DIR" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Não foi possível criar backup completo, mas continuando...${NC}"
}

# Executar git-filter-repo
echo -e "${BLUE}🔍 Procurando ocorrências da senha no histórico...${NC}"
COMMITS_COM_SENHA=$(git log --all --full-history --source --all -S "$SENHA_EXPOSTA" --oneline | wc -l | tr -d ' ')
echo -e "${YELLOW}Encontrados $COMMITS_COM_SENHA commits com a senha${NC}"
echo ""

echo -e "${BLUE}🧹 Removendo senha do histórico...${NC}"
"$GIT_FILTER_REPO" \
    --replace-text <(echo "$SENHA_EXPOSTA==>$REPLACEMENT") \
    --force

echo ""
echo -e "${GREEN}✅ Senha removida do histórico!${NC}"
echo ""
echo -e "${YELLOW}📋 PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. Verificar que a senha foi removida:"
echo "   git log --all --full-history --source --all -S '$SENHA_EXPOSTA'"
echo ""
echo "2. Fazer force push para o GitHub:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Avisar todos os desenvolvedores para:"
echo "   git fetch origin"
echo "   git reset --hard origin/main"
echo ""
echo -e "${RED}⚠️  IMPORTANTE:${NC}"
echo "   - O histórico foi reescrito!"
echo "   - Todos precisarão fazer reset do repositório local"
echo "   - Backup salvo em: $BACKUP_DIR"

