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

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
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
      setAvailableRoles(data.data.roles);
    } catch (err) {
      console.error('Erro ao carregar papéis:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      
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
      const token = localStorage.getItem('token');
      
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
      const token = localStorage.getItem('token');
      
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

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setSelectedUser(null);
    setShowRoleModal(false);
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
                {users.map((user) => (
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
                            {user.roles.map((role) => (
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
                          <button
                            onClick={() => openRoleModal(user)}
                            className="btn btn-small btn-primary"
                          >
                            Gerenciar Papéis
                          </button>
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
                    {selectedUser.roles.map((role) => (
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
                    {getAvailableRolesForUser(selectedUser).map((role) => (
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
    </div>
  );
}

export default UserManagement;