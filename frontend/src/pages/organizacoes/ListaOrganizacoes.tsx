import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PDFService, OrganizacaoData } from '../../services/pdfService';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import {
  Edit,
  Trash,
  Printer
} from 'lucide-react';

interface Organizacao {
  id: number;
  nome: string;
  cnpj: string;
  estado: number | null;
  municipio: number | null;
  gpsLat: number | null;
  gpsLng: number | null;
  telefone: string | null;
  email: string | null;
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

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  // Funções auxiliares
  const formatarCNPJ = (cnpj: string | null): string => {
    if (!cnpj) return '-';
    // Remove todos os caracteres não numéricos
    const cnpjNumeros = cnpj.replace(/\D/g, '');
    // Aplica a máscara CNPJ: XX.XXX.XXX/XXXX-XX
    return cnpjNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const getNomeEstado = (estadoId: number | null): string => {
    const estados = [
      { id: 1, nome: 'Minas Gerais', uf: 'MG' },
      { id: 2, nome: 'Bahia', uf: 'BA' },
      { id: 3, nome: 'Espírito Santo', uf: 'ES' }
    ];
    const estado = estados.find(e => e.id === estadoId);
    return estado ? estado.uf : '-';
  };

  const getNomeMunicipio = (municipioId: number | null): string => {
    const municipios = [
      { id: 1, nome: 'Diamantina' },
      { id: 2, nome: 'Belo Horizonte' },
      { id: 3, nome: 'Salvador' },
      { id: 4, nome: 'Vitória' }
    ];
    const municipio = municipios.find(m => m.id === municipioId);
    return municipio ? municipio.nome : '-';
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
      width: '8%',
      sortable: true,
      align: 'center',
      render: (id: number) => (
        <span style={{ fontWeight: 'bold', color: '#666' }}>#{id}</span>
      ),
    },
    {
      key: 'nome',
      title: 'Nome',
      dataIndex: 'nome',
      width: '22%',
      sortable: true,
      render: (nome: string) => nome || '-',
    },
    {
      key: 'cnpj',
      title: 'CNPJ',
      dataIndex: 'cnpj',
      width: '18%',
      sortable: true,
      render: (cnpj: string) => formatarCNPJ(cnpj),
    },
    {
      key: 'localizacao',
      title: 'Localização',
      dataIndex: 'municipio',
      width: '20%',
      render: (municipio: number, record: Organizacao) => {
        const municipioNome = getNomeMunicipio(municipio);
        const estadoSigla = getNomeEstado(record.estado);
        return `${municipioNome} - ${estadoSigla}`;
      },
    },
    {
      key: 'contato',
      title: 'Contato',
      dataIndex: 'telefone',
      width: '15%',
      responsive: {
        hideOn: 'mobile'
      },
      render: (telefone: string, record: Organizacao) => (
        <div className="contact-info">
          <div className="telefone">{telefone || '-'}</div>
          <div className="email">{record.email || '-'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'id',
      width: '10%',
      align: 'center',
      render: () => (
        <span className="status-badge status-active">Ativo</span>
      ),
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '17%',
      align: 'center',
      render: (_, record: Organizacao) => (
        <div className="action-buttons" style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate('edicao', record.id)}
            className="btn-icon"
            title="Editar organização"
            style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#007bff' }}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => gerarTermoAdesao(record.id)}
            className="btn-icon"
            title="Imprimir Termo de Adesão"
            disabled={gerandoPDF === record.id}
            style={{
              padding: '0.25rem',
              border: 'none',
              background: 'transparent',
              cursor: gerandoPDF === record.id ? 'not-allowed' : 'pointer',
              color: gerandoPDF === record.id ? '#ccc' : '#28a745'
            }}
          >
            {gerandoPDF === record.id ? '⏳' : <Printer size={16} />}
          </button>
          <button
            onClick={() => handleExcluir(record.id)}
            className="btn-icon"
            title="Excluir organização"
            style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc3545' }}
          >
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ];


  if (loading) {
    return (
      <div className="lista-content">
        <div className="content-header">
          <h2>🏢 Lista de Organizações</h2>
          <p>Carregando organizações...</p>
        </div>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  return (
    <div className="lista-content">
      <div className="content-header">
        <div className="header-info">
          <h2>🏢 Lista de Organizações</h2>
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
              icon: '🏢',
              action: {
                label: 'Cadastrar primeira organização',
                onClick: () => onNavigate('cadastro'),
              },
            }}
            responsive={true}
            size="medium"
            className="organizacoes-datagrid"
          />
        </div>
      </div>
    </div>
  );
}

export default ListaOrganizacoes;
