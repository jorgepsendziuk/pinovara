import { Router } from 'express';
import { documentoController, upload } from '../controllers/documentoController';
import { authenticateToken } from '../middleware/auth';
import { checkOrganizacaoPermission } from '../middleware/roleAuth';

const router = Router();

// Todas as rotas precisam de autenticação e verificação de permissões
router.use(authenticateToken);
router.use(checkOrganizacaoPermission);

// Upload de documento
router.post(
  '/organizacoes/:id/documentos',
  upload.single('arquivo'),
  documentoController.uploadDocumento.bind(documentoController)
);

// Listar documentos de uma organização
router.get(
  '/organizacoes/:id/documentos',
  documentoController.listDocumentos.bind(documentoController)
);

// Download de documento
router.get(
  '/organizacoes/:id/documentos/:docId/download',
  documentoController.downloadDocumento.bind(documentoController)
);

// Deletar documento
router.delete(
  '/organizacoes/:id/documentos/:docId',
  documentoController.deleteDocumento.bind(documentoController)
);

export default router;

