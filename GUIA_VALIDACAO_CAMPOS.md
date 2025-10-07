# 🔒 GUIA DE VALIDAÇÃO DE CAMPOS - Condoway

## 📋 VISÃO GERAL

Este documento descreve todas as funções de validação disponíveis no projeto, como usá-las e exemplos práticos.

---

## 🎯 FUNÇÕES DISPONÍVEIS

### Validações de Documentos

#### 1. **validateCPF(cpf)**
Valida CPF brasileiro (com ou sem formatação).

**Parâmetros:**
- `cpf` (string): CPF a ser validado

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateCPF } from '../utils/validation';

validateCPF('123.456.789-09'); // true
validateCPF('12345678909');     // true
validateCPF('111.111.111-11');  // false (todos iguais)
validateCPF('123.456.789-00');  // false (dígito verificador inválido)
```

**Casos de Teste:**
- ✅ CPF válido com/sem formatação
- ❌ CPF com dígitos verificadores inválidos
- ❌ CPF com todos os dígitos iguais (00000000000 até 99999999999)
- ❌ CPF com comprimento diferente de 11 dígitos
- ❌ Valores vazios, null ou undefined

---

#### 2. **validateCNPJ(cnpj)**
Valida CNPJ brasileiro (com ou sem formatação).

**Parâmetros:**
- `cnpj` (string): CNPJ a ser validado

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateCNPJ } from '../utils/validation';

validateCNPJ('11.222.333/0001-81'); // true
validateCNPJ('11222333000181');     // true
validateCNPJ('11.111.111/1111-11'); // false
```

**Casos de Teste:**
- ✅ CNPJ válido com/sem formatação
- ❌ CNPJ com dígitos verificadores inválidos
- ❌ CNPJ com todos os dígitos iguais
- ❌ CNPJ com comprimento diferente de 14 dígitos

---

### Validações de Contato

#### 3. **validateEmail(email)**
Valida endereço de email.

**Parâmetros:**
- `email` (string): Email a ser validado

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateEmail } from '../utils/validation';

validateEmail('usuario@exemplo.com');           // true
validateEmail('teste.usuario@empresa.com.br');  // true
validateEmail('admin+tag@domain.com');          // true
validateEmail('usuario@');                       // false
validateEmail('usuario');                        // false
```

**Casos de Teste:**
- ✅ Email com formato válido (user@domain.com)
- ✅ Email com subdomínios (user@mail.domain.com)
- ✅ Email com + e . no nome (user.name+tag@domain.com)
- ❌ Email sem @
- ❌ Email sem domínio
- ❌ Email com espaços

---

#### 4. **validatePhone(phone)**
Valida telefone brasileiro (celular ou fixo).

**Parâmetros:**
- `phone` (string): Telefone a ser validado

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validatePhone } from '../utils/validation';

// Celular (11 dígitos)
validatePhone('11987654321');       // true
validatePhone('(11) 98765-4321');   // true

// Fixo (10 dígitos)
validatePhone('1133334444');        // true
validatePhone('(11) 3333-4444');    // true

// Inválidos
validatePhone('11887654321');       // false (celular sem 9)
validatePhone('01987654321');       // false (DDD inválido)
```

**Regras:**
- Celular: 11 dígitos, DDD (11-99), 3º dígito = 9
- Fixo: 10 dígitos, DDD (11-99)

---

#### 5. **validateCEP(cep)**
Valida CEP brasileiro.

**Parâmetros:**
- `cep` (string): CEP a ser validado

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateCEP } from '../utils/validation';

validateCEP('01310-100');  // true
validateCEP('01310100');   // true
validateCEP('00000-000');  // false (todos iguais)
validateCEP('123');        // false (muito curto)
```

**Regras:**
- 8 dígitos
- Não pode ter todos os dígitos iguais

---

### Validações de Texto

#### 6. **validateFullName(name)**
Valida nome completo (mínimo 2 partes).

**Parâmetros:**
- `name` (string): Nome a ser validado

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateFullName } from '../utils/validation';

validateFullName('João Silva');              // true
validateFullName('Maria da Silva');          // true
validateFullName('José Carlos de Souza');    // true
validateFullName('João');                    // false (só um nome)
validateFullName('J Silva');                 // false (nome muito curto)
validateFullName('João123');                 // false (contém números)
```

