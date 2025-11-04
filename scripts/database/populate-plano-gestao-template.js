/**
 * Script para popular a tabela plano_gestao_acao_modelo com dados do template HTML
 * 
 * Este script extrai as ações do Plano de Gestão do arquivo HTML e gera
 * os comandos SQL INSERT para popular a tabela plano_gestao_acao_modelo.
 * 
 * Uso:
 *   node scripts/database/populate-plano-gestao-template.js > inserts.sql
 *   
 * Ou para aplicar diretamente:
 *   node scripts/database/populate-plano-gestao-template.js | psql $DATABASE_URL
 */

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo HTML
const htmlPath = path.join(__dirname, '../../docs/resources/plano de gestao empreendimentos.html');

// Estrutura de dados das ações do Plano de Gestão
// Manualmente extraído do HTML para garantir precisão
const acoesPlanoGestao = [
  // ========================================
  // PLANO DE GESTÃO E ESTRATÉGIAS (Foco nos Empreendimentos)
  // ========================================
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Definição da Proposta de Valor e Propósito do Empreendimento',
    acao: 'Identificação do valor cultural',
    hint_como_sera_feito: 'Definição de como o empreendimento reflete a sua identidade. Essa atividade deve dialogar com ingredientes e técnicas ancestrais (empreendimentos em territórios Quilombolas), resgate de saberes tradicionais e valorização do território.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 1
  },
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Definição da Proposta de Valor e Propósito do Empreendimento',
    acao: 'Análise do diferencial competitivo',
    hint_como_sera_feito: 'Levantamento de características particulares e diferenciais do empreendimento. Utilizar a história, a forma de produção ou a conexão direta com a comunidade como diferenciais.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 2
  },
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Definição da Proposta de Valor e Propósito do Empreendimento',
    acao: 'Missão e visão',
    hint_como_sera_feito: 'Elaboração, de forma simples e direta, a missão (o que o negócio faz e para quem) e a visão (onde o negócio quer chegar a longo prazo).',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 3
  },
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Construção do Plano de Ação para viabilização da proposta de valor e propósito',
    acao: 'Definição de objetivos estratégicos',
    hint_como_sera_feito: 'Utilizando como referências a missão e visão organizacional, estabelecer objetivos que levem a organização ao cumprimento da missão e atingimento da visão',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 4
  },
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Construção do Plano de Ação para viabilização da proposta de valor e propósito',
    acao: 'Estabelecimento de metas para os objetivos estabelecidos',
    hint_como_sera_feito: 'Realização de oficinas específicas para associar métricas às metas estabelecidas',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 5
  },
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Construção do Plano de Ação para viabilização da proposta de valor e propósito',
    acao: 'Desdobramento das metas em ações e tarefas',
    hint_como_sera_feito: 'Realização de oficinas para relacionamento das metas a ações e tarefas que levem ao seu atingimento.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 6
  },
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Estabelecimento de processo avaliativo',
    acao: 'Estabelecimento de indicadores financeiros',
    hint_como_sera_feito: 'Realização de oficinas e criação de estrutura de informações que permita o acompanhamento da evolução dos indicadores',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 7
  },
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Estabelecimento de processo avaliativo',
    acao: 'Estabelecimento de indicadores produtivos',
    hint_como_sera_feito: 'Realização de oficinas e criação de estrutura de informações que permita o acompanhamento da evolução dos indicadores',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 8
  },
  {
    tipo: 'gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    grupo: 'Estabelecimento de processo avaliativo',
    acao: 'Estabelecimento de indicadores sociais e culturais',
    hint_como_sera_feito: 'Realização de oficinas e criação de estrutura de informações que permita o acompanhamento da evolução dos indicadores',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 9
  },

  // ========================================
  // PLANO DE MERCADO E COMERCIALIZAÇÃO (Foco nos Empreendimentos)
  // ========================================
  {
    tipo: 'mercado-comercializacao',
    titulo: 'Plano de Mercado e Comercialização (Foco nos Empreendimentos)',
    grupo: 'Definição do Plano de Mercado',
    acao: 'Estabelecimento de estratégia de marketing',
    hint_como_sera_feito: 'Para o empreendimento em pauta, a divulgação dos produtos deve dialogar com a história do Empreendimento / comunidade. As redes sociais serão usadas para mostrar o processo de produção, as pessoas envolvidas e o Território (Assentamento / Quilombo) envolvido.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 10
  },
  {
    tipo: 'mercado-comercializacao',
    titulo: 'Plano de Mercado e Comercialização (Foco nos Empreendimentos)',
    grupo: 'Definição do Plano de Mercado',
    acao: 'Desenvolvimento de identidade visual',
    hint_como_sera_feito: 'Busca de identidade visual que crie conexão com o consumidor, refletindo a cultura da comunidade.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 11
  },
  {
    tipo: 'mercado-comercializacao',
    titulo: 'Plano de Mercado e Comercialização (Foco nos Empreendimentos)',
    grupo: 'Definição do Plano de Mercado',
    acao: 'Diversificação de canais de vendas',
    hint_como_sera_feito: 'Participação em feiras e eventos, comércio eletrônico e parcerias com o varejo.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 12
  },

  // ========================================
  // PLANO DE TECNOLOGIA E INOVAÇÃO (Foco nos Empreendimentos)
  // ========================================
  {
    tipo: 'tecnologia-inovacao',
    titulo: 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)',
    grupo: 'Desenvolver e utilizar tecnologias que qualifiquem a gestão',
    acao: 'Inclusão digital',
    hint_como_sera_feito: 'Capacitação no uso de ferramentas digitais para que os gestores possam se conectar, gerir o empreendimento e acessar novas oportunidades.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 13
  },
  {
    tipo: 'tecnologia-inovacao',
    titulo: 'Plano de Tecnologia e Inovação (Foco nos Empreendimentos)',
    grupo: 'Desenvolver e utilizar tecnologias que qualifiquem a gestão',
    acao: 'Controle de estoque e financeiro',
    hint_como_sera_feito: 'Uso de sistemas simplificados (planilhas ou aplicativos) para melhorar o controle de entradas e saídas, facilitando a tomada de decisão.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 14
  },

  // ========================================
  // PLANO JURÍDICO (Foco nos Empreendimentos)
  // ========================================
  {
    tipo: 'juridico',
    titulo: 'Plano Jurídico (Foco nos Empreendimentos)',
    grupo: 'Regularização e estruturação jurídica',
    acao: 'Formalização do empreendimento',
    hint_como_sera_feito: 'Assessoria para regularização da situação jurídica (abertura de CNPJ, MEI, cooperativa, etc.) conforme o modelo de negócio.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Consultores jurídicos e Facilitadores',
    ordem: 15
  },
  {
    tipo: 'juridico',
    titulo: 'Plano Jurídico (Foco nos Empreendimentos)',
    grupo: 'Regularização e estruturação jurídica',
    acao: 'Elaboração de contratos e acordos',
    hint_como_sera_feito: 'Criação de modelos de contratos (fornecedores, clientes, parcerias) para garantir segurança jurídica nas transações.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Consultores jurídicos e Facilitadores',
    ordem: 16
  },
  {
    tipo: 'juridico',
    titulo: 'Plano Jurídico (Foco nos Empreendimentos)',
    grupo: 'Regularização e estruturação jurídica',
    acao: 'Adequação a normas sanitárias e regulatórias',
    hint_como_sera_feito: 'Orientação sobre licenças necessárias (vigilância sanitária, ambiental, etc.) conforme o tipo de atividade.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Consultores especializados e Facilitadores',
    ordem: 17
  },

  // ========================================
  // PLANO FINANCEIRO (Foco nos Empreendimentos)
  // ========================================
  {
    tipo: 'financeiro',
    titulo: 'Plano Financeiro (Foco nos Empreendimentos)',
    grupo: 'Gestão e planejamento financeiro',
    acao: 'Elaboração de orçamento anual',
    hint_como_sera_feito: 'Projeção de receitas e despesas para o ano, permitindo planejamento e controle financeiro.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores e consultores financeiros',
    ordem: 18
  },
  {
    tipo: 'financeiro',
    titulo: 'Plano Financeiro (Foco nos Empreendimentos)',
    grupo: 'Gestão e planejamento financeiro',
    acao: 'Controle de fluxo de caixa',
    hint_como_sera_feito: 'Acompanhamento diário/semanal das entradas e saídas para evitar problemas de liquidez.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 19
  },
  {
    tipo: 'financeiro',
    titulo: 'Plano Financeiro (Foco nos Empreendimentos)',
    grupo: 'Gestão e planejamento financeiro',
    acao: 'Acesso a linhas de crédito',
    hint_como_sera_feito: 'Identificação de fontes de financiamento (PRONAF, cooperativas de crédito, etc.) e apoio na elaboração de propostas.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Consultores financeiros e Facilitadores',
    ordem: 20
  },
  {
    tipo: 'financeiro',
    titulo: 'Plano Financeiro (Foco nos Empreendimentos)',
    grupo: 'Gestão e planejamento financeiro',
    acao: 'Formação de preço de venda',
    hint_como_sera_feito: 'Cálculo correto dos custos de produção e definição de margem de lucro adequada para garantir sustentabilidade.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 21
  },

  // ========================================
  // PLANO DE PRODUÇÃO (Foco nos Empreendimentos)
  // ========================================
  {
    tipo: 'producao',
    titulo: 'Plano de Produção (Foco nos Empreendimentos)',
    grupo: 'Organização e qualificação da produção',
    acao: 'Padronização de processos produtivos',
    hint_como_sera_feito: 'Documentação dos processos de produção para garantir qualidade e replicabilidade.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores e técnicos especializados',
    ordem: 22
  },
  {
    tipo: 'producao',
    titulo: 'Plano de Produção (Foco nos Empreendimentos)',
    grupo: 'Organização e qualificação da produção',
    acao: 'Capacitação técnica',
    hint_como_sera_feito: 'Treinamentos em boas práticas de fabricação, manipulação de alimentos e técnicas específicas.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Técnicos especializados e Facilitadores',
    ordem: 23
  },
  {
    tipo: 'producao',
    titulo: 'Plano de Produção (Foco nos Empreendimentos)',
    grupo: 'Organização e qualificação da produção',
    acao: 'Gestão de fornecedores',
    hint_como_sera_feito: 'Estabelecimento de parcerias com fornecedores locais, priorizando matéria-prima de qualidade e preço justo.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 24
  },
  {
    tipo: 'producao',
    titulo: 'Plano de Produção (Foco nos Empreendimentos)',
    grupo: 'Organização e qualificação da produção',
    acao: 'Inovação de produtos',
    hint_como_sera_feito: 'Desenvolvimento de novos produtos ou variações dos existentes para ampliar portfólio e atender diferentes mercados.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores e técnicos',
    ordem: 25
  },

  // ========================================
  // PLANO DE COMUNICAÇÃO E MARKETING (Foco nos Empreendimentos)
  // ========================================
  {
    tipo: 'comunicacao-marketing',
    titulo: 'Plano de Comunicação e Marketing (Foco nos Empreendimentos)',
    grupo: 'Fortalecimento da marca e comunicação',
    acao: 'Criação de marca e storytelling',
    hint_como_sera_feito: 'Desenvolvimento de narrativa que conecte o produto à história da comunidade e do território.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores e designers',
    ordem: 26
  },
  {
    tipo: 'comunicacao-marketing',
    titulo: 'Plano de Comunicação e Marketing (Foco nos Empreendimentos)',
    grupo: 'Fortalecimento da marca e comunicação',
    acao: 'Gestão de redes sociais',
    hint_como_sera_feito: 'Capacitação para uso de Instagram, Facebook e WhatsApp Business para divulgação e vendas.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 27
  },
  {
    tipo: 'comunicacao-marketing',
    titulo: 'Plano de Comunicação e Marketing (Foco nos Empreendimentos)',
    grupo: 'Fortalecimento da marca e comunicação',
    acao: 'Participação em eventos e feiras',
    hint_como_sera_feito: 'Planejamento de participação em feiras locais, regionais e eventos culturais para ampliar visibilidade.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores e apoio institucional',
    ordem: 28
  },
  {
    tipo: 'comunicacao-marketing',
    titulo: 'Plano de Comunicação e Marketing (Foco nos Empreendimentos)',
    grupo: 'Fortalecimento da marca e comunicação',
    acao: 'Materiais de divulgação',
    hint_como_sera_feito: 'Criação de folders, cartões de visita, banners e material digital para fortalecer a identidade visual.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Designers e Facilitadores',
    ordem: 29
  },

  // ========================================
  // PLANO DE CAPACITAÇÃO E DESENVOLVIMENTO (Foco nos Empreendimentos)
  // ========================================
  {
    tipo: 'capacitacao-desenvolvimento',
    titulo: 'Plano de Capacitação e Desenvolvimento (Foco nos Empreendimentos)',
    grupo: 'Formação e qualificação das pessoas',
    acao: 'Capacitação em gestão de negócios',
    hint_como_sera_feito: 'Oficinas sobre empreendedorismo, administração, finanças e estratégias de crescimento.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores e instituições parceiras',
    ordem: 30
  },
  {
    tipo: 'capacitacao-desenvolvimento',
    titulo: 'Plano de Capacitação e Desenvolvimento (Foco nos Empreendimentos)',
    grupo: 'Formação e qualificação das pessoas',
    acao: 'Desenvolvimento de lideranças',
    hint_como_sera_feito: 'Identificação e formação de lideranças locais para garantir sucessão e continuidade do empreendimento.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores',
    ordem: 31
  },
  {
    tipo: 'capacitacao-desenvolvimento',
    titulo: 'Plano de Capacitação e Desenvolvimento (Foco nos Empreendimentos)',
    grupo: 'Formação e qualificação das pessoas',
    acao: 'Intercâmbio e visitas técnicas',
    hint_como_sera_feito: 'Organização de visitas a outros empreendimentos bem-sucedidos para troca de experiências.',
    hint_responsavel: 'Gestor do empreendimento',
    hint_recursos: 'Facilitadores e apoio institucional',
    ordem: 32
  }
];

