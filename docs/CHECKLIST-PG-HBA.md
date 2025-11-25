# ✅ Checklist: Configuração pg_hba.conf

## 📋 Passos para Permitir Conexão Externa

### 1. Editar pg_hba.conf

```bash
# Localizar arquivo pg_hba.conf
sudo find /etc -name pg_hba.conf 2>/dev/null

# Ou geralmente está em:
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

### 2. Adicionar Entrada

Adicionar **ANTES** das regras mais genéricas (ordem importa!):

# Permitir conexão do IP local do desenvolvedor
host    pinovara    pinovara    191.33.71.195/32    md5
```

**Importante:**
- A ordem das regras importa! Regras mais específicas devem vir primeiro
- O `/32` significa um único IP (máscara de sub-rede)
- `md5` é o método de autenticação

### 3. Verificar Sintaxe

```bash
# Verificar se há erros de sintaxe
sudo -u postgres psql -c "SHOW hba_file;"
```

### 4. Recarregar Configuração

**Opção A: Recarregar sem reiniciar (preferível):**
```bash
sudo systemctl reload postgresql
# Ou
sudo -u postgres psql -c "SELECT pg_reload_conf();"
```

**Opção B: Reiniciar completamente:**
```bash
sudo systemctl restart postgresql
```

### 5. Verificar se Funcionou

```bash
# Ver logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Testar conexão do servidor
psql -h localhost -U pinovara -d pinovara
```

## 🔍 Verificar Configuração Atual

```bash
# Ver arquivo pg_hba.conf
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -E "pinovara|191\.33"

# Ver configurações ativas
sudo -u postgres psql -c "SHOW hba_file;"
```

## ⚠️ Problemas Comuns

### Erro: "pg_hba.conf: syntax error"
- Verificar se não há espaços extras ou caracteres inválidos
- Verificar se a sintaxe está correta

### Erro: "no pg_hba.conf entry"
- Verificar se a entrada foi adicionada corretamente
- Verificar se o PostgreSQL foi recarregado/reiniciado
- Verificar se a ordem das regras está correta (específicas primeiro)

### Erro: "password authentication failed"
- Verificar se a senha está correta
- Verificar se o método de autenticação está correto (`md5` ou `scram-sha-256`)

## 📝 Exemplo Completo de pg_hba.conf

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Conexões locais
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5

# Conexão do desenvolvedor local (IP específico)
host    pinovara        pinovara        191.33.71.195/32       md5

# Conexões internas da rede
host    pinovara        pinovara        10.158.0.0/16          md5

# Conexões externas (se necessário)
host    pinovara        pinovara        0.0.0.0/0               md5
```

## 🔐 Segurança

- **NUNCA** use `trust` em produção (permite conexão sem senha)
- Use `md5` ou `scram-sha-256` para autenticação
- Limite IPs específicos quando possível (`/32` para um IP único)
- Use ranges de rede (`/16`, `/24`) apenas para redes confiáveis

