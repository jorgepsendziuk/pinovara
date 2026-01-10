import { Router } from 'express';
import { qualificacaoController } from '../controllers/qualificacaoController';
import { capacitacaoMaterialController, uploadMaterial } from '../controllers/capacitacaoMaterialController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Rotas públicas (autenticadas)
router.get('/', qualificacaoController.list.bind(qualificacaoController));
router.get('/:id', qualificacaoController.getById.bind(qualificacaoController));

// Rotas que precisam de permissão (admin ou técnico pode criar/editar)
router.post('/', qualificacaoController.create.bind(qualificacaoController));
router.put('/:id', qualificacaoController.update.bind(qualificacaoController));
router.delete('/:id', qualificacaoController.delete.bind(qualificacaoController));

// Rotas de materiais didáticos
router.post('/:id/materiais', uploadMaterial, capacitacaoMaterialController.uploadMaterial.bind(capacitacaoMaterialController));
router.get('/:id/materiais', capacitacaoMaterialController.listMateriais.bind(capacitacaoMaterialController));
router.get('/:id/materiais/:materialId/download', capacitacaoMaterialController.downloadMaterial.bind(capacitacaoMaterialController));
router.delete('/:id/materiais/:materialId', capacitacaoMaterialController.deleteMaterial.bind(capacitacaoMaterialController));

// Rotas de gerenciamento de equipe técnica
router.post('/:id/tecnicos', qualificacaoController.addTecnico.bind(qualificacaoController));
router.delete('/:id/tecnicos/:idTecnico', qualificacaoController.removeTecnico.bind(qualificacaoController));
router.get('/:id/tecnicos', qualificacaoController.listTecnicos.bind(qualificacaoController));

export default router;

