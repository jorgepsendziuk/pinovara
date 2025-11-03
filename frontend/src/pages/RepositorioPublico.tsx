import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import VersionIndicator from '../components/VersionIndicator';
import api from '../services/api';
import './RepositorioPublico.css';
import {
  Archive,
  Upload,
  Download,
  Search,
  Filter,
  FileText,
  Image,
  File,
  Trash2,
  Calendar,
  User,
  Tag,
  FolderOpen,
  BarChart3,
  Plus,
  X,
  Edit
} from 'lucide-react';

interface Arquivo {
  id: number;
  nome_original: string;
  nome_arquivo: string;
  tamanho_bytes: number;
  tipo_mime: string;
  extensao: string;
  descricao?: string;
  categoria: string;
  tags: string[];
  usuario_upload: string;
  downloads: number;
  created_at: string;
  updated_at: string;
}

interface Estatisticas {
  total_arquivos: number;
  arquivos_ativos: number;
  tamanho_total_bytes: number;
  total_downloads: number;
  total_categorias: number;
  total_usuarios: number;
  categorias: Array<{ categoria: string; quantidade: number }>;
  arquivosRecentes: Arquivo[];
  maisBaixados: Arquivo[];
}

interface Filtros {
  categoria: string;
  search: string;
  tags: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const RepositorioPublico: React.FC = () => {
  const { user, isCoordinator, isSupervisor, hasPermission } = useAuth();
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editItem, setEditItem] = useState<Arquivo | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: '',
    search: '',
    tags: ''
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Verificar se usuário pode fazer upload
  const canUpload = hasPermission('sistema', 'admin') || isCoordinator() || isSupervisor();
  const isAdminUser = hasPermission('sistema', 'admin');

  useEffect(() => {
    carregarArquivos();
    // carregarEstatisticas(); // removido para não buscar estatísticas
  }, [filtros, pagination.page]);

