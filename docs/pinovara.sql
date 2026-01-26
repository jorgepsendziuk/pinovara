create table pinovara.pinovara_individual
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
        references pinovara_aux.ocupante_conjuge,
    obs_gerais                  varchar,
    iuf_conj_d_nascimento       date,
    iuf_conj_conhecido          varchar,
    iuf_ocup_sexo               integer
        references pinovara_aux.sexo,
    rrf_oc_crime_quem           integer
        references pinovara_aux.ocupante_conjuge,
    iuf_ocup_nd_uf              integer
        references pinovara_aux.estado,
    iuf_ocup_n_estado           integer
        references pinovara_aux.estado,
    san_comeu_menos             integer
        references pinovara_aux.sim_nao,
    ii_fr_regularizacao         integer
        references pinovara_aux.sim_nao,
    iuf_conj_profissao          integer
        references pinovara_aux.profissao,
    gps_acc                     double precision,
    sb_d_residuo                integer
        references pinovara_aux.descarte_residuo,
    iuf_conj_d_casamento        date,
    rrf_eo_forma                integer
        references pinovara_aux.sim_nao,
    ii_declarada_medida         integer
        references pinovara_aux.declarada_medida,
    ii_d_certific               varchar,
    ii_d_cc_ccdru               integer
        references pinovara_aux.sim_nao,
    iuf_conj_r_bens             integer
        references pinovara_aux.regime_bens,
    san_diminuiu                integer
        references pinovara_aux.sim_nao,
    iuf_conj_nd_tipo            integer
        references pinovara_aux.tp_docind,
    iuf_conj_nd_identidade      varchar,
    san_consome                 integer
        references pinovara_aux.sim_nao,
    ec_bairro                   varchar,
    iuf_conj_nd_uf              integer
        references pinovara_aux.estado,
    a_q_conjuge                 integer
        references pinovara_aux.quem_assinatura,
    iuf_conj_n_mae              varchar,
    iuf_prop_nome               varchar,
    ii_georreferenciada         integer
        references pinovara_aux.sim_nao,
    iuf_conj_tel1               varchar,
    iuf_conj_tel2               varchar,
    p_socioprodutiva            integer
        references pinovara_aux.sim_nao,
    rrf_oc_crime                integer
        references pinovara_aux.sim_nao,
    ec_logrado                  varchar,
    san_sem_dinheiro            integer
        references pinovara_aux.sim_nao,
    ir_f_p_social_outro         varchar,
    rrf_ed_anterior_quem        integer
        references pinovara_aux.ocupante_antecessor,
    inicio                      timestamp,
    iuf_ocup_d_casamento        date,
    iuf_conj_nd_orgao           varchar,
    iuf_desc_acesso             varchar,
    ec_cep                      varchar,
    iuf_ocup_profissao          integer
        references pinovara_aux.profissao,
    iuf_ocup_conhecido          varchar,
    iuf_ocup_d_nascimento       date,
    ii_d_sncr                   varchar,
    iuf_ocup_nd_identidade      varchar,
    ii_r_st                     varchar,
    ii_d_comprobatoria          integer
        references pinovara_aux.doc_comprobatoria,
    rrf_oc_beneficiado          integer
        references pinovara_aux.sim_nao,
    iuf_ocup_nd_tipo            integer
        references pinovara_aux.tp_docind,
    gps_lng                     double precision,
    ii_d_cc_td                  integer
        references pinovara_aux.sim_nao,
    meta_instance_id            varchar,
    a_o_r_cpf                   varchar(11),
    ii_d_orgaopublico           integer
        references pinovara_aux.doc_orgaopublico,
    ir_r_e_lote                 integer
        references pinovara_aux.renda_lote,
    ii_vm_fiscal                numeric(10, 4),
    iuf_ocup_idade              integer,
    iuf_conj_n_municipio        varchar,
    a_o_r_nome                  varchar,
    ec_uf                       integer
        references pinovara_aux.estado,
    ii_d_comprobatoria_outros   varchar,
    ir_r_bruta                  integer
        references pinovara_aux.renda_lote,
    ir_f_p_social               integer
        references pinovara_aux.sim_nao,
    estado                      integer
        references pinovara_aux.estado,
    ii_do_originaria            date,
    rrf_oc_proprietario_quem    integer
        references pinovara_aux.ocupante_conjuge,
    ii_p_principal              varchar,
    num_imovel                  varchar,
    iuf_conj_idade              integer,
    rrf_eo_direta               integer
        references pinovara_aux.sim_nao,
    aceitou_visita              integer
        references pinovara_aux.aceitou_visita,
    iuf_ocup_tel2               varchar,
    comunidade                  varchar,
    iuf_ocup_tel1               varchar,
    iuf_conj_nome               varchar,
    municipio                   integer
        references pinovara_aux.municipio_ibge,
    cod_gleba                   integer
        references pinovara_aux.gleba,
    deviceid                    varchar,
    sb_d_residuo_outro          varchar,
    iuf_ocup_email              varchar,
    a_c_r_nome                  varchar,
    a_c_r_cpf                   varchar(11),
    iuf_ocup_cpf                varchar(11),
    ec_complem                  varchar,
    san_preocupacao             integer
        references pinovara_aux.sim_nao,
    gps_alt                     double precision,
    ii_o_primitivo              integer
        references pinovara_aux.sim_nao,
    gps_lat                     double precision,
    n_moradores                 integer,
    soma_area_digitada          varchar,
    iuf_conj_nacionalidade      integer
        references pinovara_aux.nacionalidade,
    iuf_conj_cpf                varchar(11),
    sb_agua_suficiente          integer
        references pinovara_aux.sim_nao,
    iuf_ocup_nacionalidade      integer
        references pinovara_aux.nacionalidade,
    ec_zona                     integer
        references pinovara_aux.zona_localizacao,
    rrf_oc_escravo              integer
        references pinovara_aux.sim_nao,
    iuf_ocup_telefone           varchar,
    iuf_ocup_nd_orgao           varchar,
    iuf_ocup_n_mae              varchar,
    rrf_oc_beneficiado_quem     integer
        references pinovara_aux.ocupante_conjuge,
    iuf_ocup_n_municipio        varchar,
    rrf_p_cultura               integer
        references pinovara_aux.sim_nao,
    modulo_fiscal               integer,
    iuf_conj_n_estado           integer
        references pinovara_aux.estado,
    rrf_ed_anterior             integer
        references pinovara_aux.sim_nao,
    ii_ai_matricula             numeric(16, 4),
    iuf_ocup_r_bens             integer
        references pinovara_aux.regime_bens,
    san_orientacao              integer
        references pinovara_aux.sim_nao,
    rrf_oc_proprietario         integer
        references pinovara_aux.sim_nao,
    ii_car_protocolo            varchar,
    qa_a_degradada              numeric(16, 4),
    iuf_ocup_e_civil            integer
        references pinovara_aux.estado_civil,
    iuf_conj_sexo               integer
        references pinovara_aux.sexo,
    san_acabou                  integer
        references pinovara_aux.sim_nao,
    ii_c_acesso                 integer
        references pinovara_aux.condicao_acesso,
    sb_moradia_outro            varchar,
    n_contador                  integer,
    ii_d_orgaopublico_outros    varchar,
    ec_numero                   varchar,
    rrf_oc_cargo                integer
        references pinovara_aux.sim_nao,
    qa_a_p_nativa               numeric(16, 4),
    tem_nome                    integer
        references pinovara_aux.sim_nao,
    qa_a_p_plantada             numeric(16, 4),
    qa_a_florestada             numeric(16, 4),
    qa_a_pousio                 numeric(16, 4),
    qa_a_p_proprio              numeric(16, 4),
    ii_car_possui               integer
        references pinovara_aux.sim_nao,
    qa_a_m_nativa               numeric(16, 4),
    qa_a_sede                   numeric(16, 4),
    ii_din_urbano               numeric(8, 2),
    ec_cod_ibg                  integer
        references pinovara_aux.municipio_ibge,
    ii_d_possui                 integer
        references pinovara_aux.sim_nao,
    iuf_conj_email              varchar,
    fim                         timestamp,
    iuf_ocup_endereco           varchar,
    sb_agua_outro               varchar,
    iuf_ocup_nome               varchar,
    iuf_conj_e_civil            integer
        references pinovara_aux.estado_civil,
    a_q_ocupante                integer
        references pinovara_aux.quem_assinatura,
    a_entrevistador             varchar,
    a_ocupante                  varchar,
    a_o_r_documento             varchar,
    a_conjuge                   varchar,
    a_c_r_documento             varchar,
    removido                    boolean default false,
    validacao                   integer default 2
        references pinovara_aux.validacao,
    obs_validacao               varchar,
    tecnico                     integer
        references public.system_users,
    data_hora_alterado          timestamp,
    data_hora_validado          timestamp,
    ii_fr_r_doc                 integer
        references pinovara_aux.fr_r_doc,
    ii_fr_r_doc_outro           varchar,
    corrigido                   integer
        references pinovara_aux.correcao,
    justificativa               varchar,
    estagiario                  integer,
    validacao_estagiario        integer default 2
        references pinovara_aux.validacao_estagiario,
    ii_do_atual                 date,
    iuf_conj_profissao_outros   varchar,
    iuf_ocup_profissao_outros   varchar,
    benfeitorias_outros         varchar,
    validacao_2                 integer,
    formulario_completo         integer default 1,
    san_tiveram_preocupacao     integer
        references pinovara_aux.sim_nao_sabe,
    san_acabaram_antes          integer
        references pinovara_aux.sim_nao_sabe,
    san_ficaram_sem             integer
        references pinovara_aux.sim_nao_sabe,
    san_comeram_pouco           integer
        references pinovara_aux.sim_nao_sabe,
    san_deixou_refeicao         integer
        references pinovara_aux.sim_nao_sabe,
    san_comeu_menos_devia       integer
        constraint pinovara_comeu_menos_devia_fkey
            references pinovara_aux.sim_nao_sabe,
    san_sentiu_fome             integer
        references pinovara_aux.sim_nao_sabe,
    san_uma_refeicao            integer
        references pinovara_aux.sim_nao_sabe,
    san_refeicao_completa       integer
        references pinovara_aux.sim_nao_sabe,
    san_orientacao_profissional integer
        references pinovara_aux.sim_nao_sabe,
    iuf_ocup_aposentado         integer
        references pinovara_aux.sim_nao_sabe,
    iuf_conj_aposentado         integer
        references pinovara_aux.sim_nao_sabe,
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
        references pinovara_aux.tipo_formulario,
    existe_numimovel            integer
        references pinovara_aux.sim_nao,
    ii_titulo_definitivo        integer
        references pinovara_aux.sim_nao_informar,
    ii_linha_credito            integer
        references pinovara_aux.sim_nao,
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
            references pinovara_aux.municipio_ibge,
    iuf_ocup_n_municipio_int    integer
        constraint fk_municipio_ibge_iuf_ocup_n_municipio_int
            references pinovara_aux.municipio_ibge,
    ii_titulo_quitado           integer
        references pinovara_aux.sim_nao_informar_isento,
    ii_titulo_baixa             integer
        references pinovara_aux.sim_nao_informar,
    meta_instance_name          varchar,
    obs_10                      varchar,
    documento_entrevista_remota varchar
);

