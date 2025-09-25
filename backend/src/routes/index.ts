import { Router } from 'express';
import authRoutes from './authRoutes';
import organizacaoRoutes from './organizacaoRoutes';
import healthRoutes from './healthRoutes';
import debugRoutes from './debugRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API PINOVARA',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: [
        'POST /auth/login',
        'POST /auth/register',
        'GET /auth/verify',
        'GET /auth/me',
        'PUT /auth/profile',
        'POST /auth/logout'
      ],
      organizacoes: [
        'GET /organizacoes',
        'POST /organizacoes',
        'GET /organizacoes/:id',
        'PUT /organizacoes/:id',
        'DELETE /organizacoes/:id',
        'GET /organizacoes/dashboard'
      ],
      admin: [
        'GET /admin/users',
        'GET /admin/users/:id',
        'POST /admin/users',
        'PUT /admin/users/:id',
        'DELETE /admin/users/:id',
        'PUT /admin/users/:id/status',
        'GET /admin/roles',
        'POST /admin/users/:id/roles',
        'DELETE /admin/users/:id/roles/:roleId',
        'GET /admin/stats'
      ],
      system: [
        'GET /',
        'GET /health'
      ]
    }
  });
});

// Registrar rotas dos módulos
router.use('/', healthRoutes);  // Health routes no root
router.use('/auth', authRoutes);
router.use('/organizacoes', organizacaoRoutes);
router.use('/admin', adminRoutes);  // Admin routes - requer autenticação e papel admin
router.use('/debug', debugRoutes);  // DEBUG routes - REMOVER EM PRODUÇÃO

export default router;