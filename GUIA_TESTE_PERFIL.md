# 🧪 Guia de Teste - Integração de Perfil

## ✅ O que foi atualizado

1. **API Service** (`src/services/api.js`)
   - ✅ Endpoint atualizado de `/usuario_apartamento/:userId` para `/usuario/perfil/:userId`
   - ✅ Removido mock de dados
   - ✅ Login normaliza `user_id` e `User_ID` automaticamente

2. **Hook useProfile** (`src/hooks/useProfile.js`)
   - ✅ Já estava preparado para usar `user_id` ou `User_ID`
   - ✅ Logs detalhados para debug

3. **Telas de Perfil**
   - ✅ EditProfile usa `profileData.ap_numero`, `profileData.bloc_nome`, `profileData.cond_nome`
   - ✅ Dashboard mostra avatar do usuário

---

## 🚀 Como Testar

### 1️⃣ **Limpar dados antigos (IMPORTANTE)**

Execute no app ou terminal:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Limpar AsyncStorage
await AsyncStorage.clear();
```

Ou simplesmente:
- **Android**: Desinstale e reinstale o app
- **iOS**: Settings > App > Clear Data

### 2️⃣ **Fazer Login**

1. Abra o app
2. Faça login com suas credenciais
3. **Verifique os logs no console:**

```
📦 Resposta do login: { "sucesso": true, "dados": { ... } }
✅ UserData processado e normalizado: { 
  "user_id": 1,
  "User_ID": 1,
  "userap_id": 1,
  ...
}
💾 Usuário salvo no AsyncStorage
```

### 3️⃣ **Navegar para o Perfil**

1. Clique no ícone de perfil no Dashboard
2. **Logs esperados:**

```
🔄 [useProfile] Carregando perfil do usuário...
🆔 [useProfile] userId: 1
🔄 [API] Buscando perfil completo para o usuário ID: 1...
✅ [API] Perfil recebido: {
  "user_nome": "João Silva",
  "user_email": "joao@email.com",
  "ap_numero": "101",
  "bloc_nome": "Bloco A",
  "cond_nome": "Residencial Jardins"
}
✅ [useProfile] Perfil carregado
```

### 4️⃣ **Editar Perfil**

1. Clique em "Editar Perfil"
2. **Verifique se os dados aparecem:**

```
📦 [EditProfile] profileData recebido: { ap_numero: "101", bloc_nome: "Bloco A", ... }
👤 [EditProfile] user recebido: { user_id: 1, User_ID: 1, ... }
  - Apartamento: 101
  - Bloco: Bloco A
  - Condomínio: Residencial Jardins
```

3. Os campos devem exibir:
   - ✅ **Nome:** [nome do usuário]
   - ✅ **Email:** [email do usuário]
   - ✅ **Telefone:** [telefone do usuário]
   - ✅ **Apartamento:** [número do apartamento]
   - ✅ **Bloco:** [nome do bloco]
   - ✅ **Condomínio:** [nome do condomínio]

---

## ❌ Problemas Comuns

### Problema 1: "Cannot GET /usuario/perfil/undefined"

**Causa:** `user_id` não está definido

**Solução:**
1. Limpe o AsyncStorage
2. Faça logout
3. Faça login novamente
4. Verifique os logs do login

### Problema 2: Campos mostram "Não informado"

**Causa:** Backend não está retornando os dados ou nomes de campos diferentes

**Solução:**
1. Verifique os logs: `📦 [API] Perfil recebido:`
2. Confirme que o backend retorna: `ap_numero`, `bloc_nome`, `cond_nome`
3. Se os nomes forem diferentes, ajuste em `EditProfile/index.js`:

```javascript
// Ajuste conforme os nomes retornados pela API
const apartment = profileData?.ap_numero || profileData?.apto_numero || 'Não informado';
const block = profileData?.bloc_nome || profileData?.bloco_nome || 'Não informado';
const condominium = profileData?.cond_nome || profileData?.condominio_nome || 'Não informado';
```

### Problema 3: "user_id is undefined" nos logs

**Causa:** Dados antigos no AsyncStorage

**Solução:**
```javascript
// No console do React Native:
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ver o que está salvo:
const user = await AsyncStorage.getItem('user');
console.log('User no storage:', JSON.parse(user));

