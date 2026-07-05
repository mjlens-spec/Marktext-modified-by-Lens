#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${1:-/Applications/MarkText.app}"
ASAR="$APP/Contents/Resources/app.asar"
STAMP="$(date +%Y%m%d-%H%M%S)"
WORK="$(mktemp -d "$ROOT/.tmp/marktext-asar-patch.XXXXXX")"
EXTRACTED="$WORK/extracted"
PATCHED="$WORK/app.asar"

if [[ ! -f "$ASAR" ]]; then
  echo "MarkText app.asar not found: $ASAR" >&2
  exit 1
fi

mkdir -p "$EXTRACTED"
npm_config_cache="$ROOT/.npm-cache" npx --yes asar extract "$ASAR" "$EXTRACTED"
node "$ROOT/scripts/patch-asar-themes.mjs" "$EXTRACTED"
npm_config_cache="$ROOT/.npm-cache" npx --yes asar pack "$EXTRACTED" "$PATCHED"

cp "$ASAR" "$ASAR.lens-theme-backup-$STAMP"
cp "$PATCHED" "$ASAR"

if command -v codesign >/dev/null 2>&1; then
  codesign --force --deep --sign - "$APP" >/dev/null
fi

echo "Installed built-in themes into $APP"
echo "Backup: $ASAR.lens-theme-backup-$STAMP"
echo "Work dir kept for inspection: $WORK"
