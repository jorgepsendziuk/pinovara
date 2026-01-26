import { Router } from 'express';
import { capacitacaoController } from '../controllers/capacitacaoController';
import { avaliacaoController } from '../controllers/avaliacaoController';
import { capacitacaoEvidenciaController, uploadEvidencia } from '../controllers/capacitacaoEvidenciaController';
import { authenticateToken } from '../middleware/auth';
import { checkQualificacaoCapacitacaoPermission } from '../middleware/qualificacaoCapacitacaoAuth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);
// Middleware para definir permissões de qualificações/capacitações
router.use(checkQualificacaoCapacitacaoPermission);

// Rotas de capacitações (rotas específicas devem vir antes das genéricas)
router.get('/', capacitacaoController.list.bind(capacitacaoController));
router.post('/', capacitacaoController.create.bind(capacitacaoController));

// Rotas de inscrições (antes de /:id para evitar conflito)
router.get('/:id/inscricoes', capacitacaoController.listInscricoes.bind(capacitacaoController));
router.post('/:id/inscricoes', capacitacaoController.createInscricao.bind(capacitacaoController));
router.put('/:id/inscricoes/:inscricaoId', capacitacaoController.updateInscricao.bind(capacitacaoController));
router.delete('/:id/inscricoes/:inscricaoId', capacitacaoController.deleteInscricao.bind(capacitacaoController));

// Rotas de presenças
router.get('/:id/presencas', capacitacaoController.listPresencas.bind(capacitacaoController));
router.post('/:id/presencas', capacitacaoController.createPresenca.bind(capacitacaoController));
router.put('/:id/presencas/:presencaId', capacitacaoController.updatePresenca.bind(capacitacaoController));
router.delete('/:id/presencas/:presencaId', capacitacaoController.deletePresenca.bind(capacitacaoController));

// Rotas de avaliações
router.get('/:id/avaliacoes/estatisticas', avaliacaoController.getEstatisticas.bind(avaliacaoController));
router.get('/:id/avaliacoes', avaliacaoController.listAvaliacoes.bind(avaliacaoController));

// Rotas de evidências
router.get('/:id/evidencias/:evidenciaId/download', capacitacaoEvidenciaController.downloadEvidencia.bind(capacitacaoEvidenciaController));
router.post('/:id/evidencias', uploadEvidencia, capacitacaoEvidenciaController.uploadEvidencia.bind(capacitacaoEvidenciaController));
router.get('/:id/evidencias', capacitacaoEvidenciaController.listEvidencias.bind(capacitacaoEvidenciaController));
router.delete('/:id/evidencias/:evidenciaId', capacitacaoEvidenciaController.deleteEvidencia.bind(capacitacaoEvidenciaController));

// Rotas de gerenciamento de equipe técnica
router.post('/:id/tecnicos', capacitacaoController.addTecnico.bind(capacitacaoController));
router.delete('/:id/tecnicos/:idTecnico', capacitacaoController.removeTecnico.bind(capacitacaoController));
router.get('/:id/tecnicos', capacitacaoController.listTecnicos.bind(capacitacaoController));

// Rota de validação (deve vir antes de /:id para evitar conflito)
router.patch('/:id/validacao', capacitacaoController.updateValidacao.bind(capacitacaoController));
router.get('/:id/historico-validacao', capacitacaoController.getHistoricoValidacao.bind(capacitacaoController));

// Rotas genéricas de capacitações (devem vir por último)
router.get('/:id', capacitacaoController.getById.bind(capacitacaoController));
router.put('/:id', capacitacaoController.update.bind(capacitacaoController));
router.delete('/:id', capacitacaoController.delete.bind(capacitacaoController));

export default router;

