-- ============================================
-- DDL para criação dos schemas e permissões
-- ============================================

-- Criar schema familias
CREATE SCHEMA IF NOT EXISTS familias;

-- Criar schema familias_aux
CREATE SCHEMA IF NOT EXISTS familias_aux;

-- Conceder permissões de uso nos schemas para o usuário pinovara
GRANT USAGE ON SCHEMA familias TO pinovara;
GRANT USAGE ON SCHEMA familias_aux TO pinovara;

-- Conceder permissões padrão para objetos futuros nos schemas
ALTER DEFAULT PRIVILEGES IN SCHEMA familias GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pinovara;
ALTER DEFAULT PRIVILEGES IN SCHEMA familias GRANT USAGE, SELECT ON SEQUENCES TO pinovara;
ALTER DEFAULT PRIVILEGES IN SCHEMA familias_aux GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pinovara;
ALTER DEFAULT PRIVILEGES IN SCHEMA familias_aux GRANT USAGE, SELECT ON SEQUENCES TO pinovara;

-- ============================================
-- Tabelas do schema familias_aux
-- ============================================

create table if not exists familias_aux.aceitou_visita
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.aceitou_visita
    owner to postgres;

grant insert, select, update on familias_aux.aceitou_visita to pinovara;

create table if not exists familias_aux.sim_nao
(
    id        integer not null
        primary key,
    descricao char(3),
    id_text   char(3)
);

alter table familias_aux.sim_nao
    owner to postgres;

grant insert, select, update on familias_aux.sim_nao to pinovara;

create table if not exists familias_aux.estado
(
    id        integer not null
        primary key,
    descricao varchar,
    uf        char(2),
    id_unit   integer
);

alter table familias_aux.estado
    owner to postgres;

grant insert, select, update on familias_aux.estado to pinovara;

create table if not exists familias_aux.grau_parentesco
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.grau_parentesco
    owner to postgres;

grant insert, select, update on familias_aux.grau_parentesco to pinovara;

create table if not exists familias_aux.sexo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sexo
    owner to postgres;

grant insert, select, update on familias_aux.sexo to pinovara;

create table if not exists familias_aux.tipo_socioprodutiva
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tipo_socioprodutiva
    owner to postgres;

grant insert, select, update on familias_aux.tipo_socioprodutiva to pinovara;

create table if not exists familias_aux.localizacao_socioprodutiva
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.localizacao_socioprodutiva
    owner to postgres;

grant insert, select, update on familias_aux.localizacao_socioprodutiva to pinovara;

create table if not exists familias_aux.agua
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.agua
    owner to postgres;

grant insert, select, update on familias_aux.agua to pinovara;

create table if not exists familias_aux.saneamento_basico
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.saneamento_basico
    owner to postgres;

grant insert, select, update on familias_aux.saneamento_basico to pinovara;

create table if not exists familias_aux.benfeitorias
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.benfeitorias
    owner to postgres;

grant insert, select, update on familias_aux.benfeitorias to pinovara;

create table if not exists familias_aux.estado_civil
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.estado_civil
    owner to postgres;

grant insert, select, update on familias_aux.estado_civil to pinovara;

create table if not exists familias_aux.prog_governamental
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.prog_governamental
    owner to postgres;

grant insert, select, update on familias_aux.prog_governamental to pinovara;

create table if not exists familias_aux.renda_lote
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.renda_lote
    owner to postgres;

grant insert, select, update on familias_aux.renda_lote to pinovara;

create table if not exists familias_aux.renda_porcentagem
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.renda_porcentagem
    owner to postgres;

grant insert, select, update on familias_aux.renda_porcentagem to pinovara;

create table if not exists familias_aux.zona_localizacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.zona_localizacao
    owner to postgres;

grant insert, select, update on familias_aux.zona_localizacao to pinovara;

create table if not exists familias_aux.nacionalidade
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.nacionalidade
    owner to postgres;

grant insert, select, update on familias_aux.nacionalidade to pinovara;

create table if not exists familias_aux.quem_assinatura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.quem_assinatura
    owner to postgres;

grant insert, select, update on familias_aux.quem_assinatura to pinovara;

create table if not exists familias_aux.tp_docind
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tp_docind
    owner to postgres;

grant insert, select, update on familias_aux.tp_docind to pinovara;

create table if not exists familias_aux.regime_bens
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.regime_bens
    owner to postgres;

grant insert, select, update on familias_aux.regime_bens to pinovara;

create table if not exists familias_aux.doc_orgaopublico
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.doc_orgaopublico
    owner to postgres;

grant insert, select, update on familias_aux.doc_orgaopublico to pinovara;

create table if not exists familias_aux.condicao_acesso
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.condicao_acesso
    owner to postgres;

grant insert, select, update on familias_aux.condicao_acesso to pinovara;

create table if not exists familias_aux.declarada_medida
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.declarada_medida
    owner to postgres;

grant insert, select, update on familias_aux.declarada_medida to pinovara;

create table if not exists familias_aux.descarte_residuo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.descarte_residuo
    owner to postgres;

