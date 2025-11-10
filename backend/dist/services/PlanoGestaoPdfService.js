"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const stream_1 = require("stream");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const PlanoGestaoService_1 = __importDefault(require("./PlanoGestaoService"));
const prisma = new client_1.PrismaClient();
class PlanoGestaoPdfService {
    formatDate(date) {
        if (!date)
            return '-';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime()))
            return '-';
        return d.toLocaleDateString('pt-BR');
    }
    calcularStatus(acao) {
        if (acao.suprimida) {
            return 'Ignorada';
        }
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const inicio = acao.data_inicio ? new Date(acao.data_inicio) : null;
        const termino = acao.data_termino ? new Date(acao.data_termino) : null;
        if (!inicio && !termino) {
            return 'Não iniciado';
        }
        if (inicio && termino && termino < hoje) {
            return 'Concluído';
        }
        return 'Pendente';
    }
    renderHeader(doc, nomeOrganizacao) {
        doc.rect(0, 0, doc.page.width, 100).fill('#f8f9fa');
        doc.strokeColor('#056839')
            .lineWidth(3)
            .moveTo(0, 100)
            .lineTo(doc.page.width, 100)
            .stroke();
        const logoPaths = [
            path_1.default.join(__dirname, '../../public/pinovara.png'),
            path_1.default.join(__dirname, '../../../frontend/public/pinovara.png'),
            path_1.default.join(__dirname, '../../../deploy-package/pinovara.png')
        ];
        for (const logoPath of logoPaths) {
            if (fs_1.default.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 50, 25, { width: 60 });
                    break;
                }
                catch (e) {
                }
            }
        }
        doc.fillColor('#056839')
            .font('Helvetica-Bold')
            .fontSize(16)
            .text('Plano de Gestão - Sistema PINOVARA', 50, 30, { align: 'center' });
        doc.fillColor('#3b2313')
            .font('Helvetica')
            .fontSize(12)
            .text(nomeOrganizacao, 50, 52, { align: 'center' });
        doc.fillColor('#666')
            .fontSize(10)
            .text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 50, 68, { align: 'center' });
        doc.moveDown();
        doc.y = 120;
    }
    ensureSpace(doc, neededHeight) {
        const bottomMargin = 80;
        if (doc.y + neededHeight > doc.page.height - bottomMargin) {
            doc.addPage();
            doc.y = 80;
        }
    }
    renderPlano(doc, plano, indice) {
        if (indice > 0) {
            doc.addPage();
            doc.y = 60;
        }
        doc.fillColor('#056839')
            .font('Helvetica-Bold')
            .fontSize(15)
            .text(plano.titulo, { continued: false });
        doc.fillColor('#3b2313')
            .font('Helvetica')
            .fontSize(11)
            .text(`Categoria: ${plano.tipo}`, { lineGap: 6 });
        doc.moveDown();
        plano.grupos.forEach((grupo) => {
            this.ensureSpace(doc, 60);
            doc.fillColor('#056839')
                .font('Helvetica-Bold')
                .fontSize(13)
                .text(grupo.nome || 'Grupo Sem Nome', { lineGap: 6 });
            grupo.acoes.forEach((acao) => {
                this.ensureSpace(doc, 80);
                const status = this.calcularStatus(acao);
                const tituloAcao = acao.acao || acao.acao_modelo || 'Ação sem descrição';
                const isPersonalizada = Boolean(acao.adicionada);
                doc.fillColor('#3b2313')
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text(`• ${tituloAcao}${isPersonalizada ? ' (Personalizada)' : ''}`, { lineGap: 4 });
                doc.fillColor('#374151')
                    .font('Helvetica')
                    .fontSize(10)
                    .text(`Status: ${status}`, { indent: 16, lineGap: 2 });
                if (acao.responsavel) {
                    doc.text(`Responsável: ${acao.responsavel}`, { indent: 16, lineGap: 2 });
                }
                const periodo = `${this.formatDate(acao.data_inicio)} - ${this.formatDate(acao.data_termino)}`;
                if (periodo !== '- - -') {
                    doc.text(`Período: ${periodo}`, { indent: 16, lineGap: 2 });
                }
                if (acao.como_sera_feito) {
                    doc.text(`Como será feito: ${acao.como_sera_feito}`, { indent: 16, lineGap: 2 });
                }
                if (acao.recursos) {
                    doc.text(`Recursos: ${acao.recursos}`, { indent: 16, lineGap: 2 });
                }
                doc.moveDown(0.6);
            });
            doc.moveDown();
        });
    }
    async gerarPdfPlanoGestao(idOrganizacao) {
        const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
        const stream = new stream_1.PassThrough();
        doc.pipe(stream);
        try {
            const dadosPlano = await PlanoGestaoService_1.default.getPlanoGestao(idOrganizacao);
            const organizacao = await prisma.organizacao.findUnique({
                where: { id: idOrganizacao },
                select: { nome: true }
            });
            const nomeOrganizacao = organizacao?.nome || `Organização ${idOrganizacao}`;
            const planosFiltrados = dadosPlano.planos
                .map(plano => ({
                ...plano,
                grupos: plano.grupos
                    .map(grupo => ({
                    ...grupo,
                    acoes: grupo.acoes.filter(acao => !acao.suprimida)
                }))
                    .filter(grupo => grupo.acoes.length > 0)
            }))
                .filter(plano => plano.grupos.length > 0);
            this.renderHeader(doc, nomeOrganizacao);
            doc.fillColor('#3b2313')
                .font('Helvetica-Bold')
                .fontSize(14)
                .text('Visão Geral', { lineGap: 6 });
            doc.fillColor('#374151')
                .font('Helvetica')
                .fontSize(11)
                .text(`Total de planos com ações ativas: ${planosFiltrados.length}`, { lineGap: 4 });
            const totalAcoesAtivas = planosFiltrados.reduce((total, plano) => total + plano.grupos.reduce((acc, grupo) => acc + grupo.acoes.length, 0), 0);
            doc.text(`Total de ações ativas (considerando apenas as não ignoradas): ${totalAcoesAtivas}`, { lineGap: 4 });
            doc.moveDown();
            if (dadosPlano.plano_gestao_rascunho) {
                doc.fillColor('#056839')
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text('Rascunho / Notas Colaborativas', { lineGap: 6 });
                doc.fillColor('#374151')
                    .font('Helvetica')
                    .fontSize(10)
                    .text(dadosPlano.plano_gestao_rascunho, { width: doc.page.width - 100, lineGap: 4 });
                doc.moveDown();
            }
            if (dadosPlano.plano_gestao_relatorio_sintetico) {
                doc.fillColor('#056839')
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text('Relatório Sintético', { lineGap: 6 });
                doc.fillColor('#374151')
                    .font('Helvetica')
                    .fontSize(10)
                    .text(dadosPlano.plano_gestao_relatorio_sintetico, { width: doc.page.width - 100, lineGap: 4 });
                doc.moveDown();
            }
            if (planosFiltrados.length === 0) {
                doc.fillColor('#b91c1c')
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text('Não há ações ativas para este plano de gestão (todas as ações estão ignoradas).', { lineGap: 6 });
            }
            else {
                planosFiltrados.forEach((plano, index) => this.renderPlano(doc, plano, index));
            }
            doc.end();
            return stream;
        }
        catch (error) {
            stream.destroy(error);
            throw error;
        }
    }
}
exports.default = new PlanoGestaoPdfService();
//# sourceMappingURL=PlanoGestaoPdfService.js.map