
transformar o sistema em um framework de dados georreferenciados, cadastro em campo, 
gestao de formularios, 
relatórios, 
gestao

aplicativo react native

documentar as ultimas modificacoes, verificar documentacao se esta refletindo o estado atual do sistema, caso necessário, olhe nos extratos do git...

continuar a implementação de gestao de roles e papeis

usar datagrid mais robusta nas listagens de:
usuarios
grid
roles
organizacoes etc


toda vez que uma versao modifica coisas no prisma e ou no backend o deploy automatico pelo github actions nao da certo e tenho que pedir pra ajustar e tentar de novo.
me diga ai o que voce fez agora pro deploy funcionar, qual foi o erro no deploy automatico, e o que tenho que ajustar no deploy. me explique de uma maneira que possa passar pra inteligencia artificial ajustar no projeto pela minha IDE.

baseado nos scripts de deploy do github actions, queria um script pra fazer o deploy somente do frontend, caso eu faça alguma mudanca no visual de alguma pagina por exemplo e nao queira um deploy completo tao longo...

como funciona os gatilhos de github actions, na hora do commit, nao tem uma maneira facil de escolher qual tipo de deploy sera feito, ao inves de um automatico, definir na mensagem, se foi mexido no front, no back, ou nos dois, pra fazer o deploy só daquilo que foi alterado?

usuario sincronizar com odk: temos usuarios do sistema, na tabela pinovara.users do banco bd.pinovaraufba.com.br, mas tambem existem usuarios que fazem coletas em campo, usando o odk collect, e essas informacoes de usuarios do odk ficam naquele banco que temos o dblink em algumas funcoes, como as de baixar fotos. o problema eh que os usuarios que fazem ccadastros com odk tambem acessam o sistema, entao precisamos sincronizar os dados dos dois cadastros de usuarios. 

eis a tabela _registered_users do schema odk_prod no banco app.pinovaraufba.com.br, que tem os regsitros de usuarios do odk. 


CREATE TABLE odk_prod._registered_users ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "LOCAL_USERNAME" varchar(80) NULL, "OPENID_EMAIL" varchar(80) NULL, "FULL_NAME" varchar(255) NULL, "BASIC_AUTH_PASSWORD" varchar(255) NULL, "BASIC_AUTH_SALT" varchar(8) NULL, "DIGEST_AUTH_PASSWORD" varchar(255) NULL, "IS_REMOVED" bool NOT NULL, CONSTRAINT "_registered_users__URI_key" UNIQUE ("_URI"));
CREATE INDEX _registered_users_lu4 ON odk_prod._registered_users USING btree ("LOCAL_USERNAME");
CREATE INDEX _registered_users_lud ON odk_prod._registered_users USING btree ("_LAST_UPDATE_DATE");
CREATE INDEX _registered_users_oe2 ON odk_prod._registered_users USING btree ("OPENID_EMAIL");

e o meu usuario, com o mesmo email e senha do sistema ( jimxxx@gmail.com / [SENHA_DO_USUARIO_TESTE] ) para conferir e testar hash e operacoes
uid:jimxxx@gmail.com|2025-10-16T12:18:12.408+0000	uid:odk_admin|2025-09-12T01:37:57.068+0000	2025-10-16 09:18:12.408	uid:odk_admin|2025-09-12T01:37:57.068+0000	2025-10-16 09:18:32.603	jimxxx@gmail.com		jimxxx	b9460523c66a17462eb128f400bcc45c4136b152	b47txs	271122f203c0916ed377f8d688a03598	false



eis a tabela server_preferences e seus dados para esse projeto, aqui tem o realm string que é necessário para fazer o hash da senha. pesquise como é feito isso e como podemos adaptar para sincronizar com as alteracoes no nosso sistema, como alterar senha do usuario no sistema e refletir no usuario do odk:

