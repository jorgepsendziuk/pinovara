import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// ========== ROTAS PÚBLICAS ==========

/**
 * @route POST /auth/register
 * @desc Registrar novo usuário
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /auth/login
 * @desc Fazer login no sistema
 * @access Public
 */
router.post('/login', authController.login);

// ========== ROTAS PROTEGIDAS ==========

/**
 * @route GET /auth/me
 * @desc Obter dados do usuário autenticado
 * @access Private - Requer autenticação
 */
router.get('/me', authenticateToken, authController.me);

/**
 * @route POST /auth/logout
 * @desc Fazer logout do sistema
 * @access Private - Requer autenticação
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route GET /auth/verify
 * @desc Verificar se token é válido
 * @access Private - Requer autenticação
 */
router.get('/verify', authenticateToken, authController.verifyAuth);

/**
 * @route POST /auth/refresh
 * @desc Renovar token de acesso (futuro)
 * @access Private - Requer autenticação
 */
router.post('/refresh', authenticateToken, authController.refreshToken);

// ========== VALIDAÇÃO DE ROTAS ==========

// Middleware para log de tentativas de autenticação
router.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`[${timestamp}] Auth attempt: ${req.method} ${req.path} from ${ip} - ${userAgent}`);

  next();
});

export default router;
