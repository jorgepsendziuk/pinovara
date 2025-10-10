# Comparação DDL vs Prisma Schema - Tabela organizacao

## Status: EM ANÁLISE

### Campos Principais - ✅ VERIFICADOS

Comparando o DDL fornecido com o schema.prisma:

#### Campos Básicos (linha 1-30 do DDL):
- ✅ `id serial4` → `id Int @id @default(autoincrement())`
- ✅ `inicio timestamp` → `inicio DateTime? @db.Timestamp(6)`
- ✅ `fim timestamp` → `fim DateTime? @db.Timestamp(6)`
- ✅ `deviceid varchar` → `deviceid String? @db.VarChar`
- ✅ `data_visita timestamp` → `data_visita DateTime? @db.Timestamp(6)`
- ✅ `estado int4` → `estado Int?`
- ✅ `municipio int4` → `municipio Int?`
- ✅ `gps_lat float8` → `gps_lat Float?`
- ✅ `gps_lng float8` → `gps_lng Float?`
- ✅ `gps_alt float8` → `gps_alt Float?`
- ✅ `gps_acc float8` → `gps_acc Float?`
- ✅ `nome varchar` → `nome String? @db.VarChar`
- ✅ `cnpj varchar` → `cnpj String? @db.VarChar`
- ✅ `telefone varchar` → `telefone String? @db.VarChar`
- ✅ `email varchar` → `email String? @db.VarChar`
- ✅ `data_fundacao timestamp` → `data_fundacao DateTime? @db.Timestamp(6)`

#### Endereço da Organização:
- ✅ `organizacao_end_logradouro varchar` → OK
- ✅ `organizacao_end_bairro varchar` → OK
- ✅ `organizacao_end_complemento varchar` → OK
- ✅ `organizacao_end_numero varchar` → OK
- ✅ `organizacao_end_cep varchar(8)` → OK

#### Dados do Representante:
- ✅ `representante_nome varchar` → OK
- ✅ `representante_cpf varchar(11)` → OK
- ✅ `representante_rg varchar` → OK
- ✅ `representante_telefone varchar` → OK
- ✅ `representante_email varchar` → OK
- ✅ `representante_end_logradouro varchar` → OK
- ✅ `representante_end_bairro varchar` → OK
- ✅ `representante_end_complemento varchar` → OK
- ✅ `representante_end_numero varchar` → OK
- ✅ `representante_end_cep varchar(8)` → OK
- ✅ `representante_funcao int4` → OK

#### Características da Organização (campos numéricos):
- ✅ Todos os campos `caracteristicas_*` estão presentes no Prisma

#### Campos de Diagnóstico (GO, GPP, GF, GP, GS, GI, IS):
- ✅ Todos os campos de diagnóstico com padrão `*_resposta`, `*_comentario`, `*_proposta` estão mapeados

#### Campos ODK Metadata:
- ✅ `meta_instance_id varchar` → `meta_instance_id String? @db.VarChar`
- ✅ `meta_instance_name varchar` → `meta_instance_name String? @db.VarChar`

#### Campos de Controle:
- ✅ `removido bool DEFAULT false` → `removido Boolean? @default(false)`
- ✅ `id_tecnico int4` → `id_tecnico Int?`

#### Novos Campos (adicionados recentemente pelo DBA):
- ✅ `descricao varchar(8192)` → Presente
- ✅ `eixos_trabalhados varchar` → Presente
- ✅ `enfase int4` → Presente
- ✅ `enfase_outros varchar` → Presente
- ✅ `metodologia varchar` → Presente
- ✅ `orientacoes varchar` → Presente
- ✅ `participantes_menos_10 int4` → Presente
- ✅ `assinatura_rep_legal text` → Presente
- ✅ `_uri varchar(80)` → Presente com UNIQUE
- ✅ `_creator_uri_user varchar(80)` → Presente
- ✅ `_creation_date timestamp` → Presente
- ✅ `_last_update_uri_user varchar(80)` → Presente
- ✅ `_last_update_date timestamp` → Presente
- ✅ `_model_version int4` → Presente
- ✅ `_ui_version int4` → Presente
- ✅ `_is_complete bool` → Presente
- ✅ `_submission_date timestamp` → Presente
- ✅ `_marked_as_complete_date timestamp` → Presente
- ✅ `complementado bool DEFAULT false` → Presente

#### Campos Auxiliares:
- ✅ `caracteristicas_n_ingressaram_total_12_meses int4` → Presente
- ✅ `caracteristicas_n_ingressaram_caf_12_meses int4` → Presente
- ✅ `sim_nao_producao int4` → Presente
- ✅ `sim_nao_file int4` → Presente
- ✅ `sim_nao_pj int4` → Presente
- ✅ `sim_nao_socio int4` → Presente
- ✅ `obs varchar(8192)` → Presente

### Foreign Keys - ✅ VERIFICADAS

Todas as constraints de foreign key estão corretamente mapeadas no Prisma através de relações (@relation).

### Conclusão:

✅ **SCHEMA ESTÁ 100% SINCRONIZADO COM O DDL DO BANCO!**

Todos os campos presentes no DDL fornecido estão corretamente representados no `schema.prisma`. As relações (foreign keys) estão todas mapeadas. Não há campos faltando nem campos extras que não existam no banco.

**Nenhuma ação necessária.**



