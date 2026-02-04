-- ============================================
-- DADOS DE TESTE PARA MÓDULO DE SUPERVISÃO OCUPACIONAL
-- ============================================
-- Este script cria dados de teste para visualizar as interfaces funcionando
-- Execute após criar o módulo e as tabelas

-- ============================================
-- 1. Tabelas Auxiliares Básicas
-- ============================================

-- Estados (BA e outros estados comuns)
INSERT INTO familias_aux.estado (id, descricao, uf, id_unit) VALUES
(1, 'Acre', 'AC', NULL),
(2, 'Alagoas', 'AL', NULL),
(5, 'Bahia', 'BA', NULL),
(6, 'Ceará', 'CE', NULL),
(13, 'Maranhão', 'MA', NULL),
(16, 'Pará', 'PA', NULL),
(17, 'Paraíba', 'PB', NULL),
(21, 'Piauí', 'PI', NULL),
(23, 'Rio Grande do Norte', 'RN', NULL),
(26, 'Pernambuco', 'PE', NULL),
(27, 'Sergipe', 'SE', NULL),
(28, 'Tocantins', 'TO', NULL)
ON CONFLICT (id) DO NOTHING;

-- Municípios (apenas os necessários para os dados de teste)
INSERT INTO familias_aux.municipio_ibge (id, descricao, id_estado, uf, modulo_fiscal) VALUES
(2900702, 'Alagoinhas', 5, 'BA', NULL),
(2905701, 'Camaçari', 5, 'BA', NULL),
(2910859, 'Feira de Santana', 5, 'BA', NULL),
(2929503, 'Salvador', 5, 'BA', NULL),
(2936102, 'Vitória da Conquista', 5, 'BA', NULL)
ON CONFLICT (id) DO NOTHING;

-- Validação
INSERT INTO familias_aux.validacao (id, descricao) VALUES
(1, 'Aprovado'),
(2, 'Pendente'),
(3, 'Rejeitado')
ON CONFLICT (id) DO NOTHING;

-- Validação Estagiário
INSERT INTO familias_aux.validacao_estagiario (id, descricao) VALUES
(1, 'Aprovado'),
(2, 'Pendente'),
(3, 'Rejeitado')
ON CONFLICT (id) DO NOTHING;

-- Sim/Não
INSERT INTO familias_aux.sim_nao (id, descricao, id_text) VALUES
(1, 'Sim', 'SIM'),
(2, 'Não', 'NAO')
ON CONFLICT (id) DO NOTHING;

-- Sim/Não/Sabe (para campos de segurança alimentar)
INSERT INTO familias_aux.sim_nao_sabe (id, descricao) VALUES
(1, 'Sim'),
(2, 'Não'),
(3, 'Não sabe')
ON CONFLICT (id) DO NOTHING;

-- Sexo
INSERT INTO familias_aux.sexo (id, descricao) VALUES
(1, 'Masculino'),
(2, 'Feminino'),
(3, 'Outro')
ON CONFLICT (id) DO NOTHING;

-- Aceitou Visita (valores completos conforme XML)
INSERT INTO familias_aux.aceitou_visita (id, descricao) VALUES
(1, 'Sim'),
(2, 'Não'),
(3, 'Não encontrado'),
(4, 'Imóvel vago'),
(5, 'Litígio'),
(6, 'Sim - Entrevista Remota')
ON CONFLICT (id) DO NOTHING;

-- Renda Lote (para campos ir_r_bruta e ir_r_e_lote)
INSERT INTO familias_aux.renda_lote (id, descricao) VALUES
(0, 'R$ 0'),
(1, 'R$ 1 a R$ 20.999'),
(2, 'R$ 21.000 a R$ 40.999'),
(3, 'R$ 41.000 a R$ 60.999'),
(4, 'R$ 61.000 a R$ 80.999'),
(5, 'R$ 81.000 a R$ 100.999'),
(6, 'R$ 101.000 a R$ 150.999'),
(7, 'R$ 151.000 a R$ 200.999'),
(8, 'R$ 201.000 a R$ 300.999'),
(9, 'R$ 301.000 a R$ 400.999'),
(10, 'R$ 401.000 a R$ 500.999'),
(11, 'Acima de R$ 400.000')
ON CONFLICT (id) DO NOTHING;

