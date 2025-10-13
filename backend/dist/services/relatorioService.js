"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.relatorioService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const prisma = new client_1.PrismaClient();
const UPLOAD_DIR = '/var/pinovara/shared/uploads/fotos';
const DOCUMENTS_DIR = '/var/pinovara/shared/uploads/arquivos';
exports.relatorioService = {
    async gerarRelatorioPDF(organizacaoId) {
        const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
        const stream = new stream_1.PassThrough();
        doc.pipe(stream);
        doc.font('Helvetica');
        try {
            const organizacao = await prisma.organizacao.findUnique({
                where: { id: organizacaoId },
                select: {
                    id: true,
                    nome: true,
                    cnpj: true,
                    telefone: true,
                    email: true,
                    data_fundacao: true,
                    organizacao_end_logradouro: true,
                    organizacao_end_bairro: true,
                    organizacao_end_complemento: true,
                    organizacao_end_numero: true,
                    organizacao_end_cep: true,
                    gps_lat: true,
                    gps_lng: true,
                    gps_alt: true,
                    representante_nome: true,
                    representante_cpf: true,
                    representante_rg: true,
                    representante_telefone: true,
                    representante_email: true,
                    representante_end_logradouro: true,
                    representante_end_bairro: true,
                    representante_end_complemento: true,
                    representante_end_numero: true,
                    representante_end_cep: true,
                    representante_funcao: true,
                    estado_organizacao_estadoToestado: true,
                    municipio_ibge: true,
                    organizacao_foto: {
                        orderBy: { ordinal_number: 'asc' }
                    },
                    organizacao_arquivo: {
                        orderBy: { ordinal_number: 'asc' }
                    },
                    organizacao_participante: true
                }
            });
            if (!organizacao) {
                throw new Error('Organização não encontrada');
            }
            doc.rect(0, 0, doc.page.width, 100)
                .fill('#f8f9fa');
            doc.strokeColor('#056839')
                .lineWidth(3)
                .moveTo(0, 100)
                .lineTo(doc.page.width, 100)
                .stroke();
            let logoAdded = false;
            const logoPaths = [
                path_1.default.join(__dirname, '../../public/pinovara.png'),
                path_1.default.join(__dirname, '../../../frontend/public/pinovara.png'),
                path_1.default.join(__dirname, '../../../deploy-package/pinovara.png')
            ];
            for (const logoPath of logoPaths) {
                if (fs_1.default.existsSync(logoPath)) {
                    try {
                        doc.image(logoPath, 50, 25, { width: 60 });
                        logoAdded = true;
                        break;
                    }
                    catch (e) {
                    }
                }
            }
            const textX = logoAdded ? 120 : 50;
            doc.fillColor('#056839')
                .font('Helvetica-Bold')
                .fontSize(16)
                .text('SISTEMA PINOVARA', textX, 30);
            doc.fillColor('#3b2313')
                .font('Helvetica')
                .fontSize(10)
                .text('Plataforma de Inovação Agroecológica - UFBA', textX, 50);
            doc.fillColor('#666')
                .fontSize(8)
                .text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, textX, 65);
            doc.y = 120;
            doc.fillColor('#3b2313')
                .font('Helvetica-Bold')
                .fontSize(16)
                .text('RELATÓRIO DE ORGANIZAÇÃO', 50, doc.y, { align: 'center' });
            doc.fillColor('#056839')
                .fontSize(14)
                .text(organizacao.nome || 'Sem nome', 50, doc.y + 22, { align: 'center' });
            doc.y += 55;
            doc.strokeColor('#056839')
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(doc.page.width - 50, doc.y)
                .stroke();
            doc.moveDown(1.5);
            const criarTabela2Colunas = (dados) => {
                const colunaEsquerda = [];
                const colunaDireita = [];
                dados.forEach((item, index) => {
                    if (index % 2 === 0) {
                        colunaEsquerda.push(item);
                    }
                    else {
                        colunaDireita.push(item);
                    }
                });
                const maxLinhas = Math.max(colunaEsquerda.length, colunaDireita.length);
                const alturaLinha = 20;
                const alturaTotalTabela = maxLinhas * alturaLinha;
                const larguraColuna = (doc.page.width - 100) / 2 - 10;
                doc.strokeColor('#000')
                    .lineWidth(1)
                    .rect(50, doc.y, larguraColuna, alturaTotalTabela)
                    .stroke();
                doc.rect(50 + larguraColuna + 10, doc.y, larguraColuna, alturaTotalTabela)
                    .stroke();
                const startY = doc.y;
                let currentY = startY + 5;
                colunaEsquerda.forEach(([label, value]) => {
                    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000')
                        .text(label, 55, currentY, { width: 100, continued: false });
                    doc.font('Helvetica').fontSize(9)
                        .text(value, 160, currentY, { width: larguraColuna - 110 });
                    currentY += alturaLinha;
                    if (currentY < startY + alturaTotalTabela) {
                        doc.strokeColor('#ddd').lineWidth(0.5)
                            .moveTo(50, currentY - 5)
                            .lineTo(50 + larguraColuna, currentY - 5)
                            .stroke();
                    }
                });
                currentY = startY + 5;
                colunaDireita.forEach(([label, value]) => {
                    const xOffset = 50 + larguraColuna + 10;
                    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000')
                        .text(label, xOffset + 5, currentY, { width: 100, continued: false });
                    doc.font('Helvetica').fontSize(9)
                        .text(value, xOffset + 110, currentY, { width: larguraColuna - 115 });
                    currentY += alturaLinha;
                    if (currentY < startY + alturaTotalTabela) {
                        doc.strokeColor('#ddd').lineWidth(0.5)
                            .moveTo(xOffset, currentY - 5)
                            .lineTo(xOffset + larguraColuna, currentY - 5)
                            .stroke();
                    }
                });
                doc.y = startY + alturaTotalTabela + 20;
            };
            const org = organizacao;
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                .text('DADOS BÁSICOS DA ORGANIZAÇÃO', 50, doc.y);
            doc.moveDown(0.5);
            const tabelaDados = [];
            if (org.nome)
                tabelaDados.push(['Nome:', org.nome]);
            if (org.cnpj)
                tabelaDados.push(['CNPJ:', org.cnpj]);
            if (org.data_fundacao)
                tabelaDados.push(['Data de Fundação:', new Date(org.data_fundacao).toLocaleDateString('pt-BR')]);
            if (org.telefone)
                tabelaDados.push(['Telefone:', org.telefone]);
            if (org.email)
                tabelaDados.push(['E-mail:', org.email]);
            if (org.estado_organizacao_estadoToestado?.descricao)
                tabelaDados.push(['Estado:', org.estado_organizacao_estadoToestado.descricao]);
            if (org.municipio_ibge?.descricao)
                tabelaDados.push(['Município:', org.municipio_ibge.descricao]);
            criarTabela2Colunas(tabelaDados);
            if (doc.y > 650) {
                doc.addPage();
            }
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                .text('ENDEREÇO E LOCALIZAÇÃO', 50, doc.y);
            doc.moveDown(0.5);
            const tabelaEndereco = [];
            if (organizacao.organizacao_end_logradouro)
                tabelaEndereco.push(['Logradouro:', organizacao.organizacao_end_logradouro]);
            if (organizacao.organizacao_end_numero)
                tabelaEndereco.push(['Número:', organizacao.organizacao_end_numero]);
            if (organizacao.organizacao_end_bairro)
                tabelaEndereco.push(['Bairro:', organizacao.organizacao_end_bairro]);
            if (organizacao.organizacao_end_complemento)
                tabelaEndereco.push(['Complemento:', organizacao.organizacao_end_complemento]);
            if (organizacao.organizacao_end_cep)
                tabelaEndereco.push(['CEP:', organizacao.organizacao_end_cep]);
            if (organizacao.gps_lat && organizacao.gps_lng) {
                tabelaEndereco.push(['Latitude:', String(organizacao.gps_lat)]);
                tabelaEndereco.push(['Longitude:', String(organizacao.gps_lng)]);
                if (organizacao.gps_alt)
                    tabelaEndereco.push(['Altitude:', `${organizacao.gps_alt}m`]);
            }
            criarTabela2Colunas(tabelaEndereco);
            if (org.representante_nome || org.organizacao_participante?.length > 0) {
                if (doc.y > 650) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('DADOS DO REPRESENTANTE', 50, doc.y);
                doc.moveDown(0.5);
                const tabelaRepresentante = [];
                if (org.representante_nome)
                    tabelaRepresentante.push(['Nome:', org.representante_nome]);
                if (org.representante_cpf)
                    tabelaRepresentante.push(['CPF:', org.representante_cpf]);
                if (org.representante_rg)
                    tabelaRepresentante.push(['RG:', org.representante_rg]);
                if (org.representante_telefone)
                    tabelaRepresentante.push(['Telefone:', org.representante_telefone]);
                if (org.representante_email)
                    tabelaRepresentante.push(['E-mail:', org.representante_email]);
                if (org.representante_funcao)
                    tabelaRepresentante.push(['Função:', org.representante_funcao]);
                if (org.representante_end_logradouro)
                    tabelaRepresentante.push(['Endereço:', org.representante_end_logradouro]);
                if (org.representante_end_numero)
                    tabelaRepresentante.push(['Número:', org.representante_end_numero]);
                if (org.representante_end_bairro)
                    tabelaRepresentante.push(['Bairro:', org.representante_end_bairro]);
                if (org.representante_end_cep)
                    tabelaRepresentante.push(['CEP:', org.representante_end_cep]);
                criarTabela2Colunas(tabelaRepresentante);
            }
            if (organizacao.organizacao_arquivo && organizacao.organizacao_arquivo.length > 0) {
                if (doc.y > 650) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('DOCUMENTOS ANEXADOS', 50, doc.y);
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(9).fillColor('#000');
                organizacao.organizacao_arquivo.forEach((arquivo, index) => {
                    doc.font('Helvetica-Bold')
                        .text(`${index + 1}. `, 50, doc.y, { continued: true });
                    doc.font('Helvetica')
                        .text(arquivo.arquivo || 'Sem nome', { width: 480 });
                    if (arquivo.obs) {
                        doc.fontSize(8).fillColor('#666')
                            .text(`   ${arquivo.obs}`, 50, doc.y, { width: 480 });
                        doc.fontSize(9).fillColor('#000');
                    }
                    doc.moveDown(0.5);
                });
                doc.moveDown(1);
            }
            if (organizacao.organizacao_foto && organizacao.organizacao_foto.length > 0) {
                for (const foto of organizacao.organizacao_foto) {
                    if (!foto.foto)
                        continue;
                    doc.addPage();
                    const fotoPath = path_1.default.join(UPLOAD_DIR, foto.foto);
                    if (!fs_1.default.existsSync(fotoPath)) {
                        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                            .text('FOTO NÃO ENCONTRADA', 50, 50);
                        doc.moveDown(0.5);
                        doc.strokeColor('#056839')
                            .lineWidth(1)
                            .moveTo(50, doc.y)
                            .lineTo(doc.page.width - 50, doc.y)
                            .stroke();
                        doc.moveDown(1);
                        doc.font('Helvetica').fontSize(9).fillColor('#666')
                            .text(`Arquivo: ${foto.foto}`, 50, doc.y);
                        if (foto.obs) {
                            doc.text(`Descrição: ${foto.obs}`, 50, doc.y + 12);
                        }
                        continue;
                    }
                    doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                        .text('FOTO DA ORGANIZAÇÃO', 50, 50);
                    doc.moveDown(0.5);
                    doc.strokeColor('#056839')
                        .lineWidth(1)
                        .moveTo(50, doc.y)
                        .lineTo(doc.page.width - 50, doc.y)
                        .stroke();
                    doc.moveDown(1);
                    doc.font('Helvetica-Bold').fontSize(11).fillColor('#3b2313')
                        .text(foto.obs || 'Sem descrição', 50, doc.y);
                    doc.moveDown(0.5);
                    doc.font('Helvetica').fontSize(9).fillColor('#666')
                        .text(`Arquivo: ${foto.foto}`, 50, doc.y);
                    doc.text(`Data: ${new Date(foto.creation_date).toLocaleDateString('pt-BR')} às ${new Date(foto.creation_date).toLocaleTimeString('pt-BR')}`, 50, doc.y + 12);
                    doc.moveDown(2);
                    try {
                        const maxWidth = doc.page.width - 100;
                        const maxHeight = 550;
                        doc.image(fotoPath, 50, doc.y, {
                            fit: [maxWidth, maxHeight],
                            align: 'center'
                        });
                    }
                    catch (error) {
                        doc.fillColor('#666')
                            .fontSize(10)
                            .text('Erro ao carregar imagem', 50, doc.y, { align: 'center' });
                        doc.text(`Detalhes: ${error}`, 50, doc.y + 20, { align: 'center' });
                    }
                }
            }
            doc.end();
            return stream;
        }
        catch (error) {
            doc.end();
            throw new Error(`Erro ao gerar relatório: ${error.message}`);
        }
    }
};
//# sourceMappingURL=relatorioService.js.map