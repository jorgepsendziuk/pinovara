import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carregar variáveis de ambiente
dotenv.config({ path: './config.env' });

// Verificar se DATABASE_URL foi carregada
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no arquivo config.env');
  process.exit(1);
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rotas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API PINOVARA funcionando!', timestamp: new Date() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'checking...' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Rota não encontrada',
      statusCode: 404,
      timestamp: new Date(),
      path: req.originalUrl
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor PINOVARA rodando na porta ${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
