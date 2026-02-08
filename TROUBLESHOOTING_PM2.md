# 🔧 Troubleshooting PM2

Guia completo para resolver problemas com o PM2 no servidor PINOVARA.

## ⚠️ PM2 Não Subiu Depois do Deploy

### Problema Comum

Depois de fazer deploy via FTP, o PM2 não inicia ou mostra erro.

### Causa Principal

O arquivo `backend/dist/server.js` não existe no servidor porque:
- Você enviou apenas o código-fonte (não o build compilado)
- O build foi feito localmente mas não foi enviado
- O build está em um diretório errado

---

## ✅ Solução Passo a Passo

### 1. Conferir se o Backend Compilado Existe

```bash
# Conectar no servidor
ssh pinovara@45.79.206.134

# Verificar se o arquivo existe
ls -la /var/www/pinovara/backend/dist/server.js
```

**Resultado:**
- ✅ **Se o arquivo existir:** Pule para o [Passo 3](#3-iniciar-pm2-com-configuração-correta)
- ❌ **Se NÃO existir:** Continue no Passo 2

---

### 2. Fazer Build no Servidor

Se o `dist/server.js` não existir, você precisa compilar o backend no servidor:

```bash
cd /var/www/pinovara/backend

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Compilar TypeScript → JavaScript
npm run build

# Verificar se foi criado
ls -la dist/server.js
```

**O que cada comando faz:**
- `npm install` - Instala todas as dependências do projeto
- `npx prisma generate` - Gera o Prisma Client (necessário para acessar o banco)
- `npm run build` - Compila TypeScript para JavaScript (cria a pasta `dist/`)

---

### 3. Iniciar PM2 com Configuração Correta

#### Método A: Usando o Script (RECOMENDADO) ⭐

```bash
cd /var/www/pinovara
bash scripts/deploy/start-pm2.sh
```

O script faz tudo automaticamente:
- Remove processo PM2 anterior
- Inicia novo processo com `--cwd` correto
- Salva configuração
- Mostra status e logs

#### Método B: Comando Manual

```bash
cd /var/www/pinovara

# Remover processo anterior (se existir)
pm2 delete pinovara-backend 2>/dev/null || true

# Iniciar com cwd correto
pm2 start backend/dist/server.js \
  --name pinovara-backend \
  --cwd /var/www/pinovara/backend

# Salvar configuração
pm2 save
```

#### Método C: Usando ecosystem.config.cjs

```bash
cd /var/www/pinovara

# Copiar configuração para raiz (se ainda não estiver)
cp scripts/deploy/ecosystem.config.cjs .

# Iniciar com a configuração
pm2 start ecosystem.config.cjs --env production
```

---

### 4. Verificar se Funcionou

```bash
# Ver status do PM2
pm2 status

# Ver logs (últimas 30 linhas)
pm2 logs pinovara-backend --lines 30

# Testar health check
curl -s http://localhost:3001/health

# Se funcionar, deve retornar:
# {"status":"ok","timestamp":"..."}
```

---

## 🚨 Erros Comuns e Soluções

### Erro: "Cannot find module '@prisma/client'"

**Causa:** Prisma Client não foi gerado no servidor.

**Solução:**
```bash
cd /var/www/pinovara/backend
npm install
npx prisma generate
pm2 restart pinovara-backend
```

---

### Erro: "Cannot find module 'express'" ou outras dependências

**Causa:** node_modules não está instalado ou está incompleto.

**Solução:**
```bash
cd /var/www/pinovara/backend
rm -rf node_modules
npm install
pm2 restart pinovara-backend
```

---

### Erro: "ENOENT: no such file or directory, open '.env'"

**Causa:** PM2 não está rodando no diretório correto.

**Solução:** Use o `--cwd` correto:
```bash
pm2 delete pinovara-backend
pm2 start backend/dist/server.js \
  --name pinovara-backend \
  --cwd /var/www/pinovara/backend
pm2 save
```

---

### PM2 mostra "errored" ou "stopped"

**Diagnóstico:**
```bash
# Ver logs de erro
pm2 logs pinovara-backend --err --lines 50

# Ver informações detalhadas
pm2 describe pinovara-backend
```

**Soluções comuns:**
1. Verificar se a porta 3001 está em uso:
   ```bash
   lsof -i :3001
   # Se estiver, matar processo: kill -9 [PID]
   ```

2. Verificar variáveis de ambiente:
   ```bash
   cd /var/www/pinovara/backend
   cat .env | grep -E "DATABASE_URL|PORT|JWT_SECRET"
   ```

3. Verificar conexão com banco:
   ```bash
   cd /var/www/pinovara/backend
   npx prisma db pull --preview-feature
   ```

---

### PM2 reinicia constantemente (crash loop)

**Causa:** Aplicação está crashando logo após iniciar.

**Diagnóstico:**
```bash
# Ver logs em tempo real
pm2 logs pinovara-backend

# Ver informações de restart
pm2 describe pinovara-backend | grep -A 5 "restart"
```

**Soluções:**
1. Verificar logs de erro específico
2. Testar executar diretamente (sem PM2):
   ```bash
   cd /var/www/pinovara/backend
   node dist/server.js
   ```
3. Se funcionar direto, problema está na configuração PM2

---

## 📋 Comandos PM2 Úteis

### Status e Monitoramento
```bash
# Ver status de todos os processos
pm2 status

# Ver status detalhado de um processo
pm2 describe pinovara-backend

# Monitorar em tempo real
pm2 monit

# Ver logs em tempo real
pm2 logs pinovara-backend

# Ver apenas logs de erro
pm2 logs pinovara-backend --err

# Ver últimas N linhas
pm2 logs pinovara-backend --lines 100
```

### Controle de Processos
```bash
# Reiniciar
pm2 restart pinovara-backend

# Parar
pm2 stop pinovara-backend

# Iniciar (se parado)
pm2 start pinovara-backend

# Remover do PM2
pm2 delete pinovara-backend

# Recarregar (zero downtime)
pm2 reload pinovara-backend
```

### Gerenciamento
```bash
# Salvar lista atual de processos
pm2 save

# Restaurar processos salvos
pm2 resurrect

# Limpar todos os processos
pm2 flush

# Ver uso de recursos
pm2 list
```

---

## 🔄 Processo Completo de Deploy com PM2

Quando fizer deploy, siga esta ordem:

```bash
# 1. Conectar no servidor
ssh pinovara@45.79.206.134

# 2. Ir para o diretório do projeto
cd /var/www/pinovara

# 3. Fazer backup (opcional)
mkdir -p backups
tar -czf backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz backend/dist frontend/dist 2>/dev/null || true

# 4. Extrair novo deploy
tar -xzf deploy.tar.gz
rm -rf backend/dist frontend/dist
mv backend-dist backend/dist
mv frontend-dist frontend/dist

# 5. Se não tiver dist/server.js, fazer build
if [ ! -f "backend/dist/server.js" ]; then
    cd backend
    npm install
    npx prisma generate
    npm run build
    cd ..
fi

# 6. Copiar frontend para nginx
sudo cp -r frontend/dist/* /var/www/html/

# 7. Reiniciar backend com PM2
bash scripts/deploy/start-pm2.sh

# 8. Recarregar nginx
sudo systemctl reload nginx

# 9. Limpar arquivo de deploy
rm deploy.tar.gz

# 10. Verificar
pm2 status
pm2 logs pinovara-backend --lines 20
curl -s http://localhost:3001/health
curl -I https://pinovaraufba.com.br
```

---

## 💡 Melhores Práticas

1. **Sempre use `--cwd`** ao iniciar PM2 manualmente
2. **Salve a configuração** com `pm2 save` após mudanças
3. **Monitore os logs** após cada deploy
4. **Faça backup** antes de deploy em produção
5. **Teste o health check** após cada deploy
6. **Use o script start-pm2.sh** - ele já tem tudo configurado corretamente

---

## 🆘 Se Nada Funcionar

Se depois de tudo isso o PM2 ainda não funcionar:

1. **Coletar informações:**
   ```bash
   pm2 logs pinovara-backend --lines 100 > /tmp/pm2-logs.txt
   cat /var/www/pinovara/backend/.env > /tmp/env-vars.txt (sem senhas!)
   ls -la /var/www/pinovara/backend/dist/ > /tmp/dist-files.txt
   ```

2. **Tentar iniciar direto (sem PM2):**
   ```bash
   cd /var/www/pinovara/backend
   node dist/server.js
   ```
   
   Se funcionar, o problema é na configuração PM2.
   Se não funcionar, o problema é no código/configuração.

3. **Verificar permissões:**
   ```bash
   sudo chown -R pinovara:pinovara /var/www/pinovara
   sudo chmod -R 755 /var/www/pinovara
   ```

4. **Última opção - Reinstalar tudo:**
   ```bash
   cd /var/www/pinovara/backend
   rm -rf node_modules dist
   npm install
   npx prisma generate
   npm run build
   cd ..
   bash scripts/deploy/start-pm2.sh
   ```

---

## 📚 Recursos Adicionais

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Process Management](https://pm2.keymetrics.io/docs/usage/process-management/)
- [PM2 Logging](https://pm2.keymetrics.io/docs/usage/log-management/)

---

🚀 Com este guia, você deve conseguir resolver qualquer problema com PM2!
