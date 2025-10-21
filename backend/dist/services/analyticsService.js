"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const googleAnalyticsService_1 = __importDefault(require("./googleAnalyticsService"));
class AnalyticsService {
    async getSystemMetrics() {
        console.log('📊 Buscando métricas do sistema...');
        const [usuarios, organizacoes, tecnicos, qualidadeDados, atividades] = await Promise.all([
            this.getUsuariosMetrics(),
            this.getOrganizacoesMetrics(),
            this.getTecnicosMetrics(),
            this.getQualidadeDadosMetrics(),
            this.getAtividadesMetrics()
        ]);
        console.log('✅ Métricas internas carregadas');
        let googleAnalyticsData = null;
        try {
            if (googleAnalyticsService_1.default.isReady()) {
                console.log('📈 Buscando métricas do Google Analytics...');
                googleAnalyticsData = await googleAnalyticsService_1.default.getAllMetrics();
                if (googleAnalyticsData) {
                    console.log('✅ Métricas do Google Analytics carregadas');
                }
            }
            else {
                console.log('⚠️ Google Analytics não configurado. Retornando apenas métricas internas.');
            }
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas do Google Analytics:', error);
        }
        return {
            usuarios,
            organizacoes,
            tecnicos,
            qualidadeDados,
            atividades,
            googleAnalytics: googleAnalyticsData
        };
    }
    async getUsuariosMetrics() {
        const totalUsuarios = await database_1.default.users.count();
        const usuariosAtivos = await database_1.default.users.count({
            where: { active: true }
        });
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
        const novosUsuarios = await database_1.default.users.count({
            where: {
                createdAt: {
                    gte: seteDiasAtras
                }
            }
        });
        const usuariosPorRole = await database_1.default.user_roles.groupBy({
            by: ['roleId'],
            _count: {
                userId: true
            }
        });
        const rolesMap = await database_1.default.roles.findMany({
            select: { id: true, name: true }
        });
        const porRole = usuariosPorRole.map(ur => {
            const role = rolesMap.find(r => r.id === ur.roleId);
            return {
                role: role?.name || 'Desconhecido',
                count: ur._count.userId
            };
        });
        return {
            total: totalUsuarios,
            ativos: usuariosAtivos,
            novosUltimos7Dias: novosUsuarios,
            porRole
        };
    }
    async getOrganizacoesMetrics() {
        const totalOrganizacoes = await database_1.default.organizacao.count({
            where: { removido: false }
        });
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
        const novasUltimos7Dias = await database_1.default.organizacao.count({
            where: {
                removido: false,
                creation_date: {
                    gte: seteDiasAtras
                }
            }
        });
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        const novasUltimos30Dias = await database_1.default.organizacao.count({
            where: {
                removido: false,
                creation_date: {
                    gte: trintaDiasAtras
                }
            }
        });
        const porEstado = await database_1.default.$queryRaw `
      SELECT 
        COALESCE(e.descricao, 'Não informado') as estado,
        COUNT(*)::bigint as count
      FROM pinovara.organizacao o
      LEFT JOIN pinovara_aux.estado e ON o.estado = e.id
      WHERE o.removido = false
      GROUP BY e.descricao
      ORDER BY count DESC
      LIMIT 10
    `;
        const crescimentoDiario = await database_1.default.$queryRaw `
      SELECT 
        TO_CHAR(DATE(_creation_date), 'DD/MM') as data,
        COUNT(*)::bigint as total
      FROM pinovara.organizacao
      WHERE removido = false
        AND _creation_date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(_creation_date)
      ORDER BY DATE(_creation_date) ASC
    `;
        return {
            total: totalOrganizacoes,
            novasUltimos7Dias,
            novasUltimos30Dias,
            porEstado: porEstado.map(p => ({
                estado: p.estado,
                count: Number(p.count)
            })),
            crescimentoDiario: crescimentoDiario.map(c => ({
                data: c.data,
                total: Number(c.total)
            }))
        };
    }
    async getTecnicosMetrics() {
        const tecnicos = await database_1.default.$queryRaw `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(o.id)::bigint as total
      FROM pinovara.users u
      INNER JOIN pinovara.organizacao o ON o.id_tecnico = u.id
      WHERE o.removido = false
      GROUP BY u.id, u.name, u.email
      ORDER BY total DESC
      LIMIT 10
    `;
        return {
            total: tecnicos.length,
            organizacoesPorTecnico: tecnicos.map(t => ({
                tecnico: t.name,
                email: t.email,
                totalOrganizacoes: Number(t.total)
            }))
        };
    }
    async getQualidadeDadosMetrics() {
        const totalOrganizacoes = await database_1.default.organizacao.count({
            where: { removido: false }
        });
        const comGPS = await database_1.default.organizacao.count({
            where: {
                removido: false,
                gps_lat: { not: null },
                gps_lng: { not: null }
            }
        });
        const semGPS = totalOrganizacoes - comGPS;
        const percentualComGPS = totalOrganizacoes > 0
            ? Math.round((comGPS / totalOrganizacoes) * 100)
            : 0;
        const vinculadas = await database_1.default.organizacao.count({
            where: {
                removido: false,
                id_tecnico: { not: null }
            }
        });
        const naoVinculadas = totalOrganizacoes - vinculadas;
        const percentualVinculadas = totalOrganizacoes > 0
            ? Math.round((vinculadas / totalOrganizacoes) * 100)
            : 0;
        return {
            organizacoesComGPS: comGPS,
            organizacoesSemGPS: semGPS,
            percentualComGPS,
            organizacoesVinculadas: vinculadas,
            organizacoesNaoVinculadas: naoVinculadas,
            percentualVinculadas
        };
    }
    async getAtividadesMetrics() {
        const totalAuditLogs = await database_1.default.audit_logs.count();
        const atividadesPorDia = await database_1.default.$queryRaw `
      SELECT 
        TO_CHAR(DATE("createdAt"), 'DD/MM') as data,
        COUNT(*)::bigint as count
      FROM pinovara.audit_logs
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;
        const acoesMaisComuns = await database_1.default.audit_logs.groupBy({
            by: ['action'],
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });
        return {
            totalAuditLogs,
            atividadesPorDia: atividadesPorDia.map(a => ({
                data: a.data,
                count: Number(a.count)
            })),
            acoesMaisComuns: acoesMaisComuns.map(a => ({
                acao: a.action,
                count: a._count.id
            }))
        };
    }
}
exports.default = new AnalyticsService();
//# sourceMappingURL=analyticsService.js.map