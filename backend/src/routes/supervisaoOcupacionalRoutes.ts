import { Router } from 'express';
import { supervisaoOcupacionalController } from '../controllers/supervisaoOcupacionalController';
import { authenticateToken } from '../middleware/auth';
import { checkSupervisaoOcupacionalPermission } from '../middleware/supervisaoOcupacionalAuth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
router.use(checkSupervisaoOcupacionalPermission);

// Dashboard
router.get('/dashboard', supervisaoOcupacionalController.getDashboard.bind(supervisaoOcupacionalController));

// Glebas/Assentamentos
router.get('/glebas', supervisaoOcupacionalController.listGlebas.bind(supervisaoOcupacionalController));
router.post('/glebas', supervisaoOcupacionalController.createGleba.bind(supervisaoOcupacionalController));
router.get('/glebas/:id', supervisaoOcupacionalController.getGlebaById.bind(supervisaoOcupacionalController));
router.put('/glebas/:id', supervisaoOcupacionalController.updateGleba.bind(supervisaoOcupacionalController));
router.delete('/glebas/:id', supervisaoOcupacionalController.deleteGleba.bind(supervisaoOcupacionalController));

// Famílias
router.get('/familias', supervisaoOcupacionalController.listFamilias.bind(supervisaoOcupacionalController));
router.get('/familias/:id', supervisaoOcupacionalController.getFamiliaById.bind(supervisaoOcupacionalController));
router.put('/familias/:id', supervisaoOcupacionalController.updateFamilia.bind(supervisaoOcupacionalController));
router.patch('/familias/:id/validacao', supervisaoOcupacionalController.validateFamilia.bind(supervisaoOcupacionalController));

// Sincronização ODK
router.get('/familias/sync/available', supervisaoOcupacionalController.listODKAvailable.bind(supervisaoOcupacionalController));
router.post('/familias/sync', supervisaoOcupacionalController.syncFromODK.bind(supervisaoOcupacionalController));

// Endpoints auxiliares
router.get('/estados', supervisaoOcupacionalController.getEstados.bind(supervisaoOcupacionalController));
router.get('/municipios/:estadoId?', supervisaoOcupacionalController.getMunicipios.bind(supervisaoOcupacionalController));
router.get('/tecnicos', supervisaoOcupacionalController.getTecnicos.bind(supervisaoOcupacionalController));

export default router;
