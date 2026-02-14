import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Mapeamento de rotas para títulos personalizados
const routeTitles: Record<string, string> = {
  '/': 'Bem-vindo',
  '/pinovara': 'Dashboard',
  '/login': 'Login',
  '/register': 'Cadastro',
  '/politica-privacidade': 'Política de Privacidade',
  '/parecer': 'Parecer Técnico - Aditivo Contrato PINOVARA',
  
  // Organizações
  '/organizacoes': 'Organizações',
  '/organizacoes/lista': 'Organizações / Lista',
  '/organizacoes/dashboard': 'Organizações / Dashboard',
  '/organizacoes/nova': 'Organizações / Nova',
  '/organizacoes/edicao': 'Organizações / Edição',
  
  // Perfil
  '/perfil': 'Meu Perfil',
  
  // Admin
  '/admin': 'Administração',
  '/admin/users': 'Administração / Usuários',
  '/admin/roles': 'Administração / Módulos e Permissões',
  '/admin/modules': 'Administração / Módulos e Permissões',
  '/admin/system-info': 'Administração / Informações do Sistema',
  '/admin/settings': 'Administração / Configurações',
  '/admin/audit-logs': 'Administração / Logs de Auditoria',
  '/admin/analytics': 'Administração / Analytics e Métricas',
  '/admin/sync-odk': 'Administração / Sincronização ODK',
  
  // ODK
  '/configuracao-odk': 'Configuração ODK',
  '/formulario-enketo': 'Formulário Enketo',
};

// Palavras para capitalizar corretamente
const properNouns: Record<string, string> = {
  'odk': 'ODK',
  'enketo': 'Enketo',
  'pinovara': 'PINOVARA',
  'gps': 'GPS',
  'cpf': 'CPF',
  'cnpj': 'CNPJ',
  'analytics': 'Analytics',
  'dashboard': 'Dashboard',
};

/**
 * Converte uma rota em um título amigável
 */
function routeToTitle(path: string): string {
  // Verifica se tem mapeamento direto
  if (routeTitles[path]) {
    return routeTitles[path];
  }
  
  // Verifica mapeamento parcial (útil para rotas dinâmicas como /organizacoes/edicao/123)
  for (const [route, title] of Object.entries(routeTitles)) {
    if (path.startsWith(route) && route !== '/') {
      return title;
    }
  }
  
  // Gera título automaticamente a partir da URL
  const segments = path
    .split('/')
    .filter(Boolean)
    .map(segment => {
      // Remove IDs numéricos
      if (/^\d+$/.test(segment)) {
        return null;
      }
      
      // Remove UUIDs
      if (/^[a-f0-9-]{36}$/i.test(segment)) {
        return null;
      }
      
      // Converte hífens e underscores em espaços
      let word = segment.replace(/[-_]/g, ' ');
      
      // Verifica se é uma palavra especial
      const lowerWord = word.toLowerCase();
      if (properNouns[lowerWord]) {
        return properNouns[lowerWord];
      }
      
      // Capitaliza primeira letra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .filter(Boolean);
  
  return segments.join(' / ') || 'PINOVARA';
}

/**
 * Hook para gerenciar o título da página automaticamente
 * 
 * @param customTitle - Título personalizado (opcional, sobrescreve o automático)
 * 
 * @example
 * // Uso básico (título automático baseado na rota)
 * usePageTitle();
 * 
 * @example
 * // Com título customizado
 * usePageTitle('Página Especial');
 */
export function usePageTitle(customTitle?: string) {
  const location = useLocation();
  
  useEffect(() => {
    let title: string;
    
    if (customTitle) {
      // Usa título customizado se fornecido
      title = customTitle;
    } else {
      // Gera título automaticamente baseado na rota
      title = routeToTitle(location.pathname);
    }
    
    // Atualiza o título do documento
    document.title = `PINOVARA${title ? ' - ' + title : ''}`;
    
    // Cleanup não é necessário pois o próximo useEffect irá atualizar
  }, [location.pathname, customTitle]);
}

/**
 * Adiciona um mapeamento customizado de rota para título
 * Útil para módulos dinâmicos
 */
export function addRouteTitle(route: string, title: string) {
  routeTitles[route] = title;
}

export default usePageTitle;