-- Renda Porcentagem (para campo ir_r_e_lote se necessário)
INSERT INTO familias_aux.renda_porcentagem (id, descricao) VALUES
(0, '0%'),
(10, '10%'),
(20, '20%'),
(30, '30%'),
(40, '40%'),
(50, '50%'),
(60, '60%'),
(70, '70%'),
(80, '80%'),
(90, '90%'),
(100, '100%')
ON CONFLICT (id) DO NOTHING;

-- Declarada ou Medida (para campo ii_declarada_medida)
INSERT INTO familias_aux.declarada_medida (id, descricao) VALUES
(1, 'Declarada'),
(2, 'Medida')
ON CONFLICT (id) DO NOTHING;

-- Zona de Localização (para campo ec_zona)
INSERT INTO familias_aux.zona_localizacao (id, descricao) VALUES
(1, 'Zona Rural'),
(2, 'Zona Urbana')
ON CONFLICT (id) DO NOTHING;

-- Sim/Não/Informar (para campos ii_titulo_definitivo e ii_titulo_baixa)
INSERT INTO familias_aux.sim_nao_informar (id, descricao) VALUES
(1, 'Sim'),
(2, 'Não'),
(3, 'Não soube informar')
ON CONFLICT (id) DO NOTHING;

-- Sim/Não/Informar/Isento (para campo ii_titulo_quitado)
INSERT INTO familias_aux.sim_nao_informar_isento (id, descricao) VALUES
(1, 'Sim'),
(2, 'Não'),
(3, 'Não soube informar'),
(4, 'Isento')
ON CONFLICT (id) DO NOTHING;

-- Condição de Acesso (para campo ii_c_acesso)
INSERT INTO familias_aux.condicao_acesso (id, descricao) VALUES
(1, 'Terrestre rodovia asfaltada'),
(2, 'Terrestre via não pavimentada'),
(3, 'Fluvial transporte hidroviário')
ON CONFLICT (id) DO NOTHING;

-- Documento Órgão Público (para campo ii_d_orgaopublico)
INSERT INTO familias_aux.doc_orgaopublico (id, descricao) VALUES
(1, 'CATP'),
(2, 'CPCV'),
(3, 'AO'),
(99, 'Outros')
ON CONFLICT (id) DO NOTHING;

-- Processo Regularização (para campo ii_fr_r_doc)
INSERT INTO familias_aux.fr_r_doc (id, descricao) VALUES
(1, 'PGT'),
(2, 'Terra Legal'),
(3, 'Diretamente no INCRA'),
(99, 'Outro')
ON CONFLICT (id) DO NOTHING;

-- Nacionalidade (para campo iuf_ocup_nacionalidade)
INSERT INTO familias_aux.nacionalidade (id, descricao) VALUES
(1, 'Brasileira'),
(2, 'Estrangeira'),
(3, 'Brasileira Naturalizada')
ON CONFLICT (id) DO NOTHING;

-- Estado Civil (para campo iuf_ocup_e_civil)
INSERT INTO familias_aux.estado_civil (id, descricao) VALUES
(1, 'Casado(a)'),
(2, 'Solteiro(a)'),
(3, 'Separado(a)'),
(4, 'Divorciado(a)'),
(5, 'Viúvo(a)'),
(7, 'União Estável')
ON CONFLICT (id) DO NOTHING;

-- Regime de Bens (para campo iuf_ocup_r_bens)
INSERT INTO familias_aux.regime_bens (id, descricao) VALUES
(1, 'Comunhão Parcial'),
(2, 'Comunhão Universal'),
(3, 'Separação de Bens'),
(4, 'Participação Final'),
(5, 'Comunhão total')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. Glebas/Assentamentos de Teste
-- ============================================

