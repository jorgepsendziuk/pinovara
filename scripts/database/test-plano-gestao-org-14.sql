-- Script de teste para Plano de Gestão da Organização 14
-- Insere dados de teste em todos os campos

-- 1. Atualizar o rascunho com informações de quem editou
UPDATE pinovara.organizacao 
SET 
  plano_gestao_rascunho = 'Este é um rascunho de teste do Plano de Gestão.

Pontos discutidos na reunião:
- Necessidade de melhorar a organização administrativa
- Fortalecer a capacidade de comercialização
- Investir em capacitação dos membros
- Buscar novas parcerias comerciais

Próximos passos:
1. Agendar reunião com diretoria
2. Levantar recursos disponíveis
3. Definir cronograma de implementação',
  plano_gestao_rascunho_updated_by = 1, -- ID do usuário jimxxx@gmail.com
  plano_gestao_rascunho_updated_at = NOW()
WHERE id = 14;

-- 2. Inserir dados para algumas ações do Plano Administrativo
-- Ação 1: Registrar e arquivar em pastas ou arquivos todas as correspondências...
INSERT INTO pinovara.plano_gestao_acao (
  id_organizacao, 
  id_acao_modelo, 
  responsavel, 
  data_inicio, 
  data_termino, 
  como_sera_feito, 
  recursos
) VALUES (
  14,
  1,
  'João Silva (Secretário) e Maria Santos (Assistente Administrativa)',
  '2025-02-01',
  '2025-06-30',
  'Criar sistema de arquivamento físico e digital. Organizar pastas por categoria (jurídico, administrativo, financeiro). Implementar protocolo de entrada e saída de documentos. Digitalizar documentos importantes para backup.',
  'Armário arquivo, pastas suspensas, etiquetas, scanner, computador, software de gestão documental'
)
ON CONFLICT (id_organizacao, id_acao_modelo) 
DO UPDATE SET
  responsavel = EXCLUDED.responsavel,
  data_inicio = EXCLUDED.data_inicio,
  data_termino = EXCLUDED.data_termino,
  como_sera_feito = EXCLUDED.como_sera_feito,
  recursos = EXCLUDED.recursos,
  updated_at = NOW();

-- Ação 2: Criar modelo de recibo simples e completo...
INSERT INTO pinovara.plano_gestao_acao (
  id_organizacao, 
  id_acao_modelo, 
  responsavel, 
  data_inicio, 
  data_termino, 
  como_sera_feito, 
  recursos
) VALUES (
  14,
  2,
  'Contador e Tesoureiro',
  '2025-01-15',
  '2025-03-31',
  'Contratar consultoria contábil para desenvolver modelos adequados. Validar com contador. Treinar equipe administrativa. Implementar uso obrigatório dos modelos.',
  'Assessoria contábil, computador, impressora, software de edição de textos'
)
ON CONFLICT (id_organizacao, id_acao_modelo) 
DO UPDATE SET
  responsavel = EXCLUDED.responsavel,
  data_inicio = EXCLUDED.data_inicio,
  data_termino = EXCLUDED.data_termino,
  como_sera_feito = EXCLUDED.como_sera_feito,
  recursos = EXCLUDED.recursos,
  updated_at = NOW();

-- 3. Inserir dados para ações do Plano de Comercialização
-- Ação 11: Fazer levantamento da capacidade produtiva...
INSERT INTO pinovara.plano_gestao_acao (
  id_organizacao, 
  id_acao_modelo, 
  responsavel, 
  data_inicio, 
  data_termino, 
  como_sera_feito, 
  recursos
) VALUES (
  14,
  11,
  'Coordenador de Produção e equipe técnica',
  '2025-03-01',
  NULL, -- Ação em andamento, sem data de término ainda
  'Realizar visitas aos produtores associados. Aplicar questionário sobre capacidade produtiva. Consolidar dados em planilha. Analisar sazonalidade da produção.',
  'Formulários impressos, tablet para coleta digital, veículo para visitas, combustível, planilha Excel'
)
ON CONFLICT (id_organizacao, id_acao_modelo) 
DO UPDATE SET
  responsavel = EXCLUDED.responsavel,
  data_inicio = EXCLUDED.data_inicio,
  data_termino = EXCLUDED.data_termino,
  como_sera_feito = EXCLUDED.como_sera_feito,
  recursos = EXCLUDED.recursos,
  updated_at = NOW();

