const API_BASE_URL = 'http://10.67.23.46:3333';

export const api = {
  // Ocorrências
  criarOcorrencia: async (dados, token) => {
    try {
      console.log('🔄 Criando nova ocorrência...');
      console.log('📋 Dados enviados:', JSON.stringify(dados, null, 2));
      console.log('🔑 Token:', token ? 'presente' : 'ausente');
      
      const corpoRequisicao = {
        userap_id: dados.user_id,
        oco_categoria: dados.categoria,
        oco_descricao: dados.descricao,
        oco_localizacao: dados.local,
        oco_prioridade: dados.prioridade,
        oco_status: 'Aberta',
        oco_imagem: dados.anexos?.length > 0 ? dados.anexos[0] : null,
      };

      console.log('🔄 Corpo da requisição formatado:', JSON.stringify(corpoRequisicao, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/ocorrencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(corpoRequisicao),
      });

      console.log('📡 Status da criação:', response.status);
      const data = await response.json();
      console.log('📦 Resposta da criação:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao criar ocorrência');
      }
      return data.dados || data;
    } catch (error) {
      console.error('API Error - criarOcorrencia:', error);
      throw error;
    }
  },
  buscarOcorrencias: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ocorrencias`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao buscar ocorrências');
      }
      return data.dados || [];
    } catch (error) {
      console.error('API Error - buscarOcorrencias:', error);
      throw error;
    }
  },
  uploadAnexo: async (fileUri, token) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'anexo.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Adicionado token para consistência
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro no upload');
      }
      return data.url || data.dados || fileUri;
    } catch (error) {
      console.error('API Error - uploadAnexo:', error);
      return fileUri; // Fallback
    }
  },
  adicionarComentario: async (ocorrenciaId, comentario, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ocorrencias/${ocorrenciaId}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ texto: comentario }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao adicionar comentário');
      }
      return data.dados;
    } catch (error) {
      console.error('API Error - adicionarComentario:', error);
      throw error;
    }
  },

  // Encomendas
  getEncomendas: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/encomendas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao buscar encomendas');
      }
      return data.dados || [];
    } catch (error) {
      console.error('API Error - getEncomendas:', error);
      throw error;
    }
  },

  marcarEncomendaComoEntregue: async (encomendaId, retiradoPor, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/encomendas/${encomendaId}/entregar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ retirado_por: retiradoPor }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao marcar como entregue');
      }
      return data.dados;
    } catch (error) {
      console.error('API Error - marcarEncomendaComoEntregue:', error);
      throw error;
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Usuario/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: email,
          user_senha: password,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.sucesso) {
        throw new Error(data.mensagem || 'E-mail ou senha inválidos.');
      }
      // Adicionando um token temporário se não vier da API
      const userData = {
        ...data.dados,
        token: data.dados.token || 'temp_token_' + Date.now()
      };
      return userData;
    } catch (error) {
      console.error('API Error - login:', error);
      throw error;
    }
  },
};