INSERT INTO familias_aux.gleba (id, descricao, municipio, id_municipio, estado, id_estado, pasta) VALUES
(1, 'Assentamento Nova Esperança', 'Feira de Santana', 2910859, 'BA', 5, 'gleba_001'),
(2, 'Assentamento Terra Livre', 'Salvador', 2929503, 'BA', 5, 'gleba_002'),
(3, 'Assentamento São José', 'Vitória da Conquista', 2936102, 'BA', 5, 'gleba_003'),
(4, 'Quilombo Quilombo dos Palmares', 'Alagoinhas', 2900702, 'BA', 5, 'quilombo_001'),
(5, 'Assentamento Zumbi dos Palmares', 'Camaçari', 2905701, 'BA', 5, 'gleba_004')
ON CONFLICT (id) DO UPDATE
SET descricao = EXCLUDED.descricao,
    municipio = EXCLUDED.municipio,
    id_municipio = EXCLUDED.id_municipio,
    estado = EXCLUDED.estado,
    id_estado = EXCLUDED.id_estado,
    pasta = EXCLUDED.pasta;

-- ============================================
-- 3. Famílias de Teste
-- ============================================

-- Família 1 - Completa
INSERT INTO familias.familias_individual (
    _uri,
    _creator_uri_user,
    _creation_date,
    estado,
    municipio,
    cod_gleba,
    comunidade,
    quilombo,
    gps_lat,
    gps_lng,
    gps_alt,
    gps_acc,
    deviceid,
    meta_instance_id,
    inicio,
    validacao,
    obs_validacao,
    n_moradores,
    formulario_completo,
    removido,
    -- Campos de identificação solicitados
    iuf_ocup_nome,
    iuf_ocup_cpf,
    num_imovel,
    aceitou_visita,
    tem_nome,
    -- Identificação Ocupante
    iuf_ocup_sexo,
    iuf_ocup_nacionalidade,
    iuf_ocup_e_civil,
    iuf_ocup_r_bens,
    iuf_ocup_n_mae,
    iuf_ocup_telefone,
    iuf_ocup_email,
    -- Endereço
    ec_zona,
    ec_logrado,
    ec_numero,
    ec_complem,
    ec_bairro,
    ec_cep,
    ec_uf,
    -- Informações do Imóvel
    ii_titulo_definitivo,
    ii_titulo_quitado,
    ii_titulo_baixa,
    ii_linha_credito,
    ii_fr_regularizacao,
    ii_fr_r_doc,
    ii_o_primitivo,
    ii_c_acesso,
    ii_car_possui,
    ii_car_protocolo,
    ii_georreferenciada,
    ii_ai_matricula,
    ii_declarada_medida,
    ii_d_possui,
    ii_d_orgaopublico,
    ii_d_cc_td,
    ii_d_cc_ccdru,
    -- Quadro de Áreas
    qa_a_sede,
    qa_a_p_proprio,
    qa_a_m_nativa,
    qa_a_florestada,
    qa_a_pousio,
    qa_a_p_nativa,
    qa_a_p_plantada,
    qa_a_degradada,
    -- Requisitos RRF
    rrf_p_cultura,
    rrf_eo_direta,
    rrf_eo_forma,
    rrf_ed_anterior,
    rrf_oc_proprietario,
    rrf_oc_escravo,
    rrf_oc_beneficiado,
    rrf_oc_crime,
    rrf_oc_cargo,
    -- Informações de Renda
    ir_r_bruta,
    ir_r_e_lote,
    ir_f_p_social,
    -- Saneamento
    sb_moradia_outro,
    sb_agua_suficiente,
    sb_d_residuo_outro,
    -- Segurança Alimentar
    san_tiveram_preocupacao,
    san_acabaram_antes,
    san_orientacao_profissional
) VALUES (
    'uuid:test-familia-001',
    'jimxxx@gmail.com',
    NOW(),
    5, -- Bahia
    2910859, -- Feira de Santana
    1, -- Assentamento Nova Esperança
    'Comunidade Rural Nova Esperança',
    NULL,
    -12.2667,
    -38.9667,
    234.5,
    10.0,
    'device-test-001',
    'meta-instance-test-001',
    NOW(),
    2, -- Pendente
    'Cadastro inicial - aguardando validação',
    4,
    1,
    false,
    'João Silva Santos', -- Nome do ocupante
    '12345678901', -- CPF (11 dígitos)
    'LOTE-001-A', -- Número do lote
    1, -- Sim - Aceitou visita
    1, -- Sim - Tem nome
    -- Identificação Ocupante
    1, -- Masculino
    1, -- Brasileira
    1, -- Casado(a)
    1, -- Comunhão Parcial
    'Maria Silva Santos', -- Nome da mãe
    '75987654321', -- Telefone
    'joao.silva@email.com', -- Email
    -- Endereço
    1, -- Zona Rural
    'Estrada da Comunidade Nova Esperança',
    'S/N',
    'Próximo ao córrego',
    'Zona Rural',
    '44000000',
    5, -- Bahia
    -- Informações do Imóvel
    1, -- Sim - Título definitivo
    1, -- Sim - Título quitado
    1, -- Sim - Deu baixa
    2, -- Não - Não acessou crédito
    1, -- Sim - Em regularização
    1, -- PGT
    1, -- Sim - Ocupante primitivo
    2, -- Terrestre via não pavimentada
    1, -- Sim - Possui CAR
    'CAR-123456789', -- Protocolo CAR
    1, -- Sim - Georreferenciada
    12.5, -- Área do imóvel (ha)
    1, -- Declarada
    1, -- Sim - Possui documento
    1, -- CATP
    1, -- Sim - Possui Título de Domínio
    2, -- Não - Não possui CDRU
    -- Quadro de Áreas
    0.5, -- Área da sede
    8.0, -- Área de plantio próprio
    2.0, -- Área de mata nativa
    1.0, -- Área Florestada
    0.5, -- Área de pousio
    0.3, -- Área de pastagem nativa
    0.2, -- Área de pastagem plantada
    0.0, -- Área degradada
    -- Requisitos RRF
    1, -- Sim - Possui cultura
    1, -- Sim - Exploração direta
    1, -- Sim - Exploração forma
    2, -- Não - Exploração direta anterior
    2, -- Não - Ocupante proprietário
    2, -- Não - Ocupante escravo
    1, -- Sim - Ocupante beneficiado
    2, -- Não - Ocupante crime
    2, -- Não - Ocupante cargo
    -- Informações de Renda
    2, -- R$ 21.000 a R$ 40.999 (ir_r_bruta - FK para renda_lote, ID 2)
    3, -- Renda extra lote (ir_r_e_lote - FK para renda_lote, usando ID 3 como exemplo)
    1, -- Sim - Recebe programa social (ir_f_p_social)
    -- Saneamento
    NULL, -- Saneamento outro (sb_moradia_outro)
    1, -- Sim - Água suficiente (sb_agua_suficiente)
    NULL, -- Descarte resíduos outro (sb_d_residuo_outro)
    -- Segurança Alimentar
    2, -- Não - Não tiveram preocupação (san_tiveram_preocupacao - FK para sim_nao_sabe)
    2, -- Não - Não acabaram antes (san_acabaram_antes - FK para sim_nao_sabe)
    1 -- Sim - Recebeu orientação (san_orientacao_profissional - FK para sim_nao_sabe)
)
ON CONFLICT (_uri) DO UPDATE
SET estado = EXCLUDED.estado,
    municipio = EXCLUDED.municipio,
    cod_gleba = EXCLUDED.cod_gleba,
    comunidade = EXCLUDED.comunidade,
    validacao = EXCLUDED.validacao;

