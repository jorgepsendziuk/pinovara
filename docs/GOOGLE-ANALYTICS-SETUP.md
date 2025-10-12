# 📊 Configuração do Google Analytics no PINOVARA

## 🎯 Passo a Passo Completo

### 1. Criar Conta no Google Analytics

1. Acesse: https://analytics.google.com/
2. Faça login com sua conta Google (@ufba.br ou pessoal)
3. Clique em **"Começar a medir"**

### 2. Configurar Conta e Propriedade

**Nome da conta:** `PINOVARA` ou `UFBA - PINOVARA`

**Criar propriedade:**
- Nome: `Sistema PINOVARA`
- Fuso horário: `(GMT-03:00) Brasília`
- Moeda: `Real brasileiro (R$)`

**Informações da empresa:**
- Setor: `Educação` ou `Governo`
- Tamanho da empresa: Selecione conforme sua equipe
- Objetivos: `Gerar insights sobre os clientes`

### 3. Criar Fluxo de Dados Web

1. Escolha plataforma: **Web**
2. Configure:
   - **URL do site**: `https://app.pinovaraufba.com.br`
   - **Nome do fluxo**: `Site PINOVARA`
3. Clique em **"Criar fluxo"**

### 4. Obter o ID de Medição

Você receberá um **ID de Medição** no formato: `G-XXXXXXXXXX`

Exemplo: `G-1A2B3C4D5E`

---

## 🚀 Instalação no Sistema

### Opção 1: Variável de Ambiente (Recomendado)

1. **Desenvolvimento Local:**

Crie/edite o arquivo `.env.local` na pasta `frontend/`:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

2. **Produção:**

Adicione a variável de ambiente no servidor:

```bash
# No arquivo .env de produção
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. **Recompilar o frontend:**

```bash
cd frontend
npm run build
```

### Opção 2: Hardcoded (Mais Simples)

Edite o arquivo `frontend/src/components/GoogleAnalytics.tsx`:

```typescript
// Linha 4: Substitua pelo seu ID real
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // <- Coloque seu ID aqui
```

---

## ✅ Verificar Instalação

### 1. Via Console do Navegador

1. Abra o site: http://localhost:5173
2. Abra DevTools (F12)
3. Console deve mostrar: `Google Analytics inicializado: G-XXXXXXXXXX`

### 2. Via Google Analytics

1. Acesse: https://analytics.google.com/
2. Vá em **Relatórios** > **Tempo real**
3. Acesse seu site em outra aba
4. Deve aparecer **1 usuário ativo** em tempo real

### 3. Extensão do Chrome

Instale: [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)

---

## 📊 Métricas Disponíveis (Gratuitas)

### Dados em Tempo Real
- Usuários ativos agora
- Páginas visualizadas
- Localizações geográficas
- Dispositivos usados

### Relatórios de Aquisição
- De onde vêm os visitantes
- Fontes de tráfego (direto, busca, redes sociais)
- Campanhas de marketing

### Relatórios de Engajamento
- Páginas mais visitadas
- Tempo médio de sessão
- Taxa de rejeição
- Eventos personalizados

### Relatórios Demográficos
- Idade e sexo dos usuários
- Interesses
- Idioma
- Localização (cidade/estado/país)

### Relatórios Tecnológicos
- Navegadores usados
- Sistemas operacionais
- Dispositivos (desktop/mobile/tablet)
- Resoluções de tela

---

## 🎯 Eventos Personalizados

O sistema já está preparado para rastrear eventos customizados. Exemplos:

### No código React:

```typescript
import { useAnalytics } from '../components/GoogleAnalytics';

function MinhaComponente() {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    // Rastrear evento customizado
    trackEvent('botao_clicado', {
      categoria: 'organizacoes',
      acao: 'gerar_relatorio',
      label: 'relatorio_pdf'
    });
  };

  return <button onClick={handleClick}>Gerar Relatório</button>;
}
```

### Eventos Úteis para o PINOVARA:

```typescript
// Login de usuário
trackEvent('login', { method: 'email' });

// Cadastro de organização
trackEvent('cadastro_organizacao', { 
  estado: 'BA',
  municipio: 'Salvador' 
});

// Download de relatório
trackEvent('download', { 
  tipo: 'relatorio_pdf',
  organizacao_id: 123 
});

// Upload de fotos
trackEvent('upload_foto', { 
  organizacao_id: 123,
  quantidade: 5 
});

// Sincronização ODK
trackEvent('sincronizacao_odk', { 
  tipo: 'fotos',
  sucesso: true 
});
```

---

## 🔒 Privacidade e LGPD

O Google Analytics está em conformidade com a LGPD quando configurado corretamente:

### Configurações Recomendadas:

1. **Anonimizar IPs:**
   - Já configurado automaticamente no GA4
   
2. **Desativar remarketing:**
   - Google Analytics > Admin > Configurações da propriedade
   - Desmarque "Publicidade"

3. **Política de Privacidade:**
   - ✅ Já adicionada em `frontend/src/pages/PoliticaPrivacidade.tsx`
   - Menciona uso de cookies do Google Analytics

4. **Aviso de Cookies:**
   - ✅ Já implementado em `frontend/src/components/AvisoCookies.tsx`

---

## 📈 Dashboards e Relatórios Personalizados

### Criar Dashboard Personalizado:

1. Google Analytics > **Explorar** > **Criar novo**
2. Escolha **Modelo em branco**
3. Adicione métricas relevantes:
   - Total de usuários
   - Novos usuários
   - Sessões
   - Taxa de conversão (se configurar metas)

### Configurar Metas/Conversões:

1. Admin > **Eventos**
2. Marque eventos importantes como conversões:
   - `cadastro_organizacao`
   - `download_relatorio`
   - `sincronizacao_odk`

---

## 🆘 Troubleshooting

### Analytics não aparece nos relatórios

1. **Verificar ID de Medição:**
   - Deve estar no formato `G-XXXXXXXXXX`
   - Copie exatamente do Google Analytics

2. **Limpar cache do navegador:**
   ```bash
   Ctrl + Shift + Delete
   ```

3. **Verificar console do navegador:**
   - Deve mostrar: "Google Analytics inicializado"
   - Se não mostrar, verificar variável de ambiente

4. **Aguardar 24-48h:**
   - Primeiros dados podem demorar para aparecer
   - Use "Tempo Real" para testar imediatamente

### Bloqueadores de Ads

- Usuários com AdBlock não serão contados
- Normal ter ~30% de perda por bloqueadores
- Google Analytics é gratuito, essa é uma limitação conhecida

---

## 📚 Recursos Adicionais

- **Documentação oficial:** https://support.google.com/analytics
- **Academia Google Analytics:** https://analytics.google.com/analytics/academy/
- **Comunidade:** https://www.en.advertisercommunity.com/

---

## ✅ Checklist de Instalação

- [ ] Criar conta no Google Analytics
- [ ] Obter ID de Medição (G-XXXXXXXXXX)
- [ ] Adicionar ID no arquivo `.env.local`
- [ ] Recompilar frontend (`npm run build`)
- [ ] Testar em modo desenvolvimento
- [ ] Verificar no Google Analytics > Tempo Real
- [ ] Configurar em produção
- [ ] Criar dashboards personalizados (opcional)
- [ ] Configurar eventos customizados (opcional)

---

**Data:** 12/10/2025  
**Status:** ✅ Componente implementado, aguardando configuração do ID  
**Versão:** 1.0

