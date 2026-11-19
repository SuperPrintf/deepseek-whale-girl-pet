#!/bin/sh
set -eu
base=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
dest="${CODEX_HOME:-$HOME/.codex}/pets/deepseek-whale-girl"
test -f "$base/codex/deepseek-whale-girl/pet.json"
test -f "$base/codex/deepseek-whale-girl/spritesheet.webp"
if [ -e "$dest" ]; then
 backup="$dest.backup-$(date +%Y%m%d-%H%M%S)-$$"
 test ! -e "$backup"
 cp -R "$dest" "$backup"
fi
mkdir -p "$dest"
cp "$base/codex/deepseek-whale-girl/pet.json" "$base/codex/deepseek-whale-girl/spritesheet.webp" "$dest/"
printf '%s\n' "Installed: $dest" 'Open Codex Settings > Pets, Refresh, then select the whale girl.'
