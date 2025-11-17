# API Endpoints - PINOVARA

## 📡 Visão Geral

A API do PINOVARA é uma REST API construída com Express.js e TypeScript. Todos os endpoints retornam respostas em formato JSON padronizado.

**Base URL**: Produção `https://pinovaraufba.com.br`, Desenvolvimento `http://localhost:3001`

## 📝 Formato de Resposta

### Resposta de Sucesso
```json
{
  "message": "Operação realizada com sucesso",
  "data": {
    // Dados específicos da operação
  }
}
```

### Resposta de Erro
```json
{
  "error": {
    "message": "Mensagem de erro",
    "statusCode": 400,
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      }
    ]
  }
}
```

## 🔐 Sistema de Autenticação

### Headers de Autenticação
Para endpoints protegidos, incluir o header:
```
Authorization: Bearer <token_jwt>
```

## 📋 Endpoints Documentados

### Autenticação (`/auth`)

#### `POST /auth/register`
Registra um novo usuário no sistema.

**Acesso**: Público

**Rate Limit**: 5 tentativas por 15 minutos

**Corpo da Requisição**:
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Resposta de Sucesso (201)**:
```json
{
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": "user_id",
      "email": "usuario@email.com",
      "name": "Nome do Usuário",
      "active": true,
      "roles": []
    },
    "token": "jwt_token_aqui"
  }
}
```

**Possíveis Erros**:
- `400`: Dados inválidos
- `409`: Usuário já existe
- `429`: Muitas tentativas

---

#### `POST /auth/login`
Realiza login no sistema.

**Acesso**: Público

**Rate Limit**: 5 tentativas por 15 minutos

