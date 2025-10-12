import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import {
  Users,
  Edit,
  Trash,
  UserCheck
} from 'lucide-react';

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
  const { user: currentUser, isImpersonating, originalUser } = useAuth();
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
  
  // Estados para DataGrid
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  // Definição das colunas da DataGrid
  const columns: DataGridColumn<User>[] = [
    {
      key: 'user',
      title: 'Usuário',
      dataIndex: 'name',
      width: '25%',
      sortable: true,
      render: (_, record: User) => (
        <div className="user-info">
          <div className="user-avatar-mini">
            <span>{record.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="user-details">
            <div className="user-name">{record.name}</div>
            <div className="user-email">{record.email}</div>
            <div className="user-id">ID: {record.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'active',
      width: '15%',
      align: 'center',
      render: (active: boolean, record: User) => (
        <div className="status-info">
          <span className={`status-badge ${active ? 'active' : 'inactive'}`}>
            {active ? 'Ativo' : 'Inativo'}
          </span>
          {record.id !== currentUser?.id && (
            <button
              onClick={() => handleToggleUserStatus(record.id, active)}
              className={`btn btn-small ${active ? 'btn-danger' : 'btn-success'}`}
              style={{ marginTop: '0.5rem' }}
            >
              {active ? 'Desativar' : 'Ativar'}
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'roles',
      title: 'Papéis',
      dataIndex: 'roles',
      width: '30%',
      responsive: {
        hideOn: 'mobile'
      },
      render: (roles: User['roles']) => (
        <div className="roles-info">
          <div className="roles-count">
            {roles?.length || 0} papel(éis)
          </div>
          <div className="roles-list">
            {roles?.slice(0, 2).map((role: any) => (
              <span key={role.id} className="role-tag">
                {role.name} ({role.module.name})
              </span>
            ))}
            {roles && roles.length > 2 && (
              <span className="more-roles">+{roles.length - 2} mais</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Cadastro',
      dataIndex: 'createdAt',
      width: '15%',
      align: 'center',
      sortable: true,
      responsive: {
        hideOn: 'mobile'
      },
      render: (date: string) => (
        <div className="date-info">
          <div className="date">
            {new Date(date).toLocaleDateString('pt-BR')}
          </div>
          <div className="time">
            {new Date(date).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '15%',
      align: 'center',
      render: (_, record: User) => (
        <div className="action-buttons" style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
          <button
            onClick={() => openRoleModal(record)}
            className="btn-icon"
            title="Gerenciar papéis"
            style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6c757d' }}
          >
            <Users size={16} />
          </button>
          <button
            onClick={() => openEditModal(record)}
            className="btn-icon"
            title="Editar usuário"
            style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#007bff' }}
          >
            <Edit size={16} />
          </button>
          {record.id !== currentUser?.id && (
            <>
              <button
                onClick={() => handleImpersonateUser(record)}
                className="btn-icon"
                title={`Personificar ${record.name}`}
                disabled={isImpersonating}
                style={{
                  padding: '0.25rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: isImpersonating ? 'not-allowed' : 'pointer',
                  color: isImpersonating ? '#ccc' : '#ffc107',
                  opacity: isImpersonating ? 0.5 : 1
                }}
              >
                <UserCheck size={16} />
              </button>
              <button
                onClick={() => handleDeleteUser(record.id, record.name)}
                className="btn-icon"
                title="Excluir usuário"
                style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc3545' }}
              >
                <Trash size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
      // Construir parâmetros de busca
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`${API_BASE}/admin/users?${params}`, {
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
      setTotalUsers(data.data.total || data.data.users.length);
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

  const handleImpersonateUser = async (user: User) => {
    if (!confirm(`Deseja personificar o usuário "${user.name}"?\n\nVocê verá o sistema como se estivesse logado com essa conta.\n\nPara voltar ao seu usuário original, faça logout e login novamente.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/admin/impersonate/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao personificar usuário');
      }

      const data = await response.json();

      // Armazenar o token personificado
      localStorage.setItem('@pinovara:token', data.data.token);
      localStorage.setItem('@pinovara:originalUser', JSON.stringify(currentUser));

      // Redirecionar para a dashboard padrão do sistema
      alert(`Agora você está personificando ${user.name}. Você será redirecionado para a dashboard.`);
      window.location.href = '/pinovara';

    } catch (error) {
      console.error('Erro ao personificar usuário:', error);
      alert(`Erro ao personificar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
    if (availableRoles.length === 0) {
      fetchAvailableRoles();
    }
  }, [currentPage, pageSize, searchTerm]);

  // Handlers para DataGrid
  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Resetar para primeira página ao buscar
  };

  const handleSelectionChange = (selectedRowKeys: string[], _: User[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const handleBulkAction = (action: string, selectedRows: User[]) => {
    switch (action) {
      case 'delete':
        handleBulkDelete(selectedRows);
        break;
      case 'activate':
        handleBulkActivate(selectedRows);
        break;
      case 'deactivate':
        handleBulkDeactivate(selectedRows);
        break;
      default:
        break;
    }
  };

  const handleBulkDelete = async (users: User[]) => {
    if (!confirm(`Tem certeza que deseja excluir ${users.length} usuários?`)) {
      return;
    }
    
    // Implementar exclusão em massa
    console.log('Excluir usuários:', users);
  };

  const handleBulkActivate = async (users: User[]) => {
    // Implementar ativação em massa
    console.log('Ativar usuários:', users);
  };

  const handleBulkDeactivate = async (users: User[]) => {
    // Implementar desativação em massa
    console.log('Desativar usuários:', users);
  };


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
          <h1>
            Gestão de Usuários
            {isImpersonating && (
              <span style={{
                fontSize: '0.6em',
                color: '#ffc107',
                marginLeft: '0.5rem',
                background: '#ffc10720',
                padding: '0.2rem 0.4rem',
                borderRadius: '0.2rem',
                fontWeight: 'normal'
              }}>
                PERSONIFICANDO: {currentUser?.name}
              </span>
            )}
          </h1>
          {isImpersonating && originalUser && (
            <p>
              <span style={{ color: '#ffc107', fontWeight: 'bold' }}>
                Personificando como {currentUser?.name}. <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} style={{ color: '#ffc107' }}>Voltar ao usuário original</a>
              </span>
            </p>
          )}
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

      {/* Users DataGrid */}
      <div className="users-section">
        <DataGrid<User>
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalUsers,
            showSizeChanger: true,
            onChange: handlePaginationChange,
          }}
          filters={{
            searchable: true,
            searchPlaceholder: 'Buscar por nome, email ou ID...',
            onSearchChange: handleSearchChange,
          }}
          selection={{
            type: 'checkbox',
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          actions={{
            onCreate: () => setShowCreateModal(true),
            createLabel: 'Novo Usuário',
            bulkActions: [
              {
                key: 'activate',
                label: 'Ativar',
                icon: '🔓',
              },
              {
                key: 'deactivate',
                label: 'Desativar',
                icon: '🔒',
              },
              {
                key: 'delete',
                label: 'Excluir',
                icon: <Trash size={14} />,
              },
            ],
            onBulkAction: handleBulkAction,
          }}
          emptyState={{
            title: 'Nenhum usuário encontrado',
            description: searchTerm 
              ? `Não foram encontrados usuários que correspondam ao termo "${searchTerm}".`
              : 'Não há usuários cadastrados no sistema ainda.',
            icon: <Users size={16} />,
            action: {
              label: 'Criar primeiro usuário',
              onClick: () => setShowCreateModal(true),
            },
          }}
          responsive={true}
          size="small"
          className="users-datagrid"
        />
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