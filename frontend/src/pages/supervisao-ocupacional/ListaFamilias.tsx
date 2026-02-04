import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { Users, Eye, Search, Loader2, Calendar, Edit, CheckCircle } from 'lucide-react';
import Tooltip from '../../components/Tooltip';
import { StatusValidacaoBadge } from '../../utils/validacaoHelpers';
import { useAuth } from '../../contexts/AuthContext';
import './SupervisaoOcupacionalModule.css';

interface Familia {
  id: number;
  uri: string;
  creation_date: string | null;
  gleba_rel: { id: number; descricao: string } | null;
  estado_rel: { id: number; descricao: string; uf: string } | null;
  municipio_rel: { id: number; descricao: string } | null;
  validacao_rel: { id: number; descricao: string } | null;
  validacao: number | null;
  tecnico_rel: { id: number; name: string } | null;
  estagiario_rel: { id: number; name: string } | null;
  comunidade: string | null;
  quilombo: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  // Campos para identificação (usando nomes do tipo FamiliaCompleta)
  iuf_nome_ocupante?: string | null; // Nome do ocupante
  g00_0_q1_2?: string | null; // CPF
  i_q1_10?: string | null; // Número do lote
  i_q1_17?: number | null; // Família aceitou visita
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

interface Gleba {
  id: number;
  descricao: string;
}

interface Tecnico {
  id: number;
  name: string;
  email: string | null;
}

export default function ListaFamilias() {
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroValidacao, setFiltroValidacao] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>('');
  const [filtroGleba, setFiltroGleba] = useState<string>('');
  const [filtroAceitouVisita, setFiltroAceitouVisita] = useState<string>('');
  const [filtroTecnico, setFiltroTecnico] = useState<string>('');
  const [filtroQuilombo, setFiltroQuilombo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const pageSize = 20;

  // Estados para dropdowns
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [glebas, setGlebas] = useState<Gleba[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState(false);

  // Verificar permissões de edição
  const canEdit = hasPermission('sistema', 'admin') || 
                  hasPermission('supervisao_ocupacional', 'admin') || 
                  hasPermission('supervisao_ocupacional', 'tecnico');

  // Verificar permissões de validação
  const canValidate = hasPermission('sistema', 'admin') || 
                      hasPermission('supervisao_ocupacional', 'admin') || 
                      hasPermission('supervisao_ocupacional', 'coordenador');

  useEffect(() => {
    loadFiltros();
  }, []);

  useEffect(() => {
    if (filtroEstado) {
      loadMunicipios(parseInt(filtroEstado));
    } else {
      setMunicipios([]);
      setFiltroMunicipio('');
    }
  }, [filtroEstado]);

  useEffect(() => {
    loadFamilias();
  }, [page, filtroBusca, filtroValidacao, filtroEstado, filtroMunicipio, filtroGleba, filtroAceitouVisita, filtroTecnico, filtroQuilombo]);

  const loadFiltros = async () => {
    try {
      setLoadingFiltros(true);
      const [estadosRes, glebasRes, tecnicosRes] = await Promise.all([
        api.get('/supervisao-ocupacional/estados'),
        api.get('/supervisao-ocupacional/glebas', { params: { limit: 1000 } }),
        api.get('/supervisao-ocupacional/tecnicos')
      ]);

      if (estadosRes.data.success) {
        setEstados(estadosRes.data.data || []);
      }
      if (glebasRes.data.success) {
        setGlebas(glebasRes.data.data.data || []);
      }
      if (tecnicosRes.data.success) {
        setTecnicos(tecnicosRes.data.data || []);
      }
    } catch (err: any) {
      console.error('Erro ao carregar filtros:', err);
    } finally {
      setLoadingFiltros(false);
    }
  };

  const loadMunicipios = async (estadoId: number) => {
    try {
      const response = await api.get(`/supervisao-ocupacional/municipios/${estadoId}`);
      if (response.data.success) {
        setMunicipios(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Erro ao carregar municípios:', err);
    }
  };

  const loadFamilias = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize
      };
      if (filtroBusca) {
        params.search = filtroBusca;
      }
      if (filtroValidacao) {
        params.validacao = parseInt(filtroValidacao);
      }
      if (filtroEstado) {
        params.estado = parseInt(filtroEstado);
      }
      if (filtroMunicipio) {
        params.municipio = parseInt(filtroMunicipio);
      }
      if (filtroGleba) {
        params.gleba = parseInt(filtroGleba);
      }
      if (filtroAceitouVisita) {
        params.aceitou_visita = parseInt(filtroAceitouVisita);
      }
      if (filtroTecnico) {
        params.tecnico = parseInt(filtroTecnico);
      }
      if (filtroQuilombo) {
        params.quilombo = filtroQuilombo;
      }
      const response = await api.get('/supervisao-ocupacional/familias', { params });
      if (response.data.success) {
        setFamilias(response.data.data.data || []);
        setTotal(response.data.data.total || response.data.data.data?.length || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar famílias');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string | null | undefined): string => {
    if (!dataString) return '-';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const formatarCPF = (cpf: string | null | undefined): string => {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const columns: DataGridColumn<Familia>[] = [
    {
      key: 'actions',
      title: 'Ações',
      width: '10%',
      align: 'left',
      render: (_, record: Familia) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Tooltip text="Ver detalhes" backgroundColor="#3b82f6" delay={0}>
            <button
              onClick={() => navigate(`/supervisao-ocupacional/familias/${record.id}`)}
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
          {canEdit && (
            <Tooltip text="Editar" backgroundColor="#056839" delay={0}>
              <button
                onClick={() => navigate(`/supervisao-ocupacional/familias/${record.id}/editar`)}
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
          )}
          {canValidate && (
            <Tooltip text="Validar" backgroundColor="#10b981" delay={0}>
              <button
                onClick={() => navigate(`/supervisao-ocupacional/familias/${record.id}`)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #10b981',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#10b981';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#10b981';
                }}
              >
                <CheckCircle size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      key: 'id',
      title: 'ID',
      width: '5%',
      dataIndex: 'id',
      render: (id: number) => (
        <span style={{ fontWeight: '600', color: '#3b2313' }}>#{id}</span>
      )
    },
    {
      key: 'identificacao',
      title: 'Identificação',
      width: '20%',
      render: (_, record: Familia) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: '500', color: '#334155' }}>
            {record.iuf_nome_ocupante || '-'}
          </span>
          <span style={{ 
            color: '#64748b', 
            fontFamily: 'monospace', 
            fontSize: '12px' 
          }}>
            {record.g00_0_q1_2 ? formatarCPF(record.g00_0_q1_2) : '-'}
          </span>
        </div>
      )
    },
    {
      key: 'num_lote',
      title: 'Número do Lote',
      width: '12%',
      render: (_, record: Familia) => (
        <span style={{ color: '#334155', fontWeight: '500' }}>
          {record.i_q1_10 || '-'}
        </span>
      )
    },
    {
      key: 'aceitou_visita',
      title: 'Aceitou Visita',
      width: '12%',
      render: (_, record: Familia) => {
        const status = record.i_q1_17;
        if (status === null || status === undefined) return <span style={{ color: '#64748b' }}>-</span>;
        const labels: Record<number, string> = {
          1: 'Sim',
          2: 'Não',
          3: 'Não encontrado',
          4: 'Imóvel vago',
          5: 'Litígio',
          6: 'Sim - Entrevista Remota'
        };
        const colors: Record<number, string> = {
          1: '#10b981',
          2: '#ef4444',
          3: '#f59e0b',
          4: '#64748b',
          5: '#ef4444',
          6: '#10b981'
        };
        return (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: colors[status] + '20',
            color: colors[status],
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {labels[status] || 'Desconhecido'}
          </span>
        );
      }
    },
    {
      key: 'localizacao',
      title: 'Localização',
      width: '18%',
      render: (_, record: Familia) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {record.estado_rel?.uf && (
            <span style={{ 
              padding: '4px 8px', 
              borderRadius: '4px', 
              backgroundColor: '#f0f9ff', 
              color: '#056839',
              fontSize: '12px',
              fontWeight: '600',
              width: 'fit-content'
            }}>
              {record.estado_rel.uf}
            </span>
          )}
          <span style={{ color: '#334155', fontSize: '13px' }}>
            {record.municipio_rel?.descricao || '-'}
          </span>
          <span style={{ color: '#64748b', fontSize: '12px' }}>
            {record.gleba_rel?.descricao || '-'}
          </span>
        </div>
      )
    },
    {
      key: 'informacoes',
      title: 'Informações',
      width: '15%',
      render: (_, record: Familia) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <StatusValidacaoBadge status={record.validacao} />
          </div>
          <span style={{ color: '#64748b', fontSize: '12px' }}>
            {record.tecnico_rel?.name || '-'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px' }}>
            <Calendar size={12} />
            <span>{formatarData(record.creation_date)}</span>
          </div>
        </div>
      )
    }
  ];

  if (loading && familias.length === 0) {
    return (
      <div className="supervisao-ocupacional-module" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando famílias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisao-ocupacional-module" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div className="content-header">
        <div className="header-info">
          <h1>
            <Users size={24} />
            Famílias
          </h1>
          <p>
            {total} família{total !== 1 ? 's' : ''} cadastrada{total !== 1 ? 's' : ''}
          </p>
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

        {/* Filtros */}
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px', 
          width: '100%', 
          maxWidth: '100%', 
          boxSizing: 'border-box' 
        }}>
          {/* Primeira linha: Busca de texto */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '100%' }}>
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
                placeholder="Buscar por ID, Nome, CPF ou Número do Lote..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadFamilias()}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
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
              onClick={loadFamilias}
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
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <Search size={16} />
              Buscar
            </button>
          </div>

          {/* Segunda linha: Filtros de select */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '8px',
            width: '100%'
          }}>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setFiltroMunicipio('');
              }}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todos os Estados</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.id.toString()}>
                  {estado.uf} - {estado.descricao}
                </option>
              ))}
            </select>

            <select
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              disabled={!filtroEstado}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: filtroEstado ? 'pointer' : 'not-allowed',
                boxSizing: 'border-box',
                backgroundColor: filtroEstado ? 'white' : '#f3f4f6',
                opacity: filtroEstado ? 1 : 0.6
              }}
            >
              <option value="">Todos os Municípios</option>
              {municipios.map(municipio => (
                <option key={municipio.id} value={municipio.id.toString()}>
                  {municipio.descricao}
                </option>
              ))}
            </select>

            <select
              value={filtroGleba}
              onChange={(e) => setFiltroGleba(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todas as Glebas/Assentamentos</option>
              {glebas.map(gleba => (
                <option key={gleba.id} value={gleba.id.toString()}>
                  {gleba.descricao}
                </option>
              ))}
            </select>

            <select
              value={filtroAceitouVisita}
              onChange={(e) => setFiltroAceitouVisita(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Aceitou Visita (Todos)</option>
              <option value="1">Sim</option>
              <option value="2">Não</option>
              <option value="3">Não encontrado</option>
              <option value="4">Imóvel vago</option>
              <option value="5">Litígio</option>
              <option value="6">Sim - Entrevista Remota</option>
            </select>

            <select
              value={filtroTecnico}
              onChange={(e) => setFiltroTecnico(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todos os Técnicos</option>
              {tecnicos.map(tecnico => (
                <option key={tecnico.id} value={tecnico.id.toString()}>
                  {tecnico.name}
                </option>
              ))}
            </select>

            <select
              value={filtroValidacao}
              onChange={(e) => setFiltroValidacao(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todas as Validações</option>
              <option value="1">Não Validado</option>
              <option value="2">Validado</option>
              <option value="3">Pendência</option>
              <option value="4">Reprovado</option>
            </select>

            <input
              type="text"
              placeholder="Quilombo..."
              value={filtroQuilombo}
              onChange={(e) => setFiltroQuilombo(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', boxSizing: 'border-box' }}>
          <DataGrid
            columns={columns}
            dataSource={familias}
            loading={loading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (newPage) => setPage(newPage)
            }}
            emptyState={{
              title: 'Nenhuma família encontrada',
              description: filtroBusca || filtroValidacao
                ? 'Tente ajustar os filtros de busca'
                : 'Nenhuma família cadastrada ainda',
              icon: <Users size={48} color="#cbd5e1" />
            }}
          />
        </div>
      </div>
    </div>
  );
}
