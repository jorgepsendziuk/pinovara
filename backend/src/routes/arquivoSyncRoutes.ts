import { Router } from 'express';
import { arquivoSyncController } from '../controllers/arquivoSyncController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Sincronizar arquivos do ODK
router.post('/organizacoes/:id/arquivos/sync', authenticateToken, arquivoSyncController.syncFromODK);

// Listar arquivos disponíveis no ODK
router.get('/organizacoes/:id/arquivos/odk-disponiveis', authenticateToken, arquivoSyncController.listODKAvailable);

export default router;
