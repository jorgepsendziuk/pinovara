
continuar a implementação de gestao de roles e papeis

documentar as ultimas modificacoes, verificar documentacao se esta refletindo o estado atual do sistema, caso necessário, olhe nos extratos do git...

usar datagrid mais robusta nas listagens de:
usuarios
grid
roles
organizacoes etc

design system:
vamos criar um design system desse sistema, um padrao onde todas as novas paginas devem se inspirar, e atualizar as paginas existentes com esses padroes.

app.css esta gigantesco

preciso de uma pagina pra gestao do "plano de gestao".
sao varios planos, como:
- Plano de Gestão e Estratégias
- Plano de Mercado e Comercialização
- Plano de Tecnologia e Inovação
- etc..
e cada coluna é:
AÇÕES
RESPONSÁVEL (com Assessoria do(a) Técnico(a) de Campo)
INÍCIO
TÉRMINO
COMO SERÁ FEITO?
RECURSOS
essa pagina vai dentro da edicao de organizacoes, temos abas Organização e
Diagnóstico, criar uma nova aba Plano de Gestão
primeiro preciso de uma página pra validar o design, entao por enquanto so as datas de inicio e termino serao editaveis.
faça num formato de accordions, um accordion para cada plano que eu mencionei acima, nao precisa salvar a data no banco de dados, estamos só testando a interface