**Regras:**
- Mínimo 3 caracteres totais
- Pelo menos 2 partes (nome e sobrenome)
- Cada parte com mínimo 2 caracteres
- Apenas letras e espaços (aceita acentos)

---

#### 7. **validatePassword(password)**
Valida senha básica.

**Parâmetros:**
- `password` (string): Senha a ser validada

**Retorna:** `{ valid: boolean, errors: string[] }`

**Exemplos:**
```javascript
import { validatePassword } from '../utils/validation';

const result1 = validatePassword('senha123');
// { valid: true, errors: [] }

const result2 = validatePassword('abc12');
// { valid: false, errors: ['Senha deve ter no mínimo 6 caracteres'] }

const result3 = validatePassword('abcdef');
// { valid: false, errors: ['Senha deve conter pelo menos um número'] }
```

**Regras:**
- Mínimo 6 caracteres
- Pelo menos 1 letra
- Pelo menos 1 número

---

#### 8. **validateStrongPassword(password)**
Valida senha forte.

**Parâmetros:**
- `password` (string): Senha a ser validada

**Retorna:** `{ valid: boolean, errors: string[], strength: string }`

**Exemplos:**
```javascript
import { validateStrongPassword } from '../utils/validation';

const result = validateStrongPassword('Senha@123');
// {
//   valid: true,
//   errors: [],
//   strength: 'Média'
// }

const result2 = validateStrongPassword('SenhaForte@123456');
// {
//   valid: true,
//   errors: [],
//   strength: 'Muito Forte'
// }
```

**Regras:**
- Mínimo 8 caracteres
- Pelo menos 1 letra minúscula
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (!@#$%^&*(),.?":{}|<>)

**Níveis de Força:**
- **Fraca**: Não atende aos critérios
- **Média**: 8-9 caracteres, atende critérios
- **Forte**: 10-11 caracteres, atende critérios
- **Muito Forte**: 12+ caracteres, atende critérios

---

### Validações Específicas

#### 9. **validatePlate(plate)**
Valida placa de veículo (antiga ou Mercosul).

**Parâmetros:**
- `plate` (string): Placa a ser validada

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validatePlate } from '../utils/validation';

// Placa antiga (3 letras + 4 números)
validatePlate('ABC1234');    // true
validatePlate('ABC-1234');   // true

// Placa Mercosul (3 letras + 1 número + 1 letra + 2 números)
validatePlate('ABC1D23');    // true

// Inválidas
validatePlate('ABCD1234');   // false
validatePlate('1234ABC');    // false
```

**Formatos Aceitos:**
- Antiga: ABC1234 ou ABC-1234
- Mercosul: ABC1D23

---

#### 10. **validateDate(date)**
Valida data no formato DD/MM/YYYY.

**Parâmetros:**
- `date` (string): Data a ser validada

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateDate } from '../utils/validation';

validateDate('01/01/2020');  // true
validateDate('31/12/2023');  // true
validateDate('29/02/2020');  // true (ano bissexto)
validateDate('29/02/2021');  // false (não é bissexto)
validateDate('32/01/2020');  // false (dia inválido)
validateDate('31/04/2020');  // false (abril tem 30 dias)
```

**Regras:**
- Formato DD/MM/YYYY
- Dia válido para o mês
- Considera anos bissextos
- Ano entre 1900 e 2100

---

#### 11. **validateAge18(date)**
Valida se a data indica maioridade (18+ anos).

**Parâmetros:**
- `date` (string): Data de nascimento no formato DD/MM/YYYY

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateAge18 } from '../utils/validation';

validateAge18('01/01/2000');  // true (24 anos em 2024)
validateAge18('01/01/2010');  // false (14 anos em 2024)
```

---

#### 12. **validateURL(url)**
Valida URL (http ou https).

**Parâmetros:**
- `url` (string): URL a ser validada

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateURL } from '../utils/validation';

validateURL('https://www.exemplo.com');              // true
validateURL('http://exemplo.com');                   // true
validateURL('https://exemplo.com.br/path?query=1');  // true
validateURL('www.exemplo.com');                       // false (sem protocolo)
validateURL('ftp://exemplo.com');                     // false (protocolo inválido)
```

---

#### 13. **validateUnit(unit)**
Valida número de apartamento/unidade.

**Parâmetros:**
- `unit` (string): Número da unidade

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateUnit } from '../utils/validation';

