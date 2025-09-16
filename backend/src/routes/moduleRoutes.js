"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moduleController_1 = require("../controllers/moduleController");
const router = (0, express_1.Router)();
// Rotas de Módulos
/**
 * @route POST /modules
 * @desc Criar novo módulo
 * @access Public
 * @body { name: string, description?: string }
 */
router.post('/', moduleController_1.moduleController.createModule);
// Rotas de Papéis (devem vir primeiro para não conflitar com :id)
/**
* @route POST /modules/roles
* @desc Criar novo papel
* @access Public
* @body { name: string, description?: string, moduleId: string }
*/
router.post('/roles', moduleController_1.moduleController.createRole);
/**
 * @route GET /modules/roles
 * @desc Obter todos os papéis
 * @access Public
 */
router.get('/roles', moduleController_1.moduleController.getAllRoles);
/**
 * @route GET /modules/roles/:id
 * @desc Obter papel por ID
 * @access Public
 */
router.get('/roles/:id', moduleController_1.moduleController.getRoleById);
/**
 * @route PUT /modules/roles/:id
 * @desc Atualizar papel
 * @access Public
 * @body { name?: string, description?: string }
 */
router.put('/roles/:id', moduleController_1.moduleController.updateRole);
/**
 * @route DELETE /modules/roles/:id
 * @desc Excluir papel
 * @access Public
 */
router.delete('/roles/:id', moduleController_1.moduleController.deleteRole);
// Rotas de Módulos
/**
 * @route POST /modules
 * @desc Criar novo módulo
 * @access Public
 * @body { name: string, description?: string }
 */
router.post('/', moduleController_1.moduleController.createModule);
/**
 * @route GET /modules
 * @desc Obter todos os módulos
 * @access Public
 */
router.get('/', moduleController_1.moduleController.getAllModules);
/**
 * @route GET /modules/:id
 * @desc Obter módulo por ID
 * @access Public
 */
router.get('/:id', moduleController_1.moduleController.getModuleById);
/**
 * @route PUT /modules/:id
 * @desc Atualizar módulo
 * @access Public
 * @body { name?: string, description?: string }
 */
router.put('/:id', moduleController_1.moduleController.updateModule);
/**
 * @route DELETE /modules/:id
 * @desc Excluir módulo
 * @access Public
 */
router.delete('/:id', moduleController_1.moduleController.deleteModule);
exports.default = router;
//# sourceMappingURL=moduleRoutes.js.map