**Corpo da Requisição**:
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "user_id",
      "email": "usuario@email.com",
      "name": "Nome do Usuário",
      "active": true,
      "roles": [
        {
          "id": "role_id",
          "name": "admin",
          "module": {
            "id": "module_id",
            "name": "sistema"
          }
        }
      ]
    },
    "token": "jwt_token_aqui"
  }
}
```

**Possíveis Erros**:
- `400`: Dados inválidos
- `401`: Credenciais inválidas
- `429`: Muitas tentativas

---

#### `GET /auth/me`
Obtém dados do usuário autenticado.

**Acesso**: Privado (requer token JWT)

**Resposta de Sucesso (200)**:
```json
{
  "message": "Dados do usuário obtidos com sucesso",
  "data": {
    "user": {
      "id": "user_id",
      "email": "usuario@email.com",
      "name": "Nome do Usuário",
      "active": true,
      "roles": [...]
    }
  }
}
```

**Possíveis Erros**:
- `401`: Token não fornecido/inválido/expirado

---

#### `POST /auth/logout`
Realiza logout (implementação básica).

**Acesso**: Privado (requer token JWT)

**Resposta de Sucesso (200)**:
```json
{
  "message": "Logout realizado com sucesso"
}
```

### Usuários (`/users`)

#### `GET /users`
Lista todos os usuários.

**Acesso**: Privado (requer admin)

**Permissões**: Papel de admin em qualquer módulo

**Parâmetros de Query**:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Termo de busca por nome/email

**Resposta de Sucesso (200)**:
```json
{
  "message": "Usuários obtidos com sucesso",
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "usuario@email.com",
        "name": "Nome do Usuário",
        "active": true,
        "roles": [...],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

#### `GET /users/:id`
Obtém usuário específico por ID.

**Acesso**: Privado (requer admin)

**Parâmetros de URL**:
- `id`: ID do usuário

---

#### `PUT /users/:id/status`
Ativa/desativa um usuário.

**Acesso**: Privado (requer admin)

**Corpo da Requisição**:
```json
{
  "active": true
}
```

---

#### `POST /users/:id/roles`
Atribui um papel a um usuário.

**Acesso**: Privado (requer admin)

**Corpo da Requisição**:
```json
{
  "roleId": "role_id_aqui"
}
```

---

#### `DELETE /users/:id/roles/:roleId`
Remove um papel de um usuário.

**Acesso**: Privado (requer admin)

### Módulos (`/modules`)

#### `POST /modules`
Cria um novo módulo.

**Acesso**: Privado (requer admin do sistema)

**Corpo da Requisição**:
```json
{
  "name": "nome_do_modulo",
  "description": "Descrição opcional do módulo"
}
```

---

#### `GET /modules`
Lista todos os módulos.

**Acesso**: Privado

**Resposta de Sucesso (200)**:
```json
{
  "message": "Módulos obtidos com sucesso",
  "data": {
    "modules": [
      {
        "id": "module_id",
        "name": "sistema",
        "description": "Módulo do sistema",
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### `GET /modules/:id`
Obtém módulo específico por ID.

**Acesso**: Privado

---

#### `PUT /modules/:id`
Atualiza um módulo.

**Acesso**: Privado (requer admin do sistema)

---

#### `DELETE /modules/:id`
Exclui um módulo.

**Acesso**: Privado (requer admin do sistema)

### Papéis (`/modules/roles`)

#### `POST /modules/roles`
Cria um novo papel.

**Acesso**: Privado (requer admin do sistema)

**Corpo da Requisição**:
```json
{
  "name": "admin",
  "description": "Administrador do sistema",
  "moduleId": "module_id_aqui"
}
```

---

#### `GET /modules/roles`
Lista todos os papéis com seus módulos.

**Acesso**: Privado

---

#### `GET /modules/roles/:id`
Obtém papel específico por ID.

**Acesso**: Privado

---

#### `PUT /modules/roles/:id`
Atualiza um papel.

**Acesso**: Privado (requer admin do sistema)

---

#### `DELETE /modules/roles/:id`
Exclui um papel.

**Acesso**: Privado (requer admin do sistema)

### Admin (`/admin`)

#### `GET /admin/system-info`
Obtém informações do sistema.

**Acesso**: Privado (requer admin)

**Resposta de Sucesso (200)**:
```json
{
  "message": "Informações do sistema obtidas com sucesso",
  "data": {
    "system": {
      "version": "1.0.0",
      "nodeVersion": "v18.17.0",
      "uptime": "2h 30m",
      "memory": {
        "used": "150MB",
        "total": "512MB"
      }
    },
    "database": {
      "status": "connected",
      "connectionCount": 5
    }
  }
}
```

### Configurações do Sistema (`/admin/settings`)

#### `GET /admin/settings`
Lista todas as configurações.

**Acesso**: Privado (requer admin)

---

#### `GET /admin/settings/by-category`
Lista configurações agrupadas por categoria.

**Acesso**: Privado (requer admin)

---

#### `GET /admin/settings/:key`
Obtém configuração específica por chave.

**Acesso**: Privado (requer admin)

---

#### `POST /admin/settings`
Cria uma nova configuração.

**Acesso**: Privado (requer admin)

**Corpo da Requisição**:
```json
{
  "key": "app.name",
  "value": "PINOVARA",
  "type": "string",
  "description": "Nome da aplicação",
  "category": "general"
}
```

---

#### `PUT /admin/settings/:key`
Atualiza uma configuração.

**Acesso**: Privado (requer admin)

---

#### `DELETE /admin/settings/:key`
Exclui uma configuração.

**Acesso**: Privado (requer admin)

### Logs de Auditoria (`/admin/audit-logs`)

#### `GET /admin/audit-logs`
Lista todos os logs de auditoria.

**Acesso**: Privado (requer admin)

**Parâmetros de Query**:
- `page`, `limit`: Paginação
- `action`: Filtrar por ação (CREATE, UPDATE, DELETE, etc.)
- `entity`: Filtrar por entidade
- `userId`: Filtrar por usuário
- `dateFrom`, `dateTo`: Filtrar por período

---

#### `GET /admin/audit-logs/stats`
Obtém estatísticas dos logs de auditoria.

**Acesso**: Privado (requer admin)

---

#### `GET /admin/audit-logs/:id`
Obtém log específico por ID.

**Acesso**: Privado (requer admin)

## 🔧 Utilitários

### `GET /`
Status da API.

**Acesso**: Público

**Resposta (200)**:
```json
{
  "message": "API PINOVARA funcionando!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "features": [
    "Autenticação JWT",
    "Sistema de módulos e papéis",
    "Gerenciamento de usuários"
  ]
}
```

### `GET /health`
Health check com teste de conexão do banco.

**Acesso**: Público

**Resposta (200)**:
```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Operação realizada com sucesso |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autorizado (token inválido/expirado) |
| 403 | Forbidden - Acesso negado (permissões insuficientes) |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: usuário já existe) |
| 429 | Too Many Requests - Muitas tentativas |
| 500 | Internal Server Error - Erro interno do servidor |

## 🔒 Sistema de Permissões

### Middleware de Autenticação
- `authenticateToken`: Valida token JWT
- `requireRole`: Requer papel específico em módulo
- `requireAnyRole`: Requer qualquer um dos papéis especificados

### Exemplos de Uso
```typescript
// Requer admin do sistema
requireAnyRole([{ module: 'sistema', role: 'admin' }])

// Requer admin OU editor em qualquer módulo
requireAnyRole([
  { module: 'sistema', role: 'admin' },
  { module: 'conteudo', role: 'editor' }
])
```

## 🚀 Rate Limiting

- **Autenticação**: 5 tentativas por 15 minutos por IP
- **Outros endpoints**: Sem limite específico (configurável)

## 📝 Notas de Implementação

- Todos os endpoints seguem convenções REST
- Respostas de erro são padronizadas
- Paginação implementada para listagens grandes
- Logs de auditoria gerados automaticamente para operações críticas
- Rate limiting aplicado para prevenir ataques

---

**Última atualização**: Dezembro 2024
**Versão da API**: 1.0.0
