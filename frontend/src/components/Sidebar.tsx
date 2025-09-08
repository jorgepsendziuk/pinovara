import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['sistema']));

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

  const menuItems: MenuItem[] = [
    {
      id: 'sistema',
      label: 'Sistema',
      icon: '🏠',
      path: '/pinovara',
      module: 'sistema',
      children: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: '📊',
          path: '/pinovara',
          module: 'sistema'
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
          label: 'Monitor',
          icon: '🔍',
          path: '/admin/monitor',
          module: 'sistema',
          permission: 'admin'
        }
      ]
    },
    {
      id: 'auditoria',
      label: 'Auditoria',
      icon: '🔍',
      path: '/admin/audit-logs',
      module: 'sistema',
      permission: 'admin',
      children: [
        {
          id: 'logs',
          label: 'Logs de Auditoria',
          icon: '📋',
          path: '/admin/audit-logs',
          module: 'sistema',
          permission: 'admin'
        }
      ]
    },
    {
      id: 'monitoramento',
      label: 'Monitoramento',
      icon: '📈',
      path: '/admin/system-info',
      module: 'sistema',
      permission: 'admin',
      children: [
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

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Link to="/pinovara" className="logo-link">
            <span className="logo-icon">🎯</span>
            {!isCollapsed && (
              <span className="logo-text">PINOVARA</span>
            )}
          </Link>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="sidebar-user">
          <div className="user-avatar">
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
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
    </aside>
  );
};

export default Sidebar;
