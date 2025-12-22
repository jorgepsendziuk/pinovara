import { useState, useEffect } from 'react';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { Capacitacao, CapacitacaoInscricao, CapacitacaoPresenca, CreateInscricaoData, CapacitacaoEvidencia, CreateEvidenciaData } from '../../types/capacitacao';
import QRCodeDisplay from '../../components/qualificacoes/QRCodeDisplay';
import DataGrid, { DataGridColumn } from '../../components/DataGrid/DataGrid';
import { gerarPdfListaInscricoes } from '../../utils/pdfListaInscricoes';
import { gerarPDFListaPresenca } from '../../utils/pdfListaPresenca';
import { gerarPDFQRCodeInscricao } from '../../utils/pdfQRCodeInscricao';
import { gerarPDFQRCodeAvaliacao } from '../../utils/pdfQRCodeAvaliacao';
import { gerarPDFListaPresencaVazia } from '../../utils/pdfListaPresencaVazia';
import { gerarPDFListaInscricoesVazia } from '../../utils/pdfListaInscricoesVazia';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Printer, 
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  QrCode,
  Copy,
  CheckCircle,
  CalendarDays,
  ChevronDown,
  Upload,
  Download,
  Image,
  FileText
} from 'lucide-react';
import './QualificacoesModule.css';

interface PainelInstrutorProps {
  idCapacitacao: number;
  onNavigate: (view: string, id?: number) => void;
  modoInscricoes?: boolean; // Quando true, oculta seções de Links/QR Codes e Presenças
}

