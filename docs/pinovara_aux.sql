create table pinovara_aux.aceitou_visita
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.aceitou_visita
    owner to postgres;

grant insert, select, update on pinovara_aux.aceitou_visita to sistema;

create table pinovara_aux.sim_nao
(
    id        integer not null
        primary key,
    descricao char(3),
    id_text   char(3)
);

alter table pinovara_aux.sim_nao
    owner to postgres;

grant insert, select, update on pinovara_aux.sim_nao to sistema;

create table pinovara_aux.estado
(
    id        integer not null
        primary key,
    descricao varchar,
    uf        char(2),
    id_unit   integer
);

alter table pinovara_aux.estado
    owner to postgres;

grant insert, select, update on pinovara_aux.estado to sistema;

create table pinovara_aux.grau_parentesco
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.grau_parentesco
    owner to postgres;

grant insert, select, update on pinovara_aux.grau_parentesco to sistema;

create table pinovara_aux.sexo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.sexo
    owner to postgres;

grant insert, select, update on pinovara_aux.sexo to sistema;

create table pinovara_aux.tipo_socioprodutiva
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.tipo_socioprodutiva
    owner to postgres;

grant insert, select, update on pinovara_aux.tipo_socioprodutiva to sistema;

create table pinovara_aux.localizacao_socioprodutiva
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.localizacao_socioprodutiva
    owner to postgres;

grant insert, select, update on pinovara_aux.localizacao_socioprodutiva to sistema;

create table pinovara_aux.agua
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.agua
    owner to postgres;

grant insert, select, update on pinovara_aux.agua to sistema;

create table pinovara_aux.saneamento_basico
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.saneamento_basico
    owner to postgres;

grant insert, select, update on pinovara_aux.saneamento_basico to sistema;

create table pinovara_aux.benfeitorias
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.benfeitorias
    owner to postgres;

grant insert, select, update on pinovara_aux.benfeitorias to sistema;

create table pinovara_aux.estado_civil
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.estado_civil
    owner to postgres;

grant insert, select, update on pinovara_aux.estado_civil to sistema;

create table pinovara_aux.prog_governamental
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.prog_governamental
    owner to postgres;

grant insert, select, update on pinovara_aux.prog_governamental to sistema;

create table pinovara_aux.renda_lote
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.renda_lote
    owner to postgres;

grant insert, select, update on pinovara_aux.renda_lote to sistema;

create table pinovara_aux.renda_porcentagem
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.renda_porcentagem
    owner to postgres;

grant insert, select, update on pinovara_aux.renda_porcentagem to sistema;

create table pinovara_aux.zona_localizacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.zona_localizacao
    owner to postgres;

grant insert, select, update on pinovara_aux.zona_localizacao to sistema;

create table pinovara_aux.nacionalidade
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.nacionalidade
    owner to postgres;

grant insert, select, update on pinovara_aux.nacionalidade to sistema;

create table pinovara_aux.quem_assinatura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.quem_assinatura
    owner to postgres;

grant insert, select, update on pinovara_aux.quem_assinatura to sistema;

create table pinovara_aux.tp_docind
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.tp_docind
    owner to postgres;

grant insert, select, update on pinovara_aux.tp_docind to sistema;

create table pinovara_aux.regime_bens
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.regime_bens
    owner to postgres;

grant insert, select, update on pinovara_aux.regime_bens to sistema;

create table pinovara_aux.doc_orgaopublico
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.doc_orgaopublico
    owner to postgres;

grant insert, select, update on pinovara_aux.doc_orgaopublico to sistema;

create table pinovara_aux.condicao_acesso
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.condicao_acesso
    owner to postgres;

grant insert, select, update on pinovara_aux.condicao_acesso to sistema;

create table pinovara_aux.declarada_medida
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.declarada_medida
    owner to postgres;

grant insert, select, update on pinovara_aux.declarada_medida to sistema;

create table pinovara_aux.descarte_residuo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.descarte_residuo
    owner to postgres;

grant insert, select, update on pinovara_aux.descarte_residuo to sistema;

create table pinovara_aux.doc_comprobatoria
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.doc_comprobatoria
    owner to postgres;

grant insert, select, update on pinovara_aux.doc_comprobatoria to sistema;

create table pinovara_aux.ocupante_antecessor
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.ocupante_antecessor
    owner to postgres;

grant insert, select, update on pinovara_aux.ocupante_antecessor to sistema;

create table pinovara_aux.ocupante_conjuge
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.ocupante_conjuge
    owner to postgres;

grant insert, select, update on pinovara_aux.ocupante_conjuge to sistema;

create table pinovara_aux.atividade_comercial
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.atividade_comercial
    owner to postgres;

grant insert, select, update on pinovara_aux.atividade_comercial to sistema;

create table pinovara_aux.producao_animal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.producao_animal
    owner to postgres;

grant insert, select, update on pinovara_aux.producao_animal to sistema;

create table pinovara_aux.grupo_foto
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.grupo_foto
    owner to postgres;

grant insert, select, update on pinovara_aux.grupo_foto to sistema;

create table pinovara_aux.producao_foto
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.producao_foto
    owner to postgres;

grant insert, select, update on pinovara_aux.producao_foto to sistema;

create table pinovara_aux.municipio_ibge
(
    id              integer not null
        primary key,
    descricao       varchar,
    id_estado       integer
        references pinovara_aux.estado,
    uf              char(2),
    modulo_fiscal integer
);

alter table pinovara_aux.municipio_ibge
    owner to postgres;

grant insert, select, update on pinovara_aux.municipio_ibge to sistema;

create table pinovara_aux.gleba
(
    id           integer not null
        primary key,
    descricao    varchar,
    municipio    varchar,
    id_municipio integer
        references pinovara_aux.municipio_ibge,
    estado       char(2),
    id_estado    integer
        references pinovara_aux.estado,
    pasta        varchar
);

alter table pinovara_aux.gleba
    owner to postgres;

grant insert, select, update on pinovara_aux.gleba to sistema;

create table pinovara_aux.validacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.validacao
    owner to postgres;

grant insert, select, update on pinovara_aux.validacao to sistema;

create table pinovara_aux.fr_r_doc
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.fr_r_doc
    owner to postgres;

grant insert, select, update on pinovara_aux.fr_r_doc to sistema;

create table pinovara_aux.correcao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.correcao
    owner to postgres;

grant insert, select, update on pinovara_aux.correcao to sistema;

create table pinovara_aux.validacao_estagiario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.validacao_estagiario
    owner to postgres;

grant insert, select, update on pinovara_aux.validacao_estagiario to sistema;

create table pinovara_aux.profissao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.profissao
    owner to postgres;

grant insert, select, update on pinovara_aux.profissao to sistema;

create table pinovara_aux.formulario_completo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.formulario_completo
    owner to sistema;

create table pinovara_aux.sim_nao_sabe
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.sim_nao_sabe
    owner to sistema;

create table pinovara_aux.classificacao_alimento
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.classificacao_alimento
    owner to postgres;

create table pinovara_aux.producao_vegetal
(
    id            integer not null
        primary key,
    descricao     varchar,
    classificacao integer
        references pinovara_aux.classificacao_alimento
);

alter table pinovara_aux.producao_vegetal
    owner to postgres;

grant insert, select, update on pinovara_aux.producao_vegetal to sistema;

create table pinovara_aux.autoconsumo_animal
(
    id            integer not null
        primary key,
    descricao     varchar,
    classificacao integer
        references pinovara_aux.classificacao_alimento
);

alter table pinovara_aux.autoconsumo_animal
    owner to postgres;

grant insert, select, update on pinovara_aux.autoconsumo_animal to sistema;

grant insert, select, update on pinovara_aux.classificacao_alimento to sistema;

create table pinovara_aux.gleba_bkp
(
    id           integer,
    descricao    varchar,
    municipio    varchar,
    id_municipio integer,
    estado       char(2),
    id_estado    integer,
    pasta        varchar
);

alter table pinovara_aux.gleba_bkp
    owner to postgres;

grant insert, select, update on pinovara_aux.gleba_bkp to sistema;

create table pinovara_aux.unidade
(
    id        integer not null
        primary key,
    descricao varchar,
    id_texto  varchar
);

alter table pinovara_aux.unidade
    owner to sistema;

create table pinovara_aux.tipo_formulario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.tipo_formulario
    owner to sistema;

create table pinovara_aux.sn_crioula
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.sn_crioula
    owner to sistema;

create table pinovara_aux.canal_comercializacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.canal_comercializacao
    owner to sistema;

create table pinovara_aux.complementacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.complementacao
    owner to sistema;

create table pinovara_aux.complementacao_prodanimal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.complementacao_prodanimal
    owner to sistema;

create table pinovara_aux.tipo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.tipo_producao
    owner to sistema;

create table pinovara_aux.reproducao_bovinocultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.reproducao_bovinocultura
    owner to sistema;

create table pinovara_aux.sistcriacao_bovinocultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.sistcriacao_bovinocultura
    owner to sistema;

create table pinovara_aux.sistcriacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.sistcriacao
    owner to sistema;

create table pinovara_aux.piscicultura_finalidade
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.piscicultura_finalidade
    owner to sistema;

create table pinovara_aux.piscicultura_tipo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.piscicultura_tipo
    owner to sistema;

create table pinovara_aux.piscicultura_manejo
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.piscicultura_manejo
    owner to sistema;

create table pinovara_aux.piscicultura_pastoreio
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.piscicultura_pastoreio
    owner to sistema;

create table pinovara_aux.piscicultura_complementacao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.piscicultura_complementacao
    owner to sistema;

create table pinovara_aux.piscicultura_especie
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.piscicultura_especie
    owner to sistema;

create table pinovara_aux.aquicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.aquicultura
    owner to sistema;

create table pinovara_aux.proc_alimentos_categoria
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.proc_alimentos_categoria
    owner to sistema;

create table pinovara_aux.proc_alimentos_reg_sanitario
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.proc_alimentos_reg_sanitario
    owner to sistema;

create table pinovara_aux.proc_alimentos_fonte_materia
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.proc_alimentos_fonte_materia
    owner to sistema;

create table pinovara_aux.semente_muda
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.semente_muda
    owner to sistema;

create table pinovara_aux.propria_comprada
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.propria_comprada
    owner to sistema;

create table pinovara_aux.manejo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.manejo_producao
    owner to sistema;

create table pinovara_aux.pastoreio_prodanimal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.pastoreio_prodanimal
    owner to sistema;

create table pinovara_aux.pastoreio
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.pastoreio
    owner to sistema;

create table pinovara_aux.periodo_producao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.periodo_producao
    owner to sistema;

create table pinovara_aux.tipo_apicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.tipo_apicultura
    owner to sistema;

create table pinovara_aux.manejo_apicultura
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.manejo_apicultura
    owner to sistema;

create table pinovara_aux.extracao
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.extracao
    owner to sistema;

create table pinovara_aux.extrativismo_animal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.extrativismo_animal
    owner to sistema;

create table pinovara_aux.extrativismo_vegetal
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.extrativismo_vegetal
    owner to sistema;

create table pinovara_aux.sim_nao_informar
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.sim_nao_informar
    owner to sistema;

create table pinovara_aux.sim_nao_informar_isento
(
    id        integer not null
        primary key,
    descricao varchar
);

alter table pinovara_aux.sim_nao_informar_isento
    owner to sistema;




