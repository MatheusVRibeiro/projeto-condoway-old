# 🔍 RELATÓRIO COMPLETO: Inconsistências de Nomenclatura no Projeto

**Data:** 06/11/2025  
**Atualizado:** Com estrutura REAL do banco de dados  
**Objetivo:** Identificar e documentar todas as inconsistências entre nomes de campos do banco de dados e os usados na API/Frontend

---

## �️ ESTRUTURA REAL DO BANCO DE DADOS

```
✅ BANCO DE DADOS USA TUDO MINÚSCULO COM UNDERSCORE (snake_case):

usuarios.user_id          (não User_ID)
condominio.cond_id        (não Cond_ID)
usuario_apartamentos.userap_id
ocorrencias.oco_id
visitantes.vst_id         (não vis_id!)
apartamentos.ap_id
bloco.bloc_id             (não bloco_id!)
ambientes.amd_id
encomendas.enc_id
reservas_ambientes.res_id
notificacoes.not_id
mensagens.msg_id
documentos.doc_id
gerenciamento.ger_id
```

---

## 📊 RESUMO EXECUTIVO

### ⚠️ PROBLEMAS CRÍTICOS ENCONTRADOS:

1. **Código usa MAIÚSCULAS que NÃO EXISTEM no banco** (User_ID, Cond_ID)
2. **Código usa NOMES ERRADOS** (vis_id ao invés de vst_id!)
3. **Fallbacks múltiplos tentando adivinhar o nome** (degradando performance)
4. **Uso genérico de `.id` ao invés do campo específico**
5. **Inconsistência bloc_id vs bloco_id** (banco usa bloc_id, mas FK usa bloc_id também)

---

## 🎯 CAMPOS COM INCONSISTÊNCIAS CRÍTICAS

### 1. **user_id - CÓDIGO USA MAIÚSCULA INEXISTENTE!**

#### 🗄️ Banco de Dados REAL:
```sql
usuarios (
    user_id INT PRIMARY KEY  -- ✅ MINÚSCULO (correto no banco)
)
```

#### ❌ PROBLEMA: Código tenta acessar User_ID que NÃO EXISTE!

#### ⚠️ Problemas Encontrados:

**Em `useProfile.js`:**
```javascript
// Linha 22: Fallback entre User_ID e user_id
const userId = user?.User_ID || user?.user_id;

// Linha 88: Verifica User_ID (maiúsculo)
if (!user?.User_ID) {

// Linha 97: Usa User_ID (maiúsculo)
await apiService.atualizarPerfilUsuario(user.User_ID, dadosAtualizados);

// Linha 158: Fallback invertido (user_id primeiro)
const userId = user?.user_id || user?.User_ID;

// Linha 253: Fallback novamente
const userId = user?.User_ID || user?.user_id;

// Linha 258: Dependencies array com ambos
}, [user?.User_ID, user?.user_id]);
```

**Em `Ocorrencias/index.js`:**
```javascript
// Linha 102: Usa user_id (minúsculo)
return oco._original?.userap_id === user?.user_id;

// Linha 294: Usa user_id (minúsculo)
user_id: user?.user_id

// Linha 329: Usa user_id (minúsculo)
user_id: user.user_id
```

**Em `api.js`:**
```javascript
// Linha 176: Usa user_id (minúsculo)
let userapId = dados.user_id;

// Linha 706: Usa user_id (minúsculo)
user_id: p.user_id ?? null,
```

#### ✅ Solução Recomendada:
```javascript
// PADRONIZAR PARA: user_id (minúsculo, snake_case)
// Motivo: Consistência com outros campos do projeto (ap_numero, bloc_nome, etc.)
```

---

### 2. **cond_id - CÓDIGO USA MAIÚSCULA INEXISTENTE!**

#### 🗄️ Banco de Dados REAL:
```sql
condominio (
    cond_id INT PRIMARY KEY  -- ✅ MINÚSCULO (correto no banco)
)
```

#### ❌ PROBLEMA: Código tenta acessar Cond_ID que NÃO EXISTE!