grant insert, select, update on familias_aux.descarte_residuo to pinovara;

create table if not exists familias_aux.doc_comprobatoria
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.doc_comprobatoria
    owner to postgres;

grant insert, select, update on familias_aux.doc_comprobatoria to pinovara;

create table if not exists familias_aux.ocupante_antecessor
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.ocupante_antecessor
    owner to postgres;

grant insert, select, update on familias_aux.ocupante_antecessor to pinovara;

create table if not exists familias_aux.ocupante_conjuge
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.ocupante_conjuge
    owner to postgres;

grant insert, select, update on familias_aux.ocupante_conjuge to pinovara;

create table if not exists familias_aux.atividade_comercial
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.atividade_comercial
    owner to postgres;

grant insert, select, update on familias_aux.atividade_comercial to pinovara;

create table if not exists familias_aux.producao_animal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.producao_animal
    owner to postgres;

grant insert, select, update on familias_aux.producao_animal to pinovara;

create table if not exists familias_aux.grupo_foto
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.grupo_foto
    owner to postgres;

grant insert, select, update on familias_aux.grupo_foto to pinovara;

create table if not exists familias_aux.producao_foto
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.producao_foto
    owner to postgres;

grant insert, select, update on familias_aux.producao_foto to pinovara;

create table if not exists familias_aux.municipio_ibge
(
    id              integer not null
        primary key,
    descricao       varchar,
    id_estado       integer
        references familias_aux.estado,
    uf              char(2),
    modulo_fiscal integer
);

alter table familias_aux.municipio_ibge
    owner to postgres;

grant insert, select, update on familias_aux.municipio_ibge to pinovara;

create table if not exists familias_aux.gleba
(
    id           integer not null
        primary key,
    descricao    varchar,
    municipio    varchar,
    id_municipio integer
        references familias_aux.municipio_ibge,
    estado       char(2),
    id_estado    integer
        references familias_aux.estado,
    pasta        varchar
);

alter table familias_aux.gleba
    owner to postgres;

grant insert, select, update on familias_aux.gleba to pinovara;

create table if not exists familias_aux.validacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.validacao
    owner to postgres;

grant insert, select, update on familias_aux.validacao to pinovara;

create table if not exists familias_aux.fr_r_doc
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.fr_r_doc
    owner to postgres;

grant insert, select, update on familias_aux.fr_r_doc to pinovara;

create table if not exists familias_aux.correcao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.correcao
    owner to postgres;

grant insert, select, update on familias_aux.correcao to pinovara;

create table if not exists familias_aux.validacao_estagiario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.validacao_estagiario
    owner to postgres;

grant insert, select, update on familias_aux.validacao_estagiario to pinovara;

create table if not exists familias_aux.profissao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.profissao
    owner to postgres;

grant insert, select, update on familias_aux.profissao to pinovara;

create table if not exists familias_aux.formulario_completo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.formulario_completo
    owner to pinovara;

create table if not exists familias_aux.sim_nao_sabe
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sim_nao_sabe
    owner to pinovara;

create table if not exists familias_aux.classificacao_alimento
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.classificacao_alimento
    owner to postgres;

create table if not exists familias_aux.producao_vegetal
(
    id            integer not null
        primary key,
    descricao     varchar,
    classificacao integer
        references familias_aux.classificacao_alimento
);

alter table familias_aux.producao_vegetal
    owner to postgres;

grant insert, select, update on familias_aux.producao_vegetal to pinovara;

create table if not exists familias_aux.autoconsumo_animal
(
    id            integer not null
        primary key,
    descricao     varchar,
    classificacao integer
        references familias_aux.classificacao_alimento
);

alter table familias_aux.autoconsumo_animal
    owner to postgres;

grant insert, select, update on familias_aux.autoconsumo_animal to pinovara;

grant insert, select, update on familias_aux.classificacao_alimento to pinovara;

create table if not exists familias_aux.gleba_bkp
(
    id           integer,
    descricao    varchar,
    municipio    varchar,
    id_municipio integer,
    estado       char(2),
    id_estado    integer,
    pasta        varchar
);

alter table familias_aux.gleba_bkp
    owner to postgres;

grant insert, select, update on familias_aux.gleba_bkp to pinovara;

create table if not exists familias_aux.unidade
(
    id        integer not null
        primary key,
    descricao varchar,
    id_texto  varchar
);

alter table familias_aux.unidade
    owner to pinovara;

create table if not exists familias_aux.tipo_formulario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tipo_formulario
    owner to pinovara;

create table if not exists familias_aux.sn_crioula
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sn_crioula
    owner to pinovara;

create table if not exists familias_aux.canal_comercializacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.canal_comercializacao
    owner to pinovara;

create table if not exists familias_aux.complementacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.complementacao
    owner to pinovara;

create table if not exists familias_aux.complementacao_prodanimal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.complementacao_prodanimal
    owner to pinovara;

create table if not exists familias_aux.tipo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tipo_producao
    owner to pinovara;

create table if not exists familias_aux.reproducao_bovinocultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.reproducao_bovinocultura
    owner to pinovara;

