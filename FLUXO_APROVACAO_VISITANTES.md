# Sistema de Aprovação de Visitantes - Fluxo Completo

## 📋 Resumo

Implementação de um sistema dual de cards de visitantes que diferencia **Visitas Pré-agendadas** (informativas) de **Visitas Surpresa** (requerem aprovação do morador). O sistema permite ao morador aprovar ou recusar visitantes inesperados em tempo real.

---

## 🎯 Conceito: Dois Tipos de Visita

### 1. **Visita Pré-agendada** (Card Tipo 1)
- **Descrição**: Visitante autorizado previamente pelo morador
- **Status**: `Aguardando Entrada`
- **Aparência**: Card simples e limpo
- **Ações**: Apenas visualização (toque abre modal com detalhes)
- **Fluxo**: Morador → Autoriza → Aguardando → Visitante Chega → Presentes

### 2. **Visita Surpresa** (Card Tipo 2)
- **Descrição**: Visitante não esperado que chegou na portaria
- **Status**: `Aguardando Aprovação`
- **Aparência**: **Borda amarela brilhante** + Botões de ação (✓ e ✗)
- **Ações**: Aprovar ou Recusar em tempo real
- **Fluxo**: Porteiro → Cadastra → Morador Aprova/Recusa → Presentes ou Histórico

---

## 🔄 Fluxo de Aprovação (Visita Surpresa)

```
┌─────────────────────────────────────────────────────────────┐
│  1. PORTARIA: Visitante inesperado chega                    │
│     Porteiro cadastra como "Visita Surpresa"               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. NOTIFICAÇÃO: Morador recebe push notification          │
│     "Visitante surpresa aguardando aprovação"              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. TELA AGUARDANDO: Card com borda amarela aparece no topo│
│     Badge: "Aguardando Aprovação" (Amarelo)                │
│     Botões: [✗ Recusar]  [✓ Aprovar]                       │
└─────┬───────────────────────┬────────────────────────────────┘
      │                       │
      │ RECUSAR (✗)          │ APROVAR (✓)
      ▼                       ▼
┌─────────────────┐    ┌────────────────────────┐
│  4a. HISTÓRICO  │    │  4b. PRESENTES         │
│  Status: Recusado│    │  Status: No Condomínio│
│  Card cinza/red │    │  Visitante pode entrar│
└─────────────────┘    └────────────────────────┘
```

---

## 🎨 Diferenciação Visual dos Cards

### Card Tipo 1: Pré-agendada (Normal)

```
┌────────────────────────────────────────────────┐
│ 🟡 MV  Matheus Vinicius                       │
│        (11) 98765-4321                         │
│        📅 Hoje  🕐 22:21                  🕐 → │
└────────────────────────────────────────────────┘
```

**Características:**
- Borda padrão (cinza/tema)
- Badge de status à direita (ícone de relógio)
- Seta para indicar que é clicável
- Sem botões de ação

---

### Card Tipo 2: Surpresa (Destaque)

```
╔════════════════════════════════════════════════╗ ← Borda Amarela Brilhante
║ 🟡 AA  João Silva                              ║
║        (11) 91234-5678                         ║
║        📅 Hoje  🕐 15:30              [✗] [✓] ║ ← Botões de Ação
╚════════════════════════════════════════════════╝
```

