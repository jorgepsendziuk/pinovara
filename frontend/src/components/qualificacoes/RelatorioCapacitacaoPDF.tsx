import { jsPDF } from 'jspdf';
import { Capacitacao } from '../../types/capacitacao';
import { CapacitacaoInscricao } from '../../types/capacitacao';
import { CapacitacaoPresenca } from '../../types/capacitacao';

interface RelatorioCapacitacaoPDFProps {
  capacitacao: Capacitacao;
  inscricoes?: CapacitacaoInscricao[];
  presencas?: CapacitacaoPresenca[];
}

export function gerarRelatorioCapacitacaoPDF({
  capacitacao,
  inscricoes = [],
  presencas = []
}: RelatorioCapacitacaoPDFProps) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.text('RELATÓRIO DE CAPACITAÇÃO', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Informações da Capacitação
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('Dados da Capacitação', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  const dados = [
    ['Título:', capacitacao.titulo || capacitacao.qualificacao?.titulo || 'Não informado'],
    ['Qualificação:', capacitacao.qualificacao?.titulo || 'Não informado'],
    ['Data de Início:', capacitacao.data_inicio ? new Date(capacitacao.data_inicio).toLocaleDateString('pt-BR') : 'Não informado'],
    ['Data de Término:', capacitacao.data_fim ? new Date(capacitacao.data_fim).toLocaleDateString('pt-BR') : 'Não informado'],
    ['Local:', capacitacao.local || 'Não informado'],
    ['Turno:', capacitacao.turno || 'Não informado'],
    ['Status:', capacitacao.status || 'Não informado']
  ];

  dados.forEach(([label, value]) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont(undefined, 'bold');
    doc.text(label, 25, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(value || 'Não informado', 70, yPos);
    yPos += 7;
  });

  yPos += 5;

  // Lista de Inscrições
  if (inscricoes.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Lista de Inscrições (${inscricoes.length})`, 20, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Nome', 25, yPos);
    doc.text('Email', 80, yPos);
    doc.text('Telefone', 140, yPos);
    doc.text('Instituição', 170, yPos);
    yPos += 5;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 3;

    doc.setFont(undefined, 'normal');
    inscricoes.forEach((inscricao, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        doc.setFont(undefined, 'bold');
        doc.text('Nome', 25, yPos);
        doc.text('Email', 80, yPos);
        doc.text('Telefone', 140, yPos);
        doc.text('Instituição', 170, yPos);
        yPos += 5;
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 3;
        doc.setFont(undefined, 'normal');
      }

      doc.text(inscricao.nome || 'Não informado', 25, yPos);
      doc.text(inscricao.email || '-', 80, yPos);
      doc.text(inscricao.telefone || '-', 140, yPos);
      doc.text(inscricao.instituicao || '-', 170, yPos);
      yPos += 6;
    });
  }

  yPos += 5;

  // Lista de Presenças
  if (presencas.length > 0) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Lista de Presença (${presencas.length})`, 20, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Nome', 25, yPos);
    doc.text('Data', 100, yPos);
    doc.text('Presente', 140, yPos);
    yPos += 5;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 3;

    doc.setFont(undefined, 'normal');
    presencas.forEach((presenca) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        doc.setFont(undefined, 'bold');
        doc.text('Nome', 25, yPos);
        doc.text('Data', 100, yPos);
        doc.text('Presente', 140, yPos);
        yPos += 5;
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 3;
        doc.setFont(undefined, 'normal');
      }

      const nome = presenca.nome || (presenca.capacitacao_inscricao?.nome) || 'Não informado';
      const data = presenca.data ? new Date(presenca.data).toLocaleDateString('pt-BR') : '-';
      const presente = presenca.presente ? 'Sim' : 'Não';

      doc.text(nome, 25, yPos);
      doc.text(data, 100, yPos);
      doc.text(presente, 140, yPos);
      yPos += 6;
    });
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Salvar PDF
  const nomeArquivo = `relatorio_capacitacao_${capacitacao.id}_${Date.now()}.pdf`;
  doc.save(nomeArquivo);
}

export default RelatorioCapacitacaoPDF;

