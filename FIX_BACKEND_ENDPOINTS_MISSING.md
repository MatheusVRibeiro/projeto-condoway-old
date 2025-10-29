# 🔧 Correção: Endpoints do Backend Ainda Não Implementados

**Data:** 24/10/2025  
**Status:** ⚠️ Aguardando Backend

---

## 🚨 Problemas Identificados

### 1. Endpoint de Marcar Como Lida NÃO Existe

**Erro:**
```
PATCH http://10.67.23.46:3333/mensagens/ocorrencia/1/lida 404 (Not Found)
Cannot PATCH /mensagens/ocorrencia/1/lida
```

**Causa:**
O endpoint `PATCH /mensagens/ocorrencia/:id/lida` ainda **não foi implementado** no backend.

**Status Atual:**
- Frontend: ✅ Preparado para usar o endpoint
- Backend: ❌ Endpoint não existe

---

### 2. Backend Não Extrai cond_id do Token JWT

**Erro:**
```
POST http://10.67.23.46:3333/mensagens 500 (Internal Server Error)
Column 'cond_id' cannot be null
```

**Causa:**
O backend **não está extraindo** `cond_id` e `userap_id` do token JWT nas requisições.

**O que deveria acontecer:**

```javascript
// Backend (Node.js/Express) - Exemplo
router.post('/mensagens', authenticateToken, async (req, res) => {
  const { msg_mensagem, oco_id } = req.body;
  
  // ✅ Extrair do token JWT (colocado pelo middleware authenticateToken)
  const { userap_id, cond_id } = req.user;
  
  // Inserir no banco
  const query = `
    INSERT INTO Mensagens (msg_mensagem, oco_id, userap_id, cond_id, msg_data_envio)
    VALUES (?, ?, ?, ?, NOW())
  `;
  
  await db.query(query, [msg_mensagem, oco_id, userap_id, cond_id]);
  
  res.json({ sucesso: true, mensagem: 'Mensagem enviada' });
});
```

**Status Atual:**
- Frontend: ✅ Envia apenas `msg_mensagem` e `oco_id`
- Backend: ❌ Não extrai `cond_id` e `userap_id` do token

---

## ✅ Correções Aplicadas no Frontend

### 1. Removida Chamada do Endpoint Inexistente

**Antes:**
```javascript
// ✅ Marcar todas as mensagens como lidas ao abrir a modal
try {
  await apiService.marcarTodasMensagensLidas(occurrence.id);
  console.log('✅ Mensagens marcadas como lidas');
} catch (error) {
  console.log('⚠️ Erro ao marcar mensagens como lidas (não crítico):', error);
}
```

**Depois:**
```javascript
// TODO: Marcar mensagens como lidas quando o endpoint estiver disponível
// await apiService.marcarTodasMensagensLidas(occurrence.id);
```

**Motivo:**
Evitar erro 404 desnecessário até que o backend implemente o endpoint.

---

### 2. Adicionado Debug do Token JWT

**Adicionado em `adicionarComentario()`:**

```javascript
// Debug do token JWT
const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
const token = await AsyncStorage.getItem('token');

if (token) {
  try {
    // Decodificar payload do JWT (apenas para debug)
    const base64Payload = token.split('.')[1];
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')));
    
    console.log('👤 [API] Dados do token JWT:', {
      userap_id: decodedPayload.userap_id || decodedPayload.id,
      cond_id: decodedPayload.cond_id,
      nome: decodedPayload.nome || decodedPayload.name
    });
  } catch (e) {
    console.warn('⚠️ [API] Não foi possível decodificar o token:', e);
  }
} else {
  console.warn('⚠️ [API] Token não encontrado no AsyncStorage');
}
```

**Objetivo:**
- Verificar se o token contém `cond_id` e `userap_id`
- Ajudar a diagnosticar se o problema é do frontend ou backend

---

## 🎯 O Que o Backend Precisa Implementar

### 1. Endpoint de Marcar Como Lida

**Endpoint:** `PATCH /mensagens/ocorrencia/:oco_id/lida`

**Middleware:** `authenticateToken` (para obter `userap_id`)

