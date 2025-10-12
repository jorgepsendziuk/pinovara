import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import './CaracteristicasAssociados.css';

interface Organizacao {
  id: number;
  caracteristicas_n_total_socios: number | null;
  caracteristicas_n_total_socios_caf: number | null;
  caracteristicas_n_distintos_caf: number | null;
  caracteristicas_n_ativos_total: number | null;
  caracteristicas_n_ativos_caf: number | null;
  caracteristicas_n_naosocio_op_total: number | null;
  caracteristicas_n_naosocio_op_caf: number | null;
  caracteristicas_n_ingressaram_total_12_meses: number | null;
  caracteristicas_n_ingressaram_caf_12_meses: number | null;
  caracteristicas_n_socios_paa: number | null;
  caracteristicas_n_naosocios_paa: number | null;
  caracteristicas_n_socios_pnae: number | null;
  caracteristicas_n_naosocios_pnae: number | null;
  caracteristicas_ta_af_homem: number | null;
  caracteristicas_ta_af_mulher: number | null;
  caracteristicas_ta_a_homem: number | null;
  caracteristicas_ta_a_mulher: number | null;
  caracteristicas_ta_p_homem: number | null;
  caracteristicas_ta_p_mulher: number | null;
  caracteristicas_ta_i_homem: number | null;
  caracteristicas_ta_i_mulher: number | null;
  caracteristicas_ta_q_homem: number | null;
  caracteristicas_ta_q_mulher: number | null;
  caracteristicas_ta_e_homem: number | null;
  caracteristicas_ta_e_mulher: number | null;
  caracteristicas_ta_o_homem: number | null;
  caracteristicas_ta_o_mulher: number | null;
  caracteristicas_ta_caf_organico: number | null;
  caracteristicas_ta_caf_agroecologico: number | null;
  caracteristicas_ta_caf_transicao: number | null;
  caracteristicas_ta_caf_convencional: number | null;
  [key: string]: any;
}

interface CaracteristicasAssociadosProps {
  organizacao: Organizacao;
  onUpdate: (campo: string, valor: any) => Promise<void>;
}

interface Totalizadores {
  totalAF: number;
  totalAssentado: number;
  totalPescador: number;
  totalIndigena: number;
  totalQuilombola: number;
  totalExtrativista: number;
  totalOutro: number;
  totalPorCategorias: number;
  totalHomens: number;
  totalMulheres: number;
  totalPorProducao: number;
}

interface StatusConsistencia {
  categorias: 'success' | 'warning' | 'error';
  producao: 'success' | 'warning' | 'error';
}

