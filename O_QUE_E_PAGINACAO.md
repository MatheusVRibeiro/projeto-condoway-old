# 📖 Guia Completo de Paginação - CondoWay

## 🎯 O Que É Paginação?

**Paginação** é carregar dados em "pedaços" (páginas) ao invés de tudo de uma vez.

---

## 🔍 Comparação Visual

### ❌ SEM Paginação (Situação Atual)

```
Backend (Servidor)                        App Mobile
┌──────────────────┐                     ┌──────────────────┐
│                  │                     │                  │
│  📦 500          │──── Carrega ────▶   │  😰 Esperando... │
│  Ocorrências     │     TUDO            │  ⏳ 10 segundos  │
│  (5 MB)          │                     │  💾 50 MB RAM    │
│                  │                     │                  │
└──────────────────┘                     └──────────────────┘
```

**Problemas**:
- ⏰ Demora muito (5-10 segundos)
- 💾 Usa muita memória (50+ MB)
- 📶 Gasta dados móveis desnecessariamente
- 🔋 Drena bateria
- 📱 App pode travar em celulares antigos

---

### ✅ COM Paginação (Recomendado)

```
Backend (Servidor)                        App Mobile
┌──────────────────┐                     ┌──────────────────┐
│                  │                     │                  │
│  📦 500          │──── Página 1 ───▶   │  ✨ Carregado!   │
│  Ocorrências     │     (20 itens)      │  ⚡ 0.5 segundos │
│                  │     (500 KB)        │  💾 5 MB RAM     │
│  Só carrega o    │                     │                  │
│  necessário      │ ◀──── Página 2 ──   │  👆 Usuário      │
│                  │     (quando rolar)  │     rola         │
└──────────────────┘                     └──────────────────┘
```

**Benefícios**:
- ⚡ Rápido (0.5-1 segundo)
- 💾 Econômico (5-10 MB)
- 😊 Experiência fluida
- 🔋 Poupa bateria
- 📱 Funciona em qualquer celular

---

## 🏗️ Como Implementar

### Passo 1: Backend (API) - Adicionar Parâmetros

**ANTES** (sem paginação):
```javascript
// GET /ocorrencias
// Retorna TODAS as ocorrências

Response:
{
  "dados": [
    { id: 1, descricao: "..." },
    { id: 2, descricao: "..." },
    // ... 500 ocorrências
  ]
}
```

**DEPOIS** (com paginação):
```javascript
// GET /ocorrencias?page=1&limit=20
// Retorna apenas 20 ocorrências

Request:
- page: 1        // Qual página
- limit: 20      // Quantos por página

Response:
{
  "dados": [
    { id: 1, descricao: "..." },
    { id: 2, descricao: "..." },
    // ... apenas 20 ocorrências
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 25,      // 500 ÷ 20 = 25 páginas
    "total": 500,          // Total de ocorrências
    "perPage": 20,
    "hasMore": true        // Ainda há mais dados?
  }
}
```

---

### Passo 2: Frontend (api.js) - Atualizar Função

**ANTES**:
```javascript
buscarOcorrencias: async () => {
  const response = await api.get('/ocorrencias');
  return response.data.dados || [];
}
```

**DEPOIS**:
```javascript
buscarOcorrencias: async (page = 1, limit = 20, filtros = {}) => {
  // Monta parâmetros da URL
  const params = new URLSearchParams({
    page,      // Página atual
    limit,     // Quantos por página
    ...filtros // status, prioridade, etc
  });
  
  const response = await api.get(`/ocorrencias?${params}`);
  
  return {
    dados: response.data.dados || [],
    pagination: response.data.pagination || {},
    hasMore: response.data.pagination?.hasMore || false
  };
}
```

---

### Passo 3: Hook/Tela - Infinite Scroll