#### ⚠️ Problemas Encontrados:

**Em `useCondominio.js`:**
```javascript
// Linha 17-18: TRÊS variações diferentes!
// Tenta todos os formatos possíveis: Cond_ID, cond_id, condId
const condId = condominioId || user?.Cond_ID || user?.cond_id || user?.condId;

// Linha 21-24: Log mostrando as três tentativas
console.log('👤 [useCondominio] user disponível:', {
    Cond_ID: user?.Cond_ID,
    cond_id: user?.cond_id,
    condId: user?.condId
});

// Linha 130: Usa cond_id (minúsculo)
prev.map(c => c.cond_id === condominioId ? response.dados : c)

// Linha 164: Usa cond_id (minúsculo)
setCondominios(prev => prev.filter(c => c.cond_id !== condominioId));
```

**Em `api.js`:**
```javascript
// Linha 365: Usa cond_id (minúsculo)
cond_id: decoded?.cond_id,

// Linha 381: Usa cond_id (minúsculo)
if (decoded?.cond_id) payload.cond_id = decoded.cond_id;

// Linha 724: Usa cond_id (minúsculo)
cond_id: p.cond_id ?? null,
```

#### ✅ Solução Recomendada:
```javascript
// PADRONIZAR PARA: cond_id (minúsculo, snake_case)
```

---

### 3. **userap_id / userapId / Userap_ID / UserAp_ID**

#### 🗄️ Banco de Dados:
```sql
Usuario_Apartamentos (
    userap_id INT PRIMARY KEY  -- ✅ Minúsculo correto
)
```

#### ⚠️ Problemas Encontrados:

**Em `api.js`:**
```javascript
// Linha 175: Comentário menciona userap_id
// fallback: tentar extrair userap_id do token se não foi passado em dados

// Linha 176: Variável userapId (camelCase)
let userapId = dados.user_id;

// Linha 183: Usa userap_id do token
userapId = decoded?.userap_id || decoded?.id || userapId;

// Linha 194: Campo userap_id (snake_case)
userap_id: userapId,

// Linha 364: Usa userap_id (snake_case)
userap_id: decoded?.userap_id || decoded?.id,

// Linha 382: Usa userap_id (snake_case)
if (decoded?.userap_id || decoded?.id) payload.userap_id = decoded.userap_id || decoded.id;

// Linha 705: Usa userap_id (snake_case)
userap_id: p.userap_id ?? null,
```

**Em `Ocorrencias/index.js`:**
```javascript
// Linha 102: Acessa userap_id
return oco._original?.userap_id === user?.user_id;
```

#### ✅ Solução Recomendada:
```javascript
// JÁ ESTÁ CORRETO: userap_id (minúsculo, snake_case)
// Problema: Usar userapId (camelCase) como variável local
// Deveria ser: userap_id em todo lugar
```

---

### 4. **oco_id / ocoId / ocorrenciaId**

#### 🗄️ Banco de Dados:
```sql
Ocorrencias (
    oco_id INT PRIMARY KEY  -- ✅ Minúsculo correto
)
```

#### ⚠️ Problemas Encontrados:

**Em `api.js`:**
```javascript
// Linha 154: Parâmetro ocorrenciaId (camelCase)
marcarTodasMensagensLidas: async (ocorrenciaId) => {

// Linha 156: Usa ocorrenciaId (camelCase)
console.log('... ocorrência como lidas:', ocorrenciaId);

// Linha 352: Parâmetro ocorrenciaId (camelCase)
adicionarComentario: async (ocorrenciaId, comentario) => {

// Linha 378: Campo oco_id (snake_case)
oco_id: ocorrenciaId || null
```

**Em `Ocorrencias/index.js`:**
```javascript
// Linha 79: Usa oco_id do banco
id: oco.oco_id,

// Linha 350: Fallback entre oco_id e id
id: novaOcorrencia?.oco_id || novaOcorrencia?.id || Date.now(),
```

