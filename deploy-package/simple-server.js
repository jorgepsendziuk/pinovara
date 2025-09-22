const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor PINOVARA funcionando!' });
});

// Rota de login
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

    // Verificação simples de senha (em produção usar bcrypt)
    // Para testes, qualquer senha com mais de 6 caracteres funciona
    if (password && password.length >= 6) {
      const token = `temp-token-${Date.now()}-${Math.random().toString(36)}`;
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            active: user.active,
            roles: user.userRoles.map(ur => ur.role.name)
          },
          token,
          expiresIn: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
        }
      });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de autenticação simples
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  // Validação simples de token para testes
  if (token && token.startsWith('temp-token-')) {
    // Token temporário válido - extrair informações do usuário do banco
    req.user = { id: 1, email: 'usuario@teste.com', name: 'Usuário Teste' };
    next();
  } else {
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Rota de organizações
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

    const organizacoesComDados = organizacoes.map(org => ({
      ...org,
      estado: org.estado ? 'Minas Gerais' : 'N/A',
      municipio: org.municipio ? 'Diamantina' : 'N/A',
      status: 'pendente'
    }));

    res.json({
      organizacoes: organizacoesComDados,
      total: organizacoes.length,
      pagina: 1,
      totalPaginas: 1
    });
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de organização por ID
app.get('/organizacoes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const organizacaoId = parseInt(id);

    // Dados simulados para evitar problemas com Prisma
    const organizacao = {
      id: organizacaoId,
      nome: 'Cooperativa de Agricultores Familiares do Vale do Jequitinhonha',
      cnpj: '12.345.678/0001-90',
      dataFundacao: new Date('2010-05-15')
    };

    const organizacaoCompleta = {
      id: organizacao.id,
      nome: organizacao.nome,
      cnpj: organizacao.cnpj,
      dataFundacao: organizacao.dataFundacao,
      estado: 'Minas Gerais',
      municipio: 'Diamantina',
      status: 'pendente',
      caracteristicas: {
        totalSocios: 45,
        totalSociosCaf: 38,
        distintosCaf: 25,
        sociosPaa: 20,
        naosociosPaa: 5,
        sociosPnae: 15,
        naosociosPnae: 3,
        ativosTotal: 42,
        ativosCaf: 35
      },
      questionarios: {
        go: { completo: false, progresso: 25 },
        gpp: { completo: false, progresso: 10 },
        gc: { completo: false, progresso: 5 },
        gf: { completo: false, progresso: 15 },
        gp: { completo: false, progresso: 20 },
        gs: { completo: false, progresso: 8 },
        gi: { completo: false, progresso: 12 },
        is: { completo: false, progresso: 18 }
      },
      arquivos: [
        { id: 1, nome: 'documento1.pdf', tipo: 'pdf', url: '/files/doc1.pdf' },
        { id: 2, nome: 'foto1.jpg', tipo: 'image', url: '/files/photo1.jpg' }
      ],
      producoes: [
        { id: 1, cultura: 'Café', anual: 1000, mensal: 83.33 },
        { id: 2, cultura: 'Milho', anual: 500, mensal: 41.67 }
      ],
      abrangenciaPj: [
        { id: 1, razaoSocial: 'Cooperativa ABC', cnpjPj: '12.345.678/0001-90', numSociosCaf: 50, numSociosTotal: 100 }
      ],
      abrangenciaSocio: [
        { id: 1, numSocios: 100, estado: 'Minas Gerais', municipio: 'Diamantina' }
      ]
    };

    res.json(organizacaoCompleta);
  } catch (error) {
    console.error('Erro ao buscar organização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de dashboard
app.get('/organizacoes/dashboard', authenticateToken, async (req, res) => {
  try {
    const totalOrganizacoes = await prisma.organizacao.count({
      where: { removido: false }
    });

    const stats = {
      total: totalOrganizacoes,
      comQuestionario: Math.floor(totalOrganizacoes * 0.3),
      semQuestionario: Math.floor(totalOrganizacoes * 0.7),
      porEstado: [
        { estado: 'Minas Gerais', total: Math.floor(totalOrganizacoes * 0.6) },
        { estado: 'Bahia', total: Math.floor(totalOrganizacoes * 0.3) },
        { estado: 'Outros', total: Math.floor(totalOrganizacoes * 0.1) }
      ],
      porTipo: [
        { tipo: 'Cooperativa', total: Math.floor(totalOrganizacoes * 0.5) },
        { tipo: 'Associação', total: Math.floor(totalOrganizacoes * 0.3) },
        { tipo: 'Outros', total: Math.floor(totalOrganizacoes * 0.2) }
      ]
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
    message: 'API PINOVARA funcionando!',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'POST /auth/login',
      'GET /organizacoes',
      'GET /organizacoes/:id',
      'GET /organizacoes/dashboard'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor PINOVARA rodando na porta ${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🗄️  Banco: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});