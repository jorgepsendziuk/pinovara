# 🔧 Corrigir Permissões do Repositório

## ❌ Erro Encontrado

```
EACCES: permission denied, open '/var/pinovara/shared/uploads/repositorio/...'
chown: invalid user: 'pinovara:pinovara'
```

## 🔍 Identificar o Usuário Correto

No servidor de produção, execute os seguintes comandos para descobrir qual usuário está rodando o PM2:

```bash
# 1. Verificar qual usuário está rodando o PM2
pm2 list
ps aux | grep node | grep -v grep

# 2. Verificar qual usuário possui os diretórios do projeto
ls -la /var/www/pinovara/
ls -la /var/pinovara/shared/uploads/

# 3. Verificar qual é o usuário atual
whoami
echo $USER
```

## ✅ Solução Baseada no Usuário Encontrado

### Opção 1: Usar o Usuário Atual (Recomendado)

```bash
# Descobrir o usuário atual
CURRENT_USER=$(whoami)
echo "Usuário atual: $CURRENT_USER"

# Ajustar permissões usando o usuário atual
sudo chown -R $CURRENT_USER:$CURRENT_USER /var/pinovara/shared/uploads/repositorio
sudo chmod -R 755 /var/pinovara/shared/uploads/repositorio
```

### Opção 2: Se o Usuário for 'root'

```bash
sudo chown -R root:root /var/pinovara/shared/uploads/repositorio
sudo chmod -R 755 /var/pinovara/shared/uploads/repositorio
```

### Opção 3: Se o Usuário for 'www-data' (comum em servidores web)

```bash
sudo chown -R www-data:www-data /var/pinovara/shared/uploads/repositorio
sudo chmod -R 755 /var/pinovara/shared/uploads/repositorio
```

### Opção 4: Se o Usuário for 'ubuntu' ou outro usuário específico

```bash
# Substituir 'ubuntu' pelo usuário encontrado
sudo chown -R ubuntu:ubuntu /var/pinovara/shared/uploads/repositorio
sudo chmod -R 755 /var/pinovara/shared/uploads/repositorio
```

## 🔍 Verificar Qual Usuário o PM2 Está Usando

```bash
# Ver informações detalhadas do processo PM2
pm2 info pinovara-backend

# Ou ver diretamente qual usuário está rodando
ps aux | grep "pinovara-backend" | grep -v grep
```

O primeiro campo da saída do `ps aux` mostra o usuário que está executando o processo.

## 📋 Comandos Completos (Execute no Servidor)

```bash
# 1. Criar diretório se não existir
sudo mkdir -p /var/pinovara/shared/uploads/repositorio

# 2. Descobrir usuário do PM2
PM2_USER=$(ps aux | grep "pinovara-backend" | grep -v grep | awk '{print $1}' | head -1)
echo "Usuário do PM2: $PM2_USER"

# 3. Se não encontrar, usar usuário atual
if [ -z "$PM2_USER" ]; then
  PM2_USER=$(whoami)
  echo "Usando usuário atual: $PM2_USER"
fi

# 4. Ajustar permissões
sudo chown -R $PM2_USER:$PM2_USER /var/pinovara/shared/uploads/repositorio
sudo chmod -R 755 /var/pinovara/shared/uploads/repositorio

# 5. Verificar permissões
ls -la /var/pinovara/shared/uploads/repositorio
```

## ✅ Verificar se Funcionou

Após ajustar as permissões, teste o upload novamente no sistema. O erro deve desaparecer.

## 🔄 Se Ainda Não Funcionar

Se o problema persistir, pode ser necessário verificar:

1. **Permissões do diretório pai:**
   ```bash
   sudo chmod 755 /var/pinovara/shared/uploads
   ```

2. **SELinux (se estiver habilitado):**
   ```bash
   # Verificar se SELinux está bloqueando
   sudo getenforce
   
   # Se estiver em "Enforcing", pode precisar ajustar contexto
   sudo chcon -R -t httpd_sys_rw_content_t /var/pinovara/shared/uploads/repositorio
   ```

3. **Verificar logs do backend:**
   ```bash
   pm2 logs pinovara-backend --lines 50
   ```

