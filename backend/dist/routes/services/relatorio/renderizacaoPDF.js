"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corRespostaMap = exports.respostaMap = void 0;
exports.renderizarCabecalhoArea = renderizarCabecalhoArea;
exports.renderizarSubarea = renderizarSubarea;
exports.renderizarTabelaPraticas = renderizarTabelaPraticas;
exports.renderizarAreaGerencial = renderizarAreaGerencial;
/**
 * Funções auxiliares para renderização de relatórios PDF
 */
// Mapeamento de respostas
exports.respostaMap = {
    1: 'Sim',
    2: 'Não',
    3: 'Parcial',
    4: 'Não se Aplica'
};
exports.corRespostaMap = {
    1: '#056839', // Verde
    2: '#d32f2f', // Vermelho
    3: '#f57c00', // Laranja
    4: '#666' // Cinza
};
/**
 * Renderiza cabeçalho de uma área gerencial
 */
function renderizarCabecalhoArea(doc, nomeArea) {
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#056839')
        .text(`ÁREA GERENCIAL: ${nomeArea}`, 50, 50);
    // Linha divisória verde
    doc.strokeColor('#056839')
        .lineWidth(2)
        .moveTo(50, doc.y + 15)
        .lineTo(doc.page.width - 50, doc.y + 15)
        .stroke();
    doc.moveDown(1.5);
}
/**
 * Renderiza subárea com fundo destacado
 */
function renderizarSubarea(doc, titulo) {
    // Espaçamento maior entre subáreas
    doc.moveDown(1.5);
    // Verificar quebra de página
    if (doc.y > 680) {
        doc.addPage();
    }
    // Fundo colorido para a subárea
    const larguraBarra = doc.page.width - 100;
    doc.rect(50, doc.y - 5, larguraBarra, 20)
        .fill('#f0f0f0');
    // Texto da subárea
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#3b2313')
        .text(titulo, 55, doc.y, { width: larguraBarra - 10 });
    doc.moveDown(0.8);
}
/**
 * Renderiza tabela de práticas em formato tabular
 */
function renderizarTabelaPraticas(doc, praticas) {
    praticas.forEach(pratica => {
        // Verificar se precisa de nova página
        if (doc.y > 720) {
            doc.addPage();
        }
        const respostaTexto = pratica.resposta ? exports.respostaMap[pratica.resposta] || '-' : '-';
        const corResposta = pratica.resposta ? exports.corRespostaMap[pratica.resposta] || '#666' : '#666';
        const startY = doc.y;
        const margemEsquerda = 55;
        const larguraID = 25;
        const larguraPergunta = 280;
        const larguraResposta = 70;
        const larguraComentario = doc.page.width - margemEsquerda - larguraID - larguraPergunta - larguraResposta - 50;
        // Fundo zebrado para melhor leitura
        if (pratica.numero % 2 === 0) {
            doc.rect(margemEsquerda, startY - 2, doc.page.width - 100, 0)
                .fillOpacity(0.05)
                .fill('#056839')
                .fillOpacity(1);
        }
        // ID
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#3b2313')
            .text(pratica.numero.toString(), margemEsquerda, startY, { width: larguraID, align: 'center' });
        // Pergunta
        doc.font('Helvetica').fontSize(9).fillColor('#000')
            .text(pratica.titulo, margemEsquerda + larguraID + 5, startY, { width: larguraPergunta, align: 'left' });
        // Resposta (colorida)
        doc.font('Helvetica-Bold').fontSize(9).fillColor(corResposta)
            .text(respostaTexto, margemEsquerda + larguraID + larguraPergunta + 10, startY, {
            width: larguraResposta,
            align: 'center'
        });
        // Calcular altura da célula baseada no conteúdo
        let alturaLinha = 0;
        const linhasPergunta = Math.ceil(doc.heightOfString(pratica.titulo, { width: larguraPergunta }));
        alturaLinha = Math.max(alturaLinha, linhasPergunta);
        // Comentário + Proposta na última coluna
        let textoExtra = '';
        if (pratica.comentario || pratica.proposta) {
            if (pratica.comentario && pratica.proposta) {
                textoExtra = `Comentário: ${pratica.comentario}\n\nProposta: ${pratica.proposta}`;
            }
            else if (pratica.comentario) {
                textoExtra = `Comentário: ${pratica.comentario}`;
            }
            else if (pratica.proposta) {
                textoExtra = `Proposta: ${pratica.proposta}`;
            }
            const xComentario = margemEsquerda + larguraID + larguraPergunta + larguraResposta + 15;
            doc.font('Helvetica').fontSize(9).fillColor('#333')
                .text(textoExtra, xComentario, startY, {
                width: larguraComentario,
                align: 'left'
            });
            const linhasComentario = Math.ceil(doc.heightOfString(textoExtra, { width: larguraComentario }));
            alturaLinha = Math.max(alturaLinha, linhasComentario);
        }
        // Linha divisória
        doc.strokeColor('#ddd')
            .lineWidth(0.5)
            .moveTo(margemEsquerda, startY + alturaLinha + 5)
            .lineTo(doc.page.width - 50, startY + alturaLinha + 5)
            .stroke();
        doc.y = startY + alturaLinha + 8;
    });
    doc.moveDown(0.5);
}
/**
 * Renderiza área gerencial completa
 */
function renderizarAreaGerencial(doc, nomeArea, subareas) {
    renderizarCabecalhoArea(doc, nomeArea);
    subareas.forEach(subarea => {
        renderizarSubarea(doc, subarea.nome);
        renderizarTabelaPraticas(doc, subarea.praticas);
    });
}
