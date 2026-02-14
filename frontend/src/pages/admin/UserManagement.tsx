import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import {
  Users,
  Edit,
  Trash,
  Eye
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

function moduleToBadge(moduleName: string): string {
  const map: Record<string, string> = {
    organizacoes: 'ORG',
    sistema: 'SIS',
    cadastro: 'CAD',
  };
  return map[moduleName?.toLowerCase()] ?? (moduleName?.slice(0, 3)?.toUpperCase() || '—');
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
  const [pageSize, setPageSize] = useState(15);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  // Definição das colunas da DataGrid - Ações primeiro (esquerda) para ser responsivo como em ListaCapacitacoes
  const columns: DataGridColumn<User>[] = [
    {
      key: 'actions',
      title: 'Ações',
      width: '20%',
      align: 'left',
      render: (_, record: User) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <button
            onClick={() => openRoleModal(record)}
            className="btn-icon"
            title="Gerenciar papéis"
            style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: '#056839', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Users size={14} />
          </button>
          <button
            onClick={() => openEditModal(record)}
            className="btn-icon"
            title="Editar"
            style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: '#3b2313', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Edit size={14} />
          </button>
          {record.id !== currentUser?.id && (
            <>
              <button
                onClick={() => handleImpersonateUser(record)}
                className="btn-icon"
                title="Personificar usuário"
                style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => handleDeleteUser(record.id, record.name)}
                className="btn-icon"
                title="Excluir"
                style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: '#dc3545', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: '14%',
      sortable: true,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8em', color: '#555' }} title={id}>
          {id}
        </span>
      ),
    },
    {
      key: 'name',
      title: 'Nome',
      dataIndex: 'name',
      width: '20%',
      sortable: true,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      width: '20%',
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'active',
      width: '10%',
      align: 'center',
      sortable: true,
      render: (active: boolean) => (
        <span className={`badge ${active ? 'badge-success' : 'badge-secondary'}`}>
          {active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'roles',
      title: 'Papéis',
      dataIndex: 'roles',
      width: '25%',
      sortable: true,
      render: (roles: User['roles']) => {
        if (!roles || roles.length === 0) {
          return <span style={{ color: '#999', fontSize: '0.9em' }}>Nenhum</span>;
        }
        const order = ['sistema', 'organizacoes', 'cadastro'];
        const sorted = [...roles].sort((a: any, b: any) => {
          const ma = order.indexOf((a.module?.name ?? '').toLowerCase());
          const mb = order.indexOf((b.module?.name ?? '').toLowerCase());
          if (ma !== mb) return (ma === -1 ? 99 : ma) - (mb === -1 ? 99 : mb);
          return (a.name ?? '').localeCompare(b.name ?? '');
        });
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.9em' }}>
            {sorted.map((r: any) => (
              <span key={r.id}>
                {r.name} ({moduleToBadge(r.module?.name ?? '')})
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Cadastro',
      dataIndex: 'createdAt',
      width: '12%',
      align: 'center',
      sortable: true,
      render: (date: string) => (
        <span style={{ fontSize: '0.9em' }}>
          {new Date(date).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
      // Buscar todos os usuários
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
      let allUsers = data.data.users || [];

      // Aplicar filtro de busca (nome ou email)
      if (searchTerm) {
        allUsers = allUsers.filter((user: User) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Aplicar filtro de papel
      if (roleFilter) {
        allUsers = allUsers.filter((user: User) =>
          user.roles.some(role => String(role.id) === String(roleFilter))
        );
      }

      // Aplicar paginação no frontend
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotalUsers(allUsers.length);
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

  // Função desabilitada temporariamente - não está sendo usada no momento
  // const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
  //   try {
  //     const token = localStorage.getItem('@pinovara:token');
  //     
  //     const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
  //       method: 'PUT',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ active: !currentStatus }),
  //     });
  //
  //     if (!response.ok) {
  //       throw new Error('Falha ao atualizar status do usuário');
  //     }
  //
  //     await fetchUsers();
  //     setError(null);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Erro ao atualizar');
  //   }
  // };

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

      // Armazenar o token personificado e dados do usuário
      localStorage.setItem('@pinovara:token', data.data.token);
      localStorage.setItem('@pinovara:user', JSON.stringify(data.data.user));
      localStorage.setItem('@pinovara:originalUser', JSON.stringify(currentUser));

      // Redirecionar para recarregar o contexto
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
  }, [currentPage, pageSize, searchTerm, roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Handlers para DataGrid
  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1); // Resetar para primeira página ao filtrar
  };

  // Funções desabilitadas temporariamente - não estão sendo usadas no momento
  // const handleSelectionChange = (selectedRowKeys: string[], _: User[]) => {
  //   setSelectedRowKeys(selectedRowKeys);
  // };

  // const handleBulkAction = (action: string, selectedRows: User[]) => {
  //   switch (action) {
  //     case 'delete':
  //       handleBulkDelete(selectedRows);
  //       break;
  //     case 'activate':
  //       handleBulkActivate(selectedRows);
  //       break;
  //     case 'deactivate':
  //       handleBulkDeactivate(selectedRows);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // const handleBulkDelete = async (users: User[]) => {
  //   if (!confirm(`Tem certeza que deseja excluir ${users.length} usuários?`)) {
  //     return;
  //   }
  //   
  //   // Implementar exclusão em massa
  //   console.log('Excluir usuários:', users);
  // };

  // const handleBulkActivate = async (users: User[]) => {
  //   // Implementar ativação em massa
  //   console.log('Ativar usuários:', users);
  // };

  // const handleBulkDeactivate = async (users: User[]) => {
  //   // Implementar desativação em massa
  //   console.log('Desativar usuários:', users);
  // };


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

      {/* Filtros */}
      <div style={{ 
        background: '#fff', 
        padding: '1rem', 
        marginBottom: '1rem', 
        borderRadius: '8px', 
        border: '1px solid #e5e5e5',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Buscar:</label>
          <input
            type="text"
            placeholder="Nome ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              minWidth: '200px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Papel:</label>
          <select 
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              minWidth: '200px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">Todos os papéis</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.module.name})
              </option>
            ))}
          </select>
        </div>
        
        {(roleFilter || searchInput) && (
          <button 
            onClick={() => {
              setRoleFilter('');
              setSearchInput('');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="btn btn-sm"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#f3f4f6', color: '#666', border: '1px solid #ddd' }}
          >
            Limpar Filtros
          </button>
        )}
        
        <div style={{ marginLeft: 'auto', color: '#666', fontSize: '0.85rem' }}>
          Mostrando <strong>{totalUsers}</strong> {totalUsers === 1 ? 'usuário' : 'usuários'}
        </div>
      </div>

      {/* Users Stats - Compacto */}
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        padding: '0.75rem 1rem',
        background: '#f8f9fa',
        borderRadius: '6px',
        marginBottom: '1rem',
        fontSize: '0.9em'
      }}>
        <div>
          <strong style={{ color: '#3b2313' }}>{totalUsers}</strong> <span style={{ color: '#666' }}>total</span>
        </div>
        <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '1rem' }}>
          <strong style={{ color: '#056839' }}>{users.filter(u => u.active).length}</strong> <span style={{ color: '#666' }}>ativos</span>
        </div>
        <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '1rem' }}>
          <strong style={{ color: '#999' }}>{users.filter(u => !u.active).length}</strong> <span style={{ color: '#666' }}>inativos</span>
        </div>
        <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '1rem' }}>
          <strong style={{ color: '#3b2313' }}>{users.filter(u => u.roles && u.roles.length > 0).length}</strong> <span style={{ color: '#666' }}>com papéis</span>
        </div>
      </div>

      {/* Users DataGrid - Versão Simplificada */}
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
            showAllLabel: 'Mostrar Todos',
            onShowAll: () => handlePaginationChange(1, Math.max(totalUsers, 1)),
            onChange: handlePaginationChange,
          }}
          filters={{
            searchable: false,
          }}
          emptyState={{
            title: 'Nenhum usuário encontrado',
            description: searchTerm || roleFilter
              ? `Nenhum usuário corresponde aos filtros aplicados.`
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
              {(() => {
                const userRoleIds = new Set((selectedUser.roles ?? []).map((r: any) => String(r.id)));
                const byModule = availableRoles.reduce<Record<string, Role[]>>((acc, role) => {
                  const mod = role.module?.name ?? 'outro';
                  if (!acc[mod]) acc[mod] = [];
                  acc[mod].push(role);
                  return acc;
                }, {});
                const moduleOrder = ['sistema', 'organizacoes', 'cadastro'];
                const orderedModules = [...new Set([...moduleOrder, ...Object.keys(byModule)])].filter(m => byModule[m]?.length);
                return (
                  <div style={{ overflowX: 'auto' }}>
                    {orderedModules.map((mod) => (
                      <div key={mod} style={{ marginBottom: '1.25rem' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-secondary" style={{ fontSize: '0.8em' }}>{moduleToBadge(mod)}</span>
                          <span style={{ textTransform: 'capitalize', color: '#333' }}>{mod}</span>
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                              <th style={{ textAlign: 'left', padding: '0.5rem 0.5rem 0.5rem 0', fontWeight: 600 }}>Papel</th>
                              <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 600 }}>Status</th>
                              <th style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 600 }}>Ação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {byModule[mod].map((role) => {
                              const assigned = userRoleIds.has(String(role.id));
                              return (
                                <tr key={role.id} style={{ borderBottom: '1px solid #eee' }}>
                                  <td style={{ padding: '0.5rem 0.5rem 0.5rem 0' }}>{role.name}</td>
                                  <td style={{ padding: '0.5rem' }}>
                                    <span style={{ color: assigned ? '#056839' : '#666' }}>{assigned ? 'Atribuído' : 'Disponível'}</span>
                                  </td>
                                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                    {assigned ? (
                                      <button type="button" onClick={() => handleRemoveRole(selectedUser.id, role.id)} className="btn btn-small btn-danger">Remover</button>
                                    ) : (
                                      <button type="button" onClick={() => handleAssignRole(selectedUser.id, role.id)} className="btn btn-small btn-success">Atribuir</button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                );
              })()}
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