# Instruções de Deploy - Sistema com Prisma via Docker

## 🎯 Contexto para AI CLI

Este documento explica as mudanças implementadas e como executar o deploy.

## 📋 Resumo das Mudanças

### Problema Resolvido
- **Antes**: `prisma generate` falhava no servidor remoto durante deploy
- **Agora**: Prisma Client é gerado no CI (via Docker) e apenas restaurado no servidor

### Arquivos Modificados/Criados

1. **`backend/Dockerfile`** (NOVO)
   - Dockerfile multi-stage que gera Prisma Client durante build
   - 3 stages: prisma-generator → builder → production

2. **`.github/workflows/deploy.yml`** (MODIFICADO)
   - Adicionado step para buildar Docker e extrair Prisma Client
   - Prisma Client é incluído no pacote de deploy
   - Servidor restaura Prisma Client (não gera mais)

3. **`.github/workflows/deploy-full.yml`** (MODIFICADO)
   - Removido `prisma generate` do servidor
   - Agora usa Prisma Client da imagem Docker (como deploy rápido)

4. **`scripts/deploy/extract-prisma-from-docker.sh`** (NOVO)
   - Script helper para extração manual (opcional)

## 🔄 Fluxo de Deploy

### Processo Automático (push para main)
1. CI builda Docker image
2. CI extrai Prisma Client da imagem
3. CI cria pacote com Prisma Client
4. Servidor recebe pacote e restaura Prisma Client
5. Aplicação inicia normalmente

### Processo Manual (workflow_dispatch)
- Mesmo processo, mas acionado manualmente
- Backup automático é feito antes do deploy
- Sistema mantém últimos 3 backups

## 🚀 Como Executar Deploy

### Opção 1: Via GitHub Actions (Recomendado)
```bash
# 1. Fazer backup manual (opcional, mas recomendado)
ssh pinovaraufba@pinovaraufba.com.br 'bash -s' < scripts/deploy/backup-manual.sh

# 2. Acionar workflow manualmente via GitHub UI
# Ou via GitHub CLI:
gh workflow run deploy.yml
```

### Opção 2: Push para main (automático)
```bash
git push origin main
# Deploy automático será acionado
```

## ⚠️ Importante

- **Backup automático**: O sistema já faz backup antes de cada deploy
- **Backup manual**: Use `scripts/deploy/backup-manual.sh` para backup extra
- **Sem mudanças no servidor**: Servidor não precisa de Docker ou Prisma CLI
- **Compatibilidade**: Mantém sistema atual (PM2, sem Docker no servidor)

## ✅ Verificação Pós-Deploy

Após deploy, verificar:
1. Backend rodando: `pm2 status`
2. Prisma Client existe: `ls -la /var/www/pinovara/backend/node_modules/@prisma/client`
3. Health check: `curl http://localhost:3001/health`

## 🔍 Troubleshooting

Se algo der errado:
1. Verificar logs: `pm2 logs pinovara-backend`
2. Restaurar backup: Backups estão em `/var/www/pinovara/backup/`
3. Verificar Prisma Client: Deve existir em `node_modules/@prisma/client`

