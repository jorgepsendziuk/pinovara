# 🔧 Scripts de Correção

Scripts para corrigir problemas comuns do PINOVARA.

## 📁 Arquivos

- **`fix-nginx-config.sh`** - Correção configuração nginx
- **`fix-prisma-engine.sh`** - Correção Prisma

## 🎯 Scripts Disponíveis

### `fix-nginx-config.sh`
Corrige problemas de configuração do nginx:
- Adiciona rotas faltantes (/auth/*, /admin/*, etc.)
- Configura CORS headers
- Adiciona certificados SSL
- Resolve erro 405 Method Not Allowed

**Uso:**
```bash
./scripts/fix/fix-nginx-config.sh
```

### `fix-prisma-engine.sh`
Corrige problemas do Prisma:
- Instala engine correto
- Regenera client
- Corrige permissões

**Uso:**
```bash
./scripts/fix/fix-prisma-engine.sh
```

## 🚨 Problemas Resolvidos

### Nginx
- ❌ 405 Method Not Allowed → ✅ Resolvido
- ❌ HTML em vez de JSON → ✅ Resolvido
- ❌ CORS errors → ✅ Resolvido

### Prisma
- ❌ Engine não encontrado → ✅ Resolvido
- ❌ Client desatualizado → ✅ Resolvido
- ❌ Permissões incorretas → ✅ Resolvido

## 🔍 Verificação Pós-Correção

```bash
# Testar endpoints
curl https://pinovaraufba.com.br/auth/login
curl https://pinovaraufba.com.br/admin/system-info

# Verificar nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar Prisma
npx prisma generate
```