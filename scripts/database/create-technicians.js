#!/usr/bin/env node

/**
 * Script para criar usuários técnicos no sistema PINOVARA
 * 
 * Este script:
 * 1. Cria os usuários técnicos listados
 * 2. Define senha = email para cada usuário
 * 3. Atribui a role de "técnico" automaticamente
 * 4. Ativa os usuários para acesso imediato
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const technicians = [
  {
    name: 'MIQUEAS MARQUES DE LIMA',
    email: 'miqueaslima@estudante.ufscar.br'
  },
  {
    name: 'NILTON CARDOSO DIAS',
    email: 'cardosodiasagroflorestando@gmail.com'
  },
  {
    name: 'LUCIANA MOREIRA PUDENZI',
    email: 'lupudenzi@gmail.com'
  },
  {
    name: 'EVERTON LUIS SOARES',
    email: 'pedrasoares.setordeproducao@gmail.com'
  },
  {
    name: 'CRISTIANE APARECIDA ARRUDA',
    email: 'cristianearrudaapiai@gmail.com'
  },
  {
    name: 'DIANE DAYZE DE PROENÇA',
    email: 'dihzinha14@gmail.com'
  },
  {
    name: 'GABRIELA GOMES NASCIMENTO',
    email: 'gabigomesnas@gmail.com'
  },
  {
    name: 'OZIEL FERNANDO DOS REIS',
    email: 'oziel.fernando@gmail.com'
  },
  {
    name: 'HELEN PALUDETTO FIGARO',
    email: 'helenpaludettofigaro@gmail.com'
  },
  {
    name: 'JOSE ANGELO DA SILVA',
    email: 'zezinhodaagrovila2@gmail.com'
  },
  {
    name: 'WÉLBERTY ROGÉRIO GORDON',
    email: 'welbertygordon@gmail.com'
  },
  {
    name: 'ELIZETE SOUZA DA SILVA',
    email: 'dinha.agronomia@gmail.com'
  },
  {
    name: 'JENIFFER FRANCIELE DE PROENÇA',
    email: 'proencajeni0894@gmail.com'
  },
  {
    name: 'VALMIR ULISSES SEBASTIÃO',
    email: 'valmirulisses@yahoo.com.br'
  }
];

async function createTechnicians() {
  const prisma = new PrismaClient();
  
  try {
    console.log('👨‍🔧 Criando usuários técnicos...\n');

    // 1. Verificar se a role técnico existe
    console.log('🔍 Verificando role de técnico...');
    const tecnicoRole = await prisma.roles.findFirst({
      where: { 
        name: 'tecnico',
        modules: { name: 'organizacoes' }
      },
      include: {
        modules: true
      }
    });

    if (!tecnicoRole) {
      console.error('❌ Role "tecnico" não encontrada! Execute primeiro o script setup-tecnico-role.js');
      process.exit(1);
    }

    console.log(`✅ Role técnico encontrada (ID: ${tecnicoRole.id})\n`);

    // 2. Criar cada usuário técnico
    const results = {
      created: [],
      updated: [],
      errors: [],
      roleAssignments: []
    };

    for (const tech of technicians) {
      try {
        console.log(`👤 Processando: ${tech.name}`);
        console.log(`📧 Email: ${tech.email}`);

        // Verificar se usuário já existe
        let user = await prisma.users.findUnique({
          where: { email: tech.email },
          include: { user_roles: true }
        });

        if (user) {
          console.log(`   ⚠️  Usuário já existe (ID: ${user.id})`);
          results.updated.push({ name: tech.name, email: tech.email, id: user.id });
        } else {
          // Hash da senha (senha = email)
          const hashedPassword = await bcrypt.hash(tech.email, 10);

          // Criar usuário
          user = await prisma.users.create({
            data: {
              name: tech.name,
              email: tech.email,
              password: hashedPassword,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          console.log(`   ✅ Usuário criado (ID: ${user.id})`);
          results.created.push({ name: tech.name, email: tech.email, id: user.id });
        }

        // Verificar se já tem a role de técnico
        const hasRole = await prisma.user_roles.findFirst({
          where: {
            userId: user.id,
            roleId: tecnicoRole.id
          }
        });

        if (!hasRole) {
          // Atribuir role de técnico
          await prisma.user_roles.create({
            data: {
              userId: user.id,
              roleId: tecnicoRole.id,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`   🎭 Role técnico atribuída`);
          results.roleAssignments.push({ name: tech.name, email: tech.email });
        } else {
          console.log(`   ✅ Já possui role técnico`);
        }

        console.log('');

      } catch (error) {
        console.error(`   ❌ Erro ao processar ${tech.name}: ${error.message}`);
        results.errors.push({ name: tech.name, email: tech.email, error: error.message });
        console.log('');
      }
    }

    // 3. Resumo final
    console.log('📊 RESUMO DA OPERAÇÃO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (results.created.length > 0) {
      console.log(`\n✅ USUÁRIOS CRIADOS (${results.created.length}):`);
      results.created.forEach(user => {
        console.log(`   • ${user.name} (${user.email}) - ID: ${user.id}`);
      });
    }

    if (results.updated.length > 0) {
      console.log(`\n⚠️  USUÁRIOS JÁ EXISTIAM (${results.updated.length}):`);
      results.updated.forEach(user => {
        console.log(`   • ${user.name} (${user.email}) - ID: ${user.id}`);
      });
    }

    if (results.roleAssignments.length > 0) {
      console.log(`\n🎭 ROLES TÉCNICO ATRIBUÍDAS (${results.roleAssignments.length}):`);
      results.roleAssignments.forEach(user => {
        console.log(`   • ${user.name}`);
      });
    }

    if (results.errors.length > 0) {
      console.log(`\n❌ ERROS (${results.errors.length}):`);
      results.errors.forEach(error => {
        console.log(`   • ${error.name}: ${error.error}`);
      });
    }

    // 4. Verificar estado final
    console.log('\n📋 VERIFICAÇÃO FINAL:');
    const totalTechnicians = await prisma.user_roles.count({
      where: { roleId: tecnicoRole.id }
    });
    
    console.log(`🔧 Total de técnicos no sistema: ${totalTechnicians}`);

    // 5. Instruções de uso
    console.log('\n💡 INSTRUÇÕES PARA OS TÉCNICOS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: [seu_email_aqui]');
    console.log('🔑 Senha: [mesmo_email]');
    console.log('🌐 URL: http://localhost:5174/ (dev) ou https://pinovaraufba.com.br (prod)');
    console.log('');
    console.log('🚀 Funcionalidades disponíveis:');
    console.log('   • Criar novas organizações');
    console.log('   • Visualizar organizações criadas por ele');
    console.log('   • Editar organizações criadas por ele');
    console.log('   • Dashboard com estatísticas das suas organizações');
    console.log('');
    console.log('❌ Restrições:');
    console.log('   • Não pode ver organizações de outros técnicos');
    console.log('   • Não pode acessar painel administrativo');
    
    console.log('\n🎉 Técnicos criados e configurados com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral na criação dos técnicos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script se chamado diretamente
if (require.main === module) {
  createTechnicians()
    .then(() => {
      console.log('\n✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha na execução do script:', error);
      process.exit(1);
    });
}

module.exports = { createTechnicians };
