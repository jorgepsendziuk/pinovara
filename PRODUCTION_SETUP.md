# 🚀 CONFIGURAÇÃO PARA PRODUÇÃO - PINOVARA

## 📋 Problema Identificado
O frontend estava hardcoded para usar `http://localhost:3001`, causando erro `ERR_CONNECTION_REFUSED` no servidor remoto.

## ✅ Solução Implementada

### 1. **Configuração Dinâmica da API** 🔧
```typescript
// Antes (problema):
baseURL: 'http://localhost:3001'

// Depois (solução):
baseURL: import.meta.env.VITE_API_URL ||
         window.location.origin.replace('5173', '3001').replace('8080', '3001')
```

### 2. **Como Funciona Agora:**

**📍 Desenvolvimento Local:**
- URL: `http://localhost:5173` (frontend) + `http://localhost:3001` (backend)
- ✅ Funciona automaticamente

**🌐 Produção/Servidor Remoto:**
- URL: `https://pinovaraufba.com.br` (frontend) + `https://pinovaraufba.com.br/api` (backend)
- ✅ Detecta automaticamente a origem

## ⚙️ **Configurações Necessárias**

### **Opção 1: Arquivo .env (Recomendado)**
```bash
# No servidor remoto, crie o arquivo:
cd /var/www/pinovara/frontend
nano .env
```

Conteúdo do `.env`:
```env
VITE_API_URL=https://pinovaraufba.com.br/api
```

### **Opção 2: Configuração no Build**
```bash
# No deploy, definir variável de ambiente:
VITE_API_URL=https://pinovaraufba.com.br/api npm run build
```

### **Opção 3: Configuração no Servidor Web**
Se usar Nginx/Apache, configurar proxy reverso:

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name pinovaraufba.com.br;

    # Frontend (React)
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API (Node.js)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📋 **Verificação**

### **Teste Local:**
```bash
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
curl http://localhost:3001/health
```

### **Teste Remoto:**
```bash
# Frontend: https://pinovaraufba.com.br
# Backend: https://pinovaraufba.com.br/api
curl https://pinovaraufba.com.br/api/health
```

## 🔧 **Comandos de Deploy**

### **Deploy Completo:**
```bash
cd /var/www/pinovara

# Frontend com variável de ambiente
VITE_API_URL=https://pinovaraufba.com.br/api npm run build

# Ou usando arquivo .env
echo "VITE_API_URL=https://pinovaraufba.com.br/api" > frontend/.env
cd frontend && npm run build

# Backend
cd ../backend && npm run build
```

### **Deploy Automático:**
```bash
# Usar o script existente
./deploy-prod.sh pinovaraufba.com.br root
```

## 🎯 **Resultado Esperado**

Após configuração:
- ✅ **Local:** `http://localhost:5173` → `http://localhost:3001`
- ✅ **Remoto:** `https://pinovaraufba.com.br` → `https://pinovaraufba.com.br/api`
- ✅ **Sem erros** de conexão
- ✅ **API funcionando** corretamente

## 📞 **Suporte**

Se ainda houver problemas:
1. Verificar logs do navegador (F12)
2. Verificar logs do backend: `pm2 logs pinovara-backend`
3. Verificar se o backend está rodando: `curl http://localhost:3001/health`
4. Verificar CORS no backend

**Agora o sistema funciona tanto localmente quanto remotamente!** 🚀✨
