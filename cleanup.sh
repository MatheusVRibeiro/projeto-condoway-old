#!/bin/bash

# Script de Limpeza do Projeto CondoWay
# Deleta arquivos não utilizados identificados na análise

echo -e "\033[1;36m🧹 Iniciando limpeza do projeto...\033[0m"
echo ""

PROJECT_ROOT="/d/TEMP/Matheus/projeto-condoway-old"
cd "$PROJECT_ROOT" || exit 1

DELETED_COUNT=0
ERRORS=0

# Função para deletar arquivo com confirmação
remove_safe_item() {
    local path="$1"
    local description="$2"
    
    if [ -e "$path" ]; then
        if rm -rf "$path" 2>/dev/null; then
            echo -e "\033[1;32m✅ Deletado: $description\033[0m"
            ((DELETED_COUNT++))
        else
            echo -e "\033[1;31m❌ Erro ao deletar: $description\033[0m"
            ((ERRORS++))
        fi
    else
        echo -e "\033[1;33m⚠️  Não encontrado: $description\033[0m"
    fi
}

echo -e "\033[1;33m1️⃣  Deletando pasta Placeholders...\033[0m"
remove_safe_item "src/screens/App/Perfil/Placeholders" "Pasta Placeholders completa"

echo ""
echo -e "\033[1;33m2️⃣  Deletando arquivos duplicados...\033[0m"
remove_safe_item "src/screens/App/Perfil/index_new.js" "index_new.js (arquivo duplicado)"
remove_safe_item "src/screens/App/Visitantes/AuthorizeVisitorScreen_NEW.js" "AuthorizeVisitorScreen_NEW.js (arquivo duplicado)"

echo ""
echo -e "\033[1;33m3️⃣  Deletando pasta temporária...\033[0m"
remove_safe_item "tmp_dicionario" "tmp_dicionario/ (pasta temporária)"

echo ""
echo -e "\033[1;36m========================================\033[0m"
echo -e "\033[1;36m📊 Resumo da Limpeza:\033[0m"
echo -e "\033[1;32m   ✅ Itens deletados: $DELETED_COUNT\033[0m"
if [ $ERRORS -gt 0 ]; then
    echo -e "\033[1;31m   ❌ Erros: $ERRORS\033[0m"
fi
echo -e "\033[1;36m========================================\033[0m"
echo ""

echo -e "\033[1;33m🔍 Verificando tamanho do projeto...\033[0m"
TOTAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo -e "\033[1;36m   📦 Tamanho total: $TOTAL_SIZE\033[0m"

echo ""
echo -e "\033[1;32m✨ Limpeza concluída!\033[0m"
echo ""
echo -e "\033[1;33m⚠️  IMPORTANTE: Execute os seguintes comandos para validar:\033[0m"
echo -e "\033[1;37m   1. npm run start  (verificar se app inicia sem erros)\033[0m"
echo -e "\033[1;37m   2. npm test       (rodar testes)\033[0m"
echo ""
