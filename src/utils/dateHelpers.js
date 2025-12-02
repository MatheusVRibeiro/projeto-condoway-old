/**
 * Utilitários seguros para manipulação de datas (date-fns wrappers com validação)
 */
import { parseISO as dateFnsParseISO, format as dateFnsFormat, isValid } from 'date-fns';

/**
 * Wrapper seguro para parseISO com validação
 * @param {string} dateString - String ISO da data
 * @param {any} fallback - Valor de fallback se a data for inválida (default: null)
 * @returns {Date|null} - Data parseada ou fallback
 */
export const safeParseISO = (dateString, fallback = null) => {
  if (!dateString || typeof dateString !== 'string') {
    console.warn('[safeParseISO] Data inválida recebida:', dateString);
    return fallback;
  }
  
  try {
    const parsed = dateFnsParseISO(dateString);
    if (!isValid(parsed)) {
      console.warn('[safeParseISO] Data parseada é inválida:', dateString);
      return fallback;
    }
    return parsed;
  } catch (error) {
    console.error('[safeParseISO] Erro ao parsear data:', error, 'Input:', dateString);
    return fallback;
  }
};

/**
 * Wrapper seguro para format com validação
 * @param {Date|string|number} date - Data a ser formatada
 * @param {string} formatString - String de formato (ex: 'dd/MM/yyyy')
 * @param {string} fallback - Valor de fallback se a data for inválida (default: '-')
 * @returns {string} - Data formatada ou fallback
 */
export const safeFormat = (date, formatString, fallback = '-') => {
  if (!date) {
    console.warn('[safeFormat] Data vazia recebida');
    return fallback;
  }
  
  try {
    // Se for string, tentar parsear como ISO
    if (typeof date === 'string') {
      date = safeParseISO(date);
      if (!date) return fallback;
    }
    
    // Verificar se é uma data válida
    if (!isValid(date)) {
      console.warn('[safeFormat] Data inválida:', date);
      return fallback;
    }
    
    return dateFnsFormat(date, formatString);
  } catch (error) {
    console.error('[safeFormat] Erro ao formatar data:', error, 'Input:', date, 'Format:', formatString);
    return fallback;
  }
};

/**
 * Valida se um valor é uma data válida
 * @param {any} date - Valor a ser validado
 * @returns {boolean} - true se for uma data válida
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    if (typeof date === 'string') {
      date = safeParseISO(date);
    }
    return isValid(date);
  } catch {
    return false;
  }
};

export default {
  safeParseISO,
  safeFormat,
  isValidDate,
};
