const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002; // Porta diferente para teste

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
    environment: 'test',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste de conexão com banco (simulada)
app.get('/test-db', async (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Conexão com banco simulada (modo teste)',
    note: 'Este é um servidor de teste sem conexão real com banco'
  });
});

// Rota de login simplificada para teste
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Para teste, aceitar qualquer email/senha
    const token = 'test-token-' + Date.now();
    
    res.json({
      success: true,
      message: 'Login de teste realizado com sucesso',
      data: {
        user: {
          id: 1,
          email: email,
          name: 'Usuário Teste',
          active: true,
          roles: ['user']
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

// Rota de organizações para teste (dados simulados)
app.get('/organizacoes', authenticateToken, async (req, res) => {
  try {
    // Dados simulados para teste
    const organizacoes = [
      {
        id: 1,
        nome: 'Cooperativa de Teste 1',
        cnpj: '12.345.678/0001-90',
        estado: 'Minas Gerais',
        municipio: 'Diamantina',
        dataVisita: new Date().toISOString()
      },
      {
        id: 2,
        nome: 'Associação de Teste 2',
        cnpj: '98.765.432/0001-10',
        estado: 'Bahia',
        municipio: 'Salvador',
        dataVisita: new Date().toISOString()
      }
    ];

    res.json({
      organizacoes: organizacoes,
      total: organizacoes.length,
      pagina: 1,
      totalPaginas: 1,
      environment: 'test',
      note: 'Dados simulados para teste'
    });
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de dashboard para teste
app.get('/organizacoes/dashboard', authenticateToken, async (req, res) => {
  try {
    const stats = {
      total: 25,
      comQuestionario: 8,
      semQuestionario: 17,
      porEstado: [
        { estado: 'Minas Gerais', total: 15 },
        { estado: 'Bahia', total: 7 },
        { estado: 'Outros', total: 3 }
      ],
      porTipo: [
        { tipo: 'Cooperativa', total: 12 },
        { tipo: 'Associação', total: 8 },
        { tipo: 'Outros', total: 5 }
      ],
      environment: 'test',
      note: 'Dados simulados para teste'
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API PINOVARA de TESTE funcionando!',
    version: '1.0.0-test',
    port: PORT,
    environment: 'test',
    endpoints: [
      'GET /health',
      'GET /test-db',
      'POST /auth/login',
      'GET /organizacoes',
      'GET /organizacoes/dashboard'
    ],
    note: 'Este é um servidor de teste com dados simulados'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🧪 Servidor PINOVARA de TESTE rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:5173`);
  console.log(`🔧 Ambiente: TESTE`);
  console.log(`📊 Dados: SIMULADOS`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Encerrando servidor de teste...');
  process.exit(0);
});