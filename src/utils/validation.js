/**
 * Utilitários de validação de campos
 * Inclui validação de CPF, CNPJ, Email, Telefone, etc.
 */

/**
 * Remove caracteres não numéricos de uma string
 * @param {string} value - Valor a ser limpo
 * @returns {string} - Apenas números
 */
export const removeNonNumeric = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Valida CPF (Cadastro de Pessoa Física)
 * @param {string} cpf - CPF a ser validado (com ou sem formatação)
 * @returns {boolean} - true se válido
 */
export const validateCPF = (cpf) => {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cleanCPF = removeNonNumeric(cpf);

  // CPF deve ter exatamente 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // CPFs inválidos conhecidos (todos os dígitos iguais)
  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ];

  if (invalidCPFs.includes(cleanCPF)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  // Valida segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

/**
 * Valida CNPJ (Cadastro Nacional de Pessoa Jurídica)
 * @param {string} cnpj - CNPJ a ser validado (com ou sem formatação)
 * @returns {boolean} - true se válido
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;

  // Remove caracteres não numéricos
  const cleanCNPJ = removeNonNumeric(cnpj);

  // CNPJ deve ter exatamente 14 dígitos
  if (cleanCNPJ.length !== 14) return false;

  // CNPJs inválidos conhecidos (todos os dígitos iguais)
  const invalidCNPJs = [
    '00000000000000',
    '11111111111111',
    '22222222222222',
    '33333333333333',
    '44444444444444',
    '55555555555555',
    '66666666666666',
    '77777777777777',
    '88888888888888',
    '99999999999999',
  ];

  if (invalidCNPJs.includes(cleanCNPJ)) return false;

  // Validação dos dígitos verificadores
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  // Valida primeiro dígito
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  // Valida segundo dígito
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

/**
 * Valida Email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido
 */
export const validateEmail = (email) => {
  if (!email) return false;

  // Regex completo para validação de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
};

/**
 * Valida Telefone Brasileiro (Celular ou Fixo)
 * @param {string} phone - Telefone a ser validado (com ou sem formatação)
 * @returns {boolean} - true se válido
 */
export const validatePhone = (phone) => {
  if (!phone) return false;

  const cleanPhone = removeNonNumeric(phone);

  // Telefone fixo: 10 dígitos (XX) XXXX-XXXX
  // Celular: 11 dígitos (XX) 9XXXX-XXXX
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Verifica se o DDD é válido (11-99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  // Se for celular (11 dígitos), o terceiro dígito deve ser 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;

  return true;
};

/**
 * Valida CEP (Código de Endereçamento Postal)
 * @param {string} cep - CEP a ser validado (com ou sem formatação)
 * @returns {boolean} - true se válido
 */
export const validateCEP = (cep) => {
  if (!cep) return false;

  const cleanCEP = removeNonNumeric(cep);

  // CEP deve ter exatamente 8 dígitos
  if (cleanCEP.length !== 8) return false;

  // Verifica se não é um CEP inválido (todos os dígitos iguais)
  const allSame = cleanCEP.split('').every(digit => digit === cleanCEP[0]);
  if (allSame) return false;

  return true;
};

/**
 * Valida Nome Completo (mínimo 2 partes)
 * @param {string} name - Nome a ser validado
 * @returns {boolean} - true se válido
 */
export const validateFullName = (name) => {
  if (!name) return false;

  const trimmedName = name.trim();

  // Nome deve ter pelo menos 3 caracteres
  if (trimmedName.length < 3) return false;

  // Nome deve ter pelo menos nome e sobrenome
  const parts = trimmedName.split(/\s+/);
  if (parts.length < 2) return false;

  // Cada parte deve ter pelo menos 2 caracteres
  const allPartsValid = parts.every(part => part.length >= 2);
  if (!allPartsValid) return false;

  // Verifica se contém apenas letras e espaços (aceita acentos)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  return nameRegex.test(trimmedName);
};

/**
 * Valida Senha (mínimo 6 caracteres, pelo menos 1 letra e 1 número)
 * @param {string} password - Senha a ser validada
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { valid: false, errors: ['Senha é obrigatória'] };
  }

  if (password.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra');
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida Senha Forte (mínimo 8 caracteres, letra maiúscula, minúscula, número e caractere especial)
 * @param {string} password - Senha a ser validada
 * @returns {object} - { valid: boolean, errors: string[], strength: string }
 */
export const validateStrongPassword = (password) => {
  const errors = [];
  let strength = 'Fraca';

  if (!password) {
    return { valid: false, errors: ['Senha é obrigatória'], strength: 'Fraca' };
  }

  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  // Calcula força da senha
  if (errors.length === 0) {
    if (password.length >= 12) {
      strength = 'Muito Forte';
    } else if (password.length >= 10) {
      strength = 'Forte';
    } else {
      strength = 'Média';
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
};

/**
 * Valida Placa de Veículo (Mercosul e antiga)
 * @param {string} plate - Placa a ser validada
 * @returns {boolean} - true se válido
 */
export const validatePlate = (plate) => {
  if (!plate) return false;

  const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Placa antiga: ABC1234 (3 letras + 4 números)
  const oldPlateRegex = /^[A-Z]{3}\d{4}$/;

  // Placa Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
  const mercosulPlateRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  return oldPlateRegex.test(cleanPlate) || mercosulPlateRegex.test(cleanPlate);
};

/**
 * Valida Data (formato DD/MM/YYYY)
 * @param {string} date - Data a ser validada
 * @returns {boolean} - true se válido
 */
export const validateDate = (date) => {
  if (!date) return false;

  // Verifica formato básico
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(dateRegex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Verifica se os valores são válidos
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Verifica número de dias por mês
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Verifica ano bissexto
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
    daysInMonth[1] = 29;
  }

  return day <= daysInMonth[month - 1];
};

/**
 * Valida se a data é maior que 18 anos atrás (maioridade)
 * @param {string} date - Data no formato DD/MM/YYYY
 * @returns {boolean} - true se maior de 18
 */
export const validateAge18 = (date) => {
  if (!validateDate(date)) return false;

  const [day, month, year] = date.split('/').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }

  return age >= 18;
};

/**
 * Valida URL
 * @param {string} url - URL a ser validada
 * @returns {boolean} - true se válido
 */
export const validateURL = (url) => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Valida número de apartamento/unidade
 * @param {string} unit - Número da unidade
 * @returns {boolean} - true se válido
 */
export const validateUnit = (unit) => {
  if (!unit) return false;

  const trimmed = unit.trim();

  // Aceita números, letras e alguns caracteres especiais (ex: 101-A, 202B, etc)
  const unitRegex = /^[0-9A-Za-z\-\/]+$/;

  return unitRegex.test(trimmed) && trimmed.length >= 1 && trimmed.length <= 10;
};

/**
 * Valida campo obrigatório (não vazio)
 * @param {any} value - Valor a ser validado
 * @returns {boolean} - true se preenchido
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Valida comprimento mínimo
 * @param {string} value - Valor a ser validado
 * @param {number} min - Comprimento mínimo
 * @returns {boolean} - true se válido
 */
export const validateMinLength = (value, min) => {
  if (!value) return false;
  return value.trim().length >= min;
};

/**
 * Valida comprimento máximo
 * @param {string} value - Valor a ser validado
 * @param {number} max - Comprimento máximo
 * @returns {boolean} - true se válido
 */
export const validateMaxLength = (value, max) => {
  if (!value) return true; // Vazio é válido para max length
  return value.trim().length <= max;
};

/**
 * Formata CPF (XXX.XXX.XXX-XX)
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} - CPF formatado
 */
export const formatCPF = (cpf) => {
  const clean = removeNonNumeric(cpf);
  if (clean.length !== 11) return cpf;
  
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata CNPJ (XX.XXX.XXX/XXXX-XX)
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} - CNPJ formatado
 */
export const formatCNPJ = (cnpj) => {
  const clean = removeNonNumeric(cnpj);
  if (clean.length !== 14) return cnpj;
  
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata Telefone ((XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
 * @param {string} phone - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
export const formatPhone = (phone) => {
  const clean = removeNonNumeric(phone);
  
  if (clean.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (clean.length > 0) {
    // Formatação progressiva enquanto digita
    if (clean.length <= 2) {
      return `(${clean}`;
    } else if (clean.length <= 7) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    } else if (clean.length <= 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
  }
  
  return phone;
};

/**
 * Formata CEP (XXXXX-XXX)
 * @param {string} cep - CEP a ser formatado
 * @returns {string} - CEP formatado
 */
export const formatCEP = (cep) => {
  const clean = removeNonNumeric(cep);
  if (clean.length !== 8) return cep;
  
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formata Placa de Veículo (ABC-1234 ou ABC1D23)
 * @param {string} plate - Placa a ser formatada
 * @returns {string} - Placa formatada
 */
export const formatPlate = (plate) => {
  const clean = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Placa antiga: ABC-1234
  if (/^[A-Z]{3}\d{4}$/.test(clean)) {
    return clean.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  }
  
  // Placa Mercosul: ABC1D23 (sem formatação adicional)
  return clean;
};

/**
 * Formata um valor monetário para o padrão brasileiro (R$)
 * @param {string|number} value - Valor a ser formatado
 * @returns {string} - Valor formatado (ex: "R$ 1.234,56")
 * 
 * @example
 * formatMoney('123456') // 'R$ 1.234,56'
 * formatMoney(1234.56) // 'R$ 1.234,56'
 */
export const formatMoney = (value) => {
  if (!value && value !== 0) return '';
  
  // Remove tudo exceto números
  const numbers = String(value).replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  
  // Converte para centavos
  const cents = parseInt(numbers, 10);
  
  // Formata com separadores
  const formatted = (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatted;
};

/**
 * Formata uma data para o padrão DD/MM/YYYY
 * @param {string} value - Data a ser formatada (somente números)
 * @returns {string} - Data formatada (ex: "31/12/2023")
 * 
 * @example
 * formatDate('31122023') // '31/12/2023'
 * formatDate('010120') // '01/01/2020'
 */
export const formatDate = (value) => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 2) {
    return numbers;
  }
  
  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }
  
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

/**
 * Remove a formatação de um valor monetário
 * @param {string} value - Valor formatado
 * @returns {number} - Valor numérico
 * 
 * @example
 * unformatMoney('R$ 1.234,56') // 1234.56
 */
export const unformatMoney = (value) => {
  if (!value) return 0;
  
  const numbers = String(value).replace(/\D/g, '');
  return parseInt(numbers, 10) / 100;
};

/**
 * Formata um valor percentual
 * @param {string|number} value - Valor a ser formatado
 * @returns {string} - Valor formatado (ex: "25,5%")
 * 
 * @example
 * formatPercentage('255') // '25,5%'
 * formatPercentage(50) // '50%'
 */
export const formatPercentage = (value) => {
  if (!value && value !== 0) return '';
  
  const numbers = String(value).replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  
  const num = parseInt(numbers, 10);
  
  if (num >= 1000) {
    return '100%';
  }
  
  if (num >= 100) {
    return `${Math.floor(num / 10)},${num % 10}%`;
  }
  
  return `${num}%`;
};

// Export default com todas as funções
export default {
  // Validações
  validateCPF,
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateCEP,
  validateFullName,
  validatePassword,
  validateStrongPassword,
  validatePlate,
  validateDate,
  validateAge18,
  validateURL,
  validateUnit,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  
  // Formatações
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  formatPlate,
  formatMoney,
  formatDate,
  formatPercentage,
  
  // Utilitários
  removeNonNumeric,
  unformatMoney,
};
