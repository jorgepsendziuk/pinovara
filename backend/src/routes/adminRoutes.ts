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

export default router;
