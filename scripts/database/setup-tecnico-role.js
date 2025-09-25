#!/usr/bin/env node

/**
 * Script para criar a role de "técnico" no sistema PINOVARA
 * 
 * Este script:
 * 1. Verifica se o módulo "organizacoes" existe
 * 2. Cria a role "tecnico" no módulo organizacoes
 * 3. Configura as permissões adequadas
 */

const { PrismaClient } = require('@prisma/client');

async function setupTecnicoRole() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Configurando role de Técnico...\n');

    // 1. Verificar/Criar módulo "organizacoes"
    console.log('📋 Verificando módulo "organizacoes"...');
    let organizacoesModule = await prisma.modules.findFirst({
      where: { name: 'organizacoes' }
    });

    if (!organizacoesModule) {
      console.log('📦 Criando módulo "organizacoes"...');
      organizacoesModule = await prisma.modules.create({
        data: {
          name: 'organizacoes',
          description: 'Módulo de gerenciamento de organizações',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Módulo "organizacoes" criado com ID:', organizacoesModule.id);
    } else {
      console.log('✅ Módulo "organizacoes" já existe (ID:', organizacoesModule.id + ')');
    }

    // 2. Verificar/Criar role "tecnico"
    console.log('\n👷 Verificando role "tecnico"...');
    let tecnicoRole = await prisma.roles.findFirst({
      where: { 
        name: 'tecnico',
        moduleId: organizacoesModule.id
      }
    });

    if (!tecnicoRole) {
      console.log('🛠️ Criando role "tecnico"...');
      tecnicoRole = await prisma.roles.create({
        data: {
          name: 'tecnico',
          description: 'Técnico de campo - Acesso limitado às organizações criadas por ele',
          moduleId: organizacoesModule.id,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Role "tecnico" criada com ID:', tecnicoRole.id);
    } else {
      console.log('✅ Role "tecnico" já existe (ID:', tecnicoRole.id + ')');
    }

    // 3. Mostrar resumo das roles do sistema
    console.log('\n📊 Resumo das Roles do Sistema:');
    const allRoles = await prisma.roles.findMany({
      include: {
        modules: true,
        user_roles: true
      },
      orderBy: [
        { modules: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const rolesByModule = {};
    for (const role of allRoles) {
      const moduleName = role.modules.name;
      if (!rolesByModule[moduleName]) {
        rolesByModule[moduleName] = [];
      }
      rolesByModule[moduleName].push({
        name: role.name,
        description: role.description,
        users: role.user_roles.length,
        active: role.active
      });
    }

    for (const [moduleName, roles] of Object.entries(rolesByModule)) {
      console.log(`\n🏷️  Módulo: ${moduleName}`);
      for (const role of roles) {
        const status = role.active ? '✅' : '❌';
        console.log(`   ${status} ${role.name} (${role.users} usuários) - ${role.description}`);
      }
    }

    // 4. Instruções para uso
    console.log('\n📋 INSTRUÇÕES PARA USO DA ROLE TÉCNICO:');
    console.log('');
    console.log('1. Para atribuir a role a um usuário via Admin:');
    console.log('   - Acesse o painel administrativo');
    console.log('   - Vá em "Usuários" > "Gerenciar Papéis"');
    console.log('   - Selecione a role "tecnico" do módulo "organizacoes"');
    console.log('');
    console.log('2. Como funciona:');
    console.log('   - Técnicos só veem organizações que eles criaram');
    console.log('   - Quando um técnico cria uma organização, o id_tecnico é automaticamente definido');
    console.log('   - Técnicos não podem acessar organizações de outros técnicos');
    console.log('   - Administradores continuam com acesso total');
    console.log('');
    console.log('3. Para atribuir manualmente via SQL (exemplo):');
    console.log(`   INSERT INTO pinovara.user_roles (user_id, role_id, created_at, updated_at)`);
    console.log(`   VALUES ([USER_ID], ${tecnicoRole.id}, NOW(), NOW());`);
    console.log('');
    
    console.log('🚀 Setup da role Técnico concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao configurar role de técnico:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script se chamado diretamente
if (require.main === module) {
  setupTecnicoRole()
    .then(() => {
      console.log('\n✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha na execução do script:', error);
      process.exit(1);
    });
}

module.exports = { setupTecnicoRole };
