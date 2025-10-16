# 🧪 Guia de Teste: Edição Completa de Organização

## 📋 Objetivo
Testar se TODOS os campos da organização estão sendo salvos corretamente através da interface de edição.

## 🎯 Organização de Teste
- **ID**: 14
- **Nome Atual**: TESTE Org Atualizada
- **URL**: http://localhost:5173/organizacoes/edicao/14

---

## ✅ Checklist de Campos para Testar

### 1️⃣ **Aba: Identificação**

#### 📝 Accordion: Dados Básicos
- [ ] Nome da Organização → Alterar para: `TESTE Completo 2025`
- [ ] CNPJ → Alterar para: `11.222.333/0001-44`
- [ ] Telefone → Alterar para: `(61) 99999-8888`
- [ ] Email → Alterar para: `teste.completo@pinovara.org`
- [ ] Data de Fundação → Alterar para: `15/01/2020`
- [ ] Estado → Verificar se mantém
- [ ] Município → Verificar se mantém

#### 🏠 Accordion: Endereço e Localização
- [ ] Logradouro → `Rua Nova Teste`
- [ ] Número → `1234`
- [ ] Bairro → `Bairro Central`
- [ ] Complemento → `Sala 500`
- [ ] CEP → `70000-000`
- [ ] GPS Latitude → Verificar valor
- [ ] GPS Longitude → Verificar valor

#### 👤 Accordion: Dados do Representante
- [ ] Nome → `Maria Silva Santos`
- [ ] CPF → `111.222.333-44`
- [ ] RG → `MG-11.222.333`
- [ ] Telefone → `(31) 98765-4321`
- [ ] Email → `maria.santos@email.com`
- [ ] Endereço do Representante → Preencher todos os campos
- [ ] Função → Alterar para opção diferente

#### 📁 Accordion: Documentos e Fotos
- [ ] Verificar se documentos carregam
- [ ] Verificar se fotos carregam

### 2️⃣ **Aba: Características dos Associados**

- [ ] Número Total de Sócios → `250`
- [ ] Sócios CAF → `180`
- [ ] Sócios PAA → `100`
- [ ] Sócios PNAE → `120`
- [ ] Ingressaram últimos 12 meses → `25`
- [ ] Campos de Mulheres/Homens por tipo → Preencher alguns
- [ ] Tipos de Café → Preencher distribuição

### 3️⃣ **Aba: Complementos** ⭐ (Nova posição)

#### 📄 Accordion: Descrição Geral
- [ ] Descrição → Escrever texto longo (100+ caracteres)

#### 📚 Accordion: Orientações Técnicas
- [ ] Eixos Trabalhados → `Gestão, Mercados, Finanças`
- [ ] Ênfase → Selecionar uma opção
- [ ] Metodologia → Escrever texto
- [ ] Orientações → Escrever texto

#### 🎯 Accordion: Indicadores
- [ ] Marcar 3-5 indicadores diferentes

#### 👥 Accordion: Participantes
- [ ] Menos de 10 participantes → Selecionar opção
- [ ] Se sim: adicionar alguns participantes

#### 💬 Accordion: Observações Finais
- [ ] Observações → Escrever texto

### 4️⃣ **Aba: Abrangência Geográfica**

- [ ] Adicionar 2-3 localizações de sócios
- [ ] Editar uma existente
- [ ] Deletar uma (se existir mais de 3)

### 5️⃣ **Aba: Associados Jurídicos**

- [ ] Adicionar 1 associado jurídico
- [ ] Editar nome e CNPJ
- [ ] Verificar salvamento

### 6️⃣ **Aba: Dados de Produção**

- [ ] Adicionar 2 culturas diferentes
- [ ] Preencher volume anual e valor médio
- [ ] Editar uma existente

### 7️⃣ **Aba: Diagnóstico** 🟤 (Cor marrom)

- [ ] Expandir Governança Organizacional
- [ ] Preencher 5+ respostas
- [ ] Adicionar comentários em 2-3 perguntas
- [ ] Adicionar propostas em 1-2 perguntas
- [ ] Testar outras áreas (Gestão de Pessoas, Financeira, etc)

