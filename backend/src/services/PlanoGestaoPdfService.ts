import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import PlanoGestaoService, { AcaoCompleta } from './PlanoGestaoService';

const prisma = new PrismaClient();

class PlanoGestaoPdfService {
  private formatDate(date: Date | string | null): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  }

  private calcularStatus(acao: AcaoCompleta): string {
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

  private renderHeader(doc: any, nomeOrganizacao: string) {
    const headerHeight = 100;
    doc.rect(0, 0, doc.page.width, headerHeight).fill('#f8f9fa');
    doc.strokeColor('#056839')
      .lineWidth(2)
      .moveTo(0, headerHeight)
      .lineTo(doc.page.width, headerHeight)
      .stroke();

    const logoPaths = [
      path.join(__dirname, '../../public/pinovara.png'),
      path.join(__dirname, '../../../frontend/public/pinovara.png'),
      path.join(__dirname, '../../../deploy-package/pinovara.png')
    ];

    for (const logoPath of logoPaths) {
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 40, 20, { width: 55 });
          break;
        } catch (e) {
          // Continua tentando
        }
      }
    }

    const textStartX = 110;
    const textWidth = doc.page.width - textStartX - 40;
    let currentY = 25;

    doc.fillColor('#056839')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Plano de Gestão - Sistema PINOVARA', textStartX, currentY, { width: textWidth, align: 'center' });
    currentY += 16;

    // Nome da organização com controle de altura
    doc.fillColor('#3b2313')
      .font('Helvetica')
      .fontSize(10)
      .text(nomeOrganizacao, textStartX, currentY, { width: textWidth, align: 'center', lineGap: 2 });
    
    const nomeHeight = doc.heightOfString(nomeOrganizacao, { width: textWidth, lineGap: 2 });
    currentY += nomeHeight + 4;

    doc.fillColor('#666')
      .fontSize(8)
      .text(
        `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        textStartX,
        currentY,
        { width: textWidth, align: 'center' }
      );

    doc.y = headerHeight + 5;
  }

  private ensureSpace(doc: any, neededHeight: number, onPageBreak?: () => void) {
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

  private getColumnDefinitions(contentWidth: number) {
    return [
      { key: 'acao', label: 'Ação', width: contentWidth * 0.28 },
      { key: 'responsavel', label: 'Responsável', width: contentWidth * 0.18 },
      { key: 'periodo', label: 'Período', width: contentWidth * 0.14 },
      { key: 'como', label: 'Como será feito?', width: contentWidth * 0.24 },
      { key: 'recursos', label: 'Recursos', width: contentWidth * 0.12 },
      { key: 'status', label: 'Status', width: contentWidth * 0.08 }
    ];
  }

  private getStatusColor(status: string): string {
    const palette: Record<string, string> = {
      'Não iniciado': '#fbbf24',
      'Pendente': '#f97316',
      'Concluído': '#10b981',
      'Ignorada': '#9ca3af'
    };
    return palette[status] || '#6b7280';
  }

  private buildActionRowValues(acao: AcaoCompleta) {
    const tituloAcao = (acao.acao && acao.acao.trim()) || (acao as any).acao_modelo || 'Ação sem descrição';
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

  private isAcaoRespondida(acao: AcaoCompleta): boolean {
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

  private drawGroupHeader(doc: any, title: string, startX: number, totalWidth: number, continuation = false) {
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

  private drawTableHeader(doc: any, startX: number, columns: Array<{ key: string; label: string; width: number }>) {
    const headerHeight = 16;
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const baseY = doc.y;
    
    // Linha simples de cabeçalho - renderizar cada coluna na mesma linha Y
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9);
    
    let currentX = startX;
    columns.forEach((col, index) => {
      const cellX = currentX + 4;
      const cellY = baseY + 4;
      
      // Renderizar texto com altura fixa para garantir alinhamento
      doc.text(col.label, cellX, cellY, { 
        width: col.width - 8,
        height: 10,
        ellipsis: true,
        lineGap: 0,
        align: 'left'
      });
      
      // Desenhar linha vertical entre colunas (exceto última)
      if (index < columns.length - 1) {
        doc.strokeColor('#e5e5e5')
          .lineWidth(0.3)
          .moveTo(currentX + col.width, baseY)
          .lineTo(currentX + col.width, baseY + headerHeight)
          .stroke();
      }
      
      currentX += col.width;
    });
    
    // Linha divisória horizontal abaixo do cabeçalho
    doc.strokeColor('#cccccc')
      .lineWidth(0.5)
      .moveTo(startX, baseY + headerHeight)
      .lineTo(startX + totalWidth, baseY + headerHeight)
      .stroke();
    
    doc.y = baseY + headerHeight + 2;
  }

  private calculateActionRowHeight(doc: any, columns: Array<{ key: string; label: string; width: number }>, acao: AcaoCompleta) {
    const paddingX = 4;
    const paddingY = 4;
    const values = this.buildActionRowValues(acao);
    doc.save();
    doc.font('Helvetica').fontSize(9);
    
    // Calcular altura máxima necessária entre todas as colunas
    let maxHeight = 12; // Altura mínima
    
    columns.forEach(col => {
      if (col.key === 'status') {
        maxHeight = Math.max(maxHeight, 12);
      } else {
        const text = (values as any)[col.key] || '-';
        // Calcular altura necessária para o texto completo sem truncamento
        const calculatedHeight = doc.heightOfString(text, { 
          width: col.width - paddingX * 2, 
          align: 'left', 
          lineGap: 1 
        });
        // Não limitar altura - permitir que o texto seja exibido completamente
        // Usar altura calculada sem qualquer limitação
        maxHeight = Math.max(maxHeight, calculatedHeight);
      }
    });
    
    // Garantir altura mínima suficiente para textos longos
    if (maxHeight < 12) {
      maxHeight = 12;
    }
    
    doc.restore();
    return maxHeight + paddingY * 2;
  }

  private drawActionRow(
    doc: any,
    startX: number,
    columns: Array<{ key: string; label: string; width: number }>,
    acao: AcaoCompleta,
    rowIndex: number
  ) {
    const paddingX = 4;
    const paddingY = 4;
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const values = this.buildActionRowValues(acao);
    
    // Calcular altura real necessária para cada célula
    doc.save();
    doc.font('Helvetica').fontSize(9);
    let maxCellHeight = 0;
    columns.forEach(col => {
      if (col.key !== 'status') {
        const text = (values as any)[col.key] || '-';
        const textHeight = doc.heightOfString(text, { 
          width: col.width - paddingX * 2, 
          align: 'left', 
          lineGap: 1 
        });
        maxCellHeight = Math.max(maxCellHeight, textHeight);
      }
    });
    doc.restore();
    
    // Altura da linha baseada no maior texto + padding
    const rowHeight = Math.max(maxCellHeight + paddingY * 2, 20); // Mínimo 20px
    const rowTop = doc.y;
    const baseY = rowTop + paddingY; // Y base para todas as células da linha

    // Configurar fonte padrão
    doc.fillColor('#000000').font('Helvetica').fontSize(9);

    let currentX = startX;
    columns.forEach((col, index) => {
      const cellX = currentX + paddingX;
      const cellY = baseY; // Todas as células na mesma linha Y
      const value = (values as any)[col.key] || '-';

      if (col.key === 'status') {
        // Status com badge colorido
        const statusColor = this.getStatusColor(value);
        const pillWidth = Math.min(col.width - paddingX * 2, doc.widthOfString(value, { font: 'Helvetica-Bold', size: 8 }) + 12);
        const pillHeight = 16;
        const pillX = cellX;
        const pillY = cellY + (rowHeight - paddingY * 2 - pillHeight) / 2; // Centralizar verticalmente
        
        doc.save();
        // Badge com fundo colorido
        doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 3).fill(statusColor);
        // Texto branco no badge
        doc.fillColor('#ffffff')
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(value, pillX, pillY + 4, { width: pillWidth, align: 'center', height: 10 });
        doc.restore();
        
        doc.font('Helvetica').fontSize(9);
        doc.fillColor('#000000');
      } else {
        // Renderizar texto completo sem abreviação - permitir quebra de linha
        doc.text(value, cellX, cellY, { 
          width: col.width - paddingX * 2, 
          align: 'left', 
          lineGap: 1
          // Sem height nem ellipsis - texto completo será exibido sem truncamento
        });
      }

      // Desenhar linha vertical entre colunas (exceto última)
      if (index < columns.length - 1) {
        doc.strokeColor('#e5e5e5')
          .lineWidth(0.3)
          .moveTo(currentX + col.width, rowTop)
          .lineTo(currentX + col.width, rowTop + rowHeight)
          .stroke();
      }

      currentX += col.width;
    });

    // Linha divisória horizontal abaixo da linha
    doc.strokeColor('#e5e5e5')
      .lineWidth(0.3)
      .moveTo(startX, rowTop + rowHeight)
      .lineTo(startX + totalWidth, rowTop + rowHeight)
      .stroke();

    doc.y = rowTop + rowHeight;
  }


  private addPageWithHeader(doc: any, nomeOrganizacao: string, isFirstPage: boolean = false, pageNumber?: number, totalPages?: number) {
    const currentMargins = doc.page?.margins;
    
    doc.addPage({ size: 'A4', layout: 'landscape', margin: currentMargins });
    
    // Só renderiza cabeçalho completo na primeira página
    if (isFirstPage) {
      this.renderHeader(doc, nomeOrganizacao);
    } else {
      // Nas outras páginas, apenas ajusta o Y inicial
      doc.y = currentMargins?.top ?? 40;
    }
  }

  private drawInfoCard(
    doc: any,
    x: number,
    y: number,
    width: number,
    height: number,
    options: { titulo: string; valor: string; descricao?: string; cor: string }
  ) {
    doc.save();
    
    // Fundo do card com borda colorida
    doc.roundedRect(x, y, width, height, 6).fill('#ffffff');
    doc.strokeColor(options.cor).lineWidth(2).roundedRect(x, y, width, height, 6).stroke();
    
    // Barra colorida no topo
    doc.rect(x, y, width, 4).fill(options.cor);

    // Título
    doc.fillColor(options.cor)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(options.titulo, x + 8, y + 8, { width: width - 16, lineGap: 0, ellipsis: true });

    // Valor
    doc.fillColor('#1f2937')
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(options.valor, x + 8, y + 20, { width: width - 16, lineGap: 0, ellipsis: true });

    // Descrição
    if (options.descricao) {
      doc.fillColor('#6b7280')
        .font('Helvetica')
        .fontSize(7)
        .text(options.descricao, x + 8, y + height - 12, { width: width - 16, lineGap: 0, ellipsis: true });
    }

    doc.restore();
  }

  private renderResumo(
    doc: any,
    stats: {
      respondidas: number;
      total: number;
      status: Record<string, number>;
    },
    tecnico: { name: string | null; email: string | null } | null,
    evidencias: any[]
  ) {
    const marginLeft = doc.page?.margins?.left ?? 40;
    const marginRight = doc.page?.margins?.right ?? 40;
    const availableWidth = doc.page.width - marginLeft - marginRight;
    const startY = doc.y;

    // Título do resumo
    doc.fillColor('#056839')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Resumo do Plano de Gestão', marginLeft, startY, { width: availableWidth });
    doc.y += 20;

    const cardHeight = 50;
    const cardSpacing = 12;
    const cardsPerRow = 3;
    const cardWidth = (availableWidth - (cardSpacing * (cardsPerRow - 1))) / cardsPerRow;
    let currentX = marginLeft;
    let currentY = doc.y;

    // Primeira linha de cards: Estatísticas de ações
    this.drawInfoCard(doc, currentX, currentY, cardWidth, cardHeight, {
      titulo: 'Ações Respondidas',
      valor: `${stats.respondidas} / ${stats.total}`,
      descricao: `${stats.total > 0 ? Math.round((stats.respondidas / stats.total) * 100) : 0}% do total`,
      cor: '#056839'
    });
    currentX += cardWidth + cardSpacing;

    this.drawInfoCard(doc, currentX, currentY, cardWidth, cardHeight, {
      titulo: 'Não Iniciado',
      valor: `${stats.status['Não iniciado'] || 0}`,
      descricao: 'Ações não iniciadas',
      cor: '#fbbf24'
    });
    currentX += cardWidth + cardSpacing;

    this.drawInfoCard(doc, currentX, currentY, cardWidth, cardHeight, {
      titulo: 'Pendente',
      valor: `${stats.status['Pendente'] || 0}`,
      descricao: 'Ações em andamento',
      cor: '#f97316'
    });

    // Segunda linha de cards: Status e informações
    currentX = marginLeft;
    currentY += cardHeight + cardSpacing;

    this.drawInfoCard(doc, currentX, currentY, cardWidth, cardHeight, {
      titulo: 'Concluído',
      valor: `${stats.status['Concluído'] || 0}`,
      descricao: 'Ações finalizadas',
      cor: '#10b981'
    });
    currentX += cardWidth + cardSpacing;

    this.drawInfoCard(doc, currentX, currentY, cardWidth, cardHeight, {
      titulo: 'Técnico Responsável',
      valor: tecnico?.name || '-',
      descricao: tecnico?.email || '',
      cor: '#3b2313'
    });
    currentX += cardWidth + cardSpacing;

    const fotosCount = evidencias.filter(ev => ev.tipo === 'foto').length;
    const docsCount = evidencias.filter(ev => ev.tipo !== 'foto').length;
    this.drawInfoCard(doc, currentX, currentY, cardWidth, cardHeight, {
      titulo: 'Evidências',
      valor: `${fotosCount + docsCount}`,
      descricao: `${fotosCount} fotos / ${docsCount} documentos`,
      cor: '#6366f1'
    });

    doc.y = currentY + cardHeight + 20;
  }

  private checkAndAddFooter(doc: any, neededHeight: number): boolean {
    const bottomMargin = doc.page?.margins?.bottom ?? 60;
    const availableSpace = doc.page.height - doc.y - bottomMargin;
    
    // Se não há espaço suficiente, criar nova página
    if (availableSpace < neededHeight) {
      const currentPage = (doc as any).__pageCount || 1;
      // Criar nova página
      (doc as any).__pageCount = currentPage + 1;
      this.addPageWithHeader(doc, '', false, (doc as any).__pageCount, (doc as any).__pageCount);
      return true; // Nova página criada
    }
    return false; // Continua na mesma página
  }

  private renderTextBlock(doc: any, title: string, text: string) {
    const marginLeft = doc.page?.margins?.left ?? 40;
    const marginRight = doc.page?.margins?.right ?? 40;
    const contentWidth = doc.page.width - marginLeft - marginRight;
    const padding = 12;
    const boxPadding = 8;

    // Estimar altura necessária
    doc.save();
    doc.font('Helvetica').fontSize(10);
    const textHeight = doc.heightOfString(text, { width: contentWidth - (padding * 2) - (boxPadding * 2), lineGap: 2 });
    doc.restore();
    const estimatedHeight = 20 + textHeight + padding * 2 + boxPadding * 2 + 10; // título + texto + padding + espaçamento

    // Verificar espaço e criar nova página se necessário
    this.checkAndAddFooter(doc, estimatedHeight);

    const boxY = doc.y;
    const boxHeight = textHeight + boxPadding * 2 + 20;

    // Box com fundo e borda
    doc.save();
    doc.roundedRect(marginLeft, boxY, contentWidth, boxHeight, 4)
      .fill('#f9fafb');
    doc.strokeColor('#056839')
      .lineWidth(1.5)
      .roundedRect(marginLeft, boxY, contentWidth, boxHeight, 4)
      .stroke();
    
    // Barra colorida no topo
    doc.rect(marginLeft, boxY, contentWidth, 4).fill('#056839');
    doc.restore();

    // Título
    doc.fillColor('#056839')
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(title, marginLeft + padding, boxY + 12, { width: contentWidth - padding * 2 });
    
    // Texto com espaçamento adequado
    doc.fillColor('#374151')
      .font('Helvetica')
      .fontSize(10)
      .text(text, marginLeft + padding + boxPadding, boxY + 28, { 
        width: contentWidth - (padding * 2) - (boxPadding * 2), 
        align: 'left', 
        lineGap: 2 
      });
    
    doc.y = boxY + boxHeight + 10;
  }

  private renderEvidencias(doc: any, evidencias: any[], nomeOrganizacao: string) {
    if (!evidencias.length) {
      return;
    }

    const marginLeft = doc.page?.margins?.left ?? 40;
    const marginRight = doc.page?.margins?.right ?? 40;
    const availableWidth = doc.page.width - marginLeft - marginRight;
    const bottomMargin = doc.page?.margins?.bottom ?? 60;

    (doc as any).__pageCount = ((doc as any).__pageCount || 1) + 1;
    this.addPageWithHeader(doc, nomeOrganizacao, false, (doc as any).__pageCount, (doc as any).__pageCount);
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
          (doc as any).__pageCount = ((doc as any).__pageCount || 1) + 1;
          this.addPageWithHeader(doc, nomeOrganizacao, false, (doc as any).__pageCount, (doc as any).__pageCount);
          doc.fillColor('#3b2313')
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('Fotos / Imagens (continuação)', marginLeft, doc.y, { width: availableWidth });
          doc.y += 8;
        }

        let exibiuImagem = false;
        if (foto.caminho_arquivo && fs.existsSync(foto.caminho_arquivo)) {
          try {
            doc.image(foto.caminho_arquivo, x, doc.y, { width: imagemWidth, height: imagemHeight, fit: [imagemWidth, imagemHeight], align: 'center' });
            exibiuImagem = true;
          } catch (error) {
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
        (doc as any).__pageCount = ((doc as any).__pageCount || 1) + 1;
        this.addPageWithHeader(doc, nomeOrganizacao, false, (doc as any).__pageCount, (doc as any).__pageCount);
      }

      doc.fillColor('#3b2313')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Listas / Documentos', marginLeft, doc.y, { width: availableWidth });
      doc.y += 8;

      doc.fillColor('#1f2937').font('Helvetica').fontSize(9);
      documentos.forEach(docItem => {
        if (doc.y + 16 > doc.page.height - bottomMargin) {
          (doc as any).__pageCount = ((doc as any).__pageCount || 1) + 1;
          this.addPageWithHeader(doc, nomeOrganizacao, false, (doc as any).__pageCount, (doc as any).__pageCount);
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

  private renderPlano(
    doc: any,
    plano: { titulo: string; tipo: string; grupos: { nome: string | null; acoes: AcaoCompleta[] }[] },
    indice: number,
    nomeOrganizacao: string
  ) {
    const marginLeft = doc.page?.margins?.left ?? 40;
    const marginRight = doc.page?.margins?.right ?? 40;
    const marginBottom = doc.page?.margins?.bottom ?? 60;
    const contentWidth = doc.page.width - marginLeft - marginRight;
    const columns = this.getColumnDefinitions(contentWidth);
    const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const bottomLimit = doc.page.height - marginBottom;

    if (indice > 0) {
      (doc as any).__pageCount = ((doc as any).__pageCount || 1) + 1;
      const currentPage = (doc as any).__pageCount;
      this.addPageWithHeader(doc, nomeOrganizacao, false, currentPage, currentPage);
    }

    doc.fillColor('#056839')
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(plano.titulo, marginLeft, doc.y, { width: contentWidth });

    doc.y += 18;
    doc.fillColor('#1f2937').font('Helvetica').fontSize(10);

    plano.grupos.forEach((grupo) => {
      const tituloGrupo = grupo.nome || 'Grupo Sem Nome';

      if (doc.y + 70 > bottomLimit) {
        (doc as any).__pageCount = ((doc as any).__pageCount || 1) + 1;
        this.addPageWithHeader(doc, nomeOrganizacao, false, (doc as any).__pageCount, (doc as any).__pageCount);
      }

      this.drawGroupHeader(doc, tituloGrupo, marginLeft, tableWidth);
      this.drawTableHeader(doc, marginLeft, columns);

      let rowIndex = 0;
      grupo.acoes.forEach((acao) => {
        const rowHeight = this.calculateActionRowHeight(doc, columns, acao);
        if (doc.y + rowHeight > bottomLimit) {
          (doc as any).__pageCount = ((doc as any).__pageCount || 1) + 1;
          this.addPageWithHeader(doc, nomeOrganizacao, false, (doc as any).__pageCount, (doc as any).__pageCount);
          this.drawGroupHeader(doc, tituloGrupo, marginLeft, tableWidth, true);
          this.drawTableHeader(doc, marginLeft, columns);
        }
        this.drawActionRow(doc, marginLeft, columns, acao, rowIndex);
        rowIndex += 1;
      });

      doc.y += 8;
    });
  }

  async gerarPdfPlanoGestao(idOrganizacao: number): Promise<PassThrough> {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const stream = new PassThrough();
    doc.pipe(stream);

    // Contador de páginas
    let pageCount = 0;

    try {
      const dadosPlano = await PlanoGestaoService.getPlanoGestao(idOrganizacao);
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

      // ESTRUTURA DA PRIMEIRA PÁGINA:
      // 1. Cabeçalho (logo, título, nome organização, data)
      // 2. Resumo inline (estatísticas)
      // 3. Rascunho / Notas Colaborativas (se houver)
      // 4. Relatório Sintético (se houver)
      // 5. Planos de Gestão (começando na primeira página)
      // 6. Rodapé (será adicionado no final)

      pageCount = 1;
      (doc as any).__pageCount = 1;
      
      // 1. Cabeçalho
      this.renderHeader(doc, nomeOrganizacao);
      console.log('✅ Cabeçalho renderizado, doc.y =', doc.y);
      
      // 2. Resumo de estatísticas
      const todasAcoes = planosFiltrados.flatMap(plano => plano.grupos.flatMap(grupo => grupo.acoes));
      const statusCounts = todasAcoes.reduce<Record<string, number>>((acc, acao) => {
        const status = this.calcularStatus(acao);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      const respondidas = todasAcoes.filter(acao => this.isAcaoRespondida(acao)).length;
      this.renderResumo(
        doc,
        {
          respondidas,
          total: todasAcoes.length,
          status: statusCounts
        },
        { name: tecnico?.name || null, email: tecnico?.email || null },
        dadosPlano.evidencias || []
      );
      console.log('✅ Resumo renderizado, doc.y =', doc.y);

      // 3. Rascunho / Notas Colaborativas (se houver)
      if (dadosPlano.plano_gestao_rascunho) {
        this.renderTextBlock(doc, 'Rascunho / Notas Colaborativas', dadosPlano.plano_gestao_rascunho);
        console.log('✅ Rascunho renderizado, doc.y =', doc.y);
      }

      // 4. Relatório Sintético (se houver)
      if (dadosPlano.plano_gestao_relatorio_sintetico) {
        this.renderTextBlock(doc, 'Relatório Sintético', dadosPlano.plano_gestao_relatorio_sintetico);
        console.log('✅ Relatório Sintético renderizado, doc.y =', doc.y);
      }

      // 5. Planos de Gestão
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
      } else {
        // Renderizar todos os planos (o primeiro começa na primeira página)
        planosFiltrados.forEach((plano, index) => {
          console.log(`📋 Renderizando plano ${index + 1}/${planosFiltrados.length}, doc.y =`, doc.y);
          this.renderPlano(doc, plano, index, nomeOrganizacao);
        });
      }

      // 6. Evidências (em página separada)
      this.renderEvidencias(doc, dadosPlano.evidencias || [], nomeOrganizacao);
      
      console.log('✅ Todos os elementos renderizados. Total de páginas:', (doc as any).__pageCount || 1);

      doc.end();
      return stream;
    } catch (error) {
      stream.destroy(error as Error);
      throw error;
    }
  }
}

export default new PlanoGestaoPdfService();

