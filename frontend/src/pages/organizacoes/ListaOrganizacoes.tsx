import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PDFService, OrganizacaoData } from '../../services/pdfService';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import { StatusValidacaoBadge, StatusPlanoGestaoValidacaoBadge } from '../../utils/validacaoHelpers';
import { ModalArquivos } from '../../components/organizacoes/ModalArquivos';
import ModalValidacao from '../../components/organizacoes/ModalValidacao';
import ModalValidacaoPlanoGestao from '../../components/organizacoes/ModalValidacaoPlanoGestao';
import { auxiliarAPI } from '../../services/api';
import { formatarDataBR } from '../../utils/dateHelpers';
import Tooltip from '../../components/Tooltip';
import './ListaOrganizacoes.css';
import {
  Edit,
  Trash,
  Printer,
  Building2,
  Mail,
  MessageCircle,
  Clipboard,
  Monitor,
  X,
  FileText,
  User,
  FolderOpen,
  Search,
  Archive,
  CheckCircle
} from 'lucide-react';

interface Organizacao {
  id: number;
  nome: string;
  cnpj: string;
  estado: number | null;
  estado_nome?: string;
  municipio: number | null;
  municipio_nome?: string;
  gpsLat: number | null;
  gpsLng: number | null;
  telefone: string | null;
  email: string | null;
  meta_instance_id?: string | null;
  id_tecnico?: number | null;
  tecnico_nome?: string | null;
  tecnico_email?: string | null;
  equipe_tecnica?: Array<{ id_tecnico: number }>;
  validacao_status?: number | null;
  plano_gestao_validacao_status?: number | null;
  removido?: boolean | null;
  // Campos de histórico de validação
  data_criacao?: string | Date | null;
  primeira_alteracao_status?: string | Date | null;
  data_aprovacao?: string | Date | null;
  validador_nome?: string | null;
  validador_email?: string | null;
}


interface ListaOrganizacoesProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'edicao' | 'mapa' | 'planoGestao', organizacaoId?: number) => void;
}