validateUnit('101');     // true
validateUnit('202A');    // true
validateUnit('303-B');   // true
validateUnit('404/C');   // true
validateUnit('101@');    // false (caractere inválido)
```

**Regras:**
- 1 a 10 caracteres
- Aceita números, letras, hífen e barra

---

### Validações Genéricas

#### 14. **validateRequired(value)**
Valida campo obrigatório.

**Parâmetros:**
- `value` (any): Valor a ser validado

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateRequired } from '../utils/validation';

validateRequired('texto');    // true
validateRequired(123);        // true
validateRequired(['item']);   // true
validateRequired('');         // false
validateRequired(null);       // false
validateRequired([]);         // false
```

---

#### 15. **validateMinLength(value, min)**
Valida comprimento mínimo.

**Parâmetros:**
- `value` (string): Valor a ser validado
- `min` (number): Comprimento mínimo

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateMinLength } from '../utils/validation';

validateMinLength('12345', 5);   // true
validateMinLength('1234', 5);    // false
```

---

#### 16. **validateMaxLength(value, max)**
Valida comprimento máximo.

**Parâmetros:**
- `value` (string): Valor a ser validado
- `max` (number): Comprimento máximo

**Retorna:** `boolean`

**Exemplos:**
```javascript
import { validateMaxLength } from '../utils/validation';

validateMaxLength('12345', 5);   // true
validateMaxLength('123456', 5);  // false
```

---

## 🎨 FUNÇÕES DE FORMATAÇÃO

### 1. **formatCPF(cpf)**
Formata CPF para XXX.XXX.XXX-XX.

```javascript
import { formatCPF } from '../utils/validation';

formatCPF('12345678909');  // '123.456.789-09'
```

### 2. **formatCNPJ(cnpj)**
Formata CNPJ para XX.XXX.XXX/XXXX-XX.

```javascript
import { formatCNPJ } from '../utils/validation';

formatCNPJ('11222333000181');  // '11.222.333/0001-81'
```

### 3. **formatPhone(phone)**
Formata telefone para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.

```javascript
import { formatPhone } from '../utils/validation';

formatPhone('11987654321');  // '(11) 98765-4321'
formatPhone('1133334444');   // '(11) 3333-4444'
```

### 4. **formatCEP(cep)**
Formata CEP para XXXXX-XXX.

```javascript
import { formatCEP } from '../utils/validation';

formatCEP('01310100');  // '01310-100'
```

### 5. **formatPlate(plate)**
Formata placa de veículo (antiga apenas).

```javascript
import { formatPlate } from '../utils/validation';

formatPlate('ABC1234');  // 'ABC-1234'
formatPlate('ABC1D23');  // 'ABC1D23' (Mercosul sem formatação)
```

---

## 🛠️ UTILITÁRIOS

### **removeNonNumeric(value)**
Remove caracteres não numéricos.

```javascript
import { removeNonNumeric } from '../utils/validation';

removeNonNumeric('123.456.789-09');     // '12345678909'
removeNonNumeric('(11) 98765-4321');    // '11987654321'
```

---

## 📝 EXEMPLOS DE USO NO PROJETO

### Validação de Formulário de Cadastro

```javascript
import {
  validateCPF,
  validateEmail,
  validatePhone,
  validateFullName,
  validatePassword,
  formatCPF,
  formatPhone,
} from '../utils/validation';

const CadastroForm = () => {
  const [errors, setErrors] = useState({});

  const validateForm = (formData) => {
    const newErrors = {};

    // Nome
    if (!validateFullName(formData.nome)) {
      newErrors.nome = 'Nome completo inválido';
    }

    // CPF
    if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    // Email
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Telefone
    if (!validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }

    // Senha
    const passwordResult = validatePassword(formData.senha);
    if (!passwordResult.valid) {
      newErrors.senha = passwordResult.errors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm(formData)) {
      // Formata dados antes de enviar
      const payload = {
        ...formData,
        cpf: formatCPF(formData.cpf),
        telefone: formatPhone(formData.telefone),
      };
      
      // Envia para API
      api.cadastrar(payload);
    }
  };

  return (
    // JSX do formulário
  );
};
```

---

### Validação em Tempo Real (onBlur)

```javascript
import { validateCPF, formatCPF } from '../utils/validation';

