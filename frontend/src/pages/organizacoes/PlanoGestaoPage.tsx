import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PlanoGestaoResponse, AcaoCompleta, Evidencia } from '../../types/planoGestao';
import { ChevronDown, ChevronsDown, ChevronsUp, Edit, HelpCircle, Save, Upload, Download, Trash2, Image, FileText, ClipboardList, FileText as FileTextIcon, Image as ImageIcon, Target, Plus } from 'lucide-react';
import Toast from '../../components/Toast';
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
  const [accordionsAbertos, setAccordionsAbertos] = useState<string[]>([]);
  const [gruposAbertos, setGruposAbertos] = useState<string[]>([]);
  const [editandoRascunho, setEditandoRascunho] = useState(false);
  const [rascunhoTexto, setRascunhoTexto] = useState('');
  const [editandoRelatorio, setEditandoRelatorio] = useState(false);
  const [relatorioTexto, setRelatorioTexto] = useState('');
  const [acoesEditando, setAcoesEditando] = useState<Record<string, any>>({});
  const [acoesSalvando, setAcoesSalvando] = useState<Record<string, boolean>>({});
  const [acoesSuprimindo, setAcoesSuprimindo] = useState<Record<string, boolean>>({});
  const getAcaoKey = (acao: AcaoCompleta) => 
    acao.adicionada ? `custom-${acao.id_acao_editavel}` : `modelo-${acao.id}`;

  const isAcaoPersonalizada = (acao: AcaoCompleta) => Boolean(acao.adicionada);
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error'}>>([]);
  const [hintPopup, setHintPopup] = useState<{show: boolean, text: string, x: number, y: number, locked: boolean}>({show: false, text: '', x: 0, y: 0, locked: false});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1400);
  const [legendaVisivel, setLegendaVisivel] = useState(true);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'rascunho' | 'relatorio' | 'evidencias' | 'plano-gestao'>('rascunho');
  const [gerandoPdfPlano, setGerandoPdfPlano] = useState(false);

  // Verifica se o usuário tem role com permissão de edição
  const canEdit = user?.roles?.some((role: any) =>
    ['tecnico', 'admin', 'coordenador', 'supervisao'].includes(role.name)
  ) || false;

  useEffect(() => {
    console.log('🔐 User completo:', JSON.stringify(user, null, 2));
    console.log('✏️ Can Edit:', canEdit);
    console.log('📝 Roles:', user?.roles?.map((r: any) => r.name).join(', '));
  }, [user, canEdit]);

  // Detecta mudança de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1400);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recolhe o menu lateral automaticamente em telas menores
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 6;

    const tryCollapseSidebar = () => {
      const sidebar = document.querySelector('.sidebar') as HTMLElement | null;
      const sidebarToggle = document.querySelector('.sidebar-toggle') as HTMLElement | null;

      if (!sidebar || !sidebarToggle) {
        return false;
      }

      const viewportWidth = window.innerWidth;

      // Em telas muito pequenas o menu já opera como drawer; evitar interferir
      const shouldCollapse = viewportWidth >= 900;

      if (shouldCollapse && !sidebar.classList.contains('collapsed')) {
        sidebarToggle.click();
        return true;
      }

      return sidebar.classList.contains('collapsed');
    };

    if (!tryCollapseSidebar()) {
      const intervalId = setInterval(() => {
        attempts += 1;
        if (tryCollapseSidebar() || attempts >= maxAttempts) {
          clearInterval(intervalId);
        }
      }, 180);

      return () => clearInterval(intervalId);
    }
  }, []);

  // Fecha o popup ao clicar fora quando estiver locked
  useEffect(() => {
    if (hintPopup.show && hintPopup.locked) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Verifica se o clique foi fora do popup e do ícone
        if (!target.closest('[data-hint-popup]') && !target.closest('[data-hint-icon]')) {
          setHintPopup({show: false, text: '', x: 0, y: 0, locked: false});
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [hintPopup.show, hintPopup.locked]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Calcula o status de uma ação individual (Não iniciado, Concluído, Pendente)
  const getStatusAcao = (acao: AcaoCompleta): { status: 'nao-iniciado' | 'concluido' | 'pendente', corFundo: string, label: string, corTexto: string } => {
    if (acao.suprimida) {
      return { status: 'nao-iniciado', corFundo: '#f8fafc', label: 'Ignorada', corTexto: '#475569' };
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Não iniciado: sem datas
    if (!acao.data_inicio && !acao.data_termino) {
      return { status: 'nao-iniciado', corFundo: '#f3f4f6', label: 'Não iniciado', corTexto: '#6b7280' }; // Cinza
    }

    // Concluído: ambas datas definidas e data de término já passou
    if (acao.data_inicio && acao.data_termino) {
      const dataTermino = new Date(acao.data_termino);
      if (dataTermino < hoje) {
        return { status: 'concluido', corFundo: '#d1fae5', label: 'Concluído', corTexto: '#065f46' }; // Verde
      }
    }

    // Pendente: com data de início mas sem término, ou em andamento
    return { status: 'pendente', corFundo: '#fef3c7', label: 'Pendente', corTexto: '#92400e' }; // Amarelo
  };

  const showHint = (e: React.MouseEvent, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHintPopup({
      show: true,
      text,
      x: rect.left,
      y: rect.bottom + 5,
      locked: false
    });
  };

  const toggleHint = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Se já está aberto e locked, fecha
    if (hintPopup.show && hintPopup.locked && hintPopup.text === text) {
      setHintPopup({show: false, text: '', x: 0, y: 0, locked: false});
    } else {
      // Abre e trava
      setHintPopup({
        show: true,
        text,
        x: rect.left,
        y: rect.bottom + 5,
        locked: true
      });
    }
  };

  const hideHint = () => {
    // Só fecha se não estiver locked
    if (!hintPopup.locked) {
      setHintPopup({show: false, text: '', x: 0, y: 0, locked: false});
    }
  };

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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar informações da organização');
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
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Erro ao carregar plano de gestão');
      const data = await response.json();
      setPlanoGestao(data);
      setRascunhoTexto(data.plano_gestao_rascunho || '');
      setRelatorioTexto(data.plano_gestao_relatorio_sintetico || '');
      setEvidencias(data.evidencias || []);
      
      // Ajustar altura dos textareas após carregar dados
      setTimeout(() => {
        adjustAllTextareas();
      }, 100);
    } catch (err: any) {
      console.error('Erro ao carregar plano de gestão:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para ajustar altura de todos os textareas
  const adjustAllTextareas = () => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach((textarea: HTMLTextAreaElement) => {
      if (textarea.value) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
      }
    });
  };

  const toggleAccordion = (key: string) => {
    setAccordionsAbertos(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleGrupo = (key: string) => {
    setGruposAbertos(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const expandirTodos = () => {
    const keys: string[] = [];
    const grupoKeys: string[] = [];
    planoGestao?.planos.forEach((p, i) => {
      keys.push(`plano-${i}`);
      p.grupos.forEach((_g, j) => grupoKeys.push(`grupo-${i}-${j}`));
    });
    setAccordionsAbertos(keys);
    setGruposAbertos(grupoKeys);
  };

  const colapsarTodos = () => {
    setAccordionsAbertos([]);
    setGruposAbertos([]);
  };

  const handleSaveRascunho = async () => {
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
          body: JSON.stringify({ rascunho: rascunhoTexto || null })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      setEditandoRascunho(false);
      if (planoGestao) {
        setPlanoGestao({ ...planoGestao, plano_gestao_rascunho: rascunhoTexto });
      }
      addToast('Rascunho salvo com sucesso!', 'success');
      loadPlanoGestao();
    } catch (err: any) {
      console.error('Erro ao salvar rascunho:', err);
      addToast(`Erro ao salvar rascunho: ${err.message}`, 'error');
    }
  };

  const handleSaveRelatorioSintetico = async () => {
    if (!canEdit) {
      addToast('Apenas técnicos podem editar o relatório sintético', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/relatorio-sintetico`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ relatorio: relatorioTexto || null })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      setEditandoRelatorio(false);
      if (planoGestao) {
        setPlanoGestao({ ...planoGestao, plano_gestao_relatorio_sintetico: relatorioTexto });
      }
      addToast('Relatório sintético salvo com sucesso!', 'success');
      loadPlanoGestao();
    } catch (err: any) {
      console.error('Erro ao salvar relatório sintético:', err);
      addToast(`Erro ao salvar relatório sintético: ${err.message}`, 'error');
    }
  };

  const handleUploadEvidencia = async (file: File, tipo: 'foto' | 'lista_presenca', descricao?: string) => {
    if (!canEdit) {
      addToast('Apenas técnicos podem fazer upload de evidências', 'error');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('@pinovara:token');
      const formData = new FormData();
      formData.append('arquivo', file);
      formData.append('tipo', tipo);
      if (descricao) {
        formData.append('descricao', descricao);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/evidencias`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setEvidencias(prev => [result.evidencia, ...prev]);
      addToast('Evidência enviada com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao fazer upload de evidência:', err);
      addToast(`Erro ao fazer upload: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEvidencia = async (idEvidencia: number) => {
    if (!canEdit) {
      addToast('Apenas técnicos podem excluir evidências', 'error');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir esta evidência?')) {
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/evidencias/${idEvidencia}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      setEvidencias(prev => prev.filter(ev => ev.id !== idEvidencia));
      addToast('Evidência excluída com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao excluir evidência:', err);
      addToast(`Erro ao excluir evidência: ${err.message}`, 'error');
    }
  };

  const handleDownloadEvidencia = async (evidencia: Evidencia) => {
    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/evidencias/${evidencia.id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer download');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = evidencia.nome_arquivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Erro ao fazer download:', err);
      addToast(`Erro ao fazer download: ${err.message}`, 'error');
    }
  };

  const handleDownloadPlanoPdf = async () => {
    try {
      setGerandoPdfPlano(true);
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/pdf`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plano-gestao-${organizacaoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast('PDF gerado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao gerar PDF do plano:', err);
      addToast(`Erro ao gerar PDF: ${err.message || 'Erro desconhecido'}`, 'error');
    } finally {
      setGerandoPdfPlano(false);
    }
  };

  const handleChangeAcao = (acao: AcaoCompleta, field: string, value: any) => {
    const key = getAcaoKey(acao);
    setAcoesEditando(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value
      }
    }));
  };

  const getAcaoValue = (acao: AcaoCompleta, field: string) => {
    const key = getAcaoKey(acao);
    // Se está editando, retorna o valor editado
    if (acoesEditando[key] && acoesEditando[key][field] !== undefined) {
      return acoesEditando[key][field];
    }
    // Senão, retorna o valor original
    const originalValue = (acao as any)[field];
    // Para campos de data, garantir formato correto
    if ((field === 'data_inicio' || field === 'data_termino') && originalValue) {
      const date = new Date(originalValue);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    // Para campo acao, retorna o valor editado ou null (para mostrar campo vazio com hint do modelo)
    if (field === 'acao') {
      return originalValue || null;
    }
    return originalValue || '';
  };

  // Função auxiliar para obter o texto da ação (editado ou modelo) para exibição
  const getAcaoText = (acao: AcaoCompleta): string => {
    const valorEditado = getAcaoValue(acao, 'acao');
    if (valorEditado) return valorEditado;
    // Se não tem valor editado, retorna o valor do modelo (hint)
    return (acao as any).acao_modelo || acao.acao || '-';
  };

  const handleSaveAcao = async (acao: AcaoCompleta) => {
    try {
      const acaoKey = getAcaoKey(acao);
      const editData = acoesEditando[acaoKey];
      if (!editData) {
        addToast('Nenhuma alteração foi feita', 'error');
        return;
      }

      // Mescla dados originais com editados
      const dados = {
        acao: editData.acao !== undefined ? editData.acao : (acao.acao || null),
        responsavel: editData.responsavel !== undefined ? editData.responsavel : (acao.responsavel || ''),
        data_inicio: editData.data_inicio !== undefined ? editData.data_inicio : (acao.data_inicio || null),
        data_termino: editData.data_termino !== undefined ? editData.data_termino : (acao.data_termino || null),
        como_sera_feito: editData.como_sera_feito !== undefined ? editData.como_sera_feito : (acao.como_sera_feito || ''),
        recursos: editData.recursos !== undefined ? editData.recursos : (acao.recursos || '')
      };

      const token = localStorage.getItem('@pinovara:token');
      const apiBase = `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/acoes`;

      setAcoesSalvando(prev => ({ ...prev, [acaoKey]: true }));

      let response: Response;
      if (isAcaoPersonalizada(acao)) {
        if (!acao.id_acao_editavel) {
          throw new Error('Identificador da ação personalizada não encontrado');
        }

        response = await fetch(`${apiBase}/personalizadas/${acao.id_acao_editavel}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        });
      } else {
        const idAcaoModelo = acao.id;
        response = await fetch(`${apiBase}/${idAcaoModelo}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        });
      }

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseErr) {
          // Se não conseguir parsear JSON, usa mensagem padrão
          console.error('Erro ao parsear resposta de erro:', parseErr);
        }

        // Mensagens específicas para erros comuns
        if (response.status === 403) {
          errorMessage = 'Você não tem permissão para editar esta ação';
        } else if (response.status === 500) {
          errorMessage = 'Erro no servidor. Verifique se as permissões do banco de dados estão configuradas corretamente (ver CORRECAO-PERMISSOES-PLANO-GESTAO.md)';
        }

        throw new Error(errorMessage);
      }

      // Remove da lista de editados
      setAcoesEditando(prev => {
        const newState = {...prev};
        delete newState[acaoKey];
        return newState;
      });

      const valorEditado = typeof dados.acao === 'string' ? dados.acao.trim() : '';
      const valorOriginal = typeof acao.acao === 'string' ? acao.acao.trim() : '';
      const valorModelo = typeof (acao as any).acao_modelo === 'string' ? (acao as any).acao_modelo.trim() : '';

      const tituloAcaoSalva = valorEditado && valorEditado.toLowerCase() !== 'null'
        ? valorEditado
        : (valorOriginal && valorOriginal.toLowerCase() !== 'null'
          ? valorOriginal
          : (valorModelo || 'Ação'));

      addToast(`Ação "${tituloAcaoSalva}" salva com sucesso!`, 'success');
      await loadPlanoGestao();
    } catch (err: any) {
      console.error('Erro ao salvar ação:', err);
      addToast(`Erro ao salvar ação: ${err.message || 'Erro desconhecido'}`, 'error');
    } finally {
      const acaoKey = getAcaoKey(acao);
      setAcoesSalvando(prev => {
        const newState = { ...prev };
        delete newState[acaoKey];
        return newState;
      });
    }
  };

  const handleAdicionarAcao = async (tipoPlano: string, grupoNome: string | null, planoKey: string, grupoKey: string) => {
    if (!canEdit) {
      addToast('Apenas usuários com permissão podem adicionar ações', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/acoes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tipo: tipoPlano,
            grupo: grupoNome,
            acao: null,
            responsavel: null,
            data_inicio: null,
            data_termino: null,
            como_sera_feito: null,
            recursos: null
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch(() => ({}));

      setAccordionsAbertos(prev => prev.includes(planoKey) ? prev : [...prev, planoKey]);
      setGruposAbertos(prev => prev.includes(grupoKey) ? prev : [...prev, grupoKey]);

      await loadPlanoGestao();

      addToast('Ação personalizada adicionada com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao adicionar ação personalizada:', err);
      addToast(`Erro ao adicionar ação: ${err.message || 'Erro desconhecido'}`, 'error');
    }
  };

  const handleToggleSuprimir = async (acao: AcaoCompleta, suprimir: boolean) => {
    if (!canEdit) {
      addToast('Apenas usuários com permissão podem alterar esta ação', 'error');
      return;
    }

    const acaoKey = getAcaoKey(acao);
    setAcoesSuprimindo(prev => ({ ...prev, [acaoKey]: true }));

    try {
      const token = localStorage.getItem('@pinovara:token');
      const apiBase = `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/acoes`;
      const payload = { suprimida: suprimir };

      let response: Response;
      if (isAcaoPersonalizada(acao)) {
        if (!acao.id_acao_editavel) {
          throw new Error('Identificador da ação personalizada não encontrado');
        }
        response = await fetch(`${apiBase}/personalizadas/${acao.id_acao_editavel}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${apiBase}/${acao.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      addToast(suprimir ? 'Ação marcada como ignorada' : 'Ação restaurada', 'success');
      setAcoesEditando(prev => {
        const newState = { ...prev };
        delete newState[acaoKey];
        return newState;
      });
      await loadPlanoGestao();
    } catch (err: any) {
      console.error('Erro ao atualizar supressão da ação:', err);
      addToast(`Erro ao atualizar ação: ${err.message || 'Erro desconhecido'}`, 'error');
    } finally {
      setAcoesSuprimindo(prev => {
        const newState = { ...prev };
        delete newState[acaoKey];
        return newState;
      });
    }
  };

  const handleExcluirAcaoPersonalizada = async (acao: AcaoCompleta) => {
    if (!acao.id_acao_editavel) {
      addToast('Ação personalizada inválida', 'error');
      return;
    }

    if (!window.confirm('Deseja remover esta ação personalizada?')) {
      return;
    }

    try {
      const token = localStorage.getItem('@pinovara:token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/plano-gestao/acoes/personalizadas/${acao.id_acao_editavel}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      addToast('Ação personalizada removida', 'success');
      const acaoKey = getAcaoKey(acao);
      setAcoesEditando(prev => {
        const newState = { ...prev };
        delete newState[acaoKey];
        return newState;
      });
      await loadPlanoGestao();
    } catch (err: any) {
      console.error('Erro ao remover ação personalizada:', err);
      addToast(`Erro ao remover: ${err.message || 'Erro desconhecido'}`, 'error');
    }
  };

  if (isLoading) return <div style={{padding: '40px', textAlign: 'center'}}>Carregando...</div>;
  if (error) return <div style={{padding: '40px', textAlign: 'center', color: 'red'}}>{error}</div>;
  if (!planoGestao) return <div style={{padding: '40px', textAlign: 'center'}}>Plano não encontrado</div>;

  return (
    <div className="edicao-organizacao">
      {/* Toasts empilhados */}
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            top: `${20 + (index * 80)}px`,
            right: '20px',
            zIndex: 9999 + index
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            persistent={true}
          />
        </div>
      ))}

      {/* Popup de Hint */}
      {hintPopup.show && (
        <div
          data-hint-popup
          style={{
            position: 'fixed',
            left: `${hintPopup.x}px`,
            top: `${hintPopup.y}px`,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10000,
            fontSize: '13px',
            lineHeight: '1.5',
            border: '2px solid #60a5fa'
          }}
          onMouseEnter={() => setHintPopup(prev => ({...prev, show: true}))}
          onMouseLeave={hideHint}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px'}}>
            💡 Sugestão:
          </div>
          {hintPopup.text}
        </div>
      )}

      {/* Header igual ao EdicaoOrganizacao */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={() => navigate('/organizacoes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'white',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            color: '#3b2313',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.borderColor = '#3b2313';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          ← Voltar
        </button>
        
        <div style={{flex: 1}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px'}}>
            <h1 style={{margin: 0, fontSize: '24px', color: '#3b2313', fontWeight: 700}}>
              Plano de Gestão
            </h1>
          </div>
          <p style={{margin: 0, color: '#6b7280', fontSize: '15px'}}>
            {nomeOrganizacao}
          </p>
        </div>

        <div style={{display: 'flex', gap: '8px'}}>
          {abaAtiva === 'plano-gestao' && (
            <>
              <button onClick={colapsarTodos} className="btn btn-secondary">
                <ChevronsUp size={16} style={{marginRight: '6px'}} />
                Recolher Todos
              </button>
              <button onClick={expandirTodos} className="btn btn-primary">
                <ChevronsDown size={16} style={{marginRight: '6px'}} />
                Expandir Todos
              </button>
              <button
                onClick={handleDownloadPlanoPdf}
                className="btn btn-outline"
                disabled={gerandoPdfPlano}
                style={{display: 'flex', alignItems: 'center', gap: '6px'}}
                title="Baixar PDF do plano de gestão"
              >
                <Download size={16} />
                <span>{gerandoPdfPlano ? 'Gerando PDF...' : 'Baixar PDF'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation" style={{marginBottom: '24px'}}>
        <button
          className={`tab-button ${abaAtiva === 'rascunho' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('rascunho')}
        >
          <ClipboardList size={16} />
          <span>Rascunho / Notas Colaborativas</span>
        </button>
        <button
          className={`tab-button ${abaAtiva === 'relatorio' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('relatorio')}
        >
          <FileTextIcon size={16} />
          <span>Relatório Sintético</span>
        </button>
        <button
          className={`tab-button ${abaAtiva === 'evidencias' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('evidencias')}
        >
          <ImageIcon size={16} />
          <span>Evidências</span>
        </button>
        <button
          className={`tab-button ${abaAtiva === 'plano-gestao' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('plano-gestao')}
        >
          <Target size={16} />
          <span>Plano de Gestão</span>
        </button>
      </div>

      {/* Legenda de Status - Flutuante Inferior */}
      {legendaVisivel && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100,
          minWidth: '200px'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#3b2313',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Status das Ações
            </div>
            <button
              onClick={() => setLegendaVisivel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                lineHeight: 1,
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#3b2313'}
              onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              title="Fechar legenda"
            >
              ×
            </button>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                flexShrink: 0
              }}></div>
              <span style={{fontSize: '12px', color: '#6b7280'}}>Não iniciado</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '3px',
                flexShrink: 0
              }}></div>
              <span style={{fontSize: '12px', color: '#92400e'}}>Pendente</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#d1fae5',
                border: '1px solid #10b981',
                borderRadius: '3px',
                flexShrink: 0
              }}></div>
              <span style={{fontSize: '12px', color: '#065f46'}}>Concluído</span>
            </div>
          </div>
        </div>
      )}

      <div className="edicao-body">
        {/* Conteúdo das Abas */}
        {abaAtiva === 'rascunho' && (
          <div className="tab-content">
            <div style={{background: '#fef3c7', padding: '12px', borderRadius: '6px', marginBottom: '16px'}}>
              <strong>💡 Espaço Colaborativo:</strong> Técnicos, Supervisores, Coordenadores e Administradores podem adicionar notas aqui.
            </div>
            {editandoRascunho ? (
              <>
                <textarea
                  value={rascunhoTexto}
                  onChange={(e) => setRascunhoTexto(e.target.value)}
                  className="rascunho-textarea"
                  style={{width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', minHeight: '80px'}}
                  title="Notas colaborativas sobre o Plano de Gestão"
                />
                <div style={{marginTop: '12px', display: 'flex', gap: '8px'}}>
                  <button onClick={handleSaveRascunho} className="btn btn-primary" title="Salvar">
                    <Save size={16} style={{marginRight: '6px'}} />
                    Salvar
                  </button>
                  <button onClick={() => {
                    setEditandoRascunho(false);
                    setRascunhoTexto(planoGestao.plano_gestao_rascunho || '');
                  }} className="btn btn-secondary">
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{whiteSpace: 'pre-wrap', padding: '12px', background: '#f9fafb', borderRadius: '6px', minHeight: '60px'}}>
                  {planoGestao.plano_gestao_rascunho || 'Nenhuma nota registrada ainda.'}
                </div>
                {planoGestao.plano_gestao_rascunho_updated_by_name && planoGestao.plano_gestao_rascunho_updated_at && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#f0f9ff',
                    borderLeft: '3px solid #3b82f6',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#1e40af'
                  }}>
                    <strong>Última edição:</strong> {planoGestao.plano_gestao_rascunho_updated_by_name} em {new Date(planoGestao.plano_gestao_rascunho_updated_at).toLocaleString('pt-BR')}
                  </div>
                )}
                <button onClick={() => setEditandoRascunho(true)} className="btn btn-primary" style={{marginTop: '12px'}}>
                  <Edit size={16} style={{marginRight: '6px'}} />
                  Editar Notas
                </button>
              </>
            )}
          </div>
        )}

        {abaAtiva === 'relatorio' && (
          <div className="tab-content">
            <div style={{background: '#fef3c7', padding: '12px', borderRadius: '6px', marginBottom: '16px'}}>
              <strong>💡 Relato sobre o processo de elaboração do Plano de Gestão:</strong> pontos fortes e fracos / melhores práticas de gestão do empreendimento
            </div>
            {editandoRelatorio && canEdit ? (
              <>
                <textarea
                  value={relatorioTexto}
                  onChange={(e) => {
                    setRelatorioTexto(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                  }}
                  onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    fontFamily: 'inherit',
                    minHeight: '80px',
                    resize: 'none',
                    overflow: 'hidden'
                  }}
                  title="Relatório sintético com planejamento estruturado e processo de aplicação"
                />
                <div style={{marginTop: '12px', display: 'flex', gap: '8px'}}>
                  <button onClick={handleSaveRelatorioSintetico} className="btn btn-primary" title="Salvar">
                    <Save size={16} style={{marginRight: '6px'}} />
                    Salvar
                  </button>
                  <button onClick={() => {
                    setEditandoRelatorio(false);
                    setRelatorioTexto(planoGestao?.plano_gestao_relatorio_sintetico || '');
                  }} className="btn btn-secondary">
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{whiteSpace: 'pre-wrap', padding: '12px', background: '#f9fafb', borderRadius: '6px', minHeight: '60px'}}>
                  {planoGestao?.plano_gestao_relatorio_sintetico || 'Nenhum relatório sintético registrado ainda.'}
                </div>
                {planoGestao?.plano_gestao_relatorio_sintetico_updated_by_name && planoGestao?.plano_gestao_relatorio_sintetico_updated_at && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#f0f9ff',
                    borderLeft: '3px solid #3b82f6',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#1e40af'
                  }}>
                    <strong>Última edição:</strong> {planoGestao.plano_gestao_relatorio_sintetico_updated_by_name} em {new Date(planoGestao.plano_gestao_relatorio_sintetico_updated_at).toLocaleString('pt-BR')}
                  </div>
                )}
                {canEdit && (
                  <button onClick={() => setEditandoRelatorio(true)} className="btn btn-primary" style={{marginTop: '12px'}}>
                    <Edit size={16} style={{marginRight: '6px'}} />
                    Editar Relatório
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {abaAtiva === 'evidencias' && (
          <div className="tab-content">
            {/* Área de Upload */}
            {canEdit && (
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '24px',
                background: '#f9fafb',
                transition: 'all 0.2s'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#056839';
                e.currentTarget.style.background = '#f0fdf4';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.background = '#f9fafb';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.background = '#f9fafb';
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  const file = files[0];
                  const tipo = file.type.startsWith('image/') ? 'foto' : 'lista_presenca';
                  handleUploadEvidencia(file, tipo);
                }
              }}
              >
                <Upload size={32} style={{marginBottom: '12px', color: '#6b7280'}} />
                <p style={{marginBottom: '12px', color: '#6b7280'}}>
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <input
                  type="file"
                  id="upload-evidencia"
                  style={{display: 'none'}}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const tipo = file.type.startsWith('image/') ? 'foto' : 'lista_presenca';
                      handleUploadEvidencia(file, tipo);
                    }
                  }}
                />
                <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                  <button
                    onClick={() => {
                      const input = document.getElementById('upload-evidencia') as HTMLInputElement;
                      input?.click();
                    }}
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    <Upload size={16} style={{marginRight: '6px'}} />
                    {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Evidências */}
            {evidencias.length === 0 ? (
              <div style={{padding: '24px', textAlign: 'center', color: '#6b7280'}}>
                Nenhuma evidência encontrada.
              </div>
            ) : (
              <div style={{display: 'grid', gap: '12px'}}>
                {evidencias.map((evidencia) => (
                  <div
                    key={evidencia.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: 'white'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      background: evidencia.tipo === 'foto' ? '#fef3c7' : '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {evidencia.tipo === 'foto' ? (
                        <Image size={24} style={{color: '#f59e0b'}} />
                      ) : (
                        <FileText size={24} style={{color: '#3b82f6'}} />
                      )}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontWeight: 600, color: '#3b2313', marginBottom: '4px'}}>
                        {evidencia.nome_arquivo}
                      </div>
                      <div style={{fontSize: '13px', color: '#6b7280'}}>
                        {evidencia.uploaded_by_name && (
                          <>Enviado por {evidencia.uploaded_by_name} em {new Date(evidencia.created_at).toLocaleString('pt-BR')}</>
                        )}
                      </div>
                      {evidencia.descricao && (
                        <div style={{fontSize: '13px', color: '#6b7280', marginTop: '4px'}}>
                          {evidencia.descricao}
                        </div>
                      )}
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button
                        onClick={() => handleDownloadEvidencia(evidencia)}
                        className="btn btn-secondary"
                        style={{padding: '8px'}}
                        title="Baixar arquivo"
                      >
                        <Download size={16} />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteEvidencia(evidencia.id)}
                          className="btn btn-secondary"
                          style={{padding: '8px', color: '#dc2626'}}
                          title="Excluir evidência"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'plano-gestao' && planoGestao && (
          <div className="tab-content">
            {planoGestao.planos.map((plano, planoIndex) => {
              const totalAcoes = plano.grupos.reduce((t, g) => t + g.acoes.filter(a => !a.suprimida).length, 0);
              const acoesPreenchidas = plano.grupos.reduce((t, g) => 
                t + g.acoes.filter(a => !a.suprimida && a.id_acao_editavel !== undefined).length, 0
              );

              return (
                <div key={`plano-${planoIndex}`} className="accordion-item">
                  <button className="accordion-header" onClick={() => toggleAccordion(`plano-${planoIndex}`)}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <Target size={18} style={{color: '#056839'}} />
                      <h3>{plano.titulo}</h3>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <span style={{background: '#056839', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '13px'}}>
                        {acoesPreenchidas} / {totalAcoes} ações
                      </span>
                      <ChevronDown
                        size={16}
                        className={`accordion-icon`}
                        style={{
                          transition: 'transform 0.2s ease',
                          transform: accordionsAbertos.includes(`plano-${planoIndex}`) ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    </div>
                  </button>
                  <div className={`accordion-content ${accordionsAbertos.includes(`plano-${planoIndex}`) ? 'open' : ''}`}>
                    <div className="accordion-section">
                      {plano.grupos.map((grupo, grupoIndex) => {
                        const grupoKey = `grupo-${planoIndex}-${grupoIndex}`;
                        const grupoAberto = gruposAbertos.includes(grupoKey);
                        
                        return (
                        <div key={grupoKey} className="accordion-item" style={{marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                          {/* Header do Grupo */}
                          {grupo.nome && (
                            <button 
                              className="accordion-header"
                              onClick={() => toggleGrupo(grupoKey)}
                              style={{
                                background: grupoAberto ? '#056839' : 'white',
                                color: grupoAberto ? 'white' : '#3b2313',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: grupoAberto ? '8px 8px 0 0' : '8px',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <h4 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: 600,
                                color: grupoAberto ? 'white' : '#3b2313'
                              }}>
                                {grupo.nome}
                              </h4>
                              <ChevronDown
                                size={16}
                                style={{
                                  transition: 'transform 0.2s ease',
                                  transform: grupoAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                                  color: grupoAberto ? 'white' : '#3b2313'
                                }}
                              />
                            </button>
                          )}

                          {/* Conteúdo do Grupo */}
                          <div className={`accordion-content ${grupoAberto || !grupo.nome ? 'open' : ''}`}>
                            <div className="accordion-section" style={{padding: '16px'}}>
                              {canEdit && (
                                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '12px'}}>
                                  <button
                                    className="btn btn-outline"
                                    style={{display: 'flex', alignItems: 'center', gap: '6px'}}
                                    onClick={() => handleAdicionarAcao(plano.tipo, grupo.nome ?? null, `plano-${planoIndex}`, grupoKey)}
                                  >
                                    <Plus size={16} />
                                    <span>Adicionar ação</span>
                                  </button>
                                </div>
                              )}
                              {/* Desktop: Table */}
                              <table className="table-default" style={{width: '100%', display: isMobile ? 'none' : 'table'}}>
                                <thead>
                                  <tr>
                                    <th>Ação</th>
                                    <th style={{width: '150px'}}>Responsável</th>
                                    <th style={{width: '110px'}}>Início</th>
                                    <th style={{width: '110px'}}>Término</th>
                                    <th style={{width: '250px'}}>Como Será Feito?</th>
                                    <th style={{width: '150px'}}>Recursos</th>
                                    <th style={{width: '120px', textAlign: 'center'}}>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {grupo.acoes.map((acao) => {
                                    const acaoKey = getAcaoKey(acao);
                                    const temEdicao = acoesEditando[acaoKey] !== undefined;
                                    const estaSuprimida = Boolean(acao.suprimida);
                                    const ehPersonalizada = isAcaoPersonalizada(acao);
                                    const statusInfo = getStatusAcao(acao);
                                    const corFundo = statusInfo.corFundo;
                                    
                                    return (
                                    <tr key={acaoKey} style={{background: corFundo, transition: 'background 0.2s', opacity: estaSuprimida ? 0.6 : 1}}>
                                      <td style={{padding: '12px'}}>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                          <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                                            {canEdit ? (
                                              <div style={{flex: 1, position: 'relative', minWidth: 0}}>
                                                {((acao as any).acao_modelo || acao.acao) && (
                                                  <HelpCircle
                                                    data-hint-icon
                                                    size={16}
                                                    onMouseEnter={(e) => showHint(e, ((acao as any).acao_modelo || acao.acao) || '')}
                                                    onMouseLeave={hideHint}
                                                    onClick={(e) => toggleHint(e, ((acao as any).acao_modelo || acao.acao) || '')}
                                                    style={{
                                                      position: 'absolute',
                                                      right: '8px',
                                                      top: '8px',
                                                      color: '#3b82f6',
                                                      cursor: 'pointer',
                                                      zIndex: 1
                                                    }}
                                                  />
                                                )}
                                                <textarea
                                                  value={getAcaoValue(acao, 'acao') || ''}
                                                  onChange={(e) => {
                                                    handleChangeAcao(acao, 'acao', e.target.value);
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                                  }}
                                                  onFocus={(e) => {
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                                  }}
                                                  title={((acao as any).acao_modelo || acao.acao) || ''}
                                                  disabled={estaSuprimida}
                                                  style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    paddingRight: ((acao as any).acao_modelo || acao.acao) ? '32px' : '8px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    minHeight: '80px',
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    color: '#3b2313',
                                                    lineHeight: '1.5',
                                                    resize: 'none',
                                                    overflow: 'hidden',
                                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                                  }}
                                                />
                                              </div>
                                            ) : (
                                              <span style={{fontWeight: 700, color: '#3b2313'}}>{getAcaoText(acao)}</span>
                                            )}
                                          </div>
                                          {(acao.created_at || acao.updated_at) && (
                                            <div style={{fontSize: '11px', color: '#6b7280', fontStyle: 'italic'}}>
                                              {acao.created_at && <span>Criado: {new Date(acao.created_at).toLocaleString('pt-BR')}</span>}
                                              {acao.created_at && acao.updated_at && <br />}
                                              {acao.updated_at && <span>Atualizado: {new Date(acao.updated_at).toLocaleString('pt-BR')}</span>}
                                            </div>
                                          )}
                                        {estaSuprimida && (
                                          <div style={{fontSize: '11px', color: '#475569', fontStyle: 'italic'}}>
                                            Ação marcada como ignorada
                                          </div>
                                        )}
                                        </div>
                                      </td>
                                      <td style={{padding: '8px', position: 'relative'}}>
                                        {canEdit ? (
                                          <div style={{position: 'relative', minWidth: 0}}>
                                            {acao.hint_responsavel && (
                                              <HelpCircle
                                                data-hint-icon
                                                size={16}
                                                onMouseEnter={(e) => showHint(e, acao.hint_responsavel || '')}
                                                onMouseLeave={hideHint}
                                                onClick={(e) => toggleHint(e, acao.hint_responsavel || '')}
                                                style={{
                                                  position: 'absolute',
                                                  right: '8px',
                                                  top: '8px',
                                                  color: '#3b82f6',
                                                  cursor: 'pointer',
                                                  zIndex: 1
                                                }}
                                              />
                                            )}
                                            <textarea
                                              value={getAcaoValue(acao, 'responsavel')}
                                              onChange={(e) => {
                                                handleChangeAcao(acao, 'responsavel', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              title={acao.hint_responsavel || ''}
                                              disabled={estaSuprimida}
                                              style={{
                                                width: '100%',
                                                padding: '12px',
                                                paddingRight: acao.hint_responsavel ? '32px' : '12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                minHeight: '80px',
                                                height: getAcaoValue(acao, 'responsavel') ? 'auto' : '80px',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                resize: 'none',
                                                overflow: 'hidden',
                                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <span style={{whiteSpace: 'pre-wrap'}}>{acao.responsavel || '-'}</span>
                                        )}
                                      </td>
                                      <td style={{padding: '12px', position: 'relative'}}>
                                        {canEdit ? (
                                          <div style={{position: 'relative', minWidth: 0}}>
                                            <HelpCircle
                                              data-hint-icon
                                              size={16}
                                              onMouseEnter={(e) => showHint(e, 'Data de início da ação')}
                                              onMouseLeave={hideHint}
                                              onClick={(e) => toggleHint(e, 'Data de início da ação')}
                                              style={{
                                                position: 'absolute',
                                                right: '8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#3b82f6',
                                                cursor: 'pointer',
                                                zIndex: 1
                                              }}
                                            />
                                            <input
                                              type="date"
                                              value={getAcaoValue(acao, 'data_inicio')}
                                              onChange={(e) => handleChangeAcao(acao, 'data_inicio', e.target.value)}
                                              title="Data de início"
                                              disabled={estaSuprimida}
                                              style={{width: '100%', padding: '12px', paddingRight: '32px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '44px', fontSize: '14px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}
                                            />
                                          </div>
                                        ) : (
                                          <span>{acao.data_inicio ? new Date(acao.data_inicio).toLocaleDateString('pt-BR') : '-'}</span>
                                        )}
                                      </td>
                                      <td style={{padding: '12px', position: 'relative'}}>
                                        {canEdit ? (
                                          <div style={{position: 'relative', minWidth: 0}}>
                                            <HelpCircle
                                              data-hint-icon
                                              size={16}
                                              onMouseEnter={(e) => showHint(e, 'Data de término da ação')}
                                              onMouseLeave={hideHint}
                                              onClick={(e) => toggleHint(e, 'Data de término da ação')}
                                              style={{
                                                position: 'absolute',
                                                right: '8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#3b82f6',
                                                cursor: 'pointer',
                                                zIndex: 1
                                              }}
                                            />
                                            <input
                                              type="date"
                                              value={getAcaoValue(acao, 'data_termino')}
                                              onChange={(e) => handleChangeAcao(acao, 'data_termino', e.target.value)}
                                              title="Data de término"
                                              disabled={estaSuprimida}
                                              style={{width: '100%', padding: '12px', paddingRight: '32px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '44px', fontSize: '14px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}
                                            />
                                          </div>
                                        ) : (
                                          <span>{acao.data_termino ? new Date(acao.data_termino).toLocaleDateString('pt-BR') : '-'}</span>
                                        )}
                                      </td>
                                      <td style={{padding: '12px', position: 'relative'}}>
                                        {canEdit ? (
                                          <div style={{position: 'relative', minWidth: 0}}>
                                            {acao.hint_como_sera_feito && (
                                              <HelpCircle
                                                data-hint-icon
                                                size={18}
                                                onMouseEnter={(e) => showHint(e, acao.hint_como_sera_feito || '')}
                                                onMouseLeave={hideHint}
                                                onClick={(e) => toggleHint(e, acao.hint_como_sera_feito || '')}
                                                style={{
                                                  position: 'absolute',
                                                  right: '8px',
                                                  top: '8px',
                                                  color: '#3b82f6',
                                                  cursor: 'pointer',
                                                  zIndex: 1
                                                }}
                                              />
                                            )}
                                            <textarea
                                              value={getAcaoValue(acao, 'como_sera_feito')}
                                              onChange={(e) => {
                                                handleChangeAcao(acao, 'como_sera_feito', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              title={acao.hint_como_sera_feito || ''}
                                              disabled={estaSuprimida}
                                              style={{
                                                width: '100%',
                                                padding: '12px',
                                                paddingRight: acao.hint_como_sera_feito ? '36px' : '12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                minHeight: '80px',
                                                height: getAcaoValue(acao, 'como_sera_feito') ? 'auto' : '80px',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                                resize: 'none',
                                                overflow: 'hidden',
                                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <span style={{fontSize: '13px', whiteSpace: 'pre-wrap'}}>
                                            {acao.como_sera_feito || acao.hint_como_sera_feito || '-'}
                                          </span>
                                        )}
                                      </td>
                                      <td style={{padding: '8px', position: 'relative'}}>
                                        {canEdit ? (
                                          <div style={{position: 'relative', minWidth: 0}}>
                                            {acao.hint_recursos && (
                                              <HelpCircle
                                                data-hint-icon
                                                size={16}
                                                onMouseEnter={(e) => showHint(e, acao.hint_recursos || '')}
                                                onMouseLeave={hideHint}
                                                onClick={(e) => toggleHint(e, acao.hint_recursos || '')}
                                                style={{
                                                  position: 'absolute',
                                                  right: '8px',
                                                  top: '8px',
                                                  color: '#3b82f6',
                                                  cursor: 'pointer',
                                                  zIndex: 1
                                                }}
                                              />
                                            )}
                                            <textarea
                                              value={getAcaoValue(acao, 'recursos')}
                                              onChange={(e) => {
                                                handleChangeAcao(acao, 'recursos', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              title={acao.hint_recursos || ''}
                                              disabled={estaSuprimida}
                                              style={{
                                                width: '100%',
                                                padding: '12px',
                                                paddingRight: acao.hint_recursos ? '32px' : '12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                minHeight: '80px',
                                                height: getAcaoValue(acao, 'recursos') ? 'auto' : '80px',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                resize: 'none',
                                                overflow: 'hidden',
                                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <span style={{whiteSpace: 'pre-wrap'}}>{acao.recursos || '-'}</span>
                                        )}
                                      </td>
                                      <td style={{padding: '4px', textAlign: 'center', verticalAlign: 'middle'}}>
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                                          <span style={{
                                            fontSize: '9px',
                                            fontWeight: 600,
                                            color: statusInfo.corTexto,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: 'rgba(255,255,255,0.8)',
                                            whiteSpace: 'nowrap',
                                            display: 'inline-block'
                                          }}>
                                            {statusInfo.label}
                                          </span>
                                          {canEdit && temEdicao && !estaSuprimida && (
                                            <button
                                              onClick={() => handleSaveAcao(acao)}
                                              className="btn btn-sm btn-primary"
                                              style={{padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
                                              title="Salvar"
                                              disabled={Boolean(acoesSalvando[acaoKey])}
                                            >
                                              <Save size={16} />
                                              <span>{acoesSalvando[acaoKey] ? 'Salvando...' : 'Salvar'}</span>
                                            </button>
                                          )}
                                          {canEdit && (
                                            <button
                                              onClick={() => handleToggleSuprimir(acao, !estaSuprimida)}
                                              className="btn btn-sm btn-secondary"
                                              style={{padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
                                              disabled={Boolean(acoesSuprimindo[acaoKey])}
                                            >
                                              {acoesSuprimindo[acaoKey] ? 'Processando...' : (estaSuprimida ? 'Restaurar' : 'Suprimir')}
                                            </button>
                                          )}
                                          {canEdit && ehPersonalizada && (
                                            <button
                                              onClick={() => handleExcluirAcaoPersonalizada(acao)}
                                              className="btn btn-sm btn-outline"
                                              style={{padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#dc2626', borderColor: '#dc2626'}}
                                            >
                                              <Trash2 size={14} />
                                              <span>Excluir</span>
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                  })}
                                </tbody>
                              </table>

                              {/* Mobile/Tablet: Cards */}
                              <div style={{display: isMobile ? 'block' : 'none'}}>
                                {grupo.acoes.map((acao) => {
                                  const acaoKey = getAcaoKey(acao);
                                  const temEdicao = acoesEditando[acaoKey] !== undefined;
                                  const estaSuprimida = Boolean(acao.suprimida);
                                  const ehPersonalizada = isAcaoPersonalizada(acao);
                                  const statusInfo = getStatusAcao(acao);
                                  const corFundo = statusInfo.corFundo;
                                  
                                  // Define a cor da borda baseada no status
                                  let corBorda = '#e5e7eb'; // Cinza padrão
                                  if (statusInfo.status === 'concluido') {
                                    corBorda = '#10b981'; // Verde
                                  } else if (statusInfo.status === 'pendente') {
                                    corBorda = '#f59e0b'; // Amarelo/Laranja
                                  }
                                  
                                  return (
                                    <div key={`card-${acaoKey}`} style={{
                                      background: corFundo,
                                      border: `2px solid ${corBorda}`,
                                      borderRadius: '8px',
                                      padding: '16px',
                                      marginBottom: '16px',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                      opacity: estaSuprimida ? 0.6 : 1
                                    }}>
                                      <div style={{
                                        marginBottom: '16px',
                                        paddingBottom: '12px',
                                        borderBottom: '2px solid #056839'
                                      }}>
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: '12px',
                                          marginBottom: '4px'
                                        }}>
                                          {canEdit ? (
                                            <div style={{flex: 1, position: 'relative', minWidth: 0}}>
                                              {((acao as any).acao_modelo || acao.acao) && (
                                                <HelpCircle
                                                  data-hint-icon
                                                  size={16}
                                                  onMouseEnter={(e) => showHint(e, ((acao as any).acao_modelo || acao.acao) || '')}
                                                  onMouseLeave={hideHint}
                                                  onClick={(e) => toggleHint(e, ((acao as any).acao_modelo || acao.acao) || '')}
                                                  style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    top: '8px',
                                                    color: '#3b82f6',
                                                    cursor: 'pointer',
                                                    zIndex: 1
                                                  }}
                                                />
                                              )}
                                              <textarea
                                                value={getAcaoValue(acao, 'acao') || ''}
                                                onChange={(e) => {
                                                  handleChangeAcao(acao, 'acao', e.target.value);
                                                  e.target.style.height = 'auto';
                                                  e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                                }}
                                                onFocus={(e) => {
                                                  e.target.style.height = 'auto';
                                                  e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                                }}
                                                title={((acao as any).acao_modelo || acao.acao) || ''}
                                                disabled={estaSuprimida}
                                                style={{
                                                  width: '100%',
                                                  padding: '8px',
                                                  paddingRight: ((acao as any).acao_modelo || acao.acao) ? '32px' : '8px',
                                                  border: '1px solid #d1d5db',
                                                  borderRadius: '6px',
                                                  minHeight: '80px',
                                                  fontSize: '15px',
                                                  fontWeight: 700,
                                                  color: '#3b2313',
                                                  lineHeight: '1.5',
                                                  resize: 'none',
                                                  overflow: 'hidden',
                                                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                                }}
                                              />
                                            </div>
                                          ) : (
                                            <div style={{
                                              fontWeight: 700,
                                              color: '#3b2313',
                                              fontSize: '15px',
                                              flex: 1
                                            }}>
                                              {getAcaoText(acao)}
                                            </div>
                                          )}
                                          
                                          {/* Badge de Status */}
                                          <div style={{display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end'}}>
                                            <span style={{
                                              fontSize: '9px',
                                              fontWeight: 600,
                                              color: statusInfo.corTexto,
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.5px',
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              background: 'rgba(255,255,255,0.8)',
                                              whiteSpace: 'nowrap',
                                              flexShrink: 0
                                            }}>
                                              {statusInfo.label}
                                            </span>
                                            {ehPersonalizada && (
                                              <span style={{fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1d4ed8'}}>
                                                Personalizada
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {(acao.created_at || acao.updated_at) && (
                                          <div style={{fontSize: '11px', color: '#6b7280', fontStyle: 'italic'}}>
                                            {acao.created_at && <span>Criado: {new Date(acao.created_at).toLocaleString('pt-BR')}</span>}
                                            {acao.created_at && acao.updated_at && <br />}
                                            {acao.updated_at && <span>Atualizado: {new Date(acao.updated_at).toLocaleString('pt-BR')}</span>}
                                          </div>
                                        )}
                                      </div>

                                      {canEdit ? (
                                        <>
                                          <div style={{marginBottom: '16px'}}>
                                            <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase'}}>
                                              Responsável
                                              {acao.hint_responsavel && (
                                                <HelpCircle
                                                  data-hint-icon
                                                  size={16}
                                                  onMouseEnter={(e) => showHint(e, acao.hint_responsavel || '')}
                                                  onMouseLeave={hideHint}
                                                  onClick={(e) => toggleHint(e, acao.hint_responsavel || '')}
                                                  style={{color: '#3b82f6', cursor: 'pointer'}}
                                                />
                                              )}
                                            </label>
                                            <textarea
                                              value={getAcaoValue(acao, 'responsavel')}
                                              onChange={(e) => {
                                                handleChangeAcao(acao, 'responsavel', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              title={acao.hint_responsavel || ''}
                                              style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px', height: getAcaoValue(acao, 'responsavel') ? 'auto' : '80px', fontSize: '14px', lineHeight: '1.5', resize: 'none', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}
                                            />
                                          </div>

                                          <div style={{marginBottom: '16px'}}>
                                            <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase'}}>
                                              Data de Início
                                              <HelpCircle
                                                data-hint-icon
                                                size={16}
                                                onMouseEnter={(e) => showHint(e, 'Data de início da ação')}
                                                onMouseLeave={hideHint}
                                                onClick={(e) => toggleHint(e, 'Data de início da ação')}
                                                style={{color: '#3b82f6', cursor: 'pointer'}}
                                              />
                                            </label>
                                            <input
                                              type="date"
                                              value={getAcaoValue(acao, 'data_inicio')}
                                              onChange={(e) => handleChangeAcao(acao, 'data_inicio', e.target.value)}
                                              title="Data de início"
                                              disabled={estaSuprimida}
                                              style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '44px', fontSize: '14px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}
                                            />
                                          </div>

                                          <div style={{marginBottom: '16px'}}>
                                            <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase'}}>
                                              Data de Término
                                              <HelpCircle
                                                data-hint-icon
                                                size={16}
                                                onMouseEnter={(e) => showHint(e, 'Data de término da ação')}
                                                onMouseLeave={hideHint}
                                                onClick={(e) => toggleHint(e, 'Data de término da ação')}
                                                style={{color: '#3b82f6', cursor: 'pointer'}}
                                              />
                                            </label>
                                            <input
                                              type="date"
                                              value={getAcaoValue(acao, 'data_termino')}
                                              onChange={(e) => handleChangeAcao(acao, 'data_termino', e.target.value)}
                                              title="Data de término"
                                              disabled={estaSuprimida}
                                              style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '44px', fontSize: '14px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}
                                            />
                                          </div>

                                          <div style={{marginBottom: '16px'}}>
                                            <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase'}}>
                                              Como Será Feito?
                                              {acao.hint_como_sera_feito && (
                                                <HelpCircle
                                                  data-hint-icon
                                                  size={16}
                                                  onMouseEnter={(e) => showHint(e, acao.hint_como_sera_feito || '')}
                                                  onMouseLeave={hideHint}
                                                  onClick={(e) => toggleHint(e, acao.hint_como_sera_feito || '')}
                                                  style={{color: '#3b82f6', cursor: 'pointer'}}
                                                />
                                              )}
                                            </label>
                                            <textarea
                                              value={getAcaoValue(acao, 'como_sera_feito')}
                                              onChange={(e) => {
                                                handleChangeAcao(acao, 'como_sera_feito', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              title={acao.hint_como_sera_feito || ''}
                                              disabled={estaSuprimida}
                                              style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px', height: getAcaoValue(acao, 'como_sera_feito') ? 'auto' : '80px', fontSize: '14px', lineHeight: '1.6', resize: 'none', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}
                                            />
                                          </div>

                                          <div style={{marginBottom: '16px'}}>
                                            <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#374151', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase'}}>
                                              Recursos
                                              {acao.hint_recursos && (
                                                <HelpCircle
                                                  data-hint-icon
                                                  size={16}
                                                  onMouseEnter={(e) => showHint(e, acao.hint_recursos || '')}
                                                  onMouseLeave={hideHint}
                                                  onClick={(e) => toggleHint(e, acao.hint_recursos || '')}
                                                  style={{color: '#3b82f6', cursor: 'pointer'}}
                                                />
                                              )}
                                            </label>
                                            <textarea
                                              value={getAcaoValue(acao, 'recursos')}
                                              onChange={(e) => {
                                                handleChangeAcao(acao, 'recursos', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.max(80, e.target.scrollHeight) + 'px';
                                              }}
                                              title={acao.hint_recursos || ''}
        disabled={estaSuprimida}
        style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px', height: getAcaoValue(acao, 'recursos') ? 'auto' : '80px', fontSize: '14px', lineHeight: '1.5', resize: 'none', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}
                                            />
                                          </div>

                                          {temEdicao && !estaSuprimida && (
                                            <button
                                              onClick={() => handleSaveAcao(acao)}
                                              className="btn btn-primary"
                                              style={{width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                                              title="Salvar"
                                              disabled={Boolean(acoesSalvando[acaoKey])}
                                            >
                                              <Save size={16} />
                                              <span>{acoesSalvando[acaoKey] ? 'Salvando...' : 'Salvar'}</span>
                                            </button>
                                          )}
                                          <button
                                            onClick={() => handleToggleSuprimir(acao, !estaSuprimida)}
                                            className="btn btn-secondary"
                                            style={{width: '100%', marginTop: '8px'}}
                                            disabled={Boolean(acoesSuprimindo[acaoKey])}
                                          >
                                            {acoesSuprimindo[acaoKey] ? 'Processando...' : (estaSuprimida ? 'Restaurar' : 'Suprimir')}
                                          </button>
                                          {ehPersonalizada && (
                                            <button
                                              onClick={() => handleExcluirAcaoPersonalizada(acao)}
                                              className="btn btn-outline"
                                              style={{width: '100%', marginTop: '8px', color: '#dc2626', borderColor: '#dc2626'}}
                                            >
                                              <Trash2 size={16} />
                                              <span>Excluir</span>
                                            </button>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          <div style={{marginBottom: '12px'}}>
                                            <strong>Responsável:</strong> {acao.responsavel || '-'}
                                          </div>
                                          <div style={{marginBottom: '12px'}}>
                                            <strong>Início:</strong> {acao.data_inicio ? new Date(acao.data_inicio).toLocaleDateString('pt-BR') : '-'}
                                          </div>
                                          <div style={{marginBottom: '12px'}}>
                                            <strong>Término:</strong> {acao.data_termino ? new Date(acao.data_termino).toLocaleDateString('pt-BR') : '-'}
                                          </div>
                                          <div style={{marginBottom: '12px'}}>
                                            <strong>Como Será Feito?:</strong> {acao.como_sera_feito || acao.hint_como_sera_feito || '-'}
                                          </div>
                                          <div style={{marginBottom: '12px'}}>
                                            <strong>Recursos:</strong> {acao.recursos || '-'}
                                          </div>
                                          {estaSuprimida && (
                                            <div style={{marginBottom: '12px', fontStyle: 'italic', color: '#475569'}}>
                                              Ação marcada como ignorada
                                            </div>
                                          )}
                                          <div style={{marginTop: '12px'}}>
                                          <div style={{display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center'}}>
                                            <span style={{
                                              fontSize: '9px',
                                              fontWeight: 600,
                                              color: statusInfo.corTexto,
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.5px',
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              background: 'rgba(255,255,255,0.8)',
                                              whiteSpace: 'nowrap',
                                              display: 'inline-block'
                                            }}>
                                              {statusInfo.label}
                                            </span>
                                            {ehPersonalizada && (
                                              <span style={{
                                                fontSize: '8px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#1d4ed8'
                                              }}>
                                                Personalizada
                                              </span>
                                            )}
                                          </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanoGestaoPage;

