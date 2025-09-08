const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDB() {
  try {
    console.log('🔍 Testando conexão com banco...');

    // Testar conexão básica
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão com banco OK');

    // Verificar se tabelas existem em todos os schemas
    const tables = await prisma.$queryRaw`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name
    `;

    console.log('📋 Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`  ${table.table_schema}.${table.table_name}`);
    });

    // Verificar tabela users especificamente
    try {
      const users = await prisma.$queryRaw`SELECT COUNT(*) as count FROM pinovara.users`;
      console.log('👥 Usuários na tabela pinovara.users:', users[0].count);
    } catch (error) {
      console.log('❌ Tabela pinovara.users não encontrada ou vazia');
    }

    // Tentar usar o Prisma Client normal
    try {
      console.log('🔍 Testando Prisma Client normal...');
      const userCount = await prisma.user.count();
      console.log('👥 Usuários via Prisma Client:', userCount);
    } catch (error) {
      console.log('❌ Erro no Prisma Client:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro no banco:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