**Código Completo**:
```javascript
import React, { useState, useEffect } from 'react';
import { FlatList, ActivityIndicator, View, Text } from 'react-native';
import { apiService } from '../services/api';

export default function OcorrenciasScreen() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega primeira página
  useEffect(() => {
    loadOcorrencias(1);
  }, []);

  // Função de carregar
  const loadOcorrencias = async (pageNum) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const result = await apiService.buscarOcorrencias(pageNum, 20);
      
      if (pageNum === 1) {
        // Primeira página: substitui tudo
        setOcorrencias(result.dados);
      } else {
        // Páginas seguintes: adiciona ao final
        setOcorrencias(prev => [...prev, ...result.dados]);
      }
      
      setHasMore(result.hasMore);
      setPage(pageNum + 1);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quando chega no final da lista
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadOcorrencias(page);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadOcorrencias(1);
    setRefreshing(false);
  };

  // Footer com loading
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={{ marginTop: 8, color: '#999' }}>
          Carregando mais...
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={ocorrencias}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => <OcorrenciaCard ocorrencia={item} />}
      
      // Infinite Scroll
      onEndReached={handleLoadMore}      // Quando chega no fim
      onEndReachedThreshold={0.5}        // Trigger a 50% do fim
      
      // Pull to Refresh
      refreshing={refreshing}
      onRefresh={handleRefresh}
      
      // Footer
      ListFooterComponent={renderFooter}
      
      // Empty state
      ListEmptyComponent={
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text>Nenhuma ocorrência encontrada</Text>
        </View>
      }
    />
  );
}
```

---

## 📊 Exemplo com Números Reais

### Cenário: Condomínio com 500 Ocorrências

#### ❌ SEM Paginação:

```
Carregamento inicial:
├─ Tempo: 10 segundos
├─ Dados: 5 MB
├─ Memória: 50 MB
└─ Itens carregados: 500 (todos de uma vez)

Usuário vê:
└─ Tela branca por 10 segundos 😰
```

#### ✅ COM Paginação (20 por vez):

```
Carregamento inicial (Página 1):
├─ Tempo: 0.5 segundos
├─ Dados: 100 KB
├─ Memória: 5 MB
└─ Itens carregados: 20

Usuário vê:
└─ Conteúdo imediato! 😊

Usuário rola para baixo (Página 2):
├─ Tempo: 0.3 segundos
├─ Dados: +100 KB
└─ Itens carregados: +20 (total 40)

... e assim por diante
```

---

## 🎨 Fluxo Visual do Usuário

```
┌─────────────────────────────────┐
│  📱 TELA DE OCORRÊNCIAS         │
├─────────────────────────────────┤
│                                 │
│  🔧 Vazamento no banheiro       │  ◀─┐
│  🚿 Chuveiro quebrado           │    │
│  🔌 Problema elétrico           │    │
│  💡 Lâmpada queimada            │    │ Página 1
│  🚪 Porta emperrada             │    │ (20 itens)
│  ...                            │    │ Carrega em
│  🏊 Piscina suja                │  ◀─┘ 0.5s
│                                 │
│  ────────────────────────────   │
│                                 │
│  👇 Usuário rola para baixo     │
│                                 │
│  ⏳ Carregando...               │  ◀── Auto-detecta
│                                 │     quando chega
│  🔧 Elevador com defeito        │  ◀─┐ perto do fim
│  🚿 Infiltração                 │    │
│  🔌 Campainha quebrada          │    │ Página 2
│  ...                            │    │ (+20 itens)
│  🏊 Limpeza da garagem          │  ◀─┘ +0.3s
│                                 │
│  👇 Continua rolando...         │
└─────────────────────────────────┘
```

---

## 💰 Economia de Recursos

### Comparação Detalhada:

| Métrica | Sem Paginação | Com Paginação | Economia |
|---------|---------------|---------------|----------|
| **Tempo inicial** | 10s | 0.5s | **95%** ⬇️ |
| **Dados móveis** | 5 MB | 100 KB | **98%** ⬇️ |
| **Uso de RAM** | 50 MB | 5 MB | **90%** ⬇️ |
| **Bateria** | Alta | Baixa | **70%** ⬇️ |
| **Experiência** | Ruim 😞 | Ótima 😊 | **∞** ⬆️ |

