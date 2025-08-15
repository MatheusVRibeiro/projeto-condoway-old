import { Calendar, Box, AlertTriangle, CheckCircle } from 'lucide-react-native';

export const morador = {
  nome: "Ana Clara",
  condominio: "CondoWay Residence",
  notificacoesNaoLidas: 3,
  avatarUrl: "https://i.pravatar.cc/150?u=ana",
};

// ATUALIZAÇÃO: Adicionamos mais avisos aqui
export const avisosImportantes = [
  {
    id: 1,
    titulo: "Manutenção programada do elevador",
    texto: "O elevador de serviço estará em manutenção na próxima sexta-feira, das 09:00 às 12:00.",
  },
  {
    id: 2,
    titulo: "Interrupção no Fornecimento de Água",
    texto: "Haverá uma interrupção no fornecimento de água amanhã para reparos na caixa d'água.",
  },
  {
    id: 3,
    titulo: "Dedetização nas Garagens",
    texto: "Favor não deixar veículos na garagem G1 no próximo sábado pela manhã.",
  }
];

export const encomendas = { quantidade: 2 };

export const ultimasAtualizacoes = {
  "Hoje": [
    { id: 1, tipo: 'reservations', icone: Calendar, texto: "Sua reserva do Salão de Festas foi confirmada.", hora: "14:30" },
    { id: 2, tipo: 'packages', icone: Box, texto: "Nova encomenda registrada na portaria.", hora: "11:15" },
  ],
  "Ontem": [
    { id: 3, tipo: 'notifications', icone: AlertTriangle, texto: "Aviso geral: Reunião do conselho amanhã.", hora: "18:00" },
    { id: 4, tipo: 'profile', icone: CheckCircle, texto: "Boleto do condomínio foi pago com sucesso.", hora: "09:10" },
  ]
};
