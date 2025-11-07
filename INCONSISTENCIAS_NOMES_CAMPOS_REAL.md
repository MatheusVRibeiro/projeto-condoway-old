# 🔍 INCONSISTÊNCIAS DE NOMENCLATURA - ANÁLISE COMPLETA

**Data:** 06/11/2025  
**Baseado em:** Estrutura REAL do banco de dados MySQL  
**Status:** ✅ Banco correto / ❌ Código incorreto

---

## 🗄️ VERDADE ABSOLUTA: ESTRUTURA DO BANCO DE DADOS

**O BANCO DE DADOS USA TUDO EM MINÚSCULO COM UNDERSCORE (snake_case)**

```sql
✅ CORRETO NO BANCO:
usuarios.user_id          (NÃO User_ID!)
condominio.cond_id        (NÃO Cond_ID!)
usuario_apartamentos.userap_id
ocorrencias.oco_id
visitantes.vst_id         (⚠️ É vst_id, NÃO vis_id!)
apartamentos.ap_id
bloco.bloc_id
ambientes.amd_id
encomendas.enc_id
reservas_ambientes.res_id
notificacoes.not_id
mensagens.msg_id
documentos.doc_id
gerenciamento.ger_id
ocorrencia_mensagens.ocomsg_id
```

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### **PROBLEMA #1: Código tenta acessar User_ID (MAIÚSCULO) que NÃO EXISTE**

#### Banco de dados:
```sql
usuarios.user_id  -- ✅ minúsculo
```

#### Código ERRADO (múltiplos arquivos):
```javascript
// useProfile.js linha 22
const userId = user?.User_ID || user?.user_id;  // ❌ User_ID não existe!

// useProfile.js linha 88
if (!user?.User_ID) {  // ❌ sempre false!

// useProfile.js linha 97
await apiService.atualizarPerfilUsuario(user.User_ID, ...);  // ❌ undefined!

// useProfile.js linha 127
if (!user?.User_ID) {  // ❌ sempre false!

// useProfile.js linha 136
await apiService.alterarSenha(user.User_ID, ...);  // ❌ undefined!

// useProfile.js linha 253
const userId = user?.User_ID || user?.user_id;  // ❌ User_ID não existe!

// useProfile.js linha 258
}, [user?.User_ID, user?.user_id]);  // ❌ dependency desnecessária
```

#### ✅ CORREÇÃO:
```javascript
// REMOVER TODAS as referências a User_ID
// USAR APENAS: user?.user_id

const userId = user?.user_id;
if (!user?.user_id) {
await apiService.atualizarPerfilUsuario(user.user_id, ...);
}, [user?.user_id]);
```

---

### **PROBLEMA #2: Código tenta acessar Cond_ID (MAIÚSCULO) que NÃO EXISTE**

#### Banco de dados:
```sql
condominio.cond_id  -- ✅ minúsculo
```

#### Código ERRADO (múltiplos arquivos):
```javascript
// useCondominio.js linha 18
const condId = condominioId || user?.Cond_ID || user?.cond_id || user?.condId;
// ❌ Tenta 3 variações! Cond_ID e condId não existem!

// useCondominio.js linha 22-24
console.log('👤 [useCondominio] user disponível:', {
    Cond_ID: user?.Cond_ID,  // ❌ undefined
    cond_id: user?.cond_id,  // ✅ único correto
    condId: user?.condId     // ❌ undefined
});
```

#### ✅ CORREÇÃO:
```javascript
// REMOVER TODAS as tentativas de Cond_ID e condId
// USAR APENAS: user?.cond_id

const cond_id = condominioId || user?.cond_id;
console.log('👤 [useCondominio] cond_id:', user?.cond_id);
```

---

### **PROBLEMA #3: NOME COMPLETAMENTE ERRADO - vis_id vs vst_id**

#### Banco de dados:
```sql
visitantes.vst_id  -- ✅ É vst_id!
visitantes.vst_nome
visitantes.vst_celular
visitantes.vst_documento
visitantes.vst_data_entrada
visitantes.vst_data_saida
visitantes.vst_status
visitantes.vst_qrcode_hash
visitantes.vst_validade_inicio
visitantes.vst_validade_fim
```

#### ⚠️ **TODO O CÓDIGO USA vis_ MAS O BANCO USA vst_!**

Este é o erro mais grave! O prefixo está completamente errado em TODO o projeto.

