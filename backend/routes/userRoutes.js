"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
/**
 * @route GET /users
 * @desc Obter todos os usuários
 * @access Public
 */
router.get('/', userController_1.userController.getAllUsers);
/**
 * @route GET /users/:id
 * @desc Obter usuário por ID
 * @access Public
 */
router.get('/:id', userController_1.userController.getUserById);
/**
 * @route PUT /users/:id/status
 * @desc Ativar/desativar usuário
 * @access Public
 * @body { active: boolean }
 */
router.put('/:id/status', userController_1.userController.updateUserStatus);
/**
 * @route POST /users/:id/roles
 * @desc Atribuir papel a usuário
 * @access Public
 * @body { roleId: string }
 */
router.post('/:id/roles', userController_1.userController.assignRole);
/**
 * @route DELETE /users/:id/roles/:roleId
 * @desc Remover papel de usuário
 * @access Public
 */
router.delete('/:id/roles/:roleId', userController_1.userController.removeRole);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map