**Em `usePaginatedOcorrencias.js`:**
```javascript
// Linha 197: Parâmetro ocorrenciaId (camelCase)
const updateOcorrencia = useCallback((ocorrenciaId, dadosAtualizados) => {

// Linha 200: Compara com .id (não oco_id)
oco.id === ocorrenciaId 

// Linha 210-211: Usa ocorrenciaId e .id
const removeOcorrencia = useCallback((ocorrenciaId) => {
    setOcorrencias(prev => prev.filter(oco => oco.id !== ocorrenciaId));
```

#### ✅ Solução Recomendada:
```javascript
// PADRONIZAR PARA: oco_id (snake_case) em TODOS os lugares
// Trocar parâmetros ocorrenciaId → oco_id
// Trocar oco.id → oco.oco_id
```

---

### 5. **vst_id - CÓDIGO USA NOME COMPLETAMENTE ERRADO!**

#### 🗄️ Banco de Dados REAL:
```sql
visitantes (
    vst_id INT PRIMARY KEY  -- ✅ É vst_id, NÃO vis_id!
)
```

#### ❌ PROBLEMA CRÍTICO: Código usa "vis_id" mas banco tem "vst_id"!

Este é um dos erros mais graves encontrados. Todo o código de visitantes usa o nome errado!

#### ⚠️ Problemas Encontrados:

**Em `api.js`:**
```javascript
// Linha 619: Parâmetro visitanteId (camelCase)
buscarVisitante: async (visitanteId) => {

// Linha 621: Usa visitanteId (camelCase)
console.log(`... visitante ${visitanteId}...`);

// Linha 632: Parâmetro visitanteId (camelCase)
cancelarVisitante: async (visitanteId) => {

// Linha 646: Parâmetro visitanteId (camelCase)
reenviarConviteVisitante: async (visitanteId) => {
```

**Em `usePaginatedVisitantes.js`:**
```javascript
// Linha 149: Parâmetro visitanteId (camelCase)
const updateVisitante = useCallback((visitanteId, dadosAtualizados) => {

// Linha 152: Compara com .id (não vis_id)
vis.id === visitanteId 

// Linha 162-163: Usa visitanteId e .id
const removeVisitante = useCallback((visitanteId) => {
    setVisitantes(prev => prev.filter(vis => vis.id !== visitanteId));
```

#### ✅ Solução Recomendada:
```javascript
// URGENTE: TROCAR TUDO DE vis_id → vst_id !!!
// Trocar parâmetros visitanteId → vst_id
// Trocar vis.id → vis.vst_id
// Trocar todas as referências vis_ → vst_

// TODOS os campos de visitantes:
vst_id            // ID primário
vst_nome          // Nome do visitante
vst_celular       // Celular
vst_documento     // Documento
vst_data_entrada  // Data de entrada
vst_data_saida    // Data de saída
vst_status        // Status
vst_qrcode_hash   // QR Code
vst_validade_inicio
vst_validade_fim
```

---

### 6. **bloc_id - ESTÁ CORRETO NO BANCO!**

#### 🗄️ Banco de Dados REAL:
```sql
bloco (
    bloc_id INT PRIMARY KEY  -- ✅ Correto
    bloc_nome VARCHAR(60)
    cond_id INT
)

apartamentos (
    ap_id INT PRIMARY KEY
    bloc_id INT  -- ✅ FK usa bloc_id (correto!)
    ap_numero VARCHAR(15)
    ap_andar INT
)
```

#### ✅ BANCO ESTÁ CORRETO!
Contrário ao que pensávamos, o banco usa `bloc_id` TANTO na tabela bloco quanto na FK de apartamentos.
O código frontend está usando corretamente `bloc_id` e `bloc_nome`.

#### ⚠️ Problemas Encontrados:

**Em `api.js`:**
```javascript
// Linha 720-721: Usa bloc_id e bloc_nome (snake_case)
bloc_id: p.bloc_id ?? null,
bloc_nome: p.bloc_nome ?? null,
```

**Em `EditProfile/index.js` e `Perfil/index.js`:**
```javascript
// Usa bloc_nome (correto)
block: profileData.bloc_nome || '',
```

