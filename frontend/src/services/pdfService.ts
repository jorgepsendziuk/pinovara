import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface OrganizacaoData {
  nome: string;
  cnpj: string;
  endereco: string;
  representanteNome: string;
  representanteCPF: string;
  representanteRG: string;
  representanteFuncao: string;
  representanteEndereco: string;
}

export class PDFService {
  static async gerarTermoAdesao(organizacao: OrganizacaoData): Promise<void> {
    // Criar um elemento HTML temporário para renderizar o termo
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.getTermoAdesaoHTML(organizacao);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.minHeight = '297mm'; // A4 height
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.padding = '20mm';
    tempDiv.style.boxSizing = 'border-box';

    document.body.appendChild(tempDiv);

    try {
      // Aguardar um pouco para garantir que o conteúdo seja renderizado
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`termo-adesao-${organizacao.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);

    } finally {
      // Remover o elemento temporário
      document.body.removeChild(tempDiv);
    }
  }

  private static getTermoAdesaoHTML(organizacao: OrganizacaoData): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <!-- Cabeçalho -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #006400; padding-bottom: 20px;">
          <!-- Logo -->
          <div style="margin-bottom: 15px;">
            <img src="/pinovara.png" alt="PINOVARA" style="width: 80px; height: auto; max-height: 80px; object-fit: contain;" />
          </div>
          <div style="font-size: 28px; font-weight: bold; color: #006400; margin-bottom: 10px;">
            PINOVARA
          </div>
          <div style="font-size: 16px; color: #666; margin-top: 5px;">
            Projeto Inovador em Gestão do PNRA - TED nº 50/2023
          </div>
          <div style="font-size: 14px; color: #666; margin-top: 5px;">
            Universidade Federal da Bahia (UFBA) - Instituto Nacional de Colonização e Reforma Agrária (INCRA)
          </div>
        </div>

        <!-- Título do Termo -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 20px; font-weight: bold; color: #006400; margin: 0;">
            TERMO DE ADESÃO
          </h1>
        </div>

        <!-- Texto do Termo -->
        <div style="text-align: justify; margin-bottom: 40px;">
          <p style="margin-bottom: 20px;">
            A pessoa jurídica <strong>${organizacao.nome}</strong>, CNPJ: <strong>${organizacao.cnpj}</strong>, endereço: <strong>${organizacao.endereco}</strong>, neste ato representada por: <strong>${organizacao.representanteNome}</strong>, portador(a) de Carteira de Identidade nº: <strong>${organizacao.representanteRG}</strong>, e do CPF nº: <strong>${organizacao.representanteCPF}</strong>, residente e domiciliado(a): <strong>${organizacao.representanteEndereco}</strong>, Função: <strong>${organizacao.representanteFuncao}</strong> na qualidade de Empreendimento Coletivo, firma o presente Termo de Adesão, para fins de comprovação junto ao Instituto Nacional de Colonização e Reforma Agrária (INCRA) em parceria com a Universidade Federal da Bahia (UFBA) no âmbito do TED nº 50/2023.
          </p>

          <p>
            Declara haver tomado prévio conhecimento em sua integridade sobre o PINOVARA, pelo que expressa plena concordância com as suas condições, princípios e orientações, comprometendo-se ainda a atender aos apontamentos técnicos e exigências legais realizadas pelas atividades que serão implementadas.
          </p>
        </div>

        <!-- Assinatura -->
        <div style="margin-top: 80px;">
          <div style="border-top: 1px solid #333; width: 70%; margin: 0 auto; padding-top: 20px; ">
            <div style="margin-bottom: 30px;">
              <p style="margin: 0 0 10px 0; font-size: 14px;">
                Local e Data: ____________________________
              </p>
              <p style="margin: 0; font-size: 14px;">
                Hora: _______________
              </p>
            </div>
            <div style="margin-top: 40px;" text-align: center;>
              <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                Representante Legal do Empreendimento
              </p>
              <p style="margin: 20px 0 5px 0; font-size: 14px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                ${organizacao.representanteNome || '_______________________________'}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                Assinatura
              </p>
            </div>
          </div>
        </div>

        <!-- Rodapé -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">
            Documento gerado automaticamente pelo Sistema PINOVARA em ${new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    `;
  }
}