**Funcionalidade:**
```sql
UPDATE Mensagens
SET msg_status = 'Lida'
WHERE oco_id = ?
  AND userap_id != ?  -- Não marcar as próprias mensagens
  AND msg_status != 'Lida'
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Mensagens marcadas como lidas",
  "dados": {
    "mensagensAtualizadas": 3
  }
}
```

---

### 2. Extrair Dados do Token JWT

**Middleware de Autenticação:**

```javascript
// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Token não fornecido' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        sucesso: false, 
        mensagem: 'Token inválido' 
      });
    }
    
    // ✅ Disponibilizar dados do usuário em req.user
    req.user = {
      userap_id: decoded.userap_id || decoded.id,
      cond_id: decoded.cond_id,
      nome: decoded.nome || decoded.name
    };
    
    next();
  });
}

module.exports = authenticateToken;
```

**Uso nas Rotas:**

```javascript
// routes/mensagens.js
const authenticateToken = require('../middleware/authenticateToken');

// POST /mensagens
router.post('/', authenticateToken, async (req, res) => {
  const { msg_mensagem, oco_id } = req.body;
  
  // ✅ Extrair do token (disponível via middleware)
  const { userap_id, cond_id } = req.user;
  
  if (!cond_id || !userap_id) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Token JWT inválido: faltam cond_id ou userap_id'
    });
  }
  
  // Inserir no banco
  const query = `
    INSERT INTO Mensagens (msg_mensagem, oco_id, userap_id, cond_id, msg_data_envio, msg_status)
    VALUES (?, ?, ?, ?, NOW(), 'Enviada')
  `;
  
  const [result] = await db.query(query, [msg_mensagem, oco_id, userap_id, cond_id]);
  
  // Buscar mensagem criada
  const [rows] = await db.query('SELECT * FROM Mensagens WHERE msg_id = ?', [result.insertId]);
  
  res.json({
    sucesso: true,
    mensagem: 'Mensagem enviada',
    dados: rows[0]
  });
});

// PATCH /mensagens/ocorrencia/:oco_id/lida
router.patch('/ocorrencia/:oco_id/lida', authenticateToken, async (req, res) => {
  const { oco_id } = req.params;
  const { userap_id } = req.user;
  
  const query = `
    UPDATE Mensagens
    SET msg_status = 'Lida'
    WHERE oco_id = ?
      AND userap_id != ?
      AND msg_status != 'Lida'
  `;
  
  const [result] = await db.query(query, [oco_id, userap_id]);
  
  res.json({
    sucesso: true,
    mensagem: 'Mensagens marcadas como lidas',
    dados: {
      mensagensAtualizadas: result.affectedRows
    }
  });
});
```

---

## 📊 Status dos Endpoints

| Endpoint | Método | Status Backend | Status Frontend |
|----------|--------|----------------|-----------------|
| `/mensagens` | POST | ⚠️ Não extrai JWT | ✅ Pronto |
| `/mensagens/ocorrencia/:id` | GET | ❓ Não testado | ✅ Pronto |
| `/mensagens/ocorrencia/:id/lida` | PATCH | ❌ Não implementado | ✅ Pronto (comentado) |
| `/mensagens/:id/lida` | PATCH | ❓ Não testado | ✅ Pronto |
| `/mensagens` | GET | ❓ Não testado | ✅ Pronto |
| `/mensagens/:id` | PUT | ❓ Não testado | ✅ Pronto |

---

## 🔍 Como Diagnosticar

### Verificar Token JWT no Console

1. Abra a modal de ocorrência
2. Tente enviar um comentário
3. Verifique no console do navegador:

```
👤 [API] Dados do token JWT: {
  userap_id: 5,
  cond_id: 2,
  nome: "João Silva"
}
```

**Resultado Esperado:**
- ✅ Se aparecer `cond_id` e `userap_id`, o token está correto
- ❌ Se aparecer `undefined`, o backend não está gerando o token corretamente

---

### Verificar Estrutura do Token

```javascript
// No login, verificar o que o backend está retornando
const decoded = jwt_decode(token);
console.log('Token JWT decodificado:', decoded);

// Deve conter:
{
  userap_id: 5,      // ✅ ID do usuário
  cond_id: 2,        // ✅ ID do condomínio
  nome: "João Silva",
  iat: 1729780000,   // Data de emissão
  exp: 1729866400    // Data de expiração
}
```

