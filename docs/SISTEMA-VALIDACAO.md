# Sistema de Validação de Organizações

## 📋 Visão Geral

O Sistema de Validação permite controlar a qualidade e aprovação dos cadastros de organizações, com diferentes níveis de acesso baseados em roles.

## 🎯 Status Disponíveis

| Status | Valor | Cor | Descrição |
|--------|-------|-----|-----------|
| NÃO VALIDADO | 1 | Cinza | Cadastro aguardando validação (padrão) |
| VALIDADO | 2 | Verde | Cadastro aprovado e validado |
| PENDÊNCIA | 3 | Amarelo | Cadastro com pendências a corrigir |
| REPROVADO | 4 | Vermelho | Cadastro reprovado |

## 👥 Permissões por Role

### Administrador
- ✅ Pode validar/reprovar/adicionar pendências
- ✅ Visualiza todos os cadastros
- ✅ Acesso total ao sistema de validação

### Coordenador
- ✅ Pode validar/reprovar/adicionar pendências
- ✅ Visualiza todos os cadastros
- ✅ Acesso total ao sistema de validação

### Técnico
- 👁️ Apenas visualiza o status de validação
- ❌ Não pode alterar o status
- 👁️ Vê apenas seus próprios cadastros (filtro híbrido)

## 🗄️ Estrutura no Banco

### Campos da tabela `organizacao`

```sql
validacao_status INTEGER DEFAULT 1       -- Status da validação (1,2,3,4)
validacao_usuario INTEGER                -- FK para users.id (quem validou)
validacao_data TIMESTAMP                 -- Data/hora da validação
validacao_obs TEXT                       -- Observações sobre a validação
```

### Script de Criação

Execute: `/scripts/database/add-validacao-fields.sql`

## 🖥️ Interface

### Aba de Validação (Edição)

Localização: `/organizacoes/edicao/:id` → Aba "Validação"

**Funcionalidades:**
- Visualização do status atual com badge colorido
- Histórico: data e usuário que validou
- Formulário de edição (admin/coordenador):
  - Dropdown para selecionar novo status
  - Campo de observações (textarea)
  - Botão "Salvar Validação"
- Legenda explicativa dos status

### Badges nas Listas/Dashboards

**Exibição:**
- Lista de Organizações: Coluna "Validação" com badge
- Dashboard: Coluna "Validação" com badge
- Mapa: Badge no popup de cada marcador

**Formato:**
- Ícone + Label (listas/dashboard expandido/popup)
- Apenas ícone (dashboard condensado)
- Tooltip mostrando o status completo

## 🔧 Componentes Técnicos

### Frontend

#### Componentes
- `Validacao.tsx` - Aba principal de validação
- `StatusValidacaoBadge` - Badge reutilizável de status

#### Helpers
```typescript
// utils/validacaoHelpers.tsx
export const STATUS_VALIDACAO = {
  NAO_VALIDADO: 1,
  VALIDADO: 2,
  PENDENCIA: 3,
  REPROVADO: 4,
}

getValidacaoConfig(status) // Retorna { label, cor, corFundo, icon }
StatusValidacaoBadge // Componente React do badge
```

### Backend

#### Campos Retornados
Todos os endpoints de listagem (`/organizacoes`, `/organizacoes/dashboard`) incluem:
```json
{
  "validacao_status": 1,
  "validacao_usuario": 5,
  "validacao_data": "2025-10-14T12:30:00Z",
  "validacao_obs": "Pendente correção de CNPJ"
}
```

## 📝 Fluxo de Validação

### 1. Cadastro Inicial
- Toda organização criada recebe `validacao_status = 1` (NÃO VALIDADO)

### 2. Revisão (Admin/Coordenador)
- Acessa aba "Validação" na edição
- Analisa os dados do cadastro
- Seleciona status apropriado:
  - **VALIDADO**: Dados corretos e completos
  - **PENDÊNCIA**: Dados incompletos/incorretos, com observação do que corrigir
  - **REPROVADO**: Cadastro rejeitado

### 3. Correção (Técnico)
- Visualiza status "PENDÊNCIA"
- Lê observações do validador
- Corrige os dados necessários
- Aguarda nova validação

### 4. Aprovação Final
- Admin/Coordenador revisa correções
- Altera status para "VALIDADO"
- Cadastro oficialmente aprovado

## 🎨 Design Visual

### Cores dos Status

```css
/* NÃO VALIDADO */
color: #9ca3af;
background: #f3f4f6;

/* VALIDADO */
color: #10b981;
background: #d1fae5;

/* PENDÊNCIA */
color: #f59e0b;
background: #fef3c7;

/* REPROVADO */
color: #ef4444;
background: #fee2e2;
```

### Ícones (Lucide React)

- NÃO VALIDADO: `Clock`
- VALIDADO: `CheckCircle`
- PENDÊNCIA: `AlertCircle`
- REPROVADO: `XCircle`

## 🚀 Uso Prático

### Exemplo: Validar Cadastro

1. **Admin/Coordenador** acessa edição da organização
2. Clica na aba "Validação"
3. Clica em "Alterar Validação"
4. Seleciona status: "VALIDADO"
5. Adiciona observação (opcional): "Dados conferidos e aprovados"
6. Clica em "Salvar Validação"
7. Sistema registra automaticamente usuário e data

### Exemplo: Marcar Pendência

1. **Admin/Coordenador** identifica problema no cadastro
2. Acessa aba "Validação"
3. Seleciona status: "PENDÊNCIA"
4. Observação: "CNPJ inválido - corrigir para 12.345.678/0001-90"
5. Salva
6. **Técnico** visualiza status amarelo e lê a observação
7. Corrige o CNPJ
8. Aguarda nova validação

## 📊 Relatórios e Análises

### Possíveis Análises (futuro)

- Total de cadastros por status
- Taxa de aprovação/rejeição
- Tempo médio de validação
- Principais motivos de pendência
- Performance por validador
- Cadastros aguardando validação

## 🔒 Segurança

- Apenas Admin e Coordenador podem alterar status
- Histórico de validação preservado (usuário + data)
- Técnicos têm acesso read-only
- Observações permitem rastreabilidade das decisões

## 📱 Responsividade

- Badges adaptativos (texto completo desktop, ícone mobile)
- Interface de validação responsiva
- Popups do mapa otimizados para mobile

---

**Última atualização:** 14/10/2025  
**Versão:** 1.0

