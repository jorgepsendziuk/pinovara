import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import adminController from '../controllers/adminController';

const router = Router();

// Aplicar autenticação e autorização admin a todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// ========== USER MANAGEMENT ROUTES ==========

/**
 * GET /admin/users
 * Listar todos os usuários com suas roles
 */
router.get('/users', adminController.getUsers);

/**
 * GET /admin/users/:id
 * Buscar usuário específico por ID
 */
router.get('/users/:id', adminController.getUser);

/**
 * POST /admin/users
 * Criar novo usuário
 * 
 * Body: {
 *   email: string,
 *   password: string,
 *   name: string,
 *   active?: boolean
 * }
 */
router.post('/users', adminController.createUser);

/**
 * PUT /admin/users/:id
 * Atualizar usuário existente
 * 
 * Body: {
 *   email?: string,
 *   name?: string,
 *   active?: boolean,
 *   password?: string
 * }
 */
router.put('/users/:id', adminController.updateUser);

/**
 * DELETE /admin/users/:id
 * Deletar usuário
 * Nota: Não é possível deletar seu próprio usuário
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * PUT /admin/users/:id/status
 * Atualizar status do usuário (ativo/inativo)
 * 
 * Body: { active: boolean }
 */
router.put('/users/:id/status', adminController.updateUserStatus);

// ========== ROLE MANAGEMENT ROUTES ==========

/**
 * GET /admin/roles
 * Listar todas as roles disponíveis
 */
router.get('/roles', adminController.getRoles);

/**
 * POST /admin/users/:id/roles
 * Atribuir role a um usuário
 * 
 * Body: { roleId: number }
 */
router.post('/users/:id/roles', adminController.assignRole);

/**
 * DELETE /admin/users/:id/roles/:roleId
 * Remover role de um usuário
 */
router.delete('/users/:id/roles/:roleId', adminController.removeRole);

// ========== ADMIN INFO ROUTES ==========

/**
 * GET /admin/stats
 * Estatísticas gerais do sistema (admin dashboard)
 */
router.get('/stats', async (req, res) => {
  try {
    // Esta rota pode ser expandida no futuro
    res.json({
      success: true,
      message: 'Estatísticas administrativas',
      data: {
        message: 'Endpoint disponível para estatísticas futuras'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [AdminRoutes] Error in /stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        statusCode: 500
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /admin/system-info
 * Informações detalhadas do sistema para o painel administrativo
 */
router.get('/system-info', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Verificar conexão com banco de dados
    let dbStatus = 'connected';
    let userCount = 0;
    let orgCount = 0;
    let dbError = null;

    try {
      await prisma.$queryRaw`SELECT 1`;
      userCount = await prisma.users.count();
      orgCount = await prisma.organizacao.count();
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : 'Database connection failed';
    } finally {
      await prisma.$disconnect();
    }

    const systemInfo = {
      database: {
        status: dbStatus,
        lastCheck: new Date().toISOString(),
        error: dbError
      },
      users: {
        total: userCount,
        active: userCount // Por simplicidade, consideramos todos ativos por agora
      },
      organizations: {
        total: orgCount
      },
      system: {
        version: process.env.npm_package_version || '2.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: systemInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [AdminRoutes] Error in /system-info:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro ao obter informações do sistema',
        statusCode: 500
      },
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
