const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('./deploy-package/node_modules/@prisma/client');

// Carregar variáveis de ambiente
dotenv.config({ path: './deploy-package/config.env' });

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
const PORT = process.env.TEST_PORT || 3002; // Porta diferente para teste

// Middleware global
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sem origin (como mobile apps)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3002',
      'https://pinovaraufba.com.br',
      'https://www.pinovaraufba.com.br'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor PINOVARA de TESTE funcionando!',
    port: PORT,
    environment: 'test'
  });
});

// Rota de teste de conexão com banco
app.get('/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    res.json({ 
      status: 'OK', 
      message: 'Conexão com banco OK',
      userCount: userCount
    });
  } catch (error) {
    console.error('Erro na conexão com banco:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erro na conexão com banco',
      error: error.message
    });
  }
});

// Rota de login simplificada para teste
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Para teste, aceitar qualquer senha
    const token = 'test-token-' + Date.now();
    
    res.json({
      success: true,
      message: 'Login de teste realizado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          active: user.active,
          roles: user.userRoles?.map(ur => ur.role.name) || []
        },
        token,
        expiresIn: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de autenticação simples para teste
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  // Para teste, aceitar qualquer token que comece com 'test-token-'
  if (token.startsWith('test-token-')) {
    req.user = { id: 1, email: 'test@example.com', name: 'Usuário Teste' };
    next();
  } else {
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Rota de organizações para teste
app.get('/organizacoes', authenticateToken, async (req, res) => {
  try {
    const organizacoes = await prisma.organizacao.findMany({
      where: { removido: false },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        estado: true,
        municipio: true,
        dataVisita: true
      },
      orderBy: { dataVisita: 'desc' },
      take: 10
    });

    res.json({
      organizacoes: organizacoes,
      total: organizacoes.length,
      pagina: 1,
      totalPaginas: 1,
      environment: 'test'
    });
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API PINOVARA de TESTE funcionando!',
    version: '1.0.0-test',
    port: PORT,
    endpoints: [
      'GET /health',
      'GET /test-db',
      'POST /auth/login',
      'GET /organizacoes'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🧪 Servidor PINOVARA de TESTE rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:5173`);
  console.log(`🗄️  Banco: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}`);
  console.log(`🔧 Ambiente: TESTE`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Encerrando servidor de teste...');
  await prisma.$disconnect();
  process.exit(0);
});