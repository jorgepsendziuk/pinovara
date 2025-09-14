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

## ⚡ Deploy Manual Rápido

Para deploy manual direto do seu computador:

### 🚀 Script Ultra-Rápido (Recomendado)
```bash
# Deploy completo em um comando
./deploy-prod.sh pinovaraufba.com.br root

# Ou com parâmetros padrão
./deploy-prod.sh
```

### 📦 Script Interativo
```bash
# Deploy com confirmações e opções
./quick-deploy.sh
```

### 🔨 Scripts de Build

#### **Para Executar no Computador Local:**
```bash
# Build local + deploy automático (recomendado)
./build-local.sh pinovaraufba.com.br root all

# Apenas frontend
./build-local.sh pinovaraufba.com.br root frontend

# Apenas backend
./build-local.sh pinovaraufba.com.br root backend
```

#### **Para Executar no Servidor:**
```bash
# Build diretamente no servidor (requer SSH configurado)
./build-server.sh pinovaraufba.com.br root all

# Apenas frontend
./build-server.sh pinovaraufba.com.br root frontend

# Apenas backend
./build-server.sh pinovaraufba.com.br root backend
```

### 🔧 Scripts Disponíveis

| Script | Descrição | Uso |
|--------|-----------|-----|
| `test-deploy.sh` | 🧪 Testar deploy | `./test-deploy.sh` |
| `deploy-prod.sh` | Deploy ultra-rápido | `./deploy-prod.sh [servidor] [usuario]` |
| `quick-deploy.sh` | Deploy interativo | `./quick-deploy.sh` |
| `update-prod.sh` | 🔥 Update emergência | `./update-prod.sh` |
| `fix-deploy.sh` | 🛠️ Corrigir problemas | `./fix-deploy.sh` |
| `copy-routes.sh` | 📋 Copiar rotas | `./copy-routes.sh <server> <user>` |
| `fix-typescript.sh` | 🔧 Corrigir TypeScript | `./fix-typescript.sh <server> <user>` |
| `fix-permissions.sh` | 🔐 Corrigir permissões | `./fix-permissions.sh <server> <user>` |
| `build-server.sh` | 🔨 Build no servidor | `./build-server.sh <server> <user> [component]` |
| `build-local.sh` | 🏠 Build local + deploy | `./build-local.sh <server> <user> [component]` |
| `build-server-direct.sh` | ⚡ Build direto no servidor | `./build-server-direct.sh [component]` |
| `switch-env.sh` | Alternar localhost/produção | `./switch-env.sh` |

### 📋 Processo dos Scripts

1. **Git Pull**: Atualiza código do GitHub
2. **Configuração**: Ajusta para produção (IP 10.158.0.2)
3. **Build**: Compila frontend e backend
4. **Pacote**: Cria pacote otimizado
5. **Deploy**: Envia via SSH e instala
6. **Verificação**: Testa funcionamento

### 🌐 Acesso à Aplicação

Após deploy bem-sucedido:
- **Frontend**: https://pinovaraufba.com.br
- **Backend API**: https://pinovaraufba.com.br/api/
- **Health Check**: https://pinovaraufba.com.br/health

### 🧪 Teste Antes do Deploy

Antes de fazer deploy em produção, teste se tudo está funcionando:

```bash
# Testa se todos os arquivos necessários existem
./test-deploy.sh

# Se passar, então pode fazer deploy
./deploy-prod.sh pinovaraufba.com.br root
```

### 🛠️ Correção de Problemas

Se encontrar problemas de build ou deploy, use os scripts de correção:

#### **Script Geral de Correção:**
```bash
# Corrige permissões, limpa caches e rebuild
./fix-deploy.sh

# Depois faça o deploy normalmente
./deploy-prod.sh pinovaraufba.com.br root
```

#### **Script Específico para TypeScript:**
```bash
# Corrige especificamente problemas de TypeScript
./fix-typescript.sh pinovaraufba.com.br root
```

