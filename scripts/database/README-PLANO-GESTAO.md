# 📋 Migration: Plano de Gestão

## ⚠️ IMPORTANTE: Permissões do Banco de Dados

**Antes de usar o sistema**, é necessário aplicar as permissões corretas no banco de dados.

👉 **Ver**: `CORRECAO-PERMISSOES-PLANO-GESTAO.md` (na raiz do projeto)  
📄 **Script**: `scripts/database/fix-plano-gestao-permissions.sql`

Sem essas permissões, você receberá erro **500** ao tentar salvar ações.

---

## Visão Geral

Esta migration adiciona duas novas tabelas ao sistema PINOVARA para suportar o **Plano de Gestão** das organizações:

1. **`plano_gestao_acao_modelo`** - Armazena as ações template (dados fixos do sistema)
2. **`plano_gestao_acao`** - Armazena as respostas editáveis por organização (lazy creation)

## 📊 Estrutura das Tabelas

### Tabela: `plano_gestao_acao_modelo`

Armazena as ações template do Plano de Gestão que servem como base para todas as organizações.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `SERIAL PRIMARY KEY` | Identificador único da ação modelo |
| `tipo` | `VARCHAR(100)` | Tipo do plano (ex: gestao-estrategias, comercializacao) |
| `titulo` | `VARCHAR(300)` | Título do plano temático |
| `grupo` | `VARCHAR(300)` | Grupo/categoria dentro do plano (opcional) |
| `acao` | `VARCHAR(500)` | Nome/título da ação |
| `hint_como_sera_feito` | `TEXT` | Texto hint/sugestão para "Como será feito?" (opcional) |
| `hint_responsavel` | `VARCHAR(200)` | Texto hint/sugestão para o responsável (opcional) |
| `hint_recursos` | `VARCHAR(200)` | Texto hint/sugestão para recursos (opcional) |
| `ordem` | `INTEGER` | Ordem de exibição da ação |
| `ativo` | `BOOLEAN DEFAULT true` | Se a ação está ativa no sistema |

**Índices:**
- `idx_plano_gestao_acao_modelo_tipo` em `tipo`
- `idx_plano_gestao_acao_modelo_ativo` em `ativo`
- `idx_plano_gestao_acao_modelo_ordem` em `ordem`

### Tabela: `plano_gestao_acao`

Armazena as respostas editáveis do Plano de Gestão por organização. **Lazy creation**: registros só são criados quando o usuário edita pela primeira vez.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `SERIAL PRIMARY KEY` | Identificador único |
| `id_organizacao` | `INTEGER` | FK para organizacao.id (CASCADE) |
| `id_acao_modelo` | `INTEGER` | FK para plano_gestao_acao_modelo.id |
| `responsavel` | `VARCHAR(300)` | Responsável pela ação (editável) |
| `data_inicio` | `DATE` | Data de início prevista (editável) |
| `data_termino` | `DATE` | Data de término prevista (editável) |
| `como_sera_feito` | `TEXT` | Descrição de como será feito (editável) |
| `recursos` | `VARCHAR(300)` | Recursos necessários (editável) |
| `created_at` | `TIMESTAMP(6)` | Data de criação do registro |
| `updated_at` | `TIMESTAMP(6)` | Data da última atualização (auto-atualizada) |

**Constraints:**
- `fk_plano_gestao_acao_organizacao`: FK para `organizacao(id)` com `ON DELETE CASCADE`
- `fk_plano_gestao_acao_modelo`: FK para `plano_gestao_acao_modelo(id)` com `ON DELETE RESTRICT`
- `uk_plano_gestao_acao_org_modelo`: UNIQUE em `(id_organizacao, id_acao_modelo)`

**Índices:**
- `idx_plano_gestao_acao_organizacao` em `id_organizacao`
- `idx_plano_gestao_acao_modelo` em `id_acao_modelo`
- `idx_plano_gestao_acao_dates` em `(data_inicio, data_termino)`

**Trigger:**
- `trigger_update_plano_gestao_acao_updated_at`: Atualiza automaticamente `updated_at` em toda modificação

## 🚀 Como Aplicar a Migration

### Passo 1: Criar as Tabelas

Execute o script SQL de criação das tabelas:

