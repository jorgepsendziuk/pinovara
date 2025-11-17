# 🔐 Guia Rápido: Remover Senha do Histórico do GitHub

## ⚠️ Situação Atual

A senha `[SENHA_REMOVIDA_DO_HISTORICO]` foi encontrada em **8 commits** no histórico do Git. Mesmo que tenhamos removido dos arquivos atuais, ela ainda está visível no GitHub através de commits antigos.

## 🚀 Solução Rápida (Recomendada)

### Opção 1: Usar o Script Automatizado

```bash
cd /Users/jorgepsendziuk/Documents/pinovara

# Executar o script (ele pedirá confirmação)
./scripts/security/remove-password-from-history.sh
```

O script irá:
1. ✅ Criar backup automático
2. ✅ Remover a senha de todo o histórico
3. ✅ Fornecer instruções para atualizar o GitHub

### Opção 2: Manual (Mais Controle)

```bash
cd /Users/jorgepsendziuk/Documents/pinovara

# 1. Fazer backup
cp -r ../pinovara ../pinovara-backup-$(date +%Y%m%d)

# 2. Criar arquivo de substituição
echo "[SENHA_REMOVIDA_DO_HISTORICO]==>[SENHA_REMOVIDA_DO_HISTORICO]" > /tmp/replace.txt

# 3. Executar git-filter-repo
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
git-filter-repo --replace-text /tmp/replace.txt --force

# 4. Verificar que funcionou (deve retornar vazio)
git log --all --full-history --source --all -S "[SENHA_REMOVIDA_DO_HISTORICO]"

# 5. Atualizar GitHub (FORCE PUSH - CUIDADO!)
git push origin --force --all
git push origin --force --tags
```

## ⚠️ IMPORTANTE: Após Remover do Histórico

### 1. Avisar Equipe

Todos os desenvolvedores precisarão fazer:

```bash
git fetch origin
git reset --hard origin/main
```

### 2. Invalidar Credenciais Expostas

- ✅ Alterar a senha `[SENHA_REMOVIDA_DO_HISTORICO]` no banco de dados
- ✅ Gerar novos tokens/secrets se necessário
- ✅ Verificar logs de acesso para atividades suspeitas

### 3. Verificar Forks

Se houver forks do repositório no GitHub, eles também precisarão ser atualizados ou deletados.

## 📋 Checklist Completo

- [ ] Fazer backup do repositório
- [ ] Executar remoção da senha do histórico
- [ ] Verificar que a senha foi removida
- [ ] Fazer force push para GitHub
- [ ] Avisar equipe sobre reset necessário
- [ ] Alterar senha no banco de dados
- [ ] Verificar se há forks que precisam ser atualizados

## 🔍 Verificar se Funcionou

```bash
# Deve retornar vazio (nenhum commit encontrado)
git log --all --full-history --source --all -S "[SENHA_REMOVIDA_DO_HISTORICO]"
```

## 📚 Documentação Completa

Veja `docs/security/REMOVER-SENHA-DO-HISTORICO.md` para documentação detalhada.

## 🆘 Precisa de Ajuda?

Se tiver dúvidas ou problemas, consulte:
- [GitHub Docs: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)

