import { jsPDF } from 'jspdf';
import { Capacitacao, CapacitacaoInscricao } from '../types/capacitacao';
import { CapacitacaoAvaliacao, AvaliacaoEstatisticas, AvaliacaoVersao, TipoPergunta } from '../types/avaliacao';

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

// Função helper para renderizar cabeçalho
async function renderHeader(doc: jsPDF, pageWidth: number, tituloDocumento: string, nomeEntidade: string) {
  const headerHeight = 35;
  
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  const logoBase64 = await carregarImagemComoBase64('/pinovara.png');
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 20, 8, 20, 20);
    } catch (e) {
      console.warn('Erro ao adicionar logo ao PDF:', e);
    }
  }
  
  doc.setTextColor(5, 104, 57);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA PINOVARA', pageWidth / 2, 12, { align: 'center' });
  
  doc.setTextColor(59, 35, 19);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Plataforma de Inovação Agroecológica - UFBA', pageWidth / 2, 18, { align: 'center' });
  
  const agora = new Date();
  const dataHora = `Relatório gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}`;
  doc.setTextColor(102, 102, 102);
  doc.setFontSize(10);
  doc.text(dataHora, pageWidth / 2, 24, { align: 'center' });
  
  doc.setDrawColor(5, 104, 57);
  doc.setLineWidth(1.5);
  doc.line(0, headerHeight, pageWidth, headerHeight);
  
  doc.setTextColor(59, 35, 19);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(tituloDocumento, pageWidth / 2, headerHeight + 10, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const maxWidthTitulo = pageWidth - 40;
  doc.text(nomeEntidade, pageWidth / 2, headerHeight + 18, { align: 'center', maxWidth: maxWidthTitulo });
  
  doc.setDrawColor(5, 104, 57);
  doc.setLineWidth(0.5);
  doc.line(20, headerHeight + 28, pageWidth - 20, headerHeight + 28);
  
  return headerHeight + 35;
}

// Função helper para renderizar rodapé
function renderFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number, totalPages: number) {
  const footerY = pageHeight - 15;
  
  doc.setDrawColor(5, 104, 57);
  doc.setLineWidth(0.5);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  doc.setTextColor(102, 102, 102);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
}