create table if not exists familias_aux.sistcriacao_bovinocultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sistcriacao_bovinocultura
    owner to pinovara;

create table if not exists familias_aux.sistcriacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sistcriacao
    owner to pinovara;

create table if not exists familias_aux.piscicultura_finalidade
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_finalidade
    owner to pinovara;

create table if not exists familias_aux.piscicultura_tipo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_tipo
    owner to pinovara;

create table if not exists familias_aux.piscicultura_manejo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_manejo
    owner to pinovara;

create table if not exists familias_aux.piscicultura_pastoreio
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_pastoreio
    owner to pinovara;

create table if not exists familias_aux.piscicultura_complementacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_complementacao
    owner to pinovara;

create table if not exists familias_aux.piscicultura_especie
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_especie
    owner to pinovara;

create table if not exists familias_aux.aquicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.aquicultura
    owner to pinovara;

create table if not exists familias_aux.proc_alimentos_categoria
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.proc_alimentos_categoria
    owner to pinovara;

create table if not exists familias_aux.proc_alimentos_reg_sanitario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.proc_alimentos_reg_sanitario
    owner to pinovara;

create table if not exists familias_aux.proc_alimentos_fonte_materia
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.proc_alimentos_fonte_materia
    owner to pinovara;

create table if not exists familias_aux.semente_muda
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.semente_muda
    owner to pinovara;

create table if not exists familias_aux.propria_comprada
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.propria_comprada
    owner to pinovara;

create table if not exists familias_aux.manejo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.manejo_producao
    owner to pinovara;

create table if not exists familias_aux.pastoreio_prodanimal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.pastoreio_prodanimal
    owner to pinovara;

create table if not exists familias_aux.pastoreio
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.pastoreio
    owner to pinovara;

create table if not exists familias_aux.periodo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.periodo_producao
    owner to pinovara;

create table if not exists familias_aux.tipo_apicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tipo_apicultura
    owner to pinovara;

create table if not exists familias_aux.manejo_apicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.manejo_apicultura
    owner to pinovara;

create table if not exists familias_aux.extracao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.extracao
    owner to pinovara;

create table if not exists familias_aux.extrativismo_animal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.extrativismo_animal
    owner to pinovara;

create table if not exists familias_aux.extrativismo_vegetal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.extrativismo_vegetal
    owner to pinovara;

create table if not exists familias_aux.sim_nao_informar
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sim_nao_informar
    owner to pinovara;

create table if not exists familias_aux.sim_nao_informar_isento
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sim_nao_informar_isento
    owner to pinovara;

-- ============================================
-- Tabelas do schema familias
-- ============================================