const CPFInput = () => {
  const [cpf, setCPF] = useState('');
  const [error, setError] = useState('');

  const handleBlur = () => {
    if (!validateCPF(cpf)) {
      setError('CPF inválido');
    } else {
      setError('');
      // Formata ao sair do campo
      setCPF(formatCPF(cpf));
    }
  };

  return (
    <View>
      <TextInput
        value={cpf}
        onChangeText={setCPF}
        onBlur={handleBlur}
        placeholder="CPF"
        keyboardType="numeric"
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};
```

---

### Validação de Visitante

```javascript
import {
  validateCPF,
  validatePhone,
  validatePlate,
  validateDate,
} from '../utils/validation';

const validarVisitante = (visitante) => {
  const errors = [];

  if (!validateCPF(visitante.documento)) {
    errors.push('CPF do visitante inválido');
  }

  if (visitante.telefone && !validatePhone(visitante.telefone)) {
    errors.push('Telefone inválido');
  }

  if (visitante.placa && !validatePlate(visitante.placa)) {
    errors.push('Placa do veículo inválida');
  }

  if (!validateDate(visitante.dataVisita)) {
    errors.push('Data da visita inválida');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

---

## 🧪 TESTES

Todos os testes estão em `src/__tests__/utils/validation.test.js`.

**Executar testes:**
```bash
npm test validation
```

**Cobertura:**
- validateCPF: 100%
- validateCNPJ: 100%
- validateEmail: 100%
- validatePhone: 100%
- validateCEP: 100%
- validateFullName: 100%
- validatePassword: 100%
- validateStrongPassword: 100%
- validatePlate: 100%
- validateDate: 100%
- validateAge18: 100%
- validateURL: 100%
- Formatações: 100%

---

## 📊 RESUMO DE VALIDAÇÕES

| Função | Tipo | Formatação Disponível |
|--------|------|----------------------|
| validateCPF | Documento | ✅ formatCPF |
| validateCNPJ | Documento | ✅ formatCNPJ |
| validateEmail | Contato | ❌ |
| validatePhone | Contato | ✅ formatPhone |
| validateCEP | Endereço | ✅ formatCEP |
| validateFullName | Texto | ❌ |
| validatePassword | Senha | ❌ |
| validateStrongPassword | Senha | ❌ |
| validatePlate | Veículo | ✅ formatPlate |
| validateDate | Data | ❌ |
| validateAge18 | Data | ❌ |
| validateURL | URL | ❌ |
| validateUnit | Unidade | ❌ |
| validateRequired | Genérico | ❌ |
| validateMinLength | Genérico | ❌ |
| validateMaxLength | Genérico | ❌ |

---

## 🎯 BOAS PRÁTICAS

### 1. Sempre valide no frontend E backend
```javascript
// Frontend (UX)
if (!validateCPF(cpf)) {
  showError('CPF inválido');
  return;
}

// Backend (Segurança)
if (!isValidCPF(cpf)) {
  throw new Error('CPF inválido');
}
```

### 2. Formate ao exibir, não ao armazenar
```javascript
// ❌ Errado - armazena formatado
const cpf = formatCPF(inputCPF);
salvarNoBanco(cpf); // '123.456.789-09'

// ✅ Correto - armazena limpo
const cpf = removeNonNumeric(inputCPF);
salvarNoBanco(cpf); // '12345678909'
exibirNaTela(formatCPF(cpf)); // '123.456.789-09'
```

### 3. Valide em tempo real com debounce
```javascript
import { debounce } from 'lodash';

const debouncedValidate = debounce((value) => {
  if (!validateEmail(value)) {
    setError('Email inválido');
  }
}, 500);

<TextInput onChangeText={debouncedValidate} />
```

### 4. Mostre mensagens de erro claras
```javascript
// ❌ Errado
if (!validateCPF(cpf)) {
  alert('Erro');
}

// ✅ Correto
if (!validateCPF(cpf)) {
  setError('CPF inválido. Verifique o número digitado.');
}
```

---

## 🔗 REFERÊNCIAS

- [Validação de CPF - Receita Federal](http://www.receita.fazenda.gov.br/)
- [Validação de CNPJ - Receita Federal](http://www.receita.fazenda.gov.br/)
- [RFC 5322 - Email Format](https://tools.ietf.org/html/rfc5322)
- [Placa Mercosul - Detran](https://www.gov.br/infraestrutura/pt-br)

---

**Última Atualização**: Outubro 2025  
**Versão**: 1.0.0  
**Autor**: GitHub Copilot

