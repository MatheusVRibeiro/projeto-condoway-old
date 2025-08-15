import { Droplet, Volume2, Lightbulb, Trash2, HardHat, MessageSquareWarning } from 'lucide-react-native';

export const categories = [
  { id: 'vazamento', title: 'Vazamento', icon: Droplet },
  { id: 'barulho', title: 'Barulho', icon: Volume2 },
  { id: 'iluminacao', title: 'Iluminação', icon: Lightbulb },
  { id: 'limpeza', title: 'Limpeza e Higiene', icon: Trash2 },
  { id: 'infraestrutura', title: 'Infraestrutura', icon: HardHat },
  { id: 'outro', title: 'Outro Problema', icon: MessageSquareWarning },
];

export const initialIssues = [
  {
    id: 1,
    protocol: `OCO-846351`,
    category: 'Vazamento',
    title: 'Vazamento',
    description: 'Vazamento constante na torneira da área da churrasqueira. Já tentei fechar bem mas continua pingando e desperdiçando muita água.',
    location: 'Área da Churrasqueira',
    date: new Date(Date.now() - 86400000).toLocaleString('pt-BR'), // Ontem
    status: "Em Análise",
    priority: "media",
    comments: [
        { author: "Morador", text: "Vazamento constante na torneira da área da churrasqueira.", date: new Date(Date.now() - 86400000).toLocaleString('pt-BR') },
        { author: "Síndico", text: "Recebemos sua ocorrência. O zelador irá verificar amanhã pela manhã.", date: new Date().toLocaleString('pt-BR') }
    ],
  }
];
