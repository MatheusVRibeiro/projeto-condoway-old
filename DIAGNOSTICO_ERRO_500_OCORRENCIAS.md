# 🔴 DIAGNÓSTICO: Erro 500 ao Buscar e Criar Ocorrências

## 📋 Situação Atual

### Erros Detectados:
1. **GET** `http://192.168.0.174:3333/ocorrencias/5?page=1&limit=20` → 500
2. **POST** `http://192.168.0.174:3333/ocorrencias` → 500

### Dados Enviados (Criar Ocorrência):
```json
{
  "userap_id": 5,
  "oco_categoria": "Vazamento",
  "oco_descricao": "vazamento de aguaaaa",
  "oco_localizacao": "piscina",
  "oco_prioridade": "Media",
  "oco_status": "Aberta",
  "oco_imagem": null
}
```

### Token JWT:
✅ Token sendo enviado corretamente: `Bearer eyJhbGciOiJIUzI1NiIsInR...`

---

## 🔍 Causas Prováveis

### 1. **Endpoint GET /ocorrencias/:userApId NÃO EXISTE**
- O backend pode não ter implementado este endpoint
- Pode estar esperando `/ocorrencias` sem parâmetro
- Verificar arquivo de rotas do backend

### 2. **Tabela `ocorrencias` com Problema**
- Pode não existir no banco de dados
- Pode ter colunas com nomes diferentes
- Pode estar faltando alguma coluna obrigatória

### 3. **Validação JWT no Backend**
- Middleware de autenticação pode estar rejeitando o token
- Secret do JWT pode estar diferente entre frontend e backend

### 4. **Campo `userap_id` Incorreto**
- Backend pode estar esperando `Userap_ID` (com maiúsculas)
- Backend pode estar esperando `user_id` ao invés de `userap_id`

---

## 🛠️ Ações para Resolver

### 1️⃣ **VERIFICAR LOGS DO BACKEND**

Abra o terminal onde o backend está rodando e procure por:
- Stack trace do erro
- Mensagem de erro do MySQL/banco de dados
- Validação de campos que falhou

**Exemplo do que procurar:**
```
Error: ER_NO_SUCH_TABLE: Table 'condoway.ocorrencias' doesn't exist
Error: ER_BAD_FIELD_ERROR: Unknown column 'userap_id' in 'field list'
Error: Cannot read property 'id' of undefined
```

---

### 2️⃣ **VERIFICAR ROTAS DO BACKEND**

Procure nos arquivos do backend por:

**Arquivo de rotas (ex: `routes/ocorrencias.js`):**
```javascript
// ❌ ERRADO - não tem rota com :userApId
router.get('/ocorrencias', listarOcorrencias);

// ✅ CERTO - deve ter esta rota
router.get('/ocorrencias/:userApId', listarOcorrenciasPorUsuario);
```

**Se NÃO EXISTIR a rota `/ocorrencias/:userApId`, você precisa criar:**

```javascript
// routes/ocorrencias.js
router.get('/ocorrencias/:userApId', async (req, res) => {
  try {
    const { userApId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Query para buscar ocorrências do morador
    const [ocorrencias] = await db.query(
      `SELECT * FROM ocorrencias 
       WHERE userap_id = ? 
       ORDER BY oco_data_ocorrencia DESC 
       LIMIT ? OFFSET ?`,
      [userApId, parseInt(limit), offset]
    );
    
    // Query para contar total
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM ocorrencias WHERE userap_id = ?',
      [userApId]
    );
    
    return res.json({
      sucesso: true,
      mensagem: 'Ocorrências listadas com sucesso.',
      dados: ocorrencias,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total: total,
        hasMore: offset + ocorrencias.length < total,
        perPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar ocorrências:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar ocorrências.',
      erro: error.message
    });
  }
});
```

---

### 3️⃣ **VERIFICAR TABELA NO BANCO DE DADOS**

Execute no MySQL:

```sql
-- Verificar se a tabela existe
SHOW TABLES LIKE 'ocorrencias';

-- Ver estrutura da tabela
DESCRIBE ocorrencias;

-- Verificar dados de teste
SELECT * FROM ocorrencias WHERE userap_id = 5 LIMIT 5;
```

