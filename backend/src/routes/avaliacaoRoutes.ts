import { Router } from 'express';
import { avaliacaoController } from '../controllers/avaliacaoController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Rotas de versões (apenas admin pode criar/editar)
router.get('/versoes', avaliacaoController.listVersoes.bind(avaliacaoController));
router.get('/versoes/ativa', avaliacaoController.getVersaoAtiva.bind(avaliacaoController));
router.get('/versoes/:id', avaliacaoController.getVersaoById.bind(avaliacaoController));
router.post('/versoes', requireAdmin, avaliacaoController.createVersao.bind(avaliacaoController));
router.put('/versoes/:id', requireAdmin, avaliacaoController.updateVersao.bind(avaliacaoController));

// Rotas de perguntas (apenas admin pode criar/editar)
router.get('/versoes/:id/perguntas', avaliacaoController.listPerguntas.bind(avaliacaoController));
router.post('/versoes/:id/perguntas', requireAdmin, avaliacaoController.createPergunta.bind(avaliacaoController));
router.put('/perguntas/:id', requireAdmin, avaliacaoController.updatePergunta.bind(avaliacaoController));
router.delete('/perguntas/:id', requireAdmin, avaliacaoController.deletePergunta.bind(avaliacaoController));

export default router;

