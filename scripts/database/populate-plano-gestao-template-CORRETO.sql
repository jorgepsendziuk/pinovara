-- ==========================================
-- POPULATION: Plano de Gestão - Tabela plano_gestao_acao_modelo
-- Data: 2025-11-04
-- Fonte: docs/resources/plano-gestao-empreendimentos.md
-- ==========================================
--
-- Este script popula a tabela plano_gestao_acao_modelo com as 39 ações
-- do Plano de Gestão extraídas do arquivo Markdown oficial.
--
-- IMPORTANTE: Execute este script APENAS APÓS a migration-plano-gestao.sql
-- ==========================================

-- Verificar se a tabela existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'pinovara' 
        AND table_name = 'plano_gestao_acao_modelo'
    ) THEN
        RAISE EXCEPTION 'Tabela plano_gestao_acao_modelo não existe. Execute a migration primeiro.';
    END IF;
END $$;

-- ==========================================
-- 1. PLANO DE GESTÃO E ESTRATÉGIAS
-- ==========================================

-- 1.1 Definição da Proposta de Valor e Propósito do Empreendimento (3 ações)
INSERT INTO pinovara.plano_gestao_acao_modelo (tipo, titulo, grupo, acao, hint_como_sera_feito, hint_responsavel, hint_recursos, ordem, ativo) VALUES
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Definição da Proposta de Valor e Propósito do Empreendimento', 'Identificação do valor cultural', 'Definição de como o empreendimento reflete a sua identidade. Essa atividade deve dialogar com ingredientes e técnicas ancestrais (empreendimentos em territórios Quilombolas), resgate de saberes tradicionais e valorização do território.', 'Gestor do empreendimento', 'Facilitadores', 1, true),
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Definição da Proposta de Valor e Propósito do Empreendimento', 'Análise do diferencial competitivo', 'Levantamento de características particulares e diferenciais do empreendimento. Utilizar a história, a forma de produção ou a conexão direta com a comunidade como diferenciais.', 'Gestor do empreendimento', 'Facilitadores', 2, true),
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Definição da Proposta de Valor e Propósito do Empreendimento', 'Missão e visão', 'Elaboração, de forma simples e direta, a missão (o que o negócio faz e para quem) e a visão (onde o negócio quer chegar a longo prazo).', 'Gestor do empreendimento', 'Facilitadores', 3, true),

-- 1.2 Construção do Plano de Ação (3 ações)
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Construção do Plano de Ação para viabilização da proposta de valor e propósito', 'Definição de objetivos estratégicos', 'Utilizando como referências a missão e visão organizacional, estabelecer objetivos que levem a organização ao cumprimento da missão e atingimento da visão', 'Gestor do empreendimento', 'Facilitadores', 4, true),
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Construção do Plano de Ação para viabilização da proposta de valor e propósito', 'Estabelecimento de metas para os objetivos estabelecidos', 'Realização de oficinas específicas para associar métricas às metas estabelecidas', 'Gestor do empreendimento', 'Facilitadores', 5, true),
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Construção do Plano de Ação para viabilização da proposta de valor e propósito', 'Desdobramento das metas em ações e tarefas', 'Realização de oficinas para relacionamento das metas a ações e tarefas que levem ao seu atingimento.', 'Gestor do empreendimento', 'Facilitadores', 6, true),

-- 1.3 Estabelecimento de processo avaliativo (3 ações)
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Estabelecimento de processo avaliativo', 'Estabelecimento de indicadores financeiros', 'Realização de oficinas e criação de estrutura de informações que permita o acompanhamento da evolução dos indicadores', 'Gestor do empreendimento', 'Facilitadores', 7, true),
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Estabelecimento de processo avaliativo', 'Estabelecimento de indicadores produtivos', 'Realização de oficinas e criação de estrutura de informações que permita o acompanhamento da evolução dos indicadores', 'Gestor do empreendimento', 'Facilitadores', 8, true),
('gestao-estrategias', 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)', 'Estabelecimento de processo avaliativo', 'Estabelecimento de indicadores sociais e culturais', 'Realização de oficinas e criação de estrutura de informações que permita o acompanhamento da evolução dos indicadores', 'Gestor do empreendimento', 'Facilitadores', 9, true);

