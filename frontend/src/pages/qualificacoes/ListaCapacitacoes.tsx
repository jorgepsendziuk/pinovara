import { useState, useEffect } from 'react';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { Capacitacao, CapacitacaoListResponse } from '../../types/capacitacao';
import { Edit, Calendar, FileText, Printer, QrCode, Eye, Plus, Search, Loader2, MapPin, Clock, ExternalLink, CalendarDays, List, CheckCircle, Download, BarChart3, User } from 'lucide-react';
import { gerarPDFQRCodeInscricao } from '../../utils/pdfQRCodeInscricao';
import { gerarPDFQRCodeAvaliacao } from '../../utils/pdfQRCodeAvaliacao';
import { gerarPdfConteudoCapacitacao } from '../../utils/pdfConteudoCapacitacao';
import { gerarPdfRelatorioCapacitacao } from '../../utils/pdfRelatorioCapacitacao';
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
  const [tooltipEvent, setTooltipEvent] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const pageSize = 20;

  // Função helper para formatar data corretamente (evita problemas de timezone)
  const formatarData = (dataString: string | undefined): string => {
    if (!dataString) return '';
    // Se a data vem como string no formato YYYY-MM-DD, criar Date corretamente
    const partes = dataString.split('T')[0].split('-');
    if (partes.length === 3) {
      // Criar data no timezone local (ano, mês-1, dia)
      const data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      return data.toLocaleDateString('pt-BR');
    }
    // Fallback para o método padrão
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  // Função helper para formatar data/hora (para created_at)
  const formatarDataHora = (dataString: string | undefined): string => {
    if (!dataString) return '';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return formatarData(dataString);
    }
  };

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
      width: '10%',
      align: 'left',
      render: (_, record: Capacitacao) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
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
          <button
            onClick={async () => {
              try {
                const capacitacaoCompleta = await capacitacaoAPI.getById(record.id!);
                await gerarPdfConteudoCapacitacao(capacitacaoCompleta);
              } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                alert('Erro ao gerar PDF do conteúdo da capacitação');
              }
            }}
            title="Gerar PDF do conteúdo"
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
            <Download size={16} />
          </button>
          <button
            onClick={async () => {
              try {
                const capacitacaoCompleta = await capacitacaoAPI.getById(record.id!);
                const inscricoes = await capacitacaoAPI.listInscricoes(record.id!);
                const presencas = await capacitacaoAPI.listPresencas(record.id!);
                await gerarPdfRelatorioCapacitacao(capacitacaoCompleta, inscricoes, presencas);
              } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                alert('Erro ao gerar PDF do relatório da capacitação');
              }
            }}
            title="Gerar PDF do relatório"
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
            <BarChart3 size={16} />
          </button>
        </div>
      )
    },
    {
      key: 'titulo',
      title: 'Capacitação',
      dataIndex: 'titulo',
      width: '20%',
      render: (titulo: string, record: Capacitacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontWeight: '600', color: '#3b2313' }}>
            #{record.id} - {titulo || record.qualificacao?.titulo || 'Sem título'}
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
              <span>Início: {formatarData(record.data_inicio)}</span>
            </div>
          )}
          {record.data_fim && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Calendar size={14} />
              <span>Término: {formatarData(record.data_fim)}</span>
            </div>
          )}
          {record.turno && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Clock size={14} />
              <span>Turno: {record.turno}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'local',
      title: 'Organização(s) / Local',
      width: '20%',
      render: (_, record: Capacitacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          {/* Organizações */}
          {record.organizacoes_completas && record.organizacoes_completas.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
              {record.organizacoes_completas.slice(0, 2).map((org, idx) => (
                <span 
                  key={idx}
                  style={{ 
                    padding: '2px 6px',
                    backgroundColor: '#f0f9ff',
                    color: '#056839',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {org.nome}
                </span>
              ))}
              {record.organizacoes_completas.length > 2 && (
                <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                  +{record.organizacoes_completas.length - 2}
                </span>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Sem organizações</span>
          )}
          
          {/* Local */}
          {record.local ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px' }}>
              <MapPin size={12} />
              <span>{record.local}</span>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Local não informado</span>
          )}
        </div>
      )
    },
    {
      key: 'metadados',
      title: 'Informações',
      width: '16%',
      align: 'left',
      render: (_, record: Capacitacao) => {
        const colors = getStatusColor(record.status || '');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', alignItems: 'center' }}>
            {/* Status */}
            {record.status && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                  {record.status === 'planejada' ? 'Planejada' :
                   record.status === 'em_andamento' ? 'Em Andamento' :
                   record.status === 'concluida' ? 'Concluída' :
                   record.status === 'cancelada' ? 'Cancelada' : record.status}
                </span>
              </div>
            )}
            {/* Criado em e por */}
            {record.created_at && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px' }}>
                  <Clock size={12} />
                  <span>Criada em {formatarDataHora(record.created_at)} por:</span>
                </div>
                {record.tecnico_criador ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#3b2313', marginLeft: '16px' }}>
                    <User size={12} />
                    <span>{record.tecnico_criador.name}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#64748b', marginLeft: '16px' }}>
                    Não informado
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    }
  ];

  if (loading && capacitacoes.length === 0) {
    return (
      <div className="qualificacoes-module" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando capacitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qualificacoes-module" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ 
        padding: '16px', 
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
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

      <div className="lista-content" style={{ padding: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'auto', overflowY: 'visible' }}>
        {viewMode === 'calendar' ? (
          <div style={{ width: '100%', marginTop: '0', boxSizing: 'border-box', maxWidth: '100%', overflowX: 'auto' }}>
            <div style={{ width: '100%', overflowX: 'auto', boxSizing: 'border-box', maxWidth: '100%', minWidth: '0' }}>
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
                  
                  // Criar datas corretamente para o calendário (evita problemas de timezone)
                  const criarDataLocal = (dataString: string): Date => {
                    const partes = dataString.split('T')[0].split('-');
                    if (partes.length === 3) {
                      return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
                    }
                    return new Date(dataString);
                  };
                  
                  return {
                    title: titulo,
                    start: criarDataLocal(c.data_inicio!),
                    end: c.data_fim ? criarDataLocal(c.data_fim) : criarDataLocal(c.data_inicio!),
                    resource: c,
                    allDay: false
                  };
                })}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '600px', minHeight: '600px', width: '100%' }}
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
              components={{
                event: ({ event }: any) => {
                  const capacitacao = event.resource;
                  return (
                    <div
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipEvent(capacitacao);
                        setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltipEvent(null)}
                      style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                    >
                      <div style={{ padding: '2px 4px', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.title.split('\n')[0]}
                      </div>
                    </div>
                  );
                }
              }}
            />
            </div>
            {/* Tooltip */}
            {tooltipEvent && (
              <div
                style={{
                  position: 'fixed',
                  left: `${Math.min(tooltipPosition.x, window.innerWidth - 180)}px`,
                  top: `${tooltipPosition.y - 10}px`,
                  transform: 'translateX(-50%) translateY(-100%)',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  minWidth: '200px',
                  maxWidth: '300px',
                  width: 'auto',
                  fontSize: '12px',
                  pointerEvents: 'none',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ fontWeight: '600', color: '#3b2313', marginBottom: '8px', fontSize: '13px' }}>
                  {tooltipEvent.titulo || tooltipEvent.qualificacao?.titulo || 'Capacitação'}
                </div>
                {tooltipEvent.data_inicio && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '4px' }}>
                    <Calendar size={12} />
                    <span>Início: {formatarData(tooltipEvent.data_inicio)}</span>
                  </div>
                )}
                {tooltipEvent.data_fim && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '4px' }}>
                    <Calendar size={12} />
                    <span>Término: {formatarData(tooltipEvent.data_fim)}</span>
                  </div>
                )}
                {tooltipEvent.local && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '4px' }}>
                    <MapPin size={12} />
                    <span>{tooltipEvent.local}</span>
                  </div>
                )}
                {tooltipEvent.turno && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '4px' }}>
                    <Clock size={12} />
                    <span>Turno: {tooltipEvent.turno}</span>
                  </div>
                )}
                {tooltipEvent.status && (
                  <div style={{ marginTop: '6px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(tooltipEvent.status).bg,
                        color: getStatusColor(tooltipEvent.status).color
                      }}
                    >
                      {tooltipEvent.status === 'planejada' ? 'Planejada' :
                       tooltipEvent.status === 'em_andamento' ? 'Em Andamento' :
                       tooltipEvent.status === 'concluida' ? 'Concluída' :
                       tooltipEvent.status === 'cancelada' ? 'Cancelada' : tooltipEvent.status}
                    </span>
                  </div>
                )}
                {tooltipEvent.organizacoes_completas && tooltipEvent.organizacoes_completas.length > 0 && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: '500', color: '#3b2313', marginBottom: '4px', fontSize: '11px' }}>Organizações:</div>
                    {tooltipEvent.organizacoes_completas.slice(0, 3).map((org: any, idx: number) => (
                      <div key={idx} style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                        • {org.nome}
                      </div>
                    ))}
                    {tooltipEvent.organizacoes_completas.length > 3 && (
                      <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                        +{tooltipEvent.organizacoes_completas.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
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
                  minWidth: '150px',
                  maxWidth: '100%',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
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

            <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', boxSizing: 'border-box' }}>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ListaCapacitacoes;
