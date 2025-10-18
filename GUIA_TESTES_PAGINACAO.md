# 🧪 GUIA DE TESTES - PAGINAÇÃO

## 📋 **Checklist de Testes Completo**

Data: 06/10/2025  
Funcionalidade: Paginação com Infinite Scroll  
Tela: Ocorrências  

---

## 🚀 **PRÉ-REQUISITOS:**

### **1. Iniciar o App:**

**Opção A - CMD (Recomendado):**
```cmd
cd d:\TEMP\Matheus\projeto-condoway-old
npm start
```

**Opção B - PowerShell (ajustar política primeiro):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
cd d:\TEMP\Matheus\projeto-condoway-old
npm start
```

### **2. Abrir o App:**
- Pressione `a` (Android)
- Ou pressione `i` (iOS)
- Ou escaneie QR Code no Expo Go

### **3. Fazer Login:**
- Use suas credenciais
- Aguarde autenticação

---

## ✅ **TESTE 1: CARREGAMENTO INICIAL**

### **Objetivo:**
Validar que apenas 20 ocorrências carregam inicialmente.

### **Passos:**
1. ✅ Abrir o app
2. ✅ Navegar para "Ocorrências"
3. ✅ Ir para aba "Minhas Ocorrências"

### **Validação:**

| Item | Esperado | Status |
|------|----------|--------|
| Tempo de carregamento | < 1 segundo | ⬜ |
| Loading indicator | Aparecer e sumir rapidamente | ⬜ |
| Quantidade de itens | Máximo 20 itens visíveis | ⬜ |
| Sem tela branca | Conteúdo aparece imediatamente | ⬜ |
| Sem erros no console | Nenhum erro vermelho | ⬜ |

### **Console Logs Esperados:**
```
🔄 [Hook] Carregando primeira página de ocorrências...
✅ [Hook] Primeira página carregada: {
  total: X,
  loaded: 20,
  hasMore: true
}
```

### **Screenshot:**
📸 Tire uma captura de tela mostrando:
- Lista com 20 itens
- Sem loading
- Sem erros

---

## ✅ **TESTE 2: INFINITE SCROLL**

### **Objetivo:**
Validar que ao rolar até o final, mais 20 itens são carregados.

### **Passos:**
1. ✅ Na lista de ocorrências
2. ✅ Rolar lentamente até o final da lista
3. ✅ Observar o footer "Carregando mais..."

### **Validação:**

| Item | Esperado | Status |
|------|----------|--------|
| Footer aparece | "Carregando mais ocorrências..." | ⬜ |
| Spinner visível | ActivityIndicator girando | ⬜ |
| Novos itens adicionados | +20 itens aparecem | ⬜ |
| Rolagem suave | Sem travamento (60fps) | ⬜ |
| Posição mantida | Não volta ao topo | ⬜ |

### **Console Logs Esperados:**
```
🔄 [Hook] Carregando página 2...
✅ [Hook] Próxima página carregada: {
  page: 2,
  loaded: 20,
  totalLoaded: 40
}
```

### **Teste Avançado:**
- ✅ Rolar até o final novamente
- ✅ Verificar que carrega página 3 (total 60 itens)
- ✅ Continuar até não haver mais itens
- ✅ Footer deve desaparecer quando `hasMore = false`

### **Screenshot:**
📸 Capturar momento do loading footer

---

## ✅ **TESTE 3: PULL TO REFRESH**

### **Objetivo:**
Validar que puxar a lista para baixo recarrega os dados.

### **Passos:**
1. ✅ Na lista de ocorrências
2. ✅ Puxar a lista para BAIXO (swipe down)
3. ✅ Observar spinner de refresh

### **Validação:**

| Item | Esperado | Status |
|------|----------|--------|
| Spinner aparece | RefreshControl visível | ⬜ |
| Cor do spinner | Cor primária do tema | ⬜ |
| Lista volta ao topo | Scroll position = 0 | ⬜ |
| Dados recarregados | Volta para primeira página (20 itens) | ⬜ |
| Spinner desaparece | Após carregar | ⬜ |

### **Console Logs Esperados:**
```
🔄 [Hook] Refreshing - voltando para primeira página...
✅ [Hook] Refresh concluído: {
  total: X,
  loaded: 20
}
```

### **Teste Avançado:**
- ✅ Fazer refresh 2-3 vezes seguidas
- ✅ Verificar que sempre volta para 20 itens
- ✅ Verificar que infinite scroll ainda funciona após refresh

### **Screenshot:**
📸 Capturar spinner de refresh

---

## ✅ **TESTE 4: FILTROS COM PAGINAÇÃO**

### **Objetivo:**
Validar que filtros funcionam com paginação.

### **Passos:**
1. ✅ Aplicar filtro "Abertas"
2. ✅ Verificar quantidade de itens
3. ✅ Rolar até o final
4. ✅ Verificar se carrega mais

### **Validação:**

| Item | Esperado | Status |
|------|----------|--------|
| Lista filtrada | Apenas status "Aberta" | ⬜ |
| Quantidade correta | Até 20 itens filtrados | ⬜ |
| Infinite scroll | Funciona com filtro ativo | ⬜ |
| Contadores corretos | Badge com total filtrado | ⬜ |

### **Teste com Todos os Filtros:**
- ⬜ "Todas" → Deve mostrar todas
- ⬜ "Abertas" → Apenas abertas
- ⬜ "Em Análise" → Apenas em análise
- ⬜ "Resolvidas" → Apenas resolvidas

---

## ✅ **TESTE 5: ESTADO DE LOADING**

### **Objetivo:**
Validar que indicadores de loading aparecem corretamente.

### **Cenários:**

### **5.1 - Loading Inicial:**
1. ✅ Fechar e reabrir o app
2. ✅ Ir para Ocorrências

**Esperado:**
- ⬜ Tela com ActivityIndicator grande
- ⬜ Texto "Carregando ocorrências..."
- ⬜ Sem lista vazia prematuramente

### **5.2 - Loading More:**
1. ✅ Rolar até o final

**Esperado:**
- ⬜ Footer com ActivityIndicator pequeno
- ⬜ Texto "Carregando mais ocorrências..."
- ⬜ Lista existente permanece visível

### **5.3 - Refreshing:**
1. ✅ Pull to refresh

**Esperado:**
- ⬜ RefreshControl no topo
- ⬜ Lista permanece visível durante refresh
- ⬜ Não há "flash" de tela vazia

---

## ✅ **TESTE 6: ESTADO DE ERRO**

### **Objetivo:**
Validar tratamento de erros de rede.

### **Passos:**
1. ✅ **Desligar Wi-Fi e dados móveis**
2. ✅ Fazer pull to refresh
3. ✅ Observar mensagem de erro

### **Validação:**

| Item | Esperado | Status |
|------|----------|--------|
| Mensagem de erro | Texto legível sobre o erro | ⬜ |
| Cor da mensagem | Vermelho (theme.colors.error) | ⬜ |
| Botão "Tentar novamente" | Visível e clicável | ⬜ |
| Lista anterior | Permanece visível (se havia dados) | ⬜ |

### **Teste de Recuperação:**
1. ✅ **Religar Wi-Fi**
2. ✅ Clicar em "Tentar novamente"
3. ✅ Verificar que carrega normalmente

**Esperado:**
- ⬜ Erro desaparece
- ⬜ Dados carregam
- ⬜ Lista volta a funcionar

### **Screenshot:**
📸 Capturar tela de erro com botão

---

## ✅ **TESTE 7: ESTADO VAZIO**

### **Objetivo:**
Validar mensagem quando não há dados.

### **Cenários:**

### **7.1 - Sem Ocorrências:**
**Condição:** Usuário novo sem ocorrências

**Esperado:**
- ⬜ Ilustração ou ícone
- ⬜ Mensagem "Você ainda não tem ocorrências registradas"
- ⬜ Sem loading (já carregou)

### **7.2 - Filtro Sem Resultados:**
1. ✅ Aplicar filtro que não tem resultados

**Esperado:**
- ⬜ Mensagem "Nenhuma ocorrência [filtro]"
- ⬜ Sugestão de ação

---

## ✅ **TESTE 8: PERFORMANCE**

### **Objetivo:**
Validar que a paginação melhorou a performance.

### **Ferramentas:**
- React Native Debugger
- Chrome DevTools
- Expo Performance Monitor

### **Métricas a Observar:**

#### **8.1 - Tempo de Carregamento:**
```
⏱️ Cronometrar:
- Clicar em "Ocorrências"
- Até ver primeira ocorrência

