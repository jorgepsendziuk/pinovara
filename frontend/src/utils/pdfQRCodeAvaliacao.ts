import { jsPDF } from 'jspdf';
import { Capacitacao } from '../types/capacitacao';

// Função helper para gerar QR code como imagem base64
async function gerarQRCodeComoImagem(value: string, size: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Não foi possível criar contexto do canvas'));
        return;
      }

      // Preencher fundo branco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Usar API online para gerar QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = canvas.toDataURL('image/png');
        resolve(imageData);
      };
      
      img.onerror = () => {
        // Fallback: criar QR code simples usando canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 10, 50, 50);
        ctx.fillRect(140, 10, 50, 50);
        ctx.fillRect(10, 140, 50, 50);
        
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', size / 2, size / 2);
        
        const imageData = canvas.toDataURL('image/png');
        resolve(imageData);
      };
      
      img.src = qrUrl;
    } catch (error) {
      reject(error);
    }
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

export async function gerarPDFQRCodeAvaliacao(capacitacao: Capacitacao) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

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

  let yPos = 60;

  // Título da página
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('AVALIAÇÃO DA CAPACITAÇÃO', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Informações destacadas da Capacitação
  doc.setFillColor(245, 247, 250); // Fundo cinza claro para destacar
  doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
  
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('Capacitação:', margin + 3, yPos + 7);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(12);
  const titulo = capacitacao.titulo || capacitacao.qualificacao?.titulo || 'Não informado';
  const tituloLinhas = doc.splitTextToSize(titulo, pageWidth - 2 * margin - 6);
  doc.text(tituloLinhas, margin + 3, yPos + 14);
  
  yPos += 20;
  
  // Organização
  if (capacitacao.organizacoes_completas && capacitacao.organizacoes_completas.length > 0) {
    const orgs = capacitacao.organizacoes_completas.map(org => org.nome).join(', ');
    doc.setFontSize(11);
    doc.text(`Organização: ${orgs}`, margin + 3, yPos);
    yPos += 6;
  }
  
  // Local
  if (capacitacao.local) {
    doc.text(`Local: ${capacitacao.local}`, margin + 3, yPos);
    yPos += 6;
  }
  
  // Datas e Horário
  if (capacitacao.data_inicio || capacitacao.data_fim) {
    let periodo = '';
    if (capacitacao.data_inicio) {
      periodo = new Date(capacitacao.data_inicio).toLocaleDateString('pt-BR');
    }
    if (capacitacao.data_fim) {
      periodo += periodo ? ' a ' : '';
      periodo += new Date(capacitacao.data_fim).toLocaleDateString('pt-BR');
    }
    if (capacitacao.turno) {
      periodo += ` - ${capacitacao.turno}`;
    }
    doc.text(`Período: ${periodo}`, margin + 3, yPos);
    yPos += 6;
  }
  
  // Técnico criador
  if (capacitacao.tecnico_criador) {
    doc.text(`Instrutor: ${capacitacao.tecnico_criador.name}`, margin + 3, yPos);
  }

  yPos += 18;

  // Gerar QR Code (aumentado em 20%)
  const linkAvaliacao = `${window.location.origin}/capacitacao/${capacitacao.link_avaliacao}/avaliacao`;
  const qrImageData = await gerarQRCodeComoImagem(linkAvaliacao, 300);
  
  // Adicionar QR code ao PDF (centralizado) - 20% maior: 65 * 1.2 = 78mm
  const qrWidth = 78;
  const qrX = (pageWidth - qrWidth) / 2;
  doc.addImage(qrImageData, 'PNG', qrX, yPos, qrWidth, qrWidth);
  
  yPos += qrWidth + 10;
  
  // Link abaixo do QR code (centralizado corretamente e clicável)
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // #64748b
  const linkTexto = linkAvaliacao.replace(/^https?:\/\//, ''); // Remover protocolo
  // Usar splitTextToSize para garantir que o texto caiba e depois centralizar
  const linkLinhas = doc.splitTextToSize(linkTexto, pageWidth - 2 * margin);
  let linkY = yPos;
  linkLinhas.forEach((linha: string, index: number) => {
    const textWidth = doc.getTextWidth(linha);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(linha, textX, linkY, { align: 'left' });
    // Tornar o link clicável
    doc.link(textX, linkY - 3, textWidth, 4, { url: linkAvaliacao });
    linkY += 4;
  });
  yPos = linkY + 8;
  
  // Instruções
  doc.setFontSize(11);
  doc.setTextColor(59, 35, 19); // #3b2313
  doc.setFont(undefined, 'bold');
  doc.text('Instruções:', margin, yPos);
  yPos += 6;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const instrucoes = [
    '1. Escaneie o QR code acima com seu celular',
    '2. Você será direcionado para a página de avaliação',
    '3. Responda todas as perguntas do questionário',
    '4. Envie sua avaliação'
  ];
  
  instrucoes.forEach((instrucao) => {
    if (yPos > pageHeight - 15) {
      yPos = pageHeight - 15;
    }
    doc.text(instrucao, margin + 3, yPos);
    yPos += 5;
  });
  
  // Salvar PDF
  const nomeArquivo = `qrcode_avaliacao_${capacitacao.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
}
