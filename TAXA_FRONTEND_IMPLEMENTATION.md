# 💰 Taxa Condominial - Endpoint Único

## ✅ Implementação Frontend Completa

### 🎯 Arquitetura

**Fluxo simplificado:**
```
Frontend (UnitDetails) 
    ↓
useTaxaCondominio hook
    ↓
apiService.buscarTaxaCondominio()
    ↓
GET /taxa
    ↓
Backend retorna { sucesso: true, dados: 485.50 }
    ↓
Hook formata → "R$ 485,50"
    ↓
Exibe na tela
```

---

## 📁 Arquivos Criados/Modificados

### 1. **Hook Customizado** ✅
**Arquivo:** `src/hooks/useTaxaCondominio.js`

```javascript
import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useTaxaCondominio = () => {
  const [taxa, setTaxa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTaxa = async () => {
      try {
        setLoading(true);
        const response = await apiService.buscarTaxaCondominio();
        
        if (response?.sucesso && response?.dados !== undefined) {
          setTaxa(response.dados);
        } else {
          setTaxa(null);
        }
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar taxa condominial:', err);
        setError(err);
        setTaxa(null);
      } finally {
        setLoading(false);
      }
    };

    loadTaxa();
  }, []);

  // Formata o valor para exibição
  const taxaFormatada = taxa != null
    ? `R$ ${Number(taxa).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Não informado';

  return {
    taxa,           // número bruto (485.50) ou null
    taxaFormatada,  // string formatada ("R$ 485,50") ou "Não informado"
    loading,        // boolean
    error           // Error object ou null
  };
};
```

**Retorna:**
- `taxa` - Valor numérico (485.50) ou `null`
- `taxaFormatada` - String formatada "R$ 485,50" ou "Não informado"
- `loading` - Estado de carregamento
- `error` - Erro se houver

---

### 2. **API Service** ✅
**Arquivo:** `src/services/api.js`

```javascript
// Buscar taxa condominial atual
buscarTaxaCondominio: async () => {
  try {
    console.log('🔄 [API] Buscando taxa condominial atual...');
    const response = await api.get('/taxa');
    console.log('✅ [API] Taxa condominial:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API] Erro ao buscar taxa condominial:', error.response?.status, error.response?.data);
    handleError(error, 'buscarTaxaCondominio');
  }
}
```

**Endpoint:** `GET /taxa`

**Resposta esperada:**
```json
{
  "sucesso": true,
  "dados": 485.50
}
```

ou se não houver taxa:
```json
{
  "sucesso": true,
  "dados": null
}
```

---

### 3. **Export do Hook** ✅
**Arquivo:** `src/hooks/index.js`

```javascript
// Business Logic Hooks
export { useProfile } from './useProfile';
export { useCondominio } from './useCondominio';
export { useTaxaCondominio } from './useTaxaCondominio'; // ✅ NOVO
```

---

### 4. **Tela UnitDetails** ✅
**Arquivo:** `src/screens/App/Perfil/UnitDetails/index.js`

**Import:**
```javascript
import { useTaxaCondominio } from '../../../../hooks/useTaxaCondominio';
```

**Uso no componente:**
```javascript
// Busca taxa condominial atual
const { taxaFormatada, loading: taxaLoading } = useTaxaCondominio();

// ...

const displayData = {
  // ...outros campos...
  monthlyFee: taxaFormatada,  // "R$ 485,50" ou "Não informado"
};
```

---

## 🔧 Backend Necessário

### Controller (adicionar no arquivo Usuario.js ou criar TaxaController.js):

```javascript
async taxaAtual(request, response) {
  try {
    const sql = `
      SELECT ger_valor AS taxa_condominio
      FROM gerenciamento
      WHERE ger_descricao LIKE '%taxa%' OR ger_descricao LIKE '%condomin%'
      ORDER BY ger_data DESC
      LIMIT 1
    `;
    const [rows] = await bd.query(sql);

    if (!rows || rows.length === 0) {
      return response.status(200).json({ sucesso: true, dados: null });
    }

    return response.status(200).json({ 
      sucesso: true, 
      dados: Number(rows[0].taxa_condominio) 
    });
  } catch (error) {
    console.error('Erro ao buscar taxa atual:', error);
    return response.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno', 
      erro: error.message 
    });
  }
}
```

### Rota (adicionar no arquivo de rotas):

```javascript
const UsuarioController = require('../controllers/Usuario');

