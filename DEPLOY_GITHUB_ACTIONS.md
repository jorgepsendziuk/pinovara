# 🚀 Deploy Automático via GitHub Actions

## ✅ Configuração Atualizada

O workflow do GitHub Actions agora inclui o **Prisma Client pré-gerado** com os `binaryTargets` corretos para o servidor Debian.

### 🔧 O que foi mudado

1. **schema.prisma** atualizado com `binaryTargets`:
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "debian-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
   }
   ```

2. **Workflow do GitHub Actions** (`.github/workflows/deploy.yml`):
   - Usa o stage `prisma-generator` do Dockerfile
   - Extrai o Prisma Client com todos os binários
   - Inclui no pacote de deploy

3. **Script de deploy zero-downtime** (`scripts/deploy/deploy-zero-downtime.sh`):
   - Copia o Prisma Client pré-gerado para `node_modules/`
   - **Não executa `npx prisma generate` no servidor** (evita timeout)

---

## 🚀 Como Usar

### Push para Main Branch

Simplesmente faça push para a branch `main`:

```bash
git add .
git commit -m "Suas mudanças"
git push origin main
```

O GitHub Actions automaticamente:
1. ✅ Builda o backend e frontend
2. ✅ Gera o Prisma Client no Docker com `binaryTargets`
3. ✅ Extrai o Prisma Client gerado
4. ✅ Faz deploy no servidor
5. ✅ Copia o Prisma Client para `node_modules/`
6. ✅ Inicia o PM2 com zero downtime

---

## 📦 O que é Enviado

O pacote de deploy inclui:

```
/tmp/pinovara-deploy-[timestamp]/
├── package.json
├── package-lock.json
├── dist/                    # Backend compilado
├── prisma/                  # Schema
├── frontend-dist/           # Frontend compilado
├── .env                     # Variáveis de ambiente
├── ecosystem.config.js      # Configuração PM2
└── prisma-client/           # ⭐ PRISMA CLIENT PRÉ-GERADO
    ├── @prisma/
    │   └── client/
    └── .prisma/
        └── client/
            ├── libquery_engine-debian-openssl-3.0.x.so.node
            ├── libquery_engine-linux-musl-openssl-3.0.x.so.node
            └── schema.prisma
```

---

## 🔍 Verificar Deploy

Após o push, acompanhe no GitHub:

1. Vá em **Actions** no repositório
2. Veja o workflow "Deploy to Production" rodando
3. Logs mostrarão cada etapa

No servidor, verifique:

```bash
pm2 status
pm2 logs pinovara-backend --lines 30
curl http://localhost:3001/health
```

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

Se ainda aparecer este erro no servidor:

```bash
# No servidor
cd /var/www/pinovara/backend
ls -la node_modules/@prisma/client
ls -la node_modules/.prisma/client
```

Se não existir, rode manualmente:

```bash
cd /var/www/pinovara/backend
npx prisma generate
pm2 restart pinovara-backend
```

### Erro: "Query Engine not found for debian-openssl-3.0.x"

Isso significa que o Prisma Client não foi extraído corretamente do Docker. Verifique os logs do GitHub Actions na etapa "Build Docker Image & Extract Prisma Client".

---

## 🎯 Vantagens do Deploy Automático

✅ **Zero Downtime**: Deploy sem derrubar o site  
✅ **Prisma Pré-gerado**: Não precisa gerar no servidor (evita timeout)  
✅ **Binários Corretos**: Funciona em Debian, Alpine, macOS  
✅ **Rollback Automático**: Se falhar health check, volta versão anterior  
✅ **Backups Automáticos**: Mantém últimos 5 backups  

---

## 📝 Workflows Disponíveis

### 1. **Deploy to Production** (`.github/workflows/deploy.yml`)
- Acionado automaticamente no push para `main`
- Deploy rápido com zero downtime
- Usa Prisma Client pré-gerado

### 2. **Deploy Full** (`.github/workflows/deploy-full.yml`)
- Acionado manualmente (workflow_dispatch)
- Regenera tudo do zero
- Use quando houver mudanças no schema.prisma

---

## 🔄 Comparação: FTP vs GitHub Actions

| Aspecto | FTP (Manual) | GitHub Actions |
|---------|--------------|----------------|
| Velocidade | ~5 min upload | ~3 min total |
| Automação | Manual | Automático |
| Zero Downtime | Não | Sim |
| Rollback | Manual | Automático |
| Backup | Manual | Automático |
| CI/CD | Não | Sim |

---

## 📚 Arquivos Relacionados

- `.github/workflows/deploy.yml` - Workflow principal
- `.github/workflows/deploy-full.yml` - Workflow completo
- `scripts/deploy/deploy-zero-downtime.sh` - Script de deploy
- `backend/Dockerfile` - Build multi-stage com Prisma
- `backend/prisma/schema.prisma` - Schema com binaryTargets

---

## ✅ Próximos Passos

Agora você pode escolher o método de deploy:

1. **GitHub Actions** (Recomendado): Push para `main`
2. **FTP Manual**: Use `deploy-FINAL-[timestamp].tar.gz` quando precisar

Ambos usam o mesmo Prisma Client pré-gerado! 🎉
