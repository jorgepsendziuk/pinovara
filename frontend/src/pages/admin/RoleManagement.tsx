import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Module {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  moduleId: string;
  module: Module;
  createdAt: string;
  updatedAt: string;
}

function RoleManagement() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newModule, setNewModule] = useState({
    name: '',
    description: ''
  });
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    moduleId: ''
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      
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
      const token = localStorage.getItem('token');
      
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

  // Module Operations
  const handleCreateModule = async () => {
    try {
      const token = localStorage.getItem('token');
      
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
      const token = localStorage.getItem('token');
      
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

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo? Todos os papéis associados também serão removidos.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
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
      const token = localStorage.getItem('token');
      
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
      const token = localStorage.getItem('token');
      
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

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este papel? Usuários com este papel perderão suas permissões.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
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
      <div className="page-header">
        <div className="header-content">
          <h1>Gestão de Módulos e Papéis</h1>
          <p>Gerencie os módulos do sistema e seus papéis de acesso</p>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => setShowModuleForm(true)}
            className="btn btn-secondary"
          >
            + Novo Módulo
          </button>
          <button 
            onClick={() => setShowRoleForm(true)}
            className="btn btn-primary"
          >
            + Novo Papel
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{modules.filter(m => m.active).length}</div>
            <div className="stat-label">Módulos Ativos</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{roles.filter(r => r.active).length}</div>
            <div className="stat-label">Papéis Ativos</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{roles.length}</div>
            <div className="stat-label">Total de Papéis</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{modules.length}</div>
            <div className="stat-label">Total de Módulos</div>
          </div>
        </div>
      </div>

      {/* Modules and Roles */}
      <div className="modules-roles-section">
        {groupRolesByModule().map(({ module, roles: moduleRoles }) => (
          <div key={module.id} className="module-section">
            <div className="module-header">
              <div className="module-info">
                <h2>{module.name}</h2>
                {module.description && <p>{module.description}</p>}
                <div className="module-meta">
                  <span className={`status-badge ${module.active ? 'active' : 'inactive'}`}>
                    {module.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="creation-date">
                    Criado: {new Date(module.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              
              <div className="module-actions">
                <button
                  onClick={() => setEditingModule(module)}
                  className="btn btn-small btn-outline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  className="btn btn-small btn-danger"
                >
                  Excluir
                </button>
              </div>
            </div>
            
            <div className="roles-grid">
              {moduleRoles.length > 0 ? (
                moduleRoles.map((role) => (
                  <div key={role.id} className="role-card">
                    <div className="role-header">
                      <h3>{role.name}</h3>
                      <span className={`status-badge ${role.active ? 'active' : 'inactive'}`}>
                        {role.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    {role.description && (
                      <p className="role-description">{role.description}</p>
                    )}
                    
                    <div className="role-meta">
                      <span>Criado: {new Date(role.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div className="role-actions">
                      <button
                        onClick={() => setEditingRole(role)}
                        className="btn btn-small btn-outline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="btn btn-small btn-danger"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-roles">
                  <p>Nenhum papel criado para este módulo ainda.</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="empty-state">
            <h3>Nenhum módulo encontrado</h3>
            <p>Crie o primeiro módulo do sistema para começar a organizar as permissões.</p>
          </div>
        )}
      </div>

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
                  onChange={(e) => setEditingRole({...editingRole, moduleId: e.target.value})}
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
    </div>
  );
}

export default RoleManagement;