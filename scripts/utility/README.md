# 🛠️ Scripts Utilitários

Scripts utilitários para operações diversas do PINOVARA.

## 📁 Arquivos

- **`copy-routes.sh`** - Cópia de rotas
- **`restore-env.sh`** - Restauração ambiente
- **`switch-env.sh`** - Troca de ambiente

## 🎯 Scripts Disponíveis

### `copy-routes.sh`
Copia arquivos de rotas para deploy:
- Backup de rotas
- Cópia para servidor
- Verificação de integridade

**Uso:**
```bash
./scripts/utility/copy-routes.sh
```

### `restore-env.sh`
Restaura configurações de ambiente:
- Backup de .env
- Restauração de configurações
- Verificação de variáveis

**Uso:**
```bash
./scripts/utility/restore-env.sh
```

### `switch-env.sh`
Troca entre ambientes:
- Development ↔ Production
- Configurações específicas
- Variáveis de ambiente

**Uso:**
```bash
./scripts/utility/switch-env.sh
```

## 🔧 Operações Disponíveis

### Backup e Restore
- ✅ Backup de configurações
- ✅ Restauração de ambiente
- ✅ Verificação de integridade

### Troca de Ambiente
- ✅ Development
- ✅ Production
- ✅ Staging (futuro)

### Manutenção
- ✅ Limpeza de arquivos temporários
- ✅ Verificação de permissões
- ✅ Otimização de espaço

## 🔍 Comandos Úteis

```bash
# Backup manual
cp backend/config.env backend/config.env.backup

# Restore manual
cp backend/config.env.backup backend/config.env

# Verificar ambiente
echo $NODE_ENV
cat backend/config.env
```