// Se não tiver user_id, limpe:
await AsyncStorage.removeItem('user');
```

### Problema 4: Erro 404 no endpoint

**Causa:** Backend não está rodando ou rota não existe

**Solução:**
1. Confirme que o backend está rodando: `http://10.67.23.46:3333`
2. Teste o endpoint diretamente:

```bash
curl http://10.67.23.46:3333/usuario/perfil/1
```

3. Deve retornar:
```json
{
  "sucesso": true,
  "mensagem": "Perfil do usuário carregado com sucesso.",
  "dados": { ... }
}
```

---

## 🔍 Comandos Úteis para Debug

### Ver dados do AsyncStorage
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const user = await AsyncStorage.getItem('user');
console.log('📦 User:', JSON.parse(user));
```

### Testar endpoint manualmente
```javascript
import { apiService } from './src/services/api';

// No console do app:
const perfil = await apiService.buscarPerfilUsuario(1);
console.log('Perfil:', perfil);
```

### Forçar reload do perfil
```javascript
// Em qualquer componente que usa useProfile:
const { loadProfile } = useProfile();
await loadProfile();
```

---

## ✅ Checklist de Validação

Antes de considerar o teste completo, verifique:

- [ ] Login retorna `user_id` e `User_ID`
- [ ] AsyncStorage salva os dados corretamente
- [ ] useProfile carrega automaticamente ao abrir o Perfil
- [ ] Logs mostram `🆔 [useProfile] userId: [número]`
- [ ] Logs mostram `✅ [API] Perfil recebido: { ... }`
- [ ] EditProfile exibe todos os campos corretamente
- [ ] Não há mensagem "Não informado" nos campos de localização
- [ ] Avatar aparece no Dashboard (se tiver foto)
- [ ] Sem erros 404 no console

---

## 📊 Estrutura de Logs Esperada

```
=== LOGIN ===
🔄 Fazendo login na API...
📦 Resposta do login: { sucesso: true, dados: { user_id: 1, ... } }
✅ UserData processado e normalizado: { user_id: 1, User_ID: 1, userap_id: 1 }
💾 Usuário salvo no AsyncStorage

=== CARREGAR PERFIL ===
🔄 [useProfile] Carregando perfil do usuário...
🆔 [useProfile] userId: 1
🔄 [API] Buscando perfil completo para o usuário ID: 1...
✅ [API] Perfil recebido: { user_nome: "...", ap_numero: "101", ... }
✅ [useProfile] Perfil carregado

=== EDIT PROFILE ===
📦 [EditProfile] profileData recebido: { ap_numero: "101", bloc_nome: "Bloco A", ... }
👤 [EditProfile] user recebido: { user_id: 1, User_ID: 1, ... }
  - Apartamento: 101
  - Bloco: Bloco A
  - Condomínio: Residencial Jardins
```

---

## 🎯 Próximos Passos

Após validar que tudo funciona:

1. **Implementar upload de foto**
   - Endpoint: `POST /usuario/perfil/:userId/foto`
   - Usar `expo-image-picker` + FormData

2. **Implementar edição de dados**
   - Endpoint: `PUT /usuario/perfil/:userId`
   - Permitir editar nome e telefone

3. **Adicionar pull-to-refresh**
   - Permitir atualizar os dados puxando a tela para baixo

4. **Cache inteligente**
   - Salvar profileData no AsyncStorage
   - Evitar requisições desnecessárias

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique todos os logs no console
2. Confirme que o backend está rodando
3. Teste o endpoint diretamente (Postman/curl)
4. Limpe o AsyncStorage e faça login novamente
