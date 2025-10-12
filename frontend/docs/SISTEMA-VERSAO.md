# 🏷️ Sistema de Versão PINOVARA

Sistema integrado para exibição discreta de informações de versão do sistema, incluindo commit hash e timestamp do build.

## 📋 Componentes do Sistema

### 1. Script de Geração de Versão
- **Arquivo**: `scripts/generate-version.cjs`
- **Função**: Captura informações do Git e timestamp do build
- **Execução**: Automática durante o processo de build

### 2. Componente Visual
- **Arquivo**: `src/components/VersionIndicator.tsx`
- **Posições suportadas**: `top-left`, `top-right`, `bottom-left`, `bottom-right`
- **Temas**: `light`, `dark`, `auto` (adapta ao sistema)

### 3. Arquivo de Versão Gerado
- **Arquivo**: `src/version.ts` (gerado automaticamente)
- **Conteúdo**: Informações de commit, timestamp e branch

## 🎯 Localização dos Indicadores

### Landing Page (Pública)
- **Posição**: Canto superior direito
- **Tema**: Automático (adapta-se ao sistema)
- **Arquivo**: `src/pages/Landing.tsx`

### Área Logada
Indicadores presentes em todos os layouts principais:

- **Dashboard Principal**: `src/pages/Dashboard.tsx`
- **Painel Admin**: `src/components/AdminLayout.tsx`
- **Módulo Organizações**: `src/pages/modules/OrganizacoesModule.tsx`
- **Módulo Perfil**: `src/pages/modules/PerfilModule.tsx`

## 🔧 Como Funciona

### Processo de Build
1. **Geração de Versão**: Script captura hash do commit atual e timestamp
2. **Build do Frontend**: Vite compila a aplicação incluindo as informações de versão
3. **Deploy**: Informações ficam disponíveis na versão final

### Informações Capturadas
```typescript
{
  commitHash: 'hash-completo-do-commit',
  shortCommitHash: '7-primeiros-caracteres',
  buildTimestamp: 'ISO-8601-timestamp',
  buildDate: 'data-formatada-para-pt-BR',
  branchName: 'nome-do-branch',
  generated: true // indica se foi gerado com sucesso
}
```

## 💻 Interface do Usuário

### Modo Compacto
- **Visual**: Pequeno ponto colorido + hash curto
- **Cores**:
  - 🟢 Verde: Branch `main` com sucesso
  - 🔵 Azul: Outros branches com sucesso
  - 🟡 Amarelo: Modo fallback (informações limitadas)

### Modo Expandido
- **Ativação**: Clique no indicador compacto
- **Informações**: Commit, branch, data/hora do build, status
- **Ações**: Copiar informações para clipboard

### Tooltip
- **Ativação**: Hover sobre o indicador
- **Conteúdo**: Versão + timestamp resumidos

## 🚀 Scripts Disponíveis

### Geração Manual de Versão
```bash
npm run version:generate
```

### Build com Versão
```bash
npm run build        # Gera versão + build
npm run build:prod   # Instala deps + gera versão + build
```

## 📝 Workflow de Deploy

O GitHub Actions foi atualizado para incluir geração automática de versão:

```yaml
- name: 🎨 Build Frontend
  working-directory: ./frontend
  run: |
    echo "🎨 Building frontend..."
    npm ci
    echo "📝 Generating version info..."
    node scripts/generate-version.cjs
    npm run build
    echo "✅ Frontend built successfully"
```

## 🎨 Personalização

### Adicionando em Novos Componentes
```tsx
import VersionIndicator from '../components/VersionIndicator';

function MeuComponente() {
  return (
    <div>
      {/* Indicador discreto */}
      <VersionIndicator 
        position="top-right" 
        theme="auto" 
      />
      {/* Resto do componente */}
    </div>
  );
}
```

### Opções de Configuração
- **position**: Posicionamento na tela
- **theme**: Tema visual (claro/escuro/automático)
- **className**: Classes CSS adicionais

## 🔍 Monitoramento

### Verificação de Funcionamento
1. **Build Local**: Verifique se `src/version.ts` é gerado
2. **Interface**: Confirme se indicadores aparecem nas páginas
3. **Deploy**: Valide se informações são atualizadas após deploy

### Troubleshooting
- **Git não disponível**: Sistema usa modo fallback
- **Permissões**: Script precisa de acesso de leitura ao repositório Git
- **ES Modules**: Script usa extensão `.cjs` para compatibilidade

## 📱 Responsividade

- **Desktop**: Posicionamento conforme configurado
- **Mobile**: Automaticamente reposiciona para `bottom-right`
- **Telas pequenas**: Reduz tamanhos e ajusta layout

## ♿ Acessibilidade

- **Alto Contraste**: Suporte para modo de alto contraste
- **Movimento Reduzido**: Respeita preferência `prefers-reduced-motion`
- **Teclado**: Navegável via keyboard (Tab/Enter)
- **Screen Readers**: Textos apropriados para leitores de tela

## 📊 Performance

- **Bundle Size**: ~5KB adicional (JS + CSS minificado)
- **Renderização**: Componente otimizado com React hooks
- **Carregamento**: Não bloqueia renderização principal

---

## 🔧 Manutenção

### Atualizações do Sistema
- Informações são geradas automaticamente a cada build
- Não requer manutenção manual
- Sincronizado automaticamente com Git

### Monitoramento
- Verifique logs de build para possíveis erros
- Confirme funcionamento após mudanças no workflow
- Teste interface em diferentes dispositivos

---

**Versão do Sistema de Versão**: 1.0.0  
**Criado em**: Setembro 2025  
**Integração**: PINOVARA v4.2+
