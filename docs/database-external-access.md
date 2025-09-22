# 🗄️ Configuração PostgreSQL - Acesso Externo

Guia completo para configurar PostgreSQL para aceitar conexões externas de forma segura.

## 🌐 **CONFIGURAÇÃO POSTGRESQL**

### **1. Editar postgresql.conf**

```bash
# Localizar arquivo de configuração
sudo -u postgres psql -c "SHOW config_file;"

# Editar arquivo (geralmente em /etc/postgresql/15/main/)
sudo nano /etc/postgresql/15/main/postgresql.conf
```

**Alterações necessárias:**

```conf
# ========== NETWORK SETTINGS ==========

# Aceitar conexões de todos os IPs
listen_addresses = '*'

# OU apenas IPs específicos (mais seguro)
# listen_addresses = 'localhost,192.168.1.100,10.0.0.5'

# Porta padrão
port = 5432

# Configurações de conexão
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

# ========== LOGGING (recomendado) ==========
log_destination = 'stderr'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_connections = on
log_disconnections = on
log_statement = 'all'
```

### **2. Configurar pg_hba.conf (Autenticação)**

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

**Adicionar linhas ao final:**

```conf
# ========== CONEXÕES EXTERNAS ==========

# Permitir conexão específica (RECOMENDADO)
host    pinovara_db     pinovara_user   192.168.1.100/32    md5
host    pinovara_db     pinovara_user   10.0.0.5/32         md5

# OU permitir de qualquer IP (MENOS SEGURO)
# host    all             all             0.0.0.0/0           md5

# Para desenvolvimento local
host    pinovara_dev    pinovara_user   127.0.0.1/32        md5
```

### **3. Configurar Firewall**

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 5432/tcp

# OU apenas de IPs específicos (RECOMENDADO)
sudo ufw allow from 192.168.1.100 to any port 5432
sudo ufw allow from 10.0.0.5 to any port 5432

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

### **4. Reiniciar PostgreSQL**

```bash
sudo systemctl restart postgresql

# Verificar se está rodando
sudo systemctl status postgresql

# Testar se está escutando na porta
sudo netstat -tlnp | grep 5432
```

## 👥 **CONFIGURAÇÃO DE USUÁRIO E BANCO**

### **Criar usuário específico:**

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Criar usuário para aplicação
CREATE USER pinovara_user WITH PASSWORD 'senha_super_segura_123';

-- Criar banco de dados
CREATE DATABASE pinovara_db OWNER pinovara_user;

-- Conectar no banco
\c pinovara_db

-- Criar schema
CREATE SCHEMA IF NOT EXISTS pinovara;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE pinovara_db TO pinovara_user;
GRANT ALL PRIVILEGES ON SCHEMA pinovara TO pinovara_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA pinovara TO pinovara_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA pinovara TO pinovara_user;

-- Definir schema padrão
ALTER USER pinovara_user SET search_path = pinovara;

-- Verificar configuração
\l
\du
```

## 🔒 **OPÇÕES DE SEGURANÇA**

### **OPÇÃO 1: VPN (MAIS SEGURO)**

```bash
# Em vez de expor PostgreSQL, use VPN
# 1. Configure OpenVPN ou WireGuard no servidor
# 2. Conecte via VPN
# 3. Use IP interno da VPN

# Exemplo com WireGuard:
sudo apt install wireguard

# Configurar servidor VPN
# Clientes conectam via VPN e usam IP interno
DATABASE_URL="postgresql://user:pass@10.8.0.1:5432/db?schema=pinovara"
```

### **OPÇÃO 2: SSH TUNNEL (SEGURO)**

```bash
# Criar tunnel SSH para PostgreSQL
ssh -L 5432:localhost:5432 user@servidor-remoto

# Depois conectar localmente:
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=pinovara"
```

### **OPÇÃO 3: SSL/TLS (RECOMENDADO)**

**Configurar SSL no PostgreSQL:**

```bash
# Gerar certificados
sudo openssl req -new -x509 -days 365 -nodes -text \
    -out server.crt -keyout server.key -subj "/CN=postgres"

