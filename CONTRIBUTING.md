# Contribuindo para PINOVARA

Obrigado por seu interesse em contribuir para o projeto PINOVARA! Este documento contém diretrizes e informações importantes para ajudar você a contribuir de forma efetiva.

## 📋 Como Contribuir

### 1. Preparação do Ambiente

Antes de começar a contribuir, certifique-se de ter configurado o ambiente de desenvolvimento:

#### Pré-requisitos
- Node.js (versão 18+)
- npm ou yarn
- PostgreSQL (já configurado externamente)

#### Configuração Inicial
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/pinovara.git
   cd pinovara
   ```

2. Instale as dependências:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie `backend/config.env` para `backend/.env`
   - Verifique as configurações do banco PostgreSQL

4. Execute as migrações do banco:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

### 2. Estrutura de Desenvolvimento

#### Back-end
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Estrutura**: Arquivos em `src/` compilados para `dist/`

#### Front-end
- **Linguagem**: TypeScript
- **Framework**: React
- **Build Tool**: Vite
- **Estrutura**: Arquivos em `src/`

### 3. Estrutura de Commits

Usamos Conventional Commits para manter um histórico claro e organizado:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação (não afeta código)
- `refactor:` - Refatoração de código
- `test:` - Testes
- `chore:` - Manutenção

#### Exemplos
```bash
feat: adicionar sistema de autenticação JWT
fix: corrigir validação de email no formulário
docs: atualizar README com instruções de deploy
refactor: otimizar consultas do banco de dados
```

### 4. Processo de Contribuição

#### 1. Crie uma Branch
```bash
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

#### 2. Faça suas Mudanças
- Siga os padrões de código existentes
- Adicione testes quando necessário
- Mantenha a compatibilidade com versões anteriores

#### 3. Teste suas Mudanças
```bash
# Backend
cd backend
npm run build
npm run dev

# Frontend
cd frontend
npm run build
npm run dev
```

#### 4. Commit suas Mudanças
```bash
git add .
git commit -m "feat: descrição da funcionalidade"
```

#### 5. Push e Pull Request
```bash
git push origin feature/nome-da-feature
```

Abra um Pull Request no GitHub com:
- Título claro descrevendo a mudança
- Descrição detalhada do que foi implementado
- Referências a issues relacionadas (se aplicável)

### 5. Padrões de Código

#### TypeScript
- Use tipagem estática sempre que possível
- Evite `any` - use tipos específicos
- Mantenha interfaces bem definidas

#### React
- Use hooks funcionais
- Mantenha componentes pequenos e reutilizáveis
- Use TypeScript para props

#### Estilo
- Use nomes descritivos em português
- Mantenha consistência com o código existente
- Comente código complexo

### 6. Testes

- Execute os testes existentes antes de fazer mudanças
- Adicione testes para novas funcionalidades
- Certifique-se de que todos os testes passam

### 7. Documentação

- Atualize a documentação quando necessário
- Mantenha o README atualizado
- Documente APIs e componentes novos

## 📞 Suporte

Se você tiver dúvidas:
1. Verifique a documentação existente
2. Abra uma issue no GitHub
3. Entre em contato com a equipe de desenvolvimento

## 🎯 Código de Conduta

- Seja respeitoso e profissional
- Ajude outros contribuidores
- Mantenha foco nos objetivos do projeto
- Siga as melhores práticas de desenvolvimento

Obrigado novamente por contribuir para o PINOVARA! 🚀
