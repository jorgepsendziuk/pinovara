# 📤 Deploy via FTP

Guia completo para fazer deploy do PINOVARA usando FTP.

## 🎯 Método Automático (Recomendado)

### Usando o Script Automatizado

```bash
./scripts/deploy/deploy-ftp.sh
```

**O que o script faz:**
1. ✅ Builda backend e frontend localmente
2. ✅ Cria um pacote compactado (.tar.gz)
3. ✅ Faz upload via FTP (se tiver LFTP instalado)
4. ✅ Executa comandos no servidor para extrair e instalar
5. ✅ Reinicia serviços

---

## 📋 Informações de Conexão FTP

```
Host: 45.79.206.134
Porta: 21 (ou 22 para SFTP)
Usuário: pinovara
Caminho remoto: /var/www/pinovara
Protocolo: SFTP (recomendado) ou FTP
```

---

## 🛠️ Método Manual

### Passo 1: Preparar os Builds Localmente

```bash
# No diretório raiz do projeto

# Build Backend
cd backend
npm run build

# Build Frontend
cd ../frontend
npm run build

# Voltar para raiz
cd ..
```

### Passo 2: Criar Pacote para Upload

```bash
# Criar diretório temporário
mkdir deploy-temp

# Copiar builds
cp -r backend/dist deploy-temp/backend-dist
cp -r frontend/dist deploy-temp/frontend-dist

# Criar arquivo compactado
tar -czf deploy.tar.gz -C deploy-temp .

# Limpar
rm -rf deploy-temp
```

Agora você tem o arquivo `deploy.tar.gz` pronto para upload.

---

## 📱 Clientes FTP Recomendados

### 1. FileZilla (Gratuito - Multiplataforma)

**Download:** https://filezilla-project.org/

**Configuração:**
1. Host: `sftp://45.79.206.134`
2. Usuário: `pinovara`
3. Porta: `22`
4. Protocolo: SFTP

**Passos:**
1. Conectar no servidor
2. Navegar até `/var/www/pinovara`
3. Fazer upload do arquivo `deploy.tar.gz`
4. Seguir passos de extração (ver abaixo)

---

### 2. Cyberduck (Gratuito - macOS/Windows)

**Download:** https://cyberduck.io/

**Configuração:**
- Protocolo: SFTP
- Servidor: `45.79.206.134`
- Usuário: `pinovara`
- Porta: `22`

---

### 3. Transmit (Pago - macOS)

**Site:** https://panic.com/transmit/

Melhor cliente FTP para macOS, mas é pago.

---

### 4. WinSCP (Gratuito - Windows)

**Download:** https://winscp.net/

Excelente opção para Windows.

---

### 5. Linha de Comando (SFTP)

```bash
# Conectar via SFTP
sftp pinovara@45.79.206.134

# Navegar para o diretório
cd /var/www/pinovara

# Fazer upload
put deploy.tar.gz

# Sair
bye
```

---

### 6. LFTP (Linha de Comando - Avançado)

```bash
# Instalar LFTP
# macOS:
brew install lftp

# Linux:
sudo apt-get install lftp

# Fazer upload
lftp -u pinovara sftp://45.79.206.134
cd /var/www/pinovara
put deploy.tar.gz
bye
```

---

## 🔧 Após o Upload - Extrair e Instalar

Depois de fazer upload do arquivo `deploy.tar.gz`, conecte via SSH e execute:

```bash
# Conectar no servidor
ssh pinovara@45.79.206.134

# Navegar para o diretório
cd /var/www/pinovara

# Criar backup (opcional, mas recomendado)
mkdir -p backups
tar -czf backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz backend/dist frontend/dist 2>/dev/null || true

# Extrair o arquivo
tar -xzf deploy.tar.gz

# Remover builds antigos e instalar novos
rm -rf backend/dist frontend/dist
mv backend-dist backend/dist
mv frontend-dist frontend/dist

# Copiar frontend para nginx
sudo cp -r frontend/dist/* /var/www/html/

# Reiniciar backend com PM2 (usando script)
bash scripts/deploy/start-pm2.sh

# OU reiniciar manualmente:
# pm2 delete pinovara-backend 2>/dev/null || true
# pm2 start backend/dist/server.js --name pinovara-backend --cwd /var/www/pinovara/backend
# pm2 save

# Recarregar nginx
sudo systemctl reload nginx

# Limpar arquivo de deploy
rm deploy.tar.gz

# Verificar status
echo ""
echo "📊 Status dos Serviços:"
pm2 status
sudo systemctl status nginx --no-pager | head -5
```

---

## 🚀 Deploy Completo em Uma Linha

Se preferir, depois de fazer o upload, execute tudo de uma vez:

```bash
ssh pinovara@45.79.206.134 'cd /var/www/pinovara && tar -xzf deploy.tar.gz && rm -rf backend/dist frontend/dist && mv backend-dist backend/dist && mv frontend-dist frontend/dist && sudo cp -r frontend/dist/* /var/www/html/ && bash scripts/deploy/start-pm2.sh && sudo systemctl reload nginx && rm deploy.tar.gz'
```

**IMPORTANTE:** Se o backend não subir, pode ser necessário fazer build no servidor:
```bash
ssh pinovara@45.79.206.134 'cd /var/www/pinovara/backend && npm install && npx prisma generate && npm run build && cd .. && bash scripts/deploy/start-pm2.sh'
```

---

## 📦 Alternativa: Enviar Apenas os Arquivos Modificados

