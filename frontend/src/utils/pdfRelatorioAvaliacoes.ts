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

  // Informações da Capacitação (apenas Qualificação, Data, Local - formatado)
  const infoBasica = [
    { label: 'Qualificação', value: capacitacao.qualificacao?.titulo || 'Não informado' },
    { label: 'Data Início', value: formatarData(capacitacao.data_inicio) },
    { label: 'Data Fim', value: formatarData(capacitacao.data_fim) },
    { label: 'Local', value: capacitacao.local || 'Não informado' }
  ];

  infoBasica.forEach(info => {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      pageNumber++;
      yPos = margin;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    yPos = renderText(doc, `${info.label}:`, margin, yPos, maxWidth, { bold: true });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    yPos = renderText(doc, info.value, margin + 5, yPos, maxWidth - 5);
    yPos += 8;
  });

  yPos += 10;

  // Estatísticas Gerais - box com Média Geral, Total Inscritos, Total Avaliações, Taxa
  if (yPos > pageHeight - 80) {
    doc.addPage();
    pageNumber++;
    yPos = margin;
  }

  const mediaGeral = estatisticas.length > 0
    ? estatisticas
        .filter(s => s.media !== undefined && s.media > 0)
        .reduce((acc, s) => acc + (s.media || 0), 0) /
      Math.max(1, estatisticas.filter(s => s.media !== undefined && s.media > 0).length)
    : 0;

  const statsItems: string[] = [];
  if (mediaGeral > 0) {
    statsItems.push(`Média Geral: ${mediaGeral.toFixed(2)} / 5,00`);
  }
  statsItems.push(`Total de Inscritos: ${inscricoes.length}`);
  statsItems.push(`Total de Avaliações: ${avaliacoes.length}`);
  statsItems.push(`Taxa de Resposta: ${taxaResposta}%`);

  const statsBoxHeight = 28 + statsItems.length * 10;
  const statsBoxY = yPos;
  doc.setFillColor(245, 250, 245);
  doc.setDrawColor(5, 104, 57);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, statsBoxY, maxWidth, statsBoxHeight, 2, 2, 'FD');
  yPos += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 104, 57);
  yPos = renderText(doc, 'Estatísticas Gerais', margin + 8, yPos, maxWidth - 16, { bold: true });
  yPos += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(59, 35, 19);
  statsItems.forEach(item => {
    yPos = renderText(doc, item, margin + 8, yPos, maxWidth - 16);
    yPos += 6;
  });
  yPos = statsBoxY + statsBoxHeight + 10;

  // Estatísticas por Pergunta
  if (estatisticas.length > 0) {
    if (yPos > pageHeight - 60) {
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
        doc.addPage();
        pageNumber++;
        yPos = margin;
      }

      const isEscala = stat.pergunta.tipo === 'escala_5' || stat.pergunta.tipo === 'escala_3';
      const maxEscala = stat.pergunta.tipo === 'escala_5' ? 5 : 3;

      const textoPergunta = stat.pergunta?.texto || `Pergunta ${index + 1}`;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 35, 19);
      yPos = renderText(doc, `${index + 1}. ${textoPergunta}`, margin, yPos, maxWidth, { bold: true });
      yPos += 5;

      if (stat.media !== undefined && stat.media > 0) {
        if (isEscala) {
          const barWidth = 80;
          const barHeight = 6;
          const fillRatio = stat.media / maxEscala;
          doc.setFillColor(220, 220, 220);
          doc.roundedRect(margin, yPos - 4, barWidth, barHeight, 1, 1, 'F');
          doc.setFillColor(5, 104, 57);
          doc.roundedRect(margin, yPos - 4, barWidth * fillRatio, barHeight, 1, 1, 'F');
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(5, 104, 57);
          doc.text(`${stat.media.toFixed(2)} / ${maxEscala}`, margin + barWidth + 10, yPos + 1);
          doc.setTextColor(0, 0, 0);
          yPos += barHeight + 8;
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          yPos = renderText(doc, `Média: ${stat.media.toFixed(2)}`, margin, yPos, maxWidth);
          yPos += 5;
        }
      }

      if (stat.distribuicao && Object.keys(stat.distribuicao).length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        const distEntries = Object.entries(stat.distribuicao).sort((a, b) => {
          const na = parseInt(a[0], 10);
          const nb = parseInt(b[0], 10);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          return String(a[0]).localeCompare(String(b[0]));
        });

        const formatarOpcao = (op: string): string => {
          const lower = op.toLowerCase();
          const map: Record<string, string> = {
            'sim': 'Sim', 'nao': 'Não', 'não': 'Não', 'talvez': 'Talvez',
            'parcialmente': 'Parcialmente', 'sem_resposta': 'Sem resposta'
          };
          return map[lower] ?? op;
        };

        distEntries.forEach(([opcao, quantidade]) => {
          const percentual = stat.total_respostas > 0 ? ((quantidade / stat.total_respostas) * 100).toFixed(1) : '0';
          const label = formatarOpcao(opcao);
          yPos = renderText(doc, `  • ${label}: ${quantidade} (${percentual}%)`, margin + 5, yPos, maxWidth - 5);
          yPos += 5;
        });
      }

      // Última pergunta (observações) - texto livre
      if (index === estatisticas.length - 1 && (stat.media === undefined || stat.media === 0) && (!stat.distribuicao || Object.keys(stat.distribuicao).length === 0) && stat.total_respostas > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        yPos = renderText(doc, `  ${stat.total_respostas} resposta(s) em texto livre`, margin + 5, yPos, maxWidth - 5);
        doc.setTextColor(0, 0, 0);
        yPos += 5;
      }

      yPos += 10;
    });
  }

  // Lista Completa de Avaliações - quebra de página antes da seção
  if (avaliacoes.length > 0) {
    doc.addPage();
    pageNumber++;
    yPos = margin;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 35, 19);
    yPos = renderText(doc, 'Lista Completa de Avaliações', margin, yPos, maxWidth, { bold: true });
    yPos += 10;

    // Usar pergunta da própria resposta (incluída pelo backend) - versão usada na avaliação
    // Fallback para versaoAvaliacao quando resposta não traz pergunta
    const mapaPerguntas = new Map(
      (versaoAvaliacao?.perguntas || []).map(p => [p.id, p])
    );

    avaliacoes.forEach((avaliacao, index) => {
      // Quebra de página antes de cada avaliação (exceto a primeira)
      if (index > 0) {
        doc.addPage();
        pageNumber++;
        yPos = margin;
      } else if (yPos > pageHeight - 100) {
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

      // Respostas - usar pergunta da própria resposta (backend inclui avaliacao_pergunta)
      if (avaliacao.respostas && avaliacao.respostas.length > 0) {
        const respostasOrdenadas = [...avaliacao.respostas]
          .map(r => ({
            ...r,
            pergunta: (r as any).pergunta ?? mapaPerguntas.get(r.id_pergunta)
          }))
          .filter(r => r.pergunta)
          .sort((a, b) => (a.pergunta?.ordem || 0) - (b.pergunta?.ordem || 0));

        respostasOrdenadas.forEach(resposta => {
          if (yPos > pageHeight - 30) {
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