```bash
psql $DATABASE_URL -f scripts/database/migration-plano-gestao.sql
```

Ou copie e cole o conteúdo do arquivo `migration-plano-gestao.sql` diretamente no cliente PostgreSQL.

### Passo 2: Popular Dados Template

Execute o script Node.js para gerar os INSERTs:

```bash
node scripts/database/populate-plano-gestao-template.js > /tmp/inserts-plano-gestao.sql
```

E então aplique os INSERTs:

```bash
psql $DATABASE_URL -f /tmp/inserts-plano-gestao.sql
```

Ou execute diretamente:

```bash
node scripts/database/populate-plano-gestao-template.js | psql $DATABASE_URL
```

### Passo 3: Verificar

Verifique se os dados foram inseridos corretamente:

```sql
-- Total de ações template por tipo
SELECT tipo, COUNT(*) as total 
FROM pinovara.plano_gestao_acao_modelo 
GROUP BY tipo 
ORDER BY tipo;

-- Total geral
SELECT COUNT(*) as total FROM pinovara.plano_gestao_acao_modelo;

-- Listar todas as ações
SELECT id, tipo, grupo, acao, ordem 
FROM pinovara.plano_gestao_acao_modelo 
ORDER BY ordem;
```

## 📝 Tipos de Planos

O sistema contém os seguintes tipos de planos:

1. **`gestao-estrategias`** - Plano de Gestão e Estratégias
2. **`mercado-comercializacao`** - Plano de Mercado e Comercialização
3. **`tecnologia-inovacao`** - Plano de Tecnologia e Inovação
4. **`juridico`** - Plano Jurídico
5. **`financeiro`** - Plano Financeiro
6. **`producao`** - Plano de Produção
7. **`comunicacao-marketing`** - Plano de Comunicação e Marketing
8. **`capacitacao-desenvolvimento`** - Plano de Capacitação e Desenvolvimento

## 🔍 Exemplos de Queries

### Buscar todas as ações de um plano específico

```sql
SELECT * 
FROM pinovara.plano_gestao_acao_modelo 
WHERE tipo = 'gestao-estrategias' 
ORDER BY ordem;
```

### Buscar ações editadas por uma organização

```sql
SELECT 
  pga.id,
  pgam.tipo,
  pgam.titulo,
  pgam.acao,
  pga.responsavel,
  pga.data_inicio,
  pga.data_termino,
  pga.como_sera_feito,
  pga.recursos
FROM pinovara.plano_gestao_acao pga
JOIN pinovara.plano_gestao_acao_modelo pgam ON pga.id_acao_modelo = pgam.id
WHERE pga.id_organizacao = 13
ORDER BY pgam.ordem;
```

### Buscar plano completo de uma organização (template + editado)

```sql
SELECT 
  pgam.id as id_modelo,
  pgam.tipo,
  pgam.titulo,
  pgam.grupo,
  pgam.acao,
  pgam.hint_como_sera_feito,
  pgam.hint_responsavel,
  pgam.hint_recursos,
  pgam.ordem,
  pga.id as id_resposta,
  pga.responsavel,
  pga.data_inicio,
  pga.data_termino,
  pga.como_sera_feito,
  pga.recursos,
  pga.updated_at
FROM pinovara.plano_gestao_acao_modelo pgam
LEFT JOIN pinovara.plano_gestao_acao pga 
  ON pgam.id = pga.id_acao_modelo 
  AND pga.id_organizacao = 13
WHERE pgam.ativo = true
ORDER BY pgam.ordem;
```

### Criar/Atualizar uma resposta (lazy creation)

```sql
-- INSERT com ON CONFLICT para lazy creation
INSERT INTO pinovara.plano_gestao_acao 
  (id_organizacao, id_acao_modelo, responsavel, data_inicio, data_termino, como_sera_feito, recursos)
VALUES 
  (13, 1, 'João Silva', '2025-01-15', '2025-03-30', 'Vamos fazer workshops', 'R$ 5.000')
ON CONFLICT (id_organizacao, id_acao_modelo) 
DO UPDATE SET
  responsavel = EXCLUDED.responsavel,
  data_inicio = EXCLUDED.data_inicio,
  data_termino = EXCLUDED.data_termino,
  como_sera_feito = EXCLUDED.como_sera_feito,
  recursos = EXCLUDED.recursos,
  updated_at = CURRENT_TIMESTAMP;
```

