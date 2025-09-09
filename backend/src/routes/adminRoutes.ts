import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { userController } from '../controllers/userController';
import { moduleController } from '../controllers/moduleController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação e verificação de permissão admin a todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * System Information
 */
router.get('/system-info', adminController.getSystemInfo);

/**
 * System Settings Routes
 */
router.get('/settings', adminController.getAllSettings);
router.get('/settings/by-category', adminController.getSettingsByCategory);
router.get('/settings/:key', adminController.getSettingByKey);
router.post('/settings', adminController.createSetting);
router.put('/settings/:key', adminController.updateSetting);
router.delete('/settings/:key', adminController.deleteSetting);

/**
 * Audit Logs Routes
 */
router.get('/audit-logs', adminController.getAllAuditLogs);
router.get('/audit-logs/stats', adminController.getAuditLogStats);
router.get('/audit-logs/:id', adminController.getAuditLogById);

/**
 * User Management Routes (from existing userController)
 */
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id/status', userController.updateUserStatus);
router.post('/users/:id/roles', userController.assignRole);
router.delete('/users/:id/roles/:roleId', userController.removeRole);
router.delete('/users/:id', userController.deleteUser);

/**
 * Module & Role Management Routes (from existing moduleController)
 */
// Modules
router.get('/modules', moduleController.getAllModules);
router.get('/modules/:id', moduleController.getModuleById);
router.post('/modules', moduleController.createModule);
router.put('/modules/:id', moduleController.updateModule);
router.delete('/modules/:id', moduleController.deleteModule);

// Roles
router.get('/roles', moduleController.getAllRoles);
router.get('/roles/:id', moduleController.getRoleById);
router.post('/roles', moduleController.createRole);
router.put('/roles/:id', moduleController.updateRole);
router.delete('/roles/:id', moduleController.deleteRole);

export default router;