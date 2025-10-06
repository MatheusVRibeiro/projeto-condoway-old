import axios from 'axios';

// 1. Cria uma instância do axios com a baseURL pré-configurada
const api = axios.create({
  baseURL: 'http://10.67.23.46:3333',
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

  buscarOcorrencias: async () => {
    try {
      const response = await api.get('/ocorrencias');
      return response.data.dados || [];
    } catch (error) {
      handleError(error, 'buscarOcorrencias');
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
      const response = await api.post('/Usuario/login', {
        user_email: email,
        user_senha: password,
      });
      
      console.log('📦 Resposta do login:', JSON.stringify(response.data, null, 2));
      
      if (!response.data.sucesso) {
        throw new Error(response.data.mensagem || 'E-mail ou senha inválidos.');
      }

      const userData = {
        ...response.data.dados,
        token: response.data.dados.token || 'temp_token_' + Date.now()
      };

      console.log('✅ UserData processado:', JSON.stringify(userData, null, 2));

      // Se o login for bem-sucedido, configura o token para todas as futuras requisições
      if (userData.token) {
        setAuthToken(userData.token);
      }
      
      return userData;
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
  listarVisitantes: async (filtros = {}) => {
    try {
      console.log('🔄 [API] Buscando lista de visitantes...');
      const params = new URLSearchParams();
      
      // Adiciona filtros se fornecidos
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.dataInicio) params.append('data_inicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('data_fim', filtros.dataFim);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/visitantes?${queryString}` : '/visitantes';
      
      const response = await api.get(endpoint);
      console.log('✅ [API] Visitantes carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao listar visitantes:', error.response?.status, error.response?.data);
      handleError(error, 'listarVisitantes');
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

  // === USUÁRIO APARTAMENTO (PERFIL E UNIDADE) ===
  
  // Buscar dados do perfil do usuário e unidade
  buscarPerfilUsuario: async (userId) => {
    try {
      console.log(`🔄 [API] Buscando perfil do usuário ${userId}...`);
      const response = await api.get(`/usuario_apartamento/${userId}`);
      console.log('✅ [API] Perfil do usuário carregado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao buscar perfil:', error.response?.status, error.response?.data);
      handleError(error, 'buscarPerfilUsuario');
    }
  },

  // Atualizar dados do perfil do usuário
  atualizarPerfilUsuario: async (userId, dadosPerfil) => {
    try {
      console.log(`🔄 [API] Atualizando perfil do usuário ${userId}...`, dadosPerfil);
      const response = await api.put(`/usuario_apartamento/${userId}`, dadosPerfil);
      console.log('✅ [API] Perfil atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao atualizar perfil:', error.response?.status, error.response?.data);
      handleError(error, 'atualizarPerfilUsuario');
    }
  },

  // Buscar detalhes da unidade (apartamento)
  buscarDetalhesUnidade: async (unidadeId) => {
    try {
      console.log(`🔄 [API] Buscando detalhes da unidade ${unidadeId}...`);
      const response = await api.get(`/apartamento/${unidadeId}`);
      console.log('✅ [API] Detalhes da unidade carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao buscar detalhes da unidade:', error.response?.status, error.response?.data);
      handleError(error, 'buscarDetalhesUnidade');
    }
  },

  // Listar todos os usuários de uma unidade
  listarUsuariosUnidade: async (unidadeId) => {
    try {
      console.log(`🔄 [API] Listando usuários da unidade ${unidadeId}...`);
      const response = await api.get(`/apartamento/${unidadeId}/usuarios`);
      console.log('✅ [API] Usuários da unidade carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao listar usuários da unidade:', error.response?.status, error.response?.data);
      handleError(error, 'listarUsuariosUnidade');
    }
  },

  // Alterar senha do usuário
  alterarSenha: async (userId, senhaAtual, novaSenha) => {
    try {
      console.log(`🔄 [API] Alterando senha do usuário ${userId}...`);
      const response = await api.patch(`/usuario/${userId}/senha`, {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      });
      console.log('✅ [API] Senha alterada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao alterar senha:', error.response?.status, error.response?.data);
      handleError(error, 'alterarSenha');
    }
  },

  // Upload de foto de perfil
  uploadFotoPerfil: async (userId, fileUri) => {
    try {
      console.log(`🔄 [API] Fazendo upload da foto de perfil para usuário ${userId}...`);
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: `perfil_${userId}.jpg`,
      });
      
      const response = await api.post(`/usuario/${userId}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('✅ [API] Foto de perfil atualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao fazer upload da foto:', error.response?.status, error.response?.data);
      handleError(error, 'uploadFotoPerfil');
      return fileUri; // Fallback em caso de erro
    }
  },

  // === CONDOMÍNIO ===
  
  // Buscar informações do condomínio
  buscarCondominio: async (condominioId) => {
    try {
      console.log(`🔄 [API] Buscando informações do condomínio ${condominioId}...`);
      const response = await api.get(`/condominio/${condominioId}`);
      console.log('✅ [API] Condomínio carregado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao buscar condomínio:', error.response?.status, error.response?.data);
      handleError(error, 'buscarCondominio');
    }
  },

  // Listar todos os condomínios
  listarCondominios: async () => {
    try {
      console.log('🔄 [API] Listando condomínios...');
      const response = await api.get('/condominio');
      console.log('✅ [API] Condomínios carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao listar condomínios:', error.response?.status, error.response?.data);
      handleError(error, 'listarCondominios');
    }
  },

  // Criar novo condomínio (apenas admin/sindico)
  criarCondominio: async (dadosCondominio) => {
    try {
      console.log('🔄 [API] Criando novo condomínio...', dadosCondominio);
      const response = await api.post('/condominio', dadosCondominio);
      console.log('✅ [API] Condomínio criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao criar condomínio:', error.response?.status, error.response?.data);
      handleError(error, 'criarCondominio');
    }
  },

  // Atualizar informações do condomínio (apenas admin/sindico)
  atualizarCondominio: async (condominioId, dadosCondominio) => {
    try {
      console.log(`🔄 [API] Atualizando condomínio ${condominioId}...`, dadosCondominio);
      const response = await api.put(`/condominio/${condominioId}`, dadosCondominio);
      console.log('✅ [API] Condomínio atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao atualizar condomínio:', error.response?.status, error.response?.data);
      handleError(error, 'atualizarCondominio');
    }
  },

  // Deletar condomínio (apenas admin)
  deletarCondominio: async (condominioId) => {
    try {
      console.log(`🔄 [API] Deletando condomínio ${condominioId}...`);
      const response = await api.delete(`/condominio/${condominioId}`);
      console.log('✅ [API] Condomínio deletado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao deletar condomínio:', error.response?.status, error.response?.data);
      handleError(error, 'deletarCondominio');
    }
  },

  // Buscar estatísticas do condomínio
  buscarEstatisticasCondominio: async (condominioId) => {
    try {
      console.log(`🔄 [API] Buscando estatísticas do condomínio ${condominioId}...`);
      const response = await api.get(`/condominio/${condominioId}/estatisticas`);
      console.log('✅ [API] Estatísticas carregadas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] Erro ao buscar estatísticas:', error.response?.status, error.response?.data);
      handleError(error, 'buscarEstatisticasCondominio');
    }
  },
};