### Deletar uma resposta específica

```sql
DELETE FROM pinovara.plano_gestao_acao 
WHERE id_organizacao = 13 AND id_acao_modelo = 1;
```

## 🔧 Uso no Backend (Prisma)

### Buscar plano completo de uma organização

```typescript
const planoCompleto = await prisma.plano_gestao_acao_modelo.findMany({
  where: { ativo: true },
  include: {
    plano_gestao_acao: {
      where: { id_organizacao: organizacaoId }
    }
  },
  orderBy: { ordem: 'asc' }
});
```

### Criar/Atualizar resposta (upsert - lazy creation)

```typescript
const resposta = await prisma.plano_gestao_acao.upsert({
  where: {
    id_organizacao_id_acao_modelo: {
      id_organizacao: 13,
      id_acao_modelo: 1
    }
  },
  create: {
    id_organizacao: 13,
    id_acao_modelo: 1,
    responsavel: 'João Silva',
    data_inicio: new Date('2025-01-15'),
    data_termino: new Date('2025-03-30'),
    como_sera_feito: 'Vamos fazer workshops',
    recursos: 'R$ 5.000'
  },
  update: {
    responsavel: 'João Silva',
    data_inicio: new Date('2025-01-15'),
    data_termino: new Date('2025-03-30'),
    como_sera_feito: 'Vamos fazer workshops',
    recursos: 'R$ 5.000'
  }
});
```

### Deletar resposta

```typescript
await prisma.plano_gestao_acao.delete({
  where: {
    id_organizacao_id_acao_modelo: {
      id_organizacao: 13,
      id_acao_modelo: 1
    }
  }
});
```

## ⚠️ Observações Importantes

1. **Não usar `prisma migrate` ou `prisma db push`**: O banco é gerenciado manualmente pelo DBA [[memory:9186849]]

2. **Lazy Creation**: Registros em `plano_gestao_acao` só devem ser criados quando o usuário editar pela primeira vez. Não pré-popular com todas as ações.

3. **Cascade Delete**: Quando uma organização é deletada, todas as suas respostas em `plano_gestao_acao` são automaticamente removidas.

4. **Restrict Delete**: Não é possível deletar uma ação modelo se houver respostas associadas (para preservar integridade).

5. **Updated At**: O campo `updated_at` é atualizado automaticamente por um trigger PostgreSQL.

6. **Dados Source**: Os dados template foram extraídos de `docs/resources/plano de gestao empreendimentos.html`

## 📚 Arquivos Relacionados

- **Schema Prisma**: `backend/prisma/schema.prisma`
- **Migration SQL**: `scripts/database/migration-plano-gestao.sql`
- **Script de População**: `scripts/database/populate-plano-gestao-template.js`
- **Componente Frontend**: `frontend/src/components/organizacoes/PlanoGestao.tsx`

## 🆘 Rollback (se necessário)

Para reverter a migration (⚠️ **CUIDADO - irá deletar todos os dados**):

```sql
-- Remover tabelas na ordem correta (devido às FKs)
DROP TABLE IF EXISTS pinovara.plano_gestao_acao CASCADE;
DROP TABLE IF EXISTS pinovara.plano_gestao_acao_modelo CASCADE;

-- Remover função do trigger
DROP FUNCTION IF EXISTS pinovara.update_plano_gestao_acao_updated_at() CASCADE;
```

Depois, remover os models do `schema.prisma` e executar `npx prisma generate` novamente.

## ✅ Checklist de Aplicação

- [ ] Backup do banco de dados
- [ ] Executar `migration-plano-gestao.sql`
- [ ] Executar `populate-plano-gestao-template.js`
- [ ] Verificar contagem de registros (deve ter 32 ações)
- [ ] Testar query de busca de plano completo
- [ ] Testar upsert de resposta
- [ ] Verificar trigger de updated_at
- [ ] Atualizar cliente Prisma (`npx prisma generate`)
- [ ] Documentar no changelog do projeto

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Verificar logs do PostgreSQL
- Consultar a documentação do Prisma
- Revisar este README

