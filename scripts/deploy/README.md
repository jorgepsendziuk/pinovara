# 🌐 Scripts de Deploy - PINOVARA

Scripts para configuração de servidor, deploy robusto e monitoramento de produção.

## 🚀 Scripts Disponíveis

### 1. 🔧 **setup-server.sh**
**Configuração inicial completa do servidor**

```bash
sudo ./scripts/deploy/setup-server.sh
```

**O que faz:**
- ✅ Atualiza sistema Ubuntu/Debian
- ✅ Instala Docker + Docker Compose
- ✅ Configura firewall (UFW) + Fail2Ban
- ✅ Instala e configura Nginx
- ✅ Cria usuário de deploy
- ✅ Configura SSL (Let's Encrypt)
- ✅ Sistema de backup automático
- ✅ Monitoramento básico
- ✅ Otimizações de sistema
- ✅ SSH security hardening

**Requisitos:**
- Ubuntu 18.04+ ou Debian 10+
- Acesso root (sudo)
- Conexão com internet

### 2. 🚀 **deploy-server.sh**
**Deploy robusto com rollback automático**

```bash
# Deploy para produção
./scripts/deploy/deploy-server.sh -e production -v 2.1.0

# Deploy para staging
./scripts/deploy/deploy-server.sh -e staging -v latest

# Rollback automático
./scripts/deploy/deploy-server.sh --rollback -e production

# Dry run (teste sem executar)
./scripts/deploy/deploy-server.sh -e production -v latest --dry-run
```

**Features:**
- ✅ Backup automático antes do deploy
- ✅ Download e validação de releases
- ✅ Health checks comprehensivos
- ✅ Rollback automático em caso de falha
- ✅ Zero downtime deployment
- ✅ Cleanup de versões antigas

**Opções:**
- `-e, --environment` - Environment (production/staging)
- `-v, --version` - Versão para deploy
- `--rollback` - Executar rollback
- `--dry-run` - Simular sem executar
- `--force` - Forçar deploy com warnings

### 3. 📊 **monitor-system.sh**
**Monitoramento em tempo real**

```bash
# Monitor contínuo (atualiza a cada 10s)
./scripts/deploy/monitor-system.sh

# Snapshot único
./scripts/deploy/monitor-system.sh snapshot

# Apenas health checks
./scripts/deploy/monitor-system.sh health

# Apenas recursos do sistema
./scripts/deploy/monitor-system.sh resources
```

**Monitora:**
- ✅ Status dos containers Docker
- ✅ Health dos serviços (backend/frontend/db)
- ✅ Recursos do sistema (CPU/RAM/Disco)
- ✅ Conectividade de rede
- ✅ Certificados SSL
- ✅ Logs recentes
- ✅ Performance dos endpoints

## 🔄 Fluxo de Deploy Completo

### **Configuração Inicial do Servidor**

1. **Setup do servidor** (apenas uma vez):
```bash
# Conectar no servidor
ssh user@server-ip

# Baixar scripts
git clone https://github.com/your-org/pinovara.git
cd pinovara

# Executar setup
sudo ./scripts/deploy/setup-server.sh
```

2. **Configurar DNS e SSL**:
```bash
# Configurar DNS apontando para o servidor
# Depois obter certificados SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### **Deploy de Aplicação**

1. **Primeiro deploy**:
```bash
# Testar com dry-run primeiro
./scripts/deploy/deploy-server.sh -e production -v latest --dry-run

# Deploy real
./scripts/deploy/deploy-server.sh -e production -v latest
```

2. **Monitorar deploy**:
```bash
# Monitor em tempo real
./scripts/deploy/monitor-system.sh

# Verificar logs se necessário
docker-compose -f /var/pinovara/current/docker-compose.prod.yml logs -f
```

3. **Deploys subsequentes**:
```bash
# Deploy nova versão
./scripts/deploy/deploy-server.sh -e production -v 2.1.1

# Se houver problemas, rollback automático
./scripts/deploy/deploy-server.sh --rollback -e production
```

## 📁 Estrutura de Arquivos no Servidor

```
/var/pinovara/
├── current/                    # Symlink para release atual
├── releases/                   # Versões deployadas
│   ├── release_2.1.0_20240115_143022/
│   └── release_2.1.1_20240116_091045/
├── backups/                   # Backups automáticos
│   ├── backup_2.1.0_20240116_090000/
│   └── db_backup_20240116_020000.sql
└── shared/                    # Arquivos compartilhados
    ├── logs/                  # Logs da aplicação
    ├── uploads/               # Uploads de usuários
    └── ssl/                   # Certificados SSL
```

## ⚙️ Configuração de Ambiente

### **Variables de Ambiente**

#### **Production Environment**
```bash
# Backend (.env)
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@postgres:5432/pinovara_db?schema=pinovara
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_chars
FRONTEND_URL=https://yourdomain.com

# Docker Compose (.env)
COMPOSE_PROJECT_NAME=pinovara-prod
POSTGRES_PASSWORD=secure_database_password
POSTGRES_USER=pinovara_user
POSTGRES_DB=pinovara_db
```

#### **Staging Environment**
```bash
# Backend (.env)
NODE_ENV=staging
PORT=3001
DATABASE_URL=postgresql://user:pass@postgres:5432/pinovara_staging?schema=pinovara
JWT_SECRET=staging_jwt_secret_key_minimum_32_chars
FRONTEND_URL=https://staging.yourdomain.com

# Docker Compose (.env)
COMPOSE_PROJECT_NAME=pinovara-staging
POSTGRES_PASSWORD=staging_database_password
POSTGRES_USER=pinovara_staging
POSTGRES_DB=pinovara_staging
```

## 🔐 Configurações de Segurança

### **Firewall (UFW)**
```bash
# Portas padrão configuradas automaticamente
80/tcp    # HTTP
443/tcp   # HTTPS
22/tcp    # SSH

# Verificar status
sudo ufw status verbose
```

### **Fail2Ban**
```bash
# Verificar jails ativas
sudo fail2ban-client status

# Verificar jail SSH
sudo fail2ban-client status sshd
```

### **SSL/TLS**
```bash
# Renovar certificados manualmente
sudo certbot renew

# Testar configuração SSL
curl -I https://yourdomain.com
```

## 📊 Monitoramento e Logs

### **Comandos de Monitoramento**
```bash
# Status geral do sistema
pinovara-health

# Monitor em tempo real
./scripts/deploy/monitor-system.sh

# Logs da aplicação
cd /var/pinovara/current
docker-compose -f docker-compose.prod.yml logs -f

# Logs do sistema
sudo journalctl -f
```

### **Backup e Restauração**
```bash
# Backup manual
pinovara-backup

# Restaurar backup do banco
docker exec postgres_container psql -U user -d db < backup.sql

# Restaurar arquivos
tar -xzf config_backup_timestamp.tar.gz -C /
```

## 🚨 Troubleshooting

### **Deploy Falhou**
```bash
# Verificar logs do deploy
./scripts/deploy/monitor-system.sh logs

# Rollback manual
./scripts/deploy/deploy-server.sh --rollback -e production

# Verificar health
./scripts/deploy/monitor-system.sh health
```

### **Serviços não Respondem**
```bash
# Reiniciar containers
cd /var/pinovara/current
docker-compose -f docker-compose.prod.yml restart

# Verificar recursos
./scripts/deploy/monitor-system.sh resources

# Verificar logs
docker-compose -f docker-compose.prod.yml logs backend
```

### **Problemas de SSL**
```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --force-renewal

# Testar configuração nginx
sudo nginx -t
sudo systemctl reload nginx
```

### **Performance Issues**
```bash
# Monitor recursos
htop
docker stats

# Verificar logs de erro
sudo journalctl -p err --since="1 hour ago"

# Limpar Docker
docker system prune -af
```

## 🔧 Customização

### **Adicionando Novos Ambientes**
1. Editar `deploy-server.sh`
2. Adicionar configurações específicas
3. Criar arquivo `.env` apropriado
4. Configurar DNS e SSL

### **Modificando Health Checks**
1. Editar função `health_check()` em `deploy-server.sh`
2. Adicionar novos endpoints de verificação
3. Ajustar timeouts conforme necessário

### **Backup Personalizado**
1. Editar `/usr/local/bin/pinovara-backup`
2. Adicionar novos diretórios/dados
3. Configurar retenção desejada

## 📞 Suporte

Para problemas com deploy:

1. ✅ Execute `./scripts/deploy/monitor-system.sh snapshot`
2. ✅ Verifique logs: `docker-compose logs`
3. ✅ Teste conectividade: `curl -I https://yourdomain.com`
4. ✅ Verifique recursos: `htop` e `df -h`
5. ✅ Em caso de emergência: `./scripts/deploy/deploy-server.sh --rollback`

---

**🚀 Production-ready deployment system with zero downtime!**