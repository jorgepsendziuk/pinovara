import { useState, useEffect, useCallback } from 'react';
import { Edit, Trash, Shield } from 'lucide-react';
import api from '../../services/api';

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  module_name: string | null;
  category: string | null;
  active: boolean;
}

interface Module {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
  _count?: { roles: number };
}

interface Role {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  moduleId: number;
  module: Module;
  createdAt: string;
  updatedAt: string;
  _count?: { userRoles: number };
}

function RoleManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'permissions'>('modules');

  // Permissões por Role
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<number, Record<number, boolean>>>({});
  const [permsLoading, setPermsLoading] = useState(false);
  const [permsError, setPermsError] = useState<string | null>(null);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);
  const [dirtyRoles, setDirtyRoles] = useState<Set<number>>(new Set());

  // Form states
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  // Form data
  const [newModule, setNewModule] = useState({ name: '', description: '' });
  const [newRole, setNewRole] = useState({ name: '', description: '', moduleId: '' });

  // Usar a mesma base URL do axios (VITE_API_URL em prod, proxy /api em dev)
  const API_BASE = (api.defaults.baseURL || '').replace(/\/$/, '');

  const fetchModules = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/modules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint /admin/modules não encontrado. No servidor, verifique se o backend está atualizado e se o Nginx faz proxy de /admin/ para o backend (veja docs/nginx-final.conf).');
        }
        throw new Error('Falha ao carregar módulos');
      }

      const data = await response.json();
      const list = data.data?.modules ?? data.modules ?? [];
      setModules(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/admin/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint /admin/roles não encontrado. No servidor, verifique se o backend está atualizado e se o Nginx faz proxy de /admin/ para o backend.');
        }
        throw new Error('Falha ao carregar papéis');
      }

      const data = await response.json();
      const list = data.data?.roles ?? data.roles ?? [];
      setRoles(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Module Operations
  const handleCreateModule = async () => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/modules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModule),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar módulo');
      }

      await fetchModules();
      setShowModuleForm(false);
      setNewModule({ name: '', description: '' });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar módulo');
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;

    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingModule.name,
          description: editingModule.description
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar módulo');
      }

      await fetchModules();
      await fetchRoles(); // Refresh roles as they might be affected
      setEditingModule(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar módulo');
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Tem certeza que deseja excluir este módulo? Todos os papéis associados também serão removidos.')) {
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir módulo');
      }

      await fetchModules();
      await fetchRoles();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir módulo');
    }
  };

  // Role Operations
  const handleCreateRole = async () => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const payload = {
        name: newRole.name,
        description: newRole.description,
        moduleId: newRole.moduleId ? parseInt(String(newRole.moduleId), 10) : undefined,
      };
      const response = await fetch(`${API_BASE}/admin/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar papel');
      }

      await fetchRoles();
      setShowRoleForm(false);
      setNewRole({ name: '', description: '', moduleId: '' });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar papel');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingRole.name,
          description: editingRole.description,
          moduleId: editingRole.moduleId
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar papel');
      }

      await fetchRoles();
      setEditingRole(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar papel');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Tem certeza que deseja excluir este papel? Usuários com este papel perderão suas permissões.')) {
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir papel');
      }

      await fetchRoles();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir papel');
    }
  };

  const groupRolesByModule = () => {
    return modules.map(module => ({
      module,
      roles: roles.filter(role => role.moduleId === module.id)
    }));
  };

  const normalizeModuleName = (s: string) =>
    (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

  /** Permissões de um módulo (match normalizado: case + acentos) */
  const getPermissionsForModule = (moduleName: string): Permission[] => {
    const n = normalizeModuleName(moduleName);
    return permissions.filter((p) => normalizeModuleName(p.module_name || '') === n || (n === 'sistema' && !p.module_name));
  };

  /** Roles de um módulo por nome. Admin só no sistema. */
  const getRolesForModuleName = (moduleName: string): Role[] => {
    const n = normalizeModuleName(moduleName);
    const r = roles.filter((role) => normalizeModuleName(role.module?.name || '') === n);
    return n === 'sistema' ? r : r.filter((x) => x.name !== 'admin');
  };

  /** Seções a exibir: module_name das permissions. "outros" é exibido junto com sistema. */
  const permissionSections = () => {
    const seen = new Set<string>();
    permissions.forEach((p) => {
      const key = (p.module_name || 'outros').toLowerCase();
      seen.add(key === 'outros' ? 'sistema' : key);
    });
    return Array.from(seen).sort();
  };

  const fetchPermissionsData = useCallback(async () => {
    setPermsLoading(true);
    setPermsError(null);
    const token = localStorage.getItem('@pinovara:token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      const res = await fetch(`${API_BASE}/admin/permissions/full`, { headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Falha ao carregar permissões');
      }
      const data = await res.json();
      const perms: Permission[] = data.data?.permissions ?? data.permissions ?? [];
      const rawRp = data.data?.rolePermissions ?? data.rolePermissions;
      // Backend retorna rolePermissions como array de { roleId, permissionId, enabled }; converter para Record<roleId, array>
      const rolePermissions: Record<number, Array<{ permissionId: number; enabled: boolean }>> = {};
      if (Array.isArray(rawRp)) {
        rawRp.forEach((item: { roleId: number; permissionId: number; enabled: boolean }) => {
          if (!rolePermissions[item.roleId]) rolePermissions[item.roleId] = [];
          rolePermissions[item.roleId].push({ permissionId: item.permissionId, enabled: item.enabled });
        });
      } else if (rawRp && typeof rawRp === 'object' && !Array.isArray(rawRp)) {
        Object.keys(rawRp).forEach((k) => {
          const roleId = parseInt(k, 10);
          const arr = (rawRp as Record<string, unknown>)[k];
          rolePermissions[roleId] = Array.isArray(arr) ? arr : [];
        });
      }
      setPermissions(Array.isArray(perms) ? perms : []);

      const map: Record<number, Record<number, boolean>> = {};
      roles.forEach((role) => {
        map[role.id] = {};
        const rp = rolePermissions[role.id] ?? [];
        perms.forEach((p) => {
          const found = Array.isArray(rp) ? rp.find((r: { permissionId: number }) => r.permissionId === p.id) : undefined;
          map[role.id][p.id] = found ? (found as { enabled: boolean }).enabled : false;
        });
      });
      setRolePermissionsMap(map);
      setDirtyRoles(new Set());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar permissões';
      setPermsError(msg.includes('fetch') || msg.includes('refused') || msg.includes('Failed to fetch')
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está em execução e VITE_API_URL.'
        : msg);
    } finally {
      setPermsLoading(false);
    }
  }, [roles]);

  useEffect(() => {
    if (activeTab === 'permissions' && roles.length > 0) {
      fetchPermissionsData();
    }
  }, [activeTab, roles.length, fetchPermissionsData]);

  const handlePermissionToggle = (roleId: number, permissionId: number, enabled: boolean) => {
    setRolePermissionsMap((prev) => ({
      ...prev,
      [roleId]: {
        ...(prev[roleId] || {}),
        [permissionId]: enabled
      }
    }));
    setDirtyRoles((prev) => new Set(prev).add(roleId));
  };

  const handleSaveRolePermissions = async (roleId: number) => {
    setSavingRoleId(roleId);
    setError(null);
    const token = localStorage.getItem('@pinovara:token');
    try {
      const map = rolePermissionsMap[roleId] || {};
      const updates = Object.entries(map).map(([permId, enabled]) => ({
        permissionId: parseInt(permId, 10),
        enabled
      }));
      const res = await fetch(`${API_BASE}/admin/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Erro ao salvar permissões');
      }
      setDirtyRoles((prev) => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar permissões');
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleSaveAllPermissions = async () => {
    for (const roleId of dirtyRoles) {
      await handleSaveRolePermissions(roleId);
    }
  };

  useEffect(() => {
    fetchModules();
    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <p>Carregando módulos e papéis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header Principal */}
      <div className="compact-header">
        <div className="compact-title">
          <h1>Gestão de Roles & Permissões</h1>
          <div className="compact-stats">
            <span>{modules.filter(m => m.active).length} módulos</span>
            <span>{roles.filter(r => r.active).length} papéis</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="role-tabs">
        <button
          className={`tab-button ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          📁 Módulos & Papéis
        </button>
        <button
          className={`tab-button ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <Shield size={18} style={{marginRight: '0.5rem'}} /> Permissões por Role
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'modules' && (
        <>
          {/* Header de Módulos */}
          <div className="compact-header">
            <div className="compact-actions">
              <button onClick={() => setShowModuleForm(true)} className="btn btn-small btn-secondary">
                + Módulo
              </button>
              <button onClick={() => setShowRoleForm(true)} className="btn btn-small btn-primary">
                + Papel
              </button>
            </div>
          </div>

          {error && (
        <div className="alert alert-error alert-compact">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Lista Compacta de Módulos */}
      <div className="compact-modules-list">
        {groupRolesByModule().map(({ module, roles: moduleRoles }) => (
          <div key={module.id} className="compact-module-item">
            <div className="compact-module-header">
              <div className="compact-module-info">
                <div className="module-name-badges">
                  <h3>{module.name}</h3>
                  <div className="module-badges">
                    <span className={`status-dot ${module.active ? 'active' : 'inactive'}`}></span>
                    <span className="role-count">{moduleRoles.length} papéis</span>
                  </div>
                </div>
                {module.description && (
                  <p className="module-description-compact">{module.description}</p>
                )}
              </div>

              <div className="compact-module-actions">
                <button onClick={() => setEditingModule(module)} className="btn-icon" title="Editar módulo">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDeleteModule(module.id)} className="btn-icon btn-danger" title="Excluir módulo">
                  <Trash size={14} />
                </button>
              </div>
            </div>
            
            {/* Papéis em Linha Compacta */}
            {moduleRoles.length > 0 && (
              <div className="compact-roles-list">
                {moduleRoles.map((role) => (
                  <div key={role.id} className="compact-role-item">
                    <div className="compact-role-info">
                      <span className="role-name">{role.name}</span>
                      {role.description && (
                        <span className="role-desc" title={role.description}>
                          {role.description.length > 30 ? `${role.description.substring(0, 30)}...` : role.description}
                        </span>
                      )}
                      <span className={`status-indicator ${role.active ? 'active' : 'inactive'}`}>
                        {role.active ? '●' : '○'}
                      </span>
                    </div>

                    <div className="compact-role-actions">
                      <button onClick={() => setEditingRole(role)} className="btn-icon-small" title="Editar papel">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteRole(role.id)} className="btn-icon-small btn-danger" title="Excluir papel">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {modules.length === 0 && (
          <div className="empty-state">
            <h3>Nenhum módulo encontrado</h3>
            <p>Crie o primeiro módulo do sistema para começar a organizar as permissões.</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Aba Permissões por Role */}
      {activeTab === 'permissions' && (
        <div className="permissions-tab">
          <div className="compact-header">
            <div className="compact-title">
              <h2>Permissões por Papel</h2>
              <p>Defina quais funcionalidades cada papel pode executar. Alterações afetam o backend imediatamente ao salvar.</p>
            </div>
            {dirtyRoles.size > 0 && (
              <button
                className="btn btn-primary"
                onClick={handleSaveAllPermissions}
                disabled={savingRoleId !== null}
              >
                {savingRoleId !== null ? 'Salvando...' : `Salvar alterações (${dirtyRoles.size})`}
              </button>
            )}
          </div>

          {(permsError || error) && (
            <div className="alert alert-error alert-compact">
              <p>{permsError || error}</p>
              <button onClick={() => { setPermsError(null); setError(null); }}>×</button>
            </div>
          )}

          {permsLoading ? (
            <div className="loading-state">
              <p>Carregando permissões...</p>
            </div>
          ) : permissions.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhuma permissão configurada</h3>
              <p>Execute os scripts SQL no banco: <code>create-permissions-tables.sql</code> e <code>seed-permissions.sql</code> (em scripts/database/).</p>
            </div>
          ) : (
            <div className="permissions-by-module">
              {permissionSections().map((moduleName) => {
                const filteredRoles = getRolesForModuleName(moduleName);
                const permsToShow = getPermissionsForModule(moduleName);
                if (permsToShow.length === 0) return null;

                return (
                  <div key={moduleName} className="permissions-module-card">
                    <h3 className="permissions-module-title">{moduleName}</h3>
                    <div className="permissions-matrix-wrapper">
                      <table className="permissions-matrix">
                        <thead>
                          <tr>
                            <th className="permission-role-cell">Papel</th>
                            {permsToShow.map((p) => (
                              <th key={p.id} className="permission-col-header" title={p.description || p.name}>
                                {p.name}
                              </th>
                            ))}
                            <th className="permission-actions-col">Salvar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRoles.map((role) => (
                            <tr key={role.id}>
                              <td className="permission-role-cell">
                                <strong>{role.name}</strong>
                              </td>
                              {permsToShow.map((p) => (
                                <td key={p.id} className="permission-cell">
                                  <label className="permission-checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={!!(rolePermissionsMap[role.id]?.[p.id])}
                                      onChange={(e) => handlePermissionToggle(role.id, p.id, e.target.checked)}
                                    />
                                  </label>
                                </td>
                              ))}
                              <td className="permission-actions-cell">
                                {dirtyRoles.has(role.id) && (
                                  <button
                                    className="btn btn-small btn-primary"
                                    onClick={() => handleSaveRolePermissions(role.id)}
                                    disabled={savingRoleId === role.id}
                                  >
                                    {savingRoleId === role.id ? '...' : 'Salvar'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Module Modal */}
      {showModuleForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Novo Módulo</h2>
              <button onClick={() => setShowModuleForm(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Módulo:</label>
                <input
                  type="text"
                  value={newModule.name}
                  onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                  placeholder="Ex: Sistema, Vendas, Financeiro..."
                />
              </div>
              
              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                  placeholder="Descrição do módulo..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setShowModuleForm(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleCreateModule} className="btn btn-primary">
                Criar Módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showRoleForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Novo Papel</h2>
              <button onClick={() => setShowRoleForm(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Módulo:</label>
                <select
                  value={String(newRole.moduleId || '')}
                  onChange={(e) => setNewRole({...newRole, moduleId: e.target.value})}
                >
                  <option value="">Selecione um módulo</option>
                  {modules.filter(m => m.active).map(module => (
                    <option key={module.id} value={String(module.id)}>{module.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Nome do Papel:</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  placeholder="Ex: admin, user, viewer..."
                />
              </div>
              
              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  placeholder="Descrição das permissões deste papel..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setShowRoleForm(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleCreateRole} className="btn btn-primary">
                Criar Papel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Editar Módulo: {editingModule.name}</h2>
              <button onClick={() => setEditingModule(null)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Módulo:</label>
                <input
                  type="text"
                  value={editingModule.name}
                  onChange={(e) => setEditingModule({...editingModule, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  value={editingModule.description || ''}
                  onChange={(e) => setEditingModule({...editingModule, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setEditingModule(null)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleUpdateModule} className="btn btn-primary">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Editar Papel: {editingRole.name}</h2>
              <button onClick={() => setEditingRole(null)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Módulo:</label>
                <select
                  value={String(editingRole.moduleId ?? '')}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditingRole({...editingRole, moduleId: v ? parseInt(v, 10) : 0});
                  }}
                >
                  <option value="">Selecione um módulo</option>
                  {modules.filter(m => m.active).map(module => (
                    <option key={module.id} value={String(module.id)}>{module.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Nome do Papel:</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  value={editingRole.description || ''}
                  onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setEditingRole(null)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleUpdateRole} className="btn btn-primary">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;