create table if not exists familias.familias_individual
(
    id                          serial
        primary key,
    _uri                        varchar(80) not null
        unique,
    _creator_uri_user           varchar(80),
    _creation_date              timestamp,
    _last_update_uri_user       varchar(80),
    _last_update_date           timestamp,
    _model_version              integer,
    _ui_version                 integer,
    _is_complete                boolean,
    _submission_date            timestamp,
    _marked_as_complete_date    timestamp,
    rrf_oc_escravo_quem         integer
        references familias_aux.ocupante_conjuge,
    obs_gerais                  varchar,
    iuf_conj_d_nascimento       date,
    iuf_conj_conhecido          varchar,
    iuf_ocup_sexo               integer
        references familias_aux.sexo,
    rrf_oc_crime_quem           integer
        references familias_aux.ocupante_conjuge,
    iuf_ocup_nd_uf              integer
        references familias_aux.estado,
    iuf_ocup_n_estado           integer
        references familias_aux.estado,
    san_comeu_menos             integer
        references familias_aux.sim_nao,
    ii_fr_regularizacao         integer
        references familias_aux.sim_nao,
    iuf_conj_profissao          integer
        references familias_aux.profissao,
    gps_acc                     double precision,
    sb_d_residuo                integer
        references familias_aux.descarte_residuo,
    iuf_conj_d_casamento        date,
    rrf_eo_forma                integer
        references familias_aux.sim_nao,
    ii_declarada_medida         integer
        references familias_aux.declarada_medida,
    ii_d_certific               varchar,
    ii_d_cc_ccdru               integer
        references familias_aux.sim_nao,
    iuf_conj_r_bens             integer
        references familias_aux.regime_bens,
    san_diminuiu                integer
        references familias_aux.sim_nao,
    iuf_conj_nd_tipo            integer
        references familias_aux.tp_docind,
    iuf_conj_nd_identidade      varchar,
    san_consome                 integer
        references familias_aux.sim_nao,
    ec_bairro                   varchar,
    iuf_conj_nd_uf              integer
        references familias_aux.estado,
    a_q_conjuge                 integer
        references familias_aux.quem_assinatura,
    iuf_conj_n_mae              varchar,
    iuf_prop_nome               varchar,
    ii_georreferenciada         integer
        references familias_aux.sim_nao,
    iuf_conj_tel1               varchar,
    iuf_conj_tel2               varchar,
    p_socioprodutiva            integer
        references familias_aux.sim_nao,
    rrf_oc_crime                integer
        references familias_aux.sim_nao,
    ec_logrado                  varchar,
    san_sem_dinheiro            integer
        references familias_aux.sim_nao,
    ir_f_p_social_outro         varchar,
    rrf_ed_anterior_quem        integer
        references familias_aux.ocupante_antecessor,
    inicio                      timestamp,
    iuf_ocup_d_casamento        date,
    iuf_conj_nd_orgao           varchar,
    iuf_desc_acesso             varchar,
    ec_cep                      varchar,
    iuf_ocup_profissao          integer
        references familias_aux.profissao,
    iuf_ocup_conhecido          varchar,
    iuf_ocup_d_nascimento       date,
    ii_d_sncr                   varchar,
    iuf_ocup_nd_identidade      varchar,
    ii_r_st                     varchar,
    ii_d_comprobatoria          integer
        references familias_aux.doc_comprobatoria,
    rrf_oc_beneficiado          integer
        references familias_aux.sim_nao,
    iuf_ocup_nd_tipo            integer
        references familias_aux.tp_docind,
    gps_lng                     double precision,
    ii_d_cc_td                  integer
        references familias_aux.sim_nao,
    meta_instance_id            varchar,
    a_o_r_cpf                   varchar(11),
    ii_d_orgaopublico           integer
        references familias_aux.doc_orgaopublico,
    ir_r_e_lote                 integer
        references familias_aux.renda_lote,
    ii_vm_fiscal                numeric(10, 4),
    iuf_ocup_idade              integer,
    iuf_conj_n_municipio        varchar,
    a_o_r_nome                  varchar,
    ec_uf                       integer
        references familias_aux.estado,
    ii_d_comprobatoria_outros   varchar,
    ir_r_bruta                  integer
        references familias_aux.renda_lote,
    ir_f_p_social               integer
        references familias_aux.sim_nao,
    estado                      integer
        references familias_aux.estado,
    ii_do_originaria            date,
    rrf_oc_proprietario_quem    integer
        references familias_aux.ocupante_conjuge,
    ii_p_principal              varchar,
    num_imovel                  varchar,
    iuf_conj_idade              integer,
    rrf_eo_direta               integer
        references familias_aux.sim_nao,
    aceitou_visita              integer
        references familias_aux.aceitou_visita,
    iuf_ocup_tel2               varchar,
    comunidade                  varchar,
    iuf_ocup_tel1               varchar,
    iuf_conj_nome               varchar,
    municipio                   integer
        references familias_aux.municipio_ibge,
    cod_gleba                   integer
        references familias_aux.gleba,
    deviceid                    varchar,
    sb_d_residuo_outro          varchar,
    iuf_ocup_email              varchar,
    a_c_r_nome                  varchar,
    a_c_r_cpf                   varchar(11),
    iuf_ocup_cpf                varchar(11),
    ec_complem                  varchar,
    san_preocupacao             integer
        references familias_aux.sim_nao,
    gps_alt                     double precision,
    ii_o_primitivo              integer
        references familias_aux.sim_nao,
    gps_lat                     double precision,
    n_moradores                 integer,
    soma_area_digitada          varchar,
    iuf_conj_nacionalidade      integer
        references familias_aux.nacionalidade,
    iuf_conj_cpf                varchar(11),
    sb_agua_suficiente          integer
        references familias_aux.sim_nao,
    iuf_ocup_nacionalidade      integer
        references familias_aux.nacionalidade,
    ec_zona                     integer
        references familias_aux.zona_localizacao,
    rrf_oc_escravo              integer
        references familias_aux.sim_nao,
    iuf_ocup_telefone           varchar,
    iuf_ocup_nd_orgao           varchar,
    iuf_ocup_n_mae              varchar,
    rrf_oc_beneficiado_quem     integer
        references familias_aux.ocupante_conjuge,
    iuf_ocup_n_municipio        varchar,
    rrf_p_cultura               integer
        references familias_aux.sim_nao,
    modulo_fiscal               integer,
    iuf_conj_n_estado           integer
        references familias_aux.estado,
    rrf_ed_anterior             integer
        references familias_aux.sim_nao,
    ii_ai_matricula             numeric(16, 4),
    iuf_ocup_r_bens             integer
        references familias_aux.regime_bens,
    san_orientacao              integer
        references familias_aux.sim_nao,
    rrf_oc_proprietario         integer
        references familias_aux.sim_nao,
    ii_car_protocolo            varchar,
    qa_a_degradada              numeric(16, 4),
    iuf_ocup_e_civil            integer
        references familias_aux.estado_civil,
    iuf_conj_sexo               integer
        references familias_aux.sexo,
    san_acabou                  integer
        references familias_aux.sim_nao,
    ii_c_acesso                 integer
        references familias_aux.condicao_acesso,
    sb_moradia_outro            varchar,
    n_contador                  integer,
    ii_d_orgaopublico_outros    varchar,
    ec_numero                   varchar,
    rrf_oc_cargo                integer
        references familias_aux.sim_nao,
    qa_a_p_nativa               numeric(16, 4),
    tem_nome                    integer
        references familias_aux.sim_nao,
    qa_a_p_plantada             numeric(16, 4),
    qa_a_florestada             numeric(16, 4),
    qa_a_pousio                 numeric(16, 4),
    qa_a_p_proprio              numeric(16, 4),
    ii_car_possui               integer
        references familias_aux.sim_nao,
    qa_a_m_nativa               numeric(16, 4),
    qa_a_sede                   numeric(16, 4),
    ii_din_urbano               numeric(8, 2),
    ec_cod_ibg                  integer
        references familias_aux.municipio_ibge,
    ii_d_possui                 integer
        references familias_aux.sim_nao,
    iuf_conj_email              varchar,
    fim                         timestamp,
    iuf_ocup_endereco           varchar,
    sb_agua_outro               varchar,
    iuf_ocup_nome               varchar,
    iuf_conj_e_civil            integer
        references familias_aux.estado_civil,
    a_q_ocupante                integer
        references familias_aux.quem_assinatura,
    a_entrevistador             varchar,
    a_ocupante                  varchar,
    a_o_r_documento             varchar,
    a_conjuge                   varchar,
    a_c_r_documento             varchar,
    removido                    boolean default false,
    validacao                   integer default 2
        references familias_aux.validacao,
    obs_validacao               varchar,
    tecnico                     integer
        references pinovara.users,
    data_hora_alterado          timestamp,
    data_hora_validado          timestamp,
    ii_fr_r_doc                 integer
        references familias_aux.fr_r_doc,
    ii_fr_r_doc_outro           varchar,
    corrigido                   integer
        references familias_aux.correcao,
    justificativa               varchar,
    estagiario                  integer
        references pinovara.users,
    validacao_estagiario        integer default 2
        references familias_aux.validacao_estagiario,
    ii_do_atual                 date,
    iuf_conj_profissao_outros   varchar,
    iuf_ocup_profissao_outros   varchar,
    benfeitorias_outros         varchar,
    validacao_2                 integer,
    formulario_completo         integer default 1,
    san_tiveram_preocupacao     integer
        references familias_aux.sim_nao_sabe,
    san_acabaram_antes          integer
        references familias_aux.sim_nao_sabe,
    san_ficaram_sem             integer
        references familias_aux.sim_nao_sabe,
    san_comeram_pouco           integer
        references familias_aux.sim_nao_sabe,
    san_deixou_refeicao         integer
        references familias_aux.sim_nao_sabe,
    san_comeu_menos_devia       integer
        constraint familias_comeu_menos_devia_fkey
            references familias_aux.sim_nao_sabe,
    san_sentiu_fome             integer
        references familias_aux.sim_nao_sabe,
    san_uma_refeicao            integer
        references familias_aux.sim_nao_sabe,
    san_refeicao_completa       integer
        references familias_aux.sim_nao_sabe,
    san_orientacao_profissional integer
        references familias_aux.sim_nao_sabe,
    iuf_ocup_aposentado         integer
        references familias_aux.sim_nao_sabe,
    iuf_conj_aposentado         integer
        references familias_aux.sim_nao_sabe,
    obs_1                       varchar,
    obs_2                       varchar,
    obs_3                       varchar,
    obs_4                       varchar,
    obs_5                       varchar,
    obs_6                       varchar,
    obs_7                       varchar,
    obs_8                       varchar,
    obs_9                       varchar,
    pa_a_vegetal_outros         varchar,
    pa_p_vegetal_outros         varchar,
    quilombo                    varchar,
    tipo_formulario             integer
        references familias_aux.tipo_formulario,
    existe_numimovel            integer
        references familias_aux.sim_nao,
    ii_titulo_definitivo        integer
        references familias_aux.sim_nao_informar,
    ii_linha_credito            integer
        references familias_aux.sim_nao,
    ii_linha_credito_qual       varchar,
    c_bovl_quantidade           integer,
    c_bovl_per_producao         integer,
    c_bovl_manejo               integer,
    c_bovl_pastoreio            integer,
    c_bovl_p_total              numeric(14, 2),
    c_bovl_p_autoconsumo        numeric(14, 2),
    c_bovl_p_comercial          numeric(14, 2),
    c_bovl_valor_anual          numeric(14, 2),
    c_bovc_quantidade           integer,
    c_bovc_tipo                 integer,
    c_bovc_manejo               integer,
    c_bovc_pastoreio            integer,
    c_bovc_p_autoconsumo        numeric(14, 2),
    c_bovc_p_comercial          numeric(14, 2),
    c_bovc_valor_anual          numeric(14, 2),
    c_sui_quantidade            integer,
    c_sui_tipo                  integer,
    c_sui_manejo                integer,
    c_sui_pastoreio             integer,
    c_sui_p_total               numeric(14, 2),
    c_sui_p_autoconsumo         numeric(14, 2),
    c_sui_p_comercial           numeric(14, 2),
    c_sui_valor_anual           numeric(14, 2),
    c_avic_quantidade           integer,
    c_avic_tipo                 integer,
    c_avic_manejo               integer,
    c_avic_pastoreio            integer,
    c_avic_p_total              numeric(14, 2),
    c_avic_p_autoconsumo        numeric(14, 2),
    c_avic_p_comercial          numeric(14, 2),
    c_avic_valor_anual          numeric(14, 2),
    c_avip_quantidade           integer,
    c_avip_tipo                 integer,
    c_avip_manejo               integer,
    c_avip_pastoreio            integer,
    c_avip_p_total              numeric(14, 2),
    c_avip_p_autoconsumo        numeric(14, 2),
    c_avip_p_comercial          numeric(14, 2),
    c_avip_valor_anual          numeric(14, 2),
    c_pis_q_cultura             integer,
    c_ovi_quantidade            integer,
    c_ovi_tipo                  integer,
    c_ovi_manejo                integer,
    c_ovi_pastoreio             integer,
    c_ovi_p_total               numeric(14, 2),
    c_ovi_p_autoconsumo         numeric(14, 2),
    c_ovi_p_comercial           numeric(14, 2),
    c_ovi_valor_anual           numeric(14, 2),
    c_cap_quantidade            integer,
    c_cap_tipo                  integer,
    c_cap_manejo                integer,
    c_cap_pastoreio             integer,
    c_cap_p_total               numeric(14, 2),
    c_cap_p_autoconsumo         numeric(14, 2),
    c_cap_p_comercial           numeric(14, 2),
    c_cap_valor_anual           numeric(14, 2),
    c_api_quantidade            integer,
    c_api_tipo                  integer,
    c_api_manejo                integer,
    c_api_p_total               numeric(14, 2),
    c_api_p_autoconsumo         numeric(14, 2),
    c_api_p_comercial           numeric(14, 2),
    c_api_valor_anual           numeric(14, 2),
    c_aqui_q_cultura            integer,
    c_bub_quantidade            integer,
    c_bub_p_autoconsumo         numeric(14, 2),
    c_bub_p_comercial           numeric(14, 2),
    c_bub_valor_anual           numeric(14, 2),
    c_bub_l_p_total             numeric(14, 2),
    c_bub_l_p_autoconsumo       numeric(14, 2),
    c_bub_l_p_comercial         numeric(14, 2),
    c_bub_l_valor_anual         numeric(14, 2),
    iuf_conj_n_municipio_int    integer
        constraint fk_municipio_ibge_iuf_conj_n_municipio_int
            references familias_aux.municipio_ibge,
    iuf_ocup_n_municipio_int    integer
        constraint fk_municipio_ibge_iuf_ocup_n_municipio_int
            references familias_aux.municipio_ibge,
    ii_titulo_quitado           integer
        references familias_aux.sim_nao_informar_isento,
    ii_titulo_baixa             integer
        references familias_aux.sim_nao_informar,
    meta_instance_name          varchar,
    obs_10                      varchar,
    documento_entrevista_remota varchar
);

