import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RascunhoAccordion } from '../../components/planoGestao/RascunhoAccordion';
import { PlanoAccordion } from '../../components/planoGestao/PlanoAccordion';
import { PlanoGestaoResponse, UpdateAcaoRequest } from '../../types/planoGestao';
import { useAuth } from '../../contexts/AuthContext';
import './PlanoGestaoPage.css';

interface PlanoGestaoPageProps {
  organizacaoId: number;
}

export const PlanoGestaoPage: React.FC<PlanoGestaoPageProps> = ({ organizacaoId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [planoGestao, setPlanoGestao] = useState<PlanoGestaoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nomeOrganizacao, setNomeOrganizacao] = useState<string>('');

  // Determinar permissões baseadas no role
  // Técnicos podem editar, outros apenas visualizar
  const canEdit = user?.role === 'Tecnico';
  const canViewRascunho = ['Tecnico', 'Supervisor', 'Coordenador', 'Administrador'].includes(user?.role || '');

  useEffect(() => {
    if (organizacaoId) {
      loadPlanoGestao();
      loadOrganizacaoInfo();
    }
  }, [organizacaoId]);

  const loadOrganizacaoInfo = async () => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar informações da organização');
      }

      const data = await response.json();
      setNomeOrganizacao(data.nome || 'Organização');
    } catch (err: any) {
      console.error('Erro ao carregar organização:', err);
    }
  };

  const loadPlanoGestao = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar plano de gestão');
      }

      const data = await response.json();
      console.log('📦 Dados do Plano de Gestão recebidos:', data);
      console.log('📦 Quantidade de planos:', data.planos?.length);
      setPlanoGestao(data);
    } catch (err: any) {
      console.error('Erro ao carregar plano de gestão:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRascunho = async (rascunho: string | null) => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/rascunho`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rascunho })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao salvar rascunho');
      }

      // Atualizar estado local
      setPlanoGestao(prev => prev ? { ...prev, plano_gestao_rascunho: rascunho } : null);
    } catch (err: any) {
      console.error('Erro ao salvar rascunho:', err);
      throw err;
    }
  };

  const handleSaveAcao = async (idAcaoModelo: number, dados: UpdateAcaoRequest) => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/acoes/${idAcaoModelo}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao salvar ação');
      }

      // Recarregar plano para refletir mudanças
      await loadPlanoGestao();
    } catch (err: any) {
      console.error('Erro ao salvar ação:', err);
      throw err;
    }
  };

  const handleVoltar = () => {
    navigate('/organizacoes');
  };

  if (isLoading) {
    return (
      <div className="plano-gestao-page">
        <div className="loading">
          <p>Carregando Plano de Gestão...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plano-gestao-page">
        <div className="error">
          <h3>Erro ao carregar Plano de Gestão</h3>
          <p>{error}</p>
          <button onClick={loadPlanoGestao} className="btn-retry">
            Tentar Novamente
          </button>
          <button onClick={handleVoltar} className="btn-secondary">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!planoGestao) {
    return (
      <div className="plano-gestao-page">
        <div className="error">
          <p>Plano de Gestão não encontrado</p>
          <button onClick={handleVoltar} className="btn-secondary">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plano-gestao-page">
      <div className="page-header">
        <button onClick={handleVoltar} className="btn-back">
          ← Voltar
        </button>
        <div className="header-content">
          <h1>Plano de Gestão</h1>
          <h2>{nomeOrganizacao}</h2>
        </div>
      </div>

      <div className="page-content">
        {/* Rascunho / Notas Colaborativas */}
        {canViewRascunho && (
          <RascunhoAccordion
            rascunho={planoGestao.plano_gestao_rascunho}
            onSave={handleSaveRascunho}
            canEdit={true} // Todos os roles podem editar o rascunho
          />
        )}

        {/* Planos de Gestão */}
        <div className="planos-container">
          {planoGestao.planos.map((plano, index) => (
            <PlanoAccordion
              key={`plano-${plano.tipo}-${index}`}
              plano={plano}
              onSave={handleSaveAcao}
              canEdit={canEdit}
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanoGestaoPage;

