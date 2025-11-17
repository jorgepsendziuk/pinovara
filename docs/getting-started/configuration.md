# 🔧 Configurações PINOVARA - Localhost vs Produção

## 📋 Visão Geral

O sistema PINOVARA agora está configurado para funcionar tanto em **localhost** (desenvolvimento) quanto na **nuvem** (produção) de forma automática.

## 🌐 Configurações por Ambiente

### Desenvolvimento (Localhost)
- **Site**: `http://localhost:5173`
- **Backend**: `http://localhost:3001`
- **Banco**: `localhost:5432`

### Produção (Nuvem)
- **Site**: `https://pinovaraufba.com.br`
- **Backend**: `https://pinovaraufba.com.br`
- **Banco**: `10.158.0.2:5432` (IP interno)

## 🛠️ Arquivos de Configuração

### `backend/config.env`
Arquivo principal de configuração que muda automaticamente baseado no `NODE_ENV`.

### `backend/production.config.js`
Configuração alternativa para produção (cópia de segurança).

### `frontend/vite.config.ts`
Proxy condicional que detecta o ambiente automaticamente.

## 🚀 Como Usar

### Para Desenvolvimento
```bash
# Configurar para desenvolvimento
./switch-env.sh
# Escolher opção 1

# Iniciar desenvolvimento
cd backend && npm run dev
cd frontend && npm run dev
```

### Para Produção
```bash
# Configurar para produção
./switch-env.sh
# Escolher opção 2

# Fazer deploy
./deploy-without-git.sh
./deploy-direct.sh
```

## 🔄 Detecção Automática de Ambiente

O sistema detecta automaticamente o ambiente através da variável `NODE_ENV`:

- `NODE_ENV=development` → Usa configurações de localhost
- `NODE_ENV=production` → Usa configurações de produção

## 🗄️ Configurações de Banco de Dados

### Desenvolvimento
```env
DATABASE_URL="postgresql://pinovara:pinovara@localhost:5432/pinovara?schema=pinovara"
```

### Produção
```env
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"
```

## 🌐 Configurações CORS

O backend permite automaticamente as seguintes origens:
- `http://localhost:5173` (desenvolvimento)
- `http://127.0.0.1:5173` (desenvolvimento alternativo)
- `https://pinovaraufba.com.br` (produção)
- `https://www.pinovaraufba.com.br` (produção com www)

## 📦 Deploy Automático

Os scripts de deploy foram atualizados para:
1. Detectar o ambiente de produção
2. Configurar automaticamente as variáveis corretas
3. Usar o IP interno do banco (10.158.0.2)
4. Configurar o domínio pinovaraufba.com.br

## ⚡ Scripts Disponíveis

- `./switch-env.sh` - Alternar entre desenvolvimento e produção
- `./deploy-without-git.sh` - Criar pacote de deploy
- `./deploy-direct.sh` - Deploy direto no servidor
- `./check-deployment.sh` - Verificar status do deploy

## 🔐 Segurança

- JWT_SECRET deve ser alterado em produção
- As configurações são carregadas dinamicamente
- CORS configurado para aceitar apenas origens permitidas
- Ambiente de produção usa HTTPS automaticamente
