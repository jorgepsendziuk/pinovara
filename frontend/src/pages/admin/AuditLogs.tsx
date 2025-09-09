import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  oldData?: string;
  newData?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

interface AuditLogStats {
  totalLogs: number;
  logsToday: number;
  logsByAction: Array<{
    action: string;
    _count: { action: number };
  }>;
  logsByEntity: Array<{
    entity: string;
    _count: { entity: number };
  }>;
}

function AuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      });

      const response = await fetch(`${API_BASE}/admin/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar logs de auditoria');
      }

      const data = await response.json();
      setLogs(data.data.logs);
      setTotalPages(data.data.pagination.totalPages);
      setCurrentPage(data.data.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/audit-logs/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar estatísticas');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const formatJsonData = (jsonString?: string): string => {
    if (!jsonString) return 'N/A';
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const getActionBadgeClass = (action: string): string => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'badge badge-success';
      case 'UPDATE': return 'badge badge-warning';
      case 'DELETE': return 'badge badge-danger';
      case 'LOGIN': return 'badge badge-info';
      case 'LOGOUT': return 'badge badge-secondary';
      default: return 'badge badge-primary';
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs(1);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entity: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
    fetchLogs(1);
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Logs de Auditoria</h1>
          <p>Rastreabilidade completa das ações do sistema</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalLogs.toLocaleString()}</div>
              <div className="stat-label">Total de Logs</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats.logsToday.toLocaleString()}</div>
              <div className="stat-label">Logs Hoje</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats.logsByAction.length}</div>
              <div className="stat-label">Tipos de Ação</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats.logsByEntity.length}</div>
              <div className="stat-label">Entidades Diferentes</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Ação:</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              placeholder="Ex: CREATE, UPDATE..."
            />
          </div>
          
          <div className="filter-group">
            <label>Entidade:</label>
            <input
              type="text"
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
              placeholder="Ex: users, settings..."
            />
          </div>
          
          <div className="filter-group">
            <label>ID do Usuário:</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="ID do usuário"
            />
          </div>
          
          <div className="filter-group">
            <label>Data Inicial:</label>
            <input
              type="datetime-local"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Data Final:</label>
            <input
              type="datetime-local"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button onClick={handleSearch} className="btn btn-primary">
            Filtrar
          </button>
          <button onClick={clearFilters} className="btn btn-secondary">
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-section">
        {loading ? (
          <div className="loading-state">
            <p>Carregando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum log encontrado</h3>
            <p>Tente ajustar os filtros para encontrar registros.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>Usuário</th>
                    <th>IP</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="timestamp">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td>
                        <span className={getActionBadgeClass(log.action)}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div className="entity-info">
                          <div className="entity-name">{log.entity}</div>
                          {log.entityId && (
                            <div className="entity-id">ID: {log.entityId}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        {log.user ? (
                          <div className="user-info">
                            <div className="user-name">{log.user.name}</div>
                            <div className="user-email">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="no-user">Sistema</span>
                        )}
                      </td>
                      <td>{log.ipAddress || 'N/A'}</td>
                      <td>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn btn-small btn-outline"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => fetchLogs(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn btn-outline"
              >
                Anterior
              </button>
              
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => fetchLogs(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="btn btn-outline"
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>Detalhes do Log: {selectedLog.action}</h2>
              <button 
                onClick={() => setSelectedLog(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="log-details">
                <div className="detail-group">
                  <label>ID:</label>
                  <span>{selectedLog.id}</span>
                </div>
                
                <div className="detail-group">
                  <label>Ação:</label>
                  <span className={getActionBadgeClass(selectedLog.action)}>
                    {selectedLog.action}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Entidade:</label>
                  <span>{selectedLog.entity}</span>
                </div>
                
                {selectedLog.entityId && (
                  <div className="detail-group">
                    <label>ID da Entidade:</label>
                    <span>{selectedLog.entityId}</span>
                  </div>
                )}
                
                <div className="detail-group">
                  <label>Data/Hora:</label>
                  <span>{new Date(selectedLog.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                
                {selectedLog.user && (
                  <div className="detail-group">
                    <label>Usuário:</label>
                    <div className="user-detail">
                      <div><strong>{selectedLog.user.name}</strong></div>
                      <div>{selectedLog.user.email}</div>
                      <div>ID: {selectedLog.user.id}</div>
                    </div>
                  </div>
                )}
                
                {selectedLog.ipAddress && (
                  <div className="detail-group">
                    <label>Endereço IP:</label>
                    <span>{selectedLog.ipAddress}</span>
                  </div>
                )}
                
                {selectedLog.userAgent && (
                  <div className="detail-group">
                    <label>User Agent:</label>
                    <span className="user-agent">{selectedLog.userAgent}</span>
                  </div>
                )}
                
                {selectedLog.oldData && (
                  <div className="detail-group full-width">
                    <label>Dados Anteriores:</label>
                    <pre className="json-data">{formatJsonData(selectedLog.oldData)}</pre>
                  </div>
                )}
                
                {selectedLog.newData && (
                  <div className="detail-group full-width">
                    <label>Dados Novos:</label>
                    <pre className="json-data">{formatJsonData(selectedLog.newData)}</pre>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setSelectedLog(null)}
                className="btn btn-primary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;