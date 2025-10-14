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
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = new PassThrough();
    doc.pipe(stream);
    
    // Definir fonte padrão
    doc.font('Helvetica');

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
          organizacao_participante: true,
          organizacao_indicador: true,
          organizacao_producao: true,
          organizacao_abrangencia_socio: true,
          organizacao_abrangencia_pj: true,

          // Campos complementares
          descricao: true,
          eixos_trabalhados: true,
          enfase: true,
          enfase_outros: true,
          metodologia: true,
          orientacoes: true,
          obs: true,
          assinatura_rep_legal: true,
          participantes_menos_10: true,

          // Características dos associados
          caracteristicas_n_total_socios: true,
          caracteristicas_n_total_socios_caf: true,
          caracteristicas_n_distintos_caf: true,
          caracteristicas_n_ativos_total: true,
          caracteristicas_n_ativos_caf: true,
          caracteristicas_n_naosocio_op_total: true,
          caracteristicas_n_naosocio_op_caf: true,
          caracteristicas_n_ingressaram_total_12_meses: true,
          caracteristicas_n_ingressaram_caf_12_meses: true,
          caracteristicas_n_socios_paa: true,
          caracteristicas_n_naosocios_paa: true,
          caracteristicas_n_socios_pnae: true,
          caracteristicas_n_naosocios_pnae: true,

          // Características por categoria e gênero
          caracteristicas_ta_af_homem: true,
          caracteristicas_ta_af_mulher: true,
          caracteristicas_ta_a_homem: true,
          caracteristicas_ta_a_mulher: true,
          caracteristicas_ta_p_homem: true,
          caracteristicas_ta_p_mulher: true,
          caracteristicas_ta_i_homem: true,
          caracteristicas_ta_i_mulher: true,
          caracteristicas_ta_q_homem: true,
          caracteristicas_ta_q_mulher: true,
          caracteristicas_ta_e_homem: true,
          caracteristicas_ta_e_mulher: true,
          caracteristicas_ta_o_homem: true,
          caracteristicas_ta_o_mulher: true,

          // Características por tipo de produção
          caracteristicas_ta_caf_organico: true,
          caracteristicas_ta_caf_agroecologico: true,
          caracteristicas_ta_caf_transicao: true,
          caracteristicas_ta_caf_convencional: true,

          // Sim/Não flags
          sim_nao_file: true,
          sim_nao_producao: true,
          sim_nao_socio: true,
          sim_nao_pj: true
        }
      });

      if (!organizacao) {
        throw new Error('Organização não encontrada');
      }

      // === CABEÇALHO BONITO (APENAS PRIMEIRA PÁGINA) ===
      // Fundo claro para o cabeçalho
      doc.rect(0, 0, doc.page.width, 100)
        .fill('#f8f9fa');
      
      // Borda inferior verde
      doc.strokeColor('#056839')
        .lineWidth(3)
        .moveTo(0, 100)
        .lineTo(doc.page.width, 100)
        .stroke();
      
      // Logo PINOVARA
      let logoAdded = false;
      const logoPaths = [
        path.join(__dirname, '../../public/pinovara.png'),
        path.join(__dirname, '../../../frontend/public/pinovara.png'),
        path.join(__dirname, '../../../deploy-package/pinovara.png')
      ];
      
      for (const logoPath of logoPaths) {
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(logoPath, 50, 25, { width: 60 });
            logoAdded = true;
            break;
          } catch (e) {
            // Continua tentando outros caminhos
          }
        }
      }
      
      // Texto do cabeçalho com cores
      const textX = logoAdded ? 120 : 50;
      doc.fillColor('#056839')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('SISTEMA PINOVARA', textX, 30);
      
      doc.fillColor('#3b2313')
        .font('Helvetica')
        .fontSize(10)
        .text('Plataforma de Inovação Agroecológica - UFBA', textX, 50);
      
      doc.fillColor('#666')
        .fontSize(8)
        .text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, textX, 65);
      
      doc.y = 120;

      // Título do relatório
      doc.fillColor('#3b2313')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('RELATÓRIO DE ORGANIZAÇÃO', 50, doc.y, { align: 'center' });
      
      doc.fillColor('#056839')
        .fontSize(14)
        .text(organizacao.nome || 'Sem nome', 50, doc.y + 22, { align: 'center' });
      
      doc.y += 55;

      // Linha divisória
      doc.strokeColor('#056839')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke();
      
      doc.moveDown(1.5);

      // Função auxiliar para criar tabela de 2 colunas
      const criarTabela2Colunas = (dados: [string, string][]) => {
        const colunaEsquerda: [string, string][] = [];
        const colunaDireita: [string, string][] = [];
        
        // Dividir dados em 2 colunas
        dados.forEach((item, index) => {
          if (index % 2 === 0) {
            colunaEsquerda.push(item);
          } else {
            colunaDireita.push(item);
          }
        });

        // Calcular altura da tabela
        const maxLinhas = Math.max(colunaEsquerda.length, colunaDireita.length);
        const alturaLinha = 20;
        const alturaTotalTabela = maxLinhas * alturaLinha;
        const larguraColuna = (doc.page.width - 100) / 2 - 10;

        // Desenhar bordas da tabela
        doc.strokeColor('#000')
          .lineWidth(1)
          .rect(50, doc.y, larguraColuna, alturaTotalTabela)
          .stroke();
        
        doc.rect(50 + larguraColuna + 10, doc.y, larguraColuna, alturaTotalTabela)
          .stroke();

        const startY = doc.y;

        // Coluna Esquerda
        let currentY = startY + 5;
        colunaEsquerda.forEach(([label, value]) => {
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#000')
            .text(label, 55, currentY, { width: 100, continued: false });
          doc.font('Helvetica').fontSize(9)
            .text(value, 160, currentY, { width: larguraColuna - 110 });
          
          // Linha divisória horizontal
          currentY += alturaLinha;
          if (currentY < startY + alturaTotalTabela) {
            doc.strokeColor('#ddd').lineWidth(0.5)
              .moveTo(50, currentY - 5)
              .lineTo(50 + larguraColuna, currentY - 5)
              .stroke();
          }
        });

        // Coluna Direita
        currentY = startY + 5;
        colunaDireita.forEach(([label, value]) => {
          const xOffset = 50 + larguraColuna + 10;
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#000')
            .text(label, xOffset + 5, currentY, { width: 100, continued: false });
          doc.font('Helvetica').fontSize(9)
            .text(value, xOffset + 110, currentY, { width: larguraColuna - 115 });
          
          // Linha divisória horizontal
          currentY += alturaLinha;
          if (currentY < startY + alturaTotalTabela) {
            doc.strokeColor('#ddd').lineWidth(0.5)
              .moveTo(xOffset, currentY - 5)
              .lineTo(xOffset + larguraColuna, currentY - 5)
              .stroke();
          }
        });

        doc.y = startY + alturaTotalTabela + 20;
      };

      // === TABELA DE DADOS BÁSICOS ===
      const org: any = organizacao;
      
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
        .text('DADOS BÁSICOS DA ORGANIZAÇÃO', 50, doc.y);
      doc.moveDown(0.5);

      const tabelaDados: [string, string][] = [];
      if (org.nome) tabelaDados.push(['Nome:', org.nome]);
      if (org.cnpj) tabelaDados.push(['CNPJ:', org.cnpj]);
      if (org.data_fundacao) tabelaDados.push(['Data de Fundação:', new Date(org.data_fundacao).toLocaleDateString('pt-BR')]);
      if (org.telefone) tabelaDados.push(['Telefone:', org.telefone]);
      if (org.email) tabelaDados.push(['E-mail:', org.email]);
      if (org.estado_organizacao_estadoToestado?.descricao) tabelaDados.push(['Estado:', org.estado_organizacao_estadoToestado.descricao]);
      if (org.municipio_ibge?.descricao) tabelaDados.push(['Município:', org.municipio_ibge.descricao]);

      criarTabela2Colunas(tabelaDados);

      // === TABELA DE ENDEREÇO ===
      if (doc.y > 650) {
        doc.addPage();
      }

      doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
        .text('ENDEREÇO E LOCALIZAÇÃO', 50, doc.y);
      doc.moveDown(0.5);

      const tabelaEndereco: [string, string][] = [];
      if (organizacao.organizacao_end_logradouro) tabelaEndereco.push(['Logradouro:', organizacao.organizacao_end_logradouro]);
      if (organizacao.organizacao_end_numero) tabelaEndereco.push(['Número:', organizacao.organizacao_end_numero]);
      if (organizacao.organizacao_end_bairro) tabelaEndereco.push(['Bairro:', organizacao.organizacao_end_bairro]);
      if (organizacao.organizacao_end_complemento) tabelaEndereco.push(['Complemento:', organizacao.organizacao_end_complemento]);
      if (organizacao.organizacao_end_cep) tabelaEndereco.push(['CEP:', organizacao.organizacao_end_cep]);
      if (organizacao.gps_lat && organizacao.gps_lng) {
        tabelaEndereco.push(['Latitude:', String(organizacao.gps_lat)]);
        tabelaEndereco.push(['Longitude:', String(organizacao.gps_lng)]);
        if (organizacao.gps_alt) tabelaEndereco.push(['Altitude:', `${organizacao.gps_alt}m`]);
      }

      criarTabela2Colunas(tabelaEndereco);

      // === TABELA DO REPRESENTANTE ===
      if (org.representante_nome || org.organizacao_participante?.length > 0) {
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('DADOS DO REPRESENTANTE', 50, doc.y);
        doc.moveDown(0.5);

        const tabelaRepresentante: [string, string][] = [];
        if (org.representante_nome) tabelaRepresentante.push(['Nome:', org.representante_nome]);
        if (org.representante_cpf) tabelaRepresentante.push(['CPF:', org.representante_cpf]);
        if (org.representante_rg) tabelaRepresentante.push(['RG:', org.representante_rg]);
        if (org.representante_telefone) tabelaRepresentante.push(['Telefone:', org.representante_telefone]);
        if (org.representante_email) tabelaRepresentante.push(['E-mail:', org.representante_email]);
        if (org.representante_funcao) tabelaRepresentante.push(['Função:', org.representante_funcao]);
        if (org.representante_end_logradouro) tabelaRepresentante.push(['Endereço:', org.representante_end_logradouro]);
        if (org.representante_end_numero) tabelaRepresentante.push(['Número:', org.representante_end_numero]);
        if (org.representante_end_bairro) tabelaRepresentante.push(['Bairro:', org.representante_end_bairro]);
        if (org.representante_end_cep) tabelaRepresentante.push(['CEP:', org.representante_end_cep]);

        criarTabela2Colunas(tabelaRepresentante);
      }

      // === LISTA DE DOCUMENTOS ===
      if (organizacao.organizacao_arquivo && organizacao.organizacao_arquivo.length > 0) {
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('DOCUMENTOS ANEXADOS', 50, doc.y);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(9).fillColor('#000');
        organizacao.organizacao_arquivo.forEach((arquivo: any, index: number) => {
          doc.font('Helvetica-Bold')
            .text(`${index + 1}. `, 50, doc.y, { continued: true });
          doc.font('Helvetica')
            .text(arquivo.arquivo || 'Sem nome', { width: 480 });
          
          if (arquivo.obs) {
            doc.fontSize(8).fillColor('#666')
              .text(`   ${arquivo.obs}`, 50, doc.y, { width: 480 });
            doc.fontSize(9).fillColor('#000');
          }
          doc.moveDown(0.5);
        });

        doc.moveDown(1);
      }

      // === CARACTERÍSTICAS DOS ASSOCIADOS ===
      if (organizacao.caracteristicas_n_total_socios ||
          organizacao.caracteristicas_n_total_socios_caf ||
          organizacao.caracteristicas_n_distintos_caf) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('CARACTERÍSTICAS DOS ASSOCIADOS', 50, doc.y);
        doc.moveDown(0.5);

        const tabelaCaracteristicas: [string, string][] = [];

        if (organizacao.caracteristicas_n_total_socios) {
          tabelaCaracteristicas.push(['Total de Sócios:', String(organizacao.caracteristicas_n_total_socios)]);
        }
        if (organizacao.caracteristicas_n_total_socios_caf) {
          tabelaCaracteristicas.push(['Sócios com CAF:', String(organizacao.caracteristicas_n_total_socios_caf)]);
        }
        if (organizacao.caracteristicas_n_distintos_caf) {
          tabelaCaracteristicas.push(['CAF Distintos:', String(organizacao.caracteristicas_n_distintos_caf)]);
        }
        if (organizacao.caracteristicas_n_ativos_total) {
          tabelaCaracteristicas.push(['Sócios Ativos (Total):', String(organizacao.caracteristicas_n_ativos_total)]);
        }
        if (organizacao.caracteristicas_n_ativos_caf) {
          tabelaCaracteristicas.push(['Sócios Ativos (CAF):', String(organizacao.caracteristicas_n_ativos_caf)]);
        }
        if (organizacao.caracteristicas_n_ingressaram_total_12_meses) {
          tabelaCaracteristicas.push(['Novos Sócios (12 meses):', String(organizacao.caracteristicas_n_ingressaram_total_12_meses)]);
        }
        if (organizacao.caracteristicas_n_ingressaram_caf_12_meses) {
          tabelaCaracteristicas.push(['Novos Sócios CAF (12 meses):', String(organizacao.caracteristicas_n_ingressaram_caf_12_meses)]);
        }
        if (organizacao.caracteristicas_n_socios_paa) {
          tabelaCaracteristicas.push(['Sócios PAA:', String(organizacao.caracteristicas_n_socios_paa)]);
        }
        if (organizacao.caracteristicas_n_socios_pnae) {
          tabelaCaracteristicas.push(['Sócios PNAE:', String(organizacao.caracteristicas_n_socios_pnae)]);
        }

        criarTabela2Colunas(tabelaCaracteristicas);

        // Distribuição por categoria e gênero
        if (doc.y > 650) {
          doc.addPage();
        }

        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#056839')
          .text('DISTRIBUIÇÃO POR CATEGORIA E GÊNERO', 50, doc.y);
        doc.moveDown(0.3);

        const categorias = [
          { nome: 'Agricultura Familiar', campo: 'caracteristicas_ta_af' },
          { nome: 'Assentado', campo: 'caracteristicas_ta_a' },
          { nome: 'Pescador', campo: 'caracteristicas_ta_p' },
          { nome: 'Indígena', campo: 'caracteristicas_ta_i' },
          { nome: 'Quilombola', campo: 'caracteristicas_ta_q' },
          { nome: 'Extrativista', campo: 'caracteristicas_ta_e' },
          { nome: 'Outro', campo: 'caracteristicas_ta_o' }
        ];

        categorias.forEach(cat => {
          const homem = (organizacao as any)[`${cat.campo}_homem`] || 0;
          const mulher = (organizacao as any)[`${cat.campo}_mulher`] || 0;
          const total = homem + mulher;

          if (total > 0) {
            doc.font('Helvetica').fontSize(9).fillColor('#000')
              .text(`${cat.nome}: ${total} (${homem}H / ${mulher}M)`, 70, doc.y);
            doc.moveDown(0.3);
          }
        });

        // Tipos de produção
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#056839')
          .text('TIPOS DE PRODUÇÃO', 50, doc.y);
        doc.moveDown(0.3);

        const tiposProducao = [
          { nome: 'Orgânico', campo: 'caracteristicas_ta_caf_organico' },
          { nome: 'Agroecológico', campo: 'caracteristicas_ta_caf_agroecologico' },
          { nome: 'Transição', campo: 'caracteristicas_ta_caf_transicao' },
          { nome: 'Convencional', campo: 'caracteristicas_ta_caf_convencional' }
        ];

        tiposProducao.forEach(tipo => {
          const valor = (organizacao as any)[tipo.campo] || 0;
          if (valor > 0) {
            doc.font('Helvetica').fontSize(9).fillColor('#000')
              .text(`${tipo.nome}: ${valor}`, 70, doc.y);
            doc.moveDown(0.3);
          }
        });
      }

      // === PRODUÇÃO ===
      if (organizacao.organizacao_producao && organizacao.organizacao_producao.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('DADOS DE PRODUÇÃO', 50, doc.y);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(9).fillColor('#000');
        organizacao.organizacao_producao.forEach((producao: any, index: number) => {
          doc.font('Helvetica-Bold')
            .text(`${index + 1}. ${producao.cultura}`, 50, doc.y);
          doc.font('Helvetica')
            .text(`   Mensal: ${producao.mensal}kg | Anual: ${producao.anual}kg`, 70, doc.y + 12);
          doc.moveDown(1);
        });
      }

      // === ABRANGÊNCIA GEOGRÁFICA ===
      if (organizacao.organizacao_abrangencia_socio && organizacao.organizacao_abrangencia_socio.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('ABRANGÊNCIA GEOGRÁFICA DOS SÓCIOS', 50, doc.y);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(9).fillColor('#000');
        organizacao.organizacao_abrangencia_socio.forEach((abrangencia: any, index: number) => {
          doc.text(`${index + 1}. ${abrangencia.municipio?.descricao || 'Município não informado'} - ${abrangencia.num_socios} sócios`, 50, doc.y);
          doc.moveDown(0.3);
        });
      }

      // === ASSOCIADOS PESSOA JURÍDICA ===
      if (organizacao.organizacao_abrangencia_pj && organizacao.organizacao_abrangencia_pj.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('ASSOCIADOS PESSOA JURÍDICA', 50, doc.y);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(9).fillColor('#000');
        organizacao.organizacao_abrangencia_pj.forEach((pj: any, index: number) => {
          doc.font('Helvetica-Bold')
            .text(`${index + 1}. ${pj.razao_social || pj.cnpj_pj}`, 50, doc.y);
          doc.font('Helvetica')
            .text(`   CNPJ: ${pj.cnpj_pj} | Sócios: ${pj.num_socios_total} (${pj.num_socios_caf} CAF)`, 70, doc.y + 12);
          doc.moveDown(0.8);
        });
      }

      // === DESCRIÇÃO GERAL ===
      if (organizacao.descricao) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('DESCRIÇÃO GERAL DO EMPREENDIMENTO', 50, doc.y);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(10).fillColor('#000')
          .text(organizacao.descricao, 50, doc.y, {
            width: doc.page.width - 100,
            align: 'justify'
          });
        doc.moveDown(1);
      }

      // === ORIENTAÇÕES TÉCNICAS ===
      if (organizacao.eixos_trabalhados || organizacao.metodologia || organizacao.orientacoes) {
        if (doc.y > 550) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('ORIENTAÇÕES TÉCNICAS DA ATIVIDADE', 50, doc.y);
        doc.moveDown(0.5);

        const tabelaOrientacoes: [string, string][] = [];

        if (organizacao.eixos_trabalhados) {
          tabelaOrientacoes.push(['Eixos Trabalhados:', organizacao.eixos_trabalhados]);
        }

        const enfaseMap = {
          1: 'PNAE',
          2: 'PAA Leite',
          3: 'Crédito do INCRA',
          4: 'Governos',
          5: 'Redes de Cooperação e/ou Comercialização'
        };

        if (organizacao.enfase) {
          const enfaseTexto = enfaseMap[organizacao.enfase as keyof typeof enfaseMap] ||
                            (organizacao.enfase === 99 && organizacao.enfase_outros ? organizacao.enfase_outros : 'Outro');
          tabelaOrientacoes.push(['Ênfase:', enfaseTexto]);
        }

        criarTabela2Colunas(tabelaOrientacoes);

        if (organizacao.metodologia) {
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#056839')
            .text('Metodologia Utilizada:', 50, doc.y);
          doc.moveDown(0.3);
          doc.font('Helvetica').fontSize(9).fillColor('#000')
            .text(organizacao.metodologia, 70, doc.y, {
              width: doc.page.width - 140,
              align: 'justify'
            });
        }

        if (organizacao.orientacoes) {
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#056839')
            .text('Orientações e Soluções Técnicas:', 50, doc.y);
          doc.moveDown(0.3);
          doc.font('Helvetica').fontSize(9).fillColor('#000')
            .text(organizacao.orientacoes, 70, doc.y, {
              width: doc.page.width - 140,
              align: 'justify'
            });
        }
      }

      // === INDICADORES ===
      if (organizacao.organizacao_indicador && organizacao.organizacao_indicador.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('INDICADORES DA ATIVIDADE', 50, doc.y);
        doc.moveDown(0.5);

        const indicadoresMap = {
          1: 'Conformidade documental e regularidade do empreendimento',
          2: 'Práticas de tomada de decisão',
          3: 'Políticas públicas de apoio à produção e comercialização',
          4: 'Associados com acesso às políticas públicas',
          5: 'Participação dos associados no empreendimento',
          6: 'Participação de mulheres na gestão',
          7: 'Capacitação de gestores',
          8: 'Capacitação de associados',
          9: 'Geração de Empregos Diretos',
          10: 'Controles econômicos',
          11: 'Negócios institucionais',
          12: 'Inovação no empreendimento',
          13: 'Adoção de tecnologias referenciais',
          14: 'Práticas sustentáveis no empreendimento',
          15: 'Programa ou ações ambientais comunitárias',
          16: 'Prática de proteção de nascentes e/ou uso racional de recursos hídricos'
        };

        doc.font('Helvetica').fontSize(9).fillColor('#000');
        organizacao.organizacao_indicador.forEach((indicador: any, index: number) => {
          const descricao = indicadoresMap[indicador.valor as keyof typeof indicadoresMap] || `Indicador ${indicador.valor}`;
          doc.text(`${index + 1}. ${descricao}`, 50, doc.y);
          doc.moveDown(0.3);
        });
      }

      // === PARTICIPANTES ===
      if (organizacao.participantes_menos_10 === 1 && organizacao.organizacao_participante && organizacao.organizacao_participante.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('PARTICIPANTES DA ATIVIDADE', 50, doc.y);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(9).fillColor('#000');
        organizacao.organizacao_participante.forEach((participante: any, index: number) => {
          doc.font('Helvetica-Bold')
            .text(`${index + 1}. ${participante.nome}`, 50, doc.y);
          doc.font('Helvetica')
            .text(`   CPF: ${participante.cpf} | Telefone: ${participante.telefone}`, 70, doc.y + 12);

          const relacaoMap = {
            1: 'Diretor',
            2: 'Conselheiro Fiscal',
            3: 'Associado',
            4: 'Colaborador'
          };
          const relacaoTexto = relacaoMap[participante.relacao as keyof typeof relacaoMap] ||
                             (participante.relacao === 99 && participante.relacao_outros ? participante.relacao_outros : 'Outro');

          doc.text(`   Relação: ${relacaoTexto}`, 70, doc.y + 24);
          doc.moveDown(1.5);
        });
      }

      // === OBSERVAÇÕES FINAIS ===
      if (organizacao.obs) {
        if (doc.y > 600) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
          .text('OBSERVAÇÕES FINAIS', 50, doc.y);
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(10).fillColor('#000')
          .text(organizacao.obs, 50, doc.y, {
            width: doc.page.width - 100,
            align: 'justify'
          });
        doc.moveDown(1);
      }

      // === FOTOS (UMA POR PÁGINA) ===
      if (organizacao.organizacao_foto && organizacao.organizacao_foto.length > 0) {
        for (const foto of organizacao.organizacao_foto) {
          if (!foto.foto) continue;

          // Nova página para cada foto
          doc.addPage();

          const fotoPath = path.join(UPLOAD_DIR, foto.foto);

          // Verificar se arquivo existe
          if (!fs.existsSync(fotoPath)) {
            doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
              .text('FOTO NÃO ENCONTRADA', 50, 50);
            doc.moveDown(0.5);
            
            doc.strokeColor('#056839')
              .lineWidth(1)
              .moveTo(50, doc.y)
              .lineTo(doc.page.width - 50, doc.y)
              .stroke();
            doc.moveDown(1);

            doc.font('Helvetica').fontSize(9).fillColor('#666')
              .text(`Arquivo: ${foto.foto}`, 50, doc.y);
            if (foto.obs) {
              doc.text(`Descrição: ${foto.obs}`, 50, doc.y + 12);
            }
            continue;
          }

          // Cabeçalho da página de foto
          doc.font('Helvetica-Bold').fontSize(12).fillColor('#056839')
            .text('FOTO DA ORGANIZAÇÃO', 50, 50);
          doc.moveDown(0.5);
          
          doc.strokeColor('#056839')
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke();
          doc.moveDown(1);

          // Título/Descrição da foto
          doc.font('Helvetica-Bold').fontSize(11).fillColor('#3b2313')
            .text(foto.obs || 'Sem descrição', 50, doc.y);
          doc.moveDown(0.5);

          // Informações
          doc.font('Helvetica').fontSize(9).fillColor('#666')
            .text(`Arquivo: ${foto.foto}`, 50, doc.y);
          doc.text(`Data: ${new Date(foto.creation_date).toLocaleDateString('pt-BR')} às ${new Date(foto.creation_date).toLocaleTimeString('pt-BR')}`, 50, doc.y + 12);
          doc.moveDown(2);

          // Inserir imagem (centralizada e maximizada)
          try {
            const maxWidth = doc.page.width - 100;
            const maxHeight = 550; // Altura maior para aproveitar a página

            doc.image(fotoPath, 50, doc.y, {
              fit: [maxWidth, maxHeight],
              align: 'center'
            });

          } catch (error) {
            doc.fillColor('#666')
              .fontSize(10)
              .text('Erro ao carregar imagem', 50, doc.y, { align: 'center' });
            doc.text(`Detalhes: ${error}`, 50, doc.y + 20, { align: 'center' });
          }
        }
      }
      
      // Finalizar o documento
      doc.end();
      return stream;

    } catch (error: any) {
      doc.end();
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }
  }
};
