# API de Condomínio - Documentação

## 📋 Resumo

Este documento descreve as APIs implementadas para gerenciar informações de condomínios no aplicativo CondoWay.

## 🗄️ Estrutura do Banco de Dados

```sql
CREATE TABLE Condominio (
    cond_id INT AUTO_INCREMENT PRIMARY KEY,
    cond_nome VARCHAR(60) NOT NULL,
    cond_endereco VARCHAR(130),
    cond_cidade VARCHAR(60)
) ENGINE=InnoDB;
```

## 🔧 Endpoints Implementados

### 1. Buscar Condomínio
```javascript
apiService.buscarCondominio(condominioId)
```

**Endpoint**: `GET /condominio/:condominioId`

**Descrição**: Retorna informações de um condomínio específico.

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "dados": {
    "cond_id": 1,
    "cond_nome": "Residencial Jardins",
    "cond_endereco": "Rua das Flores, 123 - Centro",
    "cond_cidade": "São Paulo - SP"
  }
}
```

---

### 2. Listar Condomínios
```javascript
apiService.listarCondominios()
```

**Endpoint**: `GET /condominio`

**Descrição**: Lista todos os condomínios cadastrados.

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "dados": [
    {
      "cond_id": 1,
      "cond_nome": "Residencial Jardins",
      "cond_endereco": "Rua das Flores, 123",
      "cond_cidade": "São Paulo - SP"
    },
    {
      "cond_id": 2,
      "cond_nome": "Condomínio Portal",
      "cond_endereco": "Av. Principal, 456",
      "cond_cidade": "Campinas - SP"
    }
  ]
}
```

---

### 3. Criar Condomínio
```javascript
apiService.criarCondominio(dadosCondominio)
```

**Endpoint**: `POST /condominio`

**Descrição**: Cria um novo condomínio (requer permissões de admin/síndico).

**Parâmetros**:
```javascript
{
  cond_nome: "Novo Condomínio",
  cond_endereco: "Rua Exemplo, 789 - Bairro",
  cond_cidade: "São Paulo - SP"
}
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Condomínio criado com sucesso",
  "dados": {
    "cond_id": 3,
    "cond_nome": "Novo Condomínio",
    "cond_endereco": "Rua Exemplo, 789 - Bairro",
    "cond_cidade": "São Paulo - SP"
  }
}
```

---

### 4. Atualizar Condomínio
```javascript
apiService.atualizarCondominio(condominioId, dadosCondominio)
```

**Endpoint**: `PUT /condominio/:condominioId`

**Descrição**: Atualiza informações de um condomínio (requer permissões de admin/síndico).

**Parâmetros**:
```javascript
{
  cond_nome: "Nome Atualizado",
  cond_endereco: "Novo Endereço, 999",
  cond_cidade: "São Paulo - SP"
}
```

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Condomínio atualizado com sucesso",
  "dados": {
    "cond_id": 1,
    "cond_nome": "Nome Atualizado",
    "cond_endereco": "Novo Endereço, 999",
    "cond_cidade": "São Paulo - SP"
  }
}
```

---

### 5. Deletar Condomínio
```javascript
apiService.deletarCondominio(condominioId)
```

**Endpoint**: `DELETE /condominio/:condominioId`

**Descrição**: Remove um condomínio (requer permissões de admin).

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "mensagem": "Condomínio deletado com sucesso"
}
```

---

### 6. Buscar Estatísticas do Condomínio
```javascript
apiService.buscarEstatisticasCondominio(condominioId)
```

**Endpoint**: `GET /condominio/:condominioId/estatisticas`

**Descrição**: Retorna estatísticas do condomínio (total de apartamentos, moradores, etc.).

**Resposta Esperada**:
```json
{
  "sucesso": true,
  "dados": {
    "total_apartamentos": 120,
    "total_moradores": 350,
    "total_blocos": 4,
    "total_vagas": 180,
    "area_comum": "2500m²"
  }
}
```

---

## 🎣 Hook Customizado: `useCondominio`

O hook `useCondominio` facilita o gerenciamento de dados de condomínio nas telas.

### Uso Básico

