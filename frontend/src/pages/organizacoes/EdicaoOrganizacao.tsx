import { useState, useEffect } from 'react';
import { AbaAtiva } from '../../types/organizacao';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganizacaoData } from '../../hooks/useOrganizacaoData';
import { useRepresentanteData } from '../../hooks/useRepresentanteData';
import { useDiagnosticoData } from '../../hooks/useDiagnosticoData';
import { DadosBasicos } from '../../components/organizacoes/DadosBasicos';
import { EnderecoLocalizacao } from '../../components/organizacoes/EnderecoLocalizacao';
import CaracteristicasAssociados from '../../components/organizacoes/CaracteristicasAssociados';
import AbrangenciaGeografica from '../../components/organizacoes/AbrangenciaGeografica';
import AssociadosJuridicos from '../../components/organizacoes/AssociadosJuridicos';
import DadosProducao from '../../components/organizacoes/DadosProducao';
import { DadosRepresentanteComponent } from '../../components/organizacoes/DadosRepresentante';
import { DiagnosticoArea } from '../../components/organizacoes/DiagnosticoArea';
import { PlanoGestao } from '../../components/organizacoes/PlanoGestao';
import { UploadDocumentos } from '../../components/organizacoes/UploadDocumentos';
import { UploadFotos } from '../../components/organizacoes/UploadFotos';
import { DadosColeta } from '../../components/organizacoes/DadosColeta';
import Validacao from '../../components/organizacoes/Validacao';
import { DescricaoOrganizacao } from '../../components/organizacoes/DescricaoOrganizacao';
import { OrientacoesTecnicas } from '../../components/organizacoes/OrientacoesTecnicas';
import { IndicadoresAtividade } from '../../components/organizacoes/IndicadoresAtividade';
import { ParticipantesAtividade } from '../../components/organizacoes/ParticipantesAtividade';
import { ObservacoesFinais } from '../../components/organizacoes/ObservacoesFinais';
import Toast from '../../components/Toast';
import api from '../../services/api';
import {
  Edit,
  Search,
  Building2,
  Users,
  DollarSign,
  XCircle,
  Loader2,
  Save,
  Target,
  ChevronsDown,
  FileText,
  MapPin,
  Network,
  Wheat,
  IdCard,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Factory,
  Lightbulb,
  Leaf,
  Building,
  Plus,
  Calendar,
  User,
  Clock,
  PenTool
} from 'lucide-react';
import '../../styles/tabs.css';

interface EdicaoOrganizacaoProps {
  organizacaoId?: number; // Opcional - se não fornecido, modo criação
  onNavigate: (pagina: string, dados?: any) => void;
}

function EdicaoOrganizacao({ organizacaoId, onNavigate }: EdicaoOrganizacaoProps) {
  
  // Verificação de permissão
  const { isCoordinator, isSupervisor } = useAuth();
  
  // Bloquear acesso para supervisores
  if (isSupervisor()) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '60px auto',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px'
      }}>
        <AlertCircle size={64} color="#856404" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#856404', marginBottom: '16px' }}>Acesso Não Permitido</h2>
        <p style={{ color: '#856404', marginBottom: '24px', fontSize: '16px' }}>
          Usuários com perfil de <strong>Supervisão</strong> podem visualizar organizações mas não podem editá-las.
        </p>
        <button 
          onClick={() => onNavigate('lista')}
          style={{
            padding: '10px 20px',
            background: '#056839',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Voltar para Lista
        </button>
      </div>
    );
  }
  
  // Detectar modo: criação ou edição
  const isModoCriacao = !organizacaoId;
  
  // Estados principais
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('identificacao');
  const [accordionsAbertos, setAccordionsAbertos] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // Hooks customizados
  const {
    organizacao,
    loading,
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
    gestaoComercial,
    gestaoProcessos,
    gestaoInovacao,
    gestaoSocioambiental,
    infraestruturaSustentavel,
    diagnosticoAberto,
    updateGovernanca,
    updateGestaoPessoas,
    updateGestaoFinanceira,
    updateGestaoComercial,
    updateGestaoProcessos,
    updateGestaoInovacao,
    updateGestaoSocioambiental,
    updateInfraestruturaSustentavel,
    toggleDiagnostico,
    loadFromOrganizacao: loadDiagnosticoFromOrganizacao
  } = useDiagnosticoData();

  // Proteção: coordenador não pode criar organizações
  if (isModoCriacao && isCoordinator()) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '4rem auto',
        padding: '3rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <AlertCircle size={40} color="white" style={{ opacity: 0.7 }} />
        </div>
        <h2 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Acesso Restrito
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Como <strong>{isSupervisor() ? 'supervisor' : 'coordenador'}</strong>, você pode visualizar organizações, 
          mas não tem permissão para criar novos cadastros.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onNavigate('lista')} 
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem' }}
          >
            Ver Lista de Organizações
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="btn"
            style={{ padding: '0.75rem 2rem', background: '#6b7280', color: 'white', border: 'none' }}
          >
            Ver Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Carregar dados inicial (apenas em modo edição)
  useEffect(() => {
    if (organizacaoId) {
      loadOrganizacao(organizacaoId);
    } else if (isModoCriacao) {
      // Em modo criação, inicializar com objeto vazio
      updateOrganizacao('nome', '');
    }
  }, [organizacaoId, loadOrganizacao, isModoCriacao, updateOrganizacao]);

  // Sincronizar dados quando organização carrega
  useEffect(() => {
    if (organizacao && !isModoCriacao) {
      loadRepresentanteFromOrganizacao(organizacao);
      loadDiagnosticoFromOrganizacao(organizacao);
    }
  }, [organizacao, loadRepresentanteFromOrganizacao, loadDiagnosticoFromOrganizacao, isModoCriacao]);

  // Handlers
  const toggleAccordion = (accordion: string) => {
    setAccordionsAbertos(prev => 
      prev.includes(accordion) 
        ? prev.filter(a => a !== accordion)
        : [...prev, accordion]
    );
  };

  const expandirTodos = () => {
    // Abre todos os accordions da aba atual
    if (abaAtiva === 'identificacao') {
      setAccordionsAbertos([
        'dados-basicos',
        'endereco-localizacao',
        'arquivos',
        'fotos',
        'assinaturas',
        'representante',
        'dados-coleta'
      ]);
    } else if (abaAtiva === 'complementos') {
      setAccordionsAbertos([
        'descricao',
        'orientacoes-tecnicas',
        'indicadores',
        'participantes',
        'observacoes'
      ]);
    } else {
      setAccordionsAbertos([]);
    }
  };

  const colapsarTodos = () => {
    // Fecha todos os accordions
    setAccordionsAbertos([]);
  };

  const handleGerarRelatorio = async () => {
    if (!organizacao || !organizacaoId) return;

    setGerandoPDF(true);
    try {
      // Chamar API para gerar PDF
      const response = await api.get(`/organizacoes/${organizacaoId}/relatorio/pdf`, {
        responseType: 'blob'
      });

      // Baixar PDF
      const blob = response.data;
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
      const errorMsg = error.response?.data?.error?.message || error.message || 'Erro desconhecido';
      alert(`❌ Erro ao gerar relatório: ${errorMsg}`);
    } finally {
      setGerandoPDF(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Em modo criação, validar se tem nome
      if (isModoCriacao && (!organizacao?.nome || organizacao.nome.trim() === '')) {
        setToastError('Por favor, preencha o nome da organização');
        setSaving(false);
        return;
      }
      
      // Preparar dados completos
      const dadosBrutos = {
        ...(organizacao || {}),
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
      };

      // Processar dados de diagnóstico - extrair apenas os valores corretos
      const processarDiagnostico = (diagnostico: any) => {
        const resultado: any = {};
        Object.entries(diagnostico).forEach(([chave, valor]: [string, any]) => {
          if (valor && typeof valor === 'object') {
            resultado[chave] = valor.resposta || valor.comentario || valor.proposta || null;
          }
        });
        return resultado;
      };

      // Adicionar dados de diagnóstico processados
      Object.assign(dadosBrutos, processarDiagnostico(governancaOrganizacional));
      Object.assign(dadosBrutos, processarDiagnostico(gestaoPessoas));
      Object.assign(dadosBrutos, processarDiagnostico(gestaoFinanceira));
      Object.assign(dadosBrutos, processarDiagnostico(gestaoComercial));
      Object.assign(dadosBrutos, processarDiagnostico(gestaoProcessos));
      Object.assign(dadosBrutos, processarDiagnostico(gestaoInovacao));
      Object.assign(dadosBrutos, processarDiagnostico(gestaoSocioambiental));
      Object.assign(dadosBrutos, processarDiagnostico(infraestruturaSustentavel));

      // Converter todos os campos de resposta para inteiro
      const dadosCompletos = Object.fromEntries(
        Object.entries(dadosBrutos).map(([key, value]) => {
          // Se for campo de resposta e tiver valor string, converter para número
          if (key.endsWith('_resposta') && typeof value === 'string' && value !== '') {
            return [key, parseInt(value) || null];
          }
          return [key, value];
        })
      );

      console.log('Dados sendo enviados:', dadosCompletos);
      console.log('Modo:', isModoCriacao ? 'CRIAÇÃO' : 'EDIÇÃO');

      let response;
      
      if (isModoCriacao) {
        // CRIAR nova organização
        response = await api.post('/organizacoes', dadosCompletos);
        
        if (!response.data.success) {
          throw new Error(response.data.error?.message || 'Erro ao criar organização');
        }

        setSuccess('Organização criada com sucesso!');
        
        // Redirecionar para edição da organização recém-criada
        const novaOrganizacaoId = response.data.data?.id;
        if (novaOrganizacaoId) {
          setTimeout(() => {
            onNavigate('edicao', novaOrganizacaoId);
          }, 1500);
        }
      } else {
        // ATUALIZAR organização existente
        response = await api.put(`/organizacoes/${organizacao?.id}`, dadosCompletos);

        if (!response.data.success) {
          throw new Error(response.data.error?.message || 'Erro ao atualizar organização');
        }

        setSuccess('Organização atualizada com sucesso!');
      }

      setToastError(null); // Limpar erro anterior se houver
      
    } catch (err: any) {
      console.error('Erro completo ao salvar:', err);
      
      // Tentar extrair informações detalhadas do erro
      let errorMessage = 'Erro desconhecido ao salvar organização';
      let fieldErrors: string[] = [];
      
      if (err.response?.data?.error) {
        const errorData = err.response.data.error;
        errorMessage = errorData.message || errorMessage;
        
        // Se houver details, pode conter informações sobre campos específicos
        if (errorData.details) {
          if (typeof errorData.details === 'string') {
            fieldErrors.push(errorData.details);
          } else if (Array.isArray(errorData.details)) {
            fieldErrors = errorData.details;
          } else if (typeof errorData.details === 'object') {
            // Extrair campos do objeto de erros
            fieldErrors = Object.entries(errorData.details).map(
              ([campo, erro]) => `${campo}: ${erro}`
            );
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Verificar se é erro de validação do Prisma ou banco de dados
      if (err.response?.data?.error?.code) {
        const code = err.response.data.error.code;
        
        // Códigos comuns de erro do PostgreSQL/Prisma
        if (code === 'P2002') {
          errorMessage = 'Erro: Já existe uma organização com estes dados (CNPJ ou nome duplicado)';
        } else if (code === 'P2003') {
          errorMessage = 'Erro: Referência inválida (verifique Estado, Município ou outros campos relacionados)';
        } else if (code === 'P2025') {
          errorMessage = 'Erro: Organização não encontrada';
        }
      }
      
      // Montar mensagem final com detalhes dos campos
      let finalMessage = errorMessage;
      if (fieldErrors.length > 0) {
        finalMessage += '\n\nDetalhes dos erros:\n' + fieldErrors.map(e => `• ${e}`).join('\n');
      }
      
      // Tentar identificar campos problemáticos a partir da mensagem de erro
      const camposMapeados: Record<string, string> = {
        'nome': 'Nome da Organização',
        'cnpj': 'CNPJ',
        'estado': 'Estado',
        'municipio': 'Município',
        'telefone': 'Telefone',
        'email': 'E-mail',
        'data_fundacao': 'Data de Fundação',
        'data_visita': 'Data de Visita',
        'representante': 'Nome do Representante',
        'representante_cpf': 'CPF do Representante',
        'representante_email': 'E-mail do Representante',
        'id_tecnico': 'Técnico Responsável'
      };
      
      // Verificar se algum campo conhecido está na mensagem de erro
      const camposEncontrados: string[] = [];
      Object.entries(camposMapeados).forEach(([campo, label]) => {
        if (errorMessage.toLowerCase().includes(campo.toLowerCase())) {
          camposEncontrados.push(label);
        }
      });
      
      if (camposEncontrados.length > 0) {
        finalMessage += `\n\n📋 Campo(s) com problema: ${camposEncontrados.join(', ')}`;
      }
      
      setToastError(finalMessage);
      setError(finalMessage);
      setSuccess(null); // Limpar sucesso anterior se houver
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
      { numero: 22, texto: "O conselho fiscal é atuante no empreendimento?" },
      { numero: 23, texto: "A direção se reúne periodicamente com o conselho fiscal?" },
      { numero: 24, texto: "A direção tem o hábito de apresentar periodicamente relatórios contábeis, financeiros e administrativos?" },
      { numero: 25, texto: "Realiza assembleias anuais para prestação de contas?" },
      { numero: 26, texto: "Possui mecanismos de controle, monitoramento e avaliação do alcance de objetivos e metas?" },
      { numero: 27, texto: "Há canais para dúvidas e sugestões em relação aos relatórios e informações compartilhados?" }
    ],
    educacao: [
      { numero: 28, texto: "Os cooperados/associados são capacitados em cooperativismo/associativismo?" },
      { numero: 29, texto: "Os cooperados/associados são capacitados em Gestão do Empreendimento?" },
      { numero: 30, texto: "Há planos para identificar, capacitar e preparar novos líderes?" }
    ]
  };

    const gruposGestaoPessoas = {
    p_organizacao: [
      { numero: 1, texto: "Possui descrição formalizada de cargos, funções e atividades?" },
      { numero: 2, texto: "As relações de trabalho encontram-se formalizadas?" },
      { numero: 3, texto: "Utiliza critérios padronizados de recrutamento e seleção?" },
      { numero: 4, texto: "Possui critérios claramente definidos para demissão?" },
      { numero: 5, texto: "Dispõe de horários de trabalho estabelecidos e respeitados?" },
      { numero: 6, texto: "Possui controle de horas voluntárias dedicadas?" },
      { numero: 7, texto: "Possui controle sobre ausências ou atrasos?" },
      { numero: 8, texto: "Realiza avaliação de desempenho dos colaboradores?" },
      { numero: 9, texto: "Utiliza práticas de reconhecimento e incentivo com base no desempenho?" }
    ],
    p_desenvolvimento: [
      { numero: 10, texto: "Possui procedimento de identificação de necessidades de capacitação?" },
      { numero: 11, texto: "Possui um planejamento de capacitação e desenvolvimento?" },
      { numero: 12, texto: "Realiza capacitação relacionada às atividades operacionais?" },
      { numero: 13, texto: "Realiza capacitação relacionada a novas ou futuras atividades?" }
    ],
    trabalho: [
      { numero: 14, texto: "Possui PCMSO e PPRA?" },
      { numero: 15, texto: "Monitora acidentes, taxas de frequência/gravidade e absenteísmo?" },
      { numero: 16, texto: "Realiza pesquisa de satisfação ou de clima organizacional?" },
      { numero: 17, texto: "Possui método para identificar necessidades e expectativas dos colaboradores?" }
    ],
    geracao: [
      { numero: 18, texto: "Possui estratégia para favorecer participação de mulheres e jovens?" },
      { numero: 19, texto: "Existe equilíbrio no número de homens, mulheres, jovens e idosos?" },
      { numero: 20, texto: "Existe equilíbrio na repartição dos benefícios?" }
    ]
  };

    const gruposGestaoFinanceira = {
    balanco: [
      { numero: 1, texto: "Possui contabilidade realizada por um contador?" },
      { numero: 2, texto: "Possui Balanço Patrimonial atualizado?" },
      { numero: 3, texto: "Realiza Análise de Balanço?" },
      { numero: 4, texto: "Utiliza Balancetes Mensais para orientação financeira?" }
    ],
    contas: [
      { numero: 5, texto: "Possui sistema/programa informatizado para gestão?" },
      { numero: 6, texto: "Possui algum tipo de Plano Orçamentário?" },
      { numero: 7, texto: "Possui metas financeiras?" },
      { numero: 8, texto: "Possui controle e registro dos valores a receber?" },
      { numero: 9, texto: "Possui controle de obrigações perante fornecedores?" },
      { numero: 10, texto: "Possui controle de obrigações perante colaboradores?" },
      { numero: 11, texto: "Possui controle de obrigações perante o fisco?" },
      { numero: 12, texto: "Possui controle de obrigações perante associados fornecedores?" },
      { numero: 13, texto: "Possui controle de pagamento de empréstimos e financiamentos?" }
    ],
    caixa: [
      { numero: 14, texto: "Possui controle de caixa (DFC)?" },
      { numero: 15, texto: "Possui controle do dinheiro e caixa documental?" },
      { numero: 16, texto: "Possui controle da conta no banco?" }
    ],
    estoque: [
      { numero: 17, texto: "Possui controle periódico físico e financeiro dos estoques?" },
      { numero: 18, texto: "Possui procedimentos de controle de compras?" },
      { numero: 19, texto: "Possui procedimentos de pesquisa de mercado antes das compras?" }
    ],
    resultado: [
      { numero: 20, texto: "Possui Demonstração de Resultado?" },
      { numero: 21, texto: "Utiliza a Demonstração de Resultado para orientação financeira?" }
    ],
    analise: [
      { numero: 22, texto: "Elaborou a Análise de Viabilidade Econômica (AVE)?" },
      { numero: 23, texto: "Vem utilizando as orientações da AVE?" },
      { numero: 24, texto: "A AVE vem sendo atualizada?" }
    ],
    fiscal: [
      { numero: 25, texto: "Está cumprindo com todas as obrigações legais e fiscais?" },
      { numero: 26, texto: "Atualiza frequentemente a relação de obrigações legais e fiscais?" }
    ]
  };

  const gruposGestaoComercial = {
    e_comercial: [
      { numero: 1, texto: "Dispõe de um setor comercial?" },
      { numero: 2, texto: "O setor comercial possui informações técnicas dos produtos?" },
      { numero: 3, texto: "Dispõe de profissional/equipe responsável pelas vendas?" },
      { numero: 4, texto: "Este profissional tem orientação/treinamento específico para vendas?" },
      { numero: 5, texto: "O representante comercial tem treinamento sobre os produtos?" },
      { numero: 6, texto: "Possui sistema de controle das vendas?" },
      { numero: 7, texto: "O setor comercial conhece a capacidade de oferta?" },
      { numero: 8, texto: "Possui banco de informações sobre clientes e fornecedores?" },
      { numero: 9, texto: "Emite ou está apto a emitir nota fiscal eletrônica?" }
    ],
    mercado: [
      { numero: 10, texto: "O negócio possui diferencial em termos de sustentabilidade?" },
      { numero: 11, texto: "Atua em mercados verdes ou outros mercados específicos?" },
      { numero: 12, texto: "Possui produtos diferenciados do ponto de vista ambiental?" },
      { numero: 13, texto: "Possui relação comercial com mercado justo e solidário?" },
      { numero: 14, texto: "Os preços de produtos diferenciados são favoráveis?" },
      { numero: 15, texto: "Se atualiza sobre exigências dos mercados verdes?" }
    ],
    comercial: [
      { numero: 16, texto: "Adota estratégias comerciais definidas?" },
      { numero: 17, texto: "Os produtos/empreendimento possuem marca comercial?" },
      { numero: 18, texto: "Realiza ou utiliza pesquisa/estudo de mercado?" },
      { numero: 19, texto: "Conhece os concorrentes e acompanha preços?" },
      { numero: 20, texto: "Possui plano de marketing?" },
      { numero: 21, texto: "O marketing contribui para estratégias e aumento de vendas?" }
    ],
    modelo: [
      { numero: 22, texto: "Existe regularidade nas vendas, com contratos permanentes?" },
      { numero: 23, texto: "Possui Modelo de Negócio definido?" },
      { numero: 24, texto: "Vem utilizando o Modelo de Negócio para inserção no mercado?" },
      { numero: 25, texto: "A direção tem clareza da proposta de valor?" },
      { numero: 26, texto: "O negócio contribui para aumento da renda dos associados?" },
      { numero: 27, texto: "Possui Plano de Negócios elaborado?" },
      { numero: 28, texto: "O Plano de Negócios vem sendo utilizado?" }
    ]
  };

  const gruposGestaoProcessos = {
    reg_sanitaria: [
      { numero: 1, texto: "Possui registro sanitário competente?" },
      { numero: 2, texto: "Os produtos possuem registro?" },
      { numero: 3, texto: "Os rótulos possuem registro?" }
    ],
    planejamento: [
      { numero: 4, texto: "Realiza planejamento da produção?" },
      { numero: 5, texto: "Possui planilha de custos de produção?" },
      { numero: 6, texto: "Há levantamento de demandas/exigências dos mercados?" }
    ],
    logistica: [
      { numero: 7, texto: "Possui local específico para armazenamento de suprimentos?" },
      { numero: 8, texto: "Essas instalações têm dimensões e condições adequadas?" },
      { numero: 9, texto: "Dispõe de controle para recebimento e estocagem?" },
      { numero: 10, texto: "Possui local específico para armazenamento de produtos finais?" },
      { numero: 11, texto: "Este local tem dimensões e condições adequadas?" },
      { numero: 12, texto: "Possui estrutura adequada para transporte e distribuição?" }
    ],
    valor: [
      { numero: 13, texto: "Utiliza o mapeamento da cadeia de valor?" },
      { numero: 14, texto: "O mapeamento contempla as relações sociais?" },
      { numero: 15, texto: "Há avaliação de quanto o mapeamento contribui para o desempenho?" }
    ],
    fluxo: [
      { numero: 16, texto: "Possui um leiaute dos processos produtivos?" },
      { numero: 17, texto: "O leiaute é monitorado para melhorar a produção?" },
      { numero: 18, texto: "O leiaute é monitorado para melhorar o beneficiamento?" },
      { numero: 19, texto: "O leiaute é monitorado para melhorar a rotulagem?" },
      { numero: 20, texto: "O leiaute é monitorado para melhorar a embalagem?" },
      { numero: 21, texto: "Possui fluxos de produção, beneficiamento, rotulagem e embalagem?" },
      { numero: 22, texto: "O fluxo de produção está integrado com o leiaute?" }
    ],
    qualidade: [
      { numero: 23, texto: "Realiza controle de qualidade dos produtos?" },
      { numero: 24, texto: "Este controle atende aos padrões pré-estabelecidos?" },
      { numero: 25, texto: "Testa os produtos antes da comercialização?" },
      { numero: 26, texto: "Rótulos e etiquetas atendem padrões da legislação?" },
      { numero: 27, texto: "Rótulos são coerentes com estratégia de marketing?" },
      { numero: 28, texto: "Rótulos estão de acordo com mercados a serem atingidos?" }
    ],
    producao: [
      { numero: 29, texto: "Os bens de produção estão atendendo as necessidades?" }
    ]
  };

  const gruposGestaoInovacao = {
    iic: [
      { numero: 1, texto: "O empreendimento adota algum esforço para inovar?" },
      { numero: 2, texto: "As informações são obtidas externamente e compartilhadas?" },
      { numero: 3, texto: "É promovido ambiente favorável ao surgimento de ideias criativas?" },
      { numero: 4, texto: "São analisadas e selecionadas as ideias de inovação?" },
      { numero: 5, texto: "Os dirigentes apoiam a experimentação de novas ideias?" }
    ],
    mar: [
      { numero: 6, texto: "A implementação da inovação é acompanhada?" },
      { numero: 7, texto: "É promovida a aprendizagem sobre o processo inovativo?" },
      { numero: 8, texto: "São reconhecidos pelas contribuições à inovação?" },
      { numero: 9, texto: "São capacitados para a inovação e Gestão da Inovação?" }
    ],
    time: [
      { numero: 10, texto: "O trabalho em equipe é estimulado para inovação?" },
      { numero: 11, texto: "As inovações são divulgadas para as partes interessadas?" },
      { numero: 12, texto: "São avaliados os benefícios da implementação da inovação?" },
      { numero: 13, texto: "Existe iniciativa voltada para inovação sustentável/verde?" },
      { numero: 14, texto: "Existe iniciativa voltada para inovação social ou frugal?" }
    ]
  };

  const gruposGestaoSocioambiental = {
    socioambiental: [
      { numero: 1, texto: "Adota alguma prática voltada às questões ambientais?" },
      { numero: 2, texto: "Faz utilização de materiais sustentáveis?" },
      { numero: 3, texto: "Possui incentivo para mobilidade sustentável?" },
      { numero: 4, texto: "Adota estratégia para garantir sustentabilidade ambiental da produção?" },
      { numero: 5, texto: "Possui estratégia para justa repartição de benefícios da biodiversidade?" }
    ],
    ambiental: [
      { numero: 6, texto: "Faz valoração dos recursos naturais utilizados?" },
      { numero: 7, texto: "Possui integração promovendo bem-estar e biodiversidade?" },
      { numero: 8, texto: "Considera reconfiguração de espaços para prolongar vida útil?" },
      { numero: 9, texto: "Esta valoração é utilizada nas estratégias?" }
    ],
    reg_ambiental: [
      { numero: 10, texto: "Possui licença ou autorização ambiental?" },
      { numero: 11, texto: "As áreas possuem Plano de Manejo aprovado?" },
      { numero: 12, texto: "Há planos de Manejo autorizando extração de espécies?" },
      { numero: 13, texto: "Existe área de preservação no entorno que possa ser afetada?" },
      { numero: 14, texto: "As áreas possuem CAR?" }
    ],
    impactos_ambiental: [
      { numero: 15, texto: "A direção identifica com clareza os impactos negativos?" },
      { numero: 16, texto: "Adota política para minimizar esses impactos?" },
      { numero: 17, texto: "A direção identifica com clareza os impactos positivos?" },
      { numero: 18, texto: "Faz correta destinação dos resíduos e efluentes?" },
      { numero: 19, texto: "Realiza práticas para reduzir, reutilizar e reciclar?" },
      { numero: 20, texto: "Possui plano de redução no consumo de energia?" },
      { numero: 21, texto: "As edificações têm planejamento de ciclo de vida?" },
      { numero: 22, texto: "As instalações físicas estão em área adequada?" }
    ]
  };

  const gruposInfraestruturaSustentavel = {
    eficiencia_energetica: [
      { numero: 1, texto: "Possui/planeja painéis solares fotovoltaicos?" },
      { numero: 2, texto: "A orientação do edifício foi planejada para aproveitar luz natural?" },
      { numero: 3, texto: "Utiliza/planeja sensores de presença e automação?" },
      { numero: 4, texto: "As fachadas incorporam elementos de sombreamento?" }
    ],
    recursos_naturais: [
      { numero: 5, texto: "Há aproveitamento de ventilação cruzada natural?" },
      { numero: 6, texto: "Há valorização dos sombreamentos vegetais?" },
      { numero: 7, texto: "A topografia é utilizada para conforto térmico?" },
      { numero: 8, texto: "Há aberturas estratégicas para luz natural?" }
    ],
    agua: [
      { numero: 9, texto: "Há sistemas de captação de água da chuva?" },
      { numero: 10, texto: "Há reutilização de águas cinzas?" }
    ],
    conforto_ambiental: [
      { numero: 11, texto: "Há utilização de materiais com bom isolamento térmico?" },
      { numero: 12, texto: "Há utilização de materiais com bom isolamento acústico?" },
      { numero: 13, texto: "Há exploração da ventilação cruzada e exaustão natural?" },
      { numero: 14, texto: "Há uso de iluminação natural e/ou vidros de controle solar?" }
    ],
    residuos: [
      { numero: 15, texto: "Há espaços adequados para separação de resíduos orgânicos?" },
      { numero: 16, texto: "Há espaços adequados para separação de recicláveis?" },
      { numero: 17, texto: "A compostagem é utilizada como adubo orgânico?" },
      { numero: 18, texto: "Há práticas que minimizem geração de resíduos?" }
    ]
  };

  // Renderização das abas
  const renderAbaIdentificacao = () => (
    <div className="aba-content">
      {/* Botões de Ação - Expandir/Recolher */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '15px',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={colapsarTodos}
            style={{
              padding: '8px 16px',
              background: 'white',
              color: '#3b2313',
              border: '1px solid #d1d5db',
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
            <ChevronsDown size={16} />
            Recolher Todos
          </button>
          <button
            onClick={expandirTodos}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #3b2313 0%, #056839 100%)',
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
            
            {/* Upload de documentos e fotos apenas em modo edição */}
            {!isModoCriacao && organizacaoId && (
              <>
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
                
                {/* Assinaturas - Em manutenção */}
                <div className="accordion-item" style={{ opacity: 0.6 }}>
                  <div className="accordion-header" style={{ background: '#f8f9fa', color: '#6c757d', cursor: 'not-allowed' }}>
                    <h3>
                      <PenTool size={20} />
                      <span>Assinaturas (Em Manutenção)</span>
                    </h3>
                    <div style={{ fontSize: '12px', color: '#dc3545', fontWeight: '600' }}>
                      🔧 EM DESENVOLVIMENTO
                    </div>
                  </div>
                </div>
              </>
            )}
            
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

  const renderAbaCaracteristicas = () => (
    <div className="aba-content" style={{ width: '100%' }}>
      {organizacao && (
        <CaracteristicasAssociados
          organizacao={organizacao}
          onUpdate={updateOrganizacao}
        />
      )}
    </div>
  );

  const renderAbaAbrangencia = () => (
    <div className="aba-content" style={{ width: '100%' }}>
      {organizacao && organizacaoId && (
        <AbrangenciaGeografica
          organizacaoId={organizacaoId}
          nTotalSocios={organizacao.caracteristicas_n_total_socios}
        />
      )}
      {isModoCriacao && (
        <div className="info-message">
          <p>✏️ Abrangência geográfica estará disponível após criar a organização.</p>
        </div>
      )}
    </div>
  );

  const renderAbaAssociadosJuridicos = () => (
    <div className="aba-content" style={{ width: '100%' }}>
      {organizacaoId && <AssociadosJuridicos organizacaoId={organizacaoId} />}
      {isModoCriacao && (
        <div className="info-message">
          <p>✏️ Associados jurídicos estarão disponíveis após criar a organização.</p>
        </div>
      )}
    </div>
  );

  const renderAbaProducao = () => (
    <div className="aba-content" style={{ width: '100%' }}>
      {organizacaoId && <DadosProducao organizacaoId={organizacaoId} />}
      {isModoCriacao && (
        <div className="info-message">
          <p>✏️ Dados de produção estarão disponíveis após criar a organização.</p>
        </div>
      )}
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
          icone={<Building2 size={20} />}
          area="governanca-main"
          dados={governancaOrganizacional}
          perguntas={gruposGovernanca}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGovernanca}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GESTÃO DE PESSOAS"
          icone={<Users size={20} />}
          area="pessoas-main"
          dados={gestaoPessoas}
          perguntas={gruposGestaoPessoas}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGestaoPessoas}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GESTÃO FINANCEIRA"
          icone={<DollarSign size={20} />}
          area="financeira-main"
          dados={gestaoFinanceira}
          perguntas={gruposGestaoFinanceira}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGestaoFinanceira}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GESTÃO COMERCIAL"
          icone={<ShoppingCart size={20} />}
          area="comercial-main"
          dados={gestaoComercial}
          perguntas={gruposGestaoComercial}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGestaoComercial}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GESTÃO DE PROCESSOS PRODUTIVOS"
          icone={<Factory size={20} />}
          area="processos-main"
          dados={gestaoProcessos}
          perguntas={gruposGestaoProcessos}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGestaoProcessos}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GESTÃO DA INOVAÇÃO"
          icone={<Lightbulb size={20} />}
          area="inovacao-main"
          dados={gestaoInovacao}
          perguntas={gruposGestaoInovacao}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGestaoInovacao}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: GESTÃO SOCIOAMBIENTAL"
          icone={<Leaf size={20} />}
          area="socioambiental-main"
          dados={gestaoSocioambiental}
          perguntas={gruposGestaoSocioambiental}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateGestaoSocioambiental}
        />

        <DiagnosticoArea
          titulo="ÁREA GERENCIAL: INFRAESTRUTURA SUSTENTÁVEL"
          icone={<Building size={20} />}
          area="infraestrutura-main"
          dados={infraestruturaSustentavel}
          perguntas={gruposInfraestruturaSustentavel}
          diagnosticoAberto={diagnosticoAberto}
          onToggle={toggleDiagnostico}
          onUpdate={updateInfraestruturaSustentavel}
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

  const renderAbaValidacao = () => (
    <div className="aba-content">
      {organizacaoId && (
        <Validacao
          organizacaoId={organizacaoId}
          validacaoStatus={organizacao?.validacao_status || null}
          validacaoUsuario={organizacao?.validacao_usuario || null}
          validacaoData={organizacao?.validacao_data ? new Date(organizacao.validacao_data) : null}
          validacaoObs={organizacao?.validacao_obs || null}
          validacaoUsuarioNome={(organizacao as any)?.users?.name || null}
          onUpdate={updateOrganizacao}
        />
      )}
      {isModoCriacao && (
        <div className="info-message">
          <p>✏️ Validação estará disponível após criar a organização.</p>
        </div>
      )}
    </div>
  );

  const renderAbaComplementos = () => (
    <div className="aba-content">
      {/* Controles de Expandir/Colapsar */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={colapsarTodos}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              background: 'white',
              color: '#3b2313',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <ChevronsDown size={16} />
            Recolher Todos
          </button>
          <button
            onClick={expandirTodos}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #3b2313 0%, #056839 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              transition: 'all 0.2s'
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
            <DescricaoOrganizacao
              organizacao={organizacao}
              onUpdate={updateOrganizacao}
              accordionAberto={accordionsAbertos.includes('descricao') ? 'descricao' : null}
              onToggleAccordion={toggleAccordion}
            />
            
            <OrientacoesTecnicas
              organizacao={organizacao}
              onUpdate={updateOrganizacao}
              accordionAberto={accordionsAbertos.includes('orientacoes-tecnicas') ? 'orientacoes-tecnicas' : null}
              onToggleAccordion={toggleAccordion}
            />
            
            {organizacaoId && (
              <>
                <IndicadoresAtividade
                  organizacaoId={organizacaoId}
                  accordionAberto={accordionsAbertos.includes('indicadores') ? 'indicadores' : null}
                  onToggleAccordion={toggleAccordion}
                />
                
                <ParticipantesAtividade
                  organizacaoId={organizacaoId}
                  organizacao={organizacao}
                  onUpdate={updateOrganizacao}
                  accordionAberto={accordionsAbertos.includes('participantes') ? 'participantes' : null}
                  onToggleAccordion={toggleAccordion}
                />
              </>
            )}
            
            <ObservacoesFinais
              organizacao={organizacao}
              onUpdate={updateOrganizacao}
              accordionAberto={accordionsAbertos.includes('observacoes') ? 'observacoes' : null}
              onToggleAccordion={toggleAccordion}
            />
          </>
        )}
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

  // Mensagem amigável para coordenadores
  if (isCoordinator()) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '4rem auto',
        padding: '3rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <AlertCircle size={40} color="white" />
        </div>
        <h2 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Acesso Somente Leitura
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Como <strong>coordenador</strong>, você pode visualizar todas as organizações e gerar relatórios, 
          mas não tem permissão para criar ou editar cadastros.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onNavigate('lista')} 
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem' }}
          >
            Ver Lista de Organizações
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="btn"
            style={{ padding: '0.75rem 2rem', background: '#6b7280' }}
          >
            Ver Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Em modo edição, verificar se organização foi carregada
  if (!isModoCriacao && !organizacao && !loading) {
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
      {/* Toast de Sucesso */}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
          persistent={true}
        />
      )}

      {/* Toast de Erro */}
      {toastError && (
        <Toast
          message={toastError}
          type="error"
          onClose={() => setToastError(null)}
          persistent={true}
        />
      )}

      {/* Header */}
      <div className="edicao-header">
        <div className="header-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => onNavigate('lista')}
                className="btn-back"
              >
                ← Voltar
              </button>
              <div className="header-info">
                <h1>
                  {isModoCriacao ? (
                    <>
                      <Plus size={20} /> 
                      Nova Organização
                    </>
                  ) : (
                    <>
                      <Edit size={20} /> 
                      {organizacao?.nome || 'Nome não informado'}
                    </>
                  )}
                </h1>
              </div>
            </div>
            
            {/* Linha Separadora */}
            {!isModoCriacao && organizacao && (
              <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%)',
                margin: '0.5rem 0'
              }} />
            )}
            
            {/* Metadados da Organização */}
            {!isModoCriacao && organizacao && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem',
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                {/* Data e Hora de Criação */}
                {organizacao.inicio && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Data e hora do cadastro">
                    <Calendar size={16} style={{ color: '#3b2313' }} />
                    <span style={{ color: '#1e293b', fontWeight: 500 }}>
                      {new Date(organizacao.inicio).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}{' '}
                      {new Date(organizacao.inicio).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                
                {/* Localização */}
                {((organizacao as any).municipio_nome || (organizacao as any).estado_nome) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Localização">
                    <MapPin size={16} style={{ color: '#3b2313' }} />
                    <span style={{ color: '#1e293b', fontWeight: 500 }}>
                      {(organizacao as any).municipio_nome && (organizacao as any).estado_nome
                        ? `${(organizacao as any).municipio_nome} - ${(organizacao as any).estado_nome}`
                        : (organizacao as any).municipio_nome || (organizacao as any).estado_nome}
                    </span>
                  </div>
                )}
                
                {/* Técnico/Usuário */}
                {(organizacao as any).tecnico_nome && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Técnico responsável">
                    <User size={16} style={{ color: '#3b2313' }} />
                    <span style={{ color: '#1e293b', fontWeight: 500 }}>
                      {(organizacao as any).tecnico_nome}
                    </span>
                  </div>
                )}
                
                {/* Status de Validação */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Status de validação">
                  {organizacao.validacao_status === 2 ? (
                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                  ) : organizacao.validacao_status === 3 ? (
                    <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                  ) : organizacao.validacao_status === 4 ? (
                    <XCircle size={16} style={{ color: '#ef4444' }} />
                  ) : (
                    <Clock size={16} style={{ color: '#9ca3af' }} />
                  )}
                  <span style={{
                    fontWeight: 600,
                    color: organizacao.validacao_status === 2 
                      ? '#10b981' 
                      : organizacao.validacao_status === 3 
                        ? '#f59e0b' 
                        : organizacao.validacao_status === 4
                          ? '#ef4444'
                          : '#9ca3af'
                  }}>
                    {organizacao.validacao_status === 2 
                      ? 'Validado' 
                      : organizacao.validacao_status === 3 
                        ? 'Pendência' 
                        : organizacao.validacao_status === 4
                          ? 'Reprovado'
                          : 'Não Validado'}
                  </span>
                  {organizacao.validacao_data && organizacao.validacao_status !== 1 && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8125rem', color: '#9ca3af' }}>
                      ({new Date(organizacao.validacao_data).toLocaleDateString('pt-BR')})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Botão Gerar Relatório - Sempre visível */}
          {!isModoCriacao && organizacao && (
            <button
              onClick={handleGerarRelatorio}
              disabled={gerandoPDF}
              className="btn-gerar-relatorio"
            >
              {gerandoPDF ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Gerar Relatório
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="edicao-body">
        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button
            className={`tab-button ${abaAtiva === 'identificacao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('identificacao')}
            title="Identificação e Caracterização"
          >
            <IdCard size={16} /> <span>Identificação</span>
          </button>
          <button
            className={`tab-button ${abaAtiva === 'caracteristicas' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('caracteristicas')}
            title="Características dos Associados"
          >
            <Users size={16} /> <span>Características dos Associados</span>
          </button>
          <button
            className={`tab-button ${abaAtiva === 'complementos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('complementos')}
            title="Dados Complementares"
          >
            <FileText size={16} /> <span>Complementos</span>
          </button>
          <button
            className={`tab-button ${abaAtiva === 'abrangencia' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('abrangencia')}
            title="Abrangência Geográfica"
          >
            <MapPin size={16} /> <span>Abrangência Geográfica</span>
          </button>
          <button
            className={`tab-button ${abaAtiva === 'associados-juridicos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('associados-juridicos')}
            title="Associados Jurídicos"
          >
            <Network size={16} /> <span>Associados Jurídicos</span>
          </button>
          <button
            className={`tab-button ${abaAtiva === 'producao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('producao')}
            title="Dados de Produção"
          >
            <Wheat size={16} /> <span>Dados de Produção</span>
          </button>
          <button
            className={`tab-button ${abaAtiva === 'diagnostico' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('diagnostico')}
            title="Diagnóstico"
            style={{
              background: abaAtiva === 'diagnostico' 
                ? 'linear-gradient(135deg, #3b2313 0%, #056839 100%)' 
                : 'rgba(59, 35, 19, 0.1)', // Marrom do projeto (#3b2313) com 10% de opacidade
              color: abaAtiva === 'diagnostico' ? 'white' : '#3b2313'
            }}
          >
            <Search size={16} /> <span>Diagnóstico</span>
          </button>
          <button
            className={`tab-button ${abaAtiva === 'planoGestao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('planoGestao')}
            title="Plano de Gestão"
            style={{
              background: abaAtiva === 'planoGestao' 
                ? 'linear-gradient(135deg, #3b2313 0%, #056839 100%)' 
                : 'rgba(59, 35, 19, 0.1)', // Marrom do projeto (#3b2313) com 10% de opacidade
              color: abaAtiva === 'planoGestao' ? 'white' : '#3b2313'
            }}
          >
            <Target size={16} /> <span>Plano de Gestão</span>
          </button>
          <button
            className={`tab-button ${abaAtiva === 'validacao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('validacao')}
            title="Validação do Cadastro"
            style={{
              background: abaAtiva === 'validacao' 
                ? 'linear-gradient(135deg, #3b2313 0%, #056839 100%)' 
                : organizacao?.validacao_status === 2
                  ? 'linear-gradient(135deg, #f1f8f4 0%, #d4edda 100%)'  // Verde muito suave se aprovado
                  : organizacao?.validacao_status === 3
                    ? 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)'  // Vermelho muito suave se rejeitado
                    : 'linear-gradient(135deg, #fffef5 0%, #fff9e6 100%)',  // Amarelo muito suave se pendente
              color: abaAtiva === 'validacao' 
                ? 'white' 
                : organizacao?.validacao_status === 2
                  ? '#056839'  // Verde do projeto
                  : organizacao?.validacao_status === 3
                    ? '#dc3545'  // Vermelho suave
                    : '#856404'  // Marrom/amarelo suave
            }}
          >
            <CheckCircle size={16} /> <span>Validação</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {abaAtiva === 'identificacao' && renderAbaIdentificacao()}
          {abaAtiva === 'caracteristicas' && renderAbaCaracteristicas()}
          {abaAtiva === 'abrangencia' && renderAbaAbrangencia()}
          {abaAtiva === 'associados-juridicos' && renderAbaAssociadosJuridicos()}
          {abaAtiva === 'producao' && renderAbaProducao()}
          {abaAtiva === 'diagnostico' && renderAbaDiagnostico()}
          {abaAtiva === 'planoGestao' && renderAbaPlanoGestao()}
          {abaAtiva === 'validacao' && renderAbaValidacao()}
          {abaAtiva === 'complementos' && renderAbaComplementos()}

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
                    {isModoCriacao ? 'Criar Organização' : 'Salvar Cadastro'}
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
