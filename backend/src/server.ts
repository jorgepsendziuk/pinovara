import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { accessLogger, errorLogger, appLogger, rateLimiter } from './middleware/logging';

// Load environment variables FIRST, before any other imports that might use them
// Explicitly load .env from backend directory to avoid conflicts with root .env
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import PrismaClient AFTER dotenv.config() to ensure DATABASE_URL is loaded
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3001;

// Create PrismaClient AFTER environment variables are loaded
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// ========== MIDDLEWARE ==========

// Trust proxy - necessário para capturar IP real quando atrás de proxy/nginx
app.set('trust proxy', true);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',  // teste local de deploy
    'http://localhost:8080',
    'http://localhost:3000',
    'https://pinovaraufba.com.br'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(accessLogger);

// Rate limiting (mais restritivo em produção)
const rateLimitWindow = process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000; // 15min em prod, 1min em dev
const rateLimitMax = process.env.NODE_ENV === 'production' ? 500 : 1000; // 500 em prod, 1000 em dev
app.use(rateLimiter(rateLimitWindow, rateLimitMax));

// ========== ROUTES ==========

// ROTAS DO REPOSITÓRIO - ANTES DE TUDO (para evitar conflito com rotas globais)
const repositorioRoutes = require('./routes/repositorioRoutes');
app.use('/repositorio', repositorioRoutes.default);

// IMPORTANTE: Rotas públicas de capacitações DEVEM ser registradas ANTES das rotas gerais
// para garantir que o Express faça match com a rota mais específica primeiro
const capacitacaoPublicRoutes = require('./routes/capacitacaoPublicRoutes');
app.use('/capacitacoes/public', capacitacaoPublicRoutes.default);

// API routes (inclui rotas autenticadas de capacitações)
app.use('/', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint não encontrado',
      statusCode: 404,
      path: req.originalUrl
    },
    timestamp: new Date().toISOString()
  });
});

// ========== ERROR HANDLER ==========

app.use(errorLogger);

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // O errorLogger já fez o log, apenas responder
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Erro interno do servidor',
      statusCode: error.statusCode || 500,
      requestId: req.requestId,
      ...(isDevelopment && { stack: error.stack })
    },
    timestamp: new Date().toISOString()
  });
});

// ========== SERVER STARTUP ==========

async function startServer() {
  try {
    // Log DATABASE_URL before connecting (without password)
    const dbUrl = process.env.DATABASE_URL || 'not set';
    const dbUrlSafe = dbUrl.replace(/:[^:@]+@/, ':****@'); // Hide password
    appLogger.info(`Attempting to connect to database: ${dbUrlSafe}`);
    console.log(`🔍 Tentando conectar ao banco: ${dbUrlSafe}`);
    
    // Test database connection
    await prisma.$connect();
    appLogger.info('Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      appLogger.info('🚀 PINOVARA Backend Server Started');
      appLogger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      appLogger.info(`🌐 Server: http://localhost:${PORT}`);
      appLogger.info(`🎯 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      appLogger.info(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
      appLogger.info(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : '❌ NOT CONFIGURED'}`);
      
      // Log em console também
      console.log('🚀 PINOVARA Backend Server Started');
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`🎯 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
      console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : '❌ NOT CONFIGURED'}`);
      console.log('=====================================');
    });
  } catch (error) {
    appLogger.error('Failed to start server', error);
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// ========== GRACEFUL SHUTDOWN ==========

process.on('SIGINT', async () => {
  appLogger.info('Received SIGINT, shutting down gracefully');
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  appLogger.info('Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  appLogger.info('Received SIGTERM, shutting down gracefully');
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  appLogger.info('Database disconnected');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  appLogger.error('Uncaught Exception', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  appLogger.error('Unhandled Rejection', { reason, promise });
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();// Force redeploy to fix roles loading issue - Thu Sep 25 07:26:22 -03 2025
