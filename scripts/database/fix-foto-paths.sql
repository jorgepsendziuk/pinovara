-- ============================================================================
-- REMOVER PREFIXO "fotos/" DA COLUNA FOTO
-- ============================================================================

-- Ver quantos registros têm o prefixo
SELECT 
  COUNT(*) as total_com_prefixo,
  COUNT(CASE WHEN foto LIKE 'fotos/%' THEN 1 END) as com_fotos_prefixo
FROM pinovara.organizacao_foto
WHERE foto IS NOT NULL;

-- Ver alguns exemplos antes
SELECT id, foto, REPLACE(foto, 'fotos/', '') as foto_corrigida
FROM pinovara.organizacao_foto
WHERE foto LIKE 'fotos/%'
LIMIT 5;

-- EXECUTAR A CORREÇÃO
UPDATE pinovara.organizacao_foto
SET 
  foto = REPLACE(foto, 'fotos/', ''),
  last_update_date = NOW()
WHERE foto LIKE 'fotos/%';

-- Verificar resultado
SELECT 
  COUNT(*) as total_corrigidos
FROM pinovara.organizacao_foto
WHERE foto NOT LIKE 'fotos/%' AND foto IS NOT NULL;

-- Ver exemplos após correção
SELECT id, foto
FROM pinovara.organizacao_foto
WHERE foto IS NOT NULL
ORDER BY id DESC
LIMIT 5;

