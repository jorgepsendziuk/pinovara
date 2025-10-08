import { useState, useEffect } from 'react';
import { AbaAtiva } from '../../types/organizacao';
import { useOrganizacaoData } from '../../hooks/useOrganizacaoData';
import { useRepresentanteData } from '../../hooks/useRepresentanteData';
import { useDiagnosticoData } from '../../hooks/useDiagnosticoData';
import { DadosBasicos } from '../../components/organizacoes/DadosBasicos';
import { DadosRepresentanteComponent } from '../../components/organizacoes/DadosRepresentante';
import { CaracteristicasOrganizacao } from '../../components/organizacoes/CaracteristicasOrganizacao';
import { DiagnosticoArea } from '../../components/organizacoes/DiagnosticoArea';
import { PlanoGestao } from '../../components/organizacoes/PlanoGestao';
import { UploadDocumentos } from '../../components/organizacoes/UploadDocumentos';
import {
  Edit,
  Search,
  Building2,
  Users,
  XCircle,
  Loader2,
  Save,
  Target
} from 'lucide-react';

interface EdicaoOrganizacaoProps {
  organizacaoId: number;
  onNavigate: (pagina: string, dados?: any) => void;
}

function EdicaoOrganizacao({ organizacaoId, onNavigate }: EdicaoOrganizacaoProps) {
  
  // Estados principais
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('organizacao');
  const [accordionAberto, setAccordionAberto] = useState<string | null>('dados-basicos');
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    setAccordionAberto(accordionAberto === accordion ? null : accordion);
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
      <div className="accordions-container">
        {organizacao && (
          <>
            <DadosBasicos
              organizacao={organizacao}
              onUpdate={updateOrganizacao}
              accordionAberto={accordionAberto}
              onToggleAccordion={toggleAccordion}
            />
            
            <UploadDocumentos
              organizacaoId={organizacaoId}
              accordionAberto={accordionAberto}
              onToggleAccordion={toggleAccordion}
            />
            
            <DadosRepresentanteComponent
              dados={dadosRepresentante}
              onUpdate={updateRepresentante}
              accordionAberto={accordionAberto}
              onToggleAccordion={toggleAccordion}
            />
            
            <CaracteristicasOrganizacao
              organizacao={organizacao}
              onUpdate={updateOrganizacao}
              accordionAberto={accordionAberto}
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
            <h1><Edit size={24} style={{marginRight: '0.5rem'}} /> Editando Organização</h1>
            <h2>{organizacao.nome || 'Nome não informado'}</h2>
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

          {/* Form Actions */}
          <div className="form-actions">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-success btn-save"
            >
                {saving ? (
                  <>
                    <Loader2 size={16} className="spinning" style={{marginRight: '0.5rem'}} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} style={{marginRight: '0.5rem'}} />
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
