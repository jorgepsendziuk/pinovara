# Implementação de Histórico no Rascunho do Plano de Gestão

## 📝 Resumo

Adicionado sistema de rastreamento de edições no rascunho do Plano de Gestão, mostrando quem editou e quando.

## 🔧 Alterações Implementadas

### 1. Backend - Schema Prisma

**Arquivo:** `backend/prisma/schema.prisma`

Adicionados novos campos na tabela `organizacao`:
- `plano_gestao_rascunho_updated_by` (Int?) - ID do usuário que editou
- `plano_gestao_rascunho_updated_at` (DateTime?) - Data/hora da última edição

Relação adicionada:
- `users_organizacao_plano_gestao_rascunho_updated_byTousers` - Relação com a tabela `users`

### 2. Backend - Service

**Arquivo:** `backend/src/services/PlanoGestaoService.ts`

**Alterações:**
- Método `getPlanoGestao()` agora retorna:
  - `plano_gestao_rascunho_updated_by`
  - `plano_gestao_rascunho_updated_at`
  - `plano_gestao_rascunho_updated_by_name` (nome do usuário)

- Método `updateRascunho()` agora aceita `userId` e salva:
  - O texto do rascunho
  - O ID do usuário que editou
  - A data/hora da edição

### 3. Backend - Controller

**Arquivo:** `backend/src/controllers/PlanoGestaoController.ts`

**Alterações:**
- `updateRascunho()` agora extrai `userId` do token JWT
- Valida se o usuário está autenticado
- Passa o `userId` para o service

### 4. Frontend - Types

**Arquivo:** `frontend/src/types/planoGestao.ts`

**Interface `PlanoGestaoResponse` atualizada:**
```typescript
export interface PlanoGestaoResponse {
  plano_gestao_rascunho: string | null;
  plano_gestao_rascunho_updated_by: number | null;
  plano_gestao_rascunho_updated_at: string | null;
  plano_gestao_rascunho_updated_by_name?: string | null;
  planos: PlanoGestao[];
}
```

### 5. Frontend - UI

**Arquivo:** `frontend/src/pages/organizacoes/PlanoGestaoPage.tsx`

**Alterações:**
- Exibição de informações de edição abaixo do rascunho
- Badge azul mostrando: "Última edição: [Nome do Usuário] em [Data/Hora]"
- Formatação pt-BR para data e hora

## 📋 Funcionalidades

1. **Rastreamento Automático**: Ao salvar o rascunho, o sistema automaticamente registra:
   - Quem editou (nome do usuário)
   - Quando foi editado (data e hora)

2. **Exibição Visual**: Badge discreto com fundo azul claro mostrando as informações

3. **Formatação**: Data e hora no formato brasileiro (dd/mm/yyyy, hh:mm:ss)

## ⚠️ Observações Importantes

1. Os campos já existiam no banco de dados como `plano_gestao_rascunho_updated_by` e `plano_gestao_rascunho_updated_at`

2. O Prisma Client foi regenerado para reconhecer os novos campos no schema

3. O backend foi recompilado com sucesso

4. **NÃO** é necessário executar SQL adicional - os campos já existem no banco

## 🧪 Como Testar

1. Acesse uma organização no Plano de Gestão
2. Edite o rascunho/notas colaborativas
3. Salve as alterações
4. Observe o badge azul aparecer/atualizar com seu nome e a hora da edição

## 🎨 Estilo do Badge

```jsx
<div style={{
  marginTop: '8px',
  padding: '8px 12px',
  background: '#f0f9ff',
  borderLeft: '3px solid #3b82f6',
  borderRadius: '4px',
  fontSize: '13px',
  color: '#1e40af'
}}>
  <strong>Última edição:</strong> {nome} em {data/hora}
</div>
```

## ✅ Status

- ✅ Backend atualizado
- ✅ Frontend atualizado
- ✅ Tipos TypeScript atualizados
- ✅ Prisma Client regenerado
- ✅ Backend compilado
- ⏳ Aguardando restart dos servidores para teste

