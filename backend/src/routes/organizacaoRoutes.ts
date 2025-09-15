import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  getDashboardStats,
  getOrganizacoes,
  getOrganizacaoById,
  createOrganizacao,
  updateOrganizacao,
  deleteOrganizacao
} from '../controllers/organizacaoController';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Dashboard de organizações
router.get('/dashboard', getDashboardStats);

// Listar organizações com filtros
router.get('/', getOrganizacoes);

// Buscar organização por ID
router.get('/:id', getOrganizacaoById);

// Criar nova organização
router.post('/', createOrganizacao);

// Atualizar organização
router.put('/:id', updateOrganizacao);

// Excluir organização
router.delete('/:id', deleteOrganizacao);

export default router;
