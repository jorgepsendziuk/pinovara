# 🗄️ Scripts de Banco de Dados

Scripts para operações específicas do banco de dados PINOVARA.

## 📁 Arquivos

- **`assign-admin-role.js`** - Atribuir papel admin
- **`create-tables.js`** - Criar tabelas
- **`setup-tecnico-role.js`** - Configurar papel técnico
- **`update-tecnico-passwords.js`** - Atualizar senhas dos técnicos

## 🎯 Scripts Disponíveis

### `assign-admin-role.js`
Atribui papel de administrador a um usuário:
- Busca usuário por email
- Atribui papel admin
- Verifica permissões

**Uso:**
```bash
node scripts/database/assign-admin-role.js
```

### `create-tables.js`
Cria tabelas básicas do sistema:
- Tabelas principais
- Índices necessários
- Dados iniciais

**Uso:**
```bash
node scripts/database/create-tables.js
```

### `setup-tecnico-role.js`
Configura o papel de técnico no sistema:
- Cria/verifica módulo "organizacoes"
- Cria/verifica papel "tecnico"
- Mostra resumo dos papéis

**Uso:**
```bash
node scripts/database/setup-tecnico-role.js
```

### `update-tecnico-passwords.js`
Atualiza senhas de todos os usuários técnicos:
- Identifica usuários com papel "tecnico"
- Atualiza senhas para senha padrão
- Usa hash bcrypt seguro
- Mostra preview antes de executar

**Uso:**
```bash
node scripts/database/update-tecnico-passwords.js
```

## 🗄️ Operações Disponíveis

### Gerenciamento de Usuários
- ✅ Atribuir papéis
- ✅ Verificar permissões
- ✅ Listar usuários
- ✅ Atualizar senhas em lote
- ✅ Reset de senhas por papel

### Estrutura do Banco
- ✅ Criar tabelas
- ✅ Criar índices
- ✅ Dados iniciais

### Manutenção
- ✅ Backup de dados
- ✅ Limpeza de dados
- ✅ Otimização

## 🔍 Comandos Úteis

```bash
# Prisma
npx prisma generate
npx prisma db push
npx prisma studio

# PostgreSQL
psql $DATABASE_URL
psql $DATABASE_URL -c "SELECT * FROM users;"

# Backup
pg_dump $DATABASE_URL > backup.sql
```

## 📊 Estrutura do Banco

### Tabelas Principais
- `users` - Usuários do sistema
- `roles` - Papéis/permissões
- `modules` - Módulos do sistema
- `user_roles` - Relação usuário-papel
- `organizations` - Organizações

### Relacionamentos
- Usuário → Papéis (many-to-many)
- Papel → Módulo (many-to-one)
- Usuário → Organização (many-to-one)