# Schema do Banco de Dados - PINOVARA

## 📊 Visão Geral

O sistema PINOVARA utiliza PostgreSQL como banco de dados principal, com o Prisma como ORM para gerenciamento de schema, migrações e queries. O schema está localizado em `backend/prisma/schema.prisma`.

## 🗂️ Entidades Principais

### 1. User (Usuários)

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  name      String
  active    Boolean    @default(true)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // Relacionamentos
  userRoles UserRole[]
  auditLogs AuditLog[]

  @@map("users")
}
```

**Campos:**
- `id`: Identificador único (CUID)
- `email`: Email único do usuário
- `password`: Senha hashada (bcrypt)
- `name`: Nome completo do usuário
- `active`: Status do usuário (ativo/inativo)
- `createdAt/updatedAt`: Timestamps automáticos

**Relacionamentos:**
- `userRoles`: Roles atribuídos ao usuário (1:N)
- `auditLogs`: Logs de auditoria do usuário (1:N)

### 2. Module (Módulos)

```prisma
model Module {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacionamentos
  roles Role[]

  @@map("modules")
}
```

**Campos:**
- `id`: Identificador único
- `name`: Nome único do módulo
- `description`: Descrição opcional
- `active`: Status do módulo
- `createdAt/updatedAt`: Timestamps

**Relacionamentos:**
- `roles`: Roles pertencentes ao módulo (1:N)

### 3. Role (Papéis/Funções)

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String
  description String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacionamentos
  module    Module     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  moduleId  String
  userRoles UserRole[]

  @@unique([name, moduleId])
  @@map("roles")
}
```

**Campos:**
- `id`: Identificador único
- `name`: Nome do papel (não único globalmente)
- `description`: Descrição opcional
- `active`: Status do papel
- `moduleId`: Referência ao módulo pai
- `createdAt/updatedAt`: Timestamps

**Restrições:**
- `@@unique([name, moduleId])`: Nome único dentro do módulo
- `onDelete: Cascade`: Deleta roles quando módulo é deletado

**Relacionamentos:**
- `module`: Módulo ao qual pertence (N:1)
- `userRoles`: Usuários com este papel (1:N)

### 4. UserRole (Associação Usuário-Papel)

```prisma
model UserRole {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@map("user_roles")
}
```

**Campos:**
- `id`: Identificador único
- `userId`: Referência ao usuário
- `roleId`: Referência ao papel
- `createdAt/updatedAt`: Timestamps

**Restrições:**
- `@@unique([userId, roleId])`: Um usuário não pode ter o mesmo papel duplicado
- `onDelete: Cascade`: Remove associação quando usuário ou papel é deletado

### 5. SystemSetting (Configurações do Sistema)

```prisma
model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  type        String   // string, number, boolean, json
  description String?
  category    String   @default("general")
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("system_settings")
}
```

**Campos:**
- `id`: Identificador único
- `key`: Chave única da configuração
- `value`: Valor da configuração (sempre string)
- `type`: Tipo de dado (string, number, boolean, json)
- `description`: Descrição da configuração
- `category`: Categoria para agrupamento
- `active`: Status da configuração
- `createdAt/updatedAt`: Timestamps

### 6. AuditLog (Logs de Auditoria)

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  entity     String   // users, roles, settings, etc.
  entityId   String?
  oldData    String?  // JSON
  newData    String?  // JSON
  userAgent  String?
  ipAddress  String?
  createdAt  DateTime @default(now())

  // Relacionamentos
  user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId String?

  @@map("audit_logs")
}
```

**Campos:**
- `id`: Identificador único
- `action`: Ação realizada (CREATE, UPDATE, DELETE, etc.)
- `entity`: Entidade afetada (users, roles, etc.)
- `entityId`: ID da entidade afetada
- `oldData`: Dados anteriores (JSON string)
- `newData`: Dados novos (JSON string)
- `userAgent`: User agent do navegador
- `ipAddress`: Endereço IP do usuário
- `userId`: Usuário que realizou a ação
- `createdAt`: Timestamp da ação

## 🔗 Diagrama de Relacionamentos

```
User (1) ──── (N) UserRole (N) ──── (1) Role (N) ──── (1) Module
  │                    │                    │
  │                    │                    │
  └────── (1) AuditLog │                    │
                       │                    │
                       └────────────────────┘
```

### Explicação dos Relacionamentos:

1. **User → UserRole**: Um usuário pode ter múltiplos papéis
2. **Role → UserRole**: Um papel pode ser atribuído a múltiplos usuários
3. **Module → Role**: Um módulo pode ter múltiplos papéis
4. **Role → Module**: Um papel pertence a apenas um módulo
5. **User → AuditLog**: Um usuário pode ter múltiplos logs de auditoria
6. **AuditLog → User**: Um log pertence a um usuário (opcional, por causa do SetNull)

## 🗃️ Estrutura das Tabelas no PostgreSQL

### Nomes das Tabelas
- `users` - Usuários
- `modules` - Módulos
- `roles` - Papéis
- `user_roles` - Associação usuário-papel
- `system_settings` - Configurações do sistema
- `audit_logs` - Logs de auditoria

### Índices Automáticos
O Prisma cria automaticamente índices para:
- Campos `@unique`
- Campos `@id`
- Chaves estrangeiras
- Campos `@relation`

## 🔄 Migrações

As migrações estão localizadas em `backend/prisma/migrations/` e são geradas automaticamente pelo Prisma:

```bash
# Gerar migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações
npx prisma migrate deploy

# Reset do banco (desenvolvimento)
npx prisma migrate reset
```

## 📊 Queries Comuns

### Buscar usuário com roles e módulos
```sql
SELECT
  u.id, u.email, u.name,
  r.name as role_name,
  m.name as module_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN modules m ON r.module_id = m.id
WHERE u.id = 'user_id';
```

### Contar usuários por módulo
```sql
SELECT
  m.name as module_name,
  COUNT(DISTINCT ur.user_id) as user_count
FROM modules m
LEFT JOIN roles r ON m.id = r.module_id
LEFT JOIN user_roles ur ON r.id = ur.role_id
GROUP BY m.id, m.name;
```

## 🚀 Próximas Melhorias

- [ ] Adicionar índices compostos para queries frequentes
- [ ] Implementar particionamento para tabelas de audit logs
- [ ] Adicionar constraints de integridade referencial customizadas
- [ ] Implementar soft delete para entidades críticas
- [ ] Adicionar campos de versionamento (optimistic locking)

## 📚 Referências

- [Prisma Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.lucidchart.com/pages/database-diagram/database-design)

---

**Última atualização**: Dezembro 2024
