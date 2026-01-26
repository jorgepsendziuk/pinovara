import { Router } from 'express';
import { qualificacaoController } from '../controllers/qualificacaoController';
import { capacitacaoMaterialController, uploadMaterial } from '../controllers/capacitacaoMaterialController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';
import { checkQualificacaoCapacitacaoPermission } from '../middleware/qualificacaoCapacitacaoAuth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
// Middleware para definir permissões de qualificações/capacitações
router.use(checkQualificacaoCapacitacaoPermission);

// Rotas públicas (autenticadas)
router.get('/', qualificacaoController.list.bind(qualificacaoController));

// Rota para listar técnicos disponíveis (acessível por técnicos) - deve vir ANTES das rotas com parâmetros
router.get('/tecnicos-disponiveis', qualificacaoController.listTecnicosDisponiveis.bind(qualificacaoController));

// Rota de validação (deve vir antes de /:id para evitar conflito)
router.patch('/:id/validacao', qualificacaoController.updateValidacao.bind(qualificacaoController));
router.get('/:id/historico-validacao', qualificacaoController.getHistoricoValidacao.bind(qualificacaoController));

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