  const carregarArquivos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        categoria: filtros.categoria,
        search: filtros.search,
        tags: filtros.tags
      });

      const response = await api.get(`/repositorio?${params}`);
      
      if (response.data.success) {
        setArquivos(response.data.data.arquivos);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      setError('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await api.get('/repositorio/stats/estatisticas');
      if (response.data.success) {
        setEstatisticas(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Não definir erro aqui pois não é crítico
    }
  };

  const handleDownload = async (arquivo: Arquivo) => {
    try {
      const response = await api.get(`/repositorio/${arquivo.id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', arquivo.nome_original);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Recarregar arquivos para atualizar contador de downloads
      carregarArquivos();
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      setError('Erro ao baixar arquivo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este arquivo?')) {
      return;
    }

    try {
      await api.delete(`/repositorio/${id}`);
      carregarArquivos();
      carregarEstatisticas();
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      setError('Erro ao deletar arquivo');
    }
  };

  const formatarTamanho = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatarData = (data: any): string => {
    if (!data) return '-';
    
    // Se for um objeto (PostgreSQL TIMESTAMP), tenta extrair propriedades
    if (typeof data === 'object' && data !== null) {
      // Se tem propriedades year, month, day (formato do driver Prisma)
      if (data.year && data.month && data.day) {
        return `${String(data.day).padStart(2, '0')}/${String(data.month).padStart(2, '0')}/${data.year}`;
      }
      // Se for Date object
      if (data instanceof Date) {
        return data.toLocaleDateString('pt-BR');
      }
      // Tenta converter para string
      return new Date(String(data)).toLocaleDateString('pt-BR');
    }
    
    // Se for string ISO
    if (typeof data === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
        try { 
          return new Date(data).toLocaleDateString('pt-BR'); 
        } catch { 
          return data.slice(0,10).split('-').reverse().join('/'); 
        }
      }
    }
    
    // Fallback
    const d = new Date(data as any);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
  };

  const getFileIcon = (tipoMime: string) => {
    if (tipoMime.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (tipoMime.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const categorias = [
    'geral', 'documentos', 'imagens', 'relatorios', 'apresentacoes', 'planilhas'
  ];

  return (
    <div className="dashboard-layout">
      <VersionIndicator position="top-right" theme="auto" />
      <Sidebar />

      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            {/* Header da página */}
            <div className="page-header">
              <div className="header-content">
                <h2>Repositório</h2>
                <p>Compartilhe e acesse arquivos públicos do sistema</p>
              </div>
              {canUpload && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowUpload(true)}
                  aria-label="Enviar novo arquivo"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span className="btn-text">Enviar Arquivo</span>
                </button>
              )}
            </div>

            
            
            {/* Filtros */}
            <div className="filters-section">
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label" htmlFor="search-input">Buscar</label>
                  <div className="search-input">
                    <Search className="w-4 h-4" aria-hidden="true" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Nome do arquivo, descrição ou tags..."
                      value={filtros.search}
                      onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                      aria-label="Buscar arquivos"
                    />
                  </div>
                </div>
                <div className="filter-group">
                  <label className="filter-label" htmlFor="categoria-select">Categoria</label>
                  <select
                    id="categoria-select"
                    value={filtros.categoria}
                    onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                    className="filter-select"
                    aria-label="Filtrar por categoria"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label" htmlFor="tags-input">Tags</label>
                  <input
                    id="tags-input"
                    type="text"
                    placeholder="Ex: relatorio, 2024, projeto"
                    value={filtros.tags}
                    onChange={(e) => setFiltros({ ...filtros, tags: e.target.value })}
                    className="filter-input"
                    aria-label="Filtrar por tags"
                  />
                </div>
                <div className="filters-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setFiltros({ categoria: '', search: '', tags: '' });
                      setPagination({ ...pagination, page: 1 });
                    }}
                    aria-label="Limpar todos os filtros"
                  >
                    <span className="btn-text">Limpar filtros</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de arquivos */}
            <div className="files-section">
              <div className="section-header">
                <h3 id="files-table-title">
                  <Archive size={20} aria-hidden="true" />
                  Arquivos
                </h3>
                <span className="file-count">
                  {pagination.total} arquivo{pagination.total !== 1 ? 's' : ''}
                </span>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Carregando arquivos...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button className="btn btn-outline" onClick={carregarArquivos}>
                    Tentar Novamente
                  </button>
                </div>
              ) : arquivos.length === 0 ? (
                <div className="empty-state">
                  <Archive className="w-12 h-12" />
                  <h3>Nenhum arquivo encontrado</h3>
                  <p>Não há arquivos que correspondam aos filtros selecionados.</p>
                </div>
              ) : (
                <>
                  {/* Layout de Tabela para Desktop */}
                  <div className="files-table-wrapper desktop-only" role="region" aria-labelledby="files-table-title" aria-describedby="files-table-description">
                    <table className="simple-table" role="table" aria-label="Lista de arquivos do repositório">
                    <thead>
                      <tr>
                        <th scope="col" className="left">Ações</th>
                        <th scope="col">Arquivo</th>
                        <th scope="col">Descrição</th>
                        <th scope="col">Tags</th>
                        <th scope="col">Categoria</th>
                        <th scope="col">Tamanho</th>
                        <th scope="col">Downloads</th>
                        <th scope="col" className="truncate">Enviado por</th>
                        <th scope="col">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arquivos.map((arquivo) => (
                        <tr key={arquivo.id} role="row">
                          <td className="left actions" role="cell">
                            <div className="action-buttons" role="group" aria-label={`Ações para ${arquivo.nome_original}`}>
                              <button
                                onClick={() => handleDownload(arquivo)}
                                title="Baixar arquivo"
                                aria-label={`Baixar ${arquivo.nome_original}`}
                                className="btn btn-primary"
                              >
                                <Download size={14} aria-hidden="true" />
                                <span className="sr-only">Baixar</span>
                              </button>
                              {(user && (user.email === arquivo.usuario_upload || isAdminUser)) && (
                                <button
                                  onClick={() => setEditItem(arquivo)}
                                  title="Editar arquivo"
                                  aria-label={`Editar ${arquivo.nome_original}`}
                                  className="btn btn-edit"
                                >
                                  <Edit size={14} aria-hidden="true" />
                                  <span className="sr-only">Editar</span>
                                </button>
                              )}
                              {user && (user.email === arquivo.usuario_upload || isAdminUser) && (
                                <button
                                  onClick={() => handleDelete(arquivo.id)}
                                  title="Excluir arquivo"
                                  aria-label={`Excluir ${arquivo.nome_original}`}
                                  className="btn btn-danger"
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                  <span className="sr-only">Excluir</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="file-col" role="cell">
                            <span className="icon" aria-hidden="true">{getFileIcon(arquivo.tipo_mime)}</span>
                            <span className="name" title={arquivo.nome_original}>{arquivo.nome_original}</span>
                          </td>
                          <td role="cell" className="truncate" title={arquivo.descricao || '-'}>
                            {arquivo.descricao || '-'}
                          </td>
                          <td role="cell">
                            {arquivo.tags && arquivo.tags.length > 0 ? (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {arquivo.tags.map((tag: string, idx: number) => (
                                  <span key={idx} style={{ 
                                    padding: '2px 8px', 
                                    background: '#e5e7eb', 
                                    borderRadius: '4px', 
                                    fontSize: '0.75rem',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : '-'}
                          </td>
                          <td role="cell">{arquivo.categoria}</td>
                          <td role="cell">{formatarTamanho(arquivo.tamanho_bytes)}</td>
                          <td role="cell" aria-label={`${arquivo.downloads} downloads`}>{arquivo.downloads}</td>
                          <td className="truncate" role="cell" title={arquivo.usuario_upload}>{arquivo.usuario_upload}</td>
                          <td role="cell">{formatarData(arquivo.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Layout de Cards para Mobile/Tablet */}
                <div className="files-cards mobile-only" role="region" aria-label="Lista de arquivos do repositório">
                  {arquivos.map((arquivo) => (
                    <div key={arquivo.id} className="file-card">
                      <div className="file-card-header">
                        <div className="file-info">
                          <span className="file-icon">{getFileIcon(arquivo.tipo_mime)}</span>
                          <div className="file-details">
                            <h4 className="file-name" title={arquivo.nome_original}>{arquivo.nome_original}</h4>
                            <span className="file-meta">{formatarTamanho(arquivo.tamanho_bytes)} • {arquivo.categoria}</span>
                          </div>
                        </div>
                        <div className="file-actions">
                          <button
                            onClick={() => handleDownload(arquivo)}
                            title="Baixar"
                            className="btn btn-primary btn-sm"
                          >
                            <Download size={16} />
                          </button>
                          {(user && (user.email === arquivo.usuario_upload || isAdminUser)) && (
                            <button
                              onClick={() => setEditItem(arquivo)}
                              title="Editar"
                              className="btn btn-edit btn-sm"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {user && (user.email === arquivo.usuario_upload || isAdminUser) && (
                            <button
                              onClick={() => handleDelete(arquivo.id)}
                              title="Excluir"
                              className="btn btn-danger btn-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      {arquivo.descricao && (
                        <p className="file-description">{arquivo.descricao}</p>
                      )}
                      {arquivo.tags && arquivo.tags.length > 0 && (
                        <div className="file-tags">
                          {arquivo.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="file-card-footer">
                        <span className="file-stat">
                          <User size={14} /> {arquivo.usuario_upload}
                        </span>
                        <span className="file-stat">
                          <Download size={14} /> {arquivo.downloads}
                        </span>
                        <span className="file-stat">
                          <Calendar size={14} /> {formatarData(arquivo.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  >
                    Anterior
                  </button>
                  <span className="pagination-info">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Upload */}
      {showUpload && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Enviar Arquivo</h3>
              <button
                className="modal-close"
                onClick={() => setShowUpload(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await api.post('/repositorio/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  setShowUpload(false);
                  carregarArquivos();
                  carregarEstatisticas();
                } catch (error) {
                  console.error('Erro ao enviar arquivo:', error);
                  setError('Erro ao enviar arquivo');
                }
              }}>
                <div className="form-group">
                  <label>Arquivo</label>
                  <input
                    type="file"
                    name="arquivo"
                    required
                    className="file-input"
                  />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    name="descricao"
                    placeholder="Descreva o arquivo..."
                    className="form-textarea"
                  />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select name="categoria" className="form-select" defaultValue="geral">
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="Ex: relatorio, 2024, projeto"
                    className="form-input"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowUpload(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Arquivo</h3>
              <button className="modal-close" onClick={() => setEditItem(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const body = {
                  descricao: fd.get('descricao') as string,
                  categoria: fd.get('categoria') as string,
                  tags: (fd.get('tags') as string) || ''
                };
                try {
                  await api.put(`/repositorio/${editItem.id}`, body);
                  setEditItem(null);
                  carregarArquivos();
                } catch (err) {
                  console.error('Erro ao editar arquivo:', err);
                  setError('Erro ao editar arquivo');
                }
              }}>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea name="descricao" defaultValue={editItem.descricao || ''} className="form-textarea" />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select name="categoria" className="form-select" defaultValue={editItem.categoria}>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags (separadas por vírgula)</label>
                  <input name="tags" className="form-input" defaultValue={(editItem.tags || []).join(', ')} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setEditItem(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositorioPublico;