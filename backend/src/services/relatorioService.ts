import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';

const prisma = new PrismaClient();
const UPLOAD_DIR = '/var/pinovara/shared/uploads/fotos';
const DOCUMENTS_DIR = '/var/pinovara/shared/uploads/arquivos';

export const relatorioService = {
  /**
   * Gera PDF com dados da organização e fotos
   */
  async gerarRelatorioPDF(organizacaoId: number): Promise<PassThrough> {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const stream = new PassThrough();
    doc.pipe(stream);
    
    // Definir fonte padrão como Arial (Helvetica)
    doc.font('Helvetica');
    
    // Função auxiliar para adicionar rodapé
    const adicionarRodape = () => {
      const currentPage = doc.page;
      const pageHeight = currentPage.height;
      
      // Linha superior do rodapé
      doc.strokeColor('#056839')
        .lineWidth(1)
        .moveTo(30, pageHeight - 40)
        .lineTo(doc.page.width - 30, pageHeight - 40)
        .stroke();
      
      // Fundo do rodapé
      doc.rect(0, pageHeight - 35, doc.page.width, 35)
        .fill('#f8f9fa');
      
      // Texto do rodapé
      doc.fillColor('#056839')
        .font('Helvetica')
        .fontSize(9)
        .text('PINOVARA - Plataforma de Inovação Agroecológica', 40, pageHeight - 25);
      
      doc.fillColor('#999')
        .fontSize(7)
        .text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 40, pageHeight - 15);
    };

    try {
      // Buscar dados completos da organização
      const organizacao = await prisma.organizacao.findUnique({
        where: { id: organizacaoId },
        select: {
          // Campos básicos
          id: true,
          nome: true,
          cnpj: true,
          telefone: true,
          email: true,
          data_fundacao: true,
          
          // Endereço da organização
          organizacao_end_logradouro: true,
          organizacao_end_bairro: true,
          organizacao_end_complemento: true,
          organizacao_end_numero: true,
          organizacao_end_cep: true,
          
          // GPS
          gps_lat: true,
          gps_lng: true,
          gps_alt: true,
          
          // Dados do representante
          representante_nome: true,
          representante_cpf: true,
          representante_rg: true,
          representante_telefone: true,
          representante_email: true,
          representante_end_logradouro: true,
          representante_end_bairro: true,
          representante_end_complemento: true,
          representante_end_numero: true,
          representante_end_cep: true,
          representante_funcao: true,
          
          // Relacionamentos
          estado_organizacao_estadoToestado: true,
          municipio_ibge: true,
          organizacao_foto: {
            orderBy: { ordinal_number: 'asc' }
          },
          organizacao_arquivo: {
            orderBy: { ordinal_number: 'asc' }
          },
          organizacao_participante: true
        }
      });

      if (!organizacao) {
        throw new Error('Organização não encontrada');
      }

      // === CABEÇALHO PROFISSIONAL COM LOGO ===
      // Fundo do cabeçalho (cinza claro)
      doc.rect(0, 0, doc.page.width, 90)
        .fill('#f8f9fa');
      
      // Borda inferior verde
      doc.strokeColor('#056839')
        .lineWidth(2)
        .moveTo(0, 90)
        .lineTo(doc.page.width, 90)
        .stroke();
      
      // Logo PINOVARA (buscar em múltiplos locais)
      let logoAdded = false;
      const logoPaths = [
        path.join(__dirname, '../../public/pinovara.png'),
        path.join(__dirname, '../../../frontend/public/pinovara.png'),
        path.join(__dirname, '../../../deploy-package/pinovara.png')
      ];
      
      for (const logoPath of logoPaths) {
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(logoPath, 30, 15, { width: 50 });
            logoAdded = true;
            break;
          } catch (e) {
            // Continua tentando outros caminhos
          }
        }
      }
      
      // Texto do cabeçalho com cores do projeto
      doc.fillColor('#056839')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('SISTEMA PINOVARA', logoAdded ? 95 : 30, 20)
        .fillColor('#3b2313')
        .font('Helvetica')
        .fontSize(10)
        .text('Plataforma de Inovação Agroecológica', logoAdded ? 95 : 30, 35)
        .fillColor('#056839')
        .fontSize(9)
        .text('UFBA - Universidade Federal da Bahia', logoAdded ? 95 : 30, 48)
        .fillColor('#666')
        .fontSize(8)
        .text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, logoAdded ? 95 : 30, 61);
      
      doc.y = 110;

      // Título principal
      doc.fillColor('#3b2313')
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('RELATÓRIO DE ORGANIZAÇÃO', 30, doc.y, { align: 'center' });
      
      doc.fillColor('#056839')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text(organizacao.nome || 'Sem nome', 30, doc.y + 22, { align: 'center' });
      
      doc.y += 50;

      // Linha divisória decorativa
      doc.strokeColor('#056839')
        .lineWidth(2)
        .moveTo(30, doc.y)
        .lineTo(doc.page.width - 30, doc.y)
        .stroke();
      
      doc.moveDown(1);

      // === DADOS BÁSICOS COM CAIXA ===
      const org: any = organizacao;
      
      // Caixa para dados básicos
      const dadosBasicosY = doc.y + 10;
      doc.rect(30, dadosBasicosY, doc.page.width - 60, 100)
        .stroke('#056839')
        .fill('#f8f9fa');
      
      // Título da seção
      doc.fillColor('#056839')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('DADOS BÁSICOS DA ORGANIZAÇÃO', 40, dadosBasicosY + 10);
      
      // Conteúdo em duas colunas
      let leftColumn = 40;
      let rightColumn = 320;
      let currentY = dadosBasicosY + 35;
      
      doc.font('Helvetica').fontSize(9).fillColor('#3b2313');
      
      if (org.nome) {
        doc.font('Helvetica-Bold').text(`Nome:`, leftColumn, currentY, { width: 60, continued: false });
        doc.font('Helvetica').fillColor('#000').text(org.nome, leftColumn + 60, currentY, { width: 200 });
        currentY += 14;
      }
      
      if (org.cnpj) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`CNPJ:`, leftColumn, currentY, { width: 60, continued: false });
        doc.font('Helvetica').fillColor('#000').text(org.cnpj, leftColumn + 60, currentY, { width: 200 });
        currentY += 14;
      }
      
      if (org.data_fundacao) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Fundação:`, leftColumn, currentY, { width: 60, continued: false });
        doc.font('Helvetica').fillColor('#000').text(new Date(org.data_fundacao).toLocaleDateString('pt-BR'), leftColumn + 60, currentY, { width: 200 });
        currentY += 14;
      }
      
      if (org.telefone) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Telefone:`, rightColumn, dadosBasicosY + 30, { width: 60, continued: false });
        doc.font('Helvetica').fillColor('#000').text(org.telefone, rightColumn + 60, dadosBasicosY + 30, { width: 150 });
      }
      
      if (org.email) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`E-mail:`, rightColumn, dadosBasicosY + 44, { width: 60, continued: false });
        doc.font('Helvetica').fillColor('#000').text(org.email, rightColumn + 60, dadosBasicosY + 44, { width: 150 });
      }
      
      if (org.estado_organizacao_estadoToestado?.descricao) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Estado:`, rightColumn, dadosBasicosY + 58, { width: 60, continued: false });
        doc.font('Helvetica').fillColor('#000').text(org.estado_organizacao_estadoToestado.descricao, rightColumn + 60, dadosBasicosY + 58, { width: 150 });
      }
      
      if (org.municipio_ibge?.descricao) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Município:`, rightColumn, dadosBasicosY + 72, { width: 60, continued: false });
        doc.font('Helvetica').fillColor('#000').text(org.municipio_ibge.descricao, rightColumn + 60, dadosBasicosY + 72, { width: 150 });
      }
      
      doc.y = dadosBasicosY + 110;

      // === ENDEREÇO E LOCALIZAÇÃO COM CAIXA ===
      const enderecoY = doc.y + 15;
      doc.rect(30, enderecoY, doc.page.width - 60, 90)
        .stroke('#056839')
        .fill('#f8f9fa');
      
      // Título da seção
      doc.fillColor('#056839')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('ENDEREÇO E LOCALIZAÇÃO', 40, enderecoY + 10);
      
      // Conteúdo do endereço
      doc.font('Helvetica').fontSize(9).fillColor('#3b2313');
      let enderecoCurrentY = enderecoY + 35;
      
      if (organizacao.organizacao_end_logradouro) {
        doc.font('Helvetica-Bold').text(`Logradouro:`, 40, enderecoCurrentY, { width: 70, continued: false });
        doc.font('Helvetica').fillColor('#000').text(organizacao.organizacao_end_logradouro, 110, enderecoCurrentY, { width: 200 });
        enderecoCurrentY += 12;
      }
      
      if (organizacao.organizacao_end_numero) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Número:`, 40, enderecoCurrentY, { width: 70, continued: false });
        doc.font('Helvetica').fillColor('#000').text(organizacao.organizacao_end_numero, 110, enderecoCurrentY, { width: 200 });
        enderecoCurrentY += 12;
      }
      
      if (organizacao.organizacao_end_bairro) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Bairro:`, 40, enderecoCurrentY, { width: 70, continued: false });
        doc.font('Helvetica').fillColor('#000').text(organizacao.organizacao_end_bairro, 110, enderecoCurrentY, { width: 200 });
        enderecoCurrentY += 12;
      }
      
      if (organizacao.organizacao_end_cep) {
        doc.font('Helvetica-Bold').fillColor('#3b2313').text(`CEP:`, 40, enderecoCurrentY, { width: 70, continued: false });
        doc.font('Helvetica').fillColor('#000').text(organizacao.organizacao_end_cep, 110, enderecoCurrentY, { width: 200 });
      }
      
      // GPS em uma caixa separada
      if (organizacao.gps_lat && organizacao.gps_lng) {
        doc.rect(320, enderecoY + 25, 180, 50)
          .stroke('#056839')
          .fill('#e8f5e8');
        
        doc.fillColor('#056839')
          .font('Helvetica-Bold')
          .fontSize(10)
          .text('COORDENADAS GPS', 330, enderecoY + 35);
        
        doc.font('Helvetica').fontSize(8).fillColor('#000');
        doc.text(`Lat: ${organizacao.gps_lat}`, 330, enderecoY + 48);
        doc.text(`Lng: ${organizacao.gps_lng}`, 330, enderecoY + 58);
        if (organizacao.gps_alt) doc.text(`Alt: ${organizacao.gps_alt}m`, 330, enderecoY + 68);
      }
      
      doc.y = enderecoY + 110;

      // === DADOS DO REPRESENTANTE ===
      if (org.representante_nome || org.organizacao_participante?.length > 0) {
        const repY = doc.y + 10;
        doc.rect(30, repY, doc.page.width - 60, 120)
          .stroke('#056839')
          .fill('#f8f9fa');
        
        doc.fillColor('#056839')
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('DADOS DO REPRESENTANTE', 40, repY + 10);
        
        doc.font('Helvetica').fontSize(9).fillColor('#3b2313');
        let currentY = repY + 30;
        
        // Dados do representante principal (da tabela organizacao)
        if (org.representante_nome) {
          doc.font('Helvetica-Bold').text(`Nome:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_nome, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        if (org.representante_cpf) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`CPF:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_cpf, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        if (org.representante_rg) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`RG:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_rg, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        if (org.representante_telefone) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Telefone:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_telefone, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        if (org.representante_email) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`E-mail:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_email, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        if (org.representante_funcao) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Função:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_funcao, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        // Endereço do representante (se diferente da organização)
        if (org.representante_end_logradouro) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Endereço:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_end_logradouro, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        if (org.representante_end_numero) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Número:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_end_numero, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        if (org.representante_end_bairro) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`Bairro:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_end_bairro, 100, currentY, { width: 200 });
          currentY += 12;
        }
        
        if (org.representante_end_cep) {
          doc.font('Helvetica-Bold').fillColor('#3b2313').text(`CEP:`, 40, currentY, { width: 60, continued: false });
          doc.font('Helvetica').fillColor('#000').text(org.representante_end_cep, 100, currentY, { width: 200 });
        }
        
        doc.y = repY + 140;
      }

      // === ARQUIVOS/DOCUMENTOS COM CONTEÚDO ===
      if (organizacao.organizacao_arquivo && organizacao.organizacao_arquivo.length > 0) {
        // Verificar se precisa de nova página
        if (doc.y > 500) {
          adicionarRodape();
          doc.addPage();
        }
        
        const docY = doc.y + 15;
        const docHeight = Math.min(80, 30 + (organizacao.organizacao_arquivo.length * 15));
        doc.rect(30, docY, doc.page.width - 60, docHeight)
          .stroke('#056839')
          .fill('#f8f9fa');
        
        doc.fillColor('#056839')
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('DOCUMENTOS ANEXADOS', 40, docY + 10);
        
        doc.fontSize(10).fillColor('#000');
        organizacao.organizacao_arquivo.forEach((arquivo: any, index: number) => {
          const currentY = docY + 30 + (index * 15);
          doc.text(`${index + 1}. ${arquivo.arquivo || 'Sem nome'}`, 40, currentY, { width: 400 });
          if (arquivo.obs) {
            doc.fontSize(8).fillColor('#666').text(`    ${arquivo.obs}`, 40, currentY + 10, { width: 400 });
          }
        });
        
        doc.y = docY + docHeight + 15;

        // === INCLUIR DOCUMENTOS NO PDF ===
        // Verificar se há espaço suficiente na página atual
        if (doc.y > 600) {
          adicionarRodape();
          doc.addPage();
          doc.y = 80;
        } else {
          doc.moveDown(2);
        }
        
        // Cabeçalho da seção de documentos
        doc.rect(40, 40, doc.page.width - 80, 50)
          .fill('#f8f9fa')
          .stroke('#056839');
        
        // Borda inferior verde
        doc.strokeColor('#056839')
          .lineWidth(2)
          .moveTo(40, 90)
          .lineTo(doc.page.width - 40, 90)
          .stroke();
        
        doc.fillColor('#056839')
          .font('Helvetica-Bold')
          .fontSize(14)
          .text('DOCUMENTOS DA ORGANIZAÇÃO', 30, 50, { align: 'center' });
        
        doc.y = 120;

        // Processar cada documento
        for (const arquivo of organizacao.organizacao_arquivo) {
          if (!arquivo.arquivo) continue;

          const arquivoPath = path.join(DOCUMENTS_DIR, arquivo.arquivo);
          
          // Verificar se arquivo existe
          if (!fs.existsSync(arquivoPath)) {
            // Caixa para documento não encontrado
            doc.rect(40, doc.y, doc.page.width - 80, 80)
              .stroke('#dc3545')
              .fill('#f8d7da');
            
            doc.fillColor('#721c24')
              .fontSize(12)
              .text('DOCUMENTO NÃO ENCONTRADO', 50, doc.y + 20);
            
            doc.fontSize(10).text(`Arquivo: ${arquivo.arquivo}`, 50, doc.y + 40);
            if (arquivo.obs) doc.text(`Descrição: ${arquivo.obs}`, 50, doc.y + 55);
            
            doc.y += 100;
            continue;
          }

          // Verificar se é PDF (pode ser incluído diretamente)
          const ext = path.extname(arquivo.arquivo).toLowerCase();
          
          if (ext === '.pdf') {
            // Para PDFs, criar uma página informativa
            doc.rect(40, doc.y, doc.page.width - 80, 100)
              .stroke('#056839')
              .fill('#ffffff');

            // Cabeçalho do documento
            doc.rect(40, doc.y, doc.page.width - 80, 30)
              .fill('#f8f9fa');
            
            doc.fillColor('#056839')
              .fontSize(14)
              .text(`PDF: ${arquivo.arquivo}`, 50, doc.y + 8, { width: doc.page.width - 100 });
            
            doc.fillColor('#666')
              .fontSize(9)
              .text(`Data: ${new Date(arquivo.creation_date).toLocaleDateString('pt-BR')}`, 50, doc.y + 20, { width: doc.page.width - 100 });

            // Informação sobre o PDF
            doc.fillColor('#000')
              .fontSize(11)
              .text('Este documento PDF foi anexado à organização e está disponível para download no sistema.', 50, doc.y + 45, { width: doc.page.width - 100 });
            
            if (arquivo.obs) {
              doc.text(`Descrição: ${arquivo.obs}`, 50, doc.y + 65, { width: doc.page.width - 100 });
            }

            doc.y += 120;

          } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            // Para imagens, incluir diretamente no PDF
            doc.rect(40, doc.y, doc.page.width - 80, 400)
              .stroke('#056839')
              .fill('#ffffff');

            // Cabeçalho do documento
            doc.rect(40, doc.y, doc.page.width - 80, 40)
              .fill('#f8f9fa');
            
            doc.fillColor('#056839')
              .fontSize(14)
              .text(`IMAGEM: ${arquivo.arquivo}`, 50, doc.y + 12, { width: doc.page.width - 100 });
            
            doc.fillColor('#666')
              .fontSize(9)
              .text(`Data: ${new Date(arquivo.creation_date).toLocaleDateString('pt-BR')}`, 50, doc.y + 28, { width: doc.page.width - 100 });

            // Inserir imagem
            try {
              doc.image(arquivoPath, {
                fit: [doc.page.width - 120, 320],
                align: 'center'
              });
            } catch (error) {
              doc.rect(50, doc.y + 50, doc.page.width - 100, 320)
                .stroke('#dc3545')
                .fill('#f8d7da');
              
              doc.fillColor('#721c24')
                .fontSize(12)
                .text('ERRO AO CARREGAR IMAGEM', 50, doc.y + 180, { align: 'center' });
            }

            if (arquivo.obs) {
              doc.fillColor('#000')
                .fontSize(10)
                .text(`Descrição: ${arquivo.obs}`, 50, doc.y + 380, { width: doc.page.width - 100 });
            }

            doc.y += 420;

          } else {
            // Para outros tipos de arquivo (DOC, DOCX, etc.)
            doc.rect(40, doc.y, doc.page.width - 80, 80)
              .stroke('#056839')
              .fill('#ffffff');

            // Cabeçalho do documento
            doc.rect(40, doc.y, doc.page.width - 80, 30)
              .fill('#f8f9fa');
            
            doc.fillColor('#056839')
              .fontSize(14)
              .text(`ARQUIVO: ${arquivo.arquivo}`, 50, doc.y + 8, { width: doc.page.width - 100 });
            
            doc.fillColor('#666')
              .fontSize(9)
              .text(`Data: ${new Date(arquivo.creation_date).toLocaleDateString('pt-BR')}`, 50, doc.y + 20, { width: doc.page.width - 100 });

            // Informação sobre o arquivo
            doc.fillColor('#000')
              .fontSize(11)
              .text('Este documento foi anexado à organização e está disponível para download no sistema.', 50, doc.y + 45, { width: doc.page.width - 100 });
            
            if (arquivo.obs) {
              doc.text(`Descrição: ${arquivo.obs}`, 50, doc.y + 65, { width: doc.page.width - 100 });
            }

            doc.y += 100;
          }

          // Adicionar nova página se necessário
          if (doc.y > 650) {
            doc.addPage();
            doc.y = 80;
          }
        }
      }

      // === FOTOS COM CAIXAS ELEGANTES ===
      if (organizacao.organizacao_foto && organizacao.organizacao_foto.length > 0) {
        // Verificar se há espaço suficiente na página atual
        if (doc.y > 500) {
          adicionarRodape();
          doc.addPage();
          doc.y = 80;
        } else {
          doc.moveDown(2);
        }
        
        // Cabeçalho da seção de fotos
        doc.rect(40, 40, doc.page.width - 80, 50)
          .fill('#f8f9fa')
          .stroke('#056839');
        
        // Borda inferior verde
        doc.strokeColor('#056839')
          .lineWidth(2)
          .moveTo(40, 90)
          .lineTo(doc.page.width - 40, 90)
          .stroke();
        
        doc.fillColor('#056839')
          .font('Helvetica-Bold')
          .fontSize(14)
          .text('FOTOS DA ORGANIZAÇÃO', 30, 50, { align: 'center' });
        
        doc.y = 120;

        for (const foto of organizacao.organizacao_foto) {
          if (!foto.foto) continue;

          const fotoPath = path.join(UPLOAD_DIR, foto.foto);
          
          // Verificar se arquivo existe
          if (!fs.existsSync(fotoPath)) {
            // Caixa para foto não encontrada
            doc.rect(40, doc.y, doc.page.width - 80, 80)
              .stroke('#dc3545')
              .fill('#f8d7da');
            
            doc.fillColor('#721c24')
              .fontSize(12)
              .text('FOTO NÃO ENCONTRADA', 50, doc.y + 20);
            
            doc.fontSize(10).text(`Arquivo: ${foto.foto}`, 50, doc.y + 40);
            if (foto.obs) doc.text(`Descrição: ${foto.obs}`, 50, doc.y + 55);
            
            doc.y += 100;
            continue;
          }

          // Adicionar nova página se necessário
          if (doc.y > 500) {
            doc.addPage();
            doc.y = 80;
          }

          // Caixa principal da foto
          doc.rect(40, doc.y, doc.page.width - 80, 420)
            .stroke('#056839')
            .fill('#ffffff');

          // Cabeçalho da foto
          doc.rect(40, doc.y, doc.page.width - 80, 40)
            .fill('#f8f9fa');
          
          // Título/Descrição da foto
          doc.fillColor('#056839')
            .fontSize(14)
            .text(foto.obs || foto.foto || 'Sem descrição', 50, doc.y + 12, { width: doc.page.width - 100 });
          
          // Informações da foto
          doc.fillColor('#666')
            .fontSize(9)
            .text(`Arquivo: ${foto.foto} | Data: ${new Date(foto.creation_date).toLocaleDateString('pt-BR')}`, 50, doc.y + 30, { width: doc.page.width - 100 });

          // Inserir imagem centralizada
          try {
            const imageY = doc.y + 50;
            const maxWidth = doc.page.width - 120;
            const maxHeight = 320;

            doc.image(fotoPath, {
              fit: [maxWidth, maxHeight],
              align: 'center'
            });

          } catch (error) {
            doc.rect(50, doc.y + 50, doc.page.width - 100, 320)
              .stroke('#dc3545')
              .fill('#f8d7da');
            
              doc.fillColor('#721c24')
                .fontSize(12)
                .text('ERRO AO CARREGAR IMAGEM', 50, doc.y + 180, { align: 'center' });
            
            doc.fontSize(10)
              .text(`Erro: ${error}`, 50, doc.y + 200, { align: 'center' });
          }

          doc.y += 440;
        }
      }

      // Adicionar rodapé na última página
      adicionarRodape();
      
      // Finalizar o documento
      doc.end();
      return stream;

    } catch (error: any) {
      doc.end();
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }
  }
};