alter table familias.familias_individual
    owner to postgres;

grant usage on sequence familias.familias_individual_id_seq to pinovara;

grant insert, select, update on familias.familias_individual to pinovara;

create table if not exists familias.familias_individual_progsocial
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.prog_governamental,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_progsocial
    owner to postgres;

grant usage on sequence familias.familias_individual_progsocial_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_progsocial to pinovara;

create table if not exists familias.familias_individual_saneamento
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.saneamento_basico,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_saneamento
    owner to postgres;

grant usage on sequence familias.familias_individual_saneamento_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_saneamento to pinovara;

create table if not exists familias.familias_individual_agua
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.agua,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_agua
    owner to postgres;

grant usage on sequence familias.familias_individual_agua_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_agua to pinovara;

create table if not exists familias.familias_individual_pa_a_vegetal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.producao_vegetal,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_pa_a_vegetal
    owner to postgres;

grant usage on sequence familias.familias_individual_pa_a_vegetal_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_pa_a_vegetal to pinovara;

create table if not exists familias.familias_individual_pa_a_animal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.autoconsumo_animal,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_pa_a_animal
    owner to postgres;

grant usage on sequence familias.familias_individual_pa_a_animal_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_pa_a_animal to pinovara;

create table if not exists familias.familias_individual_pa_comercial
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.atividade_comercial,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_pa_comercial
    owner to postgres;

