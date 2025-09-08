import { Router } from 'express';
import { moduleController } from '../controllers/moduleController';

const router = Router();

// Rotas de Módulos
/**
 * @route POST /modules
 * @desc Criar novo módulo
 * @access Public
 * @body { name: string, description?: string }
 */
router.post('/',
  moduleController.createModule
);

/**
 * @route GET /modules
 * @desc Obter todos os módulos
 * @access Public
 */
router.get('/',
  moduleController.getAllModules
);

/**
 * @route GET /modules/:id
 * @desc Obter módulo por ID
 * @access Public
 */
router.get('/:id',
  moduleController.getModuleById
);

/**
 * @route PUT /modules/:id
 * @desc Atualizar módulo
 * @access Public
 * @body { name?: string, description?: string }
 */
router.put('/:id',
  moduleController.updateModule
);

/**
 * @route DELETE /modules/:id
 * @desc Excluir módulo
 * @access Public
 */
router.delete('/:id',
  moduleController.deleteModule
);

// Rotas de Papéis
/**
 * @route POST /modules/roles
 * @desc Criar novo papel
 * @access Public
 * @body { name: string, description?: string, moduleId: string }
 */
router.post('/roles',
  moduleController.createRole
);

/**
 * @route GET /modules/roles
 * @desc Obter todos os papéis
 * @access Public
 */
router.get('/roles',
  moduleController.getAllRoles
);

/**
 * @route GET /modules/roles/:id
 * @desc Obter papel por ID
 * @access Public
 */
router.get('/roles/:id',
  moduleController.getRoleById
);

/**
 * @route PUT /modules/roles/:id
 * @desc Atualizar papel
 * @access Public
 * @body { name?: string, description?: string }
 */
router.put('/roles/:id',
  moduleController.updateRole
);

/**
 * @route DELETE /modules/roles/:id
 * @desc Excluir papel
 * @access Public
 */
router.delete('/roles/:id',
  moduleController.deleteRole
);

export default router;