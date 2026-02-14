import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { Map, Plus, Eye, Search, Loader2, Edit } from 'lucide-react';
import Tooltip from '../../components/Tooltip';
import './SupervisaoOcupacionalModule.css';

const TIPOS_TERRITORIO = [
  { value: '', label: 'Todos os tipos' },
  { value: 'gleba', label: 'Gleba' },
  { value: 'assentamento', label: 'Assentamento' },
  { value: 'quilombo', label: 'Quilombo' }
];

interface Gleba {
  id: number;
  descricao: string;
  tipo?: string | null;
  municipio: string | null;
  estado: string | null;
  id_estado?: number | null;
  id_municipio?: number | null;
  estado_rel: { id: number; descricao: string; uf: string } | null;
  municipio_rel: { id: number; descricao: string } | null;
  _count: { familias: number };
}

interface Estado {
  id: number;
  descricao: string;
  uf: string;
}

interface Municipio {
  id: number;
  descricao: string;
}

export default function ListaGlebas() {
  const [glebas, setGlebas] = useState<Gleba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const pageSize = 20;

  useEffect(() => {
    api.get('/supervisao-ocupacional/estados').then(res => {
      if (res.data?.data) setEstados(Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filtroEstado) {
      setMunicipios([]);
      setFiltroMunicipio('');
      return;
    }
    api.get(`/supervisao-ocupacional/municipios/${filtroEstado}`).then(res => {
      if (res.data?.data) setMunicipios(Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []);
    }).catch(() => setMunicipios([]));
    setFiltroMunicipio('');
  }, [filtroEstado]);

  useEffect(() => {
    loadGlebas();
  }, [page, filtroNome, filtroEstado, filtroMunicipio, filtroTipo]);

  const loadGlebas = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize
      };
      if (filtroNome) params.descricao = filtroNome;
      if (filtroEstado) params.id_estado = filtroEstado;
      if (filtroMunicipio) params.id_municipio = filtroMunicipio;
      if (filtroTipo) params.tipo = filtroTipo;
      const response = await api.get('/supervisao-ocupacional/glebas', { params });
      if (response.data.success) {
        setGlebas(response.data.data.data || []);
        setTotal(response.data.data.total || response.data.data.data?.length || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar territórios');
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
              onClick={() => navigate(`/familias/territorios/${record.id}`)}
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
          <Tooltip text="Editar território" backgroundColor="#056839" delay={0}>
            <button
              onClick={() => navigate(`/familias/territorios/edicao/${record.id}`)}
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
      width: '10%',
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
      key: 'tipo',
      title: 'Tipo',
      width: '12%',
      render: (_, record: Gleba) => {
        const t = (record.tipo || '').toLowerCase();
        const label = t === 'gleba' ? 'Gleba' : t === 'assentamento' ? 'Assentamento' : t === 'quilombo' ? 'Quilombo' : record.tipo || '-';
        return <span style={{ color: '#64748b' }}>{label}</span>;
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
          <p>Carregando territórios...</p>
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
            Territórios
          </h1>
          <p>
            {total} território{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-territorio-cadastrar"
            onClick={() => navigate('/familias/territorios/nova')}
          >
            <Plus size={16} />
            Cadastrar
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

        <div className="territorios-filtros" style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '160px', maxWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadGlebas()}
              style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', minWidth: '120px' }}
          >
            <option value="">Todos os estados</option>
            {estados.map(e => (
              <option key={e.id} value={e.id}>{e.uf}</option>
            ))}
          </select>
          <select
            value={filtroMunicipio}
            onChange={(e) => setFiltroMunicipio(e.target.value)}
            disabled={!filtroEstado}
            style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', minWidth: '140px', opacity: filtroEstado ? 1 : 0.7 }}
          >
            <option value="">Todos os municípios</option>
            {municipios.map(m => (
              <option key={m.id} value={m.id}>{m.descricao}</option>
            ))}
          </select>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', minWidth: '140px' }}
          >
            {TIPOS_TERRITORIO.map(t => (
              <option key={t.value || 'all'} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button type="button" onClick={loadGlebas} className="btn-territorio-cadastrar" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              title: 'Nenhum território encontrado',
              description: filtroNome || filtroEstado || filtroMunicipio || filtroTipo
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando seu primeiro território',
              icon: <Map size={48} color="#cbd5e1" />,
              action: {
                label: 'Cadastrar',
                onClick: () => navigate('/familias/territorios/nova')
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
