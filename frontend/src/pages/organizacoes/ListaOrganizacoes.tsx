import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PDFService, OrganizacaoData } from '../../services/pdfService';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import {
  Edit,
  Trash,
  Printer,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Clipboard,
  Monitor,
  X
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
}


interface ListaOrganizacoesProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'edicao' | 'mapa', organizacaoId?: number) => void;
}

function ListaOrganizacoes({ onNavigate }: ListaOrganizacoesProps) {
  const { } = useAuth();
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState<number | null>(null);

  // Estados para DataGrid
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrganizacoes, setTotalOrganizacoes] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [legendaVisivel, setLegendaVisivel] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  // Funções auxiliares
  const formatarCNPJ = (cnpj: string | null): string => {
    if (!cnpj) return '-';
    const cnpjNumeros = cnpj.replace(/\D/g, '');
    return cnpjNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

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
  }, [currentPage, pageSize, searchTerm]);

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

  const fetchOrganizacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');

      // Construir parâmetros de busca
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
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
      setOrganizacoes(data.data.organizacoes || []);
      setTotalOrganizacoes(data.data.total || data.data.organizacoes.length);
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
      width: '45%',
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
      dataIndex: 'municipio_nome',
      width: '16%',
      render: (_: any, record: Organizacao) => {
        const municipio = record.municipio_nome || '-';
        const estado = record.estado_nome || '';
        return (
          <span style={{ fontSize: '13px' }}>
            {municipio}{estado && ` - ${estado}`}
          </span>
        );
      },
    },
    {
      key: 'contato',
      title: 'Contato',
      dataIndex: 'telefone',
      width: '18%',
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
    {
      key: 'actions',
      title: 'Ações',
      width: '17%',
      align: 'center',
      render: (_, record: Organizacao) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
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
          <button
            onClick={() => onNavigate('cadastro')}
            className="btn btn-primary"
          >
            + Nova Organização
          </button>
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
            size="compact"
            className="organizacoes-datagrid"
          />
        </div>
      </div>
    </div>
  );
}

export default ListaOrganizacoes;