### 8️⃣ **Aba: Plano de Gestão** 🟢 (Cor verde)

- [ ] Verificar se plano carrega
- [ ] Adicionar/editar dados do plano

### 9️⃣ **Aba: Validação** 🟡/🟢/🔴 (Cor dinâmica)

- [ ] Verificar se mostra status atual
- [ ] Verificar se mostra data de validação
- [ ] Verificar se mostra nome do validador
- [ ] Verificar se mostra observações
- [ ] Confirmar que NÃO tem botão de editar

---

## 🧪 Procedimento de Teste

### Passo 1: Preparação
```bash
# Verificar servidores
curl http://localhost:3001/health  # Backend deve retornar 200
curl http://localhost:5173         # Frontend deve retornar HTML
```

### Passo 2: Login
1. Acesse: http://localhost:5173
2. Faça login com: `jimxxx@gmail.com` / `[SENHA_REMOVIDA_DO_HISTORICO]`

### Passo 3: Abrir Organização de Teste
1. Acesse diretamente: http://localhost:5173/organizacoes/edicao/14
2. Aguarde carregar todos os dados

### Passo 4: Modificar Campos
**Para cada aba:**
1. ✏️ Modifique 3-5 campos diferentes
2. ✏️ Use valores distintos e facilmente identificáveis
3. ✏️ Anote o que modificou

### Passo 5: Salvar
1. 💾 Clique no botão verde "Salvar Alterações" (canto inferior direito)
2. 👁️ Observe o toast de sucesso/erro aparecer
3. 📝 Se aparecer erro, anote a mensagem

### Passo 6: Verificar
1. 🔄 Recarregue a página (F5)
2. ✅ Verifique se os valores salvaram
3. 📋 Marque os campos que funcionaram

### Passo 7: Console do Navegador
Abra o console (F12) e observe:
- Erros em vermelho
- Warnings em amarelo
- Requisições de rede (aba Network)

---

## 🔍 Como Identificar Problemas

### ✅ Salvou Corretamente:
- Toast verde aparece: "Organização salva com sucesso!"
- Ao recarregar, valores permanecem alterados
- Sem erros no console

### ❌ Não Salvou:
- Toast vermelho aparece com mensagem de erro
- Valores voltam ao anterior ao recarregar
- Erros 500 no console/network

### ⚠️ Salva Parcialmente:
- Toast verde aparece
- Alguns campos salvam, outros não
- Verificar logs do backend

---

## 📊 Teste Rápido (5 minutos)

Se quiser testar rapidamente, foque nestes campos essenciais:

1. **Identificação** → Nome, Email, Telefone
2. **Representante** → Nome, CPF
3. **Características** → Total de Sócios
4. **Complementos** → Descrição, Observações
5. **Diagnóstico** → 2-3 respostas
6. **Validação** → Apenas visualizar

💾 Salvar e verificar se todos os 10+ campos modificados foram salvos.

---

## 🐛 Logs para Debug

Se encontrar problemas, verifique:

```bash
# Backend
tail -f /Users/jorgepsendziuk/Documents/pinovara/logs/backend.log

# Procurar por erros
grep -i "error\|erro" /Users/jorgepsendziuk/Documents/pinovara/logs/backend.log | tail -20
```

---

## 📝 Resultado Esperado

**100% dos campos devem salvar corretamente:**
- ✅ Dados básicos
- ✅ Endereços (organização e representante)
- ✅ Características numéricas
- ✅ Campos de texto (descrição, obs, metodologia)
- ✅ Campos de diagnóstico (respostas, comentários, propostas)
- ✅ Dados de complementos
- ✅ Validação (leitura apenas)

**Após salvar:**
1. Toast verde aparece
2. Recarregar mantém todos os valores
3. Sem erros 500 no console
4. Backend loga `PUT /organizacoes/14 - 200`

---

## 🎯 Status Atual dos Servidores

- ✅ **Backend**: http://localhost:3001 (healthy)
- ✅ **Frontend**: http://localhost:5173 (running)

**Pronto para testar!** 🚀

