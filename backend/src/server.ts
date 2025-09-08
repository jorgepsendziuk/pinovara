import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rotas
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import moduleRoutes from './routes/moduleRoutes';
import adminRoutes from './routes/adminRoutes';

// Carregar variáveis de ambiente
dotenv.config({ path: './config.env' });

// Verificar variáveis de ambiente essenciais
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no arquivo config.env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET não definido. Usando valor padrão (não recomendado para produção)');
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware global
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/modules', moduleRoutes);
app.use('/admin', adminRoutes);

// Rotas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API PINOVARA funcionando!', 
    timestamp: new Date(),
    version: '1.0.0',
    features: [
      'Autenticação JWT segura',
      'Sistema de módulos e papéis',
      'Gerenciamento de usuários',
      'API REST completa'
    ]
  });
});

// Health check com teste de conexão do banco
app.get('/health', async (req, res) => {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'OK', 
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro na conexão com o banco:', error);
    res.status(503).json({
      status: 'Error',
      database: 'disconnected',
      timestamp: new Date()
    });
  }
});

// Middleware de tratamento de erros global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  
  res.status(500).json({
    error: {
      message: 'Erro interno do servidor',
      statusCode: 500,
      timestamp: new Date(),
    }
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Rota não encontrada',
      statusCode: 404,
      timestamp: new Date(),
      path: req.originalUrl,
      availableRoutes: [
        'POST /auth/register',
        'POST /auth/login',
        'GET /auth/me',
        'POST /auth/logout',
        'GET /users',
        'GET /modules',
        'GET /admin/system-info',
        'GET /health'
      ]
    }
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor PINOVARA rodando na porta ${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔐 JWT configurado: ${process.env.JWT_SECRET ? 'Sim' : 'Não (usando padrão)'}`);
  console.log(`🗄️  Banco: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}`);
});

export default app;
