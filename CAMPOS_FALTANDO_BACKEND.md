# 🔴 Campos Faltando no Backend

## Endpoint: `GET /usuario/perfil/:userId`

### ❌ Campos Ausentes (Necessários para o Frontend)

O endpoint atual retorna:
```json
{
  "user_id": 1,
  "user_nome": "Ana Souza",
  "user_email": "ana@email.com",
  "user_telefone": "1199999999",
  "user_tipo": "Morador",
  "userap_id": 1,
  "ap_numero": "103",
  "ap_andar": 2,
  "bloc_nome": "Bloco A",
  "cond_nome": "Village das Palmeiras"
  // ❌ FALTA: "cond_id": 1
}
```

### ✅ Campos que Precisam ser Adicionados

```json
{
  // ... todos os campos atuais ...
  
  // ⚠️ ADICIONAR ESTES CAMPOS:
  "cond_id": 1,                                   // ❌ FALTANDO (CRÍTICO!)
  "userap_data_cadastro": "2023-01-15T00:00:00Z" // ❌ FALTANDO
  
  // ✅ DEPOIS que cond_id estiver disponível, virão da API de condomínio:
  // "cond_endereco": "Rua Central, 789"     
  // "cond_cidade": "São Paulo"
}
```

---

## 📋 SQL para Adicionar os Campos

### Atualizar o SELECT na rota do backend

No arquivo da rota `/usuario/perfil/:userId`, adicione os campos na query:

```sql
SELECT 
  u.User_ID as user_id,
  u.User_Nome as user_nome,
  u.User_Email as user_email,
  u.User_Telefone as user_telefone,
  u.User_Tipo as user_tipo,
  
  ua.UserAp_ID as userap_id,
  ua.UserAp_DataCadastro as userap_data_cadastro,  -- ✅ ADICIONAR
  
  a.Apto_ID as ap_id,
  a.Apto_Numero as ap_numero,
  a.Apto_Andar as ap_andar,
  
  b.Bloc_ID as bloc_id,
  b.Bloc_Nome as bloc_nome,
  
  c.Cond_ID as cond_id,        -- ✅ ADICIONAR (CRÍTICO!)
  c.Cond_Nome as cond_nome
  
FROM Usuarios u
INNER JOIN Usuario_Apartamentos ua ON u.User_ID = ua.User_ID
INNER JOIN Apartamentos a ON ua.Apto_ID = a.Apto_ID
INNER JOIN Blocos b ON a.Bloc_ID = b.Bloc_ID
INNER JOIN Condominio c ON b.Cond_ID = c.Cond_ID
WHERE u.User_ID = ?
```

**⚠️ IMPORTANTE:** O campo `cond_id` é **CRÍTICO** porque é usado para buscar os dados completos do condomínio (endereço e cidade) na API `/condominio/:condId`.

---

## 🎯 Impacto no Frontend

### 1. **ID do Condomínio** (`cond_id`) - **CRÍTICO!**
**Usado em:** `UnitDetails/index.js`

```javascript
// ATUALMENTE: condId é undefined ❌
const condId = profileData?.cond_id || profileData?.Cond_ID;
const { condominioData } = useCondominio(condId);

// COM O CAMPO: condId = 1 ✅
// Isso dispara automaticamente a busca do condomínio!
```

**Sem `cond_id`:**
- ❌ `condominioData` fica `null`
- ❌ Endereço mostra "Não informado"
- ❌ Cidade mostra "Não informado"

**Com `cond_id`:**
- ✅ `condominioData` carregado com sucesso
- ✅ Endereço: "Rua Central, 789"
- ✅ Cidade: "São Paulo"

### 2. **Data de Cadastro** (`userap_data_cadastro`)
**Usado em:** `UnitDetails/index.js`

```javascript
// Atualmente mostra "Não informado"
registrationDate: formatarDataCadastro(profileData?.userap_data_cadastro)

// Com o campo do backend, mostrará:
"Janeiro 2023" // formato: "Mês Ano"
```

### 2. **Endereço do Condomínio** (vem da API de condomínio)
**Endpoint:** `GET /condominio/:condId` (acionado automaticamente quando `cond_id` existe)  
**Usado em:** `UnitDetails/index.js`

```javascript
// ATUALMENTE: condominioData é null porque condId é undefined ❌
endereco: condominioData?.cond_endereco || 'Não informado'

// COM cond_id: useCondominio(1) busca os dados ✅
// Mostrará: "Rua Central, 789"
```

### 3. **Cidade** (vem da API de condomínio)
**Endpoint:** `GET /condominio/:condId` (acionado automaticamente quando `cond_id` existe)  
**Usado em:** `UnitDetails/index.js`

```javascript
// ATUALMENTE: condominioData é null ❌
const enderecoCompleto = `${cond_endereco}, ${cond_cidade}`

// COM cond_id: ✅
// Mostrará: "Rua Central, 789, São Paulo"
```

---

## 🔧 Onde Atualizar no Backend

### Arquivo: `routes/usuario.js` (ou similar)

