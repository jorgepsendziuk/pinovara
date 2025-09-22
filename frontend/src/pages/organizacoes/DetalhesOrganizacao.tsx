import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { organizacaoAPI } from '../../services/api';

interface DetalhesOrganizacaoProps {
  organizacaoId: number;
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'detalhes' | 'edicao', organizacaoId?: number) => void;
}

function DetalhesOrganizacao({ organizacaoId, onNavigate }: DetalhesOrganizacaoProps) {
  const { user } = useAuth();
  const [organizacao, setOrganizacao] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarOrganizacao();
  }, [organizacaoId]);

  const carregarOrganizacao = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await organizacaoAPI.getById(organizacaoId);
      setOrganizacao(data);
    } catch (err) {
      console.error('Erro ao carregar organização:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirm(`Tem certeza que deseja excluir a organização "${organizacao?.nome}"?`)) {
      return;
    }

    try {
      await organizacaoAPI.delete(organizacaoId);
      alert('✅ Organização excluída com sucesso!');
      onNavigate('lista');
    } catch (error) {
      console.error('Erro ao excluir organização:', error);
      alert('❌ Erro ao excluir organização: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarCoordenada = (coord: number | null) => {
    if (!coord) return '-';
    return coord.toFixed(6);
  };

  if (loading) {
    return (
      <div className="detalhes-content">
        <div className="content-header">
          <h2>👁️ Carregando Organização...</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dados da organização...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalhes-content">
        <div className="content-header">
          <h2>❌ Erro ao Carregar</h2>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={carregarOrganizacao} className="btn btn-primary">
            Tentar Novamente
          </button>
          <button onClick={() => onNavigate('lista')} className="btn btn-secondary">
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  if (!organizacao) {
    return (
      <div className="detalhes-content">
        <div className="content-header">
          <h2>❌ Organização Não Encontrada</h2>
        </div>
        <div className="error-message">
          <p>A organização solicitada não foi encontrada.</p>
          <button onClick={() => onNavigate('lista')} className="btn btn-primary">
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalhes-content">
      <div className="content-header">
        <div className="header-info">
          <h2>👁️ Detalhes da Organização</h2>
          <p>{organizacao.nome}</p>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => onNavigate('edicao', organizacaoId)}
            className="btn btn-primary"
          >
            ✏️ Editar
          </button>
          <button 
            onClick={() => onNavigate('lista')}
            className="btn btn-secondary"
          >
            ← Voltar para Lista
          </button>
        </div>
      </div>

      <div className="detalhes-body">
        <div className="detalhes-grid">
          {/* Dados Básicos */}
          <div className="detalhes-card">
            <h4>📋 Dados Básicos</h4>
            <div className="info-list">
              <div className="info-item">
                <label>ID:</label>
                <span>#{organizacao.id}</span>
              </div>
              <div className="info-item">
                <label>Nome:</label>
                <span>{organizacao.nome || '-'}</span>
              </div>
              <div className="info-item">
                <label>CNPJ:</label>
                <span>{organizacao.cnpj || '-'}</span>
              </div>
              <div className="info-item">
                <label>Telefone:</label>
                <span>{organizacao.telefone || '-'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{organizacao.email || '-'}</span>
              </div>
              <div className="info-item">
                <label>Data de Fundação:</label>
                <span>{formatarData(organizacao.dataFundacao)}</span>
              </div>
              <div className="info-item">
                <label>Data da Visita:</label>
                <span>{formatarData(organizacao.dataVisita)}</span>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="detalhes-card">
            <h4>📍 Localização</h4>
            <div className="info-list">
              <div className="info-item">
                <label>Estado:</label>
                <span>{organizacao.estado || '-'}</span>
              </div>
              <div className="info-item">
                <label>Município:</label>
                <span>{organizacao.municipio || '-'}</span>
              </div>
              <div className="info-item">
                <label>Latitude:</label>
                <span>{formatarCoordenada(organizacao.gpsLat)}</span>
              </div>
              <div className="info-item">
                <label>Longitude:</label>
                <span>{formatarCoordenada(organizacao.gpsLng)}</span>
              </div>
              <div className="info-item">
                <label>Altitude:</label>
                <span>{organizacao.gpsAlt ? `${organizacao.gpsAlt}m` : '-'}</span>
              </div>
              <div className="info-item">
                <label>Precisão GPS:</label>
                <span>{organizacao.gpsAcc ? `${organizacao.gpsAcc}m` : '-'}</span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="detalhes-card">
            <h4>🏠 Endereço</h4>
            <div className="info-list">
              <div className="info-item">
                <label>Logradouro:</label>
                <span>{organizacao.organizacaoEndLogradouro || '-'}</span>
              </div>
              <div className="info-item">
                <label>Número:</label>
                <span>{organizacao.organizacaoEndNumero || '-'}</span>
              </div>
              <div className="info-item">
                <label>Bairro:</label>
                <span>{organizacao.organizacaoEndBairro || '-'}</span>
              </div>
              <div className="info-item">
                <label>Complemento:</label>
                <span>{organizacao.organizacaoEndComplemento || '-'}</span>
              </div>
              <div className="info-item">
                <label>CEP:</label>
                <span>{organizacao.organizacaoEndCep || '-'}</span>
              </div>
            </div>
          </div>

          {/* Representante */}
          <div className="detalhes-card">
            <h4>👤 Representante</h4>
            <div className="info-list">
              <div className="info-item">
                <label>Nome:</label>
                <span>{organizacao.representanteNome || '-'}</span>
              </div>
              <div className="info-item">
                <label>CPF:</label>
                <span>{organizacao.representanteCpf || '-'}</span>
              </div>
              <div className="info-item">
                <label>RG:</label>
                <span>{organizacao.representanteRg || '-'}</span>
              </div>
              <div className="info-item">
                <label>Telefone:</label>
                <span>{organizacao.representanteTelefone || '-'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{organizacao.representanteEmail || '-'}</span>
              </div>
              <div className="info-item">
                <label>Função:</label>
                <span>{organizacao.representanteFuncao || '-'}</span>
              </div>
            </div>
          </div>

          {/* Características Sociais */}
          <div className="detalhes-card">
            <h4>👥 Características Sociais</h4>
            <div className="info-list">
              <div className="info-item">
                <label>Total de Sócios:</label>
                <span>{organizacao.caracteristicasNTotalSocios || '0'}</span>
              </div>
              <div className="info-item">
                <label>Sócios Cafeicultores:</label>
                <span>{organizacao.caracteristicasNTotalSociosCaf || '0'}</span>
              </div>
              <div className="info-item">
                <label>Distintos Cafeicultores:</label>
                <span>{organizacao.caracteristicasNDistintosCaf || '0'}</span>
              </div>
              <div className="info-item">
                <label>Total de Ativos:</label>
                <span>{organizacao.caracteristicasNAtivosTotal || '0'}</span>
              </div>
              <div className="info-item">
                <label>Ativos Cafeicultores:</label>
                <span>{organizacao.caracteristicasNAtivosCaf || '0'}</span>
              </div>
            </div>
          </div>

          {/* Programas de Aquisição */}
          <div className="detalhes-card">
            <h4>🌱 Programas de Aquisição</h4>
            <div className="info-list">
              <div className="info-item">
                <label>Sócios PAA:</label>
                <span>{organizacao.caracteristicasNSociosPaa || '0'}</span>
              </div>
              <div className="info-item">
                <label>Não-Sócios PAA:</label>
                <span>{organizacao.caracteristicasNNaosociosPaa || '0'}</span>
              </div>
              <div className="info-item">
                <label>Sócios PNAE:</label>
                <span>{organizacao.caracteristicasNSociosPnae || '0'}</span>
              </div>
              <div className="info-item">
                <label>Não-Sócios PNAE:</label>
                <span>{organizacao.caracteristicasNNaosociosPnae || '0'}</span>
              </div>
            </div>
          </div>

          {/* Características do Café */}
          <div className="detalhes-card">
            <h4>☕ Características do Café</h4>
            <div className="info-list">
              <div className="info-item">
                <label>Convencional:</label>
                <span>{organizacao.caracteristicasTaCafConvencional || '0'}</span>
              </div>
              <div className="info-item">
                <label>Agroecológico:</label>
                <span>{organizacao.caracteristicasTaCafAgroecologico || '0'}</span>
              </div>
              <div className="info-item">
                <label>Em Transição:</label>
                <span>{organizacao.caracteristicasTaCafTransicao || '0'}</span>
              </div>
              <div className="info-item">
                <label>Orgânico:</label>
                <span>{organizacao.caracteristicasTaCafOrganico || '0'}</span>
              </div>
            </div>
          </div>

          {/* Distribuição por Gênero */}
          <div className="detalhes-card">
            <h4>👫 Distribuição por Gênero</h4>
            <div className="genero-grid">
              <div className="genero-section">
                <h5>Associados</h5>
                <div className="info-item">
                  <label>Mulheres:</label>
                  <span>{organizacao.caracteristicasTaAMulher || '0'}</span>
                </div>
                <div className="info-item">
                  <label>Homens:</label>
                  <span>{organizacao.caracteristicasTaAHomem || '0'}</span>
                </div>
              </div>
              
              <div className="genero-section">
                <h5>Empresários</h5>
                <div className="info-item">
                  <label>Mulheres:</label>
                  <span>{organizacao.caracteristicasTaEMulher || '0'}</span>
                </div>
                <div className="info-item">
                  <label>Homens:</label>
                  <span>{organizacao.caracteristicasTaEHomem || '0'}</span>
                </div>
              </div>
              
              <div className="genero-section">
                <h5>Agricultura Familiar</h5>
                <div className="info-item">
                  <label>Mulheres:</label>
                  <span>{organizacao.caracteristicasTaAfMulher || '0'}</span>
                </div>
                <div className="info-item">
                  <label>Homens:</label>
                  <span>{organizacao.caracteristicasTaAfHomem || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Questionários */}
        <div className="questionarios-section">
          <h3>📝 Questionários de Avaliação</h3>
          
          <div className="questionarios-grid">
            <div className="questionario-card">
              <h4>GO - Gestão Organizacional</h4>
              <div className="questionario-status">
                <span className="status-badge status-pending">Em Desenvolvimento</span>
                <small>0% completo</small>
              </div>
              <p>Avaliação da estrutura organizacional, direção, controle e educação.</p>
              <button className="btn btn-primary btn-sm">
                📝 Preencher Questionário
              </button>
            </div>

            <div className="questionario-card">
              <h4>GPP - Gestão de Processos Produtivos</h4>
              <div className="questionario-status">
                <span className="status-badge status-pending">Em Desenvolvimento</span>
                <small>0% completo</small>
              </div>
              <p>Planejamento, logística, qualidade e processos produtivos.</p>
              <button className="btn btn-primary btn-sm">
                📝 Preencher Questionário
              </button>
            </div>

            <div className="questionario-card">
              <h4>GC - Gestão Comercial</h4>
              <div className="questionario-status">
                <span className="status-badge status-pending">Em Desenvolvimento</span>
                <small>0% completo</small>
              </div>
              <p>Estratégia comercial, mercado e modelos de negócio.</p>
              <button className="btn btn-primary btn-sm">
                📝 Preencher Questionário
              </button>
            </div>

            <div className="questionario-card">
              <h4>GF - Gestão Financeira</h4>
              <div className="questionario-status">
                <span className="status-badge status-pending">Em Desenvolvimento</span>
                <small>0% completo</small>
              </div>
              <p>Contas, caixa, estoque, resultados e análises financeiras.</p>
              <button className="btn btn-primary btn-sm">
                📝 Preencher Questionário
              </button>
            </div>

            <div className="questionario-card">
              <h4>GP - Gestão de Pessoas</h4>
              <div className="questionario-status">
                <span className="status-badge status-pending">Em Desenvolvimento</span>
                <small>0% completo</small>
              </div>
              <p>Gestão de pessoas, desenvolvimento e relações de trabalho.</p>
              <button className="btn btn-primary btn-sm">
                📝 Preencher Questionário
              </button>
            </div>

            <div className="questionario-card">
              <h4>GS - Gestão Socioambiental</h4>
              <div className="questionario-status">
                <span className="status-badge status-pending">Em Desenvolvimento</span>
                <small>0% completo</small>
              </div>
              <p>Aspectos socioambientais e impactos ambientais.</p>
              <button className="btn btn-primary btn-sm">
                📝 Preencher Questionário
              </button>
            </div>

            <div className="questionario-card">
              <h4>GI - Gestão da Inovação</h4>
              <div className="questionario-status">
                <span className="status-badge status-pending">Em Desenvolvimento</span>
                <small>0% completo</small>
              </div>
              <p>Inovação, marketing e gestão de times.</p>
              <button className="btn btn-primary btn-sm">
                📝 Preencher Questionário
              </button>
            </div>

            <div className="questionario-card">
              <h4>IS - Infraestrutura e Sustentabilidade</h4>
              <div className="questionario-status">
                <span className="status-badge status-pending">Em Desenvolvimento</span>
                <small>0% completo</small>
              </div>
              <p>Recursos naturais, água, energia e sustentabilidade.</p>
              <button className="btn btn-primary btn-sm">
                📝 Preencher Questionário
              </button>
            </div>
          </div>
        </div>

        {/* Arquivos e Fotos */}
        {(organizacao.arquivos?.length > 0 || organizacao.fotos?.length > 0) && (
          <div className="anexos-section">
            <h3>📎 Arquivos e Fotos</h3>
            
            <div className="anexos-grid">
              {organizacao.arquivos?.length > 0 && (
                <div className="anexos-card">
                  <h4>📁 Arquivos</h4>
                  <div className="arquivos-list">
                    {organizacao.arquivos.map((arquivo: any) => (
                      <div key={arquivo.id} className="arquivo-item">
                        <span className="arquivo-nome">{arquivo.arquivo || `Arquivo ${arquivo.id}`}</span>
                        <span className="arquivo-obs">{arquivo.obs || ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {organizacao.fotos?.length > 0 && (
                <div className="anexos-card">
                  <h4>📷 Fotos</h4>
                  <div className="fotos-grid">
                    {organizacao.fotos.map((foto: any) => (
                      <div key={foto.id} className="foto-item">
                        <div className="foto-placeholder">
                          📷
                        </div>
                        <span className="foto-obs">{foto.obs || `Foto ${foto.id}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Produções */}
        {organizacao.producoes?.length > 0 && (
          <div className="producoes-section">
            <h3>🌾 Produções</h3>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cultura</th>
                    <th>Produção Anual</th>
                    <th>Produção Mensal</th>
                  </tr>
                </thead>
                <tbody>
                  {organizacao.producoes.map((producao: any) => (
                    <tr key={producao.id}>
                      <td>{producao.cultura || '-'}</td>
                      <td>{producao.anual ? `${producao.anual} kg/ano` : '-'}</td>
                      <td>{producao.mensal ? `${producao.mensal} kg/mês` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Abrangência */}
        {(organizacao.abrangenciaPj?.length > 0 || organizacao.abrangenciaSocio?.length > 0) && (
          <div className="abrangencia-section">
            <h3>🌐 Abrangência</h3>
            
            <div className="abrangencia-grid">
              {organizacao.abrangenciaPj?.length > 0 && (
                <div className="abrangencia-card">
                  <h4>🏢 Pessoas Jurídicas</h4>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Razão Social</th>
                          <th>CNPJ</th>
                          <th>Sócios CAF</th>
                          <th>Total Sócios</th>
                        </tr>
                      </thead>
                      <tbody>
                        {organizacao.abrangenciaPj.map((pj: any) => (
                          <tr key={pj.id}>
                            <td>{pj.razaoSocial || '-'}</td>
                            <td>{pj.cnpjPj || '-'}</td>
                            <td>{pj.numSociosCaf || '0'}</td>
                            <td>{pj.numSociosTotal || '0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {organizacao.abrangenciaSocio?.length > 0 && (
                <div className="abrangencia-card">
                  <h4>👥 Abrangência de Sócios</h4>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Número de Sócios</th>
                          <th>Estado</th>
                          <th>Município</th>
                        </tr>
                      </thead>
                      <tbody>
                        {organizacao.abrangenciaSocio.map((socio: any) => (
                          <tr key={socio.id}>
                            <td>{socio.numSocios || '0'}</td>
                            <td>{socio.estado || '-'}</td>
                            <td>{socio.municipio || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        {organizacao.obs && (
          <div className="observacoes-section">
            <h3>📝 Observações</h3>
            <div className="observacoes-card">
              <p>{organizacao.obs}</p>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="detalhes-actions">
          <button 
            onClick={() => onNavigate('edicao', organizacaoId)}
            className="btn btn-primary"
          >
            ✏️ Editar Organização
          </button>
          
          <button 
            onClick={() => window.print()}
            className="btn btn-secondary"
          >
            🖨️ Imprimir
          </button>
          
          <button 
            onClick={handleExcluir}
            className="btn btn-danger"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalhesOrganizacao;