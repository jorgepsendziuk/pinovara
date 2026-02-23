import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMeuAcessoSemPapel } from '../hooks/useMeuAcessoSemPapel';
import Icon from './Icon';
import {
  BarChart,
  TrendingUp,
  Building,
  Clipboard,
  Plus,
  Map,
  Search,
  Users,
  Settings,
  Sliders,
  Package,
  Tag,
  Wrench,
  HardDrive,
  FileText,
  Smartphone,
  Link as LinkIcon,
  FormInput,
  Monitor,
  FileCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronExpand,
  Database,
  Archive,
  GraduationCap,
  Calendar,
  Home
} from 'lucide-react';

// Hook personalizado para detectar breakpoints responsivos
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState(() => {
    const width = window.innerWidth;
    if (width < 480) return 'mobile-sm';
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      if (width < 480) setScreenSize('mobile-sm');
      else if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { screenSize, isMobile, isTablet };
};

interface MenuItem {
  id: string;
  label: string;
  icon: string | React.ComponentType<any>; // Suporte para emoji ou componente Lucide
  path: string;
  module?: string;
  permission?: string;
  /** Código de permissão (ex: menu.organizacoes). Quando presente e user.permissions populado, usa hasPermissionCode. */
  permissionCode?: string;
  hideForRoles?: string[]; // Ocultar para roles específicos
  children?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const { user, hasPermission, hasPermissionCode, isCoordinator, isSupervisor, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasNoRoles = !user?.roles || user.roles.length === 0;
  const { data: acesso } = useMeuAcessoSemPapel(!!user && hasNoRoles);
  const { screenSize, isMobile, isTablet } = useResponsive();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['perfil-entrada', 'qualificacao-formacao', 'cadastro-familias']));
  const [sidebarTooltip, setSidebarTooltip] = useState<{ show: boolean; text: string; x: number; y: number }>({ show: false, text: '', x: 0, y: 0 });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const userExpandedRef = useRef<boolean>(false); // Track if user manually expanded

  const showSidebarHint = (e: React.MouseEvent, text: string) => {
    if (!isCollapsed || isMobile) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSidebarTooltip({
      show: true,
      text,
      x: rect.right + 10,
      y: rect.top + rect.height / 2
    });
  };

  const hideSidebarHint = () => {
    setSidebarTooltip(prev => ({ ...prev, show: false }));
  };

  const toggleMenu = (menuId: string) => {
    // Se o menu está colapsado, expandir primeiro
    if (isCollapsed && !isMobile) {
      setIsCollapsed(false);
      userExpandedRef.current = true; // Mark as user-expanded
    }
    
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Função para redimensionar sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    const minWidth = 200;
    const maxWidth = 400;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Função para ocultar/mostrar sidebar
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Event listeners para redimensionamento
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Ajustar largura quando colapsado
  useEffect(() => {
    if (isCollapsed) {
      setSidebarWidth(70);
    } else {
      setSidebarWidth(280);
    }
  }, [isCollapsed]);

  // Auto-collapse e responsividade baseada no tamanho da tela
  useEffect(() => {
    if (!isMobile) {
      setIsMobileOpen(false);
    }
    
    // Auto-colapsar em telas médias (tablets) e menores, se não foi expandido manualmente
    if (isTablet && !userExpandedRef.current) {
      setIsCollapsed(true);
    }
    
    // Ajustar largura baseada no tipo de dispositivo
    if (screenSize === 'mobile-sm') {
      setSidebarWidth(100); // Sidebar full-screen em mobile muito pequeno
    } else if (screenSize === 'mobile') {
      setSidebarWidth(280);
    } else if (screenSize === 'tablet') {
      setSidebarWidth(isCollapsed ? 70 : 260);
    } else {
      setSidebarWidth(isCollapsed ? 70 : 280);
    }
  }, [isMobile, isTablet, screenSize, isCollapsed]);

  const menuItems: MenuItem[] = [
    /* Perfil de Entrada e Plano de Gestão */
    {
      id: 'perfil-entrada',
      label: 'Perfil de Entrada e Plano de Gestão',
      icon: FileText,
      path: '/organizacoes/lista',
      module: 'organizacoes',
      permissionCode: 'menu.organizacoes',
      children: [
        {
          id: 'organizacoes',
          label: 'Organizações',
          icon: Building,
          path: '/organizacoes/lista',
          module: 'organizacoes'
        },
        {
          id: 'organizacoes-mapa',
          label: 'Mapa de Organizações',
          icon: Map,
          path: '/organizacoes/mapa',
          module: 'organizacoes'
        }
      ]
    },
    /* Qualificação e Formação Profissional */
    {
      id: 'qualificacao-formacao',
      label: 'Qualificação e Formação Profissional',
      icon: GraduationCap,
      path: '/qualificacoes',
      module: 'qualificacoes',
      permissionCode: 'menu.qualificacoes',
      children: [
        {
          id: 'qualificacoes',
          label: 'Planos de Qualificação',
          icon: GraduationCap,
          path: '/qualificacoes',
          module: 'qualificacoes'
        },
        {
          id: 'capacitacoes',
          label: 'Capacitações',
          icon: Calendar,
          path: '/capacitacoes',
          module: 'qualificacoes'
        }
      ]
    },
    /* Cadastro de Famílias */
    {
      id: 'cadastro-familias',
      label: 'Cadastro de Famílias',
      icon: Home,
      path: '/familias',
      module: 'supervisao_ocupacional',
      permissionCode: 'menu.supervisao',
      children: [
        {
          id: 'supervisao-glebas',
          label: 'Territórios',
          icon: Map,
          path: '/familias/territorios',
          module: 'supervisao_ocupacional'
        },
        {
          id: 'supervisao-familias',
          label: 'Famílias',
          icon: Users,
          path: '/familias',
          module: 'supervisao_ocupacional'
        },
        {
          id: 'supervisao-mapa',
          label: 'Mapa de Cadastros',
          icon: Map,
          path: '/familias/mapa',
          module: 'supervisao_ocupacional'
        }
      ]
    },
    {
      id: 'repositorio',
      label: 'Repositório',
      icon: Archive,
      path: '/repositorio',
    },
    
    // 🚧 ===== MÓDULOS EM DESENVOLVIMENTO - OCULTOS =====
    // Os módulos abaixo estão sendo desenvolvidos e foram temporariamente
    // ocultados para manter a interface limpa até estarem funcionais
    /*
    {
      id: 'diagnostico',
      label: 'Diagnóstico',
      icon: '🔍',
      path: '/diagnostico',
      module: 'diagnostico',
      children: [
        {
          id: 'diagnostico-questionarios',
          label: 'Questionários',
          icon: '📝',
          path: '/diagnostico/questionarios',
          module: 'diagnostico'
        },
        {
          id: 'diagnostico-relatorios',
          label: 'Relatórios de Diagnóstico',
          icon: '📊',
          path: '/diagnostico/relatorios',
          module: 'diagnostico'
        }
      ]
    },
    {
      id: 'associados',
      label: 'Associados',
      icon: '👥',
      path: '/associados',
      module: 'associados',
      children: [
        {
          id: 'associados-list',
          label: 'Lista de Associados',
          icon: '📋',
          path: '/associados',
          module: 'associados'
        },
        {
          id: 'associados-add',
          label: 'Adicionar Associado',
          icon: '➕',
          path: '/associados/add',
          module: 'associados'
        }
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: '📋',
      path: '/relatorios',
      module: 'relatorios',
      children: [
        {
          id: 'relatorios-individuais',
          label: 'Relatórios Individuais',
          icon: '👤',
          path: '/relatorios/individuais',
          module: 'relatorios'
        },
        {
          id: 'relatorios-coletivos',
          label: 'Relatórios Coletivos',
          icon: '👥',
          path: '/relatorios/coletivos',
          module: 'relatorios'
        },
        {
          id: 'relatorios-area',
          label: 'Relatórios por Área',
          icon: '🗺️',
          path: '/relatorios/area',
          module: 'relatorios'
        }
      ]
    },
    {
      id: 'mapas',
      label: 'Mapas',
      icon: '🗺️',
      path: '/mapas',
      module: 'mapas',
      children: [
        {
          id: 'mapas-visitas',
          label: 'Visitas',
          icon: '📍',
          path: '/mapas/visitas',
          module: 'mapas'
        },
        {
          id: 'mapas-areas',
          label: 'Áreas',
          icon: '🏗️',
          path: '/mapas/areas',
          module: 'mapas'
        },
        {
          id: 'mapas-camadas',
          label: 'Camadas Temáticas',
          icon: '📊',
          path: '/mapas/camadas',
          module: 'mapas'
        }
      ]
    },
    {
      id: 'pesquisa',
      label: 'Pesquisa',
      icon: '🔬',
      path: '/pesquisa',
      module: 'pesquisa',
      children: [
        {
          id: 'pesquisa-dados',
          label: 'Dados Tabulares',
          icon: '📊',
          path: '/pesquisa/dados',
          module: 'pesquisa'
        },
        {
          id: 'pesquisa-graficos',
          label: 'Gráficos e Visualizações',
          icon: '📈',
          path: '/pesquisa/graficos',
          module: 'pesquisa'
        },
        {
          id: 'pesquisa-export',
          label: 'Exportar Dados',
          icon: '📥',
          path: '/pesquisa/export',
          module: 'pesquisa'
        }
      ]
    },
    {
      id: 'tecnicos',
      label: 'Técnicos',
      icon: '👷',
      path: '/tecnicos',
      module: 'tecnicos',
      children: [
        {
          id: 'tecnicos-list',
          label: 'Lista de Técnicos',
          icon: '📋',
          path: '/tecnicos',
          module: 'tecnicos'
        },
        {
          id: 'tecnicos-add',
          label: 'Adicionar Técnico',
          icon: '➕',
          path: '/tecnicos/add',
          module: 'tecnicos'
        },
        {
          id: 'tecnicos-rotas',
          label: 'Rotas e Localização',
          icon: '🗺️',
          path: '/tecnicos/rotas',
          module: 'tecnicos'
        },
        {
          id: 'tecnicos-performance',
          label: 'Performance',
          icon: '📊',
          path: '/tecnicos/performance',
          module: 'tecnicos'
        }
      ]
    },
    {
      id: 'mobilizacao',
      label: 'Mobilização',
      icon: '🚀',
      path: '/mobilizacao',
      module: 'mobilizacao',
      children: [
        {
          id: 'mobilizacao-eventos',
          label: 'Eventos',
          icon: '🎪',
          path: '/mobilizacao/eventos',
          module: 'mobilizacao'
        },
        {
          id: 'mobilizacao-formularios',
          label: 'Formulários de Campo',
          icon: '📝',
          path: '/mobilizacao/formularios',
          module: 'mobilizacao'
        },
        {
          id: 'mobilizacao-presenca',
          label: 'Listas de Presença',
          icon: '📋',
          path: '/mobilizacao/presenca',
          module: 'mobilizacao'
        },
        {
          id: 'mobilizacao-midias',
          label: 'Fotos e Mídias',
          icon: '📸',
          path: '/mobilizacao/midias',
          module: 'mobilizacao'
        }
      ]
    },
    */
    {
      id: 'configuracao-odk',
      label: 'Configuração ODK',
      icon: Smartphone,
      path: '/configuracao-odk',
      module: 'configuracao'
    },
    /* Administração (apenas admin) */
    {
      id: 'administracao',
      label: 'Administração',
      icon: Settings,
      path: '/admin',
      module: 'sistema',
      permission: 'admin',
      permissionCode: 'sistema.admin',
      children: [
        {
          id: 'usuarios',
          label: 'Usuários',
          icon: Users,
          path: '/admin/users',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'roles',
          label: 'Módulos e Permissões',
          icon: Sliders,
          path: '/admin/roles',
          module: 'sistema',
          permission: 'admin',
          permissionCode: 'sistema.admin'
        },
        {
          id: 'audit-logs',
          label: 'Auditoria',
          icon: FileCheck,
          path: '/admin/audit-logs',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'analytics',
          label: 'Analytics e Métricas',
          icon: BarChart,
          path: '/admin/analytics',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'sync-odk',
          label: 'Sincronização ODK',
          icon: Database,
          path: '/admin/sync-odk',
          module: 'sistema',
          permission: 'admin'
        }
      ]
    }
  ];

  // Menu restrito para usuário sem papéis: apenas capacitações inscrito e organizações associadas
  const menuItemsSemPapel: MenuItem[] = [];
  if (hasNoRoles && acesso) {
    if (acesso.capacitacoesInscrito > 0) {
      menuItemsSemPapel.push({
        id: 'capacitacoes-sem-papel',
        label: 'Capacitações',
        icon: Calendar,
        path: '/capacitacoes',
        module: 'qualificacoes'
      });
    }
    if (acesso.organizacoesAssociadas > 0) {
      menuItemsSemPapel.push({
        id: 'organizacoes-sem-papel',
        label: 'Organizações',
        icon: Building,
        path: '/organizacoes/lista',
        module: 'organizacoes',
        children: [
          { id: 'organizacoes-lista', label: 'Organizações', icon: Building, path: '/organizacoes/lista', module: 'organizacoes' },
          { id: 'organizacoes-mapa', label: 'Mapa de Organizações', icon: Map, path: '/organizacoes/mapa', module: 'organizacoes' }
        ]
      });
    }
  }

  const itemsToRender = hasNoRoles ? menuItemsSemPapel : menuItems;

  const hasAccess = (item: MenuItem): boolean => {
    // Usuário sem papéis: todos os itens do menu restrito têm acesso
    if (hasNoRoles) return true;

    // Verificar se o item deve ser ocultado para roles específicos
    if (item.hideForRoles) {
      if (isCoordinator() && item.hideForRoles.includes('coordenador')) {
        return false;
      }
      if (isSupervisor() && item.hideForRoles.includes('supervisao')) {
        return false;
      }
    }

    // Quando role_permissions está populado, usar códigos de permissão
    if (item.permissionCode && user?.permissions && user.permissions.length > 0) {
      return hasPermissionCode(item.permissionCode);
    }

    // Fallback: verificação por module/role (antes do seed ou itens sem permissionCode)
    if (!item.permission) return true;
    if (!item.module) return true;
    return hasPermission(item.module, item.permission);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Fechar menu mobile apenas se clicar no overlay (::before)
    if (isMobile && isMobileOpen) {
      const target = e.target as HTMLElement;
      // Verifica se o clique foi diretamente no sidebar (não em seus filhos)
      if (target === e.currentTarget) {
        setIsMobileOpen(false);
      }
    }
  };

  // Handler para fechar menu ao clicar fora
  useEffect(() => {
    if (!isMobile || !isMobileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = sidebarRef.current;
      const hamburger = document.querySelector('.mobile-hamburger');
      
      if (
        sidebar && 
        !sidebar.contains(e.target as Node) &&
        hamburger &&
        !hamburger.contains(e.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileOpen]);

  const handleNavLinkClick = () => {
    // Em mobile, fechar o menu após clicar em um link
    if (isMobile) {
      setIsMobileOpen(false);
    }
    // Se o menu está colapsado no desktop/tablet, expandir para mostrar o conteúdo
    if (isCollapsed && !isMobile) {
      setIsCollapsed(false);
      userExpandedRef.current = true; // Mark as user-expanded
    }
  };

  // Função auxiliar para renderizar ícones
  const renderIcon = (icon: string | React.ComponentType<any>, size: number = 16, className: string = '') => {
    if (typeof icon === 'string') {
      // É um emoji
      return <Icon emoji={icon as any} size={size} className={className} />;
    } else {
      // É um componente Lucide
      const IconComponent = icon;
      return <IconComponent size={size} className={className} />;
    }
  };

  return (
    <>
      {/* Mobile hamburger button - always visible on mobile */}
      {isMobile && (
        <button
          className="mobile-hamburger"
          onClick={toggleSidebar}
          aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && isMobileOpen ? 'open' : ''} ${isResizing ? 'resizing' : ''} ${screenSize}`}
        style={{ 
          width: isMobile ? (screenSize === 'mobile-sm' ? '100vw' : '280px') : `${sidebarWidth}px`,
          maxWidth: screenSize === 'mobile-sm' ? '320px' : 'none'
        }}
        onClick={handleOverlayClick}
      >
        {/* Header: logo + toggle */}
      <div className="sidebar-header">
        <div className="sidebar-logo-section">
          <div className="sidebar-logo">
            <Link to="/pinovara" className="logo-link">
              <img
                src="/pinovara.png"
                alt="PINOVARA"
                className="sidebar-logo-image"
              />
              {!isCollapsed && (
                <span className="logo-text">PINOVARA</span>
              )}
            </Link>
          </div>
        </div>

        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isMobile ? (isMobileOpen ? 'Fechar menu' : 'Abrir menu') : (isCollapsed ? 'Expandir menu' : 'Recolher menu')}
        >
          {isMobile ? (
            isMobileOpen ? <X size={16} /> : <Menu size={16} />
          ) : (
            isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* User line - uma linha 100% logo abaixo do logo */}
      {!isCollapsed && user && (
        <Link to="/perfil" className="sidebar-user-line">
          <span className="sidebar-user-name">{user.name?.split(' ')[0]}</span>
          <span className="sidebar-user-role">{user.roles?.[0]?.name || 'Usuário'}</span>
        </Link>
      )}

      {/* Navigation - Com scroll */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {itemsToRender
            .filter(item => hasAccess(item))
            .map(item => (
              <li key={item.id} className="nav-item">
                {item.children && item.children.length > 1 ? (
                  <div>
                    <button
                      className={`nav-button ${isMenuActive(item) ? 'active' : ''}`}
                      onClick={() => toggleMenu(item.id)}
                      onMouseEnter={(e) => showSidebarHint(e, item.label)}
                      onMouseLeave={hideSidebarHint}
                    >
                      <span className="nav-icon">{renderIcon(item.icon, 16)}</span>
                      {!isCollapsed && (
                        <>
                          <span className="nav-label">{item.label}</span>
                          <span className="nav-arrow">
                            {expandedMenus.has(item.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </span>
                        </>
                      )}
                    </button>

                    {!isCollapsed && expandedMenus.has(item.id) && (
                      <ul className="nav-submenu">
                        {item.children
                          .filter(child => hasAccess(child))
                          .map(child => (
                            <li key={child.id}>
                              <Link
                                to={child.path}
                                className={`nav-link ${isActive(child.path) ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavLinkClick();
                                }}
                              >
                                <span className="nav-icon">{renderIcon(child.icon, 14)}</span>
                                <span className="nav-label">{child.label}</span>
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavLinkClick();
                    }}
                    onMouseEnter={(e) => showSidebarHint(e, item.label)}
                    onMouseLeave={hideSidebarHint}
                  >
                    <span className="nav-icon">{renderIcon(item.icon, 16)}</span>
                    {!isCollapsed && (
                      <span className="nav-label">{item.label}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="logout-button"
          onClick={handleLogout}
          title="Sair do sistema"
          onMouseEnter={(e) => showSidebarHint(e, 'Sair')}
          onMouseLeave={hideSidebarHint}
        >
          <span className="logout-icon"><LogOut size={16} /></span>
          {!isCollapsed && (
            <span className="logout-text">Sair</span>
          )}
        </button>
      </div>

      {/* Tooltip quando sidebar collapsed */}
      {sidebarTooltip.show && (
        <div
          className="sidebar-collapsed-tooltip"
          style={{
            position: 'fixed',
            left: `${sidebarTooltip.x}px`,
            top: `${sidebarTooltip.y}px`,
            transform: 'translateY(-50%)',
            zIndex: 10001,
            pointerEvents: 'none'
          }}
          onMouseEnter={() => setSidebarTooltip(prev => ({ ...prev, show: true }))}
          onMouseLeave={hideSidebarHint}
        >
          {sidebarTooltip.text}
        </div>
      )}

      {/* Redimensionador - só mostrar no desktop */}
      {!isCollapsed && !isMobile && (
        <div
          ref={resizeRef}
          className="sidebar-resizer"
          onMouseDown={handleMouseDown}
        >
          <div className="resizer-handle"></div>
        </div>
      )}
    </aside>
    </>
  );
};

export default Sidebar;
