
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

e o meu usuario, com o mesmo email e senha do sistema ( jimxxx@gmail.com / [SENHA_REMOVIDA_DO_HISTORICO] ) para conferir e testar hash e operacoes
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
