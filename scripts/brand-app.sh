#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${1:?Usage: brand-app.sh <path-to-app>}"
PLIST="$APP/Contents/Info.plist"
MARKDOWN_UTI="net.daringfireball.markdown"

if [[ ! -f "$PLIST" ]]; then
  echo "Application Info.plist not found: $PLIST" >&2
  exit 1
fi

/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName Reversion" "$PLIST"
# Electron resolves its bundled helper applications from this internal name.
# Keep it aligned with the upstream `marktext Helper*.app` directories.
/usr/libexec/PlistBuddy -c "Set :CFBundleName marktext" "$PLIST"

/usr/libexec/PlistBuddy -c "Delete :UTExportedTypeDeclarations" "$PLIST" >/dev/null 2>&1 || true
/usr/libexec/PlistBuddy -c "Delete :UTImportedTypeDeclarations" "$PLIST" >/dev/null 2>&1 || true
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations array" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0 dict" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeIdentifier string $MARKDOWN_UTI" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeDescription string Reversion Markdown Document" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeConformsTo array" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeConformsTo:0 string public.text" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeConformsTo:1 string public.data" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeTagSpecification dict" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeTagSpecification:public.filename-extension array" "$PLIST"
for extension in md markdown mmd mdown mdtxt mdtext; do
  extension_index=$(/usr/libexec/PlistBuddy -c "Print :UTImportedTypeDeclarations:0:UTTypeTagSpecification:public.filename-extension" "$PLIST" | grep -c '^    ' || true)
  /usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeTagSpecification:public.filename-extension:$extension_index string $extension" "$PLIST"
done
/usr/libexec/PlistBuddy -c "Add :UTImportedTypeDeclarations:0:UTTypeTagSpecification:public.mime-type string text/markdown" "$PLIST"

document_index=0
while /usr/libexec/PlistBuddy -c "Print :CFBundleDocumentTypes:$document_index" "$PLIST" >/dev/null 2>&1; do
  /usr/libexec/PlistBuddy -c "Delete :CFBundleDocumentTypes:$document_index:LSItemContentTypes" "$PLIST" >/dev/null 2>&1 || true
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:$document_index:LSItemContentTypes array" "$PLIST"
  /usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:$document_index:LSItemContentTypes:0 string $MARKDOWN_UTI" "$PLIST"
  document_index=$((document_index + 1))
done

for locale in en zh-Hans zh-Hant; do
  mkdir -p "$APP/Contents/Resources/$locale.lproj"
  cp "$ROOT/config/InfoPlist.$locale.strings" "$APP/Contents/Resources/$locale.lproj/InfoPlist.strings"
done

echo "Branded application as Reversion / 反文: $APP"
