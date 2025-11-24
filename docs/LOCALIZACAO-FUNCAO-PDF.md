# 📍 Localização da Função de Renderização do PDF

## 🔍 Função Principal

**Função:** `drawActionRow`  
**Arquivo:** `backend/src/services/PlanoGestaoPdfService.ts`  
**Linha:** 258

Esta função é responsável por renderizar cada linha da tabela no PDF do plano de gestão.

## 📋 Função que Prepara os Valores

**Função:** `buildActionRowValues`  
**Arquivo:** `backend/src/services/PlanoGestaoPdfService.ts`  
**Linha:** 130

Esta função prepara os valores que serão exibidos em cada coluna:
- `acao` - Título da ação
- `responsavel` - Responsável
- `periodo` - Período
- `como` - Como será feito? (campo `como_sera_feito`)
- `recursos` - Recursos
- `status` - Status

## 🎨 Onde o Texto é Renderizado

**Linha:** 327-334

```typescript
doc.text(value, cellX, cellY, { 
  width: col.width - paddingX * 2, 
  align: 'left', 
  lineGap: 1,
  continued: false
  // Sem height nem ellipsis - texto completo será exibido
});
```

## ⚠️ Problema Identificado

O texto está sendo truncado mesmo sem `ellipsis: true` explícito. Isso pode ser causado por:

1. **Limitação de altura implícita do PDFKit** - O PDFKit pode estar limitando o texto baseado na altura da célula
2. **Cálculo de altura insuficiente** - A altura calculada pode não ser suficiente para textos muito longos
3. **Comportamento padrão do PDFKit** - O PDFKit pode estar truncando quando o texto não cabe

## 🔧 Solução Aplicada

1. Removido `ellipsis: true` da renderização do texto
2. Removida limitação de altura máxima (antes era 25px)
3. Cálculo de altura baseado no texto real usando `heightOfString`
4. Adicionado `continued: false` para garantir que o texto não seja continuado

## 📝 Campos Afetados

- **Ação** (`acao`)
- **Responsável** (`responsavel`)
- **Período** (`periodo`)
- **Como será feito?** (`como_sera_feito`)
- **Recursos** (`recursos`)

## 🔄 Próximos Passos

Se o problema persistir, pode ser necessário:
1. Usar uma abordagem diferente de renderização (ex: renderizar texto linha por linha)
2. Verificar se há alguma configuração global do PDFKit que esteja causando truncamento
3. Usar uma biblioteca diferente ou versão diferente do PDFKit

