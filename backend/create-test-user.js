const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Criando usuário de teste...');

    // Hash da senha
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Usuário Teste',
        active: true,
      },
    });

    console.log('✅ Usuário criado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
    });

    // Verificar se foi criado
    const userCount = await prisma.user.count();
    console.log('👥 Total de usuários:', userCount);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
