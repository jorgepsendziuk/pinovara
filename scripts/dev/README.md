# 🛠️ Scripts de Desenvolvimento - PINOVARA

Scripts otimizados para gerenciar o ambiente de desenvolvimento local do projeto PINOVARA.

## 📋 Scripts Disponíveis

### 🚀 `dev-start.sh`
**Inicia o ambiente completo de desenvolvimento**

```bash
./scripts/dev/dev-start.sh
```

**O que faz:**
- ✅ Verifica dependências (Node.js, npm)
- ✅ Configura arquivos `.env` automaticamente
- ✅ Instala dependências se necessário
- ✅ Inicia backend (porta 3001) em background
- ✅ Inicia frontend (porta 5173) em background
- ✅ Verifica status dos serviços
- ✅ Gera logs organizados

### 🛑 `dev-stop.sh`
**Para todos os serviços do ambiente**

```bash
./scripts/dev/dev-stop.sh
```

**O que faz:**
- ✅ Para backend e frontend graciosamente
- ✅ Limpa processos órfãos
- ✅ Verifica se portas estão livres
- ✅ Remove arquivos PID

### 📊 `dev-status.sh`
**Verifica status completo do ambiente**

```bash
./scripts/dev/dev-status.sh
```

**O que faz:**
- ✅ Status de Node.js e npm
- ✅ Status dos serviços (backend/frontend)
- ✅ Health checks de endpoints
- ✅ Verificação de configurações
- ✅ Informações de logs
- ✅ Comandos úteis

### 📋 `dev-logs.sh`
**Visualiza logs em tempo real**

```bash
# Ver logs de ambos os serviços
./scripts/dev/dev-logs.sh

# Ver apenas logs do backend
./scripts/dev/dev-logs.sh backend

# Ver apenas logs do frontend  
./scripts/dev/dev-logs.sh frontend
```

**Opções:**
- `backend` ou `be` - Apenas logs do backend
- `frontend` ou `fe` - Apenas logs do frontend
- `both` ou `all` - Logs de ambos (padrão)

## 🚀 Fluxo de Trabalho Recomendado

### 1. **Primeiro Uso**
```bash
# Iniciar ambiente pela primeira vez
./scripts/dev/dev-start.sh

# Verificar se tudo está funcionando
./scripts/dev/dev-status.sh
```

### 2. **Desenvolvimento Diário**
```bash
# Iniciar desenvolvimento
./scripts/dev/dev-start.sh

# Acompanhar logs (em outro terminal)
./scripts/dev/dev-logs.sh

# Verificar status quando necessário
./scripts/dev/dev-status.sh

# Finalizar desenvolvimento
./scripts/dev/dev-stop.sh
```

### 3. **Solução de Problemas**
```bash
# Verificar o que está acontecendo
./scripts/dev/dev-status.sh

# Ver logs para debug
./scripts/dev/dev-logs.sh backend

# Reiniciar ambiente
./scripts/dev/dev-stop.sh
./scripts/dev/dev-start.sh
```

## 📁 Estrutura de Logs

Os logs são salvos automaticamente em:

```
logs/
├── backend.log      # Logs do servidor backend
├── frontend.log     # Logs do servidor frontend
├── backend.pid      # PID do processo backend
└── frontend.pid     # PID do processo frontend
```

## ⚙️ Configurações Importantes

### Backend (`.env`)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=pinovara"
JWT_SECRET=your_secret_key_here
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001
VITE_NODE_ENV=development
VITE_API_LOGGING=true
```

## 🔧 Requisitos

- **Node.js 18+**
- **npm 8+**
- **PostgreSQL** (para backend)
- **Portas livres:** 3001 (backend), 5173 (frontend)

## 💡 Dicas de Uso

### Hot Reload
- ✅ **Backend**: Detecta mudanças automaticamente (ts-node-dev)
- ✅ **Frontend**: Hot Module Replacement do Vite

### Logs com Cores
- 🟢 **Backend**: Verde
- 🔵 **Frontend**: Ciano
- ⚠️ **Warnings**: Amarelo
- ❌ **Errors**: Vermelho

### Monitoramento
```bash
# Terminal 1: Logs em tempo real
./scripts/dev/dev-logs.sh

# Terminal 2: Desenvolvimento
# Fazer alterações no código...

# Terminal 3: Status quando necessário
./scripts/dev/dev-status.sh
```

## 🚨 Solução de Problemas Comuns

### **Porta já em uso**
```bash
# Parar todos os processos
./scripts/dev/dev-stop.sh

# Verificar se parou
./scripts/dev/dev-status.sh

# Reiniciar
./scripts/dev/dev-start.sh
```

### **Dependências desatualizadas**
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install

# Reiniciar ambiente
./scripts/dev/dev-stop.sh
./scripts/dev/dev-start.sh
```

### **Problemas de banco de dados**
```bash
# Verificar configuração
cat backend/.env

# Ver logs do backend
./scripts/dev/dev-logs.sh backend
```

## 📞 Suporte

Se encontrar problemas:

1. ✅ Execute `./scripts/dev/dev-status.sh` para diagnóstico
2. ✅ Verifique os logs com `./scripts/dev/dev-logs.sh`  
3. ✅ Tente reiniciar o ambiente
4. ✅ Verifique configurações `.env`

---

**🚀 Happy coding with PINOVARA!**