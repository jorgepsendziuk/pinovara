/**
 * Script: Criar Role Coordenador e Usuário Mariana Costa
 * 
 * Este script cria:
 * 1. Role "coordenador" no módulo "organizacoes"
 * 2. Usuário Mariana Costa (mariana.mariana.colaborador@incra.gov.br)
 * 3. Atribui a role ao usuário
 * 
 * Executar via endpoint: POST /api/admin/create-coordenador-role
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface Result {
  success: boolean;
  message: string;
  details: {
    moduloId?: number;
    roleId?: number;
    userId?: number;
    roleJaExistia: boolean;
    usuarioJaExistia: boolean;
  };
}

export async function createCoordenadorRole(): Promise<Result> {
  const result: Result = {
    success: false,
    message: '',
    details: {
      roleJaExistia: false,
      usuarioJaExistia: false,
    },
  };

  try {
    console.log('🚀 Iniciando criação de role coordenador...');

    // 1. Buscar ou criar módulo "organizacoes"
    let modulo = await prisma.modules.findUnique({
      where: { name: 'organizacoes' },
    });

    if (!modulo) {
      console.log('📦 Criando módulo "organizacoes"...');
      modulo = await prisma.modules.create({
        data: {
          name: 'organizacoes',
          description: 'Gestão de Organizações',
          active: true,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Módulo criado (ID: ${modulo.id})`);
    } else {
      console.log(`✅ Módulo "organizacoes" já existe (ID: ${modulo.id})`);
    }

    result.details.moduloId = modulo.id;

    // 2. Buscar ou criar role "coordenador"
    let role = await prisma.roles.findFirst({
      where: {
        name: 'coordenador',
        moduleId: modulo.id,
      },
    });

    if (!role) {
      console.log('👥 Criando role "coordenador"...');
      role = await prisma.roles.create({
        data: {
          name: 'coordenador',
          description: 'Coordenador - Visualização de todas organizações sem permissão de edição',
          moduleId: modulo.id,
          active: true,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Role criada (ID: ${role.id})`);
    } else {
      console.log(`✅ Role "coordenador" já existe (ID: ${role.id})`);
      result.details.roleJaExistia = true;
    }

    result.details.roleId = role.id;

    // 3. Buscar ou criar usuário Mariana Costa
    const email = 'mariana.mariana.colaborador@incra.gov.br';
    const nome = 'Mariana Costa';
    const senha = '[SENHA_REMOVIDA_DO_HISTORICO]';

    let usuario = await prisma.users.findUnique({
      where: { email },
    });

    if (!usuario) {
      console.log(`👤 Criando usuário "${nome}"...`);
      const hashedPassword = await bcrypt.hash(senha, 12);
      
      usuario = await prisma.users.create({
        data: {
          email,
          name: nome,
          password: hashedPassword,
          active: true,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Usuário criado (ID: ${usuario.id})`);
      console.log(`   Email: ${email}`);
      console.log(`   Senha: ${senha}`);
    } else {
      console.log(`✅ Usuário "${nome}" já existe (ID: ${usuario.id})`);
      result.details.usuarioJaExistia = true;
    }

    result.details.userId = usuario.id;

    // 4. Verificar se user_role já existe
    const userRoleExistente = await prisma.user_roles.findFirst({
      where: {
        userId: usuario.id,
        roleId: role.id,
      },
    });

    if (!userRoleExistente) {
      console.log(`🔗 Atribuindo role "coordenador" ao usuário...`);
      await prisma.user_roles.create({
        data: {
          userId: usuario.id,
          roleId: role.id,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Role atribuída com sucesso!`);
    } else {
      console.log(`✅ Usuário já possui a role "coordenador"`);
    }

    result.success = true;
    result.message = `Role coordenador configurada com sucesso! Usuário: ${nome} (${email})`;

    console.log('\n✨ Configuração concluída:');
    console.log(`   Módulo: organizacoes (ID: ${modulo.id})`);
    console.log(`   Role: coordenador (ID: ${role.id})`);
    console.log(`   Usuário: ${nome} (ID: ${usuario.id})`);
    console.log(`   Email: ${email}`);
    if (!result.details.usuarioJaExistia) {
      console.log(`   Senha: ${senha}`);
    }

    return result;

  } catch (error) {
    console.error('❌ Erro ao criar role coordenador:', error);
    result.success = false;
    result.message = `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Permitir execução direta via CLI
if (require.main === module) {
  createCoordenadorRole()
    .then((result) => {
      console.log('\n' + result.message);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Falha na execução:', error);
      process.exit(1);
    });
}