---

## 🎯 Onde Aplicar no CondoWay

### 🔴 Alta Prioridade (Implementar AGORA):

1. **Ocorrências** 
   - Pode ter centenas de registros
   - Usuários consultam frequentemente
   - **Impacto**: 🔥 Muito Alto

2. **Visitantes**
   - Pode ter 100+ autorizações
   - Listagem principal
   - **Impacto**: 🔥 Alto

3. **Notificações**
   - Pode ter 500+ notificações
   - Abertura frequente
   - **Impacto**: 🔥 Alto

### 🟡 Média Prioridade:

4. **Documentos**
   - Geralmente < 50 documentos
   - Acesso menos frequente
   - **Impacto**: 🟡 Médio

5. **Encomendas**
   - Pode ter 50+ encomendas/mês
   - Consultado regularmente
   - **Impacto**: 🟡 Médio

---

## ✅ Checklist de Implementação

### Backend:
- [ ] Adicionar parâmetros `page` e `limit` na rota
- [ ] Implementar lógica de paginação no banco de dados
- [ ] Retornar metadados de paginação (total, totalPages, etc)
- [ ] Testar com diferentes valores de page/limit

### Frontend (api.js):
- [ ] Atualizar função para aceitar `page` e `limit`
- [ ] Adicionar tratamento de resposta paginada
- [ ] Retornar dados + metadata de paginação

### Tela/Hook:
- [ ] Adicionar estados: `page`, `loading`, `hasMore`
- [ ] Implementar `loadMore` para carregar próxima página
- [ ] Implementar `onRefresh` para pull-to-refresh
- [ ] Adicionar loading footer
- [ ] Testar scroll até o final

---

## 🧪 Como Testar

### Teste Manual:
1. Abrir tela com paginação
2. ✅ Verificar carregamento rápido inicial
3. 👇 Rolar até o final
4. ✅ Verificar que carrega mais itens
5. 🔄 Pull to refresh
6. ✅ Verificar que recarrega tudo

### Teste de Performance:
```javascript
console.time('Carregamento');
await loadOcorrencias(1);
console.timeEnd('Carregamento');
// Deve ser < 1 segundo
```

---

## 📚 Recursos Adicionais

### Bibliotecas Recomendadas:
- **React Query**: Cache automático e paginação
- **SWR**: Similar ao React Query
- **FlatList**: Nativo do React Native (já otimizado)

### Referências:
- [React Native FlatList](https://reactnative.dev/docs/flatlist)
- [Infinite Scroll Pattern](https://www.patterns.dev/posts/infinite-scroll)

---

## 🎓 Conceitos Relacionados

### Termos Importantes:

- **Page**: Número da página (1, 2, 3...)
- **Limit/Per Page**: Quantos itens por página (geralmente 10, 20 ou 50)
- **Offset**: Posição inicial (page - 1) × limit
- **Total**: Total de itens no banco
- **Total Pages**: Math.ceil(total / limit)
- **Has More**: Boolean se ainda há mais dados

### Exemplo de Cálculo:
```javascript
Total de ocorrências: 500
Limit (por página): 20
Total de páginas: 500 ÷ 20 = 25

Página 1: itens 1-20    (offset: 0)
Página 2: itens 21-40   (offset: 20)
Página 3: itens 41-60   (offset: 40)
...
Página 25: itens 481-500 (offset: 480)
```

---

## 🚀 Próximo Passo

**Recomendação**: Começar implementando paginação em **Ocorrências**

1. Ver arquivo `MELHORIAS_PROJETO.md` - Seção "Implementar Paginação"
2. Seguir código de exemplo fornecido
3. Testar com dados reais
4. Aplicar mesmo padrão em Visitantes e Notificações

---

**💡 Resumo em uma frase:**
> Paginação é carregar 20 itens por vez ao invés de 500 de uma vez, tornando o app 10x mais rápido! ⚡

---

*Documento criado em 06/10/2025*
