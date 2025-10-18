# API de Usuário e Apartamento - Documentação

## 📋 Resumo

Este documento descreve as APIs implementadas para gerenciar perfil de usuário e informações de unidade (apartamento) no aplicativo CondoWay.

## 🔧 Endpoints Implementados

### 1. Buscar Perfil do Usuário
```javascript
apiService.buscarPerfilUsuario(userId)
```

**Endpoint**: `GET /usuario_apartamento/:userId`

**Descrição**: Retorna todos os dados do perfil do usuário, incluindo informações pessoais e da unidade.

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "dados": {
    "User_ID": 1,
    "user_nome": "Ana Clara Silva",
    "user_email": "ana.clara@email.com",
    "user_telefone": "(11) 98765-4321",
    "user_foto": "url_da_foto.jpg",
    "Apto_ID": 72,
    "apto_numero": "72",
    "bloco_nome": "Bloco B",
    "cond_nome": "Residencial Jardins",
    "userap_tipo": "morador"
  }
}
```

---

### 2. Atualizar Perfil do Usuário
```javascript
apiService.atualizarPerfilUsuario(userId, dadosPerfil)
```

**Endpoint**: `PUT /usuario_apartamento/:userId`

**Descrição**: Atualiza os dados do perfil do usuário.

**Parâmetros**:
```javascript
{
  user_nome: "Novo Nome",
  user_email: "novo@email.com",
  user_telefone: "(11) 99999-9999"
}
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Perfil atualizado com sucesso",
  "dados": { /* dados atualizados */ }
}
```

---

### 3. Buscar Detalhes da Unidade
```javascript
apiService.buscarDetalhesUnidade(unidadeId)
```

**Endpoint**: `GET /apartamento/:unidadeId`

**Descrição**: Retorna informações detalhadas da unidade (apartamento).

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "dados": {
    "Apto_ID": 72,
    "apto_numero": "72",
    "apto_area": "85m²",
    "apto_quartos": 3,
    "apto_banheiros": 2,
    "apto_vagas": 1,
    "bloco_nome": "Bloco B",
    "cond_nome": "Residencial Jardins"
  }
}
```

---

### 4. Listar Usuários da Unidade
```javascript
apiService.listarUsuariosUnidade(unidadeId)
```

**Endpoint**: `GET /apartamento/:unidadeId/usuarios`

**Descrição**: Lista todos os usuários vinculados a uma unidade.

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "dados": [
    {
      "User_ID": 1,
      "user_nome": "Ana Clara Silva",
      "userap_tipo": "proprietario"
    },
    {
      "User_ID": 2,
      "user_nome": "João Silva",
      "userap_tipo": "morador"
    }
  ]
}
```

---

### 5. Alterar Senha
```javascript
apiService.alterarSenha(userId, senhaAtual, novaSenha)
```

**Endpoint**: `PATCH /usuario/:userId/senha`

**Descrição**: Altera a senha do usuário.

**Parâmetros**:
```javascript
{
  senha_atual: "senhaAntiga123",
  nova_senha: "novaSenha456"
}
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Senha alterada com sucesso"
}
```

---

### 6. Upload de Foto de Perfil
```javascript
apiService.uploadFotoPerfil(userId, fileUri)
```

**Endpoint**: `POST /usuario/:userId/foto`

**Descrição**: Faz upload da foto de perfil do usuário.

**Headers**: `Content-Type: multipart/form-data`

**Body**: FormData com arquivo de imagem

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Foto atualizada com sucesso",
  "dados": {
    "user_foto": "https://servidor.com/uploads/perfil_1.jpg",
    "url": "https://servidor.com/uploads/perfil_1.jpg"
  }
}
```

---

## 🎣 Hook Customizado: `useProfile`

O hook `useProfile` foi criado para facilitar o uso dessas APIs nas telas.

### Uso Básico

```javascript
import { useProfile } from '../../../../hooks/useProfile';

function MinhaTelaDePerfi() {
  const { 
    user,           // Dados do usuário logado
    profileData,    // Dados completos do perfil
    unitData,       // Dados da unidade
    loading,        // Estado de carregamento
    error,          // Mensagens de erro
    
    // Funções
    loadProfile,
    loadUnitDetails,
    updateProfile,
    changePassword,
    uploadProfilePhoto,
    handlePickImage,
    getUserTypeLabel
  } = useProfile();

  // O perfil é carregado automaticamente
  // Você pode usar profileData, unitData, etc.
}
```

### Métodos Disponíveis

#### `loadProfile()`
Carrega os dados do perfil do usuário logado.

```javascript
useEffect(() => {
  loadProfile();
}, []);
```

#### `loadUnitDetails(unidadeId?)`
Carrega os detalhes da unidade. Se não passar o ID, usa o ID da unidade do perfil.

```javascript
useEffect(() => {
  if (profileData?.Apto_ID) {
    loadUnitDetails();
  }
}, [profileData]);
```

#### `updateProfile(dadosAtualizados)`
Atualiza o perfil do usuário.

```javascript
const handleSave = async () => {
  try {
    await updateProfile({
      user_nome: "Novo Nome",
      user_email: "novo@email.com",
      user_telefone: "(11) 99999-9999"
    });
    Alert.alert('Sucesso', 'Perfil atualizado!');
  } catch (error) {
    Alert.alert('Erro', error.message);
  }
};
```

