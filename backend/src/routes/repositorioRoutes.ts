import { Router } from 'express';
import { repositorioController, upload } from '../controllers/repositorioController';
import { authenticateToken } from '../middleware/auth';
import { requireUploadPermission, requireDeletePermission, optionalAuth } from '../middleware/repositorioAuth';

const router = Router();

// ========== ROTAS PÚBLICAS (todos podem acessar) ==========

// Obter estatísticas do repositório
router.get('/stats/estatisticas', optionalAuth, repositorioController.getEstatisticas);

// Download de arquivo
router.get('/:id/download', (req, res, next) => {
  const id = req.params.id;
  if (!/^\d+$/.test(id)) {
    return next(); // Passa para a próxima rota se não for numérico
  }
  optionalAuth(req, res, next);
}, repositorioController.downloadArquivo);

// Obter detalhes de um arquivo específico (somente se ID for numérico)
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  if (!/^\d+$/.test(id)) {
    return next(); // Passa para a próxima rota se não for numérico
  }
  optionalAuth(req, res, next);
}, repositorioController.getArquivo);

// Listar arquivos do repositório (todos podem ver) - deve vir POR ÚLTIMO
router.get('/', optionalAuth, repositorioController.listArquivos);

// ========== ROTAS PROTEGIDAS (apenas admin/coordenador/supervisor) ==========

// Upload de arquivo (requer autenticação + permissão de upload)
router.post('/upload', 
  authenticateToken, 
  requireUploadPermission, 
  upload.single('arquivo'), 
  repositorioController.uploadArquivo
);

// Deletar arquivo (requer autenticação + permissão de delete)
router.delete('/:id', 
  authenticateToken, 
  requireDeletePermission, 
  repositorioController.deleteArquivo
);

// Atualizar metadados (requer autenticação)
// TEMPORARIAMENTE DESABILITADO - DEBUG
// router.put('/:id',
//   authenticateToken,
//   requireDeletePermission,
//   repositorioController.updateArquivo
// );

export default router;
