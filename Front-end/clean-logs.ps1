# Script para remover logs de console e comentários de debug

$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remove console.log statements
    $content = $content -replace "console\.log\([^;]*\);?\s*\n?", ""
    
    # Remove empty lines
    $content = $content -replace "\n\s*\n\s*\n", "`n`n"
    
    Set-Content $file.FullName $content
}

Write-Host "Logs removidos de todos os arquivos TypeScript/React"
