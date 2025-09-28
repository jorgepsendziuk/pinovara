import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { organizacaoAPI } from '../../services/api';
import {
  Clipboard,
  BarChart,
  Users,
  Building2,
  CheckCircle,
  Save,
  Plus,
  Home,
  User,
  FormInput,
  Sprout,
  Coffee,
  Users2,
  Factory,
  Wheat,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Estado {
  id: number;
  nome: string;
  uf: string;
}

interface Municipio {
  id: number;
  nome: string;
  codigo_ibge: number;
  estadoId: number;
}

interface Funcao {
  id: number;
  nome: string;
  descricao?: string;
}

interface CadastroOrganizacaoProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'detalhes', organizacaoId?: number) => void;
}

type AbaAtiva = 'basicos' | 'endereco' | 'representante' | 'caracteristicas' | 'questionarios';

function CadastroOrganizacao({ onNavigate }: CadastroOrganizacaoProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('basicos');
  const [erros, setErros] = useState<Record<string, string>>({});

  // Estados auxiliares
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);

  // Dados do formulário
  const [formData, setFormData] = useState({
    // ========== DADOS BÁSICOS ==========
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    dataFundacao: '',
    
    // ========== LOCALIZAÇÃO ==========
    estado: '',
    municipio: '',
    gpsLat: '',
    gpsLng: '',
    gpsAlt: '',
    gpsAcc: '',
    
    // ========== ENDEREÇO ORGANIZAÇÃO ==========
    organizacaoEndLogradouro: '',
    organizacaoEndBairro: '',
    organizacaoEndComplemento: '',
    organizacaoEndNumero: '',
    organizacaoEndCep: '',
    
    // ========== REPRESENTANTE ==========
    representanteNome: '',
    representanteCpf: '',
    representanteRg: '',
    representanteTelefone: '',
    representanteEmail: '',
    representanteEndLogradouro: '',
    representanteEndBairro: '',
    representanteEndComplemento: '',
    representanteEndNumero: '',
    representanteEndCep: '',
    representanteFuncao: '',
    
    // ========== CARACTERÍSTICAS SOCIAIS ==========
    caracteristicasNTotalSocios: '',
    caracteristicasNTotalSociosCaf: '',
    caracteristicasNDistintosCaf: '',
    caracteristicasNSociosPaa: '',
    caracteristicasNNaosociosPaa: '',
    caracteristicasNSociosPnae: '',
    caracteristicasNNaosociosPnae: '',
    caracteristicasNAtivosTotal: '',
    caracteristicasNAtivosCaf: '',
    caracteristicasNNaosocioOpTotal: '',
    caracteristicasNNaosocioOpCaf: '',
    caracteristicasNIngressaramTotal12Meses: '',
    caracteristicasNIngressaramCaf12Meses: '',
    
    // ========== CARACTERÍSTICAS POR GÊNERO ==========
    caracteristicasTaAMulher: '',
    caracteristicasTaAHomem: '',
    caracteristicasTaEMulher: '',
    caracteristicasTaEHomem: '',
    caracteristicasTaOMulher: '',
    caracteristicasTaOHomem: '',
    caracteristicasTaIMulher: '',
    caracteristicasTaIHomem: '',
    caracteristicasTaPMulher: '',
    caracteristicasTaPHomem: '',
    caracteristicasTaAfMulher: '',
    caracteristicasTaAfHomem: '',
    caracteristicasTaQMulher: '',
    caracteristicasTaQHomem: '',
    
    // ========== CARACTERÍSTICAS CAFÉ ==========
    caracteristicasTaCafConvencional: '',
    caracteristicasTaCafAgroecologico: '',
    caracteristicasTaCafTransicao: '',
    caracteristicasTaCafOrganico: '',
    
    // ========== FLAGS ==========
    simNaoProducao: '',
    simNaoFile: '',
    simNaoPj: '',
    simNaoSocio: '',
    
    // ========== OBSERVAÇÕES ==========
    obs: ''
  });

  // Carregar dados auxiliares
  useEffect(() => {
    carregarDadosAuxiliares();
  }, []);

  const carregarDadosAuxiliares = async () => {
    try {
      // Simular carregamento de estados, municípios e funções
      // Em produção, viria de APIs específicas
      setEstados([
        { id: 1, nome: 'Minas Gerais', uf: 'MG' },
        { id: 2, nome: 'Bahia', uf: 'BA' },
        { id: 3, nome: 'Espírito Santo', uf: 'ES' },
        { id: 4, nome: 'São Paulo', uf: 'SP' }
      ]);

      setMunicipios([
        // Minas Gerais (estadoId: 1)
        { id: 1, nome: 'Diamantina', codigo_ibge: 3120904, estadoId: 1 },
        { id: 2, nome: 'Belo Horizonte', codigo_ibge: 3106200, estadoId: 1 },
        { id: 3, nome: 'Uberlândia', codigo_ibge: 3170206, estadoId: 1 },
        { id: 4, nome: 'Juiz de Fora', codigo_ibge: 3136702, estadoId: 1 },
        { id: 5, nome: 'Montes Claros', codigo_ibge: 3143302, estadoId: 1 },

        // Bahia (estadoId: 2)
        { id: 6, nome: 'Salvador', codigo_ibge: 2927408, estadoId: 2 },
        { id: 7, nome: 'Feira de Santana', codigo_ibge: 2910800, estadoId: 2 },
        { id: 8, nome: 'Vitória da Conquista', codigo_ibge: 2933307, estadoId: 2 },
        { id: 9, nome: 'Camaçari', codigo_ibge: 2905701, estadoId: 2 },
        { id: 10, nome: 'Ilhéus', codigo_ibge: 2913606, estadoId: 2 },

        // Espírito Santo (estadoId: 3)
        { id: 11, nome: 'Vitória', codigo_ibge: 3205309, estadoId: 3 },
        { id: 12, nome: 'Vila Velha', codigo_ibge: 3205200, estadoId: 3 },
        { id: 13, nome: 'Serra', codigo_ibge: 3205002, estadoId: 3 },
        { id: 14, nome: 'Cariacica', codigo_ibge: 3201308, estadoId: 3 },

        // São Paulo (estadoId: 4)
        { id: 15, nome: 'São Paulo', codigo_ibge: 3550308, estadoId: 4 },
        { id: 16, nome: 'Campinas', codigo_ibge: 3509502, estadoId: 4 },
        { id: 17, nome: 'São Bernardo do Campo', codigo_ibge: 3548708, estadoId: 4 },
        { id: 18, nome: 'Santo André', codigo_ibge: 3547809, estadoId: 4 }
      ]);

      setFuncoes([
        { id: 1, nome: 'Presidente', descricao: 'Presidente da organização' },
        { id: 2, nome: 'Vice-Presidente', descricao: 'Vice-Presidente da organização' },
        { id: 3, nome: 'Secretário', descricao: 'Secretário da organização' },
        { id: 4, nome: 'Tesoureiro', descricao: 'Tesoureiro da organização' },
        { id: 5, nome: 'Diretor', descricao: 'Diretor da organização' },
        { id: 6, nome: 'Coordenador', descricao: 'Coordenador da organização' },
        { id: 7, nome: 'Outro', descricao: 'Outra função' }
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  };

  const handleInputChange = (campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (erros[campo]) {
      setErros(prev => {
        const novosErros = { ...prev };
        delete novosErros[campo];
        return novosErros;
      });
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    // Validações básicas
    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome da organização é obrigatório';
    }

    // Validação de CNPJ (se fornecido)
    if (formData.cnpj && formData.cnpj.length !== 14) {
      novosErros.cnpj = 'CNPJ deve ter 14 dígitos';
    }

    // Validação de CPF do representante (se fornecido)
    if (formData.representanteCpf && formData.representanteCpf.length !== 11) {
      novosErros.representanteCpf = 'CPF deve ter 11 dígitos';
    }

    // Validação de email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    if (formData.representanteEmail && !/\S+@\S+\.\S+/.test(formData.representanteEmail)) {
      novosErros.representanteEmail = 'Email do representante inválido';
    }

    // Validação de CEP
    if (formData.organizacaoEndCep && formData.organizacaoEndCep.length !== 8) {
      novosErros.organizacaoEndCep = 'CEP deve ter 8 dígitos';
    }

    if (formData.representanteEndCep && formData.representanteEndCep.length !== 8) {
      novosErros.representanteEndCep = 'CEP do representante deve ter 8 dígitos';
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

      // Preparar dados para envio
      const dadosParaEnvio: any = {
        nome: formData.nome.trim(),
        cnpj: formData.cnpj || null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        dataFundacao: formData.dataFundacao || null,
        estado: formData.estado ? parseInt(formData.estado) : null,
        municipio: formData.municipio ? parseInt(formData.municipio) : null,
        gpsLat: formData.gpsLat ? parseFloat(formData.gpsLat) : null,
        gpsLng: formData.gpsLng ? parseFloat(formData.gpsLng) : null,
        gpsAlt: formData.gpsAlt ? parseFloat(formData.gpsAlt) : null,
        gpsAcc: formData.gpsAcc ? parseFloat(formData.gpsAcc) : null,
        
        // Endereço
        organizacaoEndLogradouro: formData.organizacaoEndLogradouro || null,
        organizacaoEndBairro: formData.organizacaoEndBairro || null,
        organizacaoEndComplemento: formData.organizacaoEndComplemento || null,
        organizacaoEndNumero: formData.organizacaoEndNumero || null,
        organizacaoEndCep: formData.organizacaoEndCep || null,
        
        // Representante
        representanteNome: formData.representanteNome || null,
        representanteCpf: formData.representanteCpf || null,
        representanteRg: formData.representanteRg || null,
        representanteTelefone: formData.representanteTelefone || null,
        representanteEmail: formData.representanteEmail || null,
        representanteEndLogradouro: formData.representanteEndLogradouro || null,
        representanteEndBairro: formData.representanteEndBairro || null,
        representanteEndComplemento: formData.representanteEndComplemento || null,
        representanteEndNumero: formData.representanteEndNumero || null,
        representanteEndCep: formData.representanteEndCep || null,
        representanteFuncao: formData.representanteFuncao ? parseInt(formData.representanteFuncao) : null,
        
        // Características
        caracteristicasNTotalSocios: formData.caracteristicasNTotalSocios ? parseInt(formData.caracteristicasNTotalSocios) : null,
        caracteristicasNTotalSociosCaf: formData.caracteristicasNTotalSociosCaf ? parseInt(formData.caracteristicasNTotalSociosCaf) : null,
        caracteristicasNAtivosTotal: formData.caracteristicasNAtivosTotal ? parseInt(formData.caracteristicasNAtivosTotal) : null,
        
        // Observações
        obs: formData.obs || null
      };

      const novaOrganizacao = await organizacaoAPI.create(dadosParaEnvio);
      
      alert('Organização cadastrada com sucesso!');
      onNavigate('detalhes', novaOrganizacao.id);

    } catch (error) {
      console.error('Erro ao cadastrar organização:', error);
      alert('Erro ao cadastrar organização: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  // Filtro de municípios baseado no estado selecionado
  const municipiosFiltrados = useMemo(() => {
    if (!formData.estado) {
      return [];
    }
    return municipios.filter(municipio =>
      municipio.estadoId === parseInt(formData.estado)
    );
  }, [municipios, formData.estado]);

  const renderAbaDadosBasicos = () => (
    <div className="aba-content">
      <h3><Clipboard size={18} style={{marginRight: '0.5rem'}} /> Dados Básicos da Organização</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="nome">Nome da Organização *</label>
          <input
            type="text"
            id="nome"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className={erros.nome ? 'error' : ''}
            placeholder="Ex: Cooperativa de Agricultores Familiares"
            maxLength={255}
          />
          {erros.nome && <span className="error-message">{erros.nome}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            type="text"
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => handleInputChange('cnpj', e.target.value.replace(/\D/g, ''))}
            className={erros.cnpj ? 'error' : ''}
            placeholder="00000000000000"
            maxLength={14}
          />
          {erros.cnpj && <span className="error-message">{erros.cnpj}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="text"
            id="telefone"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            placeholder="(XX) XXXXX-XXXX"
            maxLength={15}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={erros.email ? 'error' : ''}
            placeholder="organizacao@exemplo.com"
          />
          {erros.email && <span className="error-message">{erros.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="dataFundacao">Data de Fundação</label>
          <input
            type="date"
            id="dataFundacao"
            value={formData.dataFundacao}
            onChange={(e) => handleInputChange('dataFundacao', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            value={formData.estado}
            onChange={(e) => {
              const novoEstado = e.target.value;
              handleInputChange('estado', novoEstado);
              // Reset município quando estado muda
              if (formData.municipio) {
                handleInputChange('municipio', '');
              }
            }}
          >
            <option value="">Selecione o estado</option>
            {estados.map(estado => (
              <option key={estado.id} value={estado.id}>
                {estado.nome} ({estado.uf})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="municipio">Município</label>
          <select
            id="municipio"
            value={formData.municipio}
            onChange={(e) => handleInputChange('municipio', e.target.value)}
            disabled={!formData.estado}
            key={`municipio-${formData.estado}`} // Força re-render quando estado muda
          >
            <option value="">Selecione o município</option>
            {municipiosFiltrados.map(municipio => (
              <option key={municipio.id} value={municipio.id}>
                {municipio.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h4>📍 Coordenadas GPS</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="gpsLat">Latitude</label>
          <input
            type="number"
            id="gpsLat"
            value={formData.gpsLat}
            onChange={(e) => handleInputChange('gpsLat', e.target.value)}
            placeholder="-18.24068"
            step="any"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gpsLng">Longitude</label>
          <input
            type="number"
            id="gpsLng"
            value={formData.gpsLng}
            onChange={(e) => handleInputChange('gpsLng', e.target.value)}
            placeholder="-43.60235"
            step="any"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gpsAlt">Altitude</label>
          <input
            type="number"
            id="gpsAlt"
            value={formData.gpsAlt}
            onChange={(e) => handleInputChange('gpsAlt', e.target.value)}
            placeholder="1200"
            step="any"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gpsAcc">Precisão GPS</label>
          <input
            type="number"
            id="gpsAcc"
            value={formData.gpsAcc}
            onChange={(e) => handleInputChange('gpsAcc', e.target.value)}
            placeholder="5.0"
            step="any"
          />
        </div>
      </div>
    </div>
  );

  const renderAbaEndereco = () => (
    <div className="aba-content">
      <h3><Home size={18} style={{marginRight: '0.5rem'}} /> Endereço da Organização</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="organizacaoEndLogradouro">Logradouro</label>
          <input
            type="text"
            id="organizacaoEndLogradouro"
            value={formData.organizacaoEndLogradouro}
            onChange={(e) => handleInputChange('organizacaoEndLogradouro', e.target.value)}
            placeholder="Rua, Avenida, etc."
            maxLength={255}
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizacaoEndNumero">Número</label>
          <input
            type="text"
            id="organizacaoEndNumero"
            value={formData.organizacaoEndNumero}
            onChange={(e) => handleInputChange('organizacaoEndNumero', e.target.value)}
            placeholder="123"
            maxLength={10}
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizacaoEndBairro">Bairro</label>
          <input
            type="text"
            id="organizacaoEndBairro"
            value={formData.organizacaoEndBairro}
            onChange={(e) => handleInputChange('organizacaoEndBairro', e.target.value)}
            placeholder="Centro"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizacaoEndComplemento">Complemento</label>
          <input
            type="text"
            id="organizacaoEndComplemento"
            value={formData.organizacaoEndComplemento}
            onChange={(e) => handleInputChange('organizacaoEndComplemento', e.target.value)}
            placeholder="Sala 101, Andar 2, etc."
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizacaoEndCep">CEP</label>
          <input
            type="text"
            id="organizacaoEndCep"
            value={formData.organizacaoEndCep}
            onChange={(e) => handleInputChange('organizacaoEndCep', e.target.value.replace(/\D/g, ''))}
            className={erros.organizacaoEndCep ? 'error' : ''}
            placeholder="00000000"
            maxLength={8}
          />
          {erros.organizacaoEndCep && <span className="error-message">{erros.organizacaoEndCep}</span>}
        </div>
      </div>
    </div>
  );

  const renderAbaRepresentante = () => (
    <div className="aba-content">
      <h3>👤 Dados do Representante</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="representanteNome">Nome do Representante</label>
          <input
            type="text"
            id="representanteNome"
            value={formData.representanteNome}
            onChange={(e) => handleInputChange('representanteNome', e.target.value)}
            placeholder="Nome completo"
            maxLength={255}
          />
        </div>

        <div className="form-group">
          <label htmlFor="representanteCpf">CPF</label>
          <input
            type="text"
            id="representanteCpf"
            value={formData.representanteCpf}
            onChange={(e) => handleInputChange('representanteCpf', e.target.value.replace(/\D/g, ''))}
            className={erros.representanteCpf ? 'error' : ''}
            placeholder="00000000000"
            maxLength={11}
          />
          {erros.representanteCpf && <span className="error-message">{erros.representanteCpf}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="representanteRg">RG</label>
          <input
            type="text"
            id="representanteRg"
            value={formData.representanteRg}
            onChange={(e) => handleInputChange('representanteRg', e.target.value)}
            placeholder="00.000.000-0"
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label htmlFor="representanteTelefone">Telefone</label>
          <input
            type="text"
            id="representanteTelefone"
            value={formData.representanteTelefone}
            onChange={(e) => handleInputChange('representanteTelefone', e.target.value)}
            placeholder="(XX) XXXXX-XXXX"
            maxLength={15}
          />
        </div>

        <div className="form-group">
          <label htmlFor="representanteEmail">Email</label>
          <input
            type="email"
            id="representanteEmail"
            value={formData.representanteEmail}
            onChange={(e) => handleInputChange('representanteEmail', e.target.value)}
            className={erros.representanteEmail ? 'error' : ''}
            placeholder="representante@exemplo.com"
          />
          {erros.representanteEmail && <span className="error-message">{erros.representanteEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="representanteFuncao">Função</label>
          <select
            id="representanteFuncao"
            value={formData.representanteFuncao}
            onChange={(e) => handleInputChange('representanteFuncao', e.target.value)}
          >
            <option value="">Selecione a função</option>
            {funcoes.map(funcao => (
              <option key={funcao.id} value={funcao.id}>
                {funcao.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h4><Home size={16} style={{marginRight: '0.5rem'}} /> Endereço do Representante</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="representanteEndLogradouro">Logradouro</label>
          <input
            type="text"
            id="representanteEndLogradouro"
            value={formData.representanteEndLogradouro}
            onChange={(e) => handleInputChange('representanteEndLogradouro', e.target.value)}
            placeholder="Rua, Avenida, etc."
            maxLength={255}
          />
        </div>

        <div className="form-group">
          <label htmlFor="representanteEndNumero">Número</label>
          <input
            type="text"
            id="representanteEndNumero"
            value={formData.representanteEndNumero}
            onChange={(e) => handleInputChange('representanteEndNumero', e.target.value)}
            placeholder="123"
            maxLength={10}
          />
        </div>

        <div className="form-group">
          <label htmlFor="representanteEndBairro">Bairro</label>
          <input
            type="text"
            id="representanteEndBairro"
            value={formData.representanteEndBairro}
            onChange={(e) => handleInputChange('representanteEndBairro', e.target.value)}
            placeholder="Centro"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="representanteEndComplemento">Complemento</label>
          <input
            type="text"
            id="representanteEndComplemento"
            value={formData.representanteEndComplemento}
            onChange={(e) => handleInputChange('representanteEndComplemento', e.target.value)}
            placeholder="Apto 101, Casa, etc."
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="representanteEndCep">CEP</label>
          <input
            type="text"
            id="representanteEndCep"
            value={formData.representanteEndCep}
            onChange={(e) => handleInputChange('representanteEndCep', e.target.value.replace(/\D/g, ''))}
            className={erros.representanteEndCep ? 'error' : ''}
            placeholder="00000000"
            maxLength={8}
          />
          {erros.representanteEndCep && <span className="error-message">{erros.representanteEndCep}</span>}
        </div>
      </div>
    </div>
  );

  const renderAbaCaracteristicas = () => (
    <div className="aba-content">
      <h3><BarChart size={18} style={{marginRight: '0.5rem'}} /> Características da Organização</h3>

      <h4><Users size={16} style={{marginRight: '0.5rem'}} /> Sócios e Associados</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="caracteristicasNTotalSocios">Total de Sócios</label>
          <input
            type="number"
            id="caracteristicasNTotalSocios"
            value={formData.caracteristicasNTotalSocios}
            onChange={(e) => handleInputChange('caracteristicasNTotalSocios', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasNTotalSociosCaf">Sócios Cafeicultores</label>
          <input
            type="number"
            id="caracteristicasNTotalSociosCaf"
            value={formData.caracteristicasNTotalSociosCaf}
            onChange={(e) => handleInputChange('caracteristicasNTotalSociosCaf', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasNDistintosCaf">Distintos Cafeicultores</label>
          <input
            type="number"
            id="caracteristicasNDistintosCaf"
            value={formData.caracteristicasNDistintosCaf}
            onChange={(e) => handleInputChange('caracteristicasNDistintosCaf', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasNAtivosTotal">Total de Ativos</label>
          <input
            type="number"
            id="caracteristicasNAtivosTotal"
            value={formData.caracteristicasNAtivosTotal}
            onChange={(e) => handleInputChange('caracteristicasNAtivosTotal', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasNAtivosCaf">Ativos Cafeicultores</label>
          <input
            type="number"
            id="caracteristicasNAtivosCaf"
            value={formData.caracteristicasNAtivosCaf}
            onChange={(e) => handleInputChange('caracteristicasNAtivosCaf', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <h4><Sprout size={16} style={{marginRight: '0.5rem'}} /> Programas de Aquisição</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="caracteristicasNSociosPaa">Sócios PAA</label>
          <input
            type="number"
            id="caracteristicasNSociosPaa"
            value={formData.caracteristicasNSociosPaa}
            onChange={(e) => handleInputChange('caracteristicasNSociosPaa', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasNNaosociosPaa">Não-Sócios PAA</label>
          <input
            type="number"
            id="caracteristicasNNaosociosPaa"
            value={formData.caracteristicasNNaosociosPaa}
            onChange={(e) => handleInputChange('caracteristicasNNaosociosPaa', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasNSociosPnae">Sócios PNAE</label>
          <input
            type="number"
            id="caracteristicasNSociosPnae"
            value={formData.caracteristicasNSociosPnae}
            onChange={(e) => handleInputChange('caracteristicasNSociosPnae', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasNNaosociosPnae">Não-Sócios PNAE</label>
          <input
            type="number"
            id="caracteristicasNNaosociosPnae"
            value={formData.caracteristicasNNaosociosPnae}
            onChange={(e) => handleInputChange('caracteristicasNNaosociosPnae', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <h4><Coffee size={16} style={{marginRight: '0.5rem'}} /> Características do Café</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="caracteristicasTaCafConvencional">Café Convencional</label>
          <input
            type="number"
            id="caracteristicasTaCafConvencional"
            value={formData.caracteristicasTaCafConvencional}
            onChange={(e) => handleInputChange('caracteristicasTaCafConvencional', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasTaCafAgroecologico">Café Agroecológico</label>
          <input
            type="number"
            id="caracteristicasTaCafAgroecologico"
            value={formData.caracteristicasTaCafAgroecologico}
            onChange={(e) => handleInputChange('caracteristicasTaCafAgroecologico', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasTaCafTransicao">Café em Transição</label>
          <input
            type="number"
            id="caracteristicasTaCafTransicao"
            value={formData.caracteristicasTaCafTransicao}
            onChange={(e) => handleInputChange('caracteristicasTaCafTransicao', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasTaCafOrganico">Café Orgânico</label>
          <input
            type="number"
            id="caracteristicasTaCafOrganico"
            value={formData.caracteristicasTaCafOrganico}
            onChange={(e) => handleInputChange('caracteristicasTaCafOrganico', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <h4><Users2 size={16} style={{marginRight: '0.5rem'}} /> Distribuição por Gênero - Associados</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="caracteristicasTaAMulher">Associadas (Mulheres)</label>
          <input
            type="number"
            id="caracteristicasTaAMulher"
            value={formData.caracteristicasTaAMulher}
            onChange={(e) => handleInputChange('caracteristicasTaAMulher', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasTaAHomem">Associados (Homens)</label>
          <input
            type="number"
            id="caracteristicasTaAHomem"
            value={formData.caracteristicasTaAHomem}
            onChange={(e) => handleInputChange('caracteristicasTaAHomem', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <h4><Factory size={16} style={{marginRight: '0.5rem'}} /> Distribuição por Gênero - Empresários</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="caracteristicasTaEMulher">Empresárias (Mulheres)</label>
          <input
            type="number"
            id="caracteristicasTaEMulher"
            value={formData.caracteristicasTaEMulher}
            onChange={(e) => handleInputChange('caracteristicasTaEMulher', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasTaEHomem">Empresários (Homens)</label>
          <input
            type="number"
            id="caracteristicasTaEHomem"
            value={formData.caracteristicasTaEHomem}
            onChange={(e) => handleInputChange('caracteristicasTaEHomem', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <h4><Wheat size={16} style={{marginRight: '0.5rem'}} /> Agricultura Familiar</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="caracteristicasTaAfMulher">Agricultoras Familiares</label>
          <input
            type="number"
            id="caracteristicasTaAfMulher"
            value={formData.caracteristicasTaAfMulher}
            onChange={(e) => handleInputChange('caracteristicasTaAfMulher', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="caracteristicasTaAfHomem">Agricultores Familiares</label>
          <input
            type="number"
            id="caracteristicasTaAfHomem"
            value={formData.caracteristicasTaAfHomem}
            onChange={(e) => handleInputChange('caracteristicasTaAfHomem', e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderAbaQuestionarios = () => (
    <div className="aba-content">
      <h3><FormInput size={18} style={{marginRight: '0.5rem'}} /> Questionários e Observações</h3>
      
      <div className="questionarios-info">
        <div className="info-card">
          <h4><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Módulos de Questionários</h4>
          <p>Os questionários detalhados (GO, GPP, GC, GF, GP, GS, GI, IS) serão preenchidos posteriormente através dos módulos específicos.</p>
          
          <div className="modulos-grid">
            <div className="modulo-item">
              <strong>GO</strong> - Gestão Organizacional
            </div>
            <div className="modulo-item">
              <strong>GPP</strong> - Gestão de Processos Produtivos
            </div>
            <div className="modulo-item">
              <strong>GC</strong> - Gestão Comercial
            </div>
            <div className="modulo-item">
              <strong>GF</strong> - Gestão Financeira
            </div>
            <div className="modulo-item">
              <strong>GP</strong> - Gestão de Pessoas
            </div>
            <div className="modulo-item">
              <strong>GS</strong> - Gestão Socioambiental
            </div>
            <div className="modulo-item">
              <strong>GI</strong> - Gestão da Inovação
            </div>
            <div className="modulo-item">
              <strong>IS</strong> - Infraestrutura e Sustentabilidade
            </div>
          </div>
        </div>
      </div>

      <h4><FormInput size={16} style={{marginRight: '0.5rem'}} /> Observações Gerais</h4>
      <div className="form-group">
        <label htmlFor="obs">Observações</label>
        <textarea
          id="obs"
          value={formData.obs}
          onChange={(e) => handleInputChange('obs', e.target.value)}
          placeholder="Observações gerais sobre a organização..."
          rows={6}
          maxLength={8192}
        />
        <small className="char-count">
          {formData.obs.length}/8192 caracteres
        </small>
      </div>

      <h4><CheckCircle size={16} style={{marginRight: '0.5rem'}} /> Informações Adicionais</h4>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="simNaoProducao">Tem Produção?</label>
          <select
            id="simNaoProducao"
            value={formData.simNaoProducao}
            onChange={(e) => handleInputChange('simNaoProducao', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="1">Sim</option>
            <option value="2">Não</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="simNaoFile">Tem Arquivos?</label>
          <select
            id="simNaoFile"
            value={formData.simNaoFile}
            onChange={(e) => handleInputChange('simNaoFile', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="1">Sim</option>
            <option value="2">Não</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="simNaoPj">É Pessoa Jurídica?</label>
          <select
            id="simNaoPj"
            value={formData.simNaoPj}
            onChange={(e) => handleInputChange('simNaoPj', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="1">Sim</option>
            <option value="2">Não</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="simNaoSocio">Tem Sócios?</label>
          <select
            id="simNaoSocio"
            value={formData.simNaoSocio}
            onChange={(e) => handleInputChange('simNaoSocio', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="1">Sim</option>
            <option value="2">Não</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cadastro-content">
      <div className="content-header">
        <div className="header-info">
          <h2><Plus size={20} style={{marginRight: '0.5rem'}} /> Cadastro de Organização</h2>
          <p>Preencha os dados da nova organização</p>
        </div>
        
        <div className="header-actions">
          <button 
            type="button"
            onClick={() => onNavigate('lista')}
            className="btn btn-secondary"
          >
            ← Voltar para Lista
          </button>
        </div>
      </div>

      <div className="cadastro-body">
        <form onSubmit={handleSubmit} className="cadastro-form">
          {/* Navegação por abas */}
          <div className="tabs-navigation">
            <button
              type="button"
              className={`tab-button ${abaAtiva === 'basicos' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('basicos')}
            >
              <Clipboard size={14} style={{marginRight: '0.25rem'}} /> Dados Básicos
            </button>
            <button
              type="button"
              className={`tab-button ${abaAtiva === 'endereco' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('endereco')}
            >
              <Home size={14} style={{marginRight: '0.25rem'}} /> Endereço
            </button>
            <button
              type="button"
              className={`tab-button ${abaAtiva === 'representante' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('representante')}
            >
              <User size={14} style={{marginRight: '0.25rem'}} /> Representante
            </button>
            <button
              type="button"
              className={`tab-button ${abaAtiva === 'caracteristicas' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('caracteristicas')}
            >
              <BarChart size={14} style={{marginRight: '0.25rem'}} /> Características
            </button>
            <button
              type="button"
              className={`tab-button ${abaAtiva === 'questionarios' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('questionarios')}
            >
              <FormInput size={14} style={{marginRight: '0.25rem'}} /> Questionários
            </button>
          </div>

          {/* Conteúdo das abas */}
          <div className="tab-content">
            {abaAtiva === 'basicos' && renderAbaDadosBasicos()}
            {abaAtiva === 'endereco' && renderAbaEndereco()}
            {abaAtiva === 'representante' && renderAbaRepresentante()}
            {abaAtiva === 'caracteristicas' && renderAbaCaracteristicas()}
            {abaAtiva === 'questionarios' && renderAbaQuestionarios()}
          </div>

          {/* Navegação entre abas */}
          <div className="form-navigation">
            <div className="nav-buttons">
              {abaAtiva !== 'basicos' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const abas: AbaAtiva[] = ['basicos', 'endereco', 'representante', 'caracteristicas', 'questionarios'];
                    const indexAtual = abas.indexOf(abaAtiva);
                    if (indexAtual > 0) {
                      setAbaAtiva(abas[indexAtual - 1]);
                    }
                  }}
                >
                  <ChevronLeft size={14} style={{marginRight: '0.25rem'}} /> Anterior
                </button>
              )}

              {abaAtiva !== 'questionarios' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const abas: AbaAtiva[] = ['basicos', 'endereco', 'representante', 'caracteristicas', 'questionarios'];
                    const indexAtual = abas.indexOf(abaAtiva);
                    if (indexAtual < abas.length - 1) {
                      setAbaAtiva(abas[indexAtual + 1]);
                    }
                  }}
                >
                  Próxima <ChevronRight size={14} style={{marginLeft: '0.25rem'}} />
                </button>
              )}

              {abaAtiva === 'questionarios' && (
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : '💾 Salvar Organização'}
                </button>
              )}
            </div>

            <div className="progress-indicator">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${((['basicos', 'endereco', 'representante', 'caracteristicas', 'questionarios'].indexOf(abaAtiva) + 1) / 5) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="progress-text">
                Etapa {['basicos', 'endereco', 'representante', 'caracteristicas', 'questionarios'].indexOf(abaAtiva) + 1} de 5
              </span>
            </div>
          </div>

          {/* Botão de salvar fixo no final */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-success btn-large"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Salvando Organização...
                </>
              ) : (
                <>
                  <Save size={16} style={{marginRight: '0.5rem'}} /> Salvar Organização
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroOrganizacao;