import { jsPDF } from 'jspdf';
import { Capacitacao, CapacitacaoEvidencia } from '../types/capacitacao';
import { qualificacaoAPI } from '../services/qualificacaoService';
import { capacitacaoAPI } from '../services/capacitacaoService';
import { sanitizarTextoParaPdf } from './pdfTextoUtils';

// Retorna dimensões da imagem em pixels (para calcular proporção)
function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = src;
  });
}

// Função helper para carregar imagem como base64
async function carregarImagemComoBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Não foi possível carregar a imagem do logo:', error);
    return null;
  }
}

// Função helper para renderizar cabeçalho no padrão dos relatórios de organizações
async function renderHeader(doc: jsPDF, pageWidth: number, tituloDocumento: string, nomeEntidade: string) {
  const headerHeight = 35; // Altura do cabeçalho em mm
  
  // Fundo claro para o cabeçalho (#f8f9fa)
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Logo à esquerda
  const logoBase64 = await carregarImagemComoBase64('/pinovara.png');
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 20, 8, 20, 20);
    } catch (e) {
      console.warn('Erro ao adicionar logo ao PDF:', e);
    }
  }
  
  // "SISTEMA PINOVARA" em verde (#056839), bold, tamanho 16, centralizado
  doc.setTextColor(5, 104, 57); // #056839
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA PINOVARA', pageWidth / 2, 12, { align: 'center' });
  
  // "Plataforma de Inovação Agroecológica - UFBA" em marrom (#3b2313), tamanho 10, centralizado
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Plataforma de Inovação Agroecológica - UFBA', pageWidth / 2, 18, { align: 'center' });
  
  // Data e hora de geração em cinza (#666), tamanho 10, centralizado
  const agora = new Date();
  const dataHora = `Relatório gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}`;
  doc.setTextColor(102, 102, 102); // #666
  doc.setFontSize(10);
  doc.text(dataHora, pageWidth / 2, 24, { align: 'center' });
  
  // Borda inferior verde (#056839) com 3px de largura
  doc.setDrawColor(5, 104, 57); // #056839
  doc.setLineWidth(1.5); // Aproximadamente 3px em mm
  doc.line(0, headerHeight, pageWidth, headerHeight);
  
  // Título do documento em marrom (#3b2313), bold, tamanho 16, centralizado
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(tituloDocumento, pageWidth / 2, headerHeight + 10, { align: 'center' });
  
  // Nome da entidade em preto, tamanho 14, centralizado com maxWidth
  doc.setTextColor(0, 0, 0); // Preto
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const maxWidthTitulo = pageWidth - 40; // Margens de 20mm de cada lado
  doc.text(nomeEntidade, pageWidth / 2, headerHeight + 18, { align: 'center', maxWidth: maxWidthTitulo });
  
  // Linha divisória verde (#056839) com 1px de largura
  doc.setDrawColor(5, 104, 57); // #056839
  doc.setLineWidth(0.5); // Aproximadamente 1px em mm
  doc.line(20, headerHeight + 28, pageWidth - 20, headerHeight + 28);
  
  return headerHeight + 35; // Retorna posição Y após o cabeçalho
}

// Função helper para renderizar rodapé
function renderFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number, totalPages: number) {
  const footerY = pageHeight - 15;
  
  // Linha superior do rodapé em verde (#056839)
  doc.setDrawColor(5, 104, 57); // #056839
  doc.setLineWidth(0.5);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  // Número da página centralizado
  doc.setTextColor(102, 102, 102); // #666
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
}

const LINE_HEIGHT = 5;
const FOOTER_ZONE = 25;

