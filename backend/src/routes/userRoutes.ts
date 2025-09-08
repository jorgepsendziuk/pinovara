import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

/**
 * @route GET /users
 * @desc Obter todos os usuários
 * @access Public
 */
router.get('/',
  userController.getAllUsers
);

/**
 * @route GET /users/:id
 * @desc Obter usuário por ID
 * @access Public
 */
router.get('/:id',
  userController.getUserById
);

/**
 * @route PUT /users/:id/status
 * @desc Ativar/desativar usuário
 * @access Public
 * @body { active: boolean }
 */
router.put('/:id/status',
  userController.updateUserStatus
);

/**
 * @route POST /users/:id/roles
 * @desc Atribuir papel a usuário
 * @access Public
 * @body { roleId: string }
 */
router.post('/:id/roles',
  userController.assignRole
);

/**
 * @route DELETE /users/:id/roles/:roleId
 * @desc Remover papel de usuário
 * @access Public
 */
router.delete('/:id/roles/:roleId',
  userController.removeRole
);

export default router;