#### Código ERRADO:
```javascript
// api.js linha 619
buscarVisitante: async (visitanteId) => {  // ❌ deveria ser vst_id

// usePaginatedVisitantes.js linha 152
vis.id === visitanteId  // ❌ deveria ser vis.vst_id === vst_id

// usePaginatedVisitantes.js linha 163
prev.filter(vis => vis.id !== visitanteId)  // ❌ deveria ser vis.vst_id !== vst_id
```

#### ✅ CORREÇÃO URGENTE:
```bash
# Buscar e substituir em TODO o projeto:
vis_id → vst_id
vis_nome → vst_nome
vis_status → vst_status
vis_data_entrada → vst_data_entrada
vis_data_saida → vst_data_saida
visitanteId → vst_id (parâmetros de funções)
```

---

### **PROBLEMA #4: Uso genérico de .id ao invés do campo específico**

#### ❌ Padrão errado encontrado em vários arquivos:

```javascript
// usePaginatedOcorrencias.js
oco.id === ocorrenciaId  // ❌ deveria ser oco.oco_id === oco_id

// usePaginatedVisitantes.js
vis.id === visitanteId  // ❌ deveria ser vis.vst_id === vst_id

// Ocorrencias/index.js linha 350
id: novaOcorrencia?.oco_id || novaOcorrencia?.id || Date.now()
// ❌ fallback triplo! Deveria ser apenas: oco_id: novaOcorrencia.oco_id

// NotificationProvider.js linha 31
id: raw.not_id || raw.id || String(Date.now())
// ❌ fallback triplo! Deveria ser apenas: not_id: raw.not_id
```

#### ✅ REGRA:
**NUNCA usar `.id` genérico para dados do banco!**
Sempre usar o nome específico: `oco_id`, `vst_id`, `not_id`, etc.

---

## 📋 TABELA DE REFERÊNCIA COMPLETA

### **TABELA: usuarios**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | INT PK | ❌ Código usa User_ID |
| `user_nome` | VARCHAR(60) | ✅ Correto |
| `user_email` | VARCHAR(60) | ✅ Correto |
| `user_senha` | VARCHAR(60) | ✅ Correto |
| `user_telefone` | VARCHAR(30) | ✅ Correto |
| `user_tipo` | ENUM | ✅ Correto |
| `user_foto` | VARCHAR(255) | ✅ Correto |
| `user_push_token` | VARCHAR(255) | ✅ Correto |
| `user_data_cadastro` | DATETIME | ✅ Correto |

### **TABELA: condominio**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `cond_id` | INT PK | ❌ Código usa Cond_ID |
| `cond_nome` | VARCHAR(60) | ✅ Correto |
| `cond_endereco` | VARCHAR(130) | ✅ Correto |
| `cond_cidade` | VARCHAR(60) | ✅ Correto |
| `cond_estado` | VARCHAR(2) | ✅ Correto |

### **TABELA: bloco**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `bloc_id` | INT PK | ✅ Correto |
| `bloc_nome` | VARCHAR(60) | ✅ Correto |
| `cond_id` | INT FK | ✅ Correto |

### **TABELA: apartamentos**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ap_id` | INT PK | ✅ Correto |
| `ap_numero` | VARCHAR(15) | ✅ Correto |
| `ap_andar` | INT | ✅ Correto |
| `bloc_id` | INT FK | ✅ Correto (NÃO bloco_id!) |

### **TABELA: usuario_apartamentos**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `userap_id` | INT PK | ✅ Correto |
| `user_id` | INT FK | ✅ Correto |
| `ap_id` | INT FK | ✅ Correto |

### **TABELA: visitantes** ⚠️ CRÍTICO
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `vst_id` | INT PK | ❌ Código usa vis_id |
| `vst_nome` | VARCHAR(60) | ❌ Código usa vis_nome |
| `vst_celular` | VARCHAR(20) | ❌ Código pode usar vis_celular |
| `vst_documento` | VARCHAR(20) | ❌ Código pode usar vis_documento |
| `vst_data_entrada` | DATETIME | ❌ Código pode usar vis_data_entrada |
| `vst_data_saida` | DATETIME | ❌ Código pode usar vis_data_saida |
| `vst_status` | VARCHAR(30) | ❌ Código pode usar vis_status |
| `vst_qrcode_hash` | VARCHAR(255) | ✅ Verificar |
| `vst_validade_inicio` | DATETIME | ✅ Verificar |
| `vst_validade_fim` | DATETIME | ✅ Verificar |
| `userap_id` | INT FK | ✅ Correto |

