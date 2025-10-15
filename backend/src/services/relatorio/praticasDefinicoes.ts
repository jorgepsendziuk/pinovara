/**
 * Definições das práticas gerenciais por área
 * Baseado no formulário ODK ORGANIZAÇÃO.xml
 */

export interface Pratica {
  numero: number;
  titulo: string;
  campoResposta: string;
  campoComentario: string;
  campoProposta: string;
}

export interface Subarea {
  nome: string;
  praticas: Pratica[];
}

export interface AreaGerencial {
  nome: string;
  subareas: Subarea[];
}

// === GOVERNANÇA ORGANIZACIONAL ===
export const GOVERNANCA_ORGANIZACIONAL: AreaGerencial = {
  nome: 'GOVERNANÇA ORGANIZACIONAL',
  subareas: [
    {
      nome: 'Estrutura Organizacional',
      praticas: [
        { numero: 1, titulo: 'O empreendimento possui um organograma geral?', campoResposta: 'go_estrutura_1_resposta', campoComentario: 'go_estrutura_1_comentario', campoProposta: 'go_estrutura_1_proposta' },
        { numero: 2, titulo: 'Este organograma está de acordo com a realidade do empreendimento?', campoResposta: 'go_estrutura_2_resposta', campoComentario: 'go_estrutura_2_comentario', campoProposta: 'go_estrutura_2_proposta' },
        { numero: 3, titulo: 'Dispõe de documentos com a descrição das atribuições, funções, responsabilidades?', campoResposta: 'go_estrutura_3_resposta', campoComentario: 'go_estrutura_3_comentario', campoProposta: 'go_estrutura_3_proposta' },
        { numero: 4, titulo: 'Essas descrições correspondem à realidade da vida organizacional?', campoResposta: 'go_estrutura_4_resposta', campoComentario: 'go_estrutura_4_comentario', campoProposta: 'go_estrutura_4_proposta' }
      ]
    },
    {
      nome: 'Estratégia Organizacional',
      praticas: [
        { numero: 5, titulo: 'Possui um Planejamento Estratégico, com missão, visão, valores e objetivos?', campoResposta: 'go_estrategia_5_resposta', campoComentario: 'go_estrategia_5_comentario', campoProposta: 'go_estrategia_5_proposta' },
        { numero: 6, titulo: 'Este planejamento é implementado, monitorado e avaliado periodicamente?', campoResposta: 'go_estrategia_6_resposta', campoComentario: 'go_estrategia_6_comentario', campoProposta: 'go_estrategia_6_proposta' }
      ]
    },
    {
      nome: 'Organização dos Associados',
      praticas: [
        { numero: 7, titulo: 'Aplica as normas estatutárias para admissão e exclusão dos associados?', campoResposta: 'go_organizacao_7_resposta', campoComentario: 'go_organizacao_7_comentario', campoProposta: 'go_organizacao_7_proposta' },
        { numero: 8, titulo: 'Na visão da diretoria, os associados confiam na diretoria?', campoResposta: 'go_organizacao_8_resposta', campoComentario: 'go_organizacao_8_comentario', campoProposta: 'go_organizacao_8_proposta' },
        { numero: 9, titulo: 'A diretoria confia no quadro de associados?', campoResposta: 'go_organizacao_9_resposta', campoComentario: 'go_organizacao_9_comentario', campoProposta: 'go_organizacao_9_proposta' },
        { numero: 10, titulo: 'O empreendimento possui uma estratégia para lidar com os conflitos?', campoResposta: 'go_organizacao_10_resposta', campoComentario: 'go_organizacao_10_comentario', campoProposta: 'go_organizacao_10_proposta' },
        { numero: 11, titulo: 'Os associados se organizam para discutir os problemas?', campoResposta: 'go_organizacao_11_resposta', campoComentario: 'go_organizacao_11_comentario', campoProposta: 'go_organizacao_11_proposta' },
        { numero: 12, titulo: 'Se utiliza de práticas formalizadas de integração de novos associados?', campoResposta: 'go_organizacao_12_resposta', campoComentario: 'go_organizacao_12_comentario', campoProposta: 'go_organizacao_12_proposta' },
        { numero: 13, titulo: 'Possui livro de matrícula dos associados atualizado?', campoResposta: 'go_organizacao_13_resposta', campoComentario: 'go_organizacao_13_comentario', campoProposta: 'go_organizacao_13_proposta' }
      ]
    },
    {
      nome: 'Direção e Participação',
      praticas: [
        { numero: 14, titulo: 'Remunera financeiramente os dirigentes?', campoResposta: 'go_direcao_14_resposta', campoComentario: 'go_direcao_14_comentario', campoProposta: 'go_direcao_14_proposta' },
        { numero: 15, titulo: 'A direção mantém periodicidade em suas reuniões?', campoResposta: 'go_direcao_15_resposta', campoComentario: 'go_direcao_15_comentario', campoProposta: 'go_direcao_15_proposta' },
        { numero: 16, titulo: 'Dispõe de outros espaços de participação além das assembleias?', campoResposta: 'go_direcao_16_resposta', campoComentario: 'go_direcao_16_comentario', campoProposta: 'go_direcao_16_proposta' },
        { numero: 17, titulo: 'Dispõe de estratégias para fortalecimento da participação das mulheres?', campoResposta: 'go_direcao_17_resposta', campoComentario: 'go_direcao_17_comentario', campoProposta: 'go_direcao_17_proposta' },
        { numero: 18, titulo: 'Dispõe de estratégias para fortalecimento de jovens e idosos?', campoResposta: 'go_direcao_18_resposta', campoComentario: 'go_direcao_18_comentario', campoProposta: 'go_direcao_18_proposta' },
        { numero: 19, titulo: 'Possui instrumentos formais de estímulo da participação?', campoResposta: 'go_direcao_19_resposta', campoComentario: 'go_direcao_19_comentario', campoProposta: 'go_direcao_19_proposta' },
        { numero: 20, titulo: 'Existem comitês consultivos ou setoriais?', campoResposta: 'go_direcao_20_resposta', campoComentario: 'go_direcao_20_comentario', campoProposta: 'go_direcao_20_proposta' },
        { numero: 21, titulo: 'Existem mecanismos para mediar e resolver disputas?', campoResposta: 'go_direcao_21_resposta', campoComentario: 'go_direcao_21_comentario', campoProposta: 'go_direcao_21_proposta' }
      ]
    },
    {
      nome: 'Controles Internos e Avaliação',
      praticas: [
        { numero: 22, titulo: 'O conselho fiscal é atuante no empreendimento?', campoResposta: 'go_controle_20_resposta', campoComentario: 'go_controle_20_comentario', campoProposta: 'go_controle_20_proposta' },
        { numero: 23, titulo: 'A direção se reúne periodicamente com o conselho fiscal?', campoResposta: 'go_controle_21_resposta', campoComentario: 'go_controle_21_comentario', campoProposta: 'go_controle_21_proposta' },
        { numero: 24, titulo: 'A direção apresenta periodicamente relatórios contábeis/financeiros?', campoResposta: 'go_controle_22_resposta', campoComentario: 'go_controle_22_comentario', campoProposta: 'go_controle_22_proposta' },
        { numero: 25, titulo: 'Realiza assembleias anuais para prestação de contas?', campoResposta: 'go_controle_23_resposta', campoComentario: 'go_controle_23_comentario', campoProposta: 'go_controle_23_proposta' },
        { numero: 26, titulo: 'Possui mecanismos de controle, monitoramento e avaliação?', campoResposta: 'go_controle_24_resposta', campoComentario: 'go_controle_24_comentario', campoProposta: 'go_controle_24_proposta' },
        { numero: 27, titulo: 'Há canais para dúvidas e sugestões sobre relatórios?', campoResposta: 'go_controle_25_resposta', campoComentario: 'go_controle_25_comentario', campoProposta: 'go_controle_25_proposta' }
      ]
    },
    {
      nome: 'Educação e Formação',
      praticas: [
        { numero: 28, titulo: 'Os cooperados/associados são capacitados em cooperativismo/associativismo?', campoResposta: 'go_educacao_26_resposta', campoComentario: 'go_educacao_26_comentario', campoProposta: 'go_educacao_26_proposta' },
        { numero: 29, titulo: 'Os cooperados/associados são capacitados em Gestão do Empreendimento?', campoResposta: 'go_educacao_27_resposta', campoComentario: 'go_educacao_27_comentario', campoProposta: 'go_educacao_27_proposta' },
        { numero: 30, titulo: 'Há planos para identificar, capacitar e preparar novos líderes?', campoResposta: 'go_educacao_28_resposta', campoComentario: 'go_educacao_28_comentario', campoProposta: 'go_educacao_28_proposta' }
      ]
    }
  ]
};

