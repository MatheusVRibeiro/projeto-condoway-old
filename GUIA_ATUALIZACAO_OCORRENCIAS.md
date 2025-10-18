# 🔄 ATUALIZAÇÃO DA TELA DE OCORRÊNCIAS - Instruções

## 📝 **O que precisa ser mudado:**

### **1. Imports (linhas 1-24)**

**ADICIONAR:**
```javascript
import { usePaginatedOcorrencias } from '../../../hooks';
```

---

### **2. Remover Estados Manuais (linhas 35-52)**

**REMOVER:**
```javascript
const [myIssues, setMyIssues] = useState([]);
const [refreshing, setRefreshing] = useState(false);
const [uploading, setUploading] = useState(false); // usado como loading
```

**SUBSTITUIR POR:**
```javascript
// ✅ Hook de paginação (substitui estados manuais)
const {
  ocorrencias: myIssues,
  loading: uploading,
  loadingMore,
  refreshing,
  error: loadError,
  pagination,
  loadMore,
  refresh,
  addOcorrencia
} = usePaginatedOcorrencias(20);
```

---

### **3. Remover useEffect de Carregamento (linhas 58-68)**

**REMOVER:**
```javascript
useEffect(() => {
  console.log('Dados do usuário:', user);
  if (user?.user_id && user?.token) {
    buscarMinhasOcorrencias();
  } else {
    console.log('Usuário não autenticado...');
  }
}, [user]);
```

**MOTIVO:** O hook já carrega automaticamente!

---

### **4. Substituir buscarMinhasOcorrencias (linhas 70-135)**

**ANTES:**
```javascript
const buscarMinhasOcorrencias = async () => {
  try {
    setUploading(true);
    const ocorrenciasDaApi = await apiService.buscarOcorrencias();
    // ... mapeamento complexo ...
    setMyIssues(minhasOcorrencias);
  } catch (error) {
    Toast.show({ type: 'error', ... });
  } finally {
    setUploading(false);
  }
};
```

**DEPOIS:**
```javascript
// ✅ Função simplificada - hook já gerencia loading/error
const filtrarOcorrenciasDoUsuario = (todasOcorrencias) => {
  return todasOcorrencias.filter(oco => {
    return oco.userap_id === user?.user_id;
  });
};
```

**NOTA:** O mapeamento de dados deveria ser feito no hook ou na API, mas por agora mantemos na tela.

---

### **5. Atualizar handleSubmit (após linha ~230)**

**ADICIONAR após criar ocorrência:**
```javascript
const handleSubmit = async () => {
  try {
    setUploading(true);
    // ... código existente de criação ...
    
    const response = await apiService.criarOcorrencia(dados);
    
    // ✅ ADICIONAR: Atualização otimista
    if (response) {
      const novaOcorrencia = {
        id: response.oco_id,
        protocol: response.oco_protocolo,
        title: category,
        category: category,
        description: description,
        location: location,
        date: new Date().toLocaleString('pt-BR'),
        status: 'Em Análise',
        priority: priority,
        attachments: attachments.map(a => a.uri),
        comments: [{
          author: 'Morador',
          text: description,
          date: new Date().toLocaleString('pt-BR')
        }]
      };
      
      // ✅ Adicionar à lista (otimista)
      addOcorrencia(novaOcorrencia);
    }
    
    Toast.show({ type: 'success', ... });
    resetForm();
    setActiveTab('minhas');
  } catch (error) {
    // ... tratamento de erro ...
  }
};
```

---

### **6. Atualizar onRefresh (após linha ~290)**

**ANTES:**
```javascript
const onRefresh = async () => {
  setRefreshing(true);
  await buscarMinhasOcorrencias();
  setRefreshing(false);
};
```

**DEPOIS:**
```javascript
// ✅ Usar refresh do hook
const onRefresh = refresh; // Ou apenas remover e usar {refresh} direto
```

---

### **7. Atualizar FlatList (procurar por <FlatList)**

**ADICIONAR:**
```javascript
<FlatList
  data={filteredIssues}
  renderItem={renderIssue}
  keyExtractor={(item) => item.id?.toString()}
  contentContainerStyle={styles.issuesList}
  
  // ✅ INFINITE SCROLL
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  
  // ✅ PULL TO REFRESH
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refresh}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
    />
  }
  
  // ✅ LOADING FOOTER
  ListFooterComponent={() => {
    if (!loadingMore) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
          Carregando mais...
        </Text>
      </View>
    );
  }}
  
  // ✅ EMPTY STATE
  ListEmptyComponent={() => {
    if (uploading) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
            Carregando ocorrências...
          </Text>
        </View>
      );
    }
    
    if (loadError) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.error, marginBottom: 16 }}>
            {loadError}
          </Text>
          <TouchableOpacity 
            style={{ 
              backgroundColor: theme.colors.primary, 
              padding: 12, 
              borderRadius: 8 
            }}
            onPress={refresh}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return <OccurrenceEmptyState onNewOccurrence={() => setActiveTab('registrar')} />;
  }}
  
  // Performance
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

---

### **8. Adicionar Indicador de Total (Opcional)**

**ADICIONAR no Header:**
```javascript
<View style={styles.headerStats}>
  <Text style={[styles.totalCount, { color: theme.colors.textSecondary }]}>
    {pagination.total} ocorrências no total
  </Text>
  {pagination.hasMore && (
    <Text style={[styles.loadedCount, { color: theme.colors.primary }]}>
      Mostrando {myIssues.length} de {pagination.total}
    </Text>
  )}
</View>
```

---

## 🎯 **RESUMO DAS MUDANÇAS:**

| Antes | Depois |
|-------|--------|
| `useState([])` manual | `usePaginatedOcorrencias()` |
| `useEffect` para carregar | Hook carrega automaticamente |
| `buscarMinhasOcorrencias()` complexa | Hook gerencia loading/error |
| `onRefresh` manual | Hook fornece `refresh` |
| Sem infinite scroll | `onEndReached={loadMore}` |
| Sem loading footer | `ListFooterComponent` |
| Sem estados de erro | Hook gerencia `error` |

---

## ✅ **BENEFÍCIOS:**

- ⚡ **-50 linhas de código** (menos complexidade)
- 🎯 **Lógica centralizada** no hook
- 🔄 **Infinite scroll** automático
- 📱 **Pull to refresh** out-of-the-box
- ⚠️ **Error handling** padronizado
- 💾 **Menos estados** para gerenciar

---

## 🚀 **COMO APLICAR:**

**Opção 1: Eu aplico pra você (Recomendado)** ⚡
→ Faço todas as mudanças automaticamente

**Opção 2: Você aplica manualmente** 📝
→ Segue as instruções acima linha por linha

**Opção 3: Fazemos juntos** 🤝
→ Vou editando e você valida cada mudança

---

**Qual opção prefere?**

Digite:
- **"1"** → Aplicar automaticamente (5 min)
- **"2"** → Quero aplicar manualmente
- **"3"** → Vamos fazer juntos passo a passo

---

*Guia criado em 06/10/2025*
