import { jsPDF } from 'jspdf';
import { Qualificacao } from '../types/qualificacao';

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

// Função helper para calcular altura aproximada do texto
function calcularAlturaTexto(text: string, maxWidth: number): number {
  if (!text || text.trim() === '') {
    return 0;
  }
  const lineHeight = 5; // Altura de cada linha em mm
  const avgCharsPerLine = Math.floor(maxWidth / 3); // Aproximadamente 3mm por caractere
  const numLines = Math.max(1, Math.ceil(text.length / avgCharsPerLine));
  return numLines * lineHeight;
}

// Função helper para verificar se há espaço suficiente e adicionar página se necessário
function verificarEspacoEAdicionarPagina(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  yPos: number,
  alturaNecessaria: number,
  pageNumber: number,
  margin: number
): { yPos: number; pageNumber: number } {
  const espacoDisponivel = pageHeight - yPos - 20; // 20mm para rodapé e margem
  
  if (alturaNecessaria > espacoDisponivel) {
    renderFooter(doc, pageWidth, pageHeight, pageNumber, doc.getNumberOfPages());
    doc.addPage();
    pageNumber++;
    yPos = margin;
  }
  
  return { yPos, pageNumber };
}

// Função helper para renderizar texto com limite de largura
function renderText(doc: any, text: string, x: number, y: number, maxWidth: number, options: any = {}) {
  if (!text || text.trim() === '') {
    return y; // Retorna Y atual se não houver texto
  }
  
  const isBold = options.bold || false;
  
  // Aplicar formatação de fonte
  if (isBold) {
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setFont('helvetica', 'normal');
  }
  
  // Textos comuns em preto (não bold)
  if (!isBold) {
    doc.setTextColor(0, 0, 0); // Preto
  } else {
    doc.setTextColor(59, 35, 19); // Marrom para títulos
  }
  
  // Quebrar texto em linhas respeitando maxWidth
  const lines = doc.splitTextToSize(text, maxWidth);
  
  // Renderizar cada linha
  let currentY = y;
  lines.forEach((line: string) => {
    doc.text(line, x, currentY, { align: 'left' });
    currentY += 5; // Espaçamento entre linhas
  });
  
  return currentY;
}

