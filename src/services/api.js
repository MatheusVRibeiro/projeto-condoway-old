import axios from 'axios';

// 1. Cria uma instância do axios com a baseURL pré-configurada
const api = axios.create({
  // baseURL: 'http://192.168.0.174:3333',
  // baseURL: 'http://192.168.5.10:3333',
  baseURL: 'http://10.67.23.46:3333',
  timeout: 30000, // 30 segundos
});

// Helper para construir URLs completas de uploads
export const getBaseURL = () => api.defaults.baseURL;

export const buildFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/')) return `${getBaseURL()}${path}`;
  return path;
};

// Interceptor de REQUEST - Para validar token antes de cada requisição
api.interceptors.request.use(
  async (config) => {
    const token = config.headers.common?.Authorization || config.headers?.Authorization;
    
    // Debug da requisição
    console.log(`🔄 [API] ${config.method.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      token: token ? token.substring(0, 30) + '...' : 'NENHUM'
    });
    
    // Verificar se o token está expirado ANTES de fazer a requisição
    if (token && !config.url.includes('/login')) {
      // Extrair o token do header "Bearer TOKEN"
      const tokenValue = token.replace('Bearer ', '');
      
      if (isTokenExpired(tokenValue)) {
        const timeRemaining = getTokenTimeRemaining(tokenValue);
        console.error('❌ [AUTH] Token expirado detectado ANTES da requisição!');
        console.error(`⏰ [AUTH] Tempo restante: ${timeRemaining} minutos (expirado)`);
        
        try {
          // Importar AsyncStorage dinamicamente
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          
          // Limpar dados
          console.log('🧹 [AUTH] Limpando dados de autenticação...');
          await AsyncStorage.multiRemove(['user', 'token', 'userEmail', 'userPassword', 'authToken', 'userData']);
          
          // Limpar token do axios
          setAuthToken(null);
          
          // Emitir evento para logout
          if (global.onTokenExpired) {
            console.log('📢 [AUTH] Chamando global.onTokenExpired()...');
            global.onTokenExpired();
          }
          
          // Cancelar a requisição
          throw new Error('Token expirado. Redirecionando para login...');
        } catch (error) {
          console.error('❌ [AUTH] Erro ao processar token expirado:', error);
          throw error;
        }
      } else {
        const timeRemaining = getTokenTimeRemaining(tokenValue);
        if (timeRemaining !== null && timeRemaining < 30) {
          console.warn(`⚠️ [AUTH] Token expira em ${timeRemaining} minutos!`);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPONSE - Para detectar token expirado (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se receber 401 e não for a rota de login
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
      originalRequest._retry = true;
      
      // Verificar a mensagem de erro
      const errorMessage = error.response?.data?.mensagem || error.response?.data?.message || '';
      const isTokenExpired = errorMessage.includes('jwt expired') || 
                            errorMessage.includes('token expirado') ||
                            errorMessage.includes('Token inválido');
      
      if (isTokenExpired) {
        console.error('❌ [AUTH] Erro de autenticação:', errorMessage);
        console.error('🔴 [AUTH] Token JWT expirado. Fazendo logout forçado...');
      } else {
        console.warn('⚠️ [API] Erro 401 - Não autorizado:', errorMessage);
      }
      
      try {
        // Importar AsyncStorage dinamicamente para evitar dependência circular
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        
        // Limpar TODOS os dados de autenticação
        console.log('🧹 [AUTH] Limpando dados de autenticação do storage...');
        await AsyncStorage.multiRemove(['user', 'token', 'userEmail', 'userPassword', 'authToken', 'userData']);
        
        // Limpar token do axios
        setAuthToken(null);
        
        // Emitir evento para o AuthContext fazer logout e redirecionar
        if (global.onTokenExpired) {
          console.log('📢 [AUTH] Chamando global.onTokenExpired() para redirecionar...');
          global.onTokenExpired();
        } else {
          console.warn('⚠️ [AUTH] global.onTokenExpired não está definido!');
        }
        
      } catch (logoutError) {
        console.error('❌ [AUTH] Erro ao fazer logout:', logoutError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 2. Interceptor para injetar o token em todas as requisições
// A função setAuthToken será chamada no seu AuthContext após o login
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (__DEV__) {
      console.log('✅ [API] Token configurado no Axios:', token.substring(0, 20) + '...');
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    if (__DEV__) {
      console.log('🔓 [API] Token removido do Axios');
    }
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
  
  // Construímos um Error enriquecido com o statusCode e details para facilitar
  // tratamento específico nas camadas superiores (components/screens).
  const enrichedError = new Error(errorMessage);
  enrichedError.statusCode = statusCode;
  enrichedError.details = errorDetails;
  // Lança o erro para que a UI possa capturá-lo
  throw enrichedError;
};

// Helper: decodifica payload do JWT (somente para debug/fallback)
export const decodeJwt = (token) => {
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

// Helper: verifica se o token JWT está expirado
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) {
      console.warn('⚠️ [JWT] Token não possui campo "exp" (expiration)');
      return false; // Se não tem exp, considerar válido (o backend que deve rejeitar)
    }
    
    const now = Math.floor(Date.now() / 1000); // timestamp em segundos
    const isExpired = decoded.exp < now;
    
    if (isExpired) {
      const expirationDate = new Date(decoded.exp * 1000);
      console.warn(`⚠️ [JWT] Token expirado em: ${expirationDate.toLocaleString()}`);
    }
    
    return isExpired;
  } catch (error) {
    console.error('❌ [JWT] Erro ao verificar expiração do token:', error);
    return true; // Em caso de erro, considerar expirado por segurança
  }
};

// Helper: calcula tempo restante até a expiração do token (em minutos)
export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;
  
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp - now;
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    
    return remainingMinutes > 0 ? remainingMinutes : 0;
  } catch (error) {
    return 0;
  }
};

// Helper: retry automático para requisições que falharem por problemas de rede
export const retryRequest = async (requestFn, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Não fazer retry se for erro de validação/auth (4xx exceto 408/429)
      const status = error.response?.status;
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        throw error;
      }
      
      // Se não for o último attempt, aguardar antes de tentar novamente
      if (attempt < maxRetries) {
        console.warn(`⚠️ [Retry] Tentativa ${attempt}/${maxRetries} falhou. Aguardando ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        // Aumentar delay exponencialmente (backoff)
        delayMs *= 2;
      }
    }
  }
  
  console.error(`❌ [Retry] Todas as ${maxRetries} tentativas falharam`);
  throw lastError;
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
      console.log('📤 [uploadAnexo] URI recebida:', fileUri);
      
      const formData = new FormData();
      
      // Verificar se está rodando no Web (blob/file) ou Mobile (uri)
      if (fileUri.startsWith('blob:') || fileUri.startsWith('http')) {
        // React Native Web - converter blob para File
        console.log('🌐 [uploadAnexo] Modo Web detectado');
        
        const response = await fetch(fileUri);
        const blob = await response.blob();
        
        // Criar File a partir do Blob
        const file = new File([blob], 'anexo.jpg', { type: blob.type || 'image/jpeg' });
        formData.append('file', file);
        
        console.log('✅ [uploadAnexo] File criado:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
      } else {
        // React Native Mobile - usar objeto com uri
        console.log('📱 [uploadAnexo] Modo Mobile detectado');
        
        formData.append('file', {
          uri: fileUri,
          type: 'image/jpeg',
          name: 'anexo.jpg',
        });
      }
      
      console.log('🚀 [uploadAnexo] Enviando para /upload...');
      
      // Para upload, passamos headers específicos
      const response = await api.post('/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
      });
      
      console.log('✅ [uploadAnexo] Resposta recebida:', response.data);
      
      // Backend retorna: { sucesso, mensagem, dados: { path, filename, ... } }
      if (response.data?.dados?.path) {
        // Construir URL completa: baseURL + path
        const baseURL = api.defaults.baseURL;
        const fullUrl = `${baseURL}${response.data.dados.path}`;
        console.log('📎 [uploadAnexo] URL completa:', fullUrl);
        return fullUrl;
      }
      
      return response.data.url || fileUri;
    } catch (error) {
      console.error('❌ [uploadAnexo] Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
      
      // Verificar se a resposta tem os dados necessários (token e usuario)
      if (!response.data.dados || !response.data.dados.token || !response.data.dados.usuario) {
        throw new Error('Resposta inválida do servidor');
      }

      // A API retorna { dados: { usuario, token } }
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

  criarNotificacao: async ({ userap_id, mensagem, tipo, prioridade }) => {
    try {
      console.log('🔄 [API] Criando notificação via POST /notificacao...');
      
      // Formato baseado no controller encontrado
      const requestData = {
        Userap_ID: userap_id,
        notificacaoMensagem: mensagem,
        NotDataEnvio: new Date().toISOString().slice(0, 19).replace('T', ' '), // MySQL datetime format
        notificacaoLida: false,
      };

      // Se o caller informou tipo/prioridade, inclua nos campos esperados pelo backend
      if (tipo) requestData.not_tipo = tipo;
      if (prioridade) requestData.not_prioridade = prioridade;
      
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
      console.log(`🔄 [API] Reenviando convite para visitante (ID: ${visitanteId})...`);
      // Corrigido: usar o ID na URL
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

  // === RESERVAS DE AMBIENTES ===
  
  // Listar reservas do usuário
  listarReservas: async (userap_id) => {
    try {
      console.log(`🔄 [API] Buscando reservas do usuário ${userap_id}...`);
      const response = await api.get(`/reservas`);
      console.log('✅ [API] Reservas carregadas:', response.data);
      
      const reservas = response.data.dados || response.data || [];
      
      // Mapear status do backend para o frontend
      const mapStatus = (status) => {
        const statusLower = (status || 'pendente').toLowerCase();
        // Backend: Pendente, Reservado, Cancelado
        // Frontend: pendente, confirmada, cancelada
        switch (statusLower) {
          case 'reservado':
            return 'confirmada';
          case 'cancelado':
            return 'cancelada';
          case 'pendente':
            return 'pendente';
          default:
            return 'pendente';
        }
      };
      
      // Normalizar campos do backend para o formato esperado pelo frontend
      return reservas.map(r => ({
        id: r.res_id || r.id,
        environmentName: r.amd_nome || r.ambiente_nome || r.area || 'Ambiente',
        ambiente_id: r.amd_id || r.ambiente_id,
        date: r.res_data_reserva || r.data,
        time: r.res_horario_inicio && r.res_horario_fim 
          ? `${r.res_horario_inicio} - ${r.res_horario_fim}`
          : r.horario,
        horario_inicio: r.res_horario_inicio,
        horario_fim: r.res_horario_fim,
        status: mapStatus(r.res_status || r.status),
        user_nome: r.user_nome,
        ap_numero: r.ap_numero,
        _raw: r
      }));
    } catch (error) {
      console.error('❌ [API] Erro ao buscar reservas:', error.response?.status, error.response?.data);
      return []; // Retorna array vazio em caso de erro
    }
  },

  // Criar nova reserva
  criarReserva: async (dadosReserva) => {
    try {
      console.log('🔄 [API] Criando nova reserva...', dadosReserva);
      
      // Formato esperado pelo backend
      const payload = {
        amd_id: dadosReserva.ambiente_id || dadosReserva.amd_id,
        res_data_reserva: dadosReserva.res_data || dadosReserva.res_data_reserva,
        res_horario_inicio: dadosReserva.res_horario_inicio || dadosReserva.horario_inicio,
        res_horario_fim: dadosReserva.res_horario_fim || dadosReserva.horario_fim,
      };
      
      console.log('📤 [API] Payload formatado:', payload);
      
      // ✅ VALIDAR DISPONIBILIDADE antes de criar
      console.log('🔍 [API] Verificando disponibilidade...');
      const disponivel = await apiService.verificarDisponibilidade(
        payload.amd_id,
        payload.res_data_reserva,
        payload.res_horario_inicio,
        payload.res_horario_fim
      );
      
      if (!disponivel) {
        console.log('❌ [API] Horário já reservado!');
        throw new Error('Este horário já está reservado. Por favor, escolha outro período.');
      }
      
      console.log('✅ [API] Horário disponível, criando reserva...');
      const response = await api.post('/reservas', payload);
      console.log('✅ [API] Reserva criada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao criar reserva:', error.response?.status, error.response?.data);
      
      // Se o erro veio da validação de disponibilidade, propagar a mensagem
      if (error.message && error.message.includes('já está reservado')) {
        throw error;
      }
      
      const errorMessage = error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao criar reserva';
      throw new Error(errorMessage);
    }
  },

  // Obter detalhes de uma reserva específica
  buscarReserva: async (reservaId) => {
    try {
      console.log(`🔄 [API] Buscando detalhes da reserva ${reservaId}...`);
      const response = await api.get(`/reservas/${reservaId}`);
      console.log('✅ [API] Detalhes da reserva:', response.data);
      
      const r = response.data.dados || response.data;
      
      // Mapear status do backend para o frontend
      const mapStatus = (status) => {
        const statusLower = (status || 'pendente').toLowerCase();
        switch (statusLower) {
          case 'reservado':
            return 'confirmada';
          case 'cancelado':
            return 'cancelada';
          case 'pendente':
            return 'pendente';
          default:
            return 'pendente';
        }
      };
      
      // Normalizar para o formato do frontend
      return {
        id: r.res_id,
        environmentName: r.amd_nome,
        ambiente_id: r.amd_id,
        amd_descricao: r.amd_descricao,
        amd_capacidade: r.amd_capacidade,
        date: r.res_data_reserva,
        time: `${r.res_horario_inicio} - ${r.res_horario_fim}`,
        horario_inicio: r.res_horario_inicio,
        horario_fim: r.res_horario_fim,
        status: mapStatus(r.res_status),
        user_nome: r.user_nome,
        user_telefone: r.user_telefone,
        ap_numero: r.ap_numero,
        _raw: r
      };
    } catch (error) {
      console.error('❌ [API] Erro ao buscar detalhes da reserva:', error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.mensagem || 'Erro ao buscar reserva');
    }
  },

  // Cancelar reserva
  cancelarReserva: async (reservaId) => {
    try {
      console.log(`🔄 [API] Cancelando reserva ${reservaId}...`);
      const response = await api.patch(`/reservas/${reservaId}/cancelar`);
      console.log('✅ [API] Reserva cancelada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao cancelar reserva:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao cancelar reserva';
      throw new Error(errorMessage);
    }
  },

  // Listar reservas de um ambiente específico
  listarReservasAmbiente: async (ambiente_id) => {
    try {
      console.log(`🔄 [API] Buscando reservas do ambiente ${ambiente_id}...`);
      const response = await api.get(`/reservas/ambiente/${ambiente_id}`);
      console.log('✅ [API] Reservas do ambiente carregadas:', response.data);
      
      const reservas = response.data.dados || response.data || [];
      
      // Mapear status do backend para o frontend
      const mapStatus = (status) => {
        const statusLower = (status || 'pendente').toLowerCase();
        switch (statusLower) {
          case 'reservado':
            return 'confirmada';
          case 'cancelado':
            return 'cancelada';
          case 'pendente':
            return 'pendente';
          default:
            return 'pendente';
        }
      };
      
      return reservas.map(r => ({
        id: r.res_id,
        date: r.res_data_reserva,
        time: `${r.res_horario_inicio} - ${r.res_horario_fim}`,
        horario_inicio: r.res_horario_inicio,
        horario_fim: r.res_horario_fim,
        status: mapStatus(r.res_status),
        user_nome: r.user_nome,
        ap_numero: r.ap_numero,
        _raw: r
      }));
    } catch (error) {
      console.error('❌ [API] Erro ao buscar reservas do ambiente:', error.response?.status, error.response?.data);
      return [];
    }
  },

  // Verificar disponibilidade (helper function - verifica se horário está ocupado)
  verificarDisponibilidade: async (ambiente_id, data, horario_inicio, horario_fim) => {
    try {
      console.log(`🔄 [API] Verificando disponibilidade...`, { ambiente_id, data, horario_inicio, horario_fim });
      
      // Busca todas as reservas do ambiente
      const reservas = await apiService.listarReservasAmbiente(ambiente_id);
      
      // Normalizar data para comparação (remover hora se houver)
      const dataNormalizada = data.split('T')[0];
      
      // Filtra reservas na mesma data que não estão canceladas
      const reservasMesmaData = reservas.filter(r => {
        const dataReserva = r.date.split('T')[0];
        const isMesmaData = dataReserva === dataNormalizada;
        const naoEstaCancelada = r.status !== 'cancelada' && r.status !== 'cancelado';
        
        console.log(`📋 Reserva #${r.id}: data=${dataReserva}, mesmaData=${isMesmaData}, cancelada=${!naoEstaCancelada}`);
        
        return isMesmaData && naoEstaCancelada;
      });
      
      console.log(`📊 [API] Encontradas ${reservasMesmaData.length} reservas na mesma data não canceladas`);
      
      // Verifica se há conflito de horários
      const temConflito = reservasMesmaData.some(r => {
        const inicio = r.horario_inicio;
        const fim = r.horario_fim;
        
        // Verifica se os horários se sobrepõem
        const conflito = (
          (horario_inicio >= inicio && horario_inicio < fim) ||
          (horario_fim > inicio && horario_fim <= fim) ||
          (horario_inicio <= inicio && horario_fim >= fim)
        );
        
        if (conflito) {
          console.log(`⚠️ [API] Conflito detectado com reserva #${r.id}: ${inicio} - ${fim}`);
        }
        
        return conflito;
      });
      
      const disponivel = !temConflito;
      console.log(`${disponivel ? '✅' : '❌'} [API] Disponibilidade: ${disponivel ? 'Livre' : 'Ocupado'}`);
      
      return disponivel;
    } catch (error) {
      console.error('❌ [API] Erro ao verificar disponibilidade:', error);
      return true; // Em caso de erro, assume disponível para não bloquear o usuário
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
        prioridade: (aviso.not_prioridade || aviso.prioridade || 'alta').toLowerCase(),
      }));
      
      console.log('📋 [API] Avisos mapeados:', avisos);
      return avisos;
    } catch (error) {
      console.error('❌ [API] Erro ao buscar avisos importantes:', error.response?.status, error.response?.data);
      return []; // Retorna array vazio em caso de erro (fallback para mock)
    }
  },

  // Condomínio
  buscarCondominio: async (condominioId) => {
    try {
      console.log(`🔄 [API] Buscando dados do condomínio ID: ${condominioId}...`);
      const response = await api.get(`/condominio/${condominioId}`);
      console.log('✅ [API] Dados do condomínio recebidos:', response.data);
      
      const dados = response.data?.dados || response.data || null;
      
      if (!dados) {
        console.warn('⚠️ [API] Nenhum dado de condomínio retornado');
        return null;
      }
      
      // Normalizar campos do condomínio
      const condominio = {
        cond_id: dados.cond_id ?? condominioId,
        cond_nome: dados.cond_nome ?? null,
        cond_endereco: dados.cond_endereco ?? null,
        cond_cidade: dados.cond_cidade ?? null,
        cond_estado: dados.cond_estado ?? null,
        cond_cep: dados.cond_cep ?? null,
        cond_telefone: dados.cond_telefone ?? null,
        // Campos extras se existirem
        _raw: dados
      };
      
      console.log('🏘️ [API] Condomínio normalizado:', condominio);
      return condominio;
    } catch (error) {
      console.error('❌ [API] Erro ao buscar condomínio:', error.response?.status, error.response?.data);
      
      // Se endpoint não existe (404), avisar mas não quebrar
      if (error.response?.status === 404) {
        console.warn('⚠️ [API] Endpoint /condominio/:id não implementado no backend');
        return null;
      }
      
      return null;
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

      const baseURL = api.defaults.baseURL;
      
      const normalize = (p) => {
        // Se user_foto existe mas é apenas um path relativo, construir URL completa
        let userFoto = p.user_foto ?? null;
        
        console.log('📸 [API] user_foto recebido do backend:', userFoto);
        console.log('🌐 [API] baseURL:', baseURL);
        
        if (userFoto && userFoto.startsWith('/uploads/')) {
          userFoto = `${baseURL}${userFoto}`;
          console.log('✅ [API] user_foto convertido para URL completa:', userFoto);
        } else if (userFoto && !userFoto.startsWith('http')) {
          // Se não começa com /uploads/ mas também não é http/https, adiciona baseURL
          userFoto = `${baseURL}${userFoto.startsWith('/') ? '' : '/'}${userFoto}`;
          console.log('✅ [API] user_foto normalizado:', userFoto);
        } else if (userFoto) {
          console.log('ℹ️ [API] user_foto já é URL completa:', userFoto);
        } else {
          console.log('⚠️ [API] user_foto é NULL - usuário sem foto');
        }
        
        return {
          // Usuário (nomes exatos do banco)
          userap_id: p.userap_id ?? null,
          user_id: p.user_id ?? null,
          user_nome: p.user_nome ?? null,
          user_email: p.user_email ?? null,
          user_telefone: p.user_telefone ?? null,
          user_tipo: p.user_tipo ?? null,
          user_foto: userFoto, // ✅ URL completa construída
          user_data_cadastro: p.user_data_cadastro ?? null,

          // Apartamento (nomes exatos do banco)
          ap_id: p.ap_id ?? null,
          ap_numero: p.ap_numero ?? null,
          ap_andar: p.ap_andar ?? null,

          // Bloco (nomes exatos do banco)
          bloc_id: p.bloc_id ?? null,
          bloc_nome: p.bloc_nome ?? null,

          // Condomínio (nomes exatos do banco)
          cond_id: p.cond_id ?? null,
          cond_nome: p.cond_nome ?? null,
          cond_endereco: p.cond_endereco ?? null,
          cond_cidade: p.cond_cidade ?? null,
          cond_estado: p.cond_estado ?? null,
          cond_taxa_base: p.cond_taxa_base ?? null,

          // Mantém o objeto original para casos extras
          _raw: p,
        };
      };

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
        console.log(`🔄 [API] Buscando últimas atualizações (dashboard) para userap_id: ${userapId}...`);
        const response = await api.get(`/dashboard/updates/${userapId}`);
        console.log('✅ [API] Atualizações (dashboard) recebidas:', response.data);
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

  // Upload de Foto de Perfil
  // Backend suporta ambas as rotas:
  // - POST /usuario/foto/:id (campo 'file') ← Rota usada aqui
  // - POST /usuario/perfil/:id/foto (campo 'foto') ← Rota alternativa
  uploadFotoPerfil: async (userId, fileUri) => {
    try {
      console.log('📤 [uploadFotoPerfil] Iniciando upload para userId:', userId);
      console.log('📤 [uploadFotoPerfil] URI recebida:', fileUri);
      
      const formData = new FormData();
      
      // Verificar se está rodando no Web (blob/file) ou Mobile (uri)
      if (fileUri.startsWith('blob:') || fileUri.startsWith('http')) {
        // React Native Web - converter blob para File
        console.log('🌐 [uploadFotoPerfil] Modo Web detectado');
        
        const response = await fetch(fileUri);
        const blob = await response.blob();
        
        // Criar File a partir do Blob
        const file = new File([blob], 'perfil.jpg', { type: blob.type || 'image/jpeg' });
        formData.append('file', file); // Campo 'file' esperado pela rota /usuario/foto/:id
        
        console.log('✅ [uploadFotoPerfil] File criado:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
      } else {
        // React Native Mobile - usar objeto com uri
        console.log('📱 [uploadFotoPerfil] Modo Mobile detectado');
        
        formData.append('file', { // Campo 'file' esperado pela rota /usuario/foto/:id
          uri: fileUri,
          type: 'image/jpeg',
          name: 'perfil.jpg',
        });
      }
      
      console.log(`🚀 [uploadFotoPerfil] Enviando para POST /usuario/foto/${userId}...`);
      console.log(`📝 [uploadFotoPerfil] FormData field: 'file'`);
      
      // Para upload, passamos headers específicos
      const response = await api.post(`/usuario/foto/${userId}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
      });
      
      console.log('✅ [uploadFotoPerfil] Resposta recebida:', response.data);
      console.log('🔍 [uploadFotoPerfil] response.data.dados:', response.data?.dados);
      console.log('🔍 [uploadFotoPerfil] response.data.dados.path:', response.data?.dados?.path);
      console.log('🔍 [uploadFotoPerfil] response.data.dados.user_foto:', response.data?.dados?.user_foto);
      console.log('🔍 [uploadFotoPerfil] response.data.url:', response.data?.url);
      console.log('🔍 [uploadFotoPerfil] response.data COMPLETO:', JSON.stringify(response.data, null, 2));
      
      // ⚠️ IMPORTANTE: Verificar se o backend está retornando sucesso = true
      if (response.data?.sucesso === false) {
        console.error('❌ [uploadFotoPerfil] Backend retornou sucesso = false');
        console.error('📋 [uploadFotoPerfil] Mensagem de erro:', response.data?.mensagem || response.data?.erro);
        return { sucesso: false, erro: response.data?.mensagem || response.data?.erro || 'Erro ao fazer upload' };
      }
      
      // Backend retorna: { sucesso, mensagem, dados: { path, filename, ... } }
      if (response.data?.dados?.path) {
        // Construir URL completa: baseURL + path
        const baseURL = api.defaults.baseURL;
        const fullUrl = `${baseURL}${response.data.dados.path}`;
        console.log('📸 [uploadFotoPerfil] URL completa da foto:', fullUrl);
        return { sucesso: true, url: fullUrl, dados: response.data.dados };
      }
      
      // Se backend já retornou user_foto diretamente
      if (response.data?.dados?.user_foto) {
        console.log('📸 [uploadFotoPerfil] user_foto retornado pelo backend:', response.data.dados.user_foto);
        return { sucesso: true, url: response.data.dados.user_foto, dados: response.data.dados };
      }
      
      // Fallback: usar url direta se existir
      if (response.data?.url) {
        console.log('📸 [uploadFotoPerfil] URL direta:', response.data.url);
        return { sucesso: true, url: response.data.url, dados: response.data };
      }
      
      console.warn('⚠️ [uploadFotoPerfil] Nenhuma URL encontrada na resposta, usando fileUri');
      return { sucesso: true, url: fileUri, dados: response.data };
    } catch (error) {
      console.error('❌ [uploadFotoPerfil] Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Se endpoint não existe (404), avisar que precisa ser implementado no backend
      if (error.response?.status === 404) {
        console.error('⚠️ [uploadFotoPerfil] Endpoint /usuario/foto/:id não implementado no backend');
        return { 
          sucesso: false, 
          erro: 'Endpoint de upload de foto não implementado no backend',
          mensagem: 'Por favor, implemente o endpoint POST /usuario/foto/:id no backend'
        };
      }
      
      handleError(error, 'uploadFotoPerfil');
      return { sucesso: false, erro: error.message };
    }
  },

  // Alterar Senha do Usuário
  alterarSenha: async (userId, senhaAtual, novaSenha) => {
    try {
      console.log(`🔄 [API] Alterando senha do usuário ID: ${userId}...`);
      console.log(`📋 [API] Dados enviados:`, { 
        senhaAtual: senhaAtual ? '***' : '(vazio)', 
        novaSenha: novaSenha ? '***' : '(vazio)' 
      });
      
      const requestBody = {
        senhaAtual: senhaAtual,  // ⚠️ Backend espera camelCase
        novaSenha: novaSenha     // ⚠️ Backend espera camelCase
      };
      
      console.log(`📤 [API] Body da requisição:`, Object.keys(requestBody));
      
      const response = await api.put(`/usuario/senha/${userId}`, requestBody);
      
      console.log('✅ [API] Senha alterada com sucesso:', response.data);
      return response.data; // { sucesso: true, mensagem: "Senha alterada com sucesso" }
    } catch (error) {
      console.error('❌ [API] Erro ao alterar senha:', error.response?.status, error.response?.data);
      
      // Tratar erros específicos
      if (error.response?.status === 401) {
        throw new Error('Senha atual incorreta');
      }
      
      if (error.response?.status === 404) {
        console.warn('⚠️ [API] Endpoint /usuario/senha/:id não implementado no backend');
        throw new Error('Funcionalidade de alterar senha ainda não implementada no backend');
      }
      
      const errorMessage = error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao alterar senha';
      throw new Error(errorMessage);
    }
  },

  // Atualizar Perfil do Usuário
  atualizarPerfilUsuario: async (userId, dadosAtualizados) => {
    try {
      console.log(`🔄 [API] Atualizando perfil do usuário ID: ${userId}...`);
      console.log(`📋 [API] Dados para atualizar:`, dadosAtualizados);
      
      const response = await api.put(`/usuario/perfil/${userId}`, dadosAtualizados);
      
      console.log('✅ [API] Perfil atualizado com sucesso:', response.data);
      return response.data; // { sucesso: true, mensagem: "...", dados: {...} }
    } catch (error) {
      console.error('❌ [API] Erro ao atualizar perfil:', error.response?.status, error.response?.data);
      
      // Tratar erros específicos
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.mensagem || 'Dados inválidos';
        throw new Error(errorMessage);
      }
      
      if (error.response?.status === 404) {
        console.warn('⚠️ [API] Endpoint /usuario/perfil/:id não implementado no backend');
        throw new Error('Funcionalidade de editar perfil ainda não implementada no backend');
      }
      
      const errorMessage = error.response?.data?.mensagem || error.response?.data?.message || 'Erro ao atualizar perfil';
      throw new Error(errorMessage);
    }
  },

  // Recuperação de Senha
  solicitarRecuperacaoSenha: async (email) => {
    try {
      console.log('🔄 [API] Solicitando recuperação de senha para:', email);
      const response = await api.post('/usuario/recuperar-senha', { user_email: email });
      console.log('✅ [API] Email de recuperação enviado:', response.data);
      return response.data; // { sucesso: true, mensagem: "Código enviado..." }
    } catch (error) {
      console.error('❌ [API] Erro ao solicitar recuperação:', error.response?.status, error.response?.data);
      
      // Log detalhado do erro
      console.error('📋 [API] Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      const errorMessage = error.response?.data?.mensagem || 
                          error.response?.data?.message || 
                          error.response?.data?.erro ||
                          error.message || 
                          'Erro ao enviar email de recuperação';
      throw new Error(errorMessage);
    }
  },

  redefinirSenha: async (email, codigo, novaSenha) => {
    try {
      // Validação cliente adicional para evitar 400 do backend
      if (!codigo || !novaSenha) {
        throw new Error('Código e nova senha são obrigatórios.');
      }

      // Garantir tipos/trim
      const codigoStr = String(codigo).trim();
      const novaSenhaStr = String(novaSenha).trim();

      console.log('🔄 [API] Redefinindo senha para:', email);

      // Construir payload com variantes de nomes (snake_case e camelCase)
      // Alguns backends aceitam `codigo_reset`/`nova_senha`, outros `codigo`/`novaSenha`.
      const payload = {
        codigo_reset: codigoStr,
        codigo: codigoStr,
        nova_senha: novaSenhaStr,
        novaSenha: novaSenhaStr,
      };

      // Não enviar user_email por padrão (backend já retirou), mas manter compatibilidade
      if (email) {
        payload.user_email = String(email).trim();
      }

      const response = await api.post('/usuario/redefinir-senha', payload);

      console.log('✅ [API] Senha redefinida com sucesso:', response.data);
      return response.data; // { sucesso: true, mensagem: "Senha alterada..." }
    } catch (error) {
      console.error('❌ [API] Erro ao redefinir senha:', error.response?.status, error.response?.data);

      // Log detalhado do erro
      console.error('📋 [API] Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const errorMessage = error.response?.data?.mensagem || 
                          error.response?.data?.message || 
                          error.response?.data?.erro ||
                          error.message || 
                          'Erro ao redefinir senha';
      throw new Error(errorMessage);
    }
  },
};

