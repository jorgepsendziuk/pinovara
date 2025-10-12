-- Script para remover prefixo "arquivos/" da coluna arquivo na tabela organizacao_arquivo
-- Similar ao fix-foto-paths.sql mas para documentos/arquivos

-- Verificar registros que precisam ser corrigidos
SELECT 
    id,
    arquivo,
    'arquivos/' || arquivo as novo_caminho
FROM pinovara.organizacao_arquivo 
WHERE arquivo LIKE 'arquivos/%'
ORDER BY id;

-- Atualizar registros removendo o prefixo "arquivos/"
UPDATE pinovara.organizacao_arquivo
SET arquivo = REPLACE(arquivo, 'arquivos/', '')
WHERE arquivo LIKE 'arquivos/%';

-- Verificar quantos registros foram atualizados
SELECT COUNT(*) as registros_atualizados
FROM pinovara.organizacao_arquivo 
WHERE arquivo NOT LIKE 'arquivos/%' 
  AND arquivo IS NOT NULL;

-- Mostrar alguns exemplos dos registros corrigidos
SELECT 
    id,
    arquivo,
    obs,
    creation_date
FROM pinovara.organizacao_arquivo 
WHERE arquivo IS NOT NULL
ORDER BY creation_date DESC
LIMIT 10;
