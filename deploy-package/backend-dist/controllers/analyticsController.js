"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analyticsService_1 = __importDefault(require("../services/analyticsService"));
const api_1 = require("../types/api");
class AnalyticsController {
    async getMetrics(req, res) {
        try {
            const metrics = await analyticsService_1.default.getSystemMetrics();
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: {
                    message: 'Erro ao buscar métricas do sistema',
                    statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR
                },
                timestamp: new Date().toISOString()
            });
        }
    }
}
exports.analyticsController = new AnalyticsController();
//# sourceMappingURL=analyticsController.js.map