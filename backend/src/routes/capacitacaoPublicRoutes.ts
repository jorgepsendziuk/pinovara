import { Router } from 'express';
import { capacitacaoPublicController } from '../controllers/capacitacaoPublicController';

const router = Router();

// Rotas públicas (sem autenticação)
router.get('/:linkInscricao', capacitacaoPublicController.getByLinkInscricao.bind(capacitacaoPublicController));
router.post('/:linkInscricao/inscricao', capacitacaoPublicController.createInscricaoPublica.bind(capacitacaoPublicController));
router.post('/:linkInscricao/verificar-inscricao', capacitacaoPublicController.verificarInscricao.bind(capacitacaoPublicController));
router.get('/:linkAvaliacao/avaliacao', capacitacaoPublicController.getByLinkAvaliacao.bind(capacitacaoPublicController));
router.post('/:linkAvaliacao/avaliacao', capacitacaoPublicController.createAvaliacaoPublica.bind(capacitacaoPublicController));
router.get('/:linkInscricao/materiais', capacitacaoPublicController.listMateriaisPublicos.bind(capacitacaoPublicController));
router.get('/:linkInscricao/materiais/:materialId/download', capacitacaoPublicController.downloadMaterialPublico.bind(capacitacaoPublicController));

export default router;

