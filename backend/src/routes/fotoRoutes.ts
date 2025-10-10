import { Router } from 'express';
import { fotoController, uploadMiddleware } from '../controllers/fotoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Upload de foto
router.post('/:id/fotos', uploadMiddleware, fotoController.upload);

// Listar fotos de uma organização
router.get('/:id/fotos', fotoController.list);

// Download de foto
router.get('/:id/fotos/:fotoId/download', fotoController.download);

// Deletar foto
router.delete('/:id/fotos/:fotoId', fotoController.delete);

export default router;

