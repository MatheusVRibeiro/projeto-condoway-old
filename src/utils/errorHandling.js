/**
 * Mapeia mensagens de erro técnicas para mensagens amigáveis ao usuário
 */

export const errorMessages = {
  // Erros de Rede
  'Network Error': 'Erro de conexão. Verifique sua internet.',
  'timeout': 'A requisição demorou muito. Tente novamente.',
  'ECONNREFUSED': 'Servidor indisponível. Tente novamente mais tarde.',
  
  // Erros de Autenticação
  'jwt expired': 'Sua sessão expirou. Faça login novamente.',
  'Token inválido': 'Sessão inválida. Faça login novamente.',
  'Unauthorized': 'Acesso não autorizado.',
  'Invalid credentials': 'Email ou senha incorretos.',
  
  // Erros de Validação
  'Validation error': 'Dados inválidos. Verifique os campos.',
  'Email already exists': 'Este email já está cadastrado.',
  'CPF already exists': 'Este CPF já está cadastrado.',
  'Phone already exists': 'Este telefone já está cadastrado.',
  
  // Erros Gerais
  'Not found': 'Recurso não encontrado.',
  'Bad request': 'Requisição inválida.',
  'Internal server error': 'Erro no servidor. Tente novamente mais tarde.',
  'Service unavailable': 'Serviço temporariamente indisponível.',
};

/**
 * Obtém mensagem de erro amigável a partir de um erro técnico
 * @param {Error|string} error - Erro capturado ou mensagem de erro
 * @returns {string} - Mensagem amigável ao usuário
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) return 'Erro desconhecido. Tente novamente.';
  
  // Se for string, buscar diretamente
  if (typeof error === 'string') {
    return errorMessages[error] || error;
  }
  
  // Se for objeto Error
  const errorMessage = error.message || error.response?.data?.mensagem || error.response?.data?.message || '';
  const errorCode = error.code;
  const statusCode = error.response?.status || error.statusCode;
  
  // Verificar se há mensagem específica para o código de erro
  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }
  
  // Verificar se há mensagem específica para a mensagem de erro
  for (const [key, value] of Object.entries(errorMessages)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Mensagens padrão por status code
  if (statusCode) {
    switch (statusCode) {
      case 400:
        return 'Dados inválidos. Verifique os campos.';
      case 401:
        return 'Sessão inválida. Faça login novamente.';
      case 403:
        return 'Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 408:
        return 'Tempo esgotado. Tente novamente.';
      case 429:
        return 'Muitas requisições. Aguarde um momento.';
      case 500:
        return 'Erro no servidor. Tente novamente mais tarde.';
      case 503:
        return 'Serviço temporariamente indisponível.';
      default:
        return errorMessage || 'Erro desconhecido. Tente novamente.';
    }
  }
  
  // Fallback: mensagem original ou genérica
  return errorMessage || 'Erro desconhecido. Tente novamente.';
};

/**
 * Helper para exibir toast com mensagem de erro amigável
 * @param {object} Toast - Instância do Toast (react-native-toast-message)
 * @param {Error|string} error - Erro capturado
 * @param {string} defaultTitle - Título padrão (opcional)
 */
export const showErrorToast = (Toast, error, defaultTitle = 'Erro') => {
  const friendlyMessage = getFriendlyErrorMessage(error);
  
  Toast.show({
    type: 'error',
    text1: defaultTitle,
    text2: friendlyMessage,
    position: 'top',
    visibilityTime: 4000,
  });
};

export default {
  errorMessages,
  getFriendlyErrorMessage,
  showErrorToast,
};
