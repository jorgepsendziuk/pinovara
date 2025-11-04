# ⚠️ EXECUTE ESTE SQL AGORA PARA SALVAR FUNCIONAR

## 🔴 **Problema**: Não consegue salvar ações (Erro 500)

## ✅ **Solução**: Execute este SQL no DBeaver/pgAdmin

### Passo 1: Copie o SQL abaixo

```sql
-- Fix permissions for plano_gestao tables and sequences
-- Run this as the database administrator

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON pinovara.plano_gestao_acao_modelo TO pinovara;
GRANT SELECT, INSERT, UPDATE, DELETE ON pinovara.plano_gestao_acao TO pinovara;

-- Grant permissions on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON SEQUENCE pinovara.plano_gestao_acao_modelo_id_seq TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE pinovara.plano_gestao_acao_id_seq TO pinovara;
```

### Passo 2: Execute no DBeaver

1. Abra **DBeaver**
2. Conecte ao banco `pinovara` (servidor: `bd.pinovaraufba.com.br`)
3. Conecte como usuário **`postgres`** (superuser)
4. Cole o SQL acima
5. Execute (Ctrl+Enter ou F5)

### Passo 3: Teste

1. Volte para o sistema
2. Recarregue a página (Cmd+Shift+R)
3. Edite uma ação
4. Clique em "💾 Salvar"
5. Deve aparecer toast verde de sucesso! ✅

---

## ✅ **CARDS RESPONSIVOS IMPLEMENTADOS!**

Agora a página tem:
- **Desktop (>1024px)**: Tabela tradicional
- **Mobile/Tablet (<1024px)**: Cards bonitos

Para testar:
1. Redimensione a janela do navegador
2. Quando ficar menor que 1024px, vai virar cards automaticamente!

---

**Recarregue com Cmd+Shift+R após executar o SQL!** 🚀

