# 🚀 Deploy com Prisma via Docker - Executar Agora

## 📋 Resumo para AI CLI

### Mudanças Implementadas

**Problema**: `prisma generate` falhava no servidor remoto durante deploy

**Solução**: Prisma Client agora é gerado no CI (via Docker) e apenas restaurado no servidor

### Arquivos Modificados

1. ✅ `backend/Dockerfile` (NOVO) - Multi-stage build com geração de Prisma
2. ✅ `.github/workflows/deploy.yml` (MODIFICADO) - Extrai Prisma do Docker
3. ✅ `.github/workflows/deploy-full.yml` (MODIFICADO) - Usa Prisma do Docker
4. ✅ `scripts/deploy/extract-prisma-from-docker.sh` (NOVO) - Helper opcional
5. ✅ `scripts/deploy/backup-manual.sh` (NOVO) - Backup manual antes de deploy

### Fluxo de Deploy

```
CI → Build Docker Image → Gera Prisma Client → Extrai Prisma → 
Cria Pacote → Servidor → Restaura Prisma → Inicia App
```

**IMPORTANTE**: Servidor NÃO executa mais `prisma generate` - apenas restaura o cliente pré-gerado

## 🔄 Executar Deploy Agora

### Passo 1: Backup Manual (Recomendado)

```bash
# Executar no servidor (via SSH)
ssh pinovaraufba@pinovaraufba.com.br 'bash -s' < scripts/deploy/backup-manual.sh
```

**OU** executar diretamente no servidor:
```bash
cd /var/www/pinovara
bash scripts/deploy/backup-manual.sh
```

### Passo 2: Acionar Deploy

**Opção A: Via GitHub Actions UI**
1. Ir para: https://github.com/[repo]/actions/workflows/deploy.yml
2. Clicar em "Run workflow"
3. Selecionar branch `main`
4. Clicar em "Run workflow"

**Opção B: Via GitHub CLI**
```bash
gh workflow run deploy.yml
```

**Opção C: Push para main (automático)**
```bash
git add .
git commit -m "feat: Deploy com Prisma gerado via Docker"
git push origin main
```

## ✅ Verificação Pós-Deploy

Após deploy completar, verificar no servidor:

```bash
# 1. Verificar PM2
pm2 status

# 2. Verificar Prisma Client
ls -la /var/www/pinovara/backend/node_modules/@prisma/client

# 3. Health check
curl http://localhost:3001/health

# 4. Ver logs se necessário
pm2 logs pinovara-backend --lines 50
```

## 🔍 O Que Mudou no Deploy

### Antes
- ❌ `prisma generate` executava no servidor (falhava)
- ❌ Dependia de Prisma CLI no servidor
- ❌ Processo lento e instável

### Agora
- ✅ Prisma gerado no CI (Docker)
- ✅ Apenas restauração no servidor
- ✅ Processo rápido e confiável
- ✅ Backup automático antes de cada deploy

## 📊 Backup Automático

O sistema já faz backup automático antes de cada deploy:
- Local: `/var/www/pinovara/backup/`
- Mantém últimos 3 backups
- Timestamp: `backend-YYYYMMDD-HHMMSS`

Backup manual adicional (opcional):
- Local: `/var/www/pinovara/backup-manual/`
- Timestamp: `manual-backup-YYYYMMDD-HHMMSS`

## ⚠️ Notas Importantes

1. **Servidor não precisa de Docker**: Apenas o CI usa Docker
2. **Servidor não precisa de Prisma CLI**: Prisma é pré-gerado
3. **Compatibilidade mantida**: Sistema continua usando PM2 normalmente
4. **Backup automático**: Sistema já faz backup antes de cada deploy

## 🎯 Próximos Passos

1. ✅ Fazer backup manual (recomendado)
2. ✅ Acionar deploy via GitHub Actions
3. ✅ Verificar aplicação após deploy
4. ✅ Confirmar que Prisma Client foi restaurado corretamente

---

**Status**: ✅ Pronto para deploy
**Backup**: ✅ Automático + Manual disponível
**Risco**: ⚠️ Baixo (backup automático + manual)

