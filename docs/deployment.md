# Guia de Deploy - PINOVARA

## 🚀 Visão Geral

Este guia aborda o processo completo de instalação, configuração e deploy do sistema PINOVARA em diferentes ambientes (desenvolvimento, staging e produção).

## 📋 Pré-requisitos

### Sistema Operacional
- **Linux** (Ubuntu 20.04+, CentOS 8+, etc.)
- **macOS** (12.0+)
- **Windows** (10+ com WSL2)

### Software Necessário
- **Node.js** 18+ (LTS recomendado)
- **npm** ou **yarn**
- **PostgreSQL** 13+ (já hospedado externamente)
- **Git** (para versionamento)

### Recursos de Hardware
- **CPU**: 1 vCPU mínimo / 2 vCPU recomendado
- **RAM**: 512MB mínimo / 1GB recomendado
- **Disco**: 1GB para aplicação + espaço para logs

## 🛠️ Instalação e Configuração

### 1. Clonagem do Repositório
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/pinovara.git
cd pinovara
```

### 2. Configuração do Backend

#### Instalar Dependências
```bash
cd backend
npm install
```

#### Configurar Banco de Dados
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Aplicar migrações no banco
npm run prisma:db:push
```

#### Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de configuração
cp config.env .env

# Editar com valores do ambiente
nano .env
```

**Arquivo .env para produção:**
```env
# Database
DATABASE_URL="postgresql://prod_user:prod_password@bd.amarisufv.com.br:5432/pinovara?schema=pinovara"

# JWT
JWT_SECRET="sua-chave-jwt-super-segura-aqui-64-caracteres-minimo"
JWT_EXPIRES_IN="24h"

# Server
PORT=3001
NODE_ENV="production"

# CORS
FRONTEND_URL="https://seu-dominio.com"
```

### 3. Configuração do Frontend

#### Instalar Dependências
```bash
cd ../frontend
npm install
```

#### Build para Produção
```bash
npm run build
```

## 🌐 Estratégias de Deploy

### Opção 1: Deploy Manual (Recomendado para Início)

#### Backend
```bash
# No servidor
cd /var/www/pinovara/backend

# Instalar dependências
npm install --production

# Build da aplicação
npm run build

# Iniciar aplicação
npm start
# ou para produção com PM2
npm install -g pm2
pm2 start dist/server.js --name pinovara-backend
```

#### Frontend
```bash
# No servidor web (nginx/apache)
cd /var/www/html