✅ Meta: < 1 segundo
❌ Antes: 8-12 segundos
```

#### **8.2 - Uso de Memória:**
```
📊 Monitorar RAM:
- Antes de carregar: X MB
- Após carregar 20 itens: Y MB
- Após carregar 100 itens: Z MB

✅ Meta: < 10 MB
❌ Antes: 45-60 MB
```

#### **8.3 - FPS (Frames per Second):**
```
🎯 Ativar FPS monitor no Expo:
- Shake device → "Show Performance Monitor"
- Rolar a lista rapidamente

✅ Meta: 60 fps constante
❌ Antes: 30-40 fps com quedas
```

#### **8.4 - Bandwidth (Dados Móveis):**
```
📱 Monitorar uso de dados:
- Abrir configurações do sistema
- Ver uso de dados do app

✅ Meta: ~210 KB por carregamento inicial
❌ Antes: ~5.2 MB
```

### **Checklist de Performance:**

| Métrica | Meta | Resultado | Status |
|---------|------|-----------|--------|
| Tempo inicial | < 1s | ___ s | ⬜ |
| Memória RAM | < 10 MB | ___ MB | ⬜ |
| FPS | 60 fps | ___ fps | ⬜ |
| Bandwidth | ~200 KB | ___ KB | ⬜ |

---

## ✅ **TESTE 9: CRIAÇÃO DE OCORRÊNCIA**

### **Objetivo:**
Validar que criar nova ocorrência atualiza a lista.

### **Passos:**
1. ✅ Ir para aba "Registrar"
2. ✅ Criar nova ocorrência
3. ✅ Aguardar sucesso
4. ✅ Ir para aba "Minhas Ocorrências"

### **Validação:**

| Item | Esperado | Status |
|------|----------|--------|
| Nova ocorrência aparece | No topo da lista | ⬜ |
| Contador atualizado | Total aumenta em 1 | ⬜ |
| Sem duplicação | Aparece apenas 1 vez | ⬜ |
| Infinite scroll funciona | Ainda carrega mais | ⬜ |

---

## ✅ **TESTE 10: CENÁRIOS EDGE CASE**

### **10.1 - Apenas 1 Ocorrência:**
**Esperado:**
- ⬜ Mostra 1 item
- ⬜ Sem footer de loading
- ⬜ hasMore = false

### **10.2 - Exatamente 20 Ocorrências:**
**Esperado:**
- ⬜ Mostra 20 itens
- ⬜ Tenta carregar mais ao rolar
- ⬜ Retorna vazio
- ⬜ hasMore = false

### **10.3 - 19 Ocorrências:**
**Esperado:**
- ⬜ Mostra 19 itens
- ⬜ hasMore = false
- ⬜ Sem footer

### **10.4 - 21 Ocorrências:**
**Esperado:**
- ⬜ Primeira página: 20 itens
- ⬜ Segunda página: 1 item
- ⬜ hasMore = false após segunda

### **10.5 - 150+ Ocorrências:**
**Esperado:**
- ⬜ Carrega progressivamente
- ⬜ Sem lag
- ⬜ Memória não explode

---

## 📊 **CONSOLE LOGS - REFERÊNCIA**

### **Sequência Normal:**

```javascript
// 1. App abre
🔄 [Hook] Carregando primeira página de ocorrências...

