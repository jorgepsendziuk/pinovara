# PINOVARA

Sistema completo back-end + front-end desenvolvido com as melhores práticas modernas.

## 📋 Sobre o Projeto

PINOVARA é uma aplicação web full-stack que combina:

- **Back-end**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Front-end**: React + TypeScript + Vite
- **Banco de dados**: PostgreSQL hospedado externamente

## 🚀 Deploy Automático

O projeto utiliza GitHub Actions para deploy automático na VM Google Cloud.

### 📋 Pré-requisitos

- VM Google Cloud com Ubuntu/Debian
- Node.js 18+
- PostgreSQL
- PM2 (gerenciador de processos)
- Nginx (opcional, recomendado)

### ⚙️ Configuração Inicial da VM

1. **Execute o script de configuração:**
   ```bash
   # Na sua VM, execute:
   curl -fsSL https://raw.githubusercontent.com/SEU_USERNAME/pinovara/main/setup-vm.sh | bash
   ```

2. **Configure as secrets no GitHub:**
   - `SSH_PRIVATE_KEY`: Conteúdo da chave privada SSH
   - `SERVER_HOST`: `pinovaraufba.com.br`
   - `SERVER_USER`: Seu usuário SSH (ex: `ubuntu`)

3. **Configure variáveis de ambiente:**
   Edite o arquivo `backend/config.env` com suas configurações de produção:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL="postgresql://user:password@localhost:5432/pinovara"
   JWT_SECRET="sua-chave-secreta-super-segura"
   ```

### 🚀 Processo de Deploy

O deploy é **automático** quando você faz push na branch `main`:

1. **Build**: Compila backend e frontend
2. **Deploy**: Envia arquivos via SSH para a VM
3. **Configuração**: Instala dependências e configura banco
4. **Verificação**: Testa se aplicação está funcionando
5. **Notificação**: Status do deploy

### 🌐 Acesso à Aplicação

Após deploy bem-sucedido:
- **Frontend**: http://pinovaraufba.com.br
- **Backend API**: http://pinovaraufba.com.br/api/
- **Health Check**: http://pinovaraufba.com.br/health

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

## 🌐 Servindo com Nginx

O sistema está configurado para funcionar com Nginx como servidor web e proxy reverso.

### Configuração Automática

O script `setup-vm.sh` configura automaticamente:
- Nginx com configuração otimizada para produção
- Proxy reverso para a API Node.js
- Servindo de arquivos estáticos do React
- Headers de segurança básicos
- Compressão Gzip
- Cache otimizado para assets estáticos

### Arquitetura

```
Cliente → Nginx (porta 80/443)
    ├── / (root) → /var/www/html (React SPA)
    ├── /api/* → http://localhost:3001 (Node.js API)
    └── /health → http://localhost:3001/health
```

### Monitoramento

#### Script de Monitoramento do Nginx:
```bash
# No servidor
./nginx-monitor.sh
```

Este script verifica:
- Status do Nginx
- Configuração válida
- Portas abertas
- Arquivos estáticos
- Conectividade com backend
- Logs recentes

#### Script de Verificação Completa de Deploy:
```bash
# No servidor - verificação abrangente
./check-deployment.sh
```

Este script faz uma auditoria completa:
- ✅ Estrutura de diretórios
- ✅ Arquivos do backend (package.json, ecosystem.config.js, dist/, prisma/, .env)
- ✅ Arquivos do frontend
- ✅ Processos Node.js e PM2
- ✅ Conectividade das APIs
- ✅ Status do Nginx e portas

### Comandos Úteis

```bash
# Verificar status
sudo systemctl status nginx

# Recarregar configuração
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/pinovara_error.log
sudo tail -f /var/log/nginx/pinovara_access.log

# Testar configuração
sudo nginx -t
```

### HTTPS/SSL (Opcional)

Para configurar HTTPS com Let's Encrypt:
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d pinovaraufba.com.br -d www.pinovaraufba.com.br

# Testar renovação
sudo certbot renew --dry-run
```

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Este projeto está sob a licença MIT.
