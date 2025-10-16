import { Router } from 'express';
import { organizacaoController } from '../controllers/organizacaoController';
import { abrangenciaController } from '../controllers/abrangenciaController';
import { associadosJuridicosController } from '../controllers/associadosJuridicosController';
import { producaoController } from '../controllers/producaoController';
import { indicadoresController } from '../controllers/indicadoresController';
import { participantesController } from '../controllers/participantesController';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { checkOrganizacaoPermission } from '../middleware/roleAuth';

const router = Router();

// Todas as rotas de organizações precisam de autenticação e verificação de permissões
router.use(authenticateToken);
router.use(checkOrganizacaoPermission);

// Dashboard - rota especial que deve vir antes das rotas com parâmetros
router.get('/dashboard', organizacaoController.getDashboard.bind(organizacaoController));

// Endpoints auxiliares para estados e municípios
router.get('/estados', organizacaoController.getEstados.bind(organizacaoController));
router.get('/municipios/:estadoId?', organizacaoController.getMunicipios.bind(organizacaoController));

// CRUD básico - agora com controle de acesso por role
router.get('/', organizacaoController.list.bind(organizacaoController));
router.post('/', organizacaoController.create.bind(organizacaoController));
router.get('/:id', organizacaoController.getById.bind(organizacaoController));
router.put('/:id', organizacaoController.update.bind(organizacaoController));
router.patch('/:id/validacao', organizacaoController.updateValidacao.bind(organizacaoController));
router.delete('/:id', organizacaoController.delete.bind(organizacaoController));

// Rotas para tabelas auxiliares
// Abrangência Geográfica (Sócios)
router.get('/:id/abrangencia-socios', abrangenciaController.list);
router.post('/:id/abrangencia-socios', abrangenciaController.create);
router.put('/:id/abrangencia-socios/:itemId', abrangenciaController.update);
router.delete('/:id/abrangencia-socios/:itemId', abrangenciaController.delete);

// Associados Jurídicos
router.get('/:id/associados-juridicos', associadosJuridicosController.list);
router.post('/:id/associados-juridicos', associadosJuridicosController.create);
router.put('/:id/associados-juridicos/:itemId', associadosJuridicosController.update);
router.delete('/:id/associados-juridicos/:itemId', associadosJuridicosController.delete);

// Produção
router.get('/:id/producao', producaoController.list);
router.post('/:id/producao', producaoController.create);
router.put('/:id/producao/:itemId', producaoController.update);
router.delete('/:id/producao/:itemId', producaoController.delete);

// Indicadores
router.get('/:id/indicadores', indicadoresController.list);
router.post('/:id/indicadores', indicadoresController.create);
router.delete('/:id/indicadores/:indicadorId', indicadoresController.delete);

// Participantes
router.get('/:id/participantes', participantesController.list);
router.post('/:id/participantes', participantesController.create);
router.put('/:id/participantes/:participanteId', participantesController.update);
router.delete('/:id/participantes/:participanteId', participantesController.delete);

export default router;