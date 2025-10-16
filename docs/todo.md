
continuar a implementação de gestao de roles e papeis

usar datagrid mais robusta nas listagens de:
usuarios
grid
roles
organizacoes etc

documentar as ultimas modificacoes, verificar documentacao se esta refletindo o estado atual do sistema, caso necessário, olhe nos extratos do git...

toda vez que uma versao modifica coisas no prisma e ou no backend o deploy automatico pelo github actions nao da certo e tenho que pedir pra ajustar e tentar de novo.
me diga ai o que voce fez agora pro deploy funcionar, qual foi o erro no deploy automatico, e o que tenho que ajustar no deploy. me explique de uma maneira que possa passar pra inteligencia artificial ajustar no projeto pela minha IDE.

baseado nos scripts de deploy do github actions, queria um script pra fazer o deploy somente do frontend, caso eu faça alguma mudanca no visual de alguma pagina por exemplo e nao queira um deploy completo tao longo...

usuario sincronizar com odk

usuario manter aceite dos termos, data do aceite


No Rodapé tem um botão de contato que leva com o link para um e-mail, ao invés de mandar o e-mail vamos fazer uma página de acessar seus direitos, seus dados com um formulário para as pessoas requisitarem, requerirem seus dados como explícito na política de privacidade.

E esse menu lateral quando está no computador na tela maior ele também está ruim ele não dá para colapsar clica para colapsar ele não colapsa ele fica aberto só dá uma tremida, tem que ver.
no mobile o menu lateral praticamente nao funciona, fica tudo maluco com letras invisiveis, sei la... 

verificar os nomes dos itens das áreas do diagnostico, parece que ta incompleto. exemplo:
ÁREA GERENCIAL: GESTÃO DE PESSOAS
P Organizacao
P Desenvolvimento
Trabalho
Geracao

editar fotos

http://localhost:5173/organizacoes/lista
- adicionar filtros nos cabecalhos da datagrid, é possivel?

Lista de Organizações  essa busca Buscar por nome, CNPJ ou localização... nao funciona, so de digitar qualquer coisa trava, tire isso e coloque alguns filtros mais relevantes, 



design system:
vamos criar um design system desse sistema, um padrao onde todas as novas paginas devem se inspirar, e atualizar as paginas existentes com esses padroes.

inspire-se na pagina Dashboard do Usuário, o cabecalho, fontes, cores de fontes e fundos ali estao bem equilibrados com o padrao a ser seguido no sistema 

com o design system definido, vamos aprimorar o esquema de formatacao, o app.css esta gigantesco, quem sabe nao conseguimos padronizar as partes comuns das interfaces pelo menos, pra evitar tanto código de estilo. deve ter muita redundancia ali.

depois de definidos vamos indo pagina por pagina aplicando as formatacoes definidas. vamos planejar?




melhorar mensagens de erro nginx

