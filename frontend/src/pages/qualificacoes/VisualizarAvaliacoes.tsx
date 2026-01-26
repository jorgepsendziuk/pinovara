import { useState, useEffect } from 'react';
import { avaliacaoAPI } from '../../services/avaliacaoService';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { CapacitacaoAvaliacao, AvaliacaoEstatisticas, AvaliacaoVersao } from '../../types/avaliacao';
import { Capacitacao, CapacitacaoInscricao } from '../../types/capacitacao';
import CardEstatisticas from '../../components/capacitacoes/CardEstatisticas';
import GraficoDistribuicao from '../../components/capacitacoes/GraficoDistribuicao';
import ModalDetalhesAvaliacao from '../../components/capacitacoes/ModalDetalhesAvaliacao';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { 
  Loader2, 
  BarChart3, 
  List, 
  Eye,
  FileText,
  Printer
} from 'lucide-react';
import { gerarPdfRelatorioAvaliacoes } from '../../utils/pdfRelatorioAvaliacoes';

interface VisualizarAvaliacoesProps {
  idCapacitacao: number;
}

function VisualizarAvaliacoes({ idCapacitacao }: VisualizarAvaliacoesProps) {
  const [loading, setLoading] = useState(true);
  const [avaliacoes, setAvaliacoes] = useState<CapacitacaoAvaliacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<AvaliacaoEstatisticas[]>([]);
  const [capacitacao, setCapacitacao] = useState<Capacitacao | null>(null);
  const [inscricoes, setInscricoes] = useState<CapacitacaoInscricao[]>([]);
  const [versaoAvaliacao, setVersaoAvaliacao] = useState<AvaliacaoVersao | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'estatisticas' | 'lista'>('estatisticas');
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<CapacitacaoAvaliacao | null>(null);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [idCapacitacao]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [avals, stats, cap, insc, versao] = await Promise.all([
        avaliacaoAPI.listAvaliacoes(idCapacitacao),
        avaliacaoAPI.getEstatisticas(idCapacitacao),
        capacitacaoAPI.getById(idCapacitacao),
        capacitacaoAPI.listInscricoes(idCapacitacao),
        avaliacaoAPI.getVersaoAtiva().catch(() => null)
      ]);
      setAvaliacoes(avals);
      setEstatisticas(stats);
      setCapacitacao(cap);
      setInscricoes(insc);
      setVersaoAvaliacao(versao);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString?: string): string => {
    if (!dataString) return 'Não informado';
    try {
      return new Date(dataString).toLocaleString('pt-BR');
    } catch {
      return dataString;
    }
  };

  const calcularTaxaResposta = (): number => {
    if (inscricoes.length === 0) return 0;
    return (avaliacoes.length / inscricoes.length) * 100;
  };

  const calcularMediaGeral = (): number | undefined => {
    const medias = estatisticas
      .filter(s => s.media !== undefined)
      .map(s => s.media!);
    
    if (medias.length === 0) return undefined;
    
    const soma = medias.reduce((acc, m) => acc + m, 0);
    return soma / medias.length;
  };

  const handleGerarPDF = async () => {
    if (!capacitacao) return;
    
    try {
      setGerandoPDF(true);
      await gerarPdfRelatorioAvaliacoes(
        capacitacao,
        avaliacoes,
        estatisticas,
        inscricoes,
        versaoAvaliacao
      );
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar relatório PDF');
    } finally {
      setGerandoPDF(false);
    }
  };

  const columns: DataGridColumn<CapacitacaoAvaliacao>[] = [
    {
      key: 'created_at',
      title: 'Data/Hora',
      width: '20%',
      render: (_, record) => (
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          {formatarData(record.created_at)}
        </span>
      )
    },
    {
      key: 'nome_participante',
      title: 'Participante',
      width: '25%',
      render: (_, record) => (
        <span style={{ fontSize: '13px', color: '#3b2313', fontWeight: '500' }}>
          {record.nome_participante || 'Não informado'}
        </span>
      )
    },
    {
      key: 'email_participante',
      title: 'Email',
      width: '25%',
      render: (_, record) => (
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          {record.email_participante || '-'}
        </span>
      )
    },
    {
      key: 'total_respostas',
      title: 'Respostas',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <span style={{ fontSize: '13px', color: '#3b2313' }}>
          {record.respostas?.length || 0}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <button
          onClick={() => setAvaliacaoSelecionada(record)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#056839',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            margin: '0 auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#04502d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#056839';
          }}
        >
          <Eye size={14} />
          Ver Detalhes
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px',
        minHeight: '400px'
      }}>
        <Loader2 size={32} className="spinning" />
        <p style={{ marginTop: '16px', color: '#64748b' }}>Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Cabeçalho */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ 
            color: '#3b2313', 
            fontSize: '24px', 
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Avaliações da Capacitação
          </h2>
          {capacitacao && (
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              {capacitacao.titulo || capacitacao.qualificacao?.titulo || 'Capacitação'}
            </p>
          )}
        </div>
        {avaliacoes.length > 0 && (
          <button
            onClick={handleGerarPDF}
            disabled={gerandoPDF}
            style={{
              padding: '10px 20px',
              backgroundColor: gerandoPDF ? '#9ca3af' : '#056839',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: gerandoPDF ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!gerandoPDF) {
                e.currentTarget.style.backgroundColor = '#04502d';
              }
            }}
            onMouseLeave={(e) => {
              if (!gerandoPDF) {
                e.currentTarget.style.backgroundColor = '#056839';
              }
            }}
          >
            {gerandoPDF ? (
              <>
                <Loader2 size={16} className="spinning" />
                Gerando...
              </>
            ) : (
              <>
                <Printer size={16} />
                Gerar Relatório PDF
              </>
            )}
          </button>
        )}
      </div>

      {/* Cards de Estatísticas */}
      {avaliacoes.length > 0 && (
        <CardEstatisticas
          totalAvaliacoes={avaliacoes.length}
          totalInscritos={inscricoes.length}
          taxaResposta={calcularTaxaResposta()}
          mediaGeral={calcularMediaGeral()}
        />
      )}

      {/* Abas */}
      <div style={{ 
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setAbaAtiva('estatisticas')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: abaAtiva === 'estatisticas' ? '2px solid #056839' : '2px solid transparent',
            color: abaAtiva === 'estatisticas' ? '#056839' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: abaAtiva === 'estatisticas' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px'
          }}
        >
          <BarChart3 size={18} />
          Estatísticas
        </button>
        <button
          onClick={() => setAbaAtiva('lista')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: abaAtiva === 'lista' ? '2px solid #056839' : '2px solid transparent',
            color: abaAtiva === 'lista' ? '#056839' : '#64748b',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: abaAtiva === 'lista' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px'
          }}
        >
          <List size={18} />
          Lista de Avaliações ({avaliacoes.length})
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {avaliacoes.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <FileText size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#3b2313', fontSize: '18px', marginBottom: '8px' }}>
            Nenhuma avaliação encontrada
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Ainda não há avaliações submetidas para esta capacitação.
          </p>
        </div>
      ) : (
        <>
          {abaAtiva === 'estatisticas' && (
            <div>
              {estatisticas.length > 0 ? (
                estatisticas.map((stat, index) => (
                  <GraficoDistribuicao key={index} estatistica={stat} />
                ))
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <p>Nenhuma estatística disponível</p>
                </div>
              )}
            </div>
          )}

          {abaAtiva === 'lista' && (
            <div>
              <DataGrid
                columns={columns}
                dataSource={avaliacoes}
                rowKey={(record) => record.id?.toString() || ''}
                emptyState={{
                  title: 'Nenhuma avaliação encontrada',
                  description: 'Não há avaliações para exibir'
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes */}
      {avaliacaoSelecionada && versaoAvaliacao && (
        <ModalDetalhesAvaliacao
          avaliacao={avaliacaoSelecionada}
          perguntas={versaoAvaliacao.perguntas || []}
          onClose={() => setAvaliacaoSelecionada(null)}
        />
      )}
    </div>
  );
}

export default VisualizarAvaliacoes;