grant usage on sequence familias.familias_individual_pa_comercial_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_pa_comercial to pinovara;

create table if not exists familias.familias_individual_pa_c_animal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.producao_animal,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_pa_c_animal
    owner to postgres;

grant usage on sequence familias.familias_individual_pa_c_animal_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_pa_c_animal to pinovara;

create table if not exists familias.familias_individual_pa_c_vegetal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.producao_vegetal,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_pa_c_vegetal
    owner to postgres;

grant usage on sequence familias.familias_individual_pa_c_vegetal_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_pa_c_vegetal to pinovara;

create table if not exists familias.familias_individual_benfeitorias
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.benfeitorias,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_benfeitorias
    owner to postgres;

grant usage on sequence familias.familias_individual_benfeitorias_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_benfeitorias to pinovara;

create table if not exists familias.familias_individual_nucleo
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    nome                  varchar,
    g_parentesco          integer
        references familias_aux.grau_parentesco,
    g_parentesco_outro    varchar,
    sexo                  integer
        references familias_aux.sexo,
    d_nascimento          date,
    idade                 smallint,
    id_familias             integer
        references familias.familias_individual
);

alter table familias.familias_individual_nucleo
    owner to postgres;

grant usage on sequence familias.familias_individual_nucleo_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_nucleo to pinovara;