-- ==========================================
-- 2. PLANO DE MERCADO E COMERCIALIZAÇÃO
-- ==========================================

-- 2.1 Definição do Plano de Mercado (3 ações)
INSERT INTO pinovara.plano_gestao_acao_modelo (tipo, titulo, grupo, acao, hint_como_sera_feito, hint_responsavel, hint_recursos, ordem, ativo) VALUES
('mercado-comercializacao', 'Plano de Mercado e Comercialização (Foco nos Empreendimentos)', 'Definição do Plano de Mercado', 'Estabelecimento de estratégia de marketing', 'Para o empreendimento em pauta, a divulgação dos produtos deve dialogar com a história do Empreendimento / comunidade. As redes sociais serão usadas para mostrar o processo de produção, as pessoas envolvidas e o Território (Assentamento / Quilombo) envolvido.', 'Gestor do empreendimento', 'Facilitadores', 10, true),
('mercado-comercializacao', 'Plano de Mercado e Comercialização (Foco nos Empreendimentos)', 'Definição do Plano de Mercado', 'Desenvolvimento de identidade visual', 'Busca de identidade visual que crie conexão com o consumidor, refletindo a cultura da comunidade.', 'Gestor do empreendimento', 'Facilitadores', 11, true),
('mercado-comercializacao', 'Plano de Mercado e Comercialização (Foco nos Empreendimentos)', 'Definição do Plano de Mercado', 'Diversificação de canais de vendas', 'Participação em feiras e eventos, comércio eletrônico e parcerias com o varejo.', 'Gestor do empreendimento', 'Facilitadores', 12, true);

-- ==========================================
-- 3. PLANO DE TECNOLOGIA E INOVAÇÃO
-- ==========================================

-- 3.1 Desenvolver e utilizar tecnologias que qualifiquem a gestão (4 ações)
INSERT INTO pinovara.plano_gestao_acao_modelo (tipo, titulo, grupo, acao, hint_como_sera_feito, hint_responsavel, hint_recursos, ordem, ativo) VALUES
('tecnologia-inovacao', 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)', 'Desenvolver e utilizar tecnologias que qualifiquem a gestão', 'Inclusão digital', 'Capacitação no uso de ferramentas digitais para que os gestores possam se conectar, gerir o empreendimento e acessar novas oportunidades.', 'Gestor do empreendimento', 'Facilitadores', 13, true),
('tecnologia-inovacao', 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)', 'Desenvolver e utilizar tecnologias que qualifiquem a gestão', 'Ensino e compartilhamento do conhecimento ancestral', 'Desenvolvimento de plataformas computacionais online coletivas para acesso a conteúdo sobre conhecimento ancestral', 'Gestor do empreendimento', 'Facilitadores', 14, true),
('tecnologia-inovacao', 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)', 'Desenvolver e utilizar tecnologias que qualifiquem a gestão', 'Uso de tecnologia para melhoria da gestão e da produção', 'Implementar tecnologias para otimizar os processos de produção, logística e comercialização.', 'Gestor do empreendimento', 'Facilitadores', 15, true),
('tecnologia-inovacao', 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)', 'Desenvolver e utilizar tecnologias que qualifiquem a gestão', 'Uso da tecnologia para a promoção da sustentabilidade', 'Uso de tecnologia para monitorar o território, combater o desmatamento e garantir o uso sustentável dos recursos naturais', 'Gestor do empreendimento', 'Facilitadores', 16, true),

-- 3.2 Uso da tecnologia para facilitar o acesso a novos mercados (3 ações)
('tecnologia-inovacao', 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)', 'Uso da tecnologia para facilitar o acesso a novos mercados e desenvolver parcerias', 'Atração de novos clientes', 'Fortalecimento da presença on-line (sites, redes sociais)', 'Gestor do empreendimento', 'Facilitadores', 17, true),
('tecnologia-inovacao', 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)', 'Uso da tecnologia para facilitar o acesso a novos mercados e desenvolver parcerias', 'Agregação de valor pela rastreabilidade', 'Usar a tecnologia para a rastreabilidade dos produtos, permitindo que o consumidor saiba a origem, o produtor e a história de cada item', 'Gestor do empreendimento', 'Facilitadores', 18, true),
('tecnologia-inovacao', 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)', 'Uso da tecnologia para facilitar o acesso a novos mercados e desenvolver parcerias', 'Parcerias com plataformas', 'Mapeamento de plataformas que sejam promotoras do comércio justo.', 'Gestor do empreendimento', 'Facilitadores', 19, true);

