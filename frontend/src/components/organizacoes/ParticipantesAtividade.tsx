import { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, Plus, Trash2, Upload } from 'lucide-react';
import api from '../../services/api';

interface ParticipantesAtividadeProps {
  organizacaoId: number;
  organizacao: any;
  onUpdate: (campo: string, valor: any) => Promise<void>;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}

interface Participante {
  id?: number;
  nome: string;
  cpf: string;
  telefone: string;
  relacao: number;
  relacao_outros: string;
  assinatura?: string;
}

const OPCOES_RELACAO = [
  { id: 0, label: 'Selecione...' },
  { id: 1, label: 'Diretor' },
  { id: 2, label: 'Conselheiro Fiscal' },
  { id: 3, label: 'Associado' },
  { id: 4, label: 'Colaborador' },
  { id: 99, label: 'Outro' }
];

function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf[9]) !== dv1) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf[10]) !== dv2) return false;
  
  return true;
}

function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function ParticipantesAtividade({
  organizacaoId,
  organizacao,
  onUpdate,
  accordionAberto,
  onToggleAccordion
}: ParticipantesAtividadeProps) {
  const [participantesMenos10, setParticipantesMenos10] = useState(organizacao?.participantes_menos_10 || 2);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<Participante | null>(null);
  const [erros, setErros] = useState<{[key: string]: string}>({});
  
  const isAberto = accordionAberto === 'participantes';

  useEffect(() => {
    setParticipantesMenos10(organizacao?.participantes_menos_10 || 2);
  }, [organizacao?.participantes_menos_10]);

  useEffect(() => {
    if (isAberto && participantesMenos10 === 1) {
      loadParticipantes();
    }
  }, [isAberto, organizacaoId, participantesMenos10]);

  const handleParticipantesMenos10Change = (value: number) => {
    setParticipantesMenos10(value);
    onUpdate('participantes_menos_10', value);
  };

  const loadParticipantes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/organizacoes/${organizacaoId}/participantes`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setParticipantes(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarParticipante = (participante: Participante): boolean => {
    const novosErros: {[key: string]: string} = {};
    
    if (!participante.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }
    
    if (!participante.cpf.trim()) {
      novosErros.cpf = 'CPF é obrigatório';
    } else if (!validarCPF(participante.cpf)) {
      novosErros.cpf = 'CPF inválido';
    }
    
    if (!participante.telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    }
    
    if (!participante.relacao || participante.relacao === 0) {
      novosErros.relacao = 'Selecione uma relação';
    }
    
    if (participante.relacao === 99 && !participante.relacao_outros.trim()) {
      novosErros.relacao_outros = 'Especifique a relação';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!editando || !validarParticipante(editando)) return;
    
    try {
      if (editando.id) {
        await api.put(`/organizacoes/${organizacaoId}/participantes/${editando.id}`, editando);
      } else {
        await api.post(`/organizacoes/${organizacaoId}/participantes`, editando);
      }
      
      setEditando(null);
      setErros({});
      loadParticipantes();
    } catch (error) {
      console.error('Erro ao salvar participante:', error);
      alert('Erro ao salvar participante');
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm('Deseja realmente excluir este participante?')) return;
    
    try {
      await api.delete(`/organizacoes/${organizacaoId}/participantes/${id}`);
      loadParticipantes();
    } catch (error) {
      console.error('Erro ao excluir participante:', error);
      alert('Erro ao excluir participante');
    }
  };

  const handleUploadAssinatura = async (file: File) => {
    if (!editando) return;
    
    if (file.size > 500 * 1024) {
      alert('Assinatura muito grande. Tamanho máximo: 500KB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Arquivo deve ser uma imagem');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditando({
        ...editando,
        assinatura: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('participantes')}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} /> Participantes da Atividade
          {participantes.length > 0 && (
            <span style={{ 
              fontSize: '0.875rem', 
              background: '#056839', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px' 
            }}>
              {participantes.length}
            </span>
          )}
        </h3>
        <ChevronDown
          size={20}
          style={{
            transition: 'transform 0.2s ease',
            transform: isAberto ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      <div className={`accordion-content ${isAberto ? 'open' : ''}`}>
        <div className="accordion-section">
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>A atividade teve menos de 10 participantes?</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value={1}
                  checked={participantesMenos10 === 1}
                  onChange={(e) => handleParticipantesMenos10Change(parseInt(e.target.value))}
                  style={{ marginRight: '6px' }}
                />
                Sim (cadastrar individualmente)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value={2}
                  checked={participantesMenos10 === 2}
                  onChange={(e) => handleParticipantesMenos10Change(parseInt(e.target.value))}
                  style={{ marginRight: '6px' }}
                />
                Não (usar folha de presença física e fotografar)
              </label>
            </div>
          </div>

          {participantesMenos10 === 1 && (
            <>
              {loading ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Carregando...</p>
              ) : (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <button
                      onClick={() => setEditando({
                        nome: '',
                        cpf: '',
                        telefone: '',
                        relacao: 0,
                        relacao_outros: ''
                      })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#056839',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={16} /> Adicionar Participante
                    </button>
                  </div>

                  {editando && (
                    <div style={{
                      padding: '20px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <h4 style={{ marginBottom: '15px' }}>
                        {editando.id ? 'Editar Participante' : 'Novo Participante'}
                      </h4>
                      
                      <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                          <label>Nome *</label>
                          <input
                            type="text"
                            value={editando.nome}
                            onChange={(e) => setEditando({...editando, nome: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: `1px solid ${erros.nome ? '#dc2626' : '#d1d5db'}`,
                              borderRadius: '4px'
                            }}
                          />
                          {erros.nome && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{erros.nome}</span>}
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                          <label>CPF *</label>
                          <input
                            type="text"
                            value={editando.cpf}
                            onChange={(e) => {
                              const cpf = e.target.value.replace(/\D/g, '').substring(0, 11);
                              setEditando({...editando, cpf});
                            }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                setEditando({...editando, cpf: formatarCPF(e.target.value)});
                              }
                            }}
                            placeholder="000.000.000-00"
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: `1px solid ${erros.cpf ? '#dc2626' : '#d1d5db'}`,
                              borderRadius: '4px'
                            }}
                          />
                          {erros.cpf && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{erros.cpf}</span>}
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Telefone *</label>
                          <input
                            type="text"
                            value={editando.telefone}
                            onChange={(e) => setEditando({...editando, telefone: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: `1px solid ${erros.telefone ? '#dc2626' : '#d1d5db'}`,
                              borderRadius: '4px'
                            }}
                          />
                          {erros.telefone && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{erros.telefone}</span>}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label>Relação *</label>
                          <select
                            value={editando.relacao}
                            onChange={(e) => setEditando({...editando, relacao: parseInt(e.target.value), relacao_outros: ''})}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: `1px solid ${erros.relacao ? '#dc2626' : '#d1d5db'}`,
                              borderRadius: '4px'
                            }}
                          >
                            {OPCOES_RELACAO.map(opcao => (
                              <option key={opcao.id} value={opcao.id}>{opcao.label}</option>
                            ))}
                          </select>
                          {erros.relacao && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{erros.relacao}</span>}
                        </div>

                        {editando.relacao === 99 && (
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>Especifique *</label>
                            <input
                              type="text"
                              value={editando.relacao_outros}
                              onChange={(e) => setEditando({...editando, relacao_outros: e.target.value})}
                              placeholder="Especifique a relação..."
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: `1px solid ${erros.relacao_outros ? '#dc2626' : '#d1d5db'}`,
                                borderRadius: '4px'
                              }}
                            />
                            {erros.relacao_outros && <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{erros.relacao_outros}</span>}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Assinatura Digital</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadAssinatura(e.target.files[0]);
                            }
                          }}
                          style={{ display: 'none' }}
                          id="assinatura-upload"
                        />
                        <label
                          htmlFor="assinatura-upload"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: '#e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Upload size={16} /> {editando.assinatura ? 'Alterar Assinatura' : 'Upload Assinatura'}
                        </label>
                        {editando.assinatura && (
                          <img src={editando.assinatura} alt="Assinatura" style={{ maxWidth: '200px', marginTop: '10px', border: '1px solid #e5e7eb' }} />
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button
                          onClick={handleSalvar}
                          style={{
                            padding: '8px 16px',
                            background: '#056839',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditando(null);
                            setErros({});
                          }}
                          style={{
                            padding: '8px 16px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {participantes.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          <th style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Nome</th>
                          <th style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'left' }}>CPF</th>
                          <th style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Telefone</th>
                          <th style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Relação</th>
                          <th style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', width: '100px' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participantes.map((participante) => (
                          <tr key={participante.id}>
                            <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{participante.nome}</td>
                            <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{formatarCPF(participante.cpf)}</td>
                            <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{participante.telefone}</td>
                            <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>
                              {OPCOES_RELACAO.find(r => r.id === participante.relacao)?.label || participante.relacao_outros}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                              <button
                                onClick={() => setEditando(participante)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  marginRight: '5px'
                                }}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => participante.id && handleExcluir(participante.id)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : !editando && (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                      Nenhum participante cadastrado
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {participantesMenos10 === 2 && (
            <div style={{ 
              padding: '20px', 
              background: '#fef3c7', 
              borderRadius: '8px', 
              border: '1px solid #fbbf24' 
            }}>
              <p style={{ margin: 0 }}>
                ℹ️ Como há mais de 10 participantes, utilize folha de presença física e tire foto da lista assinada na seção "Fotos".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