// Taxa condominial única para todo o condomínio
router.get('/taxa', UsuarioController.taxaAtual);
```

---

## 🧪 Como Testar

### 1. Inserir taxa no banco (se não existir):

```sql
INSERT INTO gerenciamento (cond_id, ger_data, ger_descricao, ger_valor)
VALUES (1, '2025-10-09', 'Taxa Condominial Outubro 2025', 485.50);
```

### 2. Testar endpoint diretamente:

**No Postman ou navegador:**
```
GET http://10.67.23.46:3333/taxa
```

**Resposta esperada:**
```json
{
  "sucesso": true,
  "dados": 485.50
}
```

### 3. Testar no app:

1. Abrir tela "Minha Unidade"
2. Verificar seção "INFORMAÇÕES FINANCEIRAS"
3. Deve exibir: **"R$ 485,50"**

**Se não houver taxa cadastrada:**
- Exibe: **"Não informado"**

---

## 📊 Exemplos de Formatação

| Valor no Banco | Response API | Frontend Exibe |
|----------------|--------------|----------------|
| `485.50` | `485.50` | `R$ 485,50` |
| `1250.00` | `1250` | `R$ 1.250,00` |
| `750.99` | `750.99` | `R$ 750,99` |
| `null` | `null` | `Não informado` |

---

## ✅ Vantagens dessa Abordagem

### 1. **Endpoint Único**
- ✅ Apenas `GET /taxa`
- ✅ Não precisa passar `user_id` ou `cond_id`
- ✅ Retorna sempre a taxa mais recente

### 2. **Hook Reutilizável**
- ✅ Pode usar em outras telas
- ✅ Gerencia loading e error states
- ✅ Formatação automática

### 3. **Performance**
- ✅ Cache automático do React
- ✅ Única chamada por montagem do componente
- ✅ Não refaz busca desnecessária

### 4. **Manutenibilidade**
- ✅ Lógica centralizada no hook
- ✅ Fácil adicionar features (cache, polling, etc.)
- ✅ Fácil testar isoladamente

---

## 🔄 Melhorias Futuras

### 1. **Cache com React Query**
```javascript
import { useQuery } from '@tanstack/react-query';

export const useTaxaCondominio = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['taxa'],
    queryFn: () => apiService.buscarTaxaCondominio(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // ...formatação
};
```

### 2. **Polling (atualização automática)**
```javascript
useEffect(() => {
  const interval = setInterval(loadTaxa, 60000); // a cada 1 min
  return () => clearInterval(interval);
}, []);
```

### 3. **Notificação de mudança**
```javascript
useEffect(() => {
  if (taxa && prevTaxa && taxa !== prevTaxa) {
    Alert.alert('Taxa Atualizada', `Nova taxa: ${taxaFormatada}`);
  }
}, [taxa]);
```

### 4. **Histórico de Taxas**
Criar endpoint `/taxa/historico` para exibir evolução.

---

## 🐛 Troubleshooting

### Problema: "Não informado" sempre

**Possíveis causas:**
1. Endpoint não configurado no backend
2. Tabela `gerenciamento` vazia
3. Descrição não contém "taxa" ou "condomin"

**Solução:**
```sql
-- Verificar se há registros
SELECT * FROM gerenciamento 
WHERE ger_descricao LIKE '%taxa%' OR ger_descricao LIKE '%condomin%'
ORDER BY ger_data DESC;
```

### Problema: Valor errado

**Causa:** Tipo decimal retornando como string

**Solução:** Backend já usa `Number(rows[0].taxa_condominio)`

### Problema: Loading infinito

**Causa:** Endpoint retornando erro 500

**Solução:** Verificar logs do backend e estrutura da tabela

---

## 📝 Checklist de Implementação

### Frontend ✅
- [x] Hook `useTaxaCondominio` criado
- [x] API service `buscarTaxaCondominio` adicionado
- [x] Hook exportado em `hooks/index.js`
- [x] UnitDetails usando o hook
- [x] Formatação brasileira de moeda

### Backend ⏳
- [ ] Controller `taxaAtual` implementado
- [ ] Rota `GET /taxa` registrada
- [ ] Endpoint testado no Postman
- [ ] Taxa cadastrada no banco de dados

### Testes ⏳
- [ ] Endpoint retorna valor correto
- [ ] Frontend exibe valor formatado
- [ ] Funciona quando não há taxa (null)
- [ ] Loading state funciona

---

## 🎯 Conclusão

Implementação **simples e eficiente** que:
- ✅ Usa endpoint único
- ✅ Hook customizado reutilizável
- ✅ Formatação automática
- ✅ Error handling completo
- ✅ Loading states

**Próximo passo:** Configure o backend e teste! 🚀

