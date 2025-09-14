# 🚀 Guia Completo de Deploy na Nuvem - PINOVARA

## 📋 Visão Geral

Este guia explica como fazer deploy do PINOVARA na nuvem **sem perder configurações**, utilizando os scripts automatizados criados especificamente para este propósito.

## 🎯 Cenários de Deploy

### 1. **Deploy Inicial** (Primeira vez)
```bash
# Configurar ambiente
./switch-env.sh  # Escolher opção 2 (produção)

# Fazer deploy completo
./deploy-prod.sh pinovaraufba.com.br root
```

### 2. **Deploy de Atualização** (Código novo)
```bash
# Update rápido (emergência)
./update-prod.sh

# Ou deploy completo
./deploy-prod.sh pinovaraufba.com.br root
```

### 3. **Deploy Interativo** (Mais controle)
```bash
# Com confirmações e opções
./quick-deploy.sh
```

## 🔧 Configurações Automáticas

### O que os scripts fazem automaticamente:

#### ✅ **Git Pull**
- Baixa automaticamente as últimas mudanças do GitHub
- `git pull origin main`

#### ✅ **Configuração de Produção**
- Ajusta automaticamente para ambiente de produção
- Define `NODE_ENV=production`
- Configura banco: `10.158.0.2:5432`
- Configura frontend: `https://pinovaraufba.com.br`

#### ✅ **Build Automático**
```bash
# Backend
cd backend && npm install && npm run build

# Frontend
cd frontend && npm install && npm run build
```

#### ✅ **Pacote Otimizado**
- Cria `deploy-package/` com arquivos otimizados
- Inclui configurações de produção
- Script de instalação automático

#### ✅ **Deploy Seguro**
- SSH automático para o servidor
- Instalação automática no servidor
- Reinício dos serviços (PM2 + Nginx)
- Verificação de funcionamento

## 🌐 Arquitetura de Produção

### Servidor Final
```
pinovaraufba.com.br (Nginx)
├── / (Frontend React) → /var/www/html/
├── /api/* (Backend API) → localhost:3001
└── /health (Health Check) → localhost:3001/health
```

### Configurações Aplicadas
```env
# Backend (.env no servidor)
NODE_ENV=production
DATABASE_URL=postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara
JWT_SECRET=pinovara-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://pinovaraufba.com.br
```

## 🔄 Processo de Deploy Detalhado

### Fase 1: Preparação Local
1. **Git Pull**: Sincroniza código local com GitHub
2. **Configuração**: Ajusta variáveis para produção
3. **Build**: Compila frontend e backend
4. **Pacote**: Cria pacote otimizado para deploy

### Fase 2: Transferência
1. **SSH**: Conecta automaticamente ao servidor
2. **Upload**: Envia pacote via SCP
3. **Extração**: Prepara arquivos no servidor

### Fase 3: Instalação no Servidor
1. **Dependências**: `npm install --production`
2. **Configuração**: Aplica variáveis de produção
3. **Arquivos**: Substitui arquivos antigos
4. **Serviços**: Reinicia PM2 e Nginx

### Fase 4: Verificação
1. **Testes**: Verifica se aplicação está funcionando
2. **Logs**: Mostra status dos serviços
3. **Confirmação**: Exibe URLs de acesso

## 🛡️ Segurança e Backup

### Configurações Protegidas
- JWT_SECRET não é versionado (sempre alterar em produção)
- Arquivos de configuração usam valores padrão seguros
- CORS configurado apenas para domínios permitidos

### Backup Automático
```bash
# Backup antes do deploy
cp -r /var/www/pinovara /var/www/pinovara.backup.$(date +%Y%m%d_%H%M%S)

# Rollback se necessário
cp -r /var/www/pinovara.backup.20241201_120000 /var/www/pinovara
pm2 restart pinovara-backend
```

## 🚨 Troubleshooting

### Problema: Deploy falha na conexão SSH
```bash
# Verificar chave SSH
ssh -T root@pinovaraufba.com.br

# Ou usar senha (menos seguro)
./deploy-prod.sh pinovaraufba.com.br usuario_com_senha
```

### Problema: Banco não conecta
```bash
# Verificar conectividade
ssh root@pinovaraufba.com.br
psql -h 10.158.0.2 -U pinovara -d pinovara
```

### Problema: Frontend não carrega
```bash
# Verificar Nginx
ssh root@pinovaraufba.com.br
sudo systemctl status nginx
sudo nginx -t
```

### Problema: API não responde
```bash
# Verificar PM2
ssh root@pinovaraufba.com.br
pm2 status
pm2 logs pinovara-backend
```

## 📊 Monitoramento Pós-Deploy

### Comandos Úteis
```bash
# Status dos serviços
pm2 status
sudo systemctl status nginx

# Logs em tempo real
pm2 logs pinovara-backend --lines 100

# Verificar conectividade
curl -f https://pinovaraufba.com.br/health
curl -f https://pinovaraufba.com.br/api/

# Monitorar recursos
htop
df -h
```

### Logs Importantes
- **PM2**: `/home/ubuntu/.pm2/logs/`
- **Nginx**: `/var/log/nginx/`
- **Aplicação**: Console do PM2

## 🔄 Estratégias de Rollback

### Rollback Rápido
```bash
# No servidor
cd /var/www
cp -r pinovara.backup.latest pinovara
pm2 restart pinovara-backend
sudo systemctl reload nginx
```

### Rollback por Git
```bash
# Reverter commit específico
git reset --hard HEAD~1
git push origin main --force

# Refazer deploy
./deploy-prod.sh
```

## 📈 Otimização de Performance

### Configurações de Produção
```nginx
# Nginx otimizado
worker_processes auto;
worker_connections 1024;

# Cache estático
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### PM2 Otimizado
```json
{
  "apps": [{
    "name": "pinovara-backend",
    "script": "dist/server.js",
    "instances": 2,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production",
      "PORT": 3001
    }
  }]
}
```

## 🎯 Checklist de Deploy

### Pré-Deploy
- [ ] Código testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do servidor atual
- [ ] JWT_SECRET alterado para produção

### Durante Deploy
- [ ] Script executado com sucesso
- [ ] Sem erros no build
- [ ] Conexão SSH estabelecida
- [ ] Upload dos arquivos concluído

### Pós-Deploy
- [ ] Site acessível: https://pinovaraufba.com.br
- [ ] API funcionando: https://pinovaraufba.com.br/api/
- [ ] Health check OK: https://pinovaraufba.com.br/health
- [ ] Logs limpos (sem erros críticos)
- [ ] Performance aceitável

## 🚀 Próximos Passos

### Melhorias Futuras
1. **CI/CD Automático**: GitHub Actions completo
2. **Blue-Green Deploy**: Zero downtime
3. **Monitoring Avançado**: Datadog/New Relic
4. **Load Balancer**: Distribuição de carga
5. **Auto-scaling**: Escalonamento automático

### Manutenção Regular
- Atualizações de segurança mensais
- Backup semanal do banco
- Monitoramento 24/7
- Logs rotacionados

---

## 📞 Suporte

Para problemas específicos:
1. Verificar logs: `pm2 logs pinovara-backend`
2. Testar conectividade: `curl https://pinovaraufba.com.br/health`
3. Verificar configuração: `cat /var/www/pinovara/backend/.env`

**URLs de Produção:**
- 🌐 **Site**: https://pinovaraufba.com.br
- 🔧 **API**: https://pinovaraufba.com.br/api/
- ❤️ **Health**: https://pinovaraufba.com.br/health

