# Correção: Erro de VirtualizedList com Animated

## 🐛 Erro Original

```
ERROR  Warning: Invariant Violation: Components based on VirtualizedList 
must be wrapped with Animated.createAnimatedComponent to support native 
onScroll events with useNativeDriver
```

---

## 🔍 Causa do Problema

O erro ocorria porque estávamos usando:
- `FlatList` normal (que é baseado em `VirtualizedList`)
- `Animated.event` no handler `onScroll`
- `useNativeDriver: true` na configuração do Animated

**Código Problemático:**
```javascript
// ❌ ERRADO: FlatList normal com Animated.event
<FlatList
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }  // ← Problema aqui
  )}
  // ...
/>
```

Quando usamos `useNativeDriver: true` em animações de scroll, o React Native precisa que o componente seja uma versão "animada" do `FlatList`.

---

## ✅ Solução

Criar uma versão animada do `FlatList` usando `Animated.createAnimatedComponent`:

```javascript
// ✅ CORRETO: Criar FlatList animada
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Usar a versão animada
<AnimatedFlatList
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }  // ✅ Agora funciona!
  )}
  // ...
/>
```

---

## 🔧 Alterações Realizadas

### Arquivo: `src/screens/App/Visitantes/index.js`

**1. Criar componente animado (linha ~18):**
```javascript
// Criar FlatList animada
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
```

**2. Substituir FlatList por AnimatedFlatList (linha ~448):**
```javascript
// Antes
<FlatList
  data={flattenedData}
  onScroll={handleScroll}
  // ...
/>

// Depois
<AnimatedFlatList
  data={flattenedData}
  onScroll={handleScroll}
  // ...
/>
```

---

## 📋 Por que isso é necessário?

### Native Driver vs JS Driver

**JavaScript Driver (useNativeDriver: false):**
- Animação roda na thread JavaScript
- Pode ter "travamentos" (jank) se a thread JS estiver ocupada
- Não requer componente animado

**Native Driver (useNativeDriver: true):**
- ✅ Animação roda na thread nativa (60fps consistentes)
- ✅ Performático, mesmo com JS thread ocupada
- ⚠️ **Requer** componente animado para `VirtualizedList` (FlatList, SectionList)

---

## 🎯 Funcionalidade Afetada

**FAB (Floating Action Button) com animação de hide/show:**

```javascript
const handleScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  {
    useNativeDriver: true,
    listener: (event) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;

      // Hide FAB quando rolar para baixo
      if (diff > 5 && fabScale._value === 1) {
        Animated.spring(fabScale, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } 
      // Show FAB quando rolar para cima
      else if (diff < -5 && fabScale._value === 0) {
        Animated.spring(fabScale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }

      lastScrollY.current = currentScrollY;
    },
  }
);
```

Essa animação precisa de alta performance, por isso usamos `useNativeDriver: true`.

---

## ✅ Resultado

### Antes ❌
- Warning no console toda vez que a tela carregava
- Potencial degradação de performance
- Violação de invariante do React Native

### Depois ✅
- ✅ Sem warnings
- ✅ Performance otimizada (animação nativa)
- ✅ FAB responde suavemente ao scroll
- ✅ Código alinhado com best practices do React Native

---

## 🧪 Como Testar

1. Abrir tela de Visitantes
2. Verificar console - **não deve haver warnings**
3. Rolar a lista para baixo
   - ✅ FAB deve desaparecer suavemente
4. Rolar a lista para cima
   - ✅ FAB deve reaparecer suavemente
5. Animação deve ser fluida (60fps)

---

## 📚 Componentes que Precisam de Animated Version

Sempre use `Animated.createAnimatedComponent` quando usar `useNativeDriver: true` com:

- ✅ `FlatList`
- ✅ `SectionList`
- ✅ `ScrollView`
- ✅ Qualquer componente baseado em `VirtualizedList`

**Exemplo:**
```javascript
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
```

---

## 🔗 Referências

- [React Native Animated API](https://reactnative.dev/docs/animated)
- [Using Native Driver](https://reactnative.dev/docs/animations#using-the-native-driver)
- [VirtualizedList](https://reactnative.dev/docs/virtualizedlist)

---

## 📅 Data de Correção

**Data:** 2025-10-24  
**Tipo:** Bug Fix - Warning  
**Impacto:** Performance + Code Quality  
**Desenvolvedor:** Matheus  

---

## 🎯 Lições Aprendidas

1. **Sempre use `Animated.createAnimatedComponent`** quando:
   - Usar `useNativeDriver: true`
   - Trabalhar com listas (FlatList, SectionList)

2. **Native driver é preferível** para:
   - Animações de scroll
   - Animações baseadas em gestos
   - Animações que precisam de 60fps consistentes

3. **React Native é estrito** com VirtualizedList:
   - Warnings são avisos sérios
   - Invariant violations podem causar crashes em produção
   - Seguir as guidelines do framework é essencial
