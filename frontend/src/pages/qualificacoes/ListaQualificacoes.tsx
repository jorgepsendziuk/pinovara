import { useState, useEffect } from 'react';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { qualificacaoAPI } from '../../services/qualificacaoService';
import { Qualificacao, QualificacaoListResponse } from '../../types/qualificacao';
import { Edit, Trash2, FileText, Users, BookOpen, Plus, Search, Loader2, User } from 'lucide-react';
import api from '../../services/api';
import ModalMateriais from '../../components/qualificacoes/ModalMateriais';
import './QualificacoesModule.css';

interface ListaQualificacoesProps {
  onNavigate: (view: string, id?: number) => void;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
}

function ListaQualificacoes({ onNavigate }: ListaQualificacoesProps) {
  const [qualificacoes, setQualificacoes] = useState<Qualificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [criadores, setCriadores] = useState<Map<number, UserInfo>>(new Map());
  const [modalMateriais, setModalMateriais] = useState<{ isOpen: boolean; idQualificacao: number; titulo: string }>({
    isOpen: false,
    idQualificacao: 0,
    titulo: ''
  });
  const pageSize = 20;

  useEffect(() => {
    carregarQualificacoes();
  }, [page, filtroTitulo]);

  const carregarCriadores = async (qualificacoes: Qualificacao[]) => {
    const userIds = qualificacoes
      .map(q => q.created_by)
      .filter((id): id is number => id !== undefined && id !== null);
    
    const uniqueUserIds = [...new Set(userIds)];
    
    const criadoresMap = new Map<number, UserInfo>();
    
    for (const userId of uniqueUserIds) {
      try {
        const response = await api.get(`/admin/users/${userId}`);
        if (response.data.success && response.data.data?.user) {
          criadoresMap.set(userId, {
            id: response.data.data.user.id,
            name: response.data.data.user.name,
            email: response.data.data.user.email
          });
        }
      } catch (error) {
        console.error(`Erro ao carregar usuário ${userId}:`, error);
      }
    }
    
    setCriadores(criadoresMap);
  };

  const carregarQualificacoes = async () => {
    try {
      setLoading(true);
      const response: QualificacaoListResponse = await qualificacaoAPI.list({
        titulo: filtroTitulo || undefined,
        page,
        limit: pageSize
      });
      setQualificacoes(response.qualificacoes);
      setTotal(response.total || response.qualificacoes.length);
      
      // Carregar informações dos criadores
      await carregarCriadores(response.qualificacoes);
    } catch (error) {
      console.error('Erro ao carregar qualificações:', error);
      alert('Erro ao carregar qualificações');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number) => {
    // Não permitir excluir qualificações padrão (ID 1, 2, 3)
    if (id === 1 || id === 2 || id === 3) {
      alert('Esta qualificação não pode ser excluída, pois é uma qualificação padrão do sistema.');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta qualificação?')) {
      return;
    }

    try {
      await qualificacaoAPI.delete(id);
      carregarQualificacoes();
    } catch (error) {
      console.error('Erro ao excluir qualificação:', error);
      alert('Erro ao excluir qualificação');
    }
  };

  const columns: DataGridColumn<Qualificacao>[] = [
    {
      key: 'actions',
      title: 'Ações',
      width: '15%',
      align: 'left',
      render: (_, record: Qualificacao) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <button
            onClick={() => onNavigate('edicao-qualificacao', record.id)}
            title="Editar qualificação"
            style={{
              padding: '6px 8px',
              border: '1px solid #3b2313',
              background: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#3b2313',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#3b2313';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#3b2313';
            }}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              setModalMateriais({
                isOpen: true,
                idQualificacao: record.id!,
                titulo: record.titulo
              });
            }}
            title="Gerenciar materiais"
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
            <FileText size={16} />
          </button>
          <button
            onClick={() => handleExcluir(record.id!)}
            title="Excluir qualificação"
            style={{
              padding: '6px 8px',
              border: '1px solid #dc2626',
              background: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: '6%',
      align: 'center',
      render: (id: number) => (
        <span style={{ fontWeight: '600', color: '#3b2313' }}>#{id}</span>
      )
    },
    {
      key: 'titulo',
      title: 'Título',
      dataIndex: 'titulo',
      width: '28%',
      render: (titulo: string, record: Qualificacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: '600', color: '#3b2313' }}>{titulo}</span>
          {record.objetivo_geral && (
            <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
              {record.objetivo_geral.substring(0, 100)}...
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'ativo',
      width: '8%',
      align: 'center',
      render: (ativo: boolean) => (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: ativo ? '#d4edda' : '#f8d7da',
            color: ativo ? '#155724' : '#721c24'
          }}
        >
          {ativo ? 'Ativa' : 'Inativa'}
        </span>
      )
    },
    {
      key: 'criador',
      title: 'Criado por',
      width: '18%',
      render: (_, record: Qualificacao) => {
        const criador = record.created_by ? criadores.get(record.created_by) : null;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            {criador ? (
              <>
                <User size={14} color="#056839" />
                <span style={{ color: '#3b2313', fontWeight: '500' }}>{criador.name}</span>
              </>
            ) : (
              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Não informado</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'metadados',
      title: 'Informações',
      width: '25%',
      render: (_, record: Qualificacao) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#64748b' }}>
            {record.created_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📅 Criada em {new Date(record.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {record.qualificacao_organizacao && record.qualificacao_organizacao.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} />
                <span>{record.qualificacao_organizacao.length} organização(ões)</span>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  if (loading && qualificacoes.length === 0) {
    return (
      <div className="qualificacoes-module">
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando qualificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qualificacoes-module">
      <div style={{ 
        padding: '24px 32px', 
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#3b2313',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <BookOpen size={24} />
            Qualificações
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            {total} qualificação{total !== 1 ? 'ões' : ''} cadastrada{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onNavigate('cadastro-qualificacao')}
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
          Nova Qualificação
        </button>
      </div>

      <div className="lista-content" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
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
                placeholder="Buscar por título..."
                value={filtroTitulo}
                onChange={(e) => setFiltroTitulo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && carregarQualificacoes()}
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
              onClick={carregarQualificacoes}
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
        </div>

        <DataGrid
          columns={columns}
          dataSource={qualificacoes}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (newPage) => setPage(newPage)
          }}
          emptyState={{
            title: 'Nenhuma qualificação encontrada',
            description: filtroTitulo
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira qualificação',
            icon: <BookOpen size={48} color="#cbd5e1" />,
            action: {
              label: 'Criar Qualificação',
              onClick: () => onNavigate('cadastro-qualificacao')
            }
          }}
        />
      </div>

      <ModalMateriais
        idQualificacao={modalMateriais.idQualificacao}
        qualificacaoTitulo={modalMateriais.titulo}
        isOpen={modalMateriais.isOpen}
        onClose={() => setModalMateriais({ isOpen: false, idQualificacao: 0, titulo: '' })}
      />
    </div>
  );
}

export default ListaQualificacoes;
