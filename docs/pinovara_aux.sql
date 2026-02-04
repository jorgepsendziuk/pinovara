-- ============================================
-- DDL para criação dos schemas e permissões
-- ============================================

-- Criar schema familias_aux
CREATE SCHEMA IF NOT EXISTS familias_aux;

-- Conceder permissões de uso no schema para o usuário pinovara
GRANT USAGE ON SCHEMA familias_aux TO pinovara;

-- Conceder permissões padrão para objetos futuros no schema
ALTER DEFAULT PRIVILEGES IN SCHEMA familias_aux GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pinovara;
ALTER DEFAULT PRIVILEGES IN SCHEMA familias_aux GRANT USAGE, SELECT ON SEQUENCES TO pinovara;

-- ============================================
-- Tabelas do schema familias_aux
-- ============================================

create table familias_aux.aceitou_visita
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.aceitou_visita
    owner to postgres;

grant insert, select, update on familias_aux.aceitou_visita to pinovara;

create table familias_aux.sim_nao
(
    id        integer not null
        primary key,
    descricao char(3),
    id_text   char(3)
);

alter table familias_aux.sim_nao
    owner to postgres;

grant insert, select, update on familias_aux.sim_nao to pinovara;

create table familias_aux.estado
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

create table familias_aux.grau_parentesco
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.grau_parentesco
    owner to postgres;

grant insert, select, update on familias_aux.grau_parentesco to pinovara;

create table familias_aux.sexo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sexo
    owner to postgres;

grant insert, select, update on familias_aux.sexo to pinovara;

create table familias_aux.tipo_socioprodutiva
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tipo_socioprodutiva
    owner to postgres;

grant insert, select, update on familias_aux.tipo_socioprodutiva to pinovara;

create table familias_aux.localizacao_socioprodutiva
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.localizacao_socioprodutiva
    owner to postgres;

grant insert, select, update on familias_aux.localizacao_socioprodutiva to pinovara;

create table familias_aux.agua
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.agua
    owner to postgres;

grant insert, select, update on familias_aux.agua to pinovara;

create table familias_aux.saneamento_basico
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.saneamento_basico
    owner to postgres;

grant insert, select, update on familias_aux.saneamento_basico to pinovara;

create table familias_aux.benfeitorias
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.benfeitorias
    owner to postgres;

grant insert, select, update on familias_aux.benfeitorias to pinovara;

create table familias_aux.estado_civil
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.estado_civil
    owner to postgres;

grant insert, select, update on familias_aux.estado_civil to pinovara;

create table familias_aux.prog_governamental
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.prog_governamental
    owner to postgres;

grant insert, select, update on familias_aux.prog_governamental to pinovara;

create table familias_aux.renda_lote
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.renda_lote
    owner to postgres;

grant insert, select, update on familias_aux.renda_lote to pinovara;

create table familias_aux.renda_porcentagem
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.renda_porcentagem
    owner to postgres;

grant insert, select, update on familias_aux.renda_porcentagem to pinovara;

create table familias_aux.zona_localizacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.zona_localizacao
    owner to postgres;

grant insert, select, update on familias_aux.zona_localizacao to pinovara;

create table familias_aux.nacionalidade
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.nacionalidade
    owner to postgres;

grant insert, select, update on familias_aux.nacionalidade to pinovara;

create table familias_aux.quem_assinatura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.quem_assinatura
    owner to postgres;

grant insert, select, update on familias_aux.quem_assinatura to pinovara;

create table familias_aux.tp_docind
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tp_docind
    owner to postgres;

grant insert, select, update on familias_aux.tp_docind to pinovara;

create table familias_aux.regime_bens
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.regime_bens
    owner to postgres;

grant insert, select, update on familias_aux.regime_bens to pinovara;

create table familias_aux.doc_orgaopublico
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.doc_orgaopublico
    owner to postgres;

grant insert, select, update on familias_aux.doc_orgaopublico to pinovara;

create table familias_aux.condicao_acesso
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.condicao_acesso
    owner to postgres;

grant insert, select, update on familias_aux.condicao_acesso to pinovara;

create table familias_aux.declarada_medida
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.declarada_medida
    owner to postgres;

grant insert, select, update on familias_aux.declarada_medida to pinovara;

create table familias_aux.descarte_residuo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.descarte_residuo
    owner to postgres;

grant insert, select, update on familias_aux.descarte_residuo to pinovara;

create table familias_aux.doc_comprobatoria
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.doc_comprobatoria
    owner to postgres;

grant insert, select, update on familias_aux.doc_comprobatoria to pinovara;

create table familias_aux.ocupante_antecessor
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.ocupante_antecessor
    owner to postgres;

grant insert, select, update on familias_aux.ocupante_antecessor to pinovara;

create table familias_aux.ocupante_conjuge
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.ocupante_conjuge
    owner to postgres;

grant insert, select, update on familias_aux.ocupante_conjuge to pinovara;