```javascript
import { useCondominio } from '../../../hooks/useCondominio';

function MinhaTelaDeCondominio() {
  const { 
    condominioData,      // Dados do condomínio
    condominios,         // Lista de condomínios
    estatisticas,        // Estatísticas do condomínio
    loading,             // Estado de carregamento
    error,               // Mensagens de erro
    
    // Funções
    loadCondominio,
    loadCondominios,
    createCondominio,
    updateCondominio,
    deleteCondominio,
    loadEstatisticas,
    
    // Utilitários
    condominioId,        // ID do condomínio atual
  } = useCondominio();

  // O condomínio do usuário é carregado automaticamente
}
```

### Parâmetros do Hook

```javascript
// Carrega condomínio específico
const { condominioData } = useCondominio(5); // ID do condomínio

// Carrega condomínio do usuário logado (padrão)
const { condominioData } = useCondominio();
```

### Métodos Disponíveis

#### `loadCondominio(condominioId?)`
Carrega dados de um condomínio específico.

```javascript
useEffect(() => {
  loadCondominio(1);
}, []);
```

#### `loadCondominios()`
Lista todos os condomínios.

```javascript
useEffect(() => {
  loadCondominios();
}, []);
```

#### `createCondominio(dadosCondominio)`
Cria um novo condomínio.

```javascript
const handleCreate = async () => {
  try {
    const novoCondominio = await createCondominio({
      cond_nome: "Novo Condomínio",
      cond_endereco: "Rua Exemplo, 789",
      cond_cidade: "São Paulo - SP"
    });
    Alert.alert('Sucesso', 'Condomínio criado!');
  } catch (error) {
    Alert.alert('Erro', error.message);
  }
};
```

#### `updateCondominio(condominioId?, dadosCondominio)`
Atualiza informações do condomínio.

```javascript
const handleUpdate = async () => {
  try {
    await updateCondominio(null, {
      cond_nome: "Nome Atualizado",
      cond_endereco: "Novo Endereço"
    });
    Alert.alert('Sucesso', 'Condomínio atualizado!');
  } catch (error) {
    Alert.alert('Erro', error.message);
  }
};
```

#### `deleteCondominio(condominioId?)`
Deleta um condomínio.

```javascript
const handleDelete = async () => {
  Alert.alert(
    'Confirmar',
    'Deseja realmente deletar este condomínio?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCondominio(1);
            Alert.alert('Sucesso', 'Condomínio deletado!');
          } catch (error) {
            Alert.alert('Erro', error.message);
          }
        }
      }
    ]
  );
};
```

#### `loadEstatisticas(condominioId?)`
Carrega estatísticas do condomínio.

```javascript
useEffect(() => {
  if (condominioId) {
    loadEstatisticas();
  }
}, [condominioId]);
```

---

## 🎨 Componente: `CondominioCard`

Um componente pronto para exibir informações do condomínio.

### Uso

```javascript
import CondominioCard from '../../../components/CondominioCard';

function Dashboard() {
  const handlePress = () => {
    navigation.navigate('CondominioDetails');
  };

  return (
    <View>
      <CondominioCard onPress={handlePress} />
    </View>
  );
}
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `onPress` | `function` | Callback ao tocar no card (opcional) |
| `style` | `object` | Estilos customizados (opcional) |

### Exemplo Visual

O componente exibe:
- ✅ Ícone de condomínio
- ✅ Nome do condomínio
- ✅ Endereço completo
- ✅ Cidade
- ✅ Loading state
- ✅ Tema claro/escuro

---

## 📱 Exemplos de Uso nas Telas

### Dashboard - Exibir Condomínio

```javascript
import React from 'react';
import { View } from 'react-native';
import CondominioCard from '../../components/CondominioCard';

export default function Dashboard() {
  const navigation = useNavigation();

  return (
    <View>
      <CondominioCard 
        onPress={() => navigation.navigate('CondominioDetails')}
      />
    </View>
  );
}
```

---

### Perfil - Informações do Usuário com Condomínio

```javascript
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { useCondominio } from '../../hooks/useCondominio';

