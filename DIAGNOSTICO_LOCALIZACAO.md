# 🔍 Diagnóstico: Por que a Localização não está Completa?

## ❌ Problema Identificado

A tela "Minha Unidade" mostra:
- **LOCALIZAÇÃO**: "Não informado" ❌

**Esperado:**
- **LOCALIZAÇÃO**: "Rua Central, 789, São Paulo" ✅

---

## 🔎 Análise dos Logs

### 1. ProfileData (API `/usuario/perfil/1`)

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

### 2. CondId Resolution

```javascript
const condId = profileData?.cond_id || profileData?.Cond_ID;
console.log('🆔 [UnitDetails] condId:', condId);
// Output: undefined ❌
```

**Por que `undefined`?**
- `profileData.cond_id` não existe ❌
- `profileData.Cond_ID` não existe ❌

### 3. useCondominio Hook

```javascript
const { condominioData } = useCondominio(condId);
// condId = undefined ❌
// Logo, não busca nada!
```

**Logs:**
```
🏘️ [useCondominio] condId: undefined          ❌
🏘️ [UnitDetails] condominioData: null         ❌
```

### 4. DisplayData Processing

```javascript
const enderecoCompleto = profileData?.cond_endereco 
  ? `${profileData.cond_endereco}, ${profileData.cond_cidade}`
  : condominioData?.cond_endereco 
  ? `${condominioData.cond_endereco}, ${condominioData.cond_cidade}`
  : 'Não informado';

// profileData.cond_endereco? NÃO ❌
// condominioData? null ❌
// Resultado: 'Não informado' ❌
```

---

## 🔧 Solução: Cadeia de Eventos Corretos

### ✅ Fluxo Esperado

```
1. Backend retorna cond_id
   ↓
2. Frontend detecta: condId = 1
   ↓
3. useCondominio(1) é acionado
   ↓
4. API busca: GET /condominio/1
   ↓
5. condominioData recebe: { cond_endereco, cond_cidade }
   ↓
6. displayData processa: "Rua Central, 789, São Paulo"
   ↓
7. Tela mostra localização completa ✅
```

### ❌ Fluxo Atual

```
1. Backend NÃO retorna cond_id
   ↓
2. Frontend: condId = undefined ❌
   ↓
3. useCondominio(undefined) não busca nada
   ↓
4. condominioData = null
   ↓
5. displayData: "Não informado" ❌
```

---

## 📝 O que Precisa Fazer no Backend

### Arquivo: `routes/usuario.js` (ou equivalente)

**ANTES (código atual):**
```sql
SELECT 
  u.User_ID as user_id,
  u.User_Nome as user_nome,
  u.User_Email as user_email,
  u.User_Telefone as user_telefone,
  u.User_Tipo as user_tipo,
  
  ua.UserAp_ID as userap_id,
  -- ua.UserAp_DataCadastro as userap_data_cadastro,  ❌ FALTA
  
  a.Apto_ID as ap_id,
  a.Apto_Numero as ap_numero,
  a.Apto_Andar as ap_andar,
  
  b.Bloc_ID as bloc_id,
  b.Bloc_Nome as bloc_nome,
  
  -- c.Cond_ID as cond_id,     ❌❌❌ FALTA (CRÍTICO!)
  c.Cond_Nome as cond_nome
  
FROM Usuarios u
INNER JOIN Usuario_Apartamentos ua ON u.User_ID = ua.User_ID
INNER JOIN Apartamentos a ON ua.Apto_ID = a.Apto_ID
INNER JOIN Blocos b ON a.Bloc_ID = b.Bloc_ID
INNER JOIN Condominio c ON b.Cond_ID = c.Cond_ID
WHERE u.User_ID = ?
```

**DEPOIS (código corrigido):**
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
  
  c.Cond_ID as cond_id,        -- ✅✅✅ ADICIONAR (CRÍTICO!)
  c.Cond_Nome as cond_nome
  
