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
const definicoes_1 = require("./relatorio/definicoes");
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
                include: {
                    estado_organizacao_estadoToestado: true,
                    municipio_ibge: true,
                    organizacao_foto: {
                        orderBy: { ordinal_number: 'asc' }
                    },
                    organizacao_arquivo: {
                        orderBy: { ordinal_number: 'asc' }
                    },
                    organizacao_participante: {
                        include: {
                            relacao_organizacao_participante_relacaoTorelacao: true
                        }
                    },
                    organizacao_indicador: true,
                    organizacao_producao: true,
                    organizacao_abrangencia_socio: {
                        include: {
                            municipio_ibge: true
                        }
                    },
                    organizacao_abrangencia_pj: true
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
                const larguraColuna = (doc.page.width - 100) / 2 - 10;
                const larguraTexto = larguraColuna - 120;
                const alturaLinha = 28;
                let alturaTotalEsquerda = 0;
                let alturaTotalDireita = 0;
                colunaEsquerda.forEach(([label, value]) => {
                    const alturaEspecial = label.includes('Nome:') ? 35 : alturaLinha;
                    alturaTotalEsquerda += alturaEspecial;
                });
                colunaDireita.forEach(([label, value]) => {
                    const alturaEspecial = label.includes('Logradouro:') ? 35 : alturaLinha;
                    alturaTotalDireita += alturaEspecial;
                });
                const alturaTotalTabela = Math.max(alturaTotalEsquerda, alturaTotalDireita);
                doc.strokeColor('#000')
                    .lineWidth(1)
                    .rect(50, doc.y, larguraColuna, alturaTotalTabela)
                    .stroke();
                doc.rect(50 + larguraColuna + 10, doc.y, larguraColuna, alturaTotalTabela)
                    .stroke();
                const startY = doc.y;
                let currentY = startY + 5;
                colunaEsquerda.forEach(([label, value], index) => {
                    const alturaEspecial = label.includes('Nome:') ? 35 : alturaLinha;
                    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000')
                        .text(label, 55, currentY, { width: 110, continued: false });
                    doc.font('Helvetica').fontSize(9)
                        .text(value, 170, currentY, { width: larguraTexto });
                    currentY += alturaEspecial;
                    if (index < colunaEsquerda.length - 1) {
                        doc.strokeColor('#ddd').lineWidth(0.5)
                            .moveTo(50, currentY - 5)
                            .lineTo(50 + larguraColuna, currentY - 5)
                            .stroke();
                    }
                });
                currentY = startY + 5;
                colunaDireita.forEach(([label, value], index) => {
                    const xOffset = 50 + larguraColuna + 10;
                    const alturaEspecial = label.includes('Logradouro:') ? 35 : alturaLinha;
                    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000')
                        .text(label, xOffset + 5, currentY, { width: 110, continued: false });
                    doc.font('Helvetica').fontSize(9)
                        .text(value, xOffset + 120, currentY, { width: larguraTexto });
                    currentY += alturaEspecial;
                    if (index < colunaDireita.length - 1) {
                        doc.strokeColor('#ddd').lineWidth(0.5)
                            .moveTo(xOffset, currentY - 5)
                            .lineTo(xOffset + larguraColuna, currentY - 5)
                            .stroke();
                    }
                });
                doc.y = startY + alturaTotalTabela + 10;
            };
            const org = organizacao;
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                .text('DADOS BÁSICOS DA ORGANIZAÇÃO', 50, doc.y);
            doc.moveDown(0.5);
            const tabelaDados = [];
            if (org.cnpj)
                tabelaDados.push(['CNPJ:', org.cnpj]);
            if (org.data_fundacao)
                tabelaDados.push(['Data de Fundação:', new Date(org.data_fundacao).toLocaleDateString('pt-BR')]);
            if (org.telefone)
                tabelaDados.push(['Telefone:', org.telefone]);
            if (org.email)
                tabelaDados.push(['E-mail:', org.email]);
            if (org.estado_organizacao_estadoToestado?.descricao || org.municipio_ibge?.descricao) {
                const estadoDesc = org.estado_organizacao_estadoToestado?.descricao || '';
                const municipioDesc = org.municipio_ibge?.descricao || '';
                if (estadoDesc && municipioDesc) {
                    const uf = estadoDesc.trim().substring(0, 2).toUpperCase();
                    tabelaDados.push(['Localização:', `${uf} - ${municipioDesc}`]);
                }
                else if (estadoDesc) {
                    tabelaDados.push(['Localização:', estadoDesc]);
                }
                else {
                    tabelaDados.push(['Localização:', municipioDesc]);
                }
            }
            criarTabela2Colunas(tabelaDados);
            if (doc.y > 680) {
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
                if (doc.y > 680) {
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
            if (organizacao.organizacao_participante && organizacao.organizacao_participante.length > 0) {
                if (doc.y > 650) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('LISTA DE PRESENÇA', 50, doc.y);
                doc.moveDown(0.5);
                const startY = doc.y;
                const colWidths = [180, 100, 120, 150];
                const headerY = startY;
                doc.rect(50, headerY - 5, 500, 20).fill('#f0f0f0');
                doc.strokeColor('#056839').lineWidth(1)
                    .rect(50, headerY - 5, 500, 20).stroke();
                doc.font('Helvetica-Bold').fontSize(9).fillColor('#056839');
                doc.text('Nome', 55, headerY);
                doc.text('CPF', 55 + colWidths[0], headerY);
                doc.text('Telefone', 55 + colWidths[0] + colWidths[1], headerY);
                doc.text('Relação', 55 + colWidths[0] + colWidths[1] + colWidths[2], headerY);
                doc.font('Helvetica').fontSize(8).fillColor('#000');
                let currentY = headerY + 25;
                organizacao.organizacao_participante.forEach((participante, index) => {
                    if (currentY > 700) {
                        doc.addPage();
                        currentY = 50;
                    }
                    if (index > 0) {
                        doc.strokeColor('#ddd').lineWidth(0.5)
                            .moveTo(50, currentY - 5)
                            .lineTo(550, currentY - 5)
                            .stroke();
                    }
                    const nome = participante.nome || 'Não informado';
                    const cpf = participante.cpf || 'Não informado';
                    const telefone = participante.telefone || 'Não informado';
                    let relacao = 'Não informado';
                    if (participante.relacao_outros) {
                        relacao = participante.relacao_outros;
                    }
                    else if (participante.relacao_organizacao_participante_relacaoTorelacao?.descricao) {
                        relacao = participante.relacao_organizacao_participante_relacaoTorelacao.descricao;
                    }
                    const truncateText = (text, maxLength) => {
                        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
                    };
                    doc.text(truncateText(nome, 30), 55, currentY);
                    doc.text(truncateText(cpf, 15), 55 + colWidths[0], currentY);
                    doc.text(truncateText(telefone, 15), 55 + colWidths[0] + colWidths[1], currentY);
                    doc.text(truncateText(relacao, 25), 55 + colWidths[0] + colWidths[1] + colWidths[2], currentY);
                    currentY += 20;
                });
                doc.y = currentY + 10;
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
            if (organizacao.caracteristicas_n_total_socios ||
                organizacao.caracteristicas_n_total_socios_caf ||
                organizacao.caracteristicas_n_distintos_caf) {
                if (doc.y > 600) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('CARACTERÍSTICAS DOS ASSOCIADOS', 50, doc.y);
                doc.moveDown(0.5);
                const tabelaCaracteristicas = [];
                if (organizacao.caracteristicas_n_total_socios) {
                    tabelaCaracteristicas.push(['Total de Sócios:', String(organizacao.caracteristicas_n_total_socios)]);
                }
                if (organizacao.caracteristicas_n_total_socios_caf) {
                    tabelaCaracteristicas.push(['Sócios com CAF:', String(organizacao.caracteristicas_n_total_socios_caf)]);
                }
                if (organizacao.caracteristicas_n_distintos_caf) {
                    tabelaCaracteristicas.push(['CAF Distintos:', String(organizacao.caracteristicas_n_distintos_caf)]);
                }
                if (organizacao.caracteristicas_n_ativos_total) {
                    tabelaCaracteristicas.push(['Sócios Ativos (Total):', String(organizacao.caracteristicas_n_ativos_total)]);
                }
                if (organizacao.caracteristicas_n_ativos_caf) {
                    tabelaCaracteristicas.push(['Sócios Ativos (CAF):', String(organizacao.caracteristicas_n_ativos_caf)]);
                }
                if (organizacao.caracteristicas_n_ingressaram_total_12_meses) {
                    tabelaCaracteristicas.push(['Novos Sócios (12 meses):', String(organizacao.caracteristicas_n_ingressaram_total_12_meses)]);
                }
                if (organizacao.caracteristicas_n_ingressaram_caf_12_meses) {
                    tabelaCaracteristicas.push(['Novos Sócios CAF (12 meses):', String(organizacao.caracteristicas_n_ingressaram_caf_12_meses)]);
                }
                if (organizacao.caracteristicas_n_socios_paa) {
                    tabelaCaracteristicas.push(['Sócios PAA:', String(organizacao.caracteristicas_n_socios_paa)]);
                }
                if (organizacao.caracteristicas_n_socios_pnae) {
                    tabelaCaracteristicas.push(['Sócios PNAE:', String(organizacao.caracteristicas_n_socios_pnae)]);
                }
                criarTabela2Colunas(tabelaCaracteristicas);
                if (doc.y > 650) {
                    doc.addPage();
                }
                doc.moveDown(0.5);
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('DISTRIBUIÇÃO POR CATEGORIA E GÊNERO', 50, doc.y);
                doc.moveDown(0.3);
                const categorias = [
                    { nome: 'Agricultura Familiar', campo: 'caracteristicas_ta_af' },
                    { nome: 'Assentado', campo: 'caracteristicas_ta_a' },
                    { nome: 'Pescador', campo: 'caracteristicas_ta_p' },
                    { nome: 'Indígena', campo: 'caracteristicas_ta_i' },
                    { nome: 'Quilombola', campo: 'caracteristicas_ta_q' },
                    { nome: 'Extrativista', campo: 'caracteristicas_ta_e' },
                    { nome: 'Outro', campo: 'caracteristicas_ta_o' }
                ];
                const dadosDistribuicao = [];
                categorias.forEach(cat => {
                    const homem = organizacao[`${cat.campo}_homem`] || 0;
                    const mulher = organizacao[`${cat.campo}_mulher`] || 0;
                    const total = homem + mulher;
                    if (total > 0) {
                        dadosDistribuicao.push([`${cat.nome}:`, `${total} (${homem}H / ${mulher}M)`]);
                    }
                });
                if (dadosDistribuicao.length > 0) {
                    criarTabela2Colunas(dadosDistribuicao);
                }
                doc.moveDown(0.5);
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('TIPOS DE PRODUÇÃO', 50, doc.y);
                doc.moveDown(0.3);
                const tiposProducao = [
                    { nome: 'Orgânico', campo: 'caracteristicas_ta_caf_organico' },
                    { nome: 'Agroecológico', campo: 'caracteristicas_ta_caf_agroecologico' },
                    { nome: 'Transição', campo: 'caracteristicas_ta_caf_transicao' },
                    { nome: 'Convencional', campo: 'caracteristicas_ta_caf_convencional' }
                ];
                const dadosProducao = [];
                tiposProducao.forEach(tipo => {
                    const valor = organizacao[tipo.campo] || 0;
                    if (valor > 0) {
                        dadosProducao.push([`${tipo.nome}:`, valor.toString()]);
                    }
                });
                if (dadosProducao.length > 0) {
                    criarTabela2Colunas(dadosProducao);
                }
            }
            if (organizacao.organizacao_producao && organizacao.organizacao_producao.length > 0) {
                if (doc.y > 600) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('DADOS DE PRODUÇÃO', 50, doc.y);
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(9).fillColor('#000');
                organizacao.organizacao_producao.forEach((producao, index) => {
                    doc.font('Helvetica-Bold')
                        .text(`${index + 1}. ${producao.cultura}`, 50, doc.y);
                    doc.font('Helvetica')
                        .text(`   Mensal: ${producao.mensal}kg | Anual: ${producao.anual}kg`, 70, doc.y + 12);
                    doc.moveDown(1);
                });
            }
            if (organizacao.organizacao_abrangencia_socio && organizacao.organizacao_abrangencia_socio.length > 0) {
                if (doc.y > 600) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('ABRANGÊNCIA GEOGRÁFICA DOS SÓCIOS', 50, doc.y);
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(9).fillColor('#000');
                organizacao.organizacao_abrangencia_socio.forEach((abrangencia, index) => {
                    doc.text(`${index + 1}. ${abrangencia.municipio?.descricao || 'Município não informado'} - ${abrangencia.num_socios} sócios`, 50, doc.y);
                    doc.moveDown(0.3);
                });
            }
            if (organizacao.organizacao_abrangencia_pj && organizacao.organizacao_abrangencia_pj.length > 0) {
                if (doc.y > 600) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('ASSOCIADOS PESSOA JURÍDICA', 50, doc.y);
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(9).fillColor('#000');
                organizacao.organizacao_abrangencia_pj.forEach((pj, index) => {
                    doc.font('Helvetica-Bold')
                        .text(`${index + 1}. ${pj.razao_social || pj.cnpj_pj}`, 50, doc.y);
                    doc.font('Helvetica')
                        .text(`   CNPJ: ${pj.cnpj_pj} | Sócios: ${pj.num_socios_total} (${pj.num_socios_caf} CAF)`, 70, doc.y + 12);
                    doc.moveDown(0.8);
                });
            }
            if (organizacao.descricao) {
                if (doc.y > 600) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('DESCRIÇÃO GERAL DO EMPREENDIMENTO', 50, doc.y);
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(9).fillColor('#000')
                    .text(organizacao.descricao, 50, doc.y, {
                    width: doc.page.width - 100,
                    align: 'justify'
                });
                doc.moveDown(1);
            }
            if (organizacao.eixos_trabalhados || organizacao.metodologia || organizacao.orientacoes) {
                if (doc.y > 550) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('ORIENTAÇÕES TÉCNICAS DA ATIVIDADE', 50, doc.y);
                doc.moveDown(0.5);
                if (organizacao.eixos_trabalhados) {
                    doc.font('Helvetica-Bold').fontSize(10).fillColor('#056839')
                        .text('Eixos Trabalhados:', 50, doc.y);
                    doc.moveDown(0.3);
                    doc.font('Helvetica').fontSize(9).fillColor('#000')
                        .text(organizacao.eixos_trabalhados, 50, doc.y, {
                        width: doc.page.width - 100,
                        align: 'justify'
                    });
                    doc.moveDown(0.7);
                }
                if (organizacao.enfase) {
                    const enfaseMap = {
                        1: 'PNAE',
                        2: 'PAA Leite',
                        3: 'Crédito do INCRA',
                        4: 'Governos',
                        5: 'Redes de Cooperação e/ou Comercialização'
                    };
                    const enfaseTexto = enfaseMap[organizacao.enfase] ||
                        (organizacao.enfase === 99 && organizacao.enfase_outros ? organizacao.enfase_outros : 'Outro');
                    const tabelaEnfase = [['Ênfase:', enfaseTexto]];
                    criarTabela2Colunas(tabelaEnfase);
                }
                if (organizacao.metodologia) {
                    doc.moveDown(0.5);
                    doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                        .text('METODOLOGIA UTILIZADA', 50, doc.y);
                    doc.moveDown(0.5);
                    doc.font('Helvetica').fontSize(9).fillColor('#000')
                        .text(organizacao.metodologia, 50, doc.y, {
                        width: doc.page.width - 100,
                        align: 'justify'
                    });
                    doc.moveDown(1);
                }
                if (organizacao.orientacoes) {
                    doc.moveDown(0.5);
                    doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                        .text('ORIENTAÇÕES E SOLUÇÕES TÉCNICAS', 50, doc.y);
                    doc.moveDown(0.5);
                    doc.font('Helvetica').fontSize(9).fillColor('#000')
                        .text(organizacao.orientacoes, 50, doc.y, {
                        width: doc.page.width - 100,
                        align: 'justify'
                    });
                    doc.moveDown(1);
                }
            }
            if (organizacao.organizacao_indicador && organizacao.organizacao_indicador.length > 0) {
                if (doc.y > 600) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('INDICADORES DA ATIVIDADE', 50, doc.y);
                doc.moveDown(0.5);
                const indicadoresMap = {
                    1: 'Conformidade documental e regularidade do empreendimento',
                    2: 'Práticas de tomada de decisão',
                    3: 'Políticas públicas de apoio à produção e comercialização',
                    4: 'Associados com acesso às políticas públicas',
                    5: 'Participação dos associados no empreendimento',
                    6: 'Participação de mulheres na gestão',
                    7: 'Capacitação de gestores',
                    8: 'Capacitação de associados',
                    9: 'Geração de Empregos Diretos',
                    10: 'Controles econômicos',
                    11: 'Negócios institucionais',
                    12: 'Inovação no empreendimento',
                    13: 'Adoção de tecnologias referenciais',
                    14: 'Práticas sustentáveis no empreendimento',
                    15: 'Programa ou ações ambientais comunitárias',
                    16: 'Prática de proteção de nascentes e/ou uso racional de recursos hídricos'
                };
                const dadosIndicadores = [];
                organizacao.organizacao_indicador.forEach((indicador, index) => {
                    const descricao = indicadoresMap[indicador.valor] || `Indicador ${indicador.valor}`;
                    dadosIndicadores.push([`${index + 1}.`, descricao]);
                });
                if (dadosIndicadores.length > 0) {
                    criarTabela2Colunas(dadosIndicadores);
                }
            }
            if (organizacao.participantes_menos_10 === 1 && organizacao.organizacao_participante && organizacao.organizacao_participante.length > 0) {
                if (doc.y > 600) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('PARTICIPANTES DA ATIVIDADE', 50, doc.y);
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(9).fillColor('#000');
                organizacao.organizacao_participante.forEach((participante, index) => {
                    doc.font('Helvetica-Bold')
                        .text(`${index + 1}. ${participante.nome}`, 50, doc.y);
                    doc.font('Helvetica')
                        .text(`   CPF: ${participante.cpf} | Telefone: ${participante.telefone}`, 70, doc.y + 12);
                    const relacaoMap = {
                        1: 'Diretor',
                        2: 'Conselheiro Fiscal',
                        3: 'Associado',
                        4: 'Colaborador'
                    };
                    const relacaoTexto = relacaoMap[participante.relacao] ||
                        (participante.relacao === 99 && participante.relacao_outros ? participante.relacao_outros : 'Outro');
                    doc.text(`   Relação: ${relacaoTexto}`, 70, doc.y + 24);
                    doc.moveDown(1.5);
                });
            }
            const respostaMap = {
                1: 'Sim',
                2: 'Não',
                3: 'Parcial',
                4: 'Não se Aplica'
            };
            const corRespostaMap = {
                1: '#056839',
                2: '#d32f2f',
                3: '#f57c00',
                4: '#666'
            };
            const renderizarSubarea = (titulo) => {
                doc.moveDown(1.5);
                if (doc.y > 680) {
                    doc.addPage();
                }
                const larguraBarra = doc.page.width - 100;
                doc.rect(50, doc.y - 5, larguraBarra, 20)
                    .fill('#f0f0f0');
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#3b2313')
                    .text(titulo, 55, doc.y, { width: larguraBarra - 10 });
                doc.moveDown(0.8);
            };
            const renderizarTabelaPraticas = (praticas) => {
                praticas.forEach(pratica => {
                    if (doc.y > 720) {
                        doc.addPage();
                    }
                    const respostaTexto = pratica.resposta ? respostaMap[pratica.resposta] || '-' : '-';
                    const corResposta = pratica.resposta ? corRespostaMap[pratica.resposta] || '#666' : '#666';
                    const startY = doc.y;
                    const margemEsquerda = 55;
                    const larguraID = 25;
                    const larguraPergunta = 280;
                    const larguraResposta = 70;
                    const larguraComentario = doc.page.width - margemEsquerda - larguraID - larguraPergunta - larguraResposta - 50;
                    if (pratica.numero % 2 === 0) {
                        doc.rect(margemEsquerda, startY - 2, doc.page.width - 100, 0)
                            .fillOpacity(0.05)
                            .fill('#056839')
                            .fillOpacity(1);
                    }
                    doc.font('Helvetica-Bold').fontSize(8).fillColor('#3b2313')
                        .text(pratica.numero.toString(), margemEsquerda, startY, { width: larguraID, align: 'center' });
                    doc.font('Helvetica').fontSize(8).fillColor('#000')
                        .text(pratica.titulo, margemEsquerda + larguraID + 5, startY, { width: larguraPergunta, align: 'left' });
                    doc.font('Helvetica-Bold').fontSize(8).fillColor(corResposta)
                        .text(respostaTexto, margemEsquerda + larguraID + larguraPergunta + 10, startY, {
                        width: larguraResposta,
                        align: 'center'
                    });
                    let alturaLinha = 0;
                    const linhasPergunta = Math.ceil(doc.heightOfString(pratica.titulo, { width: larguraPergunta }));
                    alturaLinha = Math.max(alturaLinha, linhasPergunta);
                    let textoExtra = '';
                    if (pratica.comentario || pratica.proposta) {
                        if (pratica.comentario && pratica.proposta) {
                            textoExtra = `💬 ${pratica.comentario}\n\n💡 Proposta: ${pratica.proposta}`;
                        }
                        else if (pratica.comentario) {
                            textoExtra = `💬 ${pratica.comentario}`;
                        }
                        else if (pratica.proposta) {
                            textoExtra = `💡 ${pratica.proposta}`;
                        }
                        const xComentario = margemEsquerda + larguraID + larguraPergunta + larguraResposta + 15;
                        doc.font('Helvetica').fontSize(7).fillColor('#333')
                            .text(textoExtra, xComentario, startY, {
                            width: larguraComentario,
                            align: 'left'
                        });
                        const linhasComentario = Math.ceil(doc.heightOfString(textoExtra, { width: larguraComentario }));
                        alturaLinha = Math.max(alturaLinha, linhasComentario);
                    }
                    doc.strokeColor('#ddd')
                        .lineWidth(0.5)
                        .moveTo(margemEsquerda, startY + alturaLinha + 5)
                        .lineTo(doc.page.width - 50, startY + alturaLinha + 5)
                        .stroke();
                    doc.y = startY + alturaLinha + 8;
                });
                doc.moveDown(0.5);
            };
            (0, definicoes_1.renderizarTodasAreasGerenciais)(doc, org);
            if (organizacao.obs) {
                if (doc.y > 600) {
                    doc.addPage();
                }
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
                    .text('OBSERVAÇÕES FINAIS', 50, doc.y);
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(9).fillColor('#000')
                    .text(organizacao.obs, 50, doc.y, {
                    width: doc.page.width - 100,
                    align: 'justify'
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