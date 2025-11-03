"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auditService_1 = __importDefault(require("../services/auditService"));
const api_1 = require("../types/api");
class AuditController {
    /**
     * GET /admin/audit-logs
     * Listar logs de auditoria com filtros
     */
    async getAuditLogs(req, res) {
        try {
            const { action, entity, userId, startDate, endDate, page = 1, limit = 20 } = req.query;
            const filters = {
                action: action,
                entity: entity,
                userId: userId ? parseInt(userId) : undefined,
                startDate: startDate,
                endDate: endDate,
                page: parseInt(page),
                limit: parseInt(limit)
            };
            const result = await auditService_1.default.getAuditLogs(filters);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    /**
     * GET /admin/audit-logs/stats
     * Buscar estatísticas de auditoria
     */
    async getAuditStats(req, res) {
        try {
            const stats = await auditService_1.default.getAuditStats();
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    /**
     * GET /admin/audit-logs/export
     * Exportar logs de auditoria para CSV
     */
    async exportAuditLogs(req, res) {
        try {
            const { action, entity, userId, startDate, endDate } = req.query;
            const filters = {
                action: action,
                entity: entity,
                userId: userId ? parseInt(userId) : undefined,
                startDate: startDate,
                endDate: endDate
            };
            const csvContent = await auditService_1.default.exportAuditLogs(filters);
            // Configurar headers para download
            const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.status(api_1.HttpStatus.OK).send(csvContent);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    /**
     * Tratar erros de forma padronizada
     */
    handleError(error, res) {
        console.error('❌ [AuditController] Error:', error);
        res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                message: 'Erro interno do servidor',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR
            },
            timestamp: new Date().toISOString()
        });
    }
}
exports.default = new AuditController();
