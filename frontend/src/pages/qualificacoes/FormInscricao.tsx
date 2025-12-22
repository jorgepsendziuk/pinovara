import { useState, useEffect } from 'react';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { CreateInscricaoData, Capacitacao } from '../../types/capacitacao';

interface FormInscricaoProps {
  linkInscricao: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Função para formatar telefone
function formatarTelefone(valor: string): string {
  const apenasNumeros = valor.replace(/\D/g, '');
  const limitado = apenasNumeros.slice(0, 11);
  
  if (limitado.length > 10) {
    // Celular com 11 dígitos: (00) 00000-0000
    return limitado.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (limitado.length > 6) {
    if (limitado.length === 10) {
      // Fixo completo: (00) 0000-0000
      return limitado.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return limitado.replace(/^(\d{2})(\d{1,5})/, '($1) $2');
    }
  } else if (limitado.length > 2) {
    return limitado.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else if (limitado.length > 0) {
    return limitado.replace(/^(\d*)/, '($1');
  }
  return limitado;
}

// Função para formatar CPF
function formatarCPF(cpf: string): string {
  const apenasNumeros = cpf.replace(/\D/g, '');
  const limitado = apenasNumeros.slice(0, 11);
  
  if (limitado.length <= 3) {
    return limitado;
  } else if (limitado.length <= 6) {
    return limitado.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
  } else if (limitado.length <= 9) {
    return limitado.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else {
    return limitado.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  }
}

function FormInscricao({ linkInscricao, onSuccess, onCancel }: FormInscricaoProps) {
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [capacitacao, setCapacitacao] = useState<Capacitacao | null>(null);
  const [formData, setFormData] = useState<CreateInscricaoData>({
    nome: '',
    email: '',
    telefone: '',
    instituicao: '',
    cpf: '',
    rg: ''
  });
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarCapacitacao();
  }, [linkInscricao]);

  const carregarCapacitacao = async () => {
    try {
      setCarregando(true);
      const cap = await capacitacaoAPI.getByLinkInscricao(linkInscricao);
      setCapacitacao(cap);
      
      // Se houver apenas uma organização, selecionar automaticamente
      if (cap.organizacoes_completas && cap.organizacoes_completas.length === 1) {
        setFormData(prev => ({
          ...prev,
          instituicao: cap.organizacoes_completas![0].nome
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar capacitação:', error);
      alert('Erro ao carregar informações da capacitação');
    } finally {
      setCarregando(false);
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome || formData.nome.trim().length === 0) {
      novosErros.nome = 'Nome completo é obrigatório';
    }

    if (!formData.email || formData.email.trim().length === 0) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = 'E-mail inválido';
    }

    if (!formData.telefone || formData.telefone.trim().length === 0) {
      novosErros.telefone = 'Telefone é obrigatório';
    } else {
      const apenasNumeros = formData.telefone.replace(/\D/g, '');
      if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
        novosErros.telefone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    if (!formData.instituicao || formData.instituicao.trim().length === 0) {
      novosErros.instituicao = 'Instituição é obrigatória';
    }

    if (!formData.cpf || formData.cpf.trim().length === 0) {
      novosErros.cpf = 'CPF é obrigatório';
    } else {
      const apenasNumeros = formData.cpf.replace(/\D/g, '');
      if (apenasNumeros.length !== 11) {
        novosErros.cpf = 'CPF deve ter 11 dígitos';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      await capacitacaoAPI.createInscricaoPublica(linkInscricao, formData);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao realizar inscrição:', error);
      const mensagem = error.response?.data?.error?.message || error.message || 'Erro ao realizar inscrição';
      alert(mensagem);
    } finally {
      setLoading(false);
    }
  };

  if (carregando) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
        <p>Carregando formulário...</p>
      </div>
    );
  }

  const organizacoes = capacitacao?.organizacoes_completas || [];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#3b2313' }}>Formulário de Inscrição</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => {
              setFormData({ ...formData, nome: e.target.value });
              if (erros.nome) setErros({ ...erros, nome: '' });
            }}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: erros.nome ? '2px solid #ef4444' : '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
          {erros.nome && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
              {erros.nome}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            E-mail *
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (erros.email) setErros({ ...erros, email: '' });
            }}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: erros.email ? '2px solid #ef4444' : '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
          {erros.email && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
              {erros.email}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Telefone (com DDD) *
          </label>
          <input
            type="tel"
            value={formData.telefone || ''}
            onChange={(e) => {
              const formatado = formatarTelefone(e.target.value);
              setFormData({ ...formData, telefone: formatado });
              if (erros.telefone) setErros({ ...erros, telefone: '' });
            }}
            placeholder="(00) 00000-0000"
            maxLength={15}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: erros.telefone ? '2px solid #ef4444' : '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
          <small style={{ color: '#6b7280', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
            Digite apenas números (10 ou 11 dígitos)
          </small>
          {erros.telefone && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
              {erros.telefone}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Instituição *
          </label>
          {organizacoes.length > 0 ? (
            <select
              value={formData.instituicao || ''}
              onChange={(e) => {
                setFormData({ ...formData, instituicao: e.target.value });
                if (erros.instituicao) setErros({ ...erros, instituicao: '' });
              }}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: erros.instituicao ? '2px solid #ef4444' : '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Selecione uma instituição</option>
              {organizacoes.map((org) => (
                <option key={org.id} value={org.nome}>
                  {org.nome}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={formData.instituicao || ''}
              onChange={(e) => {
                setFormData({ ...formData, instituicao: e.target.value });
                if (erros.instituicao) setErros({ ...erros, instituicao: '' });
              }}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: erros.instituicao ? '2px solid #ef4444' : '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
          )}
          {erros.instituicao && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
              {erros.instituicao}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            CPF *
          </label>
          <input
            type="text"
            value={formData.cpf || ''}
            onChange={(e) => {
              const formatado = formatarCPF(e.target.value);
              setFormData({ ...formData, cpf: formatado });
              if (erros.cpf) setErros({ ...erros, cpf: '' });
            }}
            placeholder="000.000.000-00"
            maxLength={14}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: erros.cpf ? '2px solid #ef4444' : '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          />
          {erros.cpf && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
              {erros.cpf}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            RG
          </label>
          <input
            type="text"
            value={formData.rg || ''}
            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#056839',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Enviando...' : 'Confirmar Inscrição'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: '#ccc',
              color: '#333',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormInscricao;

