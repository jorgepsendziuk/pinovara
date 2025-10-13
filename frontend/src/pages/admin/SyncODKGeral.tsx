import React, { useState, useEffect } from 'react';
import { Download, Database, Image, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import api from '../../services/api';
import './SyncODKGeral.css';

interface Stats {
  total_organizacoes: number;
  com_uuid: number;
  sem_uuid: number;
  com_fotos_local: number;
  com_arquivos_local: number;
  sem_fotos_local: number;
  sem_arquivos_local: number;
}

interface SyncResult {
  id_organizacao: number;
  nome: string;
  uri: string | null;
  fotos_sincronizadas: number;
  arquivos_sincronizados: number;
  erro_fotos?: string;
  erro_arquivos?: string;
}

interface SyncAllResult {
  total_organizacoes: number;
  organizacoes_com_uuid: number;
  organizacoes_sem_uuid: number;
  total_fotos: number;
  total_arquivos: number;
  sucessos: number;
  erros: number;
  resultados: SyncResult[];
}

const SyncODKGeral: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [syncResult, setSyncResult] = useState<SyncAllResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get('/admin/odk/stats');
      setStats(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
      setError(err.response?.data?.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSincronizarTudo = async () => {
    if (!confirm('Deseja sincronizar TODAS as fotos e arquivos do ODK? Isso pode demorar vários minutos.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSyncResult(null);

      // Timeout de 30 minutos (1800000 ms) para sincronização em massa
      const response = await api.post('/admin/odk/sync-all', {}, {
        timeout: 1800000 // 30 minutos
      });

      setSyncResult(response.data.data);
      
      // Recarregar estatísticas após sincronização
      await carregarEstatisticas();

    } catch (err: any) {
      console.error('Erro na sincronização:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao sincronizar organizações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sync-odk-geral">
      <div className="page-header">
        <div className="page-header-left">
          <Database size={32} />
          <div>
            <h1>Sincronização ODK em Massa</h1>
            <p>Baixar fotos e documentos de todas as organizações</p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {loadingStats ? (
        <div className="loading-container">
          <Loader className="spin" size={32} />
          <p>Carregando estatísticas...</p>
        </div>
      ) : stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Database size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total de Organizações</span>
              <span className="stat-value">{stats.total_organizacoes}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Com UUID (ODK)</span>
              <span className="stat-value">{stats.com_uuid}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Sem UUID</span>
              <span className="stat-value">{stats.sem_uuid}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Image size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Com Fotos Locais</span>
              <span className="stat-value">{stats.com_fotos_local}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Com Arquivos Locais</span>
              <span className="stat-value">{stats.com_arquivos_local}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <Image size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Sem Fotos Locais</span>
              <span className="stat-value">{stats.sem_fotos_local}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Sem Arquivos Locais</span>
              <span className="stat-value">{stats.sem_arquivos_local}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ação */}
      <div className="action-section">
        <button 
          className="btn-sync-all"
          onClick={handleSincronizarTudo}
          disabled={loading || !stats || stats.com_uuid === 0}
        >
          {loading ? (
            <>
              <Loader className="spin" size={20} />
              Sincronizando...
            </>
          ) : (
            <>
              <Download size={20} />
              Sincronizar Todas as Organizações
            </>
          )}
        </button>
        
        {loading && (
          <p className="info-text">
            <Loader className="spin" size={16} />
            Sincronizando {stats?.com_uuid || 0} organizações. Isso pode levar vários minutos, aguarde...
          </p>
        )}
        
        {stats && stats.com_uuid === 0 && !loading && (
          <p className="warning-text">
            <AlertCircle size={16} />
            Nenhuma organização com UUID para sincronizar
          </p>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Resultado da Sincronização */}
      {syncResult && (
        <div className="sync-result">
          <h2>Resultado da Sincronização</h2>
          
          <div className="result-summary">
            <div className="summary-item success">
              <CheckCircle size={20} />
              <span>{syncResult.total_fotos} fotos baixadas</span>
            </div>
            <div className="summary-item success">
              <CheckCircle size={20} />
              <span>{syncResult.total_arquivos} arquivos baixados</span>
            </div>
            <div className="summary-item">
              <Database size={20} />
              <span>{syncResult.sucessos} organizações sincronizadas</span>
            </div>
            {syncResult.erros > 0 && (
              <div className="summary-item error">
                <AlertCircle size={20} />
                <span>{syncResult.erros} erros</span>
              </div>
            )}
          </div>

          {/* Detalhes por Organização */}
          <div className="result-details">
            <h3>Detalhes por Organização</h3>
            <table className="result-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Fotos</th>
                  <th>Arquivos</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {syncResult.resultados
                  .filter(r => r.uri) // Mostrar apenas organizações com URI
                  .sort((a, b) => {
                    // Ordenar: primeiro com dados, depois por ID
                    const aTotal = a.fotos_sincronizadas + a.arquivos_sincronizados;
                    const bTotal = b.fotos_sincronizadas + b.arquivos_sincronizados;
                    if (aTotal > 0 && bTotal === 0) return -1;
                    if (aTotal === 0 && bTotal > 0) return 1;
                    return a.id_organizacao - b.id_organizacao;
                  })
                  .map(resultado => {
                    const total = resultado.fotos_sincronizadas + resultado.arquivos_sincronizados;
                    const temErro = resultado.erro_fotos || resultado.erro_arquivos;
                    
                    return (
                      <tr key={resultado.id_organizacao} className={total > 0 ? 'has-data' : ''}>
                        <td>#{resultado.id_organizacao}</td>
                        <td>{resultado.nome}</td>
                        <td>
                          {resultado.fotos_sincronizadas > 0 ? (
                            <span className="badge success">{resultado.fotos_sincronizadas}</span>
                          ) : resultado.erro_fotos ? (
                            <span className="badge error" title={resultado.erro_fotos}>Erro</span>
                          ) : (
                            <span className="badge">0</span>
                          )}
                        </td>
                        <td>
                          {resultado.arquivos_sincronizados > 0 ? (
                            <span className="badge success">{resultado.arquivos_sincronizados}</span>
                          ) : resultado.erro_arquivos ? (
                            <span className="badge error" title={resultado.erro_arquivos}>Erro</span>
                          ) : (
                            <span className="badge">0</span>
                          )}
                        </td>
                        <td>
                          {temErro ? (
                            <span className="status-icon error" title={resultado.erro_fotos || resultado.erro_arquivos}>
                              <AlertCircle size={16} />
                            </span>
                          ) : total > 0 ? (
                            <span className="status-icon success">
                              <CheckCircle size={16} />
                            </span>
                          ) : (
                            <span className="status-text">Sem dados</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncODKGeral;

