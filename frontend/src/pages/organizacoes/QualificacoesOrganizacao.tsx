import { useState, useEffect } from 'react';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { qualificacaoAPI } from '../../services/qualificacaoService';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { Qualificacao } from '../../types/qualificacao';
import { Capacitacao } from '../../types/capacitacao';
import { BookOpen, Calendar, Users, Loader2, Eye, FileText } from 'lucide-react';
import '../../pages/organizacoes/OrganizacoesModule.css';

interface QualificacoesOrganizacaoProps {
  idOrganizacao: number;
}

function QualificacoesOrganizacao({ idOrganizacao }: QualificacoesOrganizacaoProps) {
  const [qualificacoes, setQualificacoes] = useState<Qualificacao[]>([]);
  const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [idOrganizacao]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [qualResponse, capResponse] = await Promise.all([
        qualificacaoAPI.list({ id_organizacao: idOrganizacao, limit: 100 }),
        capacitacaoAPI.list({ id_organizacao: idOrganizacao, limit: 100 })
      ]);
      setQualificacoes(qualResponse.qualificacoes);
      setCapacitacoes(capResponse.capacitacoes);
    } catch (error) {
      console.error('Erro ao carregar qualificações e capacitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const qualificacoesColumns: DataGridColumn<Qualificacao>[] = [
    {
      key: 'titulo',
      title: 'Qualificação',
      dataIndex: 'titulo',
      width: '40%',
      render: (titulo: string, record: Qualificacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: '600', color: '#3b2313' }}>{titulo}</span>
          {record.objetivo_geral && (
            <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
              {record.objetivo_geral.substring(0, 120)}...
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'ativo',
      width: '15%',
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
      key: 'metadados',
      title: 'Informações',
      width: '30%',
      render: (_, record: Qualificacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#64748b' }}>
          {record.created_at && (
            <div>📅 Criada em {new Date(record.created_at).toLocaleDateString('pt-BR')}</div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '15%',
      align: 'center',
      render: (_, record: Qualificacao) => (
        <button
          onClick={() => window.open(`/qualificacoes?qualificacao=${record.id}`, '_blank')}
          className="btn-icon"
          style={{
            padding: '6px 12px',
            border: '1px solid #056839',
            background: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#056839',
            fontSize: '12px'
          }}
        >
          <Eye size={14} />
          Ver Detalhes
        </button>
      )
    }
  ];

  const capacitacoesColumns: DataGridColumn<Capacitacao>[] = [
    {
      key: 'titulo',
      title: 'Capacitação',
      width: '30%',
      render: (_, record: Capacitacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: '600', color: '#3b2313' }}>
            {record.titulo || record.qualificacao?.titulo || 'Sem título'}
          </span>
          {record.qualificacao && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Qualificação: {record.qualificacao.titulo}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'datas',
      title: 'Período',
      width: '20%',
      render: (_, record: Capacitacao) => (
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          {record.data_inicio && (
            <div>📅 {new Date(record.data_inicio).toLocaleDateString('pt-BR')}</div>
          )}
          {record.data_fim && (
            <div>📅 {new Date(record.data_fim).toLocaleDateString('pt-BR')}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      width: '15%',
      align: 'center',
      render: (status: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
          planejada: { bg: '#e3f2fd', color: '#1976d2' },
          em_andamento: { bg: '#d4edda', color: '#155724' },
          concluida: { bg: '#d1ecf1', color: '#0c5460' },
          cancelada: { bg: '#f8d7da', color: '#721c24' }
        };
        const color = colors[status] || { bg: '#f5f5f5', color: '#666' };
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: color.bg,
              color: color.color
            }}
          >
            {status === 'planejada' ? 'Planejada' :
             status === 'em_andamento' ? 'Em Andamento' :
             status === 'concluida' ? 'Concluída' :
             status === 'cancelada' ? 'Cancelada' : status}
          </span>
        );
      }
    },
    {
      key: 'local',
      title: 'Local',
      width: '20%',
      render: (_, record: Capacitacao) => (
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          {record.local || 'Não informado'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '15%',
      align: 'center',
      render: (_, record: Capacitacao) => (
        <button
          onClick={() => window.open(`/capacitacoes/painel/${record.id}`, '_blank')}
          className="btn-icon"
          style={{
            padding: '6px 12px',
            border: '1px solid #056839',
            background: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#056839',
            fontSize: '12px'
          }}
        >
          <Eye size={14} />
          Ver Painel
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 size={32} className="spinning" />
        <p>Carregando qualificações e capacitações...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: '#3b2313', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} />
          Qualificações Vinculadas ({qualificacoes.length})
        </h3>
        {qualificacoes.length > 0 ? (
          <div className="lista-content" style={{ padding: '0', margin: '0' }}>
            <DataGrid
              columns={qualificacoesColumns}
              dataSource={qualificacoes}
              rowKey="id"
              emptyState={{
                title: 'Nenhuma qualificação vinculada',
                description: 'Esta organização ainda não possui qualificações vinculadas'
              }}
            />
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
            <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Nenhuma qualificação vinculada a esta organização</p>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ color: '#3b2313', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} />
          Capacitações ({capacitacoes.length})
        </h3>
        {capacitacoes.length > 0 ? (
          <div className="lista-content" style={{ padding: '0', margin: '0' }}>
            <DataGrid
              columns={capacitacoesColumns}
              dataSource={capacitacoes}
              rowKey="id"
              emptyState={{
                title: 'Nenhuma capacitação vinculada',
                description: 'Esta organização ainda não possui capacitações vinculadas'
              }}
            />
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
            <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Nenhuma capacitação vinculada a esta organização</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QualificacoesOrganizacao;

