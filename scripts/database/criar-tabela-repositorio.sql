-- Script para criar tabela de repositório público
-- Data: 16 de outubro de 2025
-- Descrição: Repositório onde todos podem visualizar e apenas admin/coordenador/supervisor podem enviar

-- 1. Criar tabela repositorio_publico
CREATE TABLE IF NOT EXISTS pinovara.repositorio_publico (
  id SERIAL PRIMARY KEY,
  nome_arquivo VARCHAR(255) NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  caminho_arquivo VARCHAR(500) NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  extensao VARCHAR(10) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) DEFAULT 'geral',
  tags TEXT[], -- Array de tags para categorização
  usuario_upload VARCHAR(255) NOT NULL, -- Email do usuário que fez upload
  usuario_upload_id INTEGER REFERENCES pinovara.users(id),
  ativo BOOLEAN DEFAULT true,
  downloads INTEGER DEFAULT 0, -- Contador de downloads
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_repositorio_publico_ativo ON pinovara.repositorio_publico(ativo);
CREATE INDEX IF NOT EXISTS idx_repositorio_publico_categoria ON pinovara.repositorio_publico(categoria);
CREATE INDEX IF NOT EXISTS idx_repositorio_publico_usuario ON pinovara.repositorio_publico(usuario_upload_id);
CREATE INDEX IF NOT EXISTS idx_repositorio_publico_created_at ON pinovara.repositorio_publico(created_at);

-- 3. Adicionar comentários na tabela
COMMENT ON TABLE pinovara.repositorio_publico IS 'Repositório público de arquivos - todos podem visualizar, apenas admin/coordenador/supervisor podem enviar';
COMMENT ON COLUMN pinovara.repositorio_publico.nome_arquivo IS 'Nome do arquivo no sistema (com timestamp)';
COMMENT ON COLUMN pinovara.repositorio_publico.nome_original IS 'Nome original do arquivo enviado pelo usuário';
COMMENT ON COLUMN pinovara.repositorio_publico.caminho_arquivo IS 'Caminho completo do arquivo no servidor';
COMMENT ON COLUMN pinovara.repositorio_publico.tamanho_bytes IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN pinovara.repositorio_publico.tipo_mime IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN pinovara.repositorio_publico.extensao IS 'Extensão do arquivo (ex: .pdf, .jpg)';
COMMENT ON COLUMN pinovara.repositorio_publico.descricao IS 'Descrição opcional do arquivo';
COMMENT ON COLUMN pinovara.repositorio_publico.categoria IS 'Categoria do arquivo (geral, documentos, imagens, etc)';
COMMENT ON COLUMN pinovara.repositorio_publico.tags IS 'Array de tags para facilitar busca';
COMMENT ON COLUMN pinovara.repositorio_publico.usuario_upload IS 'Email do usuário que fez o upload';
COMMENT ON COLUMN pinovara.repositorio_publico.usuario_upload_id IS 'ID do usuário que fez o upload';
COMMENT ON COLUMN pinovara.repositorio_publico.ativo IS 'Se o arquivo está ativo (não deletado)';
COMMENT ON COLUMN pinovara.repositorio_publico.downloads IS 'Contador de downloads do arquivo';

-- 4. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION pinovara.update_repositorio_publico_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_repositorio_publico_updated_at
  BEFORE UPDATE ON pinovara.repositorio_publico
  FOR EACH ROW
  EXECUTE FUNCTION pinovara.update_repositorio_publico_updated_at();

-- 5. Inserir algumas categorias padrão (se não existirem)
-- As categorias serão gerenciadas via código, mas podemos ter algumas padrão
-- Não precisamos de tabela separada, usaremos valores fixos no código

-- 6. Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'pinovara' 
  AND table_name = 'repositorio_publico'
ORDER BY ordinal_position;