# Copiar arquivos do build
cp -r /path/to/pinovara/frontend/dist/* .

# Configurar servidor web para servir arquivos estáticos
```

### Opção 2: Docker (Recomendado para Produção)

#### Dockerfile Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production

# Copiar código compilado
COPY dist/ ./dist/

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["npm", "start"]
```

#### Dockerfile Frontend
```dockerfile
FROM nginx:alpine

# Copiar arquivos do build
COPY dist/ /usr/share/nginx/html/

# Copiar configuração nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  pinovara-backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - postgres

  pinovara-frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - pinovara-backend

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: pinovara
      POSTGRES_USER: pinovara
      POSTGRES_PASSWORD: pinovara
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Opção 3: Serviços de Hospedagem

#### Vercel (Frontend)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Railway/Heroku (Backend)
```bash
# Para Heroku
heroku create pinovara-backend
git push heroku main
```

## ⚙️ Configuração de Servidor Web

### Nginx (Recomendado)
```nginx
# /etc/nginx/sites-available/pinovara
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend (servir arquivos estáticos)
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/pinovara_access.log;
    error_log /var/log/nginx/pinovara_error.log;
}
```

### Apache
```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    DocumentRoot /var/www/html

    # Frontend
    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>

    # Backend proxy
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
</VirtualHost>
```

## 🔒 Segurança

### HTTPS (Obrigatório para Produção)
```bash
# Instalar Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com
```

### Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Segurança do Backend
```bash
# Usar PM2 para gerenciamento de processo
npm install -g pm2
pm2 start dist/server.js --name pinovara-backend
pm2 startup
pm2 save

# Configurar logrotate para logs
sudo nano /etc/logrotate.d/pinovara
```

**Arquivo /etc/logrotate.d/pinovara:**
```
/var/log/pinovara/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 📊 Monitoramento

### PM2 Monitoring
```bash
# Instalar PM2
npm install -g pm2

# Iniciar com monitoramento
pm2 start dist/server.js --name pinovara-backend

# Dashboard web
pm2 monit
```

### Logs
```bash
# Ver logs da aplicação
pm2 logs pinovara-backend

# Ver logs do nginx
sudo tail -f /var/log/nginx/pinovara_access.log
sudo tail -f /var/log/nginx/pinovara_error.log
```

### Health Checks
```bash
# Verificar se aplicação está rodando
curl http://localhost:3001/health

# Verificar nginx
sudo nginx -t
sudo systemctl status nginx
```

## 🔄 Atualizações

### Estratégia Blue-Green
```bash
# 1. Fazer backup do banco
pg_dump pinovara > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy da nova versão
git pull origin main
npm install
npm run build
pm2 restart pinovara-backend

# 3. Verificar health check
curl http://localhost:3001/health

# 4. Se ok, atualizar nginx se necessário
sudo nginx -t && sudo nginx -s reload
```

### Rollback
```bash
# Rollback via git
git checkout HEAD~1
npm install
npm run build
pm2 restart pinovara-backend

# Rollback do banco se necessário
psql pinovara < backup_file.sql
```

## 🌍 Configurações por Ambiente

### Desenvolvimento
```env
NODE_ENV=development
JWT_SECRET=dev-secret-key
FRONTEND_URL=http://localhost:5173
```

### Staging
```env
NODE_ENV=staging
JWT_SECRET=staging-secret-key
FRONTEND_URL=https://staging.seu-dominio.com
```

### Produção
```env
NODE_ENV=production
JWT_SECRET=production-super-secure-key
FRONTEND_URL=https://seu-dominio.com
```

## 🚨 Troubleshooting

### Problema: Aplicação não inicia
```bash
# Verificar logs
pm2 logs pinovara-backend

# Verificar porta
netstat -tlnp | grep 3001

# Verificar variáveis de ambiente
node -e "console.log(process.env)"
```

### Problema: Erro de conexão com banco
```bash
# Testar conexão
psql "postgresql://user:pass@host:5432/db"

# Verificar configurações
cat .env | grep DATABASE_URL
```

### Problema: Frontend não carrega
```bash
# Verificar arquivos estáticos
ls -la /var/www/html/

# Verificar nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Problema: CORS errors
```bash
# Verificar FRONTEND_URL no .env
cat .env | grep FRONTEND_URL

# Verificar configuração CORS no código
grep -r "cors" backend/src/
```

## 📈 Otimização

### Backend
```bash
# Usar cluster mode
pm2 start dist/server.js -i max --name pinovara-backend

# Configurar cache Redis (futuro)
npm install redis
```

### Frontend
```bash
# Habilitar compressão gzip
# Adicionar ao nginx.conf
gzip on;
gzip_types text/css application/javascript application/json;
```

### Banco de Dados
```sql
-- Otimizar queries
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_audit_logs_created_at ON audit_logs(created_at);

-- Vacuum regular
VACUUM ANALYZE;
```

## 🔧 Scripts de Automação

### Script de Deploy (deploy.sh)
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do PINOVARA..."

# Backup
echo "📦 Fazendo backup..."
pg_dump pinovara > backup_$(date +%Y%m%d_%H%M%S).sql

# Update código
echo "📥 Atualizando código..."
git pull origin main

# Backend
echo "🔧 Atualizando backend..."
cd backend
npm install
npm run build

# Frontend
echo "🎨 Atualizando frontend..."
cd ../frontend
npm install
npm run build

# Deploy
echo "🚀 Fazendo deploy..."
cp -r dist/* /var/www/html/
pm2 restart pinovara-backend

# Health check
echo "🏥 Verificando saúde..."
curl -f http://localhost:3001/health

if [ $? -eq 0 ]; then
    echo "✅ Deploy realizado com sucesso!"
else
    echo "❌ Erro no deploy!"
    exit 1
fi
```

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