export default function PerfilScreen() {
  const { profileData } = useProfile();
  const { condominioData, loadCondominio } = useCondominio();

  useEffect(() => {
    if (profileData?.Cond_ID) {
      loadCondominio(profileData.Cond_ID);
    }
  }, [profileData]);

  return (
    <View>
      <Text>Nome: {profileData?.user_nome}</Text>
      <Text>Condomínio: {condominioData?.cond_nome}</Text>
      <Text>Endereço: {condominioData?.cond_endereco}</Text>
    </View>
  );
}
```

---

### Admin - Gerenciar Condomínios

```javascript
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useCondominio } from '../../hooks/useCondominio';

export default function GerenciarCondominios() {
  const { 
    condominios, 
    loading, 
    loadCondominios, 
    deleteCondominio 
  } = useCondominio();

  useEffect(() => {
    loadCondominios();
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar',
      'Deseja deletar este condomínio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              await deleteCondominio(id);
              Alert.alert('Sucesso', 'Condomínio deletado!');
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <FlatList
      data={condominios}
      keyExtractor={(item) => item.cond_id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.cond_nome}</Text>
          <Text>{item.cond_endereco}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.cond_id)}>
            <Text>Deletar</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}
```

---

## 🔐 Permissões

| Endpoint | Morador | Proprietário | Síndico | Admin |
|----------|---------|--------------|---------|-------|
| `GET /condominio/:id` | ✅ | ✅ | ✅ | ✅ |
| `GET /condominio` | ✅ | ✅ | ✅ | ✅ |
| `POST /condominio` | ❌ | ❌ | ✅ | ✅ |
| `PUT /condominio/:id` | ❌ | ❌ | ✅ | ✅ |
| `DELETE /condominio/:id` | ❌ | ❌ | ❌ | ✅ |
| `GET /condominio/:id/estatisticas` | ✅ | ✅ | ✅ | ✅ |

---

## ✅ Checklist de Implementação

- [x] APIs adicionadas ao `apiService`
- [x] Hook `useCondominio` criado
- [x] Componente `CondominioCard` criado
- [x] Documentação completa
- [x] Exemplos de uso
- [ ] Tela de detalhes do condomínio
- [ ] Tela de gerenciamento (admin/síndico)
- [ ] Tela de estatísticas

---

## 📝 Exemplo Completo: Tela de Detalhes do Condomínio

```javascript
import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Building2, Users } from 'lucide-react-native';
import { useCondominio } from '../../../hooks/useCondominio';
import { useTheme } from '../../../contexts/ThemeProvider';
import { Loading } from '../../../components/Loading';

export default function CondominioDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  
  const { 
    condominioData, 
    estatisticas,
    loading, 
    loadCondominio,
    loadEstatisticas 
  } = useCondominio(route.params?.condominioId);

  useEffect(() => {
    if (route.params?.condominioId) {
      loadCondominio(route.params.condominioId);
      loadEstatisticas(route.params.condominioId);
    }
  }, [route.params?.condominioId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 16, color: theme.colors.text }}>
          Detalhes do Condomínio
        </Text>
      </View>

      <ScrollView>
        {/* Informações Básicas */}
        <View style={{ padding: 16, backgroundColor: theme.colors.card, margin: 16, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Building2 size={24} color={theme.colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 12, color: theme.colors.text }}>
              {condominioData?.cond_nome}
            </Text>
          </View>

          {condominioData?.cond_endereco && (
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <MapPin size={16} color={theme.colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: theme.colors.text }}>
                {condominioData.cond_endereco}
              </Text>
            </View>
          )}

          {condominioData?.cond_cidade && (
            <View style={{ flexDirection: 'row' }}>
              <MapPin size={16} color={theme.colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: theme.colors.text }}>
                {condominioData.cond_cidade}
              </Text>
            </View>
          )}
        </View>

        {/* Estatísticas */}
        {estatisticas && (
          <View style={{ padding: 16, backgroundColor: theme.colors.card, margin: 16, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: theme.colors.text }}>
              Estatísticas
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: theme.colors.textSecondary }}>Total de Apartamentos</Text>
              <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>
                {estatisticas.total_apartamentos}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: theme.colors.textSecondary }}>Total de Moradores</Text>
              <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>
                {estatisticas.total_moradores}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.textSecondary }}>Total de Blocos</Text>
              <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>
                {estatisticas.total_blocos}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

**Data de criação**: 03/10/2025  
**Última atualização**: 03/10/2025  
**Versão**: 1.0
