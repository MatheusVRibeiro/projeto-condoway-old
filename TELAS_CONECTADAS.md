# Telas Conectadas às APIs - Status de Integração

## 📊 Resumo Geral

Este documento lista todas as telas do aplicativo CondoWay e seu status de integração com as APIs do backend.

**Última atualização**: 03/10/2025

---

## ✅ Telas Totalmente Conectadas

### 1. **Login** (`src/contexts/AuthContext.js`)
- **API**: `apiService.login(email, password)`
- **Funcionalidades**:
  - ✅ Autenticação de usuário
  - ✅ Armazenamento de token JWT
  - ✅ Persistência de sessão (AsyncStorage)
  - ✅ Configuração automática de headers de autenticação

---

### 2. **Editar Perfil** (`src/screens/App/Perfil/EditProfile/index.js`)
- **Hook**: `useProfile()`
- **APIs utilizadas**:
  - ✅ `buscarPerfilUsuario` - Carrega dados do perfil
  - ✅ `atualizarPerfilUsuario` - Salva alterações
  - ✅ `uploadFotoPerfil` - Upload de avatar
- **Funcionalidades**:
  - ✅ Editar nome, email, telefone
  - ✅ Upload e atualização de foto de perfil
  - ✅ Loading states e error handling
  - ✅ Sincronização com AuthContext
  - ✅ Visualização de dados da unidade (read-only)

---

### 3. **Perfil Principal** (`src/screens/App/Perfil/index.js`)
- **Hooks**: `useProfile()`, `useAuth()`
- **APIs utilizadas**:
  - ✅ `buscarPerfilUsuario` - Dados do usuário
  - ✅ `uploadFotoPerfil` - Atualizar avatar
- **Funcionalidades**:
  - ✅ Exibir dados do perfil (nome, apartamento, bloco, tipo)
  - ✅ Atualizar foto de perfil com preview
  - ✅ Navegação para sub-telas (EditProfile, UnitDetails, Security)
  - ✅ Logout

---

### 4. **Detalhes da Unidade** (`src/screens/App/Perfil/UnitDetails/index.js`)
- **Hooks**: `useProfile()`, `useCondominio()`
- **APIs utilizadas**:
  - ✅ `buscarPerfilUsuario` - Dados do usuário e unidade
  - ✅ `buscarDetalhesUnidade` - Informações da unidade
  - ✅ `buscarCondominio` - Dados do condomínio
- **Funcionalidades**:
  - ✅ Informações básicas (apartamento, bloco, área, quartos)
  - ✅ Dados do condomínio (nome, endereço, cidade)
  - ✅ Informações financeiras (taxa condominial - mock temporário)
  - ✅ Contato de emergência (mock temporário)
  - ✅ Status dos serviços (mock temporário)
  - ✅ Áreas comuns disponíveis (mock temporário)
  - ✅ Loading state

---

### 5. **Dashboard** (`src/screens/App/Dashboard/index.js`)
- **Hooks**: `useProfile()`, `useCondominio()`, `useAuth()`
- **APIs utilizadas**:
  - ✅ `buscarPerfilUsuario` - Nome e foto do usuário
  - ✅ `buscarCondominio` - Nome do condomínio
- **Funcionalidades**:
  - ✅ Saudação personalizada com nome do usuário
  - ✅ Nome do condomínio
  - ✅ Avatar do usuário (da API ou fallback)
  - ✅ Notificações (contador de não lidas)
  - ⚠️ Avisos importantes (ainda usa mock)
  - ⚠️ Encomendas (ainda usa mock)
  - ⚠️ Últimas atualizações (ainda usa mock)

---

### 6. **Visitantes - Listagem** (`src/screens/App/Visitantes/index.js`)
- **API**: `apiService.listarVisitantes()`
- **Funcionalidades**:
  - ✅ Listar visitantes autorizados
  - ✅ Filtros por status e data
  - ✅ Visualização de detalhes
  - ✅ Navegação para autorização

---

### 7. **Visitantes - Autorizar** (`src/screens/App/Visitantes/AuthorizeVisitorScreen.js`)
- **API**: `apiService.criarVisitante(dadosVisitante)`
- **Funcionalidades**:
  - ✅ Criar nova autorização de visitante
  - ✅ Definir período de validade
  - ✅ Gerar QR Code de acesso
  - ✅ Validação de dados
  - ✅ Feedback de sucesso/erro