// Função helper para renderizar texto com limite de largura e quebra de página
function renderText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  ctx: { pageWidth: number; pageHeight: number; margin: number; pageNumber: number },
  options: any = {}
): { yPos: number; pageNumber: number } {
  const { pageWidth, pageHeight, margin, pageNumber } = ctx;
  let currentY = y;
  let currentPage = pageNumber;

  const sanitized = sanitizarTextoParaPdf(text);
  if (!sanitized) {
    return { yPos: currentY, pageNumber: currentPage };
  }

  const isBold = options.bold || false;
  if (isBold) {
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setFont('helvetica', 'normal');
  }
  if (!isBold) {
    doc.setTextColor(0, 0, 0);
  } else {
    doc.setTextColor(59, 35, 19);
  }

  const lines = doc.splitTextToSize(sanitized, maxWidth);
  const yLimit = pageHeight - FOOTER_ZONE;

  lines.forEach((line: string) => {
    if (currentY + LINE_HEIGHT > yLimit) {
      renderFooter(doc, pageWidth, pageHeight, currentPage, doc.getNumberOfPages());
      doc.addPage();
      currentPage++;
      currentY = margin;
    }
    doc.text(line, x, currentY, { align: 'left' });
    currentY += LINE_HEIGHT;
  });

  return { yPos: currentY, pageNumber: currentPage };
}

// Função helper para formatar data
// Função helper para formatar data corretamente (evita problemas de timezone)
function formatarData(dataString: string | undefined): string {
  if (!dataString) return 'Não informado';
  try {
    // Se a data vem como string no formato YYYY-MM-DD, criar Date corretamente
    const partes = dataString.split('T')[0].split('-');
    if (partes.length === 3) {
      // Criar data no timezone local (ano, mês-1, dia)
      const data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      return data.toLocaleDateString('pt-BR');
    }
    // Fallback para o método padrão
    return new Date(dataString).toLocaleDateString('pt-BR');
  } catch {
    return dataString;
  }
}

