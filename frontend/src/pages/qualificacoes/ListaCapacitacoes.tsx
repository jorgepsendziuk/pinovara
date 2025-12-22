import { useState, useEffect } from 'react';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { Capacitacao, CapacitacaoListResponse } from '../../types/capacitacao';
import { Edit, Calendar, FileText, Printer, QrCode, Eye, Plus, Search, Loader2, MapPin, Clock, ExternalLink, CalendarDays, List, CheckCircle } from 'lucide-react';
import { gerarPDFQRCodeInscricao } from '../../utils/pdfQRCodeInscricao';
import { gerarPDFQRCodeAvaliacao } from '../../utils/pdfQRCodeAvaliacao';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './QualificacoesModule.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

interface ListaCapacitacoesProps {
  onNavigate: (view: string, id?: number) => void;
}

function ListaCapacitacoes({ onNavigate }: ListaCapacitacoesProps) {
  const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const pageSize = 20;

  useEffect(() => {
    carregarCapacitacoes();
  }, [page, filtroTitulo, filtroStatus]);

  // Carregar todas as capacitações para o calendário
  useEffect(() => {
    if (viewMode === 'calendar') {
      carregarTodasCapacitacoes();
    }
  }, [viewMode]);

  const carregarTodasCapacitacoes = async () => {
    try {
      const response = await capacitacaoAPI.list({ limit: 1000 });
      setCapacitacoes(response.capacitacoes);
    } catch (error) {
      console.error('Erro ao carregar capacitações:', error);
    }
  };

  const carregarCapacitacoes = async () => {
    try {
      setLoading(true);
      const response: CapacitacaoListResponse = await capacitacaoAPI.list({
        titulo: filtroTitulo || undefined,
        status: filtroStatus || undefined,
        page,
        limit: pageSize
      });
      setCapacitacoes(response.capacitacoes);
      setTotal(response.total || response.capacitacoes.length);
    } catch (error) {
      console.error('Erro ao carregar capacitações:', error);
      alert('Erro ao carregar capacitações');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejada':
        return { bg: '#e3f2fd', color: '#1976d2' };
      case 'em_andamento':
        return { bg: '#d4edda', color: '#155724' };
      case 'concluida':
        return { bg: '#d1ecf1', color: '#0c5460' };
      case 'cancelada':
        return { bg: '#f8d7da', color: '#721c24' };
      default:
        return { bg: '#f5f5f5', color: '#666' };
    }
  };

  const columns: DataGridColumn<Capacitacao>[] = [
    {
      key: 'actions',
      title: 'Ações',
      width: '20%',
      align: 'left',
      render: (_, record: Capacitacao) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <button
            onClick={() => window.open(`/capacitacao/${record.link_inscricao}`, '_blank')}
            title="Ver Página Pública do Curso"
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
            <ExternalLink size={16} />
          </button>
          <button
            onClick={() => onNavigate('painel', record.id)}
            title="Painel do Instrutor"
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
            <Eye size={16} />
          </button>
          <button
            onClick={async () => {
              try {
                await gerarPDFQRCodeInscricao(record);
              } catch (error) {
                console.error('Erro ao gerar PDF de QR code:', error);
                alert('Erro ao gerar PDF de QR code de inscrição');
              }
            }}
            title="Imprimir QR Code de Inscrição"
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
            <QrCode size={16} />
          </button>
          <button
            onClick={async () => {
              try {
                await gerarPDFQRCodeAvaliacao(record);
              } catch (error) {
                console.error('Erro ao gerar PDF de QR code:', error);
                alert('Erro ao gerar PDF de QR code de avaliação');
              }
            }}
            title="Imprimir QR Code de Avaliação"
            style={{
              padding: '6px 8px',
              border: '1px solid #8b5cf6',
              background: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#8b5cf6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#8b5cf6';
            }}
          >
            <QrCode size={16} />
          </button>
        </div>
      )
    },
    {
      key: 'titulo',
      title: 'Capacitação',
      dataIndex: 'titulo',
      width: '22%',
      render: (titulo: string, record: Capacitacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: '600', color: '#3b2313' }}>
            {titulo || record.qualificacao?.titulo || 'Sem título'}
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
      width: '16%',
      render: (_, record: Capacitacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          {record.data_inicio && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Calendar size={14} />
              <span>Início: {new Date(record.data_inicio).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {record.data_fim && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Calendar size={14} />
              <span>Término: {new Date(record.data_fim).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'local',
      title: 'Local',
      width: '14%',
      render: (_, record: Capacitacao) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
          {record.local ? (
            <>
              <MapPin size={14} />
              <span>{record.local}</span>
            </>
          ) : (
            <span style={{ fontStyle: 'italic' }}>Não informado</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      width: '10%',
      align: 'center',
      render: (status: string) => {
        const colors = getStatusColor(status);
        return (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: colors.bg,
              color: colors.color
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
      key: 'criado_por',
      title: 'Criado por',
      width: '12%',
      render: (_, record: Capacitacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          {record.tecnico_criador ? (
            <>
              <span style={{ fontWeight: '500', color: '#3b2313' }}>
                {record.tecnico_criador.name}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {record.tecnico_criador.email}
              </span>
            </>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#64748b' }}>Não informado</span>
          )}
        </div>
      )
    },
    {
      key: 'metadados',
      title: 'Informações',
      width: '6%',
      render: (_, record: Capacitacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#64748b' }}>
          {record.created_at && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              <span>Criada em {new Date(record.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {record.turno && (
            <div>
              <span>Turno: {record.turno}</span>
            </div>
          )}
        </div>
      )
    }
  ];

  if (loading && capacitacoes.length === 0) {
    return (
      <div className="qualificacoes-module">
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando capacitações...</p>
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
            <Calendar size={24} />
            Capacitações
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            {total} capacitação{total !== 1 ? 'ões' : ''} cadastrada{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'list' ? '#056839' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#3b2313',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <List size={16} />
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'calendar' ? '#056839' : 'transparent',
                color: viewMode === 'calendar' ? 'white' : '#3b2313',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <CalendarDays size={16} />
              Calendário
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('cadastro-capacitacao')}
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
            Nova Capacitação
          </button>
        </div>
      </div>

      <div className="lista-content" style={{ padding: '24px' }}>
        {viewMode === 'calendar' ? (
          <div style={{ height: '600px', marginTop: '20px' }}>
            <BigCalendar
              localizer={localizer}
              events={capacitacoes
                .filter(c => c.data_inicio)
                .map(c => {
                  // Criar título com informações adicionais
                  let titulo = c.titulo || c.qualificacao?.titulo || 'Capacitação';
                  
                  // Adicionar informações de organização e técnico se disponíveis
                  const partes: string[] = [];
                  
                  if (c.organizacoes_completas && c.organizacoes_completas.length > 0) {
                    const primeiraOrg = c.organizacoes_completas[0];
                    // Abreviar organização se muito longa
                    let orgText = primeiraOrg.nome;
                    if (orgText.length > 25) {
                      // Tentar abreviar palavras comuns
                      orgText = orgText
                        .replace(/Associação/g, 'Assoc.')
                        .replace(/Cooperativa/g, 'Coop.')
                        .replace(/Organização/g, 'Org.')
                        .replace(/Instituto/g, 'Inst.')
                        .replace(/Fundação/g, 'Fund.');
                      // Se ainda muito longa, truncar
                      if (orgText.length > 25) {
                        orgText = orgText.substring(0, 22) + '...';
                      }
                    }
                    partes.push(`Org: ${orgText}`);
                    
                    // Adicionar técnico se disponível
                    if (primeiraOrg.tecnico) {
                      let tecText = primeiraOrg.tecnico.name;
                      // Abreviar nome do técnico
                      if (tecText.length > 20) {
                        const partesNome = tecText.split(' ');
                        if (partesNome.length > 1) {
                          tecText = `${partesNome[0]} ${partesNome[partesNome.length - 1].charAt(0)}.`;
                        } else {
                          tecText = tecText.substring(0, 17) + '...';
                        }
                      }
                      partes.push(`Téc: ${tecText}`);
                    }
                  }
                  
                  // Se houver múltiplas organizações, indicar
                  if (c.organizacoes_completas && c.organizacoes_completas.length > 1) {
                    partes.push(`+${c.organizacoes_completas.length - 1} org(s)`);
                  }
                  
                  // Montar título final com quebras de linha
                  if (partes.length > 0) {
                    titulo = `${titulo}\n${partes.join(' | ')}`;
                  }
                  
                  return {
                    title: titulo,
                    start: new Date(c.data_inicio!),
                    end: c.data_fim ? new Date(c.data_fim) : new Date(c.data_inicio!),
                    resource: c,
                    allDay: false
                  };
                })}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectEvent={(event: any) => {
                if (event.resource && event.resource.id) {
                  onNavigate('painel', event.resource.id);
                }
              }}
              eventPropGetter={(event: any) => {
                const status = event.resource?.status;
                let backgroundColor = '#3174ad';
                
                switch (status) {
                  case 'planejada':
                    backgroundColor = '#3174ad';
                    break;
                  case 'em_andamento':
                    backgroundColor = '#056839';
                    break;
                  case 'concluida':
                    backgroundColor = '#3b2313';
                    break;
                  case 'cancelada':
                    backgroundColor = '#999';
                    break;
                }

                return {
                  style: {
                    backgroundColor,
                    borderRadius: '5px',
                    opacity: 0.8,
                    color: 'white',
                    border: '0px',
                    display: 'block'
                  }
                };
              }}
              messages={{
                next: 'Próximo',
                previous: 'Anterior',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Não há capacitações neste período.'
              }}
            />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                  onKeyPress={(e) => e.key === 'Enter' && carregarCapacitacoes()}
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
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: '180px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todos os status</option>
                <option value="planejada">Planejada</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <button
                onClick={carregarCapacitacoes}
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

            <DataGrid
              columns={columns}
              dataSource={capacitacoes}
              loading={loading}
              rowKey="id"
              pagination={{
                current: page,
                pageSize,
                total,
                onChange: (newPage) => setPage(newPage)
              }}
              emptyState={{
                title: 'Nenhuma capacitação encontrada',
                description: filtroTitulo || filtroStatus
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira capacitação',
                icon: <Calendar size={48} color="#cbd5e1" />,
                action: {
                  label: 'Criar Capacitação',
                  onClick: () => onNavigate('cadastro-capacitacao')
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ListaCapacitacoes;
