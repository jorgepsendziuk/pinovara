import { Router } from 'express';
import authRoutes from './authRoutes';
import organizacaoRoutes from './organizacaoRoutes';
import healthRoutes from './healthRoutes';
import debugRoutes from './debugRoutes';
import adminRoutes from './adminRoutes';
import documentoRoutes from './documentoRoutes';
import fotoRoutes from './fotoRoutes';
import fotoSyncRoutes from './fotoSyncRoutes';
import arquivoSyncRoutes from './arquivoSyncRoutes';
import assinaturaSyncRoutes from './assinaturaSyncRoutes';
import relatorioRoutes from './relatorioRoutes';
import repositorioRoutes from './repositorioRoutes';

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
        'GET /organizacoes/dashboard',
        'POST /organizacoes/:id/documentos',
        'GET /organizacoes/:id/documentos',
        'GET /organizacoes/:id/documentos/:docId/download',
        'DELETE /organizacoes/:id/documentos/:docId',
        'POST /organizacoes/:id/fotos',
        'GET /organizacoes/:id/fotos',
        'GET /organizacoes/:id/fotos/:fotoId/download',
        'DELETE /organizacoes/:id/fotos/:fotoId'
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
      repositorio: [
        'GET /repositorio',
        'GET /repositorio/:id',
        'GET /repositorio/:id/download',
        'GET /repositorio/stats/estatisticas',
        'POST /repositorio/upload',
        'DELETE /repositorio/:id'
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
router.use('/admin', adminRoutes);  // Admin routes - requer autenticação e papel admin
router.use('/debug', debugRoutes);  // DEBUG routes - REMOVER EM PRODUÇÃO

// Rotas específicas de organizações (devem vir antes das rotas genéricas)
router.use('/organizacoes', fotoRoutes);  // Foto routes - ANTES de organizacaoRoutes (view é público)

// Rotas com / que usam autenticação global (estas devem vir POR ÚLTIMO)
router.use('/', documentoRoutes);  // Documento routes - usa /organizacoes/:id/documentos
router.use('/', fotoSyncRoutes);  // Foto sync ODK routes - usa /organizacoes/:id/fotos/sync
router.use('/', arquivoSyncRoutes);  // Arquivo sync ODK routes - usa /organizacoes/:id/arquivos/sync
router.use('/', assinaturaSyncRoutes);  // Assinatura sync ODK routes - usa /organizacoes/:id/assinaturas/sync
router.use('/', relatorioRoutes);  // Relatorio routes - usa /organizacoes/:id/relatorio/pdf
router.use('/organizacoes', organizacaoRoutes);  // Organizacao routes - usa auth global

export default router;