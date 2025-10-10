import React, { useState, useEffect } from 'react';
import { 
  Upload, Image, Trash2, Download, 
  ChevronDown, ChevronUp, AlertCircle, Plus
} from 'lucide-react';
import { fotoAPI, Foto } from '../../services/api';

interface UploadFotosProps {
  organizacaoId: number;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

export const UploadFotos: React.FC<UploadFotosProps> = ({
  organizacaoId,
  accordionAberto,
  onToggleAccordion
}) => {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFormAberto, setUploadFormAberto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [obs, setObs] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Carregar fotos
  const loadFotos = async () => {
    setLoading(true);
    try {
      const data = await fotoAPI.list(organizacaoId);
      setFotos(data);
    } catch (error: any) {
      console.error('Erro ao carregar fotos:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar fotos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizacaoId) {
      loadFotos();
    }
  }, [organizacaoId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar se é imagem
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor, selecione apenas imagens' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('foto', selectedFile);
      if (obs) formData.append('obs', obs);

      await fotoAPI.upload(organizacaoId, formData);
      
      setMessage({ type: 'success', text: 'Foto enviada com sucesso!' });
      setSelectedFile(null);
      setObs('');
      setUploadFormAberto(false);
      
      // Recarregar lista
      await loadFotos();

      // Limpar mensagem após 3s
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao enviar foto' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (foto: Foto) => {
    try {
      await fotoAPI.download(organizacaoId, foto.id);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao fazer download da foto' });
    }
  };

  const handleDelete = async (foto: Foto) => {
    if (!confirm(`Tem certeza que deseja excluir esta foto?`)) {
      return;
    }

    try {
      await fotoAPI.delete(organizacaoId, foto.id);
      setMessage({ type: 'success', text: 'Foto excluída com sucesso!' });
      await loadFotos();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao excluir foto' });
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAberto = accordionAberto === 'fotos';

  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('fotos')}
        style={{
          background: isAberto 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image size={20} />
          <span>Fotos</span>
        </div>
        <ChevronDown 
          size={20}
          style={{
            transition: 'transform 0.3s ease',
            transform: isAberto ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      <div className={`accordion-content ${isAberto ? 'open' : ''}`}>
        <div className="accordion-section">
          {/* Sub-accordion para Upload */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setUploadFormAberto(!uploadFormAberto)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: uploadFormAberto ? '#28a745' : '#f8f9fa',
                color: uploadFormAberto ? 'white' : '#333',
                border: `2px solid ${uploadFormAberto ? '#28a745' : '#dee2e6'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} />
                Enviar Nova Foto
              </span>
              {uploadFormAberto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {uploadFormAberto && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '0 0 8px 8px',
                border: '2px solid #28a745',
                borderTop: 'none',
                marginTop: '-2px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label>Imagem *</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  style={{
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {selectedFile && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#6c757d' }}>
                    Arquivo selecionado: {selectedFile.name}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label>Descrição/Observação</label>
                <textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  rows={3}
                  placeholder="Digite uma descrição ou observação sobre a foto..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

            {message && (
              <div style={{
                padding: '10px',
                marginTop: '15px',
                borderRadius: '4px',
                background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                {message.text}
              </div>
            )}

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    style={{
                      marginTop: '15px',
                      padding: '10px 20px',
                      background: selectedFile && !uploading ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Upload size={16} />
                    {uploading ? 'Enviando...' : 'Enviar Foto'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Fotos */}
          <div>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>
              Fotos Enviadas ({fotos.length})
            </h4>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                Carregando fotos...
              </div>
            ) : fotos.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px', 
                background: '#f8f9fa',
                borderRadius: '8px',
                color: '#6c757d'
              }}>
                <Image size={48} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p>Nenhuma foto enviada ainda</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    style={{
                      background: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '15px',
                      display: 'flex',
                      gap: '15px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Miniatura */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      background: '#667eea15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '2px solid #667eea'
                    }}>
                      <Image size={40} color="#667eea" />
                    </div>

                    {/* Informações */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'start',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                          {foto.foto || `Foto ${foto.id}`}
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                        <div><strong>Enviado em:</strong> {formatDate(foto.creation_date)}</div>
                        <div><strong>Por:</strong> {foto.creator_uri_user}</div>
                        {foto.obs && <div><strong>Descrição:</strong> {foto.obs}</div>}
                      </div>
                    </div>

                    {/* Ações */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleDownload(foto)}
                        style={{
                          padding: '8px 12px',
                          background: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px'
                        }}
                        title="Baixar foto"
                      >
                        <Download size={14} />
                        Baixar
                      </button>
                      <button
                        onClick={() => handleDelete(foto)}
                        style={{
                          padding: '8px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px'
                        }}
                        title="Excluir foto"
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
      </div>
    </div>
  );
};

