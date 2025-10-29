# 🚨 URGENTE: Backend - Extrair cond_id e userap_id do Token JWT

**Data:** 24/10/2025  
**Endpoint Afetado:** `POST /mensagens`  
**Erro Atual:** `Column 'cond_id' cannot be null`

---

## 📋 Problema Atual

### Erro no Backend

```
POST http://10.67.23.46:3333/mensagens 500 (Internal Server Error)

{
  sucesso: false, 
  mensagem: 'Erro na Listagem de mensagens.', 
  dados: "Column 'cond_id' cannot be null"
}
```

### Causa Raiz

O backend está tentando inserir uma mensagem na tabela `Mensagens` sem preencher os campos obrigatórios `cond_id` e `userap_id`.

**Tabela Mensagens:**
```sql
CREATE TABLE Mensagens (
    msg_id INT AUTO_INCREMENT PRIMARY KEY,
    cond_id INT NOT NULL,        -- ❌ Campo obrigatório
    userap_id INT NOT NULL,      -- ❌ Campo obrigatório
    msg_mensagem VARCHAR(130) NOT NULL,
    msg_data_envio DATETIME,
    msg_status ENUM('Enviada', 'Lida', 'Pendente') DEFAULT 'Enviada',
    FOREIGN KEY (cond_id) REFERENCES Condominio(cond_id),
    FOREIGN KEY (userap_id) REFERENCES Usuario_Apartamentos(userap_id)
) ENGINE=InnoDB;
```

---

## ✅ Solução Requerida no Backend

### 1. Middleware de Autenticação

O backend deve ter um middleware que extrai informações do token JWT:

```javascript
// Exemplo em Node.js/Express
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 1. Pegar token do header Authorization
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token não fornecido'
      });
    }
    
    // 2. Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Extrair informações do usuário
    req.user = {
      user_id: decoded.user_id,
      userap_id: decoded.userap_id,    // ✅ ID do usuário no apartamento
      cond_id: decoded.cond_id,        // ✅ ID do condomínio
      email: decoded.email,
      nome: decoded.nome
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido ou expirado'
    });
  }
};

module.exports = authMiddleware;
```

---

### 2. Endpoint POST /mensagens

**Controller de Mensagens:**

```javascript
// routes/mensagens.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../config/database');

// ✅ POST /mensagens - Criar nova mensagem
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { msg_mensagem, oco_id } = req.body;
    
    // ✅ Extrair do token JWT (via middleware)
    const { userap_id, cond_id } = req.user;
    
    // Validações
    if (!msg_mensagem || msg_mensagem.trim() === '') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Mensagem não pode ser vazia'
      });
    }
    
    if (msg_mensagem.length > 130) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Mensagem não pode ter mais de 130 caracteres'
      });
    }
    
    // Inserir mensagem no banco
    const query = `
      INSERT INTO Mensagens 
        (cond_id, userap_id, msg_mensagem, msg_data_envio, msg_status, oco_id) 
      VALUES 
        (?, ?, ?, NOW(), 'Enviada', ?)
    `;
    
    const [result] = await db.execute(query, [
      cond_id,      // ✅ Do token JWT
      userap_id,    // ✅ Do token JWT
      msg_mensagem,
      oco_id || null
    ]);
    
    // Buscar a mensagem criada
    const [mensagens] = await db.execute(
      'SELECT * FROM Mensagens WHERE msg_id = ?',
      [result.insertId]
    );
    
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem enviada com sucesso',
      dados: mensagens[0]
    });
    
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao enviar mensagem',
      dados: error.message
    });
  }
});

module.exports = router;
```

---

### 3. Estrutura do Token JWT

O token JWT gerado no login deve conter:

```javascript
// Ao fazer login (POST /Usuario/login)
const token = jwt.sign(
  {
    user_id: usuario.user_id,
    userap_id: usuarioApartamento.userap_id,  // ✅ Obrigatório
    cond_id: usuarioApartamento.cond_id,      // ✅ Obrigatório
    email: usuario.user_email,
    nome: usuario.user_nome,
    apartamento: usuarioApartamento.userap_apartamento
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Query para buscar dados completos no login:**

```sql
SELECT 
  u.user_id,
  u.user_nome,
  u.user_email,
  ua.userap_id,
  ua.userap_apartamento,
  ua.cond_id
