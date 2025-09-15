import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Organizacao {
  id: number;
  nome: string;
  cnpj: string;
  estado: string;
  municipio: string;
  dataVisita: string;
  status: 'completo' | 'pendente' | 'rascunho';
  idTecnico: number;
}

interface Filtros {
  busca: string;
  estado: string;
  municipio: string;
  status: string;
  dataInicio: string;
  dataFim: string;
}

interface ListaOrganizacoesProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'detalhes', organizacaoId?: number) => void;
}

function ListaOrganizacoes({ onNavigate }: ListaOrganizacoesProps) {
  const { } = useAuth();
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    estado: '',
    municipio: '',
    status: '',
    dataInicio: '',
    dataFim: ''
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [itensPorPagina] = useState(10);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  useEffect(() => {
    fetchOrganizacoes();
  }, [paginaAtual, filtros]);

  const fetchOrganizacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
      const queryParams = new URLSearchParams({
        pagina: paginaAtual.toString(),
        limite: itensPorPagina.toString(),
        ...filtros
      });

      const response = await fetch(`${API_BASE}/organizacoes?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar organizações');
      }

      const data = await response.json();
      setOrganizacoes(data.organizacoes || []);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo: keyof Filtros, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginaAtual(1); // Reset para primeira página ao filtrar
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      estado: '',
      municipio: '',
      status: '',
      dataInicio: '',
      dataFim: ''
    });
    setPaginaAtual(1);
  };

  const handleExcluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta organização?')) return;

    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/organizacoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir organização');
      }

      // Recarregar lista
      fetchOrganizacoes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'completo': { text: 'Completo', class: 'status-complete' },
      'pendente': { text: 'Pendente', class: 'status-pending' },
      'rascunho': { text: 'Rascunho', class: 'status-draft' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'status-unknown' };
    
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="lista-content">
        <div className="content-header">
          <h2>🏢 Lista de Organizações</h2>
          <p>Carregando organizações...</p>
        </div>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  return (
    <div className="lista-content">
      <div className="content-header">
        <div className="header-info">
          <h2>🏢 Lista de Organizações</h2>
          <p>Gerencie todas as organizações cadastradas no sistema</p>
        </div>
      </div>

      <div className="lista-body">
        {/* Filtros */}
        {mostrarFiltros && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Buscar</label>
                <input
                  type="text"
                  placeholder="Nome, CNPJ..."
                  value={filtros.busca}
                  onChange={(e) => handleFiltroChange('busca', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="BA">Bahia</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="ES">Espírito Santo</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="completo">Completo</option>
                  <option value="pendente">Pendente</option>
                  <option value="rascunho">Rascunho</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Data Início</label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Data Fim</label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                />
              </div>

              <div className="filter-actions">
                <button className="btn btn-secondary" onClick={limparFiltros}>
                  🗑️ Limpar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Organizações */}
        <div className="table-container">
          {error ? (
            <div className="error-message">
              <p>❌ {error}</p>
              <button onClick={fetchOrganizacoes} className="btn btn-primary">
                Tentar Novamente
              </button>
            </div>
          ) : organizacoes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>Nenhuma organização encontrada</h3>
              <p>Não há organizações que correspondam aos filtros aplicados.</p>
              <button className="btn btn-primary">
                ➕ Cadastrar Primeira Organização
              </button>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CNPJ</th>
                    <th>Localização</th>
                    <th>Data Visita</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {organizacoes.map((org) => (
                    <tr key={org.id}>
                      <td>
                        <div className="org-info">
                          <strong>{org.nome}</strong>
                          <small>ID: {org.id}</small>
                        </div>
                      </td>
                      <td>{org.cnpj || '-'}</td>
                      <td>
                        <div className="location-info">
                          <span>{org.municipio}</span>
                          <small>{org.estado}</small>
                        </div>
                      </td>
                      <td>
                        {org.dataVisita ? new Date(org.dataVisita).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td>{getStatusBadge(org.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => onNavigate('detalhes', org.id)}
                            title="Ver Detalhes"
                          >
                            👁️
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => onNavigate('edicao', org.id)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleExcluir(org.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                    disabled={paginaAtual === 1}
                  >
                    ← Anterior
                  </button>
                  
                  <div className="pagination-info">
                    Página {paginaAtual} de {totalPaginas}
                  </div>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaAtual === totalPaginas}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListaOrganizacoes;
