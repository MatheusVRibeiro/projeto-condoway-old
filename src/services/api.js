import axios from 'axios';

// 1. Cria uma instância do axios com a baseURL pré-configurada
const api = axios.create({
  baseURL: 'http://192.168.0.174:3333',
  // baseURL: 'http://10.67.23.46:3333',
  timeout: 10000, // Adiciona um timeout de 10 segundos
});

// 2. Interceptor para injetar o token em todas as requisições
// A função setAuthToken será chamada no seu AuthContext após o login
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// 3. Função de tratamento de erro centralizada
const handleError = (error, functionName) => {
  // Axios coloca informações do erro em `error.response`
  const errorMessage = error.response?.data?.mensagem || error.message;
  console.error(`API Error - ${functionName}:`, errorMessage);
  // Lança o erro para que a UI possa capturá-lo
  throw new Error(errorMessage);
};

// 4. O novo objeto de serviço, agora usando a instância do axios
export const apiService = {
  // Função de teste para verificar conectividade
  async testConnection() {
    try {
      console.log('🔄 [API] Testando conectividade...');
      const response = await api.get('/');
      console.log('✅ [API] Servidor respondeu:', response.data);
      return true;
    } catch (error) {
      console.error('❌ [API] Erro de conectividade:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('💡 [API] Dica: Verifique se o servidor está rodando na porta 3333');
      }
      return false;
    }
  },

  // Ocorrências
  criarOcorrencia: async (dados) => {
    try {
      console.log('🔄 Criando nova ocorrência com Axios...');
      const corpoRequisicao = {
        userap_id: dados.user_id,
        oco_categoria: dados.categoria,
        oco_descricao: dados.descricao,
        oco_localizacao: dados.local,
        oco_prioridade: dados.prioridade,
        oco_status: 'Aberta',
        oco_imagem: dados.anexos?.length > 0 ? dados.anexos[0] : null,
      };
      console.log('📋 Dados enviados:', JSON.stringify(corpoRequisicao, null, 2));
      const response = await api.post('/ocorrencias', corpoRequisicao);
      console.log('📦 Resposta da criação:', JSON.stringify(response.data, null, 2));
      return response.data.dados || response.data;
    } catch (error) {
      handleError(error, 'criarOcorrencia');
    }
  },

  buscarOcorrencias: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/ocorrencias', {
        params: { page, limit }
      });
      
      // Se a API retorna dados paginados
      if (response.data.pagination) {
        return {
          dados: response.data.dados || [],
          pagination: {
            currentPage: response.data.pagination.currentPage || page,
            totalPages: response.data.pagination.totalPages || 1,
            total: response.data.pagination.total || 0,
            hasMore: response.data.pagination.hasMore || false,
            perPage: response.data.pagination.perPage || limit
          }
        };
      }
      
      // Se a API retorna apenas array (fallback para compatibilidade)
      const dados = response.data.dados || response.data || [];
      return {
        dados: Array.isArray(dados) ? dados : [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          total: Array.isArray(dados) ? dados.length : 0,
          hasMore: false,
          perPage: limit
        }
      };
    } catch (error) {
      handleError(error, 'buscarOcorrencias');
      // Retornar estrutura vazia em caso de erro
      return {
        dados: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          hasMore: false,
          perPage: limit
        }
      };
    }
  },

  uploadAnexo: async (fileUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'anexo.jpg',
      });
      // Para upload, passamos headers específicos
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.url || response.data.dados || fileUri;
    } catch (error) {
      handleError(error, 'uploadAnexo');
      return fileUri; // Fallback em caso de erro
    }
  },

  adicionarComentario: async (ocorrenciaId, comentario) => {
    try {
      const response = await api.post(`/ocorrencias/${ocorrenciaId}/comentarios`, { texto: comentario });
      return response.data.dados;
    } catch (error) {
      handleError(error, 'adicionarComentario');
    }
  },

  // Encomendas
  getEncomendas: async () => {
    try {
      const response = await api.get('/encomendas');
      return response.data.dados || [];
    } catch (error) {
      handleError(error, 'getEncomendas');
    }
  },

  marcarEncomendaComoEntregue: async (encomendaId, retiradoPor) => {
    try {
      const response = await api.patch(`/encomendas/${encomendaId}/entregar`, { retirado_por: retiradoPor });
      return response.data.dados;
    } catch (error) {
      handleError(error, 'marcarEncomendaComoEntregue');
    }
  },

  // Login
  login: async (email, password) => {
    try {
      console.log('🔄 Fazendo login na API...');
      // Tenta endpoint com diferentes capitalizações caso o backend varie
      let response;
      try {
        response = await api.post('/Usuario/login', { user_email: email, user_senha: password });
      } catch (e) {
        console.warn('⚠️ /Usuario/login falhou, tentando /usuario/login', e.message);
        response = await api.post('/usuario/login', { user_email: email, user_senha: password });
      }

      console.log('📦 Resposta do login:', JSON.stringify(response.data, null, 2));

      // Normaliza diferentes formatos de resposta
      const sucesso = response.data?.sucesso ?? true;
      if (sucesso === false) {
        throw new Error(response.data.mensagem || 'E-mail ou senha inválidos.');
      }

      // Tenta extrair token de várias localizações possíveis
      const token = response.data?.token || response.data?.dados?.token || response.data?.dados?.usuario?.token || response.data?.dados?.user?.token || null;

      // Tenta extrair o objeto do usuário
      const usuarioObj = response.data?.dados?.usuario ?? response.data?.dados?.user ?? response.data?.dados ?? null;

      const userData = {
        ...((typeof usuarioObj === 'object' && usuarioObj) ? usuarioObj : {}),
        token: token || null,
      };

      console.log('✅ UserData processado (login):', JSON.stringify(userData, null, 2));

      if (userData.token) {
        setAuthToken(userData.token);
      } else {
        console.warn('⚠️ Token não encontrado na resposta de login. Nenhum token foi configurado.');
      }

      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.mensagem || error.message || 'E-mail ou senha inválidos.';
      console.error('API Error - login:', errorMessage, error.response?.data);
      throw new Error(errorMessage);
    }
  },

  // Notifications
  getNotificacoes: async (userap_id) => {
    try {
      // Validação para garantir que o userap_id foi fornecido
      if (!userap_id) {
        console.error('❌ [API] userap_id é necessário para buscar notificações.');
        return []; // Retorna array vazio para evitar quebrar a aplicação
      }

      const endpoint = `/notificacao/${userap_id}`;
      console.log(`🔄 [API] Buscando notificações em: ${endpoint}`);
      
      const response = await api.get(endpoint);
      console.log(`✅ [API] Notificações recebidas para userap_id: ${userap_id}`, response.data);
      return response.data.dados || response.data || [];
    } catch (error) {
      console.log(`❌ [API] Erro ao buscar notificações para userap_id ${userap_id}:`, error.response?.status, error.response?.data);
      handleError(error, `getNotificacoes (userap_id: ${userap_id})`);
      return []; // Retorna array vazio em caso de erro
    }
  },

  criarNotificacao: async ({ userap_id, mensagem, tipo }) => {
    try {
      console.log('🔄 [API] Criando notificação via POST /notificacao...');
      
      // Formato baseado no controller encontrado
      const requestData = {
        Userap_ID: userap_id,
        notificacaoMensagem: mensagem,
        NotDataEnvio: new Date().toISOString().slice(0, 19).replace('T', ' '), // MySQL datetime format
        notificacaoLida: false
      };
      
      console.log('📋 [API] Dados da notificação:', requestData);
      
      const response = await api.post('/notificacao', requestData);
      console.log('✅ [API] Notificação criada:', response.data);
      return response.data.dados || response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao criar notificação:', error.response?.status, error.response?.data);
      handleError(error, 'criarNotificacao');
    }
  },

  marcarNotificacaoComoLida: async (notificacaoId) => {
    try {
      console.log(`🔄 [API] Marcando notificação ${notificacaoId} como lida...`);
      
      // Usando PATCH com o endpoint correto: /notificacao/:not_id/lida
      const response = await api.patch(`/notificacao/${notificacaoId}/lida`);
      
      console.log('✅ [API] Notificação marcada como lida:', response.data);
      return response.data || true;
    } catch (error) {
      console.error('❌ [API] Erro ao marcar notificação como lida:', error.response?.status, error.response?.data);
      handleError(error, 'marcarNotificacaoComoLida');
    }
  },

  registrarDeviceToken: async (deviceToken) => {
    try {
      const response = await api.post('/devices/register', { device_token: deviceToken });
      return response.data.dados || response.data;
    } catch (error) {
      handleError(error, 'registrarDeviceToken');
    }
  },

  // === VISITANTES ===
  
  // Criar nova autorização de visitante
  criarVisitante: async (dadosVisitante) => {
    try {
      console.log('🔄 [API] Criando autorização de visitante...', dadosVisitante);
      const response = await api.post('/visitantes', dadosVisitante);
      console.log('✅ [API] Visitante autorizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao criar visitante:', error.response?.status, error.response?.data);
      handleError(error, 'criarVisitante');
    }
  },

  // Listar visitantes do usuário
  listarVisitantes: async (filtros = {}, page = 1, limit = 20) => {
    try {
      console.log('🔄 [API] Buscando lista de visitantes...', { filtros, page, limit });
      const params = new URLSearchParams();
      
      // Adiciona filtros se fornecidos
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.dataInicio) params.append('data_inicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('data_fim', filtros.dataFim);
      
      // Adiciona paginação
      params.append('page', page);
      params.append('limit', limit);
      
      const queryString = params.toString();
      const endpoint = `/visitantes?${queryString}`;
      
      const response = await api.get(endpoint);
      console.log('✅ [API] Visitantes carregados:', response.data);
      
      // Se a API retorna dados paginados
      if (response.data.pagination) {
        return {
          dados: response.data.dados || [],
          pagination: {
            currentPage: response.data.pagination.currentPage || page,
            totalPages: response.data.pagination.totalPages || 1,
            total: response.data.pagination.total || 0,
            hasMore: response.data.pagination.hasMore || false,
            perPage: response.data.pagination.perPage || limit
          }
        };
      }
      
      // Se a API retorna apenas array (fallback para compatibilidade)
      const dados = response.data.dados || response.data || [];
      return {
        dados: Array.isArray(dados) ? dados : [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          total: Array.isArray(dados) ? dados.length : 0,
          hasMore: false,
          perPage: limit
        }
      };
    } catch (error) {
      console.error('❌ [API] Erro ao listar visitantes:', error.response?.status, error.response?.data);
      handleError(error, 'listarVisitantes');
      // Retornar estrutura vazia em caso de erro
      return {
        dados: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          total: 0,
          hasMore: false,
          perPage: limit
        }
      };
    }
  },

  // Buscar detalhes de um visitante específico
  buscarVisitante: async (visitanteId) => {
    try {
      console.log(`🔄 [API] Buscando detalhes do visitante ${visitanteId}...`);
      const response = await api.get(`/visitantes/${visitanteId}`);
      console.log('✅ [API] Detalhes do visitante carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao buscar visitante:', error.response?.status, error.response?.data);
      handleError(error, 'buscarVisitante');
    }
  },

  // Cancelar autorização de visitante
  cancelarVisitante: async (visitanteId) => {
    try {
      console.log(`🔄 [API] Cancelando autorização do visitante ${visitanteId}...`);
      const response = await api.patch(`/visitantes/${visitanteId}/cancelar`);
      console.log('✅ [API] Visitante cancelado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao cancelar visitante:', error.response?.status, error.response?.data);
      handleError(error, 'cancelarVisitante');
    }
  },

  // Reenviar convite para visitante
  // Visitantes
  reenviarConviteVisitante: async (visitanteId) => {
    try {
      console.log(`🔄 [API] Reenviando convite para visitante ${visitanteId}...`);
      const response = await api.post(`/visitantes/${visitanteId}/reenviar`);
      console.log('✅ [API] Convite reenviado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao reenviar convite:', error.response?.status, error.response?.data);
      handleError(error, 'reenviarConviteVisitante');
    }
  },

  // Ambientes
  listarAmbientes: async () => {
    try {
      console.log('🔄 [API] Buscando ambientes disponíveis...');
      const response = await api.get('/ambientes');
      console.log('✅ [API] Ambientes carregados:', response.data);
      return response.data.dados || response.data || [];
    } catch (error) {
      console.error('❌ [API] Erro ao buscar ambientes:', error.response?.status, error.response?.data);
      return []; // Retorna array vazio em caso de erro
    }
  },

  // Dashboard
  buscarAvisosImportantes: async () => {
    try {
      console.log('🔄 [API] Buscando avisos importantes...');
      const response = await api.get('/notificacoes/importantes');
      console.log('✅ [API] Avisos importantes recebidos:', response.data);
      
      // Mapeia os campos do backend para o formato esperado no frontend
      const avisos = (response.data.dados || response.data || []).map(aviso => ({
        id: aviso.not_id,
        titulo: aviso.not_titulo,
        texto: aviso.not_mensagem,
      }));
      
      console.log('📋 [API] Avisos mapeados:', avisos);
      return avisos;
    } catch (error) {
      console.error('❌ [API] Erro ao buscar avisos importantes:', error.response?.status, error.response?.data);
      return []; // Retorna array vazio em caso de erro (fallback para mock)
    }
  },

  // Perfil do Usuário
  buscarPerfilUsuario: async (userId) => {
    try {
      console.log(`🔄 [API] Buscando perfil completo para o usuário ID: ${userId}...`);
      const response = await api.get(`/usuario/perfil/${userId}`);
      console.log('✅ [API] Perfil recebido:', response.data);
      return response.data; // { sucesso, mensagem, dados }
    } catch (error) {
      console.error('❌ [API] Erro ao buscar perfil:', error.response?.status, error.response?.data);
      return null; // Retorna null em caso de erro
    }
  },

  // Últimas Atualizações / Atividades Recentes
  buscarUltimasAtualizacoes: async (userapId) => {
    try {
      console.log(`🔄 [API] Buscando últimas atualizações para userap_id: ${userapId}...`);
      const response = await api.get(`/atualizacoes/${userapId}`);
      console.log('✅ [API] Atualizações recebidas:', response.data);
      return response.data; // { sucesso, mensagem, dados }
    } catch (error) {
      // Endpoint ainda não implementado no backend - retornar dados vazios silenciosamente
      if (error.response?.status === 404) {
        console.warn('⚠️ [API] Endpoint de atualizações ainda não implementado no backend');
        return { sucesso: true, mensagem: 'Endpoint em desenvolvimento', dados: [] };
      }
      console.error('❌ [API] Erro ao buscar atualizações:', error.response?.status, error.response?.data);
      return { sucesso: false, mensagem: 'Erro ao buscar atualizações', dados: [] };
    }
  },
};
