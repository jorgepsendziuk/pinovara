import express from 'express';
import { fotoSyncController } from '../controllers/fotoSyncController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Sincronizar fotos do ODK
router.post('/organizacoes/:id/fotos/sync', authenticateToken, fotoSyncController.sync);

// Listar fotos disponíveis no ODK
router.get('/organizacoes/:id/fotos/odk-disponiveis', authenticateToken, fotoSyncController.listODKAvailable);

export default router;

