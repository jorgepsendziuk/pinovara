# 📋 Manual de Validação de Cadastros - Coordenador

## 🎯 Nova Funcionalidade: Validação de Organizações

### O que é?

A funcionalidade de **Validação** permite que coordenadores e administradores revisem e aprovem os cadastros de organizações realizados pelos técnicos, garantindo a qualidade e consistência dos dados no sistema.

---

## 🔐 Quem Pode Acessar?

- ✅ **Coordenadores** - Acesso completo para validar organizações
- ✅ **Administradores** - Acesso completo para validar organizações
- ❌ **Técnicos** - Apenas visualizam o status (não podem editar)

---

## 📍 Como Acessar?

### 1️⃣ Acesse a Lista de Organizações

1. No menu lateral, clique em **"Organizações"**
2. Selecione **"Lista de Organizações"**
3. Você verá a lista completa de todas as organizações cadastradas

### 2️⃣ Identifique o Status de Validação

Na lista, cada organização possui um **badge colorido** na coluna "Validação":

- 🕐 **Cinza** - NÃO VALIDADO (aguardando análise)
- ✅ **Verde** - VALIDADO (aprovado)
- ⚠️ **Amarelo** - PENDÊNCIA (necessita correções)
- ❌ **Vermelho** - REPROVADO (não aprovado)

### 3️⃣ Clique no Badge para Validar

1. **Clique no badge de status** da organização que deseja validar
2. Um **popup** será aberto com os campos de validação
3. O badge tem efeito visual ao passar o mouse (aumenta de tamanho)

---

## 🖥️ Tela de Validação

### Informações Exibidas:

**Cabeçalho:**
- Nome da organização
- Título: "Validação do Cadastro"

**Dados Atuais:**
- **Data de Validação** - Quando foi validado pela última vez
- **Validado por** - Nome do coordenador/admin que realizou a validação
- **Observações** - Comentários da validação anterior (se houver)

### Campos Editáveis:

#### 1. Status da Validação (Obrigatório)

Selecione um dos status disponíveis:

- 🕐 **NÃO VALIDADO**
  - Use para organizações que ainda não foram analisadas
  - Status padrão de novos cadastros

- ✅ **VALIDADO**
  - Use quando todos os dados estão corretos e completos
  - Organização aprovada e pronta para uso

- ⚠️ **PENDÊNCIA**
  - Use quando há dados faltantes ou que precisam ser corrigidos
  - Técnico precisa complementar informações

- ❌ **REPROVADO**
  - Use para cadastros com problemas graves
  - Dados incorretos ou duplicados

#### 2. Observações (Opcional)

- Campo de texto livre para comentários
- Use para:
  - Explicar o motivo de pendência ou reprovação
  - Indicar quais campos precisam ser corrigidos
  - Deixar orientações para o técnico
  - Registrar observações importantes

**Exemplos:**
```
"Falta informar o CNPJ da organização"
"Telefone inválido - verificar com representante"
"Dados completos e corretos. Aprovado!"
"Endereço incompleto - falta número e CEP"
```

---

## ✅ Como Validar uma Organização

### Passo a Passo:

1. **Abra a Lista de Organizações**
   - Menu: Organizações → Lista de Organizações

2. **Localize a Organização**
   - Use a busca se necessário
   - Filtre por origem (ODK/Web) se desejar

3. **Clique no Badge de Status**
   - O popup de validação abrirá

4. **Revise os Dados**
   - Analise se as informações estão completas
   - Verifique se há inconsistências

5. **Selecione o Status Adequado**
   - Clique no botão do status correspondente
   - Os botões ficam destacados quando selecionados

6. **Adicione Observações (se necessário)**
   - Digite comentários no campo de texto
   - Seja claro e específico

7. **Clique em "Salvar Validação"**
   - Uma mensagem verde confirmará o salvamento
   - O popup fechará automaticamente em 1 segundo
   - A lista será atualizada com o novo status

---

## 💡 Dicas e Boas Práticas

### ✅ DO (Faça):

- **Valide regularmente** - Mantenha o fluxo de validação em dia
- **Seja específico nas observações** - Ajude o técnico a entender o que precisa ser corrigido
- **Use "Pendência"** para feedback construtivo - Melhor que reprovar de primeira
- **Documente problemas recorrentes** - Ajuda a melhorar o treinamento dos técnicos

### ❌ DON'T (Não faça):

- **Não deixe sem observação** - Principalmente em pendências e reprovações
- **Não seja genérico** - Evite "está errado" sem explicar o que
- **Não valide sem revisar** - Mesmo que confie no técnico, revise os dados principais

---

## 📊 Relatórios e Acompanhamento

### Visualização do Status

O status de validação aparece em várias telas:

1. **Lista de Organizações** - Badge colorido
2. **Dashboard** - Tabela de organizações recentes
3. **Detalhes da Organização** - Na aba de validação

### Filtros Úteis

Na lista de organizações, você pode:

- **Buscar por nome** - Use a barra de busca no topo
- **Filtrar por origem** - ODK Collect ou Sistema Web
- **Ordenar por ID** - Clique no cabeçalho da coluna

---

## 🔄 Fluxo de Trabalho Recomendado

### Ciclo de Validação:

1. **Técnico cadastra** a organização (via ODK ou Web)
   - Status inicial: 🕐 **NÃO VALIDADO**

2. **Coordenador revisa** os dados
   - Analisa completude e consistência

3. **Coordenador valida:**

   **Se OK:**
   - ✅ Status: **VALIDADO**
   - Observação: "Dados completos e corretos"
   
   **Se tem problemas:**
   - ⚠️ Status: **PENDÊNCIA**
   - Observação: "Falta informar CNPJ e endereço completo"

4. **Técnico corrige** (se necessário)
   - Atualiza os dados solicitados
   - Pode ver as observações do coordenador

5. **Coordenador valida novamente**
   - ✅ Status: **VALIDADO**
   - Observação: "Correções realizadas com sucesso"

---

## ❓ Perguntas Frequentes

### 1. Posso validar organizações de qualquer técnico?
**Sim**, coordenadores veem todas as organizações do sistema, independente de quem cadastrou.

### 2. O técnico é notificado quando eu valido?
**Não automaticamente no momento**, mas pode ver o status e observações ao acessar a organização.

### 3. Posso mudar uma validação depois de aprovar?
**Sim**, você pode reabrir o popup e alterar o status e observações quantas vezes precisar.

### 4. As observações ficam salvas?
**Sim**, todas as observações são registradas e podem ser consultadas posteriormente.

### 5. Quem validou fica registrado?
**Sim**, o sistema registra automaticamente seu nome e a data/hora da validação.

---

## 🆘 Suporte

Em caso de dúvidas ou problemas:

- **Email**: suporte@pinovara.ufba.br
- **Documentação**: https://pinovaraufba.com.br/docs
- **Sistema**: https://pinovaraufba.com.br

---

## 📅 Atualização

**Última atualização:** Outubro de 2025  
**Versão do Sistema:** 2.0  
**Funcionalidade:** Validação de Cadastros

---

**Desenvolvido por:** Equipe PINOVARA - UFBA  
**Para:** Coordenadores e Administradores do Sistema

