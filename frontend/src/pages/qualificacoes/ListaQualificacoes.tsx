import { useState, useEffect } from 'react';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { qualificacaoAPI } from '../../services/qualificacaoService';
import { Qualificacao, QualificacaoListResponse } from '../../types/qualificacao';
import { Edit, Trash2, FileText, BookOpen, Plus, Search, Loader2, User, Clock, CheckCircle, XCircle, AlertCircle, FolderOpen } from 'lucide-react';
import ModalMateriais from '../../components/qualificacoes/ModalMateriais';
import ModalValidacao from '../../components/qualificacoes/ModalValidacao';
import { useAuth } from '../../contexts/AuthContext';
import { gerarPdfConteudoQualificacao } from '../../utils/pdfConteudoQualificacao';
import Tooltip from '../../components/Tooltip';
import './QualificacoesModule.css';

interface ListaQualificacoesProps {
  onNavigate: (view: string, id?: number) => void;
}

function ListaQualificacoes({ onNavigate }: ListaQualificacoesProps) {
  const { user, isAdmin, isCoordinator, isEditor, hasPermission } = useAuth();
  const [qualificacoes, setQualificacoes] = useState<Qualificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalMateriais, setModalMateriais] = useState<{ isOpen: boolean; idQualificacao: number; titulo: string }>({
    isOpen: false,
    idQualificacao: 0,
    titulo: ''
  });
  const [modalValidacao, setModalValidacao] = useState<{ isOpen: boolean; idQualificacao: number; titulo: string }>({
    isOpen: false,
    idQualificacao: 0,
    titulo: ''
  });
  const pageSize = 20;

  // Função helper para formatar data corretamente (evita problemas de timezone)
  const formatarDataHora = (dataString: string | undefined): string => {
    if (!dataString) return '';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  // Verificar se é qualificação padrão do sistema
  const isQualificacaoPadrao = (id?: number): boolean => {
    return id === 1 || id === 2 || id === 3;
  };

  // Verificar se pode editar qualificação padrão (apenas admin)
  const podeEditarPadrao = (id?: number): boolean => {
    if (!isQualificacaoPadrao(id)) return isAdmin(); // Apenas admin pode editar qualquer qualificação
    return isAdmin(); // Qualificações padrão só podem ser editadas por admin
  };

  // Verificar se pode excluir: apenas o técnico criador (ou admin)
  const podeExcluirQualificacao = (record: Qualificacao): boolean => {
    if (isAdmin()) return true;
    if (!user) return false;
    return record.created_by != null && String(record.created_by) === String(user.id);
  };

  // Verificar se pode editar qualificação: admin OU editor OU técnico (criador ou membro da equipe)
  const podeEditarQualificacao = (record: Qualificacao): boolean => {
    if (isQualificacaoPadrao(record.id)) return isAdmin();
    if (isAdmin()) return true;
    if (isEditor()) return true;
    const isTecnico = hasPermission('organizacoes', 'tecnico') || hasPermission('qualificacoes', 'tecnico');
    if (isTecnico && user) {
      const userId = user.id;
      if (record.created_by != null && String(record.created_by) === String(userId)) return true;
      if (record.equipe_tecnica?.some(m => String(m.id_tecnico) === String(userId))) return true;
    }
    return false;
  };

  useEffect(() => {
    carregarQualificacoes();
  }, [page, filtroTitulo]);

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
      render: (_, record: Qualificacao) => {
        const isPadrao = isQualificacaoPadrao(record.id);
        const podeEditar = podeEditarQualificacao(record);
        
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
            {podeEditar && (
              <Tooltip text="Editar qualificação" backgroundColor="#3b2313" delay={0}>
                <button
                  onClick={() => onNavigate('edicao-qualificacao', record.id)}
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
              </Tooltip>
            )}
            {podeEditarQualificacao(record) && (
            <Tooltip text="Materiais" backgroundColor="#f59e0b" delay={0}>
              <button
                onClick={() => {
                  setModalMateriais({
                    isOpen: true,
                    idQualificacao: record.id!,
                    titulo: record.titulo
                  });
                }}
              style={{
                padding: '6px 8px',
                border: '1px solid #f59e0b',
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f59e0b';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#f59e0b';
              }}
            >
              <FolderOpen size={16} />
            </button>
            </Tooltip>
            )}
            {(hasPermission('sistema', 'admin') || isCoordinator()) && (
              <Tooltip text="Validar qualificação" backgroundColor="#10b981" delay={0}>
                <button
                  onClick={() => {
                    setModalValidacao({
                      isOpen: true,
                      idQualificacao: record.id!,
                      titulo: record.titulo || 'Qualificação'
                    });
                  }}
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
            <Tooltip text="Qualificação (PDF)" backgroundColor="#3b82f6" delay={0}>
              <button
                onClick={async () => {
                  try {
                    const qualificacaoCompleta = await qualificacaoAPI.getById(record.id!);
                    await gerarPdfConteudoQualificacao(qualificacaoCompleta);
                  } catch (error) {
                    console.error('Erro ao gerar PDF:', error);
                    alert('Erro ao gerar PDF da qualificação');
                  }
                }}
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
              <FileText size={16} />
            </button>
            </Tooltip>
            {!isPadrao && podeExcluirQualificacao(record) && (
              <Tooltip text="Excluir qualificação" backgroundColor="#dc2626" delay={0}>
                <button
                  onClick={() => handleExcluir(record.id!)}
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
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      key: 'titulo',
      title: 'Qualificação',
      dataIndex: 'titulo',
      width: '45%',
      render: (titulo: string, record: Qualificacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: '600', color: '#3b2313' }}>
            #{record.id} - {titulo}
          </span>
          {record.objetivo_geral && (
            <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
              {record.objetivo_geral.substring(0, 100)}...
            </span>
          )}
        </div>
      )
    },
    {
      key: 'criador',
      title: 'Criado por',
      width: '20%',
      align: 'left',
      render: (_, record: Qualificacao) => {
        const criador = record.criador;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', alignItems: 'center' }}>
            {criador ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#3b2313' }}>
                <User size={12} />
                <span>{criador.name}</span>
              </div>
            ) : (
              <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#64748b' }}>
                Não informado
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'metadados',
      title: 'Informações',
      width: '20%',
      align: 'left',
      render: (_, record: Qualificacao) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', alignItems: 'center' }}>
            {/* Status */}
            {record.ativo !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: record.ativo ? '#d4edda' : '#f8d7da',
                    color: record.ativo ? '#155724' : '#721c24'
                  }}
                >
                  {record.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            )}
            {/* Criado em */}
            {record.created_at && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px' }}>
                <Clock size={12} />
                <span>Criada em {formatarDataHora(record.created_at)}</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'validacao',
      title: 'Validação',
      width: '15%',
      align: 'center',
      render: (_, record: Qualificacao) => {
        const status = record.validacao_status || 1;
        const statusConfig = {
          1: { label: 'NÃO VALIDADO', cor: '#9ca3af', icon: Clock },
          2: { label: 'VALIDADO', cor: '#10b981', icon: CheckCircle },
          3: { label: 'PENDÊNCIA', cor: '#f59e0b', icon: AlertCircle },
          4: { label: 'REPROVADO', cor: '#ef4444', icon: XCircle },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[1];
        const StatusIcon = config.icon;
        const podeValidar = hasPermission('sistema', 'admin') || isCoordinator();

        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span
              onClick={() => {
                if (podeValidar) {
                  setModalValidacao({
                    isOpen: true,
                    idQualificacao: record.id!,
                    titulo: record.titulo || 'Qualificação'
                  });
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: config.cor,
                color: 'white',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                cursor: podeValidar ? 'pointer' : 'default',
                transition: podeValidar ? 'transform 0.2s' : 'none'
              }}
              onMouseEnter={(e) => {
                if (podeValidar) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (podeValidar) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              title={podeValidar ? 'Clique para gerenciar validação' : config.label}
            >
              <StatusIcon size={14} />
              <span>{config.label}</span>
            </span>
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
          getRowStyle={(record: Qualificacao) => {
            if (isQualificacaoPadrao(record.id)) {
              return {
                backgroundColor: '#f0fdf4', // Verde suave
                borderLeft: '3px solid #056839'
              };
            }
            return {};
          }}
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

      {/* Modal de Validação */}
      {modalValidacao.isOpen && (
        <ModalValidacao
          qualificacaoId={modalValidacao.idQualificacao}
          qualificacaoNome={modalValidacao.titulo}
          onClose={() => {
            setModalValidacao({ isOpen: false, idQualificacao: 0, titulo: '' });
            carregarQualificacoes(); // Recarregar para atualizar os dados
          }}
        />
      )}
    </div>
  );
}

export default ListaQualificacoes;
