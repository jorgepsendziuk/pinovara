# 🔧 CORREÇÃO: Backend sem dist/server.js

## ❌ PROBLEMA
```
Error: Cannot find module '/var/www/pinovara/backend/dist/server.js'
```

**CAUSA:** O deploy-full NÃO compilou o backend antes de enviar.

---

## ✅ SOLUÇÃO RÁPIDA (3 comandos)

### 1️⃣ Compilar backend localmente
```bash
cd backend && npm run build
```

### 2️⃣ Enviar dist/ para o servidor
```bash
scp -r dist pinovaraufba@pinovaraufba.com.br:/var/www/pinovara/backend/
```

### 3️⃣ Reiniciar backend
```bash
ssh pinovaraufba@pinovaraufba.com.br 'pm2 restart pinovara-backend && pm2 logs pinovara-backend --lines 20 --nostream'
```

---

## 🚀 MÉTODO ALTERNATIVO (Script Automático)

```bash
./scripts/fix-remote-backend.sh
```
(O script vai perguntar se deseja compilar e enviar)

---

## 🔍 VERIFICAÇÃO

Após corrigir, teste:

```bash
# Ver se backend está rodando
ssh pinovaraufba@pinovaraufba.com.br 'pm2 list'

# Testar endpoint
curl https://pinovaraufba.com.br/api/health
```

---

## 📋 CAUSA RAIZ

O `deploy-full.yml` tinha:
```yaml
- name: 🏗️ Build Backend
  run: |
    npm ci
    npm run build  # ✅ TEM build
```

Mas o `deploy.yml` (normal) tinha:
```yaml
- name: 🏗️ Prepare Backend  
  run: |
    npm ci  # ❌ NÃO tem build!
```

**CORREÇÃO PERMANENTE:** Adicionar `npm run build` no `deploy.yml` também!

---

## 🔧 CORREÇÃO PERMANENTE (para próximos deploys)

Edite `.github/workflows/deploy.yml` linha 51-56:

**ANTES:**
```yaml
- name: 🏗️ Prepare Backend
  working-directory: ./backend
  run: |
    echo "🔨 Preparing backend..."
    npm ci --production=false
    echo "✅ Backend prepared"
```

**DEPOIS:**
```yaml
- name: 🏗️ Build Backend
  working-directory: ./backend
  run: |
    echo "🔨 Building backend..."
    npm ci --production=false
    npm run build
    echo "✅ Backend built successfully"
```