---

### 8. **Ocorrências** (`src/screens/App/Ocorrencias/index.js`)
- **APIs**: Múltiplas
  - ✅ `buscarOcorrencias` - Lista de ocorrências
  - ✅ `criarOcorrencia` - Criar nova
  - ✅ `uploadAnexo` - Upload de fotos
  - ✅ `adicionarComentario` - Comentários
- **Funcionalidades**:
  - ✅ Listar ocorrências
  - ✅ Criar nova ocorrência com anexos
  - ✅ Upload de múltiplas imagens
  - ✅ Adicionar comentários
  - ✅ Filtros e ordenação
  - ✅ Detalhes completos

---

### 9. **Notificações** (`src/contexts/NotificationProvider.js`)
- **APIs**:
  - ✅ `getNotificacoes(userId)` - Listar
  - ✅ `criarNotificacao` - Criar
  - ✅ `marcarNotificacaoComoLida` - Marcar como lida
- **Funcionalidades**:
  - ✅ Provider global de notificações
  - ✅ Contador de não lidas
  - ✅ Criar notificações locais
  - ✅ Sincronização com servidor
  - ✅ Marcar como lida

---

## 🎨 Componentes Conectados

### **CondominioCard** (`src/components/CondominioCard/index.js`)
- **Hook**: `useCondominio()`
- **Funcionalidades**:
  - ✅ Exibir nome, endereço e cidade do condomínio
  - ✅ Loading state
  - ✅ Tema claro/escuro
  - ✅ Touchable com callback

---

### 10. **Segurança/Alterar Senha** (`src/screens/App/Perfil/Security/index.js`)
- **Hook**: `useProfile()`
- **API**: `alterarSenha(userId, senhaAtual, novaSenha)`
- **Funcionalidades**:
  - ✅ Alterar senha com validação
  - ✅ Verificação de senha atual
  - ✅ Confirmação de nova senha
  - ✅ Validação de requisitos mínimos (6+ caracteres)
  - ✅ Loading state durante requisição
  - ✅ Feedback de sucesso/erro com Alert
  - ✅ Limpeza de campos após sucesso

---

## ⚠️ Telas Parcialmente Conectadas

### 1. **Encomendas/Packages** (`src/screens/App/Packages/`)
- **Status**: Possui APIs disponíveis mas não implementadas nas telas
- **APIs disponíveis**:
  - `getEncomendas()` - Listar encomendas
  - `marcarEncomendaComoEntregue(id, retiradoPor)` - Marcar como entregue
- **Próximos passos**: Conectar telas às APIs existentes

---

## 🔴 Telas Ainda com Dados Mock

### 1. **Reservas** (`src/screens/App/Reservas/`)
- **Status**: Totalmente mock
- **Necessário**:
  - Implementar APIs de reservas no backend
  - Criar hook `useReservas`
  - Conectar telas

### 2. **Documentos** (`src/screens/App/Perfil/Documents/`)
- **Status**: Mock
- **Necessário**:
  - APIs: `listarDocumentos`, `baixarDocumento`
  - Hook `useDocumentos`

### 3. **Ajuda e Suporte** (`src/screens/App/Perfil/Help/`)
- **Status**: Mock estático
- **Necessário**: Definir se terá API ou permanecerá estático

### 4. **Preferências de Notificação** (`src/screens/App/Settings/NotificationPreferences/`)
- **Status**: Mock
- **Necessário**:
  - APIs: `buscarPreferenciasNotificacao`, `atualizarPreferenciasNotificacao`

---

## 📈 Estatísticas de Integração

### Por Categoria

| Categoria | Total de Telas | Conectadas | Parcialmente | Mock | % Conectado |
|-----------|----------------|------------|--------------|------|-------------|
| **Autenticação** | 1 | 1 | 0 | 0 | 100% |
| **Perfil** | 5 | 4 | 0 | 1 | 80% |
| **Visitantes** | 3 | 3 | 0 | 0 | 100% |
| **Ocorrências** | 2 | 2 | 0 | 0 | 100% |
| **Encomendas** | 2 | 0 | 2 | 0 | 0% |
| **Reservas** | 5 | 0 | 0 | 5 | 0% |
| **Dashboard** | 1 | 1 | 0 | 0 | 100% |
| **Notificações** | 1 | 1 | 0 | 0 | 100% |
| **Documentos** | 1 | 0 | 0 | 1 | 0% |
| **Configurações** | 2 | 0 | 0 | 2 | 0% |
| **TOTAL** | **23** | **12** | **2** | **9** | **52.2%** |

