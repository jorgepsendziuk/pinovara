import PDFDocument from 'pdfkit';
import { renderizarCabecalhoArea, renderizarSubarea, renderizarTabelaPraticas } from './renderizacaoPDF';

/**
 * Helper para renderizar todas as áreas gerenciais dinamicamente
 * Evita repetição de código
 */

// Interface para estrutura de área
interface SubareaConfig {
  nome: string;
  praticas: Array<{
    numero: number;
    titulo: string;
    prefixoCampo: string; // Ex: 'go_estrutura_1' (sem _resposta/_comentario/_proposta)
  }>;
}

interface AreaConfig {
  nome: string;
  subareas: SubareaConfig[];
}

// Configuração de todas as áreas
const AREAS_GERENCIAIS: AreaConfig[] = [
  // GO - GOVERNANÇA ORGANIZACIONAL
  {
    nome: 'GOVERNANÇA ORGANIZACIONAL',
    subareas: [
      {
        nome: 'Estrutura Organizacional',
        praticas: [
          { numero: 1, titulo: 'O empreendimento possui um organograma geral?', prefixoCampo: 'go_estrutura_1' },
          { numero: 2, titulo: 'Este organograma está de acordo com a realidade do empreendimento?', prefixoCampo: 'go_estrutura_2' },
          { numero: 3, titulo: 'Dispõe de documentos com a descrição das atribuições, funções, responsabilidades?', prefixoCampo: 'go_estrutura_3' },
          { numero: 4, titulo: 'Essas descrições correspondem à realidade da vida organizacional?', prefixoCampo: 'go_estrutura_4' }
        ]
      },
      {
        nome: 'Estratégia Organizacional',
        praticas: [
          { numero: 5, titulo: 'Possui um Planejamento Estratégico, com missão, visão, valores e objetivos?', prefixoCampo: 'go_estrategia_5' },
          { numero: 6, titulo: 'Este planejamento é implementado, monitorado e avaliado periodicamente?', prefixoCampo: 'go_estrategia_6' }
        ]
      },
      {
        nome: 'Organização dos Associados',
        praticas: [
          { numero: 7, titulo: 'Aplica as normas estatutárias para admissão e exclusão dos associados?', prefixoCampo: 'go_organizacao_7' },
          { numero: 8, titulo: 'Na visão da diretoria, os associados confiam na diretoria?', prefixoCampo: 'go_organizacao_8' },
          { numero: 9, titulo: 'A diretoria confia no quadro de associados?', prefixoCampo: 'go_organizacao_9' },
          { numero: 10, titulo: 'O empreendimento possui uma estratégia para lidar com os conflitos?', prefixoCampo: 'go_organizacao_10' },
          { numero: 11, titulo: 'Os associados se organizam para discutir os problemas?', prefixoCampo: 'go_organizacao_11' },
          { numero: 12, titulo: 'Se utiliza de práticas formalizadas de integração de novos associados?', prefixoCampo: 'go_organizacao_12' },
          { numero: 13, titulo: 'Possui livro de matrícula dos associados atualizado?', prefixoCampo: 'go_organizacao_13' }
        ]
      },
      {
        nome: 'Direção e Participação',
        praticas: [
          { numero: 14, titulo: 'Remunera financeiramente os dirigentes?', prefixoCampo: 'go_direcao_14' },
          { numero: 15, titulo: 'A direção mantém periodicidade em suas reuniões?', prefixoCampo: 'go_direcao_15' },
          { numero: 16, titulo: 'Dispõe de outros espaços de participação além das assembleias?', prefixoCampo: 'go_direcao_16' },
          { numero: 17, titulo: 'Dispõe de estratégias para fortalecimento da participação das mulheres?', prefixoCampo: 'go_direcao_17' },
          { numero: 18, titulo: 'Dispõe de estratégias para fortalecimento de jovens e idosos?', prefixoCampo: 'go_direcao_18' },
          { numero: 19, titulo: 'Possui instrumentos formais de estímulo da participação?', prefixoCampo: 'go_direcao_19' },
          { numero: 20, titulo: 'Existem comitês consultivos ou setoriais?', prefixoCampo: 'go_direcao_20' },
          { numero: 21, titulo: 'Existem mecanismos para mediar e resolver disputas?', prefixoCampo: 'go_direcao_21' }
        ]
      },
      {
        nome: 'Controles Internos e Avaliação',
        praticas: [
          { numero: 22, titulo: 'O conselho fiscal é atuante no empreendimento?', prefixoCampo: 'go_controle_20' },
          { numero: 23, titulo: 'A direção se reúne periodicamente com o conselho fiscal?', prefixoCampo: 'go_controle_21' },
          { numero: 24, titulo: 'A direção apresenta periodicamente relatórios contábeis/financeiros?', prefixoCampo: 'go_controle_22' },
          { numero: 25, titulo: 'Realiza assembleias anuais para prestação de contas?', prefixoCampo: 'go_controle_23' },
          { numero: 26, titulo: 'Possui mecanismos de controle, monitoramento e avaliação?', prefixoCampo: 'go_controle_24' },
          { numero: 27, titulo: 'Há canais para dúvidas e sugestões sobre relatórios?', prefixoCampo: 'go_controle_25' }
        ]
      },
      {
        nome: 'Educação e Formação',
        praticas: [
          { numero: 28, titulo: 'Os cooperados/associados são capacitados em cooperativismo/associativismo?', prefixoCampo: 'go_educacao_26' },
          { numero: 29, titulo: 'Os cooperados/associados são capacitados em Gestão do Empreendimento?', prefixoCampo: 'go_educacao_27' },
          { numero: 30, titulo: 'Há planos para identificar, capacitar e preparar novos líderes?', prefixoCampo: 'go_educacao_28' }
        ]
      }
    ]
  },
  // GP - GESTÃO DE PESSOAS
  {
    nome: 'GESTÃO DE PESSOAS',
    subareas: [
      {
        nome: 'Organização das Pessoas no Trabalho',
        praticas: [
          { numero: 1, titulo: 'Possui descrição formalizada de cargos, funções e atividades?', prefixoCampo: 'gp_p_organizacao_1' },
          { numero: 2, titulo: 'As relações de trabalho encontram-se formalizadas?', prefixoCampo: 'gp_p_organizacao_2' },
          { numero: 3, titulo: 'Utiliza critérios padronizados de recrutamento e seleção?', prefixoCampo: 'gp_p_organizacao_3' },
          { numero: 4, titulo: 'Possui critérios claramente definidos para demissão?', prefixoCampo: 'gp_p_organizacao_4' },
          { numero: 5, titulo: 'Dispõe de horários de trabalho estabelecidos e respeitados?', prefixoCampo: 'gp_p_organizacao_5' },
          { numero: 6, titulo: 'Possui controle de horas voluntárias dedicadas?', prefixoCampo: 'gp_p_organizacao_6' },
          { numero: 7, titulo: 'Possui controle sobre ausências ou atrasos?', prefixoCampo: 'gp_p_organizacao_7' },
          { numero: 8, titulo: 'Realiza avaliação de desempenho dos colaboradores?', prefixoCampo: 'gp_p_organizacao_8' },
          { numero: 9, titulo: 'Utiliza práticas de reconhecimento e incentivo com base no desempenho?', prefixoCampo: 'gp_p_organizacao_9' }
        ]
      },
      {
        nome: 'Desenvolvimento das Pessoas no Trabalho',
        praticas: [
          { numero: 10, titulo: 'Possui procedimento de identificação de necessidades de capacitação?', prefixoCampo: 'gp_p_desenvolvimento_10' },
          { numero: 11, titulo: 'Possui um planejamento de capacitação e desenvolvimento?', prefixoCampo: 'gp_p_desenvolvimento_11' },
          { numero: 12, titulo: 'Realiza capacitação relacionada às atividades operacionais?', prefixoCampo: 'gp_p_desenvolvimento_12' },
          { numero: 13, titulo: 'Realiza capacitação relacionada a novas ou futuras atividades?', prefixoCampo: 'gp_p_desenvolvimento_13' }
        ]
      },
      {
        nome: 'Qualidade de Vida no Trabalho',
        praticas: [
          { numero: 14, titulo: 'Possui PCMSO e PPRA?', prefixoCampo: 'gp_trabalho_14' },
          { numero: 15, titulo: 'Monitora acidentes, taxas de frequência/gravidade e absenteísmo?', prefixoCampo: 'gp_trabalho_15' },
          { numero: 16, titulo: 'Realiza pesquisa de satisfação ou de clima organizacional?', prefixoCampo: 'gp_trabalho_16' },
          { numero: 17, titulo: 'Possui método para identificar necessidades dos colaboradores?', prefixoCampo: 'gp_trabalho_17' }
        ]
      },
      {
        nome: 'Gênero e Geração',
        praticas: [
          { numero: 18, titulo: 'Possui estratégia para favorecer participação de mulheres e jovens?', prefixoCampo: 'gp_geracao_18' },
          { numero: 19, titulo: 'Existe equilíbrio no número de homens, mulheres, jovens e idosos?', prefixoCampo: 'gp_geracao_19' },
          { numero: 20, titulo: 'Existe equilíbrio na repartição dos benefícios?', prefixoCampo: 'gp_geracao_20' }
        ]
      }
    ]
  }
  // Continua com as outras áreas...
];

/**
 * Renderiza todas as áreas gerenciais dinamicamente
 */
export function renderizarTodasAreasGerenciais(doc: any, organizacao: any) {
  AREAS_GERENCIAIS.forEach(area => {
    // Cabeçalho da área
    renderizarCabecalhoArea(doc, area.nome);
    
    // Renderizar cada subárea
    area.subareas.forEach(subarea => {
      renderizarSubarea(doc, subarea.nome);
      
      // Montar práticas com dados da organização
      const praticasComDados = subarea.praticas.map(p => ({
        numero: p.numero,
        titulo: p.titulo,
        resposta: organizacao[`${p.prefixoCampo}_resposta`] || null,
        comentario: organizacao[`${p.prefixoCampo}_comentario`] || null,
        proposta: organizacao[`${p.prefixoCampo}_proposta`] || null
      }));
      
      renderizarTabelaPraticas(doc, praticasComDados);
    });
  });
}

export { AREAS_GERENCIAIS };

