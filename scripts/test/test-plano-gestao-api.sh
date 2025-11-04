#!/bin/bash

# Script de teste da API do Plano de Gestão
# Testa todas as funcionalidades para a organização 14

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001"
ORG_ID=14

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}   TESTE API - PLANO DE GESTÃO (Org $ORG_ID)${NC}"
echo -e "${BLUE}==========================================${NC}\n"

# 1. Login para obter token
echo -e "${YELLOW}1. Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jimxxx@gmail.com",
    "password": "[SENHA_REMOVIDA_DO_HISTORICO]"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro ao fazer login!${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo -e "Token: ${TOKEN:0:20}...\n"

# 2. Buscar plano de gestão atual
echo -e "${YELLOW}2. Buscando plano de gestão atual...${NC}"
PLANO_ATUAL=$(curl -s -X GET "$API_URL/organizacoes/$ORG_ID/plano-gestao" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✅ Plano de gestão obtido${NC}"
echo "$PLANO_ATUAL" | head -n 50
echo -e "\n"

# 3. Atualizar rascunho
echo -e "${YELLOW}3. Atualizando rascunho...${NC}"
RASCUNHO_RESPONSE=$(curl -s -X PUT "$API_URL/organizacoes/$ORG_ID/plano-gestao/rascunho" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rascunho": "Este é um rascunho de teste do Plano de Gestão via API.\n\nPontos discutidos na reunião:\n- Necessidade de melhorar a organização administrativa\n- Fortalecer a capacidade de comercialização\n- Investir em capacitação dos membros\n- Buscar novas parcerias comerciais\n\nPróximos passos:\n1. Agendar reunião com diretoria\n2. Levantar recursos disponíveis\n3. Definir cronograma de implementação\n\nEditado via API em: '"$(date '+%d/%m/%Y %H:%M:%S')"'"
  }')

echo "$RASCUNHO_RESPONSE"
if echo "$RASCUNHO_RESPONSE" | grep -q "sucesso"; then
  echo -e "${GREEN}✅ Rascunho atualizado com sucesso${NC}\n"
else
  echo -e "${RED}❌ Erro ao atualizar rascunho${NC}\n"
fi

# 4. Atualizar Ação 1 (Identificação do valor cultural)
echo -e "${YELLOW}4. Atualizando Ação 1 (Identificação do valor cultural)...${NC}"
ACAO1_RESPONSE=$(curl -s -X PUT "$API_URL/organizacoes/$ORG_ID/plano-gestao/acoes/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responsavel": "Comissão Cultural (3 membros) e Anciões da Comunidade",
    "data_inicio": "2025-02-01",
    "data_termino": "2025-06-30",
    "como_sera_feito": "Realizar rodas de conversa com anciões para resgatar histórias e saberes ancestrais. Documentar receitas tradicionais e técnicas de produção passadas de geração em geração. Identificar ingredientes nativos do território e seu uso cultural. Mapear rituais e celebrações que envolvem a produção alimentar.",
    "recursos": "Gravador de áudio, caderno de campo, fotografias históricas, apoio de antropólogo ou historiador local"
  }')

echo "$ACAO1_RESPONSE"
if echo "$ACAO1_RESPONSE" | grep -q "sucesso"; then
  echo -e "${GREEN}✅ Ação 1 atualizada (PENDENTE - amarelo)${NC}\n"
else
  echo -e "${RED}❌ Erro ao atualizar Ação 1${NC}\n"
fi

# 5. Atualizar Ação 2 (Análise do diferencial competitivo)
echo -e "${YELLOW}5. Atualizando Ação 2 (Análise do diferencial competitivo)...${NC}"
ACAO2_RESPONSE=$(curl -s -X PUT "$API_URL/organizacoes/$ORG_ID/plano-gestao/acoes/2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responsavel": "Gestor do empreendimento e Coordenador de Produção",
    "data_inicio": "2025-01-15",
    "data_termino": "2025-03-31",
    "como_sera_feito": "Mapear características únicas dos produtos: origem territorial, modo de produção artesanal, história da comunidade. Destacar a conexão direta com produtores locais e o impacto social positivo. Comparar com produtos similares no mercado para identificar vantagens competitivas. Elaborar documento síntese dos diferenciais.",
    "recursos": "Pesquisa de mercado, visita a feiras e eventos, análise de concorrentes, registro fotográfico dos processos"
  }')

echo "$ACAO2_RESPONSE"
if echo "$ACAO2_RESPONSE" | grep -q "sucesso"; then
  echo -e "${GREEN}✅ Ação 2 atualizada (PENDENTE - amarelo)${NC}\n"
else
  echo -e "${RED}❌ Erro ao atualizar Ação 2${NC}\n"
fi

# 6. Atualizar Ação 3 (Missão e visão) - CONCLUÍDA
echo -e "${YELLOW}6. Atualizando Ação 3 (Missão e visão - CONCLUÍDA)...${NC}"
ACAO3_RESPONSE=$(curl -s -X PUT "$API_URL/organizacoes/$ORG_ID/plano-gestao/acoes/3" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responsavel": "Diretoria e Conselho Consultivo",
    "data_inicio": "2024-10-01",
    "data_termino": "2024-12-15",
    "como_sera_feito": "Realizadas 3 oficinas participativas com membros da comunidade para construção coletiva da missão e visão. Definida missão: Produzir alimentos saudáveis valorizando saberes ancestrais e promovendo desenvolvimento sustentável da comunidade. Visão: Ser referência regional em produtos agroecológicos de base comunitária até 2030.",
    "recursos": "Facilitador externo, material de apoio para oficinas, sistematização documental"
  }')

echo "$ACAO3_RESPONSE"
if echo "$ACAO3_RESPONSE" | grep -q "sucesso"; then
  echo -e "${GREEN}✅ Ação 3 atualizada (CONCLUÍDA - verde)${NC}\n"
else
  echo -e "${RED}❌ Erro ao atualizar Ação 3${NC}\n"
fi

# 7. Atualizar Ação 11 (Desenvolvimento de identidade visual) - EM ANDAMENTO
echo -e "${YELLOW}7. Atualizando Ação 11 (Desenvolvimento de identidade visual - EM ANDAMENTO)...${NC}"
ACAO11_RESPONSE=$(curl -s -X PUT "$API_URL/organizacoes/$ORG_ID/plano-gestao/acoes/11" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responsavel": "Designer gráfico local e Comissão de Cultura",
    "data_inicio": "2025-03-01",
    "como_sera_feito": "Contratar designer sensível à cultura local. Realizar oficinas para colher referências visuais da comunidade (cores, símbolos, padrões tradicionais). Desenvolver logomarca que reflita identidade territorial. Criar manual de identidade visual incluindo paleta de cores, tipografia e aplicações. Validar propostas com a comunidade antes da finalização.",
    "recursos": "Designer gráfico, software de design, impressões para validação, registro de elementos culturais (fotografias, artesanato)"
  }')

echo "$ACAO11_RESPONSE"
if echo "$ACAO11_RESPONSE" | grep -q "sucesso"; then
  echo -e "${GREEN}✅ Ação 11 atualizada (PENDENTE sem fim - amarelo)${NC}\n"
else
  echo -e "${RED}❌ Erro ao atualizar Ação 11${NC}\n"
fi

# 8. Atualizar Ação 12 (Diversificação de canais de vendas)
echo -e "${YELLOW}8. Atualizando Ação 12 (Diversificação de canais de vendas)...${NC}"
ACAO12_RESPONSE=$(curl -s -X PUT "$API_URL/organizacoes/$ORG_ID/plano-gestao/acoes/12" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responsavel": "Gestor comercial e Coordenador de logística",
    "data_inicio": "2025-02-15",
    "data_termino": "2025-08-31",
    "como_sera_feito": "Mapear feiras locais e regionais para participação regular (feiras agroecológicas, eventos culturais). Criar loja virtual em plataforma de comércio eletrônico (Instagram Shopping, Mercado Livre ou similar). Estabelecer parcerias com mercados, restaurantes e empórios que valorizam produtos locais. Participar de programas institucionais (PAA, PNAE).",
    "recursos": "Barraca para feiras, embalagens, transporte, internet, smartphone/computador, taxa de inscrição em eventos"
  }')

echo "$ACAO12_RESPONSE"
if echo "$ACAO12_RESPONSE" | grep -q "sucesso"; then
  echo -e "${GREEN}✅ Ação 12 atualizada (PENDENTE - amarelo)${NC}\n"
else
  echo -e "${RED}❌ Erro ao atualizar Ação 12${NC}\n"
fi

# 9. Buscar plano de gestão atualizado
echo -e "${YELLOW}9. Buscando plano de gestão atualizado...${NC}"
PLANO_FINAL=$(curl -s -X GET "$API_URL/organizacoes/$ORG_ID/plano-gestao" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✅ Plano de gestão final obtido${NC}\n"

# Extrair informações relevantes
echo -e "${BLUE}========== RESUMO DOS DADOS ==========${NC}"

echo -e "\n${YELLOW}📝 Rascunho:${NC}"
echo "$PLANO_FINAL" | grep -o '"plano_gestao_rascunho":"[^"]*' | sed 's/"plano_gestao_rascunho":"//; s/\\n/\n/g' | head -n 5
echo "..."

echo -e "\n${YELLOW}👤 Última edição por:${NC}"
echo "$PLANO_FINAL" | grep -o '"plano_gestao_rascunho_updated_by_name":"[^"]*' | sed 's/"plano_gestao_rascunho_updated_by_name":"//' | tr -d '"'

echo -e "\n${YELLOW}🕐 Editado em:${NC}"
echo "$PLANO_FINAL" | grep -o '"plano_gestao_rascunho_updated_at":"[^"]*' | sed 's/"plano_gestao_rascunho_updated_at":"//' | tr -d '"'

echo -e "\n${YELLOW}📊 Total de planos:${NC}"
echo "$PLANO_FINAL" | grep -o '"tipo":"[^"]*' | wc -l

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}✅ TESTE COMPLETO!${NC}"
echo -e "${BLUE}==========================================${NC}\n"

echo -e "${YELLOW}🌐 Agora acesse o sistema:${NC}"
echo -e "1. Navegue até a organização $ORG_ID"
echo -e "2. Clique em 'Plano de Gestão'"
echo -e "3. Verifique:"
echo -e "   ${GREEN}✅${NC} Rascunho preenchido com histórico"
echo -e "   ${GREEN}✅${NC} Ação 3 com fundo VERDE (concluída)"
echo -e "   ${GREEN}✅${NC} Ações 1, 2, 11, 12 com fundo AMARELO (pendentes)"
echo -e "   ${GREEN}✅${NC} Badges de status corretos\n"