export async function gerarPdfConteudoQualificacao(qualificacao: Qualificacao) {
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
  let yPos = await renderHeader(doc, pageWidth, 'CONTEÚDO DA QUALIFICAÇÃO', qualificacao.titulo || 'Qualificação');
  yPos += 10;

  // Título da qualificação
  if (qualificacao.titulo) {
    doc.setFontSize(12);
    yPos = renderText(doc, 'Título:', margin, yPos, maxWidth, { bold: true });
    yPos += 5;
    doc.setFontSize(11);
    yPos = renderText(doc, qualificacao.titulo, margin, yPos, maxWidth, { bold: false });
    yPos += 10;
  }

  // Objetivo Geral
  if (qualificacao.objetivo_geral) {
    // Verificar espaço antes de renderizar texto grande
    const alturaNecessaria = calcularAlturaTexto(qualificacao.objetivo_geral, maxWidth) + 15;
    const resultado = verificarEspacoEAdicionarPagina(doc, pageWidth, pageHeight, yPos, alturaNecessaria, pageNumber, margin);
    yPos = resultado.yPos;
    pageNumber = resultado.pageNumber;
    
    doc.setFontSize(11);
    yPos = renderText(doc, 'Objetivo Geral:', margin, yPos, maxWidth, { bold: true });
    yPos += 5;
    yPos = renderText(doc, qualificacao.objetivo_geral, margin, yPos, maxWidth);
    yPos += 10;
  }

  // Objetivos Específicos
  if (qualificacao.objetivos_especificos) {
    // Verificar espaço antes de renderizar texto grande
    const alturaNecessaria = calcularAlturaTexto(qualificacao.objetivos_especificos, maxWidth) + 15;
    const resultado = verificarEspacoEAdicionarPagina(doc, pageWidth, pageHeight, yPos, alturaNecessaria, pageNumber, margin);
    yPos = resultado.yPos;
    pageNumber = resultado.pageNumber;
    
    doc.setFontSize(11);
    yPos = renderText(doc, 'Objetivos Específicos:', margin, yPos, maxWidth, { bold: true });
    yPos += 5;
    yPos = renderText(doc, qualificacao.objetivos_especificos, margin, yPos, maxWidth);
    yPos += 10;
  }

  // Conteúdo Programático
  if (qualificacao.conteudo_programatico) {
    // Verificar espaço antes de renderizar texto grande
    const alturaNecessaria = calcularAlturaTexto(qualificacao.conteudo_programatico, maxWidth) + 15;
    const resultado = verificarEspacoEAdicionarPagina(doc, pageWidth, pageHeight, yPos, alturaNecessaria, pageNumber, margin);
    yPos = resultado.yPos;
    pageNumber = resultado.pageNumber;
    
    doc.setFontSize(11);
    yPos = renderText(doc, 'Conteúdo Programático:', margin, yPos, maxWidth, { bold: true });
    yPos += 5;
    yPos = renderText(doc, qualificacao.conteudo_programatico, margin, yPos, maxWidth);
    yPos += 10;
  }

  // Metodologia
  if (qualificacao.metodologia) {
    // Verificar espaço antes de renderizar texto grande
    const alturaNecessaria = calcularAlturaTexto(qualificacao.metodologia, maxWidth) + 15;
    const resultado = verificarEspacoEAdicionarPagina(doc, pageWidth, pageHeight, yPos, alturaNecessaria, pageNumber, margin);
    yPos = resultado.yPos;
    pageNumber = resultado.pageNumber;
    
    doc.setFontSize(11);
    yPos = renderText(doc, 'Metodologia:', margin, yPos, maxWidth, { bold: true });
    yPos += 5;
    yPos = renderText(doc, qualificacao.metodologia, margin, yPos, maxWidth);
    yPos += 10;
  }

  // Recursos Didáticos
  if (qualificacao.recursos_didaticos) {
    // Verificar espaço antes de renderizar texto grande
    const alturaNecessaria = calcularAlturaTexto(qualificacao.recursos_didaticos, maxWidth) + 15;
    const resultado = verificarEspacoEAdicionarPagina(doc, pageWidth, pageHeight, yPos, alturaNecessaria, pageNumber, margin);
    yPos = resultado.yPos;
    pageNumber = resultado.pageNumber;
    
    doc.setFontSize(11);
    yPos = renderText(doc, 'Recursos Didáticos:', margin, yPos, maxWidth, { bold: true });
    yPos += 5;
    yPos = renderText(doc, qualificacao.recursos_didaticos, margin, yPos, maxWidth);
    yPos += 10;
  }

  // Estratégia de Avaliação
  if (qualificacao.estrategia_avaliacao) {
    // Verificar espaço antes de renderizar texto grande
    const alturaNecessaria = calcularAlturaTexto(qualificacao.estrategia_avaliacao, maxWidth) + 15;
    const resultado = verificarEspacoEAdicionarPagina(doc, pageWidth, pageHeight, yPos, alturaNecessaria, pageNumber, margin);
    yPos = resultado.yPos;
    pageNumber = resultado.pageNumber;
    
    doc.setFontSize(11);
    yPos = renderText(doc, 'Estratégia de Avaliação:', margin, yPos, maxWidth, { bold: true });
    yPos += 5;
    yPos = renderText(doc, qualificacao.estrategia_avaliacao, margin, yPos, maxWidth);
    yPos += 10;
  }

  // Referências
  if (qualificacao.referencias) {
    // Verificar espaço antes de renderizar texto grande
    const alturaNecessaria = calcularAlturaTexto(qualificacao.referencias, maxWidth) + 15;
    const resultado = verificarEspacoEAdicionarPagina(doc, pageWidth, pageHeight, yPos, alturaNecessaria, pageNumber, margin);
    yPos = resultado.yPos;
    pageNumber = resultado.pageNumber;
    
    doc.setFontSize(11);
    yPos = renderText(doc, 'Referências:', margin, yPos, maxWidth, { bold: true });
    yPos += 5;
    yPos = renderText(doc, qualificacao.referencias, margin, yPos, maxWidth);
    yPos += 10;
  }

  // Renderizar rodapé na última página
  const totalPagesFinal = doc.getNumberOfPages();
  for (let i = 1; i <= totalPagesFinal; i++) {
    doc.setPage(i);
    renderFooter(doc, pageWidth, pageHeight, i, totalPagesFinal);
  }

  // Gerar nome do arquivo
  const dataGerado = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const nomeCropped = (qualificacao.titulo || 'qualificacao')
    .substring(0, 20)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  const filename = `${qualificacao.id}_${dataGerado}_${nomeCropped}.pdf`;

  doc.save(filename);
}
