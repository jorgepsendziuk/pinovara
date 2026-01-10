import { useState, useEffect, useCallback } from 'react';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { organizacaoAPI } from '../../services/api';
import api from '../../services/api';
import { Capacitacao } from '../../types/capacitacao';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, XCircle } from 'lucide-react';

interface GerenciarEquipeCapacitacaoProps {
  capacitacaoId: number;
  capacitacao: Capacitacao | null;
}

function GerenciarEquipeCapacitacao({ capacitacaoId, capacitacao }: GerenciarEquipeCapacitacaoProps) {
  const { user, isAdmin, isSupervisor } = useAuth();
  const [equipeTecnica, setEquipeTecnica] = useState<Array<{ id_tecnico: number; tecnico: { id: number; name: string; email: string } }>>([]);
  const [tecnicosDisponiveis, setTecnicosDisponiveis] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<number | ''>('');
  const [carregandoEquipe, setCarregandoEquipe] = useState(false);
  const [carregandoTecnicosDisponiveis, setCarregandoTecnicosDisponiveis] = useState(false);
  const [adicionandoTecnico, setAdicionandoTecnico] = useState(false);
  const [removendoTecnicoId, setRemovendoTecnicoId] = useState<number | null>(null);

  // Verificar se pode gerenciar equipe (criador, admin ou supervisor)
  const canGerenciarEquipe = isAdmin() || isSupervisor() || (capacitacao && capacitacao.created_by === user?.id);

  const carregarEquipe = useCallback(async () => {
    if (!capacitacaoId) return;
    setCarregandoEquipe(true);
    try {
      const equipe = await capacitacaoAPI.listTecnicos(capacitacaoId);
      setEquipeTecnica(equipe);
    } catch (err: any) {
      console.error('Erro ao carregar equipe técnica:', err);
      alert(err?.message || 'Erro ao carregar equipe técnica');
    } finally {
      setCarregandoEquipe(false);
    }
  }, [capacitacaoId]);

  const carregarTecnicosDisponiveis = useCallback(async () => {
    if (!capacitacaoId || !canGerenciarEquipe) return;
    setCarregandoTecnicosDisponiveis(true);
    try {
      // Buscar todos os usuários do sistema via API admin usando axios (com token)
      const response = await api.get('/admin/users');
      if (response.data.success && response.data.data?.users) {
        // Filtrar técnicos que já estão na equipe
        const idsNaEquipe = new Set(equipeTecnica.map(m => m.id_tecnico));
        // Filtrar apenas técnicos (role 'tecnico' no módulo 'organizacoes'), ativos e que não estão na equipe
        const disponiveis = response.data.data.users
          .filter((u: any) => {
            if (!u.active || idsNaEquipe.has(u.id)) {
              return false;
            }
            // Verificar se é técnico (tem role 'tecnico' no módulo 'organizacoes')
            if (!u.roles || !Array.isArray(u.roles)) {
              return false;
            }
            const isTecnico = u.roles.some((r: any) => 
              r && r.name === 'tecnico' && r.module && r.module.name === 'organizacoes'
            );
            return isTecnico;
          })
          .map((u: any) => ({
            id: u.id,
            name: u.name || 'Sem nome',
            email: u.email || 'Sem e-mail'
          }));
        console.log(`✅ Técnicos disponíveis encontrados: ${disponiveis.length} de ${response.data.data.users.length} usuários`);
        setTecnicosDisponiveis(disponiveis);
      } else {
        setTecnicosDisponiveis([]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar técnicos disponíveis:', err);
      setTecnicosDisponiveis([]);
    } finally {
      setCarregandoTecnicosDisponiveis(false);
    }
  }, [capacitacaoId, canGerenciarEquipe, equipeTecnica]);

  const handleAdicionarTecnico = async () => {
    if (!capacitacaoId || !canGerenciarEquipe || !tecnicoSelecionado || typeof tecnicoSelecionado !== 'number') {
      return;
    }
    setAdicionandoTecnico(true);
    try {
      await capacitacaoAPI.adicionarTecnico(capacitacaoId, tecnicoSelecionado);
      await carregarEquipe();
      await carregarTecnicosDisponiveis();
      setTecnicoSelecionado('');
      alert('Técnico adicionado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao adicionar técnico:', err);
      alert(err?.message || 'Erro ao adicionar técnico.');
    } finally {
      setAdicionandoTecnico(false);
    }
  };

  const handleRemoverTecnico = async (idTecnico: number) => {
    if (!capacitacaoId || !canGerenciarEquipe) return;
    const confirmacao = window.confirm('Tem certeza que deseja remover este técnico da capacitação?');
    if (!confirmacao) return;
    setRemovendoTecnicoId(idTecnico);
    try {
      await capacitacaoAPI.removerTecnico(capacitacaoId, idTecnico);
      await carregarEquipe();
      await carregarTecnicosDisponiveis();
      alert('Técnico removido com sucesso!');
    } catch (err: any) {
      console.error('Erro ao remover técnico:', err);
      alert(err?.message || 'Erro ao remover técnico.');
    } finally {
      setRemovendoTecnicoId(null);
    }
  };

  useEffect(() => {
    if (capacitacaoId) {
      carregarEquipe();
    }
  }, [capacitacaoId, carregarEquipe]);

  useEffect(() => {
    if (canGerenciarEquipe && capacitacaoId) {
      carregarTecnicosDisponiveis();
    }
  }, [canGerenciarEquipe, capacitacaoId, carregarTecnicosDisponiveis]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {capacitacao?.tecnico_criador && (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '14px 16px',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontWeight: 600, color: '#3b2313', fontSize: '15px' }}>Responsável principal</span>
          <span style={{ color: '#111827', fontSize: '14px' }}>{capacitacao.tecnico_criador.name}</span>
          {capacitacao.tecnico_criador.email && (
            <span style={{ color: '#6b7280', fontSize: '13px' }}>{capacitacao.tecnico_criador.email}</span>
          )}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h4 style={{ margin: 0, color: '#3b2313', fontSize: '15px' }}>Outros técnicos com acesso</h4>
          {carregandoEquipe && (
            <span style={{ color: '#6b7280', fontSize: '13px' }}>Atualizando...</span>
          )}
        </div>

        {!carregandoEquipe && equipeTecnica.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Nenhum técnico adicional possui acesso a esta capacitação.
          </p>
        )}

        {!carregandoEquipe && equipeTecnica.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {equipeTecnica.map((membro) => (
              <li
                key={membro.id_tecnico}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>
                    {membro.tecnico?.name || 'Técnico sem nome'}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>
                    {membro.tecnico?.email || 'Sem e-mail cadastrado'}
                  </span>
                </div>

                {canGerenciarEquipe ? (
                  <button
                    onClick={() => handleRemoverTecnico(membro.id_tecnico)}
                    disabled={removendoTecnicoId === membro.id_tecnico}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dc2626',
                      background: removendoTecnicoId === membro.id_tecnico ? '#fee2e2' : '#ffffff',
                      color: '#b91c1c',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: removendoTecnicoId === membro.id_tecnico ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {removendoTecnicoId === membro.id_tecnico ? 'Removendo...' : (
                      <>
                        <XCircle size={16} />
                        Remover
                      </>
                    )}
                  </button>
                ) : (
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                    Apenas o responsável principal pode remover
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canGerenciarEquipe ? (
        <div style={{
          marginTop: '10px',
          border: '1px dashed #d1d5db',
          borderRadius: '10px',
          padding: '16px',
          background: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <h4 style={{ margin: 0, color: '#3b2313', fontSize: '15px' }}>Adicionar técnico à equipe</h4>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
              Selecione um técnico da lista para conceder acesso de edição.
            </p>
          </div>

          {carregandoTecnicosDisponiveis ? (
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
              Carregando lista de técnicos disponíveis...
            </p>
          ) : tecnicosDisponiveis.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <select
                value={tecnicoSelecionado}
                onChange={(e) => setTecnicoSelecionado(e.target.value ? Number(e.target.value) : '')}
                style={{
                  flex: '1 1 260px',
                  minWidth: '220px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  padding: '10px'
                }}
              >
                <option value="">Selecione um técnico</option>
                {tecnicosDisponiveis.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.name} {tecnico.email ? `(${tecnico.email})` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAdicionarTecnico}
                disabled={!tecnicoSelecionado || adicionandoTecnico}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: adicionandoTecnico ? '#6b7280' : '#3b2313',
                  color: '#ffffff',
                  cursor: !tecnicoSelecionado || adicionandoTecnico ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {adicionandoTecnico ? 'Adicionando...' : (
                  <>
                    <Plus size={16} />
                    Adicionar
                  </>
                )}
              </button>
            </div>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
              Não há técnicos disponíveis para adicionar no momento.
            </p>
          )}
        </div>
      ) : (
        <div style={{
          marginTop: '6px',
          padding: '12px',
          borderRadius: '8px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          color: '#9a3412',
          fontSize: '13px'
        }}>
          Apenas o técnico responsável principal ou administradores do sistema podem gerenciar a equipe técnica.
        </div>
      )}
    </div>
  );
}

export default GerenciarEquipeCapacitacao;
