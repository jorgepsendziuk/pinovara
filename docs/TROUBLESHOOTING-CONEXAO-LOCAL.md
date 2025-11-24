# 🔧 Troubleshooting: Conexão Local com PostgreSQL

## ❌ Problema

O backend local não consegue conectar ao PostgreSQL remoto, mesmo com a URL correta.

**Erro:**
```
PrismaClientInitializationError: User was denied access on the database `191.33.71.195`
Código: P1010
```

## ✅ O que funciona

- ✅ **Servidor remoto**: Funciona com `10.158.0.2` (IP interno)
- ✅ **Conectividade de rede**: Ping e porta 5432 estão acessíveis
- ✅ **URL de conexão**: Configurada corretamente (`34.95.187.69`)

## 🔍 Causa Provável

O PostgreSQL está **bloqueando conexões externas** do IP local. O arquivo `pg_hba.conf` precisa permitir conexões do IP público da máquina local.

### Por que funciona no remoto?

- O servidor remoto está na mesma rede/VPC do PostgreSQL
- O IP `10.158.0.2` é um IP interno permitido
- Não há firewall bloqueando conexões internas

### Por que não funciona localmente?

- A máquina local está fora da rede do PostgreSQL
- O IP público local precisa estar na lista de IPs permitidos no `pg_hba.conf`
- Pode haver firewall bloqueando conexões externas

## 🔧 Soluções

### Opção 1: Adicionar IP local ao pg_hba.conf (Recomendado)

No servidor PostgreSQL, adicionar ao `/etc/postgresql/*/main/pg_hba.conf`:

```conf
# Permitir conexões do IP local do desenvolvedor
host    pinovara    pinovara    SEU_IP_PUBLICO/32    md5
```

Depois, reiniciar o PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Opção 2: Usar VPN ou túnel SSH

```bash
# Criar túnel SSH para acessar o PostgreSQL como se fosse local
ssh -L 5432:10.158.0.2:5432 usuario@servidor-remoto

# Então usar localhost na URL:
DATABASE_URL="postgresql://pinovara:pinovara@localhost:5432/pinovara?schema=pinovara"
```

### Opção 3: Permitir todas as conexões (NÃO RECOMENDADO para produção)

```conf
# Em pg_hba.conf (apenas para desenvolvimento/teste)
host    all    all    0.0.0.0/0    md5
```

## 📋 Checklist para DBA

- [ ] Verificar `pg_hba.conf` no servidor PostgreSQL
- [ ] Adicionar IP público local à lista de IPs permitidos
- [ ] Verificar se há firewall bloqueando porta 5432
- [ ] Confirmar que usuário `pinovara` tem permissão para conexões externas
- [ ] Verificar logs do PostgreSQL (`/var/log/postgresql/`) para mais detalhes

## 🔍 Verificar IP Local

```bash
# Ver IP público atual
curl ifconfig.me

# Ou
curl ipinfo.io/ip
```

## 📝 Nota sobre o IP 191.33.71.195

Este IP aparece na mensagem de erro mas **não é o IP de destino**. É provavelmente:
- Um IP interno do servidor PostgreSQL
- Um IP que aparece na mensagem de erro do PostgreSQL
- Não é o problema real - o problema é de permissão/autenticação

## ✅ Configuração Atual

**Local (desenvolvimento):**
```env
DATABASE_URL="postgresql://pinovara:pinovara@34.95.187.69:5432/pinovara?schema=pinovara"
```

**Remoto (produção):**
```env
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"
```

