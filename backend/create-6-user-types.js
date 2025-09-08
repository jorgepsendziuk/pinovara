const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUserTypes() {
  console.log('👥 Criando apenas os 6 tipos principais de usuário...\n');

  try {
    // Criar um módulo especial para os tipos de usuário
    const userTypesModule = await prisma.module.upsert({
      where: { name: 'user_types' },
      update: {
        description: 'Módulo especial para definição dos tipos de usuário e suas permissões'
      },
      create: {
        name: 'user_types',
        description: 'Módulo especial para definição dos tipos de usuário e suas permissões'
      }
    });

    console.log(`✅ Módulo especial criado: ${userTypesModule.name} (ID: ${userTypesModule.id})`);

    // Criar apenas os 6 tipos de usuário
    const userTypes = [
      {
        name: 'tecnico',
        description: 'Técnico de campo - acesso ao módulo de técnicos',
        permissions: ['tecnicos']
      },
      {
        name: 'pesquisa',
        description: 'Pesquisador - acesso aos módulos de pesquisa, dashboard, diagnóstico, relatórios, mapas (visualização)',
        permissions: ['pesquisa', 'dashboard', 'diagnostico', 'relatorios', 'mapas']
      },
      {
        name: 'associados',
        description: 'Gestor de associados - acesso ao módulo de associados',
        permissions: ['associados']
      },
      {
        name: 'administracao',
        description: 'Administrador - acesso total a todos os módulos',
        permissions: ['*'] // * significa todos os módulos
      },
      {
        name: 'gestao',
        description: 'Gestor - visualização de todos os módulos',
        permissions: ['*'] // * significa todos os módulos
      },
      {
        name: 'geoprocessamento',
        description: 'Geoprocessador - edição de mapas e visualização de dados geoespaciais',
        permissions: ['mapas', 'dashboard', 'diagnostico', 'relatorios']
      }
    ];

    console.log('\n🏷️ Criando os 6 tipos de usuário:');

    for (const userType of userTypes) {
      const role = await prisma.role.create({
        data: {
          name: userType.name,
          description: userType.description,
          moduleId: userTypesModule.id,
        },
      });

      console.log(`✅ ${role.name}: ${role.description}`);
      console.log(`   📋 Permissões: [${userType.permissions.join(', ')}]`);
    }

    console.log('\n🎯 Resumo dos tipos criados:');
    console.log('1. 👷 TÉCNICO - acesso: técnicos');
    console.log('2. 🔬 PESQUISA - acesso: pesquisa, dashboard, diagnóstico, relatórios, mapas');
    console.log('3. 👥 ASSOCIADOS - acesso: associados');
    console.log('4. ⚙️ ADMINISTRAÇÃO - acesso: TODOS os módulos');
    console.log('5. 📊 GESTÃO - acesso: TODOS os módulos (visualização)');
    console.log('6. 🗺️ GEOPROCESSAMENTO - acesso: mapas (edição) + dashboard, diagnóstico, relatórios');

    console.log('\n📊 Verificando criação:');
    const totalRoles = await prisma.role.count();
    console.log(`✅ Total de roles criados: ${totalRoles} (deveria ser 6)`);

  } catch (error) {
    console.error('❌ Erro ao criar tipos de usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserTypes();
