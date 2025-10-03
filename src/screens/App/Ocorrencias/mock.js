import { Droplet, Volume2, Lightbulb, Trash2, HardHat, MessageSquareWarning } from 'lucide-react-native';

export const categories = [
  { 
    id: 'vazamento', 
    title: 'Vazamento', 
    icon: Droplet,
    color: '#3b82f6', // Azul
    lightColor: '#dbeafe',
    gradient: ['#3b82f6', '#2563eb']
  },
  { 
    id: 'barulho', 
    title: 'Barulho', 
    icon: Volume2,
    color: '#f59e0b', // Laranja
    lightColor: '#fef3c7',
    gradient: ['#f59e0b', '#d97706']
  },
  { 
    id: 'iluminacao', 
    title: 'Iluminação', 
    icon: Lightbulb,
    color: '#eab308', // Amarelo
    lightColor: '#fef9c3',
    gradient: ['#eab308', '#ca8a04']
  },
  { 
    id: 'limpeza', 
    title: 'Limpeza e Higiene', 
    icon: Trash2,
    color: '#10b981', // Verde
    lightColor: '#d1fae5',
    gradient: ['#10b981', '#059669']
  },
  { 
    id: 'infraestrutura', 
    title: 'Infraestrutura', 
    icon: HardHat,
    color: '#8b5cf6', // Roxo
    lightColor: '#ede9fe',
    gradient: ['#8b5cf6', '#7c3aed']
  },
  { 
    id: 'outro', 
    title: 'Outro Problema', 
    icon: MessageSquareWarning,
    color: '#6b7280', // Cinza
    lightColor: '#f3f4f6',
    gradient: ['#6b7280', '#4b5563']
  },
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
