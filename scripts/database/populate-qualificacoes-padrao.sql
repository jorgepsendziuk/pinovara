-- Script para popular qualificações padrão e versão 1.0 do questionário de avaliação
-- Schema: capacitacao
-- 
-- IMPORTANTE: Execute primeiro o script create-schema-capacitacao.sql para criar as tabelas

-- ============================================
-- 1. CRIAR VERSÃO 1.0 DO QUESTIONÁRIO DE AVALIAÇÃO
-- ============================================

INSERT INTO capacitacao.avaliacao_versao (versao, descricao, ativo, created_at, updated_at)
VALUES ('1.0', 'Versão inicial do questionário de avaliação de impacto padronizado', true, NOW(), NOW())
ON CONFLICT (versao) DO NOTHING;

-- Obter ID da versão criada
DO $$
DECLARE
    v_id_versao INTEGER;
BEGIN
    SELECT id INTO v_id_versao FROM capacitacao.avaliacao_versao WHERE versao = '1.0';
    
    -- ============================================
    -- 2. CRIAR PERGUNTAS DO QUESTIONÁRIO
    -- ============================================
    
    -- Pergunta 1: Objetivos claros (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 1, 'A qualificação / capacitação foi apresentada com objetivos claros?', 'escala_5', 
            '["Nunca", "Às vezes", "Metade do tempo", "Quase sempre", "Sempre"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 2: Relevância (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 2, 'A qualificação / capacitação é relevante para sua formação e aplicada no empreendimento coletivo (Cooperativa, Associação, etc) que você faz parte?', 'escala_5',
            '["Muito baixo", "Baixo", "Razoável", "Alto", "Muito Alto"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 3: Melhoria efetiva (sim_nao_talvez)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 3, 'Os conhecimentos, técnicas, métodos e outros adquiridos na qualificação / capacitação propiciam efetiva melhoria para o empreendimento coletivo (Cooperativa, Associação, etc) que você faz parte?', 'sim_nao_talvez',
            '["Sim", "Não", "Talvez"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 4: Cumprimento integral (sim_nao_parcialmente)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 4, 'A qualificação / capacitação proposta foi cumprido integralmente?', 'sim_nao_parcialmente',
            '["Sim", "Não", "Parcialmente"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 5: Distribuição de conteúdo (sim_nao_parcialmente)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 5, 'A distribuição de conteúdo ao longo do tempo da qualificação / capacitação foi adequada?', 'sim_nao_parcialmente',
            '["Sim", "Não", "Parcialmente"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 6: Material didático (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 6, 'O material didático fornecido ou citado é:', 'escala_5',
            '["Péssimo", "Ruim", "Regular", "Bom", "Excelente"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 7: Estruturação dos módulos (sim_nao_talvez)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 7, 'A qualificação / capacitação (estruturação dos módulos) atendeu e facilitou seu aprendizado e às expectativas / demandas para o empreendimento coletivo (Cooperativa, Associação, etc)?', 'sim_nao_talvez',
            '["Sim", "Não", "Talvez"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 8: Grau de dificuldade (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 8, 'Qual o grau de dificuldade da qualificação / capacitação?', 'escala_5',
            '["Muito Baixo", "Baixo", "Razoável", "Alto", "Muito Alto"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 9: Grau de entendimento (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 9, 'Seu grau de entendimento nesta qualificação / capacitação foi:', 'escala_5',
            '["Muito baixo", "Baixo", "Razoável", "Alto", "Muito Alto"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 10: Esforço (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 10, 'Durante a qualificação / capacitação, o seu esforço foi:', 'escala_5',
            '["Muito baixo", "Baixo", "Razoável", "Alto", "Muito Alto"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 11: Conhecimentos novos (sim_nao_parcialmente)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 11, 'Você adquiriu conhecimentos novos com a qualificação / capacitação?', 'sim_nao_parcialmente',
            '["Sim", "Não", "Parcialmente"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 12: Domínio do facilitador (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 12, 'O grau de domínio do(a) Facilitador(a) (Instrutor(a), Consultor(a)) sobre o conteúdo foi:', 'escala_5',
            '["Muito Baixo", "Baixo", "Razoável", "Alto", "Muito Alto"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 13: Métodos e técnicas (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 13, 'Os métodos e técnicas de aprendizagem utilizados pelo(a) Facilitador(a) (Instrutor(a), Consultor(a)) são:', 'escala_5',
            '["Péssimos", "Ruins", "Regulares", "Bons", "Excelentes"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 14: Estimulação da participação (escala_5)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 14, 'Durante a qualificação / capacitação o(a) Facilitador(a) (Instrutor(a), Consultor(a)) estimulou a participação dos(as) participantes (abertura para dúvidas, preocupação em explicar para o melhor entendimento e etc)?', 'escala_5',
            '["Nunca", "Às Vezes", "Metade do tempo", "Quase Sempre", "Sempre"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 15: Indicação do facilitador (sim_nao_talvez)
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 15, 'Você indicaria o(a) Facilitador(a) (Instrutor(a), Consultor(a)) para outra qualificação / capacitação?', 'sim_nao_talvez',
            '["Sim", "Não", "Talvez"]', true, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Pergunta 16: Comentários (texto_livre) - opcional
    INSERT INTO capacitacao.avaliacao_pergunta (id_versao, ordem, texto_pergunta, tipo, opcoes, obrigatoria, created_at)
    VALUES (v_id_versao, 16, 'Deixe seu comentário, sugestões, elogios, críticas...', 'texto_livre',
            NULL, false, NOW())
    ON CONFLICT DO NOTHING;
    
END $$;

-- ============================================
-- 3. CRIAR 3 QUALIFICAÇÕES PADRÃO
-- ============================================

-- Qualificação 1: Instrumentos para Operação de Redes de Aprendizagem Interorganizacionais
INSERT INTO capacitacao.qualificacao (
    titulo,
    objetivo_geral,
    objetivos_especificos,
    conteudo_programatico,
    metodologia,
    recursos_didaticos,
    estrategia_avaliacao,
    referencias,
    ativo,
    created_at,
    updated_at
) VALUES (
    'Instrumentos para Operação de Redes de Aprendizagem Interorganizacionais',
    'Capacitar os participantes a identificar, avaliar e selecionar as ferramentas (tecnológicas e metodológicas) mais adequadas para suportar a comunicação e o compartilhamento de conhecimento na rede.',
    '• Benchmarkings internos e externos
• Aprendizado cruzado e visitas entre organizações coletivas
• Modelo estrutura-conduta-desempenho para aprendizado permanente
• Comunidade de práticas
• Tecnologias digitais suportando o aprendizado coletivo',
    '1. Introdução às Redes de Aprendizagem Interorganizacionais
2. Benchmarkings internos e externos
3. Aprendizado cruzado e visitas entre organizações coletivas
4. Modelo estrutura-conduta-desempenho para aprendizado permanente
5. Comunidade de práticas
6. Tecnologias digitais suportando o aprendizado coletivo
7. Casos práticos e aplicações',
    'Aulas expositivas, estudos de caso, visitas técnicas, workshops práticos e discussões em grupo.',
    'Material didático impresso e digital, apresentações, estudos de caso, plataforma digital de aprendizagem.',
    'Avaliação contínua através de participação, trabalhos práticos e avaliação final de impacto.',
    'Referências bibliográficas sobre redes interorganizacionais, aprendizagem organizacional e tecnologias digitais.',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Qualificação 2: Governança e Sustentabilidade de Redes Interorganizacionais
INSERT INTO capacitacao.qualificacao (
    titulo,
    objetivo_geral,
    objetivos_especificos,
    conteudo_programatico,
    metodologia,
    recursos_didaticos,
    estrategia_avaliacao,
    referencias,
    ativo,
    created_at,
    updated_at
) VALUES (
    'Governança e Sustentabilidade de Redes Interorganizacionais',
    'Fornecer aos participantes as competências teóricas e práticas necessárias para estruturar, gerenciar e manter uma agenda colaborativa entre múltiplas organizações.',
    '• Formalização de acordos
• Gestão de Conflitos
• Modelos de liderança em redes
• Processos decisórios coletivos
• Mecanismos de controle e monitoramento de uma rede',
    '1. Fundamentos de Governança em Redes
2. Formalização de acordos e contratos
3. Gestão de conflitos em redes interorganizacionais
4. Modelos de liderança em redes
5. Processos decisórios coletivos
6. Mecanismos de controle e monitoramento
7. Sustentabilidade de redes
8. Casos práticos',
    'Aulas expositivas, dinâmicas de grupo, simulações, estudos de caso e debates.',
    'Material didático, apresentações, estudos de caso, ferramentas de gestão, plataforma digital.',
    'Avaliação através de participação, trabalhos em grupo, simulações e avaliação final.',
    'Referências sobre governança, gestão de redes, resolução de conflitos e sustentabilidade organizacional.',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Qualificação 3: Gestão por Processos e Tecnologias Digitais para Qualificação da Gestão
INSERT INTO capacitacao.qualificacao (
    titulo,
    objetivo_geral,
    objetivos_especificos,
    conteudo_programatico,
    metodologia,
    recursos_didaticos,
    estrategia_avaliacao,
    referencias,
    ativo,
    created_at,
    updated_at
) VALUES (
    'Gestão por Processos e Tecnologias Digitais para Qualificação da Gestão',
    'Prover os participantes (membros e gestores da rede interorganizacional) do conhecimento e das ferramentas necessárias para modernizar e padronizar os fluxos de trabalho e, consequentemente, melhorar a eficiência e a qualidade da gestão dos membros da rede e de suas cooperativas/organizações membras.',
    '• Mapeamento e representação de processos
• Tipologia e finalidades dos diferentes sistemas de informação
• Tomada de decisão baseada em dados
• Estruturação de informações sobre capacidade produtiva
• Estruturação de informações para suportar o acesso a mercados',
    '1. Introdução à Gestão por Processos
2. Mapeamento e representação de processos
3. Tipologia e finalidades dos diferentes sistemas de informação
4. Tomada de decisão baseada em dados
5. Estruturação de informações sobre capacidade produtiva
6. Estruturação de informações para suportar o acesso a mercados
7. Tecnologias digitais para gestão
8. Implementação prática',
    'Aulas expositivas, workshops práticos, laboratórios de informática, estudos de caso e projetos práticos.',
    'Material didático, softwares de gestão, plataformas digitais, estudos de caso, laboratório de informática.',
    'Avaliação contínua, projetos práticos, apresentações e avaliação final de impacto.',
    'Referências sobre gestão por processos, sistemas de informação, análise de dados e tecnologias digitais.',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Qualificações padrão e versão 1.0 do questionário de avaliação criadas com sucesso!';
END $$;

