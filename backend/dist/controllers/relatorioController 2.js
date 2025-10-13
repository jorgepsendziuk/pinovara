"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relatorioController = void 0;
const relatorioService_1 = require("../services/relatorioService");
exports.relatorioController = {
    /**
     * GET /api/organizacoes/:id/relatorio/pdf
     * Gera relatório PDF da organização
     */
    async gerarPDF(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            if (isNaN(organizacaoId)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de organização inválido'
                });
            }
            const pdfStream = await relatorioService_1.relatorioService.gerarRelatorioPDF(organizacaoId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio_org_${organizacaoId}.pdf`);
            pdfStream.pipe(res);
        }
        catch (error) {
            console.error('Erro ao gerar relatório PDF:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao gerar relatório PDF'
            });
        }
    }
};
//# sourceMappingURL=relatorioController.js.map