-- Família 2 - Aprovada
INSERT INTO familias.familias_individual (
    _uri,
    _creator_uri_user,
    _creation_date,
    estado,
    municipio,
    cod_gleba,
    comunidade,
    quilombo,
    gps_lat,
    gps_lng,
    gps_alt,
    gps_acc,
    deviceid,
    meta_instance_id,
    inicio,
    validacao,
    obs_validacao,
    n_moradores,
    formulario_completo,
    removido,
    iuf_ocup_sexo,
    san_comeu_menos,
    ii_fr_regularizacao,
    aceitou_visita,
    data_hora_validado,
    -- Campos de identificação solicitados
    iuf_ocup_nome,
    iuf_ocup_cpf,
    num_imovel
) VALUES (
    'uuid:test-familia-002',
    'jimxxx@gmail.com',
    NOW() - INTERVAL '5 days',
    5, -- Bahia
    2929503, -- Salvador
    2, -- Assentamento Terra Livre
    'Comunidade Terra Livre',
    NULL,
    -12.9714,
    -38.5014,
    8.0,
    5.0,
    'device-test-002',
    'meta-instance-test-002',
    NOW() - INTERVAL '5 days',
    1, -- Aprovado
    'Cadastro validado e aprovado',
    6,
    1,
    false,
    2, -- Feminino
    1, -- Sim
    1, -- Sim
    1, -- Sim - Aceitou visita
    NOW() - INTERVAL '2 days',
    'Maria Oliveira Costa', -- Nome do ocupante
    '98765432100', -- CPF
    'LOTE-002-B' -- Número do lote
)
ON CONFLICT (_uri) DO UPDATE
SET estado = EXCLUDED.estado,
    municipio = EXCLUDED.municipio,
    cod_gleba = EXCLUDED.cod_gleba,
    validacao = EXCLUDED.validacao;

