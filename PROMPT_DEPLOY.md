# Prompt para Deploy - Prisma via Docker

## Contexto

**Problema**: `prisma generate` falhava no servidor remoto durante deploy.

**Solução**: Prisma Client agora é gerado no CI (Docker) e apenas restaurado no servidor.

## Mudanças

1. **backend/Dockerfile** (NOVO) - Multi-stage build gera Prisma
2. **.github/workflows/deploy.yml** (MODIFICADO) - Extrai Prisma do Docker
3. **.github/workflows/deploy-full.yml** (MODIFICADO) - Usa Prisma do Docker

## Fluxo

```
CI → Build Docker → Gera Prisma → Extrai Prisma → Deploy → Restaura Prisma → Inicia App
```

**IMPORTANTE**: Servidor NÃO executa mais `prisma generate` - apenas restaura.

## Executar Deploy

### 1. Backup Manual (opcional)
```bash
ssh pinovaraufba@pinovaraufba.com.br 'bash -s' < scripts/deploy/backup-manual.sh
```

### 2. Deploy
- **GitHub Actions UI**: Run workflow "Deploy to Production"
- **OU**: `git push origin main` (automático)

## Verificação

```bash
pm2 status
ls -la /var/www/pinovara/backend/node_modules/@prisma/client
curl http://localhost:3001/health
```

## Notas

- Backup automático já integrado nos workflows
- Servidor não precisa Docker ou Prisma CLI
- Sistema mantém PM2 (sem mudanças no servidor)

