import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  uptime: number;
  loadAverage: number[];
  processes: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
}

function SystemMonitor() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'logs'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(`${API_BASE}/admin/system-monitor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(`${API_BASE}/admin/system-logs?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data.logs || []);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchLogs();
    setLoading(false);
  }, []);

  useEffect(() => {
    let interval: number;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMetrics();
        if (activeTab === 'logs') {
          fetchLogs();
        }
      }, 5000); // Atualizar a cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab]);

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getUsageColor = (usage: number): string => {
    if (usage < 50) return 'success';
    if (usage < 80) return 'warning';
    return 'danger';
  };

  const getLogLevelColor = (level: string): string => {
    switch (level) {
      case 'ERROR': return 'danger';
      case 'WARN': return 'warning';
      case 'INFO': return 'info';
      case 'DEBUG': return 'secondary';
      default: return 'primary';
    }
  };

  const renderProgressBar = (value: number, max: number = 100, color?: string): React.JSX.Element => {
    const percentage = Math.min((value / max) * 100, 100);
    const colorClass = color || getUsageColor(percentage);

    return (
      <div className="progress-bar-container">
        <div
          className={`progress-bar-fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
        <span className="progress-bar-text">{percentage.toFixed(1)}%</span>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'logs', label: 'Logs do Sistema', icon: '📋' }
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando monitor do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🔍 Monitor do Sistema</h1>
          <p>Monitoramento em tempo real do PINOVARA</p>
        </div>

        <div className="header-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Atualização automática</span>
          </label>
          <button onClick={() => { fetchMetrics(); fetchLogs(); }} className="btn btn-primary">
            🔄 Atualizar Agora
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="monitor-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="overview-content">
            {/* System Status Cards */}
            <div className="status-cards-grid">
              <div className="status-card">
                <div className="status-card-header">
                  <span className="status-icon">🖥️</span>
                  <h3>CPU</h3>
                </div>
                <div className="status-card-content">
                  <div className="metric">
                    <span className="metric-label">Uso:</span>
                    <span className="metric-value">{metrics.cpu.usage.toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Núcleos:</span>
                    <span className="metric-value">{metrics.cpu.cores}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Temperatura:</span>
                    <span className="metric-value">{metrics.cpu.temperature}°C</span>
                  </div>
                  {renderProgressBar(metrics.cpu.usage)}
                </div>
              </div>

              <div className="status-card">
                <div className="status-card-header">
                  <span className="status-icon">🧠</span>
                  <h3>Memória</h3>
                </div>
                <div className="status-card-content">
                  <div className="metric">
                    <span className="metric-label">Usada:</span>
                    <span className="metric-value">{formatBytes(metrics.memory.used)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Total:</span>
                    <span className="metric-value">{formatBytes(metrics.memory.total)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Livre:</span>
                    <span className="metric-value">{formatBytes(metrics.memory.free)}</span>
                  </div>
                  {renderProgressBar(metrics.memory.usage)}
                </div>
              </div>

              <div className="status-card">
                <div className="status-card-header">
                  <span className="status-icon">💾</span>
                  <h3>Disco</h3>
                </div>
                <div className="status-card-content">
                  <div className="metric">
                    <span className="metric-label">Usado:</span>
                    <span className="metric-value">{formatBytes(metrics.disk.used)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Total:</span>
                    <span className="metric-value">{formatBytes(metrics.disk.total)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Livre:</span>
                    <span className="metric-value">{formatBytes(metrics.disk.free)}</span>
                  </div>
                  {renderProgressBar(metrics.disk.usage)}
                </div>
              </div>

              <div className="status-card">
                <div className="status-card-header">
                  <span className="status-icon">🌐</span>
                  <h3>Rede</h3>
                </div>
                <div className="status-card-content">
                  <div className="metric">
                    <span className="metric-label">Entrada:</span>
                    <span className="metric-value">{formatBytes(metrics.network.bytesIn)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Saída:</span>
                    <span className="metric-value">{formatBytes(metrics.network.bytesOut)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Conexões:</span>
                    <span className="metric-value">{metrics.network.connections}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="system-info-grid">
              <div className="info-card">
                <h3>⏱️ Tempo de Atividade</h3>
                <div className="info-value">{formatUptime(metrics.uptime)}</div>
              </div>

              <div className="info-card">
                <h3>⚙️ Processos Ativos</h3>
                <div className="info-value">{metrics.processes}</div>
              </div>

              <div className="info-card">
                <h3>📈 Carga Média</h3>
                <div className="info-value">{metrics.loadAverage.join(', ')}</div>
              </div>

              <div className="info-card">
                <h3>👨‍💼 Administrador</h3>
                <div className="info-value">{user?.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && metrics && (
          <div className="performance-content">
            <div className="performance-charts">
              <div className="chart-container">
                <h3>Uso de Recursos em Tempo Real</h3>
                <div className="real-time-metrics">
                  <div className="metric-gauge">
                    <div className="gauge-header">
                      <span>CPU</span>
                      <span className="gauge-value">{metrics.cpu.usage.toFixed(1)}%</span>
                    </div>
                    <div className="gauge-bar">
                      <div
                        className="gauge-fill"
                        style={{ width: `${metrics.cpu.usage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric-gauge">
                    <div className="gauge-header">
                      <span>Memória</span>
                      <span className="gauge-value">{metrics.memory.usage.toFixed(1)}%</span>
                    </div>
                    <div className="gauge-bar">
                      <div
                        className="gauge-fill"
                        style={{ width: `${metrics.memory.usage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric-gauge">
                    <div className="gauge-header">
                      <span>Disco</span>
                      <span className="gauge-value">{metrics.disk.usage.toFixed(1)}%</span>
                    </div>
                    <div className="gauge-bar">
                      <div
                        className="gauge-fill"
                        style={{ width: `${metrics.disk.usage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <h3>Detalhes de Performance</h3>
                <div className="performance-details">
                  <div className="detail-item">
                    <span className="detail-label">Carga do Sistema (1min):</span>
                    <span className="detail-value">{metrics.loadAverage[0]?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Carga do Sistema (5min):</span>
                    <span className="detail-value">{metrics.loadAverage[1]?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Carga do Sistema (15min):</span>
                    <span className="detail-value">{metrics.loadAverage[2]?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Temperatura CPU:</span>
                    <span className="detail-value">{metrics.cpu.temperature}°C</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Núcleos CPU:</span>
                    <span className="detail-value">{metrics.cpu.cores}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="logs-content">
            <div className="logs-header">
              <h3>Logs do Sistema</h3>
              <div className="logs-controls">
                <button onClick={fetchLogs} className="btn btn-outline">
                  🔄 Atualizar Logs
                </button>
                <div className="log-filters">
                  <select className="form-select">
                    <option value="all">Todos os níveis</option>
                    <option value="error">Erro</option>
                    <option value="warn">Aviso</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
              </div>
            </div>

            {logsLoading ? (
              <div className="loading-state">
                <p>Carregando logs...</p>
              </div>
            ) : (
              <div className="logs-container">
                {logs.length === 0 ? (
                  <div className="empty-state">
                    <h3>Nenhum log encontrado</h3>
                    <p>Os logs do sistema aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="logs-list">
                    {logs.map((log) => (
                      <div key={log.id} className="log-entry">
                        <div className="log-meta">
                          <span className={`log-level ${getLogLevelColor(log.level)}`}>
                            {log.level}
                          </span>
                          <span className="log-timestamp">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                          <span className="log-source">{log.source}</span>
                        </div>
                        <div className="log-message">
                          {log.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemMonitor;