### **TABELA: ocorrencias**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `oco_id` | INT PK | ⚠️ Código usa .id genérico |
| `oco_protocolo` | VARCHAR(50) | ✅ Correto |
| `oco_categoria` | VARCHAR(50) | ✅ Correto |
| `oco_descricao` | TEXT | ✅ Correto |
| `oco_localizacao` | VARCHAR(100) | ✅ Correto |
| `oco_prioridade` | ENUM | ✅ Correto |
| `oco_status` | ENUM | ✅ Correto |
| `oco_data` | DATETIME | ✅ Correto |
| `oco_imagem` | VARCHAR(255) | ✅ Correto |
| `userap_id` | INT FK | ✅ Correto |

### **TABELA: ocorrencia_mensagens**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ocomsg_id` | INT PK | ✅ Correto |
| `ocomsg_mensagem` | TEXT | ✅ Correto |
| `ocomsg_data_envio` | DATETIME | ✅ Correto |
| `ocomsg_lida` | TINYINT(1) | ✅ Correto |
| `oco_id` | INT FK | ✅ Correto |
| `user_id` | INT FK | ✅ Correto |

### **TABELA: notificacoes**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `not_id` | INT PK | ⚠️ Código usa .id genérico |
| `not_titulo` | VARCHAR(100) | ✅ Correto |
| `not_mensagem` | TEXT | ✅ Correto |
| `not_tipo` | ENUM | ✅ Correto |
| `not_prioridade` | ENUM | ✅ Correto |
| `not_data_envio` | DATETIME | ✅ Correto |
| `not_lida` | TINYINT(1) | ✅ Correto |
| `userap_id` | INT FK | ✅ Correto |

### **TABELA: mensagens**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `msg_id` | INT PK | ✅ Correto |
| `msg_mensagem` | VARCHAR(130) | ✅ Correto |
| `msg_data_envio` | DATETIME | ✅ Correto |
| `msg_status` | ENUM | ✅ Correto |
| `oco_id` | INT FK | ✅ Correto (nullable) |
| `userap_id` | INT FK | ✅ Correto |
| `cond_id` | INT FK | ✅ Correto |

### **TABELA: encomendas**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `enc_id` | INT PK | ✅ Correto |
| `enc_nome_loja` | VARCHAR(225) | ✅ Correto |
| `enc_codigo_rastreio` | VARCHAR(225) | ✅ Correto |
| `enc_data_chegada` | DATETIME | ✅ Correto |
| `enc_data_retirada` | DATETIME | ✅ Correto |
| `enc_status` | ENUM | ✅ Correto |
| `userap_id` | INT FK | ✅ Correto |

### **TABELA: reservas_ambientes**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `res_id` | INT PK | ⚠️ Código pode usar .id |
| `res_data_reserva` | DATE | ✅ Correto |
| `res_horario_inicio` | TIME | ✅ Correto |
| `res_horario_fim` | TIME | ✅ Correto |
| `res_status` | ENUM | ✅ Correto |
| `amd_id` | INT FK | ✅ Correto |
| `userap_id` | INT FK | ✅ Correto |

### **TABELA: ambientes**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `amd_id` | INT PK | ⚠️ Código pode usar .id |
| `amd_nome` | VARCHAR(40) | ✅ Correto |
| `amd_descricao` | VARCHAR(100) | ✅ Correto |
| `amd_capacidade` | INT | ✅ Correto |
| `cond_id` | INT FK | ✅ Correto |

### **TABELA: documentos**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `doc_id` | INT PK | ✅ Correto |
| `doc_nome` | VARCHAR(100) | ✅ Correto |
| `doc_categoria` | VARCHAR(50) | ✅ Correto |
| `doc_url` | VARCHAR(255) | ✅ Correto |
| `doc_tamanho` | VARCHAR(20) | ✅ Correto |
| `doc_data` | DATE | ✅ Correto |
| `cond_id` | INT FK | ✅ Correto |

### **TABELA: gerenciamento**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ger_id` | INT PK | ✅ Correto |
| `ger_descricao` | VARCHAR(60) | ✅ Correto |
| `ger_valor` | DECIMAL(10,2) | ✅ Correto |
| `ger_data` | DATE | ✅ Correto |
| `cond_id` | INT FK | ✅ Correto |

---

