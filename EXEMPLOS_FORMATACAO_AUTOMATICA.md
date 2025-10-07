# 📝 GUIA DE FORMATAÇÃO AUTOMÁTICA

## 🎯 Formatações Implementadas

Todas as formatações estão disponíveis em `src/utils/validation.js` e podem ser importadas individualmente:

```javascript
import { 
  formatPhone, 
  formatCPF, 
  formatCNPJ,
  formatCEP,
  formatPlate,
  formatMoney,
  formatDate,
  formatPercentage 
} from '../utils/validation';
```

---

## 📱 1. **TELEFONE**

### Formato Final:
- **Celular** (11 dígitos): `(14) 99823-8424`
- **Fixo** (10 dígitos): `(14) 3823-8424`

### Implementação:
```javascript
import { formatPhone } from '../utils/validation';

const [phone, setPhone] = useState('');

const handlePhoneChange = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 11) {
    setPhone(formatPhone(numbers));
  }
};

// Uso no TextInput
<TextInput
  value={phone}
  onChangeText={handlePhoneChange}
  keyboardType="numeric"
  maxLength={15} // (XX) XXXXX-XXXX
  placeholder="(14) 99823-8424"
/>
```

### Exemplos:
```javascript
formatPhone('14998238424')  // '(14) 99823-8424'
formatPhone('1438238424')   // '(14) 3823-8424'
formatPhone('11987654321')  // '(11) 98765-4321'
```

---

## 🆔 2. **CPF**

### Formato Final: `XXX.XXX.XXX-XX`

### Implementação:
```javascript
import { formatCPF, validateCPF } from '../utils/validation';

const [cpf, setCPF] = useState('');
const [error, setError] = useState('');

const handleCPFChange = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 11) {
    setCPF(formatCPF(numbers));
    if (error) setError('');
  }
};

const handleCPFBlur = () => {
  if (cpf && !validateCPF(cpf)) {
    setError('CPF inválido');
  }
};

<TextInput
  value={cpf}
  onChangeText={handleCPFChange}
  onBlur={handleCPFBlur}
  keyboardType="numeric"
  maxLength={14} // XXX.XXX.XXX-XX
  placeholder="123.456.789-09"
/>
{error && <Text style={{ color: 'red' }}>{error}</Text>}
```

### Exemplos:
```javascript
formatCPF('12345678909')    // '123.456.789-09'
formatCPF('111.444.777-35') // '111.444.777-35'
```

---

## 🏢 3. **CNPJ**

### Formato Final: `XX.XXX.XXX/XXXX-XX`

### Implementação:
```javascript
import { formatCNPJ, validateCNPJ } from '../utils/validation';

const [cnpj, setCNPJ] = useState('');

const handleCNPJChange = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 14) {
    setCNPJ(formatCNPJ(numbers));
  }
};

<TextInput
  value={cnpj}
  onChangeText={handleCNPJChange}
  keyboardType="numeric"
  maxLength={18} // XX.XXX.XXX/XXXX-XX
  placeholder="11.222.333/0001-81"
/>
```

### Exemplos:
```javascript
formatCNPJ('11222333000181')  // '11.222.333/0001-81'
```

---

## 📍 4. **CEP**

### Formato Final: `XXXXX-XXX`

### Implementação:
```javascript
import { formatCEP, validateCEP } from '../utils/validation';

const [cep, setCEP] = useState('');

const handleCEPChange = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 8) {
    setCEP(formatCEP(numbers));
  }
};

// Opcional: Buscar endereço automaticamente
const handleCEPBlur = async () => {
  if (cep && validateCEP(cep)) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setEndereco(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setUF(data.uf);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  }
};

<TextInput
  value={cep}
  onChangeText={handleCEPChange}
  onBlur={handleCEPBlur}
  keyboardType="numeric"
  maxLength={9} // XXXXX-XXX
  placeholder="01310-100"
/>
```

### Exemplos:
```javascript
formatCEP('01310100')  // '01310-100'
formatCEP('12345678')  // '12345-678'
```

---

## 🚗 5. **PLACA DE VEÍCULO**

### Formatos Suportados:
- **Placa Antiga**: `ABC-1234`
- **Placa Mercosul**: `ABC1D23`

### Implementação:
```javascript
import { formatPlate, validatePlate } from '../utils/validation';

const [plate, setPlate] = useState('');

const handlePlateChange = (text) => {
  const clean = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length <= 7) {
    setPlate(formatPlate(clean));
  }
};

<TextInput
  value={plate}
  onChangeText={handlePlateChange}
  autoCapitalize="characters"
  maxLength={8} // ABC-1234
  placeholder="ABC-1234"
/>
```

### Exemplos:
```javascript
formatPlate('ABC1234')   // 'ABC-1234' (antiga)
formatPlate('ABC1D23')   // 'ABC1D23' (Mercosul)
formatPlate('abc1234')   // 'ABC-1234' (converte para maiúscula)
```