**Estrutura esperada:**
```sql
CREATE TABLE IF NOT EXISTS ocorrencias (
  oco_id INT PRIMARY KEY AUTO_INCREMENT,
  userap_id INT NOT NULL,
  oco_categoria VARCHAR(100),
  oco_descricao TEXT,
  oco_localizacao VARCHAR(255),
  oco_prioridade ENUM('Baixa', 'Media', 'Alta'),
  oco_status ENUM('Aberta', 'Em Andamento', 'Resolvida', 'Fechada'),
  oco_imagem VARCHAR(500),
  oco_data_ocorrencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userap_id) REFERENCES usuario_apartamento(userap_id)
);
```

---

### 4️⃣ **VERIFICAR MIDDLEWARE DE AUTENTICAÇÃO**

**Arquivo de autenticação (ex: `middlewares/auth.js`):**

Verifique se o middleware está:
1. ✅ Decodificando o token corretamente
2. ✅ Passando os dados do usuário para `req.user`
3. ✅ Usando o mesmo secret do JWT

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token não fornecido.'
    });
  }
  
  try {
    // 🔥 IMPORTANTE: usar o MESMO secret do login
    const decoded = jwt.verify(token, 'seu_secret_aqui');
    req.user = decoded; // Disponibiliza dados do usuário nas rotas
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error.message);
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Token inválido ou expirado.'
    });
  }
};

module.exports = { verificarToken };
```

---

### 5️⃣ **VERIFICAR ENDPOINT DE CRIAÇÃO**

**Controller de ocorrências (ex: `controllers/ocorrenciasController.js`):**

```javascript
const criarOcorrencia = async (req, res) => {
  try {
    const {
      userap_id,
      oco_categoria,
      oco_descricao,
      oco_localizacao,
      oco_prioridade,
      oco_status,
      oco_imagem
    } = req.body;
    
    // Validação básica
    if (!userap_id || !oco_descricao) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Campos obrigatórios não preenchidos.'
      });
    }
    
    // Inserir no banco
    const [result] = await db.query(
      `INSERT INTO ocorrencias 
       (userap_id, oco_categoria, oco_descricao, oco_localizacao, 
        oco_prioridade, oco_status, oco_imagem) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userap_id, oco_categoria, oco_descricao, oco_localizacao,
       oco_prioridade, oco_status || 'Aberta', oco_imagem]
    );
    
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Ocorrência criada com sucesso.',
      dados: {
        oco_id: result.insertId,
        userap_id,
        oco_categoria,
        oco_descricao,
        oco_status: oco_status || 'Aberta'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar ocorrência:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro no cadastro de ocorrências.',
      erro: error.message
    });
  }
};
```

---

## 🎯 Checklist de Verificação

### Backend:
- [ ] Terminal do backend mostra o erro exato?
- [ ] Rota `GET /ocorrencias/:userApId` existe?
- [ ] Rota `POST /ocorrencias` existe?
- [ ] Middleware JWT está configurado?
- [ ] Secret do JWT é o mesmo do login?

### Banco de Dados:
- [ ] Tabela `ocorrencias` existe?
- [ ] Coluna `userap_id` existe?
- [ ] Todas as colunas obrigatórias existem?
- [ ] Há dados de teste na tabela?

### Teste Manual:
- [ ] Testar rota direto no Postman/Insomnia
- [ ] Enviar token JWT no header
- [ ] Verificar resposta do servidor

---

## 📤 Teste com Postman/Insomnia

### GET - Buscar Ocorrências:
```
GET http://192.168.0.174:3333/ocorrencias/5?page=1&limit=20

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
```

### POST - Criar Ocorrência:
```
POST http://192.168.0.174:3333/ocorrencias

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
Content-Type: application/json

Body:
{
  "userap_id": 5,
  "oco_categoria": "Vazamento",
  "oco_descricao": "Teste de vazamento",
  "oco_localizacao": "Piscina",
  "oco_prioridade": "Media",
  "oco_status": "Aberta"
}
```

---

## ✅ Próximos Passos

1. **ABRA O TERMINAL DO BACKEND** e copie o erro completo
2. **VERIFIQUE SE A TABELA EXISTE** no MySQL
3. **VERIFIQUE AS ROTAS** no código do backend
4. **TESTE COM POSTMAN** para isolar se o problema é no frontend ou backend
5. **Me mostre os logs do backend** para eu ajudar com a solução específica

---

## 🔗 Arquivos Relacionados

- `src/services/api.js` - ✅ Configuração correta
- `src/hooks/usePaginatedOcorrencias.js` - ✅ Configuração correta
- **Backend:** `routes/ocorrencias.js` - ⚠️ VERIFICAR
- **Backend:** `controllers/ocorrenciasController.js` - ⚠️ VERIFICAR
- **Banco:** Tabela `ocorrencias` - ⚠️ VERIFICAR
