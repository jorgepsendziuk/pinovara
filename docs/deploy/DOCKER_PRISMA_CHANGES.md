# Mudanças no Sistema de Deploy - Prisma Client via Docker

## 📋 Resumo das Alterações

Este documento explica as mudanças implementadas no sistema de deploy para resolver o problema de falhas no `prisma generate` durante o deploy remoto.

## 🔴 Problema Anterior

- O comando `prisma generate` falhava durante o deploy no servidor remoto
- Isso causava falhas no deploy e exigia intervenção manual
- O processo era lento (~8 minutos) e instável

## ✅ Solução Implementada

### 1. Dockerfile Multi-Stage (`backend/Dockerfile`)

**NOVO ARQUIVO** - Criado Dockerfile com 3 stages:

- **Stage 1 (`prisma-generator`)**: 
  - Instala dependências
  - Gera Prisma Client usando `npx prisma generate`
  - Resultado: Prisma Client gerado em ambiente controlado

- **Stage 2 (`builder`)**:
  - Instala dependências de produção
  - Copia código compilado (`dist/`)
  - Copia Prisma Client gerado do Stage 1
  - Resultado: Aplicação completa com Prisma Client

- **Stage 3 (`production`)**:
  - Imagem minimal para produção
  - Usuário não-root para segurança
  - Pronto para execução

### 2. Workflow de Deploy Rápido (`.github/workflows/deploy.yml`)

**MODIFICADO** - Adicionado step novo:

```yaml
- name: 🐳 Build Docker Image & Extract Prisma Client
```

**O que faz:**
1. Builda imagem Docker até o stage `builder`
2. Cria container temporário
3. Extrai Prisma Client do container (`@prisma` e `.prisma`)
4. Salva em `prisma-client/` para incluir no deploy

**Mudança no servidor:**
- Antes: Tentava usar Prisma Client existente ou falhava
- Agora: Restaura Prisma Client extraído da imagem Docker
- **NÃO executa mais `prisma generate` no servidor**

### 3. Workflow Deploy Full (`.github/workflows/deploy-full.yml`)

**MODIFICADO** - Mudança significativa:

**Antes:**
```bash
sudo npx prisma generate  # Executava no servidor (falhava)
```

**Agora:**
- Builda Docker image no CI
- Extrai Prisma Client da imagem
- Restaura no servidor (sem executar `prisma generate`)
- **NÃO executa mais `prisma generate` no servidor**

### 4. Script Helper (`scripts/deploy/extract-prisma-from-docker.sh`)

**NOVO ARQUIVO** - Script opcional para extração manual:

- Permite extrair Prisma Client manualmente da imagem Docker
- Útil para debug ou deploy manual
- Não é necessário para deploy automático

## 🔄 Fluxo de Deploy Atualizado

### Deploy Rápido (automático no push)

1. **CI (GitHub Actions)**:
   - Builda backend TypeScript
   - Builda imagem Docker (até stage `builder`)
   - Extrai Prisma Client da imagem
   - Builda frontend
   - Cria pacote de deploy com Prisma Client incluído

2. **Servidor Remoto**:
   - Recebe pacote de deploy
   - Instala dependências (`npm ci --production`)
   - Restaura Prisma Client extraído (sem gerar)
   - Inicia aplicação com PM2

### Deploy Full (manual, quando schema mudou)

1. **CI (GitHub Actions)**:
   - Mesmo processo do deploy rápido
   - Prisma Client é gerado do schema atual

2. **Servidor Remoto**:
   - Mesmo processo do deploy rápido
   - **NÃO executa mais `prisma generate` no servidor**

## 📊 Comparação: Antes vs Agora

| Aspecto | Antes | Agora |
|---------|-------|-------|
| **Geração Prisma** | No servidor remoto | No CI (Docker) |
| **Confiabilidade** | Falhava frequentemente | Sempre funciona |
| **Velocidade** | ~8 minutos no servidor | ~2 minutos no CI |
| **Dependências** | Requer Prisma CLI no servidor | Não precisa no servidor |
| **Ambiente** | Variável (servidor) | Controlado (Docker) |

## 🎯 Benefícios

1. ✅ **Sem falhas**: Prisma gerado em ambiente controlado
2. ✅ **Mais rápido**: Geração no CI é mais rápida
3. ✅ **Mais confiável**: Mesmo ambiente sempre
4. ✅ **Compatível**: Mantém deploy atual (PM2, sem Docker no servidor)

## ⚠️ Notas Importantes

- O servidor **NÃO precisa** ter Docker instalado
- O servidor **NÃO precisa** ter Prisma CLI instalado
- O Prisma Client é **pré-gerado** no CI e apenas **restaurado** no servidor
- O sistema de backup existente continua funcionando normalmente

## 🔍 Verificação Pós-Deploy

Após o deploy, verificar:

1. Backend está rodando: `pm2 status`
2. Prisma Client existe: `ls -la /var/www/pinovara/backend/node_modules/@prisma/client`
3. Aplicação responde: `curl http://localhost:3001/health`

## 📝 Arquivos Modificados/Criados

- ✅ `backend/Dockerfile` (NOVO)
- ✅ `.github/workflows/deploy.yml` (MODIFICADO)
- ✅ `.github/workflows/deploy-full.yml` (MODIFICADO)
- ✅ `scripts/deploy/extract-prisma-from-docker.sh` (NOVO)

