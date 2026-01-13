import { jsPDF } from 'jspdf';
import { Capacitacao } from '../types/capacitacao';

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

interface PDFListaInscricoesVaziaProps {
  capacitacao: Capacitacao;
  numLinhas?: number;
}

export async function gerarPDFListaInscricoesVazia({
  capacitacao,
  numLinhas = 30
}: PDFListaInscricoesVaziaProps) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Cabeçalho
  doc.setFillColor(248, 249, 250); // #f8f9fa
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo à esquerda (proporção correta)
  const logoBase64 = await carregarImagemComoBase64('/pinovara.png');
  if (logoBase64) {
    try {
      // Manter proporção original do logo (altura = largura)
      doc.addImage(logoBase64, 'PNG', margin, 8, 25, 25);
    } catch (e) {
      console.warn('Erro ao adicionar logo ao PDF:', e);
    }
  }

  // Texto centralizado no cabeçalho
  const centerX = pageWidth / 2;
  
  doc.setTextColor(5, 104, 57); // #056839
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('SISTEMA PINOVARA', centerX, 20, { align: 'center' });
  
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Plataforma de Inovação Agroecológica - UFBA', centerX, 28, { align: 'center' });

  const dataHora = `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
  doc.setTextColor(102, 102, 102); // #666
  doc.setFontSize(10);
  doc.text(dataHora, centerX, 35, { align: 'center' });
  
  // Linha verde
  doc.setDrawColor(5, 104, 57); // #056839
  doc.setLineWidth(2);
  doc.line(0, 50, pageWidth, 50);

  yPos = 60;

  // Título da página
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('LISTA DE INSCRIÇÕES', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Informações da Capacitação
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('Capacitação:', margin, yPos);
  yPos += 7;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(12);
  const titulo = capacitacao.titulo || capacitacao.qualificacao?.titulo || 'Não informado';
  const tituloLinhas = doc.splitTextToSize(titulo, pageWidth - 2 * margin);
  doc.text(tituloLinhas, margin, yPos);
  yPos += tituloLinhas.length * 5 + 4;

  // Período
  if (capacitacao.data_inicio || capacitacao.data_fim) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Período:', margin, yPos);
    doc.setFont(undefined, 'normal');
    // Função helper para formatar data corretamente (evita problemas de timezone)
    const formatarDataPDF = (dataString: string | undefined): string => {
      if (!dataString) return 'Não informado';
      const partes = String(dataString).split('T')[0].split('-');
      if (partes.length === 3) {
        const data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
        return data.toLocaleDateString('pt-BR');
      }
      return new Date(dataString).toLocaleDateString('pt-BR');
    };
    
    const dataInicio = formatarDataPDF(capacitacao.data_inicio);
    const dataFim = formatarDataPDF(capacitacao.data_fim);
    doc.text(`${dataInicio} a ${dataFim}`, margin + 25, yPos);
    yPos += 7;
  }

  // Informações adicionais
  if (capacitacao.local) {
    doc.setFont(undefined, 'bold');
    doc.text('Local:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(capacitacao.local, margin + 20, yPos);
    yPos += 7;
  }

  if (capacitacao.turno) {
    doc.setFont(undefined, 'bold');
    doc.text('Turno:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(capacitacao.turno, margin + 20, yPos);
    yPos += 7;
  }

  // Técnico criador da capacitação
  if (capacitacao.tecnico_criador) {
    doc.setFont(undefined, 'bold');
    doc.text('Instrutor:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`${capacitacao.tecnico_criador.name} (${capacitacao.tecnico_criador.email})`, margin + 20, yPos);
    yPos += 7;
  }

  // Organizações vinculadas
  if (capacitacao.organizacoes_completas && capacitacao.organizacoes_completas.length > 0) {
    yPos += 4;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Organizações:', margin, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    capacitacao.organizacoes_completas.forEach((org, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`${index + 1}. ${org.nome}`, margin + 5, yPos);
      if (org.tecnico) {
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139); // #64748b
        doc.text(`   Técnico: ${org.tecnico.name} (${org.tecnico.email})`, margin + 5, yPos + 4);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        yPos += 8;
      } else {
        yPos += 6;
      }
    });
    doc.setFontSize(11);
    yPos += 4;
  }

  yPos += 5;

  // Linha divisória
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Tabela de Inscrições
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.text('Lista de Inscritos', margin, yPos);
  yPos += 8;

  // Cabeçalho da tabela
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139); // #64748b
  
  // Colunas: Nº, Nome, Email, Telefone, Documento
  // Ajustadas para formato landscape (297mm de largura)
  const colX = [
    margin,           // Nº (20mm)
    margin + 12,      // Nome (32mm)
    margin + 75,      // Email (95mm)
    margin + 155,     // Telefone (175mm)
    margin + 210      // Documento (230mm)
  ];
  
  doc.text('Nº', colX[0], yPos);
  doc.text('Nome', colX[1], yPos);
  doc.text('Email', colX[2], yPos);
  doc.text('Telefone', colX[3], yPos);
  doc.text('Documento', colX[4], yPos);
  yPos += 5;

  // Linha do cabeçalho
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 16; // Aumentado para dar mais espaço antes da primeira linha

  // Linhas vazias para preenchimento manual
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  for (let i = 1; i <= numLinhas; i++) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
      
      // Repetir cabeçalho da tabela
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('Nº', colX[0], yPos);
      doc.text('Nome', colX[1], yPos);
      doc.text('Email', colX[2], yPos);
      doc.text('Telefone', colX[3], yPos);
      doc.text('Documento', colX[4], yPos);
      yPos += 5;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 16; // Aumentado para dar mais espaço antes da primeira linha
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
    }

    // Número da linha - posicionado mais abaixo para dar espaço
    doc.text(i.toString(), colX[0], yPos + 3);
    
    // Linhas para preenchimento manual
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    
    // Linha para Nome - posicionada mais abaixo
    doc.line(colX[1], yPos, colX[2] - 5, yPos);
    
    // Linha para Email
    doc.line(colX[2], yPos, colX[3] - 5, yPos);
    
    // Linha para Telefone
    doc.line(colX[3], yPos, colX[4] - 5, yPos);
    
    // Linha para Documento
    doc.line(colX[4], yPos, pageWidth - margin, yPos);

    // Aumentar espaçamento entre linhas: 12mm para linhas normais, 14mm para a primeira
    yPos += (i === 1 ? 14 : 12);
  }

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Salvar PDF
  const nomeArquivo = `lista_inscricoes_vazia_${capacitacao.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
}

