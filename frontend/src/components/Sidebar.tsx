import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Hook personalizado para detectar se está em mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  module: string;
  permission?: string;
  children?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const { user, hasPermission, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['sistema']));
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menuId: string) => {
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

  // Fechar menu mobile automaticamente quando volta para desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileOpen(false);
    }
  }, [isMobile]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/pinovara',
      module: 'dashboard',
      children: [
        {
          id: 'dashboard-main',
          label: 'Dashboard Principal',
          icon: '📈',
          path: '/pinovara',
          module: 'dashboard'
        }
      ]
    },
    {
      id: 'organizacoes',
      label: 'Organizações',
      icon: '🏢',
      path: '/organizacoes',
      module: 'organizacoes',
      children: [
        {
          id: 'organizacoes-dashboard',
          label: 'Dashboard',
          icon: '📊',
          path: '/organizacoes/dashboard',
          module: 'organizacoes'
        },
        {
          id: 'organizacoes-list',
          label: 'Lista de Organizações',
          icon: '📋',
          path: '/organizacoes/lista',
          module: 'organizacoes'
        },
        {
          id: 'organizacoes-add',
          label: 'Adicionar Organização',
          icon: '➕',
          path: '/organizacoes/cadastro',
          module: 'organizacoes'
        },
        {
          id: 'organizacoes-mapa',
          label: 'Mapa',
          icon: '🗺️',
          path: '/organizacoes/mapa',
          module: 'organizacoes'
        }
      ]
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
      icon: '📱',
      path: '/configuracao-odk',
      module: 'configuracao',
      children: [
        {
          id: 'configuracao-odk-main',
          label: 'Configuração ODK Collect',
          icon: '🔗',
          path: '/configuracao-odk',
          module: 'configuracao'
        }
      ]
    },
    {
      id: 'visualizacao-formulario',
      label: 'Visualização do Formulário',
      icon: '📄',
      path: '/formulario-enketo',
      module: 'configuracao',
      children: [
        {
          id: 'visualizacao-formulario-main',
          label: 'Formulário Enketo',
          icon: '📝',
          path: '/formulario-enketo',
          module: 'configuracao'
        }
      ]
    },
    {
      id: 'administracao',
      label: 'Administração',
      icon: '⚙️',
      path: '/admin',
      module: 'sistema',
      permission: 'admin',
      children: [
        {
          id: 'admin-dashboard',
          label: 'Painel Admin',
          icon: '🎛️',
          path: '/admin',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'usuarios',
          label: 'Usuários',
          icon: '👥',
          path: '/admin/users',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'modulos',
          label: 'Módulos',
          icon: '📦',
          path: '/admin/modules',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'roles',
          label: 'Papéis',
          icon: '🏷️',
          path: '/admin/roles',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'configuracoes',
          label: 'Configurações',
          icon: '🔧',
          path: '/admin/settings',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'backup',
          label: 'Backup',
          icon: '💾',
          path: '/admin/backup',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'monitor',
          label: 'Monitor do Sistema',
          icon: '🔍',
          path: '/admin/monitor',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'audit-logs',
          label: 'Logs de Auditoria',
          icon: '📋',
          path: '/admin/audit-logs',
          module: 'sistema',
          permission: 'admin'
        },
        {
          id: 'system-info',
          label: 'Informações do Sistema',
          icon: '💻',
          path: '/admin/system-info',
          module: 'sistema',
          permission: 'admin'
        }
      ]
    }
  ];

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.permission) return true;
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
    // Fechar menu apenas se clicar no overlay ou no fundo do sidebar
    if (isMobile && e.target === e.currentTarget) {
      // Verifica se o clique foi em um elemento que deveria fechar o menu
      const target = e.target as HTMLElement;
      const isClickableElement = target.closest('.nav-button, .nav-link, .sidebar-toggle, .sidebar-logo, .user-compact-link');

      // Só fecha se não foi em um elemento clicável
      if (!isClickableElement) {
        setIsMobileOpen(false);
      }
    }
  };

  const handleNavLinkClick = () => {
    // Em mobile, fechar o menu após clicar em um link
    if (isMobile) {
      setIsMobileOpen(false);
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
          {isMobileOpen ? '✕' : '☰'}
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && isMobileOpen ? 'open' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{ width: isMobile ? '280px' : `${sidebarWidth}px` }}
        onClick={handleOverlayClick}
      >
        {/* Header */}
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

          {/* User Info - Embaixo da logo */}
          {!isCollapsed && user && (
            <Link to="/perfil" className="user-compact-link">
              <div className="user-compact">
                <div className="user-avatar-mini">
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="user-info-mini">
                  <span className="user-name-mini">
                    {user.name?.split(' ')[0]}
                  </span>
                  <span className="user-role-mini">
                    {user.roles?.[0]?.name || 'Usuário'}
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>

        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isMobile ? (isMobileOpen ? 'Fechar menu' : 'Abrir menu') : (isCollapsed ? 'Expandir menu' : 'Recolher menu')}
        >
          {isMobile ? (
            isMobileOpen ? '✕' : '☰'
          ) : (
            isCollapsed ? '→' : '←'
          )}
        </button>
      </div>

      {/* Navigation - Com scroll */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems
            .filter(item => hasAccess(item))
            .map(item => (
              <li key={item.id} className="nav-item">
                {item.children && item.children.length > 1 ? (
                  <div>
                    <button
                      className={`nav-button ${isMenuActive(item) ? 'active' : ''}`}
                      onClick={() => toggleMenu(item.id)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="nav-label">{item.label}</span>
                          <span className="nav-arrow">
                            {expandedMenus.has(item.id) ? '▼' : '▶'}
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
                                <span className="nav-icon">{child.icon}</span>
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
                  >
                    <span className="nav-icon">{item.icon}</span>
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
        >
          <span className="logout-icon">🚪</span>
          {!isCollapsed && (
            <span className="logout-text">Sair</span>
          )}
        </button>
      </div>

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
