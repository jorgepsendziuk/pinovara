import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface BackupFile {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'in_progress' | 'failed';
}

interface BackupSettings {
  autoBackup: boolean;
  schedule: string;
  retentionDays: number;
  maxBackups: number;
}

function BackupManager() {
  const { } = useAuth();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: true,
    schedule: 'daily',
    retentionDays: 30,
    maxBackups: 10
  });
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'backups' | 'settings'>('backups');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/backups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data.data.backups || []);
      }
    } catch (error) {
      console.error('Erro ao buscar backups:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/backup-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  useEffect(() => {
    fetchBackups();
    fetchSettings();
    setLoading(false);
  }, []);

  const createBackup = async () => {
    setBackupLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'manual' })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Backup criado com sucesso!' });
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: 'Erro ao criar backup' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setBackupLoading(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá restaurar o banco de dados. Todos os dados atuais serão substituídos. Deseja continuar?')) {
      return;
    }

    setRestoreLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/backup/${backupId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Backup restaurado com sucesso!' });
        // Recarregar a página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Erro ao restaurar backup' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setRestoreLoading(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este backup?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Backup excluído com sucesso!' });
        fetchBackups();
      } else {
        setMessage({ type: 'error', text: 'Erro ao excluir backup' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const updateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/backup-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Concluído</span>;
      case 'in_progress':
        return <span className="badge badge-warning">Em Progresso</span>;
      case 'failed':
        return <span className="badge badge-danger">Falhou</span>;
      default:
        return <span className="badge badge-secondary">Desconhecido</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'manual':
        return <span className="badge badge-info">Manual</span>;
      case 'automatic':
        return <span className="badge badge-primary">Automático</span>;
      default:
        return <span className="badge badge-secondary">Desconhecido</span>;
    }
  };

  const tabs = [
    { id: 'backups', label: 'Backups', icon: '💾' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando gerenciador de backup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>💾 Gerenciador de Backup</h1>
          <p>Backup e restauração do sistema PINOVARA</p>
        </div>

        <div className="header-actions">
          <button onClick={() => { fetchBackups(); fetchSettings(); }} className="btn btn-primary">
            🔄 Atualizar
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          <p>{message.text}</p>
          <button onClick={() => setMessage(null)} className="alert-close">×</button>
        </div>
      )}

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
        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div className="backups-content">
            {/* Backup Actions */}
            <div className="backup-actions">
              <div className="action-card">
                <div className="action-header">
                  <div className="action-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <span>💾</span>
                  </div>
                  <div className="action-stats">{backups.length} backups</div>
                </div>

                <div className="action-content">
                  <h3>Criar Backup Manual</h3>
                  <p>Faça um backup completo do banco de dados agora</p>
                  <button
                    onClick={createBackup}
                    disabled={backupLoading}
                    className="btn btn-primary"
                  >
                    {backupLoading ? 'Criando...' : 'Criar Backup'}
                  </button>
                </div>
              </div>

              <div className="backup-stats">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-value">{backups.length}</div>
                    <div className="stat-label">Total de Backups</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-value">{backups.filter(b => b.status === 'completed').length}</div>
                    <div className="stat-label">Concluídos</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏰</div>
                  <div className="stat-content">
                    <div className="stat-value">{backups.filter(b => b.status === 'in_progress').length}</div>
                    <div className="stat-label">Em Progresso</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backups List */}
            <div className="backups-list">
              <h2>📋 Lista de Backups</h2>

              {backups.length === 0 ? (
                <div className="empty-state">
                  <h3>Nenhum backup encontrado</h3>
                  <p>Crie seu primeiro backup para proteger seus dados</p>
                  <button onClick={createBackup} className="btn btn-primary">
                    Criar Primeiro Backup
                  </button>
                </div>
              ) : (
                <div className="backups-table">
                  <div className="table-header">
                    <div className="col-filename">Arquivo</div>
                    <div className="col-size">Tamanho</div>
                    <div className="col-type">Tipo</div>
                    <div className="col-status">Status</div>
                    <div className="col-date">Data</div>
                    <div className="col-actions">Ações</div>
                  </div>

                  {backups.map((backup) => (
                    <div key={backup.id} className="table-row">
                      <div className="col-filename">
                        <div className="filename">{backup.filename}</div>
                      </div>
                      <div className="col-size">{formatBytes(backup.size)}</div>
                      <div className="col-type">{getTypeBadge(backup.type)}</div>
                      <div className="col-status">{getStatusBadge(backup.status)}</div>
                      <div className="col-date">
                        {new Date(backup.createdAt).toLocaleString('pt-BR')}
                      </div>
                      <div className="col-actions">
                        <button
                          onClick={() => restoreBackup(backup.id)}
                          disabled={backup.status !== 'completed' || restoreLoading}
                          className="btn btn-success btn-sm"
                          title="Restaurar"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="btn btn-danger btn-sm"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-content">
            <div className="settings-form">
              <h2>⚙️ Configurações de Backup</h2>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                  />
                  Backup Automático
                </label>
                <p className="form-help">Ativar criação automática de backups</p>
              </div>

              <div className="form-group">
                <label className="form-label">Frequência do Backup</label>
                <select
                  value={settings.schedule}
                  onChange={(e) => setSettings({...settings, schedule: e.target.value})}
                  className="form-select"
                >
                  <option value="hourly">A cada hora</option>
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Mensalmente</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dias de Retenção</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({...settings, retentionDays: parseInt(e.target.value)})}
                  className="form-input"
                />
                <p className="form-help">Quantos dias manter os backups antigos</p>
              </div>

              <div className="form-group">
                <label className="form-label">Máximo de Backups</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxBackups}
                  onChange={(e) => setSettings({...settings, maxBackups: parseInt(e.target.value)})}
                  className="form-input"
                />
                <p className="form-help">Número máximo de backups a manter</p>
              </div>

              <div className="form-actions">
                <button onClick={updateSettings} className="btn btn-primary">
                  💾 Salvar Configurações
                </button>
              </div>
            </div>

            {/* Backup Information */}
            <div className="backup-info">
              <h3>ℹ️ Informações sobre Backup</h3>

              <div className="info-section">
                <h4>💡 Dicas de Segurança</h4>
                <ul>
                  <li>Faça backups regulares do sistema</li>
                  <li>Teste a restauração em ambiente de desenvolvimento</li>
                  <li>Mantenha backups em local seguro</li>
                  <li>Verifique a integridade dos backups periodicamente</li>
                </ul>
              </div>

              <div className="info-section">
                <h4>⚠️ Avisos Importantes</h4>
                <ul>
                  <li>A restauração substitui todos os dados atuais</li>
                  <li>Faça backup antes de restaurar</li>
                  <li>Durante a restauração, o sistema pode ficar indisponível</li>
                  <li>Consulte o administrador do sistema antes de operações críticas</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BackupManager;
