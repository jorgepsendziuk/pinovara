# 👨‍🔧 Manual dos Técnicos - Sistema PINOVARA

## 🎯 Visão Geral

O sistema PINOVARA foi configurado com **14 usuários técnicos** que possuem **acesso limitado** aos próprios cadastros de organizações. Cada técnico só pode ver e editar organizações que ele próprio criou.

## 📋 Técnicos Cadastrados

| Nome | Email | ID |
|------|-------|-----| 
| MIQUEAS MARQUES DE LIMA | miqueaslima@estudante.ufscar.br | 6 |
| NILTON CARDOSO DIAS | cardosodiasagroflorestando@gmail.com | 7 |
| LUCIANA MOREIRA PUDENZI | lupudenzi@gmail.com | 8 |
| EVERTON LUIS SOARES | pedrasoares.setordeproducao@gmail.com | 9 |
| CRISTIANE APARECIDA ARRUDA | cristianearrudaapiai@gmail.com | 10 |
| DIANE DAYZE DE PROENÇA | dihzinha14@gmail.com | 11 |
| GABRIELA GOMES NASCIMENTO | gabigomesnas@gmail.com | 12 |
| OZIEL FERNANDO DOS REIS | oziel.fernando@gmail.com | 13 |
| HELEN PALUDETTO FIGARO | helenpaludettofigaro@gmail.com | 14 |
| JOSE ANGELO DA SILVA | zezinhodaagrovila2@gmail.com | 15 |
| WÉLBERTY ROGÉRIO GORDON | welbertygordon@gmail.com | 16 |
| ELIZETE SOUZA DA SILVA | dinha.agronomia@gmail.com | 17 |
| JENIFFER FRANCIELE DE PROENÇA | proencajeni0894@gmail.com | 18 |
| VALMIR ULISSES SEBASTIÃO | valmirulisses@yahoo.com.br | 19 |

## 🔐 Como Fazer Login

### Credenciais
- **📧 Email**: Usar o email da tabela acima
- **🔑 Senha**: **Igual ao email** (mesma string)

### URLs de Acesso
- **🌐 Desenvolvimento**: http://localhost:5174/
- **🚀 Produção**: https://pinovaraufba.com.br

### Exemplo de Login
```
Email: miqueaslima@estudante.ufscar.br
Senha: miqueaslima@estudante.ufscar.br
```

## 🚀 Funcionalidades Disponíveis

### ✅ O que os Técnicos PODEM fazer:

#### 🏢 Organizações
- **Criar** novas organizações
- **Visualizar** organizações criadas por ele
- **Editar** organizações criadas por ele
- **Excluir** organizações criadas por ele

#### 📊 Dashboard
- Acessar dashboard com estatísticas das suas organizações
- Ver resumo de dados dos cadastros próprios
- Acompanhar progresso do trabalho

#### 👤 Perfil
- Visualizar informações do próprio perfil
- Editar dados pessoais

### ❌ O que os Técnicos NÃO podem fazer:

#### 🚫 Restrições de Acesso
- **Não pode** ver organizações de outros técnicos
- **Não pode** editar organizações de outros técnicos
- **Não pode** acessar painel administrativo
- **Não pode** gerenciar usuários
- **Não pode** alterar roles/permissões

## 🔧 Como o Sistema Funciona

### 🏗️ Arquitetura de Segurança

1. **Autenticação**: Login com JWT token
2. **Autorização**: Role "técnico" no módulo "organizações"  
3. **Filtro Automático**: Sistema filtra automaticamente por `id_tecnico`
4. **Isolamento**: Cada técnico vê apenas seus dados

### 📝 Processo de Cadastro de Organização

1. Técnico faz login no sistema
2. Vai para **Organizações** > **Cadastrar**
3. Preenche dados da organização
4. Sistema automaticamente define `id_tecnico = user_id` do técnico
5. Organização fica vinculada ao técnico

### 🔍 Como o Filtro Funciona

```sql
-- O sistema automaticamente aplica este filtro:
WHERE organizacao.id_tecnico = [ID_DO_TECNICO_LOGADO]
```

## 📚 Guia Prático de Uso

### 1. **Primeiro Acesso**
   - Acesse a URL do sistema
   - Use email e senha (iguais)
   - Será redirecionado ao dashboard

### 2. **Cadastrar Primeira Organização**
   - Menu: **Organizações** > **Cadastrar** 
   - Preencha todos os dados obrigatórios
   - Clique em **Salvar**
   - Organização aparecerá na sua lista

### 3. **Visualizar Suas Organizações**
   - Menu: **Organizações** > **Lista**
   - Vê apenas organizações criadas por você
   - Pode filtrar, buscar e paginar

### 4. **Editar Organização**
   - Na lista, clique em **✏️ Editar**
   - Modifique os dados necessários
   - Salve as alterações

## 🛠️ Solução de Problemas

### 🔍 Problemas Comuns

#### "Não consigo fazer login"
- ✅ Verifique se email está correto
- ✅ Confirme que senha = email
- ✅ Verifique conexão com internet

#### "Não vejo organizações"
- ✅ Normal se é primeiro acesso (lista vazia)
- ✅ Você só vê organizações que criou
- ✅ Outros técnicos não veem suas organizações

#### "Erro ao criar organização"
- ✅ Verifique campos obrigatórios
- ✅ Aguarde um momento e tente novamente
- ✅ Entre em contato com administrador se persistir

## 📞 Suporte

### 🆘 Em caso de problemas:

1. **Problemas técnicos**: Contatar administrador do sistema
2. **Dúvidas de uso**: Consultar este manual
3. **Alteração de senha**: Solicitar ao administrador

### 📧 Contatos de Suporte
- **Sistema**: [administrador@pinovaraufba.com.br]
- **Técnico**: [suporte@pinovaraufba.com.br]

## 📊 Estatísticas do Sistema

- **🔧 Total de Técnicos**: 15 (incluindo 1 técnico existente)
- **👨‍💼 Administradores**: 2
- **🏢 Sistema**: Ativo e funcional
- **🔐 Segurança**: Implementada e testada

---

## 🎉 Status da Implementação

### ✅ Concluído
- [x] Role "técnico" criada
- [x] 14 usuários técnicos cadastrados
- [x] Sistema de filtro por técnico implementado  
- [x] Controle de acesso funcionando
- [x] Testes de login validados
- [x] API de organizações com permissões

### 🚀 Sistema Pronto para Uso!

O sistema está **100% funcional** e os técnicos podem começar a usar imediatamente com as credenciais fornecidas.

---
*Documento gerado em: 25/09/2025*  
*Versão do Sistema: PINOVARA v2.0*
