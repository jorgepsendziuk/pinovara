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
        const headerHeight = 75;
        doc.rect(0, 0, doc.page.width, headerHeight).fill('#f8f9fa');
        doc.strokeColor('#056839')
            .lineWidth(1.5)
            .moveTo(0, headerHeight)
            .lineTo(doc.page.width, headerHeight)
            .stroke();
        const logoPaths = [
            path_1.default.join(__dirname, '../../public/pinovara.png'),
            path_1.default.join(__dirname, '../../../frontend/public/pinovara.png'),
            path_1.default.join(__dirname, '../../../deploy-package/pinovara.png')
        ];
        for (const logoPath of logoPaths) {
            if (fs_1.default.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 40, 12, { width: 45 });
                    break;
                }
                catch (e) {
                }
            }
        }
        const textStartX = 100;
        const textWidth = doc.page.width - textStartX - 40;
        let currentY = 15;
        doc.fillColor('#056839')
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('Plano de Gestão - Sistema PINOVARA', textStartX, currentY, { width: textWidth, align: 'center' });
        currentY += 14;
        doc.fillColor('#3b2313')
            .font('Helvetica')
            .fontSize(9)
            .text(nomeOrganizacao, textStartX, currentY, { width: textWidth, align: 'center', lineGap: 1.5 });
        const nomeHeight = doc.heightOfString(nomeOrganizacao, { width: textWidth, lineGap: 1.5 });
        currentY += nomeHeight + 3;
        doc.fillColor('#666')
            .fontSize(7)
            .text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, textStartX, currentY, { width: textWidth, align: 'center' });
        doc.y = headerHeight - 3;
    }
    ensureSpace(doc, neededHeight, onPageBreak) {
        const bottomMargin = doc.page?.margins?.bottom ?? 60;
        const topMargin = doc.page?.margins?.top ?? 60;
        if (doc.y + neededHeight > doc.page.height - bottomMargin) {
            doc.addPage({ size: 'A4', layout: 'landscape', margin: doc.page.margins });
            doc.y = topMargin;
            if (onPageBreak) {
                onPageBreak();
            }
        }
    }
    getColumnDefinitions(contentWidth) {
        return [
            { key: 'acao', label: 'Ação', width: contentWidth * 0.28 },
            { key: 'responsavel', label: 'Responsável', width: contentWidth * 0.18 },
            { key: 'periodo', label: 'Período', width: contentWidth * 0.14 },
            { key: 'como', label: 'Como será feito?', width: contentWidth * 0.24 },
            { key: 'recursos', label: 'Recursos', width: contentWidth * 0.12 },
            { key: 'status', label: 'Status', width: contentWidth * 0.08 }
        ];
    }
    getStatusColor(status) {
        const palette = {
            'Não iniciado': '#fbbf24',
            'Pendente': '#f97316',
            'Concluído': '#10b981',
            'Ignorada': '#9ca3af'
        };
        return palette[status] || '#6b7280';
    }
    buildActionRowValues(acao) {
        const tituloAcao = (acao.acao && acao.acao.trim()) || acao.acao_modelo || 'Ação sem descrição';
        const responsavel = acao.responsavel || '-';
        const periodo = `${this.formatDate(acao.data_inicio)} - ${this.formatDate(acao.data_termino)}`;
        const como = acao.como_sera_feito || '-';
        const recursos = acao.recursos || '-';
        const status = this.calcularStatus(acao);
        return {
            acao: tituloAcao,
            responsavel,
            periodo,
            como,
            recursos,
            status
        };
    }
    isAcaoRespondida(acao) {
        const textual = [acao.acao, acao.responsavel, acao.como_sera_feito, acao.recursos]
            .filter(Boolean)
            .map(valor => (typeof valor === 'string' ? valor.trim() : valor))
            .filter(valor => valor && valor !== '---');
        if (textual.length > 0) {
            return true;
        }
        if (acao.data_inicio || acao.data_termino) {
            return true;
        }
        return false;
    }
    drawGroupHeader(doc, title, startX, totalWidth, continuation = false) {
        const headerHeight = 22;
        doc.save();
        doc.roundedRect(startX, doc.y, totalWidth, headerHeight, 6).fill('#056839');
        doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(10)
            .text(continuation ? `${title} (continuação)` : title, startX + 8, doc.y + 6, { width: totalWidth - 16 });
        doc.restore();
        doc.fillColor('#1f2937');
        doc.y += headerHeight + 4;
    }
    drawTableHeader(doc, startX, columns) {
        const headerHeight = 20;
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
        doc.save();
        doc.rect(startX, doc.y, totalWidth, headerHeight).fill('#3b2313');
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
        let currentX = startX;
        columns.forEach(col => {
            doc.text(col.label, currentX + 6, doc.y + 6, { width: col.width - 12 });
            currentX += col.width;
        });
        doc.restore();
        doc.fillColor('#1f2937');
        doc.y += headerHeight;
    }
    calculateActionRowHeight(doc, columns, acao) {
        const paddingX = 6;
        const paddingY = 4;
        const values = this.buildActionRowValues(acao);
        doc.save();
        doc.font('Helvetica').fontSize(9);
        const heights = columns.map(col => {
            if (col.key === 'status') {
                return 14;
            }
            const text = values[col.key] || '-';
            return doc.heightOfString(text, { width: col.width - paddingX * 2, align: 'left', lineGap: 1 });
        });
        doc.restore();
        return Math.max(...heights) + paddingY * 2;
    }
    drawActionRow(doc, startX, columns, acao, rowIndex) {
        const paddingX = 6;
        const paddingY = 4;
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
        const values = this.buildActionRowValues(acao);
        const rowHeight = this.calculateActionRowHeight(doc, columns, acao);
        const rowTop = doc.y;
        doc.save();
        doc.rect(startX, rowTop, totalWidth, rowHeight).fill(rowIndex % 2 === 0 ? '#ffffff' : '#f4f8f5');
        doc.strokeColor('#d1d5db').lineWidth(0.3).rect(startX, rowTop, totalWidth, rowHeight).stroke();
        doc.fillColor('#1f2937').font('Helvetica').fontSize(9);
        let currentX = startX;
        columns.forEach(col => {
            const textX = currentX + paddingX;
            const textY = rowTop + paddingY;
            const value = values[col.key] || '-';
            if (col.key === 'status') {
                const pillWidth = Math.min(col.width - paddingX * 2, doc.widthOfString(value, { font: 'Helvetica-Bold', size: 8 }) + 10);
                const pillHeight = 14;
                const pillColor = this.getStatusColor(value);
                doc.save();
                doc.roundedRect(textX, textY, pillWidth, pillHeight, 4).fill(pillColor);
                doc.fillColor('#ffffff')
                    .font('Helvetica-Bold')
                    .fontSize(8)
                    .text(value, textX, textY + 2, { width: pillWidth, align: 'center' });
                doc.restore();
            }
            else {
                doc.text(value, textX, textY, { width: col.width - paddingX * 2, align: 'left', lineGap: 1 });
            }
            currentX += col.width;
        });
        doc.restore();
        doc.fillColor('#1f2937');
        doc.y = rowTop + rowHeight;
    }
    renderFooter(doc, pageNumber, totalPages) {
        const footerHeight = 30;
        const footerY = doc.page.height - footerHeight;
        const currentY = doc.y;
        doc.save();
        doc.rect(0, footerY, doc.page.width, footerHeight).fill('#f8f9fa');
        doc.strokeColor('#056839')
            .lineWidth(1)
            .moveTo(0, footerY)
            .lineTo(doc.page.width, footerY)
            .stroke();
        doc.fillColor('#3b2313')
            .font('Helvetica')
            .fontSize(8)
            .text(`Página ${pageNumber} de ${totalPages}`, doc.page.width / 2, footerY + 10, { align: 'center', width: doc.page.width - 80 });
        doc.restore();
        doc.y = currentY;
    }
    addPageWithHeader(doc, nomeOrganizacao, isFirstPage = false, pageNumber, totalPages) {
        const currentMargins = doc.page?.margins;
        doc.addPage({ size: 'A4', layout: 'landscape', margin: currentMargins });
        if (isFirstPage) {
            this.renderHeader(doc, nomeOrganizacao);
        }
        else {
            doc.y = currentMargins?.top ?? 40;
        }
        if (pageNumber !== undefined) {
            const currentTotal = totalPages || pageNumber;
            this.renderFooter(doc, pageNumber, currentTotal);
        }
    }
    drawInfoCard(doc, x, y, width, height, options) {
        doc.save();
        doc.roundedRect(x, y, width, height, 4).fill('#ffffff');
        doc.strokeColor('#e5e7eb').lineWidth(0.3).roundedRect(x, y, width, height, 4).stroke();
        doc.fillColor(options.cor)
            .font('Helvetica-Bold')
            .fontSize(7)
            .text(options.titulo, x + 4, y + 4, { width: width - 8, lineGap: 0, ellipsis: true });
        doc.fillColor('#111827')
            .font('Helvetica-Bold')
            .fontSize(13)
            .text(options.valor, x + 4, y + 13, { width: width - 8, lineGap: 0, ellipsis: true });
        if (options.descricao) {
            doc.fillColor('#6b7280')
                .font('Helvetica')
                .fontSize(6)
                .text(options.descricao, x + 4, y + height - 10, { width: width - 8, lineGap: 0, ellipsis: true });
        }
        doc.restore();
    }
    renderResumo(doc, stats, tecnico, evidencias) {
        const marginLeft = doc.page?.margins?.left ?? 40;
        const marginRight = doc.page?.margins?.right ?? 40;
        const availableWidth = doc.page.width - marginLeft - marginRight;
        const startY = doc.y;
        doc.fillColor('#3b2313')
            .font('Helvetica')
            .fontSize(10);
        const texto = `Ações Respondidas: ${stats.respondidas}/${stats.total} | Não iniciado: ${stats.status['Não iniciado'] || 0} | Pendente: ${stats.status['Pendente'] || 0} | Concluído: ${stats.status['Concluído'] || 0} | Técnico: ${tecnico?.name || '-'} | Evidências: ${evidencias.filter(ev => ev.tipo === 'foto').length} fotos / ${evidencias.filter(ev => ev.tipo !== 'foto').length} documentos`;
        doc.text(texto, marginLeft, startY, { width: availableWidth, align: 'left' });
        doc.y += 15;
    }
    renderTextBlock(doc, title, text) {
        const marginLeft = doc.page?.margins?.left ?? 40;
        const marginRight = doc.page?.margins?.right ?? 40;
        const contentWidth = doc.page.width - marginLeft - marginRight;
        doc.fillColor('#056839')
            .font('Helvetica-Bold')
            .fontSize(10)
            .text(title, marginLeft, doc.y, { width: contentWidth });
        doc.y += 12;
        doc.fillColor('#374151')
            .font('Helvetica')
            .fontSize(9)
            .text(text, marginLeft, doc.y, { width: contentWidth, align: 'left' });
        const textHeight = doc.heightOfString(text, { width: contentWidth });
        doc.y += textHeight + 10;
    }
    renderEvidencias(doc, evidencias, nomeOrganizacao) {
        if (!evidencias.length) {
            return;
        }
        const marginLeft = doc.page?.margins?.left ?? 40;
        const marginRight = doc.page?.margins?.right ?? 40;
        const availableWidth = doc.page.width - marginLeft - marginRight;
        const bottomMargin = doc.page?.margins?.bottom ?? 60;
        doc.__pageCount = (doc.__pageCount || 1) + 1;
        this.addPageWithHeader(doc, nomeOrganizacao, false, doc.__pageCount, doc.__pageCount);
        doc.fillColor('#056839')
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('Evidências Registradas', marginLeft, doc.y, { width: availableWidth });
        doc.y += 12;
        const fotos = evidencias.filter(ev => ev.tipo === 'foto');
        const documentos = evidencias.filter(ev => ev.tipo !== 'foto');
        if (fotos.length) {
            const imagensPorLinha = 3;
            const espacamento = 10;
            const imagemWidth = (availableWidth - espacamento * (imagensPorLinha - 1)) / imagensPorLinha;
            const imagemHeight = imagemWidth * 0.62;
            doc.fillColor('#3b2313')
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('Fotos / Imagens', marginLeft, doc.y, { width: availableWidth });
            doc.y += 8;
            fotos.forEach((foto, index) => {
                const posicao = index % imagensPorLinha;
                const x = marginLeft + posicao * (imagemWidth + espacamento);
                if (posicao === 0 && doc.y + imagemHeight + 30 > doc.page.height - bottomMargin) {
                    doc.__pageCount = (doc.__pageCount || 1) + 1;
                    this.addPageWithHeader(doc, nomeOrganizacao, false, doc.__pageCount, doc.__pageCount);
                    doc.fillColor('#3b2313')
                        .font('Helvetica-Bold')
                        .fontSize(10)
                        .text('Fotos / Imagens (continuação)', marginLeft, doc.y, { width: availableWidth });
                    doc.y += 8;
                }
                let exibiuImagem = false;
                if (foto.caminho_arquivo && fs_1.default.existsSync(foto.caminho_arquivo)) {
                    try {
                        doc.image(foto.caminho_arquivo, x, doc.y, { width: imagemWidth, height: imagemHeight, fit: [imagemWidth, imagemHeight], align: 'center' });
                        exibiuImagem = true;
                    }
                    catch (error) {
                        exibiuImagem = false;
                    }
                }
                if (!exibiuImagem) {
                    doc.save();
                    doc.roundedRect(x, doc.y, imagemWidth, imagemHeight, 8).fill('#f1f5f9');
                    doc.strokeColor('#cbd5f5').roundedRect(x, doc.y, imagemWidth, imagemHeight, 8).stroke();
                    doc.fillColor('#94a3b8')
                        .font('Helvetica')
                        .fontSize(10)
                        .text('Imagem indisponível', x, doc.y + imagemHeight / 2 - 6, { width: imagemWidth, align: 'center' });
                    doc.restore();
                }
                const legenda = foto.descricao || foto.nome_arquivo;
                doc.fillColor('#374151')
                    .font('Helvetica')
                    .fontSize(8)
                    .text(legenda, x, doc.y + imagemHeight + 3, { width: imagemWidth, align: 'center' });
                if (posicao === imagensPorLinha - 1) {
                    doc.y += imagemHeight + 28;
                }
            });
            if (fotos.length % imagensPorLinha !== 0) {
                doc.y += imagemHeight + 28;
            }
        }
        if (documentos.length) {
            if (doc.y + 100 > doc.page.height - bottomMargin) {
                doc.__pageCount = (doc.__pageCount || 1) + 1;
                this.addPageWithHeader(doc, nomeOrganizacao, false, doc.__pageCount, doc.__pageCount);
            }
            doc.fillColor('#3b2313')
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('Listas / Documentos', marginLeft, doc.y, { width: availableWidth });
            doc.y += 8;
            doc.fillColor('#1f2937').font('Helvetica').fontSize(9);
            documentos.forEach(docItem => {
                if (doc.y + 16 > doc.page.height - bottomMargin) {
                    doc.__pageCount = (doc.__pageCount || 1) + 1;
                    this.addPageWithHeader(doc, nomeOrganizacao, false, doc.__pageCount, doc.__pageCount);
                    doc.fillColor('#3b2313')
                        .font('Helvetica-Bold')
                        .fontSize(10)
                        .text('Listas / Documentos (continuação)', marginLeft, doc.y, { width: availableWidth });
                    doc.y += 8;
                    doc.fillColor('#1f2937').font('Helvetica').fontSize(9);
                }
                const descricao = docItem.descricao || docItem.nome_arquivo;
                doc.circle(marginLeft + 4, doc.y + 4, 1.5).fill('#056839');
                doc.fillColor('#1f2937')
                    .text(descricao, marginLeft + 10, doc.y, { width: availableWidth - 10 });
                doc.y += 14;
            });
        }
    }
    renderPlano(doc, plano, indice, nomeOrganizacao) {
        const marginLeft = doc.page?.margins?.left ?? 40;
        const marginRight = doc.page?.margins?.right ?? 40;
        const marginBottom = doc.page?.margins?.bottom ?? 60;
        const contentWidth = doc.page.width - marginLeft - marginRight;
        const columns = this.getColumnDefinitions(contentWidth);
        const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
        const bottomLimit = doc.page.height - marginBottom;
        if (indice > 0) {
            doc.__pageCount = (doc.__pageCount || 1) + 1;
            const currentPage = doc.__pageCount;
            this.addPageWithHeader(doc, nomeOrganizacao, false, currentPage, currentPage);
        }
        doc.fillColor('#056839')
            .font('Helvetica-Bold')
            .fontSize(13)
            .text(plano.titulo, marginLeft, doc.y, { width: contentWidth });
        doc.fillColor('#3b2313')
            .font('Helvetica')
            .fontSize(9)
            .text(`Categoria: ${plano.tipo}`, marginLeft, doc.y + 14, { width: contentWidth });
        doc.y += 32;
        doc.fillColor('#1f2937').font('Helvetica').fontSize(10);
        plano.grupos.forEach((grupo) => {
            const tituloGrupo = grupo.nome || 'Grupo Sem Nome';
            if (doc.y + 70 > bottomLimit) {
                doc.__pageCount = (doc.__pageCount || 1) + 1;
                this.addPageWithHeader(doc, nomeOrganizacao, false, doc.__pageCount, doc.__pageCount);
            }
            this.drawGroupHeader(doc, tituloGrupo, marginLeft, tableWidth);
            this.drawTableHeader(doc, marginLeft, columns);
            let rowIndex = 0;
            grupo.acoes.forEach((acao) => {
                const rowHeight = this.calculateActionRowHeight(doc, columns, acao);
                if (doc.y + rowHeight > bottomLimit) {
                    doc.__pageCount = (doc.__pageCount || 1) + 1;
                    this.addPageWithHeader(doc, nomeOrganizacao, false, doc.__pageCount, doc.__pageCount);
                    this.drawGroupHeader(doc, tituloGrupo, marginLeft, tableWidth, true);
                    this.drawTableHeader(doc, marginLeft, columns);
                }
                this.drawActionRow(doc, marginLeft, columns, acao, rowIndex);
                rowIndex += 1;
            });
            doc.y += 8;
        });
    }
    async gerarPdfPlanoGestao(idOrganizacao) {
        const doc = new pdfkit_1.default({ margin: 40, size: 'A4', layout: 'landscape' });
        const stream = new stream_1.PassThrough();
        doc.pipe(stream);
        let pageCount = 0;
        try {
            const dadosPlano = await PlanoGestaoService_1.default.getPlanoGestao(idOrganizacao);
            const organizacao = await prisma.organizacao.findUnique({
                where: { id: idOrganizacao },
                select: { nome: true, id_tecnico: true }
            });
            const tecnico = organizacao?.id_tecnico
                ? await prisma.users.findUnique({
                    where: { id: organizacao.id_tecnico },
                    select: { name: true, email: true }
                })
                : null;
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
            pageCount = 1;
            doc.__pageCount = 1;
            this.renderHeader(doc, nomeOrganizacao);
            console.log('✅ Cabeçalho renderizado, doc.y =', doc.y);
            const todasAcoes = planosFiltrados.flatMap(plano => plano.grupos.flatMap(grupo => grupo.acoes));
            const statusCounts = todasAcoes.reduce((acc, acao) => {
                const status = this.calcularStatus(acao);
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            const respondidas = todasAcoes.filter(acao => this.isAcaoRespondida(acao)).length;
            this.renderResumo(doc, {
                respondidas,
                total: todasAcoes.length,
                status: statusCounts
            }, { name: tecnico?.name || null, email: tecnico?.email || null }, dadosPlano.evidencias || []);
            console.log('✅ Resumo renderizado, doc.y =', doc.y);
            const totalPages = doc.__pageCount || 1;
            this.renderFooter(doc, 1, totalPages);
            console.log('✅ Rodapé primeira página adicionado, doc.y =', doc.y);
            if (dadosPlano.plano_gestao_rascunho) {
                this.renderTextBlock(doc, 'Rascunho / Notas Colaborativas', dadosPlano.plano_gestao_rascunho);
                console.log('✅ Rascunho renderizado, doc.y =', doc.y);
            }
            if (dadosPlano.plano_gestao_relatorio_sintetico) {
                this.renderTextBlock(doc, 'Relatório Sintético', dadosPlano.plano_gestao_relatorio_sintetico);
                console.log('✅ Relatório Sintético renderizado, doc.y =', doc.y);
            }
            if (planosFiltrados.length === 0) {
                doc.fillColor('#b91c1c')
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text('Não há ações ativas para este plano de gestão (todas as ações estão ignoradas).', doc.page?.margins?.left ?? 40, doc.y, {
                    width: doc.page.width - ((doc.page?.margins?.left ?? 40) + (doc.page?.margins?.right ?? 40)),
                    lineGap: 6
                });
                doc.y += 20;
                console.log('✅ Mensagem de sem planos renderizada');
            }
            else {
                planosFiltrados.forEach((plano, index) => {
                    console.log(`📋 Renderizando plano ${index + 1}/${planosFiltrados.length}, doc.y =`, doc.y);
                    this.renderPlano(doc, plano, index, nomeOrganizacao);
                });
            }
            this.renderEvidencias(doc, dadosPlano.evidencias || [], nomeOrganizacao);
            console.log('✅ Todos os elementos renderizados. Total de páginas:', doc.__pageCount);
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