export async function gerarPdfConteudoCapacitacao(capacitacao: Capacitacao) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin; // Largura máxima respeitando margens
  
  // Contador de páginas
  let pageNumber = 1;
  
  // Renderizar cabeçalho na primeira página
  const tituloCapacitacao = sanitizarTextoParaPdf(capacitacao.titulo || capacitacao.qualificacao?.titulo || 'Capacitação');
  let yPos = await renderHeader(doc, pageWidth, 'CONTEÚDO DA CAPACITAÇÃO', tituloCapacitacao);
  yPos += 10;

  const ctx = { pageWidth, pageHeight, margin, pageNumber };

  // Título da capacitação
  if (capacitacao.titulo) {
    doc.setFontSize(12);
    let r = renderText(doc, 'Título:', margin, yPos, maxWidth, ctx, { bold: true });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 5;
    doc.setFontSize(11);
    r = renderText(doc, capacitacao.titulo, margin, yPos, maxWidth, ctx, { bold: false });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 10;
  }

  // Informações básicas da capacitação
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  if (capacitacao.data_inicio) {
    let r = renderText(doc, `Data Início: ${formatarData(capacitacao.data_inicio)}`, margin, yPos, maxWidth, ctx, { bold: false });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 7;
  }
  if (capacitacao.data_fim) {
    let r = renderText(doc, `Data Fim: ${formatarData(capacitacao.data_fim)}`, margin, yPos, maxWidth, ctx, { bold: false });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 7;
  }
  if (capacitacao.local) {
    let r = renderText(doc, `Local: ${capacitacao.local}`, margin, yPos, maxWidth, ctx, { bold: false });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 7;
  }
  if (capacitacao.turno) {
    let r = renderText(doc, `Turno: ${capacitacao.turno}`, margin, yPos, maxWidth, ctx, { bold: false });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 7;
  }
  if (capacitacao.status) {
    const statusMap: Record<string, string> = {
      'planejada': 'Planejada',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada'
    };
    let r = renderText(doc, `Status: ${statusMap[capacitacao.status] || capacitacao.status}`, margin, yPos, maxWidth, ctx, { bold: false });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 7;
  }

  yPos += 5;

  if (capacitacao.organizacoes_completas && capacitacao.organizacoes_completas.length > 0) {
    doc.setFontSize(11);
    let r = renderText(doc, 'Organizações Participantes:', margin, yPos, maxWidth, ctx, { bold: true });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 5;
    capacitacao.organizacoes_completas.forEach(org => {
      r = renderText(doc, `• ${org.nome}`, margin, yPos, maxWidth, ctx, { bold: false });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
    });
    yPos += 5;
  }

  if (capacitacao.equipe_tecnica && capacitacao.equipe_tecnica.length > 0) {
    doc.setFontSize(11);
    let r = renderText(doc, 'Equipe Técnica:', margin, yPos, maxWidth, ctx, { bold: true });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 5;
    capacitacao.equipe_tecnica.forEach(membro => {
      const nome = membro.tecnico?.name || 'Nome não informado';
      const email = membro.tecnico?.email || '';
      r = renderText(doc, `• ${nome}${email ? ` (${email})` : ''}`, margin, yPos, maxWidth, ctx, { bold: false });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
    });
    yPos += 5;
  }

  // Carregar qualificação completa se necessário
  let qualificacaoCompleta = capacitacao.qualificacao as any;
  
  // Se a qualificação não tiver todos os campos, buscar completa
  if (capacitacao.id_qualificacao && (!qualificacaoCompleta || !qualificacaoCompleta.objetivo_geral)) {
    try {
      qualificacaoCompleta = await qualificacaoAPI.getById(capacitacao.id_qualificacao);
    } catch (error) {
      console.warn('Erro ao carregar qualificação completa:', error);
    }
  }

  // Qualificação Vinculada - nova página
  if (qualificacaoCompleta) {
    renderFooter(doc, pageWidth, pageHeight, ctx.pageNumber, doc.getNumberOfPages());
    doc.addPage();
    ctx.pageNumber++;
    yPos = margin;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 35, 19);
    let r = renderText(doc, 'Qualificação Vinculada', margin, yPos, maxWidth, ctx, { bold: true });
    yPos = r.yPos; ctx.pageNumber = r.pageNumber;
    yPos += 10;

    if (qualificacaoCompleta.titulo) {
      doc.setFontSize(11);
      r = renderText(doc, `Título: ${qualificacaoCompleta.titulo}`, margin, yPos, maxWidth, ctx, { bold: false });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 10;
    }

    if (qualificacaoCompleta.objetivo_geral) {
      doc.setFontSize(11);
      r = renderText(doc, 'Objetivo Geral:', margin, yPos, maxWidth, ctx, { bold: true });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
      r = renderText(doc, qualificacaoCompleta.objetivo_geral, margin, yPos, maxWidth, ctx);
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 10;
    }

    if (qualificacaoCompleta.objetivos_especificos) {
      doc.setFontSize(11);
      r = renderText(doc, 'Objetivos Específicos:', margin, yPos, maxWidth, ctx, { bold: true });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
      r = renderText(doc, qualificacaoCompleta.objetivos_especificos, margin, yPos, maxWidth, ctx);
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 10;
    }

    if (qualificacaoCompleta.conteudo_programatico) {
      doc.setFontSize(11);
      r = renderText(doc, 'Conteúdo Programático:', margin, yPos, maxWidth, ctx, { bold: true });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
      r = renderText(doc, qualificacaoCompleta.conteudo_programatico, margin, yPos, maxWidth, ctx);
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 10;
    }

    if (qualificacaoCompleta.metodologia) {
      doc.setFontSize(11);
      r = renderText(doc, 'Metodologia:', margin, yPos, maxWidth, ctx, { bold: true });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
      r = renderText(doc, qualificacaoCompleta.metodologia, margin, yPos, maxWidth, ctx);
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 10;
    }

    if (qualificacaoCompleta.recursos_didaticos) {
      doc.setFontSize(11);
      r = renderText(doc, 'Recursos Didáticos:', margin, yPos, maxWidth, ctx, { bold: true });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
      r = renderText(doc, qualificacaoCompleta.recursos_didaticos, margin, yPos, maxWidth, ctx);
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 10;
    }

    if (qualificacaoCompleta.estrategia_avaliacao) {
      doc.setFontSize(11);
      r = renderText(doc, 'Estratégia de Avaliação:', margin, yPos, maxWidth, ctx, { bold: true });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
      r = renderText(doc, qualificacaoCompleta.estrategia_avaliacao, margin, yPos, maxWidth, ctx);
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 10;
    }

    if (qualificacaoCompleta.referencias) {
      doc.setFontSize(11);
      r = renderText(doc, 'Referências:', margin, yPos, maxWidth, ctx, { bold: true });
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 5;
      r = renderText(doc, qualificacaoCompleta.referencias, margin, yPos, maxWidth, ctx);
      yPos = r.yPos; ctx.pageNumber = r.pageNumber;
      yPos += 10;
    }
  }

  // Evidências (fotos) da capacitação
  if (capacitacao.id) {
    try {
      const evidencias = await capacitacaoAPI.listEvidencias(capacitacao.id);
      const fotosEvidencias = evidencias.filter(
        (e: CapacitacaoEvidencia) =>
          e.tipo === 'foto' ||
          /\.(jpg|jpeg|png)$/i.test(e.nome_arquivo || '')
      );

      if (fotosEvidencias.length > 0) {
        renderFooter(doc, pageWidth, pageHeight, ctx.pageNumber, doc.getNumberOfPages());
        doc.addPage();
        ctx.pageNumber++;
        yPos = margin;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 35, 19);
        doc.text('Evidências da Capacitação', margin, yPos);
        yPos += 12;

        const imgMaxW = 85;
        const imgMaxH = 70;
        const gap = 5;
        const colsPerRow = 2;
        let col = 0;
        let rowMaxH = 0;

        for (const ev of fotosEvidencias) {
          try {
            const result = await capacitacaoAPI.getEvidenciaBase64(capacitacao.id!, ev.id);
            if (!result) continue;

            const dims = await getImageDimensions(result.base64);
            const ratio = dims.height / dims.width;
            let w = imgMaxW;
            let h = w * ratio;
            if (h > imgMaxH) {
              h = imgMaxH;
              w = h / ratio;
            }

            const x = margin + col * (imgMaxW + gap);
            if (yPos + h > pageHeight - FOOTER_ZONE) {
              renderFooter(doc, pageWidth, pageHeight, ctx.pageNumber, doc.getNumberOfPages());
              doc.addPage();
              ctx.pageNumber++;
              yPos = margin;
              col = 0;
              rowMaxH = 0;
            }

            doc.addImage(result.base64, result.format, x, yPos, w, h);
            rowMaxH = Math.max(rowMaxH, h);

            if (ev.descricao) {
              doc.setFontSize(9);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(80, 80, 80);
              const descLinhas = doc.splitTextToSize(sanitizarTextoParaPdf(ev.descricao), w);
              let descY = yPos + h + 3;
              descLinhas.slice(0, 2).forEach((linha: string) => {
                doc.text(linha, x, descY);
                descY += 4;
                rowMaxH += 4;
              });
              doc.setTextColor(0, 0, 0);
            }

            col++;
            if (col >= colsPerRow) {
              col = 0;
              yPos += rowMaxH + gap;
              rowMaxH = 0;
            }
          } catch (err) {
            console.warn('Erro ao incluir evidência no PDF:', ev.id, err);
          }
        }

        if (col > 0) {
          yPos += rowMaxH + gap;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar evidências para PDF:', err);
    }
  }

  // Renderizar rodapé em todas as páginas
  const totalPagesFinal = doc.getNumberOfPages();
  for (let i = 1; i <= totalPagesFinal; i++) {
    doc.setPage(i);
    renderFooter(doc, pageWidth, pageHeight, i, totalPagesFinal);
  }

  // Gerar nome do arquivo
  const dataGerado = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const nomeCropped = (capacitacao.titulo || 'capacitacao')
    .substring(0, 20)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  const filename = `${capacitacao.id}_${dataGerado}_${nomeCropped}.pdf`;

  doc.save(filename);
}
