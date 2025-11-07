# 🔧 Correção: Upload de Foto de Perfil

## ❌ Problema
```
TypeError: apiService.uploadFotoPerfil is not a function
```

## ✅ Solução
Criada função `uploadFotoPerfil` em `src/services/api.js` (linha ~765)

## 📝 Implementação

### Endpoint Backend (Compatível)
Backend suporta **2 rotas**:
```
✅ POST /usuario/foto/:id (campo 'file') ← Usada pelo frontend
✅ POST /usuario/perfil/:id/foto (campo 'foto') ← Alternativa
```

Frontend configurado para: **`POST /usuario/foto/:id`** com campo **`file`**

### Retorno
```javascript
{
  sucesso: true,
  url: 'https://...',
  dados: { path, filename, user_foto }
}
```

### Características
- ✅ Suporta Web (blob → File) e Mobile (URI)
- ✅ FormData com multipart/form-data
- ✅ Logs detalhados
- ✅ Tratamento de erro 404
- ✅ Compatível com `useProfile.js`

## ⚠️ Requisito do Backend
✅ **Backend já implementado!** Suporta ambas as rotas:
- ✅ `POST /usuario/foto/:id` (campo `file`) ← **Frontend usa esta**
- ✅ `POST /usuario/perfil/:id/foto` (campo `foto`)

## 🎯 Status
✅ **Frontend Pronto** | ✅ **Backend Compatível** | ⏳ **Pronto para testes**

---
**Arquivos alterados:**
- `src/services/api.js` ← Nova função `uploadFotoPerfil`

**Documentação completa:** `UPLOAD_FOTO_PERFIL_IMPLEMENTADO.md`