**Características:**
- **Borda amarela brilhante (#F59E0B)** - 2px
- **Shadow destacado** (maior e com cor amarela)
- Badge: "Aguardando Aprovação"
- **Botões de ação rápida:**
  - **✗ (Recusar)**: Vermelho (#EF4444)
  - **✓ (Aprovar)**: Verde (#10B981)

---

## 🔧 Implementação Técnica

### Identificação do Tipo de Visita

A API deve enviar um dos seguintes campos para identificar uma visita surpresa:

```javascript
// Opção 1: Campo tipo
{
  vst_tipo: 'surpresa'  // ou 'pre-agendada'
}

// Opção 2: Flag de aprovação
{
  vst_precisa_aprovacao: true
}

// Opção 3: Sub-status específico
{
  vst_sub_status: 'Aguardando Aprovação'
}
```

**Lógica de Detecção:**

```javascript
const isAwaitingApproval = 
  item.vst_tipo === 'surpresa' || 
  item.vst_precisa_aprovacao === true ||
  item.vst_sub_status === 'Aguardando Aprovação';
```

---

### Sistema de Badges Dinâmicos

O sistema suporta múltiplos sub-status para fornecer informações mais precisas:

| Sub-Status             | Cor     | Ícone        | Uso                                    |
|------------------------|---------|--------------|----------------------------------------|
| Aguardando Aprovação   | Amarelo | AlertCircle  | Visita surpresa aguardando decisão     |
| Aguardando Entrada     | Amarelo | Clock        | Pré-agendada, aguardando chegada       |
| No Condomínio          | Verde   | UserCheck    | Visitante fez check-in                 |
| Concluído              | Cinza   | CheckCircle2 | Check-out realizado                    |
| Recusado               | Vermelho| XCircle      | Morador recusou visita surpresa        |
| Cancelado              | Vermelho| XCircle      | Visita cancelada pelo morador          |

**Código:**

```javascript
const getStatusConfig = (status, subStatus) => {
  // Sub-status específicos têm prioridade
  const specificConfigs = {
    'Aguardando Aprovação': {
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      label: 'Aguardando Aprovação',
      icon: AlertCircle,
    },
    'Aguardando Entrada': {
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBBF24'],
      label: 'Aguardando Entrada',
      icon: Clock,
    },
    'No Condomínio': {
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
      label: 'No Condomínio',
      icon: UserCheck,
    },
  };

  // Prioridade: sub-status específico > status principal
  if (subStatus && specificConfigs[subStatus]) {
    return specificConfigs[subStatus];
  }
  
  // Fallback para configs principais...
};
```

---

## 📱 Estrutura da Tela

### Tabs

```
┌──────────────────────────────────────────────────┐
│  [🟡 Aguardando]  [✓ Presentes]  [📜 Histórico] │
└──────────────────────────────────────────────────┘
```

**Mudanças:**
- ✅ **Removidos** números de contagem das tabs (11), (1)
- ✅ Contadores mantidos apenas nos **cards do header**
- ✅ **Cor amarela** (#F59E0B) para status "Aguardando"

---

### Cards do Header (Estatísticas)

```
┌─────────┐  ┌─────────┐  ┌──────────┐
│ 🕐 11   │  │ ✓ 1     │  │ 📜 12    │
│Aguardando│  │Presentes│  │Histórico │
└─────────┘  └─────────┘  └──────────┘
```

---

## 🎬 Ações do Usuário

### 1. Aprovar Visitante (✓)

**Trigger:** Toque no botão verde (✓) no card de visita surpresa

**Fluxo:**
1. Haptic feedback (sucesso)
2. Chamada à API: `PUT /visitantes/{id}/aprovar`
3. Atualização de status: `vst_status = 'Entrou'`
4. Card **desaparece** da aba "Aguardando"
5. Card **aparece** na aba "Presentes"
6. Notificação para portaria: "Visitante aprovado, pode entrar"

**Payload da API:**
```json
{
  "vst_id": 123,
  "acao": "aprovar",
  "aprovado_em": "2025-10-23T15:30:00Z",
  "aprovado_por": "morador_id"
}
```

---

### 2. Recusar Visitante (✗)

**Trigger:** Toque no botão vermelho (✗) no card de visita surpresa

**Fluxo:**
1. Haptic feedback (sucesso)
2. Chamada à API: `PUT /visitantes/{id}/recusar`
3. Atualização de status: `vst_status = 'Recusado'`
4. Card **desaparece** da aba "Aguardando"
5. Card **aparece** na aba "Histórico" (vermelho)
6. Notificação para portaria: "Visitante recusado pelo morador"

**Payload da API:**
```json
{
  "vst_id": 123,
  "acao": "recusar",
  "recusado_em": "2025-10-23T15:30:00Z",
  "recusado_por": "morador_id",
  "motivo": "Não esperado" // opcional
}
```

---

### 3. Timeout (Não Respondido)

**Trigger:** Morador não responde em X minutos (ex: 5 minutos)

**Fluxo (Backend):**
1. Sistema verifica visitas surpresa sem resposta por > 5min
2. Auto-cancelamento: `vst_status = 'Não Respondido'`
3. Card vai para **Histórico**
4. Notificação para portaria: "Sem resposta do morador"

---

## 📦 Estrutura de Dados

### Exemplo: Visita Pré-agendada

```json
{
  "vst_id": 101,
  "vst_nome": "Matheus Vinicius",
  "vst_celular": "5426021402",
  "vst_documento": "542.602.140-2",
  "vst_status": "Aguardando",
  "vst_sub_status": "Aguardando Entrada",
  "vst_tipo": "pre-agendada",
  "vst_precisa_aprovacao": false,
  "vst_validade_inicio": "2025-10-23T22:00:00Z",
  "vst_data_entrada": null,
  "vst_data_saida": null,
  "vst_qrcode_hash": "abc123xyz"
}
```

---

### Exemplo: Visita Surpresa

```json
{
  "vst_id": 102,
  "vst_nome": "João Silva",
  "vst_celular": "11912345678",
  "vst_documento": "220.873.912-34",
  "vst_status": "Aguardando",
  "vst_sub_status": "Aguardando Aprovação",
  "vst_tipo": "surpresa",
  "vst_precisa_aprovacao": true,
  "vst_cadastrado_por": "porteiro_id",
  "vst_cadastrado_em": "2025-10-23T15:28:00Z",
  "vst_expira_em": "2025-10-23T15:33:00Z",  // 5 min timeout
  "vst_data_entrada": null,
  "vst_data_saida": null,
  "vst_qrcode_hash": null  // Gerado após aprovação
}
```

---

## 🎨 Paleta de Cores

| Status/Elemento         | Cor Principal | Gradiente              | Uso                    |
|-------------------------|---------------|------------------------|------------------------|
| Aguardando (Amarelo)    | `#F59E0B`     | `#F59E0B → #FBBF24`   | Relógio, badges        |
| Presente (Verde)        | `#4ECDC4`     | `#4ECDC4 → #44A08D`   | UserCheck, "Presentes" |
| Recusado (Vermelho)     | `#EF4444`     | `#EF4444 → #F87171`   | XCircle, botão recusar |
| Finalizado (Cinza)      | `#6B7280`     | `#6B7280 → #9CA3AF`   | CheckCircle2, histórico|
| Aprovar (Verde Vivo)    | `#10B981`     | -                      | Botão aprovar (✓)      |

---

## ✅ Checklist de Implementação

### Frontend (Completo)

- ✅ **Badge de contagem removido das tabs** (Aguardando, Presentes)
- ✅ **Cor alterada para amarelo** (#F59E0B) em todos os componentes
- ✅ **CPF removido dos cards** (visível apenas no modal)
- ✅ **Sistema de badges dinâmicos** implementado (sub-status)
- ✅ **Card Tipo 1** (pré-agendada): simples, sem ações
- ✅ **Card Tipo 2** (surpresa): borda amarela + botões ✓ e ✗
- ✅ **Handlers de aprovação/recusa** criados
- ✅ **Estilos de destaque** (borda, shadow, botões)

### Backend (Pendente)

- ⏳ **API: Endpoint de aprovação** (`PUT /visitantes/{id}/aprovar`)
- ⏳ **API: Endpoint de recusa** (`PUT /visitantes/{id}/recusar`)
- ⏳ **Campo `vst_tipo`** adicionado ao modelo
- ⏳ **Campo `vst_sub_status`** adicionado ao modelo
- ⏳ **Campo `vst_precisa_aprovacao`** (boolean)
- ⏳ **Sistema de timeout** (auto-cancelar após 5min)
- ⏳ **Notificações push** para visitas surpresa
- ⏳ **Geração de QR Code** após aprovação

---

## 📊 Métricas e Analytics

### Dados a Rastrear

1. **Taxa de aprovação** de visitas surpresa
2. **Tempo médio de resposta** do morador
3. **Taxa de timeout** (não respondidos)
4. **Horários de pico** de visitas surpresa
5. **Visitantes recorrentes** (aprovados múltiplas vezes)

---

## 🔮 Melhorias Futuras

### 1. Aprovação Rápida por Biometria
- Aprovar visitante com FaceID/TouchID
- Sem necessidade de abrir o app completo

### 2. Lista de Visitantes Confiáveis
- Morador pode marcar visitante como "confiável"
- Próximas visitas surpresa são auto-aprovadas

### 3. Histórico de Recusas
- Ver motivo de recusa (se fornecido)
- Estatísticas de visitantes mais recusados

### 4. Notificações Inteligentes
- Não notificar em horários de silêncio (22h-8h)
- Priorizar visitantes recorrentes

### 5. Comentários e Notas
- Morador pode adicionar nota ao aprovar/recusar
- Ex: "Entregador da Amazon", "Familiar"

---

## 🧪 Casos de Teste

### Teste 1: Visita Surpresa - Aprovação

1. Porteiro cadastra visitante como "surpresa"
2. Card aparece no topo de "Aguardando" com borda amarela
3. Morador toca em ✓ (aprovar)
4. Card desaparece de "Aguardando"
5. Card aparece em "Presentes" com status "No Condomínio"
6. QR Code é gerado

**✅ Resultado Esperado:** Fluxo completo sem erros

---

### Teste 2: Visita Surpresa - Recusa

1. Porteiro cadastra visitante como "surpresa"
2. Card aparece no topo de "Aguardando" com borda amarela
3. Morador toca em ✗ (recusar)
4. Card desaparece de "Aguardando"
5. Card aparece em "Histórico" com status "Recusado"
6. Porteiro recebe notificação de recusa

**✅ Resultado Esperado:** Fluxo completo sem erros

---

### Teste 3: Timeout

1. Porteiro cadastra visitante como "surpresa"
2. Morador não responde por 5+ minutos
3. Sistema auto-cancela
4. Card vai para "Histórico" com status "Não Respondido"
5. Porteiro recebe notificação de timeout

**✅ Resultado Esperado:** Auto-cancelamento funciona

---

### Teste 4: Visita Pré-agendada (Normal)

1. Morador autoriza visitante previamente
2. Card aparece em "Aguardando" sem borda destacada
3. Card NÃO tem botões ✓ e ✗
4. Apenas ícone de status + seta
5. Toque abre modal de detalhes

**✅ Resultado Esperado:** Card simples, sem ações rápidas

---

## 📝 Notas de Desenvolvimento

### Campos Importantes da API

```javascript
// Para identificar tipo de visita
vst_tipo: 'pre-agendada' | 'surpresa'

// Para exibir badge correto
vst_sub_status: 'Aguardando Aprovação' | 'Aguardando Entrada' | 'No Condomínio'

// Para mostrar botões de ação
vst_precisa_aprovacao: boolean

// Para timeout
vst_cadastrado_em: timestamp
vst_expira_em: timestamp
```

---

## 📅 Changelog

### v1.0.0 - 2025-10-23

**Adicionado:**
- Sistema dual de cards (Pré-agendada vs Surpresa)
- Badges dinâmicos com sub-status
- Botões de aprovação/recusa rápida
- Borda destacada para visitas surpresa
- Cor amarela para status "Aguardando"
- Remoção de CPF dos cards (mantido no modal)
- Remoção de badges de contagem das tabs

**Modificado:**
- Paleta de cores: Laranja → Amarelo
- Sistema de badges: fixo → dinâmico

**Removido:**
- Badges numéricos das tabs (11), (1)
- CPF/Documento dos cards da lista

---

## 👥 Responsabilidades

| Responsável | Tarefa                                    |
|-------------|-------------------------------------------|
| Backend     | Endpoints de aprovação/recusa             |
| Backend     | Sistema de timeout automático             |
| Backend     | Campos vst_tipo, vst_sub_status, etc.     |
| Frontend    | UI de cards diferenciados ✅              |
| Frontend    | Integração com endpoints de aprovação     |
| Design      | Validação de cores e UX                   |
| QA          | Testes dos fluxos completos               |

---

## 🎯 Conclusão

O sistema de aprovação de visitantes foi projetado para:

1. **Diferenciar claramente** visitas esperadas de inesperadas
2. **Facilitar decisões rápidas** com botões de ação visíveis
3. **Manter segurança** exigindo aprovação explícita para surpresas
4. **Melhorar UX** com feedback visual claro (borda, cores, badges)
5. **Escalar** com sistema de sub-status flexível

A implementação frontend está **100% completa**. Próximo passo: integração com backend para endpoints de aprovação/recusa.