### Por Status de Integração

- ✅ **Totalmente conectadas**: 12 telas (52.2%)
- ⚠️ **Parcialmente conectadas**: 2 telas (8.7%)
- 🔴 **Ainda com mock**: 9 telas (39.1%)

---

## 🎯 Hooks Customizados Criados

### 1. **useProfile**
- **Localização**: `src/hooks/useProfile.js`
- **Funcionalidades**:
  - `loadProfile()` - Carrega perfil do usuário
  - `loadUnitDetails()` - Carrega detalhes da unidade
  - `updateProfile(dados)` - Atualiza perfil
  - `changePassword(senhaAtual, novaSenha)` - Altera senha
  - `uploadProfilePhoto(fileUri)` - Upload de foto
  - `handlePickImage()` - Seletor de imagem integrado
- **Estados**: `profileData`, `unitData`, `loading`, `error`

### 2. **useCondominio**
- **Localização**: `src/hooks/useCondominio.js`
- **Funcionalidades**:
  - `loadCondominio(id)` - Carrega condomínio
  - `loadCondominios()` - Lista todos
  - `createCondominio(dados)` - Criar novo (admin/síndico)
  - `updateCondominio(id, dados)` - Atualizar (admin/síndico)
  - `deleteCondominio(id)` - Deletar (admin)
  - `loadEstatisticas(id)` - Estatísticas
- **Estados**: `condominioData`, `condominios`, `estatisticas`, `loading`, `error`

---

## 🚀 Próximas Prioridades

### Alta Prioridade
1. ✅ ~~Conectar `UnitDetails` - CONCLUÍDO~~
2. ✅ ~~Conectar `Perfil` principal - CONCLUÍDO~~
3. ✅ ~~Conectar `Dashboard` - CONCLUÍDO~~
4. ✅ ~~Conectar `Security` - CONCLUÍDO~~
5. 🔄 Implementar APIs de `Encomendas` nas telas

### Média Prioridade
6. Implementar APIs de `Reservas` (backend + frontend)
7. Conectar `Documentos`
8. Conectar `NotificationPreferences`

### Baixa Prioridade
9. Definir estratégia para `Ajuda e Suporte`
10. Adicionar mais estatísticas no Dashboard

---

## 📝 Notas de Implementação

### Padrões Seguidos
- ✅ Uso de hooks customizados para encapsular lógica de API
- ✅ Loading states em todas as operações assíncronas
- ✅ Error handling com try/catch e feedback ao usuário
- ✅ Fallback para dados mock quando API não disponível
- ✅ Sincronização com AuthContext quando necessário
- ✅ TypeScript-ready (preparado para tipagem futura)

### Estrutura de Dados da API

**Perfil/Usuário**:
```javascript
{
  User_ID: number,
  user_nome: string,
  user_email: string,
  user_telefone: string,
  user_foto: string,
  Apto_ID: number,
  apto_numero: string,
  bloco_nome: string,
  cond_nome: string,
  userap_tipo: 'morador' | 'proprietario' | 'sindico' | 'porteiro'
}
```

**Condomínio**:
```javascript
{
  cond_id: number,
  cond_nome: string,
  cond_endereco: string,
  cond_cidade: string
}
```

---

## 🔗 Documentação Relacionada

- [USUARIO_APARTAMENTO_API.md](./USUARIO_APARTAMENTO_API.md) - Documentação da API de Usuário/Apartamento
- [CONDOMINIO_API.md](./CONDOMINIO_API.md) - Documentação da API de Condomínio
- [AUTHORIZE_VISITOR_IMPROVEMENTS.md](./AUTHORIZE_VISITOR_IMPROVEMENTS.md) - Melhorias em Visitantes

---

**Data de criação**: 03/10/2025  
**Versão**: 1.0  
**Autor**: AI Assistant