-- ==========================================
-- 4. PLANO FINANCEIRO E ORÇAMENTÁRIO
-- ==========================================

-- 4.1 Qualificar os gestores em gestão financeira e orçamentária (3 ações)
INSERT INTO pinovara.plano_gestao_acao_modelo (tipo, titulo, grupo, acao, hint_como_sera_feito, hint_responsavel, hint_recursos, ordem, ativo) VALUES
('financeiro-orcamentario', 'Plano Financeiro e Orçamentário (Foco nos Empreendimentos)', 'Qualificar os gestores em gestão financeira e orçamentária', 'Capacitar os gestores em gestão financeira básica', 'Introduzir conceitos básicos como conceitos de fluxo de caixa, controle de giro e análise de estoques.', 'Gestor do empreendimento', 'Facilitadores', 20, true),
('financeiro-orcamentario', 'Plano Financeiro e Orçamentário (Foco nos Empreendimentos)', 'Qualificar os gestores em gestão financeira e orçamentária', 'Capacitar os gestores em gestão orçamentária básica', 'Introduzir conceitos básicos de fluxo de caixa, balanço patrimonial, Demonstração do Resultado do Exercício (DRE) e outros.', 'Gestor do empreendimento', 'Facilitadores', 21, true),
('financeiro-orcamentario', 'Plano Financeiro e Orçamentário (Foco nos Empreendimentos)', 'Qualificar os gestores em gestão financeira e orçamentária', 'Apoiar a gestão financeira e orçamentária com ferramentas informatizadas', 'Utilizar ferramentas informatizadas para automatizar tarefas relacionadas à gestão financeira e orçamentária', 'Gestor do empreendimento', 'Facilitadores', 22, true),

-- 4.2 Ampliar a autonomia financeira dos empreendedores (3 ações)
('financeiro-orcamentario', 'Plano Financeiro e Orçamentário (Foco nos Empreendimentos)', 'Ampliar a autonomia financeira dos empreendedores', 'Diversificar as fontes de Receitas', 'Além da venda de produtos, considerar possibilidades de desenvolver atividades remuneradas associadas ao turismo de base comunitária, realização de oficinas etc.', 'Gestor do empreendimento', 'Facilitadores', 23, true),
('financeiro-orcamentario', 'Plano Financeiro e Orçamentário (Foco nos Empreendimentos)', 'Ampliar a autonomia financeira dos empreendedores', 'Qualificar as parcerias comerciais', 'Avaliar potenciais parceiros comerciais a partir dos critérios de comércio justo e solidário.', 'Gestor do empreendimento', 'Facilitadores', 24, true),
('financeiro-orcamentario', 'Plano Financeiro e Orçamentário (Foco nos Empreendimentos)', 'Ampliar a autonomia financeira dos empreendedores', 'Fortalecer a economia local e solidária', 'Priorizar a compra de insumos e matérias-primas de outros membros da comunidade, criando um sistema de ''moeda social'' ou crédito comunitário para incentivar o comércio interno', 'Gestor do empreendimento', 'Facilitadores', 25, true);

-- ==========================================
-- 5. PLANO DE QUALIFICAÇÃO DA LIDERANÇA
-- ==========================================

-- 5.1 Desenvolver qualificação pessoal para a liderança (3 ações)
INSERT INTO pinovara.plano_gestao_acao_modelo (tipo, titulo, grupo, acao, hint_como_sera_feito, hint_responsavel, hint_recursos, ordem, ativo) VALUES
('qualificacao-lideranca', 'Plano de Qualificação da Liderança (Foco nos Empreendimentos)', 'Desenvolver qualificação pessoal para a liderança', 'Mapear competências, habilidades e atitudes para uma gestão empresarial cidadã', 'Realizar oficinas para levantamento de valores e posturas desejáveis para o exercício de uma liderança cidadã', 'Gestor do empreendimento', 'Facilitadores', 26, true),
('qualificacao-lideranca', 'Plano de Qualificação da Liderança (Foco nos Empreendimentos)', 'Desenvolver qualificação pessoal para a liderança', 'Realizar diagnóstico em relação às competências, habilidades e atitudes levantadas', 'Entrevista com líderes e colaboradores para identificar níveis observados no líder das competências, habilidades e atitudes identificadas como necessárias', 'Gestor do empreendimento', 'Facilitadores', 27, true),
('qualificacao-lideranca', 'Plano de Qualificação da Liderança (Foco nos Empreendimentos)', 'Desenvolver qualificação pessoal para a liderança', 'Identificar gaps de competências, habilidades e atitudes', 'Relacionar e priorizar ações de qualificação voltadas às superações dos gaps observados', 'Gestor do empreendimento', 'Facilitadores', 28, true),

