import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    id: string;
    name: string;
    module: {
      id: string;
      name: string;
    };
  }>;
}

interface Role {
  id: string;
  name: string;
  module: {
    id: string;
    name: string;
  };
}

function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const fetchUsers = async () => {
    try {
      setLoading(true);
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
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
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
      setAvailableRoles(data.data.roles);
    } catch (err) {
      console.error('Erro ao carregar papéis:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status do usuário');
      }

      await fetchUsers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
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
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Falha ao atribuir papel');
      }

      await fetchUsers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir papel');
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    if (!confirm('Tem certeza que deseja remover este papel do usuário?')) {
      return;
    }

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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${userName}"?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    if (!confirm('Confirmação final: Esta ação irá remover permanentemente o usuário e todos os seus papéis. Continuar?')) {
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Falha ao deletar usuário');
      }

      await fetchUsers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setSelectedUser(null);
    setShowRoleModal(false);
  };

  const handleCreateUser = async (userData: { email: string; password: string; name: string; active: boolean }) => {
    try {
      setCreating(true);
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Falha ao criar usuário');
      }

      await fetchUsers();
      setShowCreateModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = async (userId: string, userData: { email?: string; name?: string; active?: boolean; password?: string }) => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Falha ao atualizar usuário');
      }

      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setShowEditModal(false);
  };

  const getAvailableRolesForUser = (user: User): Role[] => {
    const userRoleIds = user.roles.map(role => role.id);
    return availableRoles.filter(role => !userRoleIds.includes(role.id));
  };

  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestão de Usuários</h1>
          <p>Gerencie usuários do sistema, seus status e permissões</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={openCreateModal} 
            className="btn btn-primary"
            disabled={creating}
          >
            {creating ? 'Criando...' : '+ Criar Usuário'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Users Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total de Usuários</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{users.filter(u => u.active).length}</div>
            <div className="stat-label">Usuários Ativos</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{users.filter(u => !u.active).length}</div>
            <div className="stat-label">Usuários Inativos</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">
              {users.filter(u => u.roles && u.roles.length > 0).length}
            </div>
            <div className="stat-label">Com Papéis Atribuídos</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-section">
        {users.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum usuário encontrado</h3>
            <p>Não há usuários cadastrados no sistema.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Status</th>
                  <th>Papéis</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-id">ID: {user.id}</div>
                      </div>
                    </td>
                    <td>
                      <div className="status-info">
                        <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                        
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.active)}
                            className={`btn btn-small ${user.active ? 'btn-danger' : 'btn-success'}`}
                          >
                            {user.active ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="roles-info">
                        {user.roles && user.roles.length > 0 ? (
                          <div className="roles-list">
                            {user.roles.map((role: any) => (
                              <div key={role.id} className="role-item">
                                <span className="role-badge">
                                  {role.name} ({role.module.name})
                                </span>
                                {user.id !== currentUser?.id && (
                                  <button
                                    onClick={() => handleRemoveRole(user.id, role.id)}
                                    className="btn btn-tiny btn-danger"
                                    title="Remover papel"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="no-roles">Nenhum papel atribuído</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {user.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              className="btn btn-small btn-secondary"
                              style={{ marginRight: '4px' }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => openRoleModal(user)}
                              className="btn btn-small btn-primary"
                              style={{ marginRight: '4px' }}
                            >
                              Gerenciar Papéis
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="btn btn-small btn-danger"
                            >
                              🗑️ Deletar
                            </button>
                          </>
                        )}

                        {user.id === currentUser?.id && (
                          <span className="self-user">Você mesmo</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Management Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Gerenciar Papéis: {selectedUser.name}</h2>
              <button onClick={closeRoleModal} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="current-roles">
                <h3>Papéis Atuais</h3>
                {selectedUser.roles && selectedUser.roles.length > 0 ? (
                  <div className="roles-list">
                    {selectedUser.roles.map((role: any) => (
                      <div key={role.id} className="role-item">
                        <span className="role-badge">
                          {role.name} ({role.module.name})
                        </span>
                        <button
                          onClick={() => handleRemoveRole(selectedUser.id, role.id)}
                          className="btn btn-small btn-danger"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nenhum papel atribuído ainda.</p>
                )}
              </div>
              
              <div className="available-roles">
                <h3>Papéis Disponíveis</h3>
                {getAvailableRolesForUser(selectedUser).length > 0 ? (
                  <div className="roles-list">
                    {getAvailableRolesForUser(selectedUser).map((role: Role) => (
                      <div key={role.id} className="role-item">
                        <span className="role-badge">
                          {role.name} ({role.module.name})
                        </span>
                        <button
                          onClick={() => handleAssignRole(selectedUser.id, role.id)}
                          className="btn btn-small btn-success"
                        >
                          Atribuir
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Todos os papéis disponíveis já foram atribuídos.</p>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={closeRoleModal} className="btn btn-primary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Criar Novo Usuário</h2>
              <button onClick={closeCreateModal} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <CreateUserForm 
                onSubmit={handleCreateUser}
                onCancel={closeCreateModal}
                creating={creating}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Editar Usuário: {editingUser.name}</h2>
              <button onClick={closeEditModal} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <EditUserForm 
                user={editingUser}
                onSubmit={handleEditUser}
                onCancel={closeEditModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Components for Create/Edit User Forms
interface CreateUserFormProps {
  onSubmit: (data: { email: string; password: string; name: string; active: boolean }) => Promise<void>;
  onCancel: () => void;
  creating: boolean;
}

function CreateUserForm({ onSubmit, onCancel, creating }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.password && formData.name) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-group">
        <label htmlFor="name">Nome Completo *</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          disabled={creating}
          placeholder="Nome completo do usuário"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          disabled={creating}
          placeholder="email@exemplo.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Senha *</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          disabled={creating}
          placeholder="Mínimo 6 caracteres"
          minLength={6}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({...formData, active: e.target.checked})}
            disabled={creating}
          />
          <span>Usuário ativo</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={creating} className="btn btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={creating || !formData.email || !formData.password || !formData.name} className="btn btn-primary">
          {creating ? 'Criando...' : 'Criar Usuário'}
        </button>
      </div>
    </form>
  );
}

interface EditUserFormProps {
  user: User;
  onSubmit: (userId: string, data: { email?: string; name?: string; active?: boolean; password?: string }) => Promise<void>;
  onCancel: () => void;
}

function EditUserForm({ user, onSubmit, onCancel }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    email: user.email,
    name: user.name,
    active: user.active,
    password: '' // Novo campo opcional
  });
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    const updateData: any = {
      email: formData.email,
      name: formData.name,
      active: formData.active
    };

    // Apenas incluir password se foi fornecida
    if (formData.password.trim()) {
      updateData.password = formData.password;
    }

    try {
      await onSubmit(user.id, updateData);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-group">
        <label htmlFor="edit-name">Nome Completo *</label>
        <input
          type="text"
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          disabled={updating}
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-email">Email *</label>
        <input
          type="email"
          id="edit-email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          disabled={updating}
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-password">Nova Senha (opcional)</label>
        <input
          type="password"
          id="edit-password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          disabled={updating}
          placeholder="Deixe em branco para manter a atual"
          minLength={6}
        />
        {formData.password && formData.password.length < 6 && (
          <small className="form-hint error">Senha deve ter pelo menos 6 caracteres</small>
        )}
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({...formData, active: e.target.checked})}
            disabled={updating}
          />
          <span>Usuário ativo</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={updating} className="btn btn-secondary">
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={updating || !formData.email || !formData.name || (formData.password.trim().length > 0 && formData.password.length < 6)} 
          className="btn btn-primary"
        >
          {updating ? 'Atualizando...' : 'Atualizar Usuário'}
        </button>
      </div>
    </form>
  );
}

export default UserManagement;