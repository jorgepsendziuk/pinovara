-- ==========================================
-- CORREÇÃO: Título do Plano Financeiro e Orçamentário
-- Data: 2025-11-04
-- Descrição: Corrige o título de "(Foco nos Empreendimentos)" para "(Foco nos negócios)"
-- ==========================================

BEGIN;

-- Atualizar o título do Plano Financeiro e Orçamentário
UPDATE pinovara.plano_gestao_acao_modelo
SET titulo = 'Plano Financeiro e Orçamentário (Foco nos negócios)'
WHERE tipo = 'financeiro-orcamentario'
  AND titulo = 'Plano Financeiro e Orçamentário (Foco nos Empreendimentos)';

-- Verificar quantas linhas foram atualizadas
DO $$
DECLARE
    linhas_afetadas INTEGER;
BEGIN
    GET DIAGNOSTICS linhas_afetadas = ROW_COUNT;
    
    IF linhas_afetadas > 0 THEN
        RAISE NOTICE '✓ Sucesso: % linhas foram atualizadas', linhas_afetadas;
    ELSE
        RAISE NOTICE 'ℹ Nenhuma linha foi atualizada. Verifique se os dados já estão corretos ou se não existem dados na tabela.';
    END IF;
END $$;

-- Verificar o resultado
SELECT 
    tipo,
    titulo,
    COUNT(*) as total_acoes
FROM pinovara.plano_gestao_acao_modelo
WHERE tipo = 'financeiro-orcamentario'
GROUP BY tipo, titulo;

COMMIT;

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================

