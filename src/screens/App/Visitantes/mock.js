// Dados simulados baseados na nova estrutura da API
export const initialVisitors = [
  {
    vst_id: 1,
    vst_nome: "João Silva",
    vst_documento: "12.345.678-9",
    ap_id: 101,
    vst_data_visita: new Date(Date.now() + 86400000 * 1), // Amanhã
    vst_data_saida: null,
    vst_tipo: "Prestador",
    vst_empresa: "Silva Elétrica Ltda",
    vst_observacao: "Manutenção do quadro elétrico - Apto 101. Placa: ABC-1234"
  },
  {
    vst_id: 2,
    vst_nome: "Maria Oliveira",
    vst_documento: "98.765.432-1",
    ap_id: 101, // Mesmo apartamento para facilitar teste
    vst_data_visita: new Date(Date.now() + 86400000 * 2), // Depois de amanhã
    vst_data_saida: null,
    vst_tipo: "Visitante",
    vst_empresa: "",
    vst_observacao: "Visita familiar - Aniversário da avó"
  },
  {
    vst_id: 3,
    vst_nome: "Carlos Souza",
    vst_documento: "55.666.777-8",
    ap_id: 101, // Mesmo apartamento para facilitar teste
    vst_data_visita: new Date(Date.now() - 86400000 * 1), // Ontem
    vst_data_saida: new Date(Date.now() - 86400000 * 1 + 3600000 * 2), // Saiu 2h depois
    vst_tipo: "Hospede",
    vst_empresa: "",
    vst_observacao: "Hospedagem por 3 dias - Primo da família"
  },
  {
    vst_id: 4,
    vst_nome: "Ana Pereira",
    vst_documento: "44.555.666-7",
    ap_id: 101, // Mesmo apartamento para facilitar teste
    vst_data_visita: new Date(Date.now() - 86400000 * 3), // 3 dias atrás
    vst_data_saida: new Date(Date.now() - 86400000 * 3 + 3600000 * 1), // Saiu 1h depois
    vst_tipo: "Prestador",
    vst_empresa: "Correios",
    vst_observacao: "Entrega de encomenda registrada"
  },
  {
    vst_id: 5,
    vst_nome: "Roberto Lima",
    vst_documento: "33.444.555-6",
    ap_id: 101, // Mesmo apartamento para facilitar teste
    vst_data_visita: new Date(Date.now() - 3600000 * 2), // 2 horas atrás
    vst_data_saida: null,
    vst_tipo: "Prestador",
    vst_empresa: "HydroFix Encanamentos",
    vst_observacao: "Reparo urgente - vazamento no banheiro. Placa: XYZ-9876"
  }
];

// Mock de usuário para facilitar os testes
export const mockUser = {
  id: 1,
  ap_id: 101,
  user_tipo: 'morador',
  nome: 'Teste Morador',
  email: 'teste@exemplo.com'
};