-- 5.2 Desenvolver qualificação de gestão para a liderança (3 ações)
('qualificacao-lideranca', 'Plano de Qualificação da Liderança (Foco nos Empreendimentos)', 'Desenvolver qualificação de gestão para a liderança', 'Mapear competências, habilidades e atitudes para a gestão do empreendimento qualificada', 'Realizar oficinas para levantamento de necessidades associadas à gestão do empreendimento qualificada', 'Gestor do empreendimento', 'Facilitadores', 29, true),
('qualificacao-lideranca', 'Plano de Qualificação da Liderança (Foco nos Empreendimentos)', 'Desenvolver qualificação de gestão para a liderança', 'Realizar diagnóstico em relação às necessidades levantadas', 'Entrevista com líderes e colaboradores para identificar níveis observados no líder das competências, habilidades e atitudes identificadas como necessárias', 'Gestor do empreendimento', 'Facilitadores', 30, true),
('qualificacao-lideranca', 'Plano de Qualificação da Liderança (Foco nos Empreendimentos)', 'Desenvolver qualificação de gestão para a liderança', 'Identificar gaps de necessidades', 'Relacionar e priorizar ações de qualificação voltadas às superações dos gaps observados', 'Gestor do empreendimento', 'Facilitadores', 31, true);

-- ==========================================
-- 6. PLANO DE PRODUÇÃO
-- ==========================================

-- 6.1 Definir como se dará a produção (3 ações)
INSERT INTO pinovara.plano_gestao_acao_modelo (tipo, titulo, grupo, acao, hint_como_sera_feito, hint_responsavel, hint_recursos, ordem, ativo) VALUES
('producao', 'Plano de Produção (Foco nos Empreendimentos)', 'Definir como se dará a produção', 'Mapear o processo de produção', 'Será desenhado o fluxo de produção da matéria-prima ao produto final', 'Gestor do empreendimento', 'Facilitadores', 32, true),
('producao', 'Plano de Produção (Foco nos Empreendimentos)', 'Definir como se dará a produção', 'Estabelecer responsáveis pelas atividades', 'Identificação de responsáveis, pelas etapas e os tempos das atividades', 'Gestor do empreendimento', 'Facilitadores e plataforma específica para implementação do modelo', 33, true),
('producao', 'Plano de Produção (Foco nos Empreendimentos)', 'Definir como se dará a produção', 'Definir layout', 'Consultoria para definição da disposição física dos equipamentos e postos de trabalho para otimizar o fluxo de produção.', 'Gestor do empreendimento', 'Facilitadores', 34, true),

-- 6.2 Definir recursos necessários para a produção (3 ações)
('producao', 'Plano de Produção (Foco nos Empreendimentos)', 'Definir recursos necessários para a produção', 'Dimensionar equipamentos, recursos físicos e ferramentas', 'Reuniões com consultores', 'Gestor do empreendimento', 'Consultores', 35, true),
('producao', 'Plano de Produção (Foco nos Empreendimentos)', 'Definir recursos necessários para a produção', 'Dimensionar espaço físico', 'Reuniões com consultores', 'Gestor do empreendimento', 'Consultores', 36, true),
('producao', 'Plano de Produção (Foco nos Empreendimentos)', 'Definir recursos necessários para a produção', 'Dimensionar equipe para executar as atividades relacionadas ao processo produtivo', 'Reuniões com consultores', 'Gestor do empreendimento', 'Consultores', 37, true);

-- ==========================================
-- 7. PLANO DE APRENDIZAGEM INTERORGANIZACIONAL
-- ==========================================