---

## ✅ Arquivos Modificados

1. ✅ `src/components/OccurrenceModal/index.js`
   - Removida chamada ao endpoint inexistente
   - Adicionado TODO para quando estiver disponível

2. ✅ `src/services/api.js`
   - Adicionado debug do token JWT
   - Logs detalhados dos dados do token

---

## 🎯 Próximos Passos

### Para o Desenvolvedor Backend:

1. **Implementar Middleware de Autenticação**
   - Extrair `userap_id` e `cond_id` do token JWT
   - Disponibilizar em `req.user`

2. **Atualizar POST /mensagens**
   - Usar `req.user.userap_id` e `req.user.cond_id`
   - Remover dependência do body para esses campos

3. **Implementar PATCH /mensagens/ocorrencia/:id/lida**
   - Marcar mensagens como lidas
   - Excluir mensagens do próprio usuário

4. **Testar Endpoints**
   - Enviar mensagem
   - Listar mensagens de ocorrência
   - Marcar como lidas

### Para o Desenvolvedor Frontend:

1. ✅ Verificar logs do token JWT no console
2. ⏳ Aguardar implementação dos endpoints no backend
3. ⏳ Descomentar chamada de `marcarTodasMensagensLidas()` após backend pronto

---

## 📝 Exemplo Completo Backend (Node.js/Express)

```javascript
// server.js ou app.js
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ sucesso: false, mensagem: 'Token não fornecido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ sucesso: false, mensagem: 'Token inválido' });
    }
    
    req.user = {
      userap_id: decoded.userap_id,
      cond_id: decoded.cond_id,
      nome: decoded.nome
    };
    
    next();
  });
}

// Rotas de mensagens
app.post('/mensagens', authenticateToken, async (req, res) => {
  const { msg_mensagem, oco_id } = req.body;
  const { userap_id, cond_id } = req.user;
  
  const query = `
    INSERT INTO Mensagens (msg_mensagem, oco_id, userap_id, cond_id, msg_data_envio, msg_status)
    VALUES (?, ?, ?, ?, NOW(), 'Enviada')
  `;
  
  const [result] = await db.query(query, [msg_mensagem, oco_id, userap_id, cond_id]);
  const [rows] = await db.query('SELECT * FROM Mensagens WHERE msg_id = ?', [result.insertId]);
  
  res.json({ sucesso: true, mensagem: 'Mensagem enviada', dados: rows[0] });
});

app.get('/mensagens/ocorrencia/:oco_id', authenticateToken, async (req, res) => {
  const { oco_id } = req.params;
  const { userap_id } = req.user;
  
  const query = `
    SELECT 
      m.*,
      u.userap_nome,
      (m.userap_id = ?) AS is_own
    FROM Mensagens m
    LEFT JOIN UsuariosApartamento u ON m.userap_id = u.userap_id
    WHERE m.oco_id = ?
    ORDER BY m.msg_data_envio ASC
  `;
  
  const [rows] = await db.query(query, [userap_id, oco_id]);
  
  res.json({ sucesso: true, dados: rows });
});

app.patch('/mensagens/ocorrencia/:oco_id/lida', authenticateToken, async (req, res) => {
  const { oco_id } = req.params;
  const { userap_id } = req.user;
  
  const query = `
    UPDATE Mensagens
    SET msg_status = 'Lida'
    WHERE oco_id = ? AND userap_id != ? AND msg_status != 'Lida'
  `;
  
  const [result] = await db.query(query, [oco_id, userap_id]);
  
  res.json({ 
    sucesso: true, 
    mensagem: 'Mensagens marcadas como lidas',
    dados: { mensagensAtualizadas: result.affectedRows }
  });
});

app.listen(3333, () => console.log('Servidor rodando na porta 3333'));
```

---

## 🎉 Conclusão

**Frontend:** ✅ Pronto e aguardando backend  
**Backend:** ⚠️ Precisa de 2 implementações:
1. Middleware de autenticação JWT extraindo dados
2. Endpoint `PATCH /mensagens/ocorrencia/:id/lida`

Após o backend implementar essas funcionalidades, basta descomentar a linha no `OccurrenceModal/index.js` e o sistema estará 100% funcional! 🚀
