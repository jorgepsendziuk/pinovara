import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { avaliacaoAPI } from '../../services/avaliacaoService';
import { AvaliacaoVersao, AvaliacaoPergunta, CreateAvaliacaoData } from '../../types/avaliacao';
import { 
  CheckCircle, 
  Award,
  User,
  FileText,
  Loader2
} from 'lucide-react';

function FormAvaliacao() {
  const { linkAvaliacao } = useParams<{ linkAvaliacao: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [versaoAvaliacao, setVersaoAvaliacao] = useState<AvaliacaoVersao | null>(null);
  const [formData, setFormData] = useState<CreateAvaliacaoData>({
    nome_participante: '',
    email_participante: '',
    telefone_participante: '',
    comentarios: '',
    respostas: []
  });
  const [perguntaAtualFocada, setPerguntaAtualFocada] = useState<number | null>(null);
  const perguntaRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (linkAvaliacao) {
      carregarDados();
    }
  }, [linkAvaliacao]);

  useEffect(() => {
    // Focar no início da página ao carregar
    if (versaoAvaliacao?.perguntas && perguntaAtualFocada === null) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  }, [versaoAvaliacao]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await capacitacaoAPI.getByLinkAvaliacao(linkAvaliacao!);
      setVersaoAvaliacao(response.versao_avaliacao);
      
      // Inicializar respostas
      if (response.versao_avaliacao?.perguntas) {
        const perguntas = response.versao_avaliacao.perguntas;
        setFormData(prev => ({
          ...prev,
          respostas: perguntas.map((p: AvaliacaoPergunta) => ({
            id_pergunta: p.id!,
            resposta_texto: undefined,
            resposta_opcao: undefined
          }))
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados da avaliação');
    } finally {
      setLoading(false);
    }
  };

  const encontrarProximaNaoRespondida = (idPerguntaAtual: number): number | null => {
    if (!versaoAvaliacao?.perguntas) return null;
    
    const perguntas = versaoAvaliacao.perguntas.filter(p => p.tipo !== 'texto_livre' || p.ordem !== versaoAvaliacao.perguntas!.length);
    const perguntaComentarios = versaoAvaliacao.perguntas.find(p => p.tipo === 'texto_livre' && p.ordem === versaoAvaliacao.perguntas!.length);
    const todasPerguntas = [...perguntas, ...(perguntaComentarios ? [perguntaComentarios] : [])];
    
    const indiceAtual = todasPerguntas.findIndex(p => p.id === idPerguntaAtual);
    if (indiceAtual === -1) return null;
    
    // Procurar próxima não respondida a partir do índice atual
    for (let i = indiceAtual + 1; i < todasPerguntas.length; i++) {
      const pergunta = todasPerguntas[i];
      if (!pergunta.id) continue;
      const resposta = formData.respostas.find(r => r.id_pergunta === pergunta.id);
      if (!resposta || (!resposta.resposta_texto && !resposta.resposta_opcao)) {
        return pergunta.id;
      }
    }
    return null;
  };

  const focarPergunta = (idPergunta: number) => {
    const ref = perguntaRefs.current.get(idPergunta);
    if (ref) {
      setPerguntaAtualFocada(idPergunta);
      setTimeout(() => {
        ref.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  };

  const handleRespostaChange = (idPergunta: number, tipo: string, valor: string) => {
    setFormData(prev => {
      const novasRespostas = prev.respostas.map(r => {
        if (r.id_pergunta === idPergunta) {
          if (tipo === 'texto_livre') {
            return { ...r, resposta_texto: valor, resposta_opcao: undefined };
          } else {
            return { ...r, resposta_opcao: valor, resposta_texto: undefined };
          }
        }
        return r;
      });
      
      return {
        ...prev,
        respostas: novasRespostas
      };
    });

    // Auto-foco apenas para perguntas de múltipla escolha (não texto livre)
    if (tipo !== 'texto_livre') {
      setTimeout(() => {
        const proximaId = encontrarProximaNaoRespondida(idPergunta);
        if (proximaId !== null) {
          focarPergunta(proximaId);
        }
      }, 250);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar perguntas obrigatórias
    if (versaoAvaliacao?.perguntas) {
      const perguntasObrigatorias = versaoAvaliacao.perguntas.filter(p => p.obrigatoria);
      const respostasPreenchidas = formData.respostas.filter(r => 
        r.resposta_texto || r.resposta_opcao
      );
      
      const faltantes = perguntasObrigatorias.filter(p => 
        !respostasPreenchidas.some(r => r.id_pergunta === p.id)
      );

      if (faltantes.length > 0) {
        // Focar na primeira pergunta não respondida
        const primeiraFaltante = faltantes[0];
        if (primeiraFaltante.id) {
          focarPergunta(primeiraFaltante.id);
        }
        alert(`Por favor, responda todas as perguntas obrigatórias. Faltam ${faltantes.length} pergunta(s).`);
        return;
      }
    }

    try {
      setSubmitting(true);
      await avaliacaoAPI.createAvaliacaoPublica(linkAvaliacao!, formData);
      
      // Mostrar mensagem de sucesso
      alert('Avaliação submetida com sucesso! Obrigado pela sua participação!');
      
      // Limpar formulário
      setFormData({
        nome_participante: '',
        email_participante: '',
        telefone_participante: '',
        comentarios: '',
        respostas: versaoAvaliacao?.perguntas?.map(p => ({
          id_pergunta: p.id!,
          resposta_texto: undefined,
          resposta_opcao: undefined
        })) || []
      });
      setPerguntaAtualFocada(null);
    } catch (error: any) {
      console.error('Erro ao submeter avaliação:', error);
      alert(error.message || 'Erro ao submeter avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  // Função helper para normalizar opcoes (pode vir como string JSON ou array)
  const normalizarOpcoes = (opcoes: any): string[] => {
    if (!opcoes) return [];
    if (Array.isArray(opcoes)) return opcoes;
    if (typeof opcoes === 'string') {
      try {
        const parsed = JSON.parse(opcoes);
        return Array.isArray(parsed) ? parsed : [opcoes];
      } catch {
        return [opcoes];
      }
    }
    return [];
  };

  const setPerguntaRef = (id: number, element: HTMLDivElement | null) => {
    if (element) {
      perguntaRefs.current.set(id, element);
    } else {
      perguntaRefs.current.delete(id);
    }
  };

  const renderPergunta = (pergunta: AvaliacaoPergunta) => {
    const resposta = formData.respostas.find(r => r.id_pergunta === pergunta.id);
    const opcoes = normalizarOpcoes(pergunta.opcoes);
    const isFocada = perguntaAtualFocada === pergunta.id;

    switch (pergunta.tipo) {
      case 'escala_5':
      case 'escala_3':
        return (
          <div 
            key={pergunta.id}
            ref={(el) => pergunta.id && setPerguntaRef(pergunta.id, el)}
            style={{ 
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: isFocada ? '2px solid #056839' : '1px solid #e2e8f0',
              boxShadow: isFocada ? '0 2px 8px rgba(5, 104, 57, 0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              scrollMarginTop: '80px'
            }}
          >
            <label style={{ 
              display: 'block', 
              marginBottom: '20px', 
              fontWeight: '600',
              color: '#3b2313',
              fontSize: '18px',
              lineHeight: '1.5'
            }}>
              {pergunta.texto_pergunta}
              {pergunta.obrigatoria && <span style={{ color: '#ef4444', marginLeft: '4px' }}> *</span>}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {opcoes.length > 0 ? opcoes.map((opcao, idx) => (
                <label 
                  key={idx} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 16px',
                    border: `2px solid ${resposta?.resposta_opcao === opcao ? '#056839' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: resposta?.resposta_opcao === opcao ? '#f0fdf4' : 'white',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (resposta?.resposta_opcao !== opcao) {
                      e.currentTarget.style.borderColor = '#056839';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (resposta?.resposta_opcao !== opcao) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name={`pergunta_${pergunta.id}`}
                    value={opcao}
                    checked={resposta?.resposta_opcao === opcao}
                    onChange={(e) => handleRespostaChange(pergunta.id!, pergunta.tipo, e.target.value)}
                    required={pergunta.obrigatoria}
                    style={{ 
                      marginRight: '12px',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#056839'
                    }}
                  />
                  <span style={{ 
                    color: '#3b2313',
                    fontSize: '15px',
                    flex: 1
                  }}>
                    {opcao}
                  </span>
                  {resposta?.resposta_opcao === opcao && (
                    <CheckCircle size={20} color="#056839" />
                  )}
                </label>
              )) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
                  Nenhuma opção disponível
                </p>
              )}
            </div>
          </div>
        );

      case 'sim_nao_talvez':
      case 'sim_nao_parcialmente':
        return (
          <div 
            key={pergunta.id}
            ref={(el) => pergunta.id && setPerguntaRef(pergunta.id, el)}
            style={{ 
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: isFocada ? '2px solid #056839' : '1px solid #e2e8f0',
              boxShadow: isFocada ? '0 2px 8px rgba(5, 104, 57, 0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              scrollMarginTop: '80px'
            }}
          >
            <label style={{ 
              display: 'block', 
              marginBottom: '20px', 
              fontWeight: '600',
              color: '#3b2313',
              fontSize: '18px',
              lineHeight: '1.5'
            }}>
              {pergunta.texto_pergunta}
              {pergunta.obrigatoria && <span style={{ color: '#ef4444', marginLeft: '4px' }}> *</span>}
            </label>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {opcoes.length > 0 ? opcoes.map((opcao, idx) => (
                <label 
                  key={idx} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 20px',
                    border: `2px solid ${resposta?.resposta_opcao === opcao ? '#056839' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: resposta?.resposta_opcao === opcao ? '#f0fdf4' : 'white',
                    transition: 'all 0.2s',
                    flex: '1 1 auto',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (resposta?.resposta_opcao !== opcao) {
                      e.currentTarget.style.borderColor = '#056839';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (resposta?.resposta_opcao !== opcao) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name={`pergunta_${pergunta.id}`}
                    value={opcao}
                    checked={resposta?.resposta_opcao === opcao}
                    onChange={(e) => handleRespostaChange(pergunta.id!, pergunta.tipo, e.target.value)}
                    required={pergunta.obrigatoria}
                    style={{ 
                      marginRight: '8px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#056839'
                    }}
                  />
                  <span style={{ 
                    color: '#3b2313',
                    fontSize: '15px',
                    fontWeight: '500'
                  }}>
                    {opcao}
                  </span>
                </label>
              )) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', padding: '20px', textAlign: 'center', width: '100%' }}>
                  Nenhuma opção disponível
                </p>
              )}
            </div>
          </div>
        );

      case 'texto_livre':
        return (
          <div 
            key={pergunta.id}
            ref={(el) => pergunta.id && setPerguntaRef(pergunta.id, el)}
            style={{ 
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: isFocada ? '2px solid #056839' : '1px solid #e2e8f0',
              boxShadow: isFocada ? '0 2px 8px rgba(5, 104, 57, 0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              scrollMarginTop: '80px'
            }}
          >
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600',
              color: '#3b2313',
              fontSize: '18px',
              lineHeight: '1.5'
            }}>
              {pergunta.texto_pergunta}
              {pergunta.obrigatoria && <span style={{ color: '#ef4444', marginLeft: '4px' }}> *</span>}
            </label>
            <textarea
              value={resposta?.resposta_texto || ''}
              onChange={(e) => handleRespostaChange(pergunta.id!, pergunta.tipo, e.target.value)}
              required={pergunta.obrigatoria}
              rows={6}
              style={{ 
                width: '100%', 
                padding: '14px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                color: '#3b2313',
                resize: 'vertical',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#056839';
                e.currentTarget.style.outline = 'none';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 104, 57, 0.1)';
                if (pergunta.id) {
                  setPerguntaAtualFocada(pergunta.id);
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="Digite sua resposta aqui..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} className="spinning" style={{ color: '#056839', marginBottom: '12px' }} />
          <div style={{ fontSize: '18px', color: '#3b2313' }}>Carregando avaliação...</div>
        </div>
      </div>
    );
  }

  if (!versaoAvaliacao || !versaoAvaliacao.perguntas) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h1 style={{ color: '#3b2313', marginTop: 0, marginBottom: '16px', fontSize: '24px' }}>
            Questionário não encontrado
          </h1>
          <p style={{ color: '#64748b' }}>
            O questionário de avaliação não está disponível no momento.
          </p>
        </div>
      </div>
    );
  }

  const perguntas = versaoAvaliacao.perguntas.filter(p => p.tipo !== 'texto_livre' || p.ordem !== versaoAvaliacao.perguntas!.length);
  const perguntaComentarios = versaoAvaliacao.perguntas.find(p => p.tipo === 'texto_livre' && p.ordem === versaoAvaliacao.perguntas!.length);
  const totalPerguntas = perguntas.length + (perguntaComentarios ? 1 : 0);
  
  // Calcular progresso baseado em perguntas respondidas
  const perguntasRespondidas = formData.respostas.filter(r => r.resposta_texto || r.resposta_opcao).length;
  const progresso = totalPerguntas > 0 ? (perguntasRespondidas / totalPerguntas) * 100 : 0;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc'
    }}>
      {/* Header com Identidade Visual */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '3px solid #056839',
        padding: '20px 0',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <img 
            src="/pinovara.png" 
            alt="PINOVARA" 
            style={{ 
              height: '60px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
          <div style={{ flex: 1 }}>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#056839',
              marginBottom: '4px'
            }}>
              Sistema PINOVARA
            </h1>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#3b2313'
            }}>
              Plataforma de Inovação Agroecológica - UFBA
            </p>
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#3b2313'
            }}>
              Avaliação
            </h2>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        padding: '0 20px 20px'
      }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '32px', 
          borderRadius: '8px', 
          marginBottom: '24px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px' 
          }}>
            <Award size={32} color="#056839" />
            <h1 style={{ 
              color: '#3b2313', 
              margin: 0, 
              fontSize: '28px',
              fontWeight: '600'
            }}>
              Sua Opinião é Importante!
            </h1>
          </div>
          <p style={{ 
            color: '#64748b', 
            lineHeight: '1.6',
            margin: 0,
            fontSize: '15px'
          }}>
            Instrumento essencial para avaliar o desempenho da qualificação / capacitação ofertada no âmbito do PINOVARA (M10, P17). 
            Dados e informações coletados em consonância com a Lei Geral de Proteção de Dados Pessoais - LGPD (Lei nº 13.709/2018).
          </p>
        </div>

        {/* Barra de Progresso */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ 
              color: '#3b2313', 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {perguntasRespondidas} de {totalPerguntas} perguntas respondidas
            </span>
            <span style={{ 
              color: '#64748b', 
              fontSize: '14px'
            }}>
              {Math.round(progresso)}% concluído
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e2e8f0', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progresso}%`, 
              height: '100%', 
              backgroundColor: '#056839',
              transition: 'width 0.3s ease',
              borderRadius: '4px'
            }} />
          </div>
        </div>

        {/* Indicadores de Passos (Visualização) */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            minWidth: 'max-content'
          }}>
            {Array.from({ length: totalPerguntas }).map((_, index) => {
              const pergunta = index < perguntas.length 
                ? perguntas[index] 
                : perguntaComentarios;
              const resposta = pergunta ? formData.respostas.find(r => r.id_pergunta === pergunta.id) : null;
              const respondida = resposta && (resposta.resposta_texto || resposta.resposta_opcao);
              const isFocada = perguntaAtualFocada === pergunta?.id;
              
              return (
                <div
                  key={index}
                  style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: isFocada ? '2px solid #056839' : '2px solid #e2e8f0',
                    backgroundColor: respondida ? '#056839' : (isFocada ? '#f0fdf4' : 'white'),
                    color: respondida ? 'white' : (isFocada ? '#056839' : '#64748b'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}
                  title={`Pergunta ${index + 1}${respondida ? ' (Respondida)' : ''}`}
                >
                  {respondida ? <CheckCircle size={20} /> : index + 1}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Dados do Participante */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ 
              color: '#3b2313', 
              marginTop: 0, 
              marginBottom: '24px',
              fontSize: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <User size={20} color="#056839" />
              Dados do Participante (Opcional)
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#3b2313',
                  fontSize: '14px'
                }}>
                  Nome completo
                </label>
                <input
                  type="text"
                  value={formData.nome_participante || ''}
                  onChange={(e) => setFormData({ ...formData, nome_participante: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#056839';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 104, 57, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#3b2313',
                  fontSize: '14px'
                }}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email_participante || ''}
                  onChange={(e) => setFormData({ ...formData, email_participante: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#056839';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 104, 57, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#3b2313',
                  fontSize: '14px'
                }}>
                  Telefone (com DDD)
                </label>
                <input
                  type="tel"
                  value={formData.telefone_participante || ''}
                  onChange={(e) => setFormData({ ...formData, telefone_participante: e.target.value })}
                  placeholder="(11) 99999-9999"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#056839';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5, 104, 57, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Perguntas */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ 
              color: '#3b2313', 
              marginTop: 0, 
              marginBottom: '24px',
              fontSize: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FileText size={20} color="#056839" />
              Questionário de Avaliação
            </h2>
            
            {perguntas.map((p) => renderPergunta(p))}
            
            {/* Campo de comentários (última pergunta texto_livre) */}
            {perguntaComentarios && renderPergunta(perguntaComentarios)}
          </div>

          {/* Submit */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#9ca3af' : '#056839',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: submitting ? 'none' : '0 2px 4px rgba(5, 104, 57, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#04502d';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(5, 104, 57, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#056839';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(5, 104, 57, 0.2)';
                }
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  Enviando...
                </>
              ) : (
                <>
                  <Award size={18} />
                  Enviar Avaliação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormAvaliacao;
