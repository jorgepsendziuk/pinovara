"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// Importar rotas
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const moduleRoutes_1 = __importDefault(require("./routes/moduleRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
// Carregar variáveis de ambiente
dotenv_1.default.config({ path: './config.env' });
// Verificar variáveis de ambiente essenciais
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada no arquivo config.env');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET não definido. Usando valor padrão (não recomendado para produção)');
}
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3001;
// Middleware global
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Middleware de log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Rotas da API
app.use('/auth', authRoutes_1.default);
app.use('/users', userRoutes_1.default);
app.use('/modules', moduleRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
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
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'OK',
            database: 'connected',
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error('Erro na conexão com o banco:', error);
        res.status(503).json({
            status: 'Error',
            database: 'disconnected',
            timestamp: new Date()
        });
    }
});
// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=server.js.map