// === GESTÃO DE PESSOAS ===
export const GESTAO_PESSOAS: AreaGerencial = {
  nome: 'GESTÃO DE PESSOAS',
  subareas: [
    {
      nome: 'Organização das Pessoas no Trabalho',
      praticas: [
        { numero: 1, titulo: 'Possui descrição formalizada de cargos, funções e atividades?', campoResposta: 'gp_p_organizacao_1_resposta', campoComentario: 'gp_p_organizacao_1_comentario', campoProposta: 'gp_p_organizacao_1_proposta' },
        { numero: 2, titulo: 'As relações de trabalho encontram-se formalizadas?', campoResposta: 'gp_p_organizacao_2_resposta', campoComentario: 'gp_p_organizacao_2_comentario', campoProposta: 'gp_p_organizacao_2_proposta' },
        { numero: 3, titulo: 'Utiliza critérios padronizados de recrutamento e seleção?', campoResposta: 'gp_p_organizacao_3_resposta', campoComentario: 'gp_p_organizacao_3_comentario', campoProposta: 'gp_p_organizacao_3_proposta' },
        { numero: 4, titulo: 'Possui critérios claramente definidos para demissão?', campoResposta: 'gp_p_organizacao_4_resposta', campoComentario: 'gp_p_organizacao_4_comentario', campoProposta: 'gp_p_organizacao_4_proposta' },
        { numero: 5, titulo: 'Dispõe de horários de trabalho estabelecidos e respeitados?', campoResposta: 'gp_p_organizacao_5_resposta', campoComentario: 'gp_p_organizacao_5_comentario', campoProposta: 'gp_p_organizacao_5_proposta' },
        { numero: 6, titulo: 'Possui controle de horas voluntárias dedicadas?', campoResposta: 'gp_p_organizacao_6_resposta', campoComentario: 'gp_p_organizacao_6_comentario', campoProposta: 'gp_p_organizacao_6_proposta' },
        { numero: 7, titulo: 'Possui controle sobre ausências ou atrasos?', campoResposta: 'gp_p_organizacao_7_resposta', campoComentario: 'gp_p_organizacao_7_comentario', campoProposta: 'gp_p_organizacao_7_proposta' },
        { numero: 8, titulo: 'Realiza avaliação de desempenho dos colaboradores?', campoResposta: 'gp_p_organizacao_8_resposta', campoComentario: 'gp_p_organizacao_8_comentario', campoProposta: 'gp_p_organizacao_8_proposta' },
        { numero: 9, titulo: 'Utiliza práticas de reconhecimento e incentivo com base no desempenho?', campoResposta: 'gp_p_organizacao_9_resposta', campoComentario: 'gp_p_organizacao_9_comentario', campoProposta: 'gp_p_organizacao_9_proposta' }
      ]
    },
    {
      nome: 'Desenvolvimento das Pessoas no Trabalho',
      praticas: [
        { numero: 10, titulo: 'Possui procedimento de identificação de necessidades de capacitação?', campoResposta: 'gp_p_desenvolvimento_10_resposta', campoComentario: 'gp_p_desenvolvimento_10_comentario', campoProposta: 'gp_p_desenvolvimento_10_proposta' },
        { numero: 11, titulo: 'Possui um planejamento de capacitação e desenvolvimento?', campoResposta: 'gp_p_desenvolvimento_11_resposta', campoComentario: 'gp_p_desenvolvimento_11_comentario', campoProposta: 'gp_p_desenvolvimento_11_proposta' },
        { numero: 12, titulo: 'Realiza capacitação relacionada às atividades operacionais?', campoResposta: 'gp_p_desenvolvimento_12_resposta', campoComentario: 'gp_p_desenvolvimento_12_comentario', campoProposta: 'gp_p_desenvolvimento_12_proposta' },
        { numero: 13, titulo: 'Realiza capacitação relacionada a novas ou futuras atividades?', campoResposta: 'gp_p_desenvolvimento_13_resposta', campoComentario: 'gp_p_desenvolvimento_13_comentario', campoProposta: 'gp_p_desenvolvimento_13_proposta' }
      ]
    },
    {
      nome: 'Qualidade de Vida no Trabalho',
      praticas: [
        { numero: 14, titulo: 'Possui PCMSO e PPRA?', campoResposta: 'gp_trabalho_14_resposta', campoComentario: 'gp_trabalho_14_comentario', campoProposta: 'gp_trabalho_14_proposta' },
        { numero: 15, titulo: 'Monitora acidentes, taxas de frequência/gravidade e absenteísmo?', campoResposta: 'gp_trabalho_15_resposta', campoComentario: 'gp_trabalho_15_comentario', campoProposta: 'gp_trabalho_15_proposta' },
        { numero: 16, titulo: 'Realiza pesquisa de satisfação ou de clima organizacional?', campoResposta: 'gp_trabalho_16_resposta', campoComentario: 'gp_trabalho_16_comentario', campoProposta: 'gp_trabalho_16_proposta' },
        { numero: 17, titulo: 'Possui método para identificar necessidades dos colaboradores?', campoResposta: 'gp_trabalho_17_resposta', campoComentario: 'gp_trabalho_17_comentario', campoProposta: 'gp_trabalho_17_proposta' }
      ]
    },
    {
      nome: 'Gênero e Geração',
      praticas: [
        { numero: 18, titulo: 'Possui estratégia para favorecer participação de mulheres e jovens?', campoResposta: 'gp_geracao_18_resposta', campoComentario: 'gp_geracao_18_comentario', campoProposta: 'gp_geracao_18_proposta' },
        { numero: 19, titulo: 'Existe equilíbrio no número de homens, mulheres, jovens e idosos?', campoResposta: 'gp_geracao_19_resposta', campoComentario: 'gp_geracao_19_comentario', campoProposta: 'gp_geracao_19_proposta' },
        { numero: 20, titulo: 'Existe equilíbrio na repartição dos benefícios?', campoResposta: 'gp_geracao_20_resposta', campoComentario: 'gp_geracao_20_comentario', campoProposta: 'gp_geracao_20_proposta' }
      ]
    }
  ]
};

// Continua nos próximos arquivos para não ficar muito grande...

