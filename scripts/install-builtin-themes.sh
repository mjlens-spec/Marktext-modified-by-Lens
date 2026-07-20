#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFAULT_APP="/Applications/Reversion.app"
if [[ ! -d "$DEFAULT_APP" && -d "/Applications/MarkText.app" ]]; then
  DEFAULT_APP="/Applications/MarkText.app"
fi
APP="${1:-$DEFAULT_APP}"
ASAR="$APP/Contents/Resources/app.asar"
STAMP="$(date +%Y%m%d-%H%M%S)"
WORK="$(mktemp -d "$ROOT/.tmp/marktext-asar-patch.XXXXXX")"
EXTRACTED="$WORK/extracted"
PATCHED="$WORK/app.asar"
BACKUP_DIR="${LENS_BACKUP_DIR:-$HOME/Library/Application Support/marktext/lens-backups}"
BACKUP="$BACKUP_DIR/app.asar.$STAMP"

if [[ ! -f "$ASAR" ]]; then
  echo "Reversion/MarkText app.asar not found: $ASAR" >&2
  exit 1
fi

mkdir -p "$EXTRACTED" "$BACKUP_DIR"
npm_config_cache="$ROOT/.npm-cache" npx --yes asar extract "$ASAR" "$EXTRACTED"
LENS_RELEASE_VERSION="${LENS_RELEASE_VERSION:-}" node "$ROOT/scripts/patch-asar-themes.mjs" "$EXTRACTED"
npm_config_cache="$ROOT/.npm-cache" npx --yes asar pack "$EXTRACTED" "$PATCHED"

cp "$ASAR" "$BACKUP"
cp "$PATCHED" "$ASAR"
cp "$ROOT/config/app-update.yml" "$APP/Contents/Resources/app-update.yml"
"$ROOT/scripts/brand-app.sh" "$APP"
REVERSION_VERSION="${LENS_RELEASE_VERSION:-$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Contents/Info.plist")}" \
  "$ROOT/scripts/build-quicklook.sh" "$APP/Contents/PlugIns"

if [[ -n "${LENS_RELEASE_VERSION:-}" ]]; then
  /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $LENS_RELEASE_VERSION" "$APP/Contents/Info.plist"
  /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $LENS_RELEASE_VERSION" "$APP/Contents/Info.plist"
fi

if command -v codesign >/dev/null 2>&1; then
  codesign --force --deep --sign - "$APP" >/dev/null
  codesign --force --sign - --requirements '=designated => identifier "com.github.marktext.marktext.reversion-quicklook"' --entitlements "$ROOT/quicklook/ReversionQuickLook.entitlements" "$APP/Contents/PlugIns/ReversionQuickLook.appex" >/dev/null
  codesign --force --sign - --requirements '=designated => identifier "com.github.marktext.marktext"' "$APP" >/dev/null
fi

echo "Installed Reversion runtime, themes, branding, and Quick Look into $APP"
echo "Backup: $BACKUP"
echo "Work dir kept for inspection: $WORK"
