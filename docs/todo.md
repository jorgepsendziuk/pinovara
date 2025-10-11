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

usar datagrid mais robusta nas listagens de:
usuarios
grid
roles
organizacoes etc


rastreabilidade 


### ESTRUTURA DAS TABELAS ODK (REFERÊNCIA)
em app.pinovaraufba.com.br, no banco odk_prod, schema odk_prod, tem essa tabela.
 CREATE TABLE odk_prod."ORGANIZACAO_FOTOS" (
	"_URI" varchar(80) NOT NULL,
	"_CREATOR_URI_USER" varchar(80) NOT NULL,
	"_CREATION_DATE" timestamp NOT NULL,
	"_LAST_UPDATE_URI_USER" varchar(80) NULL,
	"_LAST_UPDATE_DATE" timestamp NOT NULL,
	"_PARENT_AURI" varchar(80) NULL,
	"_ORDINAL_NUMBER" int4 NOT NULL,
	"_TOP_LEVEL_AURI" varchar(80) NULL,
	"GRUPO" varchar(255) NULL,
	"FOTO_OBS" varchar(255) NULL,
	CONSTRAINT "ORGANIZACAO_FOTOS__URI_key" UNIQUE ("_URI")
);
CREATE INDEX "ORGANIZACAO_FOTOS_lud" ON odk_prod."ORGANIZACAO_FOTOS" USING btree ("_LAST_UPDATE_DATE");
CREATE INDEX "ORGANIZACAO_FOTOS_pa2" ON odk_prod."ORGANIZACAO_FOTOS" USING hash ("_PARENT_AURI");
ela é replicada para o banco do sistema, ja mapeado no prisma, organizacao_foto

o blob esta nessa tabela:
CREATE TABLE odk_prod."ORGANIZACAO_FOTO_BLB" (
	"_URI" varchar(80) NOT NULL,
	"_CREATOR_URI_USER" varchar(80) NOT NULL,
	"_CREATION_DATE" timestamp NOT NULL,
	"_LAST_UPDATE_URI_USER" varchar(80) NULL,
	"_LAST_UPDATE_DATE" timestamp NOT NULL,
	"_TOP_LEVEL_AURI" varchar(80) NULL,
	"VALUE" bytea NOT NULL,
	CONSTRAINT "ORGANIZACAO_FOTO_BLB__URI_key" UNIQUE ("_URI")
);
CREATE INDEX "ORGANIZACAO_FOTO_BLB_lud" ON odk_prod."ORGANIZACAO_FOTO_BLB" USING btree ("_LAST_UPDATE_DATE");




http://localhost:5173/organizacoes/lista
- adicionar filtros nos cabecalhos da datagrid, é possivel?



design system:
vamos criar um design system desse sistema, um padrao onde todas as novas paginas devem se inspirar, e atualizar as paginas existentes com esses padroes.

app.css esta gigantesco

