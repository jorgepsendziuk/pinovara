import express from 'express';
import { relatorioController } from '../controllers/relatorioController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Gerar relatório PDF da organização
router.get('/organizacoes/:id/relatorio/pdf', authenticateToken, relatorioController.gerarPDF);

export default router;