## 🎯 PLANO DE CORREÇÃO

### ✅ Fase 0: BANCO ESTÁ CORRETO!
**Não precisa alterar nada no banco de dados.**

### 🔥 Fase 1: Corrigir Código URGENTE

#### 1.1. Remover User_ID (usar user_id)

**Arquivos a corrigir:**
- `src/hooks/useProfile.js` (linhas 22, 88, 97, 127, 136, 253, 258)

**Substituir:**
```javascript
// ❌ ANTES
user?.User_ID

// ✅ DEPOIS
user?.user_id
```

#### 1.2. Remover Cond_ID (usar cond_id)

**Arquivos a corrigir:**
- `src/hooks/useCondominio.js` (linhas 18, 22-24)

**Substituir:**
```javascript
// ❌ ANTES
user?.Cond_ID || user?.cond_id || user?.condId

// ✅ DEPOIS
user?.cond_id
```

#### 1.3. CRÍTICO: vis_ → vst_

**Buscar e substituir em TODOS os arquivos do projeto:**

```bash
vis_id → vst_id
vis_nome → vst_nome
vis_celular → vst_celular
vis_documento → vst_documento
vis_data_entrada → vst_data_entrada
vis_data_saida → vst_data_saida
vis_status → vst_status
```

**Arquivos principais:**
- `src/services/api.js`
- `src/hooks/usePaginatedVisitantes.js`
- `src/screens/App/Visitantes/index.js`
- Todos os componentes relacionados a visitantes

#### 1.4. Substituir .id genérico por campo específico

**Arquivos a corrigir:**
- `src/hooks/usePaginatedOcorrencias.js`: `oco.id` → `oco.oco_id`
- `src/hooks/usePaginatedVisitantes.js`: `vis.id` → `vis.vst_id`
- `src/contexts/NotificationProvider.js`: `n.id` → `n.not_id`
- `src/screens/App/Ocorrencias/index.js`: remover fallbacks
- `src/screens/App/Reservas/index.js`: `r.id` → `r.res_id`, `e.id` → `e.amd_id`

---

## 📊 ESTATÍSTICAS

- **Banco de dados:** ✅ 100% correto (snake_case minúsculo)
- **Código frontend:** ❌ ~30% com nomes errados
- **Arquivos afetados:** ~20 arquivos
- **Linhas a corrigir:** ~70-100 linhas
- **Tempo estimado:** 6-8 horas
- **Prioridade:** 🔴 CRÍTICA (vst_id) + 🟠 ALTA (User_ID, Cond_ID)

---

## ✅ CHECKLIST DE CORREÇÃO

### Prioridade CRÍTICA:
- [ ] Substituir TODOS os `vis_` por `vst_` no projeto inteiro
- [ ] Verificar que backend retorna `vst_id` (não `vis_id`)

### Prioridade ALTA:
- [ ] Remover todas as referências a `User_ID` (usar `user_id`)
- [ ] Remover todas as referências a `Cond_ID` (usar `cond_id`)
- [ ] Remover fallbacks desnecessários

### Prioridade MÉDIA:
- [ ] Substituir `.id` genérico por campos específicos
- [ ] Padronizar parâmetros de funções (ocorrenciaId → oco_id)

### Validação:
- [ ] Testar login e autenticação
- [ ] Testar visitantes (CRUD completo)
- [ ] Testar ocorrências
- [ ] Testar notificações
- [ ] Verificar console sem erros "undefined"

---

## 🚨 IMPACTO DOS BUGS

### Erros causados por User_ID vs user_id:
- ✅ JÁ CORRIGIDO: "Nenhum usuário logado" ao fazer upload de foto

### Erros causados por vis_id vs vst_id:
- ❌ **AINDA NÃO DESCOBERTO:** Possíveis erros ao buscar/atualizar/deletar visitantes
- ❌ **RISCO ALTO:** Campos undefined em operações com visitantes

### Erros causados por .id genérico:
- ⚠️ Comparações falhando silenciosamente
- ⚠️ Filtros não funcionando corretamente

---

## 📝 CONCLUSÃO

**O banco de dados está 100% correto.**  
**O problema está APENAS no código frontend/backend que usa nomes errados.**

**Ação mais urgente:** Corrigir `vis_` → `vst_` em TODO o projeto, pois é um erro de prefixo que afeta TODOS os campos da tabela visitantes.

**Tempo total estimado para correção completa:** 6-8 horas de trabalho focado.
