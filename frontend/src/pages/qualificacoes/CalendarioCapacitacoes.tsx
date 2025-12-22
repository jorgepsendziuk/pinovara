import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { Capacitacao } from '../../types/capacitacao';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

interface CalendarioCapacitacoesProps {
  onNavigate: (view: string, id?: number) => void;
}

function CalendarioCapacitacoes({ onNavigate }: CalendarioCapacitacoesProps) {
  const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    carregarCapacitacoes();
  }, []);

  const carregarCapacitacoes = async () => {
    try {
      setLoading(true);
      const response = await capacitacaoAPI.list({ limit: 1000 });
      setCapacitacoes(response.capacitacoes);
    } catch (error) {
      console.error('Erro ao carregar capacitações:', error);
      alert('Erro ao carregar capacitações');
    } finally {
      setLoading(false);
    }
  };

  const eventos = capacitacoes
    .filter(c => c.data_inicio)
    .map(c => ({
      title: c.titulo || c.qualificacao?.titulo || 'Capacitação',
      start: new Date(c.data_inicio!),
      end: c.data_fim ? new Date(c.data_fim) : new Date(c.data_inicio!),
      resource: c,
      allDay: false
    }));

  const handleSelectEvent = (event: any) => {
    if (event.resource && event.resource.id) {
      onNavigate('edicao-capacitacao', event.resource.id);
    }
  };

  const eventStyleGetter = (event: any) => {
    const status = event.resource?.status;
    let backgroundColor = '#3174ad';
    
    switch (status) {
      case 'planejada':
        backgroundColor = '#3174ad';
        break;
      case 'em_andamento':
        backgroundColor = '#056839';
        break;
      case 'concluida':
        backgroundColor = '#3b2313';
        break;
      case 'cancelada':
        backgroundColor = '#999';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return <div>Carregando calendário...</div>;
  }

  return (
    <div className="qualificacoes-module" style={{ height: '600px', padding: '20px' }}>
      <div className="qualificacoes-header" style={{ marginBottom: '20px' }}>
        <h1>Calendário de Capacitações</h1>
        <button onClick={() => onNavigate('capacitacoes')}>Voltar para Lista</button>
      </div>

      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        view={currentView}
        onView={setCurrentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={{
          next: 'Próximo',
          previous: 'Anterior',
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          agenda: 'Agenda',
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'Não há capacitações neste período'
        }}
      />
    </div>
  );
}

export default CalendarioCapacitacoes;