// Função helper para renderizar texto
function renderText(doc: any, text: string, x: number, y: number, maxWidth: number, options: any = {}) {
  if (!text || text.trim() === '') {
    return y;
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
  
  const lines = doc.splitTextToSize(text, maxWidth);
  
  let currentY = y;
  lines.forEach((line: string) => {
    doc.text(line, x, currentY, { align: 'left' });
    currentY += 5;
  });
  
  return currentY;
}

// Função helper para formatar data
function formatarData(dataString: string | undefined): string {
  if (!dataString) return 'Não informado';
  try {
    const partes = dataString.split('T')[0].split('-');
    if (partes.length === 3) {
      const data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      return data.toLocaleDateString('pt-BR');
    }
    return new Date(dataString).toLocaleDateString('pt-BR');
  } catch {
    return dataString;
  }
}

// Função helper para formatar resposta
function formatarResposta(resposta: { resposta_texto?: string; resposta_opcao?: string }, tipo: TipoPergunta): string {
  if (resposta.resposta_texto) {
    return resposta.resposta_texto;
  }
  if (resposta.resposta_opcao) {
    if (tipo === 'sim_nao_talvez') {
      const map: Record<string, string> = {
        'sim': 'Sim',
        'nao': 'Não',
        'talvez': 'Talvez'
      };
      return map[resposta.resposta_opcao.toLowerCase()] || resposta.resposta_opcao;
    }
    if (tipo === 'sim_nao_parcialmente') {
      const map: Record<string, string> = {
        'sim': 'Sim',
        'nao': 'Não',
        'parcialmente': 'Parcialmente'
      };
      return map[resposta.resposta_opcao.toLowerCase()] || resposta.resposta_opcao;
    }
    return resposta.resposta_opcao;
  }
  return 'Não respondida';
}

export async function gerarPdfRelatorioAvaliacoes(
  capacitacao: Capacitacao,
  avaliacoes: CapacitacaoAvaliacao[],
  estatisticas: AvaliacaoEstatisticas[],
  inscricoes: CapacitacaoInscricao[],
  versaoAvaliacao: AvaliacaoVersao | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  
  let pageNumber = 1;
  let totalPages = 1; // Será calculado dinamicamente
  
  const tituloCapacitacao = capacitacao.titulo || capacitacao.qualificacao?.titulo || 'Capacitação';
  let yPos = await renderHeader(doc, pageWidth, 'RELATÓRIO DE AVALIAÇÕES', tituloCapacitacao);
  yPos += 10;

  // Informações da Capacitação
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const taxaResposta = inscricoes.length > 0 ? ((avaliacoes.length / inscricoes.length) * 100).toFixed(1) : '0';
  
  const infoBasica = [
    { label: 'ID da Capacitação:', value: capacitacao.id?.toString() || 'Não informado' },
    { label: 'Qualificação:', value: capacitacao.qualificacao?.titulo || 'Não informado' },
    { label: 'Data Início:', value: formatarData(capacitacao.data_inicio) },
    { label: 'Data Fim:', value: formatarData(capacitacao.data_fim) },
    { label: 'Local:', value: capacitacao.local || 'Não informado' },
    { label: 'Status:', value: capacitacao.status || 'Não informado' },
    { label: 'Total de Inscritos:', value: inscricoes.length.toString() },
    { label: 'Total de Avaliações:', value: avaliacoes.length.toString() },
    { label: 'Taxa de Resposta:', value: `${taxaResposta}%` }
  ];

  infoBasica.forEach(info => {
    if (yPos > pageHeight - 50) {
      renderFooter(doc, pageWidth, pageHeight, pageNumber, 999); // Placeholder
      doc.addPage();
      pageNumber++;
      yPos = margin;
    }
    yPos = renderText(doc, `${info.label} ${info.value}`, margin, yPos, maxWidth, { bold: false });
    yPos += 7;
  });

  yPos += 10;

  // Estatísticas Gerais
  if (yPos > pageHeight - 60) {
    renderFooter(doc, pageWidth, pageHeight, pageNumber, 999); // Placeholder
    doc.addPage();
    pageNumber++;
    yPos = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 35, 19);
  yPos = renderText(doc, 'Estatísticas Gerais', margin, yPos, maxWidth, { bold: true });
  yPos += 5;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const mediaGeral = estatisticas
    .filter(s => s.media !== undefined)
    .map(s => s.media!)
    .reduce((acc, m, _, arr) => acc + m / arr.length, 0);

  if (mediaGeral > 0) {
    yPos = renderText(doc, `Média Geral: ${mediaGeral.toFixed(2)}`, margin, yPos, maxWidth);
    yPos += 7;
  }

  yPos += 10;

  // Estatísticas por Pergunta
  if (estatisticas.length > 0) {
    if (yPos > pageHeight - 60) {
      renderFooter(doc, pageWidth, pageHeight, pageNumber, 999); // Placeholder
      doc.addPage();
      pageNumber++;
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 35, 19);
    yPos = renderText(doc, 'Estatísticas por Pergunta', margin, yPos, maxWidth, { bold: true });
    yPos += 10;

    estatisticas.forEach((stat, index) => {
      if (yPos > pageHeight - 80) {
        renderFooter(doc, pageWidth, pageHeight, pageNumber, 999); // Placeholder
        doc.addPage();
        pageNumber++;
        yPos = margin;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 35, 19);
      yPos = renderText(doc, `${index + 1}. ${stat.pergunta.texto}`, margin, yPos, maxWidth, { bold: true });
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      yPos = renderText(doc, `Tipo: ${stat.pergunta.tipo} | Total de respostas: ${stat.total_respostas}`, margin, yPos, maxWidth);
      yPos += 5;

      if (stat.media !== undefined) {
        yPos = renderText(doc, `Média: ${stat.media.toFixed(2)}`, margin, yPos, maxWidth);
        yPos += 5;
      }

      if (stat.distribuicao && Object.keys(stat.distribuicao).length > 0) {
        yPos = renderText(doc, 'Distribuição:', margin, yPos, maxWidth);
        yPos += 5;
        
        Object.entries(stat.distribuicao).forEach(([opcao, quantidade]) => {
          const percentual = stat.total_respostas > 0 ? ((quantidade / stat.total_respostas) * 100).toFixed(1) : '0';
          yPos = renderText(doc, `  • ${opcao}: ${quantidade} (${percentual}%)`, margin + 5, yPos, maxWidth - 5);
          yPos += 5;
        });
      }

      yPos += 10;
    });
  }

  // Lista Completa de Avaliações
  if (avaliacoes.length > 0) {
    if (yPos > pageHeight - 60) {
      renderFooter(doc, pageWidth, pageHeight, pageNumber, 999); // Placeholder
      doc.addPage();
      pageNumber++;
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 35, 19);
    yPos = renderText(doc, 'Lista Completa de Avaliações', margin, yPos, maxWidth, { bold: true });
    yPos += 10;

    const mapaPerguntas = new Map(
      (versaoAvaliacao?.perguntas || []).map(p => [p.id, p])
    );

    avaliacoes.forEach((avaliacao, index) => {
      if (yPos > pageHeight - 100) {
        renderFooter(doc, pageWidth, pageHeight, pageNumber, 999); // Placeholder
        doc.addPage();
        pageNumber++;
        yPos = margin;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 35, 19);
      yPos = renderText(doc, `Avaliação ${index + 1}`, margin, yPos, maxWidth, { bold: true });
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      if (avaliacao.nome_participante) {
        yPos = renderText(doc, `Participante: ${avaliacao.nome_participante}`, margin, yPos, maxWidth);
        yPos += 5;
      }
      if (avaliacao.email_participante) {
        yPos = renderText(doc, `Email: ${avaliacao.email_participante}`, margin, yPos, maxWidth);
        yPos += 5;
      }
      yPos = renderText(doc, `Data: ${formatarData(avaliacao.created_at)}`, margin, yPos, maxWidth);
      yPos += 5;

      // Respostas
      if (avaliacao.respostas && avaliacao.respostas.length > 0) {
        const respostasOrdenadas = [...avaliacao.respostas]
          .map(r => ({
            ...r,
            pergunta: mapaPerguntas.get(r.id_pergunta)
          }))
          .filter(r => r.pergunta)
          .sort((a, b) => (a.pergunta?.ordem || 0) - (b.pergunta?.ordem || 0));

        respostasOrdenadas.forEach(resposta => {
          if (yPos > pageHeight - 30) {
            renderFooter(doc, pageWidth, pageHeight, pageNumber, 999); // Placeholder
            doc.addPage();
            pageNumber++;
            yPos = margin;
          }

          const textoPergunta = resposta.pergunta?.texto_pergunta || 'Pergunta';
          const respostaFormatada = formatarResposta(resposta, resposta.pergunta?.tipo || 'texto_livre');
          
          doc.setFont('helvetica', 'bold');
          yPos = renderText(doc, `${resposta.pergunta?.ordem || ''}. ${textoPergunta}`, margin, yPos, maxWidth, { bold: true });
          yPos += 4;
          
          doc.setFont('helvetica', 'normal');
          yPos = renderText(doc, `   Resposta: ${respostaFormatada}`, margin + 5, yPos, maxWidth - 5);
          yPos += 7;
        });
      }

      if (avaliacao.comentarios) {
        if (yPos > pageHeight - 30) {
          renderFooter(doc, pageWidth, pageHeight, pageNumber, 999); // Placeholder
          doc.addPage();
          pageNumber++;
          yPos = margin;
        }
        doc.setFont('helvetica', 'bold');
        yPos = renderText(doc, 'Comentários Gerais:', margin, yPos, maxWidth, { bold: true });
        yPos += 4;
        doc.setFont('helvetica', 'normal');
        yPos = renderText(doc, avaliacao.comentarios, margin + 5, yPos, maxWidth - 5);
        yPos += 5;
      }

      yPos += 10;
      
      // Linha divisória
      if (index < avaliacoes.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      }
    });
  }

  // Calcular total de páginas
  totalPages = doc.getNumberOfPages();
  
  // Renderizar rodapé em todas as páginas
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    renderFooter(doc, pageWidth, pageHeight, i, totalPages);
  }

  // Salvar PDF
  const dataGerado = new Date().toISOString().split('T')[0];
  const nomeCropped = (capacitacao.titulo || capacitacao.qualificacao?.titulo || 'relatorio')
    .substring(0, 30)
    .replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `relatorio_avaliacoes_${capacitacao.id}_${dataGerado}_${nomeCropped}.pdf`;
  
  doc.save(filename);
}
