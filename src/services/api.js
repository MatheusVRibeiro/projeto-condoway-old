import axios from 'axios';

// 1. Cria uma instância do axios com a baseURL pré-configurada
const api = axios.create({
  baseURL: 'http://192.168.0.174:3333',
  // baseURL: 'http://10.67.23.46:3333',
  timeout: 30000, // 30 segundos
});

// Interceptor de REQUEST - Para debug do token
api.interceptors.request.use(
  (config) => {
    const token = config.headers.common?.Authorization || config.headers?.Authorization;
    console.log(`🔄 [API] ${config.method.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      token: token ? token.substring(0, 30) + '...' : 'NENHUM'
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor para injetar o token em todas as requisições
// A função setAuthToken será chamada no seu AuthContext após o login
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ [API] Token configurado no Axios:', token.substring(0, 20) + '...');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('🔓 [API] Token removido do Axios');
  }
};

// 3. Função de tratamento de erro centralizada
const handleError = (error, functionName) => {
  // Axios coloca informações do erro em `error.response`
  const errorMessage = error.response?.data?.mensagem || error.message;
  const statusCode = error.response?.status;
  const errorDetails = error.response?.data;
  
  console.error(`❌ [API Error - ${functionName}]:`, {
    status: statusCode,
    message: errorMessage,
    details: errorDetails,
    fullError: error.response?.data || error.message
  });
  
  // Lança o erro para que a UI possa capturá-lo
  throw new Error(errorMessage);
};

// Helper: decodifica payload do JWT (somente para debug/fallback)
const decodeJwt = (token) => {
  try {
    const base64Payload = token.split('.')[1];
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
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

  // Marca todas as mensagens de uma ocorrência como lidas (tolerante a 404 enquanto backend não implementar)
  marcarTodasMensagensLidas: async (ocorrenciaId) => {
    try {
      console.log('🔄 [API] Marcando todas as mensagens da ocorrência como lidas:', ocorrenciaId);
      const response = await api.patch(`/mensagens/ocorrencia/${ocorrenciaId}/lida`);
      console.log('✅ [API] Todas as mensagens marcadas como lidas');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('⚠️ [API] Endpoint marcarTodasMensagensLidas não encontrado (404). Ignorando temporariamente.');
        return null;
      }
      console.error('❌ [API] Erro ao marcar mensagens como lidas:', error.response?.data || error.message);
      handleError(error, 'marcarTodasMensagensLidas');
    }
  },

  // Ocorrências
  criarOcorrencia: async (dados) => {
    try {
      console.log('🔄 Criando nova ocorrência com Axios...');

      // fallback: tentar extrair userap_id do token se não foi passado em dados
      let userapId = dados.user_id;
      try {
        if (!userapId) {
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          const token = await AsyncStorage.getItem('token');
          if (token) {
            const decoded = decodeJwt(token);
            userapId = decoded?.userap_id || decoded?.id || userapId;
            console.log('👤 [API] userapId fallback extraído do token:', userapId);
          } else {
            console.warn('⚠️ [API] Token não encontrado no AsyncStorage para fallback userapId');
          }
        }
      } catch (e) {
        console.warn('⚠️ [API] Erro ao tentar extrair userapId do token:', e);
      }

      const corpoRequisicao = {
        userap_id: userapId,
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

  buscarOcorrencias: async (userApId, page = 1, limit = 20) => {
    try {
      // <--- 6. VALIDAÇÃO: se não houver userApId, retorna erro
      if (!userApId) {
        return handleError({ 
          message: 'ID do apartamento do usuário não encontrado.' 
        });
      }

      // <--- 7. MONTA O ENDPOINT COM O userApId
      const endpoint = `/ocorrencias/${userApId}`;
      console.log(`🔄 [API] Buscando ocorrências: ${endpoint}?page=${page}&limit=${limit}`);

      const response = await api.get(endpoint, {
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
      // Se o erro for 500 e for relacionado a paginação, retornar vazio sem quebrar
      if (error.response?.status === 500) {
        console.warn(`⚠️ [API] Erro 500 ao buscar página ${page} - retornando vazio`);
        return {
          dados: [],
          pagination: {
            currentPage: page,
            totalPages: page,
            total: 0,
            hasMore: false,
            perPage: limit
          }
        };
      }
      
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
      console.log('🔄 [API] Enviando comentário para ocorrência:', ocorrenciaId);

      // Tentar decodificar token do AsyncStorage para fallback (cond_id / userap_id)
      let decoded = null;
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const token = await AsyncStorage.getItem('token');
        if (token) {
          decoded = decodeJwt(token);
          console.log('👤 [API] Dados do token JWT (adicionarComentario):', {
            userap_id: decoded?.userap_id || decoded?.id,
            cond_id: decoded?.cond_id,
            nome: decoded?.nome || decoded?.name
          });
        } else {
          console.warn('⚠️ [API] Token não encontrado no AsyncStorage (adicionarComentario)');
        }
      } catch (e) {
        console.warn('⚠️ [API] Erro lendo AsyncStorage para token:', e);
      }

      // Construir payload para /mensagens (workaround: inclui cond_id/userap_id se disponíveis)
      const payload = {
        msg_mensagem: (comentario || '').substring(0, 130),
        oco_id: ocorrenciaId || null
      };

      if (decoded?.cond_id) payload.cond_id = decoded.cond_id;
      if (decoded?.userap_id || decoded?.id) payload.userap_id = decoded.userap_id || decoded.id;

      console.log('📤 [API] Payload (mensagem):', payload);

      const response = await api.post('/mensagens', payload);

      console.log('✅ [API] Comentário enviado:', response.data);

      return {
        id: response.data.dados?.msg_id,
        text: response.data.dados?.msg_mensagem || comentario,
        timestamp: response.data.dados?.msg_data_envio || new Date().toISOString(),
        status: response.data.dados?.msg_status || 'Enviada',
        user: 'Você',
        isOwn: true
      };
    } catch (error) {
      console.error('❌ [API] Erro ao adicionar comentário:', error.response?.data || error.message);

      if (error.response?.data?.dados?.includes("Column 'cond_id' cannot be null") ||
          error.response?.data?.mensagem?.includes('cond_id')) {
        const mensagemErro = 'O backend precisa extrair cond_id e userap_id do token JWT do usuário autenticado.';
        console.error('💡 [API] Sugestão:', mensagemErro);
        throw new Error(mensagemErro);
      }

      handleError(error, 'adicionarComentario');
    }
  },

  // Encomendas
  getEncomendas: async (userApId) => {
    try {
      // Validação: se não houver userApId, retorna erro
      if (!userApId) {
        return handleError({ 
          message: 'ID do apartamento do usuário não encontrado.' 
        });
      }

      // Monta o endpoint com o userApId (moradores veem apenas suas encomendas)
      const endpoint = `/encomendas/${userApId}`;
      console.log(`🔄 [API] Buscando encomendas: ${endpoint}`);

      const response = await api.get(endpoint);
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
      const response = await api.post('/Usuario/login', {
        user_email: email,
        user_senha: password,
      });
      
      console.log('📦 Resposta do login:', JSON.stringify(response.data, null, 2));
      
      if (!response.data.sucesso) {
        throw new Error(response.data.mensagem || 'E-mail ou senha inválidos.');
      }

      // A API retorna { sucesso: true, dados: { usuario, token } }
      // Retornar a resposta completa para o AuthContext processar
      return response.data;
    } catch (error) {
      // O handleError aqui pode ser customizado se a resposta de erro do login for diferente
      const errorMessage = error.response?.data?.mensagem || error.message || 'E-mail ou senha inválidos.';
      console.error(`API Error - login:`, errorMessage);
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
      // Log detalhado, mas não lançar para evitar quebrar hooks/UX
      console.error('❌ [API] Erro ao listar visitantes (tratado):', error.response?.status, error.response?.data || error.message);
      // Opcional: você pode enviar esse erro para um serviço de monitoramento aqui

      // Retornar estrutura vazia em caso de erro para manter a UI funcional
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

  // Perfil do Usuário (com normalização de campos para evitar diferenças de names entre backends)
  buscarPerfilUsuario: async (userId) => {
    try {
      console.log(`🔄 [API] Buscando perfil completo para o usuário ID: ${userId}...`);
      const response = await api.get(`/usuario/perfil/${userId}`);
      console.log('✅ [API] Perfil recebido:', response.data);

      const raw = response.data?.dados || response.data || null;
      if (!raw) return response.data;

      const normalize = (p) => ({
        // Usuário
        userap_id: p.userap_id ?? p.userApId ?? p.Userap_ID ?? null,
        user_id: p.user_id ?? p.userId ?? p.User_ID ?? null,
        user_nome: p.user_nome ?? p.userNome ?? p.userName ?? null,
        user_email: p.user_email ?? p.userEmail ?? null,
        user_telefone: p.user_telefone ?? p.userTelefone ?? null,
        user_tipo: p.user_tipo ?? p.userTipo ?? null,

        // Apartamento
        ap_id: p.ap_id ?? p.apId ?? p.apartamento_id ?? p.apartamentoId ?? null,
        ap_numero: p.ap_numero ?? p.apNumero ?? p.apartamento_numero ?? p.apartamentoNumero ?? null,

  // Bloco: normalizamos apenas a forma 'bloc_id' para evitar aliases poluídos
  bl_id: p.bloc_id ?? null,
  bl_nome: p.bloc_nome ?? null,

        // Condomínio
        cond_id: p.cond_id ?? p.condId ?? p.condominio_id ?? p.condominioId ?? null,
        cond_nome: p.cond_nome ?? p.condNome ?? p.condominio_nome ?? p.condominioNome ?? null,

        // Mantém o objeto original para casos extras
        _raw: p,
      });

      const dadosNormalizados = Array.isArray(raw) ? raw.map(normalize) : normalize(raw);

      return {
        ...response.data,
        dados: dadosNormalizados,
      };
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
