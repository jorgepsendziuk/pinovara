# 🔍 Verificar /etc/hosts no Servidor PM2

## ⚠️ Problema Identificado

O erro menciona o IP `191.33.71.195` mesmo quando a URL de conexão está correta (`34.95.187.69` ou `bd.pinovaraufba.com.br`).

## 🔍 Causa Possível

O **PM2** pode estar usando o arquivo `/etc/hosts` do servidor para resolver nomes de domínio, o que pode sobrescrever a resolução DNS externa.

## ✅ Como Verificar no Servidor Remoto

### 1. Verificar se há entrada no /etc/hosts

```bash
# No servidor remoto (onde o PM2 está rodando)
cat /etc/hosts | grep -E "pinovaraufba|191\.33|bd\."
```

### 2. Se encontrar entrada, verificar o IP mapeado

```bash
# Exemplo de entrada problemática:
# 191.33.71.195  bd.pinovaraufba.com.br

# Isso faria com que o Node.js resolva bd.pinovaraufba.com.br para 191.33.71.195
# ao invés de usar o DNS externo (34.95.187.69)
```

### 3. Verificar resolução DNS no servidor

```bash
# No servidor remoto
nslookup bd.pinovaraufba.com.br
getent hosts bd.pinovaraufba.com.br
```

## 🔧 Soluções

### Opção 1: Remover entrada do /etc/hosts (se existir)

```bash
# No servidor remoto
sudo nano /etc/hosts
# Remover linha que mapeia bd.pinovaraufba.com.br para 191.33.71.195
```

### Opção 2: Usar IP direto no .env de produção

```bash
# No servidor remoto, garantir que o .env use IP direto:
DATABASE_URL="postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara"
```

### Opção 3: Verificar configuração do PM2

```bash
# Ver processos PM2 e suas variáveis de ambiente
pm2 list
pm2 show <nome-do-processo>
pm2 env <id-do-processo>

# Verificar se o PM2 está carregando o .env correto
pm2 describe <nome-do-processo> | grep -A 20 "env"
```

## 📋 Checklist para DBA

- [ ] Verificar `/etc/hosts` no servidor remoto
- [ ] Verificar resolução DNS no servidor (`nslookup bd.pinovaraufba.com.br`)
- [ ] Verificar variáveis de ambiente do PM2 (`pm2 env`)
- [ ] Verificar arquivo `.env` usado pelo PM2
- [ ] Confirmar que o IP `10.158.0.2` está correto para produção

## 💡 Importante

O PM2 herda:
- ✅ Variáveis de ambiente do sistema
- ✅ Resolução DNS do sistema (incluindo `/etc/hosts`)
- ✅ Configurações do usuário que executa o PM2

Por isso, se houver uma entrada no `/etc/hosts` mapeando o domínio para um IP diferente, o Node.js vai usar esse IP ao invés do DNS externo.

