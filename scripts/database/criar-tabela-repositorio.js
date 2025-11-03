const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function criarTabelaRepositorio() {
  try {
    console.log('🚀 Criando tabela repositorio_publico...');

    // 1. Criar tabela
    console.log('📋 Criando tabela...');
    await prisma.$executeRawUnsafe(`
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
        tags TEXT[],
        usuario_upload VARCHAR(255) NOT NULL,
        usuario_upload_id INTEGER REFERENCES pinovara.users(id),
        ativo BOOLEAN DEFAULT true,
        downloads INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Criar índices
    console.log('📊 Criando índices...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_repositorio_publico_ativo ON pinovara.repositorio_publico(ativo);',
      'CREATE INDEX IF NOT EXISTS idx_repositorio_publico_categoria ON pinovara.repositorio_publico(categoria);',
      'CREATE INDEX IF NOT EXISTS idx_repositorio_publico_usuario ON pinovara.repositorio_publico(usuario_upload_id);',
      'CREATE INDEX IF NOT EXISTS idx_repositorio_publico_created_at ON pinovara.repositorio_publico(created_at);'
    ];

    for (const indice of indices) {
      await prisma.$executeRawUnsafe(indice);
    }

    // 3. Criar função de trigger
    console.log('⚙️ Criando função de trigger...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION pinovara.update_repositorio_publico_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 4. Criar trigger
    console.log('🔗 Criando trigger...');
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS trigger_update_repositorio_publico_updated_at ON pinovara.repositorio_publico;
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trigger_update_repositorio_publico_updated_at
        BEFORE UPDATE ON pinovara.repositorio_publico
        FOR EACH ROW
        EXECUTE FUNCTION pinovara.update_repositorio_publico_updated_at();
    `);

    console.log('✅ Tabela repositorio_publico criada com sucesso!');

    // Verificar se a tabela foi criada
    const verificarTabela = await prisma.$queryRaw`
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
    `;

    console.log('📋 Estrutura da tabela criada:');
    console.table(verificarTabela);

  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarTabelaRepositorio()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { criarTabelaRepositorio };