const CaracteristicasAssociados: React.FC<CaracteristicasAssociadosProps> = ({
  organizacao,
  onUpdate,
}) => {
  const [totalizadores, setTotalizadores] = useState<Totalizadores>({
    totalAF: 0,
    totalAssentado: 0,
    totalPescador: 0,
    totalIndigena: 0,
    totalQuilombola: 0,
    totalExtrativista: 0,
    totalOutro: 0,
    totalPorCategorias: 0,
    totalHomens: 0,
    totalMulheres: 0,
    totalPorProducao: 0,
  });
  const [statusConsistencia, setStatusConsistencia] = useState<StatusConsistencia>({
    categorias: 'success',
    producao: 'success',
  });

  useEffect(() => {
    calcularTotalizadores();
  }, [organizacao]);

  const calcularTotalizadores = () => {
    const totalAF = (organizacao.caracteristicas_ta_af_homem || 0) + (organizacao.caracteristicas_ta_af_mulher || 0);
    const totalAssentado = (organizacao.caracteristicas_ta_a_homem || 0) + (organizacao.caracteristicas_ta_a_mulher || 0);
    const totalPescador = (organizacao.caracteristicas_ta_p_homem || 0) + (organizacao.caracteristicas_ta_p_mulher || 0);
    const totalIndigena = (organizacao.caracteristicas_ta_i_homem || 0) + (organizacao.caracteristicas_ta_i_mulher || 0);
    const totalQuilombola = (organizacao.caracteristicas_ta_q_homem || 0) + (organizacao.caracteristicas_ta_q_mulher || 0);
    const totalExtrativista = (organizacao.caracteristicas_ta_e_homem || 0) + (organizacao.caracteristicas_ta_e_mulher || 0);
    const totalOutro = (organizacao.caracteristicas_ta_o_homem || 0) + (organizacao.caracteristicas_ta_o_mulher || 0);

    const totalHomens = 
      (organizacao.caracteristicas_ta_af_homem || 0) +
      (organizacao.caracteristicas_ta_a_homem || 0) +
      (organizacao.caracteristicas_ta_p_homem || 0) +
      (organizacao.caracteristicas_ta_i_homem || 0) +
      (organizacao.caracteristicas_ta_q_homem || 0) +
      (organizacao.caracteristicas_ta_e_homem || 0) +
      (organizacao.caracteristicas_ta_o_homem || 0);

    const totalMulheres = 
      (organizacao.caracteristicas_ta_af_mulher || 0) +
      (organizacao.caracteristicas_ta_a_mulher || 0) +
      (organizacao.caracteristicas_ta_p_mulher || 0) +
      (organizacao.caracteristicas_ta_i_mulher || 0) +
      (organizacao.caracteristicas_ta_q_mulher || 0) +
      (organizacao.caracteristicas_ta_e_mulher || 0) +
      (organizacao.caracteristicas_ta_o_mulher || 0);

    const totalPorCategorias = totalHomens + totalMulheres;

    const totalPorProducao = 
      (organizacao.caracteristicas_ta_caf_organico || 0) +
      (organizacao.caracteristicas_ta_caf_agroecologico || 0) +
      (organizacao.caracteristicas_ta_caf_transicao || 0) +
      (organizacao.caracteristicas_ta_caf_convencional || 0);

    setTotalizadores({
      totalAF,
      totalAssentado,
      totalPescador,
      totalIndigena,
      totalQuilombola,
      totalExtrativista,
      totalOutro,
      totalPorCategorias,
      totalHomens,
      totalMulheres,
      totalPorProducao,
    });

    const nTotalSocios = organizacao.caracteristicas_n_total_socios || 0;
    const nTotalSociosCaf = organizacao.caracteristicas_n_total_socios_caf || 0;

    let statusCategorias: 'success' | 'warning' | 'error' = 'success';
    if (totalPorCategorias > nTotalSocios) {
      statusCategorias = 'error';
    } else if (totalPorCategorias < nTotalSocios && totalPorCategorias > 0) {
      statusCategorias = 'warning';
    }

    let statusProducao: 'success' | 'warning' | 'error' = 'success';
    if (totalPorProducao > nTotalSociosCaf) {
      statusProducao = 'error';
    } else if (totalPorProducao < nTotalSociosCaf && totalPorProducao > 0) {
      statusProducao = 'warning';
    }

    setStatusConsistencia({ categorias: statusCategorias, producao: statusProducao });
  };

  const handleChange = async (campo: string, valor: string) => {
    const valorNumerico = valor === '' ? null : parseInt(valor);
    return onUpdate(campo, valorNumerico);
  };

  const renderStatusIcon = (status: 'success' | 'warning' | 'error') => {
    if (status === 'success') return <CheckCircle size={20} className="icon-success" />;
    if (status === 'warning') return <AlertTriangle size={20} className="icon-warning" />;
    return <AlertCircle size={20} className="icon-error" />;
  };

  const calcularPercentual = (valor: number | null, total: number | null) => {
    if (!total || total === 0) return '0';
    return ((valor || 0) / total * 100).toFixed(1);
  };

  return (
    <div className="caracteristicas-container">
      <div className="page-header">
        <h2>Características dos Associados</h2>
        {organizacao.caracteristicas_n_total_socios && (
          <div className="badge-info">
            {organizacao.caracteristicas_n_total_socios} sócios cadastrados
          </div>
        )}
      </div>
      
      <div className="content-section">
          {/* Totais Gerais */}
          <div className="subsection">
            <h4>Totais Gerais</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>
                  Total de Sócios <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_total_socios || ''}
                  onChange={(e) => handleChange('caracteristicas_n_total_socios', e.target.value)}
                  placeholder="Total de sócios"
                />
              </div>

              <div className="form-field">
                <label>
                  Total de Sócios com CAF <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_total_socios_caf || ''}
                  onChange={(e) => handleChange('caracteristicas_n_total_socios_caf', e.target.value)}
                  placeholder="Sócios com CAF"
                />
                {organizacao.caracteristicas_n_total_socios && (
                  <small className="help-text">
                    {calcularPercentual(organizacao.caracteristicas_n_total_socios_caf, organizacao.caracteristicas_n_total_socios)}% do total
                  </small>
                )}
              </div>

              <div className="form-field">
                <label>
                  CAFs Distintos <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_distintos_caf || ''}
                  onChange={(e) => handleChange('caracteristicas_n_distintos_caf', e.target.value)}
                  placeholder="Famílias distintas"
                />
                <small className="help-text">
                  Número de famílias distintas (considera dupla titularidade)
                </small>
              </div>
            </div>
          </div>

          {/* Sócios Ativos */}
          <div className="subsection">
            <h4>Sócios Ativos</h4>
            <p className="subsection-description">
              Sócios que realizaram operação comercial com o empreendimento nos últimos 12 meses
            </p>
            <div className="form-grid">
              <div className="form-field">
                <label>Total de Ativos</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_ativos_total || ''}
                  onChange={(e) => handleChange('caracteristicas_n_ativos_total', e.target.value)}
                />
                {organizacao.caracteristicas_n_total_socios && (
                  <small className="help-text">
                    {calcularPercentual(organizacao.caracteristicas_n_ativos_total, organizacao.caracteristicas_n_total_socios)}% dos sócios
                  </small>
                )}
              </div>

              <div className="form-field">
                <label>Ativos com CAF</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_ativos_caf || ''}
                  onChange={(e) => handleChange('caracteristicas_n_ativos_caf', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Não-sócios Operando (Total)</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_naosocio_op_total || ''}
                  onChange={(e) => handleChange('caracteristicas_n_naosocio_op_total', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Não-sócios Operando (com CAF)</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_naosocio_op_caf || ''}
                  onChange={(e) => handleChange('caracteristicas_n_naosocio_op_caf', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Novos Sócios */}
          <div className="subsection">
            <h4>Novos Sócios (últimos 12 meses)</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>Total de Novos Sócios</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_ingressaram_total_12_meses || ''}
                  onChange={(e) => handleChange('caracteristicas_n_ingressaram_total_12_meses', e.target.value)}
                />
                {organizacao.caracteristicas_n_total_socios && (
                  <small className="help-text">
                    {calcularPercentual(organizacao.caracteristicas_n_ingressaram_total_12_meses, organizacao.caracteristicas_n_total_socios)}% ampliação
                  </small>
                )}
              </div>

              <div className="form-field">
                <label>Novos com CAF</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_ingressaram_caf_12_meses || ''}
                  onChange={(e) => handleChange('caracteristicas_n_ingressaram_caf_12_meses', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Políticas Públicas */}
          <div className="subsection">
            <h4>Acesso a Políticas Públicas</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>Sócios no PAA</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_socios_paa || ''}
                  onChange={(e) => handleChange('caracteristicas_n_socios_paa', e.target.value)}
                />
                {organizacao.caracteristicas_n_total_socios_caf && (
                  <small className="help-text">
                    {calcularPercentual(organizacao.caracteristicas_n_socios_paa, organizacao.caracteristicas_n_total_socios_caf)}% dos sócios com CAF
                  </small>
                )}
              </div>

              <div className="form-field">
                <label>Não-sócios no PAA</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_naosocios_paa || ''}
                  onChange={(e) => handleChange('caracteristicas_n_naosocios_paa', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Sócios no PNAE</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_socios_pnae || ''}
                  onChange={(e) => handleChange('caracteristicas_n_socios_pnae', e.target.value)}
                />
                {organizacao.caracteristicas_n_total_socios_caf && (
                  <small className="help-text">
                    {calcularPercentual(organizacao.caracteristicas_n_socios_pnae, organizacao.caracteristicas_n_total_socios_caf)}% dos sócios com CAF
                  </small>
                )}
              </div>

              <div className="form-field">
                <label>Não-sócios no PNAE</label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_n_naosocios_pnae || ''}
                  onChange={(e) => handleChange('caracteristicas_n_naosocios_pnae', e.target.value)}
                />
              </div>
            </div>
            <div className="info-box">
              <AlertCircle size={18} />
              <span>PAA = Programa de Aquisição de Alimentos | PNAE = Programa Nacional de Alimentação Escolar</span>
            </div>
          </div>

          {/* Por Categoria e Gênero */}
          <div className="subsection">
            <h4>
              Por Categoria e Gênero
              <span className="status-badge" data-status={statusConsistencia.categorias}>
                {renderStatusIcon(statusConsistencia.categorias)}
                {totalizadores.totalPorCategorias} / {organizacao.caracteristicas_n_total_socios || 0}
              </span>
            </h4>

            {statusConsistencia.categorias === 'error' && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                A soma das categorias ({totalizadores.totalPorCategorias}) excede o total de sócios ({organizacao.caracteristicas_n_total_socios})
              </div>
            )}

            {statusConsistencia.categorias === 'warning' && (
              <div className="alert alert-warning">
                <AlertTriangle size={18} />
                A soma das categorias ({totalizadores.totalPorCategorias}) é menor que o total de sócios ({organizacao.caracteristicas_n_total_socios})
              </div>
            )}

            <div className="categorias-table">
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Homens</th>
                    <th>Mulheres</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Agricultura Familiar</strong></td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_af_homem || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_af_homem', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_af_mulher || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_af_mulher', e.target.value)}
                      />
                    </td>
                    <td className="total-cell">{totalizadores.totalAF}</td>
                  </tr>

                  <tr>
                    <td><strong>Assentado</strong></td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_a_homem || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_a_homem', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_a_mulher || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_a_mulher', e.target.value)}
                      />
                    </td>
                    <td className="total-cell">{totalizadores.totalAssentado}</td>
                  </tr>

                  <tr>
                    <td><strong>Pescador</strong></td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_p_homem || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_p_homem', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_p_mulher || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_p_mulher', e.target.value)}
                      />
                    </td>
                    <td className="total-cell">{totalizadores.totalPescador}</td>
                  </tr>

                  <tr>
                    <td><strong>Indígena</strong></td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_i_homem || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_i_homem', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_i_mulher || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_i_mulher', e.target.value)}
                      />
                    </td>
                    <td className="total-cell">{totalizadores.totalIndigena}</td>
                  </tr>

                  <tr>
                    <td><strong>Quilombola</strong></td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_q_homem || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_q_homem', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_q_mulher || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_q_mulher', e.target.value)}
                      />
                    </td>
                    <td className="total-cell">{totalizadores.totalQuilombola}</td>
                  </tr>

                  <tr>
                    <td><strong>Extrativista</strong></td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_e_homem || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_e_homem', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_e_mulher || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_e_mulher', e.target.value)}
                      />
                    </td>
                    <td className="total-cell">{totalizadores.totalExtrativista}</td>
                  </tr>

                  <tr>
                    <td><strong>Outro</strong></td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_o_homem || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_o_homem', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={organizacao.caracteristicas_ta_o_mulher || ''}
                        onChange={(e) => handleChange('caracteristicas_ta_o_mulher', e.target.value)}
                      />
                    </td>
                    <td className="total-cell">{totalizadores.totalOutro}</td>
                  </tr>

                  <tr className="total-row">
                    <td><strong>TOTAL</strong></td>
                    <td className="total-cell"><strong>{totalizadores.totalHomens}</strong></td>
                    <td className="total-cell"><strong>{totalizadores.totalMulheres}</strong></td>
                    <td className="total-cell"><strong>{totalizadores.totalPorCategorias}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Por Tipo de Produção */}
          <div className="subsection">
            <h4>
              Por Tipo de Produção (Sócios com CAF)
              <span className="status-badge" data-status={statusConsistencia.producao}>
                {renderStatusIcon(statusConsistencia.producao)}
                {totalizadores.totalPorProducao} / {organizacao.caracteristicas_n_total_socios_caf || 0}
              </span>
            </h4>

            {statusConsistencia.producao === 'error' && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                A soma dos tipos de produção ({totalizadores.totalPorProducao}) excede o total de sócios com CAF ({organizacao.caracteristicas_n_total_socios_caf})
              </div>
            )}

            {statusConsistencia.producao === 'warning' && (
              <div className="alert alert-warning">
                <AlertTriangle size={18} />
                A soma dos tipos de produção ({totalizadores.totalPorProducao}) é menor que o total de sócios com CAF ({organizacao.caracteristicas_n_total_socios_caf})
              </div>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label>
                  <span className="producao-badge producao-organico">●</span>
                  Orgânico
                </label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_ta_caf_organico || ''}
                  onChange={(e) => handleChange('caracteristicas_ta_caf_organico', e.target.value)}
                />
                <small className="help-text">Certificado + em conversão</small>
              </div>

              <div className="form-field">
                <label>
                  <span className="producao-badge producao-agroecologico">●</span>
                  Agroecológico
                </label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_ta_caf_agroecologico || ''}
                  onChange={(e) => handleChange('caracteristicas_ta_caf_agroecologico', e.target.value)}
                />
                <small className="help-text">Sem certificação</small>
              </div>

              <div className="form-field">
                <label>
                  <span className="producao-badge producao-transicao">●</span>
                  Em Transição
                </label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_ta_caf_transicao || ''}
                  onChange={(e) => handleChange('caracteristicas_ta_caf_transicao', e.target.value)}
                />
                <small className="help-text">Transição para agroecologia</small>
              </div>

              <div className="form-field">
                <label>
                  <span className="producao-badge producao-convencional">●</span>
                  Convencional
                </label>
                <input
                  type="number"
                  min="0"
                  value={organizacao.caracteristicas_ta_caf_convencional || ''}
                  onChange={(e) => handleChange('caracteristicas_ta_caf_convencional', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CaracteristicasAssociados;
