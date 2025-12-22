import { useState, useEffect } from 'react';
import { qualificacaoAPI } from '../../services/qualificacaoService';
import { Download, Trash2, FileText, Loader2, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import '../../styles/Modal.css';

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

interface ModalMateriaisProps {
  idQualificacao: number;
  qualificacaoTitulo: string;
  isOpen: boolean;
  onClose: () => void;
}

function ModalMateriais({ idQualificacao, qualificacaoTitulo, isOpen, onClose }: ModalMateriaisProps) {
  const [materiais, setMateriais] = useState<CapacitacaoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      carregarMateriais();
    }
  }, [isOpen, idQualificacao]);

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
      setTimeout(() => setMessage(null), 3000);
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0, color: '#3b2313', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={24} />
              Materiais da Qualificação
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
              {qualificacaoTitulo}
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
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
              <AlertCircle size={18} />
              {message.text}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Loader2 size={32} className="spinning" />
              <p style={{ marginTop: '12px', color: '#64748b' }}>Carregando materiais...</p>
            </div>
          ) : materiais.length === 0 ? (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalMateriais;

