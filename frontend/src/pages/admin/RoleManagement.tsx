import { useState, useEffect } from 'react';

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

interface User {
  id: number;
  email: string;
  name: string;
  active: boolean;
  roles: {
    id: number;
    name: string;
    module: {
      id: number;
      name: string;
    };
  }[];
}

interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  assignedAt: string;
  assignedBy?: number;
}

function RoleManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'users'>('modules');

  // Form states
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showUserRoleModal, setShowUserRoleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form data
  const [newModule, setNewModule] = useState({ name: '', description: '' });
  const [newRole, setNewRole] = useState({ name: '', description: '', moduleId: '' });

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/modules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar módulos');
      }

      const data = await response.json();
      setModules(data.data.modules);
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
        throw new Error('Falha ao carregar papéis');
      }

      const data = await response.json();
      setRoles(data.data.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }

      const data = await response.json();
      setUsers(data.data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    }
  };

  const handleAssignRole = async (userId: number, roleId: number) => {
    try {
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atribuir papel');
      }

      await fetchUsers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir papel');
    }
  };

  const handleRemoveRole = async (userId: number, roleId: number) => {
    try {
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/admin/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao remover papel');
      }

      await fetchUsers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover papel');
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
      
      const response = await fetch(`${API_BASE}/admin/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
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

  useEffect(() => {
    fetchModules();
    fetchRoles();
    fetchUsers();
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
            <span>{users.filter(u => u.active).length} usuários</span>
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
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuários & Atribuições
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
                  ✏️
                </button>
                <button onClick={() => handleDeleteModule(module.id)} className="btn-icon btn-danger" title="Excluir módulo">
                  🗑️
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
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteRole(role.id)} className="btn-icon-small btn-danger" title="Excluir papel">
                        🗑️
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

      {/* Aba de Usuários */}
      {activeTab === 'users' && (
        <div className="users-tab">
          <div className="compact-header">
            <div className="compact-title">
              <h2>Atribuição de Papéis</h2>
              <p>Gerencie quais papéis cada usuário possui</p>
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="users-list">
            {users.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <div className="user-header">
                    <div className="user-name-email">
                      <h3>{user.name}</h3>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="user-status">
                      <span className={`status-indicator ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? '● Ativo' : '○ Inativo'}
                      </span>
                    </div>
                  </div>

                  {/* Papéis atuais do usuário */}
                  <div className="user-roles">
                    <h4>Papéis Atuais:</h4>
                    <div className="role-tags">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span key={role.id} className="role-tag">
                            <span className="role-module">{role.module.name}:</span>
                            <span className="role-name">{role.name}</span>
                            <button
                              onClick={() => handleRemoveRole(user.id, role.id)}
                              className="role-remove-btn"
                              title="Remover papel"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="no-roles">Nenhum papel atribuído</span>
                      )}
                    </div>
                  </div>

                  {/* Adicionar papel */}
                  <div className="add-role-section">
                    <h4>Adicionar Papel:</h4>
                    <select
                      onChange={(e) => {
                        const roleId = parseInt(e.target.value);
                        if (roleId) {
                          handleAssignRole(user.id, roleId);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Selecione um papel</option>
                      {roles
                        .filter(role => role.active && !user.roles.some(userRole => userRole.id === role.id))
                        .map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.module.name}: {role.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="empty-state">
              <h3>Nenhum usuário encontrado</h3>
              <p>Não há usuários cadastrados no sistema.</p>
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
                  value={newRole.moduleId}
                  onChange={(e) => setNewRole({...newRole, moduleId: e.target.value})}
                >
                  <option value="">Selecione um módulo</option>
                  {modules.filter(m => m.active).map(module => (
                    <option key={module.id} value={module.id}>{module.name}</option>
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
                  value={editingRole.moduleId}
                  onChange={(e) => setEditingRole({...editingRole, moduleId: parseInt(e.target.value)})}
                >
                  {modules.filter(m => m.active).map(module => (
                    <option key={module.id} value={module.id}>{module.name}</option>
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
    </>
  );
}

export default RoleManagement;