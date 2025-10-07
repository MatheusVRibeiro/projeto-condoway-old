import {
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
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  formatPlate,
  removeNonNumeric,
} from '../../utils/validation';

describe('Validação de Campos', () => {
  
  describe('validateCPF', () => {
    it('deve validar CPF válido sem formatação', () => {
      expect(validateCPF('12345678909')).toBe(true);
      expect(validateCPF('11144477735')).toBe(true);
      expect(validateCPF('52998224725')).toBe(true);
    });

    it('deve validar CPF válido com formatação', () => {
      expect(validateCPF('123.456.789-09')).toBe(true);
      expect(validateCPF('111.444.777-35')).toBe(true);
      expect(validateCPF('529.982.247-25')).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      expect(validateCPF('12345678901')).toBe(false); // Dígito verificador errado
      expect(validateCPF('11111111111')).toBe(false); // Todos os dígitos iguais
      expect(validateCPF('00000000000')).toBe(false); // Todos zeros
      expect(validateCPF('123')).toBe(false); // Muito curto
      expect(validateCPF('123456789012')).toBe(false); // Muito longo
    });

    it('deve rejeitar CPF vazio ou nulo', () => {
      expect(validateCPF('')).toBe(false);
      expect(validateCPF(null)).toBe(false);
      expect(validateCPF(undefined)).toBe(false);
    });

    it('deve rejeitar CPFs conhecidos como inválidos', () => {
      expect(validateCPF('22222222222')).toBe(false);
      expect(validateCPF('33333333333')).toBe(false);
      expect(validateCPF('44444444444')).toBe(false);
      expect(validateCPF('55555555555')).toBe(false);
      expect(validateCPF('66666666666')).toBe(false);
      expect(validateCPF('77777777777')).toBe(false);
      expect(validateCPF('88888888888')).toBe(false);
      expect(validateCPF('99999999999')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    it('deve validar CNPJ válido sem formatação', () => {
      expect(validateCNPJ('11222333000181')).toBe(true);
      expect(validateCNPJ('11444777000161')).toBe(true);
    });

    it('deve validar CNPJ válido com formatação', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validateCNPJ('11.444.777/0001-61')).toBe(true);
    });

    it('deve rejeitar CNPJ inválido', () => {
      expect(validateCNPJ('11222333000180')).toBe(false); // Dígito verificador errado
      expect(validateCNPJ('11111111111111')).toBe(false); // Todos os dígitos iguais
      expect(validateCNPJ('00000000000000')).toBe(false); // Todos zeros
      expect(validateCNPJ('123')).toBe(false); // Muito curto
    });

    it('deve rejeitar CNPJ vazio ou nulo', () => {
      expect(validateCNPJ('')).toBe(false);
      expect(validateCNPJ(null)).toBe(false);
      expect(validateCNPJ(undefined)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('deve validar email válido', () => {
      expect(validateEmail('usuario@exemplo.com')).toBe(true);
      expect(validateEmail('teste.usuario@empresa.com.br')).toBe(true);
      expect(validateEmail('contato@email.co')).toBe(true);
      expect(validateEmail('admin+tag@domain.com')).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      expect(validateEmail('usuario')).toBe(false);
      expect(validateEmail('usuario@')).toBe(false);
      expect(validateEmail('@exemplo.com')).toBe(false);
      expect(validateEmail('usuario@exemplo')).toBe(false);
      expect(validateEmail('usuario @exemplo.com')).toBe(false);
      expect(validateEmail('usuario@exemplo .com')).toBe(false);
    });

    it('deve rejeitar email vazio ou nulo', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('deve validar telefone celular válido', () => {
      expect(validatePhone('11987654321')).toBe(true); // 11 dígitos
      expect(validatePhone('(11) 98765-4321')).toBe(true); // Formatado
      expect(validatePhone('21987654321')).toBe(true);
    });

    it('deve validar telefone fixo válido', () => {
      expect(validatePhone('1133334444')).toBe(true); // 10 dígitos
      expect(validatePhone('(11) 3333-4444')).toBe(true); // Formatado
      expect(validatePhone('2133334444')).toBe(true);
    });

    it('deve rejeitar telefone inválido', () => {
      expect(validatePhone('123')).toBe(false); // Muito curto
      expect(validatePhone('12345678901234')).toBe(false); // Muito longo
      expect(validatePhone('01987654321')).toBe(false); // DDD inválido (< 11)
      expect(validatePhone('11887654321')).toBe(false); // Celular sem 9 no início
    });

    it('deve rejeitar telefone vazio ou nulo', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone(null)).toBe(false);
      expect(validatePhone(undefined)).toBe(false);
    });
  });

  describe('validateCEP', () => {
    it('deve validar CEP válido', () => {
      expect(validateCEP('01310100')).toBe(true);
      expect(validateCEP('01310-100')).toBe(true);
      expect(validateCEP('12345-678')).toBe(true);
    });

    it('deve rejeitar CEP inválido', () => {
      expect(validateCEP('123')).toBe(false); // Muito curto
      expect(validateCEP('123456789')).toBe(false); // Muito longo
      expect(validateCEP('00000000')).toBe(false); // Todos os dígitos iguais
      expect(validateCEP('11111111')).toBe(false);
    });

    it('deve rejeitar CEP vazio ou nulo', () => {
      expect(validateCEP('')).toBe(false);
      expect(validateCEP(null)).toBe(false);
      expect(validateCEP(undefined)).toBe(false);
    });
  });

  describe('validateFullName', () => {
    it('deve validar nome completo válido', () => {
      expect(validateFullName('João Silva')).toBe(true);
      expect(validateFullName('Maria da Silva')).toBe(true);
      expect(validateFullName('José Carlos de Souza')).toBe(true);
      expect(validateFullName('Ana Paula')).toBe(true);
    });

    it('deve rejeitar nome inválido', () => {
      expect(validateFullName('João')).toBe(false); // Apenas um nome
      expect(validateFullName('J Silva')).toBe(false); // Nome muito curto
      expect(validateFullName('João S')).toBe(false); // Sobrenome muito curto
      expect(validateFullName('João123')).toBe(false); // Com números
      expect(validateFullName('João@Silva')).toBe(false); // Caractere especial
    });

    it('deve rejeitar nome vazio ou nulo', () => {
      expect(validateFullName('')).toBe(false);
      expect(validateFullName(null)).toBe(false);
      expect(validateFullName(undefined)).toBe(false);
      expect(validateFullName('  ')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('deve validar senha válida', () => {
      const result1 = validatePassword('senha123');
      expect(result1.valid).toBe(true);
      expect(result1.errors).toHaveLength(0);

      const result2 = validatePassword('abc123def');
      expect(result2.valid).toBe(true);
      expect(result2.errors).toHaveLength(0);
    });

    it('deve rejeitar senha muito curta', () => {
      const result = validatePassword('abc12');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Senha deve ter no mínimo 6 caracteres');
    });

    it('deve rejeitar senha sem letra', () => {
      const result = validatePassword('123456');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra');
    });

    it('deve rejeitar senha sem número', () => {
      const result = validatePassword('abcdef');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos um número');
    });

    it('deve rejeitar senha vazia ou nula', () => {
      const result1 = validatePassword('');
      expect(result1.valid).toBe(false);
      expect(result1.errors).toContain('Senha é obrigatória');

      const result2 = validatePassword(null);
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain('Senha é obrigatória');
    });
  });

  describe('validateStrongPassword', () => {
    it('deve validar senha forte', () => {
      const result = validateStrongPassword('Senha@123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.strength).toBe('Média');
    });

    it('deve validar senha muito forte', () => {
      const result = validateStrongPassword('SenhaForte@123456');
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('Muito Forte');
    });

    it('deve rejeitar senha sem maiúscula', () => {
      const result = validateStrongPassword('senha@123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra maiúscula');
    });

    it('deve rejeitar senha sem minúscula', () => {
      const result = validateStrongPassword('SENHA@123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra minúscula');
    });

    it('deve rejeitar senha sem caractere especial', () => {
      const result = validateStrongPassword('Senha123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos um caractere especial');
    });
  });

  describe('validatePlate', () => {
    it('deve validar placa antiga válida', () => {
      expect(validatePlate('ABC1234')).toBe(true);
      expect(validatePlate('abc1234')).toBe(true); // Minúscula
      expect(validatePlate('ABC-1234')).toBe(true); // Com hífen
    });

    it('deve validar placa Mercosul válida', () => {
      expect(validatePlate('ABC1D23')).toBe(true);
      expect(validatePlate('abc1d23')).toBe(true); // Minúscula
    });

    it('deve rejeitar placa inválida', () => {
      expect(validatePlate('ABC123')).toBe(false); // Muito curta
      expect(validatePlate('ABCD1234')).toBe(false); // Formato errado
      expect(validatePlate('1234ABC')).toBe(false); // Ordem invertida
    });

    it('deve rejeitar placa vazia ou nula', () => {
      expect(validatePlate('')).toBe(false);
      expect(validatePlate(null)).toBe(false);
      expect(validatePlate(undefined)).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('deve validar data válida', () => {
      expect(validateDate('01/01/2020')).toBe(true);
      expect(validateDate('31/12/2023')).toBe(true);
      expect(validateDate('29/02/2020')).toBe(true); // Ano bissexto
      expect(validateDate('15/06/1990')).toBe(true);
    });

    it('deve rejeitar data inválida', () => {
      expect(validateDate('32/01/2020')).toBe(false); // Dia inválido
      expect(validateDate('01/13/2020')).toBe(false); // Mês inválido
      expect(validateDate('29/02/2021')).toBe(false); // Não é bissexto
      expect(validateDate('31/04/2020')).toBe(false); // Abril tem 30 dias
      expect(validateDate('00/01/2020')).toBe(false); // Dia zero
      expect(validateDate('01/00/2020')).toBe(false); // Mês zero
    });

    it('deve rejeitar formato inválido', () => {
      expect(validateDate('2020-01-01')).toBe(false);
      expect(validateDate('1/1/2020')).toBe(false); // Sem zero à esquerda
      expect(validateDate('01-01-2020')).toBe(false); // Hífen ao invés de barra
    });

    it('deve rejeitar data vazia ou nula', () => {
      expect(validateDate('')).toBe(false);
      expect(validateDate(null)).toBe(false);
      expect(validateDate(undefined)).toBe(false);
    });
  });

  describe('validateAge18', () => {
    it('deve validar maior de 18 anos', () => {
      const date20YearsAgo = new Date();
      date20YearsAgo.setFullYear(date20YearsAgo.getFullYear() - 20);
      const dateStr = `${String(date20YearsAgo.getDate()).padStart(2, '0')}/${String(date20YearsAgo.getMonth() + 1).padStart(2, '0')}/${date20YearsAgo.getFullYear()}`;
      expect(validateAge18(dateStr)).toBe(true);
    });

    it('deve rejeitar menor de 18 anos', () => {
      const date15YearsAgo = new Date();
      date15YearsAgo.setFullYear(date15YearsAgo.getFullYear() - 15);
      const dateStr = `${String(date15YearsAgo.getDate()).padStart(2, '0')}/${String(date15YearsAgo.getMonth() + 1).padStart(2, '0')}/${date15YearsAgo.getFullYear()}`;
      expect(validateAge18(dateStr)).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('deve validar URL válida', () => {
      expect(validateURL('https://www.exemplo.com')).toBe(true);
      expect(validateURL('http://exemplo.com')).toBe(true);
      expect(validateURL('https://exemplo.com.br/path?query=1')).toBe(true);
    });

    it('deve rejeitar URL inválida', () => {
      expect(validateURL('www.exemplo.com')).toBe(false); // Sem protocolo
      expect(validateURL('ftp://exemplo.com')).toBe(false); // Protocolo inválido
      expect(validateURL('exemplo.com')).toBe(false);
    });

    it('deve rejeitar URL vazia ou nula', () => {
      expect(validateURL('')).toBe(false);
      expect(validateURL(null)).toBe(false);
      expect(validateURL(undefined)).toBe(false);
    });
  });

  describe('validateUnit', () => {
    it('deve validar número de unidade válido', () => {
      expect(validateUnit('101')).toBe(true);
      expect(validateUnit('202A')).toBe(true);
      expect(validateUnit('303-B')).toBe(true);
      expect(validateUnit('404/C')).toBe(true);
    });

    it('deve rejeitar unidade inválida', () => {
      expect(validateUnit('')).toBe(false);
      expect(validateUnit('101@')).toBe(false); // Caractere especial inválido
      expect(validateUnit('12345678901')).toBe(false); // Muito longo
    });
  });

  describe('validateRequired', () => {
    it('deve validar campo preenchido', () => {
      expect(validateRequired('texto')).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(['item'])).toBe(true);
      expect(validateRequired(true)).toBe(true);
    });

    it('deve rejeitar campo vazio', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('  ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
      expect(validateRequired([])).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    it('deve validar comprimento mínimo', () => {
      expect(validateMinLength('12345', 5)).toBe(true);
      expect(validateMinLength('123456', 5)).toBe(true);
    });

    it('deve rejeitar comprimento menor que o mínimo', () => {
      expect(validateMinLength('1234', 5)).toBe(false);
      expect(validateMinLength('', 1)).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('deve validar comprimento máximo', () => {
      expect(validateMaxLength('12345', 5)).toBe(true);
      expect(validateMaxLength('1234', 5)).toBe(true);
      expect(validateMaxLength('', 5)).toBe(true); // Vazio é válido
    });

    it('deve rejeitar comprimento maior que o máximo', () => {
      expect(validateMaxLength('123456', 5)).toBe(false);
    });
  });

  describe('Formatações', () => {
    describe('formatCPF', () => {
      it('deve formatar CPF corretamente', () => {
        expect(formatCPF('12345678909')).toBe('123.456.789-09');
        expect(formatCPF('11144477735')).toBe('111.444.777-35');
      });

      it('deve manter CPF já formatado', () => {
        expect(formatCPF('123.456.789-09')).toBe('123.456.789-09');
      });

      it('não deve formatar CPF inválido', () => {
        expect(formatCPF('123')).toBe('123');
      });
    });

    describe('formatCNPJ', () => {
      it('deve formatar CNPJ corretamente', () => {
        expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
      });

      it('não deve formatar CNPJ inválido', () => {
        expect(formatCNPJ('123')).toBe('123');
      });
    });

    describe('formatPhone', () => {
      it('deve formatar telefone celular', () => {
        expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
      });

      it('deve formatar telefone fixo', () => {
        expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
      });

      it('não deve formatar telefone inválido', () => {
        expect(formatPhone('123')).toBe('123');
      });
    });

    describe('formatCEP', () => {
      it('deve formatar CEP corretamente', () => {
        expect(formatCEP('01310100')).toBe('01310-100');
      });

      it('não deve formatar CEP inválido', () => {
        expect(formatCEP('123')).toBe('123');
      });
    });

    describe('formatPlate', () => {
      it('deve formatar placa antiga', () => {
        expect(formatPlate('ABC1234')).toBe('ABC-1234');
      });

      it('deve manter placa Mercosul sem formatação', () => {
        expect(formatPlate('ABC1D23')).toBe('ABC1D23');
      });
    });
  });

  describe('removeNonNumeric', () => {
    it('deve remover caracteres não numéricos', () => {
      expect(removeNonNumeric('123.456.789-09')).toBe('12345678909');
      expect(removeNonNumeric('(11) 98765-4321')).toBe('11987654321');
      expect(removeNonNumeric('abc123def456')).toBe('123456');
    });

    it('deve retornar string vazia se null', () => {
      expect(removeNonNumeric(null)).toBe('');
      expect(removeNonNumeric('')).toBe('');
    });
  });
});
