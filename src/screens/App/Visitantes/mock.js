import { subDays, addDays } from 'date-fns';

const today = new Date();

export const visitorsData = [
  // Hoje
  { 
    id: '1', 
    name: 'Carlos Silva', 
    date: today.toISOString(),
    status: 'scheduled', // 'scheduled', 'entered', 'exited'
    doc: '123.456.789-00',
    validity: 'Apenas hoje',
  },
  // Ontem
  { 
    id: '2', 
    name: 'Mariana Costa', 
    date: subDays(today, 1).toISOString(),
    status: 'exited',
    entryTime: '09:15',
    exitTime: '11:30',
    doc: '987.654.321-00',
    validity: '25/09/2025',
  },
  // 3 dias atrás (ainda nesta semana)
  { 
    id: '3', 
    name: 'Ana Beatriz', 
    date: subDays(today, 3).toISOString(),
    status: 'exited',
    entryTime: '14:00',
    exitTime: '18:45',
    doc: '111.222.333-44',
    validity: '23/09/2025',
  },
  // 10 dias atrás (mês atual)
  { 
    id: '4', 
    name: 'Ricardo Gomes', 
    date: subDays(today, 10).toISOString(),
    status: 'exited',
    entryTime: '10:00',
    exitTime: '12:00',
    doc: '444.555.666-77',
    validity: '16/09/2025',
  },
  // 40 dias atrás (mês anterior)
  { 
    id: '5', 
    name: 'Fernanda Lima', 
    date: subDays(today, 40).toISOString(),
    status: 'exited',
    entryTime: '20:00',
    exitTime: '22:30',
    doc: '777.888.999-00',
    validity: '17/08/2025',
  },
  // Agendado para amanhã
  { 
    id: '6', 
    name: 'João Pedro', 
    date: addDays(today, 1).toISOString(),
    status: 'scheduled',
    doc: '222.333.444-55',
    validity: 'Fim de semana',
  },
];
