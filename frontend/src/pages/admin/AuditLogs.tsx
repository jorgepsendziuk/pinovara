import { useState, useEffect } from 'react';

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
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exporting, setExporting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

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

  const handleExport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('@pinovara:token');
      
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      });

      const response = await fetch(`${API_BASE}/admin/audit-logs/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao exportar logs');
      }

      const csvContent = await response.text();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  const renderDiff = (oldData?: string, newData?: string) => {
    if (!oldData || !newData) return null;
    
    try {
      const old = JSON.parse(oldData);
      const new_ = JSON.parse(newData);
      
      const changes: string[] = [];
      const allKeys = new Set([...Object.keys(old || {}), ...Object.keys(new_ || {})]);
      
      for (const key of allKeys) {
        const oldValue = old?.[key];
        const newValue = new_?.[key];
        
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push(`${key}: "${oldValue}" → "${newValue}"`);
        }
      }
      
      return changes.length > 0 ? (
        <div className="diff-container">
          <div className="diff-title">Alterações:</div>
          {changes.map((change, index) => (
            <div key={index} className="diff-item">{change}</div>
          ))}
        </div>
      ) : null;
    } catch {
      return <div className="diff-error">Erro ao processar diff</div>;
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  // Auto-refresh quando habilitado
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchLogs(currentPage);
      fetchStats();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, currentPage]);

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
          <button 
            onClick={handleExport} 
            className="btn btn-success"
            disabled={exporting}
          >
            {exporting ? 'Exportando...' : '📊 Exportar CSV'}
          </button>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>🔄 Auto-refresh (30s)</span>
          </label>
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
                
                {selectedLog.oldData && selectedLog.newData && (
                  <div className="detail-group full-width">
                    <label>Comparação de Dados:</label>
                    {renderDiff(selectedLog.oldData, selectedLog.newData)}
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

// Estilos CSS para as novas funcionalidades
const styles = `
  .auto-refresh-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #666;
    cursor: pointer;
  }

  .auto-refresh-toggle input[type="checkbox"] {
    margin: 0;
  }

  .filter-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn-success {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .btn-success:hover:not(:disabled) {
    background-color: #218838;
  }

  .btn-success:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .diff-container {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 1rem;
    margin: 0.5rem 0;
  }

  .diff-title {
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #495057;
  }

  .diff-item {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 3px;
    padding: 0.5rem;
    margin: 0.25rem 0;
    font-family: monospace;
    font-size: 0.85rem;
  }

  .diff-error {
    color: #dc3545;
    font-style: italic;
    padding: 0.5rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 3px;
  }

  .json-data {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    padding: 0.75rem;
    font-size: 0.8rem;
    max-height: 200px;
    overflow-y: auto;
  }
`;