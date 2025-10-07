# 🚀 Como Executar a Limpeza do Projeto

## 📋 Pré-requisitos

- [x] Backup do projeto (git commit ou cópia)
- [x] Terminal com permissões adequadas
- [x] Node.js instalado

---

## 🪟 Windows (PowerShell)

### Opção 1: Executar diretamente
```powershell
# Abrir PowerShell como Administrador
# Navegar até o projeto
cd d:\TEMP\Matheus\projeto-condoway-old

# Executar script
.\cleanup.ps1
```

### Opção 2: Se houver erro de política de execução
```powershell
# Permitir execução temporária
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Executar script
.\cleanup.ps1

# (Opcional) Restaurar política
Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope Process
```

---

## 🐧 Linux / Mac / Git Bash

```bash
# Navegar até o projeto
cd /d/TEMP/Matheus/projeto-condoway-old

# Dar permissão de execução
chmod +x cleanup.sh

# Executar script
./cleanup.sh
```

---

## ✅ Validação Após Limpeza

### 1. Verificar se app inicia sem erros
```bash
npm run start
```

### 2. Rodar testes
```bash
npm test
```

### 3. Verificar navegação
- Abrir app
- Ir para Perfil
- Testar navegação para:
  - [x] Editar Perfil
  - [x] Segurança
  - [x] Minha Unidade
  - [x] Documentos
  - [x] Ajuda e Suporte

---

## 📦 O Que Será Deletado

### ❌ Pasta Placeholders (6 arquivos)
```
src/screens/App/Perfil/Placeholders/
  ├── About.js
  ├── ChangePassword.js
  ├── Documents.js
  ├── EditProfile.js
  ├── Security.js
  └── UnitDetails.js
```

### ❌ Arquivos Duplicados (2 arquivos)
```
src/screens/App/Perfil/index_new.js
src/screens/App/Visitantes/AuthorizeVisitorScreen_NEW.js
```

### ❌ Pasta Temporária
```
tmp_dicionario/
```

---

## 🔄 Rollback (se necessário)

Se algo der errado, você pode restaurar através do git:

```bash
# Ver mudanças
git status

# Reverter mudanças específicas
git checkout -- src/routes/ProfileStack.js

# Ou reverter tudo
git reset --hard HEAD
```

---

## 📊 Resultado Esperado

### Antes da Limpeza
```
📁 projeto
  ├── src/screens/App/Perfil/
  │   ├── Placeholders/ ❌ (6 arquivos)
  │   └── index_new.js ❌
  ├── src/screens/App/Visitantes/
  │   └── AuthorizeVisitorScreen_NEW.js ❌
  └── tmp_dicionario/ ❌
```

### Depois da Limpeza
```
📁 projeto
  ├── src/screens/App/Perfil/ ✅ (apenas arquivos em uso)
  └── src/screens/App/Visitantes/ ✅ (apenas arquivos em uso)
```

### Console Output Esperado
```
🧹 Iniciando limpeza do projeto...

1️⃣  Deletando pasta Placeholders...
✅ Deletado: Pasta Placeholders completa

2️⃣  Deletando arquivos duplicados...
✅ Deletado: index_new.js (arquivo duplicado)
✅ Deletado: AuthorizeVisitorScreen_NEW.js (arquivo duplicado)

3️⃣  Deletando pasta temporária...
✅ Deletado: tmp_dicionario/ (pasta temporária)

========================================
📊 Resumo da Limpeza:
   ✅ Itens deletados: 4
========================================

✨ Limpeza concluída!
```

---

## ❓ Troubleshooting

### Erro: "Execution policy"
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Erro: "Permission denied"
```bash
chmod +x cleanup.sh
```

### Erro: "Path not found"
- Verifique se está no diretório correto do projeto
- Use `pwd` (Linux) ou `Get-Location` (Windows) para confirmar

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se fez backup/commit antes
2. Revise o arquivo `MELHORIAS_PROJETO.md`
3. Consulte `ACOES_IMEDIATAS.md` para mais detalhes

---

## ✨ Próximos Passos

Após executar a limpeza com sucesso:
1. ✅ Commit das mudanças
2. 📖 Ler `RESUMO_EXECUTIVO.md`
3. 🚀 Começar implementação de paginação

---

*Última atualização: 06/10/2025*