FROM Usuarios u
INNER JOIN Usuario_Apartamentos ua ON u.User_ID = ua.User_ID
INNER JOIN Apartamentos a ON ua.Apto_ID = a.Apto_ID
INNER JOIN Blocos b ON a.Bloc_ID = b.Bloc_ID
INNER JOIN Condominio c ON b.Cond_ID = c.Cond_ID
WHERE u.User_ID = ?
```

---

## 🧪 Como Testar a Correção

### 1. Teste o endpoint no Postman/Insomnia

```bash
GET http://10.67.23.46:3333/usuario/perfil/1
```

**Verifique se a resposta contém:**
```json
{
  "sucesso": true,
  "dados": {
    "user_id": 1,
    "cond_id": 1,  // ✅ DEVE APARECER!
    "userap_data_cadastro": "2023-01-15T00:00:00.000Z"  // ✅ DEVE APARECER!
  }
}
```

### 2. Recarregue o App Mobile

Faça logout e login novamente para limpar o cache.

### 3. Verifique os Logs no Console

**Logs que DEVEM aparecer após a correção:**

```
✅ [API] Perfil recebido: {
  ...
  "cond_id": 1,  // ✅ AGORA TEM!
  ...
}

🆔 [UnitDetails] condId: 1  // ✅ NÃO MAIS undefined!

🔄 [API] Buscando informações do condomínio 1...  // ✅ BUSCA ACIONADA!

✅ [API] Condomínio carregado: {
  "cond_id": 1,
  "cond_nome": "Village das Palmeiras",
  "cond_endereco": "Rua Central, 789",
  "cond_cidade": "São Paulo"
}

🏘️ [UnitDetails] condominioData: {
  "cond_endereco": "Rua Central, 789",  // ✅ DADOS RECEBIDOS!
  "cond_cidade": "São Paulo"
}

📋 [UnitDetails] displayData processado: {
  "endereco": "Rua Central, 789, São Paulo"  // ✅ COMPLETO!
}
```

### 4. Verifique a Tela

A tela "Minha Unidade" deve mostrar:

```
╔════════════════════════════════════╗
║ LOCALIZAÇÃO                        ║
║ Rua Central, 789, São Paulo   ✅   ║
║ 103, Bloco A                       ║
╚════════════════════════════════════╝
```

---

## 📊 Resumo Visual

### Estado Atual (ANTES da correção)

```
Backend            Frontend
┌─────────────┐   ┌──────────────────┐
│ /perfil/1   │   │ condId: undefined│
│             │   │                  │
│ ❌ NO       │──▶│ condominioData:  │
│ cond_id     │   │ null             │
│             │   │                  │
│             │   │ endereco:        │
│             │   │ "Não informado"❌│
└─────────────┘   └──────────────────┘
```

### Estado Esperado (DEPOIS da correção)

```
Backend            Frontend
┌─────────────┐   ┌──────────────────┐
│ /perfil/1   │   │ condId: 1 ✅     │
│             │   │        ↓         │
│ ✅ cond_id: │──▶│ /condominio/1    │
│    1        │   │        ↓         │
│             │   │ condominioData:  │
│             │   │ {cond_endereco,  │
│             │   │  cond_cidade} ✅ │
│             │   │        ↓         │
│             │   │ endereco:        │
│             │   │ "Rua Central,    │
│             │   │  789, São Paulo" │
│             │   │              ✅  │
└─────────────┘   └──────────────────┘
```

---

## 🎯 Conclusão

**Problema:** Backend não retorna `cond_id` no endpoint `/usuario/perfil/:userId`

**Consequência:** Frontend não consegue buscar dados completos do condomínio

**Solução:** Adicionar **2 linhas** no SELECT da rota:
1. `c.Cond_ID as cond_id` ← **CRÍTICO!**
2. `ua.UserAp_DataCadastro as userap_data_cadastro`

**Impacto:** Localização completa será exibida automaticamente! 🎉
