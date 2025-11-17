# 🔐 Como Remover Senha do Histórico do Git

## ⚠️ Problema

Mesmo após remover senhas dos arquivos atuais, elas ainda estão visíveis no histórico do Git/GitHub através de commits antigos.

## 🛠️ Solução: Usar git-filter-repo

### Passo 1: Instalar git-filter-repo

```bash
# macOS (via Homebrew)
brew install git-filter-repo

# Ou via pip
pip3 install git-filter-repo
```

### Passo 2: Fazer Backup

```bash
# Criar backup completo do repositório
cd /Users/jorgepsendziuk/Documents
cp -r pinovara pinovara-backup-$(date +%Y%m%d)
```

### Passo 3: Usar o Script Automatizado

```bash
cd /Users/jorgepsendziuk/Documents/pinovara
./scripts/security/remove-password-from-history.sh
```

O script irá:
- ✅ Verificar se git-filter-repo está instalado
- ✅ Criar backup automático
- ✅ Substituir a senha por `[SENHA_REMOVIDA_DO_HISTORICO]` em todo o histórico
- ✅ Fornecer instruções para force push

### Passo 4: Verificar Remoção

```bash
# Verificar se ainda há ocorrências da senha
git log --all --full-history --source --all -S "[SENHA_REMOVIDA_DO_HISTORICO]"

# Se não retornar nada, a senha foi removida!
```

### Passo 5: Atualizar GitHub (FORCE PUSH)

⚠️ **ATENÇÃO**: Isso reescreve o histórico no GitHub!

```bash
# Fazer force push de todas as branches
git push origin --force --all

# Fazer force push de todas as tags
git push origin --force --tags
```

### Passo 6: Avisar Equipe

Todos os desenvolvedores precisarão fazer:

```bash
# Buscar novo histórico
git fetch origin

# Resetar branch local para match com remoto
git reset --hard origin/main
```

## 🔄 Método Alternativo: BFG Repo-Cleaner

Se preferir usar BFG Repo-Cleaner:

### Instalação

```bash
# macOS
brew install bfg

# Ou baixar JAR de https://rtyley.github.io/bfg-repo-cleaner/
```

### Uso

```bash
# Criar arquivo com senhas a remover
echo "[SENHA_REMOVIDA_DO_HISTORICO]" > passwords.txt

# Executar BFG
bfg --replace-text passwords.txt

# Limpar referências
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## ⚠️ Importante

1. **Backup**: Sempre faça backup antes de reescrever histórico
2. **Comunicação**: Avise toda a equipe antes de fazer force push
3. **Forks**: Se houver forks do repositório, eles também precisarão ser atualizados
4. **GitHub**: Após force push, considere invalidar tokens/secrets que possam ter sido expostos

## 🔍 Verificar se Funcionou

```bash
# Buscar por qualquer ocorrência da senha
git log --all --full-history --source --all -S "[SENHA_REMOVIDA_DO_HISTORICO]"

# Se retornar vazio, sucesso!
```

## 📚 Referências

- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