create table if not exists familias.familias_individual_socioprodutiva
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    tipo                  integer
        references familias_aux.tipo_socioprodutiva,
    tipo_outro            varchar,
    nome                  varchar,
    localizacao           integer
        references familias_aux.localizacao_socioprodutiva,
    id_familias             integer
        references familias.familias_individual
);

alter table familias.familias_individual_socioprodutiva
    owner to postgres;

grant usage on sequence familias.familias_individual_socioprodutiva_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_socioprodutiva to pinovara;

create table if not exists familias.familias_individual_fotos
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    grupo                 integer
        references familias_aux.grupo_foto,
    producao              integer
        references familias_aux.producao_foto,
    foto                  varchar,
    foto_obs              varchar,
    id_familias             integer
        references familias.familias_individual,
    data_hora_inserido    timestamp,
    data_hora_alterado    timestamp,
    gps_lat               double precision,
    gps_lng               double precision,
    gps_acc               double precision,
    gps_alt               double precision,
    producao_vegetal      integer
        references familias_aux.producao_vegetal
);

alter table familias.familias_individual_fotos
    owner to postgres;

grant usage on sequence familias.familias_individual_fotos_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_fotos to pinovara;

create table if not exists familias.familias_individual_c_bovl_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bovl_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_bovc_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bovc_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_sui_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_sui_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_avic_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_avic_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_avip_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_avip_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_ovi_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_ovi_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_cap_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_cap_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_api_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_api_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_bub_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bub_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_bub_l_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bub_l_canal
    owner to pinovara;

create table if not exists familias.familias_individual_c_bovl_reproducao
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.reproducao_bovinocultura,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bovl_reproducao
    owner to pinovara;

create table if not exists familias.familias_individual_c_bovc_reproducao
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.reproducao_bovinocultura,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bovc_reproducao
    owner to pinovara;

create table if not exists familias.familias_individual_c_bovc_sistcriacao
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.sistcriacao_bovinocultura,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bovc_sistcriacao
    owner to pinovara;

create table if not exists familias.familias_individual_c_sui_sistcriacao
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.sistcriacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_sui_sistcriacao
    owner to pinovara;

create table if not exists familias.familias_individual_c_sui_compalimentar
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.complementacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_sui_compalimentar
    owner to pinovara;

create table if not exists familias.familias_individual_c_avic_compalimentar
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.complementacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_avic_compalimentar
    owner to pinovara;

create table if not exists familias.familias_individual_c_avip_compalimentar
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.complementacao,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_avip_compalimentar
    owner to pinovara;

create table if not exists familias.familias_individual_c_bovl_compalimentar
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.complementacao_prodanimal,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bovl_compalimentar
    owner to pinovara;

create table if not exists familias.familias_individual_c_bovc_compalimentar
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.complementacao_prodanimal,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_bovc_compalimentar
    owner to pinovara;

create table if not exists familias.familias_individual_c_ovi_compalimentar
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.complementacao_prodanimal,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_ovi_compalimentar
    owner to pinovara;

create table if not exists familias.familias_individual_c_cap_compalimentar
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.complementacao_prodanimal,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_c_cap_compalimentar
    owner to pinovara;

create table if not exists familias.familias_individual_piscicultura
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    especie               integer
        references familias_aux.piscicultura_especie,
    especie_outros        varchar,
    tipo                  integer
        references familias_aux.piscicultura_tipo,
    manejo                integer
        references familias_aux.piscicultura_manejo,
    sistema_despesca      integer
        references familias_aux.piscicultura_pastoreio,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_familias             integer
        references familias.familias_individual
);

alter table familias.familias_individual_piscicultura
    owner to pinovara;

create table if not exists familias.familias_individual_piscicultura_compalimentar
(
    id                    serial
        constraint familias_c_pis_compalimentar_pkey
            primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        constraint familias_c_pis_compalimentar_valor_fkey
            references familias_aux.piscicultura_complementacao,
    id_piscicultura       integer not null
        constraint familias_c_pis_compalimentar_id_piscicultura_fkey
            references familias.familias_individual_piscicultura
);

alter table familias.familias_individual_piscicultura_compalimentar
    owner to pinovara;

create table if not exists familias.familias_individual_piscicultura_finalidade
(
    id                    serial
        constraint familias_c_pis_finalidade_pkey
            primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        constraint familias_c_pis_finalidade_valor_fkey
            references familias_aux.piscicultura_finalidade,
    id_piscicultura       integer not null
        constraint familias_c_pis_finalidade_id_piscicultura_fkey
            references familias.familias_individual_piscicultura
);