**No Banco (documentação):**
```sql
-- tmp_dicionario_dados.md linha 88
bloco_id INT NOT NULL,  -- Na tabela Apartamentos

-- tmp_dicionario_dados.md linha 69
bloc_id INT AUTO_INCREMENT PRIMARY KEY,  -- Na tabela Bloco
```

#### ✅ Solução Recomendada:
```sql
-- URGENTE: Padronizar no banco de dados!
-- Opção 1: Renomear tudo para bloc_id
ALTER TABLE Apartamentos CHANGE COLUMN bloco_id bloc_id INT NOT NULL;

-- Opção 2: Renomear tudo para bloco_id
ALTER TABLE Bloco CHANGE COLUMN bloc_id bloco_id INT AUTO_INCREMENT PRIMARY KEY;

-- RECOMENDADO: Opção 1 (bloc_id) pois bloc_nome já usa "bloc"
```

---

### 7. **ap_id / apId / apartamentoId / ap_numero**

#### 🗄️ Banco de Dados:
```sql
Apartamentos (
    ap_id INT PRIMARY KEY,  -- ✅ Correto
    ap_numero VARCHAR(15),  -- ✅ Correto
)
```

#### ⚠️ Problemas Encontrados:

**No código:**
```javascript
// Os campos estão corretos (ap_id, ap_numero)
// Porém, nas variáveis locais usam-se nomes inconsistentes:

// ❌ Às vezes: apartamentoId (camelCase)
// ✅ Deveria ser: ap_id (snake_case)
```

#### ✅ Solução Recomendada:
```javascript
// Manter ap_id e ap_numero (já estão corretos)
// Ajustar variáveis locais para usar ap_id ao invés de apartamentoId
```

---

## 🔥 CORREÇÕES URGENTES NECESSÁRIAS

### Prioridade 1: BANCO DE DADOS

```sql
-- 1. Padronizar User_ID → user_id
ALTER TABLE Usuario CHANGE COLUMN User_ID user_id INT AUTO_INCREMENT PRIMARY KEY;

-- 2. Padronizar Cond_ID → cond_id  
ALTER TABLE Condominio CHANGE COLUMN Cond_ID cond_id INT AUTO_INCREMENT PRIMARY KEY;

-- 3. Padronizar bloco_id → bloc_id (ou vice-versa)
ALTER TABLE Apartamentos CHANGE COLUMN bloco_id bloc_id INT NOT NULL;

-- 4. Atualizar todas as FKs relacionadas
-- Verificar e ajustar todas as constraints
```

### Prioridade 2: CÓDIGO FRONTEND

#### Arquivo: `src/hooks/useProfile.js`

**ANTES:**
```javascript
const userId = user?.User_ID || user?.user_id;
if (!user?.User_ID) {
await apiService.atualizarPerfilUsuario(user.User_ID, dadosAtualizados);
```

**DEPOIS:**
```javascript
const userId = user?.user_id;
if (!user?.user_id) {
await apiService.atualizarPerfilUsuario(user.user_id, dadosAtualizados);
```

#### Arquivo: `src/hooks/useCondominio.js`

**ANTES:**
```javascript
const condId = condominioId || user?.Cond_ID || user?.cond_id || user?.condId;
```

**DEPOIS:**
```javascript
const cond_id = condominioId || user?.cond_id;
```

#### Arquivo: `src/services/api.js`

**ANTES:**
```javascript
marcarTodasMensagensLidas: async (ocorrenciaId) => {
    await api.patch(`/mensagens/ocorrencia/${ocorrenciaId}/lida`);
```

**DEPOIS:**
```javascript
marcarTodasMensagensLidas: async (oco_id) => {
    await api.patch(`/mensagens/ocorrencia/${oco_id}/lida`);
```

#### Arquivo: `src/hooks/usePaginatedOcorrencias.js`

**ANTES:**
```javascript
const updateOcorrencia = useCallback((ocorrenciaId, dadosAtualizados) => {
    setOcorrencias(prev => prev.map(oco => 
        oco.id === ocorrenciaId 
```

