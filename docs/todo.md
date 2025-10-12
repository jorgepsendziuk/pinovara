## 🚀 TAREFAS PRIORITÁRIAS

### ✅ SINCRONIZAÇÃO DE FOTOS ODK - CONCLUÍDO!
**Status:** 🎉 100% Funcional e Testado

**Funcionalidade:** Botão "🔄 Sincronizar ODK" na edição de organizações extrai fotos (BLOBs) do banco ODK e salva no servidor.

**Testado com sucesso:**
- Organização AZURP (ID 17): 5 fotos baixadas (2.5 MB)
- Fotos salvas em: `/var/pinovara/shared/uploads/fotos/{timestamp}.jpg`
- Deduplicação funcionando (não baixa 2x)

**Estrutura ODK:**
- `ORGANIZACAO_FOTO_REF` (_TOP_LEVEL_AURI → organização)
- `ORGANIZACAO_FOTO_BLB` (_SUB_AURI → VALUE bytea)

**Arquivos implementados:**
- Backend: `types/fotoSync.ts`, `services/fotoSyncService.ts`, `controllers/fotoSyncController.ts`, `routes/fotoSyncRoutes.ts`
- Frontend: `UploadFotos.tsx` (botão), `api.ts` (endpoints)
- SQL: `setup-dblink-pinovara.sql`, `fix-foto-paths.sql`

**Endpoints:**
- POST `/api/organizacoes/:id/fotos/sync`
- GET `/api/organizacoes/:id/fotos/odk-disponiveis`

**Nomenclatura:**
- Fotos ODK: `{timestamp}.jpg`
- Upload manual: `{timestamp}.{ext}`

**Doc completa:** `docs/SINCRONIZACAO-FOTOS-ODK-FINAL.md`

**Deploy:** Testar no servidor remoto após deploy

---

## 📋 OUTRAS TAREFAS

continuar a implementação de gestao de roles e papeis

documentar as ultimas modificacoes, verificar documentacao se esta refletindo o estado atual do sistema, caso necessário, olhe nos extratos do git...

no relatorio, ta tudo muito quebrado.
vamos simplificar primeiro pra depois melhorar.
-tire todas as caixas, cores de fundo, rodapé, numero de paginas etc.. esse cabeçalho que esta la nao precisa ter em todas as paginas, so na primeira no comeco do documento.
-mantenha as formatacoes de texto, organize os textos em tabelas simples com linhas finas.
-qual a engine de pdf ta sendo usava, quais libs, me mostre resumido o procedimento que é pra gerar um relatorio em pdf nesse sistema


usar datagrid mais robusta nas listagens de:
usuarios
grid
roles
organizacoes etc

baseado na premissa e nos dados das tabelas do projeto, elabore uma politica de privacidade e disponibilize no rodapé do website um link para ela
contratante: UFBA
desenvolvedor do software: LGRDC Servicos de Informatica de CNPJ 37.287.587/0001-71
DPO: Jorge Psendziuk

elabore um termos de uso que o usuario deve aceitar ao entrar no sistema, nao precisa salvar esse aceite para o usuario, mas sera necessario aceitar os termos para entrar na area logada. mantenha um cookie desse aceite.

botao Sincronizar ODK: mudar para Baixar Arquivos, no accordion de Arquivos. no de fotos Baixar Fotos

aviso de cookies

contador de visitas sem salvar nada no banco é possivel?

rastreabilidade 

editar fotos

http://localhost:5173/organizacoes/lista
- adicionar filtros nos cabecalhos da datagrid, é possivel?



design system:
vamos criar um design system desse sistema, um padrao onde todas as novas paginas devem se inspirar, e atualizar as paginas existentes com esses padroes.

app.css esta gigantesco

