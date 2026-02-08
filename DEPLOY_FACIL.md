# 🚀 Deploy Fácil para o Servidor Remoto

Este guia mostra as formas mais fáceis de fazer deploy no servidor remoto.

## 📋 Pré-requisitos

- Acesso SSH configurado ao servidor (pinovara@45.79.206.134)
- Git configurado localmente
- Node.js e npm instalados

## 🎯 Métodos de Deploy

### Método 1: Deploy via Git (MAIS FÁCIL) ⭐

Este método faz commit automático e deploy no servidor em um único comando.

```bash
# No diretório raiz do projeto
./scripts/deploy/deploy-git-push.sh
```

**O que faz:**
1. ✅ Adiciona todas as mudanças ao git
2. ✅ Cria commit automático (ou usa sua mensagem)
3. ✅ Faz push para GitHub
4. ✅ Conecta no servidor remoto via SSH
5. ✅ Faz pull do código no servidor
6. ✅ Builda backend e frontend no servidor
7. ✅ Copia frontend para nginx
8. ✅ Reinicia serviços (PM2 + Nginx)
9. ✅ Testa se o site está funcionando

**Vantagens:**
- 🎯 Tudo em um comando
- 💾 Builds são feitos no servidor (economiza upload)
- 🔄 Usa Git como fonte única da verdade
- ⚡ Rápido para mudanças pequenas

---

### Método 2: Deploy com Builds Locais

Este método faz builds localmente e envia apenas os arquivos compilados.

```bash
# No diretório raiz do projeto
./scripts/deploy/deploy-remote-easy.sh
```

**O que faz:**
1. ✅ Builda backend localmente
2. ✅ Builda frontend localmente
3. ✅ Testa conexão SSH
4. ✅ Cria backup no servidor
5. ✅ Envia builds via rsync
6. ✅ Atualiza servidor e reinicia serviços

**Vantagens:**
- 🚀 Builds locais (mais rápido se seu computador for mais potente)
- 💾 Backup automático antes do deploy
- 📦 Usa rsync (eficiente para arquivos grandes)

---

### Método 3: Deploy via FTP 📤

Use este método se preferir fazer upload via FTP/SFTP.

```bash
# No diretório raiz do projeto
./scripts/deploy/deploy-ftp.sh
```

**O que faz:**
1. ✅ Builda backend e frontend localmente
2. ✅ Cria pacote compactado (.tar.gz)
3. ✅ Faz upload via FTP (se tiver LFTP instalado)
4. ✅ Extrai no servidor e reinicia serviços

**Informações de conexão:**
- Host: 45.79.206.134
- Usuário: pinovara
- Protocolo: SFTP (porta 22) ou FTP (porta 21)
- Caminho: /var/www/pinovara

**Clientes FTP recomendados:**
- FileZilla (gratuito): https://filezilla-project.org/
- Cyberduck (gratuito): https://cyberduck.io/
- Transmit (pago - macOS): https://panic.com/transmit/

📖 **Ver guia completo:** `DEPLOY_FTP.md`

---

### Método 4: Deploy Manual com Git

Se preferir mais controle:

```bash
# 1. Commit e push localmente
git add .
git commit -m "Suas mudanças aqui"
git push origin main

# 2. Conectar no servidor
ssh pinovara@45.79.206.134

# 3. No servidor, executar:
cd /var/www/pinovara
git pull origin main
cd backend && npm install && npm run build && cd ..
cd frontend && npm install && npm run build && cd ..
sudo cp -r frontend/dist/* /var/www/html/
pm2 restart pinovara-backend
sudo systemctl reload nginx
```

---

## 🔍 Comandos Úteis

### Ver logs do backend remotamente
```bash
ssh pinovara@45.79.206.134 'pm2 logs pinovara-backend --lines 50'
```

### Ver logs do nginx remotamente
```bash
ssh pinovara@45.79.206.134 'sudo tail -f /var/log/nginx/pinovaraufba_error.log'
```

### Status dos serviços
```bash
ssh pinovara@45.79.206.134 'pm2 status && sudo systemctl status nginx'
```

### Conectar no servidor
```bash
ssh pinovara@45.79.206.134
```

### Testar se o site está funcionando
```bash
curl -I https://pinovaraufba.com.br
```

---

## 🆘 Resolução de Problemas

### Erro de conexão SSH
```bash
# Testar conexão
ssh -v pinovara@45.79.206.134

# Verificar se a chave SSH está adicionada
ssh-add -l

# Adicionar chave SSH (se necessário)
ssh-add ~/.ssh/id_rsa
```

### Build falhou no servidor
```bash
# Conectar no servidor e verificar logs
ssh pinovara@45.79.206.134
cd /var/www/pinovara/backend
npm run build

cd /var/www/pinovara/frontend
npm run build
```

### PM2 não está funcionando
```bash
ssh pinovara@45.79.206.134
pm2 status
pm2 restart pinovara-backend
pm2 logs pinovara-backend --lines 100
```

### Nginx não está servindo o frontend
```bash
ssh pinovara@45.79.206.134
sudo systemctl status nginx
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx
ls -la /var/www/html/  # Verificar arquivos
```

---

## 📊 Informações do Servidor

- **Host:** 45.79.206.134
- **Usuário:** pinovara
- **Diretório:** /var/www/pinovara
- **Site:** https://pinovaraufba.com.br
- **API:** https://pinovaraufba.com.br/api/
- **Health Check:** https://pinovaraufba.com.br/health

---

## 🎯 Recomendação

Para o dia a dia, use o **Método 1 (deploy-git-push.sh)** pois é o mais simples e completo.

```bash
./scripts/deploy/deploy-git-push.sh
```

Basta executar este comando e aguardar. Ele cuida de tudo! 🚀
