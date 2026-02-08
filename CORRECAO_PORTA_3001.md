# 🔧 Correção: Problema da Porta 3001 Ocupada

## ❌ Problema Anterior

O script de deploy zero-downtime tentava iniciar a **nova versão na porta 3001** enquanto a **versão antiga ainda estava rodando** na mesma porta, causando o erro:

```
Error: listen EADDRINUSE: address already in use :::3001
```

### Por que acontecia?

O fluxo antigo era:
1. ✅ Backup da versão atual
2. ✅ Preparar nova versão
3. ✅ Instalar dependências
4. ❌ **Tentar iniciar nova versão na porta 3001** (enquanto antiga ainda está rodando)
5. 💥 **ERRO: Porta ocupada**

---

## ✅ Solução Implementada

O novo fluxo **para a versão antiga ANTES** de iniciar a nova:

1. ✅ Backup da versão atual
2. ✅ Preparar nova versão
3. ✅ Instalar dependências e copiar Prisma Client
4. ✅ **Parar TODOS os processos PM2** (`pm2 stop all && pm2 delete all`)
5. ✅ **Liberar porta 3001** (`sudo fuser -k 3001/tcp`)
6. ✅ **Verificar se porta está livre** (`lsof -i :3001`)
7. ✅ **Iniciar nova versão na porta 3001**
8. ✅ Health check
9. ✅ Finalizar deploy

---

## 🔒 Garantias de Segurança

### Antes de Iniciar Nova Versão:

```bash
# Parar todos os processos PM2
pm2 stop all
pm2 delete all

# Matar processos na porta 3001
sudo fuser -k 3001/tcp
sleep 2

# Verificar se porta está livre
if sudo lsof -i :3001; then
  # Se ainda estiver ocupada, força killall
  sudo killall node
  sleep 3
fi
```

### Se Falhar:

- Rollback automático restaura a versão anterior
- Backup fica disponível em `/var/www/pinovara/backup/backend-[timestamp]`

---

## ⚠️ Trade-off: Downtime Mínimo

**Importante**: Esta estratégia introduz um **pequeno downtime** (2-5 segundos) entre parar a versão antiga e iniciar a nova.

### Alternativas para Zero Downtime Real:

1. **Porta Temporária**: Iniciar nova versão em porta diferente (ex: 3002), testar, depois trocar no Nginx
2. **Load Balancer**: Usar múltiplas instâncias e fazer rolling deploy
3. **Blue-Green com Nginx**: Manter duas versões e trocar upstream no Nginx

Para a maioria dos casos, o downtime de 2-5 segundos é aceitável.

---

## 📝 Arquivos Atualizados

- ✅ `scripts/deploy/deploy-zero-downtime.sh` - Script corrigido
- ✅ `DEPLOY_COMANDO_SERVIDOR.txt` - Comando FTP com limpeza de porta
- ✅ `.github/workflows/deploy.yml` - Workflow já usa o script corrigido

---

## 🧪 Como Testar

### Teste Local:

```bash
# Terminal 1: Iniciar servidor na porta 3001
cd backend
npm run dev

# Terminal 2: Tentar iniciar outro (deve falhar)
cd backend
PORT=3001 npm start
# ❌ EADDRINUSE

# Terminal 2: Com limpeza (deve funcionar)
sudo fuser -k 3001/tcp
sleep 2
PORT=3001 npm start
# ✅ Funciona
```

### Teste no Servidor:

```bash
# Deploy via GitHub Actions (automático)
git push origin main

# Ou deploy manual via FTP
# Siga DEPLOY_COMANDO_SERVIDOR.txt
```

---

## ✅ Resultado Final

Agora tanto o **deploy via GitHub Actions** quanto o **deploy manual via FTP** garantem que:

1. ✅ Porta 3001 é liberada antes de iniciar nova versão
2. ✅ Não há conflito de porta
3. ✅ Deploy completa com sucesso
4. ✅ Rollback automático se algo falhar
5. ✅ Backups mantidos automaticamente

---

## 📚 Referências

- `scripts/deploy/deploy-zero-downtime.sh` - Script principal
- `DEPLOY_COMANDO_SERVIDOR.txt` - Comando FTP
- `DEPLOY_GITHUB_ACTIONS.md` - Deploy automático
- `LIMPEZA_PORTA_3001.txt` - Comandos de emergência
