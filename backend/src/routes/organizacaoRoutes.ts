import { Router } from 'express';
import { organizacaoController } from '../controllers/organizacaoController';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { checkOrganizacaoPermission } from '../middleware/roleAuth';

const router = Router();

// Todas as rotas de organizações precisam de autenticação e verificação de permissões
router.use(authenticateToken);
router.use(checkOrganizacaoPermission);

// Dashboard - rota especial que deve vir antes das rotas com parâmetros
router.get('/dashboard', organizacaoController.getDashboard.bind(organizacaoController));

// Endpoint para buscar municípios (usado no cadastro)
router.get('/municipios/:estadoId?', organizacaoController.getMunicipios.bind(organizacaoController));

// CRUD básico - agora com controle de acesso por role
router.get('/', organizacaoController.list.bind(organizacaoController));
router.post('/', organizacaoController.create.bind(organizacaoController));
router.get('/:id', organizacaoController.getById.bind(organizacaoController));
router.put('/:id', organizacaoController.update.bind(organizacaoController));
router.delete('/:id', organizacaoController.delete.bind(organizacaoController));

export default router;