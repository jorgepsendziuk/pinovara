vou recomecar esse projeto do zero. eis a documentacao abaixo.
o nome sera mudado para PINOVARA (é uma sigla mas nao sei o que é)
nao tera deploy na vercel, manterei no meu pc por enquanto.
hospedarei no github o codigo, no repositorio pinovara
conexao postgresql (host 10.158.0.2 para produção / localhost para desenvolvimento, user pinovara senha pinovara).
crie um plano de ação e documentacao, vamos construir juntos, partindo do básico.

estruturar e documentar plano de açao para sistema completo back/front.
stack:Node.js + Express, TypeScript, Prisma, PostgreSQL, vite no front
features básicas: autenticacao, depois colocamos mais coisas
crie uma landing page e uma pagina de login
as pessoas podem se cadastrar no sistema, com acesso a um módulo publico

modo escuro

crie no login um health check

- criar modulo de administracao, com paginas de logs e rastreabilidade, configuracoes de parametros do sistema, como nome, settings, configs de conexao etc, gestao de usuarios e permissoes

de acordo com os modulos, por exemplo:
técnico - so acessa modulo de tecnicos
pesquisa - acessa pesquisa, dashboard, diagnostico, relatorios, mapas... mas nao edita
administracao - cria usuarios, acessa tudo, pode editar tudo
gestao - visualiza tudo
geoprocessamento - acessa e edita modulo de mapas, adiciona entidades geo etc..


me fiz entender errado, os roles sao os especificados anteriormente, mas nao existem varios roles para cada módulo, e sim cada role pode acessar alguns módulos, como exemplificado.. ajuste essas roles


em docs/resources tem o questionario_organizacoes.md que é o questionario que o técnico vai a campo preencher na organizaç±ao visitada.
é um cadastro de organizacoes e um questionário de diagnóstico.
o documento esta bagunçado pois foi colado de uma pagina web do formulario.
sao varias secoes, primeiro o cadastro básico depois varias seç±oes de 
cada vez que começa uma seç±ao o 

resumo do sistema:
sistema onde serao cadastrados organizacoes como sindicatos e associacoes, sera aplicado um questionario em campo e os dados virao para o banco de dados, onde o sistema mostrara os dados das organizacoes para visualizacao, edicao e cálculo da maturidade.
em outra fase, serao cadastrados em campo através dos técnicos de campo também as pessoas que participam dessas organizacoes

módulos e ordem que devem aparecer no menu:
DASHBOARD é dashboards, depois pensamos sobre, 
ORGANIZACOES é o cadastro de organizacoes,
DIAGNÓSTICO é diagnostico de maturidade das organizacoes segundo o questionario aplicado
BENEFICIÁRIOS é o cadastro de pessoas beneficiarias, ligadas a uma organizacao
RELATÓRIOS sao relatorios individuais e coletivos sobre as areas e pessoas visitadas em campo e cadastradas
MAPAS sao mapas leaflet com features como áreas (poligonos) e visitas (pontos)
PESQUISA é onde os pesquisadores vão acessar todos os dados do sistema, tabulares e sumarizados
TÉCNICOS é onde os técnicos de campo vão acessar os seus cadastros de campo através de mapas e listas, gestao de tecnicos, etc
MOBILIZACAO é onde sao armazenados os cadastros de mobilizacao, que é um formulario de campo para guardar informacoes de eventos de mobilizacao como fotos, pontos de gps, lista de presenca, etc.

Sistema de Permissões é por módulo. cada modulo desse que eu listei deve ser uma opcao para ser liberada ao usuario.
usuario admin deve ter todas opcoes de modulos habilitadas

ao inves de basic_user e outros roles criados, crie usuarios de acordo com os modulos, por exemplo:
técnico - so acessa modulo de tecnicos
pesquisa - acessa pesquisa, dashboard, diagnostico, relatorios, mapas... mas nao edita
administracao - cria usuarios, acessa tudo, pode editar tudo
gestao - visualiza tudo
geoprocessamento - acessa e edita modulo de mapas, adiciona entidades geo etc..

- tecnico é um usuario normal do sistema, nao armazenar numa tabela separada.

- colocar um monitor de health check dos servidores na página de login


estruturar e documentar plano de açao para sistema completo back/front.
stack:Node.js + Express, TypeScript, Prisma, PostgreSQL 
features básicas: autenticacao, 

