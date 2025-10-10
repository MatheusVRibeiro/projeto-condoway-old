# ✅ Checklist de Validação - Backend Atualizado

## 🧪 Como Validar se os Campos Foram Adicionados Corretamente

### 1️⃣ Teste o Endpoint Diretamente

Use Postman, Insomnia ou o navegador:

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
    "userap_data_cadastro": "2023-01-15T00:00:00.000Z",  // ✅ NOVO
    "ap_numero": "103",
    "ap_andar": 2,
    "bloc_nome": "Bloco A",
    "cond_id": 1,                                        // ✅ NOVO (CRÍTICO!)
    "cond_nome": "Village das Palmeiras"
  }
}
```

**Verifique:**
- ✅ `cond_id` está presente?
- ✅ `userap_data_cadastro` está presente?

---

### 2️⃣ Teste a API de Condomínio

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
    "cond_endereco": "Rua Central, 789",      // ✅ VERIFICAR
    "cond_cidade": "São Paulo",               // ✅ VERIFICAR
    "cond_cep": "01234-567",
    // ... outros campos ...
  }
}
```

**Verifique:**
- ✅ `cond_endereco` está presente?
- ✅ `cond_cidade` está presente?

---

### 3️⃣ Teste no App Mobile

#### Passo 1: Limpar Cache
```
1. Faça LOGOUT do app
2. Feche o app completamente
3. Reabra o app
4. Faça LOGIN novamente
```

#### Passo 2: Acesse a Tela
```
Perfil → Minha Unidade
```

#### Passo 3: Verifique os Logs do Console

**Logs Esperados (em ordem):**

```javascript
// 1. Perfil carregado
✅ [API] Perfil recebido: {
  user_id: 1,
  cond_id: 1,  // ✅ DEVE APARECER!
  userap_data_cadastro: "2023-01-15T00:00:00.000Z",  // ✅ DEVE APARECER!
  ...
}

// 2. ID do condomínio detectado
🆔 [UnitDetails] condId: 1  // ✅ NÃO MAIS undefined!

// 3. Busca do condomínio acionada
🏘️ [useCondominio] condId: 1
🔄 [useCondominio] Carregando condomínio com ID: 1...
🔄 [API] Buscando informações do condomínio 1...

// 4. Condomínio carregado
✅ [API] Condomínio carregado: {...}
✅ [useCondominio] Condomínio carregado: {
  cond_id: 1,
  cond_nome: "Village das Palmeiras",
  cond_endereco: "Rua Central, 789",  // ✅ DEVE APARECER!
  cond_cidade: "São Paulo"            // ✅ DEVE APARECER!
}
📍 [useCondominio] Endereço: Rua Central, 789
🏙️ [useCondominio] Cidade: São Paulo

// 5. Endereço montado
🗺️ [UnitDetails] Montando endereço...
   condominioData?.cond_endereco: Rua Central, 789
   condominioData?.cond_cidade: São Paulo
   ✅ enderecoCompleto: Rua Central, 789, São Paulo

// 6. DisplayData processado
📋 [UnitDetails] displayData processado: {
  apartment: "103",
  block: "Bloco A",
  condominium: "Village das Palmeiras",
  endereco: "Rua Central, 789, São Paulo",  // ✅ COMPLETO!
  registrationDate: "Janeiro 2023",         // ✅ DATA FORMATADA!
  ...
}
```

#### Passo 4: Verifique a Tela Visualmente

**A tela "Minha Unidade" deve mostrar:**

```
┌─────────────────────────────────────┐
│ APARTAMENTO                         │
│ 103                            ✅   │
│ Bloco A                             │
├─────────────────────────────────────┤
│ LOCALIZAÇÃO                         │
│ Rua Central, 789, São Paulo    ✅   │
│ 103, Bloco A                        │
├─────────────────────────────────────┤
│ DESDE                               │
│ Janeiro 2023                   ✅   │
├─────────────────────────────────────┤
│ TIPO                                │
│ Morador                        ✅   │
├─────────────────────────────────────┤
│ VAGAS                               │
│ Em breve                       ✅   │
└─────────────────────────────────────┘
```

---

## ❌ Problemas Comuns e Soluções

### Problema 1: `cond_id` ainda é `undefined`

**Logs:**
```
🆔 [UnitDetails] condId: undefined  ❌
```

**Solução:**
1. Verifique se fez logout e login novamente
2. Teste o endpoint `/usuario/perfil/1` diretamente
3. Verifique se o SQL está correto: `c.Cond_ID as cond_id`

---

### Problema 2: `condominioData` é `null`

**Logs:**
```
🏘️ [UnitDetails] condominioData: null  ❌
```

**Possíveis Causas:**
- `cond_id` não está sendo retornado (veja Problema 1)
- API `/condominio/:id` não existe ou retorna erro
- Erro de permissão/autenticação

**Solução:**
1. Teste `GET /condominio/1` diretamente
2. Verifique logs de erro no console
3. Verifique se a rota existe no backend

---

### Problema 3: Endereço mostra "Não informado"

**Logs:**
```
📋 endereco: "Não informado"  ❌
```

**Possíveis Causas:**
- `condominioData` é `null` (veja Problema 2)
- API de condomínio não retorna `cond_endereco` ou `cond_cidade`

**Solução:**
1. Teste `GET /condominio/1` e verifique resposta
2. Certifique-se que o SELECT da rota inclui `cond_endereco` e `cond_cidade`

---

### Problema 4: Data mostra "Não informado"

**Logs:**
```
📋 registrationDate: "Não informado"  ❌
```

**Solução:**
- Verifique se `userap_data_cadastro` está na resposta de `/usuario/perfil/1`
- SQL deve ter: `ua.UserAp_DataCadastro as userap_data_cadastro`

---

## ✅ Checklist Final

Marque conforme for validando:

### Backend
- [ ] Endpoint `/usuario/perfil/1` retorna `cond_id`
- [ ] Endpoint `/usuario/perfil/1` retorna `userap_data_cadastro`
- [ ] Endpoint `/condominio/1` retorna `cond_endereco`
- [ ] Endpoint `/condominio/1` retorna `cond_cidade`

### App Mobile (Logs)
- [ ] `condId: 1` (não `undefined`)
- [ ] `condominioData:` com dados (não `null`)
- [ ] `enderecoCompleto: "Rua..., Cidade"` (não "Não informado")
- [ ] `registrationDate: "Mês Ano"` (não "Não informado")

### App Mobile (Tela)
- [ ] **LOCALIZAÇÃO**: mostra endereço completo com cidade
- [ ] **DESDE**: mostra data formatada (ex: "Janeiro 2023")
- [ ] **APARTAMENTO**: mostra número correto
- [ ] **TIPO**: mostra tipo de usuário

---

## 🎉 Sucesso!

Se todos os itens estiverem ✅, a integração está completa!

**Próximos passos:**
- Implementar edição de perfil
- Adicionar upload de foto
- Implementar funcionalidade de vagas
