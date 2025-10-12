"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const api_1 = require("../types/api");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Informações de sistema
const startTime = Date.now();
const version = process.env.npm_package_version || '2.0.0';
// Health check básico
router.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - startTime) / 1000),
            version,
            environment: process.env.NODE_ENV || 'development',
            services: {
                api: 'up',
                database: 'checking'
            }
        };
        // Teste rápido de conexão com banco
        try {
            await prisma.$queryRaw `SELECT 1`;
            healthData.services.database = 'up';
        }
        catch (error) {
            healthData.services.database = 'down';
            healthData.status = 'degraded';
        }
        const statusCode = healthData.status === 'healthy' ? api_1.HttpStatus.OK : api_1.HttpStatus.SERVICE_UNAVAILABLE;
        res.status(statusCode).json({
            success: true,
            data: healthData,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(api_1.HttpStatus.SERVICE_UNAVAILABLE).json({
            success: false,
            data: {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Health check failed'
            }
        });
    }
});
// Health check detalhado
router.get('/health/detailed', async (req, res) => {
    const checks = {};
    let overallStatus = 'healthy';
    try {
        // 1. Database connectivity
        const dbStart = Date.now();
        try {
            await prisma.$queryRaw `SELECT 1 as test`;
            const dbTime = Date.now() - dbStart;
            checks.database = {
                status: 'up',
                responseTime: `${dbTime}ms`,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            checks.database = {
                status: 'down',
                error: 'Connection failed',
                timestamp: new Date().toISOString()
            };
            overallStatus = 'unhealthy';
        }
        // 2. Database schema validation
        try {
            const userCount = await prisma.users.count();
            const orgCount = await prisma.organizacao.count();
            checks.schema = {
                status: 'up',
                statistics: {
                    users: userCount,
                    organizations: orgCount
                },
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            checks.schema = {
                status: 'down',
                error: 'Schema validation failed',
                timestamp: new Date().toISOString()
            };
            overallStatus = 'degraded';
        }
        // 3. Environment variables
        const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
        const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
        checks.environment = {
            status: missingEnvs.length === 0 ? 'up' : 'degraded',
            required: requiredEnvs,
            missing: missingEnvs,
            nodeEnv: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        };
        if (missingEnvs.length > 0) {
            overallStatus = 'degraded';
        }
        // 4. Memory usage
        const memoryUsage = process.memoryUsage();
        const memoryMB = {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
        };
        checks.memory = {
            status: memoryMB.heapUsed < 500 ? 'up' : 'warning',
            usage: memoryMB,
            timestamp: new Date().toISOString()
        };
        // 5. System info
        checks.system = {
            status: 'up',
            uptime: Math.floor((Date.now() - startTime) / 1000),
            version,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            pid: process.pid,
            timestamp: new Date().toISOString()
        };
        const statusCode = overallStatus === 'healthy' ? api_1.HttpStatus.OK :
            overallStatus === 'degraded' ? 299 : api_1.HttpStatus.SERVICE_UNAVAILABLE;
        res.status(statusCode).json({
            success: true,
            data: {
                status: overallStatus,
                timestamp: new Date().toISOString(),
                checks
            }
        });
    }
    catch (error) {
        console.error('Detailed health check failed:', error);
        res.status(api_1.HttpStatus.SERVICE_UNAVAILABLE).json({
            success: false,
            data: {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Detailed health check failed',
                checks
            }
        });
    }
});
// Readiness check (para Kubernetes/Docker)
router.get('/ready', async (req, res) => {
    try {
        // Verificar se a aplicação está pronta para receber tráfego
        // 1. Database deve estar acessível
        await prisma.$queryRaw `SELECT 1`;
        // 2. Variáveis essenciais devem estar configuradas
        if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
            throw new Error('Required environment variables not configured');
        }
        res.status(api_1.HttpStatus.OK).json({
            success: true,
            data: {
                status: 'ready',
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(api_1.HttpStatus.SERVICE_UNAVAILABLE).json({
            success: false,
            data: {
                status: 'not ready',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Readiness check failed'
            }
        });
    }
});
// Liveness check (para Kubernetes/Docker)
router.get('/live', (req, res) => {
    // Check básico se o processo está vivo e responsivo
    res.status(api_1.HttpStatus.OK).json({
        success: true,
        data: {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - startTime) / 1000)
        }
    });
});
// Metrics endpoint (Prometheus-compatible)
router.get('/metrics', async (req, res) => {
    try {
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const memoryUsage = process.memoryUsage();
        // Métricas básicas do banco
        let dbMetrics = {};
        try {
            const userCount = await prisma.users.count();
            const orgCount = await prisma.organizacao.count();
            dbMetrics = { userCount, orgCount };
        }
        catch (error) {
            // Banco não disponível
        }
        const metrics = {
            // System metrics
            pinovara_uptime_seconds: uptime,
            pinovara_memory_rss_bytes: memoryUsage.rss,
            pinovara_memory_heap_used_bytes: memoryUsage.heapUsed,
            pinovara_memory_heap_total_bytes: memoryUsage.heapTotal,
            // Application metrics
            pinovara_version_info: { version, nodeVersion: process.version },
            // Database metrics (se disponível)
            ...Object.keys(dbMetrics).reduce((acc, key) => {
                acc[`pinovara_${key}`] = dbMetrics[key];
                return acc;
            }, {}),
            // Timestamp
            pinovara_last_update_timestamp: Date.now()
        };
        // Formato Prometheus (opcional)
        if (req.headers.accept?.includes('text/plain')) {
            let prometheusFormat = '';
            Object.entries(metrics).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    // Labels para métricas complexas
                    prometheusFormat += `# TYPE ${key} gauge\n`;
                    Object.entries(value).forEach(([label, labelValue]) => {
                        prometheusFormat += `${key}{${label}="${labelValue}"} 1\n`;
                    });
                }
                else {
                    prometheusFormat += `# TYPE ${key} gauge\n${key} ${value}\n`;
                }
            });
            res.setHeader('Content-Type', 'text/plain');
            res.send(prometheusFormat);
        }
        else {
            // Formato JSON
            res.json({
                success: true,
                data: {
                    metrics,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    catch (error) {
        res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                message: 'Failed to collect metrics',
                timestamp: new Date().toISOString()
            }
        });
    }
});
// Info endpoint
router.get('/info', (req, res) => {
    res.json({
        success: true,
        data: {
            application: 'PINOVARA',
            version,
            description: 'Sistema PINOVARA - Backend API',
            author: 'PINOVARA Team',
            license: 'MIT',
            repository: 'https://github.com/your-org/pinovara',
            documentation: 'https://docs.pinovaraufba.com.br',
            support: 'https://support.pinovaraufba.com.br',
            build: {
                timestamp: process.env.BUILD_TIMESTAMP || 'unknown',
                commit: process.env.GIT_COMMIT || 'unknown',
                branch: process.env.GIT_BRANCH || 'unknown'
            },
            runtime: {
                node: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: Math.floor((Date.now() - startTime) / 1000),
                environment: process.env.NODE_ENV || 'development'
            },
            timestamp: new Date().toISOString()
        }
    });
});
exports.default = router;
//# sourceMappingURL=healthRoutes.js.map