alter table familias.familias_individual_piscicultura_finalidade
    owner to pinovara;

create table if not exists familias.familias_individual_piscicultura_canal
(
    id                    serial
        constraint familias_c_pis_canal_pkey
            primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        constraint familias_c_pis_canal_valor_fkey
            references familias_aux.canal_comercializacao,
    id_piscicultura       integer not null
        constraint familias_c_pis_canal_id_piscicultura_fkey
            references familias.familias_individual_piscicultura
);

alter table familias.familias_individual_piscicultura_canal
    owner to pinovara;

create table if not exists familias.familias_individual_aquicultura
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    cultura               integer
        references familias_aux.aquicultura,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_familias             integer
        references familias.familias_individual
);

alter table familias.familias_individual_aquicultura
    owner to pinovara;

create table if not exists familias.familias_individual_aquicultura_canal
(
    id                    serial
        constraint familias_c_aqui_canal_pkey
            primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        constraint familias_c_aqui_canal_valor_fkey
            references familias_aux.canal_comercializacao,
    id_aquicultura        integer not null
        constraint familias_c_aqui_canal_id_aquicultura_fkey
            references familias.familias_individual_aquicultura
);

alter table familias.familias_individual_aquicultura_canal
    owner to pinovara;

create table if not exists familias.familias_individual_proc_alimentos
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    categoria             integer
        references familias_aux.proc_alimentos_categoria,
    categoria_outros      varchar,
    agroindustria         integer
        references familias_aux.sim_nao,
    produto               varchar,
    unidade               integer
        references familias_aux.unidade,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_familias             integer
        references familias.familias_individual
);

alter table familias.familias_individual_proc_alimentos
    owner to pinovara;

create table if not exists familias.familias_individual_proc_alimentos_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_proc_alimentos     integer not null
        references familias.familias_individual_proc_alimentos
);

alter table familias.familias_individual_proc_alimentos_canal
    owner to pinovara;

create table if not exists familias.familias_individual_proc_alimentos_regsanitario
(
    id                    serial
        constraint familias_c_procali_regsanitario_pkey
            primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        constraint familias_c_procali_regsanitario_valor_fkey
            references familias_aux.proc_alimentos_reg_sanitario,
    id_proc_alimentos     integer not null
        constraint familias_c_procali_regsanitario_id_proc_alimentos_fkey
            references familias.familias_individual_proc_alimentos
);

alter table familias.familias_individual_proc_alimentos_regsanitario
    owner to pinovara;

create table if not exists familias.familias_individual_proc_alimentos_matprima
(
    id                    serial
        constraint familias_c_procali_matprima_pkey
            primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        constraint familias_c_procali_matprima_valor_fkey
            references familias_aux.proc_alimentos_fonte_materia,
    id_proc_alimentos     integer not null
        constraint familias_c_procali_matprima_id_proc_alimentos_fkey
            references familias.familias_individual_proc_alimentos
);

alter table familias.familias_individual_proc_alimentos_matprima
    owner to pinovara;

create table if not exists familias.familias_individual_cultura
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    cultura               integer
        references familias_aux.producao_vegetal,
    cultura_outros        varchar,
    formacao              integer
        references familias_aux.sim_nao,
    semente_muda          integer
        references familias_aux.semente_muda,
    propria_comprada      integer
        references familias_aux.propria_comprada,
    crioula               integer
        references familias_aux.sn_crioula,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_familias             integer
        references familias.familias_individual
);

alter table familias.familias_individual_cultura
    owner to pinovara;

create table if not exists familias.familias_individual_cultura_canal
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.canal_comercializacao,
    id_cultura            integer not null
        references familias.familias_individual_cultura
);

alter table familias.familias_individual_cultura_canal
    owner to pinovara;

create table if not exists familias.familias_individual_extrativismo
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    extracao              integer
        references familias_aux.extracao,
    produto_animal        integer
        references familias_aux.extrativismo_animal,
    produto_vegetal       integer
        references familias_aux.extrativismo_vegetal,
    produto_outros        varchar,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_familias             integer
        references familias.familias_individual
);

alter table familias.familias_individual_extrativismo
    owner to pinovara;

create table if not exists familias.familias_individual_ii_d_comprobatoria
(
    id                    serial
        primary key,
    _uri                  varchar(80),
    _creator_uri_user     varchar(80),
    _creation_date        timestamp,
    _last_update_uri_user varchar(80),
    _last_update_date     timestamp,
    _parent_auri          varchar(80),
    _ordinal_number       integer,
    _top_level_auri       varchar(80),
    valor                 integer
        references familias_aux.doc_comprobatoria,
    id_familias             integer not null
        references familias.familias_individual
);

alter table familias.familias_individual_ii_d_comprobatoria
    owner to postgres;

grant usage on sequence familias.familias_individual_ii_d_comprobatoria_id_seq to pinovara;

grant delete, insert, references, select, trigger, truncate, update on familias.familias_individual_ii_d_comprobatoria to pinovara;

