
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





Objetivo: criar módulo de Qualificações e Capacitações dentro do sistema para gerenciar planos de curso, inscrições, presença, avaliações de impacto, repositório de material e evidências (fotos, lista de presença).
Escopo inicial: cada empreendimento terá 1 qualificação específica; além disso, existem 3 qualificações “em rede” que serão ofertadas simultaneamente a várias organizações.
Elementos mínimos por qualificação/curso: plano de curso (título, objetivos geral e específicos, conteúdo programático, metodologia, recursos didáticos, estratégia de avaliação, referências, instrutor responsável), lista de inscritos, lista de presença (assinada e fotografada), relatório sintético, evidências (fotos/PDFs), avaliação de impacto padronizada, repositório de material didático.
Fluxos sugeridos: geração automática de QR code/link no momento da criação do plano para inscrição e avaliação; opção de inscrição manual pelo técnico de campo; impressão da lista de inscritos que vira lista de presença; upload de foto da lista assinada como prova.
Integração com AVA (Moodle) foi debatida, mas decidiram inicialmente manter repositório interno leve no sistema

Qualificações sao os cursos, que podem ser especificos para uma organizacao ou nao.
Inclusive tem, a principio, 3 qualificacoes que podem ser aplicadas em qualquer organizacao em capacitacoes.
Assim como podem ter qualificacoes que sao especificas de uma organizacao. 
O criador da capacitacao que escolhe o escopo ou abrangencia (escolher melhor nomenclatura para isso)
Capacitações sao instancias de qualificacoes, sao eventos de aplicacao de uma qualificacao, pode ser em uma organizacao ou varias aos mesmo tempo
- 1 curso pode ter varios instrutores, a principio quem criou-a
- 1 instrutor pode criar varios cursos
- 1 curso pode ser aplicado em diversas organizacoes
- criei o schema capacitacao no banco de dados, vamos colocar la essas estruturas novas.

Requisitos funcionais (mínimos)

criar Módulo Qualificações e Capacitações no menu, atribuir para o role administrador (pode acessar todos), técnico (pode gerenciar os cursos criados, criar novos etc, criar e manter capacitacoes, cadastrar pessoas que vao ), supervidor pode ver tudo, nao altera nada.
Quem se cadastra na qualificacao (participante), seja por QR Code ou pelo cadastro pelo técnico, acessa a qualificacao ao fornecer o email, se esse email esta cadastrado pode acessar o material do curso (visualizacao).
RF1: CRUD de Qualificações (criar, editar, excluir, listar).
RF1.2: CRUD de Capacitações (criar, editar, excluir, listar).
RF2: Modelo de Plano de Curso com campos: título, objetivos (geral/específicos), conteúdo programático (texto livre), metodologia, recursos didáticos, estratégia de avaliação, referências, instrutor responsável, local/data/turno, repositório de material (upload).
RF3: Geração automática de QR code / link ao criar uma capacitacao, para inscrição pública.
RF4: Formulário de inscrição (nome, instituição, e-mail, telefone, documento (CPF e/ou RG - opcionais)) acessível via QR/link e por cadastro manual pelo técnico de campo.
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
RNF4: Usabilidade: gerar QR e formulários responsivos para dispositivos móveis; interface de impressão amigável.
RNF8: Conformidade: manter logs para auditoria

Front-end: telas principais
Tela de listagem de qualificações (filtro por organização, tecnico).
Tela de listagem de capacitacoes (filtro por organização, tecnico, status).
Calendario 
Formulário de criação/edição do plano de curso (WYSIWYG para conteúdo programático).
Página pública da capacitacao com botão de inscrição (QR/link) e avaliação.
Painel do instrutor/técnico: imprimir lista de inscritos (formato A4), marcar presenças, upload de fotos/listas assinadas, ver resultados da avaliação.
depois linkar nas organizacoes funcoes de acesso as Qualificações e Capacitações atribuidas a mesma.

Propostas de Temas para a Capacitação Conjunta do Projeto PINOVARA
1)	Instrumentos para Operação de Redes de Aprendizagem Interorganizacionais

Objetivo: Capacitar os participantes a identificar, avaliar e selecionar as ferramentas (tecnológicas e metodológicas) mais adequadas para suportar a comunicação e o compartilhamento de conhecimento na rede.
Principais Tópicos: 
•	Benchmarkings internos e externos
•	Aprendizado cruzado e visitas entre organizações coletivas
•	Modelo estrutura-conduta-desempenho para aprendizado permanente
•	Comunidade de práticas
•	Tecnologias digitais suportando o aprendizado coletivo

2)	Governança e Sustentabilidade de Redes Interorganizacionais

