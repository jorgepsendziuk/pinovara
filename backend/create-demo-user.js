const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('🔧 Criando usuário de demonstração...');

    // Hash da senha
    const hashedPassword = await bcrypt.hash('Demo123', 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: 'demo@pinovara.com',
        password: hashedPassword,
        name: 'Usuário Demo',
        active: true,
      },
    });

    console.log('✅ Usuário demo criado com sucesso!');
    console.log('📧 Email: demo@pinovara.com');
    console.log('🔑 Senha: Demo123');
    console.log('👤 Nome: Usuário Demo');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Usuário demo já existe');
    } else {
      console.error('❌ Erro ao criar usuário demo:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