**DEPOIS:**
```javascript
const updateOcorrencia = useCallback((oco_id, dadosAtualizados) => {
    setOcorrencias(prev => prev.map(oco => 
        oco.oco_id === oco_id 
```

#### Arquivo: `src/hooks/usePaginatedVisitantes.js`

**ANTES:**
```javascript
const updateVisitante = useCallback((visitanteId, dadosAtualizados) => {
    setVisitantes(prev => prev.map(vis => 
        vis.id === visitanteId 
```

**DEPOIS:**
```javascript
const updateVisitante = useCallback((vis_id, dadosAtualizados) => {
    setVisitantes(prev => prev.map(vis => 
        vis.vis_id === vis_id 
```

---

## 📋 PADRÃO DEFINITIVO A SER SEGUIDO

### ✅ NOMENCLATURA OFICIAL DO PROJETO

```javascript
// 1. IDs Primários (sempre snake_case minúsculo)
user_id       // ❌ NUNCA User_ID, userId, UserId
cond_id       // ❌ NUNCA Cond_ID, condId, CondId  
userap_id     // ❌ NUNCA Userap_ID, userapId, UserApId
oco_id        // ❌ NUNCA Oco_ID, ocoId, ocorrenciaId
vis_id        // ❌ NUNCA Vis_ID, visId, visitanteId
ap_id         // ❌ NUNCA Ap_ID, apId, apartamentoId
bloc_id       // ❌ NUNCA Bloc_ID, blocId, blocoId

// 2. Campos de dados (sempre snake_case minúsculo)
user_nome
user_email
user_tipo
user_telefone
user_foto
user_data_cadastro
ap_numero
ap_andar
bloc_nome
cond_nome
cond_endereco

// 3. Datas (sempre snake_case minúsculo)
vis_data_entrada
vis_data_saida
oco_data_criacao
user_data_cadastro

// 4. Status (sempre snake_case minúsculo)
vis_status
oco_status
```

### ❌ NUNCA USAR:

```javascript
// ❌ PascalCase com underscore
User_ID, Cond_ID, Userap_ID

// ❌ camelCase em campos de banco
userId, condId, ocorrenciaId, visitanteId

// ❌ Maiúsculas aleatórias
UseRaP_ID, COND_id, user_ID
```

---

## 🎯 PLANO DE AÇÃO

### Fase 1: Banco de Dados (URGENTE - Requer Migração)
- [ ] Criar script de migração SQL
- [ ] Renomear User_ID → user_id
- [ ] Renomear Cond_ID → cond_id
- [ ] Padronizar bloco_id/bloc_id
- [ ] Testar todas as FKs
- [ ] Backup completo antes da migração

### Fase 2: Backend (APIs)
- [ ] Atualizar todas as queries SQL
- [ ] Remover aliases desnecessários
- [ ] Padronizar nomes de parâmetros
- [ ] Testar todos os endpoints

### Fase 3: Frontend (React Native)
- [ ] Atualizar useProfile.js
- [ ] Atualizar useCondominio.js
- [ ] Atualizar usePaginatedOcorrencias.js
- [ ] Atualizar usePaginatedVisitantes.js
- [ ] Atualizar api.js
- [ ] Atualizar todas as telas

### Fase 4: Testes
- [ ] Testes de integração
- [ ] Testes de login/autenticação
- [ ] Testes de CRUD completo
- [ ] Testes em iOS e Android

---

## 🆘 PROBLEMA ADICIONAL CRÍTICO: Uso Genérico de `.id`

### ⚠️ Padrão Problemático Encontrado:

Em vários arquivos, o código usa `.id` genérico ao invés do campo específico do banco:

#### **usePaginatedOcorrencias.js:**
```javascript
// ❌ ERRADO: Linha 200
oco.id === ocorrenciaId

// ❌ ERRADO: Linha 211
prev.filter(oco => oco.id !== ocorrenciaId)

// ✅ CORRETO deveria ser:
oco.oco_id === oco_id
prev.filter(oco => oco.oco_id !== oco_id)
```