/**
 * Escapa aspas simples para SQL
 */
function escapeSql(text) {
  if (!text) return null;
  return text.replace(/'/g, "''");
}

/**
 * Gera o comando INSERT para uma ação
 */
function gerarInsert(acao) {
  const tipo = escapeSql(acao.tipo);
  const titulo = escapeSql(acao.titulo);
  const grupo = acao.grupo ? `'${escapeSql(acao.grupo)}'` : 'NULL';
  const acaoTexto = escapeSql(acao.acao);
  const hintComoSeraFeito = acao.hint_como_sera_feito ? `'${escapeSql(acao.hint_como_sera_feito)}'` : 'NULL';
  const hintResponsavel = acao.hint_responsavel ? `'${escapeSql(acao.hint_responsavel)}'` : 'NULL';
  const hintRecursos = acao.hint_recursos ? `'${escapeSql(acao.hint_recursos)}'` : 'NULL';
  
  return `INSERT INTO pinovara.plano_gestao_acao_modelo 
  (tipo, titulo, grupo, acao, hint_como_sera_feito, hint_responsavel, hint_recursos, ordem, ativo)
VALUES 
  ('${tipo}', '${titulo}', ${grupo}, '${acaoTexto}', ${hintComoSeraFeito}, ${hintResponsavel}, ${hintRecursos}, ${acao.ordem}, true);`;
}

/**
 * Função principal
 */
function main() {
  console.log('-- ==========================================');
  console.log('-- POPULAÇÃO DA TABELA: plano_gestao_acao_modelo');
  console.log(`-- Data: ${new Date().toISOString()}`);
  console.log(`-- Total de ações: ${acoesPlanoGestao.length}`);
  console.log('-- ==========================================');
  console.log('');
  console.log('-- Limpar dados existentes (opcional - comentar se não quiser limpar)');
  console.log('-- DELETE FROM pinovara.plano_gestao_acao_modelo;');
  console.log('');
  console.log('-- Inserir ações do Plano de Gestão');
  console.log('');
  
  // Gerar INSERTs
  acoesPlanoGestao.forEach((acao, index) => {
    console.log(`-- Ação ${index + 1}: ${acao.acao}`);
    console.log(gerarInsert(acao));
    console.log('');
  });
  
  console.log('-- ==========================================');
  console.log('-- VERIFICAÇÃO');
  console.log('-- ==========================================');
  console.log('');
  console.log('-- Contar registros inseridos por tipo');
  console.log('SELECT tipo, COUNT(*) as total FROM pinovara.plano_gestao_acao_modelo GROUP BY tipo ORDER BY tipo;');
  console.log('');
  console.log('-- Total geral');
  console.log('SELECT COUNT(*) as total FROM pinovara.plano_gestao_acao_modelo;');
  console.log('');
  console.log('-- Listar todas as ações ordenadas');
  console.log('SELECT id, tipo, grupo, acao, ordem FROM pinovara.plano_gestao_acao_modelo ORDER BY ordem;');
}

// Executar
main();