```javascript
// Rota: GET /usuario/perfil/:userId

router.get('/perfil/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      u.User_ID as user_id,
      u.User_Nome as user_nome,
      u.User_Email as user_email,
      u.User_Telefone as user_telefone,
      u.User_Tipo as user_tipo,
      u.User_Foto as user_foto,
      
      ua.UserAp_ID as userap_id,
      ua.UserAp_DataCadastro as userap_data_cadastro,  -- ✅ ADICIONAR
      
      a.Apto_ID as ap_id,
      a.Apto_Numero as ap_numero,
      a.Apto_Andar as ap_andar,
      
      b.Bloc_ID as bloc_id,
      b.Bloc_Nome as bloc_nome,
      
      c.Cond_ID as cond_id,
      c.Cond_Nome as cond_nome
      
    FROM Usuarios u
    INNER JOIN Usuario_Apartamentos ua ON u.User_ID = ua.User_ID
    INNER JOIN Apartamentos a ON ua.Apto_ID = a.Apto_ID
    INNER JOIN Blocos b ON a.Bloc_ID = b.Bloc_ID
    INNER JOIN Condominio c ON b.Cond_ID = c.Cond_ID
    WHERE u.User_ID = ?
  `;
  
  // ... resto do código
});
```

**Nota:** A rota `GET /condominio/:condId` já deve existir e retornar `cond_endereco` e `cond_cidade`.

---

## ✅ Checklist de Atualização

- [ ] **CRÍTICO**: Adicionar `c.Cond_ID as cond_id` no SELECT da rota `/usuario/perfil/:userId`
- [ ] Adicionar `ua.UserAp_DataCadastro as userap_data_cadastro` no SELECT
- [ ] Verificar se API de condomínio `GET /condominio/:condId` retorna `cond_endereco` e `cond_cidade`
- [ ] Testar endpoint: `GET http://10.67.23.46:3333/usuario/perfil/1`
- [ ] Verificar resposta contém `cond_id` e `userap_data_cadastro`
- [ ] Recarregar app mobile e verificar se logs mostram:
  - `🆔 [UnitDetails] condId: 1` (não mais `undefined`)
  - `🏘️ [UnitDetails] condominioData:` com dados reais (não mais `null`)
- [ ] Verificar tela "Minha Unidade" mostra endereço completo

---

## 🧪 Como Testar

### 1. Teste direto no Postman/Insomnia

#### Endpoint de Perfil
```
GET http://10.67.23.46:3333/usuario/perfil/1
```

**Resposta Esperada:**
```json
{
  "sucesso": true,
  "mensagem": "Perfil do usuário carregado com sucesso.",
  "dados": {
    "user_id": 1,
    "user_nome": "Ana Souza",
    "user_email": "ana@email.com",
    "user_telefone": "1199999999",
    "user_tipo": "Morador",
    "userap_id": 1,
    "userap_data_cadastro": "2023-01-15T00:00:00.000Z",  // ✅ ADICIONAR
    "ap_numero": "103",
    "ap_andar": 2,
    "bloc_nome": "Bloco A",
    "cond_id": 1,                                        // ✅ ADICIONAR (CRÍTICO!)
    "cond_nome": "Village das Palmeiras"
  }
}
```

#### Endpoint de Condomínio
```
GET http://10.67.23.46:3333/condominio/1
```

**Resposta Esperada:**
```json
{
  "sucesso": true,
  "mensagem": "Condomínio encontrado.",
  "dados": {
    "cond_id": 1,
    "cond_nome": "Village das Palmeiras",
    "cond_endereco": "Rua Central, 789",                // ✅ Deve existir
    "cond_cidade": "São Paulo"                          // ✅ Deve existir
  }
}
```

### 2. Teste no App Mobile

Após atualizar o backend:

1. **Fazer logout e login novamente** no app
2. Acessar **Perfil** → **Minha Unidade**
3. Verificar se os campos agora aparecem:
   - **LOCALIZAÇÃO**: "Rua Central, 789, São Paulo" ✅
   - **DESDE**: "Janeiro 2023" ✅

### Logs Esperados:
```
📦 [UnitDetails] profileData completo: {
  ...
  "cond_id": 1,                                    // ✅ DEVE APARECER
  "userap_data_cadastro": "2023-01-15T00:00:00.000Z"
}
� [UnitDetails] condId: 1                         // ✅ NÃO MAIS undefined
🔄 [API] Buscando informações do condomínio 1...   // ✅ SERÁ ACIONADO
✅ [API] Condomínio carregado: {...}               // ✅ RESPOSTA
�🏘️ [UnitDetails] condominioData completo: {
  "cond_id": 1,
  "cond_nome": "Village das Palmeiras",
  "cond_endereco": "Rua Central, 789",             // ✅ VIRÁ DA API
  "cond_cidade": "São Paulo"                       // ✅ VIRÁ DA API
}
📋 [UnitDetails] displayData processado: {
  ...
  "endereco": "Rua Central, 789, São Paulo",       // ✅ COMPLETO!
  "registrationDate": "Janeiro 2023"
}
```

---

## 📞 STATUS ATUAL

❌ **CAMPO CRÍTICO FALTANDO: `cond_id`**

**Problema Atual:**
```
🆔 [UnitDetails] condId: undefined              ❌
🏘️ [UnitDetails] condominioData: null          ❌
📋 [UnitDetails] endereco: 'Não informado'      ❌
```

**Motivo:** O endpoint `/usuario/perfil/:userId` não está retornando o campo `c.Cond_ID as cond_id`

**Solução:** Adicionar 2 campos no SELECT do backend:
1. `c.Cond_ID as cond_id` - **CRÍTICO** para buscar dados do condomínio
2. `ua.UserAp_DataCadastro as userap_data_cadastro` - para mostrar data de cadastro

**Resultado Esperado Após Correção:**
```
🆔 [UnitDetails] condId: 1                      ✅
🏘️ [UnitDetails] condominioData: {...}         ✅
📋 [UnitDetails] endereco: 'Rua Central, 789, São Paulo'  ✅
```

---

## 🔗 Arquivos Relacionados

- **Backend:** 
  - `routes/usuario.js` - adicionar `userap_data_cadastro`
  - `routes/condominio.js` - verificar se retorna `cond_endereco` e `cond_cidade`
- **Frontend:** 
  - `src/screens/App/Perfil/UnitDetails/index.js` - já atualizado ✅
  - `src/hooks/useCondominio.js` - já configurado ✅
  - `src/services/api.js` - já configurado ✅