alter table pinovara.pinovara_individual
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_id_seq to sistema;

grant insert, select, update on pinovara.pinovara_individual to sistema;

create table pinovara.pinovara_individual_progsocial
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
        references pinovara_aux.prog_governamental,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_progsocial
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_progsocial_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_progsocial to sistema;

create table pinovara.pinovara_individual_saneamento
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
        references pinovara_aux.saneamento_basico,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_saneamento
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_saneamento_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_saneamento to sistema;

create table pinovara.pinovara_individual_agua
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
        references pinovara_aux.agua,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_agua
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_agua_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_agua to sistema;

create table pinovara.pinovara_individual_pa_a_vegetal
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
        references pinovara_aux.producao_vegetal,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_pa_a_vegetal
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_pa_a_vegetal_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_pa_a_vegetal to sistema;

create table pinovara.pinovara_individual_pa_a_animal
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
        references pinovara_aux.autoconsumo_animal,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_pa_a_animal
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_pa_a_animal_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_pa_a_animal to sistema;

create table pinovara.pinovara_individual_pa_comercial
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
        references pinovara_aux.atividade_comercial,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_pa_comercial
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_pa_comercial_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_pa_comercial to sistema;

create table pinovara.pinovara_individual_pa_c_animal
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
        references pinovara_aux.producao_animal,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_pa_c_animal
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_pa_c_animal_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_pa_c_animal to sistema;

