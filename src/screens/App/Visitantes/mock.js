// Dados simulados baseados na sua tabela 'Visitantes'
export const initialVisitors = [
  {
    vst_id: 1,
    vst_nome: "João Silva (Eletricista)",
    vst_documento: "12.345.678-9",
    vst_data_visita: new Date(Date.now() + 86400000 * 1), // Amanhã
    vst_data_saida: null,
  },
  {
    vst_id: 2,
    vst_nome: "Maria Oliveira",
    vst_documento: "98.765.432-1",
    vst_data_visita: new Date(Date.now() + 86400000 * 2), // Depois de amanhã
    vst_data_saida: null,
  },
  {
    vst_id: 3,
    vst_nome: "Carlos Souza",
    vst_documento: "55.666.777-8",
    vst_data_visita: new Date(Date.now() - 86400000 * 1), // Ontem
    vst_data_saida: new Date(Date.now() - 86400000 * 1 + 3600000 * 2), // Saiu 2h depois
  },
  {
    vst_id: 4,
    vst_nome: "Ana Pereira (Entrega)",
    vst_documento: "44.555.666-7",
    vst_data_visita: new Date(Date.now() - 86400000 * 3), // 3 dias atrás
    vst_data_saida: new Date(Date.now() - 86400000 * 3 + 3600000 * 1), // Saiu 1h depois
  },
];
