import { Router } from 'express';
import { fotoController, uploadMiddleware } from '../controllers/fotoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Upload de foto (requer autenticação)
router.post('/:id/fotos', authenticateToken, uploadMiddleware, fotoController.upload);

// Listar fotos de uma organização (requer autenticação)
router.get('/:id/fotos', authenticateToken, fotoController.list);

// Visualizar foto (público - para imagens em <img src>)
router.get('/:id/fotos/:fotoId/view', fotoController.view);

// Download de foto (requer autenticação)
router.get('/:id/fotos/:fotoId/download', authenticateToken, fotoController.download);

// Deletar foto (requer autenticação)
router.delete('/:id/fotos/:fotoId', authenticateToken, fotoController.delete);

export default router;

