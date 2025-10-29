# ✅ Correção Implementada: Erro 403 ao Buscar Ocorrências

## 🔍 Problema Identificado

**Erro:** `403 Forbidden - "Acesso negado. Requer privilégios de Síndico ou Funcionário"`

**Causa:** O aplicativo estava chamando o endpoint `/ocorrencias` que é restrito apenas para Síndicos e Funcionários. Usuários do tipo **Morador** precisam usar o endpoint específico `/ocorrencias/:userApId`.

---

## ✅ Solução Implementada

### 1. **Atualização do Hook `usePaginatedOcorrencias.js`**

Adicionado acesso ao contexto de autenticação para obter o `userap_id` do usuário logado:

```javascript
import { useAuth } from '../contexts/AuthContext'; // ✅ IMPORTADO

export const usePaginatedOcorrencias = (initialLimit = 20) => {
  const { user } = useAuth(); // ✅ PEGA O USUÁRIO LOGADO
  const userApId = user?.userap_id; // ✅ EXTRAI O userap_id
  
  // ... resto do código
```

#### **Funções atualizadas:**

- ✅ `loadOcorrencias()` - Carrega primeira página
- ✅ `loadMore()` - Carrega próximas páginas (infinite scroll)
- ✅ `refresh()` - Pull-to-refresh

**Validação adicionada:** Se `userApId` não estiver disponível, as funções retornam sem fazer a requisição.

```javascript
if (!userApId) {
  console.warn('⚠️ [Hook] userApId não disponível');
  return;
}

// Agora passa o userApId como primeiro parâmetro
const result = await apiService.buscarOcorrencias(userApId, page, limit);
```

---

### 2. **Atualização do Serviço API `api.js`**

Modificada a função `buscarOcorrencias` para aceitar `userApId` como primeiro parâmetro:

```javascript
buscarOcorrencias: async (userApId, page = 1, limit = 20) => {
  try {
    // ✅ VALIDAÇÃO: Se não houver userApId, retorna erro
    if (!userApId) {
      return handleError({ 
        message: 'ID do apartamento do usuário não encontrado.' 
      });
    }

    // ✅ MONTA O ENDPOINT CORRETO: /ocorrencias/:userApId
    const endpoint = `/ocorrencias/${userApId}`;
    console.log(`🔄 [API] Buscando ocorrências: ${endpoint}?page=${page}&limit=${limit}`);

    const response = await api.get(endpoint, {
      params: { page, limit }
    });
    
    // ... resto do tratamento da resposta
  } catch (error) {
    handleError(error, 'buscarOcorrencias');
  }
}
```

---

## 📊 Mudanças no Endpoint

| **Antes** | **Depois** |
|-----------|------------|
| `GET /ocorrencias?page=1&limit=20` | `GET /ocorrencias/:userApId?page=1&limit=20` |
| ❌ Restrito a Síndico/Funcionário | ✅ Acessível para Moradores |
| `403 Forbidden` | `200 OK` (esperado) |

---

## 🧪 Como Testar

1. **Login com usuário Morador:**
   - Email: `ana@email.com`
   - Senha: `senha123`

2. **Verificar no console:**
   - ✅ Deve aparecer: `🔄 [API] Buscando ocorrências: /ocorrencias/1?page=1&limit=20`
   - ✅ Não deve mais aparecer erro `403 Forbidden`
   - ✅ Deve carregar as ocorrências do apartamento do usuário

3. **Verificar na tela:**
   - ✅ Lista de ocorrências deve carregar
   - ✅ Pull-to-refresh deve funcionar
   - ✅ Infinite scroll deve carregar mais páginas

---

## 📝 Estrutura de Dados

O usuário logado possui:
```javascript
{
  user_id: 1,
  user_nome: "Ana Silva",
  user_email: "ana@email.com",
  user_tipo: "Morador", // 👈 Tipo de usuário
  userap_id: 1,         // 👈 ID do apartamento (NECESSÁRIO)
  // ... outros campos
}
```

O `userap_id` é usado para buscar apenas as ocorrências relacionadas ao apartamento daquele morador.

---

## ⚡ Próximos Passos (Opcional)

Se o backend ainda não estiver configurado para aceitar `/ocorrencias/:userApId`, será necessário:

1. **Criar/Ajustar rota no backend:**
```javascript
// Backend - Rota para moradores
router.get('/ocorrencias/:userApId', authMiddleware, async (req, res) => {
  const { userApId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  // Buscar ocorrências apenas deste apartamento
  const ocorrencias = await Ocorrencia.findByApartamento(userApId, page, limit);
  
  res.json({
    sucesso: true,
    dados: ocorrencias,
    pagination: { /* ... */ }
  });
});
```

2. **Manter rota antiga para Síndico/Funcionário:**
```javascript
// Backend - Rota para administradores (ver todas)
router.get('/ocorrencias', authMiddleware, verificarPermissao(['Sindico', 'Funcionario']), async (req, res) => {
  // Buscar TODAS as ocorrências (sem filtro de apartamento)
  // ...
});
```

---

## 📌 Resumo

✅ **Problema:** 403 Forbidden ao buscar ocorrências  
✅ **Causa:** Endpoint errado para tipo de usuário "Morador"  
✅ **Solução:** Usar `/ocorrencias/:userApId` em vez de `/ocorrencias`  
✅ **Arquivos modificados:**
  - `src/hooks/usePaginatedOcorrencias.js`
  - `src/services/api.js`

---

**Data da correção:** 2025  
**Status:** ✅ Implementado e pronto para testes
