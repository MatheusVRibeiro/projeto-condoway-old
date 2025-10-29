# 🔴 Diagnóstico: Erro 500 ao Buscar Ocorrências

## 📋 Resumo do Problema

**Erro:** `GET http://192.168.0.174:3333/ocorrencias/5?page=2&limit=20 500 (Internal Server Error)`

**Mensagem:** "Erro ao listar ocorrências do morador."

---

## 🔍 Análise dos Erros

### 1. ❌ Verificação Incorreta do Token (CORRIGIDO)

**Problema encontrado:**
```javascript
// ❌ ERRADO - Verificava user.token que não existe
if (!user.token) {
  Toast.show({ type: 'error', text1: 'Token de autenticação não encontrado' });
  return;
}
```

**Correção aplicada:**
```javascript
// ✅ CORRETO - O token é gerenciado automaticamente pelo Axios
if (!user) {
  Toast.show({ type: 'error', text1: 'Usuário não encontrado' });
  return;
}
// O token está nos headers do Axios após setAuthToken(token)
```

**Por que estava errado?**
- O token **não** está no objeto `user`
- O token é armazenado **separadamente** no `AsyncStorage`
- O token é configurado nos **headers do Axios** via `setAuthToken(token)`
- Todas as requisições automaticamente incluem o token nos headers

---

### 2. 🔴 Erro 500 no Backend (PROBLEMA PRINCIPAL)

**Requisição:**
```
GET /ocorrencias/5?page=2&limit=20
```

**Resposta:**
```
500 Internal Server Error
Mensagem: "Erro ao listar ocorrências do morador."
```

#### 🔎 Possíveis Causas no Backend:

1. **Erro na Query SQL**
   - A paginação pode estar com sintaxe incorreta
   - O `LIMIT` e `OFFSET` podem estar causando erro
   - Exemplo de query correta:
   ```sql
   SELECT * FROM ocorrencias 
   WHERE userap_id = ? 
   ORDER BY oco_data_criacao DESC
   LIMIT ? OFFSET ?
   ```

2. **userApId inválido**
   - O `userApId = 5` pode não existir na tabela
   - Pode haver constraint/foreign key impedindo a busca

3. **Página 2 vazia causando erro**
   - O código pode não tratar bem quando não há mais registros
   - Pode estar tentando acessar índice inexistente

4. **Falta de tratamento de erro no backend**
   - O backend pode não ter try-catch adequado
   - Erro não está sendo capturado corretamente

---

## ✅ Melhorias Implementadas no Frontend

### 1. **Logs de Debug Adicionados**

```javascript
// Interceptor de REQUEST
api.interceptors.request.use((config) => {
  const token = config.headers.common?.Authorization;
  console.log(`🔄 [API] ${config.method.toUpperCase()} ${config.url}`, {
    hasToken: !!token,
    token: token ? token.substring(0, 30) + '...' : 'NENHUM'
  });
  return config;
});
```

**O que isso mostra:**
- ✅ Se o token está sendo enviado
- ✅ Qual endpoint está sendo chamado
- ✅ Método HTTP usado

### 2. **Tratamento de Erro Melhorado**

```javascript
const handleError = (error, functionName) => {
  const errorMessage = error.response?.data?.mensagem || error.message;
  const statusCode = error.response?.status;
  const errorDetails = error.response?.data;
  
  console.error(`❌ [API Error - ${functionName}]:`, {
    status: statusCode,
    message: errorMessage,
    details: errorDetails,
    fullError: error.response?.data || error.message
  });
  
  throw new Error(errorMessage);
};
```

**O que isso mostra:**
- ✅ Status HTTP completo
- ✅ Mensagem detalhada do backend
- ✅ Dados extras do erro

### 3. **Timeout Aumentado**

```javascript
const api = axios.create({
  baseURL: 'http://192.168.0.174:3333',
  timeout: 30000, // 30 segundos (antes era 10)
});
```

---

## 🛠️ Como Corrigir no Backend

### Verificar a Rota `/ocorrencias/:userApId`

```javascript
// routes/ocorrencias.js (exemplo Node.js/Express)
router.get('/ocorrencias/:userApId', authMiddleware, async (req, res) => {
  try {
    const { userApId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // 1. VALIDAR SE userApId EXISTE
    if (!userApId || isNaN(userApId)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do apartamento inválido'
      });
    }
    
    // 2. CALCULAR OFFSET
    const offset = (page - 1) * limit;
    
    // 3. BUSCAR OCORRÊNCIAS COM TRY-CATCH
    const query = `
      SELECT * FROM ocorrencias 
      WHERE userap_id = ? 
      ORDER BY oco_data_criacao DESC
      LIMIT ? OFFSET ?
    `;
    
    const [ocorrencias] = await db.query(query, [userApId, parseInt(limit), offset]);
    
    // 4. CONTAR TOTAL
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM ocorrencias WHERE userap_id = ?',
      [userApId]
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // 5. RETORNAR RESPOSTA
    return res.json({
      sucesso: true,
      dados: ocorrencias,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasMore: page < totalPages,
        perPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    // 6. LOG COMPLETO DO ERRO
    console.error('❌ Erro ao buscar ocorrências:', error);
    
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar ocorrências do morador.',
      erro: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

---

## 🧪 Testes para Fazer

### 1. **Verificar Token**
Após fazer login, verifique no console:
```
✅ [API] Token configurado no Axios: eyJhbGciOiJIUzI1NiIsInR...
```

### 2. **Verificar Requisição**
Ao carregar ocorrências, verifique:
```
🔄 [API] GET /ocorrencias/5?page=1&limit=20 { hasToken: true, token: 'Bearer eyJhbG...' }
```

### 3. **Verificar Erro Detalhado**
Se der erro 500, verifique:
```
❌ [API Error - buscarOcorrencias]: {
  status: 500,
  message: "Erro ao listar ocorrências do morador.",
  details: { /* detalhes do backend */ }
}
```

### 4. **Testar no Backend Diretamente**

Use Postman/Insomnia para testar:

```http
GET http://192.168.0.174:3333/ocorrencias/5?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Se funcionar no Postman mas não no app, o problema é no frontend.  
Se não funcionar no Postman, o problema é no backend.

---

## 📊 Checklist de Verificação

### Frontend ✅
- [x] Token sendo configurado corretamente no Axios
- [x] Logs de debug adicionados
- [x] Timeout aumentado para 30s
- [x] Tratamento de erro melhorado
- [x] Remoção de verificação incorreta de `user.token`

### Backend ⚠️ (Verificar)
- [ ] Rota `/ocorrencias/:userApId` existe e está funcionando
- [ ] Middleware de autenticação JWT validando token
- [ ] Query SQL com LIMIT/OFFSET correta
- [ ] Try-catch em volta do código
- [ ] Retorno de erro detalhado em desenvolvimento
- [ ] Validação de parâmetros (userApId, page, limit)

---

## 🎯 Próximos Passos

1. **Reiniciar o app** para aplicar as mudanças
2. **Fazer login** e verificar os logs do token
3. **Tentar carregar ocorrências** e observar os logs detalhados
4. **Se o erro persistir**, verificar o **backend** com os exemplos acima
5. **Testar diretamente no Postman** para isolar se é problema de backend

---

**Data:** 27/10/2025  
**Status:** ✅ Frontend corrigido | ⚠️ Backend precisa verificação