-- Ação 12: Desenvolver ou aperfeiçoar um plano de marketing...
INSERT INTO pinovara.plano_gestao_acao (
  id_organizacao, 
  id_acao_modelo, 
  responsavel, 
  data_inicio, 
  data_termino, 
  como_sera_feito, 
  recursos
) VALUES (
  14,
  12,
  'Comissão de Marketing (3 membros) com apoio de consultor externo',
  '2025-02-15',
  '2025-08-31',
  'Contratar consultoria em marketing. Realizar pesquisa de mercado. Definir público-alvo e canais de divulgação. Criar identidade visual. Desenvolver estratégias de comunicação digital e presencial.',
  'Consultoria especializada, designer gráfico, fotógrafo, materiais gráficos, criação de site/redes sociais'
)
ON CONFLICT (id_organizacao, id_acao_modelo) 
DO UPDATE SET
  responsavel = EXCLUDED.responsavel,
  data_inicio = EXCLUDED.data_inicio,
  data_termino = EXCLUDED.data_termino,
  como_sera_feito = EXCLUDED.como_sera_feito,
  recursos = EXCLUDED.recursos,
  updated_at = NOW();

-- 4. Inserir uma ação completada (com datas no passado)
-- Ação 3: Elaborar uma listagem de documentos necessários...
INSERT INTO pinovara.plano_gestao_acao (
  id_organizacao, 
  id_acao_modelo, 
  responsavel, 
  data_inicio, 
  data_termino, 
  como_sera_feito, 
  recursos
) VALUES (
  14,
  3,
  'Assessoria jurídica e Presidente',
  '2024-10-01',
  '2024-12-15',
  'Consultoria com advogado especializado. Levantamento de documentos existentes. Identificação de documentos faltantes. Criação de checklist completo.',
  'Assessoria jurídica, análise de estatuto e regulamentos vigentes'
)
ON CONFLICT (id_organizacao, id_acao_modelo) 
DO UPDATE SET
  responsavel = EXCLUDED.responsavel,
  data_inicio = EXCLUDED.data_inicio,
  data_termino = EXCLUDED.data_termino,
  como_sera_feito = EXCLUDED.como_sera_feito,
  recursos = EXCLUDED.recursos,
  updated_at = NOW();

-- 5. Inserir ação sem datas (não iniciada)
-- Ação 21: Implantar controles financeiros...
INSERT INTO pinovara.plano_gestao_acao (
  id_organizacao, 
  id_acao_modelo, 
  responsavel, 
  data_inicio, 
  data_termino, 
  como_sera_feito, 
  recursos
) VALUES (
  14,
  21,
  NULL, -- Ainda não definido
  NULL, -- Não iniciada
  NULL,
  NULL, -- Ainda não planejado
  NULL
)
ON CONFLICT (id_organizacao, id_acao_modelo) 
DO UPDATE SET
  responsavel = EXCLUDED.responsavel,
  data_inicio = EXCLUDED.data_inicio,
  data_termino = EXCLUDED.data_termino,
  como_sera_feito = EXCLUDED.como_sera_feito,
  recursos = EXCLUDED.recursos,
  updated_at = NOW();

-- Verificar os dados inseridos
SELECT 
  o.id as org_id,
  o.nome as organizacao,
  o.plano_gestao_rascunho_updated_by,
  o.plano_gestao_rascunho_updated_at,
  u.name as editado_por,
  LENGTH(o.plano_gestao_rascunho) as tamanho_rascunho
FROM pinovara.organizacao o
LEFT JOIN pinovara.users u ON u.id = o.plano_gestao_rascunho_updated_by
WHERE o.id = 14;

SELECT 
  pga.id,
  pga.id_organizacao,
  pgam.tipo,
  pgam.titulo,
  pgam.acao,
  pga.responsavel,
  pga.data_inicio,
  pga.data_termino,
  CASE 
    WHEN pga.data_inicio IS NULL AND pga.data_termino IS NULL THEN 'Não iniciado'
    WHEN pga.data_inicio IS NOT NULL AND pga.data_termino IS NOT NULL AND pga.data_termino < NOW() THEN 'Concluído'
    ELSE 'Pendente'
  END as status,
  LENGTH(pga.como_sera_feito) as tamanho_planejamento
FROM pinovara.plano_gestao_acao pga
JOIN pinovara.plano_gestao_acao_modelo pgam ON pgam.id = pga.id_acao_modelo
WHERE pga.id_organizacao = 14
ORDER BY pgam.ordem;

