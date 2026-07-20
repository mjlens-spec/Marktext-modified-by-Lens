#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFAULT_APP="/Applications/Reversion.app"
if [[ ! -d "$DEFAULT_APP" && -d "/Applications/MarkText.app" ]]; then
  DEFAULT_APP="/Applications/MarkText.app"
fi
APP="${1:-$DEFAULT_APP}"
ICON="$ROOT/icon/lens-marktext-icon.icns"
PNG="$ROOT/icon/lens-marktext-icon.png"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${LENS_BACKUP_DIR:-$HOME/Library/Application Support/marktext/lens-backups/icons-$STAMP}"

if [[ ! -d "$APP" ]]; then
  echo "Reversion/MarkText app not found: $APP" >&2
  exit 1
fi

if [[ ! -f "$ICON" || ! -f "$PNG" ]]; then
  "$ROOT/scripts/build-icon.sh"
fi

RES="$APP/Contents/Resources"
mkdir -p "$BACKUP_DIR"

backup_if_exists() {
  local file="$1"
  local relative="${file#"$RES/"}"
  local backup="$BACKUP_DIR/${relative//\//-}"
  if [[ -f "$file" ]]; then
    cp "$file" "$backup"
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
  codesign --force --sign - --requirements '=designated => identifier "com.github.marktext.marktext"' "$APP" >/dev/null
fi

if command -v qlmanage >/dev/null 2>&1; then
  qlmanage -r >/dev/null 2>&1 || true
  qlmanage -r cache >/dev/null 2>&1 || true
fi

echo "Installed icon into $APP"
echo "Backups: $BACKUP_DIR"
echo "A Finder/Dock cache refresh or Reversion restart may be needed before the new icon appears."
