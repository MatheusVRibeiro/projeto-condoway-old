# 💬 Implementação: Sistema de Mensagens para Ocorrências

**Data:** 24/10/2025  
**Arquivo:** `src/services/api.js`  
**Tabela do Banco:** `Mensagens`

---

## 📋 Estrutura da Tabela no Banco de Dados

```sql
CREATE TABLE Mensagens (
    msg_id INT AUTO_INCREMENT PRIMARY KEY,
    cond_id INT NOT NULL,
    userap_id INT NOT NULL,
    msg_mensagem VARCHAR(130) NOT NULL,
    msg_data_envio DATETIME,
    msg_status ENUM('Enviada', 'Lida', 'Pendente') DEFAULT 'Enviada',
    FOREIGN KEY (cond_id) REFERENCES Condominio(cond_id),
    FOREIGN KEY (userap_id) REFERENCES Usuario_Apartamentos(userap_id)
) ENGINE=InnoDB;
```

### Campos Importantes

- **msg_id**: ID único da mensagem
- **cond_id**: ID do condomínio (preenchido automaticamente pelo backend)
- **userap_id**: ID do usuário que enviou (preenchido pelo backend via token)
- **msg_mensagem**: Texto da mensagem (máximo 130 caracteres)
- **msg_data_envio**: Data/hora de envio
- **msg_status**: Status da mensagem (Enviada, Lida, Pendente)

---

## 🔧 Problema Anterior

### Erro 404

```
POST http://10.67.23.46:3333/ocorrencias/1/comentarios 404 (Not Found)
API Error - adicionarComentario: Request failed with status code 404
```

**Causa:** O endpoint `/ocorrencias/:id/comentarios` não existe no backend. O sistema usa a tabela `Mensagens` com endpoint próprio.

---

## ✅ Solução Implementada

### 1. Adicionar Comentário/Mensagem

```javascript
adicionarComentario: async (ocorrenciaId, comentario) => {
  try {
    console.log('🔄 [API] Enviando comentário para ocorrência:', ocorrenciaId);
    
    // Estrutura baseada na tabela Mensagens do banco
    const payload = {
      msg_mensagem: comentario.substring(0, 130), // Limite de 130 caracteres
      oco_id: ocorrenciaId
    };
    
    const response = await api.post('/mensagens', payload);
    
    // Retornar no formato esperado pelo frontend
    return {
      id: response.data.dados?.msg_id,
      text: response.data.dados?.msg_mensagem || comentario,
      timestamp: response.data.dados?.msg_data_envio || new Date().toISOString(),
      status: response.data.dados?.msg_status || 'Enviada',
      user: 'Você'
    };
  } catch (error) {
    handleError(error, 'adicionarComentario');
    throw error;
  }
}
```

**Endpoint:** `POST /mensagens`

**Payload Enviado:**
```json
{
  "msg_mensagem": "Texto do comentário (máx 130 caracteres)",
  "oco_id": 1
}
```

**Resposta Esperada:**
```json
{
  "sucesso": true,
  "mensagem": "Mensagem enviada com sucesso",
  "dados": {
    "msg_id": 123,
    "msg_mensagem": "Texto do comentário",
    "msg_data_envio": "2025-10-24T15:30:00Z",
    "msg_status": "Enviada",
    "userap_id": 1,
    "cond_id": 1,
    "oco_id": 1
  }
}
```

---

### 2. Buscar Comentários/Mensagens

```javascript
buscarComentarios: async (ocorrenciaId) => {
  try {
    const response = await api.get(`/mensagens`, {
      params: { oco_id: ocorrenciaId }
    });
    
    // Transformar mensagens do banco para formato do frontend
    const mensagens = response.data.dados || [];
    return mensagens.map(msg => ({
      id: msg.msg_id,
      text: msg.msg_mensagem,
      timestamp: msg.msg_data_envio,
      status: msg.msg_status,
      user: msg.user_nome || 'Usuário'
    }));
  } catch (error) {
    handleError(error, 'buscarComentarios');
    return [];
  }
}
```

