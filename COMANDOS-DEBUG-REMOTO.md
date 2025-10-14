# 🔧 Comandos para Debug do Servidor Remoto

## 🚀 Método Rápido (Script Automático)

```bash
./scripts/diagnose-remote.sh
```

---

## 📋 Comandos Individuais (use se preferir)

### 1️⃣ Ver logs do backend (erro 500 aparecerá aqui)
```bash
ssh pinovaraufba@pinovaraufba.com.br 'pm2 logs pinovara-backend --lines 50 --nostream'
```

### 2️⃣ Verificar se Prisma Client foi gerado
```bash
ssh pinovaraufba@pinovaraufba.com.br 'ls -la /var/www/pinovara/backend/node_modules/@prisma/client/ | head -5'
```

### 3️⃣ Verificar schema.prisma no servidor (campos validacao)
```bash
ssh pinovaraufba@pinovaraufba.com.br 'grep -A 5 "validacao_status" /var/www/pinovara/backend/prisma/schema.prisma'
```

### 4️⃣ Testar endpoint direto no servidor
```bash
ssh pinovaraufba@pinovaraufba.com.br 'curl -s http://localhost:3001/health | jq .'
```

---

## 🔧 Comandos de Correção

### ✅ Se Prisma NÃO foi gerado
```bash
ssh pinovaraufba@pinovaraufba.com.br 'cd /var/www/pinovara/backend && npx prisma generate && pm2 restart pinovara-backend'
```

### ✅ Se schema está errado (copiar schema correto)
```bash
scp backend/prisma/schema.prisma pinovaraufba@pinovaraufba.com.br:/var/www/pinovara/backend/prisma/
ssh pinovaraufba@pinovaraufba.com.br 'cd /var/www/pinovara/backend && npx prisma generate && pm2 restart pinovara-backend'
```

### ✅ Reiniciar backend
```bash
ssh pinovaraufba@pinovaraufba.com.br 'pm2 restart pinovara-backend'
```

### ✅ Ver logs em tempo real
```bash
ssh pinovaraufba@pinovaraufba.com.br 'pm2 logs pinovara-backend'
```
(Pressione Ctrl+C para sair)

---

## 🎯 Sequência de Debug Recomendada

1. **Execute o script de diagnóstico:**
   ```bash
   ./scripts/diagnose-remote.sh
   ```

2. **Se mostrar erro nos logs, copie a mensagem de erro**

3. **Se Prisma Client não existir, regenere:**
   ```bash
   ssh pinovaraufba@pinovaraufba.com.br 'cd /var/www/pinovara/backend && npx prisma generate && pm2 restart pinovara-backend'
   ```

4. **Teste novamente:**
   ```bash
   curl https://pinovaraufba.com.br/api/organizacoes/dashboard
   ```

---

## 📝 Verificação Rápida

Execute este comando para ver TUDO de uma vez:

```bash
ssh pinovaraufba@pinovaraufba.com.br 'echo "=== PM2 Status ===" && pm2 list && echo "" && echo "=== Últimos Logs ===" && pm2 logs pinovara-backend --lines 20 --nostream && echo "" && echo "=== Prisma Client ===" && ls -la /var/www/pinovara/backend/node_modules/@prisma/client/ 2>/dev/null | head -3 && echo "" && echo "=== Schema Validacao ===" && grep "validacao_status" /var/www/pinovara/backend/prisma/schema.prisma'
```