CREATE TABLE odk_prod._server_preferences_properties ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "KEY" varchar(128) NULL, "VALUE" varchar(20480) NULL, CONSTRAINT "_server_preferences_properties__URI_key" UNIQUE ("_URI"));
CREATE INDEX _server_preferences_properties_lud ON odk_prod._server_preferences_properties USING btree ("_LAST_UPDATE_DATE");

uuid:2ad8995a-2ad6-4e72-9004-f734488f6425	aggregate.opendatakit.org:web-service	2025-09-11 22:37:57.128		2025-09-11 22:37:57.128	LAST_KNOWN_REALM_STRING	PINOVARA - UFBA ODK Aggregate
uuid:a5749589-eba8-41a4-a4c8-6be8146453a8	aggregate.opendatakit.org:web-service	2025-09-11 22:37:58.202		2025-09-11 22:37:58.202	SITE_KEY	uuid:cb9cadb6-c0df-4e9b-b723-b3112118b4fa

vamos planejar essa operacao, do modo mais simples, sem mapear no prisma nada do banco de dados do odk.




usuario manter aceite dos termos, data do aceite

No Rodapé tem um botão de contato que leva com o link para um e-mail, ao invés de mandar o e-mail vamos fazer uma página de acessar seus dados, exercer os direitos de privacidade, com um formulário para as pessoas requisitarem acesso, alteracao, e outras operacoes com seus dados como explícito na política de privacidade.

módulo privacidade: 
vamos desenhar um módulo de privacidade, para admins, para gerenciar os dados que estao na politica de privacidade, gerenciar requisicoes de dados por usuarios, categorias: 





editar fotos

http://localhost:5173/organizacoes/lista
- adicionar filtros nos cabecalhos da datagrid, é possivel?

Lista de Organizações  essa busca Buscar por nome, CNPJ ou localização... nao funciona, so de digitar qualquer coisa trava, tire isso e coloque alguns filtros mais relevantes, 


historico validacao tabela externa

melhorar mensagens de erro nginx

assinaturas
coisas que faltam no relatório:

assinaturas falta no relatorio, elas sao gravadas 


o campo assinatura leva o 

 qual a politica de timeout?
 avisar quando esta chegando timeout, pra evitar desconexao durante edicao

do mesmo jeito das fotos e arquivos, as assinaturas tambem tem umas tabelas que guardam os nomes, ligacoes com o registro, e o blob. 
deve ser colocado na edicao do mesmo jeito que os arquivos e fotos, com accordion proprio pra edicao e visualizacao.
eis a estrutura do esquema de assinaturas:
assinatura do responsavel legal é ligada no PINOVARA_CORE, e etm as tabelas 

CREATE TABLE odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_BLB" ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "_TOP_LEVEL_AURI" varchar(80) NULL, "VALUE" bytea NOT NULL, CONSTRAINT "ORGANIZACAO_ASSINATURA_RESP_LEGAL_BLB__URI_key" UNIQUE ("_URI"));
CREATE INDEX "ORGANIZACAO_ASSINATURA_RESP_LEGAL_BLB_lud" ON odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_BLB" USING btree ("_LAST_UPDATE_DATE");

CREATE TABLE odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_BN" ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "_PARENT_AURI" varchar(80) NULL, "_ORDINAL_NUMBER" int4 NOT NULL, "_TOP_LEVEL_AURI" varchar(80) NULL, "UNROOTED_FILE_PATH" varchar(4096) NULL, "CONTENT_TYPE" varchar(80) NULL, "CONTENT_LENGTH" int4 NULL, "CONTENT_HASH" varchar(255) NULL, CONSTRAINT "ORGANIZACAO_ASSINATURA_RESP_LEGAL_BN__URI_key" UNIQUE ("_URI"));
CREATE INDEX "ORGANIZACAO_ASSINATURA_RESP_LEGAL_BN_lud" ON odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_BN" USING btree ("_LAST_UPDATE_DATE");
CREATE INDEX "ORGANIZACAO_ASSINATURA_RESP_LEGAL_BN_pa2" ON odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_BN" USING hash ("_PARENT_AURI");

