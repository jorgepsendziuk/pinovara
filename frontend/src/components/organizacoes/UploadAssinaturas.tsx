import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Image, Trash2, Download, 
  ChevronDown, ChevronUp, AlertCircle, Plus, RefreshCw, PenTool
} from 'lucide-react';
import { assinaturaAPI, Assinatura } from '../../services/api';


interface UploadAssinaturasProps {
  organizacaoId: number;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

export const UploadAssinaturas: React.FC<UploadAssinaturasProps> = ({
  organizacaoId,
  accordionAberto,
  onToggleAccordion
}) => {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Carregar assinaturas
  const loadAssinaturas = async () => {
    setLoading(true);
    try {
      const data = await assinaturaAPI.listODKAvailable(organizacaoId);
      setAssinaturas(data.assinaturas || []);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar assinaturas' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizacaoId) {
      loadAssinaturas();
    }
  }, [organizacaoId]);

  const handleSyncODK = async () => {
    setSyncing(true);
    setMessage({ type: 'success', text: '🔄 Sincronizando assinaturas com ODK Collect...' });

    try {
      const data = await assinaturaAPI.syncFromODK(organizacaoId);
      
      let mensagem = '';
      let tipo: 'success' | 'error' = 'success';

      if (data.baixadas > 0) {
        mensagem = `✅ Download concluído! 📊 ${data.total_odk} assinaturas encontradas • ${data.baixadas} baixadas • ${data.ja_existentes} já existiam • ${data.erros} erros`;
        await loadAssinaturas();
      } else if (data.total_odk === 0) {
        mensagem = '⚠️ Nenhuma assinatura encontrada no ODK para esta organização';
        tipo = 'error';
      } else {
        mensagem = `✅ Todas as ${data.total_odk} assinaturas já foram baixadas anteriormente`;
      }

      setMessage({ type: tipo, text: mensagem });
      setTimeout(() => setMessage(null), 8000);
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Erro ao baixar assinaturas do ODK: ${error.message}` });
      setTimeout(() => setMessage(null), 8000);
    } finally {
      setSyncing(false);
    }
  };

  const handleDownload = async (assinatura: Assinatura) => {
    try {
      await assinaturaAPI.download(organizacaoId, assinatura.nome_arquivo);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao fazer download da assinatura' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getAssinaturaIcon = (tipo: string) => {
    if (tipo === 'responsavel') {
      return <PenTool size={16} color="#3b2313" />;
    }
    return <FileText size={16} color="#056839" />;
  };

  const getAssinaturaColor = (tipo: string) => {
    if (tipo === 'responsavel') {
      return '#3b2313';
    }
    return '#056839';
  };

  const isAberto = accordionAberto === 'assinaturas';

  return (
    <div className="accordion-item">
      <button 
        className="accordion-header"
        onClick={() => onToggleAccordion('assinaturas')}
        style={{
          background: isAberto 
            ? 'linear-gradient(135deg, #3b2313 0%, #056839 100%)'
            : 'linear-gradient(135deg, #3b2313 0%, #056839 100%)',
          color: 'white'
        }}
      >
        <h3>
          <PenTool size={20} />
          <span>Assinaturas</span>
        </h3>
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
          {/* Mensagens de Feedback */}
          {message && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {message.text}
            </div>
          )}

          {/* Botão Sincronizar ODK */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleSyncODK}
              disabled={syncing}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: syncing ? '#6c757d' : '#056839',
                color: 'white',
                border: '2px solid #056839',
                borderRadius: '8px',
                cursor: syncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                opacity: syncing ? 0.7 : 1
              }}
              title="Baixar assinaturas do ODK Collect"
            >
              <RefreshCw size={18} className={syncing ? 'spinning' : ''} />
              {syncing ? 'Baixando...' : 'Baixar Assinaturas'}
            </button>
          </div>

          {/* Lista de Assinaturas */}
          <div>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>
              Assinaturas Disponíveis ({assinaturas.length})
            </h4>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                Carregando assinaturas...
              </div>
            ) : assinaturas.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <PenTool size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p>Nenhuma assinatura encontrada</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {assinaturas.map(assinatura => (
                  <div
                    key={assinatura.id}
                    style={{
                      padding: '15px',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      background: 'white',
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
                      background: `${getAssinaturaColor(assinatura.tipo)}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '2px solid',
                      borderColor: getAssinaturaColor(assinatura.tipo)
                    }}>
                      {getAssinaturaIcon(assinatura.tipo)}
                    </div>

                    {/* Informações */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <strong style={{ fontSize: '16px', color: '#333' }}>
                          {assinatura.tipo === 'responsavel' ? 'Responsável Legal' : assinatura.participante_nome || 'Participante'}
                        </strong>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: assinatura.tipo === 'responsavel' ? '#3b2313' : '#056839',
                          color: 'white'
                        }}>
                          {assinatura.tipo === 'responsavel' ? 'Responsável' : 'Participante'}
                        </span>
                        {assinatura.ja_sincronizada && (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: '#28a745',
                            color: 'white'
                          }}>
                            Sincronizada
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                        <div><strong>Arquivo:</strong> {assinatura.nome_arquivo}</div>
                        <div><strong>Encontrada em:</strong> {formatDate(assinatura.creation_date)}</div>
                        {assinatura.tamanho_mb && <div><strong>Tamanho:</strong> {assinatura.tamanho_mb} MB</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleDownload(assinatura)}
                        style={{
                          padding: '8px 12px',
                          background: '#056839',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Download"
                      >
                        <Download size={16} />
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
