"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const routes_1 = __importDefault(require("./routes"));
const logging_1 = require("./middleware/logging");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:8080',
        'https://pinovaraufba.com.br'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(logging_1.accessLogger);
const rateLimitWindow = process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000;
const rateLimitMax = process.env.NODE_ENV === 'production' ? 100 : 1000;
app.use((0, logging_1.rateLimiter)(rateLimitWindow, rateLimitMax));
app.use('/', routes_1.default);
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
app.use(logging_1.errorLogger);
app.use((error, req, res, next) => {
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
async function startServer() {
    try {
        await prisma.$connect();
        logging_1.appLogger.info('Database connected successfully');
        app.listen(PORT, () => {
            logging_1.appLogger.info('🚀 PINOVARA Backend Server Started');
            logging_1.appLogger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            logging_1.appLogger.info(`🌐 Server: http://localhost:${PORT}`);
            logging_1.appLogger.info(`🎯 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            logging_1.appLogger.info(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
            logging_1.appLogger.info(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : '❌ NOT CONFIGURED'}`);
            console.log('🚀 PINOVARA Backend Server Started');
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Server: http://localhost:${PORT}`);
            console.log(`🎯 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
            console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : '❌ NOT CONFIGURED'}`);
            console.log('=====================================');
        });
    }
    catch (error) {
        logging_1.appLogger.error('Failed to start server', error);
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    logging_1.appLogger.info('Received SIGINT, shutting down gracefully');
    console.log('\n🛑 Shutting down server...');
    await prisma.$disconnect();
    logging_1.appLogger.info('Database disconnected');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logging_1.appLogger.info('Received SIGTERM, shutting down gracefully');
    console.log('\n🛑 Shutting down server...');
    await prisma.$disconnect();
    logging_1.appLogger.info('Database disconnected');
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    logging_1.appLogger.error('Uncaught Exception', error);
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logging_1.appLogger.error('Unhandled Rejection', { reason, promise });
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map