---

## 💰 6. **DINHEIRO (REAL)**

### Formato Final: `R$ 1.234,56`

### Implementação:
```javascript
import { formatMoney, unformatMoney } from '../utils/validation';

const [price, setPrice] = useState('');

const handlePriceChange = (text) => {
  const formatted = formatMoney(text);
  setPrice(formatted);
};

// Ao enviar para API, remover formatação
const handleSubmit = () => {
  const numericValue = unformatMoney(price); // Retorna 1234.56
  api.post('/produto', { preco: numericValue });
};

<TextInput
  value={price}
  onChangeText={handlePriceChange}
  keyboardType="numeric"
  placeholder="R$ 0,00"
/>
```

### Exemplos:
```javascript
formatMoney('123456')     // 'R$ 1.234,56'
formatMoney('50000')      // 'R$ 500,00'
formatMoney('1000')       // 'R$ 10,00'
formatMoney(1234.56)      // 'R$ 1.234,56'

unformatMoney('R$ 1.234,56')  // 1234.56
unformatMoney('R$ 500,00')    // 500
```

---

## 📅 7. **DATA**

### Formato Final: `DD/MM/YYYY`

### Implementação:
```javascript
import { formatDate, validateDate } from '../utils/validation';

const [birthDate, setBirthDate] = useState('');
const [error, setError] = useState('');

const handleDateChange = (text) => {
  const numbers = text.replace(/\D/g, '');
  if (numbers.length <= 8) {
    setBirthDate(formatDate(numbers));
    if (error) setError('');
  }
};

const handleDateBlur = () => {
  if (birthDate && !validateDate(birthDate)) {
    setError('Data inválida');
  }
};

<TextInput
  value={birthDate}
  onChangeText={handleDateChange}
  onBlur={handleDateBlur}
  keyboardType="numeric"
  maxLength={10} // DD/MM/YYYY
  placeholder="31/12/2000"
/>
{error && <Text style={{ color: 'red' }}>{error}</Text>}
```

### Exemplos:
```javascript
formatDate('31122000')  // '31/12/2000'
formatDate('010120')    // '01/01/2020'
formatDate('1512')      // '15/12'
formatDate('25')        // '25'
```

---

## 📊 8. **PERCENTUAL**

### Formato Final: `XX,X%`

### Implementação:
```javascript
import { formatPercentage } from '../utils/validation';

const [discount, setDiscount] = useState('');

const handleDiscountChange = (text) => {
  const formatted = formatPercentage(text);
  setDiscount(formatted);
};

<TextInput
  value={discount}
  onChangeText={handleDiscountChange}
  keyboardType="numeric"
  maxLength={5} // 100%
  placeholder="10%"
/>
```

### Exemplos:
```javascript
formatPercentage('255')  // '25,5%'
formatPercentage('50')   // '50%'
formatPercentage('100')  // '10%'
formatPercentage('1000') // '100%'
```

---

## 🎨 EXEMPLO COMPLETO: FORMULÁRIO COM TODAS AS FORMATAÇÕES