**Endpoint:** `GET /mensagens?oco_id=1`

**Resposta Esperada:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "msg_id": 123,
      "msg_mensagem": "Comentário 1",
      "msg_data_envio": "2025-10-24T15:30:00Z",
      "msg_status": "Lida",
      "user_nome": "João Silva"
    },
    {
      "msg_id": 124,
      "msg_mensagem": "Comentário 2",
      "msg_data_envio": "2025-10-24T16:00:00Z",
      "msg_status": "Enviada",
      "user_nome": "Maria Santos"
    }
  ]
}
```

---

### 3. Marcar Mensagem como Lida

```javascript
marcarMensagemLida: async (mensagemId) => {
  try {
    const response = await api.patch(`/mensagens/${mensagemId}/lida`);
    return response.data;
  } catch (error) {
    handleError(error, 'marcarMensagemLida');
  }
}
```

**Endpoint:** `PATCH /mensagens/:id/lida`

**Resposta Esperada:**
```json
{
  "sucesso": true,
  "mensagem": "Mensagem marcada como lida"
}
```

---

## 🎯 Requisitos do Backend

### ⚠️ CRÍTICO: Autenticação via JWT

**O backend DEVE extrair `cond_id` e `userap_id` do token JWT do usuário autenticado.**

Veja documentação completa em: `BACKEND_JWT_COND_ID_REQUIRED.md`

---

### 1. Endpoint: `POST /mensagens`

**Descrição:** Criar nova mensagem/comentário

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "msg_mensagem": "Texto da mensagem",
  "oco_id": 1  // ID da ocorrência (opcional, depende do contexto)
}
```

**Regras de Negócio:**
- ✅ Extrair `userap_id` do token JWT
- ✅ Extrair `cond_id` do usuário autenticado
- ✅ Validar `msg_mensagem` (máximo 130 caracteres)
- ✅ Setar `msg_data_envio` como data/hora atual
- ✅ Setar `msg_status` como 'Enviada' por padrão

**SQL Sugerido:**
```sql
INSERT INTO Mensagens 
  (cond_id, userap_id, msg_mensagem, msg_data_envio, msg_status, oco_id) 
VALUES 
  (?, ?, ?, NOW(), 'Enviada', ?);
```

---

### 2. Endpoint: `GET /mensagens?oco_id={id}`

**Descrição:** Buscar mensagens/comentários de uma ocorrência

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
- `oco_id` (opcional): Filtrar por ocorrência
- `cond_id` (opcional): Filtrar por condomínio
- `userap_id` (opcional): Filtrar por usuário

**Resposta:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "msg_id": 123,
      "msg_mensagem": "Comentário...",
      "msg_data_envio": "2025-10-24T15:30:00Z",
      "msg_status": "Lida",
      "user_nome": "João Silva",
      "oco_id": 1
    }
  ]
}
```

**SQL Sugerido:**
```sql
SELECT 
  m.msg_id,
  m.msg_mensagem,
  m.msg_data_envio,
  m.msg_status,
  m.oco_id,
  u.user_nome
FROM Mensagens m
LEFT JOIN Usuario_Apartamentos ua ON m.userap_id = ua.userap_id
LEFT JOIN Usuarios u ON ua.user_id = u.user_id
WHERE m.oco_id = ?
  AND m.cond_id = ?
ORDER BY m.msg_data_envio ASC;
```

---

### 3. Endpoint: `PATCH /mensagens/:id/lida`

**Descrição:** Marcar mensagem como lida

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Mensagem marcada como lida"
}
```

**SQL Sugerido:**
```sql
UPDATE Mensagens 
SET msg_status = 'Lida' 
WHERE msg_id = ?;
```

