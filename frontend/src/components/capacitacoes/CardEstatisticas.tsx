import { BarChart3, Users, TrendingUp, FileText } from 'lucide-react';

interface CardEstatisticasProps {
  totalAvaliacoes: number;
  totalInscritos: number;
  taxaResposta: number;
  mediaGeral?: number;
}

export default function CardEstatisticas({
  totalAvaliacoes,
  totalInscritos,
  taxaResposta,
  mediaGeral
}: CardEstatisticasProps) {
  const cards = [
    {
      title: 'Total de Avaliações',
      value: totalAvaliacoes,
      icon: FileText,
      color: '#056839',
      bgColor: '#d4edda'
    },
    {
      title: 'Total de Inscritos',
      value: totalInscritos,
      icon: Users,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Taxa de Resposta',
      value: `${taxaResposta.toFixed(1)}%`,
      icon: TrendingUp,
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    ...(mediaGeral !== undefined ? [{
      title: 'Média Geral',
      value: mediaGeral.toFixed(2),
      icon: BarChart3,
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    }] : [])
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '16px',
      marginBottom: '24px'
    }}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: `1px solid ${card.bgColor}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ 
                backgroundColor: card.bgColor, 
                borderRadius: '8px', 
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} color={card.color} />
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#3b2313',
                marginBottom: '4px'
              }}>
                {card.value}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#64748b' 
              }}>
                {card.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
