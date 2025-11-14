-- ============================================================================
-- QUERY 1: Listagem de Organizações com Histórico de Validação
-- Mostra: data de criação, primeira alteração de status, data de aprovação
-- ============================================================================

SELECT 
    o.id,
    o.nome,
    o.id_tecnico,
    t.name AS tecnico_nome,
    t.email AS tecnico_email,
    
    -- Data de criação pelo técnico (usando _creation_date) - formato BR
    TO_CHAR(o._creation_date, 'DD/MM/YYYY HH24:MI') AS data_criacao,
    o._creation_date AS data_criacao_raw, -- Mantém original para ordenação
    
    -- Primeira data de alteração de status (quando validacao_data foi preenchido pela primeira vez) - formato BR
    TO_CHAR(o.validacao_data, 'DD/MM/YYYY HH24:MI') AS primeira_alteracao_status,
    o.validacao_data AS primeira_alteracao_status_raw, -- Mantém original para ordenação
    
    -- Data quando foi para APROVADO (status 2) - formato BR
    CASE 
        WHEN o.validacao_status = 2 THEN TO_CHAR(o.validacao_data, 'DD/MM/YYYY HH24:MI')
        ELSE NULL
    END AS data_aprovacao,
    CASE 
        WHEN o.validacao_status = 2 THEN o.validacao_data
        ELSE NULL
    END AS data_aprovacao_raw, -- Mantém original para ordenação
    
    -- Status atual
    o.validacao_status,
    CASE 
        WHEN o.validacao_status = 1 THEN 'NÃO VALIDADO'
        WHEN o.validacao_status = 2 THEN 'VALIDADO'
        WHEN o.validacao_status = 3 THEN 'PENDÊNCIA'
        WHEN o.validacao_status = 4 THEN 'REPROVADO'
        ELSE 'NÃO DEFINIDO'
    END AS status_label,
    
    -- Quem validou (última validação)
    o.validacao_usuario,
    u.name AS validador_nome,
    u.email AS validador_email,
    
    -- Observações da última validação
    o.validacao_obs
    
FROM pinovara.organizacao o
LEFT JOIN pinovara.users t ON o.id_tecnico = t.id
LEFT JOIN pinovara.users u ON o.validacao_usuario = u.id
WHERE (o.removido = false OR o.removido IS NULL)
ORDER BY o.id
LIMIT 100;

-- ============================================================================
-- QUERY 2: Histórico Completo de Validação de uma Organização Específica
-- Busca todas as mudanças de status no audit_logs
-- ============================================================================
-- Substitua :organizacao_id pelo ID da organização desejada

SELECT 
    al.id AS log_id,
    al."entityId"::integer AS organizacao_id,
    o.nome AS organizacao_nome,
    al.action,
    -- Data da mudança - formato BR
    TO_CHAR(al."createdAt", 'DD/MM/YYYY HH24:MI') AS data_mudanca,
    al."createdAt" AS data_mudanca_raw, -- Mantém original para ordenação
    al."userId",
    u.name AS usuario_nome,
    u.email AS usuario_email,
    
    -- Extrair status anterior e novo do JSON (se estiver em formato JSON)
    -- Ajuste conforme o formato real dos dados em oldData e newData
    al."oldData",
    al."newData"
    
FROM pinovara.audit_logs al
LEFT JOIN pinovara.organizacao o ON al."entityId"::integer = o.id
LEFT JOIN pinovara.users u ON al."userId" = u.id
WHERE al.entity = 'organizacao' 
    AND al."entityId"::integer = :organizacao_id  -- Substitua pelo ID desejado (ex: 45)
    AND (
        al.action LIKE '%validacao%' 
        OR al.action LIKE '%validation%' 
        OR al."newData"::text LIKE '%validacao_status%'
        OR al."oldData"::text LIKE '%validacao_status%'
    )
ORDER BY al."createdAt" DESC;

-- ============================================================================
-- QUERY 3: Histórico Completo de TODAS as Organizações (últimas mudanças)
-- ============================================================================

SELECT 
    al.id AS log_id,
    al."entityId"::integer AS organizacao_id,
    o.nome AS organizacao_nome,
    al.action,
    -- Data da mudança - formato BR
    TO_CHAR(al."createdAt", 'DD/MM/YYYY HH24:MI') AS data_mudanca,
    al."createdAt" AS data_mudanca_raw, -- Mantém original para ordenação
    al."userId",
    u.name AS usuario_nome,
    u.email AS usuario_email,
    al."oldData",
    al."newData"
FROM pinovara.audit_logs al
LEFT JOIN pinovara.organizacao o ON al."entityId"::integer = o.id
LEFT JOIN pinovara.users u ON al."userId" = u.id
WHERE al.entity = 'organizacao' 
    AND (
        al.action LIKE '%validacao%' 
        OR al.action LIKE '%validation%' 
        OR al."newData"::text LIKE '%validacao_status%'
        OR al."oldData"::text LIKE '%validacao_status%'
    )
ORDER BY al."createdAt" DESC
LIMIT 200;

-- ============================================================================
-- QUERY 4: Listagem Completa com Primeira Aprovação (se houver histórico)
-- Busca a primeira vez que cada organização foi aprovada (status = 2)
-- ============================================================================

SELECT 
    o.id,
    o.nome,
    -- Data de criação - formato BR
    TO_CHAR(o._creation_date, 'DD/MM/YYYY HH24:MI') AS data_criacao,
    o._creation_date AS data_criacao_raw, -- Mantém original para ordenação
    
    -- Primeira alteração de status - formato BR
    TO_CHAR(o.validacao_data, 'DD/MM/YYYY HH24:MI') AS primeira_alteracao_status,
    o.validacao_data AS primeira_alteracao_status_raw, -- Mantém original para ordenação
    
    -- Buscar primeira aprovação do audit_logs - formato BR
    TO_CHAR((
        SELECT MIN(al."createdAt")
        FROM pinovara.audit_logs al
        WHERE al.entity = 'organizacao'
            AND al."entityId"::text = o.id::text
            AND (
                al."newData"::text LIKE '%"validacao_status":2%'
                OR al."newData"::text LIKE '%validacao_status": 2%'
                OR (al."newData"::jsonb->>'validacao_status')::integer = 2
            )
    ), 'DD/MM/YYYY HH24:MI') AS primeira_data_aprovacao,
    (
        SELECT MIN(al."createdAt")
        FROM pinovara.audit_logs al
        WHERE al.entity = 'organizacao'
            AND al."entityId"::text = o.id::text
            AND (
                al."newData"::text LIKE '%"validacao_status":2%'
                OR al."newData"::text LIKE '%validacao_status": 2%'
                OR (al."newData"::jsonb->>'validacao_status')::integer = 2
            )
    ) AS primeira_data_aprovacao_raw, -- Mantém original para ordenação
    
    -- Status atual
    o.validacao_status,
    CASE 
        WHEN o.validacao_status = 1 THEN 'NÃO VALIDADO'
        WHEN o.validacao_status = 2 THEN 'VALIDADO'
        WHEN o.validacao_status = 3 THEN 'PENDÊNCIA'
        WHEN o.validacao_status = 4 THEN 'REPROVADO'
        ELSE 'NÃO DEFINIDO'
    END AS status_label
    
FROM pinovara.organizacao o
WHERE (o.removido = false OR o.removido IS NULL)
ORDER BY o.id
LIMIT 100;

