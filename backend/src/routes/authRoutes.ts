import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rotas públicas
router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.get('/verify', authController.verify.bind(authController));

// Rotas protegidas
router.get('/me', authenticateToken, authController.me.bind(authController));
router.get('/meu-acesso-sem-papel', authenticateToken, authController.meuAcessoSemPapel.bind(authController));
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.post('/refresh', authenticateToken, authController.refresh.bind(authController));

export default router;