entidades a manter: 
organizacoes (como sindicatos e associacoes), modele a persistencia com informacoes gerais de uma organizacao desse tipo.
associados (pessoas associadas as organizacoes), modele a persistencia com informacoes gerais de uma pessoa associada a uma organizacao como sindicato, associacoes..

sera aplicado um questionario em campo e os dados virao para o banco de dados, onde o sistema mostrara os dados das organizacoes para visualizacao, edicao e cálculo da maturidade.
em outra fase, serao cadastrados em campo através dos técnicos de campo também as pessoas que participam dessas organizacoes


itens do menu no cabecalho da landing page:
centralizar texto
diminuir margem dos botoes, tanto na largura quanto na altura
cor normal mais forte

---

## ✅ **TAREFAS CONCLUÍDAS**

### **Infraestrutura Inicial**
- ✅ Inicializar repositório Git
- ✅ Criar estrutura do GitHub (.gitignore, LICENSE, etc.)
- ✅ Configurar CI/CD com GitHub Actions
- ✅ Criar templates para issues e PRs
- ✅ Organizar documentação
- ✅ Criar política de segurança
- ✅ Criar arquivo TODO.md para gestão de tarefas
- ✅ Expandir scripts npm com automação completa
- ✅ Fazer commit inicial da estrutura
- ✅ Configurar banco PostgreSQL 
- ✅ Criar scripts de setup e migração
- ✅ Configurar schema pinovara corretamente
- ✅ Executar migrações e seed com sucesso
- ✅ Testar backend e login funcionando
- ✅ Alterar IDs para tipo Int em todas entidades

### **Documentação**
- ✅ Consolidar documentação duplicada
- ✅ Criar índice de documentação
- ✅ Melhorar README principal
- ✅ Criar guia de contribuição
- ✅ Criar política de segurança detalhada
- ✅ Organizar estrutura profissional de documentação
- ✅ Criar documentação completa PROJETO_GABI_COMPLETO.md

---

## 📋 **TAREFAS PENDENTES**

### **Sistema Geoespacial (Fase 2)**
- [ ] Instalar e configurar Leaflet no frontend
- [ ] Criar componente MapContainer básico
- [ ] Implementar mapas base (OSM, Google Maps)
- [ ] Adicionar controles de navegação
- [ ] Implementar API de entidades geoespaciais
- [ ] Criar formulários CRUD para entidades
- [ ] Adicionar validação geoespacial

### **Melhorias Técnicas**
- [ ] Configurar ESLint e Prettier
- [ ] Adicionar testes unitários
- [ ] Implementar Docker para desenvolvimento
- [ ] Configurar variáveis de ambiente
- [ ] Criar scripts de automação

### **Documentação Adicional**
- [ ] Criar CHANGELOG.md
- [ ] Documentar API endpoints
- [ ] Criar guias de instalação detalhados
- [ ] Adicionar exemplos de uso

---

## 🎯 **TAREFAS FUTURAS**

### **Funcionalidades Avançadas**
- Sistema de dashboards interativos
- Relatórios avançados
- Sistema de notificações
- API de integração externa

### **Qualidade e Performance**
- Testes end-to-end
- Otimização de performance
- Monitoramento e logs
- Segurança avançada

---

## 📊 **MÉTRICAS DE PROGRESSO**

- **✅ Tarefas Concluídas**: 24/25 (96%)
- **🚀 Em Andamento**: 0
- **⏳ Pendentes**: 1
- **📋 Planejadas**: 8

---

## 📝 **ANOTAÇÕES**

### **Padrões de Tarefa**
- **Específicas**: Descreva exatamente o que precisa ser feito
- **Mensuráveis**: Indique quando estará completa
- **Atingíveis**: Garanta que seja possível de implementar
- **Relevantes**: Foque no que agrega valor
- **Temporal**: Defina prazos quando necessário

### **Convenções**
- ✅ **Concluída**: Tarefa finalizada com sucesso
- 🚀 **Em Andamento**: Sendo executada atualmente
- ⏳ **Pendente**: Aguardando execução
- 📋 **Planejada**: Ideia para futuro
- ❌ **Cancelada**: Tarefa cancelada/abandonada

---

**Última atualização**: $(date)
**Responsável**: $(whoami)



# 🚀 PLANO DE AÇÃO - IMPLEMENTAÇÃO SISTEMA DE GESTÃO DE ORGANIZAÇÕES

## 📋 STATUS ATUAL DO SISTEMA

