import { Router } from 'express';
import authRoutes from './authRoutes';
import organizacaoRoutes from './organizacaoRoutes';
import healthRoutes from './healthRoutes';

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

export default router;