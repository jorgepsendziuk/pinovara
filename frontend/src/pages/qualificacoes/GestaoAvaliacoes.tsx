import { useState, useEffect } from 'react';
import { avaliacaoAPI } from '../../services/avaliacaoService';
import { AvaliacaoVersao, AvaliacaoPergunta } from '../../types/avaliacao';

function GestaoAvaliacoes() {
  const [versoes, setVersoes] = useState<AvaliacaoVersao[]>([]);
  const [versaoSelecionada, setVersaoSelecionada] = useState<AvaliacaoVersao | null>(null);
  const [loading, setLoading] = useState(true);
  const [editandoPergunta, setEditandoPergunta] = useState<AvaliacaoPergunta | null>(null);
  const [novaPergunta, setNovaPergunta] = useState(false);

  useEffect(() => {
    carregarVersoes();
  }, []);

  const carregarVersoes = async () => {
    try {
      setLoading(true);
      const versoesList = await avaliacaoAPI.listVersoes();
      setVersoes(versoesList);
      if (versoesList.length > 0 && !versaoSelecionada) {
        setVersaoSelecionada(versoesList[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
      alert('Erro ao carregar versões de avaliação');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarVersao = async () => {
    const versao = prompt('Digite o número da versão (ex: 1.1):');
    if (!versao) return;

    const descricao = prompt('Digite a descrição da versão:') || '';

    try {
      // Buscar versão ativa para copiar perguntas
      const versaoAtiva = await avaliacaoAPI.getVersaoAtiva();
      
      const novaVersao = await avaliacaoAPI.createVersao({
        versao,
        descricao,
        ativo: false,
        perguntas: versaoAtiva?.perguntas?.map(p => ({
          ordem: p.ordem,
          texto_pergunta: p.texto_pergunta,
          tipo: p.tipo,
          opcoes: p.opcoes,
          obrigatoria: p.obrigatoria || true
        })) || []
      });

      alert('Versão criada com sucesso!');
      await carregarVersoes();
      setVersaoSelecionada(novaVersao);
    } catch (error: any) {
      console.error('Erro ao criar versão:', error);
      alert(error.message || 'Erro ao criar versão');
    }
  };

  const handleAtivarVersao = async (id: number) => {
    if (!confirm('Tem certeza que deseja ativar esta versão? A versão atual será desativada.')) {
      return;
    }

    try {
      await avaliacaoAPI.updateVersao(id, { ativo: true });
      alert('Versão ativada com sucesso!');
      await carregarVersoes();
    } catch (error: any) {
      console.error('Erro ao ativar versão:', error);
      alert(error.message || 'Erro ao ativar versão');
    }
  };

  const handleSalvarPergunta = async (pergunta: Partial<AvaliacaoPergunta>) => {
    if (!versaoSelecionada?.id) return;

    try {
      if (editandoPergunta?.id) {
        await avaliacaoAPI.updatePergunta(editandoPergunta.id, pergunta);
        alert('Pergunta atualizada com sucesso!');
      } else {
        await avaliacaoAPI.createPergunta(versaoSelecionada.id, pergunta as any);
        alert('Pergunta criada com sucesso!');
      }
      
      setEditandoPergunta(null);
      setNovaPergunta(false);
      await carregarVersoes();
      if (versaoSelecionada.id) {
        const atualizada = await avaliacaoAPI.getVersaoById(versaoSelecionada.id);
        setVersaoSelecionada(atualizada);
      }
    } catch (error: any) {
      console.error('Erro ao salvar pergunta:', error);
      alert(error.message || 'Erro ao salvar pergunta');
    }
  };

  const handleExcluirPergunta = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) {
      return;
    }

    try {
      await avaliacaoAPI.deletePergunta(id);
      alert('Pergunta excluída com sucesso!');
      await carregarVersoes();
      if (versaoSelecionada?.id) {
        const atualizada = await avaliacaoAPI.getVersaoById(versaoSelecionada.id);
        setVersaoSelecionada(atualizada);
      }
    } catch (error: any) {
      console.error('Erro ao excluir pergunta:', error);
      alert(error.message || 'Erro ao excluir pergunta');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="qualificacoes-module">
      <div className="qualificacoes-header">
        <h1>Gestão de Avaliações</h1>
        <button className="btn-primary" onClick={handleCriarVersao}>
          Nova Versão
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Versões</h3>
          {versoes.map(v => (
            <div
              key={v.id}
              onClick={() => setVersaoSelecionada(v)}
              style={{
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: versaoSelecionada?.id === v.id ? '#056839' : 'white',
                color: versaoSelecionada?.id === v.id ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                border: v.ativo ? '2px solid #3b2313' : '1px solid #ddd'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>Versão {v.versao}</div>
              <div style={{ fontSize: '12px' }}>{v.ativo ? '✓ Ativa' : 'Inativa'}</div>
              {!v.ativo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (v.id) handleAtivarVersao(v.id);
                  }}
                  style={{
                    marginTop: '5px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    backgroundColor: '#056839',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Ativar
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          {versaoSelecionada && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2>Versão {versaoSelecionada.versao}</h2>
                <p>{versaoSelecionada.descricao}</p>
                <div>
                  <strong>Status:</strong> {versaoSelecionada.ativo ? 'Ativa' : 'Inativa'}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3>Perguntas ({versaoSelecionada.perguntas?.length || 0})</h3>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setNovaPergunta(true);
                    setEditandoPergunta({
                      id_versao: versaoSelecionada.id!,
                      ordem: (versaoSelecionada.perguntas?.length || 0) + 1,
                      texto_pergunta: '',
                      tipo: 'escala_5',
                      obrigatoria: true
                    });
                  }}
                >
                  Nova Pergunta
                </button>
              </div>

              {versaoSelecionada.perguntas && versaoSelecionada.perguntas.length > 0 && (
                <div>
                  {versaoSelecionada.perguntas
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((p, index) => (
                      <div
                        key={p.id}
                        style={{
                          padding: '15px',
                          marginBottom: '10px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                              {p.ordem}. {p.texto_pergunta}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Tipo: {p.tipo} | {p.obrigatoria ? 'Obrigatória' : 'Opcional'}
                            </div>
                            {p.opcoes && (
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                Opções: {Array.isArray(p.opcoes) ? p.opcoes.join(', ') : p.opcoes}
                              </div>
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => setEditandoPergunta(p)}
                              style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => p.id && handleExcluirPergunta(p.id)}
                              style={{ padding: '5px 10px', fontSize: '12px', color: 'red' }}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {(editandoPergunta || novaPergunta) && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '8px',
                    maxWidth: '600px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                  }}>
                    <h3>{novaPergunta ? 'Nova Pergunta' : 'Editar Pergunta'}</h3>
                    <FormPergunta
                      pergunta={editandoPergunta!}
                      onSave={handleSalvarPergunta}
                      onCancel={() => {
                        setEditandoPergunta(null);
                        setNovaPergunta(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormPerguntaProps {
  pergunta: Partial<AvaliacaoPergunta>;
  onSave: (pergunta: Partial<AvaliacaoPergunta>) => void;
  onCancel: () => void;
}

function FormPergunta({ pergunta, onSave, onCancel }: FormPerguntaProps) {
  const [formData, setFormData] = useState<Partial<AvaliacaoPergunta>>(pergunta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label>Ordem *</label>
        <input
          type="number"
          value={formData.ordem || ''}
          onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Texto da Pergunta *</label>
        <textarea
          value={formData.texto_pergunta || ''}
          onChange={(e) => setFormData({ ...formData, texto_pergunta: e.target.value })}
          required
          rows={3}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Tipo *</label>
        <select
          value={formData.tipo || 'escala_5'}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="escala_5">Escala 5 opções</option>
          <option value="escala_3">Escala 3 opções</option>
          <option value="sim_nao_talvez">Sim/Não/Talvez</option>
          <option value="sim_nao_parcialmente">Sim/Não/Parcialmente</option>
          <option value="texto_livre">Texto Livre</option>
        </select>
      </div>

      {formData.tipo !== 'texto_livre' && (
        <div style={{ marginBottom: '15px' }}>
          <label>Opções (JSON array ou separado por vírgula)</label>
          <input
            type="text"
            value={Array.isArray(formData.opcoes) ? formData.opcoes.join(', ') : (formData.opcoes as string || '')}
            onChange={(e) => {
              const value = e.target.value;
              try {
                const parsed = JSON.parse(value);
                setFormData({ ...formData, opcoes: Array.isArray(parsed) ? parsed : value.split(',').map(s => s.trim()) });
              } catch {
                setFormData({ ...formData, opcoes: value.split(',').map(s => s.trim()) });
              }
            }}
            placeholder='["Opção 1", "Opção 2", "Opção 3"] ou Opção 1, Opção 2, Opção 3'
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label>
          <input
            type="checkbox"
            checked={formData.obrigatoria !== false}
            onChange={(e) => setFormData({ ...formData, obrigatoria: e.target.checked })}
          />
          {' '}Obrigatória
        </label>
      </div>

      <div>
        <button type="submit" className="btn-primary">Salvar</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancelar</button>
      </div>
    </form>
  );
}

export default GestaoAvaliacoes;