```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  formatPhone,
  formatCPF,
  formatCEP,
  formatPlate,
  formatMoney,
  formatDate,
  validatePhone,
  validateCPF,
  validateCEP,
} from '../utils/validation';

export default function FormularioCompleto() {
  const [form, setForm] = useState({
    phone: '',
    cpf: '',
    cep: '',
    plate: '',
    price: '',
    birthDate: '',
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value, formatter) => {
    const formatted = formatter(value);
    setForm(prev => ({ ...prev, [field]: formatted }));
    
    // Limpa erro ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePhoneBlur = () => {
    if (form.phone && !validatePhone(form.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Telefone inválido' }));
    }
  };

  const handleCPFBlur = () => {
    if (form.cpf && !validateCPF(form.cpf)) {
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
    }
  };

  const handleCEPBlur = () => {
    if (form.cep && !validateCEP(form.cep)) {
      setErrors(prev => ({ ...prev, cep: 'CEP inválido' }));
    }
  };

  return (
    <View style={styles.container}>
      {/* Telefone */}
      <View style={styles.field}>
        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={form.phone}
          onChangeText={(text) => {
            const numbers = text.replace(/\D/g, '');
            if (numbers.length <= 11) {
              updateField('phone', numbers, formatPhone);
            }
          }}
          onBlur={handlePhoneBlur}
          keyboardType="numeric"
          maxLength={15}
          placeholder="(14) 99823-8424"
        />
        {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
      </View>

      {/* CPF */}
      <View style={styles.field}>
        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={[styles.input, errors.cpf && styles.inputError]}
          value={form.cpf}
          onChangeText={(text) => {
            const numbers = text.replace(/\D/g, '');
            if (numbers.length <= 11) {
              updateField('cpf', numbers, formatCPF);
            }
          }}
          onBlur={handleCPFBlur}
          keyboardType="numeric"
          maxLength={14}
          placeholder="123.456.789-09"
        />
        {errors.cpf && <Text style={styles.error}>{errors.cpf}</Text>}
      </View>

      {/* CEP */}
      <View style={styles.field}>
        <Text style={styles.label}>CEP</Text>
        <TextInput
          style={[styles.input, errors.cep && styles.inputError]}
          value={form.cep}
          onChangeText={(text) => {
            const numbers = text.replace(/\D/g, '');
            if (numbers.length <= 8) {
              updateField('cep', numbers, formatCEP);
            }
          }}
          onBlur={handleCEPBlur}
          keyboardType="numeric"
          maxLength={9}
          placeholder="01310-100"
        />
        {errors.cep && <Text style={styles.error}>{errors.cep}</Text>}
      </View>

      {/* Placa */}
      <View style={styles.field}>
        <Text style={styles.label}>Placa do Veículo</Text>
        <TextInput
          style={styles.input}
          value={form.plate}
          onChangeText={(text) => {
            const clean = text.replace(/[^a-zA-Z0-9]/g, '');
            if (clean.length <= 7) {
              updateField('plate', clean, formatPlate);
            }
          }}
          autoCapitalize="characters"
          maxLength={8}
          placeholder="ABC-1234"
        />
      </View>

      {/* Preço */}
      <View style={styles.field}>
        <Text style={styles.label}>Preço</Text>
        <TextInput
          style={styles.input}
          value={form.price}
          onChangeText={(text) => updateField('price', text, formatMoney)}
          keyboardType="numeric"
          placeholder="R$ 0,00"
        />
      </View>

      {/* Data de Nascimento */}
      <View style={styles.field}>
        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput
          style={styles.input}
          value={form.birthDate}
          onChangeText={(text) => {
            const numbers = text.replace(/\D/g, '');
            if (numbers.length <= 8) {
              updateField('birthDate', numbers, formatDate);
            }
          }}
          keyboardType="numeric"
          maxLength={10}
          placeholder="31/12/2000"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
  },
});
```

---

## 📋 RESUMO DAS FORMATAÇÕES

| Campo | Formato | maxLength | keyboardType | Função |
|-------|---------|-----------|--------------|--------|
| **Telefone** | `(14) 99823-8424` | 15 | `numeric` | `formatPhone` |
| **CPF** | `123.456.789-09` | 14 | `numeric` | `formatCPF` |
| **CNPJ** | `11.222.333/0001-81` | 18 | `numeric` | `formatCNPJ` |
| **CEP** | `01310-100` | 9 | `numeric` | `formatCEP` |
| **Placa** | `ABC-1234` | 8 | `default` | `formatPlate` |
| **Dinheiro** | `R$ 1.234,56` | - | `numeric` | `formatMoney` |
| **Data** | `31/12/2000` | 10 | `numeric` | `formatDate` |
| **Percentual** | `25,5%` | 5 | `numeric` | `formatPercentage` |

---

## ✅ BOAS PRÁTICAS

### 1. **Limitar tamanho máximo** (`maxLength`)
```javascript
<TextInput
  maxLength={15} // Evita que usuário digite mais que o necessário
/>
```

### 2. **Limpar erro ao digitar**
```javascript
const handleChange = (text) => {
  setValue(text);
  if (error) setError(''); // Limpa erro em tempo real
};
```

### 3. **Validar no onBlur**
```javascript
<TextInput
  onBlur={() => {
    if (value && !validateCPF(value)) {
      setError('CPF inválido');
    }
  }}
/>
```

### 4. **Usar keyboardType apropriado**
```javascript
// Para números
<TextInput keyboardType="numeric" />

// Para e-mail
<TextInput keyboardType="email-address" />

// Para telefone
<TextInput keyboardType="phone-pad" />
```

### 5. **Remover formatação antes de enviar à API**
```javascript
// CPF, Telefone, CEP - remover pontos, traços, parênteses
const cleanValue = value.replace(/\D/g, '');

// Dinheiro - usar unformatMoney
const numericValue = unformatMoney(money); // R$ 1.234,56 → 1234.56
```

---

## 🎯 PRÓXIMOS PASSOS

Outras formatações que podem ser úteis:

1. **RG** - XX.XXX.XXX-X
2. **Cartão de Crédito** - XXXX XXXX XXXX XXXX
3. **CVV** - XXX
4. **Validade Cartão** - MM/AA
5. **Conta Bancária** - XXXXX-X
6. **Agência** - XXXX
7. **IBAN** (internacional)
8. **Swift Code** (internacional)

---

**Criado em**: 06 de Outubro de 2025  
**Versão**: 1.0.0  
**Status**: ✅ Pronto para uso
