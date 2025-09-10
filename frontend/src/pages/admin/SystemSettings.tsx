import { useState, useEffect } from 'react';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SettingsByCategory {
  [category: string]: SystemSetting[];
}

function SystemSettings() {
  const [settings, setSettings] = useState<SettingsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    type: 'string' as const,
    description: '',
    category: 'general'
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/settings/by-category`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar configurações');
      }

      const data = await response.json();
      setSettings(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (setting: SystemSetting) => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/settings/${setting.key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: setting.value,
          description: setting.description,
          type: setting.type
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar configuração');
      }

      await fetchSettings();
      setEditingSetting(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleCreateSetting = async () => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSetting),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar configuração');
      }

      await fetchSettings();
      setShowCreateForm(false);
      setNewSetting({
        key: '',
        value: '',
        type: 'string',
        description: '',
        category: 'general'
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar');
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/admin/settings/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir configuração');
      }

      await fetchSettings();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const formatValue = (setting: SystemSetting): string => {
    if (setting.type === 'boolean') {
      return setting.value === 'true' ? 'Sim' : 'Não';
    }
    return setting.value;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Configurações do Sistema</h1>
          <p>Gerencie os parâmetros e configurações do sistema PINOVARA</p>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            + Nova Configuração
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Create Setting Form */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Nova Configuração</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Chave:</label>
                <input
                  type="text"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                  placeholder="Ex: app_name"
                />
              </div>
              
              <div className="form-group">
                <label>Valor:</label>
                <input
                  type="text"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={newSetting.type}
                  onChange={(e) => setNewSetting({...newSetting, type: e.target.value as any})}
                >
                  <option value="string">String</option>
                  <option value="number">Número</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Categoria:</label>
                <input
                  type="text"
                  value={newSetting.category}
                  onChange={(e) => setNewSetting({...newSetting, category: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateSetting}
                className="btn btn-primary"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="settings-content">
        {Object.keys(settings).length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma configuração encontrada</h3>
            <p>Crie a primeira configuração do sistema.</p>
          </div>
        ) : (
          Object.entries(settings).map(([category, categorySettings]) => (
            <div key={category} className="settings-category">
              <div className="category-header">
                <h2>{category.toUpperCase()}</h2>
                <span className="category-count">{categorySettings.length} configurações</span>
              </div>
              
              <div className="settings-grid">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className="setting-card">
                    <div className="setting-header">
                      <div className="setting-key">
                        <h3>{setting.key}</h3>
                        <span className="setting-type">{setting.type}</span>
                      </div>
                      
                      <div className="setting-actions">
                        <button
                          onClick={() => setEditingSetting(setting)}
                          className="btn btn-small btn-outline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(setting.key)}
                          className="btn btn-small btn-danger"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    
                    <div className="setting-content">
                      <div className="setting-value">
                        <strong>Valor:</strong> {formatValue(setting)}
                      </div>
                      
                      {setting.description && (
                        <div className="setting-description">
                          <strong>Descrição:</strong> {setting.description}
                        </div>
                      )}
                      
                      <div className="setting-meta">
                        <span>Atualizado: {new Date(setting.updatedAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Setting Modal */}
      {editingSetting && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Editar Configuração: {editingSetting.key}</h2>
              <button 
                onClick={() => setEditingSetting(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Valor:</label>
                <input
                  type={editingSetting.type === 'number' ? 'number' : 'text'}
                  value={editingSetting.value}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting, 
                    value: e.target.value
                  })}
                />
              </div>
              
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={editingSetting.type}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting, 
                    type: e.target.value as any
                  })}
                >
                  <option value="string">String</option>
                  <option value="number">Número</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  value={editingSetting.description || ''}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting, 
                    description: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setEditingSetting(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleUpdateSetting(editingSetting)}
                className="btn btn-primary"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemSettings;