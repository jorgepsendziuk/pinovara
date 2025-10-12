# 📋 Novos Campos e Tabelas - Atualização DBA

## ✅ Status da Verificação

**Data:** 09/10/2025

### ❌ **NENHUM dos campos e tabelas existe no Prisma Schema atual**

Todos os itens abaixo precisam ser adicionados ao `backend/prisma/schema.prisma`.

---

## 📊 **1. Novos Campos na Tabela `organizacao`**

### Campos de Conteúdo:
```prisma
model organizacao {
  // ... campos existentes ...
  
  // NOVOS CAMPOS - Adicionar:
  descricao                   String?   @db.VarChar(8192)
  eixos_trabalhados           String?   @db.VarChar
  enfase                      Int?
  enfase_outros               String?   @db.VarChar
  metodologia                 String?   @db.VarChar
  orientacoes                 String?   @db.VarChar
  participantes_menos_10      Int?
  assinatura_rep_legal        String?   @db.Text
  
  // Relacionamentos
  enfase_relacao              enfase?   @relation(fields: [enfase], references: [id])
  participantes_relacao       sim_nao?  @relation("organizacao_participantes_menos_10", fields: [participantes_menos_10], references: [id])
}
```

### Campos de Metadados ODK:
```prisma
model organizacao {
  // ... campos existentes ...
  
  // NOVOS CAMPOS - Metadados ODK:
  uri                         String?   @unique @map("_uri") @db.VarChar(80)
  creator_uri_user            String?   @map("_creator_uri_user") @db.VarChar(80)
  creation_date               DateTime? @map("_creation_date") @db.Timestamp(6)
  last_update_uri_user        String?   @map("_last_update_uri_user") @db.VarChar(80)
  last_update_date            DateTime? @map("_last_update_date") @db.Timestamp(6)
  model_version               Int?      @map("_model_version")
  ui_version                  Int?      @map("_ui_version")
  is_complete                 Boolean?  @map("_is_complete")
  submission_date             DateTime? @map("_submission_date") @db.Timestamp(6)
  marked_as_complete_date     DateTime? @map("_marked_as_complete_date") @db.Timestamp(6)
  complementado               Boolean?  @default(false)
}
```

---

## 📊 **2. Novas Tabelas Auxiliares (pinovara_aux)**

### Tabela: enfase
```prisma
model enfase {
  id          Int           @id
  descricao   String?       @db.VarChar
  organizacao organizacao[]
  
  @@schema("pinovara_aux")
}
```

### Tabela: relacao
```prisma
model relacao {
  id                        Int                         @id
  descricao                 String?                     @db.VarChar
  organizacao_participante  organizacao_participante[]
  
  @@schema("pinovara_aux")
}
```

### Tabela: indicador
```prisma
model indicador {
  id                      Int                       @id
  descricao               String?                   @db.VarChar
  organizacao_indicador   organizacao_indicador[]
  
  @@schema("pinovara_aux")
}
```

---

## 📊 **3. Novas Tabelas de Relacionamento (pinovara)**

### Tabela: organizacao_participante
```prisma
model organizacao_participante {
  id                   Int          @id @default(autoincrement())
  uri                  String       @unique @map("_uri") @db.VarChar(80)
  creator_uri_user     String       @map("_creator_uri_user") @db.VarChar(80)
  creation_date        DateTime     @map("_creation_date") @db.Timestamp(6)
  last_update_uri_user String?      @map("_last_update_uri_user") @db.VarChar(80)
  last_update_date     DateTime     @map("_last_update_date") @db.Timestamp(6)
  parent_auri          String?      @map("_parent_auri") @db.VarChar(80)
  ordinal_number       Int          @map("_ordinal_number")
  top_level_auri       String?      @map("_top_level_auri") @db.VarChar(80)
  nome                 String?      @db.VarChar
  cpf                  String?      @db.VarChar(11)
  telefone             String?      @db.VarChar
  relacao              Int?
  relacao_outros       String?      @db.VarChar
  assinatura           String?      @db.VarChar
  id_organizacao       Int?
  
  organizacao          organizacao? @relation(fields: [id_organizacao], references: [id])
  relacao_relacao      relacao?     @relation(fields: [relacao], references: [id])
  
  @@schema("pinovara")
}
```

### Tabela: organizacao_indicador
```prisma
model organizacao_indicador {
  id                   Int          @id @default(autoincrement())
  uri                  String       @unique @map("_uri") @db.VarChar(80)
  creator_uri_user     String       @map("_creator_uri_user") @db.VarChar(80)
  creation_date        DateTime     @map("_creation_date") @db.Timestamp(6)
  last_update_uri_user String?      @map("_last_update_uri_user") @db.VarChar(80)
  last_update_date     DateTime     @map("_last_update_date") @db.Timestamp(6)
  parent_auri          String?      @map("_parent_auri") @db.VarChar(80)
  ordinal_number       Int          @map("_ordinal_number")
  top_level_auri       String?      @map("_top_level_auri") @db.VarChar(80)
  valor                Int?
  id_organizacao       Int?
  
  organizacao          organizacao?  @relation(fields: [id_organizacao], references: [id])
  indicador_relacao    indicador?    @relation(fields: [valor], references: [id])
  
  @@schema("pinovara")
}
```

---

## 🔄 **Próximos Passos para Implementação**

### 1. Atualizar Prisma Schema
```bash
# Editar manualmente o arquivo backend/prisma/schema.prisma
# Adicionar todos os models e campos acima
```

### 2. Sincronizar com Banco
```bash
cd backend
npx prisma db pull    # Puxar schema atualizado do banco
npx prisma generate   # Gerar cliente Prisma
npm run build         # Rebuild do backend
```

### 3. Testar
```bash
# Reiniciar backend
./scripts/dev/dev-stop.sh
./scripts/dev/dev-start.sh
```

### 4. Implementar Interfaces (Futuro)
- Interface para gerenciar participantes
- Interface para gerenciar indicadores
- Formulário com novos campos (descrição, eixos, metodologia, etc)

---

## 📝 Resumo

**Total de novos itens:**
- ✅ 19 novos campos na tabela `organizacao`
- ✅ 3 novas tabelas auxiliares (`enfase`, `relacao`, `indicador`)
- ✅ 2 novas tabelas de relacionamento (`organizacao_participante`, `organizacao_indicador`)

**Status:** ❌ **NENHUM item existe no schema.prisma atual**

**Ação necessária:** Executar `npx prisma db pull` para sincronizar o schema com o banco de dados atualizado.

---

**Data do relatório:** 09/10/2025