sudo chown postgres:postgres server.crt server.key
sudo chmod 600 server.key
sudo mv server.crt server.key /var/lib/postgresql/15/main/
```

**Editar postgresql.conf:**

```conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = ''
ssl_crl_file = ''
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_prefer_server_ciphers = on
```

**Editar pg_hba.conf:**

```conf
# Exigir SSL
hostssl pinovara_db pinovara_user 0.0.0.0/0 md5
```

### **OPÇÃO 4: ALLOW LIST IP (BÁSICO)**

```conf
# pg_hba.conf - apenas IPs específicos
host    pinovara_db     pinovara_user   192.168.1.0/24      md5
host    pinovara_db     pinovara_user   10.0.0.0/8          md5
```

## 🧪 **TESTANDO CONEXÃO**

### **Do servidor local:**

```bash
# Testar conexão local
psql -h localhost -U pinovara_user -d pinovara_db

# Testar conexão remota
psql -h IP_SERVIDOR -U pinovara_user -d pinovara_db

# Testar com aplicação
cd backend
DATABASE_URL="postgresql://pinovara_user:senha@IP_SERVIDOR:5432/pinovara_db?schema=pinovara" npm run dev
```

### **Verificar logs:**

```bash
# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Logs de conexão
sudo grep "connection" /var/log/postgresql/postgresql-15-main.log
```

## ⚙️ **CONFIGURAÇÕES DO PROJETO**

### **1. Atualizar variáveis de ambiente:**

```bash
# backend/.env.remote-db
DATABASE_URL="postgresql://pinovara_user:senha_segura@IP_SERVIDOR:5432/pinovara_db?schema=pinovara"

# backend/.env.local-db  
DATABASE_URL="postgresql://postgres:password@localhost:5432/pinovara_dev?schema=pinovara"
```

### **2. Usar script de switch:**

```bash
# Alternar entre ambientes
./scripts/dev/switch-environment.sh mixed    # Local com banco remoto
./scripts/dev/switch-environment.sh local   # Tudo local
./scripts/dev/switch-environment.sh remote  # Frontend aponta pra produção
./scripts/dev/switch-environment.sh status  # Ver configuração atual
```

## ⚠️ **CONSIDERAÇÕES DE SEGURANÇA**

### **✅ RECOMENDAÇÕES:**

1. **Use VPN sempre que possível**
2. **Configure SSL/TLS obrigatório**
3. **Allowlist apenas IPs necessários**
4. **Usuário específico com permissões mínimas**
5. **Senhas fortes e complexas**
6. **Monitoring e logs habilitados**
7. **Backup regular**
8. **Firewall bem configurado**

### **❌ EVITAR:**

1. **Usuário postgres exposto**
2. **Senhas fracas**
3. **Acesso 0.0.0.0/0 sem SSL**
4. **Permissões excessivas**
5. **Logs desabilitados**
6. **Porta padrão sem proteção**

## 🐳 **ALTERNATIVA: BANCO EM CONTAINER**

Se preferir, pode usar PostgreSQL em container com acesso externo:

```yaml
# docker-compose.yml para banco compartilhado
version: '3.8'
services:
  postgres-shared:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: pinovara_db
      POSTGRES_USER: pinovara_user
      POSTGRES_PASSWORD: senha_super_segura
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    command: ["postgres", "-c", "log_statement=all", "-c", "log_destination=stderr"]
    
volumes:
  postgres_data:
```

## 🔄 **WORKFLOW RECOMENDADO**

1. **Configure PostgreSQL no servidor com SSL**
2. **Crie usuário específico para aplicação**
3. **Configure allowlist de IPs**
4. **Use script switch-environment.sh**
5. **Teste conectividade**
6. **Monitor logs**

---

**🚀 Agora você pode usar o mesmo banco de dados de qualquer ambiente com segurança!**