-- Migration: Adicionar campo plano_gestao_rascunho à tabela organizacao
-- Data: 2025-11-04
-- Descrição: Campo para notas colaborativas do Plano de Gestão

-- Adicionar coluna plano_gestao_rascunho
ALTER TABLE pinovara.organizacao 
ADD COLUMN plano_gestao_rascunho TEXT;

-- Comentário da coluna
COMMENT ON COLUMN pinovara.organizacao.plano_gestao_rascunho IS 
'Rascunho e notas colaborativas para discussão do Plano de Gestão. Editável por Técnicos, Supervisores, Coordenadores e Administradores.';