#### `changePassword(senhaAtual, novaSenha)`
Altera a senha do usuário.

```javascript
const handleChangePassword = async () => {
  try {
    await changePassword('senhaAntiga123', 'novaSenha456');
    Alert.alert('Sucesso', 'Senha alterada!');
  } catch (error) {
    Alert.alert('Erro', error.message);
  }
};
```

#### `uploadProfilePhoto(fileUri)`
Faz upload de uma foto de perfil.

```javascript
const handleUpload = async (uri) => {
  try {
    await uploadProfilePhoto(uri);
    Alert.alert('Sucesso', 'Foto atualizada!');
  } catch (error) {
    Alert.alert('Erro', error.message);
  }
};
```

#### `handlePickImage()`
Abre o seletor de imagens e faz upload automaticamente.

```javascript
<TouchableOpacity onPress={handlePickImage}>
  <Text>Alterar Foto</Text>
</TouchableOpacity>
```

#### `getUserTypeLabel(userType)`
Converte o código do tipo de usuário em um label legível.

```javascript
getUserTypeLabel('morador')      // "Morador"
getUserTypeLabel('proprietario') // "Proprietário"
getUserTypeLabel('sindico')      // "Síndico"
getUserTypeLabel('porteiro')     // "Porteiro"
```

---

## 📱 Telas Atualizadas

### ✅ EditProfile (Editar Perfil)
**Localização**: `src/screens/App/Perfil/EditProfile/index.js`

**Status**: ✅ **Conectado à API**

**Funcionalidades**:
- Carregar dados do perfil automaticamente
- Editar nome, email e telefone
- Upload de foto de perfil com feedback visual
- Salvar alterações no backend
- Tratamento de erros
- Loading state

**Uso**:
```javascript
// A tela já está conectada e pronta para uso
// Basta navegar para ela
navigation.navigate('EditProfile');
```

### 🔄 UnitDetails (Detalhes da Unidade)
**Localização**: `src/screens/App/Perfil/UnitDetails/index.js`

**Status**: ⚠️ **Aguardando integração**

**Próximos passos**:
- Conectar ao `useProfile`
- Carregar dados reais da API
- Remover dados mockados

---

## 🚀 Próximas Implementações

### Telas que precisam ser conectadas:
1. ⚠️ **Security** - Alterar senha
2. ⚠️ **UnitDetails** - Detalhes da unidade
3. ⚠️ **Perfil** (tela principal) - Exibir dados do perfil

### APIs ainda não implementadas:
1. **Documentos do Condomínio**
   - Listar documentos
   - Download de documentos

2. **Preferências de Notificação**
   - Buscar preferências
   - Atualizar preferências

3. **Reservas**
   - Criar reserva
   - Listar reservas
   - Cancelar reserva
   - Listar ambientes
   - Buscar horários disponíveis

---

## 📝 Exemplo Completo de Uso

```javascript
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useProfile } from '../../../hooks/useProfile';

export default function PerfilScreen() {
  const { 
    user,
    profileData,
    unitData,
    loading,
    loadProfile,
    loadUnitDetails,
    updateProfile,
    handlePickImage 
  } = useProfile();

  useEffect(() => {
    // Carrega o perfil ao montar o componente
    loadProfile();
  }, []);

  useEffect(() => {
    // Carrega detalhes da unidade quando o perfil estiver disponível
    if (profileData?.Apto_ID) {
      loadUnitDetails();
    }
  }, [profileData]);

  const handleUpdate = async () => {
    try {
      await updateProfile({
        user_nome: 'Novo Nome',
        user_email: 'novo@email.com',
        user_telefone: '(11) 99999-9999'
      });
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View>
      <Text>Nome: {profileData?.user_nome}</Text>
      <Text>Email: {profileData?.user_email}</Text>
      <Text>Apartamento: {profileData?.apto_numero}</Text>
      <Text>Bloco: {profileData?.bloco_nome}</Text>
      
      <TouchableOpacity onPress={handlePickImage}>
        <Text>Alterar Foto</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleUpdate}>
        <Text>Atualizar Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## ✅ Checklist de Implementação

- [x] APIs adicionadas ao `apiService`
- [x] Hook `useProfile` criado
- [x] Tela `EditProfile` conectada
- [x] Upload de foto implementado
- [x] Tratamento de erros
- [x] Loading states
- [x] Atualização do contexto de autenticação
- [ ] Tela `UnitDetails` conectada
- [ ] Tela `Security` (alterar senha) conectada
- [ ] Tela principal de `Perfil` conectada

---

## 📌 Observações Importantes

1. **Autenticação**: Todas as requisições usam o token JWT armazenado no `AuthContext`.

2. **Sincronização**: O hook `useProfile` atualiza automaticamente o `AuthContext` quando o perfil é alterado.

3. **Cache**: Os dados do perfil são carregados uma vez e armazenados no state. Para recarregar, chame `loadProfile()` novamente.

4. **Erros**: Todos os erros são capturados e podem ser exibidos através do state `error` do hook.

5. **Loading**: O state `loading` é atualizado durante todas as operações assíncronas.

---

**Data de criação**: 03/10/2025  
**Última atualização**: 03/10/2025  
**Versão**: 1.0
