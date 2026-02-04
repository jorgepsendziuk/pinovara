import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Map, Users, Loader2 } from 'lucide-react';
import './SupervisaoOcupacionalModule.css';

interface DashboardStats {
  totalGlebas: number;
  totalFamilias: number;
  familiasPorEstado: Array<{ estado: number | null; _count: number }>;
  familiasPorValidacao: Array<{ validacao: number | null; _count: number }>;
}

export default function DashboardSupervisao() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supervisao-ocupacional/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="content-header">
          <div className="header-info">
            <h1>
              <BarChart3 size={24} />
              Supervisão Ocupacional
            </h1>
          </div>
        </div>
        <div className="lista-content">
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #ef4444', 
            color: '#991b1b', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            Erro: {error}
          </div>
        </div>
      </div>
    );
  }

  const totalGlebas = stats?.totalGlebas || 0;
  const totalFamilias = stats?.totalFamilias || 0;

  return (
    <div className="supervisao-ocupacional-module">
      <div className="content-header">
        <div className="header-info">
          <h1>
            <BarChart3 size={24} />
            Supervisão Ocupacional
          </h1>
          <p>
            {totalGlebas} gleba{totalGlebas !== 1 ? 's' : ''} cadastrada{totalGlebas !== 1 ? 's' : ''} • {totalFamilias} família{totalFamilias !== 1 ? 's' : ''} cadastrada{totalFamilias !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="lista-content">
        <div className="stats-grid">
          <div className="stats-card">
            <h2>
              <Map size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
              Total de Glebas
            </h2>
            <p className="stat-value">{totalGlebas}</p>
          </div>
          
          <div className="stats-card">
            <h2>
              <Users size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
              Total de Famílias
            </h2>
            <p className="stat-value">{totalFamilias}</p>
          </div>
        </div>

        <div className="stats-card">
          <h2>Estatísticas</h2>
          <p style={{ color: '#64748b' }}>Dashboard em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
}
