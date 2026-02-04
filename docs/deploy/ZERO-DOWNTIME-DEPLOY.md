# 🚀 Deploy Zero-Downtime - Solução Completa

## 📋 Problema Identificado

O deploy atual tinha os seguintes problemas:

1. **Downtime durante deploy**: Backend era parado ANTES de tudo estar pronto
2. **Prisma lento**: `prisma generate` executava no servidor (demorava muito)
3. **Sem health check**: Não verificava se nova versão funcionava antes de trocar
4. **Sem rollback automático**: Se falhasse, sistema ficava offline
5. **Sistema às vezes não voltava**: Se algo falhasse durante deploy, ficava quebrado

## ✅ Solução Implementada

### 1. Deploy Zero-Downtime (Blue-Green)

**Estratégia:**
- ✅ Prepara nova versão em diretório temporário (`backend-new-TIMESTAMP`)
- ✅ Instala dependências e Prisma na nova versão
- ✅ Inicia nova versão com nome temporário no PM2
- ✅ Faz health check na nova versão
- ✅ Só troca para produção se health check passar
- ✅ Rollback automático se algo falhar

**Fluxo:**
```
1. Backup versão atual
2. Preparar nova versão em /var/www/pinovara/backend-new-TIMESTAMP
3. Instalar dependências na nova versão
4. Restaurar Prisma Client pré-gerado (do Docker)
5. Iniciar nova versão com PM2 (nome temporário)
6. Health check na nova versão (até 10 tentativas)
7. Se OK: Parar versão antiga, renomear nova para produção
8. Se FALHAR: Rollback automático para versão anterior
```

### 2. Prisma Pré-Gerado (Sem Espera)

**Antes:**
- ❌ `prisma generate` executava no servidor (~5-8 minutos)
- ❌ Dependia de recursos do servidor
- ❌ Podia falhar por problemas de rede/memória

**Agora:**
- ✅ Prisma Client gerado no CI (GitHub Actions) via Docker
- ✅ Extraído da imagem Docker e incluído no pacote de deploy
- ✅ Apenas restaurado no servidor (segundos, não minutos)
- ✅ Se não houver pré-gerado, usa existente do servidor

### 3. Health Checks Robustos

**Verificações:**
- ✅ Endpoint `/health` responde
- ✅ Retorna JSON válido com `status: "healthy"` ou `"degraded"`
- ✅ Até 10 tentativas com intervalo de 3 segundos
- ✅ Timeout de 5 segundos por tentativa

**Se health check falhar:**
- ✅ Rollback automático para versão anterior
- ✅ Sistema nunca fica offline sem versão funcionando

### 4. Rollback Automático

**Quando acontece:**
- ❌ Health check da nova versão falha
- ❌ Falha ao instalar dependências
- ❌ Falha ao iniciar nova versão
- ❌ Qualquer erro crítico durante deploy

**Como funciona:**
1. Para versão nova (se estiver rodando)
2. Restaura backup da versão anterior
3. Reinicia versão antiga
4. Verifica se rollback funcionou
5. Reporta status

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

1. **`scripts/deploy/deploy-zero-downtime.sh`**
   - Script principal de deploy zero-downtime
   - Implementa estratégia blue-green
   - Health checks e rollback automático

### Arquivos Modificados

1. **`.github/workflows/deploy.yml`**
   - Agora usa `deploy-zero-downtime.sh` em vez de script inline
   - Mantém geração de Prisma via Docker
   - Deploy de frontend separado (após backend confirmado)

## 🔄 Como Funciona o Deploy Agora

### Processo Automático (push para main)

1. **CI (GitHub Actions):**
   - Build backend e frontend
   - Gera Prisma Client via Docker
   - Extrai Prisma Client da imagem
   - Cria pacote de deploy

2. **Servidor (via SSH):**
   - Recebe pacote de deploy
   - Executa `deploy-zero-downtime.sh`
   - Deploy zero-downtime do backend
   - Deploy do frontend (após backend OK)

### Tempo de Deploy

**Antes:**
- ⏱️ ~8-15 minutos (com Prisma no servidor)
- ⚠️ Sistema offline durante todo processo

**Agora:**
- ⏱️ ~2-4 minutos (Prisma pré-gerado)
- ✅ Sistema nunca fica offline
- ✅ Rollback automático se falhar

## 🎯 Benefícios

1. **Zero Downtime**: Sistema sempre disponível durante deploy
2. **Deploy Rápido**: Prisma pré-gerado (segundos vs minutos)
3. **Segurança**: Health checks antes de trocar versão
4. **Confiabilidade**: Rollback automático em caso de falha
5. **Rastreabilidade**: Backups timestampados de cada deploy

## 📊 Monitoramento

### Verificar Status do Deploy

```bash
# Ver processos PM2
pm2 status

# Ver logs do backend
pm2 logs pinovara-backend --lines 50

# Verificar health
curl http://localhost:3001/health
```

### Verificar Backups

```bash
# Listar backups disponíveis
ls -la /var/www/pinovara/backup/

# Ver backup mais recente
ls -lt /var/www/pinovara/backup/ | head -5
```

## 🔧 Troubleshooting

### Se Deploy Falhar

1. **Verificar logs:**
   ```bash
   pm2 logs pinovara-backend --lines 100
   ```

2. **Verificar se rollback aconteceu:**
   ```bash
   pm2 status
   ls -la /var/www/pinovara/backup/
   ```

3. **Rollback manual (se necessário):**
   ```bash
   cd /var/www/pinovara/backup
   BACKUP_DIR=$(ls -dt backend-* | head -1)
   rm -rf /var/www/pinovara/backend
   cp -r "$BACKUP_DIR" /var/www/pinovara/backend
   cd /var/www/pinovara/backend
   pm2 restart pinovara-backend
   ```

### Se Health Check Falhar

1. **Verificar se backend está rodando:**
   ```bash
   pm2 status
   curl http://localhost:3001/health
   ```

2. **Verificar logs de erro:**
   ```bash
   pm2 logs pinovara-backend --err --lines 50
   ```

3. **Verificar Prisma Client:**
   ```bash
   ls -la /var/www/pinovara/backend/node_modules/@prisma/client
   ```

## ⚠️ Notas Importantes

1. **Prisma Client**: Deve ser pré-gerado no CI. Se não houver, usa existente do servidor.

2. **Backups**: Sistema mantém últimos 5 backups automaticamente.

3. **Frontend**: Deployado após backend estar confirmado funcionando.

4. **Database**: Schema nunca é modificado pelo deploy (conforme regra do projeto).

5. **PM2**: Nomes temporários são usados durante deploy para evitar conflitos.

## 🚀 Próximos Passos (Opcional)

1. **Deploy Canary**: Testar nova versão com % pequeno de tráfego
2. **Métricas**: Adicionar métricas de tempo de deploy e sucesso
3. **Notificações**: Notificar em caso de rollback automático
4. **Testes Automáticos**: Executar testes antes de fazer deploy