-- Família 3 - Quilombo
INSERT INTO familias.familias_individual (
    _uri,
    _creator_uri_user,
    _creation_date,
    estado,
    municipio,
    cod_gleba,
    comunidade,
    quilombo,
    gps_lat,
    gps_lng,
    gps_alt,
    gps_acc,
    deviceid,
    meta_instance_id,
    inicio,
    validacao,
    obs_validacao,
    n_moradores,
    formulario_completo,
    removido,
    iuf_ocup_sexo,
    san_comeu_menos,
    ii_fr_regularizacao,
    aceitou_visita,
    -- Campos de identificação solicitados
    iuf_ocup_nome,
    iuf_ocup_cpf,
    num_imovel
) VALUES (
    'uuid:test-familia-003',
    'jimxxx@gmail.com',
    NOW() - INTERVAL '3 days',
    5, -- Bahia
    2900702, -- Alagoinhas
    4, -- Quilombo dos Palmares
    'Comunidade Quilombola',
    'Quilombo dos Palmares',
    -12.1356,
    -38.4192,
    150.0,
    8.0,
    'device-test-003',
    'meta-instance-test-003',
    NOW() - INTERVAL '3 days',
    2, -- Pendente
    'Cadastro de comunidade quilombola',
    5,
    1,
    false,
    1, -- Masculino
    2, -- Não
    2, -- Não
    1, -- Sim - Aceitou visita
    'José Pereira Alves', -- Nome do ocupante
    '11122233344', -- CPF
    'QUILOMBO-001' -- Número do lote
)
ON CONFLICT (_uri) DO UPDATE
SET estado = EXCLUDED.estado,
    municipio = EXCLUDED.municipio,
    cod_gleba = EXCLUDED.cod_gleba,
    quilombo = EXCLUDED.quilombo;

