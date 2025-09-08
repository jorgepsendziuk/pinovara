# Configuração - PINOVARA

## 📋 Visão Geral

O sistema PINOVARA utiliza variáveis de ambiente para configuração. O arquivo principal de configuração está localizado em `backend/config.env`.

## 🔧 Arquivo de Configuração

### Localização
```
backend/config.env
```

### Conteúdo Atual
```env
# Database
DATABASE_URL="postgresql://pinovara:pinovara@bd.amarisufv.com.br:5432/pinovara?schema=pinovara"

# JWT
JWT_SECRET="pinovara-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
```

## 📊 Variáveis de Ambiente

### Banco de Dados

#### `DATABASE_URL`
- **Descrição**: URL de conexão com PostgreSQL
- **Formato**: `postgresql://usuario:senha@host:porta/database?schema=esquema`
- **Obrigatório**: Sim
- **Valor Atual**: `postgresql://pinovara:pinovara@bd.amarisufv.com.br:5432/pinovara?schema=pinovara`
- **Notas**: Deve incluir credenciais válidas e apontar para banco PostgreSQL existente

### JWT (JSON Web Tokens)

#### `JWT_SECRET`
- **Descrição**: Chave secreta para assinatura dos tokens JWT
- **Tipo**: String
- **Obrigatório**: Sim
- **Valor Atual**: `pinovara-secret-key-change-in-production`
- **Recomendação**: Deve ser uma string longa e aleatória em produção
- **Notas**: **IMPORTANTE**: Alterar para valor seguro antes do deploy em produção

#### `JWT_EXPIRES_IN`
- **Descrição**: Tempo de expiração dos tokens JWT
- **Tipo**: String (formato de tempo do jsonwebtoken)
- **Valores Possíveis**: `1h`, `24h`, `7d`, `30d`, etc.
- **Valor Atual**: `7d`
- **Padrão**: `24h` (se não definido)
- **Notas**: Tokens expirados são rejeitados automaticamente

### Servidor

#### `PORT`
- **Descrição**: Porta onde o servidor Express irá rodar
- **Tipo**: Number
- **Valor Atual**: `3001`
- **Padrão**: `3001` (se não definido)
- **Notas**: Deve ser uma porta disponível no sistema

#### `NODE_ENV`
- **Descrição**: Ambiente de execução da aplicação
- **Valores Possíveis**: `development`, `production`, `test`
- **Valor Atual**: `development`
- **Padrão**: `development` (se não definido)
- **Notas**: Afeta comportamento de logs, cache, otimizações, etc.

### CORS (Cross-Origin Resource Sharing)

#### `FRONTEND_URL`
- **Descrição**: URL do frontend para configuração CORS
- **Tipo**: String (URL)
- **Valor Atual**: `http://localhost:5173`
- **Padrão**: `http://localhost:5173` (se não definido)
- **Notas**: Deve corresponder à URL onde o frontend está rodando

## 🚀 Configuração por Ambiente

### Desenvolvimento
Arquivo: `backend/config.env` (já existente)

```env
DATABASE_URL="postgresql://pinovara:pinovara@bd.amarisufv.com.br:5432/pinovara?schema=pinovara"
JWT_SECRET="development-secret-key-32-characters-minimum"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### Produção
Arquivo: `backend/.env` (criar baseado em `config.env`)

```env
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/prod_db?schema=public"
JWT_SECRET="production-super-secure-secret-key-64-characters-minimum"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://meuapp.com"
```

## 🛠️ Como Configurar

### 1. Copiar Arquivo de Configuração
```bash
cd backend
cp config.env .env
```

### 2. Editar Variáveis
Editar o arquivo `.env` com valores apropriados para o ambiente.

### 3. Validar Configuração
```bash
# Verificar se as variáveis estão carregadas
node -e "console.log(require('dotenv').config())"
```

## 🔒 Segurança das Variáveis

### Chaves Sensíveis
- `DATABASE_URL`: Contém credenciais do banco
- `JWT_SECRET`: Chave de criptografia dos tokens

### Boas Práticas
1. **Nunca commite** arquivos `.env` no Git
2. Use **chaves diferentes** para cada ambiente
3. **Rotacione** chaves periodicamente em produção
4. Use **gerenciadores de segredo** em produção (AWS Secrets Manager, etc.)

### Arquivo .gitignore
Certifique-se de que o `.env` está no `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

## 📊 Validação no Código

### Verificação no server.ts
```typescript
// Verificar variáveis de ambiente essenciais
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no arquivo config.env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET não definido. Usando valor padrão (não recomendado para produção)');
}
```

### Valores Padrão
- `JWT_EXPIRES_IN`: `24h`
- `PORT`: `3001`
- `FRONTEND_URL`: `http://localhost:5173`

## 🔄 Configuração Dinâmica

### System Settings (Banco de Dados)
Além das variáveis de ambiente, o sistema suporta configurações dinâmicas armazenadas no banco:

```sql
-- Exemplos de configurações dinâmicas
INSERT INTO system_settings (key, value, type, description, category) VALUES
('app.name', 'PINOVARA', 'string', 'Nome da aplicação', 'general'),
('app.version', '1.0.0', 'string', 'Versão da aplicação', 'general'),
('email.enabled', 'true', 'boolean', 'Habilitar envio de emails', 'email'),
('cache.ttl', '3600', 'number', 'TTL do cache em segundos', 'cache');
```

### Acesso às Configurações Dinâmicas
```typescript
// Buscar configuração dinâmica
const setting = await prisma.systemSetting.findUnique({
  where: { key: 'app.name' }
});

const appName = setting?.value || 'PINOVARA';
```

## 🚨 Troubleshooting

### Erro: "DATABASE_URL não encontrada"
- Verificar se arquivo `config.env` existe
- Verificar se variável `DATABASE_URL` está definida
- Verificar se arquivo está sendo carregado corretamente

### Erro: "JWT_SECRET não definido"
- Definir uma chave segura no arquivo `.env`
- Usar pelo menos 32 caracteres
- Evitar caracteres especiais que possam causar problemas

### Erro: "Porta já em uso"
- Alterar valor da variável `PORT`
- Verificar se outro processo está usando a porta
- Usar comando `lsof -i :porta` para verificar

### Conexão com Banco Falha
- Verificar credenciais no `DATABASE_URL`
- Verificar se PostgreSQL está rodando
- Verificar conectividade de rede
- Verificar se banco e schema existem

## 📝 Scripts de Configuração

### Verificar Configuração
```bash
# Backend
cd backend
npm run prisma:studio  # Verificar conexão com banco
npm run dev           # Verificar se servidor inicia
```

### Reset de Configuração
```bash
# Limpar configurações
cd backend
rm -f .env
cp config.env .env
# Editar .env com valores corretos
```

## 🎯 Próximas Melhorias

- [ ] Implementar validação de schema para variáveis de ambiente
- [ ] Adicionar suporte a múltiplos ambientes (staging, production)
- [ ] Implementar hot-reload de configurações
- [ ] Adicionar monitoramento de mudanças nas configurações
- [ ] Implementar backup e restore de configurações

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
