# Análise do Arquivo HTML - Plano de Gestão

## Objetivo
Mapear corretamente TODOS os planos e ações presentes no arquivo `plano de gestao empreendimentos.html` para popular a tabela `plano_gestao_acao_modelo`.

## Estrutura do HTML
- Total de linhas: 1592
- Formato: Tabelas HTML com dados de planos de gestão

## Planos Identificados (grep inicial)
Com base no grep, identifiquei os seguintes títulos de planos:

1. **Plano de Gestão e Estratégias** (Foco nos Empreendimentos)
2. **Plano de Mercado e Comercialização** (Foco nos Empreendimentos)
3. **Plano de Tecnologia e Inovação** (Foco nos Empreendimentos)
4. **Plano financeiro e orçamentário** (Foco nos Empreendimentos)
5. **Plano de Qualificação da Liderança** (Foco nos Empreendimentos)
6. **Plano de Produção** (Foco nos Empreendimentos)
7. **Plano de Aprendizagem Interorganizacional** (Foco nos Empreendimentos)

## ⚠️ ERRO NO SCRIPT ORIGINAL
O script `populate-plano-gestao-template.js` contém planos INVENTADOS que NÃO existem no HTML:
- ❌ "Plano Jurídico" - NÃO EXISTE
- ❌ "Plano Financeiro" (como "financeiro") - O nome correto é "Plano financeiro e orçamentário"
- ❌ "Plano de Comunicação e Marketing" - NÃO EXISTE
- ❌ "Plano de Capacitação e Desenvolvimento" - O nome correto parece ser "Plano de Qualificação da Liderança" e/ou "Plano de Aprendizagem Interorganizacional"

## Próximos Passos
1. Ler o HTML completo seção por seção
2. Extrair TODAS as tabelas com suas estruturas
3. Mapear cada ação com:
   - tipo (slug do plano)
   - titulo (título completo do plano)
   - grupo (seção/categoria dentro do plano)
   - acao (nome da ação)
   - hint_como_sera_feito (texto da coluna "COMO SERÁ FEITO?")
   - hint_responsavel (texto da coluna "RESPONSÁVEL")
   - hint_recursos (texto da coluna "RECURSOS")
   - ordem (sequência das ações)
4. Gerar o script correto com os dados reais

