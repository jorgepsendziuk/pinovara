const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
// Using sequential integer IDs

// Load environment variables from config.env
const envPath = path.join(__dirname, '..', 'config.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createAdminUser() {
  try {
    console.log('🚀 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados!');

    console.log('🚀 Iniciando criação do usuário administrador...');

    // 1. Criar ou encontrar o módulo "Sistema"
    console.log('📦 Verificando/criando módulo "Sistema"...');
    
    // First check if module exists
    const moduleCheckResult = await client.query(`
      SELECT id FROM pinovara.modules WHERE name = 'Sistema';
    `);

    let systemModuleId;
    if (moduleCheckResult.rows.length > 0) {
      systemModuleId = moduleCheckResult.rows[0].id;
      console.log(`✅ Módulo "Sistema" já existe com ID: ${systemModuleId}`);
    } else {
      // Get next available ID
      const maxIdResult = await client.query(`
        SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 as next_id FROM pinovara.modules;
      `);
      systemModuleId = maxIdResult.rows[0].next_id.toString();
      
      await client.query(`
        INSERT INTO pinovara.modules (id, name, description, active, "createdAt", "updatedAt")
        VALUES ($1, 'Sistema', 'Módulo principal do sistema com funcionalidades administrativas', true, NOW(), NOW());
      `, [systemModuleId]);
      console.log(`✅ Módulo "Sistema" criado com ID: ${systemModuleId}`);
    }

    // 2. Criar ou encontrar a role "Administrador"
    console.log('👑 Verificando/criando role "Administrador"...');
    
    const roleCheckResult = await client.query(`
      SELECT id FROM pinovara.roles WHERE name = 'Administrador' AND "moduleId" = $1;
    `, [systemModuleId]);

    let adminRoleId;
    if (roleCheckResult.rows.length > 0) {
      adminRoleId = roleCheckResult.rows[0].id;
      console.log(`✅ Role "Administrador" já existe com ID: ${adminRoleId}`);
    } else {
      // Get next available ID
      const maxRoleIdResult = await client.query(`
        SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 as next_id FROM pinovara.roles;
      `);
      adminRoleId = maxRoleIdResult.rows[0].next_id.toString();
      
      await client.query(`
        INSERT INTO pinovara.roles (id, name, description, "moduleId", active, "createdAt", "updatedAt")
        VALUES ($1, 'Administrador', 'Role com acesso total ao sistema', $2, true, NOW(), NOW());
      `, [adminRoleId, systemModuleId]);
      console.log(`✅ Role "Administrador" criada com ID: ${adminRoleId}`);
    }

    // 3. Verificar se o usuário já existe
    const userResult = await client.query(`
      SELECT id FROM pinovara.users WHERE email = 'olivanrabelo@gmail.com';
    `);

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      console.log('⚠️  Usuário olivanrabelo@gmail.com já existe!');
      
      // Verificar se já tem a role de administrador
      const userRoleResult = await client.query(`
        SELECT id FROM pinovara.user_roles WHERE "userId" = $1 AND "roleId" = $2;
      `, [userId, adminRoleId]);

      if (userRoleResult.rows.length > 0) {
        console.log('✅ Usuário já possui role de Administrador!');
      } else {
        console.log('🔗 Atribuindo role de Administrador ao usuário existente...');
        const maxUserRoleIdResult = await client.query(`
          SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 as next_id FROM pinovara.user_roles;
        `);
        const userRoleId = maxUserRoleIdResult.rows[0].next_id.toString();
        
        await client.query(`
          INSERT INTO pinovara.user_roles (id, "userId", "roleId", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, NOW(), NOW());
        `, [userRoleId, userId, adminRoleId]);
        console.log('✅ Role de Administrador atribuída com sucesso!');
      }
    } else {
      // 4. Hash da senha
      console.log('🔐 Criptografando senha...');
      const hashedPassword = await bcrypt.hash('olivanrabelo@gmail.com', 10);

      // 5. Criar o usuário
      console.log('👤 Criando usuário olivanrabelo@gmail.com...');
      const maxUserIdResult = await client.query(`
        SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 as next_id FROM pinovara.users;
      `);
      const userId = maxUserIdResult.rows[0].next_id.toString();
      
      await client.query(`
        INSERT INTO pinovara.users (id, email, password, name, active, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, true, NOW(), NOW());
      `, [userId, 'olivanrabelo@gmail.com', hashedPassword, 'Olivan Rabelo']);

      // 6. Atribuir role de administrador
      console.log('🔗 Atribuindo role de Administrador...');
      const maxUserRoleIdResult = await client.query(`
        SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 as next_id FROM pinovara.user_roles;
      `);
      const userRoleId = maxUserRoleIdResult.rows[0].next_id.toString();
      
      await client.query(`
        INSERT INTO pinovara.user_roles (id, "userId", "roleId", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW());
      `, [userRoleId, userId, adminRoleId]);

      console.log('✅ Usuário administrador criado com sucesso!');
      console.log(`📧 Email: olivanrabelo@gmail.com`);
      console.log(`🔑 Senha: olivanrabelo@gmail.com`);
      console.log(`👑 Role: Administrador`);
      console.log(`🆔 User ID: ${userId}`);
    }

    console.log('🎉 Processo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Executar o script
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na execução do script:', error);
      process.exit(1);
    });
}

module.exports = { createAdminUser };