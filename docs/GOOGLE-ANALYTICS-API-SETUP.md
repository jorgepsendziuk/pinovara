# Configuração da API do Google Analytics (GA4)

## 📋 Visão Geral

Este guia explica como configurar a integração com a Google Analytics Data API para trazer métricas do Google Analytics diretamente para o painel administrativo do PINOVARA.

## 🎯 Recursos Disponíveis

Com a integração ativa, você terá acesso a:

### Métricas em Tempo Real
- Usuários ativos agora
- Visualizações de página
- Eventos em tempo real

### Métricas de Tráfego (7 dias)
- Total de usuários
- Novos usuários
- Sessões
- Duração média da sessão
- Taxa de rejeição

### Páginas Mais Visitadas
- Top 10 páginas
- Visualizações por página
- Tempo médio por página

### Distribuição por Dispositivos
- Desktop
- Mobile
- Tablet

### Localização dos Usuários
- País e cidade
- Top 10 localizações

### Eventos Personalizados
- Top 10 eventos mais comuns
- Contagem de eventos

## 🔧 Configuração

### 1. Obter o Property ID

O Property ID é um número que identifica sua propriedade do Google Analytics.

1. Acesse o [Google Analytics](https://analytics.google.com)
2. Clique em **Admin** (ícone de engrenagem no canto inferior esquerdo)
3. Na coluna **Property**, clique em **Property Settings**
4. Você verá o **Property ID** (um número como `123456789`)

### 2. Configurar o Service Account

O arquivo `service-account.json` já foi criado com as credenciais fornecidas e está localizado em:
```
/backend/service-account.json
```

**⚠️ IMPORTANTE:** Este arquivo contém credenciais sensíveis e **NÃO deve ser commitado** no Git. Ele já está no `.gitignore`.

### 3. Dar Permissões ao Service Account

O Service Account precisa ter acesso ao Google Analytics:

1. Acesse o [Google Analytics](https://analytics.google.com)
2. Clique em **Admin** (ícone de engrenagem)
3. Na coluna **Property**, clique em **Property Access Management**
4. Clique em **+ (Add Users)**
5. Adicione o email do Service Account:
   ```
   210078523053-compute@developer.gserviceaccount.com
   ```
6. Selecione o papel: **Viewer** (apenas leitura)
7. Clique em **Add**

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `/backend/.env` e adicione o Property ID:

```bash
# Google Analytics Configuration
GA_PROPERTY_ID="123456789"
```

Substitua `123456789` pelo seu Property ID real obtido no passo 1.

### 5. Instalar Dependências

Execute no diretório `/backend`:

```bash
npm install
```

Isso instalará o pacote `@google-analytics/data` necessário para a integração.

### 6. Reiniciar o Backend

```bash
npm run dev
```

## ✅ Verificação

Para verificar se a integração está funcionando:

1. Acesse o painel administrativo
2. Vá para **Admin > Analytics e Métricas**
3. As métricas do Google Analytics devem aparecer junto com as métricas internas do sistema

### Logs do Backend

Você verá logs indicando o status:

```
✅ Google Analytics Data API configurado com sucesso
📊 Buscando métricas do sistema...
✅ Métricas internas carregadas
📈 Buscando métricas do Google Analytics...
✅ Métricas do Google Analytics carregadas
```

Se algo estiver errado:

```
⚠️ Service Account não encontrado. Google Analytics desabilitado.
⚠️ GA_PROPERTY_ID não configurado. Google Analytics desabilitado.
⚠️ Google Analytics não está configurado. Retornando apenas métricas internas.
```

## 🔍 Solução de Problemas

### Erro: "Service Account não encontrado"

- Verifique se o arquivo `service-account.json` existe em `/backend/`
- Verifique as permissões do arquivo

### Erro: "GA_PROPERTY_ID não configurado"

- Verifique se a variável está no arquivo `.env`
- Certifique-se de que não há espaços extras
- Reinicie o servidor backend

### Erro: "Permission denied"

- Verifique se o Service Account foi adicionado ao Google Analytics
- Certifique-se de que tem pelo menos permissão de **Viewer**
- Pode levar alguns minutos para as permissões propagarem

### Erro ao instalar dependências

Se houver problemas com `npm install`:

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📊 Estrutura de Dados

### Resposta da API `/admin/analytics/metrics`

```json
{
  "success": true,
  "data": {
    "usuarios": { /* métricas internas */ },
    "organizacoes": { /* métricas internas */ },
    "tecnicos": { /* métricas internas */ },
    "qualidadeDados": { /* métricas internas */ },
    "atividades": { /* métricas internas */ },
    "googleAnalytics": {
      "realtime": {
        "activeUsers": 5,
        "screenPageViews": 123,
        "eventCount": 456
      },
      "traffic": {
        "totalUsers": 1234,
        "newUsers": 567,
        "sessions": 890,
        "averageSessionDuration": 180.5,
        "bounceRate": 0.35
      },
      "topPages": [
        {
          "page": "/organizacoes",
          "views": 450,
          "averageTime": 120.5
        }
      ],
      "devices": {
        "desktop": 800,
        "mobile": 400,
        "tablet": 34
      },
      "locations": [
        {
          "country": "Brazil",
          "city": "Salvador",
          "users": 500
        }
      ],
      "events": [
        {
          "eventName": "page_view",
          "eventCount": 2345
        }
      ]
    }
  },
  "timestamp": "2025-10-19T18:00:00.000Z"
}
```

## 📚 Referências

- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/production)
- [GA4 Property ID](https://support.google.com/analytics/answer/9539598)

## 🆘 Suporte

Se precisar de ajuda:

1. Verifique os logs do backend em `/logs/backend.log`
2. Teste o endpoint diretamente: `GET http://localhost:3001/admin/analytics/metrics`
3. Verifique as permissões do Service Account no Google Analytics

---

**Nota:** Mesmo sem a integração com o Google Analytics configurada, o sistema continuará funcionando normalmente com apenas as métricas internas do PINOVARA.