-- 7.1 Formar uma rede de redes para aprendizagem (3 ações)
INSERT INTO pinovara.plano_gestao_acao_modelo (tipo, titulo, grupo, acao, hint_como_sera_feito, hint_responsavel, hint_recursos, ordem, ativo) VALUES
('aprendizagem-interorganizacional', 'Plano de Aprendizagem Interorganizacional (Foco nos Empreendimentos)', 'Formar uma rede de redes para aprendizagem', 'Estabelecer redes temáticas com foco em segmentos dos empreendimentos', 'Realizar oficinas para levantamento de empreendedores dispostos a aderir à rede de aprendizagem em cada segmento dos empreendimentos', 'Incubadora', 'Facilitadores', 38, true),
('aprendizagem-interorganizacional', 'Plano de Aprendizagem Interorganizacional (Foco nos Empreendimentos)', 'Formar uma rede de redes para aprendizagem', 'Estabelecer uma estrutura gestora para transversalização da aprendizagem interredes', 'Realizar oficinas com empreendedores dos diversos segmentos para construir uma estrutura gestora interredes para apoiar a aprendizagem entre as diversas redes', 'Incubadora', 'Facilitadores', 39, true),
('aprendizagem-interorganizacional', 'Plano de Aprendizagem Interorganizacional (Foco nos Empreendimentos)', 'Formar uma rede de redes para aprendizagem', 'Construir um modelo de governança para a rede de redes e para as redes temáticas', 'Estabelecer modelo de governança para gerir a rede de redes e as redes dos segmentos de negócio.', 'Incubadora', 'Facilitadores', 40, true),

-- 7.2 Desenvolver ações para aprendizagem interorganizacional (4 ações)
('aprendizagem-interorganizacional', 'Plano de Aprendizagem Interorganizacional (Foco nos Empreendimentos)', 'Desenvolver ações para aprendizagem interorganizacional', 'Definir escopo da aprendizagem', 'Definir em oficinas com membros da rede o escopo do aprendizado coletivo', 'Incubadora', 'Facilitadores', 41, true),
('aprendizagem-interorganizacional', 'Plano de Aprendizagem Interorganizacional (Foco nos Empreendimentos)', 'Desenvolver ações para aprendizagem interorganizacional', 'Realizar benchmarking entre membros da rede formada por empresas do mesmo segmento', 'Utilização de modelo, como o estrutura-conduta-desempenho, para estruturar o aprendizado entre empresas do mesmo segmento de negócio', 'Incubadora', 'Facilitadores e plataforma específica para implementação do modelo', 42, true),
('aprendizagem-interorganizacional', 'Plano de Aprendizagem Interorganizacional (Foco nos Empreendimentos)', 'Desenvolver ações para aprendizagem interorganizacional', 'Realizar benchmarking entre redes', 'Realizar encontros entre representações das redes para definir ações de aprendizado interredes.', 'Incubadora', 'Facilitadores', 43, true),
('aprendizagem-interorganizacional', 'Plano de Aprendizagem Interorganizacional (Foco nos Empreendimentos)', 'Desenvolver ações para aprendizagem interorganizacional', 'Realizar benchmarking externo à rede de redes', 'Realizar atividades e grupos de estudo para trazer para o âmbito da rede de redes práticas e inovações externas à rede', 'Incubadora', 'Facilitadores', 44, true);

-- ==========================================
-- VERIFICAÇÃO FINAL
-- ==========================================

-- Verificar se foram inseridas exatamente 44 ações
DO $$ 
DECLARE
    total_acoes INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_acoes FROM pinovara.plano_gestao_acao_modelo;
    
    IF total_acoes != 44 THEN
        RAISE WARNING 'ATENÇÃO: Foram inseridas % ações, mas o esperado era 44!', total_acoes;
    ELSE
        RAISE NOTICE '✓ Sucesso: 44 ações foram inseridas corretamente na tabela plano_gestao_acao_modelo';
    END IF;
END $$;

-- Mostrar resumo por plano
SELECT 
    tipo,
    titulo,
    COUNT(*) as total_acoes
FROM pinovara.plano_gestao_acao_modelo
GROUP BY tipo, titulo
ORDER BY MIN(ordem);

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================

