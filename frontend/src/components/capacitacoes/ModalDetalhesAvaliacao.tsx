import { X, User, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import { CapacitacaoAvaliacao, TipoPergunta } from '../../types/avaliacao';

interface ModalDetalhesAvaliacaoProps {
  avaliacao: CapacitacaoAvaliacao | null;
  perguntas: Array<{ id: number; texto_pergunta: string; tipo: TipoPergunta; ordem: number }>;
  onClose: () => void;
}

export default function ModalDetalhesAvaliacao({ 
  avaliacao, 
  perguntas,
  onClose 
}: ModalDetalhesAvaliacaoProps) {
  if (!avaliacao) return null;

  const formatarResposta = (resposta: { resposta_texto?: string; resposta_opcao?: string }, tipo: TipoPergunta): string => {
    if (resposta.resposta_texto) {
      return resposta.resposta_texto;
    }
    if (resposta.resposta_opcao) {
      if (tipo === 'sim_nao_talvez') {
        const map: Record<string, string> = {
          'sim': 'Sim',
          'nao': 'Não',
          'talvez': 'Talvez'
        };
        return map[resposta.resposta_opcao.toLowerCase()] || resposta.resposta_opcao;
      }
      if (tipo === 'sim_nao_parcialmente') {
        const map: Record<string, string> = {
          'sim': 'Sim',
          'nao': 'Não',
          'parcialmente': 'Parcialmente'
        };
        return map[resposta.resposta_opcao.toLowerCase()] || resposta.resposta_opcao;
      }
      return resposta.resposta_opcao;
    }
    return 'Não respondida';
  };

  const formatarData = (dataString?: string): string => {
    if (!dataString) return 'Não informado';
    try {
      return new Date(dataString).toLocaleString('pt-BR');
    } catch {
      return dataString;
    }
  };

  // Criar mapa de perguntas para acesso rápido
  const mapaPerguntas = new Map(perguntas.map(p => [p.id, p]));
  
  // Ordenar respostas pela ordem das perguntas
  const respostasOrdenadas = avaliacao.respostas
    ? [...avaliacao.respostas]
        .map(r => ({
          ...r,
          pergunta: mapaPerguntas.get(r.id_pergunta)
        }))
        .filter(r => r.pergunta)
        .sort((a, b) => (a.pergunta?.ordem || 0) - (b.pergunta?.ordem || 0))
    : [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Cabeçalho */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            color: '#3b2313', 
            fontSize: '20px', 
            fontWeight: '600',
            margin: 0
          }}>
            Detalhes da Avaliação
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: '#64748b'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Informações do participante */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              color: '#3b2313', 
              fontSize: '16px', 
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Informações do Participante
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {avaliacao.nome_participante && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} color="#64748b" />
                  <span style={{ color: '#3b2313' }}>{avaliacao.nome_participante}</span>
                </div>
              )}
              {avaliacao.email_participante && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#64748b" />
                  <span style={{ color: '#3b2313' }}>{avaliacao.email_participante}</span>
                </div>
              )}
              {avaliacao.telefone_participante && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} color="#64748b" />
                  <span style={{ color: '#3b2313' }}>{avaliacao.telefone_participante}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#64748b" />
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                  Submetida em: {formatarData(avaliacao.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Respostas */}
          <div>
            <h3 style={{ 
              color: '#3b2313', 
              fontSize: '16px', 
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Respostas ({respostasOrdenadas.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {respostasOrdenadas.map((resposta, index) => (
                <div
                  key={resposta.id || index}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '16px',
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                  }}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#3b2313',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    {resposta.pergunta?.ordem}. {resposta.pergunta?.texto_pergunta}
                  </div>
                  <div style={{ 
                    color: '#64748b',
                    fontSize: '14px',
                    paddingLeft: '16px',
                    borderLeft: '3px solid #056839'
                  }}>
                    {formatarResposta(resposta, resposta.pergunta?.tipo || 'texto_livre')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comentários gerais */}
          {avaliacao.comentarios && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #f59e0b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MessageSquare size={16} color="#f59e0b" />
                <h4 style={{ 
                  color: '#3b2313', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  margin: 0
                }}>
                  Comentários Gerais
                </h4>
              </div>
              <p style={{ 
                color: '#3b2313', 
                fontSize: '14px',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {avaliacao.comentarios}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#056839',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#04502d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#056839';
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