-- Família 4 - Rejeitada
INSERT INTO familias.familias_individual (
    _uri,
    _creator_uri_user,
    _creation_date,
    estado,
    municipio,
    cod_gleba,
    comunidade,
    quilombo,
    gps_lat,
    gps_lng,
    gps_alt,
    gps_acc,
    deviceid,
    meta_instance_id,
    inicio,
    validacao,
    obs_validacao,
    n_moradores,
    formulario_completo,
    removido,
    iuf_ocup_sexo,
    san_comeu_menos,
    ii_fr_regularizacao,
    aceitou_visita,
    data_hora_validado,
    -- Campos de identificação solicitados
    iuf_ocup_nome,
    iuf_ocup_cpf,
    num_imovel
) VALUES (
    'uuid:test-familia-004',
    'jimxxx@gmail.com',
    NOW() - INTERVAL '10 days',
    5, -- Bahia
    2936102, -- Vitória da Conquista
    3, -- Assentamento São José
    'Comunidade São José',
    NULL,
    -14.8661,
    -40.8394,
    923.0,
    12.0,
    'device-test-004',
    'meta-instance-test-004',
    NOW() - INTERVAL '10 days',
    3, -- Rejeitado
    'Dados incompletos - necessário revisão',
    3,
    0,
    false,
    2, -- Feminino
    1, -- Sim
    2, -- Não
    2, -- Não - Não aceitou visita
    NOW() - INTERVAL '8 days',
    'Ana Paula Souza', -- Nome do ocupante
    '55566677788', -- CPF
    'LOTE-003-C' -- Número do lote
)
ON CONFLICT (_uri) DO UPDATE
SET estado = EXCLUDED.estado,
    municipio = EXCLUDED.municipio,
    cod_gleba = EXCLUDED.cod_gleba,
    validacao = EXCLUDED.validacao;

-- Família 5 - Pendente (mais recente)
INSERT INTO familias.familias_individual (
    _uri,
    _creator_uri_user,
    _creation_date,
    estado,
    municipio,
    cod_gleba,
    comunidade,
    quilombo,
    gps_lat,
    gps_lng,
    gps_alt,
    gps_acc,
    deviceid,
    meta_instance_id,
    inicio,
    validacao,
    obs_validacao,
    n_moradores,
    formulario_completo,
    removido,
    iuf_ocup_sexo,
    san_comeu_menos,
    ii_fr_regularizacao,
    aceitou_visita,
    -- Campos de identificação solicitados
    iuf_ocup_nome,
    iuf_ocup_cpf,
    num_imovel
) VALUES (
    'uuid:test-familia-005',
    'jimxxx@gmail.com',
    NOW() - INTERVAL '1 hour',
    5, -- Bahia
    2905701, -- Camaçari
    5, -- Assentamento Zumbi dos Palmares
    'Comunidade Zumbi',
    NULL,
    -12.6975,
    -38.3239,
    50.0,
    7.0,
    'device-test-005',
    'meta-instance-test-005',
    NOW() - INTERVAL '1 hour',
    2, -- Pendente
    'Cadastro recém-criado',
    7,
    1,
    false,
    1, -- Masculino
    2, -- Não
    1, -- Sim
    6, -- Sim - Entrevista Remota
    'Carlos Roberto Lima', -- Nome do ocupante
    '99988877766', -- CPF
    'LOTE-005-D' -- Número do lote
)
ON CONFLICT (_uri) DO UPDATE
SET estado = EXCLUDED.estado,
    municipio = EXCLUDED.municipio,
    cod_gleba = EXCLUDED.cod_gleba;

-- ============================================
-- Verificação dos dados inseridos
-- ============================================

SELECT 'Glebas cadastradas:' as info, COUNT(*) as total FROM familias_aux.gleba
UNION ALL
SELECT 'Famílias cadastradas:', COUNT(*) FROM familias.familias_individual WHERE removido = false
UNION ALL
SELECT 'Famílias aprovadas:', COUNT(*) FROM familias.familias_individual WHERE validacao = 1 AND removido = false
UNION ALL
SELECT 'Famílias pendentes:', COUNT(*) FROM familias.familias_individual WHERE validacao = 2 AND removido = false
UNION ALL
SELECT 'Famílias rejeitadas:', COUNT(*) FROM familias.familias_individual WHERE validacao = 3 AND removido = false;