CREATE TABLE odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_REF" ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "_DOM_AURI" varchar(80) NOT NULL, "_SUB_AURI" varchar(80) NOT NULL, "_TOP_LEVEL_AURI" varchar(80) NULL, "PART" int4 NOT NULL, CONSTRAINT "ORGANIZACAO_ASSINATURA_RESP_LEGAL_REF__URI_key" UNIQUE ("_URI"));
CREATE INDEX "ORGANIZACAO_ASSINATURA_RESP_LEGAL_REF_da9" ON odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_REF" USING hash ("_DOM_AURI");
CREATE INDEX "ORGANIZACAO_ASSINATURA_RESP_LEGAL_REF_lud" ON odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_REF" USING btree ("_LAST_UPDATE_DATE");

essa tabela de participantes tem tabela de assinaturas tambem ligadas a ela:

CREATE TABLE odk_prod."ORGANIZACAO_PARTICIPANTES" ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "_PARENT_AURI" varchar(80) NULL, "_ORDINAL_NUMBER" int4 NOT NULL, "_TOP_LEVEL_AURI" varchar(80) NULL, "PARTICIPANTE_CPF" varchar(255) NULL, "PARTICIPANTE_NOME" varchar(255) NULL, "PARTICIPANTE_TELEFONE" varchar(255) NULL, "PARTICIPANTE_RELACAO_OUTROS" varchar(255) NULL, "PARTICIPANTE_RELACAO" varchar(255) NULL, CONSTRAINT "ORGANIZACAO_PARTICIPANTES__URI_key" UNIQUE ("_URI"));
CREATE INDEX "ORGANIZACAO_PARTICIPANTES_lud" ON odk_prod."ORGANIZACAO_PARTICIPANTES" USING btree ("_LAST_UPDATE_DATE");
CREATE INDEX "ORGANIZACAO_PARTICIPANTES_pa2" ON odk_prod."ORGANIZACAO_PARTICIPANTES" USING hash ("_PARENT_AURI");

CREATE TABLE odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_BLB" ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "_TOP_LEVEL_AURI" varchar(80) NULL, "VALUE" bytea NOT NULL, CONSTRAINT "ORGANIZACAO_PARTICIPANTE_ASSINATURA_BLB__URI_key" UNIQUE ("_URI"));
CREATE INDEX "ORGANIZACAO_PARTICIPANTE_ASSINATURA_BLB_lud" ON odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_BLB" USING btree ("_LAST_UPDATE_DATE");

CREATE TABLE odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_BN" ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "_PARENT_AURI" varchar(80) NULL, "_ORDINAL_NUMBER" int4 NOT NULL, "_TOP_LEVEL_AURI" varchar(80) NULL, "UNROOTED_FILE_PATH" varchar(4096) NULL, "CONTENT_TYPE" varchar(80) NULL, "CONTENT_LENGTH" int4 NULL, "CONTENT_HASH" varchar(255) NULL, CONSTRAINT "ORGANIZACAO_PARTICIPANTE_ASSINATURA_BN__URI_key" UNIQUE ("_URI"));
CREATE INDEX "ORGANIZACAO_PARTICIPANTE_ASSINATURA_BN_lud" ON odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_BN" USING btree ("_LAST_UPDATE_DATE");
CREATE INDEX "ORGANIZACAO_PARTICIPANTE_ASSINATURA_BN_pa2" ON odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_BN" USING hash ("_PARENT_AURI");


CREATE TABLE odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_REF" ( "_URI" varchar(80) NOT NULL, "_CREATOR_URI_USER" varchar(80) NOT NULL, "_CREATION_DATE" timestamp NOT NULL, "_LAST_UPDATE_URI_USER" varchar(80) NULL, "_LAST_UPDATE_DATE" timestamp NOT NULL, "_DOM_AURI" varchar(80) NOT NULL, "_SUB_AURI" varchar(80) NOT NULL, "_TOP_LEVEL_AURI" varchar(80) NULL, "PART" int4 NOT NULL, CONSTRAINT "ORGANIZACAO_PARTICIPANTE_ASSINATURA_REF__URI_key" UNIQUE ("_URI"));
CREATE INDEX "ORGANIZACAO_PARTICIPANTE_ASSINATURA_REF_da9" ON odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_REF" USING hash ("_DOM_AURI");
CREATE INDEX "ORGANIZACAO_PARTICIPANTE_ASSINATURA_REF_lud" ON odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_REF" USING btree ("_LAST_UPDATE_DATE");