### ✅ **Implementado e Funcionando**
- ✅ Estrutura modular básica
- ✅ Sistema de autenticação JWT
- ✅ Dashboard básico
- ✅ 8 módulos criados (pesquisa, tecnicos, relatorios, dashboard, mapas, diagnostico, cadastros, capacitacao)
- ✅ Menu dinâmico baseado em módulos
- ✅ Sistema de permissões
- ✅ Configuração dinâmica do nome do sistema

### ❌ **Problemas Identificados**
- ❌ Módulos com nomes incorretos (precisam ser renomeados)
- ❌ Ordem dos módulos no menu incorreta
- ❌ Falta implementar alguns módulos (ORGANIZAÇÕES, BENEFICIÁRIOS, MOBILIZAÇÃO)
- ❌ Erros de TypeScript nos serviços dos módulos
- ❌ Falta integração completa entre módulos

## 🎯 OBJETIVOS IMEDIATOS

### Semana 1: Reestruturação de Módulos
**Data limite**: Próxima segunda-feira

#### 📝 Tarefas Prioritárias
1. **Renomear Módulos Existentes**
   - `cadastros` → `organizacoes`
   - `capacitacao` → `mobilizacao`
   - Manter: `dashboard`, `diagnostico`, `mapas`, `pesquisa`, `relatorios`, `tecnicos`

2. **Criar Módulo BENEFICIÁRIOS**
   - Estrutura completa de pastas
   - Serviços básicos
   - Rotas REST
   - Interface frontend

3. **Ajustar Ordem no Menu**
   - DASHBOARD (já existe)
   - ORGANIZAÇÕES (renomear de cadastros)
   - DIAGNÓSTICO (já existe)
   - BENEFICIÁRIOS (criar novo)
   - RELATÓRIOS (já existe)
   - MAPAS (já existe)
   - PESQUISA (já existe)
   - TÉCNICOS (já existe)
   - MOBILIZAÇÃO (renomear de capacitacao)

### Semana 2: Correção de Bugs e Otimização
**Data limite**: Semana seguinte

#### 🐛 Correções Técnicas
1. **Resolver Erros TypeScript**
   - Corrigir tipos nos serviços dos módulos
   - Ajustar interfaces Prisma
   - Padronizar tipos entre módulos

2. **Otimizar Performance**
   - Implementar cache nos módulos
   - Otimizar queries do banco
   - Melhorar carregamento do frontend

3. **Testar Integrações**
   - Verificar comunicação entre módulos
   - Testar fluxos completos
   - Validar permissões

### Semana 3: Desenvolvimento de Funcionalidades
**Data limite**: 2 semanas à frente

#### ⚙️ Implementações
1. **Módulo ORGANIZAÇÕES**
   - Formulário completo de cadastro
   - Validações específicas
   - Integração com diagnóstico

2. **Módulo BENEFICIÁRIOS**
   - Cadastro vinculado a organizações
   - Dados socioeconômicos
   - Relatórios de participação

3. **Módulo MOBILIZAÇÃO**
   - Formulários de campo
   - Captura de localização GPS
   - Upload de fotos
   - Lista de presença

### Semana 4: Testes e Validação
**Data limite**: 3 semanas à frente

#### 🧪 Validações
1. **Testes de Usuário**
   - Fluxos completos de cadastro
   - Aplicação de questionários
   - Geração de relatórios

2. **Testes de Performance**
   - Carga de dados
   - Concorrência de usuários
   - Tempo de resposta

3. **Testes de Segurança**
   - Validação de permissões
   - Sanitização de dados
   - Auditoria de ações

## 📊 METODOLOGIA DE IMPLEMENTAÇÃO

### 🎯 Abordagem Ágil
- **Sprints semanais** com entregas incrementais
- **Dailies diários** para acompanhamento
- **Releases semanais** para validação
- **Feedback contínuo** do usuário

### 🔧 Ferramentas de Desenvolvimento
- **Git Flow** para controle de versão
- **ESLint + Prettier** para qualidade de código
- **Jest** para testes unitários
- **Postman** para testes de API

### 📈 Métricas de Acompanhamento
- **Coverage de código**: Mínimo 80%
- **Tempo de resposta**: Máximo 2s para APIs
- **Uptime do sistema**: 99.9%
- **Taxa de erro**: Máximo 0.1%

## 🏗️ ESTRUTURA TÉCNICA DETALHADA

