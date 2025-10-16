import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PDFService, OrganizacaoData } from '../../services/pdfService';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import { StatusValidacaoBadge } from '../../utils/validacaoHelpers';
import { ModalArquivos } from '../../components/organizacoes/ModalArquivos';
import ModalValidacao from '../../components/organizacoes/ModalValidacao';
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
  FolderOpen
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
  tecnico_nome?: string | null;
  tecnico_email?: string | null;
  validacao_status?: number | null;
}


interface ListaOrganizacoesProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'edicao' | 'mapa', organizacaoId?: number) => void;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [legendaVisivel, setLegendaVisivel] = useState(true);
  
  // Filtro de origem do cadastro
  const [origemFiltro, setOrigemFiltro] = useState<'odk' | 'web' | 'todas'>('odk');

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
    fetchOrganizacoes();
  }, [currentPage, pageSize, searchTerm, origemFiltro]);

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

  const fetchOrganizacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');

      // Buscar TODAS as organizações (sem paginação) para poder filtrar no frontend
      const params = new URLSearchParams({
        page: '1',
        pageSize: '1000', // Buscar todas
        ...(searchTerm && { search: searchTerm })
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
      console.log(`   Filtro selecionado: ${origemFiltro}`);
      
      // Aplicar filtro de origem
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
      } else {
        console.log(`   Sem filtro (todas): ${todasOrganizacoes.length}`);
      }
      
      // Aplicar paginação no frontend
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Resetar para primeira página ao buscar
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
                border: '1px solid #007bff', 
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer', 
                color: '#007bff',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#007bff';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#007bff';
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
                <Monitor size={16} color="#667eea" />
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
      <div className="lista-content">
        <div className="content-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={28} color="white" />
            <h2>Lista de Organizações</h2>
          </div>
          <p>Carregando organizações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-content">
      <div className="content-header">
        <div className="header-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building2 size={28} color="white" />
          <h2>Lista de Organizações</h2>
        </div>
        <div className="header-actions">
          {!isCoordinator() && (
            <button
              onClick={() => onNavigate('cadastro')}
              className="btn btn-primary"
            >
              + Nova Organização
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'white',
        padding: '1rem 1.5rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <label style={{ 
          fontWeight: '600', 
          color: '#374151',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clipboard size={18} />
          Origem do Cadastro:
        </label>
        <select 
          value={origemFiltro}
          onChange={(e) => {
            setOrigemFiltro(e.target.value as 'odk' | 'web' | 'todas');
            setCurrentPage(1); // Resetar para primeira página ao filtrar
          }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem',
            cursor: 'pointer',
            minWidth: '200px',
            background: 'white'
          }}
        >
          <option value="odk">📋 ODK Collect (Aplicativo)</option>
          <option value="web">💻 Sistema Web</option>
          <option value="todas">📊 Todas as Origens</option>
        </select>
        
        <div style={{ 
          marginLeft: 'auto',
          fontSize: '0.875rem',
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontWeight: '500' }}>Total:</span>
          <span style={{ 
            background: '#f3f4f6', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '12px',
            fontWeight: '600',
            color: '#374151'
          }}>
            {totalOrganizacoes}
          </span>
        </div>
      </div>

      {/* Legenda Flutuante */}
      {legendaVisivel && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'white',
          border: '2px solid #667eea',
          borderRadius: '8px',
          padding: '10px 12px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
          zIndex: 999,
          fontSize: '13px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              Origem do Cadastro
            </div>
            <button
              onClick={() => setLegendaVisivel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                color: '#9ca3af',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              title="Fechar legenda"
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clipboard size={16} color="#8b4513" />
              <span style={{ color: '#64748b' }}>ODK Collect (Aplicativo)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Monitor size={16} color="#667eea" />
              <span style={{ color: '#64748b' }}>Sistema Web</span>
            </div>
          </div>
        </div>
      )}

      <div className="lista-body">
        {/* DataGrid de Organizações */}
        <div className="organizacoes-datagrid-container">
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
            filters={{
              searchable: true,
              searchPlaceholder: 'Buscar por nome, CNPJ ou localização...',
              onSearchChange: handleSearchChange,
            }}
            emptyState={{
              title: 'Nenhuma organização encontrada',
              description: searchTerm
                ? `Não foram encontradas organizações que correspondam ao termo "${searchTerm}".`
                : 'Não há organizações cadastradas no sistema ainda.',
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
