# 🧪 Teste do Plano de Gestão - Organização 14

## 📋 Instruções

Execute o script SQL no DBeaver ou pgAdmin para popular dados de teste no Plano de Gestão da organização 14.

## 📂 Arquivo

```
scripts/database/test-plano-gestao-org-14.sql
```

## 📊 O que será testado

### 1. **Rascunho / Notas Colaborativas**
- Texto completo com formatação
- Registro de quem editou (usuário ID 1 - jimxxx@gmail.com)
- Data/hora da edição

### 2. **Ações do Plano Administrativo**
- **Ação 1** (Arquivamento de documentos): Pendente (início: 01/02/2025, fim: 30/06/2025)
- **Ação 2** (Modelos de recibo): Pendente (início: 15/01/2025, fim: 31/03/2025)
- **Ação 3** (Listagem de documentos): Concluída ✅ (01/10/2024 - 15/12/2024)

### 3. **Ações do Plano de Comercialização**
- **Ação 11** (Capacidade produtiva): Em andamento (início: 01/03/2025, sem término)
- **Ação 12** (Plano de marketing): Pendente (início: 15/02/2025, fim: 31/08/2025)

### 4. **Ações do Plano de Mercado**
- **Ação 21** (Controles financeiros): Não iniciada 🔘 (sem datas)

## 🎨 Testes de Status Visual

Após executar o script, você verá:
- **🔘 Fundo Cinza**: Ação 21 (não iniciada - sem datas)
- **🟡 Fundo Amarelo**: Ações 1, 2, 11, 12 (pendentes - em andamento)
- **🟢 Fundo Verde**: Ação 3 (concluída - data de término passou)

## 🔍 Verificação

O script inclui dois SELECTs no final para verificar:

### 1. Rascunho
```sql
SELECT 
  o.id,
  o.nome,
  u.name as editado_por,
  o.plano_gestao_rascunho_updated_at,
  LENGTH(o.plano_gestao_rascunho) as tamanho_rascunho
FROM pinovara.organizacao o
LEFT JOIN pinovara.users u ON u.id = o.plano_gestao_rascunho_updated_by
WHERE o.id = 14;
```

### 2. Ações
```sql
SELECT 
  pgam.tipo,
  pgam.acao,
  pga.responsavel,
  pga.data_inicio,
  pga.data_termino,
  CASE 
    WHEN pga.data_inicio IS NULL THEN 'Não iniciado'
    WHEN pga.data_termino < NOW() THEN 'Concluído'
    ELSE 'Pendente'
  END as status
FROM pinovara.plano_gestao_acao pga
JOIN pinovara.plano_gestao_acao_modelo pgam ON pgam.id = pga.id_acao_modelo
WHERE pga.id_organizacao = 14
ORDER BY pgam.ordem;
```

## ✅ Checklist de Teste

Depois de executar o SQL, teste no sistema:

1. [ ] Acessar organização 14 → Plano de Gestão
2. [ ] Verificar se o rascunho está preenchido
3. [ ] Verificar se aparece "Última edição: Jorge Psendziuk em [data/hora]"
4. [ ] Ver ação com fundo CINZA (não iniciada)
5. [ ] Ver ações com fundo AMARELO (pendentes)
6. [ ] Ver ação com fundo VERDE (concluída)
7. [ ] Verificar se os badges de status aparecem corretamente
8. [ ] Testar edição de uma ação e salvamento
9. [ ] Testar edição do rascunho e verificar se atualiza o histórico

## 🚀 Como Executar

1. Abra o DBeaver ou pgAdmin
2. Conecte ao banco `bd.pinovaraufba.com.br`
3. Abra o arquivo `scripts/database/test-plano-gestao-org-14.sql`
4. Execute o script completo
5. Verifique os resultados dos SELECTs no final
6. Acesse o sistema e navegue até a organização 14

## 📝 Dados Inseridos

Total de **6 ações** com diferentes status:
- 1 Concluída (verde)
- 4 Pendentes (amarelo) 
- 1 Não iniciada (cinza)

Todos os campos testados:
- ✅ responsavel
- ✅ data_inicio
- ✅ data_termino
- ✅ como_sera_feito
- ✅ recursos
- ✅ plano_gestao_rascunho
- ✅ plano_gestao_rascunho_updated_by
- ✅ plano_gestao_rascunho_updated_at