create table familias_aux.atividade_comercial
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.atividade_comercial
    owner to postgres;

grant insert, select, update on familias_aux.atividade_comercial to pinovara;

create table familias_aux.producao_animal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.producao_animal
    owner to postgres;

grant insert, select, update on familias_aux.producao_animal to pinovara;

create table familias_aux.grupo_foto
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.grupo_foto
    owner to postgres;

grant insert, select, update on familias_aux.grupo_foto to pinovara;

create table familias_aux.producao_foto
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.producao_foto
    owner to postgres;

grant insert, select, update on familias_aux.producao_foto to pinovara;

create table familias_aux.municipio_ibge
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

create table familias_aux.gleba
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

create table familias_aux.validacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.validacao
    owner to postgres;

grant insert, select, update on familias_aux.validacao to pinovara;

create table familias_aux.fr_r_doc
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.fr_r_doc
    owner to postgres;

grant insert, select, update on familias_aux.fr_r_doc to pinovara;

create table familias_aux.correcao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.correcao
    owner to postgres;

grant insert, select, update on familias_aux.correcao to pinovara;

create table familias_aux.validacao_estagiario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.validacao_estagiario
    owner to postgres;

grant insert, select, update on familias_aux.validacao_estagiario to pinovara;

create table familias_aux.profissao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.profissao
    owner to postgres;

grant insert, select, update on familias_aux.profissao to pinovara;

create table familias_aux.formulario_completo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.formulario_completo
    owner to pinovara;

create table familias_aux.sim_nao_sabe
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sim_nao_sabe
    owner to pinovara;

create table familias_aux.classificacao_alimento
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.classificacao_alimento
    owner to postgres;

create table familias_aux.producao_vegetal
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

create table familias_aux.autoconsumo_animal
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

create table familias_aux.gleba_bkp
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

create table familias_aux.unidade
(
    id        integer not null
        primary key,
    descricao varchar,
    id_texto  varchar
);

alter table familias_aux.unidade
    owner to pinovara;

create table familias_aux.tipo_formulario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tipo_formulario
    owner to pinovara;

create table familias_aux.sn_crioula
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sn_crioula
    owner to pinovara;

create table familias_aux.canal_comercializacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.canal_comercializacao
    owner to pinovara;

create table familias_aux.complementacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.complementacao
    owner to pinovara;

create table familias_aux.complementacao_prodanimal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.complementacao_prodanimal
    owner to pinovara;

create table familias_aux.tipo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tipo_producao
    owner to pinovara;

create table familias_aux.reproducao_bovinocultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.reproducao_bovinocultura
    owner to pinovara;

create table familias_aux.sistcriacao_bovinocultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sistcriacao_bovinocultura
    owner to pinovara;

create table familias_aux.sistcriacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sistcriacao
    owner to pinovara;

create table familias_aux.piscicultura_finalidade
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_finalidade
    owner to pinovara;

create table familias_aux.piscicultura_tipo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_tipo
    owner to pinovara;

create table familias_aux.piscicultura_manejo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_manejo
    owner to pinovara;

create table familias_aux.piscicultura_pastoreio
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_pastoreio
    owner to pinovara;

create table familias_aux.piscicultura_complementacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_complementacao
    owner to pinovara;

create table familias_aux.piscicultura_especie
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.piscicultura_especie
    owner to pinovara;

create table familias_aux.aquicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.aquicultura
    owner to pinovara;

create table familias_aux.proc_alimentos_categoria
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.proc_alimentos_categoria
    owner to pinovara;

create table familias_aux.proc_alimentos_reg_sanitario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.proc_alimentos_reg_sanitario
    owner to pinovara;

create table familias_aux.proc_alimentos_fonte_materia
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.proc_alimentos_fonte_materia
    owner to pinovara;

create table familias_aux.semente_muda
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.semente_muda
    owner to pinovara;

create table familias_aux.propria_comprada
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.propria_comprada
    owner to pinovara;

create table familias_aux.manejo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.manejo_producao
    owner to pinovara;

create table familias_aux.pastoreio_prodanimal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.pastoreio_prodanimal
    owner to pinovara;

create table familias_aux.pastoreio
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.pastoreio
    owner to pinovara;

create table familias_aux.periodo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.periodo_producao
    owner to pinovara;

create table familias_aux.tipo_apicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.tipo_apicultura
    owner to pinovara;

create table familias_aux.manejo_apicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.manejo_apicultura
    owner to pinovara;

create table familias_aux.extracao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.extracao
    owner to pinovara;

create table familias_aux.extrativismo_animal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.extrativismo_animal
    owner to pinovara;

create table familias_aux.extrativismo_vegetal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.extrativismo_vegetal
    owner to pinovara;

create table familias_aux.sim_nao_informar
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sim_nao_informar
    owner to pinovara;

create table familias_aux.sim_nao_informar_isento
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table familias_aux.sim_nao_informar_isento
    owner to pinovara;




