const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUserRoles() {
  console.log('👥 Criando roles de usuários corretamente...\n');

  try {
    // Buscar módulos existentes
    const modules = await prisma.module.findMany();
    console.log('📦 Módulos encontrados:', modules.map(m => `${m.name} (ID: ${m.id})`));

    // Criar roles para cada tipo de usuário

    // 1. TÉCNICO - só acessa módulo de técnicos
    console.log('\n👷 Criando role TÉCNICO...');
    const tecnicoModule = modules.find(m => m.name === 'tecnicos');
    if (tecnicoModule) {
      await prisma.role.create({
        data: {
          name: 'tecnico',
          description: 'Acesso ao módulo de técnicos para gestão de campo',
          moduleId: tecnicoModule.id,
        },
      });
      console.log('✅ Role "tecnico" criado');
    }

    // 2. PESQUISA - acessa pesquisa, dashboard, diagnóstico, relatórios, mapas (visualização)
    console.log('\n🔬 Criando roles PESQUISA...');
    const pesquisaModules = ['pesquisa', 'dashboard', 'diagnostico', 'relatorios', 'mapas'];

    for (const moduleName of pesquisaModules) {
      const module = modules.find(m => m.name === moduleName);
      if (module) {
        await prisma.role.create({
          data: {
            name: 'pesquisa',
            description: `Acesso de visualização ao módulo ${moduleName}`,
            moduleId: module.id,
          },
        });
        console.log(`✅ Role "pesquisa" criado para módulo "${moduleName}"`);
      }
    }

    // 3. ASSOCIADOS - cadastro de pessoas associadas ligadas às organizações
    console.log('\n👥 Criando role ASSOCIADOS...');
    const associadosModule = modules.find(m => m.name === 'associados');
    if (associadosModule) {
      await prisma.role.create({
        data: {
          name: 'associados',
          description: 'Cadastro de pessoas associadas ligadas às organizações',
          moduleId: associadosModule.id,
        },
      });
      console.log('✅ Role "associados" criado');
    }

    // 4. ADMINISTRAÇÃO - cria usuários, acessa tudo, pode editar tudo
    console.log('\n⚙️ Criando roles ADMINISTRAÇÃO...');
    for (const module of modules) {
      await prisma.role.create({
        data: {
          name: 'admin',
          description: `Acesso administrativo total ao módulo ${module.name}`,
          moduleId: module.id,
        },
      });
      console.log(`✅ Role "admin" criado para módulo "${module.name}"`);
    }

    // 5. GESTÃO - visualiza tudo (visualização)
    console.log('\n📊 Criando roles GESTÃO...');
    for (const module of modules) {
      await prisma.role.create({
        data: {
          name: 'gestao',
          description: `Acesso de visualização ao módulo ${module.name}`,
          moduleId: module.id,
        },
      });
      console.log(`✅ Role "gestao" criado para módulo "${module.name}"`);
    }

    // 6. GEOPROCESSAMENTO - acessa e edita módulo de mapas, visualiza outros
    console.log('\n🗺️ Criando roles GEOPROCESSAMENTO...');
    const mapasModule = modules.find(m => m.name === 'mapas');
    if (mapasModule) {
      await prisma.role.create({
        data: {
          name: 'geoprocessamento',
          description: 'Acesso de edição ao módulo de mapas e entidades geoespaciais',
          moduleId: mapasModule.id,
        },
      });
      console.log('✅ Role "geoprocessamento" criado para mapas');
    }

    // Geoprocessamento também visualiza dashboard, diagnóstico, relatórios
    const geoViewModules = ['dashboard', 'diagnostico', 'relatorios'];
    for (const moduleName of geoViewModules) {
      const module = modules.find(m => m.name === moduleName);
      if (module) {
        await prisma.role.create({
          data: {
            name: 'geoprocessamento',
            description: `Acesso de visualização ao módulo ${moduleName}`,
            moduleId: module.id,
          },
        });
        console.log(`✅ Role "geoprocessamento" (visualização) criado para "${moduleName}"`);
      }
    }

    console.log('\n🎉 Todos os roles foram criados com sucesso!');
    console.log('\n📋 Resumo dos tipos de usuários criados:');
    console.log('👷 TÉCNICO: acesso ao módulo técnicos');
    console.log('🔬 PESQUISA: acesso visualização a pesquisa, dashboard, diagnóstico, relatórios, mapas');
    console.log('👥 ASSOCIADOS: acesso ao módulo associados');
    console.log('⚙️ ADMINISTRAÇÃO: acesso total a todos os módulos');
    console.log('📊 GESTÃO: acesso visualização a todos os módulos');
    console.log('🗺️ GEOPROCESSAMENTO: acesso edição a mapas, visualização a dashboard, diagnóstico, relatórios');

  } catch (error) {
    console.error('❌ Erro ao criar roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserRoles();
