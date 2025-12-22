import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import VersionIndicator from '../../components/VersionIndicator';
import ListaQualificacoes from '../qualificacoes/ListaQualificacoes';
import FormQualificacao from '../qualificacoes/FormQualificacao';
import ListaCapacitacoes from '../qualificacoes/ListaCapacitacoes';
import FormCapacitacao from '../qualificacoes/FormCapacitacao';
import PainelInstrutor from '../qualificacoes/PainelInstrutor';
import GestaoAvaliacoes from '../qualificacoes/GestaoAvaliacoes';
import GestaoPresenca from '../qualificacoes/GestaoPresenca';
import '../qualificacoes/QualificacoesModule.css';

type ViewType = 'qualificacoes' | 'capacitacoes' | 'cadastro-qualificacao' | 'edicao-qualificacao' | 'cadastro-capacitacao' | 'edicao-capacitacao' | 'painel' | 'gestao-avaliacoes' | 'materiais-qualificacao' | 'inscricoes' | 'presenca';

function QualificacoesModule() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewAtiva, setViewAtiva] = useState<ViewType>('qualificacoes');
  const [qualificacaoSelecionada, setQualificacaoSelecionada] = useState<number | null>(null);
  const [capacitacaoSelecionada, setCapacitacaoSelecionada] = useState<number | null>(null);

  // Determinar view baseada na URL
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/qualificacoes/cadastro')) {
      setViewAtiva('cadastro-qualificacao');
    } else if (path.includes('/qualificacoes/edicao/')) {
      setViewAtiva('edicao-qualificacao');
      const id = path.split('/edicao/')[1];
      if (id) {
        setQualificacaoSelecionada(parseInt(id));
      }
    } else if (path.includes('/capacitacoes/cadastro')) {
      setViewAtiva('cadastro-capacitacao');
    } else if (path.includes('/capacitacoes/edicao/')) {
      setViewAtiva('edicao-capacitacao');
      const id = path.split('/edicao/')[1];
      if (id) {
        setCapacitacaoSelecionada(parseInt(id));
      }
    } else if (path.includes('/capacitacoes/') && path.includes('/inscricoes')) {
      setViewAtiva('inscricoes');
      const id = path.split('/capacitacoes/')[1]?.split('/inscricoes')[0];
      if (id) {
        setCapacitacaoSelecionada(parseInt(id));
      }
    } else if (path.includes('/capacitacoes/') && path.includes('/presenca')) {
      setViewAtiva('presenca');
      const id = path.split('/capacitacoes/')[1]?.split('/presenca')[0];
      if (id) {
        setCapacitacaoSelecionada(parseInt(id));
      }
    } else if (path.includes('/capacitacoes/painel/')) {
      setViewAtiva('painel');
      const id = path.split('/painel/')[1];
      if (id) {
        setCapacitacaoSelecionada(parseInt(id));
      }
    } else if (path.includes('/capacitacoes')) {
      setViewAtiva('capacitacoes');
    } else if (path.includes('/avaliacoes')) {
      setViewAtiva('gestao-avaliacoes');
    } else {
      setViewAtiva('qualificacoes');
    }
  }, [location.pathname]);

  const handleNavegacao = (view: ViewType, id?: number) => {
    setViewAtiva(view);
    
    switch (view) {
      case 'qualificacoes':
        navigate('/qualificacoes');
        break;
      case 'capacitacoes':
        navigate('/capacitacoes');
        break;
      case 'cadastro-qualificacao':
        navigate('/qualificacoes/cadastro');
        break;
      case 'edicao-qualificacao':
        if (id) {
          setQualificacaoSelecionada(id);
          navigate(`/qualificacoes/edicao/${id}`);
        }
        break;
      case 'cadastro-capacitacao':
        navigate('/capacitacoes/cadastro');
        break;
      case 'edicao-capacitacao':
        if (id) {
          setCapacitacaoSelecionada(id);
          navigate(`/capacitacoes/edicao/${id}`);
        }
        break;
      case 'painel':
        if (id) {
          setCapacitacaoSelecionada(id);
          navigate(`/capacitacoes/painel/${id}`);
        }
        break;
      case 'gestao-avaliacoes':
        navigate('/qualificacoes/avaliacoes');
        break;
      case 'materiais-qualificacao':
        if (id) {
          setQualificacaoSelecionada(id);
          navigate(`/qualificacoes/${id}/materiais`);
        }
        break;
      case 'inscricoes':
        if (id) {
          setCapacitacaoSelecionada(id);
          navigate(`/capacitacoes/${id}/inscricoes`);
        }
        break;
      case 'presenca':
        if (id) {
          setCapacitacaoSelecionada(id);
          navigate(`/capacitacoes/${id}/presenca`);
        }
        break;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <VersionIndicator />
        
        {viewAtiva === 'qualificacoes' && (
          <ListaQualificacoes onNavigate={handleNavegacao} />
        )}
        
        {viewAtiva === 'cadastro-qualificacao' && (
          <FormQualificacao onNavigate={handleNavegacao} />
        )}
        
        {viewAtiva === 'edicao-qualificacao' && qualificacaoSelecionada && (
          <FormQualificacao id={qualificacaoSelecionada} onNavigate={handleNavegacao} />
        )}
        
        {viewAtiva === 'capacitacoes' && (
          <ListaCapacitacoes onNavigate={handleNavegacao} />
        )}
        
        {viewAtiva === 'cadastro-capacitacao' && (
          <FormCapacitacao onNavigate={handleNavegacao} />
        )}
        
        {viewAtiva === 'edicao-capacitacao' && capacitacaoSelecionada && (
          <FormCapacitacao id={capacitacaoSelecionada} onNavigate={handleNavegacao} />
        )}
        
        {viewAtiva === 'painel' && capacitacaoSelecionada && (
          <PainelInstrutor idCapacitacao={capacitacaoSelecionada} onNavigate={handleNavegacao} />
        )}
        
        {viewAtiva === 'gestao-avaliacoes' && (
          <GestaoAvaliacoes />
        )}
        
        {viewAtiva === 'inscricoes' && capacitacaoSelecionada && (
          <PainelInstrutor idCapacitacao={capacitacaoSelecionada} onNavigate={handleNavegacao} modoInscricoes={true} />
        )}
        
        {viewAtiva === 'presenca' && capacitacaoSelecionada && (
          <GestaoPresenca idCapacitacao={capacitacaoSelecionada} onNavigate={handleNavegacao} />
        )}
      </main>
    </div>
  );
}

export default QualificacoesModule;

