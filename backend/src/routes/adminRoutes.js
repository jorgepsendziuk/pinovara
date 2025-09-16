"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const userController_1 = require("../controllers/userController");
const moduleController_1 = require("../controllers/moduleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticação e verificação de permissão admin a todas as rotas
router.use(authMiddleware_1.authenticateToken);
router.use(authMiddleware_1.requireAdmin);
/**
 * System Information
 */
router.get('/system-info', adminController_1.adminController.getSystemInfo);
/**
 * System Settings Routes
 */
router.get('/settings', adminController_1.adminController.getAllSettings);
router.get('/settings/by-category', adminController_1.adminController.getSettingsByCategory);
router.get('/settings/:key', adminController_1.adminController.getSettingByKey);
router.post('/settings', adminController_1.adminController.createSetting);
router.put('/settings/:key', adminController_1.adminController.updateSetting);
router.delete('/settings/:key', adminController_1.adminController.deleteSetting);
/**
 * Audit Logs Routes
 */
router.get('/audit-logs', adminController_1.adminController.getAllAuditLogs);
router.get('/audit-logs/stats', adminController_1.adminController.getAuditLogStats);
router.get('/audit-logs/:id', adminController_1.adminController.getAuditLogById);
/**
 * User Management Routes (from existing userController)
 */
router.get('/users', userController_1.userController.getAllUsers);
router.get('/users/:id', userController_1.userController.getUserById);
router.put('/users/:id/status', userController_1.userController.updateUserStatus);
router.post('/users/:id/roles', userController_1.userController.assignRole);
router.delete('/users/:id/roles/:roleId', userController_1.userController.removeRole);
router.delete('/users/:id', userController_1.userController.deleteUser);
/**
 * Module & Role Management Routes (from existing moduleController)
 */
// Modules
router.get('/modules', moduleController_1.moduleController.getAllModules);
router.get('/modules/:id', moduleController_1.moduleController.getModuleById);
router.post('/modules', moduleController_1.moduleController.createModule);
router.put('/modules/:id', moduleController_1.moduleController.updateModule);
router.delete('/modules/:id', moduleController_1.moduleController.deleteModule);
// Roles
router.get('/roles', moduleController_1.moduleController.getAllRoles);
router.get('/roles/:id', moduleController_1.moduleController.getRoleById);
router.post('/roles', moduleController_1.moduleController.createRole);
router.put('/roles/:id', moduleController_1.moduleController.updateRole);
router.delete('/roles/:id', moduleController_1.moduleController.deleteRole);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map