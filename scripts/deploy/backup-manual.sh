#!/bin/bash

# ================================
# Manual Backup Script - PINOVARA
# ================================
# Cria backup manual do sistema antes de deploy
# Útil para garantir backup extra antes de mudanças importantes

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}💾 PINOVARA - Manual Backup Script${NC}"
echo ""

# Verificar se estamos no servidor correto
if [ -z "$SSH_CONNECTION" ] && [ ! -d "/var/www/pinovara" ]; then
    echo -e "${YELLOW}⚠️ Este script deve ser executado no servidor de produção${NC}"
    echo -e "${YELLOW}   Ou via SSH: ssh user@server 'bash -s' < backup-manual.sh${NC}"
    exit 1
fi

# Timestamp para backup
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/var/www/pinovara/backup-manual"
BACKUP_NAME="manual-backup-$BACKUP_TIMESTAMP"

echo -e "${BLUE}📅 Timestamp: $BACKUP_TIMESTAMP${NC}"
echo ""

# Criar diretório de backup
echo -e "${BLUE}📁 Criando diretório de backup...${NC}"
sudo mkdir -p "$BACKUP_DIR"
sudo chown -R $USER:$USER "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# Backup do Backend
if [ -d "/var/www/pinovara/backend" ]; then
    echo -e "${BLUE}💾 Fazendo backup do backend...${NC}"
    BACKEND_SIZE=$(du -sh /var/www/pinovara/backend 2>/dev/null | cut -f1)
    echo -e "   Tamanho: $BACKEND_SIZE"
    
    cp -r /var/www/pinovara/backend "$BACKUP_DIR/$BACKUP_NAME/backend" 2>/dev/null || {
        echo -e "${YELLOW}⚠️ Usando tar para backup (mais seguro)...${NC}"
        tar -czf "$BACKUP_DIR/$BACKUP_NAME/backend.tar.gz" -C /var/www/pinovara backend 2>/dev/null || {
            echo -e "${RED}❌ Falha ao fazer backup do backend${NC}"
            exit 1
        }
    }
    echo -e "${GREEN}✅ Backend backup concluído${NC}"
else
    echo -e "${YELLOW}ℹ️ Backend não encontrado (pode ser primeira instalação)${NC}"
fi

# Backup do Frontend
if [ -d "/var/www/html" ] && [ "$(ls -A /var/www/html 2>/dev/null)" ]; then
    echo -e "${BLUE}💾 Fazendo backup do frontend...${NC}"
    FRONTEND_SIZE=$(du -sh /var/www/html 2>/dev/null | cut -f1)
    echo -e "   Tamanho: $FRONTEND_SIZE"
    
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME/frontend"
    cp -r /var/www/html/* "$BACKUP_DIR/$BACKUP_NAME/frontend/" 2>/dev/null || {
        echo -e "${YELLOW}⚠️ Alguns arquivos podem ter falhado (continuando...)${NC}"
    }
    echo -e "${GREEN}✅ Frontend backup concluído${NC}"
else
    echo -e "${YELLOW}ℹ️ Frontend não encontrado${NC}"
fi

# Backup de configurações do PM2
if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}💾 Fazendo backup da configuração PM2...${NC}"
    pm2 save 2>/dev/null || true
    if [ -f "$HOME/.pm2/dump.pm2" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/pm2"
        cp "$HOME/.pm2/dump.pm2" "$BACKUP_DIR/$BACKUP_NAME/pm2/" 2>/dev/null || true
        echo -e "${GREEN}✅ PM2 backup concluído${NC}"
    fi
fi

# Criar arquivo de informações do backup
cat > "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt" << EOF
PINOVARA - Manual Backup
========================
Timestamp: $BACKUP_TIMESTAMP
Data: $(date)
Usuário: $(whoami)
Hostname: $(hostname)

Conteúdo do Backup:
- Backend: $(test -d "$BACKUP_DIR/$BACKUP_NAME/backend" && echo "Sim" || echo "Não (tar.gz)")
- Frontend: $(test -d "$BACKUP_DIR/$BACKUP_NAME/frontend" && echo "Sim" || echo "Não")
- PM2: $(test -d "$BACKUP_DIR/$BACKUP_NAME/pm2" && echo "Sim" || echo "Não")

Tamanhos:
- Backend: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/backend" 2>/dev/null | cut -f1 || du -sh "$BACKUP_DIR/$BACKUP_NAME/backend.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")
- Frontend: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/frontend" 2>/dev/null | cut -f1 || echo "N/A")
- Total: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" 2>/dev/null | cut -f1 || echo "N/A")
EOF

# Calcular tamanho total
TOTAL_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME" 2>/dev/null | cut -f1)

echo ""
echo -e "${GREEN}✅ Backup manual concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📊 Informações do Backup:${NC}"
echo -e "   Local: $BACKUP_DIR/$BACKUP_NAME"
echo -e "   Tamanho: $TOTAL_SIZE"
echo ""
echo -e "${BLUE}📄 Detalhes:${NC}"
cat "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt"
echo ""

# Listar backups manuais existentes
echo -e "${BLUE}📋 Backups manuais disponíveis:${NC}"
ls -lh "$BACKUP_DIR" | grep "manual-backup-" | tail -5 || echo "   Nenhum backup anterior encontrado"
echo ""

echo -e "${GREEN}🎉 Backup concluído! Pronto para deploy.${NC}"

