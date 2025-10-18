# 🔧 Melhorias e Otimizações do Projeto CondoWay

**Data da Análise**: 06/10/2025  
**Versão**: 1.0.0

---

## 📋 Índice
1. [Arquivos Não Utilizados](#1-arquivos-não-utilizados)
2. [Implementar Paginação](#2-implementar-paginação)
3. [Otimizações de Performance](#3-otimizações-de-performance)
4. [Melhorias de Código](#4-melhorias-de-código)
5. [Segurança](#5-segurança)
6. [UX/UI](#6-uxui)
7. [Testes](#7-testes)
8. [Priorização](#8-priorização)

---

## 1. 🗑️ Arquivos Não Utilizados

### ❌ Arquivos para DELETAR:

#### **1.1 Placeholders não utilizados**
```
📁 src/screens/App/Perfil/Placeholders/
  ├── About.js ❌ (usado em ProfileStack mas tela já existe)
  ├── ChangePassword.js ❌ (usado em ProfileStack mas tela Security já existe)
  ├── Documents.js ❌ (placeholder não usado)
  ├── EditProfile.js ❌ (placeholder não usado)
  ├── Security.js ❌ (placeholder não usado)
  └── UnitDetails.js ❌ (placeholder não usado)
```
**Ação**: Deletar toda a pasta `Placeholders/` e atualizar `ProfileStack.js`

#### **1.2 Arquivos duplicados/antigos**
```
❌ src/screens/App/Perfil/index_new.js (arquivo duplicado)
❌ src/screens/App/Visitantes/AuthorizeVisitorScreen_NEW.js (arquivo duplicado)
```

#### **1.3 Mock não utilizado** (após edição manual)
```
⚠️ src/screens/App/Perfil/mock.js
```
**Status**: Verificar se ainda está sendo importado em `Documents/index.js`
- Se Documents foi atualizado para API, deletar `mock.js`

#### **1.4 Pasta temporária**
```
❌ tmp_dicionario/ (apenas documentação temporária)
```
**Ação**: Mover conteúdo para documentação oficial ou deletar

---

## 2. 📄 Implementar Paginação

### 🎯 APIs que PRECISAM de Paginação:

#### **2.1 Ocorrências** (Alta Prioridade)
```javascript
// ANTES (api.js)
buscarOcorrencias: async () => {
  const response = await api.get('/ocorrencias');
  return response.data.dados || [];
}

// DEPOIS (com paginação)
buscarOcorrencias: async (page = 1, limit = 20, filtros = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filtros
  });
  const response = await api.get(`/ocorrencias?${params}`);
  return {
    dados: response.data.dados || [],
    totalPages: response.data.totalPages || 1,
    currentPage: response.data.currentPage || 1,
    totalItems: response.data.total || 0
  };
}
```

**Motivo**: Condomínios com muitas ocorrências podem ter centenas de registros.

#### **2.2 Visitantes** (Alta Prioridade)
```javascript
// ANTES
listarVisitantes: async (filtros = {}) => {
  const response = await api.get('/visitantes', { params: filtros });
  return response.data.dados || [];
}

// DEPOIS (com paginação)
listarVisitantes: async (page = 1, limit = 20, filtros = {}) => {
  const params = {
    page,
    limit,
    ...filtros
  };
  const response = await api.get('/visitantes', { params });
  return {
    dados: response.data.dados || [],
    pagination: {
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.currentPage || 1,
      total: response.data.total || 0,
      hasMore: response.data.hasMore || false
    }
  };
}
```

#### **2.3 Documentos** (Média Prioridade)
```javascript
// DEPOIS (com paginação)
listarDocumentos: async (condominioId, page = 1, limit = 30) => {
  const response = await api.get(`/documentos/condominio/${condominioId}`, {
    params: { page, limit }
  });
  return {
    dados: response.data.dados || [],
    pagination: response.data.pagination
  };
}
```

#### **2.4 Encomendas** (Média Prioridade)
```javascript
getEncomendas: async (page = 1, limit = 20, status = null) => {
  const params = { page, limit };
  if (status) params.status = status;
  
  const response = await api.get('/encomendas', { params });
  return {
    dados: response.data.dados || [],
    pagination: response.data.pagination
  };
}
```

#### **2.5 Notificações** (Alta Prioridade)
```javascript
getNotificacoes: async (userId, page = 1, limit = 20, unreadOnly = false) => {
  const params = { page, limit, userId };
  if (unreadOnly) params.lidas = false;
  
  const response = await api.get('/notificacoes', { params });
  return {
    dados: response.data.dados || [],
    pagination: response.data.pagination,
    unreadCount: response.data.unreadCount
  };
}
```

### 📱 Implementar Infinite Scroll

**Componente Reutilizável**: `src/components/InfiniteScrollList/index.js`

```javascript
import React, { useState, useCallback } from 'react';
import { FlatList, ActivityIndicator, View, Text } from 'react-native';

export const InfiniteScrollList = ({ 
  fetchData,      // Função que retorna { dados, hasMore }
  renderItem,     // Componente de item
  initialPage = 1,
  pageSize = 20,
  emptyMessage = 'Nenhum item encontrado'
}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await fetchData(page, pageSize);
      setData(prev => [...prev, ...result.dados]);
      setHasMore(result.hasMore || result.dados.length === pageSize);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao carregar mais:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchData, pageSize]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    try {
      const result = await fetchData(1, pageSize);
      setData(result.dados);
      setHasMore(result.hasMore || result.dados.length === pageSize);
      setPage(2);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchData, pageSize]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, color: '#999' }}>{emptyMessage}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={!loading ? renderEmpty : null}
    />
  );
};
```

**Uso no código**:
```javascript
import { InfiniteScrollList } from '../../components/InfiniteScrollList';

// Em Ocorrências
<InfiniteScrollList
  fetchData={(page, limit) => apiService.buscarOcorrencias(page, limit)}
  renderItem={({ item }) => <OcorrenciaCard ocorrencia={item} />}
  emptyMessage="Nenhuma ocorrência encontrada"
/>
```

---

## 3. ⚡ Otimizações de Performance

### 3.1 Implementar Cache com React Query
```bash
npm install @tanstack/react-query
```

**Configuração**: `src/lib/queryClient.js`
```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Exemplo de uso**:
```javascript
import { useQuery } from '@tanstack/react-query';

const useOcorrencias = () => {
  return useQuery({
    queryKey: ['ocorrencias'],
    queryFn: () => apiService.buscarOcorrencias(),
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
};
```

### 3.2 Otimizar Imagens
- Implementar lazy loading de imagens
- Usar `react-native-fast-image` para cache de imagens
- Comprimir uploads antes de enviar

### 3.3 Debounce em Buscas
```javascript
import { useDebounce } from '../hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500); // 500ms delay

useEffect(() => {
  if (debouncedSearch) {
    searchDocumentos(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 4. 🛠️ Melhorias de Código

### 4.1 Extrair Constantes
**Criar**: `src/constants/api.js`
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://10.67.23.46:3333',
  TIMEOUT: 10000,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },
};

export const ENDPOINTS = {
  OCORRENCIAS: '/ocorrencias',
  VISITANTES: '/visitantes',
  ENCOMENDAS: '/encomendas',
  DOCUMENTOS: '/documentos',
  NOTIFICACOES: '/notificacoes',
  USUARIO_APARTAMENTO: '/usuario_apartamento',
  CONDOMINIO: '/condominio',
};
```

### 4.2 Tipos de Erros Customizados
**Criar**: `src/utils/errors.js`
```javascript
export class ApiError extends Error {
  constructor(message, statusCode, endpoint) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}
```

### 4.3 Interceptor de Refresh Token
```javascript
// Em api.js
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        const { token } = response.data;
        await AsyncStorage.setItem('token', token);
        setAuthToken(token);
        
        return api(originalRequest);
      } catch (err) {
        // Logout automático
        await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 4.4 Validação de Formulários Centralizada
**Criar**: `src/utils/validators.js`
```javascript
export const validators = {
  email: (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : 'E-mail inválido';
  },
  
  phone: (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 ? null : 'Telefone inválido';
  },
  
  cpf: (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11) return 'CPF inválido';
    // Adicionar validação de dígitos verificadores
    return null;
  },
  
  required: (value) => {
    return value && value.trim() ? null : 'Campo obrigatório';
  },
  
  minLength: (min) => (value) => {
    return value.length >= min ? null : `Mínimo de ${min} caracteres`;
  },
};
```

---

## 5. 🔒 Segurança

### 5.1 Variáveis de Ambiente
**Criar**: `.env`
```env
API_BASE_URL=http://10.67.23.46:3333
API_TIMEOUT=10000
SENTRY_DSN=your_sentry_dsn
ANALYTICS_KEY=your_analytics_key
```

**Instalar**: 
```bash
npm install react-native-dotenv
```

### 5.2 Sanitização de Inputs
```javascript
import DOMPurify from 'isomorphic-dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};
```

### 5.3 Rate Limiting
```javascript
// Implementar debounce em ações críticas
const throttledSubmit = useThrottle(handleSubmit, 2000); // 2s entre submits
```

---

## 6. 🎨 UX/UI

### 6.1 Skeleton Loading
**Criar**: `src/components/Skeleton/index.js`
```javascript
import React from 'react';
import { View } from 'react-native';
import * as Animatable from 'react-native-animatable';

export const Skeleton = ({ width, height, style }) => (
  <Animatable.View
    animation={{
      0: { opacity: 0.3 },
      0.5: { opacity: 0.7 },
      1: { opacity: 0.3 },
    }}
    iterationCount="infinite"
    duration={1500}
    style={[
      {
        width,
        height,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
      },
      style,
    ]}
  />
);
```

### 6.2 Pull-to-Refresh Global
Já implementado parcialmente, garantir em todas as listas.

### 6.3 Empty States Melhores
```javascript
const EmptyState = ({ icon: Icon, title, message, action }) => (
  <View style={styles.emptyContainer}>
    <Icon size={64} color="#ccc" />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {action && <TouchableOpacity onPress={action.onPress}>
      <Text style={styles.emptyAction}>{action.label}</Text>
    </TouchableOpacity>}
  </View>
);
```

### 6.4 Feedback Tátil
```javascript
import { Vibration } from 'react-native';

const handleDelete = () => {
  Vibration.vibrate(50); // Vibração curta
  // ... deletar
};
```

---

## 7. 🧪 Testes

### 7.1 Aumentar Cobertura de Testes
```bash
# Rodar testes com coverage
npm test -- --coverage
```

**Meta**: 70% de cobertura

### 7.2 Testes E2E com Detox
```bash
npm install --save-dev detox
```

### 7.3 Testes de Hooks
```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useDocumentos } from '../useDocumentos';

test('deve carregar documentos', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useDocumentos());
  
  expect(result.current.loading).toBe(true);
  
  await waitForNextUpdate();
  
  expect(result.current.loading).toBe(false);
  expect(result.current.documentos).toHaveLength(5);
});
```

---

## 8. 📊 Priorização

### 🔴 Alta Prioridade (Fazer AGORA)

1. **Deletar arquivos não utilizados**
   - ❌ Pasta `Placeholders/`
   - ❌ `index_new.js`
   - ❌ `AuthorizeVisitorScreen_NEW.js`
   - ❌ `tmp_dicionario/` (se não usado)
   - Tempo: 30 minutos

2. **Implementar paginação em Ocorrências**
   - API + Hook + Tela
   - Tempo: 3 horas

3. **Implementar paginação em Visitantes**
   - API + Hook + Tela
   - Tempo: 2 horas

4. **Remover import de mock em Documents**
   - Verificar se ainda está usando `userProfile`
   - Tempo: 15 minutos

### 🟡 Média Prioridade (Próxima Sprint)

5. **Implementar Infinite Scroll Component**
   - Componente reutilizável
   - Tempo: 4 horas

6. **Adicionar React Query**
   - Configuração + migração gradual
   - Tempo: 8 horas

7. **Paginação em Documentos e Encomendas**
   - Tempo: 3 horas

8. **Variáveis de Ambiente**
   - `.env` + configuração
   - Tempo: 1 hora

### 🟢 Baixa Prioridade (Backlog)

9. **Skeleton Loading em todas as telas**
   - Tempo: 4 horas

10. **Refresh Token Automático**
    - Tempo: 3 horas

11. **Testes E2E**
    - Tempo: 16 horas

12. **Otimização de Imagens**
    - Lazy loading + fast-image
    - Tempo: 4 horas

---

## 📝 Checklist de Implementação

### Fase 1 - Limpeza (1-2 dias)
- [ ] Deletar `src/screens/App/Perfil/Placeholders/`
- [ ] Atualizar `ProfileStack.js` para remover imports de Placeholders
- [ ] Deletar `src/screens/App/Perfil/index_new.js`
- [ ] Deletar `src/screens/App/Visitantes/AuthorizeVisitorScreen_NEW.js`
- [ ] Verificar e deletar `src/screens/App/Perfil/mock.js`
- [ ] Deletar `tmp_dicionario/` (se não usado)
- [ ] Rodar testes para garantir nada quebrou

### Fase 2 - Paginação (3-5 dias)
- [ ] Criar `InfiniteScrollList` component
- [ ] Implementar paginação em `buscarOcorrencias`
- [ ] Atualizar hook/tela de Ocorrências
- [ ] Implementar paginação em `listarVisitantes`
- [ ] Atualizar hook/tela de Visitantes
- [ ] Implementar paginação em `getNotificacoes`
- [ ] Atualizar NotificationProvider
- [ ] Implementar paginação em `listarDocumentos`
- [ ] Atualizar useDocumentos
- [ ] Implementar paginação em `getEncomendas`
- [ ] Testar todas as paginações

### Fase 3 - Performance (5-7 dias)
- [ ] Instalar e configurar React Query
- [ ] Migrar Ocorrências para React Query
- [ ] Migrar Visitantes para React Query
- [ ] Migrar Documentos para React Query
- [ ] Adicionar debounce em buscas
- [ ] Implementar Skeleton Loading
- [ ] Otimizar carregamento de imagens

### Fase 4 - Segurança (2-3 dias)
- [ ] Configurar variáveis de ambiente
- [ ] Implementar refresh token automático
- [ ] Adicionar sanitização de inputs
- [ ] Implementar rate limiting

### Fase 5 - Testes (5-7 dias)
- [ ] Aumentar cobertura para 70%
- [ ] Adicionar testes de hooks
- [ ] Implementar testes E2E básicos
- [ ] Configurar CI/CD com testes

---

## 🎯 Impacto Esperado

### Performance
- ⬆️ 60% redução no tempo de carregamento (paginação)
- ⬆️ 40% redução no uso de memória (cache)
- ⬆️ 80% redução em requisições desnecessárias (React Query)

### Manutenibilidade
- ⬇️ 15% redução na base de código (deletar arquivos)
- ⬆️ 50% facilidade de debug (erros customizados)
- ⬆️ 70% confiabilidade (testes)

### UX
- ⬆️ 90% satisfação em carregamentos (skeleton + infinite scroll)
- ⬆️ 100% feedback visual (loading states)
- ⬇️ 80% frustrações com carregamento (cache)

---

**Próxima Ação Recomendada**: Começar pela Fase 1 (Limpeza) hoje mesmo! 🚀
