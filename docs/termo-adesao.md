# 📄 Termo de Adesão - PINOVARA

## 📋 Sobre

O **Termo de Adesão** é um documento oficial gerado automaticamente pelo sistema PINOVARA para comprovação junto ao INCRA no âmbito do TED nº 50/2023.

## 🎯 Funcionalidade

- **Geração automática**: Documento gerado em PDF com todos os dados preenchidos
- **Formatação profissional**: Layout com cabeçalho institucional e formatação adequada
- **Dados dinâmicos**: Informações da organização e representante preenchidas automaticamente

## 📍 Como Usar

### 1. Acessar Lista de Organizações
- Vá para o módulo **Organizações**
- Clique em **"Lista de Organizações"**

### 2. Gerar Termo de Adesão
- Na tabela de organizações, localize a organização desejada
- Na coluna **"Ações"**, clique no botão **"📄 PDF"**
- O documento será gerado e baixado automaticamente

## 📄 Estrutura do Documento

### Cabeçalho
- Logo e identificação do PINOVARA
- Universidade Federal da Bahia (UFBA)
- Instituto Nacional de Colonização e Reforma Agrária (INCRA)
- TED nº 50/2023

### Conteúdo
- Identificação completa da pessoa jurídica (nome, CNPJ, endereço)
- Dados do representante legal (nome, CPF, RG, função, endereço)
- Texto padrão do termo de adesão
- Espaço para assinatura e data

## 🔧 Dados Utilizados

O PDF utiliza os seguintes dados da organização:

**Dados da Organização:**
- Nome da organização
- CNPJ
- Endereço completo (logradouro, número, bairro, CEP)

**Dados do Representante:**
- Nome completo
- CPF
- RG
- Função
- Endereço completo

## 📁 Arquivos de Implementação

- `frontend/src/services/pdfService.ts` - Serviço de geração de PDF
- `frontend/src/pages/organizacoes/ListaOrganizacoes.tsx` - Interface com botão de geração
- `frontend/package.json` - Dependências (jspdf, html2canvas)

## 🛠️ Tecnologias Utilizadas

- **jsPDF**: Geração do arquivo PDF
- **html2canvas**: Conversão do HTML para imagem
- **React/TypeScript**: Interface e lógica

## 📝 Personalização

Para modificar o layout ou conteúdo do termo, edite o método `getTermoAdesaoHTML()` no arquivo `pdfService.ts`.

## ⚠️ Observações

- O documento é gerado no formato A4 (210x297mm)
- Utiliza fonte Arial e formatação profissional
- Data de geração é incluída automaticamente no rodapé
- Arquivo é salvo com nome baseado no nome da organização
