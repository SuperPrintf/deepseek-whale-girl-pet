param([string]$DestinationRoot)
$ErrorActionPreference = 'Stop'
$codexRoot = if ($DestinationRoot) { $DestinationRoot } elseif ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$target = Join-Path $codexRoot 'pets/deepseek-whale-girl'
$source = Join-Path $PSScriptRoot 'codex/deepseek-whale-girl'
if (!(Test-Path -LiteralPath (Join-Path $source 'pet.json')) -or !(Test-Path -LiteralPath (Join-Path $source 'spritesheet.webp'))) { throw 'Package incomplete' }
if (Test-Path -LiteralPath $target) {
  $backup = "$target.backup-$([DateTime]::Now.ToString('yyyyMMdd-HHmmss-ffff'))"
  Copy-Item -LiteralPath $target -Destination $backup -Recurse
  Write-Host "Existing pet backed up to $backup"
}
New-Item -ItemType Directory -Path $target -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $source 'pet.json'),(Join-Path $source 'spritesheet.webp') -Destination $target -Force
Write-Host "Installed: $target"
Write-Host 'Open Codex Settings > Pets, Refresh, then select DeepSeek whale girl.'

