import { useState, useEffect } from 'react';
import { AbaAtiva } from '../../types/organizacao';
import { useOrganizacaoData } from '../../hooks/useOrganizacaoData';
import { useRepresentanteData } from '../../hooks/useRepresentanteData';
import { useDiagnosticoData } from '../../hooks/useDiagnosticoData';
import { DadosBasicos } from '../../components/organizacoes/DadosBasicos';
import { EnderecoLocalizacao } from '../../components/organizacoes/EnderecoLocalizacao';
import { DadosRepresentanteComponent } from '../../components/organizacoes/DadosRepresentante';
import { DiagnosticoArea } from '../../components/organizacoes/DiagnosticoArea';
import { PlanoGestao } from '../../components/organizacoes/PlanoGestao';
import { UploadDocumentos } from '../../components/organizacoes/UploadDocumentos';
import { UploadFotos } from '../../components/organizacoes/UploadFotos';
import { DadosColeta } from '../../components/organizacoes/DadosColeta';
import {
  Edit,
  Search,
  Building2,
  Users,
  XCircle,
  Loader2,
  Save,
  Target,
  ChevronsDown,
  ChevronsUp,
  FileText
} from 'lucide-react';

interface EdicaoOrganizacaoProps {
  organizacaoId: number;
  onNavigate: (pagina: string, dados?: any) => void;
}

