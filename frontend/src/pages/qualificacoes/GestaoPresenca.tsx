import { useState, useEffect } from 'react';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { Capacitacao, CapacitacaoInscricao, CapacitacaoPresenca } from '../../types/capacitacao';
import { gerarPDFListaPresenca } from '../../utils/pdfListaPresenca';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  Save,
  Printer,
  Trash2,
  CalendarDays
} from 'lucide-react';
import './QualificacoesModule.css';

interface GestaoPresencaProps {
  idCapacitacao: number;
  onNavigate: (view: string, id?: number) => void;
}

function GestaoPresenca({ idCapacitacao, onNavigate }: GestaoPresencaProps) {
  const [capacitacao, setCapacitacao] = useState<Capacitacao | null>(null);
  const [inscricoes, setInscricoes] = useState<CapacitacaoInscricao[]>([]);
  const [presencas, setPresencas] = useState<CapacitacaoPresenca[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [inscritosSelecionados, setInscritosSelecionados] = useState<Set<number>>(new Set());

  useEffect(() => {
    carregarDados();
  }, [idCapacitacao]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [cap, insc, pres] = await Promise.all([
        capacitacaoAPI.getById(idCapacitacao),
        capacitacaoAPI.listInscricoes(idCapacitacao),
        capacitacaoAPI.listPresencas(idCapacitacao)
      ]);
      setCapacitacao(cap);
      setInscricoes(insc);
      setPresencas(pres);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados da capacitação');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInscrito = (inscricaoId: number) => {
    setInscritosSelecionados(prev => {
      const novo = new Set(prev);
      if (novo.has(inscricaoId)) {
        novo.delete(inscricaoId);
      } else {
        novo.add(inscricaoId);
      }
      return novo;
    });
  };

  const handleSalvarPresencas = async () => {
    if (inscritosSelecionados.size === 0) {
      alert('Selecione pelo menos um inscrito');
      return;
    }

    try {
      setSalvando(true);
      const promises = Array.from(inscritosSelecionados).map(inscricaoId => {
        return capacitacaoAPI.createPresenca(idCapacitacao, {
          id_inscricao: inscricaoId,
          presente: true,
          data: dataSelecionada
        });
      });

      await Promise.all(promises);
      alert(`${inscritosSelecionados.size} presença(s) registrada(s) com sucesso!`);
      setInscritosSelecionados(new Set());
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar presenças:', error);
      alert(error.message || 'Erro ao salvar presenças');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirPresenca = async (inscricaoId: number, data: string) => {
    if (!confirm('Tem certeza que deseja excluir esta presença?')) {
      return;
    }

    try {
      // Encontrar a presença correspondente
      const presenca = presencas.find(
        p => p.id_inscricao === inscricaoId && 
        formatarData(p.data) === formatarData(data)
      );

      if (presenca && presenca.id) {
        await capacitacaoAPI.deletePresenca(idCapacitacao, presenca.id);
        alert('Presença excluída com sucesso!');
        carregarDados();
      } else {
        alert('Presença não encontrada');
      }
    } catch (error: any) {
      console.error('Erro ao excluir presença:', error);
      alert(error.message || 'Erro ao excluir presença');
    }
  };

  const handleGerarPDF = async () => {
    if (!capacitacao) return;
    
    const presencasDataSelecionada = presencas.filter(p => {
      const presData = formatarData(p.data);
      const selData = formatarData(dataSelecionada);
      return presData === selData;
    });

    await gerarPDFListaPresenca({
      capacitacao,
      inscricoes,
      presencas: presencasDataSelecionada,
      data: dataSelecionada
    });
  };

  const formatarData = (data: string | Date | null | undefined): string => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarDataISO = (data: string | Date | null | undefined): string => {
    if (!data) return '';
    // Se já é uma string no formato ISO (YYYY-MM-DD), retornar direto
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return data;
    }
    // Se for uma string de data em outro formato, tentar parsear
    if (typeof data === 'string') {
      const parsed = new Date(data);
      if (!isNaN(parsed.getTime())) {
        // Usar métodos locais para evitar problemas de timezone
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return data; // Retornar como está se não conseguir parsear
    }
    // Se for Date, converter para ISO local
    const d = new Date(data);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Gerar todas as datas do período da capacitação
  const gerarDatasPeriodo = (): string[] => {
    if (!capacitacao?.data_inicio) return [];
    
    // Parsear as datas corretamente
    const inicioStr = typeof capacitacao.data_inicio === 'string' 
      ? capacitacao.data_inicio.split('T')[0] 
      : formatarDataISO(capacitacao.data_inicio);
    const fimStr = capacitacao.data_fim 
      ? (typeof capacitacao.data_fim === 'string' 
          ? capacitacao.data_fim.split('T')[0] 
          : formatarDataISO(capacitacao.data_fim))
      : inicioStr;
    
    if (!inicioStr || !fimStr) return [];
    
    // Parsear como YYYY-MM-DD e criar datas em UTC para evitar problemas de timezone
    const [inicioYear, inicioMonth, inicioDay] = inicioStr.split('-').map(Number);
    const [fimYear, fimMonth, fimDay] = fimStr.split('-').map(Number);
    
    const inicio = new Date(Date.UTC(inicioYear, inicioMonth - 1, inicioDay));
    const fim = new Date(Date.UTC(fimYear, fimMonth - 1, fimDay));
    
    const datas: string[] = [];
    const dataAtual = new Date(inicio);
    
    while (dataAtual <= fim) {
      const year = dataAtual.getUTCFullYear();
      const month = String(dataAtual.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dataAtual.getUTCDate()).padStart(2, '0');
      datas.push(`${year}-${month}-${day}`);
      dataAtual.setUTCDate(dataAtual.getUTCDate() + 1);
    }
    
    return datas.reverse(); // Mais recentes primeiro
  };

  // Obter todas as datas do período da capacitação
  const todasDatasPeriodo = gerarDatasPeriodo();
  
  // Obter datas com presenças para destacar
  const datasComPresenca = new Set(
    presencas.map(p => formatarDataISO(p.data)).filter(Boolean)
  );

  // Inicializar data selecionada com a primeira data do período
  useEffect(() => {
    if (todasDatasPeriodo.length > 0) {
      const dataFormatada = formatarDataISO(dataSelecionada);
      // Se a data selecionada não estiver no período, usar a primeira data do período
      if (!todasDatasPeriodo.includes(dataFormatada)) {
        setDataSelecionada(todasDatasPeriodo[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todasDatasPeriodo.length, capacitacao?.data_inicio, capacitacao?.data_fim]);

  // Verificar quais inscritos já têm presença na data selecionada
  const inscritosComPresenca = new Map<number, CapacitacaoPresenca>();
  presencas
    .filter(p => {
      const presData = formatarDataISO(p.data);
      const selData = formatarDataISO(dataSelecionada);
      return presData === selData && p.id_inscricao;
    })
    .forEach(p => {
      if (p.id_inscricao) {
        inscritosComPresenca.set(p.id_inscricao, p);
      }
    });

  // Função para registrar presença para uma data específica
  const handleRegistrarPresencaPorData = (data: string) => {
    // A data já vem no formato ISO (YYYY-MM-DD)
    // Garantir que está no formato correto
    const dataFormatada = formatarDataISO(data);
    if (dataFormatada) {
      setDataSelecionada(dataFormatada);
      setInscritosSelecionados(new Set()); // Limpar seleção ao mudar de data
      // Scroll para a seção de registro
      setTimeout(() => {
        const elemento = document.getElementById('registro-presenca');
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Loader2 size={32} className="spinning" />
        <p>Carregando dados da capacitação...</p>
      </div>
    );
  }

  if (!capacitacao) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Capacitação não encontrada</h1>
        <p>A capacitação solicitada não existe ou foi removida.</p>
        <button onClick={() => onNavigate('capacitacoes')} className="btn-primary" style={{ marginTop: '20px' }}>
          Voltar para Capacitações
        </button>
      </div>
    );
  }

  return (
    <div className="qualificacoes-module">
      {/* Header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <button
            onClick={() => onNavigate('capacitacoes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'white',
              color: '#3b2313',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#056839';
              e.currentTarget.style.color = '#056839';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#3b2313';
            }}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
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
              <CheckCircle size={24} />
              Lista de Presença
            </h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                {capacitacao.titulo || capacitacao.qualificacao?.titulo}
              </span>
              {capacitacao.data_inicio && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  {formatarData(capacitacao.data_inicio)}
                  {capacitacao.data_fim && ` - ${formatarData(capacitacao.data_fim)}`}
                </span>
              )}
              {capacitacao.local && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} />
                  {capacitacao.local}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleGerarPDF}
          style={{
            padding: '10px 20px',
            background: '#3b2313',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Printer size={16} />
          Gerar PDF
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Botões por Data */}
        {todasDatasPeriodo.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#3b2313', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} />
              Registrar Presenças por Data
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {todasDatasPeriodo.map(data => {
                const presencasData = presencas.filter(p => formatarDataISO(p.data) === data);
                const totalPresencas = presencasData.length;
                const isSelected = formatarDataISO(dataSelecionada) === data;
                const temPresenca = datasComPresenca.has(data);
                
                return (
                  <button
                    key={data}
                    onClick={() => handleRegistrarPresencaPorData(data)}
                    style={{
                      padding: '12px 20px',
                      background: isSelected ? '#056839' : (temPresenca ? '#f0fdf4' : 'white'),
                      color: isSelected ? 'white' : '#3b2313',
                      border: `2px solid ${isSelected ? '#056839' : (temPresenca ? '#056839' : '#e2e8f0')}`,
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#056839';
                        e.currentTarget.style.color = '#056839';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = temPresenca ? '#056839' : '#e2e8f0';
                        e.currentTarget.style.color = '#3b2313';
                      }
                    }}
                  >
                    <Calendar size={16} />
                    {formatarData(data)}
                    {totalPresencas > 0 && (
                      <span style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#d4edda',
                        color: isSelected ? 'white' : '#155724',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {totalPresencas}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Seleção de Presença por Dia */}
        <div id="registro-presenca" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#3b2313', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={18} />
            Registrar Presenças - {formatarData(dataSelecionada)}
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b2313' }}>
              Data
            </label>
            <input
              type="date"
              value={formatarDataISO(dataSelecionada)}
              onChange={(e) => {
                const novaData = e.target.value;
                if (novaData) {
                  // Garantir que a data está no formato correto
                  const dataFormatada = formatarDataISO(novaData);
                  if (dataFormatada) {
                    setDataSelecionada(dataFormatada);
                    setInscritosSelecionados(new Set());
                  }
                }
              }}
              style={{
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                width: '200px'
              }}
            />
          </div>

          <div style={{ 
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '16px',
            maxHeight: '500px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            marginBottom: '20px'
          }}>
            {inscricoes.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                Nenhuma inscrição encontrada
              </p>
            ) : (
              inscricoes.map((insc) => {
                const presenca = inscritosComPresenca.get(insc.id!);
                const jaTemPresenca = !!presenca;
                const estaSelecionado = inscritosSelecionados.has(insc.id!);
                
                return (
                  <div
                    key={insc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      backgroundColor: estaSelecionado ? '#f0fdf4' : 'white',
                      border: `1px solid ${estaSelecionado ? '#056839' : jaTemPresenca ? '#cbd5e1' : '#e2e8f0'}`,
                      opacity: jaTemPresenca ? 0.8 : 1,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!jaTemPresenca) {
                        e.currentTarget.style.borderColor = '#056839';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!estaSelecionado && !jaTemPresenca) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={estaSelecionado}
                      onChange={() => !jaTemPresenca && handleToggleInscrito(insc.id!)}
                      disabled={jaTemPresenca}
                      style={{
                        marginRight: '12px',
                        width: '18px',
                        height: '18px',
                        cursor: jaTemPresenca ? 'not-allowed' : 'pointer'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#3b2313', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {insc.nome}
                        {jaTemPresenca && (
                          <span style={{ 
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            fontWeight: '500'
                          }}>
                            PRESENTE
                          </span>
                        )}
                      </div>
                      {insc.email && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {insc.email}
                        </div>
                      )}
                    </div>
                    {jaTemPresenca && (
                      <button
                        onClick={() => handleExcluirPresenca(insc.id!, dataSelecionada)}
                        style={{
                          padding: '6px 12px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                          marginLeft: '12px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                        }}
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    )}
                    {estaSelecionado && !jaTemPresenca && (
                      <CheckCircle size={18} color="#056839" style={{ marginLeft: '12px' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              {inscritosSelecionados.size > 0 && (
                <span>{inscritosSelecionados.size} inscrito(s) selecionado(s)</span>
              )}
            </div>
            <button
              onClick={handleSalvarPresencas}
              disabled={salvando || inscritosSelecionados.size === 0}
              style={{
                padding: '10px 20px',
                background: (salvando || inscritosSelecionados.size === 0) ? '#9ca3af' : '#056839',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: (salvando || inscritosSelecionados.size === 0) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar {inscritosSelecionados.size > 0 && `(${inscritosSelecionados.size})`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestaoPresenca;
