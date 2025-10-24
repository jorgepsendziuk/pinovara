import express from 'express';
import { assinaturaSyncController } from '../controllers/assinaturaSyncController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// POST /api/organizacoes/:id/assinaturas/sync
router.post('/organizacoes/:id/assinaturas/sync', authenticateToken, assinaturaSyncController.sync);

// GET /api/organizacoes/:id/assinaturas/odk-disponiveis
router.get('/organizacoes/:id/assinaturas/odk-disponiveis', authenticateToken, assinaturaSyncController.listODKAvailable);

export default router;