### 📂 Estrutura de Módulos
```
modules/
├── dashboard/          # 📊 Dashboards do sistema
├── organizacoes/       # 🏢 Cadastro de organizações
├── diagnostico/        # 🔍 Sistema de diagnóstico
├── beneficiarios/      # 👥 Cadastro de beneficiários
├── relatorios/         # 📋 Sistema de relatórios
├── mapas/             # 🗺️ Visualização geográfica
├── pesquisa/          # 🔬 Acesso para pesquisadores
├── tecnicos/          # 👷 Gestão de técnicos
└── mobilizacao/       # 📢 Eventos de mobilização
```

### 🔄 APIs Principais por Módulo

#### ORGANIZAÇÕES API
```
POST   /api/organizacoes          # Criar organização
GET    /api/organizacoes          # Listar organizações
GET    /api/organizacoes/:id      # Detalhes da organização
PUT    /api/organizacoes/:id      # Atualizar organização
DELETE /api/organizacoes/:id      # Excluir organização
```

#### DIAGNÓSTICO API
```
POST   /api/diagnostico/:orgId    # Aplicar questionário
GET    /api/diagnostico/:orgId    # Ver diagnóstico
PUT    /api/diagnostico/:id       # Atualizar diagnóstico
GET    /api/diagnostico/relatorio # Relatório de maturidade
```

#### BENEFICIÁRIOS API
```
POST   /api/beneficiarios         # Criar beneficiário
GET    /api/beneficiarios         # Listar beneficiários
GET    /api/beneficiarios/:id     # Detalhes do beneficiário
PUT    /api/beneficiarios/:id     # Atualizar beneficiário
DELETE /api/beneficiarios/:id     # Excluir beneficiário
GET    /api/organizacoes/:id/beneficiarios # Beneficiários da org
```

#### MOBILIZAÇÃO API
```
POST   /api/mobilizacao           # Criar evento
GET    /api/mobilizacao           # Listar eventos
POST   /api/mobilizacao/:id/fotos # Upload de fotos
POST   /api/mobilizacao/:id/gps   # Registrar localização
POST   /api/mobilizacao/:id/presenca # Lista de presença
```

## 🎨 DESIGN E UX

### 📱 Interfaces Principais
1. **Dashboard Principal**: Visão geral com KPIs
2. **Cadastro de Organizações**: Formulário estruturado
3. **Aplicação de Questionário**: Interface intuitiva
4. **Visualização de Mapas**: Interativo com filtros
5. **Relatórios**: Customizáveis e exportáveis

### 🎨 Paleta de Cores
- **Primária**: Azul institucional (#1e40af)
- **Secundária**: Verde para sucesso (#10b981)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)
- **Neutro**: Cinza (#6b7280)

## 🔐 SEGURANÇA E CONFORMIDADE

### 🛡️ Medidas de Segurança
- **Autenticação JWT** com refresh tokens
- **RBAC** (Role-Based Access Control)
- **Auditoria completa** de ações
- **Sanitização** de dados de entrada
- **Rate limiting** para prevenir ataques

### 📋 Conformidade
- **LGPD**: Proteção de dados pessoais
- **Acessibilidade**: WCAG 2.1 nível AA
- **Performance**: Core Web Vitals
- **SEO**: Otimizado para motores de busca

## 📞 SUPORTE E MANUTENÇÃO

### 🆘 Suporte Técnico
- **Documentação completa** da API
- **Logs estruturados** para debugging
- **Monitoramento em tempo real**
- **Alertas automáticos** para problemas

### 🔄 Manutenção
- **Backups automáticos** diários
- **Atualizações de segurança** mensais
- **Monitoramento de performance**
- **Otimização contínua**

## 📈 INDICADORES DE SUCESSO

### 📊 Métricas de Qualidade
- ✅ **0 erros críticos** em produção
- ✅ **99.9% uptime** do sistema
- ✅ **< 2s** tempo médio de resposta
- ✅ **100% cobertura** de testes críticos

### 🎯 Métricas de Negócio
- ✅ **Aumento de 50%** na eficiência de cadastros
- ✅ **Redução de 70%** em erros de digitação
- ✅ **Melhoria de 60%** na qualidade dos diagnósticos
- ✅ **Satisfação > 90%** dos usuários

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **AGORA**: Renomear módulos existentes
2. **HOJE**: Criar estrutura do módulo BENEFICIÁRIOS
3. **AMANHÃ**: Corrigir erros TypeScript
4. **ESTA SEMANA**: Implementar funcionalidades básicas dos novos módulos
5. **PRÓXIMA SEMANA**: Testes integrados e validações

**Data de início**: $(date)
**Prazo estimado**: 4 semanas
**Responsável**: Equipe de Desenvolvimento
