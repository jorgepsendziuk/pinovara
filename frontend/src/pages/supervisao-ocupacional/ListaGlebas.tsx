import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { Map, Plus, Eye, Search, Loader2, Edit } from 'lucide-react';
import Tooltip from '../../components/Tooltip';
import './SupervisaoOcupacionalModule.css';

interface Gleba {
  id: number;
  descricao: string;
  municipio: string | null;
  estado: string | null;
  estado_rel: { id: number; descricao: string; uf: string } | null;
  municipio_rel: { id: number; descricao: string } | null;
  _count: { familias: number };
}

export default function ListaGlebas() {
  const [glebas, setGlebas] = useState<Gleba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const pageSize = 20;

  useEffect(() => {
    loadGlebas();
  }, [page, filtroDescricao]);

  const loadGlebas = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize
      };
      if (filtroDescricao) {
        params.descricao = filtroDescricao;
      }
      const response = await api.get('/supervisao-ocupacional/glebas', { params });
      if (response.data.success) {
        setGlebas(response.data.data.data || []);
        setTotal(response.data.data.total || response.data.data.data?.length || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar glebas');
    } finally {
      setLoading(false);
    }
  };

  const columns: DataGridColumn<Gleba>[] = [
    {
      key: 'actions',
      title: 'Ações',
      width: '10%',
      align: 'left',
      render: (_, record: Gleba) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Tooltip text="Ver detalhes" backgroundColor="#3b82f6" delay={0}>
            <button
              onClick={() => navigate(`/supervisao-ocupacional/glebas/${record.id}`)}
              style={{
                padding: '6px 8px',
                border: '1px solid #3b82f6',
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#3b82f6';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#3b82f6';
              }}
            >
              <Eye size={16} />
            </button>
          </Tooltip>
          <Tooltip text="Editar gleba" backgroundColor="#056839" delay={0}>
            <button
              onClick={() => navigate(`/supervisao-ocupacional/glebas/edicao/${record.id}`)}
              style={{
                padding: '6px 8px',
                border: '1px solid #056839',
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#056839',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#056839';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#056839';
              }}
            >
              <Edit size={16} />
            </button>
          </Tooltip>
        </div>
      )
    },
    {
      key: 'id',
      title: 'ID',
      width: '8%',
      dataIndex: 'id',
      render: (id: number) => (
        <span style={{ fontWeight: '600', color: '#3b2313' }}>#{id}</span>
      )
    },
    {
      key: 'descricao',
      title: 'Descrição',
      width: '25%',
      dataIndex: 'descricao',
      render: (descricao: string) => (
        <span style={{ fontWeight: '500', color: '#334155' }}>{descricao || '-'}</span>
      )
    },
    {
      key: 'municipio',
      title: 'Município',
      width: '20%',
      render: (_, record: Gleba) => (
        <span style={{ color: '#64748b' }}>
          {record.municipio_rel?.descricao || record.municipio || '-'}
        </span>
      )
    },
    {
      key: 'estado',
      title: 'Estado',
      width: '12%',
      render: (_, record: Gleba) => {
        const uf = record.estado_rel?.uf || record.estado || '-';
        return (
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            backgroundColor: '#f0f9ff', 
            color: '#056839',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {uf}
          </span>
        );
      }
    },
    {
      key: 'familias',
      title: 'Famílias',
      width: '10%',
      align: 'center',
      render: (_, record: Gleba) => (
        <span style={{ color: '#64748b', fontWeight: '500' }}>
          {record._count?.familias || 0}
        </span>
      )
    }
  ];

  if (loading && glebas.length === 0) {
    return (
      <div className="supervisao-ocupacional-module" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando glebas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisao-ocupacional-module" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div className="content-header">
        <div className="header-info">
          <h1>
            <Map size={24} />
            Glebas/Assentamentos
          </h1>
          <p>
            {total} gleba{total !== 1 ? 's' : ''} cadastrada{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/supervisao-ocupacional/glebas/nova')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#056839',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#04502d';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#056839';
            }}
          >
            <Plus size={16} />
            Nova Gleba
          </button>
        </div>
      </div>

      <div className="lista-content">
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #ef4444', 
            color: '#991b1b', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '150px', maxWidth: '100%', width: '100%' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }}
            />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={filtroDescricao}
              onChange={(e) => setFiltroDescricao(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadGlebas()}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#056839';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 104, 57, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={loadGlebas}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              background: '#056839',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Search size={16} />
            Buscar
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', boxSizing: 'border-box' }}>
          <DataGrid
            columns={columns}
            dataSource={glebas}
            loading={loading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (newPage) => setPage(newPage)
            }}
            emptyState={{
              title: 'Nenhuma gleba encontrada',
              description: filtroDescricao
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira gleba',
              icon: <Map size={48} color="#cbd5e1" />,
              action: {
                label: 'Criar Gleba',
                onClick: () => navigate('/supervisao-ocupacional/glebas/nova')
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
