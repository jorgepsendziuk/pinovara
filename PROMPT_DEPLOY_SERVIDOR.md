# 🤖 Prompt para Cursor CLI no Servidor

Use este prompt no servidor depois de fazer upload via FTP.

---

## 📋 Prompt para Cursor CLI

```
Acabei de fazer upload de um deploy via FTP do projeto PINOVARA.

O arquivo enviado foi extraído e contém:
- backend-dist/ (build compilado do backend)
- frontend-dist/ (build compilado do frontend)

Preciso que você:

1. Mova os builds para os diretórios corretos:
   - backend-dist → backend/dist
   - frontend-dist → frontend/dist

2. Verifique se backend/dist/server.js existe. Se não existir:
   - cd backend
   - npm install
   - npx prisma generate
   - npm run build

3. Copie o frontend para o nginx:
   - sudo cp -r frontend/dist/* /var/www/html/

4. Inicie o backend com PM2 usando o script:
   - bash scripts/deploy/start-pm2.sh
   
   OU se o script não existir, use:
   - pm2 delete pinovara-backend 2>/dev/null || true
   - pm2 start backend/dist/server.js --name pinovara-backend --cwd /var/www/pinovara/backend
   - pm2 save

5. Recarregue o nginx:
   - sudo systemctl reload nginx

6. Verifique se está funcionando:
   - pm2 status
   - pm2 logs pinovara-backend --lines 20
   - curl http://localhost:3001/health
   - curl -I https://pinovaraufba.com.br

Estou no diretório /var/www/pinovara
```

---

## 🚀 Uso no Servidor

```bash
# 1. Conectar via Termius
ssh pinovara@45.79.206.134

# 2. Ir para o diretório
cd /var/www/pinovara

# 3. Extrair o arquivo enviado por FTP
tar -xzf deploy-*.tar.gz

# 4. Abrir Cursor CLI e colar o prompt acima
cursor

# OU se preferir um one-liner para o Cursor CLI:
cursor "Acabei de fazer upload via FTP. O arquivo foi extraído e tem backend-dist/ e frontend-dist/. Mova backend-dist para backend/dist e frontend-dist para frontend/dist. Se backend/dist/server.js não existir, faça: cd backend && npm install && npx prisma generate && npm run build. Depois copie frontend: sudo cp -r frontend/dist/* /var/www/html/. Inicie PM2: bash scripts/deploy/start-pm2.sh OU pm2 delete pinovara-backend 2>/dev/null || true && pm2 start backend/dist/server.js --name pinovara-backend --cwd /var/www/pinovara/backend && pm2 save. Recarregue nginx: sudo systemctl reload nginx. Verifique: pm2 status && pm2 logs pinovara-backend --lines 20 && curl http://localhost:3001/health"
```

---

## 📝 Comandos Manuais (se preferir)

Se o Cursor CLI não funcionar ou quiser fazer manualmente:

```bash
# No servidor, em /var/www/pinovara

# Extrair
tar -xzf deploy-*.tar.gz

# Mover builds
rm -rf backend/dist frontend/dist
mv backend-dist backend/dist
mv frontend-dist frontend/dist

# Se precisar fazer build
if [ ! -f "backend/dist/server.js" ]; then
    cd backend
    npm install
    npx prisma generate
    npm run build
    cd ..
fi

# Copiar frontend
sudo cp -r frontend/dist/* /var/www/html/

# PM2
bash scripts/deploy/start-pm2.sh

# Nginx
sudo systemctl reload nginx

# Limpar
rm deploy-*.tar.gz

# Verificar
pm2 status
pm2 logs pinovara-backend --lines 20
curl http://localhost:3001/health
```

---

## ⚡ Versão One-Liner

Tudo em um único comando (cola no servidor):

```bash
cd /var/www/pinovara && tar -xzf deploy-*.tar.gz && rm -rf backend/dist frontend/dist && mv backend-dist backend/dist && mv frontend-dist frontend/dist && ([ -f "backend/dist/server.js" ] || (cd backend && npm install && npx prisma generate && npm run build && cd ..)) && sudo cp -r frontend/dist/* /var/www/html/ && bash scripts/deploy/start-pm2.sh && sudo systemctl reload nginx && rm deploy-*.tar.gz && echo "✅ Deploy concluído!" && pm2 status
```

---

## 🎯 Fluxo Simplificado

```
LOCAL (seu computador)
  ↓
  1. ./scripts/deploy/deploy-ftp.sh
  ↓
TERMIUS (upload via FTP)
  ↓
  2. Enviar arquivo .tar.gz
  ↓
SERVIDOR (via SSH)
  ↓
  3. cd /var/www/pinovara
  4. tar -xzf deploy-*.tar.gz
  5. Colar comando one-liner OU usar Cursor CLI
  ↓
✅ PRONTO!
```

---

## 💡 Dica

Se quiser automatizar ainda mais, crie um alias no servidor:

```bash
# No servidor, adicionar ao ~/.bashrc:
echo 'alias deploy-pinovara="cd /var/www/pinovara && tar -xzf deploy-*.tar.gz && rm -rf backend/dist frontend/dist && mv backend-dist backend/dist && mv frontend-dist frontend/dist && ([ -f \"backend/dist/server.js\" ] || (cd backend && npm install && npx prisma generate && npm run build && cd ..)) && sudo cp -r frontend/dist/* /var/www/html/ && bash scripts/deploy/start-pm2.sh && sudo systemctl reload nginx && rm deploy-*.tar.gz && pm2 status"' >> ~/.bashrc

source ~/.bashrc

# Depois é só:
deploy-pinovara
```
