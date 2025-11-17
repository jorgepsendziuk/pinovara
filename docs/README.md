# Documentação Técnica - Sistema PINOVARA

## 📋 Visão Geral

O **PINOVARA** é um sistema web full-stack desenvolvido com as melhores práticas modernas de desenvolvimento. O projeto combina um backend robusto em Node.js/TypeScript com um frontend responsivo em React/TypeScript, utilizando PostgreSQL como banco de dados.

## 📚 Índice da Documentação

### 🚀 Getting Started
- [Configuração](./getting-started/configuration.md) - Configurações localhost vs produção

### 🔌 API
- [Endpoints da API](./api/api-endpoints.md) - Documentação completa dos endpoints

### 🏗️ Arquitetura
- [Sistema de Autenticação](./architecture/auth-system.md) - Detalhes da implementação de autenticação
- [Schema do Banco de Dados](./architecture/database-schema.md) - Estrutura detalhada do banco
- [Estrutura do Frontend](./architecture/frontend-structure.md) - Organização do código frontend

### 🚀 Deploy
- [Guia de Deploy](./deployment/deployment.md) - Processo de instalação e deploy em produção

### 📝 Procedimentos Operacionais
- [Instruções Finais](./procedures/INSTRUCOES-FINAIS.md) - Instruções gerais do sistema
- [Instruções de Upload de Documentos](./procedures/INSTRUCOES-UPLOAD-DOCUMENTOS.md) - Como fazer upload de documentos
- [Instruções de Limite de Upload](./procedures/INSTRUCOES-LIMITE-UPLOAD.md) - Configuração de limites
- [Correção de Criação](./procedures/CORRECAO-CRIACAO.md) - Procedimentos de correção
- [Correção de Permissões - Plano de Gestão](./procedures/CORRECAO-PERMISSOES-PLANO-GESTAO.md)
- [Correção de Role Supervisão](./procedures/CORRECAO-ROLE-SUPERVISAO.md)
- [Corrigir Deploy Backend](./procedures/CORRIGIR-DEPLOY-BACKEND.md)
- [Comandos de Debug Remoto](./procedures/COMANDOS-DEBUG-REMOTO.md)
- [Executar SQL](./procedures/EXECUTAR-SQL-AGORA.md)
- [Procedimento de Remapeamento de Diagnóstico](./procedures/PROCEDIMENTO-REMAPEAMENTO-DIAGNOSTICO.md)

### 🧪 Testes
- [Guia de Teste de Edição](./testing/GUIA-TESTE-EDICAO.md) - Como testar funcionalidades de edição
- [Executar Teste de Plano de Gestão](./testing/EXECUTAR-TESTE-PLANO-GESTAO.md) - Testes do módulo de plano de gestão
- [Teste Local de Correções](./testing/TESTE-LOCAL-CORRECOES.md) - Testes locais

### 📜 Documentação Histórica
Documentação histórica e relatórios antigos estão disponíveis em [docs/historic/](./historic/), incluindo:
- Relatórios de organizações
- Resumos de alterações
- Documentação de design system
- Relatórios de analytics
- Outros documentos históricos

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
    ├── README.md             # Este arquivo (índice)
    ├── getting-started/      # Guias de início rápido
    ├── api/                  # Documentação da API
    ├── architecture/         # Arquitetura do sistema
    ├── deployment/           # Deploy e produção
    ├── procedures/          # Procedimentos operacionais
    ├── testing/             # Documentação de testes
    ├── historic/            # Documentação histórica
    └── resources/           # Recursos e templates
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

Para documentação mais específica, consulte:
- [API Endpoints](./api/api-endpoints.md) - Documentação completa dos endpoints
- [Schema do Banco](./architecture/database-schema.md) - Estrutura detalhada do banco
- [Sistema de Autenticação](./architecture/auth-system.md) - Detalhes da implementação
- [Guia de Deploy](./deployment/deployment.md) - Processo de instalação e deploy

## 🎯 Próximos Passos

- [ ] Implementar sistema de notificações
- [ ] Adicionar cache Redis
- [ ] Implementar testes automatizados
- [ ] Melhorar documentação da API
- [ ] Adicionar monitoramento e logs
- [ ] Implementar CI/CD

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0