function EdicaoOrganizacao({ organizacaoId, onNavigate }: EdicaoOrganizacaoProps) {
  
  // Estados principais
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('organizacao');
  const [accordionsAbertos, setAccordionsAbertos] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // Hooks customizados
  const {
    organizacao,
    loading,
    error,
    updateOrganizacao,
    loadOrganizacao,
    setError
  } = useOrganizacaoData();

  const {
    dadosRepresentante,
    updateRepresentante,
    loadFromOrganizacao: loadRepresentanteFromOrganizacao
  } = useRepresentanteData();

  const {
    governancaOrganizacional,
    gestaoPessoas,
    gestaoFinanceira,
    diagnosticoAberto,
    updateGovernanca,
    updateGestaoPessoas,
    updateGestaoFinanceira,
    toggleDiagnostico,
    loadFromOrganizacao: loadDiagnosticoFromOrganizacao
  } = useDiagnosticoData();

  // Carregar dados inicial
  useEffect(() => {
    if (organizacaoId) {
      loadOrganizacao(organizacaoId);
    }
  }, [organizacaoId, loadOrganizacao]);

  // Sincronizar dados quando organização carrega
  useEffect(() => {
    if (organizacao) {
      loadRepresentanteFromOrganizacao(organizacao);
      loadDiagnosticoFromOrganizacao(organizacao);
    }
  }, [organizacao, loadRepresentanteFromOrganizacao, loadDiagnosticoFromOrganizacao]);

  // Handlers
  const toggleAccordion = (accordion: string) => {
    setAccordionsAbertos(prev => 
      prev.includes(accordion) 
        ? prev.filter(a => a !== accordion)
        : [...prev, accordion]
    );
  };

  const expandirTodos = () => {
    // Abre todos os accordions da aba Organização
    setAccordionsAbertos([
      'dados-basicos',
      'endereco-localizacao',
      'arquivos',
      'fotos',
      'representante',
      'dados-coleta'
    ]);
  };

  const colapsarTodos = () => {
    // Fecha todos os accordions
    setAccordionsAbertos([]);
  };

  const handleGerarRelatorio = async () => {
    if (!organizacao) return;

    setGerandoPDF(true);
    try {
      // Chamar API para gerar PDF
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/relatorio/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('@pinovara:token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      // Baixar PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${organizacao.nome?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Relatório gerado com sucesso!');
    } catch (error: any) {
      alert(`❌ Erro ao gerar relatório: ${error.message}`);
    } finally {
      setGerandoPDF(false);
    }
  };

  const handleSubmit = async () => {
    if (!organizacao) return;

    try {
      setSaving(true);
      setError(null);
      
      // Preparar dados completos
      const dadosCompletos = {
        ...organizacao,
        // Dados do representante
        representante_nome: dadosRepresentante.nome || null,
        representante_cpf: dadosRepresentante.cpf || null,
        representante_rg: dadosRepresentante.rg || null,
        representante_telefone: dadosRepresentante.telefone || null,
        representante_email: dadosRepresentante.email || null,
        representante_end_logradouro: dadosRepresentante.endLogradouro || null,
        representante_end_bairro: dadosRepresentante.endBairro || null,
        representante_end_complemento: dadosRepresentante.endComplemento || null,
        representante_end_numero: dadosRepresentante.endNumero || null,
        representante_end_cep: dadosRepresentante.endCep || null,
        representante_funcao: dadosRepresentante.funcao || null,
        // Dados de diagnóstico
        ...Object.fromEntries(
          Object.entries(governancaOrganizacional).map(([key, value]) => [key, value.resposta || value.comentario || value.proposta])
        ),
        ...Object.fromEntries(
          Object.entries(gestaoPessoas).map(([key, value]) => [key, value.resposta || value.comentario || value.proposta])
        ),
        ...Object.fromEntries(
          Object.entries(gestaoFinanceira).map(([key, value]) => [key, value.resposta || value.comentario || value.proposta])
        ),
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`http://localhost:3001/organizacoes/${organizacao.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosCompletos)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar organização');
      }

      setSuccess('Organização salva com sucesso!');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  };

  // Perguntas REAIS de Governança Organizacional organizadas em sub-acordeões
    const gruposGovernanca = {
    estrutura: [
      { numero: 1, texto: "O empreendimento possui um organograma geral?" },
      { numero: 2, texto: "Este organograma está de acordo com a realidade do empreendimento?" },
      { numero: 3, texto: "Dispõe de documentos com a descrição das atribuições, funções, responsabilidades, requisitos, direitos e deveres?" },
      { numero: 4, texto: "Essas descrições correspondem à realidade da vida organizacional?" }
    ],
    estrategia: [
      { numero: 5, texto: "Possui um Planejamento Estratégico, com missão, visão, valores e objetivos estratégicos (econômicos, financeiros e comerciais)?" },
      { numero: 6, texto: "Este planejamento é implementado, monitorado e avaliado periodicamente?" }
    ],
    organizacao: [
      { numero: 7, texto: "Aplica as normas estatutárias para admissão e exclusão de associados?" },
      { numero: 8, texto: "Na visão da diretoria, os associados confiam na diretoria?" },
      { numero: 9, texto: "A diretoria confia no quadro de associados?" },
      { numero: 10, texto: "O empreendimento possui uma estratégia para lidar com os conflitos e desentendimentos entre a direção e os associados?" },
      { numero: 11, texto: "Os associados se organizam para discutir os problemas e ajudar na tomada de decisão?" },
      { numero: 12, texto: "O empreendimento se utiliza de práticas formalizadas de integração de novos associados?" },
      { numero: 13, texto: "Possui livro de matrícula dos associados atualizado?" }
    ],
    direcao: [
      { numero: 14, texto: "Remunera financeiramente os dirigentes no cumprimento de suas funções (diária, subsídio, salário)?" },
      { numero: 15, texto: "A direção mantém periodicidade em suas reuniões?" },
      { numero: 16, texto: "Além das assembleias, o empreendimento dispõe de outros espaços de participação dos associados nas decisões?" },
      { numero: 17, texto: "O empreendimento dispõe de estratégias definidas para o fortalecimento da participação das mulheres no empreendimento?" },
      { numero: 18, texto: "O empreendimento dispõe de estratégias definidas para o fortalecimento da participação de jovens e idosos no empreendimento?" },
      { numero: 19, texto: "O empreendimento possui instrumentos formais de estímulo da participação dos colaboradores e associados nas tomadas de decisões?" },
      { numero: 20, texto: "Existem comitês consultivos ou setoriais para engajar os membros nas discussões e na formulação de propostas?" },
      { numero: 21, texto: "Existem mecanismos internos claros para mediar e resolver disputas entre os associados e entre os órgãos do empreendimento?" }
    ],
    controle: [
      { numero: 20, texto: "O conselho fiscal é atuante no empreendimento?" },
      { numero: 21, texto: "A direção se reúne periodicamente com o conselho fiscal?" },
      { numero: 22, texto: "A direção tem o hábito de apresentar periodicamente relatórios contábeis, financeiros e administrativos?" },
      { numero: 23, texto: "Realiza assembleias anuais para prestação de contas?" },
      { numero: 24, texto: "Possui mecanismos de controle, monitoramento e avaliação do alcance de objetivos e metas?" },
      { numero: 25, texto: "Há canais para dúvidas e sugestões em relação aos relatórios e informações compartilhados?" }
    ],
    educacao: [
      { numero: 26, texto: "Os cooperados são capacitados em princípios do cooperativismo?" },
      { numero: 27, texto: "Os cooperados são capacitados em gestão de cooperativas?" },
      { numero: 28, texto: "Há planos para identificar, capacitar e preparar novos líderes?" }
    ]
  };

    const gruposGestaoPessoas = {
    capacitacao: [
      { numero: 1, texto: "Existe programa de capacitação dos associados?" },
      { numero: 2, texto: "Os dirigentes participam de cursos de gestão?" }
    ],
    comunicacao: [
      { numero: 3, texto: "A comunicação interna é eficiente?" },
      { numero: 4, texto: "Existe canal de comunicação com associados?" }
    ]
  };

    const gruposGestaoFinanceira = {
    controle: [
      { numero: 1, texto: "Existe controle financeiro formalizado?" },
      { numero: 2, texto: "São elaborados relatórios financeiros?" }
    ],
    planejamento: [
      { numero: 3, texto: "Existe orçamento anual aprovado?" },
      { numero: 4, texto: "O fluxo de caixa é controlado?" }
    ]
  };

  // Renderização das abas
  const renderAbaOrganizacao = () => (
    <div className="aba-content">
      {/* Botões de Ação */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '15px',
        gap: '10px'
      }}>
        {/* Botão Gerar Relatório */}
        <button
          onClick={handleGerarRelatorio}
          disabled={gerandoPDF}
          style={{
            padding: '8px 16px',
            background: gerandoPDF ? '#6c757d' : '#056839',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: gerandoPDF ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => !gerandoPDF && (e.currentTarget.style.background = '#045028')}
          onMouseOut={(e) => !gerandoPDF && (e.currentTarget.style.background = '#056839')}
        >
          <FileText size={16} />
          {gerandoPDF ? 'Gerando PDF...' : 'Gerar Relatório'}
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={colapsarTodos}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#5a6268'}
            onMouseOut={(e) => e.currentTarget.style.background = '#6c757d'}
          >
            <ChevronsUp size={16} />
            Recolher Todos
          </button>
          <button
            onClick={expandirTodos}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <ChevronsDown size={16} />
            Expandir Todos
          </button>
        </div>
      </div>

      <div className="accordions-container">
        {organizacao && (
          <>
            <DadosBasicos
              organizacao={organizacao}
              onUpdate={updateOrganizacao}
              accordionAberto={accordionsAbertos.includes('dados-basicos') ? 'dados-basicos' : null}
              onToggleAccordion={toggleAccordion}
            />
            
            <EnderecoLocalizacao
              organizacao={organizacao}
              onUpdate={updateOrganizacao}
              accordionAberto={accordionsAbertos.includes('endereco-localizacao') ? 'endereco-localizacao' : null}
              onToggleAccordion={toggleAccordion}
            />
            
            <UploadDocumentos
              organizacaoId={organizacaoId}
              accordionAberto={accordionsAbertos.includes('arquivos') ? 'arquivos' : null}
              onToggleAccordion={toggleAccordion}
            />
            
            <UploadFotos
              organizacaoId={organizacaoId}
              accordionAberto={accordionsAbertos.includes('fotos') ? 'fotos' : null}
              onToggleAccordion={toggleAccordion}
            />
            
            <DadosRepresentanteComponent
              dados={dadosRepresentante}
              onUpdate={updateRepresentante}
              accordionAberto={accordionsAbertos.includes('representante') ? 'representante' : null}
              onToggleAccordion={toggleAccordion}
            />
            
            <DadosColeta
              organizacao={organizacao}
              accordionAberto={accordionsAbertos.includes('dados-coleta') ? 'dados-coleta' : null}
              onToggleAccordion={toggleAccordion}
            />
          </>
        )}
      </div>
    </div>
  );

  const renderAbaDiagnostico = () => (
    <div className="aba-content" style={{ width: '100%' }}>
        <div className="diagnostico-container" style={{ 
          width: '100%',
          maxWidth: 'none'
        }}>
        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GOVERNANÇA ORGANIZACIONAL"
          icone={<Building2 size={16} />}
          area="governanca-main"
          dados={governancaOrganizacional}
          perguntas={gruposGovernanca}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGovernanca}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GESTÃO DE PESSOAS"
          icone={<Users size={16} />}
          area="pessoas-main"
          dados={gestaoPessoas}
          perguntas={gruposGestaoPessoas}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGestaoPessoas}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GESTÃO FINANCEIRA"
          icone="💰"
          area="financeira-main"
          dados={gestaoFinanceira}
          perguntas={gruposGestaoFinanceira}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGestaoFinanceira}
        />
      </div>
    </div>
  );

  const renderAbaPlanoGestao = () => (
    <div className="aba-content" style={{ width: '100%' }}>
      <div className="plano-gestao-wrapper" style={{ 
        width: '100%',
        maxWidth: 'none'
      }}>
        <PlanoGestao onUpdate={(dados) => console.log('Dados atualizados:', dados)} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <Loader2 size={16} className="spinning" style={{marginRight: '0.5rem'}} />
          Carregando...
        </div>
      </div>
    );
  }

  if (!organizacao) {
    return (
      <div className="error-container">
        <div className="error-message"><XCircle size={16} style={{marginRight: '0.5rem'}} /> Organização não encontrada</div>
        <button onClick={() => onNavigate('lista')} className="btn btn-primary">
          ← Voltar à Lista
        </button>
      </div>
    );
  }

  return (
    <div className="edicao-organizacao" style={{ 
      width: '100%', 
      maxWidth: 'none',
      margin: 0,
      padding: '1rem'
    }}>
      {/* Header */}
      <div className="edicao-header">
        <div className="header-content">
          <button
            onClick={() => onNavigate('lista')}
            className="btn-back"
          >
            ← Voltar
          </button>
        <div className="header-info">
            <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <Edit size={20} style={{marginRight: '0.5rem'}} /> 
              {organizacao.nome || 'Nome não informado'}
            </h1>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <p>{success}</p>
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="edicao-body">
        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button
            className={`tab-button ${abaAtiva === 'organizacao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('organizacao')}
          >
            <Building2 size={14} style={{marginRight: '0.25rem'}} /> Organização
          </button>
          <button
            className={`tab-button ${abaAtiva === 'diagnostico' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('diagnostico')}
          >
            <Search size={14} style={{marginRight: '0.25rem'}} /> Diagnóstico
          </button>
          <button
            className={`tab-button ${abaAtiva === 'planoGestao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('planoGestao')}
          >
            <Target size={14} style={{marginRight: '0.25rem'}} /> Plano de Gestão
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {abaAtiva === 'organizacao' && renderAbaOrganizacao()}
          {abaAtiva === 'diagnostico' && renderAbaDiagnostico()}
          {abaAtiva === 'planoGestao' && renderAbaPlanoGestao()}

          {/* Form Actions - Botão Flutuante */}
          <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000
          }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: '14px 28px',
                background: saving ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                transition: 'all 0.3s ease',
                transform: saving ? 'scale(0.95)' : 'scale(1)'
              }}
              onMouseOver={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
                }
              }}
            >
                {saving ? (
                  <>
                    <Loader2 size={18} className="spinning" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar Alterações
                  </>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EdicaoOrganizacao;
