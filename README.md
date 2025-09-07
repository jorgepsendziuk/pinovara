# PINOVARA

Sistema completo back-end + front-end desenvolvido com as melhores práticas modernas.

## 📋 Sobre o Projeto

PINOVARA é uma aplicação web full-stack que combina:

- **Back-end**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Front-end**: React + TypeScript + Vite
- **Banco de dados**: PostgreSQL hospedado externamente

## 🚀 Tecnologias Utilizadas

### Back-end
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Superset JavaScript com tipagem
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **bcrypt** - Hashing de senhas
- **CORS** - Compartilhamento de recursos cross-origin
- **Zod** - Validação de dados

### Front-end
- **React** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Axios** - Cliente HTTP

## 🏗️ Arquitetura

```
pinovara/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica dos controllers
│   │   ├── routes/         # Definição das rotas
│   │   ├── middleware/     # Middlewares customizados
│   │   ├── models/         # Modelos de dados (se necessário)
│   │   ├── services/       # Lógica de negócio
│   │   ├── utils/          # Utilitários
│   │   ├── config/         # Configurações
│   │   └── server.ts       # Ponto de entrada da aplicação
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco de dados
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── pages/         # Páginas da aplicação
    │   ├── services/      # Serviços de API
    │   ├── hooks/         # Hooks customizados
    │   ├── utils/         # Utilitários
    │   ├── types/         # Tipos TypeScript
    │   └── App.tsx        # Componente principal
    ├── public/            # Assets estáticos
    └── package.json
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18+)
- npm ou yarn
- PostgreSQL (já configurado externamente)

### Back-end

1. **Instalar dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie `config.env` para `.env` (já feito)
   - Verifique as configurações do banco PostgreSQL

3. **Executar migrações do banco:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Executar o servidor:**
   ```bash
   npm run dev  # Desenvolvimento
   npm run build && npm start  # Produção
   ```

### Front-end

1. **Instalar dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Executar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Build para produção:**
   ```bash
   npm run build
   ```

## 🔧 Scripts Disponíveis

### Back-end
- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor em modo produção
- `npm run prisma:generate` - Gera cliente Prisma
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:studio` - Abre Prisma Studio

### Front-end
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Executa ESLint

## 🌐 Endpoints da API

### Base URL: `http://localhost:3001`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Status da API |
| GET | `/health` | Health check |

## 📊 Banco de Dados

### Conexão PostgreSQL
- **Host**: bd.amarisufv.com.br
- **Porta**: 5432
- **Database**: pinovara
- **Usuário**: pinovara
- **Senha**: pinovara

### Schema Atual
- **users** - Tabela de usuários (id, email, password, name, createdAt, updatedAt)

## 🔐 Autenticação (Em Desenvolvimento)

- Sistema JWT para autenticação
- Hashing de senhas com bcrypt
- Middleware de proteção de rotas
- Validação de dados com Zod

## 🚀 Deploy

### Desenvolvimento Local
1. Inicie o back-end: `cd backend && npm run dev`
2. Inicie o front-end: `cd frontend && npm run dev`
3. Acesse: http://localhost:5173

### Produção (Futuro)
- Back-end: Será implantado em serviço de hospedagem Node.js
- Front-end: Será implantado em serviço de hospedagem estático
- Banco: Já hospedado externamente

## 📝 Desenvolvimento

### Estrutura de Commits
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

### Próximas Features
- [ ] Sistema de autenticação completo
- [ ] Dashboard administrativo
- [ ] Gerenciamento de usuários
- [ ] API RESTful completa
- [ ] Interface responsiva
- [ ] Testes automatizados

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Este projeto está sob a licença MIT.
