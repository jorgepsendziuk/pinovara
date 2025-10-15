/**
 * Definições completas de todas as 8 áreas gerenciais
 * Total: 187 práticas
 */

export const TODAS_AREAS_GERENCIAIS = [
  // GO - GOVERNANÇA ORGANIZACIONAL (30 práticas)
  {
    nome: 'GOVERNANÇA ORGANIZACIONAL',
    subareas: [
      { nome: 'Estrutura Organizacional', praticas: [
        { n: 1, t: 'O empreendimento possui um organograma geral?', c: 'go_estrutura_1' },
        { n: 2, t: 'Este organograma está de acordo com a realidade do empreendimento?', c: 'go_estrutura_2' },
        { n: 3, t: 'Dispõe de documentos com a descrição das atribuições, funções, responsabilidades?', c: 'go_estrutura_3' },
        { n: 4, t: 'Essas descrições correspondem à realidade da vida organizacional?', c: 'go_estrutura_4' }
      ]},
      { nome: 'Estratégia Organizacional', praticas: [
        { n: 5, t: 'Possui um Planejamento Estratégico, com missão, visão, valores e objetivos?', c: 'go_estrategia_5' },
        { n: 6, t: 'Este planejamento é implementado, monitorado e avaliado periodicamente?', c: 'go_estrategia_6' }
      ]},
      { nome: 'Organização dos Associados', praticas: [
        { n: 7, t: 'Aplica as normas estatutárias para admissão e exclusão dos associados?', c: 'go_organizacao_7' },
        { n: 8, t: 'Na visão da diretoria, os associados confiam na diretoria?', c: 'go_organizacao_8' },
        { n: 9, t: 'A diretoria confia no quadro de associados?', c: 'go_organizacao_9' },
        { n: 10, t: 'O empreendimento possui uma estratégia para lidar com os conflitos?', c: 'go_organizacao_10' },
        { n: 11, t: 'Os associados se organizam para discutir os problemas?', c: 'go_organizacao_11' },
        { n: 12, t: 'Se utiliza de práticas formalizadas de integração de novos associados?', c: 'go_organizacao_12' },
        { n: 13, t: 'Possui livro de matrícula dos associados atualizado?', c: 'go_organizacao_13' }
      ]},
      { nome: 'Direção e Participação', praticas: [
        { n: 14, t: 'Remunera financeiramente os dirigentes?', c: 'go_direcao_14' },
        { n: 15, t: 'A direção mantém periodicidade em suas reuniões?', c: 'go_direcao_15' },
        { n: 16, t: 'Dispõe de outros espaços de participação além das assembleias?', c: 'go_direcao_16' },
        { n: 17, t: 'Dispõe de estratégias para fortalecimento da participação das mulheres?', c: 'go_direcao_17' },
        { n: 18, t: 'Dispõe de estratégias para fortalecimento de jovens e idosos?', c: 'go_direcao_18' },
        { n: 19, t: 'Possui instrumentos formais de estímulo da participação?', c: 'go_direcao_19' },
        { n: 20, t: 'Existem comitês consultivos ou setoriais?', c: 'go_direcao_20' },
        { n: 21, t: 'Existem mecanismos para mediar e resolver disputas?', c: 'go_direcao_21' }
      ]},
      { nome: 'Controles Internos e Avaliação', praticas: [
        { n: 22, t: 'O conselho fiscal é atuante no empreendimento?', c: 'go_controle_20' },
        { n: 23, t: 'A direção se reúne periodicamente com o conselho fiscal?', c: 'go_controle_21' },
        { n: 24, t: 'A direção apresenta periodicamente relatórios contábeis/financeiros?', c: 'go_controle_22' },
        { n: 25, t: 'Realiza assembleias anuais para prestação de contas?', c: 'go_controle_23' },
        { n: 26, t: 'Possui mecanismos de controle, monitoramento e avaliação?', c: 'go_controle_24' },
        { n: 27, t: 'Há canais para dúvidas e sugestões sobre relatórios?', c: 'go_controle_25' }
      ]},
      { nome: 'Educação e Formação', praticas: [
        { n: 28, t: 'Os cooperados/associados são capacitados em cooperativismo/associativismo?', c: 'go_educacao_26' },
        { n: 29, t: 'Os cooperados/associados são capacitados em Gestão do Empreendimento?', c: 'go_educacao_27' },
        { n: 30, t: 'Há planos para identificar, capacitar e preparar novos líderes?', c: 'go_educacao_28' }
      ]}
    ]
  },
  // GP - GESTÃO DE PESSOAS (20 práticas)
  {
    nome: 'GESTÃO DE PESSOAS',
    subareas: [
      { nome: 'Organização das Pessoas no Trabalho', praticas: [
        { n: 1, t: 'Possui descrição formalizada de cargos, funções e atividades?', c: 'gp_p_organizacao_1' },
        { n: 2, t: 'As relações de trabalho encontram-se formalizadas?', c: 'gp_p_organizacao_2' },
        { n: 3, t: 'Utiliza critérios padronizados de recrutamento e seleção?', c: 'gp_p_organizacao_3' },
        { n: 4, t: 'Possui critérios claramente definidos para demissão?', c: 'gp_p_organizacao_4' },
        { n: 5, t: 'Dispõe de horários de trabalho estabelecidos e respeitados?', c: 'gp_p_organizacao_5' },
        { n: 6, t: 'Possui controle de horas voluntárias dedicadas?', c: 'gp_p_organizacao_6' },
        { n: 7, t: 'Possui controle sobre ausências ou atrasos?', c: 'gp_p_organizacao_7' },
        { n: 8, t: 'Realiza avaliação de desempenho dos colaboradores?', c: 'gp_p_organizacao_8' },
        { n: 9, t: 'Utiliza práticas de reconhecimento e incentivo com base no desempenho?', c: 'gp_p_organizacao_9' }
      ]},
      { nome: 'Desenvolvimento das Pessoas no Trabalho', praticas: [
        { n: 10, t: 'Possui procedimento de identificação de necessidades de capacitação?', c: 'gp_p_desenvolvimento_10' },
        { n: 11, t: 'Possui um planejamento de capacitação e desenvolvimento?', c: 'gp_p_desenvolvimento_11' },
        { n: 12, t: 'Realiza capacitação relacionada às atividades operacionais?', c: 'gp_p_desenvolvimento_12' },
        { n: 13, t: 'Realiza capacitação relacionada a novas ou futuras atividades?', c: 'gp_p_desenvolvimento_13' }
      ]},
      { nome: 'Qualidade de Vida no Trabalho', praticas: [
        { n: 14, t: 'Possui PCMSO e PPRA?', c: 'gp_trabalho_14' },
        { n: 15, t: 'Monitora acidentes, taxas de frequência/gravidade e absenteísmo?', c: 'gp_trabalho_15' },
        { n: 16, t: 'Realiza pesquisa de satisfação ou de clima organizacional?', c: 'gp_trabalho_16' },
        { n: 17, t: 'Possui método para identificar necessidades dos colaboradores?', c: 'gp_trabalho_17' }
      ]},
      { nome: 'Gênero e Geração', praticas: [
        { n: 18, t: 'Possui estratégia para favorecer participação de mulheres e jovens?', c: 'gp_geracao_18' },
        { n: 19, t: 'Existe equilíbrio no número de homens, mulheres, jovens e idosos?', c: 'gp_geracao_19' },
        { n: 20, t: 'Existe equilíbrio na repartição dos benefícios?', c: 'gp_geracao_20' }
      ]}
    ]
  }
  // Continua...
];

/**
 * Função helper para extrair dados das práticas
 */
export function extrairPraticasComDados(org: any, area: any) {
  return area.subareas.map((sub: any) => ({
    nome: sub.nome,
    praticas: sub.praticas.map((p: any) => ({
      numero: p.n,
      titulo: p.t,
      resposta: org[`${p.c}_resposta`],
      comentario: org[`${p.c}_comentario`],
      proposta: org[`${p.c}_proposta`]
    }))
  }));
}

