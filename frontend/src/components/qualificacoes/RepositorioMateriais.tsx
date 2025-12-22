import { useState, useEffect, useRef } from 'react';
import { qualificacaoAPI } from '../../services/qualificacaoService';
import { Upload, Download, Trash2, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface CapacitacaoMaterial {
  id: number;
  nome_arquivo: string;
  nome_original: string;
  caminho_arquivo: string;
  tamanho_bytes: number;
  tipo_mime: string;
  descricao?: string;
  uploaded_by?: number;
  created_at: string;
}

interface RepositorioMateriaisProps {
  idQualificacao: number;
}

function RepositorioMateriais({ idQualificacao }: RepositorioMateriaisProps) {
  const [materiais, setMateriais] = useState<CapacitacaoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    carregarMateriais();
  }, [idQualificacao]);

  const carregarMateriais = async () => {
    try {
      setLoading(true);
      const materiaisList = await qualificacaoAPI.listMateriais(idQualificacao);
      setMateriais(materiaisList || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar materiais' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Arquivo muito grande. Tamanho máximo: 100MB' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Selecione um arquivo' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('arquivo', selectedFile);
      if (descricao) {
        formData.append('descricao', descricao);
      }

      const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(`${apiBase}/qualificacoes/${idQualificacao}/materiais`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao enviar arquivo');
      }

      setMessage({ type: 'success', text: 'Material enviado com sucesso!' });
      setSelectedFile(null);
      setDescricao('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      carregarMateriais();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao enviar arquivo' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (material: CapacitacaoMaterial) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
      const url = `${apiBase}/qualificacoes/${idQualificacao}/materiais/${material.id}/download`;
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar material');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = material.nome_original || `material-${material.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar material:', error);
      setMessage({ type: 'error', text: 'Erro ao baixar material' });
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) {
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(`${apiBase}/qualificacoes/${idQualificacao}/materiais/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir material');
      }

      setMessage({ type: 'success', text: 'Material excluído com sucesso!' });
      carregarMateriais();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao excluir material' });
    }
  };

  const formatarTamanho = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatarData = (data: string): string => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Loader2 size={32} className="spinning" />
        <p>Carregando materiais...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {message.text}
        </div>
      )}

      {/* Formulário de Upload */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#3b2313', fontSize: '18px' }}>
          Adicionar Material
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#3b2313' }}>
              Arquivo *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mov,.jpg,.jpeg,.png"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {selectedFile && (
              <p style={{ marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                Selecionado: {selectedFile.name} ({formatarTamanho(selectedFile.size)})
              </p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#3b2313' }}>
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Descreva o conteúdo do material..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            style={{
              padding: '10px 20px',
              background: selectedFile && !uploading ? '#056839' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="spinning" />
                Enviando...
              </>
            ) : (
              <>
                <Upload size={16} />
                Enviar Material
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lista de Materiais */}
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#3b2313', fontSize: '18px' }}>
          Materiais ({materiais.length})
        </h3>
        {materiais.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #e2e8f0'
            }}
          >
            <FileText size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#64748b', margin: 0 }}>Nenhum material cadastrado ainda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {materiais.map((material) => (
              <div
                key={material.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#056839';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 104, 57, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <FileText size={18} color="#056839" />
                    <span style={{ fontWeight: '600', color: '#3b2313', fontSize: '15px' }}>
                      {material.nome_original}
                    </span>
                  </div>
                  {material.descricao && (
                    <p style={{ margin: '4px 0 0 26px', fontSize: '13px', color: '#64748b' }}>
                      {material.descricao}
                    </p>
                  )}
                  <div style={{ marginTop: '8px', marginLeft: '26px', display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                    <span>{formatarTamanho(material.tamanho_bytes)}</span>
                    <span>•</span>
                    <span>{formatarData(material.created_at)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleDownload(material)}
                    style={{
                      padding: '8px 16px',
                      background: '#056839',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#04502d';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#056839';
                    }}
                  >
                    <Download size={14} />
                    Baixar
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                    }}
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RepositorioMateriais;