function PainelInstrutor({ idCapacitacao, onNavigate, modoInscricoes = false }: PainelInstrutorProps) {
  const [capacitacao, setCapacitacao] = useState<Capacitacao | null>(null);
  const [inscricoes, setInscricoes] = useState<CapacitacaoInscricao[]>([]);
  const [presencas, setPresencas] = useState<CapacitacaoPresenca[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [dataSelecionadaPresenca, setDataSelecionadaPresenca] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateInscricaoData>({
    nome: '',
    email: '',
    telefone: '',
    instituicao: '',
    cpf: '',
    rg: ''
  });
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [accordionLinksAberto, setAccordionLinksAberto] = useState(false);
  const [presencasSelecionadas, setPresencasSelecionadas] = useState<Set<number>>(new Set());
  const [abaAtiva, setAbaAtiva] = useState<'inscricoes' | 'presencas' | 'evidencias'>('inscricoes');
  const [evidencias, setEvidencias] = useState<CapacitacaoEvidencia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [filtroTipoEvidencia, setFiltroTipoEvidencia] = useState<string>('');

  useEffect(() => {
    carregarDados();
  }, [idCapacitacao]);

  useEffect(() => {
    if (abaAtiva === 'evidencias') {
      carregarEvidencias();
    }
  }, [abaAtiva, idCapacitacao, filtroTipoEvidencia]);

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
      
      // Se houver apenas uma organização, pré-selecionar no formulário
      if (cap.organizacoes_completas && cap.organizacoes_completas.length === 1) {
        setFormData(prev => ({
          ...prev,
          instituicao: cap.organizacoes_completas![0].nome
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados da capacitação');
    } finally {
      setLoading(false);
    }
  };

  const carregarEvidencias = async () => {
    try {
      const evidenciasList = await capacitacaoAPI.listEvidencias(idCapacitacao, filtroTipoEvidencia || undefined);
      setEvidencias(evidenciasList);
    } catch (error) {
      console.error('Erro ao carregar evidências:', error);
      alert('Erro ao carregar evidências');
    }
  };

  const handleUploadEvidencia = async (file: File, tipo: string) => {
    try {
      setUploading(true);
      const evidenciaData: CreateEvidenciaData = {
        tipo: tipo
      };
      await capacitacaoAPI.uploadEvidencia(idCapacitacao, file, evidenciaData);
      await carregarEvidencias();
      alert('Evidência enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload de evidência:', error);
      alert(error.message || 'Erro ao fazer upload de evidência');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadEvidencia = async (evidencia: CapacitacaoEvidencia) => {
    try {
      await capacitacaoAPI.downloadEvidencia(idCapacitacao, evidencia.id);
    } catch (error: any) {
      console.error('Erro ao fazer download de evidência:', error);
      alert(error.message || 'Erro ao fazer download de evidência');
    }
  };

  const handleDeleteEvidencia = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta evidência?')) {
      return;
    }
    try {
      await capacitacaoAPI.deleteEvidencia(idCapacitacao, id);
      await carregarEvidencias();
      alert('Evidência excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir evidência:', error);
      alert(error.message || 'Erro ao excluir evidência');
    }
  };

  const handleExcluirCapacitacao = async () => {
    if (!confirm('Tem certeza que deseja excluir esta capacitação? Esta ação não pode ser desfeita e todos os dados relacionados (inscrições, presenças, evidências) serão perdidos.')) {
      return;
    }

    try {
      setSalvando(true);
      await capacitacaoAPI.delete(idCapacitacao);
      alert('Capacitação excluída com sucesso!');
      onNavigate('capacitacoes');
    } catch (error: any) {
      console.error('Erro ao excluir capacitação:', error);
      alert(error.message || 'Erro ao excluir capacitação');
    } finally {
      setSalvando(false);
    }
  };

  const handleImprimirListaInscricoes = async () => {
    if (!capacitacao) {
      alert('Dados da capacitação não disponíveis para gerar PDF.');
      return;
    }
    await gerarPdfListaInscricoes(capacitacao, inscricoes);
  };

  const handleImprimirListaPresenca = async () => {
    if (!capacitacao || !dataSelecionadaPresenca) {
      alert('Selecione uma data para gerar a lista de presença.');
      return;
    }
    await gerarPDFListaPresenca({
      capacitacao,
      inscricoes,
      presencas: presencas.filter(p => {
        const presData = formatarDataISO(p.data);
        return presData === dataSelecionadaPresenca;
      }),
      data: dataSelecionadaPresenca
    });
  };

  const handleImprimirListaInscricoesVazia = async () => {
    if (!capacitacao) {
      alert('Dados da capacitação não disponíveis para gerar PDF.');
      return;
    }
    await gerarPDFListaInscricoesVazia({ capacitacao });
  };

  const handleImprimirListaPresencaVazia = async () => {
    if (!capacitacao) {
      alert('Dados da capacitação não disponíveis para gerar PDF.');
      return;
    }
    await gerarPDFListaPresencaVazia({ 
      capacitacao, 
      data: dataSelecionadaPresenca || undefined 
    });
  };

  const handleCopiarLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  // Funções de formatação
  const formatarTelefone = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '');
    const limitado = apenasNumeros.slice(0, 11);
    
    if (limitado.length > 10) {
      return limitado.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (limitado.length > 6) {
      if (limitado.length === 10) {
        return limitado.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        return limitado.replace(/^(\d{2})(\d{1,5})/, '($1) $2');
      }
    } else if (limitado.length > 2) {
      return limitado.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (limitado.length > 0) {
      return limitado.replace(/^(\d*)/, '($1');
    }
    return limitado;
  };

  const formatarCPF = (cpf: string): string => {
    const apenasNumeros = cpf.replace(/\D/g, '');
    const limitado = apenasNumeros.slice(0, 11);
    
    if (limitado.length <= 3) {
      return limitado;
    } else if (limitado.length <= 6) {
      return limitado.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
    } else if (limitado.length <= 9) {
      return limitado.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else {
      return limitado.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome || formData.nome.trim().length === 0) {
      novosErros.nome = 'Nome completo é obrigatório';
    }

    if (!formData.email || formData.email.trim().length === 0) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = 'E-mail inválido';
    }

    if (!formData.telefone || formData.telefone.trim().length === 0) {
      novosErros.telefone = 'Telefone é obrigatório';
    } else {
      const apenasNumeros = formData.telefone.replace(/\D/g, '');
      if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
        novosErros.telefone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    if (!formData.instituicao || formData.instituicao.trim().length === 0) {
      novosErros.instituicao = 'Instituição é obrigatória';
    }

    if (!formData.cpf || formData.cpf.trim().length === 0) {
      novosErros.cpf = 'CPF é obrigatório';
    } else {
      const apenasNumeros = formData.cpf.replace(/\D/g, '');
      if (apenasNumeros.length !== 11) {
        novosErros.cpf = 'CPF deve ter 11 dígitos';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      instituicao: capacitacao?.organizacoes_completas?.length === 1 ? capacitacao.organizacoes_completas[0].nome : '',
      cpf: '',
      rg: ''
    });
    setErros({});
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setSalvando(true);
      if (editandoId) {
        await capacitacaoAPI.updateInscricao(idCapacitacao, editandoId, formData);
        alert('Inscrição atualizada com sucesso!');
      } else {
        await capacitacaoAPI.createInscricao(idCapacitacao, formData);
        alert('Inscrição cadastrada com sucesso!');
      }
      limparFormulario();
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar inscrição:', error);
      alert(error.message || 'Erro ao salvar inscrição');
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (inscricao: CapacitacaoInscricao) => {
    setFormData({
      nome: inscricao.nome || '',
      email: inscricao.email || '',
      telefone: inscricao.telefone || '',
      instituicao: inscricao.instituicao || '',
      cpf: inscricao.cpf || '',
      rg: inscricao.rg || ''
    });
    setEditandoId(inscricao.id!);
    setMostrarFormulario(true);
    setErros({});
  };

  const handleExcluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta inscrição?')) {
      return;
    }

    try {
      await capacitacaoAPI.deleteInscricao(idCapacitacao, id);
      alert('Inscrição excluída com sucesso!');
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao excluir inscrição:', error);
      alert(error.message || 'Erro ao excluir inscrição');
    }
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
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return data;
    }
    if (typeof data === 'string') {
      const match = data.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) {
        return match[1];
      }
      const parsed = new Date(data);
      if (!isNaN(parsed.getTime())) {
        if (!data.includes('T') && !data.includes(' ')) {
          const year = parsed.getUTCFullYear();
          const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
          const day = String(parsed.getUTCDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } else {
          const year = parsed.getFullYear();
          const month = String(parsed.getMonth() + 1).padStart(2, '0');
          const day = String(parsed.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }
      return data;
    }
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
    
    const inicioStr = typeof capacitacao.data_inicio === 'string' 
      ? capacitacao.data_inicio.split('T')[0] 
      : formatarDataISO(capacitacao.data_inicio);
    const fimStr = capacitacao.data_fim 
      ? (typeof capacitacao.data_fim === 'string' 
          ? capacitacao.data_fim.split('T')[0] 
          : formatarDataISO(capacitacao.data_fim))
      : inicioStr;
    
    if (!inicioStr || !fimStr) return [];
    
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
    
    return datas.reverse();
  };

  const todasDatasPeriodo = gerarDatasPeriodo();
  const datasComPresenca = new Set(
    presencas.map(p => formatarDataISO(p.data)).filter(Boolean)
  );

  // Funções de gerenciamento de presenças

  // Inicializar presenças selecionadas quando a data muda ou quando as presenças são carregadas
  useEffect(() => {
    if (dataSelecionadaPresenca && presencas.length > 0) {
      const presencasData = presencas
        .filter(p => formatarDataISO(p.data) === dataSelecionadaPresenca && p.presente && p.id_inscricao)
        .map(p => p.id_inscricao!)
        .filter(id => id !== null && id !== undefined);
      setPresencasSelecionadas(new Set(presencasData));
    } else {
      setPresencasSelecionadas(new Set());
    }
  }, [dataSelecionadaPresenca, presencas]);

  const handleTogglePresenca = (idInscricao: number) => {
    setPresencasSelecionadas(prev => {
      const novo = new Set(prev);
      if (novo.has(idInscricao)) {
        novo.delete(idInscricao);
      } else {
        novo.add(idInscricao);
      }
      return novo;
    });
  };

  const handleSalvarPresencas = async () => {
    if (!dataSelecionadaPresenca) {
      alert('Selecione uma data');
      return;
    }

    try {
      setSalvando(true);
      
      // Buscar presenças existentes para esta data
      const presencasExistentes = presencas.filter(p => formatarDataISO(p.data) === dataSelecionadaPresenca);
      
      // Deletar presenças que não estão mais selecionadas
      for (const presenca of presencasExistentes) {
        if (presenca.id_inscricao && !presencasSelecionadas.has(presenca.id_inscricao)) {
          if (presenca.id) {
            await capacitacaoAPI.deletePresenca(idCapacitacao, presenca.id);
          }
        }
      }
      
      // Criar/atualizar presenças para inscrições selecionadas
      for (const idInscricao of presencasSelecionadas) {
        const presencaExistente = presencasExistentes.find(p => p.id_inscricao === idInscricao);
        if (presencaExistente) {
          // Atualizar se não estiver como presente
          if (!presencaExistente.presente && presencaExistente.id) {
            await capacitacaoAPI.updatePresenca(idCapacitacao, presencaExistente.id, {
              presente: true,
              data: dataSelecionadaPresenca
            });
          }
        } else {
          // Criar nova presença
          await capacitacaoAPI.createPresenca(idCapacitacao, {
            id_inscricao: idInscricao,
            presente: true,
            data: dataSelecionadaPresenca
          });
        }
      }
      
      alert('Presenças salvas com sucesso!');
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar presenças:', error);
      alert(error.message || 'Erro ao salvar presenças');
    } finally {
      setSalvando(false);
    }
  };

  useEffect(() => {
    const datas = gerarDatasPeriodo();
    if (datas.length > 0 && !dataSelecionadaPresenca) {
      setDataSelecionadaPresenca(datas[0]);
    }
  }, [capacitacao?.data_inicio, capacitacao?.data_fim, dataSelecionadaPresenca]);


  const formatarDataHora = (data: string | Date | null | undefined): string => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const inscricoesColumns: DataGridColumn<CapacitacaoInscricao>[] = [
    {
      key: 'acoes',
      title: 'Ações',
      width: '8%',
      align: 'left',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
          <button
            onClick={() => handleEditar(record)}
            style={{
              padding: '6px 10px',
              background: '#056839',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
            title="Editar"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleExcluir(record.id!)}
            style={{
              padding: '6px 10px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
    {
      key: 'nome',
      title: 'Nome',
      dataIndex: 'nome',
      width: '25%',
      render: (nome: string) => (
        <span style={{ fontWeight: '500', color: '#3b2313' }}>{nome}</span>
      )
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      width: '20%',
      render: (email: string) => email || '-'
    },
    {
      key: 'telefone',
      title: 'Telefone',
      dataIndex: 'telefone',
      width: '15%',
      render: (telefone: string) => telefone || '-'
    },
    {
      key: 'instituicao',
      title: 'Instituição',
      dataIndex: 'instituicao',
      width: '20%',
      render: (instituicao: string) => instituicao || '-'
    },
    {
      key: 'cpf',
      title: 'CPF',
      dataIndex: 'cpf',
      width: '12%',
      render: (cpf: string) => cpf || '-'
    },
    {
      key: 'created_at',
      title: 'Data de Inscrição',
      width: '10%',
      render: (_, record) => formatarData(record.created_at)
    }
  ];

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
          <div style={{ flex: 1 }}>
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
              {capacitacao.titulo || capacitacao.qualificacao?.titulo || 'Painel do Instrutor'}
            </h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#64748b' }}>
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
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: capacitacao.status === 'concluida' ? '#d4edda' : 
                                 capacitacao.status === 'em_andamento' ? '#fff3cd' :
                                 capacitacao.status === 'cancelada' ? '#f8d7da' : '#d1ecf1',
                color: capacitacao.status === 'concluida' ? '#155724' :
                       capacitacao.status === 'em_andamento' ? '#856404' :
                       capacitacao.status === 'cancelada' ? '#721c24' : '#0c5460',
                textTransform: 'capitalize'
              }}>
                {capacitacao.status?.replace(/_/g, ' ') || 'Planejada'}
              </span>
            </div>
          </div>
          <button
            onClick={handleExcluirCapacitacao}
            disabled={salvando}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: salvando ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
              opacity: salvando ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!salvando) {
                e.currentTarget.style.background = '#b91c1c';
              }
            }}
            onMouseOut={(e) => {
              if (!salvando) {
                e.currentTarget.style.background = '#dc2626';
              }
            }}
            title="Excluir capacitação"
          >
            <Trash2 size={16} />
            {salvando ? 'Excluindo...' : 'Excluir Capacitação'}
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Links Públicos e QR Codes - Oculto no modo inscrições */}
        {!modoInscricoes && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setAccordionLinksAberto(!accordionLinksAberto)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #3b2313 0%, #056839 100%)',
              border: 'none',
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
            <h2 style={{ margin: 0, color: 'white', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={20} />
              Links Públicos e QR Codes
            </h2>
            <ChevronDown
              size={20}
              color="white"
              style={{
                transition: 'transform 0.2s ease',
                transform: accordionLinksAberto ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>
          
          <div style={{
            maxHeight: accordionLinksAberto ? '2000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
            padding: accordionLinksAberto ? '24px' : '0 24px'
          }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Link de Inscrição */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#3b2313', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} />
                Inscrição
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: 'white', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  marginBottom: '8px'
                }}>
                  {`${window.location.origin}/capacitacao/${capacitacao.link_inscricao}`}
                </div>
                <button
                  onClick={() => handleCopiarLink(`${window.location.origin}/capacitacao/${capacitacao.link_inscricao}`)}
                  style={{
                    padding: '6px 12px',
                    background: '#056839',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <Copy size={12} />
                  Copiar Link
                </button>
              </div>
              <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <QRCodeDisplay
                  value={`${window.location.origin}/capacitacao/${capacitacao.link_inscricao}`}
                  size={150}
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    await gerarPDFQRCodeInscricao(capacitacao);
                  } catch (error) {
                    console.error('Erro ao gerar PDF de QR code:', error);
                    alert('Erro ao gerar PDF de QR code de inscrição');
                  }
                }}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: '#3b2313',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <Printer size={14} />
                Imprimir QR Code
              </button>
            </div>

            {/* Link de Avaliação */}
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#3b2313', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} />
                Avaliação
              </h3>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: 'white', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  marginBottom: '8px'
                }}>
                  {`${window.location.origin}/capacitacao/${capacitacao.link_avaliacao}/avaliacao`}
                </div>
                <button
                  onClick={() => handleCopiarLink(`${window.location.origin}/capacitacao/${capacitacao.link_avaliacao}/avaliacao`)}
                  style={{
                    padding: '6px 12px',
                    background: '#056839',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <Copy size={12} />
                  Copiar Link
                </button>
              </div>
              <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <QRCodeDisplay
                  value={`${window.location.origin}/capacitacao/${capacitacao.link_avaliacao}/avaliacao`}
                  size={150}
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    await gerarPDFQRCodeAvaliacao(capacitacao);
                  } catch (error) {
                    console.error('Erro ao gerar PDF de QR code:', error);
                    alert('Erro ao gerar PDF de QR code de avaliação');
                  }
                }}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: '#3b2313',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <Printer size={14} />
                Imprimir QR Code
              </button>
            </div>
          </div>
          </div>
        </div>
        )}

        {/* Abas de Navegação */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '0',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <button
              onClick={() => setAbaAtiva('inscricoes')}
              style={{
                flex: 1,
                padding: '16px 24px',
                background: abaAtiva === 'inscricoes' ? 'white' : 'transparent',
                color: abaAtiva === 'inscricoes' ? '#056839' : '#64748b',
                border: 'none',
                borderBottom: abaAtiva === 'inscricoes' ? '3px solid #056839' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: abaAtiva === 'inscricoes' ? '600' : '500',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Users size={18} />
              Inscrições ({inscricoes.length})
            </button>
            {!modoInscricoes && (
              <button
                onClick={() => setAbaAtiva('presencas')}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  background: abaAtiva === 'presencas' ? 'white' : 'transparent',
                  color: abaAtiva === 'presencas' ? '#056839' : '#64748b',
                  border: 'none',
                  borderBottom: abaAtiva === 'presencas' ? '3px solid #056839' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: abaAtiva === 'presencas' ? '600' : '500',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <CheckCircle size={18} />
                Presenças ({presencas.length})
              </button>
            )}
            <button
              onClick={() => setAbaAtiva('evidencias')}
              style={{
                flex: 1,
                padding: '16px 24px',
                background: abaAtiva === 'evidencias' ? 'white' : 'transparent',
                color: abaAtiva === 'evidencias' ? '#056839' : '#64748b',
                border: 'none',
                borderBottom: abaAtiva === 'evidencias' ? '3px solid #056839' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: abaAtiva === 'evidencias' ? '600' : '500',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={18} />
              Evidências ({evidencias.length})
            </button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'inscricoes' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#3b2313', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} />
              Inscrições ({inscricoes.length})
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  limparFormulario();
                  setMostrarFormulario(true);
                }}
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
                  fontWeight: '500'
                }}
              >
                <Plus size={16} />
                {editandoId ? 'Cancelar' : 'Nova Inscrição'}
              </button>
              <button
                onClick={handleImprimirListaInscricoes}
                style={{
                  padding: '10px 20px',
                  background: '#3b2313',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Printer size={16} />
                Imprimir Lista de Inscrições
              </button>
              <button
                onClick={handleImprimirListaInscricoesVazia}
                style={{
                  padding: '10px 20px',
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                title="Imprimir lista vazia para preenchimento manual"
              >
                <Printer size={16} />
                Lista Vazia (Inscrições)
              </button>
            </div>
          </div>

          {/* Formulário de Cadastro/Edição */}
          {mostrarFormulario && (
            <div style={{
              marginBottom: '24px',
              padding: '24px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#3b2313', fontSize: '18px' }}>
                {editandoId ? 'Editar Inscrição' : 'Nova Inscrição'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b2313' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => {
                      setFormData({ ...formData, nome: e.target.value });
                      if (erros.nome) setErros({ ...erros, nome: '' });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: erros.nome ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {erros.nome && (
                    <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                      {erros.nome}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b2313' }}>
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (erros.email) setErros({ ...erros, email: '' });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: erros.email ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {erros.email && (
                    <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                      {erros.email}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b2313' }}>
                    Telefone (com DDD) *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone || ''}
                    onChange={(e) => {
                      const formatado = formatarTelefone(e.target.value);
                      setFormData({ ...formData, telefone: formatado });
                      if (erros.telefone) setErros({ ...erros, telefone: '' });
                    }}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: erros.telefone ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {erros.telefone && (
                    <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                      {erros.telefone}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b2313' }}>
                    Instituição *
                  </label>
                  {capacitacao?.organizacoes_completas && capacitacao.organizacoes_completas.length > 0 ? (
                    <select
                      value={formData.instituicao || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, instituicao: e.target.value });
                        if (erros.instituicao) setErros({ ...erros, instituicao: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: erros.instituicao ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Selecione uma instituição</option>
                      {capacitacao.organizacoes_completas.map((org) => (
                        <option key={org.id} value={org.nome}>
                          {org.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.instituicao || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, instituicao: e.target.value });
                        if (erros.instituicao) setErros({ ...erros, instituicao: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: erros.instituicao ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  )}
                  {erros.instituicao && (
                    <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                      {erros.instituicao}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b2313' }}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formData.cpf || ''}
                    onChange={(e) => {
                      const formatado = formatarCPF(e.target.value);
                      setFormData({ ...formData, cpf: formatado });
                      if (erros.cpf) setErros({ ...erros, cpf: '' });
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: erros.cpf ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {erros.cpf && (
                    <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                      {erros.cpf}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#3b2313' }}>
                    RG
                  </label>
                  <input
                    type="text"
                    value={formData.rg || ''}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button
                  onClick={limparFormulario}
                  style={{
                    padding: '10px 20px',
                    background: '#ccc',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  style={{
                    padding: '10px 20px',
                    background: '#056839',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: salvando ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: salvando ? 0.6 : 1
                  }}
                >
                  <Save size={16} />
                  {salvando ? 'Salvando...' : (editandoId ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </div>
          )}

          <DataGrid
            columns={inscricoesColumns}
            dataSource={inscricoes}
            rowKey="id"
            pagination={false}
            emptyState={{
              title: 'Nenhuma inscrição encontrada',
              description: 'Ainda não há inscrições para esta capacitação.',
              icon: <Users size={48} color="#cbd5e1" />
            }}
          />
        </div>
        )}

        {/* Presenças */}
        {abaAtiva === 'presencas' && !modoInscricoes && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ margin: 0, color: '#3b2313', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
              Presenças ({presencas.length})
            </h2>
            {dataSelecionadaPresenca && (
              <button
                onClick={handleSalvarPresencas}
                disabled={salvando}
                style={{
                  padding: '10px 20px',
                  background: '#056839',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: salvando ? 0.6 : 1
                }}
              >
                {salvando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar Presenças
                  </>
                )}
              </button>
            )}
            {todasDatasPeriodo.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {todasDatasPeriodo.map(data => {
                  const presencasData = presencas.filter(p => formatarDataISO(p.data) === data);
                  const totalPresencas = presencasData.length;
                  const isSelected = dataSelecionadaPresenca === data;
                  const temPresenca = datasComPresenca.has(data);
                  
                  return (
                    <button
                      key={data}
                      onClick={() => setDataSelecionadaPresenca(data)}
                      style={{
                        padding: '8px 16px',
                        background: isSelected ? '#056839' : (temPresenca ? '#f0fdf4' : 'white'),
                        color: isSelected ? 'white' : '#3b2313',
                        border: `2px solid ${isSelected ? '#056839' : (temPresenca ? '#86efac' : '#e2e8f0')}`,
                        borderRadius: '6px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
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
                          e.currentTarget.style.borderColor = temPresenca ? '#86efac' : '#e2e8f0';
                          e.currentTarget.style.color = '#3b2313';
                        }
                      }}
                    >
                      <Calendar size={14} />
                      {formatarData(data)}
                      {totalPresencas > 0 && (
                        <span style={{
                          marginLeft: '6px',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#d4edda',
                          color: isSelected ? 'white' : '#155724',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {totalPresencas}
                        </span>
                      )}
                    </button>
                  );
                })}
                {dataSelecionadaPresenca && (
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <button
                      onClick={handleImprimirListaPresenca}
                      style={{
                        padding: '8px 16px',
                        background: '#3b2313',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Printer size={14} />
                      Imprimir Lista de Presença
                    </button>
                    <button
                      onClick={handleImprimirListaPresencaVazia}
                      style={{
                        padding: '8px 16px',
                        background: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Imprimir lista vazia para preenchimento manual"
                    >
                      <Printer size={14} />
                      Lista Vazia
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {dataSelecionadaPresenca ? (
            <>
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  Gerenciando presenças de: <strong style={{ color: '#3b2313' }}>{formatarData(dataSelecionadaPresenca)}</strong>
                </span>
                <span style={{ marginLeft: '16px', fontSize: '14px', color: '#056839', fontWeight: '600' }}>
                  {presencasSelecionadas.size} de {inscricoes.length} selecionados
                </span>
              </div>
              
              {inscricoes.length > 0 ? (
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto auto',
                    gap: '16px',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#3b2313',
                    alignItems: 'center'
                  }}>
                    <div style={{ width: '24px' }}></div>
                    <div>Nome</div>
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>Email</div>
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>Telefone</div>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>Documento</div>
                  </div>
                  
                  {inscricoes.map((inscricao) => {
                    const isSelected = presencasSelecionadas.has(inscricao.id!);
                    return (
                      <div
                        key={inscricao.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto auto auto',
                          gap: '16px',
                          padding: '16px',
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#f0fdf4' : 'white',
                          alignItems: 'center',
                          transition: 'background-color 0.2s',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleTogglePresenca(inscricao.id!)}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTogglePresenca(inscricao.id!)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: '#056839'
                          }}
                        />
                        <div style={{ fontWeight: '500', color: '#3b2313' }}>
                          {inscricao.nome}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', minWidth: '120px' }}>
                          {inscricao.email || '-'}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', minWidth: '120px' }}>
                          {inscricao.telefone || '-'}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', minWidth: '100px' }}>
                          {inscricao.cpf || inscricao.rg || '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <Users size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                  <p>Não há inscrições para esta capacitação</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
              <p>Selecione uma data para gerenciar as presenças</p>
            </div>
          )}
        </div>
        )}

        {/* Evidências */}
        {abaAtiva === 'evidencias' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ margin: 0, color: '#3b2313', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} />
              Evidências ({evidencias.length})
            </h2>
            <select
              value={filtroTipoEvidencia}
              onChange={(e) => setFiltroTipoEvidencia(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="">Todos os tipos</option>
              <option value="foto">Fotos</option>
              <option value="lista_presenca">Listas de Presença</option>
              <option value="outro">Outros</option>
            </select>
          </div>

          {/* Área de Upload */}
          <div style={{
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '24px',
            background: '#f9fafb',
            transition: 'all 0.2s'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#056839';
            e.currentTarget.style.background = '#f0fdf4';
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.background = '#f9fafb';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.background = '#f9fafb';
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
              const file = files[0];
              const tipo = file.type.startsWith('image/') ? 'foto' : (file.type === 'application/pdf' ? 'lista_presenca' : 'outro');
              handleUploadEvidencia(file, tipo);
            }
          }}
          >
            <Upload size={32} style={{marginBottom: '12px', color: '#6b7280'}} />
            <p style={{marginBottom: '12px', color: '#6b7280'}}>
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <input
              type="file"
              id="upload-evidencia-capacitacao"
              accept="image/*,application/pdf"
              style={{display: 'none'}}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const tipo = file.type.startsWith('image/') ? 'foto' : (file.type === 'application/pdf' ? 'lista_presenca' : 'outro');
                  handleUploadEvidencia(file, tipo);
                }
              }}
            />
            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
              <button
                onClick={() => {
                  const input = document.getElementById('upload-evidencia-capacitacao') as HTMLInputElement;
                  input?.click();
                }}
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
                  disabled: uploading
                }}
                disabled={uploading}
              >
                <Upload size={16} />
                {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
              </button>
            </div>
          </div>

          {/* Lista de Evidências */}
          {evidencias.length === 0 ? (
            <div style={{padding: '24px', textAlign: 'center', color: '#6b7280'}}>
              <FileText size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
              <p>Nenhuma evidência encontrada.</p>
            </div>
          ) : (
            <div style={{display: 'grid', gap: '12px'}}>
              {evidencias.map((evidencia) => (
                <div
                  key={evidencia.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'white'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: evidencia.tipo === 'foto' ? '#fef3c7' : '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {evidencia.tipo === 'foto' ? (
                      <Image size={24} style={{color: '#f59e0b'}} />
                    ) : (
                      <FileText size={24} style={{color: '#3b82f6'}} />
                    )}
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontWeight: 600, color: '#3b2313', marginBottom: '4px'}}>
                      {evidencia.nome_arquivo}
                    </div>
                    <div style={{fontSize: '13px', color: '#6b7280'}}>
                      Tipo: {evidencia.tipo === 'foto' ? 'Foto' : evidencia.tipo === 'lista_presenca' ? 'Lista de Presença' : 'Outro'}
                      {' • '}
                      {new Date(evidencia.created_at).toLocaleString('pt-BR')}
                    </div>
                    {evidencia.descricao && (
                      <div style={{fontSize: '13px', color: '#6b7280', marginTop: '4px'}}>
                        {evidencia.descricao}
                      </div>
                    )}
                    {evidencia.data_evidencia && (
                      <div style={{fontSize: '13px', color: '#6b7280', marginTop: '4px'}}>
                        Data: {new Date(evidencia.data_evidencia).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {evidencia.local_evidencia && (
                      <div style={{fontSize: '13px', color: '#6b7280', marginTop: '4px'}}>
                        Local: {evidencia.local_evidencia}
                      </div>
                    )}
                  </div>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button
                      onClick={() => handleDownloadEvidencia(evidencia)}
                      style={{
                        padding: '8px',
                        background: '#056839',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Baixar arquivo"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvidencia(evidencia.id)}
                      style={{
                        padding: '8px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Excluir evidência"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default PainelInstrutor;
