# Reestruturação das Tabs de Visitantes

## 📋 Resumo

Mudança da estrutura de abas da tela de Visitantes para refletir melhor o ciclo de vida dos visitantes no condomínio. A nova nomenclatura é mais intuitiva e orientada ao estado atual do visitante.

---

## 🔄 Alterações Realizadas

### Estrutura Anterior
```
├── Pendentes    (Aguardando aprovação)
├── Aprovados    (Aprovados para entrar)
└── Histórico    (Finalizados e cancelados)
```

### Nova Estrutura
```
├── Aguardando   (Autorizados, aguardando chegada)
├── Presentes    (Já fizeram check-in, estão no condomínio)
└── Histórico    (Saíram ou foram cancelados)
```

---

## 🎯 Motivação

A estrutura anterior ("Pendentes/Aprovados") causava confusão porque:
- "Aprovados" sugeria visitantes aprovados para visita futura
- Não era claro que "Aprovados" = visitantes já dentro do condomínio
- Faltava clareza sobre quem está fisicamente presente vs. apenas autorizado

A nova estrutura ("Aguardando/Presentes") é mais clara:
- **Aguardando**: Visitante autorizado, mas ainda não chegou
- **Presentes**: Visitante que fez check-in e está no condomínio agora
- **Histórico**: Visitantes que já saíram ou foram cancelados

---

## 🔧 Mudanças Técnicas

### 1. **IDs das Tabs** (interno)

**Antes:**
```javascript
'pending'   → Pendentes
'approved'  → Aprovados
'history'   → Histórico
```

**Depois:**
```javascript
'waiting'   → Aguardando
'present'   → Presentes
'history'   → Histórico (sem alteração)
```

### 2. **Mapeamento de Status da API**

| Tab         | Status da API              | Descrição                           |
|-------------|----------------------------|-------------------------------------|
| Aguardando  | `vst_status === 'Aguardando'` | Autorizado, aguardando chegada   |
| Presentes   | `vst_status === 'Entrou'`     | Fez check-in, está no condomínio |
| Histórico   | `vst_status === 'Finalizado'` ou `'Cancelado'` | Saiu ou cancelado |

### 3. **Ícones Atualizados**

| Tab        | Ícone        | Cor         | Significado                    |
|------------|--------------|-------------|--------------------------------|
| Aguardando | AlertCircle  | Laranja     | Aguardando chegada             |
| Presentes  | UserCheck    | Verde       | Presente no condomínio         |
| Histórico  | History      | Cinza       | Histórico de visitas passadas  |

---

## 📁 Arquivos Modificados

### `src/screens/App/Visitantes/index.js`

**Alterações:**

1. **Import do novo ícone:**
   ```javascript
   import { Plus, Users, Calendar, Clock, AlertCircle, UserCheck, History } from 'lucide-react-native';
   ```

2. **Estado inicial:**
   ```javascript
   const [selectedTab, setSelectedTab] = useState('waiting'); // 'waiting', 'present', 'history'
   ```

3. **Renomeação dos arrays memoizados:**
   ```javascript
   const waitingVisitors  = useMemo(...)  // era pendingVisitors
   const presentVisitors  = useMemo(...)  // era approvedVisitors
   const historyVisitors  = useMemo(...)  // sem alteração
   ```

4. **Filtro de dados atualizado:**
   ```javascript
   if (selectedTab === 'waiting') {
     groupedData = waitingVisitors;
   } else if (selectedTab === 'present') {
     groupedData = presentVisitors;
   } else {
     groupedData = historyVisitors;
   }
   ```

5. **EmptyState atualizado:**
   ```javascript
   case 'waiting':
     return {
       title: 'Nenhum visitante aguardando',
       description: 'Visitantes autorizados que ainda não chegaram aparecerão aqui'
     };
   case 'present':
     return {
       title: 'Nenhum visitante presente',
       description: 'Visitantes que já fizeram check-in aparecerão aqui'
     };
   ```

6. **Componentes de Tab no JSX:**
   ```javascript
   {/* Tab: Aguardando */}
   <TouchableOpacity onPress={() => handleTabChange('waiting')}>
     <AlertCircle size={18} color={...} />
     <Text>Aguardando</Text>
     {/* Badge com contagem */}
   </TouchableOpacity>

   {/* Tab: Presentes */}
   <TouchableOpacity onPress={() => handleTabChange('present')}>
     <UserCheck size={18} color={...} />
     <Text>Presentes</Text>
     {/* Badge com contagem */}
   </TouchableOpacity>
   ```

