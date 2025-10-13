
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

rastreabilidade das acoes

na Dashboard - Organizações tirar  CNPJ	e	Status, 
arrumar Localização nao ta aparecendo



editar fotos

http://localhost:5173/organizacoes/lista
- adicionar filtros nos cabecalhos da datagrid, é possivel?



design system:
vamos criar um design system desse sistema, um padrao onde todas as novas paginas devem se inspirar, e atualizar as paginas existentes com esses padroes.

app.css esta gigantesco

validacao: criar telas de validacao dos cadastros de organizacao, com validacao_status, validacao_usuario, validacao_data, validacao_obs.  (vou criar esses campos na tabela organizacao e voce sincroniza ae no prisma)
status:
1	NÃO VALIDADO
2	VALIDADO
3	PENDÊNCIA
4	REPROVADO