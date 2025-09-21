import { Router } from 'express';
import { organizacaoController } from '../controllers/organizacaoController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// Todas as rotas de organizações precisam de autenticação
router.use(authenticateToken);

// Dashboard - rota especial que deve vir antes das rotas com parâmetros
router.get('/dashboard', organizacaoController.getDashboard.bind(organizacaoController));

// CRUD básico
router.get('/', organizacaoController.list.bind(organizacaoController));
router.post('/', organizacaoController.create.bind(organizacaoController));
router.get('/:id', organizacaoController.getById.bind(organizacaoController));
router.put('/:id', organizacaoController.update.bind(organizacaoController));
router.delete('/:id', organizacaoController.delete.bind(organizacaoController));

export default router;