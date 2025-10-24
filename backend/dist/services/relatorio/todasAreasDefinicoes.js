"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TODAS_AREAS_GERENCIAIS = void 0;
exports.extrairPraticasComDados = extrairPraticasComDados;
exports.TODAS_AREAS_GERENCIAIS = [
    {
        nome: 'GOVERNANÇA ORGANIZACIONAL',
        subareas: [
            { nome: 'Estrutura Organizacional', praticas: [
                    { n: 1, t: 'O empreendimento possui um organograma geral?', c: 'go_estrutura_1' },
                    { n: 2, t: 'Este organograma está de acordo com a realidade do empreendimento?', c: 'go_estrutura_2' },
                    { n: 3, t: 'Dispõe de documentos com a descrição das atribuições, funções, responsabilidades?', c: 'go_estrutura_3' },
                    { n: 4, t: 'Essas descrições correspondem à realidade da vida organizacional?', c: 'go_estrutura_4' }
                ] },
            { nome: 'Estratégia Organizacional', praticas: [
                    { n: 5, t: 'Possui um Planejamento Estratégico, com missão, visão, valores e objetivos?', c: 'go_estrategia_5' },
                    { n: 6, t: 'Este planejamento é implementado, monitorado e avaliado periodicamente?', c: 'go_estrategia_6' }
                ] },
            { nome: 'Organização dos Associados', praticas: [
                    { n: 7, t: 'Aplica as normas estatutárias para admissão e exclusão dos associados?', c: 'go_organizacao_7' },
                    { n: 8, t: 'Na visão da diretoria, os associados confiam na diretoria?', c: 'go_organizacao_8' },
                    { n: 9, t: 'A diretoria confia no quadro de associados?', c: 'go_organizacao_9' },
                    { n: 10, t: 'O empreendimento possui uma estratégia para lidar com os conflitos?', c: 'go_organizacao_10' },
                    { n: 11, t: 'Os associados se organizam para discutir os problemas?', c: 'go_organizacao_11' },
                    { n: 12, t: 'Se utiliza de práticas formalizadas de integração de novos associados?', c: 'go_organizacao_12' },
                    { n: 13, t: 'Possui livro de matrícula dos associados atualizado?', c: 'go_organizacao_13' }
                ] },
            { nome: 'Direção e Participação', praticas: [
                    { n: 14, t: 'Remunera financeiramente os dirigentes?', c: 'go_direcao_14' },
                    { n: 15, t: 'A direção mantém periodicidade em suas reuniões?', c: 'go_direcao_15' },
                    { n: 16, t: 'Dispõe de outros espaços de participação além das assembleias?', c: 'go_direcao_16' },
                    { n: 17, t: 'Dispõe de estratégias para fortalecimento da participação das mulheres?', c: 'go_direcao_17' },
                    { n: 18, t: 'Dispõe de estratégias para fortalecimento de jovens e idosos?', c: 'go_direcao_18' },
                    { n: 19, t: 'Possui instrumentos formais de estímulo da participação?', c: 'go_direcao_19' },
                    { n: 20, t: 'Existem comitês consultivos ou setoriais?', c: 'go_direcao_20' },
                    { n: 21, t: 'Existem mecanismos para mediar e resolver disputas?', c: 'go_direcao_21' }
                ] },
            { nome: 'Controles Internos e Avaliação', praticas: [
                    { n: 22, t: 'O conselho fiscal é atuante no empreendimento?', c: 'go_controle_22' },
                    { n: 23, t: 'A direção se reúne periodicamente com o conselho fiscal?', c: 'go_controle_23' },
                    { n: 24, t: 'A direção tem o hábito de apresentar periodicamente relatórios contábeis, financeiros e administrativos?', c: 'go_controle_24' },
                    { n: 25, t: 'Realiza assembleias anuais para prestação de contas?', c: 'go_controle_25' },
                    { n: 26, t: 'Possui mecanismos de controle, monitoramento e avaliação do alcance de objetivos e metas?', c: 'go_controle_26' },
                    { n: 27, t: 'Há canais para dúvidas e sugestões em relação aos relatórios e informações compartilhados?', c: 'go_controle_27' }
                ] },
            { nome: 'Educação e Formação', praticas: [
                    { n: 28, t: 'Os cooperados/associados são capacitados em cooperativismo/associativismo?', c: 'go_educacao_28' },
                    { n: 29, t: 'Os cooperados/associados são capacitados em Gestão do Empreendimento?', c: 'go_educacao_29' },
                    { n: 30, t: 'Há planos para identificar, capacitar e preparar novos líderes?', c: 'go_educacao_30' }
                ] }
        ]
    },
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
                ] },
            { nome: 'Desenvolvimento das Pessoas no Trabalho', praticas: [
                    { n: 10, t: 'Possui procedimento de identificação de necessidades de capacitação?', c: 'gp_p_desenvolvimento_10' },
                    { n: 11, t: 'Possui um planejamento de capacitação e desenvolvimento?', c: 'gp_p_desenvolvimento_11' },
                    { n: 12, t: 'Realiza capacitação relacionada às atividades operacionais?', c: 'gp_p_desenvolvimento_12' },
                    { n: 13, t: 'Realiza capacitação relacionada a novas ou futuras atividades?', c: 'gp_p_desenvolvimento_13' }
                ] },
            { nome: 'Qualidade de Vida no Trabalho', praticas: [
                    { n: 14, t: 'Possui PCMSO e PPRA?', c: 'gp_trabalho_14' },
                    { n: 15, t: 'Monitora acidentes, taxas de frequência/gravidade e absenteísmo?', c: 'gp_trabalho_15' },
                    { n: 16, t: 'Realiza pesquisa de satisfação ou de clima organizacional?', c: 'gp_trabalho_16' },
                    { n: 17, t: 'Possui método para identificar necessidades dos colaboradores?', c: 'gp_trabalho_17' }
                ] },
            { nome: 'Gênero e Geração', praticas: [
                    { n: 18, t: 'Possui estratégia para favorecer participação de mulheres e jovens?', c: 'gp_geracao_18' },
                    { n: 19, t: 'Existe equilíbrio no número de homens, mulheres, jovens e idosos?', c: 'gp_geracao_19' },
                    { n: 20, t: 'Existe equilíbrio na repartição dos benefícios?', c: 'gp_geracao_20' }
                ] }
        ]
    },
    {
        nome: 'GESTÃO FINANCEIRA',
        subareas: [
            { nome: 'Balanço Patrimonial', praticas: [
                    { n: 1, t: 'Possui contabilidade realizada por um contador?', c: 'gf_balanco_1' },
                    { n: 2, t: 'Possui Balanço Patrimonial atualizado?', c: 'gf_balanco_2' },
                    { n: 3, t: 'Realiza Análise de Balanço?', c: 'gf_balanco_3' },
                    { n: 4, t: 'Utiliza Balancetes Mensais para orientação financeira?', c: 'gf_balanco_4' }
                ] },
            { nome: 'Controle de Contas a Receber e a Pagar', praticas: [
                    { n: 5, t: 'Possui sistema/programa informatizado para gestão?', c: 'gf_contas_5' },
                    { n: 6, t: 'Possui algum tipo de Plano Orçamentário?', c: 'gf_contas_6' },
                    { n: 7, t: 'Possui metas financeiras?', c: 'gf_contas_7' },
                    { n: 8, t: 'Possui controle e registro dos valores a receber?', c: 'gf_contas_8' },
                    { n: 9, t: 'Possui controle de obrigações perante fornecedores?', c: 'gf_contas_9' },
                    { n: 10, t: 'Possui controle de obrigações perante colaboradores?', c: 'gf_contas_10' },
                    { n: 11, t: 'Possui controle de obrigações perante o fisco?', c: 'gf_contas_11' },
                    { n: 12, t: 'Possui controle de obrigações perante associados fornecedores?', c: 'gf_contas_12' },
                    { n: 13, t: 'Possui controle de pagamento de empréstimos e financiamentos?', c: 'gf_contas_13' }
                ] },
            { nome: 'Fluxo de Caixa', praticas: [
                    { n: 14, t: 'Possui controle de caixa (DFC)?', c: 'gf_caixa_14' },
                    { n: 15, t: 'Possui controle do dinheiro e caixa documental?', c: 'gf_caixa_15' },
                    { n: 16, t: 'Possui controle da conta no banco?', c: 'gf_caixa_16' }
                ] },
            { nome: 'Controle de Estoques', praticas: [
                    { n: 17, t: 'Possui controle periódico físico e financeiro dos estoques?', c: 'gf_estoque_17' },
                    { n: 18, t: 'Possui procedimentos de controle de compras?', c: 'gf_estoque_18' },
                    { n: 19, t: 'Possui procedimentos de pesquisa de mercado antes das compras?', c: 'gf_estoque_19' }
                ] },
            { nome: 'Demonstração de Resultados', praticas: [
                    { n: 20, t: 'Possui Demonstração de Resultado?', c: 'gf_resultado_20' },
                    { n: 21, t: 'Utiliza a Demonstração de Resultado para orientação financeira?', c: 'gf_resultado_21' }
                ] },
            { nome: 'Análise de Viabilidade Econômica', praticas: [
                    { n: 22, t: 'Elaborou a Análise de Viabilidade Econômica (AVE)?', c: 'gf_analise_22' },
                    { n: 23, t: 'Vem utilizando as orientações da AVE?', c: 'gf_analise_23' },
                    { n: 24, t: 'A AVE vem sendo atualizada?', c: 'gf_analise_24' }
                ] },
            { nome: 'Obrigações Fiscais Legais', praticas: [
                    { n: 25, t: 'Está cumprindo com todas as obrigações legais e fiscais?', c: 'gf_fiscal_25' },
                    { n: 26, t: 'Atualiza frequentemente a relação de obrigações legais e fiscais?', c: 'gf_fiscal_26' }
                ] }
        ]
    },
    {
        nome: 'GESTÃO COMERCIAL',
        subareas: [
            { nome: 'Estrutura Comercial', praticas: [
                    { n: 1, t: 'Dispõe de um setor comercial?', c: 'gc_e_comercial_1' },
                    { n: 2, t: 'O setor comercial possui informações técnicas dos produtos?', c: 'gc_e_comercial_2' },
                    { n: 3, t: 'Dispõe de profissional/equipe responsável pelas vendas?', c: 'gc_e_comercial_3' },
                    { n: 4, t: 'Este profissional tem orientação/treinamento específico para vendas?', c: 'gc_e_comercial_4' },
                    { n: 5, t: 'O representante comercial tem treinamento sobre os produtos?', c: 'gc_e_comercial_5' },
                    { n: 6, t: 'Possui sistema de controle das vendas?', c: 'gc_e_comercial_6' },
                    { n: 7, t: 'O setor comercial conhece a capacidade de oferta?', c: 'gc_e_comercial_7' },
                    { n: 8, t: 'Possui banco de informações sobre clientes e fornecedores?', c: 'gc_e_comercial_8' },
                    { n: 9, t: 'Emite ou está apto a emitir nota fiscal eletrônica?', c: 'gc_e_comercial_9' }
                ] },
            { nome: 'Mercados Verdes, Sociais e Diferenciados', praticas: [
                    { n: 10, t: 'O negócio possui diferencial em termos de sustentabilidade?', c: 'gc_mercado_10' },
                    { n: 11, t: 'Atua em mercados verdes ou outros mercados específicos?', c: 'gc_mercado_11' },
                    { n: 12, t: 'Possui produtos diferenciados do ponto de vista ambiental?', c: 'gc_mercado_12' },
                    { n: 13, t: 'Possui relação comercial com mercado justo e solidário?', c: 'gc_mercado_13' },
                    { n: 14, t: 'Os preços de produtos diferenciados são favoráveis?', c: 'gc_mercado_14' },
                    { n: 15, t: 'Se atualiza sobre exigências dos mercados verdes?', c: 'gc_mercado_15' }
                ] },
            { nome: 'Estratégia Comercial e Marketing', praticas: [
                    { n: 16, t: 'Adota estratégias comerciais definidas?', c: 'gc_comercial_16' },
                    { n: 17, t: 'Os produtos/empreendimento possuem marca comercial?', c: 'gc_comercial_17' },
                    { n: 18, t: 'Realiza ou utiliza pesquisa/estudo de mercado?', c: 'gc_comercial_18' },
                    { n: 19, t: 'Conhece os concorrentes e acompanha preços?', c: 'gc_comercial_19' },
                    { n: 20, t: 'Possui plano de marketing?', c: 'gc_comercial_20' },
                    { n: 21, t: 'O marketing contribui para estratégias e aumento de vendas?', c: 'gc_comercial_21' }
                ] },
            { nome: 'Sustentabilidade e Modelo do Negócio', praticas: [
                    { n: 22, t: 'Existe regularidade nas vendas, com contratos permanentes?', c: 'gc_modelo_22' },
                    { n: 23, t: 'Possui Modelo de Negócio definido?', c: 'gc_modelo_23' },
                    { n: 24, t: 'Vem utilizando o Modelo de Negócio para inserção no mercado?', c: 'gc_modelo_24' },
                    { n: 25, t: 'A direção tem clareza da proposta de valor?', c: 'gc_modelo_25' },
                    { n: 26, t: 'A direção tem clareza dos canais de distribuição?', c: 'gc_modelo_26' },
                    { n: 27, t: 'A direção tem clareza dos segmentos de clientes?', c: 'gc_modelo_27' },
                    { n: 28, t: 'A direção tem clareza das fontes de receita?', c: 'gc_modelo_28' }
                ] }
        ]
    },
    {
        nome: 'GESTÃO DE PROCESSOS PRODUTIVOS',
        subareas: [
            { nome: 'Regularidade Sanitária', praticas: [
                    { n: 1, t: 'Possui registro sanitário competente?', c: 'gpp_reg_sanitaria_1' },
                    { n: 2, t: 'Os produtos possuem registro?', c: 'gpp_reg_sanitaria_2' },
                    { n: 3, t: 'Os rótulos possuem registro?', c: 'gpp_reg_sanitaria_3' }
                ] },
            { nome: 'Planejamento Produtivo', praticas: [
                    { n: 4, t: 'Realiza planejamento da produção?', c: 'gpp_planejamento_4' },
                    { n: 5, t: 'Possui planilha de custos de produção?', c: 'gpp_planejamento_5' },
                    { n: 6, t: 'Há levantamento de demandas/exigências dos mercados?', c: 'gpp_planejamento_6' }
                ] },
            { nome: 'Logística da Produção e Beneficiamento', praticas: [
                    { n: 7, t: 'Possui local específico para armazenamento de suprimentos?', c: 'gpp_logistica_7' },
                    { n: 8, t: 'Essas instalações têm dimensões e condições adequadas?', c: 'gpp_logistica_8' },
                    { n: 9, t: 'Dispõe de controle para recebimento e estocagem?', c: 'gpp_logistica_9' },
                    { n: 10, t: 'Possui local específico para armazenamento de produtos finais?', c: 'gpp_logistica_10' },
                    { n: 11, t: 'Este local tem dimensões e condições adequadas?', c: 'gpp_logistica_11' },
                    { n: 12, t: 'Possui estrutura adequada para transporte e distribuição?', c: 'gpp_logistica_12' }
                ] },
            { nome: 'Cadeia de Valor', praticas: [
                    { n: 13, t: 'Utiliza o mapeamento da cadeia de valor?', c: 'gpp_valor_13' },
                    { n: 14, t: 'O mapeamento contempla as relações sociais?', c: 'gpp_valor_14' },
                    { n: 15, t: 'Há avaliação de quanto o mapeamento contribui para o desempenho?', c: 'gpp_valor_15' }
                ] },
            { nome: 'Leiaute e Fluxos', praticas: [
                    { n: 16, t: 'Possui um leiaute dos processos produtivos?', c: 'gpp_fluxo_16' },
                    { n: 17, t: 'O leiaute é monitorado para melhorar a produção?', c: 'gpp_fluxo_17' },
                    { n: 18, t: 'O leiaute é monitorado para melhorar o beneficiamento?', c: 'gpp_fluxo_18' },
                    { n: 19, t: 'O leiaute é monitorado para melhorar a rotulagem?', c: 'gpp_fluxo_19' },
                    { n: 20, t: 'O leiaute é monitorado para melhorar a embalagem?', c: 'gpp_fluxo_20' },
                    { n: 21, t: 'Possui fluxos de produção, beneficiamento, rotulagem e embalagem?', c: 'gpp_fluxo_21' },
                    { n: 22, t: 'O fluxo de produção está integrado com o leiaute?', c: 'gpp_fluxo_22' }
                ] },
            { nome: 'Controle de Qualidade, Padronização e Rotulagem', praticas: [
                    { n: 23, t: 'Realiza controle de qualidade dos produtos?', c: 'gpp_qualidade_23' },
                    { n: 24, t: 'Este controle atende aos padrões pré-estabelecidos?', c: 'gpp_qualidade_24' },
                    { n: 25, t: 'Testa os produtos antes da comercialização?', c: 'gpp_qualidade_25' },
                    { n: 26, t: 'Rótulos e etiquetas atendem padrões da legislação?', c: 'gpp_qualidade_26' },
                    { n: 27, t: 'Rótulos são coerentes com estratégia de marketing?', c: 'gpp_qualidade_27' },
                    { n: 28, t: 'Rótulos estão de acordo com mercados a serem atingidos?', c: 'gpp_qualidade_28' }
                ] },
            { nome: 'Bens de Produção', praticas: [
                    { n: 29, t: 'Os bens de produção estão atendendo as necessidades?', c: 'gpp_producao_29' }
                ] }
        ]
    },
    {
        nome: 'GESTÃO DA INOVAÇÃO',
        subareas: [
            { nome: 'Adoção da Inovação, Informações e Conhecimento', praticas: [
                    { n: 1, t: 'O empreendimento adota algum esforço para inovar?', c: 'gi_iic_1' },
                    { n: 2, t: 'As informações são obtidas externamente e compartilhadas?', c: 'gi_iic_2' },
                    { n: 3, t: 'É promovido ambiente favorável ao surgimento de ideias criativas?', c: 'gi_iic_3' },
                    { n: 4, t: 'São analisadas e selecionadas as ideias de inovação?', c: 'gi_iic_4' },
                    { n: 5, t: 'Os dirigentes apoiam a experimentação de novas ideias?', c: 'gi_iic_5' }
                ] },
            { nome: 'Monitoramento, Aprendizagem e Reconhecimento', praticas: [
                    { n: 6, t: 'A implementação da inovação é acompanhada?', c: 'gi_mar_6' },
                    { n: 7, t: 'É promovida a aprendizagem sobre o processo inovativo?', c: 'gi_mar_7' },
                    { n: 8, t: 'São reconhecidos pelas contribuições à inovação?', c: 'gi_mar_8' },
                    { n: 9, t: 'São capacitados para a inovação e Gestão da Inovação?', c: 'gi_mar_9' }
                ] },
            { nome: 'Equipes, Atores Relacionados e Tipos de Inovação', praticas: [
                    { n: 10, t: 'O trabalho em equipe é estimulado para inovação?', c: 'gi_time_10' },
                    { n: 11, t: 'As inovações são divulgadas para as partes interessadas?', c: 'gi_time_11' },
                    { n: 12, t: 'São avaliados os benefícios da implementação da inovação?', c: 'gi_time_12' },
                    { n: 13, t: 'Existe iniciativa voltada para inovação sustentável/verde?', c: 'gi_time_13' },
                    { n: 14, t: 'Existe iniciativa voltada para inovação social ou frugal?', c: 'gi_time_14' }
                ] }
        ]
    },
    {
        nome: 'GESTÃO SOCIOAMBIENTAL',
        subareas: [
            { nome: 'Política Socioambiental', praticas: [
                    { n: 1, t: 'Adota alguma prática voltada às questões ambientais?', c: 'gs_socioambiental_1' },
                    { n: 2, t: 'Faz utilização de materiais sustentáveis?', c: 'gs_socioambiental_2' },
                    { n: 3, t: 'Possui incentivo para mobilidade sustentável?', c: 'gs_socioambiental_3' },
                    { n: 4, t: 'Adota estratégia para garantir sustentabilidade ambiental da produção?', c: 'gs_socioambiental_4' },
                    { n: 5, t: 'Possui estratégia para justa repartição de benefícios da biodiversidade?', c: 'gs_socioambiental_5' }
                ] },
            { nome: 'Valoração Ambiental', praticas: [
                    { n: 6, t: 'Faz valoração dos recursos naturais utilizados?', c: 'gs_ambiental_6' },
                    { n: 7, t: 'Possui integração promovendo bem-estar e biodiversidade?', c: 'gs_ambiental_7' },
                    { n: 8, t: 'Considera reconfiguração de espaços para prolongar vida útil?', c: 'gs_ambiental_8' },
                    { n: 9, t: 'Esta valoração é utilizada nas estratégias?', c: 'gs_ambiental_9' }
                ] },
            { nome: 'Regularidade Ambiental', praticas: [
                    { n: 10, t: 'Possui licença ou autorização ambiental?', c: 'gs_reg_ambiental_10' },
                    { n: 11, t: 'As áreas possuem Plano de Manejo aprovado?', c: 'gs_reg_ambiental_11' },
                    { n: 12, t: 'Há planos de Manejo autorizando extração de espécies?', c: 'gs_reg_ambiental_12' },
                    { n: 13, t: 'Existe área de preservação no entorno que possa ser afetada?', c: 'gs_reg_ambiental_13' },
                    { n: 14, t: 'As áreas possuem CAR?', c: 'gs_reg_ambiental_14' }
                ] },
            { nome: 'Impactos Ambientais', praticas: [
                    { n: 15, t: 'A direção identifica com clareza os impactos negativos?', c: 'gs_impactos_ambiental_15' },
                    { n: 16, t: 'Adota política para minimizar esses impactos?', c: 'gs_impactos_ambiental_16' },
                    { n: 17, t: 'A direção identifica com clareza os impactos positivos?', c: 'gs_impactos_ambiental_17' },
                    { n: 18, t: 'Faz correta destinação dos resíduos e efluentes?', c: 'gs_impactos_ambiental_18' },
                    { n: 19, t: 'Realiza práticas para reduzir, reutilizar e reciclar?', c: 'gs_impactos_ambiental_19' },
                    { n: 20, t: 'Possui plano de redução no consumo de energia?', c: 'gs_impactos_ambiental_20' },
                    { n: 21, t: 'As edificações têm planejamento de ciclo de vida?', c: 'gs_impactos_ambiental_21' },
                    { n: 22, t: 'As instalações físicas estão em área adequada?', c: 'gs_impactos_ambiental_22' }
                ] }
        ]
    },
    {
        nome: 'INFRAESTRUTURA SUSTENTÁVEL',
        subareas: [
            { nome: 'Eficiência Energética', praticas: [
                    { n: 1, t: 'Possui/planeja painéis solares fotovoltaicos?', c: 'is_eficiencia_energetica_1' },
                    { n: 2, t: 'A orientação do edifício foi planejada para aproveitar luz natural?', c: 'is_eficiencia_energetica_2' },
                    { n: 3, t: 'Utiliza/planeja sensores de presença e automação?', c: 'is_eficiencia_energetica_3' },
                    { n: 4, t: 'As fachadas incorporam elementos de sombreamento?', c: 'is_eficiencia_energetica_4' }
                ] },
            { nome: 'Uso de Recursos Naturais', praticas: [
                    { n: 5, t: 'Há aproveitamento de ventilação cruzada natural?', c: 'is_recursos_naturais_5' },
                    { n: 6, t: 'Há valorização dos sombreamentos vegetais?', c: 'is_recursos_naturais_6' },
                    { n: 7, t: 'A topografia é utilizada para conforto térmico?', c: 'is_recursos_naturais_7' },
                    { n: 8, t: 'Há aberturas estratégicas para luz natural?', c: 'is_recursos_naturais_8' }
                ] },
            { nome: 'Consumo de Água', praticas: [
                    { n: 9, t: 'Há sistemas de captação de água da chuva?', c: 'is_agua_9' },
                    { n: 10, t: 'Há reutilização de águas cinzas?', c: 'is_agua_10' }
                ] },
            { nome: 'Conforto Ambiental', praticas: [
                    { n: 11, t: 'Há utilização de materiais com bom isolamento térmico?', c: 'is_conforto_ambiental_11' },
                    { n: 12, t: 'Há utilização de materiais com bom isolamento acústico?', c: 'is_conforto_ambiental_12' },
                    { n: 13, t: 'Há exploração da ventilação cruzada e exaustão natural?', c: 'is_conforto_ambiental_13' },
                    { n: 14, t: 'Há uso de iluminação natural e/ou vidros de controle solar?', c: 'is_conforto_ambiental_14' }
                ] },
            { nome: 'Gestão de Resíduos', praticas: [
                    { n: 15, t: 'Há espaços adequados para separação de resíduos orgânicos?', c: 'is_residuos_15' },
                    { n: 16, t: 'Há espaços adequados para separação de recicláveis?', c: 'is_residuos_16' },
                    { n: 17, t: 'A compostagem é utilizada como adubo orgânico?', c: 'is_residuos_17' },
                    { n: 18, t: 'Há práticas que minimizem geração de resíduos?', c: 'is_residuos_18' }
                ] }
        ]
    }
];
function extrairPraticasComDados(org, area) {
    return area.subareas.map((sub) => ({
        nome: sub.nome,
        praticas: sub.praticas.map((p) => ({
            numero: p.n,
            titulo: p.t,
            resposta: org[`${p.c}_resposta`],
            comentario: org[`${p.c}_comentario`],
            proposta: org[`${p.c}_proposta`]
        }))
    }));
}
//# sourceMappingURL=todasAreasDefinicoes.js.map