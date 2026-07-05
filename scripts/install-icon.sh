#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${1:-/Applications/MarkText.app}"
ICON="$ROOT/icon/lens-marktext-icon.icns"
PNG="$ROOT/icon/lens-marktext-icon.png"
STAMP="$(date +%Y%m%d-%H%M%S)"

if [[ ! -d "$APP" ]]; then
  echo "MarkText app not found: $APP" >&2
  exit 1
fi

if [[ ! -f "$ICON" || ! -f "$PNG" ]]; then
  "$ROOT/scripts/build-icon.sh"
fi

RES="$APP/Contents/Resources"

backup_if_exists() {
  local file="$1"
  if [[ -f "$file" && ! -f "$file.lens-backup-$STAMP" ]]; then
    cp "$file" "$file.lens-backup-$STAMP"
  fi
}

backup_if_exists "$RES/icon.icns"
backup_if_exists "$RES/static/icon.icns"
backup_if_exists "$RES/static/icon.png"

cp "$ICON" "$RES/icon.icns"
cp "$ICON" "$RES/static/icon.icns"
cp "$PNG" "$RES/static/icon.png"

touch "$APP"

if command -v codesign >/dev/null 2>&1; then
  codesign --force --deep --sign - "$APP" >/dev/null
fi

if command -v qlmanage >/dev/null 2>&1; then
  qlmanage -r >/dev/null 2>&1 || true
  qlmanage -r cache >/dev/null 2>&1 || true
fi

echo "Installed icon into $APP"
echo "A Finder/Dock cache refresh or MarkText restart may be needed before the new icon appears."