#### **Script Específico para Permissões:**
```bash
# Corrige especificamente problemas de permissão
./fix-permissions.sh pinovaraufba.com.br root
```

#### **Script para Build no Servidor:**
```bash
# Build completo (frontend + backend) - EXECUTAR NO SERVIDOR
./build-server.sh pinovaraufba.com.br root all

# Apenas frontend - EXECUTAR NO SERVIDOR
./build-server.sh pinovaraufba.com.br root frontend

# Apenas backend - EXECUTAR NO SERVIDOR
./build-server.sh pinovaraufba.com.br root backend
```

#### **Script para Build Local + Deploy:**
```bash
# Build completo (frontend + backend) - EXECUTAR NO COMPUTADOR LOCAL
./build-local.sh pinovaraufba.com.br root all

# Apenas frontend - EXECUTAR NO COMPUTADOR LOCAL
./build-local.sh pinovaraufba.com.br root frontend

# Apenas backend - EXECUTAR NO COMPUTADOR LOCAL
./build-local.sh pinovaraufba.com.br root backend
```

#### **Script para Build Direto no Servidor:**
```bash
# Build completo (frontend + backend) - EXECUTAR NO SERVIDOR
./build-server-direct.sh all

# Apenas frontend - EXECUTAR NO SERVIDOR
./build-server-direct.sh frontend

# Apenas backend - EXECUTAR NO SERVIDOR
./build-server-direct.sh backend
```

**O que o script de correção geral faz:**
- ✅ Corrige permissões de arquivos
- ✅ Limpa `node_modules` e `package-lock.json`
- ✅ Reinstala dependências
- ✅ Rebuild frontend e backend
- ✅ Cria pacote de deploy limpo

**O que o script de TypeScript faz:**
- ✅ Instala TypeScript se necessário
- ✅ Copia arquivos de configuração
- ✅ Testa diferentes métodos de build
- ✅ Verifica saída do build

**O que o script de permissões faz:**
- ✅ Corrige ownership dos diretórios
- ✅ Ajusta permissões para 755
- ✅ Limpa diretórios dist problemáticos
- ✅ Recria diretórios com permissões corretas

**O que o script de build no servidor faz:**
- ✅ Executa build no diretório correto
- ✅ Corrige permissões automaticamente
- ✅ Testa múltiplas estratégias de build
- ✅ Fornece feedback detalhado do processo

**O que o script de build local faz:**
- ✅ Build local no computador
- ✅ Deploy automático para o servidor
- ✅ Gerenciamento completo do processo
- ✅ Não requer execução no servidor

**O que o script de build direto no servidor faz:**
- ✅ Build diretamente no servidor
- ✅ Executa comandos npm nos diretórios corretos
- ✅ Corrige permissões automaticamente
- ✅ Não requer configuração SSH
- ✅ Ideal quando já está conectado ao servidor

### 🚨 Solução de Problemas

#### Erro: "npm install" falha no servidor
```bash
# Verificar se Node.js está instalado no servidor
ssh root@pinovaraufba.com.br "node -v && npm -v"

# Se não estiver instalado, instalar:
ssh root@pinovaraufba.com.br "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
```

#### Erro: "pm2 command not found"
```bash
# Instalar PM2 no servidor
ssh root@pinovaraufba.com.br "sudo npm install -g pm2"
```

#### Verificar status após deploy
```bash
# No servidor
pm2 status
sudo systemctl status nginx
curl https://pinovaraufba.com.br/health
```

#### Erro: "Permission denied (publickey)"
```bash
# Configurar chave SSH para acesso sem senha
ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"
ssh-copy-id root@pinovaraufba.com.br

# Testar conexão
ssh root@pinovaraufba.com.br "echo 'SSH funcionando!'"

# Se ainda não funcionar, verificar permissões
ssh root@pinovaraufba.com.br "chmod 600 ~/.ssh/authorized_keys"
ssh root@pinovaraufba.com.br "chmod 700 ~/.ssh"
```

