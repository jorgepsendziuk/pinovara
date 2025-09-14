-- ==========================================
-- INSERT DE TESTE - PINOVARA
-- ==========================================

-- Inserir uma organização de teste
INSERT INTO pinovara.pinovara (
    nome,
    cnpj,
    data_fundacao,
    data_visita,
    estado,
    municipio,
    gps_lat,
    gps_lng,
    gps_alt,
    gps_acc,
    caracteristicas_n_total_socios,
    caracteristicas_n_total_socios_caf,
    caracteristicas_ta_a_mulher,
    caracteristicas_ta_a_homem,
    meta_instance_id,
    meta_instance_name,
    id_tecnico,
    removido
) VALUES (
    'Cooperativa de Produtores de Café do Vale do Jequitinhonha',
    '12.345.678/0001-90',
    '2015-03-15',
    NOW(),
    5, -- Bahia
    2927408, -- Vitória da Conquista
    -14.8661,
    -40.8394,
    923.0,
    5.0,
    45,
    38,
    12,
    8,
    'uuid-test-001',
    'Cooperativa Vale Jequitinhonha',
    1,
    false
);

-- Inserir outra organização de teste
INSERT INTO pinovara.pinovara (
    nome,
    cnpj,
    data_fundacao,
    data_visita,
    estado,
    municipio,
    gps_lat,
    gps_lng,
    gps_alt,
    gps_acc,
    caracteristicas_n_total_socios,
    caracteristicas_n_total_socios_caf,
    caracteristicas_ta_a_mulher,
    caracteristicas_ta_a_homem,
    meta_instance_id,
    meta_instance_name,
    id_tecnico,
    removido
) VALUES (
    'Associação dos Agricultores Familiares de Café Orgânico',
    '98.765.432/0001-10',
    '2018-07-22',
    NOW(),
    5, -- Bahia
    2927408, -- Vitória da Conquista
    -14.8500,
    -40.8200,
    890.0,
    3.0,
    28,
    25,
    15,
    6,
    'uuid-test-002',
    'Associação Café Orgânico',
    1,
    false
);

-- Inserir uma terceira organização de teste
INSERT INTO pinovara.pinovara (
    nome,
    cnpj,
    data_fundacao,
    data_visita,
    estado,
    municipio,
    gps_lat,
    gps_lng,
    gps_alt,
    gps_acc,
    caracteristicas_n_total_socios,
    caracteristicas_n_total_socios_caf,
    caracteristicas_ta_a_mulher,
    caracteristicas_ta_a_homem,
    meta_instance_id,
    meta_instance_name,
    id_tecnico,
    removido
) VALUES (
    'Cooperativa de Comercialização Rural Sustentável',
    '11.222.333/0001-44',
    '2020-11-10',
    NOW(),
    5, -- Bahia
    2927408, -- Vitória da Conquista
    -14.8800,
    -40.8500,
    950.0,
    4.0,
    32,
    28,
    18,
    10,
    'uuid-test-003',
    'Cooperativa Rural Sustentável',
    1,
    false
);

-- Verificar os dados inseridos
SELECT 
    id,
    nome,
    cnpj,
    data_fundacao,
    data_visita,
    estado,
    municipio,
    gps_lat,
    gps_lng,
    caracteristicas_n_total_socios,
    caracteristicas_n_total_socios_caf,
    meta_instance_name,
    removido
FROM pinovara.pinovara 
WHERE removido = false 
ORDER BY id DESC 
LIMIT 5;