Objetivo: Fornecer aos participantes as competências teóricas e práticas necessárias para estruturar, gerenciar e manter uma agenda colaborativa entre múltiplas organizações.
Principais Tópicos
•	Formalização de acordos
•	Gestão de Conflitos
•	Modelos de liderança em redes
•	Processos decisórios coletivos
•	Mecanismos de controle e monitoramento de uma rede

3)	Gestão por Processos e Tecnologias Digitais para Qualificação da Gestão

Objetivo: Prover os participantes (membros e gestores da rede interorganizacional) do conhecimento e das ferramentas necessárias para modernizar e padronizar os fluxos de trabalho e, consequentemente, melhorar a eficiência e a qualidade da gestão dos membros da rede e de suas cooperativas/organizações membras.
Principais Tópicos
•	Mapeamento e representação de processos
•	Tipologia e finalidades dos diferentes sistemas de informação
•	Tomada de decisão baseada em dados
•	Estruturação de informações sobre capacidade produtiva 
•	Estruturação de informações para suportar o acesso a mercados




SUA OPINIÃO É IMPORTANTE!!
Instrumento  essencial para avaliar o desempenho da qualificação / capacitação ofertada no âmbito do PINOVARA (M10, P17). Dados e informações coletados em consonância com a Lei Geral de Proteção de Dados Pessoais - LGPD (Lei nº 13.709/2018).

Dados do participante (opcional)
Nome completo 
E-mail
Contato telefônico com DDD e whatsapp. Ex.: (11) 99999-9999
*
    A  qualificação / capacitação  foi apresentada com objetivos claros?
*
Nunca
Às vezes
Metade do tempo
Quase sempre
Sempre
    A  qualificação / capacitação  é relevante para sua formação e aplicada no  empreendimento coletivo (Cooperativa, Associação, etc)  que você faz parte?
*
Muito baixo
Baixo
Razoável
Alto
Muito Alto

Os conhecimentos, técnicas, métodos e outos adquiridos na qualificação / capacitação propiciam efetiva melhoria  para o empreendimento coletivo (Cooperativa, Associação, etc)  que você faz parte  ?
*
Sim
Não
Talvez
    A  qualificação / capacitação  proposta foi cumprido integralmente?
*
Sim
Não
Parcialmente
    A distribuição de conteúdo ao longo do tempo da  qualificação / capacitação  foi adequada?
*
Sim
Não
Parcialmente
    O material didático fornecido ou citado é:
*
Péssimo
Ruim
Regular
Bom
Excelente
     A qualificação / capacitação  (estruturação dos módulos) atendeu e facilitou  seu aprendizado e às expectativas / demandas para o empreendimento coletivo (Cooperativa, Associação, etc) ?
*
Sim
Não
Talvez
    Qual o grau de dificuldade da qualificação / capacitação?
*
Muito Baixo
Baixo
Razoável
Alto
Muito Alto
  Seu grau de entendimento nesta qualificação / capacitação foi:
*
Muito baixo
Baixo
Razoável
Alto
Muito Alto
  Durante a qualificação / capacitação, o seu esforço foi:
*
Muito baixo
Baixo
Razoável
Alto
Muito Alto
  Você adquiriu conhecimentos novos com a qualificação / capacitação?
*
Sim
Não
Parcialmente
O grau de domínio do(a) Facilitador(a) (Instrutor(a), Consultor(a)) sobre o conteúdo foi:
*
Muito Baixo
Baixo
Razoável
Alto
Muito Alto
Os métodos e técnicas de aprendizagem utilizados pelo(a)  do(a) Facilitador(a) (Instrutor(a), Consultor(a))   são:
*
Péssimos
Ruins
Regulares
Bons
Excelentes
Durante a qualificação / capacitação   o(a) Facilitador(a) (Instrutor(a), Consultor(a))   estimulou a participação dos(as) participantes (abertura para dúvidas, preocupação em explicar para o melhor entendimento e etc)?
*
Nunca
Às Vezes
Metade do tempo
Quase Sempre
Sempre
Você indicaria o(a) Facilitador(a) (Instrutor(a), Consultor(a))   para outra qualificação / capacitação?
*
Sim
Não
Talvez
*


Deixe seu comentário, sugestões, elogios, críticas...
(campo livre)  



no calendario mostrar mais imformacoes, princpalmente técnico e organizacao, pode abreviar, fazer multilinha, inventa ae





nas duas: LISTA DE PRESENÇA e LISTA DE INSCRIÇÕES vazias,   a linha numero 1 continua com a linha no meio, que nao da pra escrever nada, talvez descer a linha?
na lista de presenca tire a coluna Presente