#### Erro: Script tentando conectar ao próprio servidor
```bash
# ❌ PROBLEMA: Executar build-server.sh NO SERVIDOR
jimxxx@www:/var/www/pinovara$ ./build-server.sh pinovaraufba.com.br root all
# Resultado: "Permission denied (publickey)"

# ✅ SOLUÇÃO: Usar script direto no servidor
./build-server-direct.sh all

# Ou executar manualmente:
cd /var/www/pinovara/frontend && npm run build
cd /var/www/pinovara/backend && npm run build
```

#### Erro: "Cannot find module './routes/authRoutes'"
```bash
# Copiar arquivos de rotas diretamente
./copy-routes.sh pinovaraufba.com.br root

# Ou executar deploy completo
./deploy-prod.sh pinovaraufba.com.br root
```

#### Erro: "tsc: not found" ou "Cannot find module"
```bash
# No servidor
cd /var/www/pinovara/backend

# Instalar TypeScript globalmente
npm install -g typescript

# Ou usar npx (recomendado)
npx tsc

# Ou instalar todas as dependências (incluindo devDependencies)
npm install

# Tentar build novamente
npm run build
```

#### Erro: Build falha por falta de devDependencies
```bash
# No servidor - instalar TODAS as dependências
cd /var/www/pinovara/backend
npm install  # Remove --production para incluir TypeScript

# Ou instalar TypeScript especificamente
npm install typescript --save-dev

# Verificar instalação
npx tsc --version
```

#### Erro: "EACCES: permission denied" no frontend
```bash
# Usar script específico para permissões
./fix-permissions.sh pinovaraufba.com.br root

# Ou corrigir manualmente no servidor
ssh root@pinovaraufba.com.br "sudo chown -R $USER:$USER /var/www/pinovara/frontend && sudo chmod -R 755 /var/www/pinovara/frontend"

# Limpar e tentar novamente
ssh root@pinovaraufba.com.br "cd /var/www/pinovara/frontend && rm -rf dist && npm run build"
```

#### Erro: Build falha por permissões no diretório dist
```bash
# No servidor - corrigir permissões do diretório
cd /var/www/pinovara/frontend

# Remover diretório problemático
sudo rm -rf dist

# Recriar com permissões corretas
mkdir -p dist
sudo chown -R $USER:$USER dist
chmod -R 755 dist

# Tentar build novamente
npm run build
```

#### Erro: "Could not read package.json" - Diretório errado
```bash
# ❌ ERRADO - Não execute no diretório raiz
cd /var/www/pinovara
npm run build  # ❌ Falha porque não há package.json aqui

# ✅ CERTO - Execute nos diretórios corretos
cd /var/www/pinovara/frontend
npm run build  # ✅ Build do frontend

cd /var/www/pinovara/backend
npm run build  # ✅ Build do backend

# Ou use o script wrapper (recomendado)
./build-server.sh pinovaraufba.com.br root all
```

#### Erro: "Operation not permitted" no package-lock.json
```bash
# Este erro é normal - o package-lock.json tem permissões especiais
# Use o script de correção de permissões
./fix-permissions.sh pinovaraufba.com.br root

# Ou corrija manualmente (evite alterar package-lock.json)
ssh root@pinovaraufba.com.br "sudo chown -R $USER:$USER /var/www/pinovara/frontend"
ssh root@pinovaraufba.com.br "sudo chown -R $USER:$USER /var/www/pinovara/backend"
```

#### Arquivos não encontrados no servidor
```bash
# Verificar se arquivos existem
ssh root@pinovaraufba.com.br "ls -la /var/www/pinovara/backend/src/routes/"

# Copiar manualmente se necessário
scp backend/src/routes/*.ts root@pinovaraufba.com.br:/var/www/pinovara/backend/src/routes/
```

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
- **Host**: 10.158.0.2 (IP interno do banco em produção)
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
