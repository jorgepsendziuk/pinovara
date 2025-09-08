const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createRoles() {
  console.log('🔧 Criando roles de acordo com especificações...\n');

  try {
    // Buscar módulos existentes
    const modules = await prisma.module.findMany();
    console.log('📦 Módulos encontrados:', modules.map(m => `${m.name} (ID: ${m.id})`));

    // Criar roles para cada tipo de usuário

    // 1. TÉCNICO - só acessa módulo de técnicos
    console.log('\n👷 Criando role TÉCNICO...');
    const tecnicoModule = modules.find(m => m.name === 'tecnicos');
    if (tecnicoModule) {
      await prisma.role.upsert({
        where: { name_moduleId: { name: 'tecnico', moduleId: tecnicoModule.id } },
        update: {},
        create: {
          name: 'tecnico',
          moduleId: tecnicoModule.id,
        },
      });
      console.log('✅ Role "tecnico" criado no módulo "tecnicos"');
    }

    // 2. PESQUISA - acessa pesquisa, dashboard, diagnóstico, relatórios, mapas (viewer)
    console.log('\n🔬 Criando roles PESQUISA...');
    const pesquisaModules = ['pesquisa', 'dashboard', 'diagnostico', 'relatorios', 'mapas'];

    for (const moduleName of pesquisaModules) {
      const module = modules.find(m => m.name === moduleName);
      if (module) {
        await prisma.role.upsert({
          where: { name_moduleId: { name: 'pesquisa', moduleId: module.id } },
          update: {},
          create: {
            name: 'pesquisa',
            moduleId: module.id,
          },
        });
        console.log(`✅ Role "pesquisa" criado no módulo "${moduleName}"`);
      }
    }

    // 3. ADMINISTRAÇÃO - cria usuários, acessa tudo, pode editar tudo
    console.log('\n⚙️ Criando roles ADMINISTRAÇÃO...');
    const adminModule = modules.find(m => m.name === 'sistema');
    if (adminModule) {
      await prisma.role.upsert({
        where: { name_moduleId: { name: 'admin', moduleId: adminModule.id } },
        update: {},
        create: {
          name: 'admin',
          moduleId: adminModule.id,
        },
      });
      console.log('✅ Role "admin" criado no módulo "sistema"');
    }

    // ADMIN tem acesso a todos os módulos
    for (const module of modules) {
      await prisma.role.upsert({
        where: { name_moduleId: { name: 'admin', moduleId: module.id } },
        update: {},
        create: {
          name: 'admin',
          moduleId: module.id,
        },
      });
      console.log(`✅ Role "admin" criado no módulo "${module.name}"`);
    }

    // 4. GESTÃO - visualiza tudo (viewer em todos os módulos)
    console.log('\n📊 Criando roles GESTÃO...');
    for (const module of modules) {
      await prisma.role.upsert({
        where: { name_moduleId: { name: 'gestao', moduleId: module.id } },
        update: {},
        create: {
          name: 'gestao',
          moduleId: module.id,
        },
      });
      console.log(`✅ Role "gestao" criado no módulo "${module.name}"`);
    }

    // 5. GEOPROCESSAMENTO - acessa e edita módulo de mapas
    console.log('\n🗺️ Criando roles GEOPROCESSAMENTO...');
    const mapasModule = modules.find(m => m.name === 'mapas');
    if (mapasModule) {
      await prisma.role.upsert({
        where: { name_moduleId: { name: 'geoprocessamento', moduleId: mapasModule.id } },
        update: {},
        create: {
          name: 'geoprocessamento',
          moduleId: mapasModule.id,
        },
      });
      console.log('✅ Role "geoprocessamento" criado no módulo "mapas"');
    }

    // Também dar acesso de visualização aos módulos relacionados
    const geoRelatedModules = ['dashboard', 'diagnostico', 'relatorios'];
    for (const moduleName of geoRelatedModules) {
      const module = modules.find(m => m.name === moduleName);
      if (module) {
        await prisma.role.upsert({
          where: { name_moduleId: { name: 'geoprocessamento', moduleId: module.id } },
          update: {},
          create: {
            name: 'geoprocessamento',
            moduleId: module.id,
          },
        });
        console.log(`✅ Role "geoprocessamento" (viewer) criado no módulo "${moduleName}"`);
      }
    }

    console.log('\n🎉 Todos os roles foram criados com sucesso!');
    console.log('\n📋 Resumo dos roles criados:');
    console.log('👷 TÉCNICO: acesso ao módulo "tecnicos"');
    console.log('🔬 PESQUISA: acesso viewer a pesquisa, dashboard, diagnóstico, relatórios, mapas');
    console.log('⚙️ ADMINISTRAÇÃO: acesso total a todos os módulos (admin)');
    console.log('📊 GESTÃO: acesso viewer a todos os módulos');
    console.log('🗺️ GEOPROCESSAMENTO: acesso editor a mapas, viewer a dashboard, diagnóstico, relatórios');

  } catch (error) {
    console.error('❌ Erro ao criar roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRoles();