#### **usePaginatedVisitantes.js:**
```javascript
// ❌ ERRADO: Linha 152
vis.id === visitanteId

// ❌ ERRADO: Linha 163
prev.filter(vis => vis.id !== visitanteId)

// ✅ CORRETO deveria ser:
vis.vis_id === vis_id
prev.filter(vis => vis.vis_id !== vis_id)
```

#### **Ocorrencias/index.js:**
```javascript
// ❌ ERRADO: Linha 177 (attachments)
prev.filter(a => a.id !== id)

// ❌ ERRADO: Linha 265
it.id === issueId

// ❌ ERRADO: Linha 350 (fallback triplo!)
id: novaOcorrencia?.oco_id || novaOcorrencia?.id || Date.now()

// ✅ CORRETO deveria ser:
prev.filter(a => a.anexo_id !== anexo_id)
it.oco_id === oco_id
oco_id: novaOcorrencia.oco_id
```

#### **Visitantes/index.js:**
```javascript
// ❌ ERRADO: Linha 65
const genId = v.id ? v.id.toString() : null;

// ✅ CORRETO deveria ser:
const genId = v.vis_id ? v.vis_id.toString() : null;
```

#### **NotificationProvider.js:**
```javascript
// ❌ ERRADO: Linha 31 (fallback triplo!)
id: raw.not_id || raw.id || String(Date.now())

// ✅ CORRETO deveria ser:
not_id: raw.not_id

// ❌ ERRADO: Linha 223, 237, 289, 296
n.id === notificationId

// ✅ CORRETO deveria ser:
n.not_id === not_id
```

#### **Reservas/index.js:**
```javascript
// ❌ ERRADO: Linha 41, 51
e.id === env.id

// ❌ ERRADO: Linha 106
r.id === id

// ✅ CORRETO deveria ser (assumindo):
e.env_id === env.env_id
r.res_id === res_id
```

### 🎯 Solução:

**NUNCA usar `.id` genérico!** Sempre usar o nome específico do banco:

```javascript
// ❌ NUNCA:
item.id
obj.id
record.id

// ✅ SEMPRE:
ocorrencia.oco_id
visitante.vis_id
notificacao.not_id
reserva.res_id
ambiente.env_id
usuario.user_id
condominio.cond_id
```

**Exceções permitidas:**
- Arrays temporários/mock data SEM backend (FAQ, tutorial, etc.)
- Componentes UI genéricos (acordeão, modal) que não representam entidades do banco

---

## 📊 ESTATÍSTICAS ATUALIZADAS

- **Total de inconsistências encontradas:** 7 campos críticos + padrão `.id` genérico
- **Arquivos afetados:** ~20 arquivos
- **Linhas com fallbacks desnecessários:** ~50 linhas
- **Usos incorretos de `.id` genérico:** ~25 ocorrências
- **Impacto na performance:** Médio-Alto (múltiplos acessos opcionais + fallbacks)
- **Impacto na manutenibilidade:** CRÍTICO (confusão constante)
- **Risco de bugs:** CRÍTICO (campos undefined, comparações falhando)

---

## 🚨 IMPACTO DOS PROBLEMAS

### Exemplos de Erros Causados:

1. **"Nenhum usuário logado"** → Causado por `user?.User_ID` vs `user?.user_id`
2. **"cond_id undefined"** → Causado por `user?.Cond_ID` vs `user?.cond_id`
3. **"Cannot read property of undefined"** → Múltiplos fallbacks confusos
4. **"403 Forbidden"** → Campo com nome errado não enviado para API

---

## ✅ CONCLUSÃO

A padronização completa para **snake_case minúsculo** em TODOS os campos é essencial para:

1. ✅ Evitar bugs de campos undefined
2. ✅ Melhorar legibilidade do código
3. ✅ Facilitar manutenção futura
4. ✅ Reduzir fallbacks desnecessários
5. ✅ Consistência com padrão SQL tradicional
6. ✅ Prevenir erros de digitação

**Tempo estimado para correção completa:** 8-12 horas de trabalho focado

**Recomendação:** Implementar em ambiente de desenvolvimento primeiro, depois migrar produção com backup completo.
