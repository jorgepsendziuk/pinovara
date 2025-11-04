import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PDFService, OrganizacaoData } from '../../services/pdfService';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import { StatusValidacaoBadge } from '../../utils/validacaoHelpers';
import { ModalArquivos } from '../../components/organizacoes/ModalArquivos';
import ModalValidacao from '../../components/organizacoes/ModalValidacao';
import { auxiliarAPI } from '../../services/api';
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
  ClipboardList
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
  validacao_status?: number | null;
}


interface ListaOrganizacoesProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'edicao' | 'mapa' | 'planoGestao', organizacaoId?: number) => void;
}

function ListaOrganizacoes({ onNavigate }: ListaOrganizacoesProps) {
  const { isCoordinator, isSupervisor, hasPermission } = useAuth();
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState<number | null>(null);
  const [gerandoRelatorio, setGerandoRelatorio] = useState<number | null>(null);
  const [modalArquivosAberto, setModalArquivosAberto] = useState(false);
  const [modalValidacaoAberto, setModalValidacaoAberto] = useState(false);
  const [organizacaoSelecionada, setOrganizacaoSelecionada] = useState<{ id: number; nome: string } | null>(null);

  // Estados para DataGrid
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrganizacoes, setTotalOrganizacoes] = useState(0);
  const [legendaVisivel, setLegendaVisivel] = useState(true);
  
  // Filtro de origem do cadastro
  const [origemFiltro, setOrigemFiltro] = useState<'odk' | 'web' | 'todas'>('todas');

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    nome: '',           // Input text - busca por nome
    estadoId: '',       // Select - filtrar por estado (ID)
    municipioId: '',    // Select - filtrar por município (ID)
    tecnicoId: '',      // Select - filtrar por técnico (user ID)
    statusValidacao: '' // Select - '', '0', '1', '2' (pendente, validado, rejeitado)
  });

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

  useEffect(() => {
    fetchOrganizacoes();
  }, [currentPage, pageSize, origemFiltro, filtros]);

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
        pageSize: '1000' // Buscar todas
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
      
      // 3. ORDENAR DESC POR ID (mais recente primeiro)
      todasOrganizacoes = todasOrganizacoes.sort((a, b) => b.id - a.id);
      
      // 4. Aplicar paginação no frontend
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const organizacoesPaginadas = todasOrganizacoes.slice(startIndex, endIndex);
      
      console.log(`   Paginação: página ${currentPage}, mostrando ${organizacoesPaginadas.length} de ${todasOrganizacoes.length}`);
      
      setOrganizacoes(organizacoesPaginadas);
      setTotalOrganizacoes(todasOrganizacoes.length);
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

  // Handlers para DataGrid
  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };


  // Definição das colunas da DataGrid
  const columns: DataGridColumn<Organizacao>[] = [
    {
      key: 'actions',
      title: 'Ações',
      width: '20%',
      align: 'center',
      render: (_, record: Organizacao) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isCoordinator() && !isSupervisor() && (
            <button
              onClick={() => onNavigate('edicao', record.id)}
              title="Editar organização"
              style={{ 
                padding: '6px 8px', 
                border: '1px solid #3b2313', 
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer', 
                color: '#3b2313',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#3b2313';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#3b2313';
              }}
            >
              <Edit size={14} />
            </button>
          )}
          <button
            onClick={() => gerarRelatorio(record.id, record.nome)}
            title="Gerar Relatório Completo"
            disabled={gerandoRelatorio === record.id}
            style={{
              padding: '6px 8px',
              border: '1px solid #056839',
              background: 'white',
              borderRadius: '4px',
              cursor: gerandoRelatorio === record.id ? 'not-allowed' : 'pointer',
              color: gerandoRelatorio === record.id ? '#ccc' : '#056839',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (gerandoRelatorio !== record.id) {
                e.currentTarget.style.background = '#056839';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              if (gerandoRelatorio !== record.id) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#056839';
              }
            }}
          >
            <FileText size={14} />
          </button>
          <button
            onClick={() => onNavigate('planoGestao', record.id)}
            title="Plano de Gestão"
            style={{
              padding: '6px 8px',
              border: '1px solid #8b5cf6',
              background: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#8b5cf6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#8b5cf6';
            }}
          >
            <ClipboardList size={14} />
          </button>
          <button
            onClick={() => abrirModalArquivos(record.id, record.nome)}
            title="Ver Arquivos Anexados"
            style={{
              padding: '6px 8px',
              border: '1px solid #f59e0b',
              background: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f59e0b';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#f59e0b';
            }}
          >
            <FolderOpen size={14} />
          </button>
          <button
            onClick={() => gerarTermoAdesao(record.id)}
            title="Imprimir Termo de Adesão"
            disabled={gerandoPDF === record.id}
            style={{
              padding: '6px 8px',
              border: '1px solid #28a745',
              background: 'white',
              borderRadius: '4px',
              cursor: gerandoPDF === record.id ? 'not-allowed' : 'pointer',
              color: gerandoPDF === record.id ? '#ccc' : '#28a745',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
              opacity: gerandoPDF === record.id ? 0.5 : 1
            }}
            onMouseOver={(e) => {
              if (gerandoPDF !== record.id) {
                e.currentTarget.style.background = '#28a745';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              if (gerandoPDF !== record.id) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#28a745';
              }
            }}
          >
            <Printer size={14} />
          </button>
          {!isCoordinator() && (
            <button
              onClick={() => handleExcluir(record.id)}
              title="Excluir organização"
              style={{ 
                padding: '6px 8px', 
                border: '1px solid #dc3545', 
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer', 
                color: '#dc3545',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#dc3545';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#dc3545';
              }}
            >
              <Trash size={14} />
            </button>
          )}
        </div>
      ),
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
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
      key: 'tecnico',
      title: 'Técnico',
      dataIndex: 'tecnico_nome',
      width: '14%',
      responsive: {
        hideOn: 'mobile'
      },
      render: (tecnico_nome: string | null, record: Organizacao) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          {tecnico_nome ? (
            <>
              <User size={14} color="#666" />
              <span style={{ color: '#444', fontWeight: '500' }} title={record.tecnico_email || undefined}>
                {tecnico_nome}
              </span>
            </>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>Sem técnico</span>
          )}
        </div>
      ),
    },
    {
      key: 'validacao',
      title: 'Validação',
      dataIndex: 'validacao_status',
      width: '10%',
      align: 'center',
      render: (validacao_status: number | null, record: Organizacao) => {
        const podeAcessar = isCoordinator() || hasPermission('sistema', 'admin');
        return (
          <div
            onClick={() => abrirModalValidacao(record.id, record.nome)}
            style={{
              cursor: podeAcessar ? 'pointer' : 'default',
              display: 'inline-block',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              if (podeAcessar) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={podeAcessar ? 'Clique para gerenciar validação' : 'Validação (apenas coordenadores e admins podem editar)'}
          >
            <StatusValidacaoBadge status={validacao_status} showLabel={false} />
          </div>
        );
      },
    },
    {
      key: 'contato',
      title: 'Contato',
      dataIndex: 'telefone',
      width: '14%',
      responsive: {
        hideOn: 'mobile'
      },
      render: (telefone: string, record: Organizacao) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          {telefone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <a 
                href={getWhatsAppLink(telefone)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  color: '#25D366', 
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                title="Abrir no WhatsApp"
              >
                <MessageCircle size={14} />
                {formatarTelefone(telefone)}
              </a>
            </div>
          )}
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <a 
                href={`mailto:${record.email}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  color: '#666', 
                  textDecoration: 'none'
                }}
                title="Enviar e-mail"
              >
                <Mail size={14} />
                {record.email}
              </a>
            </div>
          )}
          {!telefone && !record.email && <span style={{ color: '#999' }}>-</span>}
        </div>
      ),
    },
  ];


  if (loading) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.5rem' }}>
          <Building2 size={24} /> Lista de Organizações
        </h2>
        <div className="loading-spinner">Carregando organizações...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '100%' }}>
      {/* Header simples e compacto */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.5rem' }}>
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

      {/* Seção de Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          {/* Busca por nome */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="filtro-nome">Nome</label>
            <input
              id="filtro-nome"
              type="text"
              placeholder="Buscar por nome..."
              value={filtros.nome}
              onChange={(e) => {
                setFiltros({ ...filtros, nome: e.target.value });
                setCurrentPage(1);
              }}
              className="filter-input"
            />
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
                setCurrentPage(1);
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
                setCurrentPage(1);
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
                setCurrentPage(1);
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
                setCurrentPage(1);
              }}
            >
              <option value="">Todos os status</option>
              <option value="1">Não validado</option>
              <option value="2">Validado</option>
              <option value="3">Pendência</option>
              <option value="4">Reprovado</option>
            </select>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="filters-actions">
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                setFiltros({ nome: '', estadoId: '', municipioId: '', tecnicoId: '', statusValidacao: '' });
                setOrigemFiltro('todas');
                setCurrentPage(1);
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

      {/* Legenda Flutuante */}
      {legendaVisivel && (
        <div style={{
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

      {/* DataGrid */}
      {/* Layout Desktop - DataGrid */}
      <div className="desktop-only" style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <DataGrid<Organizacao>
            columns={columns}
            dataSource={organizacoes}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalOrganizacoes,
              showSizeChanger: true,
              onChange: handlePaginationChange,
            }}
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
          />
      </div>

      {/* Layout Mobile/Tablet - Cards */}
      <div className="mobile-only">
        <div className="organizations-cards">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Carregando organizações...
            </div>
          ) : organizacoes.length === 0 ? (
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
            organizacoes.map((org) => (
            <div key={org.id} className="organization-card">
              <div className="organization-card-header">
                <div className="organization-info">
                  <h4>{org.nome}</h4>
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
                    <div>
                      <StatusValidacaoBadge status={org.validacao_status} />
                    </div>
                  </div>
                </div>
                <div className="organization-actions">
                  <button
                    onClick={() => onNavigate('edicao', org.id)}
                    title="Editar"
                    style={{ color: '#3b82f6', borderColor: '#3b82f6' }}
                  >
                    <Edit size={16} />
                  </button>
                  
                  {(isCoordinator() || hasPermission('sistema', 'admin')) && (
                    <button
                      onClick={() => abrirModalValidacao(org.id, org.nome)}
                      title="Validar"
                      style={{ color: '#10b981', borderColor: '#10b981' }}
                    >
                      <Clipboard size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => gerarTermoAdesao(org.id, org.nome)}
                    disabled={gerandoPDF === org.id}
                    title="Imprimir Termo"
                    style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}
                  >
                    <Printer size={16} />
                  </button>
                  
                  <button
                    onClick={() => gerarRelatorio(org.id, org.nome)}
                    disabled={gerandoRelatorio === org.id}
                    title="Gerar Relatório"
                    style={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                  >
                    <FileText size={16} />
                  </button>
                  
                  <button
                    onClick={() => abrirModalArquivos(org.id, org.nome)}
                    title="Arquivos"
                    style={{ color: '#06b6d4', borderColor: '#06b6d4' }}
                  >
                    <FolderOpen size={16} />
                  </button>
                  
                  {!isCoordinator() && (
                    <button
                      onClick={() => handleDelete(org.id)}
                      title="Excluir"
                      style={{ color: '#ef4444', borderColor: '#ef4444' }}
                    >
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
      
      {/* Paginação Mobile */}
      <div className="mobile-only">
        {!loading && organizacoes.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {/* Informações de paginação */}
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280',
              textAlign: 'center'
            }}>
              Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalOrganizacoes)} de {totalOrganizacoes} organização(ões)
            </div>
            
            {/* Botões de navegação */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => handlePaginationChange(1, pageSize)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: currentPage === 1 ? '#f3f4f6' : 'white',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Primeira
              </button>
              
              <button
                onClick={() => handlePaginationChange(currentPage - 1, pageSize)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: currentPage === 1 ? '#f3f4f6' : 'white',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                ← Anterior
              </button>
              
              <span style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {currentPage} / {Math.ceil(totalOrganizacoes / pageSize)}
              </span>
              
              <button
                onClick={() => handlePaginationChange(currentPage + 1, pageSize)}
                disabled={currentPage >= Math.ceil(totalOrganizacoes / pageSize)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: currentPage >= Math.ceil(totalOrganizacoes / pageSize) ? '#f3f4f6' : 'white',
                  color: currentPage >= Math.ceil(totalOrganizacoes / pageSize) ? '#9ca3af' : '#374151',
                  cursor: currentPage >= Math.ceil(totalOrganizacoes / pageSize) ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Próxima →
              </button>
              
              <button
                onClick={() => handlePaginationChange(Math.ceil(totalOrganizacoes / pageSize), pageSize)}
                disabled={currentPage >= Math.ceil(totalOrganizacoes / pageSize)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: currentPage >= Math.ceil(totalOrganizacoes / pageSize) ? '#f3f4f6' : 'white',
                  color: currentPage >= Math.ceil(totalOrganizacoes / pageSize) ? '#9ca3af' : '#374151',
                  cursor: currentPage >= Math.ceil(totalOrganizacoes / pageSize) ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Última
              </button>
            </div>
            
            {/* Seletor de itens por página */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <span>Itens por página:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePaginationChange(1, parseInt(e.target.value))}
                style={{
                  padding: '0.375rem 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
}

export default ListaOrganizacoes;