create table pinovara.pinovara_individual_pa_c_vegetal
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
        references pinovara_aux.producao_vegetal,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_pa_c_vegetal
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_pa_c_vegetal_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_pa_c_vegetal to sistema;

create table pinovara.pinovara_individual_benfeitorias
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
        references pinovara_aux.benfeitorias,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_benfeitorias
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_benfeitorias_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_benfeitorias to sistema;

create table pinovara.pinovara_individual_nucleo
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
        references pinovara_aux.grau_parentesco,
    g_parentesco_outro    varchar,
    sexo                  integer
        references pinovara_aux.sexo,
    d_nascimento          date,
    idade                 smallint,
    id_pinovara             integer
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_nucleo
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_nucleo_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_nucleo to sistema;

create table pinovara.pinovara_individual_socioprodutiva
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
        references pinovara_aux.tipo_socioprodutiva,
    tipo_outro            varchar,
    nome                  varchar,
    localizacao           integer
        references pinovara_aux.localizacao_socioprodutiva,
    id_pinovara             integer
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_socioprodutiva
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_socioprodutiva_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_socioprodutiva to sistema;

create table pinovara.pinovara_individual_fotos
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
        references pinovara_aux.grupo_foto,
    producao              integer
        references pinovara_aux.producao_foto,
    foto                  varchar,
    foto_obs              varchar,
    id_pinovara             integer
        references pinovara.pinovara_individual,
    data_hora_inserido    timestamp,
    data_hora_alterado    timestamp,
    gps_lat               double precision,
    gps_lng               double precision,
    gps_acc               double precision,
    gps_alt               double precision,
    producao_vegetal      integer
        references pinovara_aux.producao_vegetal
);

