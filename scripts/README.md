# 📁 Scripts PINOVARA

Esta pasta contém todos os scripts organizados por categoria para facilitar a manutenção e uso.

## 📂 Estrutura

```
scripts/
├── deploy/          # Scripts de deploy
├── build/           # Scripts de build
├── test/            # Scripts de teste
├── fix/             # Scripts de correção
├── check/           # Scripts de verificação
├── utility/         # Scripts utilitários
└── database/        # Scripts de banco de dados
```

## 🚀 Scripts Principais

### Deploy
- **`deploy/deploy-safe.sh`** - Script principal de deploy seguro
- **`deploy/test-deploy-safe.sh`** - Teste do deploy seguro

### Build
- **`build/build-local.sh`** - Build local
- **`build/build-server-direct.sh`** - Build direto no servidor

### Test
- **`test/test-db-connection.sh`** - Teste de conexão com banco
- **`test/check-deployment.sh`** - Verificação de deploy

### Fix
- **`fix/fix-nginx-config.sh`** - Correção configuração nginx
- **`fix/fix-prisma-engine.sh`** - Correção Prisma

### Check
- **`check/check-database.sh`** - Verificação banco de dados
- **`check/diagnose-db.sh`** - Diagnóstico banco
- **`check/nginx-monitor.sh`** - Monitor nginx

### Utility
- **`utility/copy-routes.sh`** - Cópia de rotas
- **`utility/restore-env.sh`** - Restauração ambiente
- **`utility/switch-env.sh`** - Troca de ambiente

### Database
- **`database/assign-admin-role.js`** - Atribuir papel admin
- **`database/create-tables.js`** - Criar tabelas

## 🎯 Uso Recomendado

### Deploy Diário
```bash
./scripts/deploy/deploy-safe.sh
```

### Teste Antes do Deploy
```bash
./scripts/deploy/test-deploy-safe.sh
```

### Build Local
```bash
./scripts/build/build-local.sh
```

### Verificação de Sistema
```bash
./scripts/check/check-database.sh
./scripts/check/nginx-monitor.sh
```

## 📋 Organização

- **Scripts organizados por função** para fácil localização
- **Scripts obsoletos removidos** para evitar confusão
- **Documentação clara** em cada pasta
- **Comandos seguros** que não modificam configurações do sistema