php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42148"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42149"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42150"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42151"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42152"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42153"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42154"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42155"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42156"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42157"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42158"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42159"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42160"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42161"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42162"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42163"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42164"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42165"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42166"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42167"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42168"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42169"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42170"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42173"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42201"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42203"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42204"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42205"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42206"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42207"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42208"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42209"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42210"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42212"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42213"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42214"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42215"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42216"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42217"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42218"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42385"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42398"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=42399"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=51468"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=51469"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=51470"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=51471"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=72190"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=152405"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256910"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256911"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256913"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256914"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256915"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256916"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256918"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256923"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256924"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256925"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=256929"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=258053"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=258056"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=258057"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=258058"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=258059"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=258061"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=258062"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=258064"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277159"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277160"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277161"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277163"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277164"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277165"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277168"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277170"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277175"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277176"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277177"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277179"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277180"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277182"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277183"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=277185"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369382"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369547"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369548"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369552"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369553"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369554"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369555"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369556"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369557"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369558"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369560"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369563"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=369728"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=371700"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=371701"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=371702"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=371703"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=371705"
php8.2 /var/www/html/legaliza/cmd.php "class=VTituloNovoDocumentGerar&method=onGenerate&static=1&key=371706"


Objetivo: criar módulo de Qualificações e Capacitações dentro do sistema para gerenciar planos de curso, inscrições, presença, avaliações de impacto, repositório de material e evidências (fotos, lista de presença).
Escopo inicial: cada empreendimento terá 1 qualificação específica; além disso, existem 3 qualificações “em rede” que serão ofertadas simultaneamente a várias organizações.
Elementos mínimos por qualificação/curso: plano de curso (título, objetivos geral e específicos, conteúdo programático, metodologia, recursos didáticos, estratégia de avaliação, referências, instrutor responsável), lista de inscritos, lista de presença (assinada e fotografada), relatório sintético, evidências (fotos/PDFs), avaliação de impacto padronizada, repositório de material didático.
Fluxos sugeridos: geração automática de QR code/link no momento da criação do plano para inscrição e avaliação; opção de inscrição manual pelo técnico de campo; impressão da lista de inscritos que vira lista de presença; upload de foto da lista assinada como prova.
Integração com AVA (Moodle) foi debatida, mas decidiram inicialmente manter repositório interno leve no sistema (integração futura opcional).

Requisitos funcionais (mínimos)

RF1: CRUD de Qualificações/Capacitações (criar, editar, excluir, listar).
RF2: Modelo de Plano de Curso com campos: título, objetivos (geral/específicos), conteúdo programático (texto livre), metodologia, recursos didáticos, estratégia de avaliação, referências, instrutor responsável, local/data/turno, repositório de material (upload).
RF3: Geração automática de QR code / link ao criar o plano, para inscrição pública.
RF4: Formulário de inscrição (nome, instituição, e-mail, telefone, documento (CPF ou RG)) acessível via QR/link e por cadastro manual pelo técnico de campo.
RF5: Lista de inscritos imprimível e conversível em lista de presença (com linhas extras para assinaturas avulsas).
RF6: Upload de lista de presença assinada (foto/PDF) e armazenamento como evidência.
RF7: Relatório fotográfico (upload de fotos com metadados: data, local) ligado ao curso.
RF8: Avaliação de impacto padronizada (questionário), linkável por QR e registrada no sistema.
RF9: Vínculo entre qualificações e uma ou várias organizações (many-to-many).
RF10: Repositório de materiais por curso (arquivos PDF, PPT, vídeos) com permissão de download.
RF11: Logs de auditoria para alterações em planos e uploads de evidências.
RF12: Exportação/geração de pacote final (relatório sintético + evidências) em PDF.
Acesso dos inscritos: 