function ListaOrganizacoes({ onNavigate }: ListaOrganizacoesProps) {
  const { user, isCoordinator, isSupervisor, isEditor, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState<number | null>(null);
  const [gerandoPDFPlano, setGerandoPDFPlano] = useState<number | null>(null);
  const [gerandoRelatorio, setGerandoRelatorio] = useState<number | null>(null);
  const [modalArquivosAberto, setModalArquivosAberto] = useState(false);
  const [modalValidacaoAberto, setModalValidacaoAberto] = useState(false);
  const [modalValidacaoPlanoGestaoAberto, setModalValidacaoPlanoGestaoAberto] = useState(false);
  const [organizacaoSelecionada, setOrganizacaoSelecionada] = useState<{ id: number; nome: string } | null>(null);

  // Estados para scroll infinito
  const [todasOrganizacoesFiltradas, setTodasOrganizacoesFiltradas] = useState<Organizacao[]>([]);
  const [organizacoesExibidas, setOrganizacoesExibidas] = useState<Organizacao[]>([]);
  const [itemsPorPagina] = useState(10);
  const [totalOrganizacoes, setTotalOrganizacoes] = useState(0);
  const [legendaVisivel, setLegendaVisivel] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'id', direction: 'desc' });
  const [carregandoMais, setCarregandoMais] = useState(false);
  
  // Filtro de origem do cadastro
  const [origemFiltro, setOrigemFiltro] = useState<'odk' | 'web' | 'todas'>('todas');
  
  // Estado para mostrar organizações removidas
  const [mostrarRemovidas, setMostrarRemovidas] = useState(false);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    nome: '',           // Input text - busca por nome (com debounce)
    estadoId: '',       // Select - filtrar por estado (ID)
    municipioId: '',    // Select - filtrar por município (ID)
    tecnicoId: '',      // Select - filtrar por técnico (user ID)
    statusValidacao: '' // Select - '', '0', '1', '2' (pendente, validado, rejeitado)
  });
  
  // Estado separado para o input de busca (valor temporário)
  const [nomeInput, setNomeInput] = useState('');

  // Estados para popular os selects
  const [estados, setEstados] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  // Funções auxiliares
  const formatarTelefone = (telefone: string | null): string => {
    if (!telefone) return '';
    const tel = telefone.replace(/\D/g, '');
    if (tel.length === 11) {
      return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (tel.length === 10) {
      return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  };

  const getWhatsAppLink = (telefone: string | null): string => {
    if (!telefone) return '';
    const tel = telefone.replace(/\D/g, '');
    return `https://wa.me/55${tel}`;
  };

  useEffect(() => {
    carregarDadosFiltros();
  }, []);

  // Função para executar a busca
  const executarBusca = () => {
    setFiltros(prev => ({ ...prev, nome: nomeInput }));
    // Scroll infinito será resetado automaticamente quando filtros mudarem
  };
  
  // Função para aplicar ordenação
  const aplicarOrdenacao = (organizacoes: Organizacao[]): Organizacao[] => {
    if (!sortConfig) return organizacoes;

    const sorted = [...organizacoes].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'nome':
          aValue = a.nome?.toLowerCase() || '';
          bValue = b.nome?.toLowerCase() || '';
          break;
        case 'estado_nome':
          aValue = a.estado_nome?.toLowerCase() || '';
          bValue = b.estado_nome?.toLowerCase() || '';
          break;
        case 'municipio_nome':
          aValue = a.municipio_nome?.toLowerCase() || '';
          bValue = b.municipio_nome?.toLowerCase() || '';
          break;
        case 'tecnico_nome':
          aValue = a.tecnico_nome?.toLowerCase() || '';
          bValue = b.tecnico_nome?.toLowerCase() || '';
          break;
        case 'data_criacao':
          aValue = a.data_criacao ? new Date(a.data_criacao).getTime() : 0;
          bValue = b.data_criacao ? new Date(b.data_criacao).getTime() : 0;
          break;
        case 'primeira_alteracao_status':
          aValue = a.primeira_alteracao_status ? new Date(a.primeira_alteracao_status).getTime() : 0;
          bValue = b.primeira_alteracao_status ? new Date(b.primeira_alteracao_status).getTime() : 0;
          break;
        case 'data_aprovacao':
          aValue = a.data_aprovacao ? new Date(a.data_aprovacao).getTime() : 0;
          bValue = b.data_aprovacao ? new Date(b.data_aprovacao).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return sorted;
  };

  // Função para carregar mais itens (scroll infinito)
  const carregarMaisItens = () => {
    if (!sortConfig || carregandoMais) return;
    
    setCarregandoMais(true);
    
    // Reordenar todas as organizações filtradas antes de carregar mais
    const organizacoesOrdenadas = aplicarOrdenacao(todasOrganizacoesFiltradas);
    const proximosItens = organizacoesOrdenadas.slice(
      organizacoesExibidas.length,
      organizacoesExibidas.length + itemsPorPagina
    );
    
    setTimeout(() => {
      setOrganizacoesExibidas(prev => [...prev, ...proximosItens]);
      setCarregandoMais(false);
    }, 300);
  };

  // Buscar organizações quando filtros mudarem (reseta scroll infinito)
  useEffect(() => {
    fetchOrganizacoes();
  }, [origemFiltro, filtros, mostrarRemovidas]);

  // Aplicar ordenação quando sortConfig mudar
  useEffect(() => {
    if (todasOrganizacoesFiltradas.length > 0 && sortConfig) {
      const organizacoesOrdenadas = aplicarOrdenacao(todasOrganizacoesFiltradas);
      // Resetar e carregar apenas os primeiros itens ordenados
      setOrganizacoesExibidas(organizacoesOrdenadas.slice(0, itemsPorPagina));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortConfig]);

  // Detectar scroll para carregar mais itens
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500) {
        if (organizacoesExibidas.length < todasOrganizacoesFiltradas.length && !loading && !carregandoMais) {
          carregarMaisItens();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [organizacoesExibidas.length, todasOrganizacoesFiltradas.length, loading, carregandoMais]);

  const gerarRelatorio = async (organizacaoId: number, nomeOrganizacao: string) => {
    setGerandoRelatorio(organizacaoId);
    try {
      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}/relatorio/pdf`, {
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
      link.download = `relatorio_${nomeOrganizacao?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Relatório gerado com sucesso!');
    } catch (error: any) {
      alert(`❌ Erro ao gerar relatório: ${error.message}`);
    } finally {
      setGerandoRelatorio(null);
    }
  };

  const gerarPdfPlanoGestao = async (organizacaoId: number) => {
    setGerandoPDFPlano(organizacaoId);
    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${API_BASE}/organizacoes/${organizacaoId}/plano-gestao/pdf`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Erro ao gerar PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plano-gestao-${organizacaoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao gerar PDF do plano de gestão');
    } finally {
      setGerandoPDFPlano(null);
    }
  };

  const gerarTermoAdesao = async (organizacaoId: number) => {
    try {
      setGerandoPDF(organizacaoId);

      // Buscar dados completos da organização
      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('@pinovara:token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da organização');
      }

      const responseData = await response.json();
      const orgData = responseData.data || responseData; // Ajustar caso os dados venham dentro de 'data'

      // Preparar dados para o PDF
      const dadosPDF: OrganizacaoData = {
        nome: orgData.nome || '',
        cnpj: orgData.cnpj || '',
        endereco: `${orgData.organizacao_end_logradouro || ''} ${orgData.organizacao_end_numero || ''}, ${orgData.organizacao_end_bairro || ''}, CEP: ${orgData.organizacao_end_cep || ''}`.trim(),
        representanteNome: orgData.representante_nome || '',
        representanteCPF: orgData.representante_cpf || '',
        representanteRG: orgData.representante_rg || '',
        representanteFuncao: orgData.representante_funcao || '',
        representanteEndereco: `${orgData.representante_end_logradouro || ''} ${orgData.representante_end_numero || ''}, ${orgData.representante_end_bairro || ''}, CEP: ${orgData.representante_end_cep || ''}`.trim()
      };

      // Gerar PDF
      await PDFService.gerarTermoAdesao(dadosPDF);

    } catch (error) {
      console.error('Erro ao gerar termo de adesão:', error);
      if (error instanceof Error) {
        alert(`Erro ao gerar termo de adesão: ${error.message}`);
      } else {
        alert('Erro ao gerar termo de adesão. Verifique se você está logado e tente novamente.');
      }
    } finally {
      setGerandoPDF(null);
    }
  };

  const abrirModalArquivos = (organizacaoId: number, nomeOrganizacao: string) => {
    setOrganizacaoSelecionada({ id: organizacaoId, nome: nomeOrganizacao });
    setModalArquivosAberto(true);
  };

  const fecharModalArquivos = () => {
    setModalArquivosAberto(false);
    setOrganizacaoSelecionada(null);
  };

  const abrirModalValidacao = (organizacaoId: number, nomeOrganizacao: string) => {
    // Verificar se é coordenador ou admin
    const podeAcessar = isCoordinator() || hasPermission('sistema', 'admin');
    if (!podeAcessar) {
      return; // Apenas coordenadores e admins podem acessar
    }
    setOrganizacaoSelecionada({ id: organizacaoId, nome: nomeOrganizacao });
    setModalValidacaoAberto(true);
  };

  const fecharModalValidacao = () => {
    setModalValidacaoAberto(false);
    setOrganizacaoSelecionada(null);
    // Recarregar a lista para atualizar os badges de validação
    fetchOrganizacoes();
  };

  const abrirModalValidacaoPlanoGestao = (organizacaoId: number, nomeOrganizacao: string) => {
    // Verificar se é coordenador ou admin
    const podeAcessar = isCoordinator() || hasPermission('sistema', 'admin');
    if (!podeAcessar) {
      return; // Apenas coordenadores e admins podem acessar
    }
    setOrganizacaoSelecionada({ id: organizacaoId, nome: nomeOrganizacao });
    setModalValidacaoPlanoGestaoAberto(true);
  };

  const fecharModalValidacaoPlanoGestao = () => {
    setModalValidacaoPlanoGestaoAberto(false);
    setOrganizacaoSelecionada(null);
    // Recarregar a lista para atualizar os badges de validação
    fetchOrganizacoes();
  };

  const carregarDadosFiltros = async () => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      // Buscar todas as organizações para extrair estados, municípios e técnicos únicos
      const orgResponse = await fetch(`${API_BASE}/organizacoes?page=1&pageSize=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        const todasOrgs = orgData.data.organizacoes || [];
        
        // Carregar todos estados e municípios
        const estadosData = await auxiliarAPI.getEstados();
        const municipiosData = await auxiliarAPI.getMunicipios();
        
        // Filtrar apenas estados que têm organizações
        const estadosComOrgs = new Set(todasOrgs.map((org: any) => org.estado).filter(Boolean));
        const estadosFiltrados = estadosData.filter(e => estadosComOrgs.has(e.id));
        setEstados(estadosFiltrados);
        
        // Filtrar apenas municípios que têm organizações
        const municipiosComOrgs = new Set(todasOrgs.map((org: any) => org.municipio).filter(Boolean));
        const municipiosFiltrados = municipiosData.filter(m => municipiosComOrgs.has(m.id));
        setMunicipios(municipiosFiltrados);
        
        // Carregar usuários e filtrar apenas técnicos (role tecnico)
        const usersResponse = await fetch(`${API_BASE}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const allUsers = usersData.data?.users || [];
          
          // Filtrar apenas usuários com role 'tecnico' no módulo 'organizacoes'
          const tecnicosRole = allUsers.filter((user: any) => 
            user.roles?.some((role: any) => 
              role.name === 'tecnico' && role.module?.name === 'organizacoes'
            )
          );
          
          setTecnicos(tecnicosRole);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos filtros:', error);
    }
  };

  const fetchOrganizacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');

      // Buscar TODAS as organizações (sem paginação) para poder filtrar no frontend
      const params = new URLSearchParams({
        page: '1',
        pageSize: '1000', // Buscar todas
        ...(mostrarRemovidas ? { incluirRemovidas: 'true' } : {})
      });

      const response = await fetch(`${API_BASE}/organizacoes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar organizações');
      }

      const data = await response.json();
      let todasOrganizacoes = data.data.organizacoes || [];
      
      console.log(`📊 Debug Filtro:`);
      console.log(`   Backend retornou: ${todasOrganizacoes.length} organizações`);
      
      // 1. Aplicar filtros locais
      if (filtros.nome) {
        todasOrganizacoes = todasOrganizacoes.filter((org: Organizacao) =>
          org.nome.toLowerCase().includes(filtros.nome.toLowerCase())
        );
        console.log(`   Após filtro nome: ${todasOrganizacoes.length}`);
      }

      if (filtros.estadoId) {
        const estadoIdNum = parseInt(filtros.estadoId);
        todasOrganizacoes = todasOrganizacoes.filter((org: Organizacao) =>
          org.estado === estadoIdNum
        );
        console.log(`   Após filtro estado: ${todasOrganizacoes.length}`);
      }

      if (filtros.municipioId) {
        const municipioIdNum = parseInt(filtros.municipioId);
        todasOrganizacoes = todasOrganizacoes.filter((org: Organizacao) =>
          org.municipio === municipioIdNum
        );
        console.log(`   Após filtro município: ${todasOrganizacoes.length}`);
      }

      if (filtros.tecnicoId) {
        const tecnicoIdNum = parseInt(filtros.tecnicoId);
        todasOrganizacoes = todasOrganizacoes.filter((org: Organizacao) =>
          org.id_tecnico === tecnicoIdNum
        );
        console.log(`   Após filtro técnico: ${todasOrganizacoes.length}`);
      }

      if (filtros.statusValidacao !== '') {
        // Filtrar por status específico (1=Não validado, 2=Validado, 3=Pendência, 4=Reprovado)
        const statusNum = parseInt(filtros.statusValidacao);
        todasOrganizacoes = todasOrganizacoes.filter((org: Organizacao) =>
          org.validacao_status === statusNum
        );
        console.log(`   Após filtro status: ${todasOrganizacoes.length}`);
      }
      
      // 2. Aplicar filtro de origem
      console.log(`   Filtro origem selecionado: ${origemFiltro}`);
      if (origemFiltro === 'odk') {
        todasOrganizacoes = todasOrganizacoes.filter((org: Organizacao) => 
          org.meta_instance_id && org.meta_instance_id.trim() !== ''
        );
        console.log(`   Após filtro ODK: ${todasOrganizacoes.length}`);
      } else if (origemFiltro === 'web') {
        todasOrganizacoes = todasOrganizacoes.filter((org: Organizacao) => 
          !org.meta_instance_id || org.meta_instance_id.trim() === ''
        );
        console.log(`   Após filtro Web: ${todasOrganizacoes.length}`);
      }
      
      // 3. Guardar todas as organizações filtradas (sem ordenar ainda, será ordenado pelo useEffect)
      setTodasOrganizacoesFiltradas(todasOrganizacoes);
      setTotalOrganizacoes(todasOrganizacoes.length);
      
      // 4. Aplicar ordenação e carregar apenas os primeiros itens (scroll infinito)
      const organizacoesOrdenadas = aplicarOrdenacao(todasOrganizacoes);
      setOrganizacoesExibidas(organizacoesOrdenadas.slice(0, itemsPorPagina));
    } catch (err) {
      console.error('Erro ao carregar organizações:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleExcluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta organização?')) return;

    try {
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/organizacoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir organização');
      }

      // Recarregar lista
      fetchOrganizacoes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  // Handler para ordenação no DataGrid (desabilitado - fazemos ordenação externa)
  // Não precisamos deste handler, a ordenação é feita externamente via sortConfig


  // Helpers de acesso
  const userIdNum = user?.id != null ? Number(user.id) : null;
  const isAdmin = hasPermission('sistema', 'admin');
  const podeAcessarPlanoGestao = (record: Organizacao) => {
    if (userIdNum == null) return false;
    if (isAdmin) return true;
    if (isEditor()) return true;
    if (record.id_tecnico === userIdNum) return true;
    const equipe = record.equipe_tecnica || [];
    return equipe.some((m) => m.id_tecnico === userIdNum);
  };
  const podeExcluir = (record: Organizacao) => userIdNum != null && record.id_tecnico === userIdNum;

  const btn = (color: string) => ({
    padding: '6px 8px',
    border: `1px solid ${color}`,
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  });

  // Definição das colunas da DataGrid
  const columns: DataGridColumn<Organizacao>[] = [
    {
      key: 'actions',
      title: 'Ações',
      width: '140px',
      align: 'left',
      render: (_, record: Organizacao) => {
        const podeValidar = isCoordinator() || hasPermission('sistema', 'admin');
        const podeEditar = isEditor() || (!isCoordinator() && !isSupervisor());
        const podePlano = podeAcessarPlanoGestao(record);
        const podeDel = podeExcluir(record);

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
            {podeEditar && (
              <Tooltip text="Editar Perfil de Entrada" backgroundColor="#3b2313" delay={0}>
                <Link to={`/organizacoes/edicao/${record.id}`} style={{ ...btn('#3b2313'), textDecoration: 'none' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#3b2313'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#3b2313'; }}>
                  <Edit size={16} />
                </Link>
              </Tooltip>
            )}
            {podePlano && (
              <Tooltip text="Editar Plano de Gestão" backgroundColor="#8b5cf6" delay={0}>
                <Link to={`/organizacoes/plano-gestao/${record.id}`} style={{ ...btn('#8b5cf6'), textDecoration: 'none' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#8b5cf6'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#8b5cf6'; }}>
                  <Edit size={16} />
                </Link>
              </Tooltip>
            )}
            <Tooltip text="Perfil de Entrada (PDF)" backgroundColor="#056839" delay={0}>
              <button onClick={() => gerarRelatorio(record.id, record.nome)} disabled={gerandoRelatorio === record.id}
                style={{ ...btn(gerandoRelatorio === record.id ? '#ccc' : '#056839'), cursor: gerandoRelatorio === record.id ? 'not-allowed' : 'pointer' }}
                onMouseOver={(e) => { if (gerandoRelatorio !== record.id) { e.currentTarget.style.background = '#056839'; e.currentTarget.style.color = 'white'; } }}
                onMouseOut={(e) => { if (gerandoRelatorio !== record.id) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#056839'; } }}>
                <FileText size={16} />
              </button>
            </Tooltip>
            <Tooltip text="Plano de Gestão (PDF)" backgroundColor="#8b5cf6" delay={0}>
              <button onClick={() => gerarPdfPlanoGestao(record.id)} disabled={gerandoPDFPlano === record.id}
                style={{ ...btn(gerandoPDFPlano === record.id ? '#ccc' : '#8b5cf6'), cursor: gerandoPDFPlano === record.id ? 'not-allowed' : 'pointer' }}
                onMouseOver={(e) => { if (gerandoPDFPlano !== record.id) { e.currentTarget.style.background = '#8b5cf6'; e.currentTarget.style.color = 'white'; } }}
                onMouseOut={(e) => { if (gerandoPDFPlano !== record.id) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#8b5cf6'; } }}>
                <FileText size={16} />
              </button>
            </Tooltip>
            <Tooltip text="Arquivos" backgroundColor="#f59e0b" delay={0}>
              <button onClick={() => abrirModalArquivos(record.id, record.nome)} style={btn('#f59e0b')}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#f59e0b'; }}>
                <FolderOpen size={16} />
              </button>
            </Tooltip>
            {podeValidar && (
              <Tooltip text="Validar Perfil de Entrada" backgroundColor="#056839" delay={0}>
                <button onClick={() => abrirModalValidacao(record.id, record.nome)} style={btn('#056839')}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#056839'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#056839'; }}>
                  <CheckCircle size={16} />
                </button>
              </Tooltip>
            )}
            {podeValidar && (
              <Tooltip text="Validar Plano de Gestão" backgroundColor="#8b5cf6" delay={0}>
                <button onClick={() => abrirModalValidacaoPlanoGestao(record.id, record.nome)} style={btn('#8b5cf6')}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#8b5cf6'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#8b5cf6'; }}>
                  <CheckCircle size={16} />
                </button>
              </Tooltip>
            )}
            <Tooltip text="Termo de Adesão" backgroundColor="#28a745" delay={0}>
              <button onClick={() => gerarTermoAdesao(record.id)} disabled={gerandoPDF === record.id}
                style={{ ...btn(gerandoPDF === record.id ? '#ccc' : '#28a745'), cursor: gerandoPDF === record.id ? 'not-allowed' : 'pointer' }}
                onMouseOver={(e) => { if (gerandoPDF !== record.id) { e.currentTarget.style.background = '#28a745'; e.currentTarget.style.color = 'white'; } }}
                onMouseOut={(e) => { if (gerandoPDF !== record.id) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#28a745'; } }}>
                <Printer size={16} />
              </button>
            </Tooltip>
            {podeDel && (
              <Tooltip text="Excluir organização" backgroundColor="#dc2626" delay={0}>
                <button onClick={() => handleExcluir(record.id)} style={btn('#dc2626')}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#dc2626'; }}>
                  <Trash size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: '5%',
      sortable: true,
      align: 'center',
      render: (id: number) => (
        <span style={{ fontWeight: '600', color: '#666', fontSize: '13px' }}>{id}</span>
      ),
    },
    {
      key: 'nome',
      title: 'Nome',
      dataIndex: 'nome',
      width: '35%',
      sortable: true,
      render: (nome: string, record: Organizacao) => {
        const isODKCollect = record.meta_instance_id && record.meta_instance_id.trim() !== '';
        const isRemovida = record.removido === true;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRemovida && (
              <span title="Organização removida" style={{ flexShrink: 0, display: 'inline-flex' }}>
                <Archive size={16} color="#dc2626" />
              </span>
            )}
            <span 
              title={isODKCollect ? 'Cadastrado via ODK Collect (aplicativo)' : 'Cadastrado via sistema web'}
              style={{ display: 'inline-flex', flexShrink: 0, minWidth: '16px', minHeight: '16px' }}
            >
              {isODKCollect ? (
                <Clipboard size={16} color="#8b4513" />
              ) : (
                <Monitor size={16} color="#056839" />
              )}
            </span>
            <span style={{ fontWeight: '500' }}>{nome || '-'}</span>
          </div>
        );
      },
    },
    {
      key: 'localizacao',
      title: 'Localização',
      dataIndex: 'estado_nome',
      width: '16%',
      render: (_: any, record: Organizacao) => {
        // Obter sigla do estado
        const estadoNome = record.estado_nome || '';
        const siglasEstados: { [key: string]: string } = {
          'Bahia': 'BA', 'São Paulo': 'SP', 'Minas Gerais': 'MG', 'Espírito Santo': 'ES',
          'Rio de Janeiro': 'RJ', 'Paraná': 'PR', 'Santa Catarina': 'SC', 'Rio Grande do Sul': 'RS'
        };
        const estadoSigla = siglasEstados[estadoNome] || estadoNome;
        
        // Remover estado duplicado do município
        let municipio = record.municipio_nome || '';
        if (municipio && municipio.includes(' - ')) {
          const partes = municipio.split(' - ');
          municipio = partes[partes.length - 1];
        }
        
        return (
          <span style={{ fontSize: '13px' }}>
            {estadoSigla && municipio ? `${estadoSigla} - ${municipio}` : (estadoSigla || municipio || '-')}
          </span>
        );
      },
    },
    {
      key: 'informacoes',
      title: 'Informações',
      width: '20%',
      align: 'left',
      render: (_: any, record: Organizacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} color="#64748b" />
            <span><strong>Criado por:</strong> {record.tecnico_nome || 'Não informado'}</span>
          </div>
          {record.data_criacao && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
              <span><strong>Em:</strong> {formatarDataBR(record.data_criacao)}</span>
            </div>
          )}
          {(record.telefone || record.email) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {record.telefone && (
                <a href={getWhatsAppLink(record.telefone)} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#25D366', textDecoration: 'none', fontSize: '12px' }}
                  title="WhatsApp">
                  <MessageCircle size={12} />
                  {formatarTelefone(record.telefone)}
                </a>
              )}
              {record.email && (
                <a href={`mailto:${record.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', textDecoration: 'none', fontSize: '12px' }} title="E-mail">
                  <Mail size={12} />
                  {record.email}
                </a>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'validacao',
      title: 'Validação',
      dataIndex: 'validacao_status',
      width: '12%',
      align: 'center',
      render: (validacao_status: number | null, record: Organizacao) => {
        const podeAcessar = isCoordinator() || hasPermission('sistema', 'admin');
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              onClick={() => abrirModalValidacao(record.id, record.nome)}
              style={{
                cursor: podeAcessar ? 'pointer' : 'default',
                display: 'inline-block',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                if (podeAcessar) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={podeAcessar ? 'Clique para gerenciar validação do cadastro' : 'Validação do cadastro (apenas coordenadores e admins podem editar)'}
            >
              <StatusValidacaoBadge status={validacao_status} showLabel={false} prefix="CADASTRO" />
            </div>
            <div
              onClick={() => abrirModalValidacaoPlanoGestao(record.id, record.nome)}
              style={{
                cursor: podeAcessar ? 'pointer' : 'default',
                display: 'inline-block',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                if (podeAcessar) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={podeAcessar ? 'Clique para gerenciar validação do plano de gestão' : 'Validação do plano de gestão (apenas coordenadores e admins podem editar)'}
            >
              <StatusPlanoGestaoValidacaoBadge status={record.plano_gestao_validacao_status ?? null} showLabel={false} prefix="P. GESTÃO" />
            </div>
          </div>
        );
      },
    },
  ];


  if (loading) {
    return (
      <div className="lista-organizacoes-module">
        <div className="lista-organizacoes-loading">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.5rem' }}>
            <Building2 size={24} /> Lista de Organizações
          </h2>
          <div className="loading-spinner">Carregando organizações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-organizacoes-module">
      {/* Header */}
      <div className="lista-organizacoes-header">
        <h2>
          <Building2 size={24} /> Lista de Organizações
        </h2>
        {!isCoordinator() && (
          <button
            onClick={() => onNavigate('cadastro')}
            className="btn btn-primary"
          >
            + Nova Organização
          </button>
        )}
      </div>

      <div className="lista-organizacoes-content">
      {/* Seção de Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          {/* Busca por nome */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filtro-nome">Nome</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
              <input
                id="filtro-nome"
                type="text"
                placeholder="Buscar por nome..."
                value={nomeInput}
                onChange={(e) => {
                  setNomeInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    executarBusca();
                  }
                }}
                className="filter-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={executarBusca}
                className="btn btn-primary"
                style={{
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 'auto',
                  height: 'auto'
                }}
                title="Buscar"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Select Estado */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filtro-estado">Estado</label>
            <select
              id="filtro-estado"
              className="filter-select"
              value={filtros.estadoId}
              onChange={(e) => {
                setFiltros({ ...filtros, estadoId: e.target.value });
              }}
            >
              <option value="">Todos os estados</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.id}>
                  {estado.uf} - {estado.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Select Município */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filtro-municipio">Município</label>
            <select
              id="filtro-municipio"
              className="filter-select"
              value={filtros.municipioId}
              onChange={(e) => {
                setFiltros({ ...filtros, municipioId: e.target.value });
              }}
            >
              <option value="">Todos os municípios</option>
              {municipios.map(municipio => (
                <option key={municipio.id} value={municipio.id}>
                  {municipio.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Select Técnico */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filtro-tecnico">Técnico</label>
            <select
              id="filtro-tecnico"
              className="filter-select"
              value={filtros.tecnicoId}
              onChange={(e) => {
                setFiltros({ ...filtros, tecnicoId: e.target.value });
              }}
            >
              <option value="">Todos os técnicos</option>
              {tecnicos.map(tecnico => (
                <option key={tecnico.id} value={tecnico.id}>
                  {tecnico.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Status Validação */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filtro-status">Status</label>
            <select
              id="filtro-status"
              className="filter-select"
              value={filtros.statusValidacao}
              onChange={(e) => {
                setFiltros({ ...filtros, statusValidacao: e.target.value });
              }}
            >
              <option value="">Todos os status</option>
              <option value="1">Não validado</option>
              <option value="2">Validado</option>
              <option value="3">Pendência</option>
              <option value="4">Reprovado</option>
            </select>
          </div>

          {/* Botões de Ação */}
          <div className="filters-actions">
            <button
              type="button"
              className={`btn btn-sm ${mostrarRemovidas ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                setMostrarRemovidas(!mostrarRemovidas);
              }}
              title={mostrarRemovidas ? "Ocultar organizações removidas" : "Mostrar organizações removidas"}
            >
              <Archive size={16} /> {mostrarRemovidas ? 'Ocultar Removidas' : 'Mostrar Removidas'}
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                setFiltros({ nome: '', estadoId: '', municipioId: '', tecnicoId: '', statusValidacao: '' });
                setOrigemFiltro('todas');
                setMostrarRemovidas(false);
              }}
              title="Limpar todos os filtros"
            >
              <X size={16} /> Limpar filtros
            </button>
          </div>
        </div>
        
        {/* Total de organizações */}
        <div className="filters-total">
          <span>Total: <strong>{totalOrganizacoes}</strong> organização(ões)</span>
        </div>
      </div>

      {/* Legenda Flutuante (oculta em mobile) */}
      {legendaVisivel && (
        <div className="lista-organizacoes-legenda" style={{
          position: 'fixed',
          bottom: '120px',
          right: '0px',
          background: 'white',
          border: '1px solid #3b2313',
          borderRadius: '8px',
          padding: '8px 10px',
          boxShadow: '0 2px 8px rgba(59, 35, 19, 0.15)',
          zIndex: 999,
          fontSize: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <div style={{ fontWeight: '600', color: '#374151', fontSize: '0.85rem' }}>
              Origem
            </div>
            <button
              onClick={() => setLegendaVisivel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                color: '#9ca3af',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              title="Fechar"
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clipboard size={14} color="#8b4513" />
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>ODK Collect</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Monitor size={14} color="#056839" />
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Sistema Web</span>
            </div>
          </div>
        </div>
      )}

      {/* DataGrid - Desktop */}
      <div className="desktop-only lista-organizacoes-datagrid-wrapper">
        <DataGrid<Organizacao>
            columns={columns}
            dataSource={organizacoesExibidas}
            rowKey="id"
            loading={loading}
            emptyState={{
              title: 'Nenhuma organização encontrada',
              description: 'Não foram encontradas organizações que correspondam aos filtros selecionados.',
              action: {
                label: 'Cadastrar primeira organização',
                onClick: () => onNavigate('cadastro'),
              },
            }}
            responsive={true}
            size="small"
            className="organizacoes-datagrid"
            externalSort={true}
            externalSortConfig={sortConfig}
            onSortChange={(key, direction) => {
              setSortConfig({ key, direction });
              // Resetar scroll ao ordenar
              window.scrollTo(0, 0);
            }}
          />
        {/* Indicador de scroll infinito */}
          {organizacoesExibidas.length < totalOrganizacoes && (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              {carregandoMais && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #3b2313',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              <span>Mostrando {organizacoesExibidas.length} de {totalOrganizacoes} organizações. Role para carregar mais...</span>
            </div>
          )}
      </div>

      {/* Layout Mobile/Tablet - Cards */}
      <div className="mobile-only">
        <div className="organizations-cards">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Carregando organizações...
            </div>
          ) : organizacoesExibidas.length === 0 ? (
            <div style={{ 
              padding: '3rem 1rem', 
              textAlign: 'center', 
              background: 'white',
              borderRadius: '8px',
              border: '2px dashed #e5e7eb'
            }}>
              <Building2 size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Nenhuma organização encontrada</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                {filtros.nome || filtros.estadoId || filtros.municipioId || filtros.tecnicoId || filtros.statusValidacao
                  ? 'Não foram encontradas organizações que correspondam aos filtros selecionados.'
                  : 'Não há organizações cadastradas no sistema ainda.'}
              </p>
              {!isCoordinator() && (
                <button
                  onClick={() => onNavigate('cadastro')}
                  className="btn btn-primary"
                >
                  Cadastrar primeira organização
                </button>
              )}
            </div>
          ) : (
            organizacoesExibidas.map((org) => (
            <div key={org.id} className="organization-card">
              <div className="organization-card-header">
                <div className="organization-info">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {org.removido && (
                      <span title="Organização removida">
                        <Archive size={18} color="#dc2626" />
                      </span>
                    )}
                    {org.nome}
                  </h4>
                  <div className="organization-meta">
                    <span>
                      📍 {org.estado_nome && org.municipio_nome 
                        ? `${org.estado_nome} - ${org.municipio_nome}`
                        : org.estado_nome || org.municipio_nome || 'Localização não informada'}
                    </span>
                    {org.tecnico_nome && (
                      <span>
                        <User size={14} /> {org.tecnico_nome}
                      </span>
                    )}
                    <span>
                      {org.meta_instance_id ? '📋 ODK Collect' : '💻 Sistema Web'}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      <StatusValidacaoBadge status={org.validacao_status ?? null} prefix="CADASTRO" />
                      <StatusPlanoGestaoValidacaoBadge status={org.plano_gestao_validacao_status ?? null} prefix="P. GESTÃO" />
                    </div>
                  </div>
                </div>
                <div className="organization-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {(isEditor() || (!isCoordinator() && !isSupervisor())) && (
                    <Link to={`/organizacoes/edicao/${org.id}`} title="Editar Perfil de Entrada" style={{ color: '#3b2313', display: 'flex', padding: '8px', textDecoration: 'none' }}>
                      <Edit size={16} />
                    </Link>
                  )}
                  {podeAcessarPlanoGestao(org) && (
                    <Link to={`/organizacoes/plano-gestao/${org.id}`} title="Editar Plano de Gestão" style={{ color: '#8b5cf6', display: 'flex', padding: '8px', textDecoration: 'none' }}>
                      <Edit size={16} />
                    </Link>
                  )}
                  <button onClick={() => gerarRelatorio(org.id, org.nome)} disabled={gerandoRelatorio === org.id} title="Perfil de Entrada (PDF)" style={{ color: '#056839', display: 'flex', padding: '8px', opacity: gerandoRelatorio === org.id ? 0.5 : 1 }}>
                    <FileText size={16} />
                  </button>
                  <button onClick={() => gerarPdfPlanoGestao(org.id)} disabled={gerandoPDFPlano === org.id} title="Plano de Gestão (PDF)" style={{ color: '#8b5cf6', display: 'flex', padding: '8px', opacity: gerandoPDFPlano === org.id ? 0.5 : 1 }}>
                    <FileText size={16} />
                  </button>
                  <button onClick={() => abrirModalArquivos(org.id, org.nome)} title="Arquivos" style={{ color: '#f59e0b', display: 'flex', padding: '8px' }}>
                    <FolderOpen size={16} />
                  </button>
                  {(isCoordinator() || hasPermission('sistema', 'admin')) && (
                    <button onClick={() => abrirModalValidacao(org.id, org.nome)} title="Validar Perfil de Entrada" style={{ color: '#056839', display: 'flex', padding: '8px' }}>
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {(isCoordinator() || hasPermission('sistema', 'admin')) && (
                    <button onClick={() => abrirModalValidacaoPlanoGestao(org.id, org.nome)} title="Validar Plano de Gestão" style={{ color: '#8b5cf6', display: 'flex', padding: '8px' }}>
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button onClick={() => gerarTermoAdesao(org.id)} disabled={gerandoPDF === org.id} title="Termo de Adesão" style={{ color: '#28a745', display: 'flex', padding: '8px', opacity: gerandoPDF === org.id ? 0.5 : 1 }}>
                    <Printer size={16} />
                  </button>
                  {podeExcluir(org) && (
                    <button onClick={() => handleExcluir(org.id)} title="Excluir" style={{ color: '#dc2626', display: 'flex', padding: '8px' }}>
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
      
      {/* Indicador de scroll infinito Mobile */}
      <div className="mobile-only">
        {!loading && organizacoesExibidas.length > 0 && organizacoesExibidas.length < totalOrganizacoes && (
          <div className="scroll-infinito-mobile">
            Mostrando {organizacoesExibidas.length} de {totalOrganizacoes} organizações. Role para carregar mais...
          </div>
        )}
      </div>

      </div>
      {/* fim lista-organizacoes-content */}

      {/* Modal de Arquivos */}
      {modalArquivosAberto && organizacaoSelecionada && (
        <ModalArquivos
          organizacaoId={organizacaoSelecionada.id}
          organizacaoNome={organizacaoSelecionada.nome}
          onClose={fecharModalArquivos}
        />
      )}

      {/* Modal de Validação */}
      {modalValidacaoAberto && organizacaoSelecionada && (
        <ModalValidacao
          organizacaoId={organizacaoSelecionada.id}
          organizacaoNome={organizacaoSelecionada.nome}
          onClose={fecharModalValidacao}
        />
      )}

      {modalValidacaoPlanoGestaoAberto && organizacaoSelecionada && (
        <ModalValidacaoPlanoGestao
          organizacaoId={organizacaoSelecionada.id}
          organizacaoNome={organizacaoSelecionada.nome}
          onClose={fecharModalValidacaoPlanoGestao}
        />
      )}
    </div>
  );
}

export default ListaOrganizacoes;
