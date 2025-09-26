# ================================
# PINOVARA - Docker Environment Setup
# ================================

## 📋 Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com estas variáveis:

```bash
# ========== DATABASE ==========
# IMPORTANTE: Use seu banco PostgreSQL remoto atual
DATABASE_URL="postgresql://usuario:senha@seu-host-remoto.com:5432/pinovara?schema=pinovara"

# ========== JWT ==========
JWT_SECRET="sua-chave-jwt-secreta-aqui"

# ========== API ==========
API_TIMEOUT=10000

# ========== NODE_ENV ==========
# development ou production
NODE_ENV=development

# ========== PORTS ==========
PORT=3001
```

## 🔧 Como Configurar

1. **Copie seu `.env` atual** (não queremos perder suas configurações)
2. **Verifique a `DATABASE_URL`** - deve apontar para seu banco remoto
3. **Certifique-se de que `JWT_SECRET`** está definida
4. **Teste a conexão** antes de usar Docker

## 🧪 Teste de Conexão

Antes de usar Docker, teste se consegue conectar ao banco:

```bash
cd backend
npm install
npx prisma db push
```

Se funcionar, o Docker também vai funcionar! ✅