Requisitos não funcionais

RNF3: Segurança: uploads armazenados com controle de acesso por função; dados pessoais (CPF) criptografados em repouso.
RNF4: Usabilidade: gerar QR e formulários responsivos para dispositivos móveis; interface de impressão amigável.
RNF5: Escalabilidade: suportar criação simultânea de 28+ turmas e múltiplas turmas em rede.
RNF6: Interoperabilidade: API REST para futura integração com Moodle/AVA (endpoints para exportar/importar participantes, materiais e resultados).
RNF7: Backup e retenção de evidências (política de retenção definida pelo projeto).
RNF8: Conformidade: manter logs para auditoria e conformidade com regras da extensão universitária.
Instruções claras para a IA/IDE implementar o novo módulo (passo a passo técnico)

Modelagem de dados: criar entidades principais - Qualification (course), CoursePlan (fields do plano), Enrollment, AttendanceRecord, Evidence (photos/PDF), EvaluationResponse, Organization, Instructor, Material. Relacionamentos: Qualification <-> Organization (M:N); Qualification -> CoursePlan (1:1); CoursePlan -> Material (1:N); Enrollment -> AttendanceRecord (1:N).
Endpoints API sugeridos (REST):
/qualifications [GET,POST,PUT,DELETE]
/qualifications/{id}/qrcode [GET] -> retorna QR link
/qualifications/{id}/enrollments [GET,POST]
/qualifications/{id}/enrollments/{eid}/attendance [POST] (upload assinatura/photo)
/qualifications/{id}/evidences [POST]
/qualifications/{id}/evaluation [GET,POST]
/organizations [GET,POST]
/materials [POST,GET]
/export/{qualificationId}/final-report [GET] -> gera PDF contendo plano, lista de inscritos, presença, fotos, resultados da avaliação
Front-end: telas principais
Tela de listagem de qualificações (filtro por organização, status).
Formulário de criação/edição do plano de curso (WYSIWYG para conteúdo programático).
Página pública do curso com botão de inscrição (QR/link) e avaliação.
Painel do instrutor/técnico: imprimir lista de inscritos (formato A4), marcar presenças, upload de fotos/listas assinadas, ver resultados da avaliação.
QR code e formulário público: ao criar o plano gerar UUID e endpoint público para inscrição + avaliação; permitir inscrição via web móvel.
Offline: implementar um modo PWA ou módulo mobile-lite que permita salvar inscrições e registros localmente (IndexedDB ou SQLite) e sincronizar via fila quando online.
Upload e armazenamento: usar objeto de storage (S3 ou equivalente) com nomes padronizados (qualificationId/yyyy-mm-dd/type/filename) e armazenar metadados no banco. Validar tamanho e tipos MIME.
Segurança e privacidade: autenticação por roles (admin, gestor, instrutor, técnico de campo); criptografar campos sensíveis; limitar downloads de evidências por papel.
Export/PDF: biblioteca server-side para montagem do relatório final (plano + lista + fotos + respostas da avaliação).
Testes: criar casos para fluxo completo (criar curso, gerar QR, inscrever 10 participantes, imprimir lista, simular presenças offline e sync, upload evidências, gerar relatório).
Documentação e API: documentar endpoints e payloads (OpenAPI/Swagger) e exemplo de integração com Moodle (export de lista e materiais).
Observações rápidas

Priorizar offline + impressão e upload de lista assinada (é requisito de campo crítico).
Iniciar com repositório interno leve; deixar integração com Moodle como tarefa futura com endpoints definidos.
Padronizar a avaliação de impacto (modelo único por projeto) para facilitar relatórios agregados.
Se quiser, eu posso: gerar o diagrama de entidades (ER), escrever os contratos de API (OpenAPI) ou montar as telas wireframe para o esqueleto do módulo.