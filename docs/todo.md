## ✅ Validação de Organizações - IMPLEMENTADO
- Campos adicionados no banco: `validacao_status`, `validacao_usuario`, `validacao_data`, `validacao_obs`
- Aba "Validação" criada na página de edição
- Status exibido com badges coloridos nas listas, dashboards e mapas
- Permissões: Admin e Coordenador podem validar, Técnico apenas visualiza
- 4 status disponíveis: NÃO VALIDADO (1), VALIDADO (2), PENDÊNCIA (3), REPROVADO (4)
- **🔧 CORREÇÃO**: Campos de resposta de diagnóstico convertidos adequadamente para inteiro no frontend
- **🔧 CORREÇÃO**: Estrutura de objetos de diagnóstico processada corretamente (extrair valores corretos)

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

quero rastreabilidade das acoes, principalmente de edicao dos cadastros, login e logout, o que mais sugere? quais estruturas preciso criar?

No Rodapé tem um botão de contato que leva com o link para um e-mail, ao invés de mandar o e-mail vamos fazer uma página de acessar seus direitos, seus dados com um formulário para as pessoas requisitarem, requerirem seus dados como explícito na política de privacidade.

E esse menu lateral quando está no computador na tela maior ele também está ruim ele não dá para colapsar clica para colapsar ele não colapsa ele fica aberto só dá uma tremida tem que ver.

editar fotos

http://localhost:5173/organizacoes/lista
- adicionar filtros nos cabecalhos da datagrid, é possivel?


Lista de Organizações  essa busca Buscar por nome, CNPJ ou localização... nao funciona, so de digitar qualquer coisa trava, tire isso e coloque alguns filtros mais relevantes, 

design system:
vamos criar um design system desse sistema, um padrao onde todas as novas paginas devem se inspirar, e atualizar as paginas existentes com esses padroes.

app.css esta gigantesco

