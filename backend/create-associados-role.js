const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAssociadosRole() {
  console.log('👥 Criando papel ASSOCIADOS...\n');

  try {
    // Buscar módulo de associados
    const associadosModule = await prisma.module.findUnique({
      where: { name: 'associados' }
    });

    if (!associadosModule) {
      console.log('❌ Módulo "associados" não encontrado');
      return;
    }

    console.log(`✅ Módulo encontrado: ${associadosModule.name} (ID: ${associadosModule.id})`);

    // Criar papel de associados
    const role = await prisma.role.upsert({
      where: { name_moduleId: { name: 'associados', moduleId: associadosModule.id } },
      update: {
        description: 'Cadastro de pessoas associadas ligadas às organizações'
      },
      create: {
        name: 'associados',
        description: 'Cadastro de pessoas associadas ligadas às organizações',
        moduleId: associadosModule.id,
      },
    });

    console.log(`✅ Papel "associados" criado com sucesso no módulo "associados"`);
    console.log(`📋 Descrição: ${role.description}`);

    // Verificar papéis criados
    const allRoles = await prisma.role.findMany({
      where: { moduleId: associadosModule.id },
      include: { module: true }
    });

    console.log('\n📊 Papéis no módulo associados:');
    allRoles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description || 'Sem descrição'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao criar papel associados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAssociadosRole();
