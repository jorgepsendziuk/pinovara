import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AvaliacaoEstatisticas, TipoPergunta } from '../../types/avaliacao';

interface GraficoDistribuicaoProps {
  estatistica: AvaliacaoEstatisticas;
}

const CORES = ['#056839', '#1976d2', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#6366f1'];

function formatarOpcaoLabel(opcao: string, tipo: TipoPergunta): string {
  if (tipo === 'sim_nao_talvez') {
    const map: Record<string, string> = {
      'sim': 'Sim',
      'nao': 'Não',
      'talvez': 'Talvez'
    };
    return map[opcao.toLowerCase()] || opcao;
  }
  if (tipo === 'sim_nao_parcialmente') {
    const map: Record<string, string> = {
      'sim': 'Sim',
      'nao': 'Não',
      'parcialmente': 'Parcialmente'
    };
    return map[opcao.toLowerCase()] || opcao;
  }
  return opcao;
}

export default function GraficoDistribuicao({ estatistica }: GraficoDistribuicaoProps) {
  const { pergunta, distribuicao, media, total_respostas } = estatistica;

  // Preparar dados para gráfico de barras
  const dadosBarra = distribuicao 
    ? Object.entries(distribuicao)
        .map(([opcao, quantidade]) => ({
          opcao: formatarOpcaoLabel(opcao, pergunta.tipo),
          quantidade,
          percentual: total_respostas > 0 ? ((quantidade / total_respostas) * 100).toFixed(1) : '0'
        }))
        .sort((a, b) => {
          // Ordenar por valor numérico se for escala
          if (pergunta.tipo === 'escala_5' || pergunta.tipo === 'escala_3') {
            const numA = parseInt(a.opcao) || 0;
            const numB = parseInt(b.opcao) || 0;
            return numA - numB;
          }
          return b.quantidade - a.quantidade;
        })
    : [];

  // Preparar dados para gráfico de pizza
  const dadosPizza = dadosBarra.map((item, index) => ({
    name: item.opcao,
    value: item.quantidade,
    fill: CORES[index % CORES.length]
  }));

  const renderGrafico = () => {
    if (!distribuicao || Object.keys(distribuicao).length === 0) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '8px'
        }}>
          <p>Nenhuma resposta disponível para esta pergunta</p>
        </div>
      );
    }

    // Escala numérica: gráfico de barras
    if (pergunta.tipo === 'escala_5' || pergunta.tipo === 'escala_3') {
      return (
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosBarra}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="opcao" 
                label={{ value: 'Valor', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value} (${props.payload.percentual}%)`,
                  'Respostas'
                ]}
              />
              <Legend />
              <Bar dataKey="quantidade" fill="#056839" name="Respostas" />
            </BarChart>
          </ResponsiveContainer>
          {media !== undefined && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <strong style={{ color: '#3b2313' }}>Média: {media.toFixed(2)}</strong>
            </div>
          )}
        </div>
      );
    }

    // Múltipla escolha: gráfico de pizza
    if (pergunta.tipo === 'sim_nao_talvez' || pergunta.tipo === 'sim_nao_parcialmente') {
      return (
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosPizza}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Texto livre: lista de respostas
    if (pergunta.tipo === 'texto_livre') {
      return (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
            {total_respostas} resposta(s) de texto livre
          </p>
          <p style={{ color: '#3b2313', fontSize: '12px', fontStyle: 'italic' }}>
            Respostas individuais disponíveis na visualização detalhada de cada avaliação
          </p>
        </div>
      );
    }

    // Fallback: gráfico de barras genérico
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dadosBarra}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="opcao" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantidade" fill="#056839" name="Respostas" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ 
          color: '#3b2313', 
          fontSize: '16px', 
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          {pergunta.texto}
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          fontSize: '12px', 
          color: '#64748b' 
        }}>
          <span>Tipo: {pergunta.tipo}</span>
          <span>•</span>
          <span>Total de respostas: {total_respostas}</span>
        </div>
      </div>
      {renderGrafico()}
    </div>
  );
}