alter table pinovara.pinovara_individual_fotos
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_fotos_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_fotos to sistema;

create table pinovara.pinovara_individual_c_bovl_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bovl_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_bovc_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bovc_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_sui_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_sui_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_avic_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_avic_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_avip_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_avip_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_ovi_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_ovi_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_cap_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_cap_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_api_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_api_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_bub_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bub_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_bub_l_canal
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
        references pinovara_aux.canal_comercializacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bub_l_canal
    owner to sistema;

create table pinovara.pinovara_individual_c_bovl_reproducao
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
        references pinovara_aux.reproducao_bovinocultura,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bovl_reproducao
    owner to sistema;

create table pinovara.pinovara_individual_c_bovc_reproducao
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
        references pinovara_aux.reproducao_bovinocultura,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bovc_reproducao
    owner to sistema;

create table pinovara.pinovara_individual_c_bovc_sistcriacao
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
        references pinovara_aux.sistcriacao_bovinocultura,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bovc_sistcriacao
    owner to sistema;

create table pinovara.pinovara_individual_c_sui_sistcriacao
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
        references pinovara_aux.sistcriacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_sui_sistcriacao
    owner to sistema;

create table pinovara.pinovara_individual_c_sui_compalimentar
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
        references pinovara_aux.complementacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_sui_compalimentar
    owner to sistema;

create table pinovara.pinovara_individual_c_avic_compalimentar
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
        references pinovara_aux.complementacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_avic_compalimentar
    owner to sistema;

create table pinovara.pinovara_individual_c_avip_compalimentar
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
        references pinovara_aux.complementacao,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_avip_compalimentar
    owner to sistema;

create table pinovara.pinovara_individual_c_bovl_compalimentar
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
        references pinovara_aux.complementacao_prodanimal,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bovl_compalimentar
    owner to sistema;

create table pinovara.pinovara_individual_c_bovc_compalimentar
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
        references pinovara_aux.complementacao_prodanimal,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_bovc_compalimentar
    owner to sistema;

create table pinovara.pinovara_individual_c_ovi_compalimentar
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
        references pinovara_aux.complementacao_prodanimal,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_ovi_compalimentar
    owner to sistema;

create table pinovara.pinovara_individual_c_cap_compalimentar
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
        references pinovara_aux.complementacao_prodanimal,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_c_cap_compalimentar
    owner to sistema;

create table pinovara.pinovara_individual_piscicultura
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
        references pinovara_aux.piscicultura_especie,
    especie_outros        varchar,
    tipo                  integer
        references pinovara_aux.piscicultura_tipo,
    manejo                integer
        references pinovara_aux.piscicultura_manejo,
    sistema_despesca      integer
        references pinovara_aux.piscicultura_pastoreio,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_pinovara             integer
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_piscicultura
    owner to sistema;

create table pinovara.pinovara_individual_piscicultura_compalimentar
(
    id                    serial
        constraint pinovara_c_pis_compalimentar_pkey
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
        constraint pinovara_c_pis_compalimentar_valor_fkey
            references pinovara_aux.piscicultura_complementacao,
    id_piscicultura       integer not null
        constraint pinovara_c_pis_compalimentar_id_piscicultura_fkey
            references pinovara.pinovara_individual_piscicultura
);

alter table pinovara.pinovara_individual_piscicultura_compalimentar
    owner to sistema;

create table pinovara.pinovara_individual_piscicultura_finalidade
(
    id                    serial
        constraint pinovara_c_pis_finalidade_pkey
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
        constraint pinovara_c_pis_finalidade_valor_fkey
            references pinovara_aux.piscicultura_finalidade,
    id_piscicultura       integer not null
        constraint pinovara_c_pis_finalidade_id_piscicultura_fkey
            references pinovara.pinovara_individual_piscicultura
);

alter table pinovara.pinovara_individual_piscicultura_finalidade
    owner to sistema;

create table pinovara.pinovara_individual_piscicultura_canal
(
    id                    serial
        constraint pinovara_c_pis_canal_pkey
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
        constraint pinovara_c_pis_canal_valor_fkey
            references pinovara_aux.canal_comercializacao,
    id_piscicultura       integer not null
        constraint pinovara_c_pis_canal_id_piscicultura_fkey
            references pinovara.pinovara_individual_piscicultura
);

alter table pinovara.pinovara_individual_piscicultura_canal
    owner to sistema;

create table pinovara.pinovara_individual_aquicultura
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
        references pinovara_aux.aquicultura,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_pinovara             integer
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_aquicultura
    owner to sistema;

create table pinovara.pinovara_individual_aquicultura_canal
(
    id                    serial
        constraint pinovara_c_aqui_canal_pkey
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
        constraint pinovara_c_aqui_canal_valor_fkey
            references pinovara_aux.canal_comercializacao,
    id_aquicultura        integer not null
        constraint pinovara_c_aqui_canal_id_aquicultura_fkey
            references pinovara.pinovara_individual_aquicultura
);

alter table pinovara.pinovara_individual_aquicultura_canal
    owner to sistema;

create table pinovara.pinovara_individual_proc_alimentos
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
        references pinovara_aux.proc_alimentos_categoria,
    categoria_outros      varchar,
    agroindustria         integer
        references pinovara_aux.sim_nao,
    produto               varchar,
    unidade               integer
        references pinovara_aux.unidade,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_pinovara             integer
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_proc_alimentos
    owner to sistema;

create table pinovara.pinovara_individual_proc_alimentos_canal
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
        references pinovara_aux.canal_comercializacao,
    id_proc_alimentos     integer not null
        references pinovara.pinovara_individual_proc_alimentos
);

alter table pinovara.pinovara_individual_proc_alimentos_canal
    owner to sistema;

create table pinovara.pinovara_individual_proc_alimentos_regsanitario
(
    id                    serial
        constraint pinovara_c_procali_regsanitario_pkey
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
        constraint pinovara_c_procali_regsanitario_valor_fkey
            references pinovara_aux.proc_alimentos_reg_sanitario,
    id_proc_alimentos     integer not null
        constraint pinovara_c_procali_regsanitario_id_proc_alimentos_fkey
            references pinovara.pinovara_individual_proc_alimentos
);

alter table pinovara.pinovara_individual_proc_alimentos_regsanitario
    owner to sistema;

create table pinovara.pinovara_individual_proc_alimentos_matprima
(
    id                    serial
        constraint pinovara_c_procali_matprima_pkey
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
        constraint pinovara_c_procali_matprima_valor_fkey
            references pinovara_aux.proc_alimentos_fonte_materia,
    id_proc_alimentos     integer not null
        constraint pinovara_c_procali_matprima_id_proc_alimentos_fkey
            references pinovara.pinovara_individual_proc_alimentos
);

alter table pinovara.pinovara_individual_proc_alimentos_matprima
    owner to sistema;

create table pinovara.pinovara_individual_cultura
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
        references pinovara_aux.producao_vegetal,
    cultura_outros        varchar,
    formacao              integer
        references pinovara_aux.sim_nao,
    semente_muda          integer
        references pinovara_aux.semente_muda,
    propria_comprada      integer
        references pinovara_aux.propria_comprada,
    crioula               integer
        references pinovara_aux.sn_crioula,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_pinovara             integer
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_cultura
    owner to sistema;

create table pinovara.pinovara_individual_cultura_canal
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
        references pinovara_aux.canal_comercializacao,
    id_cultura            integer not null
        references pinovara.pinovara_individual_cultura
);

alter table pinovara.pinovara_individual_cultura_canal
    owner to sistema;

create table pinovara.pinovara_individual_extrativismo
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
        references pinovara_aux.extracao,
    produto_animal        integer
        references pinovara_aux.extrativismo_animal,
    produto_vegetal       integer
        references pinovara_aux.extrativismo_vegetal,
    produto_outros        varchar,
    p_total               numeric(14, 2),
    p_autoconsumo         numeric(14, 2),
    p_comercial           numeric(14, 2),
    valor_anual           numeric(14, 2),
    id_pinovara             integer
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_extrativismo
    owner to sistema;

create table pinovara.pinovara_individual_ii_d_comprobatoria
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
        references pinovara_aux.doc_comprobatoria,
    id_pinovara             integer not null
        references pinovara.pinovara_individual
);

alter table pinovara.pinovara_individual_ii_d_comprobatoria
    owner to postgres;

grant usage on sequence pinovara.pinovara_individual_ii_d_comprobatoria_id_seq to sistema;

grant delete, insert, references, select, trigger, truncate, update on pinovara.pinovara_individual_ii_d_comprobatoria to sistema;

