# Script de Limpeza do Projeto CondoWay
# Deleta arquivos não utilizados identificados na análise

Write-Host "🧹 Iniciando limpeza do projeto..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = "d:\TEMP\Matheus\projeto-condoway-old"
Set-Location $projectRoot

$deletedCount = 0
$errors = 0

# Função para deletar arquivo com confirmação
function Remove-SafeItem {
    param (
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        try {
            Remove-Item -Path $Path -Recurse -Force
            Write-Host "✅ Deletado: $Description" -ForegroundColor Green
            $script:deletedCount++
        } catch {
            Write-Host "❌ Erro ao deletar: $Description - $($_.Exception.Message)" -ForegroundColor Red
            $script:errors++
        }
    } else {
        Write-Host "⚠️  Não encontrado: $Description" -ForegroundColor Yellow
    }
}

Write-Host "1️⃣  Deletando pasta Placeholders..." -ForegroundColor Yellow
Remove-SafeItem -Path "src\screens\App\Perfil\Placeholders" -Description "Pasta Placeholders completa"

Write-Host ""
Write-Host "2️⃣  Deletando arquivos duplicados..." -ForegroundColor Yellow
Remove-SafeItem -Path "src\screens\App\Perfil\index_new.js" -Description "index_new.js (arquivo duplicado)"
Remove-SafeItem -Path "src\screens\App\Visitantes\AuthorizeVisitorScreen_NEW.js" -Description "AuthorizeVisitorScreen_NEW.js (arquivo duplicado)"

Write-Host ""
Write-Host "3️⃣  Deletando pasta temporária..." -ForegroundColor Yellow
Remove-SafeItem -Path "tmp_dicionario" -Description "tmp_dicionario/ (pasta temporária)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Resumo da Limpeza:" -ForegroundColor Cyan
Write-Host "   ✅ Itens deletados: $deletedCount" -ForegroundColor Green
if ($errors -gt 0) {
    Write-Host "   ❌ Erros: $errors" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Verificando tamanho do projeto..." -ForegroundColor Yellow
$totalSize = (Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   📦 Tamanho total: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "✨ Limpeza concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Execute os seguintes comandos para validar:" -ForegroundColor Yellow
Write-Host "   1. npm run start  (verificar se app inicia sem erros)" -ForegroundColor White
Write-Host "   2. npm test       (rodar testes)" -ForegroundColor White
Write-Host ""
