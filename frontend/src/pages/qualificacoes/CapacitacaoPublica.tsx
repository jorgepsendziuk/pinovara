import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { Capacitacao } from '../../types/capacitacao';
import FormInscricao from './FormInscricao';
import QRCodeDisplay from '../../components/qualificacoes/QRCodeDisplay';
import { 
  Download, 
  FileText, 
  Calendar, 
  MapPin, 
  Clock, 
  BookOpen, 
  ChevronDown,
  Users,
  Target,
  List,
  GraduationCap,
  FileCheck,
  Award,
  Lock,
  Unlock
} from 'lucide-react';

function CapacitacaoPublica() {
  const { linkInscricao } = useParams<{ linkInscricao: string }>();
  const navigate = useNavigate();
  const [capacitacao, setCapacitacao] = useState<Capacitacao | null>(null);
  const [materiais, setMateriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'info' | 'inscricao' | 'entrar'>('info');
  const [isInscrito, setIsInscrito] = useState(false);
  const [emailEntrada, setEmailEntrada] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [accordionsAbertos, setAccordionsAbertos] = useState<string[]>(['informacoes-basicas']);

  useEffect(() => {
    if (linkInscricao) {
      carregarCapacitacao();
    }
  }, [linkInscricao]);

  const carregarCapacitacao = async () => {
    try {
      setLoading(true);
      const cap = await capacitacaoAPI.getByLinkInscricao(linkInscricao!);
      setCapacitacao(cap);
      
      // Carregar materiais da qualificação via rota pública (apenas se inscrito)
      if (cap.link_inscricao && isInscrito) {
        try {
          const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
          const response = await fetch(`${apiBase}/capacitacoes/public/${cap.link_inscricao}/materiais`);
          
          if (response.ok) {
            const data = await response.json();
            setMateriais(data.data || []);
          } else {
            setMateriais([]);
          }
        } catch (error) {
          console.error('Erro ao carregar materiais:', error);
          setMateriais([]);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar capacitação:', error);
      const mensagem = error.message || 'Capacitação não encontrada. Verifique se o link está correto.';
      console.error('Erro detalhado:', mensagem);
      setCapacitacao(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInscrito && capacitacao) {
      carregarMateriais();
    }
  }, [isInscrito, capacitacao?.link_inscricao]);

  const carregarMateriais = async () => {
    if (!capacitacao?.link_inscricao) return;
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
      const response = await fetch(`${apiBase}/capacitacoes/public/${capacitacao.link_inscricao}/materiais`);
      
      if (response.ok) {
        const data = await response.json();
        setMateriais(data.data || []);
      } else {
        setMateriais([]);
      }
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      setMateriais([]);
    }
  };

  const handleDownloadMaterial = async (materialId: number, nomeOriginal: string) => {
    if (!capacitacao?.link_inscricao) return;
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
      const url = `${apiBase}/capacitacoes/public/${capacitacao.link_inscricao}/materiais/${materialId}/download`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao baixar material');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nomeOriginal || `material-${materialId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar material:', error);
      alert('Erro ao baixar material. Tente novamente mais tarde.');
    }
  };

  const handleInscricaoSucesso = () => {
    alert('Inscrição realizada com sucesso!');
    setView('info');
    carregarCapacitacao();
  };

  const handleVerificarInscricao = async () => {
    if (!emailEntrada || !emailEntrada.trim()) {
      alert('Por favor, informe seu email');
      return;
    }

    try {
      setVerificando(true);
      await capacitacaoAPI.verificarInscricao(linkInscricao!, emailEntrada.trim());
      setIsInscrito(true);
      setView('info');
      // Abrir accordions de conteúdo após autorização
      setAccordionsAbertos(['informacoes-basicas', 'objetivo-geral', 'conteudo-programatico', 'materiais']);
    } catch (error: any) {
      alert(error.message || 'Email não encontrado. Verifique se você está inscrito nesta capacitação.');
    } finally {
      setVerificando(false);
    }
  };

  const toggleAccordion = (accordion: string) => {
    // Se não estiver inscrito, não permitir abrir accordions bloqueados
    const accordionsBloqueados = ['materiais', 'metodologia', 'recursos-didaticos', 'estrategia-avaliacao', 'referencias'];
    if (!isInscrito && accordionsBloqueados.includes(accordion)) {
      setView('entrar');
      return;
    }
    
    setAccordionsAbertos(prev => 
      prev.includes(accordion) 
        ? prev.filter(a => a !== accordion)
        : [...prev, accordion]
    );
  };

  // Função helper para formatar data corretamente (evita problemas de timezone)
  const formatarData = (dataString: string | Date | null | undefined): string => {
    if (!dataString) return '-';
    
    // Se for Date, converter para string primeiro
    let dataStr: string;
    if (dataString instanceof Date) {
      dataStr = dataString.toISOString().split('T')[0];
    } else {
      dataStr = String(dataString);
    }
    
    // Se a data vem como string no formato YYYY-MM-DD, criar Date corretamente
    const partes = dataStr.split('T')[0].split('-');
    if (partes.length === 3) {
      // Criar data no timezone local (ano, mês-1, dia)
      const data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    // Fallback para o método padrão
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
          <div style={{ fontSize: '18px', color: '#3b2313', marginBottom: '12px' }}>Carregando...</div>
        </div>
      </div>
    );
  }

  if (!capacitacao) {
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
            Capacitação não encontrada
          </h1>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            O link de inscrição é inválido ou a capacitação não existe mais.
          </p>
        </div>
      </div>
    );
  }

  const qualificacao = capacitacao.qualificacao as any;

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
              Capacitação
            </h2>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1000px', 
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
          <h1 style={{ 
            color: '#3b2313', 
            marginTop: 0, 
            marginBottom: '20px', 
            fontSize: '32px',
            fontWeight: '600',
            lineHeight: '1.3'
          }}>
            {capacitacao.titulo || qualificacao?.titulo || 'Capacitação'}
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '20px' 
          }}>
            {capacitacao.data_inicio && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <Calendar size={20} color="#056839" />
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Data de Início</div>
                  <div style={{ fontWeight: '600', color: '#3b2313', fontSize: '14px' }}>
                    {formatarData(capacitacao.data_inicio)}
                  </div>
                </div>
              </div>
            )}

            {capacitacao.data_fim && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <Calendar size={20} color="#056839" />
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Data de Término</div>
                  <div style={{ fontWeight: '600', color: '#3b2313', fontSize: '14px' }}>
                    {formatarData(capacitacao.data_fim)}
                  </div>
                </div>
              </div>
            )}

            {capacitacao.local && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <MapPin size={20} color="#056839" />
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Local</div>
                  <div style={{ fontWeight: '600', color: '#3b2313', fontSize: '14px' }}>{capacitacao.local}</div>
                </div>
              </div>
            )}

            {capacitacao.turno && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <Clock size={20} color="#056839" />
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Turno</div>
                  <div style={{ fontWeight: '600', color: '#3b2313', fontSize: '14px' }}>{capacitacao.turno}</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px', 
            backgroundColor: capacitacao.status === 'concluida' ? '#d4edda' : 
                             capacitacao.status === 'em_andamento' ? '#fff3cd' :
                             capacitacao.status === 'cancelada' ? '#f8d7da' : '#d1ecf1', 
            borderRadius: '6px', 
            border: `1px solid ${capacitacao.status === 'concluida' ? '#c3e6cb' : 
                             capacitacao.status === 'em_andamento' ? '#ffeaa7' :
                             capacitacao.status === 'cancelada' ? '#f5c6cb' : '#bee5eb'}`
          }}>
            <strong style={{ 
              color: capacitacao.status === 'concluida' ? '#155724' :
                     capacitacao.status === 'em_andamento' ? '#856404' :
                     capacitacao.status === 'cancelada' ? '#721c24' : '#0c5460',
              fontSize: '14px',
              textTransform: 'capitalize'
            }}>
              Status: {capacitacao.status === 'planejada' ? 'Planejada' :
                       capacitacao.status === 'em_andamento' ? 'Em Andamento' :
                       capacitacao.status === 'concluida' ? 'Concluída' :
                       capacitacao.status === 'cancelada' ? 'Cancelada' : capacitacao.status}
            </strong>
          </div>
        </div>

        {/* Informações Básicas - Sempre visível, sem accordion */}
        {qualificacao && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0', 
              color: '#3b2313', 
              fontSize: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <BookOpen size={20} color="#056839" />
              Informações Básicas
            </h2>
            <div style={{ color: '#64748b', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#3b2313' }}>Qualificação:</strong> {qualificacao.titulo}
              </p>
              {capacitacao.organizacoes_completas && capacitacao.organizacoes_completas.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <strong style={{ color: '#3b2313', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={16} />
                    Organizações Participantes:
                  </strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {capacitacao.organizacoes_completas.map((org, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{org.nome}</li>
                    ))}
                  </ul>
                </div>
              )}
              {capacitacao.tecnico_criador && (
                <div style={{ marginTop: '16px' }}>
                  <strong style={{ color: '#3b2313', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={16} />
                    Técnico Responsável:
                  </strong>
                  <p style={{ margin: 0 }}>{capacitacao.tecnico_criador.name} ({capacitacao.tecnico_criador.email})</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accordions */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>

          {/* Objetivo Geral - Sempre visível */}
          {qualificacao?.objetivo_geral && (
            <div className="accordion-item" style={{ marginBottom: '16px' }}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('objetivo-geral')}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                background: 'linear-gradient(135deg, #3b2313 0%, #056839 100%)',
                border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2d1a0e 0%, #044d2d 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3b2313 0%, #056839 100%)';
              }}
              >
              <h3 style={{ 
                margin: 0, 
                color: 'white', 
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Target size={20} color="white" />
                Objetivo Geral
              </h3>
              <ChevronDown
                size={20}
                color="white"
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: accordionsAbertos.includes('objetivo-geral') ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>
              
              <div className={`accordion-content ${accordionsAbertos.includes('objetivo-geral') ? 'open' : ''}`}
                style={{
                  maxHeight: accordionsAbertos.includes('objetivo-geral') ? '1000px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  padding: accordionsAbertos.includes('objetivo-geral') ? '20px' : '0 20px',
                  border: accordionsAbertos.includes('objetivo-geral') ? '1px solid #e2e8f0' : 'none',
                  borderTop: 'none',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                <p style={{ color: '#64748b', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-line' }}>
                  {qualificacao.objetivo_geral}
                </p>
              </div>
            </div>
          )}

          {/* Conteúdo Programático - Sempre visível */}
          {qualificacao?.conteudo_programatico && (
            <div className="accordion-item" style={{ marginBottom: '16px' }}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('conteudo-programatico')}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                background: 'linear-gradient(135deg, #3b2313 0%, #056839 100%)',
                border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2d1a0e 0%, #044d2d 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3b2313 0%, #056839 100%)';
              }}
              >
                <h3 style={{ 
                  margin: 0, 
                  color: 'white', 
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                <List size={20} color="white" />
                Conteúdo Programático
              </h3>
              <ChevronDown
                size={20}
                color="white"
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: accordionsAbertos.includes('conteudo-programatico') ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>
              
              <div className={`accordion-content ${accordionsAbertos.includes('conteudo-programatico') ? 'open' : ''}`}
                style={{
                  maxHeight: accordionsAbertos.includes('conteudo-programatico') ? '2000px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  padding: accordionsAbertos.includes('conteudo-programatico') ? '20px' : '0 20px',
                  border: accordionsAbertos.includes('conteudo-programatico') ? '1px solid #e2e8f0' : 'none',
                  borderTop: 'none',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ color: '#3b2313', lineHeight: '1.8', whiteSpace: 'pre-line', fontSize: '15px' }}>
                  {qualificacao.conteudo_programatico}
                </div>
              </div>
            </div>
          )}

          {/* Materiais - Bloqueado até autorização */}
          <div className="accordion-item" style={{ marginBottom: '16px' }}>
            <button
              className="accordion-header"
              onClick={() => toggleAccordion('materiais')}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: isInscrito 
                  ? 'linear-gradient(135deg, #3b2313 0%, #056839 100%)'
                  : 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (isInscrito) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#056839';
                }
              }}
              onMouseLeave={(e) => {
                if (isInscrito) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              <h3 style={{ 
                margin: 0, 
                color: '#3b2313', 
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {isInscrito ? <FileText size={20} color="white" /> : <Lock size={20} color="white" />}
                <span style={{ color: 'white' }}>
                  Materiais do Curso
                  {!isInscrito && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      opacity: 0.9
                    }}>
                      (Requer inscrição)
                    </span>
                  )}
                </span>
              </h3>
              {isInscrito ? (
                <ChevronDown
                  size={20}
                  color="white"
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: accordionsAbertos.includes('materiais') ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              ) : (
                <Lock size={16} color="#f59e0b" />
              )}
            </button>
            
            {isInscrito && (
              <div className={`accordion-content ${accordionsAbertos.includes('materiais') ? 'open' : ''}`}
                style={{
                  maxHeight: accordionsAbertos.includes('materiais') ? '1000px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  padding: accordionsAbertos.includes('materiais') ? '20px' : '0 20px',
                  border: accordionsAbertos.includes('materiais') ? '1px solid #e2e8f0' : 'none',
                  borderTop: 'none',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                {materiais.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {materiais.map((material) => (
                      <div
                        key={material.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#056839';
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#3b2313', marginBottom: '4px', fontSize: '15px' }}>
                            {material.nome_original}
                          </div>
                          {material.descricao && (
                            <div style={{ fontSize: '13px', color: '#64748b' }}>{material.descricao}</div>
                          )}
                        </div>
                        <button
                          onClick={() => material.id && handleDownloadMaterial(material.id, material.nome_original)}
                          style={{
                            padding: '10px 20px',
                            background: '#056839',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            marginLeft: '16px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#04502d';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#056839';
                          }}
                        >
                          <Download size={16} />
                          Baixar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                    Nenhum material disponível no momento.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Metodologia - Bloqueado até autorização */}
          {qualificacao?.metodologia && (
            <div className="accordion-item" style={{ marginBottom: '16px' }}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('metodologia')}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: isInscrito ? '#f8fafc' : '#fef3c7',
                  border: `1px solid ${isInscrito ? '#e2e8f0' : '#fde68a'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (isInscrito) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2d1a0e 0%, #044d2d 100%)';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #78350f 0%, #92400e 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isInscrito) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b2313 0%, #056839 100%)';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #92400e 0%, #b45309 100%)';
                  }
                }}
              >
                <h3 style={{ 
                  margin: 0, 
                  color: '#3b2313', 
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {isInscrito ? <GraduationCap size={20} color="white" /> : <Lock size={20} color="white" />}
                  <span style={{ color: 'white' }}>
                    Metodologia
                    {!isInscrito && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        opacity: 0.9
                      }}>
                        (Requer inscrição)
                      </span>
                    )}
                  </span>
                </h3>
                {isInscrito ? (
                  <ChevronDown
                    size={20}
                    color="white"
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: accordionsAbertos.includes('metodologia') ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                ) : (
                  <Lock size={16} color="white" />
                )}
              </button>
              
              {isInscrito && (
                <div className={`accordion-content ${accordionsAbertos.includes('metodologia') ? 'open' : ''}`}
                  style={{
                    maxHeight: accordionsAbertos.includes('metodologia') ? '1000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                    padding: accordionsAbertos.includes('metodologia') ? '20px' : '0 20px',
                    border: accordionsAbertos.includes('metodologia') ? '1px solid #e2e8f0' : 'none',
                    borderTop: 'none',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ color: '#64748b', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                    {qualificacao.metodologia}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recursos Didáticos - Bloqueado até autorização */}
          {qualificacao?.recursos_didaticos && (
            <div className="accordion-item" style={{ marginBottom: '16px' }}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('recursos-didaticos')}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: isInscrito ? '#f8fafc' : '#fef3c7',
                  border: `1px solid ${isInscrito ? '#e2e8f0' : '#fde68a'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (isInscrito) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2d1a0e 0%, #044d2d 100%)';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #78350f 0%, #92400e 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isInscrito) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b2313 0%, #056839 100%)';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #92400e 0%, #b45309 100%)';
                  }
                }}
              >
                <h3 style={{ 
                  margin: 0, 
                  color: '#3b2313', 
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {isInscrito ? <FileCheck size={20} color="white" /> : <Lock size={20} color="white" />}
                  <span style={{ color: 'white' }}>
                    Recursos Didáticos
                    {!isInscrito && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        opacity: 0.9
                      }}>
                        (Requer inscrição)
                      </span>
                    )}
                  </span>
                </h3>
                {isInscrito ? (
                  <ChevronDown
                    size={20}
                    color="white"
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: accordionsAbertos.includes('recursos-didaticos') ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                ) : (
                  <Lock size={16} color="white" />
                )}
              </button>
              
              {isInscrito && (
                <div className={`accordion-content ${accordionsAbertos.includes('recursos-didaticos') ? 'open' : ''}`}
                  style={{
                    maxHeight: accordionsAbertos.includes('recursos-didaticos') ? '1000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                    padding: accordionsAbertos.includes('recursos-didaticos') ? '20px' : '0 20px',
                    border: accordionsAbertos.includes('recursos-didaticos') ? '1px solid #e2e8f0' : 'none',
                    borderTop: 'none',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ color: '#64748b', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                    {qualificacao.recursos_didaticos}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estratégia de Avaliação - Bloqueado até autorização */}
          {qualificacao?.estrategia_avaliacao && (
            <div className="accordion-item" style={{ marginBottom: '16px' }}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('estrategia-avaliacao')}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: isInscrito ? '#f8fafc' : '#fef3c7',
                  border: `1px solid ${isInscrito ? '#e2e8f0' : '#fde68a'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (isInscrito) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2d1a0e 0%, #044d2d 100%)';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #78350f 0%, #92400e 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isInscrito) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b2313 0%, #056839 100%)';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #92400e 0%, #b45309 100%)';
                  }
                }}
              >
                <h3 style={{ 
                  margin: 0, 
                  color: '#3b2313', 
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {isInscrito ? <Award size={20} color="white" /> : <Lock size={20} color="white" />}
                  <span style={{ color: 'white' }}>
                    Estratégia de Avaliação
                    {!isInscrito && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        opacity: 0.9
                      }}>
                        (Requer inscrição)
                      </span>
                    )}
                  </span>
                </h3>
                {isInscrito ? (
                  <ChevronDown
                    size={20}
                    color="white"
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: accordionsAbertos.includes('estrategia-avaliacao') ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                ) : (
                  <Lock size={16} color="white" />
                )}
              </button>
              
              {isInscrito && (
                <div className={`accordion-content ${accordionsAbertos.includes('estrategia-avaliacao') ? 'open' : ''}`}
                  style={{
                    maxHeight: accordionsAbertos.includes('estrategia-avaliacao') ? '1000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                    padding: accordionsAbertos.includes('estrategia-avaliacao') ? '20px' : '0 20px',
                    border: accordionsAbertos.includes('estrategia-avaliacao') ? '1px solid #e2e8f0' : 'none',
                    borderTop: 'none',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ color: '#64748b', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                    {qualificacao.estrategia_avaliacao}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Referências - Bloqueado até autorização */}
          {qualificacao?.referencias && (
            <div className="accordion-item" style={{ marginBottom: '16px' }}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('referencias')}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: isInscrito ? '#f8fafc' : '#fef3c7',
                  border: `1px solid ${isInscrito ? '#e2e8f0' : '#fde68a'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (isInscrito) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2d1a0e 0%, #044d2d 100%)';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #78350f 0%, #92400e 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isInscrito) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b2313 0%, #056839 100%)';
                  } else {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #92400e 0%, #b45309 100%)';
                  }
                }}
              >
                <h3 style={{ 
                  margin: 0, 
                  color: '#3b2313', 
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {isInscrito ? <BookOpen size={20} color="white" /> : <Lock size={20} color="white" />}
                  <span style={{ color: 'white' }}>
                    Referências
                    {!isInscrito && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        opacity: 0.9
                      }}>
                        (Requer inscrição)
                      </span>
                    )}
                  </span>
                </h3>
                {isInscrito ? (
                  <ChevronDown
                    size={20}
                    color="white"
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: accordionsAbertos.includes('referencias') ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                ) : (
                  <Lock size={16} color="white" />
                )}
              </button>
              
              {isInscrito && (
                <div className={`accordion-content ${accordionsAbertos.includes('referencias') ? 'open' : ''}`}
                  style={{
                    maxHeight: accordionsAbertos.includes('referencias') ? '1000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                    padding: accordionsAbertos.includes('referencias') ? '20px' : '0 20px',
                    border: accordionsAbertos.includes('referencias') ? '1px solid #e2e8f0' : 'none',
                    borderTop: 'none',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ color: '#64748b', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                    {qualificacao.referencias}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        {view === 'info' && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '32px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            {!isInscrito ? (
              <>
                <h2 style={{ color: '#3b2313', marginTop: 0, marginBottom: '24px', fontSize: '24px' }}>
                  Participe desta Capacitação
                </h2>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                  <button
                    onClick={() => setView('inscricao')}
                    style={{
                      backgroundColor: '#056839',
                      color: 'white',
                      border: 'none',
                      padding: '16px 32px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 2px 4px rgba(5, 104, 57, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#04502d';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(5, 104, 57, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#056839';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(5, 104, 57, 0.2)';
                    }}
                  >
                    <Users size={20} />
                    Inscrever-se
                  </button>
                  <button
                    onClick={() => setView('entrar')}
                    style={{
                      backgroundColor: '#3b2313',
                      color: 'white',
                      border: 'none',
                      padding: '16px 32px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 2px 4px rgba(59, 35, 19, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2a180e';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 35, 19, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b2313';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 35, 19, 0.2)';
                    }}
                  >
                    <Unlock size={20} />
                    Entrar (Já inscrito)
                  </button>
                </div>
              </>
            ) : (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#d4edda', 
                borderRadius: '8px', 
                border: '1px solid #c3e6cb',
                marginBottom: '24px'
              }}>
                <p style={{ color: '#155724', margin: 0, fontSize: '16px', fontWeight: '500' }}>
                  ✓ Você está inscrito nesta capacitação e tem acesso ao conteúdo completo!
                </p>
              </div>
            )}

            {capacitacao.status === 'concluida' && capacitacao.link_avaliacao && (
              <button
                onClick={() => navigate(`/capacitacao/${capacitacao.link_avaliacao}/avaliacao`)}
                style={{
                  backgroundColor: '#3b2313',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  marginBottom: '24px',
                  boxShadow: '0 2px 4px rgba(59, 35, 19, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a180e';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 35, 19, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b2313';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 35, 19, 0.2)';
                }}
              >
                <Award size={20} style={{ marginRight: '8px', display: 'inline' }} />
                Avaliar Capacitação
              </button>
            )}

            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#3b2313', marginBottom: '16px', fontSize: '18px' }}>Compartilhar</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <QRCodeDisplay
                  value={`${window.location.origin}/capacitacao/${linkInscricao}`}
                  size={200}
                />
              </div>
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>
                Escaneie o QR code para compartilhar esta capacitação
              </p>
            </div>
          </div>
        )}

        {view === 'inscricao' && (
          <FormInscricao
            linkInscricao={linkInscricao!}
            onSuccess={handleInscricaoSucesso}
            onCancel={() => setView('info')}
          />
        )}

        {view === 'entrar' && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '32px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ color: '#3b2313', marginTop: 0, marginBottom: '16px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Unlock size={24} color="#056839" />
              Acessar Conteúdo Completo
            </h2>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
              Informe o email utilizado na sua inscrição para acessar o conteúdo completo e materiais do curso.
            </p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313', fontSize: '14px' }}>
                Email
              </label>
              <input
                type="email"
                value={emailEntrada}
                onChange={(e) => setEmailEntrada(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#056839';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleVerificarInscricao();
                  }
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleVerificarInscricao}
                disabled={verificando}
                style={{
                  backgroundColor: verificando ? '#9ca3af' : '#056839',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  cursor: verificando ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: verificando ? 'none' : '0 2px 4px rgba(5, 104, 57, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!verificando) {
                    e.currentTarget.style.backgroundColor = '#04502d';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!verificando) {
                    e.currentTarget.style.backgroundColor = '#056839';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {verificando ? 'Verificando...' : 'Entrar'}
              </button>
              <button
                onClick={() => {
                  setView('inscricao');
                  setEmailEntrada('');
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#056839',
                  border: '1px solid #056839',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#056839';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#056839';
                }}
              >
                Inscreva-se
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CapacitacaoPublica;