7. **Quick Actions:**
   ```javascript
   showQuickActions={selectedTab === 'waiting'}
   // Apenas visitantes aguardando podem ser aprovados/rejeitados rapidamente
   ```

---

### `src/components/VisitorHeader/index.js`

**Alterações:**

1. **Cards de estatísticas:**
   ```javascript
   const stats = [
     {
       id: 'waiting',
       tabId: 'waiting',
       label: 'Aguardando',
       value: awaitingCount,
       icon: Clock,
       gradient: ['#FF6B6B', '#FF8E53'],
     },
     {
       id: 'present',
       tabId: 'present',
       label: 'Presentes',
       value: approvedCount,
       icon: UserCheck,
       gradient: ['#4ECDC4', '#44A08D'],
     },
     {
       id: 'history',
       tabId: 'history',
       label: 'Histórico',
       value: totalCount - awaitingCount - approvedCount,
       icon: History,
       gradient: ['#95A5A6', '#7F8C8D'],
     },
   ];
   ```

2. **Navegação atualizada:**
   - Ao clicar em cada card, navega para a tab correspondente
   - `onCardPress(tabId)` agora passa 'waiting', 'present' ou 'history'

---

## 🎨 Interface do Usuário

### Tabs Visuais

```
┌──────────────────────────────────────────────────────┐
│  AGUARDANDO         PRESENTES        HISTÓRICO       │
│  🔶 AlertCircle     ✅ UserCheck     📜 History      │
│  [3]                [5]                              │
└──────────────────────────────────────────────────────┘
```

### Cards de Estatísticas (Header)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 🕐       │  │ ✓        │  │ 📜       │
│ 3        │  │ 5        │  │ 12       │
│Aguardando│  │Presentes │  │Histórico │
└──────────┘  └──────────┘  └──────────┘
```

---

## ✅ Comportamento das Quick Actions

### Tab "Aguardando"
- Mostra botões de **Aprovar** e **Recusar** nos cards
- Ações rápidas disponíveis para autorizar/rejeitar visitantes

### Tab "Presentes"
- **Sem quick actions** (visitantes já estão dentro)
- Apenas visualização de informações

### Tab "Histórico"
- **Sem quick actions** (visitantes já saíram/foram cancelados)
- Apenas visualização histórica

---

## 🧪 Testado

- ✅ Estado inicial carrega tab "Aguardando"
- ✅ Contadores de badges atualizados corretamente
- ✅ Navegação entre tabs funciona
- ✅ EmptyState mostra mensagens corretas
- ✅ Quick actions aparecem apenas em "Aguardando"
- ✅ Cards do header navegam para tabs corretas
- ✅ Busca funciona em todas as tabs
- ✅ Sem erros de compilação

---

## 📊 Impacto

### UX
- ✅ Nomenclatura mais intuitiva e clara
- ✅ Fácil entender quem está fisicamente presente
- ✅ Reduz confusão entre "aprovado" e "presente"

### Código
- ✅ Nomes de variáveis mais semânticos
- ✅ Melhor alinhamento com domínio do negócio
- ✅ Facilita futuras manutenções

### Compatibilidade
- ✅ Backend continua usando os mesmos status
- ✅ Apenas camada de apresentação foi alterada
- ✅ Não afeta APIs ou banco de dados

---

## 🔮 Próximos Passos

1. **Monitorar feedback dos usuários** sobre a nova nomenclatura
2. **Considerar adicionar filtros adicionais** (por data, por morador, etc.)
3. **Implementar notificações push** quando visitantes aguardando chegarem
4. **Dashboard analytics** com tempo médio de permanência dos presentes

---

## 📝 Notas de Migração

### Para Desenvolvedores

Se você tem código que referencia as tabs antigas:

```javascript
// ❌ Antes
if (tab === 'pending') { ... }
if (tab === 'approved') { ... }

// ✅ Agora
if (tab === 'waiting') { ... }
if (tab === 'present') { ... }
```

### Para Testes

Atualize seus testes que verificam:
- IDs de tabs
- Labels de tabs
- Contadores de badges
- EmptyState messages

---

## 📅 Data de Implementação

**Data:** 2025-01-XX  
**Desenvolvedor:** Matheus  
**Versão:** v1.0.0  

---

## 🎯 Conclusão

A reestruturação das tabs torna a interface mais clara e alinhada com o fluxo real de visitantes:

1. Visitante é **autorizado** → aparece em **Aguardando**
2. Visitante faz **check-in** → move para **Presentes**
3. Visitante **sai** ou é **cancelado** → vai para **Histórico**

Essa mudança melhora significativamente a experiência do usuário e a compreensão do estado atual dos visitantes no condomínio.
