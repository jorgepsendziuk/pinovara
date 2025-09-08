# Documentação Técnica - Sistema PINOVARA

## 📋 Visão Geral

O **PINOVARA** é um sistema web full-stack desenvolvido com as melhores práticas modernas de desenvolvimento. O projeto combina um backend robusto em Node.js/TypeScript com um frontend responsivo em React/TypeScript, utilizando PostgreSQL como banco de dados.

## 🏗️ Arquitetura Geral

### Arquitetura em Camadas

```
┌─────────────────┐
│   Frontend      │ React + TypeScript + Vite
│   (Porta 5173)  │
├─────────────────┤
│   API REST      │ Express.js + TypeScript
│   (Porta 3001)  │
├─────────────────┤
│   Banco de Dados│ PostgreSQL
│   (Porta 5432)  │
└─────────────────┘
```

### Padrões Arquiteturais

- **Backend**: Arquitetura em camadas (Routes → Controllers → Services → Models)
- **Frontend**: Component-based architecture com Context API para gerenciamento de estado
- **Banco**: Normalização de dados com relacionamentos através do Prisma ORM
- **Autenticação**: JWT (JSON Web Tokens) com roles e permissões baseadas em módulos

## 📁 Estrutura do Projeto

```
pinovara/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── controllers/        # Controladores da API
│   │   ├── routes/            # Definição das rotas
│   │   ├── middleware/        # Middlewares customizados
│   │   ├── services/          # Lógica de negócio
│   │   ├── utils/             # Utilitários
│   │   └── server.ts          # Ponto de entrada
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco
│   └── package.json
├── frontend/                  # Aplicação Frontend
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # Serviços de API
│   │   ├── contexts/         # Contextos React
│   │   └── App.tsx           # Componente principal
│   └── package.json
└── docs/                      # Documentação técnica
    ├── README.md             # Esta documentação
    ├── api-endpoints.md      # Documentação da API
    ├── database-schema.md    # Schema do banco
    ├── auth-system.md        # Sistema de autenticação
    └── deployment.md         # Guia de deploy
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** (v18+) - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Superset JavaScript com tipagem estática
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação baseada em tokens
- **bcryptjs** - Hashing de senhas
- **Zod** - Validação de dados
- **CORS** - Compartilhamento de recursos cross-origin

### Frontend
- **React** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Axios** - Cliente HTTP para requisições
- **Context API** - Gerenciamento de estado global

### Banco de Dados
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM e migrações
- **Prisma Client** - Cliente de banco de dados

### Desenvolvimento
- **ESLint** - Linting e qualidade de código
- **Prettier** - Formatação de código
- **TypeScript Compiler** - Compilação
- **ts-node-dev** - Desenvolvimento com hot-reload

## 🔄 Fluxo de Dados

### Autenticação
1. Usuário faz login através do frontend
2. Frontend envia credenciais para `/auth/login`
3. Backend valida credenciais e gera JWT
4. JWT é retornado e armazenado no localStorage
5. Frontend inclui JWT em todas as requisições subsequentes
6. Backend valida JWT em cada requisição protegida

### Operações CRUD
1. Frontend faz requisição para endpoint específico
2. Backend valida autenticação/autorização
3. Backend processa a operação no banco
4. Resultado é retornado para o frontend
5. Frontend atualiza a interface

## 🔐 Sistema de Autenticação

### Funcionalidades
- **Registro de usuários** com validação de dados
- **Login** com geração de tokens JWT
- **Proteção de rotas** baseada em autenticação
- **Sistema de roles e permissões** baseado em módulos
- **Rate limiting** para prevenir ataques de força bruta

### Estrutura de Roles
- **Módulos**: Agrupam funcionalidades relacionadas
- **Roles**: Definem permissões dentro de módulos
- **UserRole**: Associa usuários a roles específicos

## 📊 Banco de Dados

### Principais Entidades
- **Users**: Usuários do sistema
- **Modules**: Módulos funcionais
- **Roles**: Papéis dentro dos módulos
- **UserRoles**: Relacionamento usuário-papel
- **SystemSettings**: Configurações do sistema
- **AuditLogs**: Logs de auditoria

### Relacionamentos
- User ↔ UserRole ↔ Role ↔ Module
- User ↔ AuditLog
- Sistema de auditoria completo para rastreamento de ações

## 🚀 Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- PostgreSQL (já configurado externamente)

### Comandos Principais

#### Backend
```bash
cd backend
npm install
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start           # Executar em produção
```

#### Frontend
```bash
cd frontend
npm install
npm run dev         # Desenvolvimento
npm run build       # Build para produção
```

### Variáveis de Ambiente
- **DATABASE_URL**: Conexão com PostgreSQL
- **JWT_SECRET**: Chave secreta para JWT
- **PORT**: Porta do servidor (padrão: 3001)
- **FRONTEND_URL**: URL do frontend para CORS

## 📚 Documentação Adicional

- [API Endpoints](./api-endpoints.md) - Documentação completa dos endpoints
- [Schema do Banco](./database-schema.md) - Estrutura detalhada do banco
- [Sistema de Autenticação](./auth-system.md) - Detalhes da implementação
- [Guia de Deploy](./deployment.md) - Processo de instalação e deploy

## 🎯 Próximos Passos

- [ ] Implementar sistema de notificações
- [ ] Adicionar cache Redis
- [ ] Implementar testes automatizados
- [ ] Melhorar documentação da API
- [ ] Adicionar monitoramento e logs
- [ ] Implementar CI/CD

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
