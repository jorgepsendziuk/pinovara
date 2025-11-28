# Solução para Erro 500 - Validação do Plano de Gestão

## Problema
Erro 500 ao tentar salvar validação do plano de gestão, mesmo com os campos existindo no banco.

## Possíveis Causas

### 1. Prisma Client em Cache (Mais Provável)
O servidor em modo dev (ts-node-dev) pode estar usando uma versão antiga do Prisma Client em cache.

**Solução:**
1. Pare o servidor backend (Ctrl+C ou kill do processo)
2. Regenerar o Prisma Client:
   ```bash
   cd backend
   npm run prisma:generate
   ```
3. Reiniciar o servidor:
   ```bash
   npm run dev
   ```

### 2. Verificar se os Campos Existem no Prisma Client Gerado
Execute para verificar:
```bash
cd backend
npm run prisma:generate
```

O output deve mostrar: `✔ Generated Prisma Client`

### 3. Verificar Logs do Servidor
Após adicionar os logs, verifique o console do servidor quando tentar salvar. Os logs mostrarão:
- Dados recebidos
- ID da organização
- Erro específico do Prisma

## Logs Adicionados

Foram adicionados logs detalhados em:
- `backend/src/controllers/organizacaoController.ts` - método `updatePlanoGestaoValidacao`
- `backend/src/services/organizacaoService.ts` - método `updatePlanoGestaoValidacao`

## Próximos Passos

1. **Reinicie o servidor backend** para carregar o novo Prisma Client
2. **Tente salvar a validação novamente**
3. **Verifique os logs do servidor** para ver o erro específico
4. Se o erro persistir, compartilhe os logs do servidor para análise

## Comando para Reiniciar

```bash
# Parar o servidor atual (se estiver rodando)
# Depois:
cd backend
npm run dev
```

