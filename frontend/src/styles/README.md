# PINOVARA - Design System

## 📋 Visão Geral

Sistema de design unificado do projeto PINOVARA, baseado no Dashboard do Usuário, com cores institucionais do projeto:
- **Marrom** (#3b2313) - Cor primária
- **Verde** (#056839) - Cor secundária  
- **Branco** (#ffffff) - Cor de destaque

## 📁 Estrutura de Arquivos

```
frontend/src/styles/
├── design-system.css  # Variáveis CSS, tokens de design
├── components.css     # Componentes reutilizáveis
├── layouts.css        # Layouts e estruturas de página
├── utilities.css      # Classes utilitárias
└── README.md          # Esta documentação
```

## 🎨 Cores do Sistema

### Cores Principais
```css
--primary-color: #3b2313;      /* Marrom */
--secondary-color: #056839;     /* Verde */
--accent-color: #ffffff;        /* Branco */
--success-color: #056839;       /* Verde */
--warning-color: #3b2313;       /* Marrom */
--danger-color: #8b4513;        /* Marrom escuro */
```

### Gradientes
```css
--primary-gradient: linear-gradient(135deg, #3b2313 0%, #056839 100%);
--secondary-gradient: linear-gradient(135deg, #056839 0%, #3b2313 100%);
```

## 🔤 Tipografia

### Font Family
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Font Sizes
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)

## 📏 Espaçamentos

```css
--spacing-xs: 0.5rem;    /* 8px */
--spacing-sm: 1rem;      /* 16px */
--spacing-md: 1.5rem;    /* 24px */
--spacing-lg: 2rem;      /* 32px */
--spacing-xl: 2.5rem;    /* 40px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

## 🎭 Sombras

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## 🔘 Componentes

### Botões
```html
<!-- Primário -->
<button class="btn btn-primary">Botão Primário</button>

<!-- Secundário -->
<button class="btn btn-secondary">Botão Secundário</button>

<!-- Outline -->
<button class="btn btn-outline">Botão Outline</button>

<!-- Tamanhos -->
<button class="btn btn-sm">Pequeno</button>
<button class="btn">Normal</button>
<button class="btn btn-lg">Grande</button>
```

### Cards
```html
<!-- Card simples -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Título</h3>
    <p class="card-subtitle">Subtítulo</p>
  </div>
  <div class="card-body">
    Conteúdo do card
  </div>
</div>

<!-- Stat Card -->
<div class="stat-card">
  <div class="stat-value">123</div>
  <div class="stat-label">Organizações</div>
</div>

<!-- Quick Access Card -->
<div class="quick-access-card">
  <div class="card-icon">
    <svg>...</svg>
  </div>
  <div class="card-content">
    <h3>Título</h3>
    <p>Descrição</p>
    <button class="btn">Ação</button>
  </div>
</div>
```

### Forms
```html
<div class="form-group">
  <label>Campo de Texto</label>
  <input type="text" placeholder="Digite aqui..." />
  <small>Texto de ajuda</small>
</div>

<div class="form-group">
  <label>Select</label>
  <select>
    <option>Opção 1</option>
  </select>
</div>
```

### Badges
```html
<span class="badge badge-primary">Primário</span>
<span class="badge badge-success">Sucesso</span>
<span class="badge badge-warning">Aviso</span>
<span class="badge badge-danger">Perigo</span>
```

## 📐 Layouts

### Page Header
```html
<div class="page-header">
  <div class="header-content">
    <h2>Título da Página</h2>
    <p>Descrição da página</p>
  </div>
  <div class="header-actions">
    <button class="btn btn-primary">Nova Ação</button>
  </div>
</div>
```

### Content Header (com gradiente)
```html
<div class="content-header">
  <div class="header-info">
    <h2>Título</h2>
    <p>Descrição</p>
  </div>
  <div class="header-actions">
    <button class="btn btn-outline">Ação</button>
  </div>
</div>
```

### Info Grid
```html
<div class="info-grid">
  <div class="info-item">
    <label>Campo</label>
    <span>Valor</span>
  </div>
  <!-- Mais items... -->
</div>
```

### Stats Grid
```html
<div class="stats-grid">
  <div class="stat-card">...</div>
  <div class="stat-card">...</div>
  <div class="stat-card">...</div>
</div>
```

## 🛠️ Classes Utilitárias

### Espaçamento
```html
<!-- Margin -->
<div class="m-sm">...</div>
<div class="mt-lg mb-md">...</div>

<!-- Padding -->
<div class="p-lg">...</div>
<div class="pt-sm pb-sm">...</div>
```

### Display & Flex
```html
<div class="d-flex justify-between align-center gap-md">...</div>
<div class="d-grid grid-cols-3 gap-lg">...</div>
```

### Texto
```html
<p class="text-center font-bold text-lg">...</p>
<p class="text-primary">...</p>
<p class="truncate">...</p>
```

### Background
```html
<div class="bg-primary">...</div>
<div class="bg-gradient-primary">...</div>
```

### Sombras e Bordas
```html
<div class="shadow-md rounded-lg">...</div>
<div class="border rounded-xl">...</div>
```

## 🎬 Animações

### Classes de animação
```html
<div class="fade-in">...</div>
<div class="fade-in-up">...</div>
<div class="slide-in-right">...</div>
```

### Hover effects
```html
<div class="hover-lift">...</div>
<div class="hover-scale">...</div>
<div class="hover-shadow">...</div>
```

## 📱 Responsividade

### Breakpoints
- Mobile: até 768px
- Tablet: 769px - 1024px
- Desktop: acima de 1024px

### Classes utilitárias
```html
<div class="hide-mobile">Oculto no mobile</div>
<div class="show-mobile">Visível apenas no mobile</div>
<div class="hide-tablet">Oculto no tablet</div>
```

## 🚀 Como Usar

### 1. Importação
Os arquivos CSS são importados automaticamente no `main.tsx`:

```typescript
import './styles/design-system.css';
import './styles/components.css';
import './styles/layouts.css';
import './styles/utilities.css';
import './App.css';
```

### 2. Ordem de Importação
**IMPORTANTE**: A ordem de importação deve ser mantida:
1. `design-system.css` - Variáveis e tokens
2. `components.css` - Componentes
3. `layouts.css` - Layouts
4. `utilities.css` - Utilitários
5. `App.css` - Estilos específicos

### 3. Uso em Componentes
```tsx
// Usar classes do design system
<button className="btn btn-primary">
  Salvar
</button>

// Combinar classes
<div className="card shadow-lg rounded-xl p-lg">
  <h3 className="text-xl font-bold mb-md">Título</h3>
  <p className="text-secondary">Conteúdo</p>
</div>

// Usar variáveis CSS inline quando necessário
<div style={{ 
  color: 'var(--primary-color)',
  padding: 'var(--spacing-md)'
}}>
  Conteúdo
</div>
```

## ✅ Aplicação nas Páginas

O design system foi aplicado nas seguintes páginas:
- ✅ Dashboard do Usuário (referência)
- ✅ Lista de Organizações
- ✅ Dashboard de Organizações
- ✅ Mapa de Organizações
- ✅ Edição de Organização

## 🎯 Padrões e Boas Práticas

### 1. Use variáveis CSS ao invés de valores fixos
```css
/* ❌ Não fazer */
.elemento {
  color: #3b2313;
  padding: 16px;
  border-radius: 8px;
}

/* ✅ Fazer */
.elemento {
  color: var(--primary-color);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
}
```

### 2. Prefira classes utilitárias para espaçamentos
```html
<!-- ❌ Não fazer -->
<div style="margin-bottom: 24px;">...</div>

<!-- ✅ Fazer -->
<div class="mb-md">...</div>
```

### 3. Use componentes padrão
```html
<!-- ❌ Não fazer -->
<button style="background: #3b2313; color: white; padding: 12px 24px;">
  Salvar
</button>

<!-- ✅ Fazer -->
<button class="btn btn-primary">
  Salvar
</button>
```

### 4. Mantenha consistência visual
- Use sempre as cores do sistema (marrom, verde, branco)
- Use os tamanhos de fonte definidos
- Use os espaçamentos padronizados
- Use as sombras e bordas definidas

## 🔄 Migração de Páginas Antigas

Para atualizar uma página antiga para o novo design system:

1. **Substituir cores hardcoded**
   - Azul (#667eea) → Marrom (#3b2313)
   - Roxo (#764ba2) → Verde (#056839)

2. **Usar classes de layout**
   - Trocar headers customizados por `.page-header` ou `.content-header`
   - Usar `.info-grid`, `.stats-grid` para grids

3. **Padronizar botões**
   - Substituir botões inline por classes `.btn` + variantes

4. **Aplicar classes utilitárias**
   - Substituir espaçamentos inline por classes utilitárias

## 📊 Benefícios

- ✅ **Consistência**: Todas as páginas seguem o mesmo padrão visual
- ✅ **Manutenibilidade**: Alterações centralizadas nos arquivos CSS
- ✅ **Performance**: Redução de código CSS duplicado (de 8440 para ~3000 linhas no App.css)
- ✅ **Escalabilidade**: Fácil adicionar novos componentes e páginas
- ✅ **Responsividade**: Layouts adaptáveis para mobile, tablet e desktop

## 🐛 Troubleshooting

### Estilos não aparecem
1. Verifique a ordem de importação no `main.tsx`
2. Limpe o cache do navegador
3. Verifique se o build foi executado corretamente

### Conflitos de estilos
1. Certifique-se que estilos específicos vêm depois do App.css
2. Use especificidade maior se necessário
3. Evite `!important` sempre que possível

## 📝 Changelog

### Versão 1.0.0 (16/10/2025)
- ✅ Criação do design system completo
- ✅ Extração de componentes do App.css
- ✅ Substituição de cores azul/roxo por marrom/verde
- ✅ Aplicação em páginas de organizações
- ✅ Redução de 8440 para ~3000 linhas no App.css

---

**Mantido por**: Equipe PINOVARA  
**Última atualização**: 16/10/2025


