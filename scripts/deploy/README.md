# 🚀 Scripts de Deploy

Scripts para fazer deploy do PINOVARA de forma segura e confiável.

## 📁 Arquivos

- **`deploy-safe.sh`** - Script principal de deploy seguro
- **`test-deploy-safe.sh`** - Teste do deploy seguro

## 🎯 Script Principal

### `deploy-safe.sh`
Script definitivo de deploy que:
- ✅ Não modifica configurações do nginx
- ✅ Não altera variáveis de ambiente
- ✅ Usa apenas comandos que funcionam
- ✅ Deploy rápido e confiável

**Uso:**
```bash
./scripts/deploy/deploy-safe.sh
```

## 🧪 Teste de Deploy

### `test-deploy-safe.sh`
Script de teste que verifica:
- Status do git
- Builds existentes
- Serviços rodando
- Conectividade

**Uso:**
```bash
./scripts/deploy/test-deploy-safe.sh
```

## 📋 Processo de Deploy

1. **Atualizar código:** `git pull origin main`
2. **Build frontend:** `npm install && npm run build`
3. **Build backend:** `npm install && npm run build`
4. **Deploy frontend:** `sudo cp -r frontend/dist/* /var/www/html/`
5. **Reiniciar backend:** `pm2 restart pinovara-backend`
6. **Recarregar nginx:** `sudo systemctl reload nginx`

## 🔍 Verificação Pós-Deploy

```bash
pm2 status
sudo systemctl status nginx
curl https://pinovaraufba.com.br/health
```