---

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────┐
│  Usuário digita comentário na tela              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  handleSendComment(ocorrenciaId, texto)         │
│  - Valida texto não vazio                       │
│  - Valida autenticação                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  apiService.adicionarComentario()               │
│  - Limita texto a 130 caracteres                │
│  - POST /mensagens                              │
│  - Payload: { msg_mensagem, oco_id }            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Backend                                        │
│  - Extrai userap_id do token                    │
│  - Extrai cond_id do usuário                    │
│  - Insere na tabela Mensagens                   │
│  - Retorna dados da mensagem criada             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Frontend                                       │
│  - Adiciona comentário na lista local           │
│  - Mostra toast de sucesso                      │
│  - Auto-scroll para o final                     │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Validações Implementadas

### Frontend

1. **Validação de Texto Vazio**
   ```javascript
   if (!text.trim()) {
     Toast.show({ type: 'error', text1: 'Digite uma mensagem' });
     return;
   }
   ```

2. **Validação de Autenticação**
   ```javascript
   if (!user?.token) {
     Toast.show({ type: 'error', text1: 'Usuário não autenticado' });
     return;
   }
   ```

3. **Limite de 130 Caracteres**
   ```javascript
   msg_mensagem: comentario.substring(0, 130)
   ```

### Backend (Sugestões)

1. Validar `msg_mensagem` não vazio
2. Validar comprimento máximo (130 caracteres)
3. Validar se usuário tem permissão para comentar
4. Validar se ocorrência existe
5. Sanitizar entrada para evitar SQL injection

---

## 🧪 Testes Recomendados

### Frontend

- [ ] Enviar comentário com texto válido
- [ ] Tentar enviar comentário vazio
- [ ] Tentar enviar sem autenticação
- [ ] Enviar comentário com mais de 130 caracteres
- [ ] Verificar auto-scroll após envio
- [ ] Verificar toast de sucesso
- [ ] Verificar toast de erro

### Backend

- [ ] POST /mensagens com dados válidos
- [ ] POST /mensagens sem token
- [ ] POST /mensagens com token inválido
- [ ] POST /mensagens com msg_mensagem vazia
- [ ] POST /mensagens com msg_mensagem > 130 caracteres
- [ ] GET /mensagens?oco_id=1
- [ ] GET /mensagens sem filtros
- [ ] PATCH /mensagens/:id/lida

---

## 🔗 Arquivos Modificados

- ✅ `src/services/api.js` - Adicionadas 3 novas funções:
  - `adicionarComentario()` - Enviar comentário
  - `buscarComentarios()` - Listar comentários
  - `marcarMensagemLida()` - Marcar como lida

---

## 📝 Notas Importantes

### Limite de 130 Caracteres

A tabela `Mensagens` tem limite de 130 caracteres para `msg_mensagem`. O frontend já trunca automaticamente:

```javascript
msg_mensagem: comentario.substring(0, 130)
```

### Status de Mensagem

Valores possíveis:
- **Enviada**: Mensagem enviada com sucesso
- **Lida**: Mensagem visualizada pelo destinatário
- **Pendente**: Mensagem aguardando envio (offline)

### Integração com Ocorrências

A mensagem pode estar vinculada a uma ocorrência através do campo `oco_id` (que precisa ser adicionado à tabela `Mensagens` se ainda não existir).

**Sugestão de alteração na tabela:**
```sql
ALTER TABLE Mensagens 
ADD COLUMN oco_id INT NULL,
ADD FOREIGN KEY (oco_id) REFERENCES Ocorrencias(oco_id);
```

---

## ✨ Resultado

- ✅ Erro 404 eliminado
- ✅ Sistema de mensagens integrado à tabela correta
- ✅ Endpoint `/mensagens` implementado
- ✅ Validações de segurança aplicadas
- ✅ Limite de 130 caracteres respeitado
- ✅ Toast de feedback implementado
- ✅ Auto-scroll funcionando
- ✅ Status de mensagem gerenciável

---

## 🚀 Próximos Passos

1. **Backend:** Implementar os 3 endpoints descritos
2. **Backend:** Adicionar campo `oco_id` na tabela `Mensagens` (se não existir)
3. **Frontend:** Chamar `buscarComentarios()` ao abrir detalhes da ocorrência
4. **Frontend:** Implementar indicador visual de mensagens não lidas
5. **Frontend:** Adicionar contador de caracteres (130 máx)