Se quiser enviar apenas os arquivos modificados (mais rápido):

### Via FileZilla ou Cyberduck:
1. Conectar no servidor
2. Navegar até `/var/www/pinovara/backend/dist`
3. Sincronizar/Upload da pasta local `backend/dist`
4. Navegar até `/var/www/pinovara/frontend/dist`
5. Sincronizar/Upload da pasta local `frontend/dist`
6. Copiar frontend para nginx e reiniciar serviços via SSH

### Via rsync (linha de comando):
```bash
# Backend
rsync -avz --delete backend/dist/ pinovara@45.79.206.134:/var/www/pinovara/backend/dist/

# Frontend
rsync -avz --delete frontend/dist/ pinovara@45.79.206.134:/var/www/pinovara/frontend/dist/

# Atualizar servidor
ssh pinovara@45.79.206.134 'sudo cp -r /var/www/pinovara/frontend/dist/* /var/www/html/ && pm2 restart pinovara-backend && sudo systemctl reload nginx'
```

---

## 🔍 Verificar se o Deploy Funcionou

```bash
# Testar site
curl -I https://pinovaraufba.com.br

# Ver logs do backend
ssh pinovara@45.79.206.134 'pm2 logs pinovara-backend --lines 50'

# Status dos serviços
ssh pinovara@45.79.206.134 'pm2 status && sudo systemctl status nginx'
```

---

## 🆘 Problemas Comuns

### 1. PM2 Não Subiu Depois do Deploy ⚠️

**Sintoma:** Backend não inicia ou PM2 mostra erro.

**Causa comum:** O arquivo `backend/dist/server.js` não existe no servidor.

**Solução passo a passo:**

#### Passo 1: Verificar se o build existe
```bash
ssh pinovara@45.79.206.134
ls -la /var/www/pinovara/backend/dist/server.js
```

- ✅ **Se existir:** Pule para o Passo 3
- ❌ **Se NÃO existir:** Continue no Passo 2

#### Passo 2: Fazer build no servidor
```bash
cd /var/www/pinovara/backend
npm install
npx prisma generate
npm run build
```

Isso vai criar o arquivo `backend/dist/server.js`.

#### Passo 3: Iniciar PM2 com cwd correto

**Método A - Usando o script (RECOMENDADO):**
```bash
cd /var/www/pinovara
chmod +x scripts/deploy/start-pm2.sh
bash scripts/deploy/start-pm2.sh
```

**Método B - Manualmente:**
```bash
cd /var/www/pinovara
pm2 delete pinovara-backend 2>/dev/null || true
pm2 start backend/dist/server.js \
  --name pinovara-backend \
  --cwd /var/www/pinovara/backend
pm2 save
```

⚠️ **IMPORTANTE:** O `--cwd /var/www/pinovara/backend` é necessário para o PM2 encontrar:
- `.env` (variáveis de ambiente)
- `node_modules` (dependências)
- Prisma Client

#### Passo 4: Verificar
```bash
pm2 status
pm2 logs pinovara-backend --lines 30
curl -s http://localhost:3001/health
```

#### Se aparecer erro "Cannot find module '@prisma/client'"
```bash
cd /var/www/pinovara/backend
npm install
npx prisma generate
pm2 restart pinovara-backend
```

---

### 2. Erro de Permissão ao Fazer Upload
```bash
# Conectar no servidor e ajustar permissões
ssh pinovara@45.79.206.134
sudo chown -R pinovara:pinovara /var/www/pinovara
```

### 3. Arquivo Muito Grande / Upload Lento
- Use compressão máxima: `tar -czf deploy.tar.gz ...`
- Ou envie apenas os arquivos modificados com rsync
- Considere usar o método Git (mais rápido para mudanças pequenas)

### 4. FTP Não Conecta
- Tente SFTP (porta 22) em vez de FTP (porta 21)
- Verifique se tem acesso SSH configurado
- Use o mesmo método de autenticação do SSH

### 5. Deploy Não Funciona Após Upload
```bash
# Verificar permissões
ssh pinovara@45.79.206.134 'ls -la /var/www/pinovara/backend/dist'

# Verificar logs
ssh pinovara@45.79.206.134 'pm2 logs pinovara-backend --lines 100'
```

---

## 💡 Dicas e Melhores Práticas

1. **Use SFTP em vez de FTP** - Mais seguro e geralmente mais rápido
2. **Sempre faça backup antes** - O script automático já faz isso
3. **Teste localmente primeiro** - Garanta que os builds funcionam antes de fazer upload
4. **Use compressão** - Arquivos .tar.gz são muito menores
5. **Mantenha Git atualizado** - Mesmo usando FTP, mantenha o repositório Git atualizado

---

## 📊 Comparação de Métodos

| Método | Velocidade | Facilidade | Requer |
|--------|-----------|-----------|--------|
| **Script FTP** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | LFTP (opcional) |
| **FileZilla** | ⭐⭐⭐ | ⭐⭐⭐⭐ | Interface gráfica |
| **rsync** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | SSH configurado |
| **Git** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Git no servidor |

---

## 🎯 Recomendação Final

Para deploy via FTP, recomendo:

1. **Para iniciantes:** Use FileZilla ou Cyberduck (interface gráfica)
2. **Para rapidez:** Use o script `deploy-ftp.sh` com LFTP
3. **Para melhor performance:** Use rsync ou o método Git

```bash
# Método mais fácil via FTP
./scripts/deploy/deploy-ftp.sh
```

🚀 Happy deploying!