FROM Usuarios u
INNER JOIN Usuario_Apartamentos ua ON u.user_id = ua.user_id
WHERE u.user_email = ? AND u.user_senha = ?
LIMIT 1;
```

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────┐
│  1. Cliente faz login                       │
│     POST /Usuario/login                     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  2. Backend gera JWT com:                   │
│     - user_id                               │
│     - userap_id  ✅                          │
│     - cond_id    ✅                          │
│     - email, nome, apartamento              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  3. Cliente armazena token                  │
│     AsyncStorage.setItem('user', userData)  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  4. Cliente envia comentário                │
│     POST /mensagens                         │
│     Headers: Authorization: Bearer {token}  │
│     Body: { msg_mensagem, oco_id }          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  5. Middleware extrai do token:             │
│     - userap_id  ✅                          │
│     - cond_id    ✅                          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  6. Controller insere no banco:             │
│     INSERT INTO Mensagens                   │
│     (cond_id, userap_id, msg_mensagem, ...) │
│     VALUES (?, ?, ?, ...)                   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  7. Retorna mensagem criada                 │
│     { sucesso: true, dados: {...} }         │
└─────────────────────────────────────────────┘
```

---

## 🧪 Teste do Token JWT

### Decodificar Token (Debugar)

Use o site [jwt.io](https://jwt.io) para verificar o conteúdo do token:

**Token esperado:**
```json
{
  "user_id": 1,
  "userap_id": 5,    // ✅ Deve estar presente
  "cond_id": 2,      // ✅ Deve estar presente
  "email": "joao@email.com",
  "nome": "João Silva",
  "apartamento": "101",
  "iat": 1729789200,
  "exp": 1730394000
}
```

---

## 📝 Checklist Backend

- [ ] Middleware de autenticação implementado
- [ ] Token JWT contém `userap_id`
- [ ] Token JWT contém `cond_id`
- [ ] Endpoint `POST /mensagens` protegido com middleware
- [ ] Controller extrai `userap_id` e `cond_id` do `req.user`
- [ ] Inserção no banco usando dados do token
- [ ] Validação de mensagem vazia
- [ ] Validação de limite de 130 caracteres
- [ ] Retorno de sucesso com dados da mensagem criada
- [ ] Tratamento de erros adequado

---

## 🔍 Debug do Token no Backend

Adicione logs temporários para verificar:

```javascript
router.post('/', authMiddleware, async (req, res) => {
  console.log('🔐 Token decodificado:', req.user);
  console.log('📥 Body recebido:', req.body);
  
  const { userap_id, cond_id } = req.user;
  
  console.log('✅ userap_id:', userap_id);
  console.log('✅ cond_id:', cond_id);
  
  if (!userap_id || !cond_id) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token JWT não contém userap_id ou cond_id'
    });
  }
  
  // ... resto do código
});
```

---

## ⚠️ IMPORTANTE

**NÃO envie `cond_id` e `userap_id` pelo frontend!**

❌ **Errado:**
```javascript
// Frontend (NÃO FAZER)
const payload = {
  msg_mensagem: comentario,
  oco_id: ocorrenciaId,
  cond_id: user.cond_id,    // ❌ NÃO ENVIAR
  userap_id: user.userap_id // ❌ NÃO ENVIAR
};
```

✅ **Correto:**
```javascript
// Frontend (CORRETO)
const payload = {
  msg_mensagem: comentario,
  oco_id: ocorrenciaId
  // cond_id e userap_id são extraídos do token pelo backend
};
```

**Motivo:**
- Segurança: Evita que usuário envie IDs de outros usuários/condomínios
- Confiabilidade: Token JWT não pode ser adulterado
- Padrão: É a forma correta de autenticação baseada em token

---

## ✨ Resultado Esperado

Após implementação no backend:

```
POST /mensagens

Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Request Body:
  {
    "msg_mensagem": "Comentário de teste",
    "oco_id": 1
  }

Response (201 Created):
  {
    "sucesso": true,
    "mensagem": "Mensagem enviada com sucesso",
    "dados": {
      "msg_id": 123,
      "cond_id": 2,
      "userap_id": 5,
      "msg_mensagem": "Comentário de teste",
      "msg_data_envio": "2025-10-24T16:30:00Z",
      "msg_status": "Enviada",
      "oco_id": 1
    }
  }
```

---

## 🔗 Documentos Relacionados

- `IMPLEMENTACAO_MENSAGENS_OCORRENCIAS.md` - Documentação completa da API de mensagens
- `src/services/api.js` - Implementação frontend da API

---

## 📞 Próximos Passos

1. **Backend:** Implementar middleware de autenticação
2. **Backend:** Atualizar geração de token JWT no login
3. **Backend:** Atualizar controller `POST /mensagens`
4. **Frontend:** Testar novamente após ajustes do backend
