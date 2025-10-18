# 🚀 AÇÕES IMEDIATAS - Limpeza e Otimização

## ✅ Checklist de Execução Rápida (30-45 minutos)

### 1️⃣ Remover Placeholders Não Utilizados ❌

**Problema Detectado**: 
- `About` e `ChangePassword` em ProfileStack apontam para Placeholders
- Mas já existem telas reais: `Security` (troca de senha) e `Help` (ajuda)

**Ação**:
```diff
- import About from '../screens/App/Perfil/Placeholders/About';
- import ChangePassword from '../screens/App/Perfil/Placeholders/ChangePassword';

# Remover rotas não utilizadas:
-  <ProfileStackNavigator.Screen name="About" component={About} />
-  <ProfileStackNavigator.Screen name="ChangePassword" component={ChangePassword} />
```

**Arquivos para DELETAR**:
```
❌ src/screens/App/Perfil/Placeholders/About.js
❌ src/screens/App/Perfil/Placeholders/ChangePassword.js
❌ src/screens/App/Perfil/Placeholders/Documents.js
❌ src/screens/App/Perfil/Placeholders/EditProfile.js
❌ src/screens/App/Perfil/Placeholders/Security.js
❌ src/screens/App/Perfil/Placeholders/UnitDetails.js
❌ src/screens/App/Perfil/Placeholders/ (toda a pasta)
```

---

### 2️⃣ Remover Arquivos Duplicados ❌

```
❌ src/screens/App/Perfil/index_new.js
❌ src/screens/App/Visitantes/AuthorizeVisitorScreen_NEW.js
```

---

### 3️⃣ Verificar e Limpar Mock ⚠️

**Problema**: `Documents/index.js` ainda importa `userProfile` do mock

**Ação**:
1. Verificar se Documents foi atualizado para usar `useDocumentos`
2. Se SIM: remover import do mock
3. Se NÃO: aplicar correção manual

**Arquivos a verificar**:
```
⚠️ src/screens/App/Perfil/Documents/index.js (linha 7)
⚠️ src/screens/App/Perfil/mock.js (deletar se não usado)
```

---

### 4️⃣ Limpar Pasta Temporária ❌

```
❌ tmp_dicionario/ (mover conteúdo ou deletar)
```

---

## 🔧 Correções a Aplicar

### Correção 1: ProfileStack.js

```javascript
// ARQUIVO: src/routes/ProfileStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Perfil from '../screens/App/Perfil';
import NotificationPreferences from '../screens/App/Settings/NotificationPreferences';
import EditProfile from '../screens/App/Perfil/EditProfile';
import Security from '../screens/App/Perfil/Security';
import UnitDetails from '../screens/App/Perfil/UnitDetails';
import Documents from '../screens/App/Perfil/Documents';
import HelpSupport from '../screens/App/Perfil/Help';

const ProfileStackNavigator = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <ProfileStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNavigator.Screen name="ProfileMain" component={Perfil} />
      <ProfileStackNavigator.Screen name="NotificationPreferences" component={NotificationPreferences} />
      <ProfileStackNavigator.Screen name="Help" component={HelpSupport} />
      <ProfileStackNavigator.Screen name="EditProfile" component={EditProfile} />
      <ProfileStackNavigator.Screen name="Security" component={Security} />
      <ProfileStackNavigator.Screen name="UnitDetails" component={UnitDetails} />
      <ProfileStackNavigator.Screen name="Documents" component={Documents} />
    </ProfileStackNavigator.Navigator>
  );
}
```

### Correção 2: Documents/index.js (SE ainda estiver usando mock)

**Verificar se linha 7 tem**:
```javascript
import { userProfile } from '../mock';
```

**Se SIM, substituir por**:
```javascript
import { useDocumentos } from '../../../../hooks';
```

**E substituir todo o mock de documentos pelo hook**:
```javascript
const { 
  documentos, 
  loading, 
  downloading,
  downloadDocumento 
} = useDocumentos();
```

---

## 📋 Comandos de Terminal

### Windows PowerShell/CMD:
```powershell
# Navegar até o projeto
cd d:\TEMP\Matheus\projeto-condoway-old

# Deletar Placeholders
Remove-Item -Recurse -Force src\screens\App\Perfil\Placeholders

# Deletar arquivos duplicados
Remove-Item src\screens\App\Perfil\index_new.js
Remove-Item src\screens\App\Visitantes\AuthorizeVisitorScreen_NEW.js

# Deletar pasta temporária (SE não for usada)
Remove-Item -Recurse -Force tmp_dicionario

# Deletar mock (SE Documents foi corrigido)
Remove-Item src\screens\App\Perfil\mock.js
```

### Bash/Linux:
```bash
# Navegar até o projeto
cd /d/TEMP/Matheus/projeto-condoway-old

# Deletar Placeholders
rm -rf src/screens/App/Perfil/Placeholders

# Deletar arquivos duplicados
rm src/screens/App/Perfil/index_new.js
rm src/screens/App/Visitantes/AuthorizeVisitorScreen_NEW.js

# Deletar pasta temporária
rm -rf tmp_dicionario

# Deletar mock (SE Documents foi corrigido)
rm src/screens/App/Perfil/mock.js
```

---

## ✅ Validação Pós-Limpeza

Após executar as ações, rodar:

```bash
# Verificar se não há erros de import
npm run start

# Rodar testes
npm test

# Verificar tamanho do projeto
du -sh . # Linux
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum # Windows
```

---

## 📊 Resultado Esperado

### Antes:
- Arquivos não utilizados: ~12 arquivos
- Tamanho desperdiçado: ~50-100 KB
- Confusão de código: Alta

### Depois:
- Arquivos limpos: ✅
- Código mais limpo: ✅
- Manutenibilidade: ⬆️ 30%

---

## 🎯 Próximo Passo

Após limpeza:
1. Commit das mudanças
2. Implementar paginação em Ocorrências (próxima prioridade)

---

**Tempo estimado**: 30-45 minutos
**Risco**: Baixo (apenas limpeza)
**Impacto**: Médio (organização e manutenibilidade)