// 2. Dados chegam
✅ [Hook] Primeira página carregada: {
  total: 150,
  loaded: 20,
  hasMore: true
}

// 3. Usuário rola até o final
🔄 [Hook] Carregando página 2...
✅ [Hook] Próxima página carregada: {
  page: 2,
  loaded: 20,
  totalLoaded: 40
}

// 4. Usuário faz refresh
🔄 [Hook] Refreshing - voltando para primeira página...
✅ [Hook] Refresh concluído: {
  total: 150,
  loaded: 20
}

// 5. Sem mais páginas
⏸️ [Hook] Carregamento de mais itens ignorado: {
  loadingMore: false,
  loading: false,
  hasMore: false
}
```

---

## 🐛 **PROBLEMAS COMUNS E SOLUÇÕES:**

### **Problema 1: "Não carrega nada"**

**Sintomas:**
- Tela vazia permanentemente
- Loading infinito

**Debug:**
```javascript
// Verificar console:
1. Há erro de rede?
2. API está respondendo?
3. Token está válido?
4. Dados estão vindo?
```

**Solução:**
- Verificar `src/services/api.js` baseURL
- Verificar autenticação
- Verificar console do backend

---

### **Problema 2: "Carrega tudo de uma vez"**

**Sintomas:**
- Lista mostra todos os 150 itens imediatamente
- Sem paginação

**Debug:**
```javascript
// Verificar:
1. Hook está sendo usado?
2. Parâmetros page/limit estão sendo passados?
3. API está fazendo slice?
```

**Solução:**
```javascript
// Verificar em api.js:
const result = await apiService.buscarOcorrencias(1, 20); // ✅
const result = await apiService.buscarOcorrencias();      // ❌
```

---

### **Problema 3: "Infinite scroll não funciona"**

**Sintomas:**
- Chega no final e não carrega mais
- Footer não aparece

**Debug:**
```javascript
// Verificar FlatList:
onEndReached={loadMore}           // ✅ Deve ter
onEndReachedThreshold={0.5}       // ✅ Deve ter
```

**Solução:**
- Verificar que `loadMore` está definido
- Verificar que `hasMore = true`
- Aumentar `onEndReachedThreshold` para 0.8

---

### **Problema 4: "Duplicação de itens"**

**Sintomas:**
- Mesma ocorrência aparece 2x
- Lista cresce errado

**Debug:**
```javascript
// Verificar no hook:
setOcorrencias(prev => [...prev, ...result.dados]); // ✅ Correto
setOcorrencias(result.dados);                        // ❌ Errado
```

---

### **Problema 5: "Pull to refresh não funciona"**

**Sintomas:**
- Puxar não faz nada
- Sem spinner

**Debug:**
```javascript
// Verificar RefreshControl:
refreshing={refreshing}  // ✅ Deve estar true/false
onRefresh={refresh}      // ✅ Deve chamar função do hook
```

---

## ✅ **RESULTADO FINAL - CHECKLIST COMPLETO**

### **Funcionalidades:**
- ⬜ Carregamento inicial (< 1s)
- ⬜ Infinite scroll funcionando
- ⬜ Pull to refresh funcionando
- ⬜ Loading states corretos
- ⬜ Error handling funcionando
- ⬜ Empty state aparecendo
- ⬜ Filtros funcionando com paginação
- ⬜ Performance melhorada (60fps)
- ⬜ Criação de ocorrência atualiza lista
- ⬜ Edge cases funcionando

### **Performance:**
- ⬜ Tempo < 1s
- ⬜ Memória < 10 MB
- ⬜ FPS = 60
- ⬜ Bandwidth reduzido 96%

### **UX:**
- ⬜ Sem tela branca
- ⬜ Feedback visual claro
- ⬜ Transições suaves
- ⬜ Mensagens de erro úteis

---

## 📝 **RELATÓRIO DE TESTES**

### **Template para preencher:**

```
Data: ___/___/2025
Testador: ________________
Dispositivo: _____________
OS: _____________________

RESULTADOS:
✅ Passou: ___ testes
⚠️ Warnings: ___ testes
❌ Falhou: ___ testes

NOTAS:
_________________________
_________________________
_________________________

SCREENSHOTS:
📸 Anexar capturas relevantes
```

---

## 🎯 **PRÓXIMOS PASSOS APÓS TESTES:**

### **Se tudo passou ✅:**
1. Commit das mudanças
2. Implementar paginação em Visitantes
3. Implementar paginação em Notificações
4. Criar componente InfiniteScrollList

### **Se houver problemas ⚠️:**
1. Anotar erros específicos
2. Consultar "PROBLEMAS COMUNS" acima
3. Verificar console logs
4. Ajustar e re-testar

---

## 📞 **SUPORTE:**

**Dúvidas durante testes?**
- Consulte `CHECKLIST_PAGINACAO.md`
- Veja console logs esperados
- Compare com documentação

---

**BOA SORTE NOS TESTES!** 🚀

*Guia criado em 06/10/2025 - Testes de Paginação v1.0*
